import { getServers } from "@/lib/servers";
import { getSkills } from "@/lib/skills-db";
import { ServerCard } from "@/components/ServerCard";
import { SkillCard } from "@/components/SkillCard";
import { AgentCard } from "@/components/AgentCard";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { STACKS } from "@/lib/stacks";

export const dynamic = "force-dynamic";

type Section = "mcps" | "skills" | "agents";

const SECTIONS = [
  { id: "mcps", label: "MCP Servers", color: "blue" },
  { id: "skills", label: "Skills", color: "purple" },
  { id: "agents", label: "Agents", color: "orange" },
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; client?: string; page?: string; section?: string };
}) {
  const section: Section = (searchParams.section as Section) ?? "mcps";
  const query = searchParams.q;
  const tag = searchParams.tag;
  const client = searchParams.client;
  const page = parseInt(searchParams.page ?? "1");
  const isFiltered = query || tag || client;

  function buildUrl(p: number, extra?: Record<string, string>) {
    const params = new URLSearchParams();
    params.set("section", section);
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    if (client) params.set("client", client);
    if (p > 1) params.set("page", String(p));
    Object.entries(extra ?? {}).forEach(([k, v]) => params.set(k, v));
    return `/?${params.toString()}`;
  }

  function sectionUrl(s: Section) {
    return `/?section=${s}`;
  }

  // Fetch data based on active section
  const [featuredServers, serversResult] = section === "mcps"
    ? await Promise.all([
        !isFiltered ? getServers({ featured: true }) : Promise.resolve({ servers: [], total: 0, pages: 0 }),
        getServers({ query, tag, client, page }),
      ])
    : [{ servers: [], total: 0, pages: 0 }, { servers: [], total: 0, pages: 0 }];

  const [featuredSkills, skillsResult] = section === "skills"
    ? await Promise.all([
        !isFiltered ? getSkills({ featured: true, type: "prompt" }) : Promise.resolve({ skills: [], total: 0, pages: 0 }),
        getSkills({ query, type: "prompt", tag, page }),
      ])
    : [{ skills: [], total: 0, pages: 0 }, { skills: [], total: 0, pages: 0 }];

  const [featuredAgents, agentsResult] = section === "agents"
    ? await Promise.all([
        !isFiltered ? getSkills({ featured: true, type: "agent" }) : Promise.resolve({ skills: [], total: 0, pages: 0 }),
        getSkills({ query, type: "agent", tag, page }),
      ])
    : [{ skills: [], total: 0, pages: 0 }, { skills: [], total: 0, pages: 0 }];

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
            Your AI Development Hub
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Discover and install MCP servers, slash-command skills, and AI agents.
            Everything your Claude Code or Cursor needs — in one place.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 font-mono text-sm text-green-400">
              npm install -g @mcphub/cli
            </div>
            <a href="/install-cli" className="text-sm text-blue-400 hover:underline">All commands →</a>
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
            <SearchBar defaultValue={query} baseUrl="/" placeholder="Search MCP servers..." />
          </div>

          {/* Client filters */}
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
                {["filesystem", "database", "search", "git", "browser", "memory", "api"].map((t) => (
                  <a key={t} href={buildUrl(1, { tag: tag === t ? "" : t })}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                      tag === t ? "bg-blue-500 border-blue-500 text-white"
                               : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                    }`}>
                    #{t}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Stacks */}
          {!isFiltered && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Stacks</h2>
                <a href="/stacks" className="text-xs text-blue-400 hover:underline">View all →</a>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {STACKS.map((stack) => (
                  <a key={stack.slug} href={`/stacks/${stack.slug}`}
                    className="group flex flex-col items-center gap-1.5 p-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all text-center">
                    <span className="text-xl">{stack.icon}</span>
                    <span className="text-xs text-gray-400 group-hover:text-white transition-colors font-medium leading-tight">{stack.name}</span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Featured */}
          {!isFiltered && featuredServers.servers.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Featured</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {featuredServers.servers.map((s) => <ServerCard key={s.id} server={s} featured />)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              {isFiltered ? `${totalCount} results` : "All servers"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {serversResult.servers.map((s) => <ServerCard key={s.id} server={s} />)}
            </div>
            {serversResult.servers.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No servers found. <a href="/submit" className="text-blue-400 hover:underline">Submit one!</a>
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
            <SearchBar defaultValue={query} baseUrl="/?section=skills" placeholder="Search skills..." />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide justify-center">
            <div className="flex gap-2 flex-nowrap">
              {["code-review", "git", "testing", "security", "documentation", "debugging", "productivity", "refactoring"].map((t) => (
                <a key={t} href={buildUrl(1, { tag: tag === t ? "" : t })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                    tag === t ? "bg-purple-500 border-purple-500 text-white"
                             : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  }`}>
                  #{t}
                </a>
              ))}
            </div>
          </div>

          {/* How skills work — only on unfiltered first load */}
          {!isFiltered && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 text-sm text-gray-400">
                <span className="text-white font-medium">Skills</span> install as <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-400 text-xs">/slash-commands</code> in Claude Code.
                Run <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-xs">mcp install-skill review-pr</code> and type <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-400 text-xs">/review-pr</code> in any conversation.
              </div>
              <a href="/submit?type=prompt" className="shrink-0 text-xs text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-colors">
                Submit a skill →
              </a>
            </div>
          )}

          {!isFiltered && featuredSkills.skills.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Featured</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {featuredSkills.skills.map((s) => <SkillCard key={s.id} skill={s} featured />)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              {isFiltered ? `${totalCount} results` : "All skills"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {skillsResult.skills.map((s) => <SkillCard key={s.id} skill={s} />)}
            </div>
            {skillsResult.skills.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No skills found. <a href="/submit?type=prompt" className="text-purple-400 hover:underline">Submit one!</a>
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
            <SearchBar defaultValue={query} baseUrl="/?section=agents" placeholder="Search agents..." />
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide justify-center">
            <div className="flex gap-2 flex-nowrap">
              {["engineering", "architecture", "devops", "security", "code-quality", "planning", "leadership"].map((t) => (
                <a key={t} href={buildUrl(1, { tag: tag === t ? "" : t })}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                    tag === t ? "bg-orange-500 border-orange-500 text-white"
                             : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
                  }`}>
                  #{t}
                </a>
              ))}
            </div>
          </div>

          {!isFiltered && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 text-sm text-gray-400">
                <span className="text-white font-medium">Agents</span> have a persistent system prompt and behavior.
                Run <code className="bg-gray-800 px-1.5 py-0.5 rounded text-green-400 text-xs">mcp install-skill senior-engineer</code> then
                <code className="bg-gray-800 px-1.5 py-0.5 rounded text-orange-400 text-xs ml-1">claude --agent senior-engineer</code>.
              </div>
              <a href="/submit?type=agent" className="shrink-0 text-xs text-orange-400 border border-orange-500/30 px-3 py-1.5 rounded-lg hover:bg-orange-500/10 transition-colors">
                Submit an agent →
              </a>
            </div>
          )}

          {!isFiltered && featuredAgents.skills.length > 0 && (
            <section className="mb-10">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Featured</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {featuredAgents.skills.map((s) => <AgentCard key={s.id} skill={s} featured />)}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              {isFiltered ? `${totalCount} results` : "All agents"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {agentsResult.skills.map((s) => <AgentCard key={s.id} skill={s} />)}
            </div>
            {agentsResult.skills.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No agents found. <a href="/submit?type=agent" className="text-orange-400 hover:underline">Submit one!</a>
              </div>
            )}
            <Pagination page={page} pages={totalPages} total={totalCount} buildUrl={buildUrl} />
          </section>
        </>
      )}
    </div>
  );
}
