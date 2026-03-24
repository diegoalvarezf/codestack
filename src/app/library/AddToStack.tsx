"use client";
import { useState, useRef, useEffect } from "react";

interface Stack {
  slug: string;
  name: string;
  icon: string;
  items: { itemSlug: string }[];
}

interface Props {
  itemSlug: string;
  type: "server" | "skill" | "agent";
  stacks: Stack[];
}

export function AddToStack({ itemSlug, type, stacks }: Props) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const s of stacks) {
      if (s.items.some(i => i.itemSlug === itemSlug)) map[s.slug] = true;
    }
    return map;
  });
  const [loading, setLoading] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function toggle(stack: Stack) {
    if (loading) return;
    setLoading(stack.slug);
    const isAdded = added[stack.slug];
    try {
      await fetch(`/api/stacks/${stack.slug}/items`, {
        method: isAdded ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, itemSlug }),
      });
      setAdded(prev => ({ ...prev, [stack.slug]: !isAdded }));
    } finally {
      setLoading(null);
    }
  }

  if (stacks.length === 0) return null;

  return (
    <div ref={ref} className="relative" onClick={e => e.preventDefault()}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Add to stack"
        className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white transition-colors"
      >
        <span className="text-base leading-none">⬡</span>
        <span>Stack</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 pt-3 pb-1">Add to stack</p>
          {stacks.map(stack => {
            const isAdded = added[stack.slug];
            const isLoading = loading === stack.slug;
            return (
              <button
                key={stack.slug}
                onClick={() => toggle(stack)}
                disabled={isLoading}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors text-left ${
                  isAdded ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20" : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="text-base shrink-0">{stack.icon}</span>
                <span className="truncate flex-1">{stack.name}</span>
                {isLoading ? (
                  <span className="text-gray-600 shrink-0">…</span>
                ) : isAdded ? (
                  <span className="text-blue-400 shrink-0 text-xs">✓</span>
                ) : (
                  <span className="text-gray-700 shrink-0 text-xs">+</span>
                )}
              </button>
            );
          })}
          <div className="border-t border-gray-800 p-2">
            <a href="/stacks/new" className="block w-full text-center text-xs text-gray-600 hover:text-gray-400 py-1 transition-colors">
              + New stack
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
