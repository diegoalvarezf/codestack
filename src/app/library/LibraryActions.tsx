"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LibraryActions({
  slug,
  type,
  published,
}: {
  slug: string;
  type: "skill" | "agent";
  published: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [isPublished, setIsPublished] = useState(published);

  async function togglePublish() {
    setBusy(true);
    const res = await fetch(`/api/skills/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !isPublished }),
    });
    if (res.ok) {
      setIsPublished(p => !p);
      router.refresh();
    }
    setBusy(false);
  }

  async function handleDelete() {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setBusy(true);
    await fetch(`/api/skills/${slug}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
      <button
        onClick={togglePublish}
        disabled={busy}
        title={isPublished ? "Make private" : "Publish"}
        className={`px-2 py-1 rounded text-xs font-medium border transition-colors ${
          isPublished
            ? "bg-green-500/20 border-green-500/30 text-green-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400"
            : "bg-gray-800 border-gray-700 text-gray-400 hover:bg-green-500/20 hover:border-green-500/30 hover:text-green-400"
        }`}
      >
        {isPublished ? "Public" : "Private"}
      </button>
      <button
        onClick={handleDelete}
        disabled={busy}
        title="Delete"
        className="px-2 py-1 rounded text-xs border border-gray-700 bg-gray-800 text-gray-500 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400 transition-colors"
      >
        ✕
      </button>
    </div>
  );
}
