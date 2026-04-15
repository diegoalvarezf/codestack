import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getStack, STACKS } from "@/lib/stacks";
import { getServersBySlugs } from "@/lib/servers";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { CopyButton } from "@/components/CopyButton";
import { StackActions } from "./StackActions";
import type { Skill } from "@prisma/client";
import type { McpServer } from "@/lib/types";

export function generateStaticParams() {
  return STACKS.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const curated = getStack(params.slug);
  if (curated) return { title: `${curated.name} Stack — Codestack`, description: curated.description };
  const user = await prisma.userStack.findUnique({ where: { slug: params.slug } });
  if (!user) return {};
  return { title: `${user.name} Stack — Codestack`, description: user.description ?? undefined };
}

export const dynamic = "force-dynamic";

function ServerRow({ server }: { server: McpServer }) {
  return (
    <a href={`/server/${server.slug}`}
      className="flex items-start gap-3 px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all group">
      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded border text-gray-500 border-gray-700 bg-gray-800 shrink-0 mt-0.5">MCP</span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{server.name}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{server.description}</p>
      </div>
      <span className="text-xs text-gray-600 font-mono shrink-0 ml-auto mt-0.5">{server.authorName}</span>
    </a>
  );
}

function SkillRow({ skill }: { skill: Skill }) {
  const isAgent = skill.type === "agent";
  return (
    <a href={`/skills/${skill.slug}`}
      className="flex items-start gap-3 px-4 py-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all group">
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${
        isAgent ? "text-gray-500 border-gray-700 bg-gray-800" : "text-gray-500 border-gray-700 bg-gray-800"
      }`}>
        {isAgent ? "Agent" : "Skill"}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{skill.name}</p>
        <p className="text-xs text-gray-500 truncate mt-0.5">{skill.description}</p>
      </div>
      <span className="text-xs text-gray-600 font-mono shrink-0 ml-auto mt-0.5">{skill.authorName}</span>
    </a>
  );
}

export default async function StackPage({ params }: { params: { slug: string } }) {
  const [curated, cookieStore, session] = [getStack(params.slug), await cookies(), await auth()];
  const lang = cookieStore.get("lang")?.value ?? "en";
  const t = getT(lang);

  let serverSlugs: string[] = [];
  let skillSlugs: string[] = [];
  let agentSlugs: string[] = [];
  let stackName = "";
  let stackDescription = "";
  let stackIcon = "📦";
  let createdBy: string | null = null;
  let isCurated = false;
  let stackSlug = params.slug;

  if (curated) {
    serverSlugs = curated.servers;
    skillSlugs = curated.skills;
    agentSlugs = curated.agents;
    stackName = curated.name;
    stackDescription = curated.description;
    stackIcon = curated.icon;
    isCurated = true;
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
    stackSlug = userStack.slug;
  }

  const isOwner = !isCurated && !!session && (
    session.user.githubLogin === createdBy || session.user.role === "admin"
  );

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
  const installCmd = `mcp install-stack ${stackSlug}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <a href="/stacks" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8">
        {t.allStacksBack}
      </a>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-start gap-4 min-w-0">
          <span className="text-3xl shrink-0 mt-0.5">{stackIcon}</span>
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold">{stackName}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {createdBy && (
                <span className="text-sm text-gray-500">{t.by} {createdBy}</span>
              )}
              {isCurated && (
                <span className="text-xs px-2 py-0.5 rounded-full border border-gray-700 bg-gray-800 text-gray-500">Curated</span>
              )}
              <div className="flex items-center gap-2">
                {orderedServers.length > 0 && (
                  <span className="text-xs text-gray-600">{orderedServers.length} {t.servers}</span>
                )}
                {orderedSkills.length > 0 && (
                  <span className="text-xs text-gray-600">{orderedSkills.length} {t.skills_label}</span>
                )}
                {orderedAgents.length > 0 && (
                  <span className="text-xs text-gray-600">{orderedAgents.length} {t.agents_label}</span>
                )}
              </div>
            </div>
            {stackDescription && (
              <p className="text-gray-400 text-sm sm:text-base mt-2 max-w-xl">{stackDescription}</p>
            )}
          </div>
        </div>

        {isOwner && <StackActions slug={stackSlug} />}
      </div>

      {/* Install command */}
      {totalItems > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-10">
          <div className="flex items-center justify-between gap-4 bg-gray-950 rounded-lg px-4 py-3 mb-2">
            <span className="font-mono text-sm text-green-400">{installCmd}</span>
            <CopyButton text={installCmd} />
          </div>
          <p className="text-xs text-gray-600">
            Installs all {totalItems} items · Requires{" "}
            <span className="font-mono">npm install -g @diegoalvarezf/codestack</span>
          </p>
        </div>
      )}

      {/* Items */}
      {totalItems === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p>{t.noItemsStack}</p>
          {isOwner && (
            <a href={`/stacks/${stackSlug}/edit`} className="text-blue-400 hover:underline mt-2 inline-block">Add items →</a>
          )}
        </div>
      )}

      {orderedServers.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            MCP Servers
          </h2>
          <div className="space-y-2">
            {orderedServers.map(server => <ServerRow key={server.id} server={server} />)}
          </div>
        </section>
      )}

      {orderedSkills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Skills
          </h2>
          <div className="space-y-2">
            {orderedSkills.map(skill => <SkillRow key={skill.id} skill={skill} />)}
          </div>
        </section>
      )}

      {orderedAgents.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            Agents
          </h2>
          <div className="space-y-2">
            {orderedAgents.map(skill => <SkillRow key={skill.id} skill={skill} />)}
          </div>
        </section>
      )}

      {/* Share */}
      {totalItems > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
          <div>
            <h3 className="font-semibold text-white mb-1">{t.shareStackTitle}</h3>
            <p className="text-sm text-gray-400">{t.shareStackDesc}</p>
          </div>
          <CopyButton text={`https://codestack.dev/stacks/${stackSlug}`} />
        </div>
      )}
    </div>
  );
}
