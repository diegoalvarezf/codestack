import { notFound } from "next/navigation";
import { getServer } from "@/lib/servers";

export const dynamic = "force-dynamic";

export default async function ServerPage({ params }: { params: { slug: string } }) {
  const server = await getServer(params.slug);
  if (!server) notFound();

  const clientLabels: Record<string, string> = {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    continue: "Continue.dev",
    other: "Other",
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-3xl font-bold">{server.name}</h1>
          {server.verified && (
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              ✓ Verified
            </span>
          )}
          {server.featured && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
              ★ Featured
            </span>
          )}
        </div>
        <p className="text-gray-400 text-lg mb-4">{server.description}</p>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>by {server.authorUrl
            ? <a href={server.authorUrl} className="text-blue-400 hover:underline">{server.authorName}</a>
            : server.authorName
          }</span>
          <span>·</span>
          <span>v{server.version}</span>
          <span>·</span>
          <span>{server.license}</span>
          {server.avgRating && (
            <>
              <span>·</span>
              <span className="text-yellow-400">★ {server.avgRating} ({server.reviewCount})</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Install */}
          {server.npmPackage && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Install
              </h2>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm">
                <span className="text-gray-500">$ </span>
                <span className="text-green-400">npm install -g {server.npmPackage}</span>
              </div>
            </section>
          )}

          {/* Add to Claude Code */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Add to Claude Code
            </h2>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 font-mono text-sm">
              <span className="text-gray-500">$ </span>
              <span className="text-blue-400">
                claude mcp add {server.slug} -- {server.npmPackage ?? server.slug} serve
              </span>
            </div>
          </section>

          {/* Tools */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              MCP Tools ({server.tools.length})
            </h2>
            <div className="space-y-2">
              {server.tools.map((tool) => (
                <div
                  key={tool}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-300"
                >
                  {tool}
                </div>
              ))}
            </div>
          </section>

          {/* Long description */}
          {server.longDesc && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                About
              </h2>
              <p className="text-gray-400 leading-relaxed">{server.longDesc}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <a
              href={server.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <span>⬡</span> View on GitHub
            </a>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Transport</p>
              <span className="font-mono text-sm text-gray-300">{server.transport}</span>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Compatible with</p>
              <div className="flex flex-wrap gap-1.5">
                {server.clients.map((c) => (
                  <span key={c} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700">
                    {clientLabels[c] ?? c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {server.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/?tag=${tag}`}
                    className="text-xs bg-gray-800 text-gray-400 hover:text-gray-200 px-2 py-1 rounded-full border border-gray-700 transition-colors"
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
