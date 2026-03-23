import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Lock } from "lucide-react";
import { AutoAuditButton } from "./AutoAuditButton";
import { AuditNote } from "./AuditNote";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");
  if (session.user.role !== "admin") notFound();

  const tab = searchParams.tab ?? "servers";

  const [
    totalServers, verifiedServers,
    totalSkills, verifiedSkills,
    recentServers, recentSkills,
    topDownloaded, auditServers,
  ] = await Promise.all([
    prisma.server.count(),
    prisma.server.count({ where: { verified: true } }),
    prisma.skill.count(),
    prisma.skill.count({ where: { verified: true } }),
    prisma.server.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, slug: true, authorName: true, verified: true, featured: true, downloadCount: true, createdAt: true },
    }),
    prisma.skill.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, name: true, slug: true, type: true, authorName: true, verified: true, featured: true, installCount: true, createdAt: true },
    }),
    prisma.server.findMany({
      orderBy: { downloadCount: "desc" },
      take: 5,
      select: { name: true, slug: true, downloadCount: true },
    }),
    prisma.server.findMany({
      orderBy: [{ riskLevel: "asc" }, { downloadCount: "desc" }],
      select: { id: true, name: true, slug: true, riskLevel: true, auditNotes: true, auditedAt: true, repoUrl: true, downloadCount: true },
    }),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Servers", value: totalServers },
          { label: "Verified servers", value: verifiedServers },
          { label: "Skills & agents", value: totalSkills },
          { label: "Verified skills", value: verifiedSkills },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800 mb-6">
        {[
          { id: "servers", label: "Servers", icon: null },
          { id: "skills", label: "Skills & Agents", icon: null },
          { id: "audits", label: "Audits", icon: <Lock className="w-3.5 h-3.5" /> },
        ].map(({ id, label, icon }) => (
          <a
            key={id}
            href={`/admin?tab=${id}`}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === id
                ? "border-blue-500 text-white"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            {icon}
            {label}
          </a>
        ))}
      </div>

      {/* Servers tab */}
      {tab === "servers" && (
        <>
          <section className="mb-10">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Top downloads</h2>
            <div className="space-y-2">
              {topDownloaded.map((s) => (
                <div key={s.slug} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                  <a href={`/server/${s.slug}`} className="text-sm text-white hover:text-blue-400 transition-colors">{s.name}</a>
                  <span className="text-sm text-gray-400">{s.downloadCount} installs</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Recent servers</h2>
            <div className="space-y-2">
              {recentServers.map((s) => (
                <div key={s.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                  <div>
                    <a href={`/server/${s.slug}`} className="text-sm text-white hover:text-blue-400 transition-colors">{s.name}</a>
                    <p className="text-xs text-gray-500">by {s.authorName} · {s.downloadCount} installs</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.verified && <span className="text-xs text-blue-400">✓</span>}
                    {s.featured && <span className="text-xs text-yellow-400">★</span>}
                    <ToggleVerified slug={s.slug} verified={s.verified} />
                    <ToggleFeatured slug={s.slug} featured={s.featured} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Audits tab */}
      {tab === "audits" && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
            Risk levels — {auditServers.length} servers
          </h2>
          <div className="space-y-2">
            {auditServers.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3 gap-4">
                <div className="min-w-0 flex-1">
                  <a href={`/server/${s.slug}`} className="text-sm text-white hover:text-blue-400 transition-colors">{s.name}</a>
                  <p className="text-xs text-gray-600 font-mono truncate">
                    {s.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "")}
                  </p>
                  {s.auditNotes && (
                    <AuditNote
                      date={s.auditedAt ? new Date(s.auditedAt).toLocaleDateString() : null}
                      notes={s.auditNotes}
                    />
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <AutoAuditButton slug={s.slug} />
                  <form action={`/api/admin/servers/${s.slug}/risk`} method="POST" className="flex items-center gap-2">
                    <select
                      name="level"
                      defaultValue={s.riskLevel ?? "unknown"}
                      className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300 focus:outline-none focus:border-gray-500"
                    >
                      <option value="safe">✓ Safe</option>
                      <option value="low">Low risk</option>
                      <option value="medium">Medium risk</option>
                      <option value="high">High risk</option>
                      <option value="unknown">Unaudited</option>
                    </select>
                    <button type="submit" className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors">
                      Set
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills tab */}
      {tab === "skills" && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Recent skills & agents</h2>
          <div className="space-y-2">
            {recentSkills.map((s) => (
              <div key={s.id} className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-3">
                <div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`/${s.type === "agent" ? "agents" : "skills"}/${s.slug}`}
                      className={`text-sm text-white transition-colors ${s.type === "agent" ? "hover:text-orange-400" : "hover:text-purple-400"}`}
                    >{s.name}</a>
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${
                      s.type === "agent"
                        ? "border-orange-500/30 text-orange-400"
                        : "border-purple-500/30 text-purple-400"
                    }`}>{s.type}</span>
                  </div>
                  <p className="text-xs text-gray-500">by {s.authorName} · {s.installCount} installs</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.verified && <span className="text-xs text-purple-400">✓</span>}
                  {s.featured && <span className="text-xs text-yellow-400">★</span>}
                  <ToggleSkillVerified slug={s.slug} verified={s.verified} />
                  <ToggleSkillFeatured slug={s.slug} featured={s.featured} />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ToggleVerified({ slug, verified }: { slug: string; verified: boolean }) {
  return (
    <form action={`/api/admin/servers/${slug}/verify`} method="POST">
      <button type="submit" className={`text-xs px-2 py-1 rounded border transition-colors ${
        verified ? "border-blue-700 text-blue-400 hover:border-red-500 hover:text-red-400"
                 : "border-gray-700 text-gray-500 hover:border-blue-500 hover:text-blue-400"
      }`}>
        {verified ? "✓ verified" : "Verify"}
      </button>
    </form>
  );
}

function ToggleFeatured({ slug, featured }: { slug: string; featured: boolean }) {
  return (
    <form action={`/api/admin/servers/${slug}/feature`} method="POST">
      <button type="submit" className={`text-xs px-2 py-1 rounded border transition-colors ${
        featured ? "border-yellow-700 text-yellow-400 hover:border-gray-500 hover:text-gray-400"
                 : "border-gray-700 text-gray-500 hover:border-yellow-500 hover:text-yellow-400"
      }`}>
        {featured ? "★ featured" : "Feature"}
      </button>
    </form>
  );
}

function ToggleSkillVerified({ slug, verified }: { slug: string; verified: boolean }) {
  return (
    <form action={`/api/admin/skills/${slug}/verify`} method="POST">
      <button type="submit" className={`text-xs px-2 py-1 rounded border transition-colors ${
        verified ? "border-purple-700 text-purple-400 hover:border-red-500 hover:text-red-400"
                 : "border-gray-700 text-gray-500 hover:border-purple-500 hover:text-purple-400"
      }`}>
        {verified ? "✓ verified" : "Verify"}
      </button>
    </form>
  );
}

function ToggleSkillFeatured({ slug, featured }: { slug: string; featured: boolean }) {
  return (
    <form action={`/api/admin/skills/${slug}/feature`} method="POST">
      <button type="submit" className={`text-xs px-2 py-1 rounded border transition-colors ${
        featured ? "border-yellow-700 text-yellow-400 hover:border-gray-500 hover:text-gray-400"
                 : "border-gray-700 text-gray-500 hover:border-yellow-500 hover:text-yellow-400"
      }`}>
        {featured ? "★ featured" : "Feature"}
      </button>
    </form>
  );
}

