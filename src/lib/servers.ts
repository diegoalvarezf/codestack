import { prisma } from "./db";
import type { McpServer } from "./types";

function parse(server: any): McpServer {
  return {
    ...server,
    tags: JSON.parse(server.tags),
    tools: JSON.parse(server.tools),
    clients: JSON.parse(server.clients),
  };
}

export async function getServers(opts?: {
  query?: string;
  tag?: string;
  client?: string;
  featured?: boolean;
}): Promise<McpServer[]> {
  const where: any = {};
  if (opts?.featured) where.featured = true;
  if (opts?.tag) where.tags = { contains: opts.tag };
  if (opts?.client) where.clients = { contains: opts.client };

  const servers = await prisma.server.findMany({
    where,
    orderBy: [{ featured: "desc" }, { stars: "desc" }, { createdAt: "desc" }],
    include: { reviews: { select: { rating: true } } },
  });

  return servers
    .map((s) => {
      const reviews = s.reviews;
      const avgRating = reviews.length
        ? Math.round((reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
        : undefined;
      return { ...parse(s), avgRating, reviewCount: reviews.length };
    })
    .filter((s) => {
      if (!opts?.query) return true;
      const q = opts.query.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.tools.some((t) => t.toLowerCase().includes(q))
      );
    });
}

export async function getServer(slug: string): Promise<McpServer | null> {
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
  return { ...parse(server), avgRating, reviewCount: server.reviews.length };
}
