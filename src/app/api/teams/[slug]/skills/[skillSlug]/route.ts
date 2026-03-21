import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// DELETE /api/teams/[slug]/skills/[skillSlug]
export async function DELETE(_req: NextRequest, { params }: { params: { slug: string; skillSlug: string } }) {
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
    return NextResponse.json({ error: "Only owners can remove skills" }, { status: 403 });
  }

  await prisma.teamSkill.deleteMany({
    where: { teamId: team.id, slug: params.skillSlug },
  });

  return NextResponse.json({ ok: true });
}
