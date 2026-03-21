"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

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

export function SubmitForm({ defaultType }: { defaultType?: SubmitType }) {
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
  const [authorName, setAuthorName] = useState("");
  const [authorUrl, setAuthorUrl] = useState("");

  // Skill/Agent fields
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");

  const color = TYPE_OPTIONS.find(t => t.id === type)!.color;
  const cm = colorMap[color];

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
        router.push(`/servers/${data.server.slug}`);
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

        <div className={type === "server" ? "sm:col-span-2" : "sm:col-span-2"}>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
            {type === "server" ? "Repository URL *" : "Repository URL (optional)"}
          </label>
          <input
            value={repoUrl} onChange={e => setRepoUrl(e.target.value)}
            required={type === "server"} type="url"
            placeholder="https://github.com/username/repo"
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
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
                value={npmPackage} onChange={e => setNpmPackage(e.target.value)}
                placeholder="@modelcontextprotocol/server-github"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Install command</label>
              <input
                value={installCmd} onChange={e => setInstallCmd(e.target.value)}
                placeholder="npx -y @modelcontextprotocol/server-github"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">MCP Tools (comma separated) *</label>
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
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {type === "agent" ? "System prompt *" : "Prompt content *"}
            </label>
            <span className="text-xs text-gray-600">Markdown supported</span>
          </div>
          <textarea
            value={content} onChange={e => setContent(e.target.value)} required
            rows={14}
            placeholder={type === "agent"
              ? "You are a senior software engineer with 15 years of experience...\n\n## Your principles\n- Write clean, maintainable code\n- Always consider edge cases..."
              : "Review the following code and provide:\n\n1. **Summary** of what the code does\n2. **Issues** found (bugs, security, performance)\n3. **Suggestions** for improvement\n\n```\n$SELECTION\n```"
            }
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-gray-500 font-mono leading-relaxed resize-y"
          />
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
