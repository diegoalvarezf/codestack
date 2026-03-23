import { NextResponse } from "next/server";
import { buildOpenApiSpec } from "@/lib/openapi";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildOpenApiSpec(), {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
