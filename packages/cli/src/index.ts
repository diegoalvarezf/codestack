#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { installCommand } from "./commands/install.js";
import { searchCommand } from "./commands/search.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";
import { syncCommand } from "./commands/sync.js";
import { installSkillCommand } from "./commands/install-skill.js";
import { installStackCommand } from "./commands/install-stack.js";

const program = new Command();

program
  .name("mcp")
  .description(chalk.bold("MCPHub CLI") + " — Install and manage MCP servers")
  .version("0.1.0");

program
  .command("install <slug>")
  .description("Install an MCP server from MCPHub")
  .option("-e, --env <KEY=VALUE...>", "Set environment variables (skip interactive prompts)")
  .action(async (slug: string, opts: { env?: string[] }) => {
    const envOverrides: Record<string, string> = {};
    for (const pair of opts.env ?? []) {
      const eq = pair.indexOf("=");
      if (eq > 0) envOverrides[pair.slice(0, eq)] = pair.slice(eq + 1);
    }
    await installCommand(slug, envOverrides).catch((err) => {
      console.error(chalk.red("Error:"), err.message);
      process.exit(1);
    });
  });

program
  .command("remove <slug>")
  .alias("uninstall")
  .description("Remove an installed MCP server")
  .action(async (slug: string) => {
    await removeCommand(slug).catch((err) => {
      console.error(chalk.red("Error:"), err.message);
      process.exit(1);
    });
  });

program
  .command("search <query>")
  .description("Search MCP servers in MCPHub")
  .action(async (query: string) => {
    await searchCommand(query).catch((err) => {
      console.error(chalk.red("Error:"), err.message);
      process.exit(1);
    });
  });

program
  .command("list")
  .description("List installed MCP servers across all clients")
  .action(async () => {
    await listCommand().catch((err) => {
      console.error(chalk.red("Error:"), err.message);
      process.exit(1);
    });
  });

program
  .command("sync")
  .description("Sync MCP servers and skills for a team")
  .option("-t, --team <slug>", "Team slug")
  .option("--token <token>", "Invite token (skips interactive prompt)")
  .action(async (opts: { team?: string; token?: string }) => {
    await syncCommand(opts.team, opts.token).catch((err) => {
      console.error(chalk.red("Error:"), err.message);
      process.exit(1);
    });
  });

program
  .command("install-skill <slug>")
  .description("Install a prompt or agent from MCPHub Skills")
  .action(async (slug: string) => {
    await installSkillCommand(slug).catch((err) => {
      console.error(chalk.red("Error:"), err.message);
      process.exit(1);
    });
  });

program
  .command("install-stack <slug>")
  .description("Install all servers, skills, and agents in a stack")
  .action(async (slug: string) => {
    await installStackCommand(slug).catch((err) => {
      console.error(chalk.red("Error:"), err.message);
      process.exit(1);
    });
  });

program.parse();
