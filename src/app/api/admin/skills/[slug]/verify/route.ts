import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.redirect(new URL("/", _req.url));
  }

  const skill = await prisma.skill.findUnique({ where: { slug: params.slug } });
  if (!skill) return NextResponse.redirect(new URL("/admin?tab=skills", _req.url));

  await prisma.skill.update({
    where: { slug: params.slug },
    data: { verified: !skill.verified },
  });

  return NextResponse.redirect(new URL("/admin?tab=skills", _req.url));
}
