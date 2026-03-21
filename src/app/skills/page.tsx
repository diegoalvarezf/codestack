import type { Metadata } from "next";
import { getSkills } from "@/lib/skills-db";
import { SkillCard } from "@/components/SkillCard";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skills & Agents — MCPHub",
  description: "Discover and install prompts, slash commands, and AI agents for Claude Code and Cursor.",
};

const TAGS = ["code-review", "git", "testing", "security", "documentation", "debugging", "productivity", "architecture"];

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: { q?: string; type?: string; tag?: string; page?: string };
}) {
  const query = searchParams.q;
  const type = searchParams.type;
  const tag = searchParams.tag;
  const page = parseInt(searchParams.page ?? "1");
  const isFiltered = query || type || tag;

  const [featuredResult, result] = await Promise.all([
    !isFiltered
      ? getSkills({ featured: true })
      : Promise.resolve({ skills: [], total: 0, pages: 0 }),
    getSkills({ query, type, tag, page }),
  ]);

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (type) params.set("type", type);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/skills?${qs}` : "/skills";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {/* Hero */}
      {!isFiltered && (
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 text-sm px-3 py-1 rounded-full mb-5 border border-purple-500/20">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            {result.total} skills & agents
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">
            Skills & Agents
          </h1>
          <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto px-2">
            Prompts that become{" "}
            <span className="text-purple-400">/slash-commands</span> and agents with
            custom system prompts. Install in one command.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <div className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 font-mono text-sm text-green-400">
              mcp install-skill review-pr
            </div>
            <a href="/skills/submit" className="text-sm text-purple-400 hover:underline">
              Submit a skill →
            </a>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <SearchBar defaultValue={query} baseUrl="/skills" placeholder="Search skills and agents..." />
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 flex-nowrap">
          {/* Type filter */}
          {[
            { id: "prompt", label: "Prompts" },
            { id: "agent", label: "Agents" },
          ].map(({ id, label }) => (
            <a
              key={id}
              href={type === id ? "/skills" : `/skills?type=${id}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                type === id
                  ? "bg-purple-500 border-purple-500 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              {label}
            </a>
          ))}
          <div className="w-px bg-gray-800 mx-1" />
          {TAGS.map((t) => (
            <a
              key={t}
              href={tag === t ? "/skills" : `/skills?tag=${t}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                tag === t
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              #{t}
            </a>
          ))}
        </div>
      </div>

      {/* Featured */}
      {!isFiltered && featuredResult.skills.length > 0 && (
        <section className="mb-12 sm:mb-14">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 sm:mb-5">Featured</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {featuredResult.skills.map((s) => <SkillCard key={s.id} skill={s} featured />)}
          </div>
        </section>
      )}

      {/* All */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 sm:mb-5">
          {isFiltered
            ? `${result.total} result${result.total !== 1 ? "s" : ""}${query ? ` for "${query}"` : ""}`
            : "All skills & agents"}
        </h2>
        {result.skills.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No skills found.{" "}
            <a href="/skills/submit" className="text-purple-400 hover:underline">Submit one!</a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {result.skills.map((s) => <SkillCard key={s.id} skill={s} />)}
            </div>
            <Pagination page={page} pages={result.pages} total={result.total} buildUrl={buildUrl} />
          </>
        )}
      </section>
    </div>
  );
}
