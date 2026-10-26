import * as fs from "fs";
import * as path from "path";
import * as os from "os";

export type ClientId = "claude-code" | "claude-desktop" | "cursor" | "continue" | "openclaw" | "copilot";

export interface DetectedClient {
  id: ClientId;
  label: string;
  configPath: string;
}

function expand(p: string): string {
  return p
    .replace(/^~/, os.homedir())
    .replace(/%APPDATA%/g, process.env.APPDATA ?? path.join(os.homedir(), "AppData", "Roaming"))
    .replace(/%LOCALAPPDATA%/g, process.env.LOCALAPPDATA ?? path.join(os.homedir(), "AppData", "Local"));
}

const CLIENT_CONFIG_PATHS: Record<ClientId, string[]> = {
  "claude-code": [
    "~/.claude.json",
    path.join(process.cwd(), ".claude.json"),
  ],
  "claude-desktop": [
    "%APPDATA%/Claude/claude_desktop_config.json",
    "~/Library/Application Support/Claude/claude_desktop_config.json",
    "~/.config/Claude/claude_desktop_config.json",
  ],
  cursor: [
    "~/.cursor/mcp.json",
    path.join(process.cwd(), ".cursor/mcp.json"),
  ],
  continue: [
    "~/.continue/config.json",
  ],
  openclaw: [
    "~/.openclaw/openclaw.json",
  ],
  copilot: [
    "%APPDATA%/Code/User/mcp.json",
    "%APPDATA%/Code - Insiders/User/mcp.json",
    "~/Library/Application Support/Code/User/mcp.json",
    "~/Library/Application Support/Code - Insiders/User/mcp.json",
    "~/.config/Code/User/mcp.json",
    "~/.config/Code - Insiders/User/mcp.json",
  ],
};

const CLIENT_LABELS: Record<ClientId, string> = {
  "claude-code": "Claude Code",
  "claude-desktop": "Claude Desktop",
  cursor: "Cursor",
  continue: "Continue.dev",
  openclaw: "OpenClaw",
  copilot: "GitHub Copilot (VS Code)",
};

export function detectClients(): DetectedClient[] {
  const found: DetectedClient[] = [];
  for (const [id, paths] of Object.entries(CLIENT_CONFIG_PATHS) as [ClientId, string[]][]) {
    for (const p of paths) {
      const expanded = expand(p);
      if (fs.existsSync(expanded)) {
        found.push({ id, label: CLIENT_LABELS[id], configPath: expanded });
        break;
      }
    }
  }
  return found;
}

export function getDefaultConfigPath(clientId: ClientId): string {
  const paths = CLIENT_CONFIG_PATHS[clientId].map(expand);
  // The config file that exists on this machine; otherwise the main one
  return paths.find((p) => fs.existsSync(p)) ?? paths[0];
}
