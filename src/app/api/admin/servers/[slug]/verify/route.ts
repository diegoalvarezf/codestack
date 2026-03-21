import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const server = await prisma.server.findUnique({ where: { slug: params.slug } });
  if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.server.update({
    where: { slug: params.slug },
    data: { verified: !server.verified },
  });

  return NextResponse.redirect(new URL("/admin", _req.url));
}
