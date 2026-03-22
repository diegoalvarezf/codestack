"use client";

import { useState } from "react";

type Mode = "auto" | "claude";

function Spinner() {
  return (
    <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

export function AutoAuditButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState<Mode | null>(null);
  const [result, setResult] = useState<{ level: string; usedClaude: boolean } | null>(null);

  async function run(mode: Mode) {
    setLoading(mode);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/servers/${slug}/auto-audit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: mode === "claude" }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult({ level: data.riskLevel, usedClaude: data.usedClaude });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setResult({ level: "error", usedClaude: false });
      }
    } catch {
      setResult({ level: "error", usedClaude: false });
    } finally {
      setLoading(null);
    }
  }

  if (result) {
    return (
      <span className={`text-xs px-2 py-1 rounded border ${result.level === "error" ? "border-red-500/40 text-red-400" : "border-gray-600 text-gray-300"}`}>
        {result.level}{result.usedClaude ? " (claude)" : ""}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => run("auto")}
        disabled={loading !== null}
        className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {loading === "auto" && <Spinner />}
        Auto
      </button>
      <button
        onClick={() => run("claude")}
        disabled={loading !== null}
        className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:border-orange-500 hover:text-orange-400 transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {loading === "claude" && <Spinner />}
        Claude
      </button>
    </div>
  );
}
