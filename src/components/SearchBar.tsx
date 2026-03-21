"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

export function SearchBar({
  defaultValue,
  baseUrl = "/",
  placeholder = "Search servers, tools, tags...",
}: {
  defaultValue?: string;
  baseUrl?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`${baseUrl}?q=${encodeURIComponent(value.trim())}`);
    } else {
      router.push(baseUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-900 border border-gray-700 rounded-xl px-5 py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors pr-20"
      />
      {!value && (
        <span className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-gray-600 border border-gray-700 rounded px-1.5 py-0.5 font-mono pointer-events-none select-none">
          /
        </span>
      )}
      <button
        type="submit"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1.5"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}
