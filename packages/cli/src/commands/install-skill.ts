import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import os from "os";

const REGISTRY_URL = process.env.MCPHUB_REGISTRY ?? "https://mcp-registry-sigma.vercel.app";

interface Skill {
  slug: string;
  name: string;
  description: string;
  type: string;
  content: string;
}

async function fetchSkill(slug: string): Promise<Skill | null> {
  const res = await fetch(`${REGISTRY_URL}/api/skills/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json() as Promise<Skill>;
}

function installPrompt(skill: Skill): string {
  const commandsDir = path.join(os.homedir(), ".claude", "commands");
  fs.mkdirSync(commandsDir, { recursive: true });

  const filename = `${skill.slug}.md`;
  const filepath = path.join(commandsDir, filename);
  const header = `# ${skill.name}\n\n${skill.description}\n\n`;
  fs.writeFileSync(filepath, header + skill.content, "utf8");
  return filepath;
}

function installAgent(skill: Skill): string {
  const agentsDir = path.join(os.homedir(), ".claude", "agents");
  fs.mkdirSync(agentsDir, { recursive: true });

  const filename = `${skill.slug}.md`;
  const filepath = path.join(agentsDir, filename);
  const frontmatter = `---\nname: ${skill.name}\ndescription: ${skill.description}\n---\n\n`;
  fs.writeFileSync(filepath, frontmatter + skill.content, "utf8");
  return filepath;
}

export async function installSkillCommand(slug: string) {
  const spinner = ora(`Fetching skill ${chalk.bold(slug)}...`).start();
  const skill = await fetchSkill(slug).catch(() => null);

  if (!skill) {
    spinner.fail(`Skill ${chalk.bold(slug)} not found.`);
    console.log(chalk.gray(`  Browse skills at https://mcp-registry-sigma.vercel.app/skills`));
    process.exit(1);
  }

  spinner.succeed(`Found: ${chalk.bold(skill.name)} (${skill.type})`);

  try {
    let filepath: string;

    if (skill.type === "agent") {
      filepath = installAgent(skill);
      console.log(chalk.green(`✓ Agent installed`));
      console.log(chalk.gray(`  ${filepath}`));
      console.log(chalk.gray(`  Run with: claude --agent ${skill.slug}`));
    } else {
      filepath = installPrompt(skill);
      console.log(chalk.green(`✓ Slash command installed`));
      console.log(chalk.gray(`  ${filepath}`));
      console.log(chalk.cyan(`  Use as: /${skill.slug} in Claude Code`));
      console.log(chalk.gray(`  (restart Claude Code to activate)\n`));
    }
  } catch (err: any) {
    console.error(chalk.red("Error:"), err.message);
    process.exit(1);
  }
}
