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
    title: `${skill.name} Agent — MCPHub`,
    description: skill.description,
  };
}

export default async function AgentPage({ params }: { params: { slug: string } }) {
  const skill = await getSkill(params.slug);
  if (!skill || skill.type !== "agent") notFound();

  const session = await auth();
  const tags = parseTags(skill);
  const installCmd = `mcp install-skill ${skill.slug}`;
  const runCmd = `claude --agent ${skill.slug} "your task here"`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <a href="/agents" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8">
        ← All agents
      </a>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full border bg-orange-500/10 border-orange-500/20 text-orange-400 font-medium">
                Agent
              </span>
              {skill.verified && (
                <span className="text-xs text-orange-400 border border-orange-500/20 bg-orange-500/10 px-2.5 py-1 rounded-full">✓ Verified</span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
            <p className="text-gray-400 text-lg">{skill.description}</p>
          </div>

          {/* What is an agent / what happens when you install */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">What happens when you install it</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Install the agent</p>
                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400">{installCmd}</code>
                  <p className="text-xs text-gray-500 mt-1">Downloads the system prompt and saves it locally.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">Saved as an agent definition</p>
                  <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono text-gray-300">~/.claude/agents/{skill.slug}.md</code>
                  <p className="text-xs text-gray-500 mt-1">
                    This file contains the system prompt that defines how this agent thinks and behaves.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <p className="text-sm text-white font-medium mb-2">Run it for any task</p>
                  <code className="text-xs bg-gray-800 px-2 py-1.5 rounded text-orange-400 font-mono block">{runCmd}</code>
                  <p className="text-xs text-gray-500 mt-2">
                    The agent maintains its persona and principles throughout the entire session — every response comes from the perspective of {skill.name}.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Agent vs Skill clarifier */}
          <section className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-4">
            <p className="text-sm font-medium text-white mb-2">Agent vs Skill — what's the difference?</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-400">
              <div>
                <p className="text-purple-400 font-medium mb-1">Skill (prompt)</p>
                <p>One-off task. You call it, it runs, done. Great for repetitive actions like reviewing a PR or writing tests.</p>
              </div>
              <div>
                <p className="text-orange-400 font-medium mb-1">Agent</p>
                <p>Persistent persona. Every message is answered through this agent's expertise and principles. Great for extended sessions.</p>
              </div>
            </div>
          </section>

          {/* System prompt */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">System prompt</h2>
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
              <p>Then run with:</p>
              <code className="block bg-gray-800 px-2 py-1.5 rounded text-orange-400 font-mono text-xs break-all">{runCmd}</code>
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
                  <a key={t} href={`/agents?tag=${t}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors">
                    #{t}
                  </a>
                ))}
              </div>
            </div>
          )}

          <a href="/skills"
            className="block bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 hover:bg-purple-500/10 transition-colors">
            <p className="text-sm font-medium text-white mb-1">Looking for Slash commands?</p>
            <p className="text-xs text-gray-500">Skills are one-off prompts you invoke with <code className="bg-gray-800 px-1 rounded">/command</code>.</p>
            <p className="text-xs text-purple-400 mt-2">Browse skills →</p>
          </a>

          {session?.user && (
            <a href="/teams"
              className="block bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 hover:bg-blue-500/10 transition-colors">
              <p className="text-sm font-medium text-white mb-1">Share with your team</p>
              <p className="text-xs text-gray-500">Add this agent to your team so everyone gets it on <code className="bg-gray-800 px-1 rounded">mcp sync</code>.</p>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
