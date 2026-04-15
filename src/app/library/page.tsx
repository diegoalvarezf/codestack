import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n";
import { ServerCard } from "@/components/ServerCard";
import { SkillCard } from "@/components/SkillCard";
import { AgentCard } from "@/components/AgentCard";
import { LibraryActions } from "./LibraryActions";
import { AddToStack } from "./AddToStack";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Library — Codestack",
};

function parseServer(s: any) {
  return { ...s, tags: JSON.parse(s.tags), tools: JSON.parse(s.tools), clients: JSON.parse(s.clients) };
}

export default async function LibraryPage() {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  if (!session) redirect("/auth/signin?callbackUrl=/library");

  const lang = cookieStore.get("lang")?.value ?? "en";
  const t = getT(lang);

  const login = session.user.githubLogin;
  if (!login) redirect("/auth/signin");

  const [rawServers, skills, myStacks] = await Promise.all([
    prisma.server.findMany({
      where: { createdBy: login },
      orderBy: { createdAt: "desc" },
    }),
    prisma.skill.findMany({
      where: { createdBy: login },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userStack.findMany({
      where: { createdBy: login },
      select: { slug: true, name: true, icon: true, items: { select: { itemSlug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const servers = rawServers.map(parseServer);
  const prompts = skills.filter(s => s.type === "prompt");
  const agents = skills.filter(s => s.type === "agent");

  const total = servers.length + skills.length;
  const publicCount = servers.length + skills.filter(s => s.published).length;
  const privateCount = skills.filter(s => !s.published).length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">{t.libraryTitle}</h1>
          <p className="text-gray-400 text-sm">
            {t.libraryDesc}
          </p>
        </div>
        <a
          href="/submit"
          className="shrink-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-white transition-colors"
        >
          {t.addNew}
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-gray-500 mt-1">{t.totalItems}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{publicCount}</p>
          <p className="text-xs text-gray-500 mt-1">{t.published}</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{privateCount}</p>
          <p className="text-xs text-gray-500 mt-1">{t.private}</p>
        </div>
      </div>

      {total === 0 && (
        <div className="text-center py-24 text-gray-500">
          <p className="text-lg mb-2">{t.libraryEmpty}</p>
          <p className="text-sm mb-6">{t.libraryEmptyDesc}</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/submit" className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 hover:bg-blue-600/30 transition-colors">
              {t.submitMcpServer}
            </a>
            <a href="/submit?type=prompt" className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-sm text-purple-300 hover:bg-purple-600/30 transition-colors">
              {t.newSkill}
            </a>
            <a href="/submit?type=agent" className="px-4 py-2 bg-orange-600/20 border border-orange-500/30 rounded-lg text-sm text-orange-300 hover:bg-orange-600/30 transition-colors">
              {t.newAgent}
            </a>
          </div>
        </div>
      )}

      {/* MCP Servers */}
      {servers.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {t.sectionMcps} ({servers.length})
            </h2>
            <a href="/submit" className="text-xs text-blue-400 hover:underline">{t.newServer}</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {servers.map(s => (
              <div key={s.id} className="relative group">
                <ServerCard server={s} />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AddToStack itemSlug={s.slug} type="server" stacks={myStacks} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {prompts.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {t.sectionSkills} ({prompts.length})
            </h2>
            <a href="/submit?type=prompt" className="text-xs text-purple-400 hover:underline">{t.newSkill}</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {prompts.map(s => (
              <div key={s.id} className="relative group">
                <SkillCard skill={s as any} />
                <LibraryActions slug={s.slug} type="skill" published={s.published} />
                <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AddToStack itemSlug={s.slug} type="skill" stacks={myStacks} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Agents */}
      {agents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              {t.sectionAgents} ({agents.length})
            </h2>
            <a href="/submit?type=agent" className="text-xs text-orange-400 hover:underline">{t.newAgent}</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {agents.map(s => (
              <div key={s.id} className="relative group">
                <AgentCard skill={s as any} />
                <LibraryActions slug={s.slug} type="agent" published={s.published} />
                <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AddToStack itemSlug={s.slug} type="agent" stacks={myStacks} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
