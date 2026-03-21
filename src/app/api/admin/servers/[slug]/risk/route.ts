import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const VALID_LEVELS = ["safe", "low", "medium", "high", "unknown"];

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.formData();
  const level = body.get("level") as string;

  if (!VALID_LEVELS.includes(level)) {
    return NextResponse.json({ error: "Invalid risk level" }, { status: 400 });
  }

  await prisma.server.update({
    where: { slug: params.slug },
    data: { riskLevel: level },
  });

  return NextResponse.redirect(new URL("/admin?tab=audits", req.url));
}
