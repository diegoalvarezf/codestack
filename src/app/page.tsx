import { getServers } from "@/lib/servers";
import { ServerCard } from "@/components/ServerCard";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; client?: string };
}) {
  const query = searchParams.q;
  const tag = searchParams.tag;
  const client = searchParams.client;

  const [featured, servers] = await Promise.all([
    getServers({ featured: true }),
    getServers({ query, tag, client }),
  ]);

  const showFeatured = !query && !tag && !client;

  return (
    <div className="max-w-6xl mx-auto px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-sm px-3 py-1 rounded-full mb-6 border border-blue-500/20">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
          MCP ecosystem — growing fast
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Discover MCP Servers
        </h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          The open registry for{" "}
          <a
            href="https://modelcontextprotocol.io"
            className="text-blue-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Model Context Protocol
          </a>{" "}
          servers. Find, publish, and rate servers for Claude Code, Cursor, Continue, and more.
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-14">
        <SearchBar defaultValue={query} />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {["claude-code", "cursor", "continue"].map((c) => (
          <a
            key={c}
            href={client === c ? "/" : `/?client=${c}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              client === c
                ? "bg-blue-500 border-blue-500 text-white"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}
          >
            {c}
          </a>
        ))}
        {["filesystem", "database", "search", "git", "official"].map((t) => (
          <a
            key={t}
            href={tag === t ? "/" : `/?tag=${t}`}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              tag === t
                ? "bg-purple-500 border-purple-500 text-white"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}
          >
            #{t}
          </a>
        ))}
      </div>

      {/* Featured */}
      {showFeatured && featured.length > 0 && (
        <section className="mb-14">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            Featured
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((s) => (
              <ServerCard key={s.id} server={s} featured />
            ))}
          </div>
        </section>
      )}

      {/* All servers */}
      <section>
        {(query || tag || client) && (
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            {servers.length} result{servers.length !== 1 ? "s" : ""}
            {query ? ` for "${query}"` : ""}
          </h2>
        )}
        {!query && !tag && !client && (
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">
            All servers
          </h2>
        )}
        {servers.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No servers found.{" "}
            <a href="/submit" className="text-blue-400 hover:underline">
              Submit one!
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servers.map((s) => (
              <ServerCard key={s.id} server={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
