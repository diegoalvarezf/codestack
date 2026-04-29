"use client";
import { useState } from "react";
import type { McpServer } from "@/lib/types";
import { useT } from "@/lib/use-t";
import {
  IconCheck, IconShieldCheck, IconShieldQuestion, IconShieldAlert,
  IconStar, IconDownload, IconVSCode,
} from "@/components/Icons";
import { SaveButton } from "@/components/SaveButton";

function getGithubAvatar(repoUrl: string, authorUrl?: string | null): string | null {
  for (const url of [authorUrl, repoUrl]) {
    if (!url) continue;
    const match = url.match(/github\.com\/([^/]+)/);
    if (match) return `https://github.com/${match[1]}.png?size=40`;
  }
  return null;
}

function buildVSCodeUri(server: McpServer): string | null {
  if (!server.configJson) return null;
  try {
    const config = JSON.parse(server.configJson);
    const payload = JSON.stringify({ name: server.slug, ...config });
    return `vscode:mcp/install?${encodeURIComponent(payload)}`;
  } catch {
    return null;
  }
}

const RISK_STYLES: Record<string, string> = {
  safe:    "text-green-400 border-green-500/30 bg-green-500/10",
  low:     "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
  medium:  "text-orange-400 border-orange-500/30 bg-orange-500/10",
  high:    "text-red-400 border-red-500/30 bg-red-500/10",
  unknown: "text-gray-500 border-gray-700 bg-gray-800/50",
};

const RISK_LABELS: Record<string, string> = {
  safe: "Safe", low: "Low risk", medium: "Medium risk", high: "High risk", unknown: "Unaudited",
};

function RiskIcon({ level }: { level: string }) {
  if (level === "safe") return <IconShieldCheck size={12} />;
  if (level === "unknown") return <IconShieldQuestion size={12} />;
  return <IconShieldAlert size={12} />;
}

export function ServerCard({ server, featured, rank, savedInLibrary }: { server: McpServer; featured?: boolean; rank?: number; savedInLibrary?: boolean }) {
  const t = useT();
  const avatar = getGithubAvatar(server.repoUrl, server.authorUrl);
  const [copied, setCopied] = useState(false);
  const vscodeUri = buildVSCodeUri(server);
  const riskStyle = RISK_STYLES[server.riskLevel] ?? RISK_STYLES.unknown;
  const riskLabel = RISK_LABELS[server.riskLevel] ?? "Unaudited";

  function handleLocalInstall(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(`mcp install ${server.slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

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
            {rank !== undefined && (
              <span className="text-xs text-gray-600 font-mono w-5 shrink-0 text-right">{rank}</span>
            )}
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
              <span title="Verified" className="text-blue-400 shrink-0">
                <IconCheck size={12} />
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {server.avgRating && server.reviewCount && server.reviewCount >= 3 && server.avgRating >= 4.5 && (
              <span title={`★ ${server.avgRating} (${server.reviewCount} reviews)`} className="text-yellow-400">
                <IconStar size={13} />
              </span>
            )}
            {server.avgRating && server.reviewCount && (server.reviewCount < 3 || server.avgRating < 4.5) && (
              <span className="text-xs text-yellow-400 flex items-center gap-0.5">
                <IconStar size={11} /> {server.avgRating}
              </span>
            )}
            <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded border ${riskStyle}`} title={`Security: ${riskLabel}`}>
              <RiskIcon level={server.riskLevel} />
            </span>
            {savedInLibrary !== undefined && (
              <SaveButton type="server" itemSlug={server.slug} initialSaved={savedInLibrary} size="sm" />
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
            {server.stars > 0 && (
              <span className="flex items-center gap-1 text-yellow-500/80">
                <IconStar size={11} />
                {server.stars >= 1000
                  ? `${(server.stars / 1000).toFixed(1)}k`
                  : server.stars.toLocaleString()}
              </span>
            )}
            {server.npmDownloads > 0 ? (
              <span className="flex items-center gap-1" title="npm weekly downloads">
                <IconDownload size={11} />
                {server.npmDownloads >= 1000
                  ? `${(server.npmDownloads / 1000).toFixed(1)}k`
                  : server.npmDownloads.toLocaleString()}
                <span className="text-gray-700">/w</span>
              </span>
            ) : server.downloadCount > 0 ? (
              <span className="flex items-center gap-1" title="CLI installs">
                <IconDownload size={11} />
                {server.downloadCount.toLocaleString()}
              </span>
            ) : null}
          </div>
        </div>
      </a>

      {/* Install buttons */}
      {server.installCmd && (
        <div className="px-4 sm:px-5 pb-4 pt-0 flex gap-2">
          {vscodeUri ? (
            <a
              href={vscodeUri}
              onClick={(e) => e.stopPropagation()}
              title="Install in VS Code"
              className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                featured
                  ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
                  : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
              }`}
            >
              <IconVSCode size={13} className="shrink-0" />
              VS Code
            </a>
          ) : null}

          <button
            onClick={handleLocalInstall}
            title="Copy CLI install command"
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
              vscodeUri ? "flex-1" : "w-full"
            } ${
              featured
                ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30"
                : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
            }`}
          >
            {copied ? (
              <><IconCheck size={13} /><span>{t.copied}</span></>
            ) : (
              <><IconDownload size={13} /><span className="font-mono">{t.install}</span></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
