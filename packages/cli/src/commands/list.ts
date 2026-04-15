import chalk from "chalk";
import * as fs from "fs";
import { detectClients } from "../lib/detect.js";
import { fetchServer } from "../lib/api.js";

export async function listCommand() {
  const clients = detectClients();

  if (clients.length === 0) {
    console.log(chalk.yellow("No MCP client detected."));
    console.log(chalk.gray("Supported: Claude Desktop, Claude Code, Cursor, Continue\n"));
    return;
  }

  // Collect all unique server slugs across clients
  const allSlugs = new Set<string>();
  const clientServers: Record<string, string[]> = {};

  for (const client of clients) {
    if (!fs.existsSync(client.configPath)) {
      clientServers[client.id] = [];
      continue;
    }

    try {
      const config = JSON.parse(fs.readFileSync(client.configPath, "utf-8"));
      let servers: string[] = [];
      if (client.id === "continue") {
        servers = (config.mcpServers ?? []).map((s: any) => s.name);
      } else {
        servers = Object.keys(config.mcpServers ?? {});
      }
      clientServers[client.id] = servers;
      servers.forEach((s) => allSlugs.add(s));
    } catch {
      clientServers[client.id] = [];
    }
  }

  // Fetch registry info for all slugs in parallel
  const registryInfo: Record<string, any> = {};
  if (allSlugs.size > 0) {
    const results = await Promise.allSettled(
      Array.from(allSlugs).map((slug) => fetchServer(slug).then((info) => ({ slug, info })))
    );
    for (const r of results) {
      if (r.status === "fulfilled" && r.value.info) {
        registryInfo[r.value.slug] = r.value.info;
      }
    }
  }

  let totalServers = 0;

  for (const client of clients) {
    const servers = clientServers[client.id] ?? [];
    console.log(chalk.bold(`\n${client.label}`) + chalk.gray(` (${client.configPath})`));

    if (servers.length === 0) {
      console.log(chalk.gray("  No servers configured."));
      continue;
    }

    for (const slug of servers) {
      totalServers++;
      const info = registryInfo[slug];

      if (info) {
        const verified = info.verified ? chalk.blue(" ✓") : "";
        const downloads = info.downloadCount > 0
          ? chalk.gray(` · ↓ ${info.downloadCount.toLocaleString()}`)
          : "";
        console.log(`  ${chalk.green("●")} ${chalk.white(info.name ?? slug)}${verified}${downloads}`);
        if (info.description) {
          console.log(`    ${chalk.gray(info.description)}`);
        }
        if (info.version) {
          console.log(`    ${chalk.gray("v" + info.version)} ${chalk.gray("· " + (info.transport ?? "stdio"))}`);
        }
      } else {
        // Not in registry — show slug with a note
        console.log(`  ${chalk.green("●")} ${chalk.white(slug)} ${chalk.gray("(not in Codestack registry)")}`);
      }
    }
  }

  if (totalServers === 0) {
    console.log(chalk.gray("\nNo servers installed across any client."));
    console.log(chalk.gray("Run: ") + chalk.cyan("mcp install <slug>") + chalk.gray(" to install from Codestack.\n"));
  } else {
    console.log(chalk.gray(`\n${totalServers} server${totalServers !== 1 ? "s" : ""} installed across ${clients.length} client${clients.length !== 1 ? "s" : ""}.`));
    console.log(chalk.gray("Run: ") + chalk.cyan("mcp search <query>") + chalk.gray(" to find more.\n"));
  }
}
