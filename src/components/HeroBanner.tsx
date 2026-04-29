"use client";

interface HeroBannerProps {
  isLoggedIn: boolean;
}

export function HeroBanner({ isLoggedIn }: HeroBannerProps) {
  if (isLoggedIn) return null;

  return (
    <div className="mb-8 border border-gray-800 bg-gray-950 p-5 font-mono">
      <p className="text-xs text-gray-600 uppercase tracking-widest mb-3">Get started</p>
      <p className="text-gray-300 text-sm mb-4">
        Build your personal library of MCPs, skills, and agents.{" "}
        <span className="text-gray-500">Install your full stack with one command.</span>
      </p>
      <a
        href="/auth/signin?callbackUrl=/library"
        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        <span className="text-gray-600">$</span> sign in to start →
      </a>
    </div>
  );
}
