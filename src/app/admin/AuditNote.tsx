"use client";

import { useState } from "react";

export function AuditNote({ date, notes }: { date: string | null; notes: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="flex items-start gap-1 mt-0.5">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="text-gray-600 hover:text-gray-400 transition-colors mt-px shrink-0"
        title={expanded ? "Collapse" : "Expand"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3 h-3 transition-transform ${expanded ? "rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <p className={`text-xs text-gray-500 ${expanded ? "" : "truncate max-w-sm"}`}>
        {date ? `${date} — ` : ""}{notes}
      </p>
    </div>
  );
}
