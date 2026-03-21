#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { installCommand } from "./commands/install.js";
import { searchCommand } from "./commands/search.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";
import { syncCommand } from "./commands/sync.js";
import { installSkillCommand } from "./commands/install-skill.js";

const program = new Command();

program
  .name("mcp")
  .description(chalk.bold("MCPHub CLI") + " — Install and manage MCP servers")
  .version("0.1.0");

program
  .command("install <slug>")
  .description("Install an MCP server from MCPHub")
  .action(async (slug: string) => {
    await installCommand(slug).catch((err) => {
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
  .action(() => {
    listCommand();
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

program.parse();
