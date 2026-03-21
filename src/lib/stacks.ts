export interface Stack {
  slug: string;
  name: string;
  description: string;
  icon: string;
  servers: string[];
  skills: string[];
  agents: string[];
  tags: string[];
  curated?: boolean; // true = hardcoded curateado
}

export const STACKS: Stack[] = [
  {
    slug: "full-stack-dev",
    name: "Full-Stack Dev",
    description: "Everything you need to build and ship web apps: filesystem access, git, GitHub integration, Postgres, and the skills to match.",
    icon: "⚡",
    servers: ["filesystem", "git", "github", "postgres"],
    skills: ["review-pr", "write-tests", "commit-message"],
    agents: ["senior-engineer"],
    tags: ["development", "popular"],
    curated: true,
  },
  {
    slug: "research",
    name: "Research & Knowledge",
    description: "Search the web, browse pages, persist findings to memory. Perfect for deep research and knowledge management workflows.",
    icon: "🔍",
    servers: ["brave-search", "fetch", "memory", "puppeteer"],
    skills: ["document", "explain-code"],
    agents: ["tech-lead"],
    tags: ["research", "ai"],
    curated: true,
  },
  {
    slug: "data-engineering",
    name: "Data Engineering",
    description: "Query, explore and transform data across Postgres, SQLite, MySQL, and Redis. Build data pipelines with confidence.",
    icon: "📊",
    servers: ["postgres", "sqlite", "mysql", "redis"],
    skills: ["write-tests", "refactor", "document"],
    agents: ["senior-engineer"],
    tags: ["data", "databases"],
    curated: true,
  },
  {
    slug: "devops",
    name: "DevOps & Cloud",
    description: "Manage containers, deploy to Vercel and Cloudflare, monitor with Sentry — and an agent that thinks like a DevOps engineer.",
    icon: "🚀",
    servers: ["docker", "vercel", "cloudflare", "github", "sentry"],
    skills: ["document", "fix-bug"],
    agents: ["devops-engineer"],
    tags: ["devops", "cloud"],
    curated: true,
  },
  {
    slug: "product-team",
    name: "Product Team",
    description: "Connect Linear, Notion, GitHub and Supabase. Plan, ship, and document — everything a product team needs in one stack.",
    icon: "📋",
    servers: ["linear", "notion", "github", "supabase"],
    skills: ["review-pr", "commit-message", "document"],
    agents: ["tech-lead"],
    tags: ["product", "collaboration"],
    curated: true,
  },
  {
    slug: "security",
    name: "Security & Audit",
    description: "Audit code for vulnerabilities, review PRs from a security lens, and keep your codebase safe with a dedicated security agent.",
    icon: "🔒",
    servers: ["github", "filesystem"],
    skills: ["security-audit", "review-pr", "fix-bug"],
    agents: ["security-expert"],
    tags: ["security", "quality"],
    curated: true,
  },
];

export function getStack(slug: string): Stack | undefined {
  return STACKS.find((s) => s.slug === slug);
}
