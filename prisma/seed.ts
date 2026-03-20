import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const servers = [
  {
    slug: "context-pilot",
    name: "context-pilot",
    description: "Intelligent context middleware for AI coding agents. Builds a local knowledge graph and injects relevant code context automatically.",
    repoUrl: "https://github.com/sallyheller/context-pilot",
    npmPackage: "@context-pilot/cli",
    authorName: "sallyheller",
    tags: JSON.stringify(["context", "embeddings", "local", "privacy", "code"]),
    tools: JSON.stringify(["query_context", "index_project", "remember", "get_graph", "search_code"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 0,
    featured: true,
  },
  {
    slug: "filesystem",
    name: "Filesystem",
    description: "Read, write, and manage files and directories on your local machine.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-filesystem",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    tags: JSON.stringify(["filesystem", "files", "official"]),
    tools: JSON.stringify(["read_file", "write_file", "list_directory", "create_directory", "move_file", "search_files"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 0,
    verified: true,
    featured: true,
  },
  {
    slug: "github",
    name: "GitHub",
    description: "Interact with GitHub repositories, issues, pull requests, and more.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-github",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    tags: JSON.stringify(["github", "git", "pr", "issues", "official"]),
    tools: JSON.stringify(["create_issue", "create_pr", "list_repos", "search_code", "get_file"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 0,
    verified: true,
    featured: true,
  },
  {
    slug: "postgres",
    name: "PostgreSQL",
    description: "Query and inspect PostgreSQL databases with read-only access.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-postgres",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    tags: JSON.stringify(["database", "postgres", "sql", "official"]),
    tools: JSON.stringify(["query", "list_tables", "describe_table"]),
    clients: JSON.stringify(["claude-code", "cursor"]),
    transport: "stdio",
    stars: 0,
    verified: true,
  },
  {
    slug: "brave-search",
    name: "Brave Search",
    description: "Web and local search using the Brave Search API.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-brave-search",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    tags: JSON.stringify(["search", "web", "brave", "official"]),
    tools: JSON.stringify(["brave_web_search", "brave_local_search"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 0,
    verified: true,
  },
];

async function main() {
  console.log("Seeding database...");
  for (const server of servers) {
    await prisma.server.upsert({
      where: { slug: server.slug },
      update: server,
      create: server,
    });
  }
  console.log(`Seeded ${servers.length} servers.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
