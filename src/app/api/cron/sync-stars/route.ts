import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

type FetchResult =
  | { ok: true; stars: number }
  | { ok: false; reason: "not-github" | "rate-limited" | "not-found" | "error"; status?: number };

async function fetchStars(repoUrl: string): Promise<FetchResult> {
  const ownerRepo = extractOwnerRepo(repoUrl);
  if (!ownerRepo) return { ok: false, reason: "not-github" };
  try {
    const res = await fetch(
      `https://api.github.com/repos/${ownerRepo.owner}/${ownerRepo.repo}`,
      { headers: getGitHubHeaders() }
    );
    if (res.status === 403 || res.status === 429) return { ok: false, reason: "rate-limited", status: res.status };
    if (res.status === 404) return { ok: false, reason: "not-found", status: 404 };
    if (!res.ok) return { ok: false, reason: "error", status: res.status };
    const data = await res.json();
    const stars = typeof data.stargazers_count === "number" ? data.stargazers_count : 0;
    return { ok: true, stars };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hasToken = !!process.env.GITHUB_TOKEN;

  const [servers, skills] = await Promise.all([
    prisma.server.findMany({ select: { id: true, repoUrl: true, stars: true, slug: true } }),
    prisma.skill.findMany({ where: { repoUrl: { not: null } }, select: { id: true, repoUrl: true, stars: true, slug: true } }),
  ]);

  const failures: { slug: string; repoUrl: string; reason: string }[] = [];
  let serverUpdated = 0;
  let skillUpdated = 0;
  let rateLimited = false;

  const BATCH = 10;

  // Sync servers
  for (let i = 0; i < servers.length; i += BATCH) {
    if (rateLimited) break;
    await Promise.all(
      servers.slice(i, i + BATCH).map(async (server) => {
        const result = await fetchStars(server.repoUrl);
        if (!result.ok) {
          if (result.reason === "rate-limited") rateLimited = true;
          else failures.push({ slug: server.slug, repoUrl: server.repoUrl, reason: result.reason });
          return;
        }
        if (result.stars !== server.stars) {
          await prisma.server.update({ where: { id: server.id }, data: { stars: result.stars } });
        }
        serverUpdated++;
      })
    );
    if (i + BATCH < servers.length) await new Promise((r) => setTimeout(r, 500));
  }

  // Sync skills
  for (let i = 0; i < skills.length; i += BATCH) {
    if (rateLimited) break;
    await Promise.all(
      skills.slice(i, i + BATCH).map(async (skill) => {
        const result = await fetchStars(skill.repoUrl!);
        if (!result.ok) {
          if (result.reason === "rate-limited") rateLimited = true;
          else failures.push({ slug: skill.slug, repoUrl: skill.repoUrl!, reason: result.reason });
          return;
        }
        if (result.stars !== skill.stars) {
          await prisma.skill.update({ where: { id: skill.id }, data: { stars: result.stars } });
        }
        skillUpdated++;
      })
    );
    if (i + BATCH < skills.length) await new Promise((r) => setTimeout(r, 500));
  }

  return NextResponse.json({
    ok: !rateLimited,
    hasGithubToken: hasToken,
    rateLimited,
    servers: { total: servers.length, updated: serverUpdated },
    skills: { total: skills.length, updated: skillUpdated },
    failures,
    warning: rateLimited ? "Hit GitHub rate limit. Set GITHUB_TOKEN in Vercel env vars (5000 req/h vs 60 req/h without it)." : null,
  });
}
