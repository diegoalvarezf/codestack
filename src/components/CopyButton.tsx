"use client";

import { useState } from "react";
import { IconCopy, IconCheck } from "@/components/Icons";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 border border-gray-700 hover:border-gray-500 px-2 py-1 rounded transition-colors shrink-0"
    >
      {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
