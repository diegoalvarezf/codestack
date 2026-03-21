import { NextRequest, NextResponse } from "next/server";
import { getSkill } from "@/lib/skills-db";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const skill = await getSkill(params.slug);
  if (!skill) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Increment install count
  await prisma.skill.update({
    where: { slug: params.slug },
    data: { installCount: { increment: 1 } },
  }).catch(() => {});

  return NextResponse.json(skill);
}

// PATCH — admin toggle verified/featured, or owner toggle published
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const existing = await prisma.skill.findUnique({ where: { slug: params.slug } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "admin";
  const isOwner = session.user.githubLogin && existing.createdBy === session.user.githubLogin;

  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Owners can only toggle published; admins can change anything
  const allowed = isAdmin ? body : { published: body.published };
  const skill = await prisma.skill.update({
    where: { slug: params.slug },
    data: allowed,
  });
  return NextResponse.json(skill);
}

// DELETE — owner or admin can delete
export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.skill.findUnique({ where: { slug: params.slug } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isAdmin = session.user.role === "admin";
  const isOwner = session.user.githubLogin && existing.createdBy === session.user.githubLogin;

  if (!isAdmin && !isOwner) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.skill.delete({ where: { slug: params.slug } });
  return NextResponse.json({ ok: true });
}
