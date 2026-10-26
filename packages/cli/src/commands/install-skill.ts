import chalk from "chalk";
import ora from "ora";
import { REGISTRY_URL } from "../lib/api.js";
import { installSkillFiles, toSkillName, type SkillLike } from "../lib/skills.js";

async function fetchSkill(slug: string): Promise<SkillLike | null> {
  const res = await fetch(`${REGISTRY_URL}/api/skills/${encodeURIComponent(slug)}`);
  if (!res.ok) return null;
  return res.json() as Promise<SkillLike>;
}

export async function installSkillCommand(slug: string) {
  const spinner = ora(`Fetching skill ${chalk.bold(slug)}...`).start();
  const skill = await fetchSkill(slug).catch(() => null);

  if (!skill) {
    spinner.fail(`Skill ${chalk.bold(slug)} not found.`);
    console.log(chalk.gray(`  Browse skills at ${REGISTRY_URL}/skills`));
    process.exit(1);
  }

  spinner.succeed(`Found: ${chalk.bold(skill.name)} (${skill.type === "agent" ? "agent" : "skill"})`);

  try {
    const files = installSkillFiles(skill);
    const name = toSkillName(skill.slug);

    if (skill.type === "agent") {
      console.log(chalk.green(`✓ Agent installed`));
      console.log(chalk.gray(`  ${files[0]}`));
      console.log(chalk.gray(`  Use it in Claude Code with: claude --agent ${name}\n`));
    } else {
      console.log(chalk.green(`✓ Skill installed`));
      for (const f of files) console.log(chalk.gray(`  ${f}`));
      console.log(chalk.cyan(`  Use as /${name} in Claude Code; Codex, Copilot, Gemini CLI, OpenCode and Cursor load it too.\n`));
    }
  } catch (err: any) {
    console.error(chalk.red("Error:"), err.message);
    process.exit(1);
  }
}
