"use client";
import { useState } from "react";
import type { Skill } from "@prisma/client";
import { parseTags } from "@/lib/skills-db";
import { useT } from "@/lib/use-t";
import { IconCheck, IconDownload } from "@/components/Icons";

function getGithubAvatar(authorUrl?: string | null): string | null {
  if (!authorUrl) return null;
  const match = authorUrl.match(/github\.com\/([^/]+)/);
  return match ? `https://github.com/${match[1]}.png?size=40` : null;
}

export function AgentCard({ skill, featured }: { skill: Skill; featured?: boolean }) {
  const t = useT();
  const [copied, setCopied] = useState(false);
  const tags = parseTags(skill);
  const avatar = getGithubAvatar(skill.authorUrl);
  const installCmd = `mcp install-skill ${skill.slug}`;

  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(installCmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className={`group rounded-xl border transition-all hover:border-gray-600 hover:-translate-y-0.5 flex flex-col ${
      featured
        ? "border-orange-500/30 bg-orange-500/5 hover:bg-orange-500/10"
        : "border-gray-800 bg-gray-900 hover:bg-gray-800"
    }`}>
      <a href={`/agents/${skill.slug}`} className="block p-4 sm:p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {avatar && (
              <img src={avatar} alt={skill.authorName}
                className="w-6 h-6 rounded-full shrink-0 bg-gray-800"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            <span className="font-semibold text-white group-hover:text-orange-400 transition-colors truncate">
              {skill.name}
            </span>
            {skill.verified && (
              <span title="Verified" className="text-orange-400 shrink-0"><IconCheck size={12} /></span>
            )}
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full border bg-orange-500/10 border-orange-500/20 text-orange-400 shrink-0 ml-2">
            agent
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">{skill.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400 border border-gray-700">
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="truncate">{skill.authorName}</span>
          {skill.installCount > 0 && (
            <span className="shrink-0 ml-2 flex items-center gap-1">
              <IconDownload size={11} />
              {skill.installCount.toLocaleString()}
            </span>
          )}
        </div>
      </a>

      {/* Install button */}
      <div className="px-4 sm:px-5 pb-4 pt-0">
        <button onClick={handleCopy}
          className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            featured
              ? "bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/30"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700"
          }`}>
          {copied
            ? <><IconCheck size={13} /><span>{t.copied}</span></>
            : <><IconDownload size={13} /><span className="font-mono">{t.install}</span></>
          }
        </button>
      </div>
    </div>
  );
}
