"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export function RedocClient({ specUrl }: { specUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  function initRedoc() {
    if (initializedRef.current || !containerRef.current) return;
    const w = window as any;
    if (!w.Redoc) return;
    initializedRef.current = true;
    w.Redoc.init(
      specUrl,
      {
        theme: {
          colors: { primary: { main: "#6366f1" } },
          sidebar: { backgroundColor: "#111827", textColor: "#d1d5db" },
          rightPanel: { backgroundColor: "#1f2937" },
          typography: { fontFamily: "Inter, system-ui, sans-serif", fontSize: "15px" },
        },
        hideDownloadButton: false,
        expandResponses: "200,201",
        sortPropsAlphabetically: false,
        hideHostname: false,
        noAutoAuth: false,
      },
      containerRef.current
    );
  }

  useEffect(() => {
    // If Redoc was already loaded by the script (fast connection), init immediately
    initRedoc();
  });

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/redoc@2.1.5/bundles/redoc.standalone.js"
        strategy="afterInteractive"
        onReady={initRedoc}
      />
      <div
        ref={containerRef}
        className="min-h-screen"
        style={{ background: "#111827" }}
      />
    </>
  );
}
