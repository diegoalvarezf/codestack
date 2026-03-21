import type { Metadata } from "next";
import { cookies } from "next/headers";
import { STACKS } from "@/lib/stacks";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getT } from "@/lib/i18n";
import { IconZap, IconSearch, IconDatabase, IconRocket, IconClipboard, IconShield } from "@/components/Icons";

const STACK_ICONS: Record<string, { icon: React.ReactNode; bg: string }> = {
  "full-stack-dev":   { icon: <IconZap size={18} />,       bg: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
  "research":         { icon: <IconSearch size={18} />,     bg: "bg-purple-500/20 text-purple-400 border-purple-500/20" },
  "data-engineering": { icon: <IconDatabase size={18} />,   bg: "bg-cyan-500/20 text-cyan-400 border-cyan-500/20" },
  "devops":           { icon: <IconRocket size={18} />,     bg: "bg-orange-500/20 text-orange-400 border-orange-500/20" },
  "product-team":     { icon: <IconClipboard size={18} />,  bg: "bg-green-500/20 text-green-400 border-green-500/20" },
  "security":         { icon: <IconShield size={18} />,     bg: "bg-red-500/20 text-red-400 border-red-500/20" },
};

export const metadata: Metadata = {
  title: "Stacks — MCPHub",
  description: "Curated and community-created collections of MCP servers, skills, and agents.",
};

export const dynamic = "force-dynamic";

export default async function StacksPage() {
  const lang = (await cookies()).get("lang")?.value ?? "en";
  const t = getT(lang);

  const [session, userStacks] = await Promise.all([
    auth(),
    prisma.userStack.findMany({
      where: { public: true },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 sm:mb-14 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-sm px-3 py-1 rounded-full mb-5 border border-blue-500/20">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
            {t.stacksCuratedBadge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">{t.stacksTitle}</h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl">
            {t.stacksDesc}
          </p>
        </div>
        {session && (
          <a href="/stacks/new"
            className="shrink-0 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-white transition-colors mt-1">
            {t.createStack}
          </a>
        )}
      </div>

      {/* Curated stacks */}
      <section className="mb-12">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">{t.curatedStacks}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {STACKS.map((stack) => (
            <a key={stack.slug} href={`/stacks/${stack.slug}`}
              className="group block rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all hover:-translate-y-0.5 p-5">
              <div className="flex items-start gap-3 mb-3">
                <span className={`flex items-center justify-center w-9 h-9 rounded-lg border shrink-0 ${STACK_ICONS[stack.slug]?.bg ?? "bg-gray-800 text-gray-400 border-gray-700"}`}>
                  {STACK_ICONS[stack.slug]?.icon ?? stack.icon}
                </span>
                <div>
                  <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{stack.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    {stack.servers.length > 0 && (
                      <span className="text-xs text-blue-400/70">{stack.servers.length} {t.servers}</span>
                    )}
                    {stack.skills.length > 0 && (
                      <span className="text-xs text-purple-400/70">{stack.skills.length} {t.skills_label}</span>
                    )}
                    {stack.agents.length > 0 && (
                      <span className="text-xs text-orange-400/70">{stack.agents.length} {t.agents_label}</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{stack.description}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Community stacks */}
      {userStacks.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">{t.communityStacks}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {userStacks.map((stack) => {
              const servers = stack.items.filter(i => i.type === "server").length;
              const skills = stack.items.filter(i => i.type === "skill").length;
              const agents = stack.items.filter(i => i.type === "agent").length;
              return (
                <a key={stack.slug} href={`/stacks/${stack.slug}`}
                  className="group block rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all hover:-translate-y-0.5 p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex items-center justify-center w-9 h-9 rounded-lg border bg-gray-800 border-gray-700 text-gray-300 font-semibold text-sm shrink-0">
                      {stack.name[0]}
                    </span>
                    <div>
                      <h2 className="font-semibold text-white group-hover:text-blue-400 transition-colors">{stack.name}</h2>
                      <div className="flex items-center gap-2 mt-0.5">
                        {servers > 0 && <span className="text-xs text-blue-400/70">{servers} {t.servers}</span>}
                        {skills > 0 && <span className="text-xs text-purple-400/70">{skills} {t.skills_label}</span>}
                        {agents > 0 && <span className="text-xs text-orange-400/70">{agents} {t.agents_label}</span>}
                        <span className="text-xs text-gray-600">{t.by} {stack.createdBy}</span>
                      </div>
                    </div>
                  </div>
                  {stack.description && (
                    <p className="text-sm text-gray-400 leading-relaxed">{stack.description}</p>
                  )}
                </a>
              );
            })}
          </div>
        </section>
      )}

      {!session && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 text-center">
          <h3 className="font-semibold text-white mb-2">{t.stacksCreateCta}</h3>
          <p className="text-sm text-gray-400 mb-4">
            {t.stacksCreateDesc}
          </p>
          <a href="/auth/signin?callbackUrl=/stacks/new"
            className="inline-flex items-center gap-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            {t.stacksSignIn}
          </a>
        </div>
      )}
    </div>
  );
}
