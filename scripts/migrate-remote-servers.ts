/**
 * Switches catalog servers to the vendor's official remote MCP endpoint
 * (Streamable HTTP + OAuth), as listed in the official MCP Registry
 * (registry.modelcontextprotocol.io, checked 2026-10-26).
 *
 * Remote servers sign in with OAuth from the client, so they need no env vars.
 *
 *   pnpm tsx scripts/migrate-remote-servers.ts          # dry run
 *   pnpm tsx scripts/migrate-remote-servers.ts --apply  # write to the database
 */
import { PrismaClient } from "@prisma/client";

const REMOTES: Record<string, { url: string; registryName: string }> = {
  github:     { url: "https://api.githubcopilot.com/mcp/",          registryName: "io.github.github/github-mcp-server" },
  linear:     { url: "https://mcp.linear.app/mcp",                  registryName: "app.linear/linear" },
  notion:     { url: "https://mcp.notion.com/mcp",                  registryName: "com.notion/mcp" },
  sentry:     { url: "https://mcp.sentry.dev/mcp",                  registryName: "io.github.getsentry/sentry-mcp" },
  stripe:     { url: "https://mcp.stripe.com",                      registryName: "com.stripe/mcp" },
  supabase:   { url: "https://mcp.supabase.com/mcp",                registryName: "com.supabase/mcp" },
  vercel:     { url: "https://mcp.vercel.com",                      registryName: "com.vercel/vercel-mcp" },
  jira:       { url: "https://mcp.atlassian.com/v2/mcp",            registryName: "com.atlassian/atlassian-mcp-server" },
  cloudflare: { url: "https://bindings.mcp.cloudflare.com/mcp",     registryName: "com.cloudflare.mcp/mcp" },
};

async function main() {
  const apply = process.argv.includes("--apply");
  const prisma = new PrismaClient();

  for (const [slug, { url, registryName }] of Object.entries(REMOTES)) {
    const server = await prisma.server.findUnique({ where: { slug } });
    if (!server) {
      console.log(`skip ${slug}: not in catalog`);
      continue;
    }
    const data = {
      transport: "http",
      configJson: JSON.stringify({ url }),
      installCmd: null,
      envVars: null,
    };
    console.log(`${apply ? "update" : "would update"} ${slug}: ${server.transport} → http ${url} (${registryName})`);
    if (apply) await prisma.server.update({ where: { slug }, data });
  }

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
