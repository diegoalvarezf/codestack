import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import os from "os";
import { detectClients, type DetectedClient } from "../lib/detect.js";
import { installForClient, isAlreadyInstalled } from "../lib/config.js";
import type { McpServer } from "../lib/api.js";

const REGISTRY_URL = process.env.MCPHUB_REGISTRY ?? "https://mcp-registry-sigma.vercel.app";

interface TeamSkill {
  id: string;
  slug: string;
  name: string;
  type: string; // "prompt" | "agent"
  description?: string;
  content: string;
}

interface SyncResponse {
  team: { slug: string; name: string };
  servers: McpServer[];
  skills: TeamSkill[];
}

async function fetchTeam(teamSlug: string, token: string): Promise<SyncResponse | null> {
  const res = await fetch(
    `${REGISTRY_URL}/api/teams/${encodeURIComponent(teamSlug)}/sync?token=${encodeURIComponent(token)}`
  );
  if (!res.ok) return null;
  return res.json() as Promise<SyncResponse>;
}

function installSkills(teamSlug: string, skills: TeamSkill[]): void {
  if (skills.length === 0) return;

  const commandsDir = path.join(os.homedir(), ".claude", "commands");
  fs.mkdirSync(commandsDir, { recursive: true });

  for (const skill of skills) {
    if (skill.type !== "prompt") continue;
    const filename = `${teamSlug}-${skill.slug}.md`;
    const filepath = path.join(commandsDir, filename);
    const header = skill.description ? `# ${skill.name}\n\n${skill.description}\n\n` : `# ${skill.name}\n\n`;
    fs.writeFileSync(filepath, header + skill.content, "utf8");
  }
}

export async function syncCommand(teamSlug?: string, tokenFlag?: string) {
  if (!teamSlug) {
    console.log(chalk.red("Usage: mcp sync --team <slug> --token <token>"));
    console.log(chalk.gray("  Get the sync command from your team page on MCPHub."));
    process.exit(1);
  }

  // Use token from flag or prompt interactively
  let token = tokenFlag?.trim();
  if (!token) {
    const answer = await inquirer.prompt<{ token: string }>([
      {
        type: "input",
        name: "token",
        message: `Invite token for team ${chalk.bold(teamSlug)}:`,
        validate: (v: string) => v.trim().length > 0 || "Token is required",
      },
    ]);
    token = answer.token.trim();
  }

  const spinner = ora(`Fetching team ${chalk.bold(teamSlug)}...`).start();
  const data = await fetchTeam(teamSlug, token).catch(() => null);

  if (!data) {
    spinner.fail("Team not found or invalid token.");
    process.exit(1);
  }

  spinner.succeed(
    `Team ${chalk.bold(data.team.name)} — ${data.servers.length} server${data.servers.length !== 1 ? "s" : ""}, ${data.skills.length} skill${data.skills.length !== 1 ? "s" : ""}`
  );

  // ── Skills ────────────────────────────────────────────────────────────────
  const prompts = data.skills.filter((s) => s.type === "prompt");
  if (prompts.length > 0) {
    const s = ora(`  Installing ${prompts.length} slash command${prompts.length !== 1 ? "s" : ""}...`).start();
    try {
      installSkills(teamSlug, prompts);
      s.succeed(
        `  ${chalk.bold("Skills")} ${chalk.gray(`→ ~/.claude/commands/`)} ${prompts.map((p) => chalk.cyan(`/${teamSlug}-${p.slug}`)).join(", ")}`
      );
    } catch (err: any) {
      s.fail(`  Skills: ${err.message}`);
    }
  }

  // ── Servers ───────────────────────────────────────────────────────────────
  if (data.servers.length === 0) {
    if (prompts.length > 0) {
      console.log(chalk.green(`\n✓ Synced team ${chalk.bold(data.team.name)}`));
      console.log(chalk.gray("  Restart Claude Code to activate slash commands.\n"));
    } else {
      console.log(chalk.gray("\n  No servers or skills configured for this team."));
    }
    return;
  }

  // Detect clients
  const detected = detectClients();
  if (detected.length === 0) {
    console.log(chalk.yellow("\nNo MCP clients detected."));
    process.exit(1);
  }

  let targets: DetectedClient[] = detected;
  if (detected.length > 1) {
    const { selected } = await inquirer.prompt<{ selected: string[] }>([
      {
        type: "checkbox",
        name: "selected",
        message: "Install servers in which clients?",
        choices: detected.map((c) => ({ name: c.label, value: c.id, checked: true })),
      },
    ]);
    targets = detected.filter((c) => selected.includes(c.id));
  }

  console.log();

  for (const server of data.servers) {
    console.log(chalk.bold(`  ${server.name}`));

    const envValues: Record<string, string> = {};
    if (server.envVars && server.envVars.length > 0) {
      for (const ev of server.envVars) {
        if (!ev.required) continue;
        const { value } = await inquirer.prompt<{ value: string }>([
          {
            type: "input",
            name: "value",
            message: `  ${chalk.cyan(ev.name)} — ${ev.description}${ev.example ? chalk.gray(` (e.g. ${ev.example})`) : ""}:`,
            validate: (input: string) => input.trim().length > 0 || "Required",
          },
        ]);
        if (value.trim()) envValues[ev.name] = value.trim();
      }
    }

    for (const client of targets) {
      const already = isAlreadyInstalled(client.id, server.slug);
      const s = ora(`    ${client.label}${already ? chalk.gray(" (updating)") : ""}`).start();
      try {
        const p = installForClient(client.id, server, envValues);
        s.succeed(`    ${chalk.bold(client.label)} ${chalk.gray(`→ ${p}`)}`);
      } catch (err: any) {
        s.fail(`    ${client.label}: ${err.message}`);
      }
    }
    console.log();
  }

  console.log(chalk.green(`✓ Synced team ${chalk.bold(data.team.name)}`));
  console.log(chalk.gray("  Restart your MCP clients to activate servers."));
  if (prompts.length > 0) {
    console.log(chalk.gray("  Restart Claude Code to activate slash commands.\n"));
  } else {
    console.log();
  }
}
