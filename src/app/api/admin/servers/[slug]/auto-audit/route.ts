import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

// ── Trusted orgs — auto-safe, no Claude needed ────────────────────────────
const TRUSTED_ORGS = new Set([
  "modelcontextprotocol", "anthropic", "microsoft", "google", "googleworkspace",
  "aws", "amazon", "meta", "github", "stripe", "shopify", "atlassian",
  "notion-so", "linear", "vercel", "cloudflare", "docker", "hashicorp",
  "elastic", "mongodb", "supabase", "planetscale", "openai", "mistralai",
]);

// ── Static analysis — dangerous patterns ─────────────────────────────────
const HIGH_RISK_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /eval\s*\(/g,                          reason: "Uses eval()" },
  { pattern: /new\s+Function\s*\(/g,                reason: "Uses Function constructor" },
  { pattern: /child_process/g,                      reason: "Uses child_process" },
  { pattern: /execSync|exec\s*\(|spawnSync/g,       reason: "Executes shell commands" },
  { pattern: /\~\/\.ssh|\/\.ssh\//g,                reason: "Accesses SSH keys" },
  { pattern: /\~\/\.aws|\/\.aws\//g,                reason: "Accesses AWS credentials" },
  { pattern: /\~\/\.config\/gcloud/g,               reason: "Accesses GCloud credentials" },
  { pattern: /readFileSync.*password|readFile.*secret/gi, reason: "Reads sensitive files" },
];

const MEDIUM_RISK_PATTERNS: { pattern: RegExp; reason: string }[] = [
  { pattern: /process\.env\.[A-Z_]{10,}/g,          reason: "Reads many env variables" },
  { pattern: /atob|btoa|Buffer\.from.*base64/g,     reason: "Base64 encoding/decoding" },
  { pattern: /https?:\/\/(?!github|npm|registry)/g, reason: "External HTTP calls" },
];

function staticAnalysis(code: string): { verdict: "clean" | "medium" | "high"; reasons: string[] } {
  const reasons: string[] = [];

  for (const { pattern, reason } of HIGH_RISK_PATTERNS) {
    if (pattern.test(code)) reasons.push(reason);
    pattern.lastIndex = 0;
  }
  if (reasons.length > 0) return { verdict: "high", reasons };

  for (const { pattern, reason } of MEDIUM_RISK_PATTERNS) {
    if (pattern.test(code)) reasons.push(reason);
    pattern.lastIndex = 0;
  }
  if (reasons.length >= 2) return { verdict: "medium", reasons };

  return { verdict: "clean", reasons };
}

// ── GitHub helpers ────────────────────────────────────────────────────────
function getGitHubHeaders(): HeadersInit {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  return headers;
}

function extractOwnerRepo(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

const ANALYZABLE_EXTENSIONS = new Set([".ts", ".js", ".mjs", ".cjs", ".py", ".go", ".rs", ".rb", ".sh"]);
const MAX_FILES = 12;
const MAX_FILE_CHARS = 6000;
const MAX_TOTAL_CHARS = 40000;

async function fetchRepoCode(owner: string, repo: string): Promise<string> {
  const headers = getGitHubHeaders();
  const treeRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers }
  );
  if (!treeRes.ok) return "";

  const tree = await treeRes.json();
  const files: { path: string; url: string }[] = (tree.tree ?? [])
    .filter((f: { type: string; path: string; url: string }) => {
      if (f.type !== "blob") return false;
      const ext = "." + f.path.split(".").pop();
      const name = f.path.split("/").pop() ?? "";
      if (name === "package.json") return true;
      return ANALYZABLE_EXTENSIONS.has(ext);
    })
    .sort((a: { path: string }, b: { path: string }) =>
      a.path.split("/").length - b.path.split("/").length
    )
    .slice(0, MAX_FILES);

  let combined = "";
  for (const file of files) {
    if (combined.length >= MAX_TOTAL_CHARS) break;
    try {
      const blobRes = await fetch(file.url, { headers });
      if (!blobRes.ok) continue;
      const blob = await blobRes.json();
      const content = Buffer.from(blob.content ?? "", "base64").toString("utf-8");
      combined += `\n\n### ${file.path}\n\`\`\`\n${content.slice(0, MAX_FILE_CHARS)}\n\`\`\``;
    } catch { /* skip */ }
  }

  return combined.slice(0, MAX_TOTAL_CHARS);
}

// ── Claude analysis — only for ambiguous cases ────────────────────────────
async function analyzeWithClaude(
  serverName: string,
  code: string,
  context: string
): Promise<{ riskLevel: string; reason: string }> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    messages: [{
      role: "user",
      content: `You are a security auditor for MCP servers. Analyze this server.

Server: ${serverName}
Context: ${context}
${code ? `\nSource code:\n${code}` : "\nSource code: not available"}

Check for: credential theft, data exfiltration, unsafe code execution, prompt injection.

Respond ONLY with JSON (no markdown):
{"riskLevel":"safe|low|medium|high","reason":"one sentence"}

- safe: clean, transparent, no red flags
- low: minor concerns, limited visibility
- medium: suspicious patterns
- high: clear malicious behavior`,
    }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text.trim() : "";
  try {
    const parsed = JSON.parse(text);
    if (["safe", "low", "medium", "high"].includes(parsed.riskLevel)) {
      return { riskLevel: parsed.riskLevel, reason: parsed.reason ?? "" };
    }
  } catch { /* fallback */ }

  return { riskLevel: "low", reason: "Could not parse analysis" };
}

// ── Main handler ──────────────────────────────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const forceClaude = body.force === true;

  const server = await prisma.server.findUnique({ where: { slug: params.slug } });
  if (!server) return NextResponse.json({ error: "Server not found" }, { status: 404 });

  const ownerRepo = extractOwnerRepo(server.repoUrl);

  // --- GitHub + npm checks ---
  let githubExists = false;
  let recentActivity = false;
  let githubStars: number | null = null;
  let npmExists = false;
  let npmRepoMatch = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let npmData: any = null;

  const [githubResult, npmResult] = await Promise.allSettled([
    (async () => {
      if (!ownerRepo) return null;
      const res = await fetch(
        `https://api.github.com/repos/${ownerRepo.owner}/${ownerRepo.repo}`,
        { headers: getGitHubHeaders() }
      );
      if (!res.ok) return null;
      return res.json();
    })(),
    (async () => {
      if (!server.npmPackage) return null;
      const res = await fetch(`https://registry.npmjs.org/${server.npmPackage}`);
      if (!res.ok) return null;
      return res.json();
    })(),
  ]);

  if (githubResult.status === "fulfilled" && githubResult.value) {
    const data = githubResult.value;
    githubExists = data.private === false;
    githubStars = typeof data.stargazers_count === "number" ? data.stargazers_count : null;
    if (data.pushed_at) {
      const diffDays = (Date.now() - new Date(data.pushed_at).getTime()) / 86400000;
      recentActivity = diffDays <= 365;
    }
  }

  if (npmResult.status === "fulfilled" && npmResult.value) {
    npmData = npmResult.value;
    npmExists = true;
  }
  if (npmData && ownerRepo) {
    const repoUrlInNpm: string = npmData.repository?.url ?? "";
    npmRepoMatch = repoUrlInNpm.toLowerCase().includes(
      `${ownerRepo.owner}/${ownerRepo.repo}`.toLowerCase()
    );
  }

  let riskLevel = "unknown";
  let reason = "";
  let usedClaude = false;

  if (forceClaude) {
    // ── Force mode: skip tiers, always call Claude ─────────────────────
    const code = ownerRepo
      ? await fetchRepoCode(ownerRepo.owner, ownerRepo.repo).catch(() => "")
      : "";
    const { verdict, reasons } = staticAnalysis(code);
    const context = [
      ownerRepo ? `github.com/${ownerRepo.owner}/${ownerRepo.repo}` : "Unknown repo",
      githubExists ? "Public GitHub repo" : "Private/missing repo",
      recentActivity ? "Active in last year" : "Inactive for over a year",
      npmExists ? `On npm${npmRepoMatch ? "" : " (repo mismatch)"}` : "Not on npm",
      githubStars !== null ? `${githubStars} stars` : "Unknown stars",
      verdict === "high" ? `High-risk patterns: ${reasons.join(", ")}` :
      verdict === "medium" ? `Suspicious patterns: ${reasons.join(", ")}` : "Clean static analysis",
    ].join(". ");
    try {
      const result = await analyzeWithClaude(server.name, code, context);
      riskLevel = result.riskLevel;
      reason = result.reason;
      usedClaude = true;
    } catch {
      riskLevel = "unknown";
      reason = "Claude unavailable";
    }
  } else {
    // ── Tier 1: trusted org → safe immediately ──────────────────────────
    if (ownerRepo && TRUSTED_ORGS.has(ownerRepo.owner.toLowerCase())) {
      riskLevel = "safe";
      reason = `Published by trusted organization: ${ownerRepo.owner}`;
    }

    // ── Tier 2: repo missing or private → high immediately ───────────────
    else if (!ownerRepo || !githubExists) {
      riskLevel = "high";
      reason = "Repository is private, missing, or not on GitHub";
    }

    // ── Tier 3: fetch code + static analysis ─────────────────────────────
    else {
      const code = await fetchRepoCode(ownerRepo.owner, ownerRepo.repo).catch(() => "");
      const { verdict, reasons } = staticAnalysis(code);

      if (verdict === "high") {
        riskLevel = "high";
        reason = `Static analysis: ${reasons.join(", ")}`;
      } else if (verdict === "medium" && !recentActivity) {
        riskLevel = "medium";
        reason = `Suspicious patterns and no recent activity: ${reasons.join(", ")}`;
      } else if (verdict === "clean" && recentActivity && (githubStars ?? 0) >= 100) {
        riskLevel = "low";
        reason = "Clean static analysis, active repo, community validated";
      } else {
        // ── Tier 4: ambiguous → use Claude ────────────────────────────
        const context = [
          githubExists ? "Public GitHub repo" : "Private/missing repo",
          recentActivity ? "Active in last year" : "Inactive for over a year",
          npmExists ? `On npm${npmRepoMatch ? "" : " (repo mismatch)"}` : "Not on npm",
          githubStars !== null ? `${githubStars} stars` : "Unknown stars",
          verdict === "medium" ? `Suspicious patterns: ${reasons.join(", ")}` : "Clean static analysis",
        ].join(". ");

        try {
          const result = await analyzeWithClaude(server.name, code, context);
          riskLevel = result.riskLevel;
          reason = result.reason;
          usedClaude = true;
        } catch {
          riskLevel = verdict === "medium" ? "medium" : "low";
          reason = "Claude unavailable, used static analysis";
        }
      }
    }
  }

  await prisma.server.update({
    where: { slug: params.slug },
    data: { riskLevel, auditNotes: reason, auditedAt: new Date(), stars: githubStars ?? server.stars },
  });

  return NextResponse.json({
    ok: true,
    riskLevel,
    reason,
    usedClaude,
    checks: { githubExists, npmExists, npmRepoMatch, recentActivity, stars: githubStars },
  });
}
