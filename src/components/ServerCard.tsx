import type { McpServer } from "@/lib/types";

export function ServerCard({ server, featured }: { server: McpServer; featured?: boolean }) {
  return (
    <a
      href={`/server/${server.slug}`}
      className={`group block rounded-xl border p-5 transition-all hover:border-gray-600 hover:-translate-y-0.5 ${
        featured
          ? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
          : "border-gray-800 bg-gray-900 hover:bg-gray-800"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white group-hover:text-blue-400 transition-colors">
            {server.name}
          </span>
          {server.verified && (
            <span title="Verified" className="text-blue-400 text-xs">✓</span>
          )}
        </div>
        {server.avgRating && (
          <span className="text-xs text-yellow-400">
            ★ {server.avgRating}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {server.description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {server.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{server.authorName}</span>
        <div className="flex items-center gap-3">
          <span className="font-mono">{server.transport}</span>
          {server.npmPackage && (
            <span className="text-green-400/70">npm</span>
          )}
        </div>
      </div>
    </a>
  );
}
