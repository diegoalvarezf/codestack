import { NextRequest, NextResponse } from "next/server";
import { getSkills } from "@/lib/skills-db";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");

  const result = await getSkills({ query, type, tag, page });
  return NextResponse.json(result);
}

// POST — 10 skill submissions per hour per IP
export async function POST(req: NextRequest) {
  const ip = getIp(req);
  const rl = await rateLimit(ip, "POST /api/skills", 10, 60 * 60 * 1000);
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

  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { slug, name, description, type, content, tags, repoUrl, published } = body;

  if (!slug || !name || !description || !content) {
    return NextResponse.json({ error: "slug, name, description, content required" }, { status: 400 });
  }

  // Look up user ID from githubLogin
  const user = session.user.githubLogin
    ? await prisma.user.findUnique({ where: { githubLogin: session.user.githubLogin }, select: { id: true } })
    : null;

  try {
    const skill = await prisma.skill.create({
      data: {
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        name: stripHtml(name),
        description: stripHtml(description),
        type: type ?? "prompt",
        content,
        tags: JSON.stringify(tags ?? []),
        repoUrl: repoUrl ?? null,
        authorName: session.user.githubLogin ?? session.user.name ?? "unknown",
        authorUrl: `https://github.com/${session.user.githubLogin}`,
        createdBy: session.user.githubLogin,
        published: published === true,
        ownerId: user?.id ?? null,
      },
    });
    return NextResponse.json(skill, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }
}
