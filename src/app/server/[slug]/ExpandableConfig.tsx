"use client";

import { useState } from "react";

type Client = "claude-desktop" | "claude-code" | "cursor" | "continue";

const CLIENT_LABELS: Record<Client, string> = {
  "claude-desktop": "Claude Desktop",
  "claude-code": "Claude Code",
  cursor: "Cursor",
  continue: "Continue.dev",
};

const CLIENT_PATHS: Record<Client, string> = {
  "claude-desktop": "%APPDATA%\\Claude\\claude_desktop_config.json",
  "claude-code": "~/.claude.json",
  cursor: "~/.cursor/mcp.json",
  continue: "~/.continue/config.json",
};

function buildConfig(client: Client, slug: string, configJson: string | null): string {
  try {
    const config = configJson ? JSON.parse(configJson) : { command: "npx", args: [`-y`, `@mcphub/${slug}`] };
    if (client === "continue") {
      return JSON.stringify({
        mcpServers: [{ name: slug, ...config }],
      }, null, 2);
    }
    return JSON.stringify({
      mcpServers: {
        [slug]: config,
      },
    }, null, 2);
  } catch {
    return "{}";
  }
}

export function ExpandableConfig({ server }: { server: { slug: string; configJson: string | null } }) {
  const [open, setOpen] = useState(false);
  const [activeClient, setActiveClient] = useState<Client>("claude-desktop");
  const [copied, setCopied] = useState(false);

  const config = buildConfig(activeClient, server.slug, server.configJson);

  function copyConfig() {
    navigator.clipboard.writeText(config).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-900/60 transition-colors"
      >
        <span className="font-medium">JSON config (for manual setup)</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-gray-800">
          {/* Client tabs */}
          <div className="flex border-b border-gray-800 overflow-x-auto">
            {(Object.keys(CLIENT_LABELS) as Client[]).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActiveClient(c)}
                className={`px-4 py-2 text-xs whitespace-nowrap transition-colors ${
                  activeClient === c
                    ? "text-blue-400 border-b-2 border-blue-500 -mb-px"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {CLIENT_LABELS[c]}
              </button>
            ))}
          </div>

          {/* Config path hint */}
          <div className="px-4 py-2 bg-gray-950/50 flex items-center justify-between gap-2">
            <span className="text-xs text-gray-600 font-mono truncate">{CLIENT_PATHS[activeClient]}</span>
            <button
              type="button"
              onClick={copyConfig}
              className="shrink-0 text-xs text-gray-500 hover:text-gray-300 border border-gray-700 px-2 py-1 rounded transition-colors"
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>

          {/* JSON */}
          <pre className="px-4 py-4 text-xs text-gray-300 bg-gray-950/30 overflow-x-auto font-mono leading-relaxed">
            {config}
          </pre>
        </div>
      )}
    </div>
  );
}
