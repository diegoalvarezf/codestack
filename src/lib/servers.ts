import { prisma } from "./db";
import { parseServer } from "./parse-server";

const PAGE_SIZE = 24;

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

  if (opts?.query) {
    return getServersWithFullTextSearch({ ...opts, page, sort, query: opts.query });
  }

  const where: any = {};
  if (opts?.featured) where.featured = true;
  if (opts?.tag) where.tags = { contains: opts.tag };
  if (opts?.client) where.clients = { contains: opts.client };

  const orderBy = buildOrderBy(sort);

  const [total, servers] = await Promise.all([
    prisma.server.count({ where }),
    // avgRating and reviewCount are cached — no need to include reviews
    prisma.server.findMany({ where, orderBy, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
  ]);

  return { servers: servers.map(parseServer), total, pages: Math.ceil(total / PAGE_SIZE) };
}

async function getServersWithFullTextSearch(opts: {
  query: string;
  tag?: string;
  client?: string;
  featured?: boolean;
  page: number;
  sort: SortMode;
}): Promise<{ servers: McpServer[]; total: number; pages: number }> {
  const extraFilters: string[] = [];
  const bindings: unknown[] = [opts.query];

  if (opts.featured) extraFilters.push(`AND featured = true`);
  if (opts.tag) {
    bindings.push(`%${opts.tag}%`);
    extraFilters.push(`AND tags ILIKE $${bindings.length}`);
  }
  if (opts.client) {
    bindings.push(`%${opts.client}%`);
    extraFilters.push(`AND clients ILIKE $${bindings.length}`);
  }

  const filterClause = extraFilters.join(" ");
  const matchClause = `
    to_tsvector('english',
      coalesce(name, '') || ' ' ||
      coalesce(description, '') || ' ' ||
      coalesce(tags, '') || ' ' ||
      coalesce(tools, '')
    ) @@ websearch_to_tsquery('english', $1)
  `;
  const orderSql = buildOrderBySql(opts.sort);

  const [countResult, rows] = await Promise.all([
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count FROM "Server" WHERE ${matchClause} ${filterClause}`,
      ...bindings
    ),
    prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "Server" WHERE ${matchClause} ${filterClause}
       ORDER BY ${orderSql}
       LIMIT ${PAGE_SIZE} OFFSET ${(opts.page - 1) * PAGE_SIZE}`,
      ...bindings
    ),
  ]);

  const total = Number(countResult[0]?.count ?? 0);
  const ids = rows.map((r) => r.id);

  if (ids.length === 0) return { servers: [], total, pages: Math.ceil(total / PAGE_SIZE) };

  const servers = await prisma.server.findMany({ where: { id: { in: ids } } });

  const byId = new Map(servers.map((s) => [s.id, s]));
  const ordered = ids.map((id) => byId.get(id)!).filter(Boolean);

  return { servers: ordered.map(parseServer), total, pages: Math.ceil(total / PAGE_SIZE) };
}

function buildOrderBy(sort: SortMode): any[] {
  switch (sort) {
    case "popular":  return [{ downloadCount: "desc" }, { stars: "desc" }];
    case "trending": return [{ weeklyInstalls: "desc" }, { downloadCount: "desc" }];
    case "hot":      return [{ dailyInstalls: "desc" }, { weeklyInstalls: "desc" }];
    case "new":      return [{ createdAt: "desc" }];
    default:         return [{ featured: "desc" }, { stars: "desc" }, { createdAt: "desc" }];
  }
}

function buildOrderBySql(sort: SortMode): string {
  switch (sort) {
    case "popular":  return `"downloadCount" DESC, stars DESC`;
    case "trending": return `"weeklyInstalls" DESC, "downloadCount" DESC`;
    case "hot":      return `"dailyInstalls" DESC, "weeklyInstalls" DESC`;
    case "new":      return `"createdAt" DESC`;
    default:         return `featured DESC, stars DESC, "createdAt" DESC`;
  }
}

export async function getServersBySlugs(slugs: string[]): Promise<McpServer[]> {
  const servers = await prisma.server.findMany({ where: { slug: { in: slugs } } });
  return servers.map(parseServer);
}

export async function getServer(
  slug: string
): Promise<(McpServer & { reviews: { id: string; rating: number; comment: string | null; author: string; createdAt: Date }[] }) | null> {
  const server = await prisma.server.findUnique({
    where: { slug },
    include: { reviews: { orderBy: { createdAt: "desc" } } },
  });
  if (!server) return null;
  return { ...parseServer(server), reviews: server.reviews };
}
