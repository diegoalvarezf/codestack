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

// PATCH — admin toggle verified/featured
export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const skill = await prisma.skill.update({
    where: { slug: params.slug },
    data: body,
  });
  return NextResponse.json(skill);
}
