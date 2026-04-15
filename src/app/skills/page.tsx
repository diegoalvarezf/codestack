import type { Metadata } from "next";
import { getSkills } from "@/lib/skills-db";
import { SkillCard } from "@/components/SkillCard";
import { Pagination } from "@/components/Pagination";
import { SearchBar } from "@/components/SearchBar";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Skills — Codestack",
  description: "Prompts that become /slash-commands in Claude Code. Install in one command.",
};

const TAGS = ["code-review", "git", "testing", "security", "documentation", "debugging", "productivity", "refactoring"];

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: { q?: string; tag?: string; page?: string };
}) {
  const query = searchParams.q;
  const tag = searchParams.tag;
  const page = parseInt(searchParams.page ?? "1");
  const isFiltered = query || tag;

  const [featuredResult, result] = await Promise.all([
    !isFiltered
      ? getSkills({ featured: true, type: "prompt" })
      : Promise.resolve({ skills: [], total: 0, pages: 0 }),
    getSkills({ query, type: "prompt", tag, page }),
  ]);

  function buildUrl(p: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `/skills?${qs}` : "/skills";
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      {!isFiltered && (
        <div className="text-center mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 text-purple-400 text-sm px-3 py-1 rounded-full mb-5 border border-purple-500/20">
            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
            {result.total} prompts
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4 tracking-tight">Skills</h1>
          <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto px-2">
            Prompts that install as{" "}
            <span className="text-purple-400 font-mono">/slash-commands</span> in Claude Code.
            Run them in any conversation.
          </p>
          <div className="mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4 max-w-lg mx-auto text-left space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">How it works</p>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-purple-400 font-mono shrink-0 mt-0.5">1.</span>
              <span className="text-gray-300">Install: <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-green-400">mcp install-skill review-pr</code></span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-purple-400 font-mono shrink-0 mt-0.5">2.</span>
              <span className="text-gray-300">Saved to <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">~/.claude/commands/review-pr.md</code></span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-purple-400 font-mono shrink-0 mt-0.5">3.</span>
              <span className="text-gray-300">Restart Claude Code → use <code className="bg-gray-800 px-1.5 py-0.5 rounded text-xs text-purple-400">/review-pr</code> in any conversation</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-4 text-sm">
            <a href="/agents" className="text-orange-400 hover:underline">Looking for Agents? →</a>
            <a href="/submit?type=prompt" className="text-purple-400 hover:underline">Submit a skill →</a>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto mb-6 sm:mb-8">
        <SearchBar defaultValue={query} baseUrl="/skills" placeholder="Search skills..." />
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <div className="flex gap-2 flex-nowrap">
          {TAGS.map((t) => (
            <a key={t} href={tag === t ? "/skills" : `/skills?tag=${t}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors whitespace-nowrap ${
                tag === t ? "bg-purple-500 border-purple-500 text-white"
                          : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
              }`}>
              #{t}
            </a>
          ))}
        </div>
      </div>

      {!isFiltered && featuredResult.skills.length > 0 && (
        <section className="mb-12 sm:mb-14">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 sm:mb-5">Featured</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {featuredResult.skills.map((s) => <SkillCard key={s.id} skill={s} featured />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4 sm:mb-5">
          {isFiltered
            ? `${result.total} result${result.total !== 1 ? "s" : ""}${query ? ` for "${query}"` : ""}`
            : "All skills"}
        </h2>
        {result.skills.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No skills found. <a href="/submit?type=prompt" className="text-purple-400 hover:underline">Submit one!</a>
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
