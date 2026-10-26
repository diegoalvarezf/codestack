import { createHash } from "crypto";
import { zipSync, strToU8 } from "fflate";
import type { McpServer, EnvVar } from "./types";

// Builds Claude Code plugins from stacks and teams.
// A plugin bundles MCP servers (.mcp.json), Agent Skills (skills/<name>/SKILL.md)
// and subagents (agents/<name>.md). Formats:
//   https://code.claude.com/docs/en/plugins/manifest-reference.md
//   https://agentskills.io/specification

export const MARKETPLACE_NAME = "codestack";

export interface PluginSkill {
  slug: string;
  name: string;
  description: string | null;
  type: string; // "prompt" | "skill" | "agent"
  content: string;
}

export interface PluginInput {
  slug: string;
  displayName: string;
  description: string;
  homepage: string;
  servers: McpServer[];
  skills: PluginSkill[];
}

const SENSITIVE_RE = /key|token|secret|password|passwd|credential|auth/i;

// Agent Skills names: 1-64 chars, a-z 0-9 and single hyphens, no leading/trailing hyphen.
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

export function renderSkillMd(skill: PluginSkill): string {
  const { fields, body } = splitFrontmatter(skill.content);
  const description = (skill.description || skill.name).slice(0, 1024);
  return frontmatter(toSkillName(skill.slug), description, extraFields("skill", fields)) + body.trim() + "\n";
}

export function renderAgentMd(skill: PluginSkill): string {
  const { fields, body } = splitFrontmatter(skill.content);
  return frontmatter(toSkillName(skill.slug), skill.description || skill.name, extraFields("agent", fields)) + body.trim() + "\n";
}

type McpEntry = Record<string, unknown>;

// Replaces ${VAR} placeholders from the catalog template with plugin user config values.
function toUserConfigRefs(value: unknown, vars: Set<string>): unknown {
  if (typeof value === "string") {
    return value.replace(/\$\{(\w+)\}/g, (match, name) =>
      vars.has(name) ? `\${user_config.${name}}` : match
    );
  }
  if (Array.isArray(value)) return value.map((v) => toUserConfigRefs(v, vars));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, toUserConfigRefs(v, vars)])
    );
  }
  return value;
}

export function isRemoteServer(server: Pick<McpServer, "transport" | "configJson">): boolean {
  return server.transport === "http" || server.transport === "sse";
}

export function serverEntry(server: McpServer): McpEntry {
  const vars = new Set((server.envVars ?? []).map((v) => v.name));
  let template: McpEntry | null = null;
  if (server.configJson) {
    try {
      template = JSON.parse(server.configJson);
    } catch {
      template = null;
    }
  }
  if (!template) {
    template = { command: "npx", args: ["-y", server.npmPackage ?? server.slug] };
  }
  if (isRemoteServer(server)) {
    template = { ...template, type: server.transport === "sse" ? "sse" : "http" };
  }
  return toUserConfigRefs(template, vars) as McpEntry;
}

function userConfigFor(servers: McpServer[]) {
  const options: Record<string, Record<string, unknown>> = {};
  for (const server of servers) {
    for (const v of server.envVars ?? ([] as EnvVar[])) {
      if (options[v.name]) continue;
      options[v.name] = {
        type: "string",
        title: v.name,
        description: v.description || `${v.name} for ${server.name}`,
        required: v.required,
        ...(SENSITIVE_RE.test(v.name) ? { sensitive: true } : {}),
      };
    }
  }
  return options;
}

export function buildPluginFiles(input: PluginInput): Record<string, string> {
  const userConfig = userConfigFor(input.servers);
  const manifest = {
    name: input.slug,
    displayName: input.displayName,
    description: input.description,
    author: { name: "Codestack" },
    homepage: input.homepage,
    keywords: ["codestack", "mcp"],
    ...(Object.keys(userConfig).length ? { userConfig } : {}),
  };

  const files: Record<string, string> = {
    ".claude-plugin/plugin.json": JSON.stringify(manifest, null, 2) + "\n",
  };

  if (input.servers.length) {
    const mcpServers = Object.fromEntries(input.servers.map((s) => [s.slug, serverEntry(s)]));
    files[".mcp.json"] = JSON.stringify({ mcpServers }, null, 2) + "\n";
  }

  for (const skill of input.skills) {
    const name = toSkillName(skill.slug);
    if (skill.type === "agent") files[`agents/${name}.md`] = renderAgentMd(skill);
    else files[`skills/${name}/SKILL.md`] = renderSkillMd(skill);
  }

  return files;
}

// Fixed timestamp so the same content always produces the same bytes (and sha256).
const ZIP_MTIME = new Date("2020-01-01T00:00:00Z");

export function zipPlugin(files: Record<string, string>): Uint8Array {
  const entries: Record<string, [Uint8Array, { mtime: Date }]> = {};
  for (const path of Object.keys(files).sort()) {
    entries[path] = [strToU8(files[path]), { mtime: ZIP_MTIME }];
  }
  return zipSync(entries, { level: 9 });
}

export function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}
