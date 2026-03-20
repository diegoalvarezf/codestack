export interface McpServer {
  id: string;
  slug: string;
  name: string;
  description: string;
  longDesc: string | null;
  repoUrl: string;
  npmPackage: string | null;
  authorName: string;
  authorUrl: string | null;
  license: string;
  version: string;
  tags: string[];
  tools: string[];
  clients: string[];
  transport: string;
  stars: number;
  verified: boolean;
  featured: boolean;
  createdAt: Date;
  avgRating?: number;
  reviewCount?: number;
}

export type Transport = "stdio" | "sse" | "http";
export type Client = "claude-code" | "cursor" | "continue" | "other";
