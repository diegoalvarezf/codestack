import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const servers = [
  // ─── OFICIALES ANTHROPIC ───────────────────────────────────────────────────
  {
    slug: "filesystem",
    name: "Filesystem",
    description: "Read and write files on your local filesystem with full path control.",
    longDesc: "Provides tools to read, write, move, and search files and directories. Essential for any workflow that requires file manipulation.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-filesystem",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["filesystem", "files", "official"]),
    tools: JSON.stringify(["read_file", "write_file", "list_directory", "create_directory", "move_file", "search_files"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 4800,
    verified: true,
    featured: true,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-filesystem /path/to/dir",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "/Users/username"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "github",
    name: "GitHub",
    description: "Interact with GitHub repositories — issues, PRs, files, and search.",
    longDesc: "Full access to GitHub API: create issues, open pull requests, search code, read files from any repo, manage branches and more.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-github",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["git", "github", "api", "official"]),
    tools: JSON.stringify(["create_issue", "create_pull_request", "get_file_contents", "list_repos", "search_code", "create_branch"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 5200,
    verified: true,
    featured: true,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-github",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-github"], env: { GITHUB_PERSONAL_ACCESS_TOKEN: "${GITHUB_PERSONAL_ACCESS_TOKEN}" } }),
    envVars: JSON.stringify([{ name: "GITHUB_PERSONAL_ACCESS_TOKEN", description: "GitHub Personal Access Token with repo permissions", required: true, example: "ghp_xxxxxxxxxxxx" }]),
  },
  {
    slug: "postgres",
    name: "PostgreSQL",
    description: "Read-only query access to PostgreSQL databases with schema inspection.",
    longDesc: "Connect to any PostgreSQL database, run read-only SQL queries, inspect schemas and table structures. Perfect for data exploration and analysis.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-postgres",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["database", "sql", "postgres", "official"]),
    tools: JSON.stringify(["query", "list_tables", "describe_table"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 3100,
    verified: true,
    featured: true,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-postgres",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-postgres", "${POSTGRES_CONNECTION_STRING}"] }),
    envVars: JSON.stringify([{ name: "POSTGRES_CONNECTION_STRING", description: "PostgreSQL connection string", required: true, example: "postgresql://user:pass@localhost:5432/mydb" }]),
  },
  {
    slug: "brave-search",
    name: "Brave Search",
    description: "Web and local search using the Brave Search API.",
    longDesc: "Search the web and local files using Brave Search. Provides real-time web results without tracking.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-brave-search",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["search", "web", "api", "official"]),
    tools: JSON.stringify(["brave_web_search", "brave_local_search"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 2800,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-brave-search",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-brave-search"], env: { BRAVE_API_KEY: "${BRAVE_API_KEY}" } }),
    envVars: JSON.stringify([{ name: "BRAVE_API_KEY", description: "Brave Search API key", required: true, example: "BSA..." }]),
  },
  {
    slug: "git",
    name: "Git",
    description: "Git repository operations — log, diff, blame, status and more.",
    longDesc: "Full git operations on local repositories: read history, diffs, blame, branches, stashes and commits without leaving your AI assistant.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-git",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["git", "version-control", "official"]),
    tools: JSON.stringify(["git_log", "git_diff", "git_blame", "git_status", "git_show"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 2400,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-git",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-git"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "memory",
    name: "Memory",
    description: "Knowledge graph-based persistent memory across conversations.",
    longDesc: "Stores and retrieves information using a knowledge graph. Lets your AI assistant remember facts, relationships, and context across sessions.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-memory",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["memory", "knowledge-graph", "official"]),
    tools: JSON.stringify(["create_entities", "create_relations", "add_observations", "search_nodes", "read_graph"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 3600,
    verified: true,
    featured: true,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-memory",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-memory"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "fetch",
    name: "Fetch",
    description: "Fetch web content and convert it to markdown for easy reading.",
    longDesc: "Retrieve any URL and get its content converted to clean markdown. Handles JavaScript-rendered pages via Puppeteer.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-fetch",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["web", "fetch", "scraping", "official"]),
    tools: JSON.stringify(["fetch"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 2100,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-fetch",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-fetch"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "sqlite",
    name: "SQLite",
    description: "Full SQLite database operations — read, write, and schema management.",
    longDesc: "Create, query, and manage SQLite databases. Supports schema inspection, read/write operations and business intelligence queries.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-sqlite",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["database", "sql", "sqlite", "official"]),
    tools: JSON.stringify(["read_query", "write_query", "list_tables", "describe_table", "create_table"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 1900,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-sqlite",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-sqlite", "/path/to/database.db"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "slack",
    name: "Slack",
    description: "Read and post messages, manage channels and users in Slack.",
    longDesc: "Full Slack integration: read channel history, post messages, list users and channels, upload files and manage your workspace.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-slack",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["communication", "slack", "api", "official"]),
    tools: JSON.stringify(["slack_post_message", "slack_list_channels", "slack_get_channel_history", "slack_list_users"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 1700,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-slack",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-slack"], env: { SLACK_BOT_TOKEN: "${SLACK_BOT_TOKEN}", SLACK_TEAM_ID: "${SLACK_TEAM_ID}" } }),
    envVars: JSON.stringify([
      { name: "SLACK_BOT_TOKEN", description: "Bot User OAuth Token", required: true, example: "xoxb-..." },
      { name: "SLACK_TEAM_ID", description: "Slack workspace Team ID", required: true, example: "T01234ABCD" },
    ]),
  },
  {
    slug: "puppeteer",
    name: "Puppeteer",
    description: "Browser automation — navigate, click, screenshot, and scrape websites.",
    longDesc: "Control a headless Chromium browser to automate web interactions: navigate pages, click buttons, fill forms, take screenshots and extract content.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-puppeteer",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["browser", "automation", "scraping", "official"]),
    tools: JSON.stringify(["puppeteer_navigate", "puppeteer_click", "puppeteer_screenshot", "puppeteer_fill", "puppeteer_evaluate"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 2900,
    verified: true,
    featured: true,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-puppeteer",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-puppeteer"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "google-maps",
    name: "Google Maps",
    description: "Geocoding, directions, places search and distance matrix via Google Maps.",
    longDesc: "Access Google Maps APIs: geocode addresses, get directions, search nearby places, calculate distance matrices and get place details.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-google-maps",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["maps", "location", "api", "official"]),
    tools: JSON.stringify(["maps_geocode", "maps_directions", "maps_search_places", "maps_distance_matrix"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 900,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-google-maps",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-google-maps"], env: { GOOGLE_MAPS_API_KEY: "${GOOGLE_MAPS_API_KEY}" } }),
    envVars: JSON.stringify([{ name: "GOOGLE_MAPS_API_KEY", description: "Google Maps Platform API key", required: true }]),
  },
  {
    slug: "redis",
    name: "Redis",
    description: "Interact with Redis — get, set, list, and manage keys.",
    longDesc: "Full Redis operations: get/set keys, work with lists, hashes, sets and sorted sets. Supports TTL, patterns and pub/sub.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-redis",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["database", "redis", "cache", "official"]),
    tools: JSON.stringify(["set", "get", "delete", "list", "keys"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 700,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-redis",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-redis"], env: { REDIS_URL: "${REDIS_URL}" } }),
    envVars: JSON.stringify([{ name: "REDIS_URL", description: "Redis connection URL", required: true, example: "redis://localhost:6379" }]),
  },
  {
    slug: "google-drive",
    name: "Google Drive",
    description: "Search, read and manage files in Google Drive.",
    longDesc: "Access Google Drive: search files, read documents, spreadsheets and presentations, manage folders and permissions.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-gdrive",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["storage", "google", "files", "official"]),
    tools: JSON.stringify(["gdrive_search", "gdrive_read_file", "gdrive_list_files"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 1100,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-gdrive",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-gdrive"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "aws-kb-retrieval",
    name: "AWS Knowledge Base",
    description: "Retrieve information from AWS Bedrock Knowledge Bases.",
    longDesc: "Query AWS Bedrock Knowledge Bases for RAG (Retrieval Augmented Generation) use cases. Supports hybrid search and filtering.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-aws-kb-retrieval",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["aws", "rag", "search", "official"]),
    tools: JSON.stringify(["retrieve"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 800,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-aws-kb-retrieval",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-aws-kb-retrieval"], env: { AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}", AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}", AWS_REGION: "${AWS_REGION}" } }),
    envVars: JSON.stringify([
      { name: "AWS_ACCESS_KEY_ID", description: "AWS Access Key ID", required: true },
      { name: "AWS_SECRET_ACCESS_KEY", description: "AWS Secret Access Key", required: true },
      { name: "AWS_REGION", description: "AWS Region", required: true, example: "us-east-1" },
    ]),
  },
  {
    slug: "everything",
    name: "Everything",
    description: "Test MCP server with all tool types — useful for development and testing.",
    longDesc: "A comprehensive test server that implements every MCP feature: prompts, resources, tools of all types. Ideal for testing MCP clients.",
    repoUrl: "https://github.com/modelcontextprotocol/servers",
    npmPackage: "@modelcontextprotocol/server-everything",
    authorName: "Anthropic",
    authorUrl: "https://anthropic.com",
    license: "MIT",
    version: "0.6.2",
    tags: JSON.stringify(["testing", "development", "official"]),
    tools: JSON.stringify(["echo", "add", "long_running_operation", "print_env", "sample_llm"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 600,
    verified: true,
    featured: false,
    category: "official",
    installCmd: "npx -y @modelcontextprotocol/server-everything",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@modelcontextprotocol/server-everything"] }),
    envVars: JSON.stringify([]),
  },

  // ─── COMUNIDAD ─────────────────────────────────────────────────────────────
  {
    slug: "playwright",
    name: "Playwright",
    description: "Browser automation with Playwright — multi-browser support.",
    longDesc: "Automate Chromium, Firefox and WebKit with Playwright. Navigate pages, interact with elements, capture screenshots and run accessibility tests.",
    repoUrl: "https://github.com/microsoft/playwright-mcp",
    npmPackage: "@playwright/mcp",
    authorName: "Microsoft",
    license: "Apache-2.0",
    version: "0.0.20",
    tags: JSON.stringify(["browser", "automation", "testing", "community"]),
    tools: JSON.stringify(["browser_navigate", "browser_click", "browser_screenshot", "browser_fill", "browser_snapshot"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 4100,
    verified: true,
    featured: true,
    category: "community",
    installCmd: "npx -y @playwright/mcp",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@playwright/mcp"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "notion",
    name: "Notion",
    description: "Read and write Notion pages, databases, and blocks.",
    longDesc: "Full Notion integration: read pages, create and update content, query databases, search your workspace and manage blocks.",
    repoUrl: "https://github.com/makenotion/notion-mcp-server",
    npmPackage: "@notionhq/notion-mcp-server",
    authorName: "Notion",
    license: "MIT",
    version: "1.0.0",
    tags: JSON.stringify(["productivity", "notion", "api", "community"]),
    tools: JSON.stringify(["notion_search", "notion_get_page", "notion_create_page", "notion_update_page", "notion_query_database"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 1800,
    verified: true,
    featured: false,
    category: "community",
    installCmd: "npx -y @notionhq/notion-mcp-server",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@notionhq/notion-mcp-server"], env: { OPENAPI_MCP_HEADERS: '{"Authorization": "Bearer ${NOTION_API_KEY}", "Notion-Version": "2022-06-28"}' } }),
    envVars: JSON.stringify([{ name: "NOTION_API_KEY", description: "Notion Internal Integration Secret", required: true, example: "secret_..." }]),
  },
  {
    slug: "linear",
    name: "Linear",
    description: "Manage issues, projects, and cycles in Linear.",
    longDesc: "Integrate Linear into your AI workflow: create and update issues, manage projects and cycles, search across your workspace.",
    repoUrl: "https://github.com/linear/linear-mcp",
    npmPackage: "@linear/linear-mcp",
    authorName: "Linear",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["project-management", "linear", "api", "community"]),
    tools: JSON.stringify(["create_issue", "update_issue", "list_issues", "search_issues", "list_projects"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 1200,
    verified: true,
    featured: false,
    category: "community",
    installCmd: "npx -y @linear/linear-mcp",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@linear/linear-mcp"], env: { LINEAR_API_KEY: "${LINEAR_API_KEY}" } }),
    envVars: JSON.stringify([{ name: "LINEAR_API_KEY", description: "Linear Personal API key", required: true, example: "lin_api_..." }]),
  },
  {
    slug: "stripe",
    name: "Stripe",
    description: "Interact with Stripe — customers, payments, subscriptions and more.",
    longDesc: "Access the Stripe API to manage customers, payments, subscriptions, invoices and products. Read-only by default for safety.",
    repoUrl: "https://github.com/stripe/agent-toolkit",
    npmPackage: "@stripe/mcp",
    authorName: "Stripe",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["payments", "stripe", "api", "community"]),
    tools: JSON.stringify(["list_customers", "create_customer", "list_payments", "list_subscriptions", "create_invoice"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 900,
    verified: true,
    featured: false,
    category: "community",
    installCmd: "npx -y @stripe/mcp",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@stripe/mcp", "--tools=all"], env: { STRIPE_SECRET_KEY: "${STRIPE_SECRET_KEY}" } }),
    envVars: JSON.stringify([{ name: "STRIPE_SECRET_KEY", description: "Stripe secret API key (usa test key para desarrollo)", required: true, example: "sk_test_..." }]),
  },
  {
    slug: "cloudflare",
    name: "Cloudflare",
    description: "Manage Cloudflare Workers, KV, R2, D1 and more.",
    longDesc: "Deploy and manage Cloudflare resources: Workers scripts, KV namespaces, R2 buckets, D1 databases, and DNS records.",
    repoUrl: "https://github.com/cloudflare/mcp-server-cloudflare",
    npmPackage: "@cloudflare/mcp-server-cloudflare",
    authorName: "Cloudflare",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["cloud", "cloudflare", "serverless", "community"]),
    tools: JSON.stringify(["worker_list", "worker_deploy", "kv_get", "kv_put", "r2_list", "d1_query"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 1500,
    verified: true,
    featured: false,
    category: "community",
    installCmd: "npx -y @cloudflare/mcp-server-cloudflare",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@cloudflare/mcp-server-cloudflare"], env: { CLOUDFLARE_API_TOKEN: "${CLOUDFLARE_API_TOKEN}", CLOUDFLARE_ACCOUNT_ID: "${CLOUDFLARE_ACCOUNT_ID}" } }),
    envVars: JSON.stringify([
      { name: "CLOUDFLARE_API_TOKEN", description: "Cloudflare API Token", required: true },
      { name: "CLOUDFLARE_ACCOUNT_ID", description: "Cloudflare Account ID", required: true },
    ]),
  },
  {
    slug: "docker",
    name: "Docker",
    description: "Manage Docker containers, images, volumes and networks.",
    longDesc: "Control your Docker environment: list and manage containers, pull images, inspect volumes, view logs and manage networks.",
    repoUrl: "https://github.com/docker/mcp-servers",
    npmPackage: "docker-mcp",
    authorName: "Docker",
    license: "Apache-2.0",
    version: "0.1.0",
    tags: JSON.stringify(["devops", "docker", "containers", "community"]),
    tools: JSON.stringify(["list_containers", "start_container", "stop_container", "pull_image", "get_logs", "run_container"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 1100,
    verified: true,
    featured: false,
    category: "community",
    installCmd: "npx -y docker-mcp",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "docker-mcp"] }),
    envVars: JSON.stringify([]),
  },
  {
    slug: "supabase",
    name: "Supabase",
    description: "Manage Supabase projects, tables, edge functions and storage.",
    longDesc: "Full Supabase integration: query databases, manage tables and RLS policies, deploy edge functions, manage storage buckets and auth users.",
    repoUrl: "https://github.com/supabase-community/supabase-mcp",
    npmPackage: "@supabase/mcp-server-supabase",
    authorName: "Supabase",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["database", "supabase", "backend", "community"]),
    tools: JSON.stringify(["list_tables", "execute_sql", "list_edge_functions", "deploy_edge_function", "list_storage_buckets"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 1300,
    verified: true,
    featured: false,
    category: "community",
    installCmd: "npx -y @supabase/mcp-server-supabase",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@supabase/mcp-server-supabase"], env: { SUPABASE_URL: "${SUPABASE_URL}", SUPABASE_SERVICE_ROLE_KEY: "${SUPABASE_SERVICE_ROLE_KEY}" } }),
    envVars: JSON.stringify([
      { name: "SUPABASE_URL", description: "Supabase project URL", required: true, example: "https://xxx.supabase.co" },
      { name: "SUPABASE_SERVICE_ROLE_KEY", description: "Supabase service role key (secret)", required: true },
    ]),
  },
  {
    slug: "vercel",
    name: "Vercel",
    description: "Deploy and manage Vercel projects, deployments and domains.",
    longDesc: "Control your Vercel infrastructure: list and trigger deployments, manage environment variables, domains and team members.",
    repoUrl: "https://github.com/vercel/vercel-mcp",
    npmPackage: "vercel-mcp",
    authorName: "Vercel",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["deployment", "vercel", "cloud", "community"]),
    tools: JSON.stringify(["list_deployments", "create_deployment", "list_projects", "get_env_vars", "list_domains"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 950,
    verified: false,
    featured: false,
    category: "community",
    installCmd: "npx -y vercel-mcp",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "vercel-mcp"], env: { VERCEL_TOKEN: "${VERCEL_TOKEN}" } }),
    envVars: JSON.stringify([{ name: "VERCEL_TOKEN", description: "Vercel API token", required: true }]),
  },
  {
    slug: "jira",
    name: "Jira",
    description: "Manage Jira issues, sprints and projects from your AI assistant.",
    longDesc: "Full Jira integration: create and update issues, manage sprints, search with JQL, add comments and transition issue statuses.",
    repoUrl: "https://github.com/sooperset/mcp-atlassian",
    npmPackage: "mcp-atlassian",
    authorName: "sooperset",
    license: "MIT",
    version: "0.9.0",
    tags: JSON.stringify(["project-management", "jira", "atlassian", "community"]),
    tools: JSON.stringify(["jira_get_issue", "jira_create_issue", "jira_update_issue", "jira_search_issues", "jira_add_comment"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 600,
    verified: false,
    featured: false,
    category: "community",
    installCmd: "npx -y mcp-atlassian",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "mcp-atlassian"], env: { JIRA_URL: "${JIRA_URL}", JIRA_EMAIL: "${JIRA_EMAIL}", JIRA_API_TOKEN: "${JIRA_API_TOKEN}" } }),
    envVars: JSON.stringify([
      { name: "JIRA_URL", description: "Jira instance URL", required: true, example: "https://mycompany.atlassian.net" },
      { name: "JIRA_EMAIL", description: "Jira account email", required: true },
      { name: "JIRA_API_TOKEN", description: "Jira API token", required: true },
    ]),
  },
  {
    slug: "sentry",
    name: "Sentry",
    description: "Query Sentry issues, events and releases from your AI assistant.",
    longDesc: "Access Sentry error tracking data: list issues, inspect events, check releases and get stack traces without leaving your workflow.",
    repoUrl: "https://github.com/getsentry/sentry-mcp",
    npmPackage: "@sentry/mcp-server",
    authorName: "Sentry",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["monitoring", "errors", "api", "community"]),
    tools: JSON.stringify(["list_issues", "get_issue", "list_events", "list_releases"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 700,
    verified: false,
    featured: false,
    category: "community",
    installCmd: "npx -y @sentry/mcp-server",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@sentry/mcp-server"], env: { SENTRY_AUTH_TOKEN: "${SENTRY_AUTH_TOKEN}", SENTRY_ORG: "${SENTRY_ORG}" } }),
    envVars: JSON.stringify([
      { name: "SENTRY_AUTH_TOKEN", description: "Sentry Auth Token", required: true },
      { name: "SENTRY_ORG", description: "Sentry organization slug", required: true, example: "my-org" },
    ]),
  },
  {
    slug: "mysql",
    name: "MySQL",
    description: "Query MySQL and MariaDB databases with schema inspection.",
    longDesc: "Connect to MySQL or MariaDB databases, run SQL queries, inspect schemas and explore table structures.",
    repoUrl: "https://github.com/benborla/mcp-server-mysql",
    npmPackage: "mcp-server-mysql",
    authorName: "benborla",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["database", "sql", "mysql", "community"]),
    tools: JSON.stringify(["mysql_query", "mysql_list_tables", "mysql_describe_table"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 500,
    verified: false,
    featured: false,
    category: "community",
    installCmd: "npx -y mcp-server-mysql",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "mcp-server-mysql"], env: { MYSQL_HOST: "${MYSQL_HOST}", MYSQL_USER: "${MYSQL_USER}", MYSQL_PASSWORD: "${MYSQL_PASSWORD}", MYSQL_DATABASE: "${MYSQL_DATABASE}" } }),
    envVars: JSON.stringify([
      { name: "MYSQL_HOST", description: "MySQL host", required: true, example: "localhost" },
      { name: "MYSQL_USER", description: "MySQL user", required: true },
      { name: "MYSQL_PASSWORD", description: "MySQL password", required: true },
      { name: "MYSQL_DATABASE", description: "Database name", required: true },
    ]),
  },
  {
    slug: "elasticsearch",
    name: "Elasticsearch",
    description: "Search and query Elasticsearch indices.",
    longDesc: "Query Elasticsearch clusters: full-text search, aggregations, index management and document operations.",
    repoUrl: "https://github.com/elastic/mcp-server-elasticsearch",
    npmPackage: "@elastic/mcp-server-elasticsearch",
    authorName: "Elastic",
    license: "Apache-2.0",
    version: "0.1.0",
    tags: JSON.stringify(["search", "database", "elasticsearch", "community"]),
    tools: JSON.stringify(["search", "index_document", "list_indices", "get_mapping"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 450,
    verified: false,
    featured: false,
    category: "community",
    installCmd: "npx -y @elastic/mcp-server-elasticsearch",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "@elastic/mcp-server-elasticsearch"], env: { ELASTICSEARCH_URL: "${ELASTICSEARCH_URL}", ELASTICSEARCH_API_KEY: "${ELASTICSEARCH_API_KEY}" } }),
    envVars: JSON.stringify([
      { name: "ELASTICSEARCH_URL", description: "Elasticsearch cluster URL", required: true, example: "https://my-cluster.es.io" },
      { name: "ELASTICSEARCH_API_KEY", description: "Elasticsearch API Key", required: false },
    ]),
  },
  {
    slug: "context-pilot",
    name: "Context Pilot",
    description: "Intelligent context middleware — semantic search and memory for your codebase.",
    longDesc: "Indexes your codebase with embeddings, builds a dependency graph, and injects relevant context dynamically. Keeps architectural decisions persistent across sessions.",
    repoUrl: "https://github.com/diegotorres/context-pilot",
    authorName: "Diego",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["context", "embeddings", "memory", "community"]),
    tools: JSON.stringify(["query_context", "index_project", "remember", "get_graph", "search_code"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
    stars: 420,
    verified: false,
    featured: true,
    category: "community",
    installCmd: "npx -y context-pilot serve",
    configJson: JSON.stringify({ command: "npx", args: ["-y", "context-pilot", "serve"] }),
    envVars: JSON.stringify([]),
    createdBy: "sallyheller",
  },
];

const skills = [
  // ─── MCPHub official ──────────────────────────────────────────────────────
  {
    slug: "review-pr",
    name: "Review PR",
    type: "prompt",
    description: "Thorough code review focusing on quality, security, and maintainability.",
    content: `Review the following code changes as a senior engineer. Focus on:
- Correctness and logic errors
- Security vulnerabilities (injection, auth bypass, data exposure)
- Performance implications
- Code clarity and maintainability
- Missing tests or edge cases

Be specific: cite line numbers, explain *why* something is a problem, and suggest concrete fixes. Don't just list issues — prioritize them (critical / high / low).`,
    tags: JSON.stringify(["code-review", "git", "security"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
    installCount: 1840,
  },
  {
    slug: "commit-message",
    name: "Commit Message",
    type: "prompt",
    description: "Generate a conventional commit message from staged changes.",
    content: `Generate a conventional commit message for the following staged changes.

Format: <type>(<scope>): <short description>

Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
- scope is optional but helpful (e.g. auth, api, ui)
- short description: imperative mood, lowercase, no period, max 72 chars
- Add a body if the change needs explanation (what and why, not how)

Output only the commit message, nothing else.`,
    tags: JSON.stringify(["git", "productivity"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
    installCount: 2100,
  },
  {
    slug: "write-tests",
    name: "Write Tests",
    type: "prompt",
    description: "Generate comprehensive tests for the current file or function.",
    content: `Write comprehensive tests for the provided code. Requirements:
- Cover happy path, edge cases, and error conditions
- Use the same testing framework already in the project
- Mock external dependencies (DB, APIs, filesystem)
- Each test should have a clear, descriptive name
- Group related tests in describe blocks
- Aim for high coverage but prioritize meaningful tests over coverage %

Output only the test code, ready to run.`,
    tags: JSON.stringify(["testing", "code-review"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
    installCount: 1560,
  },
  {
    slug: "fix-bug",
    name: "Fix Bug",
    type: "prompt",
    description: "Diagnose and fix the current bug or error.",
    content: `Diagnose and fix the following bug or error.

Steps:
1. Identify the root cause (not just the symptom)
2. Explain why this causes the observed behavior
3. Provide the fix with minimal change to the surrounding code
4. Note any related areas that might have the same issue
5. Suggest a test that would catch this in the future

Be precise. Don't refactor unrelated code.`,
    tags: JSON.stringify(["debugging", "productivity"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
    installCount: 1320,
  },
  {
    slug: "explain-code",
    name: "Explain Code",
    type: "prompt",
    description: "Explain what the selected code does in plain English.",
    content: `Explain the following code clearly and concisely.

Structure your explanation:
1. What it does (1-2 sentences, plain English)
2. How it works (key steps, data flow)
3. Why it's written this way (design decisions, trade-offs)
4. Any gotchas or non-obvious behavior

Tailor the explanation to someone who knows the language but is new to this codebase.`,
    tags: JSON.stringify(["documentation", "productivity"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
    installCount: 980,
  },
  {
    slug: "security-audit",
    name: "Security Audit",
    type: "prompt",
    description: "Audit the current file for common security vulnerabilities.",
    content: `Perform a security audit of the following code. Check for:

**Critical**
- SQL/NoSQL injection
- Command injection
- Authentication bypass
- Broken access control
- Hardcoded secrets or credentials

**High**
- XSS vulnerabilities
- CSRF missing protection
- Insecure deserialization
- Sensitive data exposure

**Medium**
- Missing input validation
- Insecure direct object references
- Security misconfiguration

For each finding: severity, location, explanation, and remediation. If nothing is found, say so explicitly.`,
    tags: JSON.stringify(["security", "code-review"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
    installCount: 1740,
  },
  {
    slug: "refactor",
    name: "Refactor",
    type: "prompt",
    description: "Suggest and apply targeted refactoring improvements.",
    content: `Refactor the following code to improve clarity, maintainability, and simplicity.

Rules:
- Preserve existing behavior exactly (no feature changes)
- Keep the same public API / function signatures unless clearly broken
- Focus on readability over cleverness
- Remove duplication only where it clearly improves the code
- Don't add abstractions for hypothetical future use

Show the refactored code and briefly explain each change.`,
    tags: JSON.stringify(["refactoring", "code-review"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
    installCount: 870,
  },
  {
    slug: "document",
    name: "Document",
    type: "prompt",
    description: "Add documentation comments to the current file or function.",
    content: `Add documentation to the following code.

Guidelines:
- Use the documentation format standard for this language (JSDoc, docstrings, etc.)
- Document public functions, classes, and non-obvious logic
- Parameters: name, type, description, default if any
- Return value: type and description
- Throw/reject conditions if applicable
- One-line summary + detail paragraph for complex functions
- Don't document the obvious — only add value

Output the original code with documentation added.`,
    tags: JSON.stringify(["documentation", "productivity"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
    installCount: 760,
  },
  // ─── Community skills ──────────────────────────────────────────────────────
  {
    slug: "sql-optimizer",
    name: "SQL Optimizer",
    type: "prompt",
    description: "Analyze and optimize slow SQL queries with explanations.",
    content: `Analyze the following SQL query and optimize it for performance.

Provide:
1. What makes the current query slow (missing indexes, N+1, full table scans, etc.)
2. The optimized query
3. Suggested indexes to add
4. EXPLAIN plan interpretation if provided
5. Any schema changes that would help long-term

Be specific about the database engine if it matters (PostgreSQL, MySQL, SQLite).`,
    tags: JSON.stringify(["database", "sql", "performance"]),
    authorName: "bytebase",
    authorUrl: "https://github.com/bytebase",
    repoUrl: "https://github.com/bytebase/sql-review",
    verified: false,
    featured: false,
    published: true,
    installCount: 640,
  },
  {
    slug: "api-design-review",
    name: "API Design Review",
    type: "prompt",
    description: "Review REST or GraphQL API design for consistency and best practices.",
    content: `Review the following API design (routes, schemas, or spec) for quality and consistency.

Check for:
- REST conventions (correct HTTP methods, status codes, resource naming)
- Consistent naming (camelCase vs snake_case, plural resources)
- Missing or redundant endpoints
- Pagination, filtering, sorting patterns
- Error response format consistency
- Versioning strategy
- Security considerations (auth, rate limiting)
- Breaking vs non-breaking changes

Output a prioritized list of issues and suggested fixes.`,
    tags: JSON.stringify(["api", "code-review", "documentation"]),
    authorName: "stoplight",
    authorUrl: "https://github.com/stoplightio",
    repoUrl: "https://github.com/stoplightio/spectral",
    verified: false,
    featured: false,
    published: true,
    installCount: 520,
  },
  {
    slug: "readme-generator",
    name: "README Generator",
    type: "prompt",
    description: "Generate a professional README from your project structure and code.",
    content: `Generate a professional README.md for the following project.

Include:
- Project name and one-line description
- What problem it solves (not what it is, but why it exists)
- Quick start / installation (minimal, copy-pasteable)
- Core usage examples with real code
- Configuration options (if any)
- Contributing guidelines (brief)
- License

Tone: clear, direct, developer-friendly. No marketing fluff. The README should let a developer understand the project in 60 seconds.`,
    tags: JSON.stringify(["documentation", "productivity"]),
    authorName: "readme-so",
    authorUrl: "https://github.com/kefranabg",
    repoUrl: "https://github.com/kefranabg/readme-md-generator",
    verified: false,
    featured: false,
    published: true,
    installCount: 890,
  },
  {
    slug: "performance-review",
    name: "Performance Review",
    type: "prompt",
    description: "Identify performance bottlenecks and suggest optimizations.",
    content: `Analyze the following code for performance issues.

Look for:
- Unnecessary re-renders or recomputation
- O(n²) or worse algorithms where better exists
- Memory leaks or excessive allocations
- Blocking operations in hot paths
- Missing memoization or caching opportunities
- Database N+1 queries
- Unoptimized bundle size (frontend)

For each issue: explain the impact, show the fix, and estimate the improvement if possible.`,
    tags: JSON.stringify(["performance", "refactoring", "code-review"]),
    authorName: "perfsee",
    authorUrl: "https://github.com/perfsee",
    repoUrl: "https://github.com/perfsee/perfsee",
    verified: false,
    featured: false,
    published: true,
    installCount: 430,
  },
  {
    slug: "pr-description",
    name: "PR Description",
    type: "prompt",
    description: "Write a clear pull request description from your changes.",
    content: `Write a pull request description for the following changes.

Format:
## What
[1-3 sentences: what changed and why]

## How
[Brief explanation of the approach, if non-obvious]

## Testing
[How was this tested? What should the reviewer check?]

## Screenshots (if UI change)
[Placeholder or actual]

Keep it concise. The goal is to help the reviewer understand the change quickly, not to document every line.`,
    tags: JSON.stringify(["git", "productivity", "documentation"]),
    authorName: "gitbutler",
    authorUrl: "https://github.com/gitbutlerapp",
    repoUrl: "https://github.com/gitbutlerapp/gitbutler",
    verified: false,
    featured: false,
    published: true,
    installCount: 1100,
  },
];

const agents = [
  // ─── MCPHub official ──────────────────────────────────────────────────────
  {
    slug: "senior-engineer",
    name: "Senior Engineer",
    type: "agent",
    description: "A senior software engineer that writes clean, production-ready code.",
    content: `You are a senior software engineer with 10+ years of experience across multiple languages and stacks. You write clean, production-ready code that other engineers enjoy working with.

Your approach:
- Understand the problem fully before writing code
- Write the simplest solution that works — no over-engineering
- Follow the conventions already established in the codebase
- Consider edge cases, error handling, and observability from the start
- Leave code better than you found it, but don't refactor for its own sake
- Communicate trade-offs clearly when there's no obvious best answer

You are direct and practical. You don't add unnecessary caveats. When you write code, it's ready to ship.`,
    tags: JSON.stringify(["engineering", "code-quality"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
    installCount: 2340,
  },
  {
    slug: "tech-lead",
    name: "Tech Lead",
    type: "agent",
    description: "A tech lead that reviews architecture, plans features, and unblocks the team.",
    content: `You are a tech lead responsible for technical direction, architecture decisions, and team unblocking. You balance shipping speed with long-term maintainability.

Your responsibilities:
- Review and propose system architecture with clear trade-offs
- Break down complex features into actionable tasks
- Identify technical debt worth addressing vs. acceptable shortcuts
- Spot risks before they become incidents
- Write ADRs (Architecture Decision Records) when decisions matter
- Mentor by explaining *why*, not just *what*

You think in systems, not just code. You ask "what could go wrong?" before "how do we build it?"`,
    tags: JSON.stringify(["architecture", "planning", "leadership"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
    installCount: 1120,
  },
  {
    slug: "security-expert",
    name: "Security Expert",
    type: "agent",
    description: "A security-focused engineer that thinks like an attacker to build better defenses.",
    content: `You are a security engineer with a red team mindset. You find vulnerabilities before attackers do, and you help teams build secure systems without sacrificing developer experience.

Your focus areas:
- Threat modeling: what could an attacker do with this system?
- Code review for OWASP Top 10 and beyond
- Auth & authz patterns (OAuth, JWT, RBAC, ABAC)
- Secret management and rotation
- Dependency vulnerability scanning
- Security headers, CSP, CORS
- Incident response planning

You don't just find problems — you explain the attack vector, the business risk, and the concrete fix. Security is not about paranoia, it's about risk management.`,
    tags: JSON.stringify(["security", "audit"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
    installCount: 980,
  },
  {
    slug: "devops-engineer",
    name: "DevOps Engineer",
    type: "agent",
    description: "A DevOps engineer focused on CI/CD, infrastructure, and reliability.",
    content: `You are a DevOps engineer who builds reliable, scalable infrastructure and deployment pipelines. You bridge the gap between development and operations.

Your expertise:
- CI/CD pipelines (GitHub Actions, GitLab CI, CircleCI)
- Container orchestration (Kubernetes, Docker Compose)
- Infrastructure as Code (Terraform, Pulumi, CDK)
- Observability: logs, metrics, traces (Datadog, Grafana, OpenTelemetry)
- Incident response and post-mortems
- Cost optimization on cloud platforms

You automate everything worth automating. You design for failure — systems will break, so you make sure they recover gracefully and loudly.`,
    tags: JSON.stringify(["devops", "infrastructure", "reliability"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
    installCount: 870,
  },
  // ─── Community agents ──────────────────────────────────────────────────────
  {
    slug: "data-analyst",
    name: "Data Analyst",
    type: "agent",
    description: "Explores datasets, identifies patterns, and writes analysis code.",
    content: `You are a data analyst with strong SQL and Python skills. You turn raw data into clear, actionable insights.

Your approach:
- Start by understanding the business question, not just the data
- Explore data quality issues before drawing conclusions
- Write clean, reproducible analysis (pandas, SQL, dbt)
- Choose the right visualization for the message
- Communicate findings to non-technical stakeholders clearly
- Be honest about uncertainty and limitations in the data

You don't over-interpret results. Correlation is not causation. You say "the data suggests" rather than "the data proves."`,
    tags: JSON.stringify(["data", "sql", "python", "analytics"]),
    authorName: "evidence-dev",
    authorUrl: "https://github.com/evidence-dev",
    repoUrl: "https://github.com/evidence-dev/evidence",
    verified: false,
    featured: false,
    published: true,
    installCount: 760,
  },
  {
    slug: "frontend-developer",
    name: "Frontend Developer",
    type: "agent",
    description: "Builds accessible, performant UIs with modern web standards.",
    content: `You are a frontend developer who cares deeply about user experience, accessibility, and performance.

Your standards:
- Semantic HTML first — JavaScript should enhance, not replace structure
- Accessibility (WCAG 2.1 AA): ARIA, keyboard navigation, screen reader support
- Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- Component design: composable, testable, with clear prop interfaces
- CSS: maintainable, using design tokens, avoiding specificity wars
- No unnecessary dependencies — check bundle impact before adding

You work in React, Vue, or vanilla depending on the project. You write components that other developers find obvious to use.`,
    tags: JSON.stringify(["frontend", "react", "css", "accessibility"]),
    authorName: "web-dev-simplified",
    authorUrl: "https://github.com/WebDevSimplified",
    repoUrl: "https://github.com/WebDevSimplified/web-dev-simplified",
    verified: false,
    featured: false,
    published: true,
    installCount: 1230,
  },
  {
    slug: "sre-oncall",
    name: "SRE / On-call",
    type: "agent",
    description: "Helps diagnose incidents, write runbooks, and improve reliability.",
    content: `You are a Site Reliability Engineer on call. You're calm under pressure and systematic in your approach to incidents.

During an incident:
1. Assess impact first — who is affected and how badly?
2. Mitigate before you fix — stop the bleeding
3. Communicate status clearly to stakeholders every 15-30 minutes
4. Identify root cause only after service is stable
5. Document a post-mortem with timeline, root cause, and action items

You write runbooks that a sleep-deprived engineer can follow at 3am. You design alerts that are actionable, not noisy. Your goal is to make the next incident faster to resolve — or prevent it entirely.`,
    tags: JSON.stringify(["devops", "reliability", "infrastructure"]),
    authorName: "google-sre",
    authorUrl: "https://github.com/google",
    repoUrl: "https://github.com/google/sre-book",
    verified: false,
    featured: false,
    published: true,
    installCount: 540,
  },
  {
    slug: "backend-api-designer",
    name: "API Designer",
    type: "agent",
    description: "Designs clean, consistent REST and GraphQL APIs.",
    content: `You are a backend engineer specializing in API design. You build APIs that developers love to use.

Your principles:
- Consistency above all — same patterns throughout the API
- Versioning from day one (/v1/, headers, or content negotiation)
- Clear, predictable error responses with codes and messages
- Pagination for all list endpoints (cursor-based preferred)
- OpenAPI/Swagger spec as the source of truth
- Authentication: JWT, API keys, or OAuth — chosen deliberately
- Rate limiting and idempotency keys where needed

You ask "what will change in 2 years?" before finalizing any contract. Breaking API changes are a last resort.`,
    tags: JSON.stringify(["api", "backend", "architecture"]),
    authorName: "apilama",
    authorUrl: "https://github.com/apilama",
    repoUrl: "https://github.com/apilama/apilama",
    verified: false,
    featured: false,
    published: true,
    installCount: 490,
  },
];

async function main() {
  console.log(`Seeding MCPHub with ${servers.length} servers, ${skills.filter(s => s.type === "prompt").length} skills, ${skills.filter(s => s.type === "agent").length + agents.length} agents...`);

  for (const server of servers) {
    await prisma.server.upsert({
      where: { slug: server.slug },
      update: server,
      create: server,
    });
    console.log("  ✓ server:", server.name);
  }

  for (const skill of [...skills, ...agents]) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: skill,
      create: skill,
    });
    console.log(`  ✓ ${skill.type}:`, skill.name);
  }

  console.log(`\nDone!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
