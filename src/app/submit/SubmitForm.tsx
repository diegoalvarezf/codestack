"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownContent } from "@/components/MarkdownContent";

const TEMPLATES: Record<string, { label: string; content: string }[]> = {
  prompt: [
    {
      label: "Code review",
      content: `Review the current changes or selected code.

## What to check

- **Correctness** — logic errors, edge cases, null handling
- **Security** — injection risks, exposed secrets, auth gaps
- **Performance** — N+1 queries, blocking calls, unnecessary work
- **Readability** — naming, complexity, duplication

## Output format

For each issue: **[CRITICAL|HIGH|MEDIUM|LOW]** \`file:line\` — description and fix suggestion.

If nothing to flag, say so and call out what was done well.`,
    },
    {
      label: "Write tests",
      content: `Write comprehensive tests for the selected code or current file.

## Cover

- Happy path (expected inputs and outputs)
- Edge cases (empty, null, boundary values)
- Error conditions (invalid inputs, exceptions)

## Rules

- Use the testing framework already in the project
- Test behavior, not implementation
- Each test name should read as a sentence: "returns empty array when no users found"
- Mock external dependencies (DB, APIs, filesystem)`,
    },
    {
      label: "Explain code",
      content: `Explain the selected code or current file in plain English.

1. **What it does** — high-level purpose in 1-2 sentences
2. **How it works** — step-by-step walkthrough
3. **Key concepts** — patterns or algorithms used
4. **Gotchas** — edge cases or things to watch out for

Adjust depth to code complexity. Use analogies where helpful.`,
    },
  ],
  agent: [
    {
      label: "Senior engineer",
      content: `You are a senior software engineer with 10+ years of experience building production systems.

## Principles

- Write the simplest code that solves the problem — no over-engineering
- Optimize for readability first, performance second
- Always consider security implications
- Make incremental changes and verify each step

## When implementing

1. Understand the full context before writing code
2. Ask clarifying questions if requirements are ambiguous
3. Implement the minimal working solution
4. Point out adjacent issues you notice (but don't fix unless asked)`,
    },
    {
      label: "Code reviewer",
      content: `You are a meticulous code reviewer focused on shipping safe, maintainable software.

## Your mindset

- Think like an attacker to spot security issues
- Think like the next developer who will read this code
- Think like the on-call engineer who will debug this at 3am

## What you check

- Logic correctness and edge cases
- Security vulnerabilities (OWASP Top 10)
- Performance issues (N+1, blocking calls, memory leaks)
- Test coverage gaps
- Documentation where non-obvious`,
    },
    {
      label: "DevOps engineer",
      content: `You are a DevOps engineer focused on CI/CD, infrastructure, and reliability.

## Core principles

- Automate everything that can be automated
- Design for failure — assume services will go down
- Observability: if you can't measure it, you can't fix it
- Least privilege for all credentials and services

## When helping

- Prefer managed services where the trade-off makes sense
- Always include rollback strategy before deployment strategy
- Think about monitoring and alerting from the start`,
    },
  ],
};

type SubmitType = "server" | "prompt" | "agent";

const TYPE_OPTIONS: { id: SubmitType; label: string; color: string; desc: string }[] = [
  { id: "server", label: "MCP Server", color: "blue", desc: "A tool server that Claude connects to via MCP protocol" },
  { id: "prompt", label: "Skill (slash command)", color: "purple", desc: "A prompt template invoked with /command in Claude Code" },
  { id: "agent", label: "Agent", color: "orange", desc: "A persistent system prompt that defines an AI persona" },
];

const colorMap: Record<string, { active: string; ring: string; btn: string }> = {
  blue:   { active: "border-blue-500/40 bg-blue-500/10 text-blue-300",   ring: "ring-blue-500/30",   btn: "bg-blue-600 hover:bg-blue-500" },
  purple: { active: "border-purple-500/40 bg-purple-500/10 text-purple-300", ring: "ring-purple-500/30", btn: "bg-purple-600 hover:bg-purple-500" },
  orange: { active: "border-orange-500/40 bg-orange-500/10 text-orange-300", ring: "ring-orange-500/30", btn: "bg-orange-600 hover:bg-orange-500" },
};

