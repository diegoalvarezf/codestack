"use client";

import { useState } from "react";

export function AutoAuditButton({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/admin/servers/${slug}/auto-audit`, { method: "POST" });
      const data = await res.json();
      if (data.ok) {
        setResult(data.riskLevel);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setResult("error");
      }
    } catch {
      setResult("error");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return (
      <span className="text-xs px-2 py-1 rounded border border-gray-600 text-gray-300">
        {result}
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs px-2 py-1 rounded border border-gray-700 text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-colors disabled:opacity-50 flex items-center gap-1"
    >
      {loading && (
        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      )}
      Auto-audit
    </button>
  );
}
