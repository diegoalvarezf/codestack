"use client";
import type { McpServer } from "@/lib/types";

function getGithubAvatar(repoUrl: string, authorUrl?: string | null): string | null {
  // Intenta sacar el usuario/org de la URL del autor o del repo
  const url = authorUrl ?? repoUrl;
  const match = url.match(/github\.com\/([^\/]+)/);
  if (!match) return null;
  return `https://github.com/${match[1]}.png?size=40`;
}

export function ServerCard({ server, featured }: { server: McpServer; featured?: boolean }) {
  const avatar = getGithubAvatar(server.repoUrl, server.authorUrl);

  return (
    <div className={`group rounded-xl border transition-all hover:border-gray-600 hover:-translate-y-0.5 flex flex-col ${
      featured
        ? "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10"
        : "border-gray-800 bg-gray-900 hover:bg-gray-800"
    }`}>
      <a href={`/server/${server.slug}`} className="block p-4 sm:p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {avatar && (
              <img
                src={avatar}
                alt={server.authorName}
                className="w-6 h-6 rounded-full shrink-0 bg-gray-800"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <span className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
              {server.name}
            </span>
            {server.verified && (
              <span title="Verified" className="text-blue-400 text-xs shrink-0">✓</span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {server.avgRating && server.reviewCount && server.reviewCount >= 3 && server.avgRating >= 4.5 && (
              <span title={`★ ${server.avgRating} (${server.reviewCount} reviews)`} className="text-sm">⭐</span>
            )}
            {server.avgRating && server.reviewCount && (server.reviewCount < 3 || server.avgRating < 4.5) && (
              <span className="text-xs text-yellow-400">★ {server.avgRating}</span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {server.description}
        </p>

        {/* Tags */}
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

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{server.authorName}</span>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className="font-mono">{server.transport}</span>
            {server.npmPackage && <span className="text-green-400/70">npm</span>}
          </div>
        </div>
      </a>

      {/* Install button */}
      {server.installCmd && (
        <div className="px-4 sm:px-5 pb-4 pt-0">
          <a
            href={`/server/${server.slug}`}
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-medium transition-colors ${
              featured
                ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
            }`}
          >
            <span>↓</span>
            <span className="font-mono">mcp install {server.slug}</span>
          </a>
        </div>
      )}
    </div>
  );
}
