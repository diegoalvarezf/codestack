"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

interface SaveButtonProps {
  type: "server" | "skill" | "agent";
  itemSlug: string;
  initialSaved: boolean;
  size?: "sm" | "md";
}

export function SaveButton({ type, itemSlug, initialSaved, size = "sm" }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const colorMap = {
    server: saved ? "text-blue-400" : "text-gray-600 hover:text-blue-400",
    skill:  saved ? "text-purple-400" : "text-gray-600 hover:text-purple-400",
    agent:  saved ? "text-orange-400" : "text-gray-600 hover:text-orange-400",
  };

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      const method = saved ? "DELETE" : "POST";
      const res = await fetch("/api/library", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, itemSlug }),
      });
      if (res.status === 401) {
        router.push("/auth/signin");
        return;
      }
      if (res.ok) {
        setSaved(!saved);
        if (!saved) toast("Saved to library");
        else toast("Removed from library", "info");
      }
    } finally {
      setLoading(false);
    }
  }

  const iconSize = size === "sm" ? 15 : 18;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remove from library" : "Save to library"}
      className={`transition-colors ${colorMap[type]} disabled:opacity-50`}
      aria-label={saved ? "Remove from library" : "Save to library"}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
