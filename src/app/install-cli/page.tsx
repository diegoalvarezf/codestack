import type { Metadata } from "next";
import { CopyButton } from "@/components/CopyButton";

export const metadata: Metadata = {
  title: "Install MCPHub CLI — mcp install",
  description: "Install MCP servers with one command across Claude Code, Cursor, and Continue.",
};

const commands = [
  {
    cmd: "mcp install github",
    desc: "Install an MCP server — auto-detects clients, asks for required env vars",
  },
  {
    cmd: "mcp install-skill review-pr",
    desc: "Install a prompt as a /slash-command or an agent into Claude Code",
  },
  {
    cmd: "mcp install-stack full-stack-dev",
    desc: "Install an entire stack — all servers, skills, and agents in one command",
  },
  {
    cmd: "mcp remove github",
    desc: "Remove a server from one or all clients",
  },
  {
    cmd: "mcp search database",
    desc: "Search servers in the MCPHub registry",
  },
  {
    cmd: "mcp list",
    desc: "List all installed servers across every client",
  },
  {
    cmd: "mcp sync --team my-team",
    desc: "Install all servers + skills configured for your team",
  },
];

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
        <div className="space-y-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="font-mono text-sm">
              <span className="text-gray-500">$ </span>
              <span className="text-green-400">npm install -g @diegoalvarezf/mcphub</span>
            </div>
            <CopyButton text="npm install -g @diegoalvarezf/mcphub" />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-600">or use without installing</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="font-mono text-sm">
              <span className="text-gray-500">$ </span>
              <span className="text-blue-400">npx @diegoalvarezf/mcphub install github</span>
            </div>
            <CopyButton text="npx @diegoalvarezf/mcphub install github" />
          </div>
          <p className="text-xs text-gray-600">
            Using <code className="bg-gray-900 px-1 rounded">npx</code> runs the latest version without a global install — useful for CI/CD or one-off installs.
          </p>
        </div>
      </section>

      {/* Commands */}
      <section className="mb-10">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Commands</h2>
        <div className="space-y-3">
          {commands.map(({ cmd, desc }) => (
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

      {/* Teams */}
      <section className="mb-10">
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-1">Team sync</h3>
          <p className="text-sm text-gray-400 mb-4">
            Create a team on MCPHub, add the servers your team uses, and share one command.
            Every new developer runs it and gets the full stack configured in under a minute.
          </p>
          <div className="space-y-2">
            <div className="bg-gray-900/80 rounded-lg p-3 font-mono text-sm">
              <span className="text-gray-500"># On your team page, copy the sync command:</span>
            </div>
            <div className="bg-gray-900/80 rounded-lg p-3 font-mono text-sm flex items-center justify-between gap-3">
              <span>
                <span className="text-gray-500">$ </span>
                <span className="text-blue-400">mcp sync --team acme-corp</span>
              </span>
              <CopyButton text="mcp sync --team acme-corp" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            API keys are never stored in the cloud — the CLI asks for them locally during sync.
          </p>
          <a href="/teams" className="inline-block mt-3 text-sm text-blue-400 hover:underline">
            Create a team →
          </a>
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
          href="https://github.com/diegoalvarezf/mcp-registry"
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
