import { NextRequest, NextResponse } from "next/server";
import { MARKETPLACE_NAME } from "@/lib/plugin";
import { loadTeamPlugin, packPlugin } from "@/lib/plugin-data";

export const dynamic = "force-dynamic";

// GET /api/teams/<slug>/marketplace.json?token=<inviteToken>
// A one-plugin marketplace with the team's servers, skills and agents.
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const token = req.nextUrl.searchParams.get("token");
  const origin = req.nextUrl.origin;
  const input = await loadTeamPlugin(params.slug, token, origin);
  if (!input) return NextResponse.json({ error: "Team not found or invalid token" }, { status: 403 });

  const { sha256 } = packPlugin(input);
  const zipUrl = `${origin}/api/teams/${input.slug}/plugin.zip?token=${encodeURIComponent(token!)}`;

  return NextResponse.json(
    {
      name: `${MARKETPLACE_NAME}-${input.slug}`,
      owner: { name: input.displayName, url: input.homepage },
      plugins: [
        {
          name: input.slug,
          displayName: input.displayName,
          description: input.description,
          homepage: input.homepage,
          source: { source: "archive", url: zipUrl, sha256 },
        },
      ],
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
