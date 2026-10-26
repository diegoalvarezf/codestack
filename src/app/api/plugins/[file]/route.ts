import { NextRequest, NextResponse } from "next/server";
import { loadStackPlugin, packPlugin } from "@/lib/plugin-data";

export const dynamic = "force-dynamic";

// GET /api/plugins/<stack>.zip — the stack as a Claude Code plugin archive
export async function GET(req: NextRequest, { params }: { params: { file: string } }) {
  const match = params.file.match(/^([a-z0-9-]+)\.zip$/);
  if (!match) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const input = await loadStackPlugin(match[1], req.nextUrl.origin);
  if (!input) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { zip } = packPlugin(input);
  return new Response(Buffer.from(zip), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${input.slug}.zip"`,
      "Cache-Control": "no-store",
    },
  });
}
