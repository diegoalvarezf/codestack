import type { Metadata } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { auth } from "@/lib/auth";
import { NavProfile } from "@/components/NavProfile";
import { MobileMenu } from "@/components/MobileMenu";
import { getT } from "@/lib/i18n";
import { Toaster } from "@/components/Toaster";
import { IconHexagon } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Codestack — Install your full AI dev environment in one command",
  description: "Discover and install stacks, MCP servers, skills, and agents for Claude Code, Cursor, Continue, and more.",
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
            <span>Codestack</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-6 text-sm text-gray-400">
            {session && (
              <a href="/library" className="hover:text-white transition-colors hidden sm:block text-sm">Library</a>
            )}
            <a href="/stacks" className="hover:text-white transition-colors hidden sm:block">{t.stacks}</a>
            <a href="/install-cli" className="hover:text-white transition-colors hidden sm:block">{t.cli}</a>
            <NavProfile user={session?.user ?? null} />
            <MobileMenu links={[
              { label: t.stacks, href: "/stacks" },
              { label: "Audits", href: "/audits" },
              { label: "API", href: "/docs" },
              { label: t.cli, href: "/install-cli" },
            ]} />
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-800 px-6 py-8 mt-20 text-center text-sm text-gray-500">
          <p>{t.footer}</p>
          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-gray-600">
            <a href="/docs" className="hover:text-gray-400 transition-colors">API</a>
            <a href="/audits" className="hover:text-gray-400 transition-colors">Audits</a>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}
