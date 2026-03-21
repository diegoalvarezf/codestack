import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/teams/[slug]/skills
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { githubLogin: session.user.githubLogin! } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const team = await prisma.team.findUnique({
    where: { slug: params.slug },
    include: { members: true, skills: { orderBy: { addedAt: "asc" } } },
  });

  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isMember = team.members.some((m) => m.userId === user.id);
  if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(team.skills);
}

// POST /api/teams/[slug]/skills
export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { githubLogin: session.user.githubLogin! } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const team = await prisma.team.findUnique({
    where: { slug: params.slug },
    include: { members: true },
  });

  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const membership = team.members.find((m) => m.userId === user.id);
  if (!membership || membership.role !== "owner") {
    return NextResponse.json({ error: "Only team owners can add skills" }, { status: 403 });
  }

  const body = await req.json();
  const { name, slug, type, description, content } = body;

  if (!name || !slug || !content) {
    return NextResponse.json({ error: "name, slug and content are required" }, { status: 400 });
  }

  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  try {
    const skill = await prisma.teamSkill.create({
      data: { teamId: team.id, name, slug: cleanSlug, type: type ?? "prompt", description, content },
    });
    return NextResponse.json(skill, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists in this team" }, { status: 409 });
  }
}
