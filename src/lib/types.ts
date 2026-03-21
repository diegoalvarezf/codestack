export interface EnvVar {
  name: string;
  description: string;
  required: boolean;
  example?: string;
}

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
  installCmd: string | null;
  configJson: string | null;
  envVars: EnvVar[] | null;
  category: string | null;
  downloadCount: number;
  weeklyInstalls: number;
  dailyInstalls: number;
  riskLevel: string;
  repoSlug: string | null;
  createdAt: Date;
  avgRating?: number;
  reviewCount?: number;
}

export type Transport = "stdio" | "sse" | "http";
export type Client = "claude-code" | "cursor" | "continue" | "other";
export type Category = "official" | "community" | "enterprise";
