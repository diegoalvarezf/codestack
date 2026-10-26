"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CLIENTS = ["claude-code", "cursor", "continue", "other"];

export function SubmitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<string[]>([]);
  const [transport, setTransport] = useState("stdio");
  const [envVars, setEnvVars] = useState<{ name: string; description: string; required: boolean; example: string }[]>([]);

  const toggleClient = (c: string) =>
    setClients((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));

  const addEnvVar = () =>
    setEnvVars((prev) => [...prev, { name: "", description: "", required: true, example: "" }]);

  const updateEnvVar = (i: number, field: string, value: string | boolean) =>
    setEnvVars((prev) => prev.map((ev, idx) => idx === i ? { ...ev, [field]: value } : ev));

  const removeEnvVar = (i: number) =>
    setEnvVars((prev) => prev.filter((_, idx) => idx !== i));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      name: fd.get("name"),
      description: fd.get("description"),
      longDesc: fd.get("longDesc") || undefined,
      repoUrl: fd.get("repoUrl"),
      npmPackage: fd.get("npmPackage") || undefined,
      authorName: fd.get("authorName"),
      authorUrl: fd.get("authorUrl") || undefined,
      license: fd.get("license") || "MIT",
      version: fd.get("version") || "0.1.0",
      tags: String(fd.get("tags")).split(",").map((t) => t.trim()).filter(Boolean),
      tools: String(fd.get("tools")).split(",").map((t) => t.trim()).filter(Boolean),
      clients,
      transport,
      installCmd: fd.get("installCmd") || undefined,
      envVars: envVars.filter((ev) => ev.name.trim()).map((ev) => ({
        name: ev.name.trim(),
        description: ev.description.trim(),
        required: ev.required,
        example: ev.example.trim() || undefined,
      })),
      category: fd.get("category") || undefined,
    };

    const res = await fetch("/api/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.push(`/server/${data.server.slug}?submitted=1`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic info */}
      <Field name="name" label="Server name" placeholder="my-mcp-server" required />
      <Field
        name="description"
        label="Short description"
        placeholder="A brief description of what this server does (20–280 chars)"
        required
        hint="Shown in search results"
      />
      <Field name="repoUrl" label="GitHub repository" placeholder="https://github.com/user/repo" required />
      <Field name="npmPackage" label="npm package" placeholder="@scope/package-name" hint="Leave empty if not published to npm" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field name="authorName" label="Author" placeholder="your-github-username" required />
        <Field name="authorUrl" label="Author URL" placeholder="https://github.com/you" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field name="version" label="Version" placeholder="0.1.0" />
        <Field name="license" label="License" placeholder="MIT" />
      </div>

      <Field
        name="tags"
        label="Tags"
        placeholder="filesystem, search, database"
        required
        hint="Comma-separated, up to 8 tags"
      />
      <Field
        name="tools"
        label="MCP Tools"
        placeholder="read_file, write_file, list_directory"
        required
        hint="Comma-separated tool names exposed by this server"
      />

      {/* Install command */}
      <Field
        name="installCmd"
        label="Install command"
        placeholder="npx -y @scope/my-mcp-server"
        hint="The exact command to run the server (used by codestack install)"
      />

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
        <select
          name="category"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        >
          <option value="">Select category</option>
          <option value="official">Official</option>
          <option value="community">Community</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>

      {/* Compatible clients */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Compatible clients <span className="text-red-400">*</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {CLIENTS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleClient(c)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                clients.includes(c)
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Transport */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Transport</label>
        <div className="flex gap-2">
          {["stdio", "sse", "http"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTransport(t)}
              className={`px-3 py-1.5 rounded-lg text-sm border font-mono transition-colors ${
                transport === t
                  ? "bg-gray-700 border-gray-500 text-white"
                  : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Env vars */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-300">
            Environment variables <span className="text-gray-500 font-normal">(optional)</span>
          </label>
          <button
            type="button"
            onClick={addEnvVar}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            + Add variable
          </button>
        </div>
        {envVars.length === 0 && (
          <p className="text-xs text-gray-500">API keys or tokens required by this server.</p>
        )}
        <div className="space-y-3">
          {envVars.map((ev, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={ev.name}
                  onChange={(e) => updateEnvVar(i, "name", e.target.value)}
                  placeholder="VARIABLE_NAME"
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm font-mono text-yellow-400 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
                <input
                  value={ev.example}
                  onChange={(e) => updateEnvVar(i, "example", e.target.value)}
                  placeholder="Example value"
                  className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <input
                value={ev.description}
                onChange={(e) => updateEnvVar(i, "description", e.target.value)}
                placeholder="Description — what is this variable for?"
                className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ev.required}
                    onChange={(e) => updateEnvVar(i, "required", e.target.checked)}
                    className="rounded"
                  />
                  Required
                </label>
                <button
                  type="button"
                  onClick={() => removeEnvVar(i)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Long description */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          Full description <span className="text-gray-500 font-normal">(optional)</span>
        </label>
        <textarea
          name="longDesc"
          rows={4}
          placeholder="Detailed description of what the server does, how to configure it, etc."
          className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || clients.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
      >
        {loading ? "Submitting..." : "Submit server"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        By submitting, you confirm this server is open source and complies with the MCP specification.
      </p>
    </form>
  );
}

function Field({
  name, label, placeholder, required, hint, type = "text",
}: {
  name: string; label: string; placeholder: string;
  required?: boolean; hint?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
      />
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}
