import { NextRequest, NextResponse } from "next/server";
import { MARKETPLACE_NAME } from "@/lib/plugin";
import { listMarketplaceStacks, loadStackPlugin, packPlugin } from "@/lib/plugin-data";

export const dynamic = "force-dynamic";

// Claude Code plugin marketplace with every curated and public stack.
//   claude plugin marketplace add <origin>/api/plugins/marketplace.json
//   claude plugin install <stack>@codestack
// URL-hosted marketplaces can't use relative plugin paths, so each plugin is an
// archive served by /api/plugins/<stack>.zip, pinned by its sha256.
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const slugs = await listMarketplaceStacks();

  const plugins = [];
  for (const slug of slugs) {
    const input = await loadStackPlugin(slug, origin);
    if (!input) continue;
    const { sha256 } = packPlugin(input);
    plugins.push({
      name: input.slug,
      displayName: input.displayName,
      description: input.description,
      homepage: input.homepage,
      source: { source: "archive", url: `${origin}/api/plugins/${input.slug}.zip`, sha256 },
    });
  }

  return NextResponse.json(
    {
      name: MARKETPLACE_NAME,
      owner: { name: "Codestack", url: origin },
      description: "MCP servers, skills and agents, bundled as stacks",
      plugins,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
