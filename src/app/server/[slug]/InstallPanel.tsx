"use client";

import { useState } from "react";
import { IconCheck, IconCopy } from "@/components/Icons";
import type { EnvVar } from "@/lib/types";

type Client = "claude-code" | "claude-desktop" | "cursor" | "continue";

const CLIENTS: { id: Client; label: string }[] = [
  { id: "claude-code",    label: "Claude Code" },
  { id: "claude-desktop", label: "Claude Desktop" },
  { id: "cursor",         label: "Cursor" },
  { id: "continue",       label: "Continue.dev" },
];

const CONFIG_PATHS: Record<Client, string> = {
  "claude-code":    "~/.claude.json",
  "claude-desktop": "%APPDATA%\\Claude\\claude_desktop_config.json",
  cursor:           "~/.cursor/mcp.json",
  continue:         "~/.continue/config.json",
};

/* Parse "npx -y @pkg arg2" → { command: "npx", args: ["-y", "@pkg", "arg2"] } */
function parseInstallCmd(installCmd: string): Entry {
  const parts = installCmd.trim().split(/\s+/);
  return { command: parts[0], args: parts.slice(1) };
}

interface Entry {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

/* Build the entry object from configJson template or installCmd, filling env var placeholders */
function buildEntry(
  configJson: string | null,
  installCmd: string | null,
  envValues: Record<string, string>
): Entry {
  const base = configJson
    ? (JSON.parse(configJson) as Entry)
    : parseInstallCmd(installCmd ?? "npx -y @mcphub/server");

  const env: Record<string, string> = {};
  if (base.env) {
    for (const [k, v] of Object.entries(base.env)) {
      env[k] = (v as string).replace(/\$\{(\w+)\}/g, (_: string, varName: string) => envValues[varName] ?? "");
    }
  }
  for (const [k, v] of Object.entries(envValues)) {
    if (v && !env[k]) env[k] = v;
  }

  return { command: base.command, args: base.args, ...(Object.keys(env).length > 0 ? { env } : {}) };
}

/* Claude Code: claude mcp add <slug> [-e K=V ...] -- <command> <args...> */
function buildClaudeCodeCmd(
  slug: string,
  configJson: string | null,
  installCmd: string | null,
  envValues: Record<string, string>
): string {
  const entry = buildEntry(configJson, installCmd, envValues);
  const envFlags = Object.entries(entry.env ?? {})
    .map(([k, v]) => `-e ${k}=${v || `<${k}>`}`)
    .join(" ");
  const cmd = [entry.command, ...entry.args].join(" ");
  return `claude mcp add ${slug}${envFlags ? ` ${envFlags}` : ""} -- ${cmd}`;
}

/* JSON config for Desktop/Cursor/Continue */
function buildJsonConfig(
  client: Client,
  slug: string,
  configJson: string | null,
  installCmd: string | null,
  envValues: Record<string, string>
): string {
  const entry = buildEntry(configJson, installCmd, envValues);
  // Fill empty env values with placeholder
  if (entry.env) {
    for (const k of Object.keys(entry.env)) {
      if (!entry.env[k]) entry.env[k] = `<${k}>`;
    }
  }
  if (client === "continue") {
    return JSON.stringify(
      { mcpServers: [{ name: slug, command: entry.command, args: entry.args, ...(entry.env ? { env: entry.env } : {}) }] },
      null, 2
    );
  }
  return JSON.stringify(
    { mcpServers: { [slug]: entry } },
    null, 2
  );
}

interface Props {
  slug: string;
  installCmd: string | null;
  configJson: string | null;
  envVars: EnvVar[] | null;
}

export function InstallPanel({ slug, installCmd, configJson, envVars }: Props) {
  const [client, setClient] = useState<Client>("claude-code");
  const [values, setValues] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const required = envVars?.filter((e) => e.required) ?? [];
  const optional = envVars?.filter((e) => !e.required) ?? [];

  const isClaudeCode = client === "claude-code";

  const command = isClaudeCode
    ? buildClaudeCodeCmd(slug, configJson, installCmd, values)
    : buildJsonConfig(client, slug, configJson, installCmd, values);

  const allRequiredFilled = required.every((ev) => values[ev.name]?.trim());

  function copy() {
    navigator.clipboard.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Client tabs */}
      <div className="flex border-b border-gray-800 overflow-x-auto">
        {CLIENTS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setClient(c.id)}
            className={`px-4 py-3 text-sm whitespace-nowrap transition-colors ${
              client === c.id
                ? "text-white border-b-2 border-blue-500 -mb-px font-medium"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-5">
        {/* Env var inputs */}
        {envVars && envVars.length > 0 && (
          <div className="space-y-3">
            {[...required, ...optional].map((ev) => (
              <div key={ev.name}>
                <label className="flex items-center gap-2 text-xs font-mono font-medium text-gray-300 mb-1.5">
                  {ev.name}
                  {ev.required
                    ? <span className="text-xs font-sans font-normal text-red-400/80 non-mono">required</span>
                    : <span className="text-xs font-sans font-normal text-gray-600">optional</span>
                  }
                </label>
                <input
                  type="text"
                  value={values[ev.name] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [ev.name]: e.target.value }))}
                  placeholder={ev.example ?? `Enter ${ev.name}...`}
                  className="w-full bg-gray-950 border border-gray-700 focus:border-gray-500 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 outline-none transition-colors font-mono"
                />
                <p className="text-xs text-gray-600 mt-1">{ev.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Generated command / config */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-widest">
              {isClaudeCode ? "Command" : `Add to ${CONFIG_PATHS[client]}`}
            </span>
            {!isClaudeCode && (
              <span className="text-xs text-gray-600 font-mono truncate max-w-[50%]">{CONFIG_PATHS[client]}</span>
            )}
          </div>
          <div className="relative bg-gray-950 border border-gray-800 rounded-lg overflow-hidden">
            <pre className="px-4 py-4 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed whitespace-pre-wrap break-all">
              {isClaudeCode ? (
                <><span className="text-gray-600 select-none">$ </span>{command}</>
              ) : command}
            </pre>
            <button
              type="button"
              onClick={copy}
              className="absolute top-3 right-3 flex items-center gap-1.5 text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white px-2.5 py-1.5 rounded-md transition-colors"
            >
              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-600">
          {isClaudeCode
            ? "Run in your terminal. Restart Claude Code to activate."
            : `Paste into ${CONFIG_PATHS[client]} then restart your client.`
          }
          {required.length > 0 && !allRequiredFilled && (
            <span className="text-yellow-600/70 ml-2">Fill in the required fields above for a ready-to-use command.</span>
          )}
        </p>
      </div>
    </div>
  );
}
