import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { auth } from "@/lib/auth";
import { NavProfile } from "@/components/NavProfile";
import { getT } from "@/lib/i18n";
import { IconHexagon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "MCPHub — Discover and install Model Context Protocol servers",
  description: "The open hub for MCP servers. Find, install, and manage servers for Claude Code, Cursor, Continue, and more.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  const lang = cookieStore.get("lang")?.value ?? "en";
  const t = getT(lang);

  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.classList.add(t);})();`,
          }}
        />
      </head>
      <body className="bg-gray-900 text-gray-100 min-h-screen antialiased font-sans">
        <nav className="border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <IconHexagon size={20} className="text-blue-400" />
            <span>MCPHub</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-6 text-sm text-gray-400">
            <a href="/models" className="hover:text-white transition-colors hidden sm:block">Run Local</a>
            <a href="/stacks" className="hover:text-white transition-colors hidden sm:block">{t.stacks}</a>
            <a href="/audits" className="hover:text-white transition-colors hidden md:block text-sm">Audits</a>
            <a href="/install-cli" className="hover:text-white transition-colors hidden sm:block">{t.cli}</a>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors hidden md:block"
            >
              {t.docs}
            </a>
            <NavProfile user={session?.user ?? null} />
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-800 px-6 py-8 mt-20 text-center text-sm text-gray-500">
          {t.footer}
        </footer>
      </body>
    </html>
  );
}
