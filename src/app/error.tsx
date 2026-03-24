"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-32 text-center">
      <div className="text-6xl mb-6">⬡</div>
      <h1 className="text-3xl font-bold mb-3">Something went wrong</h1>
      <p className="text-gray-400 mb-2">
        An unexpected error occurred. If this keeps happening, please{" "}
        <a
          href="https://github.com/diegoalvarezf/mcp-registry/issues"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          open an issue
        </a>
        .
      </p>
      {error.digest && (
        <p className="text-xs text-gray-600 mb-8 font-mono">
          Error ID: {error.digest}
        </p>
      )}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex items-center gap-2 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          ← Back to MCPHub
        </a>
      </div>
    </div>
  );
}
