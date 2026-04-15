"use client";

import { useState, useEffect } from "react";

const EXAMPLES = ["github", "postgres", "filesystem", "slack", "brave-search", "puppeteer"];

export function CliCommand() {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIndex(i => (i + 1) % EXAMPLES.length);
        setAnimating(false);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg px-5 py-2.5 font-mono text-sm text-gray-300">
      <span className="text-gray-600 select-none">$ </span>
      npx @diegoalvarezf/codestack install{" "}
      <span className="inline-block overflow-hidden align-bottom" style={{ height: "1.25em" }}>
        <span
          className="inline-block text-blue-400 transition-transform transition-opacity duration-400"
          style={{
            transform: animating ? "translateY(-100%)" : "translateY(0%)",
            opacity: animating ? 0 : 1,
          }}
        >
          {EXAMPLES[index]}
        </span>
      </span>
    </div>
  );
}
