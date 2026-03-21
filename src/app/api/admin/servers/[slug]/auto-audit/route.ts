import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function getGitHubHeaders(): HeadersInit {
  if (process.env.GITHUB_TOKEN) {
    return { Authorization: `token ${process.env.GITHUB_TOKEN}` };
  }
  return {};
}

function extractOwnerRepo(repoUrl: string): { owner: string; repo: string } | null {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const server = await prisma.server.findUnique({ where: { slug: params.slug } });
  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 });
  }

  // --- Level-1 checks (run in parallel) ---
  const ownerRepo = extractOwnerRepo(server.repoUrl);

  let githubExists = false;
  let recentActivity = false;
  let githubStars: number | null = null;
  let npmExists = false;
  let npmRepoMatch = false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let npmData: any = null;

  const [githubResult, npmResult] = await Promise.allSettled([
    // GitHub check
    (async () => {
      if (!ownerRepo) return null;
      const res = await fetch(
        `https://api.github.com/repos/${ownerRepo.owner}/${ownerRepo.repo}`,
        { headers: getGitHubHeaders() }
      );
      if (!res.ok) return null;
      return res.json();
    })(),
    // npm check
    (async () => {
      if (!server.npmPackage) return null;
      const res = await fetch(`https://registry.npmjs.org/${server.npmPackage}`);
      if (!res.ok) return null;
      return res.json();
    })(),
  ]);

  // Process GitHub result
  if (githubResult.status === "fulfilled" && githubResult.value) {
    const data = githubResult.value;
    githubExists = data.private === false;
    githubStars = typeof data.stargazers_count === "number" ? data.stargazers_count : null;

    if (data.pushed_at) {
      const pushedAt = new Date(data.pushed_at);
      const now = new Date();
      const diffMs = now.getTime() - pushedAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      recentActivity = diffDays <= 365;
    }
  }

  // Process npm result
  if (npmResult.status === "fulfilled" && npmResult.value !== null) {
    npmData = npmResult.value;
    npmExists = true;
  }

  // npm↔repo match: check if npm registry's repository.url contains owner/repo
  if (npmData && ownerRepo) {
    const repoUrlInNpm: string = npmData.repository?.url ?? "";
    const needle = `${ownerRepo.owner}/${ownerRepo.repo}`.toLowerCase();
    npmRepoMatch = repoUrlInNpm.toLowerCase().includes(needle);
  }

  // --- Derive riskLevel ---
  let riskLevel: string;

  if (!ownerRepo || githubResult.status === "rejected") {
    riskLevel = "unknown";
  } else if (!githubExists) {
    // GitHub not found or private
    riskLevel = "high";
  } else if (!recentActivity) {
    // GitHub exists but no activity in over a year
    riskLevel = "medium";
  } else if (server.npmPackage) {
    // Has npm: all checks pass + npm matches repo → low; otherwise low too
    // (safe requires manual review, so we cap at low here)
    riskLevel = "low";
  } else {
    // GitHub exists, recent activity, no npm to check
    riskLevel = "low";
  }

  // --- Persist ---
  await prisma.server.update({
    where: { slug: params.slug },
    data: {
      riskLevel,
      stars: githubStars ?? server.stars,
    },
  });

  return NextResponse.json({
    ok: true,
    riskLevel,
    checks: {
      githubExists,
      npmExists,
      npmRepoMatch,
      recentActivity,
      stars: githubStars,
    },
  });
}
