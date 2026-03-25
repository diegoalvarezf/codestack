import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseServer } from "@/lib/parse-server";

// GET /api/servers/[slug] — public API
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const server = await prisma.server.findUnique({ where: { slug: params.slug } });
  if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ server: parseServer(server) });
}