export function SubmitForm({ defaultType, authorName: initialAuthorName = "", authorUrl: initialAuthorUrl = "" }: { defaultType?: SubmitType; authorName?: string; authorUrl?: string }) {
  const router = useRouter();
  const [type, setType] = useState<SubmitType>(defaultType ?? "server");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Server fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [npmPackage, setNpmPackage] = useState("");
  const [installCmd, setInstallCmd] = useState("");
  const [tags, setTags] = useState("");
  const [tools, setTools] = useState("");
  const [clients, setClients] = useState<string[]>(["claude-code"]);
  const [transport, setTransport] = useState("stdio");
  const [license, setLicense] = useState("MIT");
  const [authorName, setAuthorName] = useState(initialAuthorName);
  const [authorUrl, setAuthorUrl] = useState(initialAuthorUrl);
  const [repoFetching, setRepoFetching] = useState(false);

  // Skill/Agent fields
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [preview, setPreview] = useState(false);

  const color = TYPE_OPTIONS.find(t => t.id === type)!.color;
  const cm = colorMap[color];

  async function fetchFromGitHub() {
    if (!repoUrl) return;
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) { setFetchError("Not a valid GitHub URL"); return; }
    const [, owner, repo] = match;
    const filename = type === "agent" ? "AGENT.md" : "SKILL.md";
    setFetching(true);
    setFetchError("");
    for (const branch of ["main", "master"]) {
      try {
        const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`);
        if (res.ok) {
          const text = await res.text();
          setContent(text);
          setFetching(false);
          return;
        }
      } catch {}
    }
    setFetchError(`${filename} not found in repo`);
    setFetching(false);
  }

  async function fetchServerFromGitHub() {
    if (!repoUrl) return;
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) return;
    const [, owner, repoName] = match;
    setRepoFetching(true);
    try {
      // Fetch repo info + package.json in parallel
      const [repoRes, pkgRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${owner}/${repoName}`),
        (async () => {
          for (const branch of ["main", "master"]) {
            const r = await fetch(`https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/package.json`);
            if (r.ok) return r;
          }
          return null;
        })(),
      ]);

      if (repoRes.ok) {
        const repo = await repoRes.json();
        if (!name) setName(repo.name ?? "");
        if (!description) setDescription(repo.description ?? "");
        if (!license && repo.license?.spdx_id) setLicense(repo.license.spdx_id);
        if (!tags && repo.topics?.length) setTags((repo.topics as string[]).slice(0, 5).join(", "));
      }

      if (pkgRes && pkgRes.ok) {
        const pkg = await pkgRes.json();
        if (!npmPackage && pkg.name) {
          setNpmPackage(pkg.name);
          if (!installCmd) setInstallCmd(`npx -y ${pkg.name}`);
        }
        if (!name && pkg.name) setName(pkg.name);
        if (!description && pkg.description) setDescription(pkg.description);
      }
    } catch {}
    setRepoFetching(false);
  }

  function toggleClient(c: string) {
    setClients(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (type === "server") {
        const tagsArr = tags.split(",").map(t => t.trim()).filter(Boolean);
        const toolsArr = tools.split(",").map(t => t.trim()).filter(Boolean);

        const res = await fetch("/api/servers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name, description, repoUrl, npmPackage: npmPackage || undefined,
            installCmd: installCmd || undefined, tags: tagsArr,
            tools: toolsArr.length ? toolsArr : ["general"],
            clients, transport, license,
            authorName, authorUrl: authorUrl || undefined,
            category: "community",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error submitting");
        router.push(`/server/${data.server.slug}`);
      } else {
        const tagsArr = tags.split(",").map(t => t.trim()).filter(Boolean);
        const computedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        const res = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: computedSlug, name, description, type,
            content, tags: tagsArr,
            repoUrl: repoUrl || undefined, published,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Error submitting");
        const base = type === "agent" ? "/agents" : "/skills";
        router.push(`${base}/${data.slug}`);
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Type selector */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TYPE_OPTIONS.map(opt => {
            const cm2 = colorMap[opt.color];
            const active = type === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setType(opt.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  active ? cm2.active + " border" : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600"
                }`}
              >
                <p className="font-medium text-sm mb-1">{opt.label}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{opt.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Common fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Name *</label>
          <input
            value={name} onChange={e => setName(e.target.value)} required
            placeholder={type === "server" ? "GitHub MCP Server" : type === "prompt" ? "Review PR" : "Senior Engineer"}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Description *</label>
          <input
            value={description} onChange={e => setDescription(e.target.value)} required
            placeholder="Short description (shown in cards)"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
        </div>

        {type !== "server" && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
              Slug (command name)
            </label>
            <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg overflow-hidden">
              <span className="pl-3 text-gray-600 text-sm">/</span>
              <input
                value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder={name ? name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : "review-pr"}
                className="flex-1 bg-transparent px-2 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none"
              />
            </div>
            <p className="text-xs text-gray-600 mt-1">Auto-generated from name if empty</p>
          </div>
        )}

        <div className={type !== "server" ? "" : "sm:col-span-2"}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
            Tags <span className="text-gray-600 font-normal">(comma separated)</span>
          </label>
          <input
            value={tags} onChange={e => setTags(e.target.value)}
            placeholder={type === "server" ? "github, git, api" : type === "prompt" ? "code-review, git, testing" : "engineering, architecture"}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
            {type === "server" ? "Repository URL *" : "Repository URL"}
          </label>
          <div className="flex gap-2">
            <input
              value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
              required={type === "server"} type="url"
              placeholder="https://github.com/username/repo"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
            />
            {type === "server" ? (
              <button
                type="button"
                onClick={fetchServerFromGitHub}
                disabled={!repoUrl || repoFetching}
                className="shrink-0 px-4 py-2.5 text-sm border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-40"
              >
                {repoFetching ? "Fetching..." : "Auto-fill"}
              </button>
            ) : (
              <button
                type="button"
                onClick={fetchFromGitHub}
                disabled={!repoUrl || fetching}
                className="shrink-0 px-4 py-2.5 text-sm border border-gray-700 rounded-lg text-gray-300 hover:text-white hover:border-gray-500 transition-colors disabled:opacity-40"
              >
                {fetching ? "Fetching..." : `Fetch ${type === "agent" ? "AGENT" : "SKILL"}.md`}
              </button>
            )}
          </div>
          {fetchError && <p className="text-xs text-red-400 mt-1">{fetchError}</p>}
        </div>
      </div>

      {/* Server-specific fields */}
      {type === "server" && (
        <div className="space-y-4 border border-gray-800 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Server details</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">npm Package</label>
              <input
                value={npmPackage}
                onChange={e => {
                  const pkg = e.target.value;
                  setNpmPackage(pkg);
                  if (pkg && !installCmd) setInstallCmd(`npx -y ${pkg}`);
                }}
                onBlur={e => {
                  const pkg = e.target.value;
                  if (pkg && !installCmd) setInstallCmd(`npx -y ${pkg}`);
                }}
                placeholder="@modelcontextprotocol/server-github"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Install command
                {npmPackage && !installCmd && <span className="ml-1 text-gray-600">(auto-generated from npm package)</span>}
              </label>
              <input
                value={installCmd} onChange={e => setInstallCmd(e.target.value)}
                placeholder={npmPackage ? `npx -y ${npmPackage}` : "npx -y @modelcontextprotocol/server-github"}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">
                Tools exposed <span className="text-gray-600">(comma separated)</span> *
              </label>
              <input
                value={tools} onChange={e => setTools(e.target.value)} required
                placeholder="create_file, read_file, list_directory"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Author name *</label>
              <input
                value={authorName} onChange={e => setAuthorName(e.target.value)} required
                placeholder="Your name or GitHub handle"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-gray-500 mb-1.5">Author URL</label>
              <input
                value={authorUrl} onChange={e => setAuthorUrl(e.target.value)} type="url"
                placeholder="https://github.com/username"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-2">Supported clients *</label>
            <div className="flex flex-wrap gap-2">
              {["claude-code", "cursor", "continue"].map(c => (
                <button
                  key={c} type="button" onClick={() => toggleClient(c)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                    clients.includes(c) ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "border-gray-700 text-gray-500 hover:border-gray-500"
                  }`}
                >
                  {c === "claude-code" ? "Claude Code" : c === "cursor" ? "Cursor" : "Continue"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Transport</label>
              <select value={transport} onChange={e => setTransport(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gray-500">
                <option value="stdio">stdio</option>
                <option value="sse">SSE</option>
                <option value="http">HTTP</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">License</label>
              <select value={license} onChange={e => setLicense(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gray-500">
                <option>MIT</option>
                <option>Apache-2.0</option>
                <option>GPL-3.0</option>
                <option>BSD-3-Clause</option>
                <option>ISC</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Skill/Agent content */}
      {type !== "server" && (
        <div>
          {/* Templates */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-2">Start from a template:</p>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES[type]?.map(tpl => (
                <button
                  key={tpl.label}
                  type="button"
                  onClick={() => { setContent(tpl.content); setPreview(false); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Write / Preview tabs */}
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-3 py-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                {type === "agent" ? "AGENT.md" : "SKILL.md"} *
              </label>
              <div className="flex rounded-md overflow-hidden border border-gray-700 text-xs">
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className={`px-3 py-1 transition-colors ${!preview ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setPreview(true)}
                  className={`px-3 py-1 transition-colors ${preview ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Preview
                </button>
              </div>
            </div>

            {preview ? (
              <div className="bg-gray-900 px-4 py-4 min-h-[280px]">
                {content ? (
                  <MarkdownContent content={content} />
                ) : (
                  <p className="text-gray-600 text-sm italic">Nothing to preview yet.</p>
                )}
              </div>
            ) : (
              <textarea
                value={content} onChange={e => setContent(e.target.value)} required
                rows={14}
                placeholder={type === "agent"
                  ? "You are a senior software engineer...\n\n## Principles\n- Write clean, maintainable code\n..."
                  : "Review the current code changes.\n\n## What to check\n\n- Correctness\n- Security\n- Performance\n..."
                }
                className="w-full bg-gray-950 px-3 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none font-mono leading-relaxed resize-y"
              />
            )}
          </div>
        </div>
      )}

      {/* Publish toggle — only for skills/agents */}
      {type !== "server" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-start gap-4">
            <button
              type="button"
              onClick={() => setPublished(p => !p)}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors mt-0.5 ${
                published ? "bg-green-600" : "bg-gray-700"
              }`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${published ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-white">
                {published ? "Publish to registry" : "Keep in private library"}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {published
                  ? "Will be visible to everyone in the public registry. Pending admin review before featuring."
                  : "Only you can see this. Useful as a personal prompt repository. You can publish later."
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit" disabled={loading}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-50 ${cm.btn}`}
        >
          {loading ? "Submitting..." : type === "server" ? "Submit server" : published ? "Publish" : "Save to library"}
        </button>
        <a href="/" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Cancel</a>
      </div>
    </form>
  );
}
