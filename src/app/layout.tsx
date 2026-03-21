import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MCPHub — Discover and install Model Context Protocol servers",
  description: "The open hub for MCP servers. Find, install, and manage servers for Claude Code, Cursor, Continue, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <nav className="border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <span className="text-blue-400">⬡</span>
            <span>MCPHub</span>
          </a>
          <div className="flex items-center gap-3 sm:gap-6 text-sm text-gray-400">
            <a href="/" className="hover:text-white transition-colors">Browse</a>
            <a href="/submit" className="hover:text-white transition-colors">Submit</a>
            <a href="/install-cli" className="hover:text-white transition-colors hidden sm:block">CLI</a>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors hidden md:block"
            >
              Docs
            </a>
            <a
              href="https://github.com/sallyheller/mcp-registry"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-md transition-colors"
            >
              GitHub
            </a>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-gray-800 px-6 py-8 mt-20 text-center text-sm text-gray-500">
          MCPHub — Open source. Built for the MCP community.
        </footer>
      </body>
    </html>
  );
}
