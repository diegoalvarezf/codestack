import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSkill, parseTags } from "@/lib/skills-db";
import { CopyButton } from "@/components/CopyButton";
import { AvatarImg } from "@/components/AvatarImg";
import { MarkdownContent } from "@/components/MarkdownContent";
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
  if (!skill || skill.type !== "prompt") notFound();

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
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full border bg-purple-500/10 border-purple-500/20 text-purple-400 font-medium">
                Prompt · Slash command
              </span>
              {skill.verified && (
                <span className="text-xs text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 rounded-full">✓ Verified</span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
            <p className="text-gray-400 text-lg">{skill.description}</p>
          </div>

          {/* What happens when you install it */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">What happens when you install it</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">You run the install command</p>
                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400">{installCmd}</code>
                  <p className="text-xs text-gray-500 mt-1">MCPHub CLI downloads this prompt from the registry.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Saved as a file in Claude Code</p>
                  <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono text-gray-300">~/.claude/commands/{skill.slug}.md</code>
                  <p className="text-xs text-gray-500 mt-1">Claude Code reads all <code className="bg-gray-800 px-1 rounded">.md</code> files in this folder as slash commands.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Use it in any conversation</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-800 px-2 py-1 rounded text-purple-400 font-mono">/{skill.slug}</code>
                    <span className="text-xs text-gray-500">in Claude Code (after restart)</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Claude runs the prompt against your current file or selection — no copy-paste needed.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Prompt content */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Prompt content</h2>
              <CopyButton text={skill.content} />
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <MarkdownContent content={skill.content} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Install */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Install</h3>
            <div className="flex items-center justify-between gap-2 bg-gray-950 rounded-lg px-3 py-2.5">
              <span className="font-mono text-xs text-green-400 truncate">{installCmd}</span>
              <CopyButton text={installCmd} />
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>After install, restart Claude Code and type:</p>
              <code className="block bg-gray-800 px-2 py-1.5 rounded text-purple-400 font-mono text-sm">/{skill.slug}</code>
            </div>
            <p className="text-xs text-gray-600">
              Requires <a href="/install-cli" className="text-blue-400/70 hover:text-blue-400">MCPHub CLI</a>
            </p>
            {skill.installCount > 0 && (
              <p className="text-xs text-gray-500 border-t border-gray-800 pt-2">↓ {skill.installCount.toLocaleString()} installs</p>
            )}
          </div>

          {/* Author */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Author</h3>
            <div className="flex items-center gap-2.5">
              {skill.authorUrl?.includes("github.com") && (
                <AvatarImg
                  src={`https://github.com/${skill.authorUrl.split("github.com/")[1]}.png?size=32`}
                  alt=""
                  className="w-7 h-7 rounded-full bg-gray-800"
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
                  <a key={t} href={`/skills?tag=${t}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors">
                    #{t}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Also see agents */}
          <a href="/agents"
            className="block bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 hover:bg-orange-500/10 transition-colors">
            <p className="text-sm font-medium text-white mb-1">Looking for Agents?</p>
            <p className="text-xs text-gray-500">
              Agents run with a full system prompt and persistent behavior — not just a one-off command.
            </p>
            <p className="text-xs text-orange-400 mt-2">Browse agents →</p>
          </a>

          {session?.user && (
            <a href="/teams"
              className="block bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 hover:bg-blue-500/10 transition-colors">
              <p className="text-sm font-medium text-white mb-1">Share with your team</p>
              <p className="text-xs text-gray-500">Add this skill to your team so everyone gets it on <code className="bg-gray-800 px-1 rounded">mcp sync</code>.</p>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
