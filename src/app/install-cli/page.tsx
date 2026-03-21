import type { Metadata } from "next";
import { CopyButton } from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Install MCPHub CLI — mcp install",
  description: "Install MCP servers with one command across Claude Code, Cursor, and Continue.",
};

export default function InstallCliPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-sm px-3 py-1 rounded-full mb-5 border border-green-500/20">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
          Free & open source
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">MCPHub CLI</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Install and manage MCP servers across Claude Code, Cursor, and Continue.dev with a single command.
        </p>
      </div>

      {/* Install */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Install</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="font-mono text-sm">
            <span className="text-gray-500">$ </span>
            <span className="text-green-400">npm install -g @mcphub/cli</span>
          </div>
          <CopyButton text="npm install -g @mcphub/cli" />
        </div>
      </section>

      {/* Usage */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Usage</h2>
        <div className="space-y-3">
          {[
            { cmd: "mcp install github", desc: "Install a server — detects your clients automatically" },
            { cmd: "mcp search database", desc: "Search servers in MCPHub" },
            { cmd: "mcp list", desc: "List installed servers across all clients" },
          ].map(({ cmd, desc }) => (
            <div key={cmd} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="flex items-center justify-between gap-4 mb-1">
                <div className="font-mono text-sm">
                  <span className="text-gray-500">$ </span>
                  <span className="text-blue-400">{cmd}</span>
                </div>
                <CopyButton text={cmd} />
              </div>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">How it works</h2>
        <div className="space-y-4">
          {[
            { step: "1", title: "Finds the server", desc: "Fetches metadata, install command and required env vars from MCPHub." },
            { step: "2", title: "Asks for credentials", desc: "Prompts only for the env vars the server needs (API keys, tokens, etc)." },
            { step: "3", title: "Detects your clients", desc: "Auto-detects Claude Code, Cursor and Continue.dev on your machine." },
            { step: "4", title: "Writes the config", desc: "Updates the correct config file for each client. No JSON editing needed." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                {step}
              </div>
              <div>
                <p className="font-medium text-white mb-0.5">{title}</p>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Compatible clients */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Compatible clients</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { name: "Claude Code", status: "Full support" },
            { name: "Cursor", status: "Full support" },
            { name: "Continue.dev", status: "Full support" },
          ].map(({ name, status }) => (
            <div key={name} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
              <p className="font-medium text-white mb-1">{name}</p>
              <p className="text-xs text-green-400">{status}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center">
        <a
          href="https://github.com/sallyheller/mcp-registry"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          View source on GitHub →
        </a>
      </div>
    </div>
  );
}
