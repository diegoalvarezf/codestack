import chalk from "chalk";
import ora from "ora";
import { installCommand } from "./install.js";
import { installSkillCommand } from "./install-skill.js";

const REGISTRY_URL = process.env.MCPHUB_REGISTRY ?? "https://mcp-registry-sigma.vercel.app";

interface StackResponse {
  slug: string;
  name: string;
  servers: string[];
  skills: string[];
  agents: string[];
}

async function fetchStack(slug: string): Promise<StackResponse | null> {
  const res = await fetch(`${REGISTRY_URL}/api/stacks/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json() as Promise<StackResponse>;
}

export async function installStackCommand(slug: string) {
  const spinner = ora(`Fetching stack ${chalk.bold(slug)}...`).start();
  const stack = await fetchStack(slug).catch(() => null);

  if (!stack) {
    spinner.fail(`Stack ${chalk.bold(slug)} not found.`);
    console.log(chalk.gray(`  Browse stacks at ${REGISTRY_URL}/stacks`));
    process.exit(1);
  }

  const total = stack.servers.length + stack.skills.length + stack.agents.length;
  spinner.succeed(`${chalk.bold(stack.name)} — ${total} items`);
  console.log();

  if (stack.servers.length > 0) {
    console.log(chalk.blue.bold(`MCP Servers (${stack.servers.length})`));
    for (const s of stack.servers) {
      await installCommand(s);
    }
    console.log();
  }

  if (stack.skills.length > 0) {
    console.log(chalk.magenta.bold(`Skills (${stack.skills.length})`));
    for (const s of stack.skills) {
      await installSkillCommand(s);
    }
    console.log();
  }

  if (stack.agents.length > 0) {
    console.log(chalk.yellow.bold(`Agents (${stack.agents.length})`));
    for (const s of stack.agents) {
      await installSkillCommand(s);
    }
    console.log();
  }

  console.log(chalk.green.bold(`✓ Stack "${stack.name}" installed`));
}
