import * as fs from "fs";
import * as path from "path";
import type { McpServer } from "./api.js";
import type { ClientId } from "./detect.js";
import { getDefaultConfigPath } from "./detect.js";

interface McpEntry {
  command: string;
  args: string[];
  env?: Record<string, string>;
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

function buildEntry(server: McpServer, envValues: Record<string, string>): McpEntry {
  if (server.configJson) {
    const template = JSON.parse(server.configJson) as McpEntry;
    // Reemplaza ${VAR} con los valores reales
    const env: Record<string, string> = {};
    if (template.env) {
      for (const [k, v] of Object.entries(template.env)) {
        env[k] = v.replace(/\$\{(\w+)\}/g, (_, varName) => envValues[varName] ?? v);
      }
    }
    return { ...template, ...(Object.keys(env).length > 0 ? { env } : {}) };
  }
  // Fallback si no hay configJson
  return { command: "npx", args: ["-y", server.npmPackage ?? server.slug] };
}

export function installForClient(
  clientId: ClientId,
  server: McpServer,
  envValues: Record<string, string>
): string {
  const configPath = getDefaultConfigPath(clientId);
  const entry = buildEntry(server, envValues);

  if (clientId === "continue") {
    installForContinue(configPath, server.slug, entry);
  } else {
    // Claude Code, Claude Desktop, Cursor, OpenClaw — todos usan formato mcpServers
    installMcpServersFormat(configPath, server.slug, entry);
  }

  return configPath;
}

function installMcpServersFormat(configPath: string, slug: string, entry: McpEntry): void {
  const config = readJson(configPath);
  if (!config.mcpServers) config.mcpServers = {};
  config.mcpServers[slug] = entry;
  writeJson(configPath, config);
}

function installForContinue(configPath: string, slug: string, entry: McpEntry): void {
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
  return !!(config.mcpServers?.[slug]);
}

export function removeFromClient(clientId: ClientId, slug: string): void {
  const configPath = getDefaultConfigPath(clientId);
  if (!fs.existsSync(configPath)) return;
  const config = readJson(configPath);
  if (clientId === "continue") {
    config.mcpServers = (config.mcpServers ?? []).filter((s: any) => s.name !== slug);
  } else {
    if (config.mcpServers) delete config.mcpServers[slug];
  }
  writeJson(configPath, config);
}
