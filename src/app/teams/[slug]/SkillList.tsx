"use client";
import { useState } from "react";
import type { TeamSkill } from "@prisma/client";

export function SkillList({
  teamSlug,
  skills,
  isOwner,
}: {
  teamSlug: string;
  skills: TeamSkill[];
  isOwner: boolean;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  async function handleRemove(skillSlug: string) {
    setRemoving(skillSlug);
    await fetch(`/api/teams/${teamSlug}/skills/${skillSlug}`, { method: "DELETE" });
    window.location.reload();
  }

  if (skills.length === 0) {
    return (
      <p className="text-sm text-gray-600 py-2">
        No skills yet. Add a prompt or agent to share with the team.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {skills.map((skill) => (
        <div key={skill.id} className="border border-gray-800 rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800/50 transition-colors"
            onClick={() => setExpanded(expanded === skill.id ? null : skill.id)}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`text-xs px-2 py-0.5 rounded-full border font-mono ${
                skill.type === "agent"
                  ? "bg-orange-500/10 border-orange-500/20 text-orange-400"
                  : "bg-purple-500/10 border-purple-500/20 text-purple-400"
              }`}>
                {skill.type === "agent" ? "agent" : "prompt"}
              </span>
              <div className="min-w-0">
                <span className="text-sm text-white font-medium">{skill.name}</span>
                <span className="text-xs text-gray-500 ml-2 font-mono">/{skill.slug}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isOwner && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleRemove(skill.slug); }}
                  disabled={removing === skill.slug}
                  className="text-xs text-gray-600 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  Remove
                </button>
              )}
              <span className="text-gray-600 text-xs">{expanded === skill.id ? "▲" : "▼"}</span>
            </div>
          </div>

          {expanded === skill.id && (
            <div className="px-4 pb-4 border-t border-gray-800 pt-3 space-y-2">
              {skill.description && (
                <p className="text-sm text-gray-400">{skill.description}</p>
              )}
              <pre className="bg-gray-950 rounded-lg p-3 text-xs text-gray-300 font-mono overflow-x-auto whitespace-pre-wrap">
                {skill.content}
              </pre>
              <p className="text-xs text-gray-600">
                {skill.type === "prompt"
                  ? `Synced to ~/.claude/commands/<team>-${skill.slug}.md — use as /<team>-${skill.slug} in Claude Code`
                  : `Agent system prompt — synced via mcp sync`}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
