import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/servers/[slug]/install — incrementa downloadCount (llamado por el CLI)
export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  await prisma.server.updateMany({
    where: { slug: params.slug },
    data: { downloadCount: { increment: 1 }, weeklyInstalls: { increment: 1 }, dailyInstalls: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}
