"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddExternalMcpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    const npmPackage = form.get("npmPackage") as string;
    const repoUrl = form.get("repoUrl") as string;
    const description = form.get("description") as string;
    const installCmd = form.get("installCmd") as string;

    try {
      const res = await fetch("/api/library/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          npmPackage: npmPackage || undefined,
          repoUrl: repoUrl || undefined,
          description: description || undefined,
          installCmd: installCmd || undefined,
        }),
      });

      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.push("/library");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <div className="mb-8">
        <a href="/library" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
          ← Back to library
        </a>
        <h1 className="text-2xl font-bold text-white mt-4 mb-1">Add external MCP</h1>
        <p className="text-gray-400 text-sm">
          Add any MCP server to your personal library — even ones not in the public registry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            name="name"
            required
            placeholder="My custom MCP"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* npm package */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            npm package
          </label>
          <input
            name="npmPackage"
            placeholder="@scope/my-mcp-server"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Repo URL */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Repository URL
          </label>
          <input
            name="repoUrl"
            type="url"
            placeholder="https://github.com/owner/repo"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <p className="text-xs text-gray-600 mt-1">At least one of npm package or repo URL is required.</p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Description
          </label>
          <textarea
            name="description"
            rows={3}
            placeholder="What does this MCP server do?"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
        </div>

        {/* Install command */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Install command
          </label>
          <input
            name="installCmd"
            placeholder="npx -y @scope/my-mcp-server"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
        >
          {loading ? "Adding…" : "Add to library"}
        </button>
      </form>
    </div>
  );
}
