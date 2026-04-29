"use client";

interface HeroBannerProps {
  isLoggedIn: boolean;
}

export function HeroBanner({ isLoggedIn }: HeroBannerProps) {
  if (isLoggedIn) return null;

  return (
    <div className="mb-8 rounded-2xl border border-blue-500/10 bg-gradient-to-r from-blue-500/5 to-transparent p-6 flex items-center justify-between gap-6">
      <div>
        <h2 className="text-lg font-bold text-white mb-1">Your AI Dev Stack, organized.</h2>
        <p className="text-sm text-gray-400">
          Save MCPs, agents &amp; skills. Build stacks. Install everything with one command.
        </p>
      </div>
      <a
        href="/auth/signin?callbackUrl=/library"
        className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium text-white transition-colors whitespace-nowrap"
      >
        Start your library →
      </a>
    </div>
  );
}
