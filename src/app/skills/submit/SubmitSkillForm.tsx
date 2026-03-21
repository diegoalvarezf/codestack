"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubmitSkillForm() {
  const router = useRouter();
  const [type, setType] = useState<"prompt" | "agent">("prompt");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function autoSlug(val: string) {
    return val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const tagsArray = tags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);

    const res = await fetch("/api/skills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, name, description, type, content, tags: tagsArray }),
    });

    setLoading(false);

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? "Error submitting skill");
    } else {
      const data = await res.json();
      router.push(`/skills/${data.slug}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Type */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Type</label>
        <div className="flex gap-2">
          {(["prompt", "agent"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                type === t
                  ? t === "agent"
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                    : "bg-purple-500/20 border-purple-500/40 text-purple-300"
                  : "border-gray-700 text-gray-500 hover:border-gray-500 hover:text-gray-300"
              }`}
            >
              {t === "prompt" ? "Prompt / Slash command" : "Agent"}
              <p className="text-xs font-normal mt-0.5 opacity-70">
                {t === "prompt" ? "Becomes a /slash-command" : "Custom system prompt"}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Name + Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 block">Name</label>
          <input
            value={name}
            onChange={(e) => { setName(e.target.value); setSlug(autoSlug(e.target.value)); }}
            placeholder="Review PR"
            required
            className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-1 block">
            {type === "prompt" ? "Slash command" : "Agent ID"}
          </label>
          <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 gap-1 focus-within:border-purple-500 transition-colors">
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

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-1 block">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief description of what this skill does"
          required
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {/* Content */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-1 block">
          {type === "prompt" ? "Prompt content" : "System prompt"}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          required
          placeholder={
            type === "prompt"
              ? "Review the current pull request...\n\n1. Code quality\n2. Security\n3. Tests"
              : "You are a senior software engineer...\n\nYour principles:\n- ..."
          }
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:border-purple-500 transition-colors resize-none"
        />
        <p className="text-xs text-gray-600 mt-1">
          {type === "prompt"
            ? "This is the full prompt that will run when users invoke the slash command."
            : "This is the system prompt that defines the agent's behavior and expertise."}
        </p>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-1 block">
          Tags <span className="text-gray-500 font-normal">(comma separated)</span>
        </label>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="code-review, git, security"
          className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
        />
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit skill"}
      </button>

      <p className="text-xs text-gray-600 text-center">
        Skills are reviewed before appearing in featured sections.
        They are visible immediately after submission.
      </p>
    </form>
  );
}
