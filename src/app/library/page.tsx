import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { LibraryGrid } from "./LibraryGrid";
import { AddToStack } from "./AddToStack";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Library — Codestack",
};

function parseServer(s: any) {
  return { ...s, tags: JSON.parse(s.tags), tools: JSON.parse(s.tools), clients: JSON.parse(s.clients) };
}

export default async function LibraryPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/library");

  const login = session.user.githubLogin;
  const userId = session.user.id;
  if (!login || !userId) redirect("/auth/signin");

  // Items created by user
  const [rawCreatedServers, createdSkills, savedItems, myStacks] = await Promise.all([
    prisma.server.findMany({ where: { createdBy: login }, orderBy: { createdAt: "desc" } }),
    prisma.skill.findMany({ where: { createdBy: login }, orderBy: { createdAt: "desc" } }),
    (prisma as any).userSavedItem.findMany({ where: { userId }, orderBy: { addedAt: "desc" } }) as Promise<{ type: string; itemSlug: string }[]>,
    prisma.userStack.findMany({
      where: { createdBy: login },
      select: { slug: true, name: true, icon: true, items: { select: { itemSlug: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Fetch saved items from registry
  const savedServerSlugs = savedItems.filter((i) => i.type === "server").map((i) => i.itemSlug);
  const savedSkillSlugs  = savedItems.filter((i) => i.type === "skill" || i.type === "agent").map((i) => i.itemSlug);

  const [savedServersRaw, savedSkillsRaw] = await Promise.all([
    savedServerSlugs.length > 0
      ? prisma.server.findMany({ where: { slug: { in: savedServerSlugs } } })
      : Promise.resolve([]),
    savedSkillSlugs.length > 0
      ? prisma.skill.findMany({ where: { slug: { in: savedSkillSlugs } } })
      : Promise.resolve([]),
  ]);

  const createdServers = rawCreatedServers.map(parseServer);
  const savedServers   = savedServersRaw.map(parseServer);

  // Deduplicate by slug (user might have created something they also "saved")
  const createdSlugs = new Set(createdServers.map((s: any) => s.slug));
  const uniqueSavedServers = savedServers.filter((s: any) => !createdSlugs.has(s.slug));

  // Combine: created items + saved items (marked accordingly)
  const allServers = [
    ...createdServers.map((s: any) => ({ ...s, savedInLibrary: false })),
    ...uniqueSavedServers.map((s: any) => ({ ...s, savedInLibrary: true })),
  ];

  const createdSkillSlugs = new Set(createdSkills.map((s) => s.slug));
  const uniqueSavedSkills = savedSkillsRaw.filter((s) => !createdSkillSlugs.has(s.slug));

  const allSkills = [
    ...createdSkills.filter((s) => s.type === "prompt").map((s) => ({ ...s, savedInLibrary: false })),
    ...uniqueSavedSkills.filter((s) => s.type === "prompt").map((s) => ({ ...s, savedInLibrary: true })),
  ];

  const allAgents = [
    ...createdSkills.filter((s) => s.type === "agent").map((s) => ({ ...s, savedInLibrary: false })),
    ...uniqueSavedSkills.filter((s) => s.type === "agent").map((s) => ({ ...s, savedInLibrary: true })),
  ];

  const total = allServers.length + allSkills.length + allAgents.length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Your Library</h1>
          <p className="text-gray-400 text-sm">Your MCPs, skills, and agents — created or saved from the registry.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/library/add"
            className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-sm text-blue-300 transition-colors"
          >
            + Add MCP
          </a>
          <a
            href="/submit"
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-sm text-white transition-colors"
          >
            Submit to registry
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-xs text-gray-500 mt-1">Total items</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{allServers.length}</p>
          <p className="text-xs text-gray-500 mt-1">MCPs</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{allSkills.length}</p>
          <p className="text-xs text-gray-500 mt-1">Skills</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{allAgents.length}</p>
          <p className="text-xs text-gray-500 mt-1">Agents</p>
        </div>
      </div>

      <LibraryGrid
        servers={allServers as any}
        skills={allSkills as any}
        agents={allAgents as any}
        stacks={myStacks}
      />
    </div>
  );
}
