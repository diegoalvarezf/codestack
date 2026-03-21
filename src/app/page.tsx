import { getServers } from "@/lib/servers";
import { getSkills } from "@/lib/skills-db";
import { ServerCard } from "@/components/ServerCard";
import { SearchBar } from "@/components/SearchBar";
import { Pagination } from "@/components/Pagination";
import { STACKS } from "@/lib/stacks";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; client?: string; page?: string };
}) {
  const query = searchParams.q;
  const tag = searchParams.tag;
  const client = searchParams.client;
  const page = parseInt(searchParams.page ?? "1");

  const isFiltered = query || tag || client;

  const [featuredResult, result, featuredSkills] = await Promise.all([
    !isFiltered ? getServers({ featured: true }) : Promise.resolve({ servers: [], total: 0, pages: 0 }),
    getServers({ query, tag, client, page }),
    !isFiltered ? getSkills({ featured: true }) : Promise.resolve({ skills: [], total: 0, pages: 0 }),
  ]);

  const featured = featuredResult.servers;

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    if (client) params.set("client", client);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      {!isFiltered && (
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-sm px-3 py-1 rounded-full mb-5 border border-blue-500/20">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            {result.total.toLocaleString()} servers indexed
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
            Discover MCP Servers
          </h1>
          <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto px-2">
            The open hub for{" "}
            <a href="https://modelcontextprotocol.io" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              Model Context Protocol
            </a>{" "}
            servers. Find and install with one command.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 font-mono text-sm text-green-400">
              npm install -g @mcphub/cli
            </div>
            <a href="/install-cli" className="text-sm text-blue-400 hover:underline">
              Learn more →
            </a>
          </div>
          <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Have a team?</span>
            <a href="/teams" className="text-blue-400 hover:underline">Sync your MCP stack →</a>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-6 sm:mb-10">
        <SearchBar defaultValue={query} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 sm:mb-10 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 flex-nowrap">
          {["claude-code", "cursor", "continue"].map((c) => (
            <a key={c} href={client === c ? "/" : `/?client=${c}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                client === c ? "bg-blue-500 border-blue-500 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}>
              {c === "claude-code" ? "Claude Code" : c === "cursor" ? "Cursor" : "Continue"}
            </a>
          ))}
          <div className="w-px bg-gray-800 mx-1" />
          {["filesystem", "database", "search", "git", "browser", "memory", "api"].map((t) => (
            <a key={t} href={tag === t ? "/" : `/?tag=${t}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                tag === t ? "bg-purple-500 border-purple-500 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}>
              #{t}
            </a>
          ))}
        </div>
      </div>

      {/* Skills preview */}
      {!isFiltered && featuredSkills.skills.length > 0 && (
        <section className="mb-10 sm:mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Skills & Agents</h2>
            <a href="/skills" className="text-xs text-purple-400 hover:underline">View all →</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {featuredSkills.skills.slice(0, 4).map((skill) => (
              <a
                key={skill.id}
                href={`/skills/${skill.slug}`}
                className="group flex flex-col gap-1.5 p-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white group-hover:text-purple-400 transition-colors truncate">
                    {skill.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded border shrink-0 ml-1 ${
                    skill.type === "agent"
                      ? "border-orange-500/20 text-orange-400"
                      : "border-purple-500/20 text-purple-400"
                  }`}>
                    {skill.type}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">{skill.description}</p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Stacks */}
      {!isFiltered && (
        <section className="mb-12 sm:mb-14">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Popular stacks</h2>
            <a href="/stacks" className="text-xs text-blue-400 hover:underline">View all →</a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {STACKS.map((stack) => (
              <a
                key={stack.slug}
                href={`/stacks/${stack.slug}`}
                className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all text-center"
              >
                <span className="text-2xl">{stack.icon}</span>
                <span className="text-xs text-gray-300 group-hover:text-white transition-colors font-medium leading-tight">
                  {stack.name}
                </span>
                <span className="text-xs text-gray-600">{stack.servers.length} servers</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {!isFiltered && featured.length > 0 && (
        <section className="mb-12 sm:mb-14">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 sm:mb-5">Featured</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {featured.map((s) => <ServerCard key={s.id} server={s} featured />)}
          </div>
        </section>
      )}

      {/* Results */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 sm:mb-5">
          {isFiltered
            ? `${result.total.toLocaleString()} result${result.total !== 1 ? "s" : ""}${query ? ` for "${query}"` : ""}`
            : "All servers"}
        </h2>
        {result.servers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No servers found.{" "}
            <a href="/submit" className="text-blue-400 hover:underline">Submit one!</a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {result.servers.map((s) => <ServerCard key={s.id} server={s} />)}
            </div>
            <Pagination page={page} pages={result.pages} total={result.total} buildUrl={buildUrl} />
          </>
        )}
      </section>
    </div>
  );
}
