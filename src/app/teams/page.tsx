import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My Teams — Codestack" };

export default async function TeamsPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const user = await prisma.user.findUnique({ where: { githubLogin: session.user.githubLogin! } });
  if (!user) redirect("/auth/signin");

  const memberships = await prisma.teamMember.findMany({
    where: { userId: user.id },
    include: {
      team: {
        include: { _count: { select: { members: true, servers: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">My Teams</h1>
        <a
          href="/teams/new"
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-lg transition-colors"
        >
          + New team
        </a>
      </div>

      {memberships.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-lg mb-2">No teams yet</p>
          <p className="text-sm mb-6">Create a team to share MCP servers with your colleagues.</p>
          <a href="/teams/new" className="text-blue-400 hover:underline text-sm">Create your first team →</a>
        </div>
      ) : (
        <div className="space-y-3">
          {memberships.map(({ team, role }) => (
            <a
              key={team.id}
              href={`/teams/${team.slug}`}
              className="block bg-gray-900 border border-gray-800 hover:border-gray-600 rounded-xl p-5 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-semibold text-white">{team.name}</h2>
                  {team.description && <p className="text-sm text-gray-400 mt-1">{team.description}</p>}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  role === "owner"
                    ? "border-yellow-500/30 text-yellow-400 bg-yellow-500/10"
                    : "border-gray-700 text-gray-500"
                }`}>
                  {role}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span>{team._count.members} member{team._count.members !== 1 ? "s" : ""}</span>
                <span>·</span>
                <span>{team._count.servers} server{team._count.servers !== 1 ? "s" : ""}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
