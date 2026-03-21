import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSkill, parseTags } from "@/lib/skills-db";
import { CopyButton } from "@/components/CopyButton";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const skill = await getSkill(params.slug);
  if (!skill) return {};
  return {
    title: `${skill.name} — MCPHub Skills`,
    description: skill.description,
  };
}

export default async function SkillPage({ params }: { params: { slug: string } }) {
  const skill = await getSkill(params.slug);
  if (!skill) notFound();

  const session = await auth();
  const tags = parseTags(skill);
  const installCmd = `mcp install-skill ${skill.slug}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <a href="/skills" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8">
        ← All skills
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                skill.type === "agent"
                  ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}>
                {skill.type === "agent" ? "Agent" : "Prompt"}
              </span>
              {skill.verified && (
                <span className="text-xs text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 rounded-full">
                  ✓ Verified
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
            <p className="text-gray-400 text-lg">{skill.description}</p>
          </div>

          {/* What it does */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              {skill.type === "agent" ? "System Prompt" : "Prompt Content"}
            </h2>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <pre className="text-sm text-gray-300 font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {skill.content}
              </pre>
            </div>
          </section>

          {/* How it works */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-3">
              {skill.type === "agent" ? "How agents work" : "How prompts work"}
            </h3>
            {skill.type === "prompt" ? (
              <ol className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-3"><span className="text-purple-400 font-mono shrink-0">1.</span> Run <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-green-400">{installCmd}</code></li>
                <li className="flex gap-3"><span className="text-purple-400 font-mono shrink-0">2.</span> The prompt is saved to <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">~/.claude/commands/{skill.slug}.md</code></li>
                <li className="flex gap-3"><span className="text-purple-400 font-mono shrink-0">3.</span> Restart Claude Code — use it as <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-purple-400">/{skill.slug}</code></li>
              </ol>
            ) : (
              <ol className="space-y-2 text-sm text-gray-400">
                <li className="flex gap-3"><span className="text-orange-400 font-mono shrink-0">1.</span> Run <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-green-400">{installCmd}</code></li>
                <li className="flex gap-3"><span className="text-orange-400 font-mono shrink-0">2.</span> The system prompt is saved and configured as an agent</li>
                <li className="flex gap-3"><span className="text-orange-400 font-mono shrink-0">3.</span> Run it with <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono text-orange-400">claude --agent {skill.slug}</code></li>
              </ol>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Install */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Install</h3>
            <div className="flex items-center justify-between gap-2 bg-gray-950 rounded-lg px-3 py-2">
              <span className="font-mono text-xs text-green-400 truncate">{installCmd}</span>
              <CopyButton text={installCmd} />
            </div>
            <p className="text-xs text-gray-600">
              Requires <a href="/install-cli" className="text-blue-400/70 hover:text-blue-400">MCPHub CLI</a>
            </p>
            {skill.installCount > 0 && (
              <p className="text-xs text-gray-500">↓ {skill.installCount.toLocaleString()} installs</p>
            )}
          </div>

          {/* Author */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Author</h3>
            <div className="flex items-center gap-2.5">
              {skill.authorUrl?.includes("github.com") && (
                <img
                  src={`https://github.com/${skill.authorUrl.split("github.com/")[1]}.png?size=32`}
                  alt=""
                  className="w-7 h-7 rounded-full bg-gray-800"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              )}
              <div>
                <p className="text-sm text-gray-300">{skill.authorName}</p>
                {skill.authorUrl && (
                  <a href={skill.authorUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                    {skill.authorUrl.replace("https://", "")}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <a
                    key={t}
                    href={`/skills?tag=${t}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors"
                  >
                    #{t}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Add to team */}
          {session?.user && (
            <a
              href="/teams"
              className="block bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 hover:bg-blue-500/10 transition-colors"
            >
              <p className="text-sm font-medium text-white mb-1">Add to your team</p>
              <p className="text-xs text-gray-500">
                Share this skill with your team via <span className="font-mono">mcp sync</span>.
              </p>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
