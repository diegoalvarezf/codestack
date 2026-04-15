import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";
import { TeamServerList } from "./TeamServerList";
import { AddServerForm } from "./AddServerForm";
import { AddSkillForm } from "./AddSkillForm";
import { SkillList } from "./SkillList";
import { CopyButton } from "@/components/CopyButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const team = await prisma.team.findUnique({ where: { slug: params.slug } });
  return { title: team ? `${team.name} — Codestack` : "Team — Codestack" };
}

export default async function TeamPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { tab?: string };
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  const user = await prisma.user.findUnique({ where: { githubLogin: session.user.githubLogin! } });
  if (!user) redirect("/auth/signin");

  const team = await prisma.team.findUnique({
    where: { slug: params.slug },
    include: {
      members: {
        include: { user: { select: { id: true, githubLogin: true, name: true, avatarUrl: true } } },
        orderBy: { createdAt: "asc" },
      },
      servers: { orderBy: { addedAt: "asc" } },
      skills: { orderBy: { addedAt: "asc" } },
    },
  });

  if (!team) notFound();

  const membership = team.members.find((m) => m.userId === user.id);
  if (!membership) notFound();

  const isOwner = membership.role === "owner";
  const baseUrl = "https://mcp-registry-sigma.vercel.app";
  const inviteUrl = `${baseUrl}/join/${team.inviteToken}`;
  const syncCmd = `mcp sync --team ${team.slug} --token ${team.inviteToken}`;

  const slugs = team.servers.map((s) => s.serverSlug);
  const servers = slugs.length > 0
    ? await prisma.server.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, name: true, description: true, verified: true, installCmd: true },
      })
    : [];

  const tab = searchParams.tab ?? "servers";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <a href="/teams" className="text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6 inline-block">
        ← Back to teams
      </a>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{team.name}</h1>
          {team.description && <p className="text-gray-400 mt-1">{team.description}</p>}
          <p className="text-xs text-gray-500 mt-2">
            {team.members.length} member{team.members.length !== 1 ? "s" : ""} ·{" "}
            {team.servers.length} server{team.servers.length !== 1 ? "s" : ""} ·{" "}
            {team.skills.length} skill{team.skills.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isOwner && (
          <span className="text-xs border border-yellow-500/30 text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded-full">
            ★ Owner
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">

          {/* Tabs */}
          <div className="flex gap-1 border-b border-gray-800 pb-0">
            {[
              { id: "servers", label: `Servers (${team.servers.length})` },
              { id: "skills", label: `Skills & Agents (${team.skills.length})` },
            ].map(({ id, label }) => (
              <a
                key={id}
                href={`/teams/${params.slug}?tab=${id}`}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === id
                    ? "border-blue-500 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                {label}
              </a>
            ))}
          </div>

          {/* Servers tab */}
          {tab === "servers" && (
            <section className="space-y-4">
              <TeamServerList
                teamSlug={team.slug}
                servers={servers}
                teamServers={team.servers}
                isOwner={isOwner}
              />
              {isOwner && (
                <AddServerForm teamSlug={team.slug} />
              )}
            </section>
          )}

          {/* Skills tab */}
          {tab === "skills" && (
            <section className="space-y-4">
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 text-sm text-gray-400">
                <p className="font-medium text-white mb-1">What are skills?</p>
                <p>
                  <strong className="text-purple-300">Prompts</strong> become slash commands in Claude Code
                  for every team member (e.g. <code className="bg-gray-800 px-1 rounded">/review-pr</code>).
                </p>
                <p className="mt-1">
                  <strong className="text-orange-300">Agents</strong> are pre-configured AI workflows with
                  a specific system prompt and tool set.
                </p>
                <p className="mt-1 text-gray-500">
                  Everything syncs automatically when a member runs <code className="bg-gray-800 px-1 rounded text-xs">mcp sync --team {team.slug}</code>.
                </p>
              </div>
              <SkillList teamSlug={team.slug} skills={team.skills} isOwner={isOwner} />
              {isOwner && <AddSkillForm teamSlug={team.slug} />}
            </section>
          )}

          {/* Sync command */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
              Sync command
            </h2>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-2">
                Share this with your team — installs all servers + skills in one command:
              </p>
              <div className="flex items-center justify-between gap-4 font-mono text-sm">
                <span className="text-green-400 break-all">{syncCmd}</span>
                <CopyButton text={syncCmd} />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Requires <a href="/install-cli" className="text-blue-400/70 hover:text-blue-400">Codestack CLI</a>
              </p>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Members */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Members</h2>
            <div className="space-y-2">
              {team.members.map((m) => (
                <div key={m.id} className="flex items-center gap-2.5">
                  {m.user.avatarUrl && (
                    <img src={m.user.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-gray-800" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300 truncate">{m.user.name}</p>
                    <p className="text-xs text-gray-500">@{m.user.githubLogin}</p>
                  </div>
                  {m.role === "owner" && <span className="text-xs text-yellow-400 ml-auto">owner</span>}
                </div>
              ))}
            </div>
          </section>

          {/* Invite */}
          {isOwner && (
            <section>
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Invite Link</h2>
              <div className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-2">Share to invite members:</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-400 truncate flex-1">{inviteUrl}</span>
                  <CopyButton text={inviteUrl} />
                </div>
              </div>
            </section>
          )}

          {/* What syncs */}
          <section>
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">What syncs</h2>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-green-400 mt-0.5">✓</span>
                <span>MCP server configs (Claude Code, Cursor, Continue)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-400 mt-0.5">✓</span>
                <span>Slash commands → <code className="text-xs bg-gray-800 px-1 rounded">~/.claude/commands/</code></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 mt-0.5">✓</span>
                <span>Agent configurations</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-gray-600 mt-0.5">✗</span>
                <span className="text-gray-600">API keys (always local)</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
