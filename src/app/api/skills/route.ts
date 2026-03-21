import { NextRequest, NextResponse } from "next/server";
import { getSkills } from "@/lib/skills-db";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const page = parseInt(searchParams.get("page") ?? "1");

  const result = await getSkills({ query, type, tag, page });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { slug, name, description, type, content, tags } = body;

  if (!slug || !name || !description || !content) {
    return NextResponse.json({ error: "slug, name, description, content required" }, { status: 400 });
  }

  try {
    const skill = await prisma.skill.create({
      data: {
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
        name,
        description,
        type: type ?? "prompt",
        content,
        tags: JSON.stringify(tags ?? []),
        authorName: session.user.githubLogin ?? session.user.name ?? "unknown",
        authorUrl: `https://github.com/${session.user.githubLogin}`,
        createdBy: session.user.githubLogin,
      },
    });
    return NextResponse.json(skill, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }
}
