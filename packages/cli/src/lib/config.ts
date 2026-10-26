import * as fs from "fs";
import * as path from "path";
import type { McpServer } from "./api.js";
import type { ClientId } from "./detect.js";
import { getDefaultConfigPath } from "./detect.js";

interface StdioEntry {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

interface RemoteEntry {
  url: string;
  headers?: Record<string, string>;
}

type McpEntry = StdioEntry | RemoteEntry;

function isRemote(entry: McpEntry): entry is RemoteEntry {
  return "url" in entry;
}

export function isRemoteServer(server: McpServer): boolean {
  return server.transport === "http" || server.transport === "sse";
}

// Clients whose config file can't hold a remote (HTTP) server, with what to do instead.
export function remoteUnsupportedReason(clientId: ClientId, url: string): string | null {
  switch (clientId) {
    case "claude-desktop":
      return `add it in Settings → Connectors → Add custom connector: ${url}`;
    case "continue":
    case "openclaw":
      return `remote servers aren't supported here yet; add ${url} by hand`;
    default:
      return null;
  }
}

function readJson(filePath: string): any {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function writeJson(filePath: string, data: any): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

const fill = (value: string, envValues: Record<string, string>) =>
  value.replace(/\$\{(\w+)\}/g, (match, name) => envValues[name] ?? match);

export function buildEntry(server: McpServer, envValues: Record<string, string>): McpEntry {
  if (server.configJson) {
    const template = JSON.parse(server.configJson) as McpEntry & { env?: Record<string, string> };
    if (isRemote(template)) {
      const headers = template.headers
        ? Object.fromEntries(Object.entries(template.headers).map(([k, v]) => [k, fill(v, envValues)]))
        : undefined;
      return { url: fill(template.url, envValues), ...(headers ? { headers } : {}) };
    }
    // Replaces ${VAR} with the real values
    const env: Record<string, string> = {};
    if (template.env) {
      for (const [k, v] of Object.entries(template.env)) env[k] = fill(v, envValues);
    }
    return {
      ...template,
      args: (template.args ?? []).map((a) => fill(a, envValues)),
      ...(Object.keys(env).length > 0 ? { env } : {}),
    };
  }
  // Fallback when there is no configJson
  return { command: "npx", args: ["-y", server.npmPackage ?? server.slug] };
}

export function installForClient(
  clientId: ClientId,
  server: McpServer,
  envValues: Record<string, string>
): string {
  const configPath = getDefaultConfigPath(clientId);
  const entry = buildEntry(server, envValues);

  if (isRemote(entry)) {
    const reason = remoteUnsupportedReason(clientId, entry.url);
    if (reason) throw new Error(reason);
  }

  if (clientId === "continue") {
    installForContinue(configPath, server.slug, entry as StdioEntry);
  } else if (clientId === "copilot") {
    installForCopilot(configPath, server.slug, entry);
  } else if (clientId === "claude-code") {
    installMcpServersFormat(configPath, server.slug, isRemote(entry) ? { type: "http", ...entry } : entry);
  } else {
    // Claude Desktop, Cursor, OpenClaw — mcpServers format
    installMcpServersFormat(configPath, server.slug, entry);
  }

  return configPath;
}

function installMcpServersFormat(configPath: string, slug: string, entry: object): void {
  const config = readJson(configPath);
  if (!config.mcpServers) config.mcpServers = {};
  config.mcpServers[slug] = entry;
  writeJson(configPath, config);
}

function installForCopilot(configPath: string, slug: string, entry: McpEntry): void {
  const config = readJson(configPath);
  if (!config.servers) config.servers = {};
  config.servers[slug] = isRemote(entry)
    ? { type: "http", ...entry }
    : {
        type: "stdio",
        command: entry.command,
        args: entry.args,
        ...(entry.env ? { env: entry.env } : {}),
      };
  writeJson(configPath, config);
}

function installForContinue(configPath: string, slug: string, entry: StdioEntry): void {
  const config = readJson(configPath);
  if (!Array.isArray(config.mcpServers)) config.mcpServers = [];
  // Elimina si ya existe
  config.mcpServers = config.mcpServers.filter((s: any) => s.name !== slug);
  config.mcpServers.push({
    name: slug,
    command: [entry.command, ...entry.args].join(" "),
    ...(entry.env ? { env: entry.env } : {}),
  });
  writeJson(configPath, config);
}

export function isAlreadyInstalled(clientId: ClientId, slug: string): boolean {
  const configPath = getDefaultConfigPath(clientId);
  if (!fs.existsSync(configPath)) return false;
  const config = readJson(configPath);
  if (clientId === "continue") {
    return Array.isArray(config.mcpServers) && config.mcpServers.some((s: any) => s.name === slug);
  }
  if (clientId === "copilot") {
    return !!(config.servers?.[slug]);
  }
  return !!(config.mcpServers?.[slug]);
}

export function removeFromClient(clientId: ClientId, slug: string): void {
  const configPath = getDefaultConfigPath(clientId);
  if (!fs.existsSync(configPath)) return;
  const config = readJson(configPath);
  if (clientId === "continue") {
    config.mcpServers = (config.mcpServers ?? []).filter((s: any) => s.name !== slug);
  } else if (clientId === "copilot") {
    if (config.servers) delete config.servers[slug];
  } else {
    if (config.mcpServers) delete config.mcpServers[slug];
  }
  writeJson(configPath, config);
}
