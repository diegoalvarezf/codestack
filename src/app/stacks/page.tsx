import type { Metadata } from "next";
import { cookies } from "next/headers";
import { STACKS } from "@/lib/stacks";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import { ExploreSection } from "./ExploreSection";

export const metadata: Metadata = {
  title: "Stacks — MCPHub",
  description: "Curated and community-created collections of MCP servers, skills, and agents.",
};

export const dynamic = "force-dynamic";

const TYPE_COLOR: Record<string, string> = {
  server: "bg-blue-500/20 text-blue-400",
  skill:  "bg-purple-500/20 text-purple-400",
  agent:  "bg-orange-500/20 text-orange-400",
};

export default async function StacksPage() {
  const lang = (await cookies()).get("lang")?.value ?? "en";
  const t = getT(lang);

  const session = await auth();
  const githubLogin = session?.user?.githubLogin;

  const [myStacks, communityStacks] = await Promise.all([
    githubLogin
      ? prisma.userStack.findMany({
          where: { createdBy: githubLogin },
          include: { items: { orderBy: { order: "asc" } } },
          orderBy: { createdAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.userStack.findMany({
      where: { public: true, ...(githubLogin ? { createdBy: { not: githubLogin } } : {}) },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 sm:mb-12 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-sm px-3 py-1 rounded-full mb-5 border border-blue-500/20">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            Stacks
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t.stacksTitle}</h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl">{t.stacksDesc}</p>
        </div>
        {session && (
          <a href="/stacks/new"
            className="shrink-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-white transition-colors mt-1">
            {t.createStack}
          </a>
        )}
      </div>

      {/* My stacks */}
      {myStacks.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{t.myStacks}</h2>
            <a href="/library" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Library</a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myStacks.map((stack) => {
              const servers = stack.items.filter(i => i.type === "server");
              const skills  = stack.items.filter(i => i.type === "skill");
              const agents  = stack.items.filter(i => i.type === "agent");
              const total   = stack.items.length;
              return (
                <a key={stack.slug} href={`/stacks/${stack.slug}`}
                  className="group block rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 transition-all hover:-translate-y-0.5 p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-12 h-12 rounded-xl border border-gray-700 bg-gray-800 text-2xl shrink-0">
                        {stack.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{stack.name}</h2>
                          {!stack.public && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-gray-700 text-gray-600">Private</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{total} item{total !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                    <a href={`/stacks/${stack.slug}/edit`}
                      onClick={(e) => e.stopPropagation()}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-gray-600 hover:text-gray-400 px-2 py-1 rounded border border-gray-800 hover:border-gray-600">
                      Edit
                    </a>
                  </div>

                  {stack.description && (
                    <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-2">{stack.description}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {servers.length > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR.server}`}>
                        {servers.length} MCP{servers.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {skills.length > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR.skill}`}>
                        {skills.length} Skill{skills.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {agents.length > 0 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_COLOR.agent}`}>
                        {agents.length} Agent{agents.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {total === 0 && (
                      <span className="text-xs text-gray-600">Empty — add items from Library</span>
                    )}
                  </div>
                </a>
              );
            })}

            {/* New stack card */}
            <a href="/stacks/new"
              className="group flex items-center justify-center rounded-xl border border-dashed border-gray-800 hover:border-gray-600 hover:bg-gray-900 transition-all p-5 min-h-[140px]">
              <div className="text-center">
                <span className="text-2xl block mb-2 text-gray-700">+</span>
                <p className="text-sm text-gray-600 group-hover:text-gray-400 transition-colors">{t.createStack}</p>
              </div>
            </a>
          </div>
        </section>
      )}

      {/* Empty state */}
      {myStacks.length === 0 && session && (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-8 text-center mb-10">
          <span className="text-3xl block mb-3">⬡</span>
          <h3 className="font-semibold text-white mb-1">No stacks yet</h3>
          <p className="text-sm text-gray-500 mb-4">Create a stack to group MCPs, skills and agents for a specific workflow.</p>
          <div className="flex items-center justify-center gap-3">
            <a href="/stacks/new" className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 hover:bg-blue-600/30 transition-colors">
              {t.createStack}
            </a>
            <a href="/library" className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
              Go to Library
            </a>
          </div>
        </div>
      )}

      {/* Explore — collapsed by default */}
      <ExploreSection
        curated={STACKS}
        community={communityStacks.map(s => ({
          slug: s.slug,
          name: s.name,
          description: s.description,
          icon: s.icon,
          createdBy: s.createdBy,
          items: s.items,
        }))}
        serversLabel={t.servers}
        skillsLabel={t.skills_label}
        agentsLabel={t.agents_label}
        byLabel={t.by}
      />

      {/* Sign in CTA */}
      {!session && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-white mb-2">{t.stacksCreateCta}</h3>
          <p className="text-sm text-gray-400 mb-4">{t.stacksCreateDesc}</p>
          <a href="/auth/signin?callbackUrl=/stacks/new"
            className="inline-flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {t.stacksSignIn}
          </a>
        </div>
      )}
    </div>
  );
}
