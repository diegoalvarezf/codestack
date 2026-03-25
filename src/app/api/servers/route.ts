import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { submitServerSchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { sanitizeStrings } from "@/lib/sanitize";
import { parseServer } from "@/lib/parse-server";

function extractOwnerRepo(url: string) {
  const m = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

async function fetchGitHubStars(repoUrl: string): Promise<number> {
  const ownerRepo = extractOwnerRepo(repoUrl);
  if (!ownerRepo) return 0;
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/repos/${ownerRepo.owner}/${ownerRepo.repo}`, { headers });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.stargazers_count === "number" ? data.stargazers_count : 0;
  } catch { return 0; }
}

async function fetchNpmDownloads(npmPackage: string | null | undefined): Promise<number> {
  if (!npmPackage) return 0;
  try {
    const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(npmPackage)}`);
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data.downloads === "number" ? data.downloads : 0;
  } catch { return 0; }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// GET /api/servers — public API
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const client = searchParams.get("client") ?? undefined;
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "50"), 100);

  const where: any = {};
  if (tag) where.tags = { contains: tag };
  if (client) where.clients = { contains: client };

  const servers = await prisma.server.findMany({
    where,
    orderBy: [{ featured: "desc" }, { stars: "desc" }, { createdAt: "desc" }],
    take: limit,
  });

  let results = servers.map(parseServer);

  if (query) {
    const q = query.toLowerCase();
    results = results.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t: string) => t.includes(q)) ||
        s.tools.some((t: string) => t.includes(q))
    );
  }

  return NextResponse.json({ servers: results, total: results.length });
}

// POST /api/servers — submit a new server (auth required, 5 submissions per hour per IP)
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getIp(req);
  const rl = await rateLimit(ip, "POST /api/servers", 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = submitServerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const data = sanitizeStrings(parsed.data as any);
  const slug = slugify(data.name);

  const existing = await prisma.server.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: `A server with slug "${slug}" already exists` },
      { status: 409 }
    );
  }

  const [stars, npmDownloads] = await Promise.all([
    fetchGitHubStars(data.repoUrl),
    fetchNpmDownloads(data.npmPackage),
  ]);

  const server = await prisma.server.create({
    data: {
      slug,
      name: data.name,
      description: data.description,
      longDesc: data.longDesc ?? null,
      repoUrl: data.repoUrl,
      npmPackage: data.npmPackage ?? null,
      authorName: data.authorName,
      authorUrl: data.authorUrl || null,
      license: data.license,
      version: data.version,
      tags: JSON.stringify(data.tags),
      tools: JSON.stringify(data.tools),
      clients: JSON.stringify(data.clients),
      transport: data.transport,
      installCmd: data.installCmd ?? null,
      envVars: data.envVars ? JSON.stringify(data.envVars) : null,
      category: data.category ?? null,
      createdBy: session.user?.githubLogin ?? null,
      stars,
      npmDownloads,
    },
  });

  return NextResponse.json({ server: parseServer(server) }, { status: 201 });
}
