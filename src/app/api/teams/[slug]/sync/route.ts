import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseServer } from "@/lib/parse-server";

// GET /api/teams/[slug]/sync?token=<inviteToken>
// Returns servers + skills for a team — authenticated via invite token (CLI use)
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const token = new URL(req.url).searchParams.get("token");

  const team = await prisma.team.findUnique({
    where: { slug: params.slug },
    include: {
      servers: { orderBy: { addedAt: "asc" } },
      skills: { orderBy: { addedAt: "asc" } },
    },
  });

  if (!team) return NextResponse.json({ error: "Team not found" }, { status: 404 });

  if (!token || token !== team.inviteToken) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  const slugs = team.servers.map((s) => s.serverSlug);
  const servers = await prisma.server.findMany({ where: { slug: { in: slugs } } });

  return NextResponse.json({
    team: { slug: team.slug, name: team.name },
    servers: servers.map(parseServer),
    skills: team.skills,
  });
}
