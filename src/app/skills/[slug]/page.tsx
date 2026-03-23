import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getSkill, parseTags } from "@/lib/skills-db";
import { getT } from "@/lib/i18n";
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
  const [skill, session, cookieStore] = await Promise.all([
    getSkill(params.slug),
    auth(),
    cookies(),
  ]);
  if (!skill || skill.type !== "prompt") notFound();

  const lang = cookieStore.get("lang")?.value ?? "en";
  const t = getT(lang);
  const tags = parseTags(skill);
  const installCmd = `mcp install-skill ${skill.slug}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <a href="/?section=skills" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-8">
        {t.allSkillsBack}
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
                <span className="text-xs text-purple-400 border border-purple-500/20 bg-purple-500/10 px-2.5 py-1 rounded-full">{t.verifiedBadge}</span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-2">{skill.name}</h1>
            <p className="text-gray-400 text-lg">{skill.description}</p>
          </div>

          {/* What happens when you install it */}
          <section className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">{t.whatHappensInstall}</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">1</div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">{t.skillStep1Title}</p>
                  <code className="text-xs bg-gray-800 px-2 py-1 rounded text-green-400">{installCmd}</code>
                  <p className="text-xs text-gray-500 mt-1">{t.skillStep1Desc}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">2</div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">{t.skillStep2Title}</p>
                  <code className="text-xs bg-gray-800 px-2 py-1 rounded font-mono text-gray-300">~/.claude/commands/{skill.slug}.md</code>
                  <p className="text-xs text-gray-500 mt-1">{t.skillStep2Desc}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">3</div>
                <div>
                  <p className="text-sm text-white font-medium mb-1">{t.skillStep3Title}</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-gray-800 px-2 py-1 rounded text-purple-400 font-mono">/{skill.slug}</code>
                    <span className="text-xs text-gray-500">{t.skillStep3Sub}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{t.skillStep3Desc}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Prompt content */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{t.promptContent}</h2>
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
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{t.installSidebar}</h3>
            <div className="flex items-center justify-between gap-2 bg-gray-950 rounded-lg px-3 py-2.5">
              <span className="font-mono text-xs text-green-400 truncate">{installCmd}</span>
              <CopyButton text={installCmd} />
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>{t.afterInstallRestart}</p>
              <code className="block bg-gray-800 px-2 py-1.5 rounded text-purple-400 font-mono text-sm">/{skill.slug}</code>
            </div>
            <p className="text-xs text-gray-600">
              {t.requiresCli} <a href="/install-cli" className="text-blue-400/70 hover:text-blue-400">MCPHub CLI</a>
            </p>
            {skill.installCount > 0 && (
              <p className="text-xs text-gray-500 border-t border-gray-800 pt-2">↓ {skill.installCount.toLocaleString()} {t.installs}</p>
            )}
          </div>

          {/* Author */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{t.author}</h3>
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

          {/* Repo */}
          {skill.repoUrl && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Source</h3>
              <a href={skill.repoUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
                <span className="truncate">{skill.repoUrl.replace("https://github.com/", "")}</span>
              </a>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{t.tags}</h3>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <a key={tag} href={`/?section=skills&tag=${tag}`}
                    className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-500 transition-colors">
                    #{tag}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Also see agents */}
          <a href="/?section=agents"
            className="block bg-orange-500/5 border border-orange-500/20 rounded-xl p-4 hover:bg-orange-500/10 transition-colors">
            <p className="text-sm font-medium text-white mb-1">{t.lookingForAgents}</p>
            <p className="text-xs text-gray-500">{t.lookingForAgentsDesc}</p>
            <p className="text-xs text-orange-400 mt-2">{t.browseAgents}</p>
          </a>

          {session?.user && (
            <a href="/teams"
              className="block bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 hover:bg-blue-500/10 transition-colors">
              <p className="text-sm font-medium text-white mb-1">{t.shareWithTeam}</p>
              <p className="text-xs text-gray-500">{t.shareSkillTeamDesc}</p>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
