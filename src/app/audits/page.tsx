import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { getT } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Security Audits — MCPHub",
  description: "Security audit status of all MCP servers in the MCPHub registry",
};

const RISK_ORDER = ["safe", "low", "medium", "high", "unknown"];

const RISK_BADGE: Record<string, { label: string; cls: string }> = {
  safe:    { label: "Safe",        cls: "text-green-400 bg-green-500/10 border-green-500/30" },
  low:     { label: "Low risk",    cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  medium:  { label: "Medium risk", cls: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  high:    { label: "High risk",   cls: "text-red-400 bg-red-500/10 border-red-500/30" },
  unknown: { label: "Unaudited",   cls: "text-gray-400 bg-gray-800 border-gray-700" },
};

export default async function AuditsPage() {
  const lang = (await cookies()).get("lang")?.value ?? "en";
  const t = getT(lang);

  const servers = await prisma.server.findMany({
    select: {
      slug: true, name: true, authorName: true, repoUrl: true,
      riskLevel: true, verified: true, featured: true,
      downloadCount: true, tags: true,
    },
    orderBy: [
      { riskLevel: "asc" },
      { downloadCount: "desc" },
    ],
  });

  const counts = RISK_ORDER.reduce<Record<string, number>>((acc, r) => {
    acc[r] = servers.filter(s => (s.riskLevel || "unknown") === r).length;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
        ← {t.backToMcpHub}
      </a>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Security Audits</h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Security audit status for all MCP servers in the registry. Servers marked <span className="text-green-400">Safe</span> have been reviewed.
          Always review server code before granting access to your environment.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
        {RISK_ORDER.map((r) => {
          const b = RISK_BADGE[r];
          return (
            <div key={r} className={`rounded-xl border px-4 py-3 text-center ${b.cls}`}>
              <div className="text-2xl font-bold">{counts[r] ?? 0}</div>
              <div className="text-xs mt-0.5 opacity-80">{b.label}</div>
            </div>
          );
        })}
      </div>

      {/* Info banner */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-8 text-sm text-gray-400">
        <span className="text-blue-400 font-medium">How audits work: </span>
        MCPHub manually reviews submitted servers. Servers are checked for credential theft, data exfiltration, code injection,
        and prompt injection vulnerabilities. Verified servers have passed our review.{" "}
        <a href="mailto:security@mcphub.dev" className="text-blue-400 hover:underline">Report a security issue →</a>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/60">
              <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Server</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide font-medium hidden sm:table-cell">Author</th>
              <th className="text-left px-4 py-3 text-xs text-gray-500 uppercase tracking-wide font-medium">Risk</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wide font-medium hidden md:table-cell">Downloads</th>
              <th className="text-right px-4 py-3 text-xs text-gray-500 uppercase tracking-wide font-medium hidden lg:table-cell">Repo</th>
            </tr>
          </thead>
          <tbody>
            {servers.map((server, i) => {
              const risk = server.riskLevel || "unknown";
              const badge = RISK_BADGE[risk] ?? RISK_BADGE.unknown;
              const repoShort = server.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "");
              return (
                <tr
                  key={server.slug}
                  className={`border-b border-gray-800/60 hover:bg-gray-900/50 transition-colors ${i % 2 === 0 ? "" : "bg-gray-900/20"}`}
                >
                  <td className="px-4 py-3">
                    <a href={`/server/${server.slug}`} className="font-medium text-white hover:text-blue-400 transition-colors">
                      {server.name}
                    </a>
                    {server.verified && (
                      <span className="ml-2 text-xs text-blue-400">✓</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{server.authorName}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500 hidden md:table-cell">
                    {server.downloadCount > 0 ? server.downloadCount.toLocaleString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <a
                      href={server.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-gray-500 hover:text-gray-300 font-mono transition-colors"
                    >
                      {repoShort}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {servers.length === 0 && (
          <div className="text-center py-16 text-gray-600">No servers in registry yet.</div>
        )}
      </div>
    </div>
  );
}
