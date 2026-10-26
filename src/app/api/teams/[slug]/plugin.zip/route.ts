import { NextRequest, NextResponse } from "next/server";
import { loadTeamPlugin, packPlugin } from "@/lib/plugin-data";

export const dynamic = "force-dynamic";

// GET /api/teams/<slug>/plugin.zip?token=<inviteToken>
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const input = await loadTeamPlugin(params.slug, req.nextUrl.searchParams.get("token"), req.nextUrl.origin);
  if (!input) return NextResponse.json({ error: "Team not found or invalid token" }, { status: 403 });

  const { zip } = packPlugin(input);
  return new Response(Buffer.from(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${input.slug}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
