import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { getServers } from "@/lib/servers";
import { getSkills } from "@/lib/skills-db";
import { ServerCard } from "@/components/ServerCard";
import { SkillCard } from "@/components/SkillCard";
import { AgentCard } from "@/components/AgentCard";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { getT } from "@/lib/i18n";
import type { SortMode } from "@/lib/servers";
import { IconGrid, IconList, IconStar, IconDownload } from "@/components/Icons";
import { CliCommand } from "@/components/CliCommand";
import { prisma } from "@/lib/db";
import { HeroBanner } from "@/components/HeroBanner";

export const dynamic = "force-dynamic";

type Section = "mcps" | "skills" | "agents";

const CLIENTS = [
  "Claude Code", "GitHub Copilot", "Codex", "OpenCode",
  "Cursor", "Windsurf", "Cline", "Continue", "Zed", "Claude Desktop",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; client?: string; page?: string; section?: string; sort?: string; view?: string };
}) {
  const [cookieStore, session] = await Promise.all([cookies(), auth()]);
  const lang = cookieStore.get("lang")?.value ?? "en";
  const t = getT(lang);

  const SECTIONS = [
    { id: "mcps", label: t.sectionMcps, color: "blue" },
    { id: "skills", label: t.sectionSkills, color: "purple" },
    { id: "agents", label: t.sectionAgents, color: "orange" },
  ] as const;

  const SORT_TABS: { id: SortMode; label: string }[] = [
    { id: "popular",  label: t.sortPopular },
    { id: "trending", label: t.sortTrending },
    { id: "hot",      label: t.sortHot },
    { id: "new",      label: t.sortNew },
  ];

  const libraryStats = session ? await (async () => {
    const [createdServers, createdSkills, savedItems] = await Promise.all([
      prisma.server.count({ where: { createdBy: session.user.githubLogin! } }),
      prisma.skill.count({ where: { createdBy: session.user.githubLogin! } }),
      (prisma as any).userSavedItem.count({ where: { userId: session.user.id ?? "" } }),
    ]);
    return { total: createdServers + createdSkills + savedItems };
  })() : null;

  const section: Section = (searchParams.section as Section) ?? "mcps";
  const query = searchParams.q;
  const tag = searchParams.tag;
  const client = searchParams.client;
  const page = parseInt(searchParams.page ?? "1");
  const sort = (searchParams.sort as SortMode) ?? "popular";
  const view = searchParams.view === "list" ? "list" : "grid";
  const isFiltered = query || tag || client;

  function buildUrl(p: number, extra?: Record<string, string>) {
    const params = new URLSearchParams();
    params.set("section", section);
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    if (client) params.set("client", client);
    if (sort !== "popular") params.set("sort", sort);
    if (view !== "grid") params.set("view", view);
    if (p > 1) params.set("page", String(p));
    Object.entries(extra ?? {}).forEach(([k, v]) => params.set(k, v));
    return `/?${params.toString()}`;
  }

  function sectionUrl(s: Section) {
    return `/?section=${s}`;
  }

  function sortUrl(s: SortMode) {
    const params = new URLSearchParams();
    params.set("section", section);
    params.set("sort", s);
    if (view !== "grid") params.set("view", view);
    return `/?${params.toString()}`;
  }

  function viewUrl(v: "grid" | "list") {
    const params = new URLSearchParams();
    params.set("section", section);
    if (sort !== "popular") params.set("sort", sort);
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    params.set("view", v);
    return `/?${params.toString()}`;
  }

  const serversResult = section === "mcps"
    ? await getServers({ query, tag, client, page, sort })
    : { servers: [], total: 0, pages: 0 };

  const skillsResult = section === "skills"
    ? await getSkills({ query, type: "prompt", tag, page, sort })
    : { skills: [], total: 0, pages: 0 };

  const agentsResult = section === "agents"
    ? await getSkills({ query, type: "agent", tag, page, sort })
    : { skills: [], total: 0, pages: 0 };

  const totalCount = section === "mcps" ? serversResult.total
    : section === "skills" ? skillsResult.total
    : agentsResult.total;

  const totalPages = section === "mcps" ? serversResult.pages
    : section === "skills" ? skillsResult.pages
    : agentsResult.pages;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

      {/* Hero */}
      {!isFiltered && (
        <div className="text-center mb-10 sm:mb-12">
          {/* ASCII logo */}
          <pre
            className="font-mono text-[3.5px] sm:text-[5.5px] md:text-[8px] lg:text-[10px] leading-none mb-6 text-blue-400/60 select-none overflow-x-hidden"
            aria-hidden="true"
          >{`  ██████╗   ██████╗   ██████╗   ███████╗ ███████╗ ████████╗  █████╗    ██████╗  ██╗  ██╗
 ██╔════╝  ██╔═══██╗  ██╔══██╗  ██╔════╝ ██╔════╝ ╚══██╔══╝ ██╔══██╗  ██╔════╝  ██║ ██╔╝
 ██║       ██║   ██║  ██║  ██║  █████╗   ███████╗    ██║    ███████║  ██║       █████╔╝ 
 ██║       ██║   ██║  ██║  ██║  ██╔══╝   ╚════██║    ██║    ██╔══██║  ██║       ██╔═██╗ 
 ╚██████╗  ╚██████╔╝  ██████╔╝  ███████╗ ███████║    ██║    ██║  ██║  ╚██████╗  ██║  ██╗
  ╚═════╝   ╚═════╝   ╚═════╝   ╚══════╝ ╚══════╝    ╚═╝    ╚═╝  ╚═╝   ╚═════╝  ╚═╝  ╚═╝`}</pre>

          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto mb-6">
            {t.heroDesc}
          </p>

          <div className="flex flex-col items-center gap-2">
            <CliCommand />
            <p className="text-xs text-gray-600 font-mono">auto-installs to Claude Code, GitHub Copilot, Codex — whatever you have</p>
          </div>

          {/* Compatible clients — scrolling ticker */}
          <div className="mt-10 relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 text-center font-mono">Works with</p>
            <div className="flex gap-6 animate-marquee whitespace-nowrap">
              {[...CLIENTS, ...CLIENTS].map((name, i) => (
                <span key={i} className="inline-flex items-center gap-2 text-sm text-gray-500 font-mono">
                  <span className="w-1 h-1 rounded-full bg-gray-700 inline-block" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3-way switch */}
      {!session && <HeroBanner isLoggedIn={false} />}
      {session && libraryStats && libraryStats.total > 0 && (
        <div className="mb-8 flex items-center justify-between px-4 py-3 bg-gray-900 border border-gray-800 rounded-xl">
          <div className="flex items-center gap-3">
            <span className="text-lg">📚</span>
            <div>
              <p className="text-sm font-medium text-white">Your Library</p>
              <p className="text-xs text-gray-500">{libraryStats.total} item{libraryStats.total !== 1 ? "s" : ""} saved</p>
            </div>
          </div>
          <a href="/library" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            View →
          </a>
        </div>
      )}
      {session && libraryStats && libraryStats.total === 0 && (
        <div className="mb-8 flex items-center justify-between px-4 py-3 bg-gray-900 border border-dashed border-gray-700 rounded-xl">
          <p className="text-sm text-gray-400">Start building your library — save MCPs, skills, and agents.</p>
          <a href="/library" className="text-sm text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap">
            Go to Library →
          </a>
        </div>
      )}
      {/* How it works — anon users only */}
      {!session && !isFiltered && (
        <div className="mb-10 border-t border-gray-800 pt-8">
          <p className="text-xs text-gray-600 uppercase tracking-widest mb-6 text-center font-mono">How it works</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto font-mono">
            {[
              { n: "[1]", title: "Save what you use", desc: "Add MCPs, skills, and agents from the registry or paste any URL." },
              { n: "[2]", title: "Build your stack", desc: "Group your tools into a named stack for each project or workflow." },
              { n: "[3]", title: "Install everything", desc: "Run codestack install and your full AI setup is configured in seconds." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="flex gap-3 text-left">
                <span className="text-gray-600 shrink-0 text-sm">{n}</span>
                <div>
                  <p className="text-gray-200 text-sm">{title}</p>
                  <p className="text-gray-500 text-sm mt-1">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-center mb-8">
        <div className="inline-flex bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
          {SECTIONS.map(({ id, label, color }) => {
            const active = section === id;
            const colorMap: Record<string, string> = {
              blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
              purple: "bg-purple-500/20 text-purple-300 border-purple-500/30",
              orange: "bg-orange-500/20 text-orange-300 border-orange-500/30",
            };
            return (
              <a
                key={id}
                href={sectionUrl(id)}
                className={`px-5 py-2 rounded-lg text-sm font-medium border transition-all ${
                  active
                    ? `${colorMap[color]} shadow-sm`
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {label}
              </a>
            );
          })}
        </div>
      </div>

      {/* MCP Servers */}
      {section === "mcps" && (
        <>
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar defaultValue={query} baseUrl="/" placeholder={t.searchMcps} />
          </div>

          {!isFiltered && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide justify-center">
              <div className="flex gap-2 flex-nowrap">
                {(["claude-code", "github-copilot", "codex", "opencode", "cursor"] as const).map((c) => {
                  const labels: Record<string, string> = {
                    "claude-code": "Claude Code",
                    "github-copilot": "GitHub Copilot",
                    "codex": "Codex",
                    "opencode": "OpenCode",
                    "cursor": "Cursor",
                  };
                  return (
                    <a key={c} href={buildUrl(1, { client: client === c ? "" : c })}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                        client === c ? "bg-blue-500 border-blue-500 text-white"
                                     : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                      }`}>
                      {labels[c]}
                    </a>
                  );
                })}
                <div className="w-px bg-gray-800 mx-1" />
                {["filesystem", "database", "search", "git", "browser", "memory", "api"].map((tg) => (
                  <a key={tg} href={buildUrl(1, { tag: tag === tg ? "" : tg })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                      tag === tg ? "bg-blue-500 border-blue-500 text-white"
                               : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                    }`}>
                    #{tg}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Sort tabs + view toggle */}
          {!isFiltered && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {SORT_TABS.map(({ id, label }) => (
                  <a key={id} href={sortUrl(id)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      sort === id
                        ? "bg-gray-800 text-white"
                        : "text-gray-500 hover:text-gray-300"
                    }`}>
                    {label}
                  </a>
                ))}
              </div>
              <div className="flex gap-1 shrink-0 ml-3">
                <a href={viewUrl("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`} title="Grid view">
                  <IconGrid />
                </a>
                <a href={viewUrl("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`} title="List view">
                  <IconList />
                </a>
              </div>
            </div>
          )}

          {/* Submit banner */}
          {!isFiltered && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 text-sm text-gray-400">
                <span className="text-white font-medium">{t.mcpBannerTitle}</span> {t.mcpBannerDesc}{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-xs">npx @diegoalvarezf/codestack install github</code>{" "}
                {t.mcpBannerDesc2}
              </div>
              <a href="/submit" className="shrink-0 text-xs text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors">
                {t.submitServer}
              </a>
            </div>
          )}

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              {isFiltered ? `${totalCount} ${t.results}` : t.allServers}
            </h2>
            {view === "list" ? (
              <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden">
                {serversResult.servers.map((s, i) => {
                  const avatar = (() => {
                    for (const url of [s.authorUrl, s.repoUrl]) {
                      if (!url) continue;
                      const m = url.match(/github\.com\/([^/]+)/);
                      if (m) return `https://github.com/${m[1]}.png?size=32`;
                    }
                    return null;
                  })();
                  return (
                    <a key={s.id} href={`/server/${s.slug}`}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors group">
                      <span className="text-xs text-gray-600 font-mono w-5 shrink-0 text-right">{(page - 1) * 24 + i + 1}</span>
                      {avatar
                        ? <img src={avatar} alt="" className="w-7 h-7 rounded-full shrink-0 bg-gray-800" />
                        : <div className="w-7 h-7 rounded-full shrink-0 bg-gray-800" />
                      }
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{s.name}</span>
                        <span className="text-gray-500 text-sm ml-3 truncate hidden sm:inline">{s.description}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                        {s.stars > 0 && (
                          <span className="flex items-center gap-1 text-yellow-500/80">
                            <IconStar size={11} />
                            {s.stars >= 1000 ? `${(s.stars / 1000).toFixed(1)}k` : s.stars.toLocaleString()}
                          </span>
                        )}
                        {s.npmDownloads > 0 ? (
                          <span className="flex items-center gap-1" title="npm weekly downloads">
                            <IconDownload size={11} />
                            {s.npmDownloads >= 1000 ? `${(s.npmDownloads / 1000).toFixed(1)}k` : s.npmDownloads.toLocaleString()}
                            <span className="text-gray-700">/w</span>
                          </span>
                        ) : s.downloadCount > 0 ? (
                          <span className="flex items-center gap-1">
                            <IconDownload size={11} />
                            {s.downloadCount.toLocaleString()}
                          </span>
                        ) : null}
                        {s.avgRating && <span className="text-yellow-400 hidden sm:block">★ {s.avgRating}</span>}
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {serversResult.servers.map((s, i) => (
                  <ServerCard key={s.id} server={s} rank={(page - 1) * 24 + i + 1} />
                ))}
              </div>
            )}
            {serversResult.servers.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                {t.noServers} <a href="/submit" className="text-blue-400 hover:underline">{t.submitOne}</a>
              </div>
            )}
            <Pagination page={page} pages={totalPages} total={totalCount} buildUrl={buildUrl} />
          </section>
        </>
      )}

      {/* Skills */}
      {section === "skills" && (
        <>
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar defaultValue={query} baseUrl="/?section=skills" placeholder={t.searchSkills} />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide justify-center">
            <div className="flex gap-2 flex-nowrap">
              {["code-review", "git", "testing", "security", "documentation", "debugging", "productivity", "refactoring"].map((tg) => (
                <a key={tg} href={buildUrl(1, { tag: tag === tg ? "" : tg })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                    tag === tg ? "bg-purple-500 border-purple-500 text-white"
                             : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  }`}>
                  #{tg}
                </a>
              ))}
            </div>
          </div>

          {/* Sort tabs + view toggle */}
          {!isFiltered && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {SORT_TABS.map(({ id, label }) => (
                  <a key={id} href={sortUrl(id)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      sort === id ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
                    }`}>
                    {label}
                  </a>
                ))}
              </div>
              <div className="flex gap-1 shrink-0 ml-3">
                <a href={viewUrl("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                  <IconGrid />
                </a>
                <a href={viewUrl("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                  <IconList />
                </a>
              </div>
            </div>
          )}

          {!isFiltered && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 text-sm text-gray-400">
                <span className="text-white font-medium">{t.skillsBannerTitle}</span> {t.skillsBannerDesc}{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-400 text-xs">/slash-commands</code> {t.skillsBannerDesc2}{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-xs">npx @diegoalvarezf/codestack install-skill review-pr</code>{" "}
                {t.skillsBannerDesc3} <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-400 text-xs">/review-pr</code> {t.skillsBannerDesc4}
              </div>
              <a href="/submit?type=prompt" className="shrink-0 text-xs text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-colors">
                {t.submitSkill}
              </a>
            </div>
          )}

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              {isFiltered ? `${totalCount} ${t.results}` : t.allSkills}
            </h2>
            {view === "list" ? (
              <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden">
                {skillsResult.skills.map((s, i) => {
                  const avatar = s.authorUrl?.match(/github\.com\/([^/]+)/)?.[1]
                    ? `https://github.com/${s.authorUrl!.match(/github\.com\/([^/]+)/)![1]}.png?size=32`
                    : null;
                  return (
                    <a key={s.id} href={`/skills/${s.slug}`}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors group">
                      <span className="text-xs text-gray-600 font-mono w-5 shrink-0 text-right">{(page - 1) * 24 + i + 1}</span>
                      {avatar
                        ? <img src={avatar} alt="" className="w-7 h-7 rounded-full shrink-0 bg-gray-800" />
                        : <div className="w-7 h-7 rounded-full shrink-0 bg-gray-800" />
                      }
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-white group-hover:text-purple-400 transition-colors">{s.name}</span>
                        <span className="text-gray-500 text-sm ml-3 truncate hidden sm:inline">{s.description}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                        {s.stars > 0 && (
                          <span className="flex items-center gap-1 text-yellow-500/80">
                            <IconStar size={11} />
                            {s.stars >= 1000 ? `${(s.stars / 1000).toFixed(1)}k` : s.stars.toLocaleString()}
                          </span>
                        )}
                        {s.installCount > 0 && (
                          <span className="flex items-center gap-1">
                            <IconDownload size={11} />
                            {s.installCount.toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 hidden sm:block">/{s.slug}</span>
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {skillsResult.skills.map((s) => <SkillCard key={s.id} skill={s} />)}
              </div>
            )}
            {skillsResult.skills.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                {t.noSkills} <a href="/submit?type=prompt" className="text-purple-400 hover:underline">{t.submitOne}</a>
              </div>
            )}
            <Pagination page={page} pages={totalPages} total={totalCount} buildUrl={buildUrl} />
          </section>
        </>
      )}

      {/* Agents */}
      {section === "agents" && (
        <>
          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar defaultValue={query} baseUrl="/?section=agents" placeholder={t.searchAgents} />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide justify-center">
            <div className="flex gap-2 flex-nowrap">
              {["engineering", "architecture", "devops", "security", "code-quality", "planning", "leadership"].map((tg) => (
                <a key={tg} href={buildUrl(1, { tag: tag === tg ? "" : tg })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                    tag === tg ? "bg-orange-500 border-orange-500 text-white"
                             : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  }`}>
                  #{tg}
                </a>
              ))}
            </div>
          </div>

          {/* Sort + view */}
          {!isFiltered && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                {SORT_TABS.map(({ id, label }) => (
                  <a key={id} href={sortUrl(id)}
                    className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                      sort === id ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"
                    }`}>
                    {label}
                  </a>
                ))}
              </div>
              <div className="flex gap-1 shrink-0 ml-3">
                <a href={viewUrl("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                  <IconGrid />
                </a>
                <a href={viewUrl("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-gray-800 text-white" : "text-gray-500 hover:text-gray-300"}`}>
                  <IconList />
                </a>
              </div>
            </div>
          )}

          {!isFiltered && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 text-sm text-gray-400">
                <span className="text-white font-medium">{t.agentsBannerTitle}</span> {t.agentsBannerDesc}{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-xs">npx @diegoalvarezf/codestack install-skill senior-engineer</code>{" "}
                {t.agentsBannerDesc2}
              </div>
              <a href="/submit?type=agent" className="shrink-0 text-xs text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition-colors">
                {t.submitAgent}
              </a>
            </div>
          )}

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              {isFiltered ? `${totalCount} ${t.results}` : t.allAgents}
            </h2>
            {view === "list" ? (
              <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden">
                {agentsResult.skills.map((s, i) => {
                  const avatar = s.authorUrl?.match(/github\.com\/([^/]+)/)?.[1]
                    ? `https://github.com/${s.authorUrl!.match(/github\.com\/([^/]+)/)![1]}.png?size=32`
                    : null;
                  return (
                    <a key={s.id} href={`/agents/${s.slug}`}
                      className="flex items-center gap-3 px-4 py-3 bg-gray-900 hover:bg-gray-800 transition-colors group">
                      <span className="text-xs text-gray-600 font-mono w-5 shrink-0 text-right">{(page - 1) * 24 + i + 1}</span>
                      {avatar
                        ? <img src={avatar} alt="" className="w-7 h-7 rounded-full shrink-0 bg-gray-800" />
                        : <div className="w-7 h-7 rounded-full shrink-0 bg-gray-800" />
                      }
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-white group-hover:text-orange-400 transition-colors">{s.name}</span>
                        <span className="text-gray-500 text-sm ml-3 truncate hidden sm:inline">{s.description}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                        {s.stars > 0 && (
                          <span className="flex items-center gap-1 text-yellow-500/80">
                            <IconStar size={11} />
                            {s.stars >= 1000 ? `${(s.stars / 1000).toFixed(1)}k` : s.stars.toLocaleString()}
                          </span>
                        )}
                        {s.installCount > 0 && (
                          <span className="flex items-center gap-1">
                            <IconDownload size={11} />
                            {s.installCount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {agentsResult.skills.map((s) => <AgentCard key={s.id} skill={s} />)}
              </div>
            )}
            {agentsResult.skills.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                {t.noAgents} <a href="/submit?type=agent" className="text-orange-400 hover:underline">{t.submitOne}</a>
              </div>
            )}
            <Pagination page={page} pages={totalPages} total={totalCount} buildUrl={buildUrl} />
          </section>
        </>
      )}
    </div>
  );
}
