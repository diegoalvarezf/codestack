import { prisma } from "./db";
import type { McpServer } from "./types";

const PAGE_SIZE = 24;

function parse(server: any): McpServer {
  return {
    ...server,
    tags: JSON.parse(server.tags),
    tools: JSON.parse(server.tools),
    clients: JSON.parse(server.clients),
    envVars: server.envVars ? JSON.parse(server.envVars) : null,
  };
}

export type SortMode = "featured" | "popular" | "trending" | "hot" | "new";

export async function getServers(opts?: {
  query?: string;
  tag?: string;
  client?: string;
  featured?: boolean;
  page?: number;
  sort?: SortMode;
}): Promise<{ servers: McpServer[]; total: number; pages: number }> {
  const page = Math.max(1, opts?.page ?? 1);
  const sort = opts?.sort ?? "featured";
  const where: any = {};
  if (opts?.featured) where.featured = true;
  if (opts?.tag) where.tags = { contains: opts.tag };
  if (opts?.client) where.clients = { contains: opts.client };
  if (opts?.query) {
    where.OR = [
      { name: { contains: opts.query } },
      { description: { contains: opts.query } },
      { tags: { contains: opts.query } },
      { tools: { contains: opts.query } },
    ];
  }

  const orderBy: any[] =
    sort === "popular"  ? [{ downloadCount: "desc" }, { stars: "desc" }] :
    sort === "trending" ? [{ weeklyInstalls: "desc" }, { downloadCount: "desc" }] :
    sort === "hot"      ? [{ dailyInstalls: "desc" }, { weeklyInstalls: "desc" }] :
    sort === "new"      ? [{ createdAt: "desc" }] :
    /* featured */        [{ featured: "desc" }, { stars: "desc" }, { createdAt: "desc" }];

  const [total, servers] = await Promise.all([
    prisma.server.count({ where }),
    prisma.server.findMany({
      where,
      orderBy,
      include: { reviews: { select: { rating: true } } },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const parsed = servers.map((s) => {
    const reviews = s.reviews;
    const avgRating = reviews.length
      ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
      : undefined;
    return { ...parse(s), avgRating, reviewCount: reviews.length };
  });

  return { servers: parsed, total, pages: Math.ceil(total / PAGE_SIZE) };
}

export async function getServersBySlugs(slugs: string[]): Promise<McpServer[]> {
  const servers = await prisma.server.findMany({
    where: { slug: { in: slugs } },
    include: { reviews: { select: { rating: true } } },
  });
  return servers.map((s) => {
    const reviews = s.reviews;
    const avgRating = reviews.length
      ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
      : undefined;
    return { ...parse(s), avgRating, reviewCount: reviews.length };
  });
}

export async function getServer(
  slug: string
): Promise<(McpServer & { reviews: { id: string; rating: number; comment: string | null; author: string; createdAt: Date }[] }) | null> {
  const server = await prisma.server.findUnique({
    where: { slug },
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  });
  if (!server) return null;
  const avgRating = server.reviews.length
    ? Math.round(
        (server.reviews.reduce((a, r) => a + r.rating, 0) / server.reviews.length) * 10
      ) / 10
    : undefined;
  return {
    ...parse(server),
    avgRating,
    reviewCount: server.reviews.length,
    reviews: server.reviews,
  };
}
