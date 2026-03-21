"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ICONS = ["⚡", "🔍", "📊", "🚀", "📋", "🔒", "🛠️", "🎯", "🧪", "💡", "🌐", "📦"];

type ItemType = "server" | "skill" | "agent";

interface StackItem {
  type: ItemType;
  itemSlug: string;
}

const TYPE_COLORS: Record<ItemType, string> = {
  server: "bg-blue-500/20 border-blue-500/40 text-blue-300",
  skill: "bg-purple-500/20 border-purple-500/40 text-purple-300",
  agent: "bg-orange-500/20 border-orange-500/40 text-orange-300",
};

export function CreateStackForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📦");
  const [isPublic, setIsPublic] = useState(false);
  const [items, setItems] = useState<StackItem[]>([]);
  const [addType, setAddType] = useState<ItemType>("server");
  const [addSlug, setAddSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addItem() {
    const slug = addSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (!slug) return;
    if (items.some(i => i.itemSlug === slug)) return;
    setItems(prev => [...prev, { type: addType, itemSlug: slug }]);
    setAddSlug("");
  }

  function removeItem(slug: string) {
    setItems(prev => prev.filter(i => i.itemSlug !== slug));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/stacks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, icon, public: isPublic, items }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Error creating stack");
      setLoading(false);
      return;
    }
    router.push(`/stacks/${data.slug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Icon */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(i => (
            <button key={i} type="button" onClick={() => setIcon(i)}
              className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all ${icon === i ? "border-white bg-gray-700" : "border-gray-700 bg-gray-900 hover:border-gray-600"}`}>
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Name *</label>
        <input
          value={name} onChange={e => setName(e.target.value)} required
          placeholder="My Full-Stack Kit"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-1.5">Description</label>
        <input
          value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What's this stack for?"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
        />
      </div>

      {/* Add items */}
      <div>
        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Items</label>
        <div className="flex gap-2 mb-3">
          <select value={addType} onChange={e => setAddType(e.target.value as ItemType)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500">
            <option value="server">MCP Server</option>
            <option value="skill">Skill</option>
            <option value="agent">Agent</option>
          </select>
          <input
            value={addSlug} onChange={e => setAddSlug(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
            placeholder="slug (e.g. github, review-pr)"
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-gray-500"
          />
          <button type="button" onClick={addItem}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-white transition-colors">
            Add
          </button>
        </div>

        {items.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {items.map(item => (
              <div key={item.itemSlug} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs ${TYPE_COLORS[item.type]}`}>
                <span className="font-mono">{item.itemSlug}</span>
                <span className="text-gray-500 text-[10px]">{item.type === "server" ? "MCP" : item.type}</span>
                <button type="button" onClick={() => removeItem(item.itemSlug)} className="ml-0.5 opacity-60 hover:opacity-100">✕</button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600">No items yet. Add servers, skills, or agents by slug.</p>
        )}
      </div>

      {/* Public toggle */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-start gap-4">
          <button type="button" onClick={() => setIsPublic(p => !p)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors mt-0.5 ${isPublic ? "bg-green-600" : "bg-gray-700"}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
          <div>
            <p className="text-sm font-medium text-white">{isPublic ? "Public" : "Private"}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {isPublic ? "Visible to everyone in the stacks directory." : "Only you can see this stack."}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={loading || !name.trim()}
          className="px-6 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 transition-colors">
          {loading ? "Creating..." : "Create stack"}
        </button>
        <a href="/stacks" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">Cancel</a>
      </div>
    </form>
  );
}
