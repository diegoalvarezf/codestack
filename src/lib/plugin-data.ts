import { prisma } from "./db";
import { getStack, STACKS } from "./stacks";
import { getServersBySlugs } from "./servers";
import { buildPluginFiles, sha256, zipPlugin, type PluginInput, type PluginSkill } from "./plugin";

async function getSkillsBySlugs(slugs: string[]): Promise<PluginSkill[]> {
  if (!slugs.length) return [];
  const rows = await prisma.skill.findMany({ where: { slug: { in: slugs } } });
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  return slugs.flatMap((slug) => {
    const r = bySlug.get(slug);
    return r ? [{ slug: r.slug, name: r.name, description: r.description, type: r.type, content: r.content }] : [];
  });
}

function keepOrder<T extends { slug: string }>(slugs: string[], items: T[]): T[] {
  const bySlug = new Map(items.map((i) => [i.slug, i]));
  return slugs.flatMap((s) => (bySlug.has(s) ? [bySlug.get(s)!] : []));
}

export async function loadStackPlugin(slug: string, baseUrl: string): Promise<PluginInput | null> {
  const curated = getStack(slug);
  let name: string, description: string, serverSlugs: string[], skillSlugs: string[];

  if (curated) {
    name = curated.name;
    description = curated.description;
    serverSlugs = curated.servers;
    skillSlugs = [...curated.skills, ...curated.agents];
  } else {
    const stack = await prisma.userStack.findUnique({
      where: { slug },
      include: { items: { orderBy: { order: "asc" } } },
    });
    if (!stack) return null;
    name = stack.name;
    description = stack.description ?? `${stack.name} stack from Codestack`;
    serverSlugs = stack.items.filter((i) => i.type === "server").map((i) => i.itemSlug);
    skillSlugs = stack.items.filter((i) => i.type !== "server").map((i) => i.itemSlug);
  }

  const [servers, skills] = await Promise.all([
    getServersBySlugs(serverSlugs),
    getSkillsBySlugs(skillSlugs),
  ]);

  return {
    slug,
    displayName: name,
    description,
    homepage: `${baseUrl}/stacks/${slug}`,
    servers: keepOrder(serverSlugs, servers),
    skills,
  };
}

// Stacks offered in the public marketplace: curated ones plus public user stacks.
export async function listMarketplaceStacks(): Promise<string[]> {
  const userStacks = await prisma.userStack.findMany({
    where: { public: true },
    select: { slug: true },
    orderBy: { createdAt: "asc" },
  });
  return [...STACKS.map((s) => s.slug), ...userStacks.map((s) => s.slug)];
}

export async function loadTeamPlugin(
  teamSlug: string,
  token: string | null,
  baseUrl: string
): Promise<PluginInput | null> {
  const team = await prisma.team.findUnique({
    where: { slug: teamSlug },
    include: {
      servers: { orderBy: { addedAt: "asc" } },
      skills: { orderBy: { addedAt: "asc" } },
    },
  });
  if (!team || !token || token !== team.inviteToken) return null;

  const serverSlugs = team.servers.map((s) => s.serverSlug);
  const servers = keepOrder(serverSlugs, await getServersBySlugs(serverSlugs));

  return {
    slug: team.slug,
    displayName: team.name,
    description: team.description ?? `Servers, skills and agents shared by ${team.name}`,
    homepage: `${baseUrl}/teams/${team.slug}`,
    servers,
    skills: team.skills.map((s) => ({
      slug: s.slug,
      name: s.name,
      description: s.description,
      type: s.type,
      content: s.content,
    })),
  };
}

export function packPlugin(input: PluginInput) {
  const zip = zipPlugin(buildPluginFiles(input));
  return { zip, sha256: sha256(zip) };
}
