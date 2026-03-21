import { cookies } from "next/headers";
import { getServers } from "@/lib/servers";
import { getSkills } from "@/lib/skills-db";
import { ServerCard } from "@/components/ServerCard";
import { SkillCard } from "@/components/SkillCard";
import { AgentCard } from "@/components/AgentCard";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { getT } from "@/lib/i18n";
import type { SortMode } from "@/lib/servers";
import { IconGrid, IconList } from "@/components/Icons";

export const dynamic = "force-dynamic";

type Section = "mcps" | "skills" | "agents";

const CLIENTS = [
  "Claude Code", "Claude Desktop", "Cursor", "Continue",
  "Cline", "Copilot", "Windsurf", "Ollama", "Open WebUI", "Zed",
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; client?: string; page?: string; section?: string; sort?: string; view?: string };
}) {
  const lang = (await cookies()).get("lang")?.value ?? "en";
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
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
            {t.heroTitle}
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            {t.heroDesc}
          </p>
          <div className="mt-6 flex items-center justify-center">
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-2.5 font-mono text-sm text-gray-300">
              <span className="text-gray-600 select-none">$ </span>npx @mcphub/cli install <span className="text-blue-400">github</span>
            </div>
          </div>

          {/* Compatible clients — scrolling ticker */}
          <div className="mt-10 relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}>
            <p className="text-xs text-gray-600 uppercase tracking-widest mb-4 text-center">Works with</p>
            <div className="flex gap-6 animate-marquee whitespace-nowrap">
              {[...CLIENTS, ...CLIENTS].map((name, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 text-sm text-gray-500"
                >
                  <span className="w-1 h-1 rounded-full bg-gray-700 inline-block" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3-way switch */}
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
                {["claude-code", "cursor", "continue"].map((c) => (
                  <a key={c} href={buildUrl(1, { client: client === c ? "" : c })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                      client === c ? "bg-blue-500 border-blue-500 text-white"
                                   : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                    }`}>
                    {c === "claude-code" ? "Claude Code" : c === "cursor" ? "Cursor" : "Continue"}
                  </a>
                ))}
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
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-xs">mcp install github</code>{" "}
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
              <div className="space-y-1">
                {serversResult.servers.map((s, i) => (
                  <a key={s.id} href={`/server/${s.slug}`}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 transition-all group">
                    <span className="text-xs text-gray-600 font-mono w-6 shrink-0 text-right">{(page - 1) * 24 + i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white group-hover:text-blue-400 transition-colors">{s.name}</span>
                      <span className="text-gray-500 text-sm ml-3 truncate hidden sm:inline">{s.description}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                      {s.downloadCount > 0 && <span>↓ {s.downloadCount.toLocaleString()}</span>}
                      {s.avgRating && <span className="text-yellow-400">★ {s.avgRating}</span>}
                      <span className="font-mono text-gray-600">{s.transport}</span>
                    </div>
                  </a>
                ))}
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
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-xs">mcp install-skill review-pr</code>{" "}
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
              <div className="space-y-1">
                {skillsResult.skills.map((s, i) => (
                  <a key={s.id} href={`/skills/${s.slug}`}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 transition-all group">
                    <span className="text-xs text-gray-600 font-mono w-6 shrink-0 text-right">{(page - 1) * 24 + i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white group-hover:text-purple-400 transition-colors">{s.name}</span>
                      <span className="text-gray-500 text-sm ml-3 truncate hidden sm:inline">{s.description}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-gray-500">
                      {s.installCount > 0 && <span>↓ {s.installCount.toLocaleString()}</span>}
                      <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">/{s.slug}</span>
                    </div>
                  </a>
                ))}
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
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-xs">mcp install-skill senior-engineer</code>{" "}
                {t.agentsBannerDesc2}{" "}
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-orange-400 text-xs">claude --agent senior-engineer</code>.
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
              <div className="space-y-1">
                {agentsResult.skills.map((s, i) => (
                  <a key={s.id} href={`/agents/${s.slug}`}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-600 hover:bg-gray-800 transition-all group">
                    <span className="text-xs text-gray-600 font-mono w-6 shrink-0 text-right">{(page - 1) * 24 + i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-white group-hover:text-orange-400 transition-colors">{s.name}</span>
                      <span className="text-gray-500 text-sm ml-3 truncate hidden sm:inline">{s.description}</span>
                    </div>
                    {s.installCount > 0 && (
                      <span className="shrink-0 text-xs text-gray-500">↓ {s.installCount.toLocaleString()}</span>
                    )}
                  </a>
                ))}
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
