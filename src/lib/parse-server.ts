import type { McpServer, EnvVar } from "./types";

function safeParseArray(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeParseEnvVars(json: string | null | undefined): EnvVar[] | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function parseServer(server: any): McpServer {
  return {
    ...server,
    tags: safeParseArray(server.tags),
    tools: safeParseArray(server.tools),
    clients: safeParseArray(server.clients),
    envVars: safeParseEnvVars(server.envVars),
  };
}
