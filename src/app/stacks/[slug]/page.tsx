import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStack, STACKS } from "@/lib/stacks";
import { getServersBySlugs } from "@/lib/servers";
import { prisma } from "@/lib/db";
import { ServerCard } from "@/components/ServerCard";
import { SkillCard } from "@/components/SkillCard";
import { AgentCard } from "@/components/AgentCard";
import { CopyButton } from "@/components/CopyButton";
import type { Skill } from "@prisma/client";

export function generateStaticParams() {
  return STACKS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const curated = getStack(params.slug);
  if (curated) return { title: `${curated.name} Stack — MCPHub`, description: curated.description };
  const user = await prisma.userStack.findUnique({ where: { slug: params.slug } });
  if (!user) return {};
  return { title: `${user.name} Stack — MCPHub`, description: user.description ?? undefined };
}

export const dynamic = "force-dynamic";

export default async function StackPage({ params }: { params: { slug: string } }) {
  const curated = getStack(params.slug);

  // Resolve server/skill slugs from either source
  let serverSlugs: string[] = [];
  let skillSlugs: string[] = [];
  let agentSlugs: string[] = [];
  let stackName = "";
  let stackDescription = "";
  let stackIcon = "📦";
  let createdBy: string | null = null;

  if (curated) {
    serverSlugs = curated.servers;
    skillSlugs = curated.skills;
    agentSlugs = curated.agents;
    stackName = curated.name;
    stackDescription = curated.description;
    stackIcon = curated.icon;
  } else {
    const userStack = await prisma.userStack.findUnique({
      where: { slug: params.slug },
      include: { items: true },
    });
    if (!userStack) notFound();
    serverSlugs = userStack.items.filter(i => i.type === "server").map(i => i.itemSlug);
    skillSlugs = userStack.items.filter(i => i.type === "skill").map(i => i.itemSlug);
    agentSlugs = userStack.items.filter(i => i.type === "agent").map(i => i.itemSlug);
    stackName = userStack.name;
    stackDescription = userStack.description ?? "";
    stackIcon = userStack.icon;
    createdBy = userStack.createdBy;
  }

  const allSkillSlugs = [...skillSlugs, ...agentSlugs];

  const [servers, skills] = await Promise.all([
    serverSlugs.length > 0 ? getServersBySlugs(serverSlugs) : Promise.resolve([]),
    allSkillSlugs.length > 0
      ? prisma.skill.findMany({ where: { slug: { in: allSkillSlugs } } })
      : Promise.resolve([] as Skill[]),
  ]);

  const orderedServers = serverSlugs.map(slug => servers.find(s => s.slug === slug)).filter(Boolean) as typeof servers;
  const orderedSkills = skillSlugs.map(slug => skills.find(s => s.slug === slug)).filter(Boolean) as Skill[];
  const orderedAgents = agentSlugs.map(slug => skills.find(s => s.slug === slug)).filter(Boolean) as Skill[];

  const totalItems = orderedServers.length + orderedSkills.length + orderedAgents.length;

  const serverCmds = orderedServers.map(s => `mcp install ${s.slug}`).join(" && ");
  const skillCmds = orderedSkills.map(s => `mcp install-skill ${s.slug}`).join(" && ");
  const agentCmds = orderedAgents.map(s => `mcp install-skill ${s.slug}`).join(" && ");
  const allCmds = [serverCmds, skillCmds, agentCmds].filter(Boolean).join(" && ");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <a href="/stacks" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8">
        ← All stacks
      </a>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{stackIcon}</span>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold">{stackName}</h1>
            {createdBy && <p className="text-sm text-gray-500 mt-0.5">by {createdBy}</p>}
          </div>
        </div>
        {stackDescription && (
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl">{stackDescription}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {orderedServers.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
              {orderedServers.length} MCP server{orderedServers.length !== 1 ? "s" : ""}
            </span>
          )}
          {orderedSkills.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400">
              {orderedSkills.length} skill{orderedSkills.length !== 1 ? "s" : ""}
            </span>
          )}
          {orderedAgents.length > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400">
              {orderedAgents.length} agent{orderedAgents.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {allCmds && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Install entire stack</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-3">
              Installs all {totalItems} items with the MCPHub CLI.
            </p>
            <div className="flex items-start justify-between gap-4">
              <pre className="font-mono text-sm text-green-400 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
                <span className="text-gray-500">$ </span>{allCmds.replace(/ && /g, " &&\n  ")}
              </pre>
              <CopyButton text={allCmds} />
            </div>
            <p className="text-xs text-gray-600 mt-3">
              Requires <a href="/install-cli" className="text-blue-400/70 hover:text-blue-400">MCPHub CLI</a>
              {" "}· <span className="font-mono">npm install -g @mcphub/cli</span>
            </p>
          </div>
        </section>
      )}

      {orderedServers.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            <span className="text-blue-400">⬡</span> MCP Servers ({orderedServers.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {orderedServers.map(server => <ServerCard key={server.id} server={server} />)}
          </div>
        </section>
      )}

      {orderedSkills.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            <span className="text-purple-400">◈</span> Skills ({orderedSkills.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {orderedSkills.map(skill => <SkillCard key={skill.id} skill={skill} />)}
          </div>
        </section>
      )}

      {orderedAgents.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            <span className="text-orange-400">◎</span> Agents ({orderedAgents.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {orderedAgents.map(skill => <AgentCard key={skill.id} skill={skill} />)}
          </div>
        </section>
      )}

      {totalItems === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p>No items found yet for this stack.</p>
          <a href="/submit" className="text-blue-400 hover:underline mt-2 inline-block">Submit an item →</a>
        </div>
      )}

      <div className="mt-4 bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white mb-1">Share this stack with your team</h3>
          <p className="text-sm text-gray-400">Create a team, add these items, and share one sync command.</p>
        </div>
        <a href="/teams/new"
          className="shrink-0 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          Create team →
        </a>
      </div>
    </div>
  );
}
