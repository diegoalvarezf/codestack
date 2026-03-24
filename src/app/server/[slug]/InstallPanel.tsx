"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconChevronDown, IconVSCode } from "@/components/Icons";
import type { EnvVar } from "@/lib/types";

type Client = "claude-code" | "claude-desktop" | "cursor" | "continue" | "openclaw";

const CLIENT_LABELS: Record<Client, string> = {
  "claude-code":    "Claude Code",
  "claude-desktop": "Claude Desktop",
  cursor:           "Cursor",
  continue:         "Continue.dev",
  openclaw:         "OpenClaw",
};

const CONFIG_PATHS: Record<Client, string> = {
  "claude-code":    "~/.claude.json",
  "claude-desktop": "%APPDATA%\\Claude\\claude_desktop_config.json",
  cursor:           "~/.cursor/mcp.json",
  continue:         "~/.continue/config.json",
  openclaw:         "~/.openclaw/openclaw.json",
};

interface Entry { command: string; args: string[]; env?: Record<string, string> }

function parseInstallCmd(cmd: string): Entry {
  const parts = cmd.trim().split(/\s+/);
  return { command: parts[0], args: parts.slice(1) };
}

function buildEntry(configJson: string | null, installCmd: string | null): Entry {
  return configJson
    ? (JSON.parse(configJson) as Entry)
    : parseInstallCmd(installCmd ?? "npx -y @mcphub/server");
}

function buildVSCodeUri(slug: string, configJson: string | null, installCmd: string | null): string | null {
  try {
    const entry = buildEntry(configJson, installCmd);
    const payload = JSON.stringify({ name: slug, ...entry });
    return `vscode:mcp/install?${encodeURIComponent(payload)}`;
  } catch {
    return null;
  }
}

function buildJsonConfig(client: Client, slug: string, configJson: string | null, installCmd: string | null): string {
  const entry = buildEntry(configJson, installCmd);
  if (client === "continue") {
    return JSON.stringify({ mcpServers: [{ name: slug, command: entry.command, args: entry.args, ...(entry.env ? { env: entry.env } : {}) }] }, null, 2);
  }
  return JSON.stringify({ mcpServers: { [slug]: entry } }, null, 2);
}

interface Props {
  slug: string;
  installCmd: string | null;
  configJson: string | null;
  envVars: EnvVar[] | null;
}

export function InstallPanel({ slug, installCmd, configJson, envVars }: Props) {
  const [copied, setCopied] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<Client>("claude-code");
  const [jsonCopied, setJsonCopied] = useState(false);

  const vscodeUri = buildVSCodeUri(slug, configJson, installCmd);
  const npxCmd = `npx @diegoalvarezf/mcphub install ${slug}`;
  const jsonConfig = buildJsonConfig(activeClient, slug, configJson, installCmd);

  function copy(text: string, fn: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      fn(true);
      setTimeout(() => fn(false), 2000);
    });
  }

  return (
    <div className="space-y-2">
      {/* Primary: CLI command */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-sm truncate">
            <span className="text-gray-600 select-none">$ </span>
            <span className="text-white">{npxCmd}</span>
          </div>
          <p className="text-xs text-gray-600 mt-1">auto-installs to all detected clients</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {vscodeUri && (
            <a
              href={vscodeUri}
              title="Install in VS Code"
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2.5 py-1.5 rounded transition-colors"
            >
              <IconVSCode size={12} />
              VS Code
            </a>
          )}
          <button
            type="button"
            onClick={() => copy(npxCmd, setCopied)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2.5 py-1.5 rounded transition-colors"
          >
            {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      {/* Manual JSON config */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setManualOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          <span>Manual config (JSON)</span>
          <IconChevronDown size={13} className={`transition-transform ${manualOpen ? "rotate-180" : ""}`} />
        </button>

        {manualOpen && (
          <div className="border-t border-gray-800">
            <div className="flex border-b border-gray-800 overflow-x-auto">
              {(Object.keys(CLIENT_LABELS) as Client[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveClient(c)}
                  className={`px-4 py-2 text-xs whitespace-nowrap transition-colors ${
                    activeClient === c
                      ? "text-white border-b-2 border-blue-500 -mb-px"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {CLIENT_LABELS[c]}
                </button>
              ))}
            </div>

            <div className="px-4 py-2 bg-gray-950/50 flex items-center justify-between gap-2 border-b border-gray-800/50">
              <span className="text-xs text-gray-600 font-mono truncate">{CONFIG_PATHS[activeClient]}</span>
              <button
                type="button"
                onClick={() => copy(jsonConfig, setJsonCopied)}
                className="shrink-0 flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2 py-1 rounded transition-colors"
              >
                {jsonCopied ? <IconCheck size={11} /> : <IconCopy size={11} />}
                {jsonCopied ? "Copied" : "Copy"}
              </button>
            </div>

            <pre className="px-4 py-4 text-xs text-gray-400 bg-gray-950/30 overflow-x-auto font-mono leading-relaxed">
              {jsonConfig}
            </pre>

            {envVars && envVars.filter(e => e.required).length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-800/50 text-xs text-gray-600">
                Required env vars:{" "}
                {envVars.filter(e => e.required).map((ev, i, arr) => (
                  <span key={ev.name}>
                    <span className="font-mono text-gray-500">{ev.name}</span>
                    {i < arr.length - 1 && <span className="mx-1">·</span>}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
