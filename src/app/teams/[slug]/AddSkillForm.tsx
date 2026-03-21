"use client";
import { useState } from "react";

export function AddSkillForm({ teamSlug }: { teamSlug: string }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"prompt" | "agent">("prompt");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function autoSlug(val: string) {
    return val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch(`/api/teams/${teamSlug}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, type, description, content }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Error adding skill");
    } else {
      setOpen(false);
      setName(""); setSlug(""); setDescription(""); setContent("");
      window.location.reload();
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-left px-4 py-3 rounded-lg border border-dashed border-gray-700 text-sm text-gray-500 hover:text-gray-300 hover:border-gray-500 transition-colors"
      >
        + Add skill or agent
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-700 rounded-xl p-4 space-y-3 bg-gray-900/50">
      <div className="flex gap-2">
        {(["prompt", "agent"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              type === t
                ? "bg-purple-500/20 border-purple-500/40 text-purple-300"
                : "border-gray-700 text-gray-500 hover:border-gray-500"
            }`}
          >
            {t === "prompt" ? "Prompt / Slash command" : "Agent"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Name</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setSlug(autoSlug(e.target.value)); }}
            placeholder="Review PR"
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Slash command</label>
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 gap-1">
            <span className="text-gray-500 text-sm">/</span>
            <input
              value={slug}
              onChange={(e) => setSlug(autoSlug(e.target.value))}
              placeholder="review-pr"
              required
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">Description <span className="text-gray-600">(optional)</span></label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Reviews a PR for code quality and security"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">
          {type === "prompt" ? "Prompt content" : "Agent system prompt"}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
          placeholder={type === "prompt"
            ? "Review the current PR for:\n- Code quality\n- Security issues\n- Test coverage\n\nProvide a summary and list of suggestions."
            : "You are a senior engineer reviewing code. Focus on security, performance, and maintainability..."
          }
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-gray-500 resize-none"
        />
        <p className="text-xs text-gray-600 mt-1">
          {type === "prompt"
            ? "This becomes a /slash-command in Claude Code for every team member."
            : "This system prompt runs as an agent when invoked."}
        </p>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add skill"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 border border-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
