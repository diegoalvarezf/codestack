import { prisma } from "./db";
import type { Skill } from "@prisma/client";

const PAGE_SIZE = 24;

export type { Skill };

export async function getSkills(opts?: {
  query?: string;
  type?: string;
  tag?: string;
  featured?: boolean;
  page?: number;
  ownerId?: string;       // for personal library
  includePrivate?: boolean; // show unpublished (owner only)
}): Promise<{ skills: Skill[]; total: number; pages: number }> {
  const page = Math.max(1, opts?.page ?? 1);
  const where: any = {};

  // Public registry always filters to published=true unless owner is viewing
  if (opts?.ownerId && opts?.includePrivate) {
    where.ownerId = opts.ownerId;
  } else {
    where.published = true;
  }

  if (opts?.featured) where.featured = true;
  if (opts?.type) where.type = opts.type;
  if (opts?.tag) where.tags = { contains: opts.tag };
  if (opts?.query) {
    where.OR = [
      { name: { contains: opts.query, mode: "insensitive" } },
      { description: { contains: opts.query, mode: "insensitive" } },
      { tags: { contains: opts.query } },
    ];
  }

  const [total, skills] = await Promise.all([
    prisma.skill.count({ where }),
    prisma.skill.findMany({
      where,
      orderBy: [{ featured: "desc" }, { installCount: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  return { skills, total, pages: Math.ceil(total / PAGE_SIZE) };
}

export async function getSkill(slug: string): Promise<Skill | null> {
  return prisma.skill.findUnique({ where: { slug } });
}

export function parseTags(skill: Skill): string[] {
  try { return JSON.parse(skill.tags); } catch { return []; }
}
