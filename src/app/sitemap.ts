import { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const BASE = "https://mcp-registry-sigma.vercel.app";

  const [servers, skills] = await Promise.all([
    prisma.server.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.skill.findMany({ select: { slug: true, type: true, updatedAt: true } }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE,                 lastModified: new Date(), changeFrequency: "daily",   priority: 1 },
    { url: `${BASE}/stacks`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
    { url: `${BASE}/audits`,     lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE}/install-cli`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
  ];

  const serverRoutes: MetadataRoute.Sitemap = servers.map((s) => ({
    url: `${BASE}/server/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const skillRoutes: MetadataRoute.Sitemap = skills
    .filter((s) => s.type === "prompt")
    .map((s) => ({
      url: `${BASE}/skills/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  const agentRoutes: MetadataRoute.Sitemap = skills
    .filter((s) => s.type === "agent")
    .map((s) => ({
      url: `${BASE}/agents/${s.slug}`,
      lastModified: s.updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...staticRoutes, ...serverRoutes, ...skillRoutes, ...agentRoutes];
}
