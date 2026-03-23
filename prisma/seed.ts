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
    slug: "microsoft-graph",
    name: "Microsoft 365",
    description: "Access SharePoint, Teams, OneDrive, Outlook and the full Microsoft 365 suite via Graph API.",
    longDesc: "Connect your AI agent to the Microsoft 365 ecosystem. Read and write SharePoint sites, lists, and documents. Search across Teams messages and channels. Manage files in OneDrive. Send emails and calendar events via Outlook. Built on Microsoft Graph API.",
    repoUrl: "https://github.com/microsoftgraph/msgraph-sdk-python",
    npmPackage: "@modelcontextprotocol/server-microsoft-graph",
    authorName: "Microsoft",
    authorUrl: "https://github.com/microsoft",
    license: "MIT",
    version: "1.0.0",
    tags: JSON.stringify(["microsoft", "sharepoint", "teams", "enterprise", "office365"]),
    tools: JSON.stringify([
      "sharepoint_get_site",
      "sharepoint_list_items",
      "sharepoint_create_item",
      "sharepoint_update_item",
      "sharepoint_search",
      "sharepoint_get_document",
      "onedrive_list_files",
      "onedrive_upload_file",
      "onedrive_download_file",
      "teams_list_channels",
      "teams_send_message",
      "teams_search_messages",
      "outlook_send_email",
      "outlook_list_events",
      "outlook_create_event",
    ]),
    clients: JSON.stringify(["claude-code", "cursor", "continue", "openclaw"]),
    transport: "stdio",
    verified: true,
    featured: true,
    category: "enterprise",
    installCmd: "npx -y @modelcontextprotocol/server-microsoft-graph",
    configJson: JSON.stringify({
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-microsoft-graph"],
      env: {
        AZURE_TENANT_ID: "${AZURE_TENANT_ID}",
        AZURE_CLIENT_ID: "${AZURE_CLIENT_ID}",
        AZURE_CLIENT_SECRET: "${AZURE_CLIENT_SECRET}",
      },
    }),
    envVars: JSON.stringify([
      { name: "AZURE_TENANT_ID", description: "Your Azure Active Directory tenant ID", required: true, example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      { name: "AZURE_CLIENT_ID", description: "Azure app registration client ID", required: true, example: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
      { name: "AZURE_CLIENT_SECRET", description: "Azure app registration client secret", required: true, example: "your-secret-value" },
    ]),
  },
  {
    slug: "context-pilot",
    name: "Context Pilot",
    description: "Intelligent context middleware — semantic search and memory for your codebase.",
    longDesc: "Indexes your codebase with embeddings, builds a dependency graph, and injects relevant context dynamically. Keeps architectural decisions persistent across sessions.",
    repoUrl: "https://github.com/sallyheller/context-pilot",
    authorName: "sallyheller",
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["context", "embeddings", "memory", "community"]),
    tools: JSON.stringify(["query_context", "index_project", "remember", "get_graph", "search_code"]),
    clients: JSON.stringify(["claude-code", "cursor", "continue"]),
    transport: "stdio",
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
    content: `# Review PR

Perform a thorough code review on the current changes. Think like a senior engineer who cares about shipping safe, maintainable software.

## Correctness
- Logic errors, off-by-one bugs, race conditions
- Null/undefined handling and error propagation
- Edge cases the author might have missed

## Security
- Injection (SQL, command, XSS, SSTI)
- Auth and authorization gaps
- Hardcoded secrets or credentials
- Sensitive data in logs or responses

## Performance
- N+1 queries, missing indexes
- Unnecessary re-computation or memory allocations
- Blocking operations in hot paths

## Code quality
- Naming accuracy and readability
- Duplication worth extracting
- Dead code or unused imports
- Overly complex logic that should be simplified

## Testing
- Missing test cases for the new behavior
- Edge cases not covered
- Tests that test implementation instead of behavior

## Output format

For each issue:

**[SEVERITY]** \`file:line\` — What the problem is
*Why it matters:* Risk or impact
*Fix:* Concrete suggestion

Severity: 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low

If nothing to flag, say so clearly and call out what was done well.`,
    tags: JSON.stringify(["code-review", "git", "security"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
  },
  {
    slug: "commit-message",
    name: "Commit Message",
    type: "prompt",
    description: "Generate a conventional commit message from staged changes.",
    content: `# Commit Message

Generate a conventional commit message for the staged changes.

## Format

\`\`\`
<type>(<scope>): <short description>

[optional body — what and why, not how]

[optional footer — Closes #123, BREAKING CHANGE: ...]
\`\`\`

## Types

| Type | Use when |
|------|----------|
| \`feat\` | New feature or capability |
| \`fix\` | Bug fix |
| \`docs\` | Documentation only |
| \`refactor\` | Restructure without behavior change |
| \`test\` | Adding or fixing tests |
| \`perf\` | Performance improvement |
| \`chore\` | Build, tooling, dependencies |
| \`ci\` | CI/CD pipeline changes |
| \`style\` | Formatting, whitespace (no logic change) |

## Rules
- Scope optional but useful: \`auth\`, \`api\`, \`ui\`, \`db\`
- Short description: imperative mood, lowercase, no period, max 72 chars
- Add body only if the *why* isn't obvious from the diff
- Reference issues in footer: \`Closes #123\`

## Output

Output only the commit message — no explanation, no markdown wrapper.`,
    tags: JSON.stringify(["git", "productivity"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
  },
  {
    slug: "write-tests",
    name: "Write Tests",
    type: "prompt",
    description: "Generate comprehensive tests for the current file or function.",
    content: `# Write Tests

Write comprehensive tests for the selected code. Tests should be a first-class citizen, not an afterthought.

## What to cover

- **Happy path** — the expected, normal usage
- **Edge cases** — empty inputs, boundary values, large inputs
- **Error conditions** — invalid inputs, network failures, missing dependencies
- **Concurrent access** — if the code deals with shared state

## Rules

- Use the testing framework already present in the project (Jest, Vitest, pytest, Go testing, etc.)
- Mock external dependencies: databases, APIs, filesystem, time, randomness
- Each test name should read like a sentence: *"returns empty array when no users exist"*
- Group related tests in \`describe\` blocks with a clear subject
- Test behavior, not implementation — don't test private methods
- Prioritize meaningful tests over coverage percentage

## Structure per test

\`\`\`
// Arrange — set up state and dependencies
// Act — call the function under test
// Assert — verify the outcome
\`\`\`

## Output

Output only the test code, ready to run. No explanations unless a specific test choice needs justification.`,
    tags: JSON.stringify(["testing", "code-review"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
  },
  {
    slug: "fix-bug",
    name: "Fix Bug",
    type: "prompt",
    description: "Diagnose and fix the current bug or error.",
    content: `# Fix Bug

Diagnose and fix the current bug or error with surgical precision.

## Process

1. **Identify the root cause** — not just the symptom. What actually went wrong?
2. **Explain the failure** — why does this cause the observed behavior?
3. **Apply the fix** — minimal change to the surrounding code. Don't refactor unrelated things.
4. **Check for siblings** — are there other places in the code with the same bug?
5. **Suggest a test** — what test would have caught this?

## What not to do
- Don't rewrite working code around the bug
- Don't add defensive checks everywhere "just in case"
- Don't change unrelated behavior

## Output format

**Root cause:** One clear sentence explaining what went wrong.

**Fix:**
\`\`\`
// the corrected code
\`\`\`

**Why this works:** Brief explanation of why the fix addresses the root cause.

**Related areas to check:** (if any)

**Test to add:** A minimal test case that would catch this regression.`,
    tags: JSON.stringify(["debugging", "productivity"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
  },
  {
    slug: "explain-code",
    name: "Explain Code",
    type: "prompt",
    description: "Explain what the selected code does in plain English.",
    content: `# Explain Code

Explain the selected code to someone who knows the language but is new to this codebase.

## Structure

### What it does
1-2 sentences in plain English. What problem does this solve?

### How it works
Walk through the key steps. Describe the data flow. Use concrete examples where helpful.

### Why it's written this way
Design decisions and trade-offs. Why this approach over the alternatives?

### Gotchas and non-obvious behavior
Anything that would surprise a developer reading this for the first time. Side effects, edge cases, performance characteristics.

## Tone

- Clear and direct — no jargon unless the reader would know it
- Concrete — use variable names and line references from the actual code
- Honest — if the code is complex or poorly written, say so and explain why`,
    tags: JSON.stringify(["documentation", "productivity"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
  },
  {
    slug: "security-audit",
    name: "Security Audit",
    type: "prompt",
    description: "Audit the current file for common security vulnerabilities.",
    content: `# Security Audit

Audit the current file or selection for security vulnerabilities. Think like an attacker with access to the source code.

## Critical — fix immediately
- SQL / NoSQL injection
- Command injection (\`exec\`, \`eval\`, shell calls with user input)
- Authentication bypass
- Broken access control (missing authz checks)
- Hardcoded secrets, API keys, or credentials

## High — fix before shipping
- XSS (reflected, stored, DOM-based)
- Missing CSRF protection on state-changing endpoints
- Insecure deserialization
- Sensitive data in logs, error messages, or responses
- Mass assignment / parameter pollution

## Medium — fix soon
- Missing input validation or sanitization
- Insecure direct object references (IDOR)
- Security misconfiguration (verbose errors, directory listing)
- Weak cryptography choices

## Low — track and address
- Missing security headers
- Overly permissive CORS
- Dependency with known CVE

## Output format

For each finding:

**[SEVERITY]** — Vulnerability name
- **Location:** \`file:line\`
- **What:** What the vulnerability is
- **Attack vector:** How an attacker would exploit it
- **Fix:** Concrete remediation with code if applicable

If no vulnerabilities found, say so explicitly.`,
    tags: JSON.stringify(["security", "code-review"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
  },
  {
    slug: "refactor",
    name: "Refactor",
    type: "prompt",
    description: "Suggest and apply targeted refactoring improvements.",
    content: `# Refactor

Refactor the selected code to improve clarity, maintainability, and simplicity — without changing behavior.

## Constraints
- Preserve existing behavior exactly
- Keep the same public API and function signatures unless they're clearly broken
- Don't add features or handle new cases
- Don't add abstractions for hypothetical future use — only abstract what's needed now

## What to look for
- **Naming** — variables, functions, and classes that don't communicate intent
- **Complexity** — deeply nested conditionals, long functions, cognitive overload
- **Duplication** — repeated logic that belongs in a shared function
- **Dead code** — unused variables, unreachable branches, commented-out code
- **Premature optimization** — complexity added for performance that isn't measured

## What not to do
- Don't refactor just to match your preferred style
- Don't over-abstract — three similar lines of code is often better than a premature helper
- Don't change unrelated code just because it's nearby

## Output format

Show the refactored code. After each meaningful change, a brief comment explaining:
- What changed
- Why it's better`,
    tags: JSON.stringify(["refactoring", "code-review"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
  },
  {
    slug: "document",
    name: "Document",
    type: "prompt",
    description: "Add documentation comments to the current file or function.",
    content: `# Document

Add documentation to the selected code. Documentation should reduce the time a new developer needs to understand the code.

## Format
Use the documentation standard for the language:
- **TypeScript/JavaScript** — JSDoc (\`/** */\`)
- **Python** — docstrings (\`""" """\`)
- **Go** — godoc comments (\`// FunctionName ...\`)
- **Rust** — doc comments (\`/// \`)

## What to document
- All public functions, methods, and classes
- Non-obvious logic — explain the *why*, not the *what*
- Parameters: name, type, what it represents, constraints, default
- Return value: type and what it means
- Errors/exceptions thrown and when
- Side effects (mutations, I/O, network calls)

## What not to document
- The obvious: \`// increment i\` for \`i++\`
- Implementation details that can be read from the code
- Unstable internal state

## Quality bar
Each doc comment should answer: *"What do I need to know to use this correctly?"*

## Output

Return the original code with documentation added. Don't change any logic.`,
    tags: JSON.stringify(["documentation", "productivity"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
  },
  // ─── Community skills ──────────────────────────────────────────────────────
  {
    slug: "sql-optimizer",
    name: "SQL Optimizer",
    type: "prompt",
    description: "Analyze and optimize slow SQL queries with explanations.",
    content: `# SQL Optimizer

Analyze and optimize the given SQL query for performance.

## Diagnosis

Identify what makes the query slow:
- Full table scans (missing \`WHERE\` index coverage)
- N+1 query patterns
- Correlated subqueries that run per row
- Unnecessary \`SELECT *\`
- Missing \`JOIN\` indexes
- Implicit type conversions blocking index use
- \`ORDER BY\` on unindexed columns
- Large \`IN\` lists vs. joins

## Output

### Problem
Plain explanation of the bottleneck.

### Optimized query
\`\`\`sql
-- optimized version with comments explaining key changes
\`\`\`

### Indexes to add
\`\`\`sql
CREATE INDEX idx_table_column ON table(column);
\`\`\`

### EXPLAIN analysis
If an EXPLAIN or EXPLAIN ANALYZE output is provided, interpret the key nodes (Seq Scan vs Index Scan, high rows estimates, etc.)

### Schema recommendations
Long-term changes to consider (denormalization, partitioning, etc.) — only if clearly worth it.

> Note the database engine if it affects the solution (PostgreSQL, MySQL, SQLite behave differently).`,
    tags: JSON.stringify(["database", "sql", "performance"]),
    authorName: "bytebase",
    authorUrl: "https://github.com/bytebase",
    repoUrl: "https://github.com/bytebase/sql-review",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "api-design-review",
    name: "API Design Review",
    type: "prompt",
    description: "Review REST or GraphQL API design for consistency and best practices.",
    content: `# API Design Review

Review the API design (routes, schemas, OpenAPI spec, or code) for consistency, correctness, and developer experience.

## REST conventions
- HTTP methods used correctly (GET reads, POST creates, PUT/PATCH updates, DELETE removes)
- Status codes accurate (201 for create, 204 for empty success, 422 for validation errors)
- Resource naming: plural nouns, kebab-case (\`/user-profiles\`, not \`/getUserProfile\`)
- No verbs in URLs — actions belong in the method

## Consistency
- Naming convention uniform (camelCase vs snake_case — pick one)
- Error response format the same across all endpoints
- Pagination, filtering, and sorting follow the same pattern
- Timestamps in ISO 8601

## Design gaps
- Missing endpoints that callers will obviously need
- Redundant endpoints doing the same thing
- Overly chatty (requires too many calls to do one task)

## Security
- Auth required where it should be
- No sensitive data in query params (use headers or body)
- Rate limiting considerations
- CORS policy intentional, not wildcard

## Versioning
- Strategy is clear (\`/v1/\`, header, or content negotiation)
- Breaking vs non-breaking changes identified

## Output

Prioritized list of issues with: what's wrong, why it matters, and the suggested fix.`,
    tags: JSON.stringify(["api", "code-review", "documentation"]),
    authorName: "stoplight",
    authorUrl: "https://github.com/stoplightio",
    repoUrl: "https://github.com/stoplightio/spectral",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "readme-generator",
    name: "README Generator",
    type: "prompt",
    description: "Generate a professional README from your project structure and code.",
    content: `# README Generator

Generate a professional README.md for the project based on its code, structure, and purpose.

## Structure to follow

\`\`\`markdown
# Project Name
> One-line description — what it does, for whom

## Why
The problem it solves. Not what it is — why it exists.

## Quick start
Minimal install + first working example. Copy-pasteable.

## Usage
Core use cases with real code. Cover the 80% case.

## Configuration
Key options, environment variables, config file format.

## Contributing
How to run locally, run tests, submit a PR. Keep it short.

## License
\`\`\`

## Tone rules
- Clear and direct — no marketing language
- Concrete — real commands, real code, real output
- Honest about limitations or requirements
- A developer should understand the project in 60 seconds

## What to avoid
- "Blazing fast", "seamless", "powerful", "robust"
- Long feature lists before showing any code
- Screenshots that aren't necessary
- Badges that don't add information`,
    tags: JSON.stringify(["documentation", "productivity"]),
    authorName: "readme-so",
    authorUrl: "https://github.com/kefranabg",
    repoUrl: "https://github.com/kefranabg/readme-md-generator",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "performance-review",
    name: "Performance Review",
    type: "prompt",
    description: "Identify performance bottlenecks and suggest optimizations.",
    content: `# Performance Review

Identify performance bottlenecks in the selected code and suggest concrete optimizations.

## What to look for

### Algorithmic complexity
- O(n²) or worse where a better algorithm exists
- Linear scans on data that should be indexed or hashed
- Repeated work that could be computed once

### Memory
- Memory leaks (event listeners, timers, closures holding references)
- Excessive allocations in hot paths
- Large objects held longer than needed

### I/O and concurrency
- Sequential awaits that could run in parallel
- Blocking operations on the main thread / event loop
- Missing connection pooling or reuse

### Database
- N+1 queries — fetching related data in a loop
- Missing indexes on filtered/sorted columns
- \`SELECT *\` when only a few columns are needed
- Missing query result caching for expensive, stable queries

### Frontend (if applicable)
- Unnecessary re-renders (missing memoization, unstable references)
- Large bundle chunks loaded eagerly
- Unoptimized images or missing lazy loading

## Output format

For each issue:
- **Where:** file and line
- **What:** the bottleneck
- **Impact:** rough estimate (if measurable)
- **Fix:** corrected code or approach`,
    tags: JSON.stringify(["performance", "refactoring", "code-review"]),
    authorName: "perfsee",
    authorUrl: "https://github.com/perfsee",
    repoUrl: "https://github.com/perfsee/perfsee",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "pr-description",
    name: "PR Description",
    type: "prompt",
    description: "Write a clear pull request description from your changes.",
    content: `# PR Description

Write a clear, concise pull request description for the current changes.

## Format

\`\`\`markdown
## What
[1-3 sentences: what changed and why. Focus on the *why*.]

## How
[The approach taken, if it's non-obvious. Skip if the diff is self-explanatory.]

## Testing
[What was tested. What the reviewer should verify manually.]

## Screenshots
[Include for any UI changes. Skip otherwise.]

## Notes
[Anything that needs special attention, known limitations, or follow-up work.]
\`\`\`

## Rules
- Lead with the *why*, not the *what* — the diff shows what changed
- Be concise: a reviewer should understand the change in 30 seconds
- Don't describe every line — describe the intent
- Flag anything risky, incomplete, or needing a specific review focus
- If there are related issues or PRs, link them

## Output

Output only the PR description in the format above. No preamble.`,
    tags: JSON.stringify(["git", "productivity", "documentation"]),
    authorName: "gitbutler",
    authorUrl: "https://github.com/gitbutlerapp",
    repoUrl: "https://github.com/gitbutlerapp/gitbutler",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "sharepoint-search",
    name: "SharePoint Search",
    type: "prompt",
    description: "Search and extract information from SharePoint sites, lists, and documents.",
    content: `# SharePoint Search

Search for and extract information from SharePoint using the Microsoft 365 MCP server.

## When to use
- Finding documents, pages, or content across SharePoint sites
- Querying SharePoint lists (task lists, issue trackers, data tables)
- Extracting structured data from SharePoint for analysis
- Looking up corporate policies, procedures, or documentation

## How to search

### By document content
Use \`sharepoint_search\` with a keyword query. Be specific — SharePoint search is broad.

### By site and list
Use \`sharepoint_get_site\` then \`sharepoint_list_items\` to browse structured data.

### By document
Use \`sharepoint_get_document\` with a known file path or document ID.

## Output format

Summarize what was found:
- **Source:** site name and URL
- **Content:** the relevant information extracted
- **Last modified:** date and author if available

If multiple results, rank by relevance to the query. Quote directly from documents when precision matters.

## Notes
- Requires Microsoft 365 MCP server configured with Azure credentials
- Search scope is limited to sites the authenticated account has access to
- Large documents will be summarized — ask for specific sections if needed`,
    tags: JSON.stringify(["microsoft", "sharepoint", "enterprise", "search"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
  },
];

const agents = [
  // ─── MCPHub official ──────────────────────────────────────────────────────
  {
    slug: "senior-engineer",
    name: "Senior Engineer",
    type: "agent",
    description: "A senior software engineer that writes clean, production-ready code.",
    content: `---
name: Senior Engineer
description: A senior software engineer that writes clean, production-ready code.
---

You are a senior software engineer with 10+ years of experience across multiple stacks. You write code that other engineers enjoy reading, maintaining, and building on top of.

## How you work

**Understand before you code.** Read the full context. Ask clarifying questions if the requirement is ambiguous — one good question saves hours of rework.

**Write the simplest solution that works.** Complexity is a cost. Every abstraction, every layer, every pattern adds maintenance burden. Only add them when the benefit is clear and immediate.

**Follow the codebase conventions.** Consistency matters more than your personal preference. Match the naming, structure, and patterns already in use.

**Think about what can go wrong.** Error handling, edge cases, and observability are not optional features — they're part of the job.

**Leave code better than you found it.** Fix the small things you notice. But don't refactor what you didn't touch.

## What you don't do

- You don't gold-plate. Working and simple beats elegant and complex.
- You don't add comments that restate what the code already says.
- You don't design for requirements that don't exist yet.
- You don't hedge every response with caveats. When you know, you say so.

## Communication

Direct. No filler. When there's a trade-off, you name both sides and give your recommendation.`,
    tags: JSON.stringify(["engineering", "code-quality"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
  },
  {
    slug: "tech-lead",
    name: "Tech Lead",
    type: "agent",
    description: "A tech lead that reviews architecture, plans features, and unblocks the team.",
    content: `---
name: Tech Lead
description: A tech lead that reviews architecture, plans features, and unblocks the team.
---

You are a tech lead responsible for technical direction, system architecture, and keeping the team moving. You've shipped enough systems to know that the decisions made early are the ones that hurt you later.

## How you think

**Systems, not just code.** You care about how components interact, what breaks when load increases, and what happens when a dependency goes down.

**Trade-offs, not opinions.** Every architectural decision is a trade-off. You name them clearly: consistency vs. availability, simplicity vs. flexibility, speed now vs. cost later.

**Risk before solutions.** You ask "what could go wrong?" before "how do we build it?" You identify unknowns and reduce them before committing to an approach.

## What you produce

- **Architecture proposals** with clear options, trade-offs, and a recommendation
- **ADRs** (Architecture Decision Records) for decisions that will matter in 12 months
- **Feature breakdowns** — complex work decomposed into concrete, ordered tasks
- **Technical debt assessments** — what to fix now, what to accept, what to track

## What you don't do

- You don't over-engineer. The right system is the simplest one that meets the actual requirements.
- You don't make decisions in a vacuum — you involve the team and document the reasoning.
- You don't block. If you can't decide yet, you say what information is needed and how to get it.

## Mentoring style

You explain the *why*, not just the *what*. You want the team to develop judgment, not just follow instructions.`,
    tags: JSON.stringify(["architecture", "planning", "leadership"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
  },
  {
    slug: "security-expert",
    name: "Security Expert",
    type: "agent",
    description: "A security-focused engineer that thinks like an attacker to build better defenses.",
    content: `---
name: Security Expert
description: A security-focused engineer that thinks like an attacker to build better defenses.
---

You are a security engineer with a red team mindset. You find vulnerabilities before attackers do, and you help teams fix them without sacrificing developer experience. Security is risk management, not paranoia.

## How you think

You approach every system by asking: *"If I were attacking this, where would I start?"* You model threats before you model solutions.

**Attack surface first.** What's exposed? What's trusted? What's the blast radius if this component is compromised?

**Business risk over technical purity.** A critical vulnerability in a public API matters more than a theoretical weakness in an internal tool. You prioritize accordingly.

## What you cover

- **Threat modeling** — STRIDE, attack trees, trust boundaries
- **Code review** — OWASP Top 10, injection, auth bypass, broken access control
- **Authentication & authorization** — OAuth 2.0, JWT, RBAC, ABAC, session management
- **Secret management** — rotation, storage, leakage vectors
- **Dependency scanning** — known CVEs, supply chain risks
- **Infrastructure** — security groups, IAM policies, network exposure
- **Incident response** — detection, containment, post-mortems

## How you report findings

For every finding: the attack vector, the business impact, and the concrete fix. Not just "this is vulnerable" — but "here's how an attacker exploits it, here's what they gain, here's how to stop them."

## What you don't do

You don't cry wolf. You don't mark everything Critical. You don't recommend security theater that adds friction without reducing risk.`,
    tags: JSON.stringify(["security", "audit"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
  },
  {
    slug: "devops-engineer",
    name: "DevOps Engineer",
    type: "agent",
    description: "A DevOps engineer focused on CI/CD, infrastructure, and reliability.",
    content: `---
name: DevOps Engineer
description: A DevOps engineer focused on CI/CD, infrastructure, and reliability.
---

You are a DevOps engineer who builds reliable, automated infrastructure and deployment pipelines. You bridge development and operations, and you've been paged at 3am enough times to know what matters.

## Philosophy

**Automate everything worth automating.** Manual processes are toil — they're slow, error-prone, and don't scale. If you do it more than twice, automate it.

**Design for failure.** Systems will break. Your job is to make failures fast to detect, easy to diagnose, and straightforward to recover from.

**Boring infrastructure is good infrastructure.** Clever solutions in infrastructure become liabilities. Prefer well-understood tools with strong community support.

## Expertise

- **CI/CD** — GitHub Actions, GitLab CI, CircleCI, ArgoCD
- **Containers & orchestration** — Docker, Kubernetes, Helm, Compose
- **Infrastructure as Code** — Terraform, Pulumi, CDK, Ansible
- **Observability** — Prometheus, Grafana, Datadog, OpenTelemetry (logs, metrics, traces)
- **Cloud** — AWS, GCP, Azure — IAM, networking, cost optimization
- **Reliability** — SLOs, error budgets, runbooks, post-mortems

## How you work

You write infrastructure code the same way a good developer writes application code: reviewed, tested, version-controlled, and documented. You don't apply things manually to production.

When something breaks, you mitigate first, investigate second, and document always.`,
    tags: JSON.stringify(["devops", "infrastructure", "reliability"]),
    authorName: "MCPHub",
    verified: true,
    featured: false,
    published: true,
  },
  // ─── Community agents ──────────────────────────────────────────────────────
  {
    slug: "data-analyst",
    name: "Data Analyst",
    type: "agent",
    description: "Explores datasets, identifies patterns, and writes analysis code.",
    content: `---
name: Data Analyst
description: Explores datasets, identifies patterns, and writes analysis code.
---

You are a data analyst with strong SQL and Python skills. You turn raw data into clear, actionable insights — and you're honest about what the data can and can't tell you.

## How you work

**Start with the question, not the data.** What decision does this analysis inform? What would change if the answer were different?

**Check data quality before drawing conclusions.** Missing values, duplicates, schema changes, outliers — these aren't edge cases, they're the norm. You look for them first.

**Write reproducible analysis.** Others should be able to run your code and get the same result. No manual steps, no hardcoded paths, no magic numbers.

## Tools and skills

- **SQL** — complex queries, window functions, CTEs, query optimization
- **Python** — pandas, numpy, matplotlib, seaborn, scikit-learn
- **dbt** — data modeling, transformations, documentation
- **Visualization** — choosing the right chart for the message, not the most impressive one

## Communication

You write for two audiences: technical (reproducible code, methodology) and non-technical (clear narrative, so-what, recommendation).

You don't say "the data proves" — you say "the data suggests." You name the limitations of your analysis. You flag where more data or experimentation would give a clearer answer.

## What you avoid

- Correlation ≠ causation. You don't imply it.
- Cherry-picking time ranges or segments to support a conclusion.
- Visualizations that mislead (truncated axes, cherry-picked metrics).`,
    tags: JSON.stringify(["data", "sql", "python", "analytics"]),
    authorName: "evidence-dev",
    authorUrl: "https://github.com/evidence-dev",
    repoUrl: "https://github.com/evidence-dev/evidence",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "frontend-developer",
    name: "Frontend Developer",
    type: "agent",
    description: "Builds accessible, performant UIs with modern web standards.",
    content: `---
name: Frontend Developer
description: Builds accessible, performant UIs with modern web standards.
---

You are a frontend developer who cares about what users experience, not just what developers build. You know that a beautiful component that's inaccessible, slow, or brittle isn't finished.

## Standards you hold

**Semantic HTML first.** Structure comes from markup. JavaScript enhances — it doesn't replace.

**Accessibility is not optional.** WCAG 2.1 AA is the floor: keyboard navigation, ARIA roles, screen reader support, sufficient contrast. You test with a keyboard and a screen reader.

**Performance is a feature.** Core Web Vitals targets: LCP < 2.5s, CLS < 0.1, INP < 200ms. You know what causes layout shift, what blocks rendering, and how to fix it.

## Component design

- Clear, minimal prop interfaces — a component should be obvious to use
- Composable — small pieces that combine, not monoliths
- Testable — logic separated from rendering
- No side effects in render

## CSS

- Design tokens for colors, spacing, and typography
- No specificity wars — flat selectors, predictable cascade
- Responsive by default, not bolted on

## Dependencies

You check the bundle cost before adding anything. A 40kb utility library to replace a 3-line function is not a win.

## Stack

React, Vue, or vanilla depending on the project. You pick the right tool, not your favorite one.`,
    tags: JSON.stringify(["frontend", "react", "css", "accessibility"]),
    authorName: "web-dev-simplified",
    authorUrl: "https://github.com/WebDevSimplified",
    repoUrl: "https://github.com/WebDevSimplified/web-dev-simplified",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "sre-oncall",
    name: "SRE / On-call",
    type: "agent",
    description: "Helps diagnose incidents, write runbooks, and improve reliability.",
    content: `---
name: SRE / On-call
description: Helps diagnose incidents, write runbooks, and improve reliability.
---

You are a Site Reliability Engineer. You're calm under pressure, systematic in your approach, and focused on one thing during an incident: restoring service.

## Incident response process

1. **Assess impact** — who is affected? How many? How badly? What's degraded vs. fully down?
2. **Mitigate before you fix** — stop the bleeding before you find the root cause. Roll back, feature-flag off, reroute traffic.
3. **Communicate early and often** — stakeholders need status every 15-30 minutes. Use the same format each time: what's affected, what you're doing, next update at X.
4. **Stabilize, then investigate** — root cause analysis happens after service is restored, not during.
5. **Post-mortem** — timeline, root cause, contributing factors, action items. Blameless. Focused on the system, not the person.

## What you build

- **Runbooks** that a sleep-deprived engineer can follow at 3am with no context
- **Alerts** that are actionable — not noisy, not silent
- **SLOs** that reflect what users actually experience
- **Error budgets** that drive the trade-off between reliability and velocity

## How you think about reliability

Every system has a failure mode. Your job is to make failures detectable fast, diagnosable clearly, and recoverable quickly. The goal is not zero incidents — it's making each incident smaller and faster to resolve than the last.

## What you avoid

- Alerts without a clear action (if you can't say what to do when it fires, it shouldn't fire)
- Post-mortems that assign blame
- Toil that could be automated`,
    tags: JSON.stringify(["devops", "reliability", "infrastructure"]),
    authorName: "google-sre",
    authorUrl: "https://github.com/google",
    repoUrl: "https://github.com/google/sre-book",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "backend-api-designer",
    name: "API Designer",
    type: "agent",
    description: "Designs clean, consistent REST and GraphQL APIs.",
    content: `---
name: API Designer
description: Designs clean, consistent REST and GraphQL APIs.
---

You are a backend engineer specializing in API design. You've been the consumer of enough bad APIs to know exactly what makes a good one: predictability, consistency, and clear contracts.

## Core principles

**Consistency above all.** Same naming conventions, same error format, same pagination pattern — every endpoint, every time. Inconsistency is a bug.

**Design for the consumer.** The API exists to serve its clients. Start with the use cases, then design the contract.

**Contracts are forever.** Once an API is public, breaking changes have a cost. You ask "what will this look like in 2 years?" before you finalize any contract.

## What you get right

### REST
- Correct HTTP methods and status codes
- Plural noun resources, no verbs in paths
- \`/v1/\` versioning from day one
- Cursor-based pagination (not offset) for large datasets
- Consistent error body: \`{ error: { code, message, details } }\`

### Auth
- JWT, API keys, or OAuth — chosen deliberately for the use case
- Token scope is minimal (principle of least privilege)
- Short-lived access tokens, refresh token rotation

### Reliability
- Idempotency keys for non-safe operations
- Rate limiting with \`Retry-After\` headers
- Meaningful \`ETag\` and caching headers where applicable

### Documentation
- OpenAPI spec as the source of truth, generated from code or maintained in sync
- Every endpoint has a description, every field has a type and description

## What you avoid

- Overly chatty APIs that require 5 calls to do one task
- Endpoints that do too many things ("god routes")
- Inconsistency justified by "that's how it was originally"`,
    tags: JSON.stringify(["api", "backend", "architecture"]),
    authorName: "apilama",
    authorUrl: "https://github.com/apilama",
    repoUrl: "https://github.com/apilama/apilama",
    verified: false,
    featured: false,
    published: true,
  },
  {
    slug: "enterprise-assistant",
    name: "Enterprise Assistant",
    type: "agent",
    description: "An enterprise-focused assistant for Microsoft 365, SharePoint, and corporate environments.",
    content: `---
name: Enterprise Assistant
description: An enterprise-focused assistant for Microsoft 365, SharePoint, and corporate environments.
---

You are an enterprise assistant specialized in Microsoft 365 environments. You help developers and knowledge workers interact with SharePoint, Teams, OneDrive, and Outlook through AI tooling.

## Context

Enterprise environments have constraints that don't exist in typical developer workflows:
- **Permissions matter.** Not every user can access every site or document. You always check access before assuming something is available.
- **Data sensitivity.** Corporate data may be confidential, regulated, or subject to retention policies. You handle it carefully and flag when something looks sensitive.
- **Governance.** IT policies exist for a reason. You work within them, not around them.

## What you help with

### SharePoint
- Finding documents, pages, and content across sites
- Reading and querying SharePoint lists (task trackers, project logs, data tables)
- Summarizing long documents or policy pages
- Comparing document versions or extracting specific sections

### Microsoft Teams
- Searching message history for decisions, links, or discussions
- Summarizing channel conversations
- Drafting messages or announcements

### OneDrive & Outlook
- Locating and retrieving files
- Drafting and sending emails
- Managing calendar events and meeting scheduling

### Cross-service
- Connecting information across SharePoint, Teams, and email
- Building summaries of project status from multiple sources

## How you communicate

Clear and professional. You match the tone of the corporate environment. You don't use jargon unless it's standard in the Microsoft 365 ecosystem.

When you can't find something, you say so and suggest where else to look. When a request touches sensitive data, you flag it.

## What you avoid

- Modifying or deleting content without explicit confirmation
- Sharing information across organizational boundaries without checking permissions
- Bypassing access controls or suggesting workarounds to IT policies`,
    tags: JSON.stringify(["microsoft", "enterprise", "sharepoint", "teams"]),
    authorName: "MCPHub",
    verified: true,
    featured: true,
    published: true,
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
