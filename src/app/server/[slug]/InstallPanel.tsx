"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconChevronDown, IconVSCode } from "@/components/Icons";
import type { EnvVar } from "@/lib/types";

type Client = "claude-code" | "claude-desktop" | "cursor" | "continue";

const CLIENT_LABELS: Record<Client, string> = {
  "claude-code":    "Claude Code",
  "claude-desktop": "Claude Desktop",
  cursor:           "Cursor",
  continue:         "Continue.dev",
};

const CONFIG_PATHS: Record<Client, string> = {
  "claude-code":    "~/.claude.json",
  "claude-desktop": "%APPDATA%\\Claude\\claude_desktop_config.json",
  cursor:           "~/.cursor/mcp.json",
  continue:         "~/.continue/config.json",
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
  const [cliCopied, setCliCopied] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<Client>("claude-code");
  const [jsonCopied, setJsonCopied] = useState(false);

  const npxCmd = `npx @sallyheller/mcphub install ${slug}`;
  const vscodeUri = buildVSCodeUri(slug, configJson, installCmd);
  const jsonConfig = buildJsonConfig(activeClient, slug, configJson, installCmd);

  function copy(text: string, setCopiedFn: (v: boolean) => void) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFn(true);
      setTimeout(() => setCopiedFn(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      {/* One-click installs */}
      <div className="flex flex-wrap gap-2">
        {vscodeUri && (
          <a
            href={vscodeUri}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors"
          >
            <IconVSCode size={13} />
            VS Code
          </a>
        )}
        {(["claude-desktop", "cursor"] as Client[]).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => copy(buildJsonConfig(c, slug, configJson, installCmd), setJsonCopied)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white text-xs font-medium transition-colors"
          >
            {jsonCopied ? <IconCheck size={12} /> : <IconCopy size={12} />}
            {CLIENT_LABELS[c]}
          </button>
        ))}
      </div>

      {/* Env vars hint */}
      {envVars && envVars.length > 0 && (
        <p className="text-xs text-gray-600 px-1">
          Requires:{" "}
          {envVars.filter(e => e.required).map((ev, i, arr) => (
            <span key={ev.name}>
              <span className="font-mono text-gray-500">{ev.name}</span>
              {i < arr.length - 1 && <span className="mx-1 text-gray-700">·</span>}
            </span>
          ))}
          <span className="ml-1 text-gray-700">— CLI will prompt you.</span>
        </p>
      )}

      {/* CLI command */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="font-mono text-sm min-w-0">
          <span className="text-gray-600 select-none">$ </span>
          <span className="text-white">{npxCmd}</span>
        </div>
        <button
          type="button"
          onClick={() => copy(npxCmd, setCliCopied)}
          className="shrink-0 flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          {cliCopied ? <IconCheck size={12} /> : <IconCopy size={12} />}
          {cliCopied ? "Copied" : "Copy"}
        </button>
      </div>

      {/* Manual JSON config */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setManualOpen(o => !o)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span>Manual setup (JSON config)</span>
          <IconChevronDown size={14} className={`transition-transform ${manualOpen ? "rotate-180" : ""}`} />
        </button>

        {manualOpen && (
          <div className="border-t border-gray-800">
            {/* Client tabs */}
            <div className="flex border-b border-gray-800 overflow-x-auto">
              {(Object.keys(CLIENT_LABELS) as Client[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActiveClient(c)}
                  className={`px-4 py-2.5 text-xs whitespace-nowrap transition-colors ${
                    activeClient === c
                      ? "text-white border-b-2 border-blue-500 -mb-px"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {CLIENT_LABELS[c]}
                </button>
              ))}
            </div>

            {/* Path + copy */}
            <div className="px-4 py-2.5 bg-gray-950/50 flex items-center justify-between gap-2 border-b border-gray-800/50">
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
          </div>
        )}
      </div>
    </div>
  );
}
