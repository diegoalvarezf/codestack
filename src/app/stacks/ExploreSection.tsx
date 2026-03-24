"use client";
import { useState } from "react";
import { IconZap, IconSearch, IconDatabase, IconRocket, IconClipboard, IconShield } from "@/components/Icons";

const STACK_ICONS: Record<string, React.ReactNode> = {
  "full-stack-dev":   <IconZap size={18} />,
  "research":         <IconSearch size={18} />,
  "data-engineering": <IconDatabase size={18} />,
  "devops":           <IconRocket size={18} />,
  "product-team":     <IconClipboard size={18} />,
  "security":         <IconShield size={18} />,
};

interface CuratedStack {
  slug: string;
  name: string;
  description: string;
  icon: string;
  servers: string[];
  skills: string[];
  agents: string[];
}

interface CommunityStack {
  slug: string;
  name: string;
  description?: string | null;
  icon: string;
  createdBy: string;
  items: { type: string }[];
}

interface Props {
  curated: CuratedStack[];
  community: CommunityStack[];
  serversLabel: string;
  skillsLabel: string;
  agentsLabel: string;
  byLabel: string;
}

export function ExploreSection({ curated, community, serversLabel, skillsLabel, agentsLabel, byLabel }: Props) {
  const [open, setOpen] = useState(false);
  const total = curated.length + community.length;

  return (
    <section>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full group flex items-center justify-between px-5 py-4 rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">◈</span>
          <div className="text-left">
            <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Explore stacks</p>
            <p className="text-xs text-gray-500 mt-0.5">{curated.length} curated · {community.length} community</p>
          </div>
        </div>
        <span className={`text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      {/* Content */}
      {open && (
        <div className="mt-4 space-y-8">
          {/* Curated */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Curated</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {curated.map((stack) => (
                <a key={stack.slug} href={`/stacks/${stack.slug}`}
                  className="group block rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all hover:-translate-y-0.5 p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl border bg-gray-800 text-gray-400 border-gray-700 shrink-0">
                      {STACK_ICONS[stack.slug] ?? stack.icon}
                    </span>
                    <div>
                      <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{stack.name}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {stack.servers.length > 0 && <span className="text-xs text-gray-500">{stack.servers.length} {serversLabel}</span>}
                        {stack.skills.length > 0 && <span className="text-xs text-gray-500">{stack.skills.length} {skillsLabel}</span>}
                        {stack.agents.length > 0 && <span className="text-xs text-gray-500">{stack.agents.length} {agentsLabel}</span>}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{stack.description}</p>
                </a>
              ))}
            </div>
          </div>

          {/* Community */}
          {community.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Community</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {community.map((stack) => {
                  const servers = stack.items.filter(i => i.type === "server").length;
                  const skills = stack.items.filter(i => i.type === "skill").length;
                  const agents = stack.items.filter(i => i.type === "agent").length;
                  return (
                    <a key={stack.slug} href={`/stacks/${stack.slug}`}
                      className="group block rounded-xl border border-gray-800 bg-gray-900 hover:border-gray-600 hover:bg-gray-800 transition-all hover:-translate-y-0.5 p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-xl border bg-gray-800 border-gray-700 text-gray-300 font-semibold shrink-0">
                          {stack.icon || stack.name[0]}
                        </span>
                        <div>
                          <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">{stack.name}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            {servers > 0 && <span className="text-xs text-gray-500">{servers} {serversLabel}</span>}
                            {skills > 0 && <span className="text-xs text-gray-500">{skills} {skillsLabel}</span>}
                            {agents > 0 && <span className="text-xs text-gray-500">{agents} {agentsLabel}</span>}
                            <span className="text-xs text-gray-600">{byLabel} {stack.createdBy}</span>
                          </div>
                        </div>
                      </div>
                      {stack.description && (
                        <p className="text-sm text-gray-400 leading-relaxed">{stack.description}</p>
                      )}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {community.length === 0 && (
            <p className="text-sm text-gray-600 text-center py-4">No community stacks yet — be the first to share one.</p>
          )}
        </div>
      )}
    </section>
  );
}
