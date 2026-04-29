"use client";
import { useState } from "react";
import { ServerCard } from "@/components/ServerCard";
import { SkillCard } from "@/components/SkillCard";
import { AgentCard } from "@/components/AgentCard";
import type { McpServer } from "@/lib/types";
import type { Skill } from "@prisma/client";

type FilterTab = "all" | "mcps" | "skills" | "agents";

interface LibraryGridProps {
  servers: (McpServer & { savedInLibrary: boolean })[];
  skills: (Skill & { savedInLibrary: boolean })[];
  agents: (Skill & { savedInLibrary: boolean })[];
  stacks: { slug: string; name: string; icon: string; items: { itemSlug: string }[] }[];
}

export function LibraryGrid({ servers, skills, agents }: LibraryGridProps) {
  const [filter, setFilter] = useState<FilterTab>("all");

  const tabs: { id: FilterTab; label: string; count: number; color: string }[] = [
    { id: "all",    label: "All",    count: servers.length + skills.length + agents.length, color: "text-white" },
    { id: "mcps",   label: "MCPs",   count: servers.length, color: "text-blue-400" },
    { id: "skills", label: "Skills", count: skills.length,  color: "text-purple-400" },
    { id: "agents", label: "Agents", count: agents.length,  color: "text-orange-400" },
  ];

  const showServers = filter === "all" || filter === "mcps";
  const showSkills  = filter === "all" || filter === "skills";
  const showAgents  = filter === "all" || filter === "agents";

  const total = servers.length + skills.length + agents.length;

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              filter === tab.id
                ? `${tab.color} border-current`
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs opacity-60">{tab.count}</span>
          </button>
        ))}
      </div>

      {total === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">📚</p>
          <p className="text-lg font-medium mb-2 text-gray-300">Your library is empty</p>
          <p className="text-sm mb-6">Save MCPs, skills, and agents from the registry, or add your own.</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <a href="/" className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-sm text-blue-300 hover:bg-blue-600/30 transition-colors">
              Browse registry →
            </a>
            <a href="/library/add" className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-700 transition-colors">
              Add external MCP
            </a>
          </div>
        </div>
      )}

      {/* MCP Servers */}
      {showServers && servers.length > 0 && (
        <section className="mb-10">
          {filter === "all" && (
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              MCPs ({servers.length})
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {servers.map((s) => (
              <ServerCard key={s.id} server={s} savedInLibrary={s.savedInLibrary} />
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {showSkills && skills.length > 0 && (
        <section className="mb-10">
          {filter === "all" && (
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Skills ({skills.length})
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {skills.map((s) => (
              <SkillCard key={s.id} skill={s as any} savedInLibrary={s.savedInLibrary} />
            ))}
          </div>
        </section>
      )}

      {/* Agents */}
      {showAgents && agents.length > 0 && (
        <section>
          {filter === "all" && (
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
              Agents ({agents.length})
            </h2>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {agents.map((s) => (
              <AgentCard key={s.id} skill={s as any} savedInLibrary={s.savedInLibrary} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
