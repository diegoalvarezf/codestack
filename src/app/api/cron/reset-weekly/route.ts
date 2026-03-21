import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await Promise.all([
    prisma.server.updateMany({ data: { weeklyInstalls: 0 } }),
    prisma.skill.updateMany({ data: { weeklyInstalls: 0 } }),
  ]);
  return NextResponse.json({ ok: true, reset: "weekly" });
}
