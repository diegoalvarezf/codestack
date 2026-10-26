import fs from "fs";
import path from "path";
import os from "os";

// Agent Skills (https://agentskills.io/specification) and Claude Code subagents.
//   ~/.claude/skills/<name>/SKILL.md  → Claude Code (also read by Cursor, OpenCode, Copilot)
//   ~/.agents/skills/<name>/SKILL.md  → Codex, Copilot, Gemini CLI, OpenCode, Cursor
//   ~/.claude/agents/<name>.md        → Claude Code subagents

export interface SkillLike {
  slug: string;
  name: string;
  description?: string | null;
  type: string; // "prompt" | "skill" | "agent"
  content: string;
}

const SKILL_DIRS = [
  path.join(os.homedir(), ".claude", "skills"),
  path.join(os.homedir(), ".agents", "skills"),
];
const AGENTS_DIR = path.join(os.homedir(), ".claude", "agents");

// 1-64 chars, a-z 0-9 and single hyphens, no leading/trailing hyphen.
export function toSkillName(slug: string): string {
  const name = slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64)
    .replace(/-$/, "");
  return name || "skill";
}

// Stored content may already start with its own frontmatter (e.g. agents with tools/model).
// Split it so the generated frontmatter wins for name/description and keeps the other keys.
export function splitFrontmatter(content: string): { fields: [string, string][]; body: string } {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { fields: [], body: content };
  const fields: [string, string][] = [];
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv) fields.push([kv[1], kv[2]]);
  }
  return { fields, body: content.slice(match[0].length) };
}

function frontmatter(name: string, description: string, extra: [string, string][] = []): string {
  const lines = [`name: ${name}`, `description: ${JSON.stringify(description.replace(/\s+/g, " ").trim())}`];
  for (const [k, v] of extra) if (k !== "name" && k !== "description") lines.push(`${k}: ${v}`);
  return `---\n${lines.join("\n")}\n---\n\n`;
}

// Agents keep their own settings (tools, model…); skills only keep the portable allowed-tools.
function extraFields(type: string, fields: [string, string][]): [string, string][] {
  return type === "agent" ? fields : fields.filter(([k]) => k === "allowed-tools");
}

export function installSkillFiles(skill: SkillLike, name = toSkillName(skill.slug)): string[] {
  const description = skill.description || skill.name;
  const { fields, body } = splitFrontmatter(skill.content);

  if (skill.type === "agent") {
    fs.mkdirSync(AGENTS_DIR, { recursive: true });
    const file = path.join(AGENTS_DIR, `${name}.md`);
    fs.writeFileSync(file, frontmatter(name, description, extraFields("agent", fields)) + body.trim() + "\n", "utf8");
    return [file];
  }

  const text = frontmatter(name, description.slice(0, 1024), extraFields("skill", fields)) + body.trim() + "\n";
  return SKILL_DIRS.map((dir) => {
    const skillDir = path.join(dir, name);
    fs.mkdirSync(skillDir, { recursive: true });
    const file = path.join(skillDir, "SKILL.md");
    fs.writeFileSync(file, text, "utf8");
    return file;
  });
}
