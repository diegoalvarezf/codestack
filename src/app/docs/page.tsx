import type { Metadata } from "next";
import { CopyButton } from "./CopyButton";

export const metadata: Metadata = {
  title: "API Reference — Codestack",
  description: "REST API to discover, search, and integrate MCP servers, skills, and stacks.",
};

const BASE = "https://codestack.dev";

const METHOD_COLOR: Record<string, string> = {
  GET:    "bg-blue-500/15 text-blue-400 border-blue-500/30",
  POST:   "bg-green-500/15 text-green-400 border-green-500/30",
  PATCH:  "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  DELETE: "bg-red-500/15 text-red-400 border-red-500/30",
};

function Method({ m }: { m: string }) {
  return (
    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border font-mono ${METHOD_COLOR[m]}`}>
      {m}
    </span>
  );
}

function Code({ children }: { children: string }) {
  return (
    <div className="relative group mt-2">
      <pre className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-xs text-gray-300 font-mono overflow-x-auto leading-relaxed">
        {children}
      </pre>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <CopyButton text={children} />
      </div>
    </div>
  );
}

function Param({ name, type, required, desc }: { name: string; type: string; required?: boolean; desc: string }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-800/60 last:border-0">
      <div className="shrink-0 w-40">
        <code className="text-xs text-gray-200 font-mono">{name}</code>
        {required && <span className="ml-1.5 text-[10px] text-red-400">required</span>}
      </div>
      <code className="shrink-0 text-[11px] text-purple-400 font-mono w-16">{type}</code>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-5 bg-blue-500 rounded-full" />
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Endpoint({
  method, path, summary, description, params, body, response,
}: {
  method: string;
  path: string;
  summary: string;
  description?: string;
  params?: React.ReactNode;
  body?: React.ReactNode;
  response: string;
}) {
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 bg-gray-900 border-b border-gray-800">
        <Method m={method} />
        <code className="text-sm text-gray-200 font-mono flex-1">{path}</code>
        <span className="text-xs text-gray-500 hidden sm:block">{summary}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
        {/* Left: docs */}
        <div className="px-5 py-4 space-y-4">
          {description && <p className="text-sm text-gray-400 leading-relaxed">{description}</p>}
          {params && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">Parameters</p>
              <div className="bg-gray-900/50 rounded-lg px-3 py-1">{params}</div>
            </div>
          )}
          {body && (
            <div>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">Request body</p>
              <div className="bg-gray-900/50 rounded-lg px-3 py-1">{body}</div>
            </div>
          )}
        </div>

        {/* Right: response example */}
        <div className="px-5 py-4 bg-gray-950/40">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-2">Response</p>
          <Code>{response}</Code>
        </div>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const nav = [
    { id: "overview",       label: "Overview" },
    { id: "authentication", label: "Authentication" },
    { id: "servers",        label: "Servers" },
    { id: "reviews",        label: "Reviews" },
    { id: "skills",         label: "Skills" },
    { id: "stacks",         label: "Stacks" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">

      {/* Hero */}
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-sm px-3 py-1 rounded-full mb-5 border border-blue-500/20">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
          REST API · v1
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Codestack API</h1>
        <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
          Discover, search, and integrate MCP servers, skills, and stacks into your own tooling, CLIs, and AI workflows.
        </p>
        <div className="flex items-center gap-2 mt-5">
          <code className="text-sm text-gray-300 font-mono bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">{BASE}</code>
          <CopyButton text={BASE} />
        </div>
      </div>

      <div className="flex gap-10 items-start">
        {/* Sticky sidebar nav */}
        <aside className="hidden lg:block w-44 shrink-0 sticky top-6 space-y-1">
          {nav.map(n => (
            <a key={n.id} href={`#${n.id}`}
              className="block text-sm text-gray-500 hover:text-gray-200 py-1 transition-colors">
              {n.label}
            </a>
          ))}
          <div className="pt-4 mt-4 border-t border-gray-800">
            <a href="/api/openapi.json" target="_blank"
              className="block text-xs text-gray-600 hover:text-gray-400 transition-colors">
              OpenAPI JSON ↗
            </a>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-16">

          {/* Overview */}
          <section id="overview" className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <h2 className="text-lg font-semibold text-white">Overview</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Format", value: "JSON (application/json)" },
                { label: "Version", value: "1.0.0" },
                { label: "OpenAPI", value: "3.1.0" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">{label}</p>
                  <p className="text-sm text-gray-200 font-mono">{value}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-widest mb-4">Rate limits</p>
              <div className="space-y-2">
                {[
                  { endpoint: "POST /api/servers", limit: "5 req / hour" },
                  { endpoint: "POST /api/skills", limit: "10 req / hour" },
                  { endpoint: "POST /api/servers/{slug}/reviews", limit: "10 req / hour" },
                ].map(({ endpoint, limit }) => (
                  <div key={endpoint} className="flex items-center justify-between text-sm">
                    <code className="text-gray-400 font-mono text-xs">{endpoint}</code>
                    <span className="text-orange-400 text-xs font-medium">{limit}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4">Rate-limited responses return HTTP <code className="text-gray-400">429</code> with a <code className="text-gray-400">Retry-After</code> header.</p>
            </div>
          </section>

          {/* Authentication */}
          <section id="authentication" className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 bg-blue-500 rounded-full" />
              <h2 className="text-lg font-semibold text-white">Authentication</h2>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
              <p className="text-sm text-gray-400 leading-relaxed">
                Most read endpoints are <span className="text-green-400">public</span>. Endpoints marked <span className="text-yellow-400 font-medium">🔒</span> require a GitHub OAuth session — sign in at{" "}
                <a href="/auth/signin" className="text-blue-400 hover:underline">/auth/signin</a> and the session cookie is set automatically.
              </p>
              <div className="border-t border-gray-800 pt-3">
                <p className="text-xs text-gray-600 mb-2">Session cookie name</p>
                <code className="text-sm text-gray-300 font-mono">next-auth.session-token</code>
              </div>
            </div>
          </section>

          {/* Servers */}
          <Section id="servers" title="Servers">
            <Endpoint
              method="GET" path="/api/servers" summary="List servers"
              description="Returns MCP servers with optional filtering and full-text search."
              params={<>
                <Param name="q" type="string" desc="Full-text search (supports quoted phrases and -term exclusions)" />
                <Param name="tag" type="string" desc="Filter by tag" />
                <Param name="client" type="enum" desc="claude-code · cursor · continue · other" />
                <Param name="limit" type="integer" desc="Max results. Default 50, max 100." />
              </>}
              response={`{
  "servers": [
    {
      "id": "clx...",
      "slug": "github-mcp",
      "name": "GitHub MCP",
      "description": "Interact with GitHub via MCP",
      "stars": 1420,
      "downloadCount": 3800,
      "avgRating": 4.7,
      "verified": true,
      "tags": ["github", "git"]
    }
  ],
  "total": 42
}`}
            />
            <Endpoint
              method="GET" path="/api/servers/{slug}" summary="Get server"
              description="Returns a single MCP server by its slug."
              params={<Param name="slug" type="string" required desc="Server slug, e.g. github-mcp" />}
              response={`{
  "server": {
    "slug": "github-mcp",
    "name": "GitHub MCP",
    "installCmd": "npx -y @modelcontextprotocol/server-github",
    "transport": "stdio",
    "license": "MIT",
    "envVars": [
      { "name": "GITHUB_TOKEN", "required": true }
    ]
  }
}`}
            />
            <Endpoint
              method="POST" path="/api/servers" summary="Submit server 🔒"
              description="Submits a new MCP server to the registry. Requires GitHub authentication. Rate-limited to 5 per hour."
              body={<>
                <Param name="name" type="string" required desc="2–60 characters" />
                <Param name="description" type="string" required desc="20–280 characters" />
                <Param name="repoUrl" type="uri" required desc="GitHub repository URL" />
                <Param name="tags" type="string[]" required desc="1–8 tags" />
                <Param name="tools" type="string[]" required desc="MCP tools exposed by this server" />
                <Param name="clients" type="string[]" required desc="claude-code · cursor · continue" />
                <Param name="npmPackage" type="string" desc="npm package name" />
                <Param name="installCmd" type="string" desc="Install command, e.g. npx -y pkg" />
                <Param name="transport" type="enum" desc="stdio (default) · sse · http" />
                <Param name="license" type="string" desc="SPDX identifier, default MIT" />
              </>}
              response={`{
  "server": {
    "slug": "my-mcp-server",
    "name": "My MCP Server",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}`}
            />
            <Endpoint
              method="POST" path="/api/servers/{slug}/install" summary="Track install"
              description="Increments download and install counters. Called automatically by the CLI on successful install."
              params={<Param name="slug" type="string" required desc="Server slug" />}
              response={`{ "ok": true }`}
            />
          </Section>

          {/* Reviews */}
          <Section id="reviews" title="Reviews">
            <Endpoint
              method="GET" path="/api/servers/{slug}/reviews" summary="List reviews"
              description="Returns all reviews for a server, ordered newest first."
              params={<Param name="slug" type="string" required desc="Server slug" />}
              response={`{
  "reviews": [
    {
      "id": "clx...",
      "rating": 5,
      "comment": "Works great with Claude Code",
      "author": "diegoalvarezf",
      "createdAt": "2025-01-10T08:00:00Z"
    }
  ]
}`}
            />
            <Endpoint
              method="POST" path="/api/servers/{slug}/reviews" summary="Submit review"
              description="Submits a review. Rate-limited to 10 per hour. Updates the server's cached avgRating and reviewCount."
              params={<Param name="slug" type="string" required desc="Server slug" />}
              body={<>
                <Param name="rating" type="integer" required desc="1–5" />
                <Param name="author" type="string" required desc="Max 80 characters" />
                <Param name="comment" type="string" desc="Optional. Max 1000 characters." />
              </>}
              response={`{
  "review": {
    "id": "clx...",
    "rating": 5,
    "author": "diegoalvarezf",
    "createdAt": "2025-01-15T10:00:00Z"
  }
}`}
            />
          </Section>

          {/* Skills */}
          <Section id="skills" title="Skills &amp; Agents">
            <Endpoint
              method="GET" path="/api/skills" summary="List skills"
              description="Returns paginated published skills (prompts and agents), 24 per page."
              params={<>
                <Param name="q" type="string" desc="Search query" />
                <Param name="type" type="enum" desc="prompt · agent" />
                <Param name="tag" type="string" desc="Filter by tag" />
                <Param name="page" type="integer" desc="Page number, 1-based. Default 1." />
              </>}
              response={`{
  "skills": [
    {
      "slug": "review-pr",
      "name": "Review PR",
      "type": "prompt",
      "installCount": 840,
      "stars": 120
    }
  ],
  "total": 38,
  "pages": 2
}`}
            />
            <Endpoint
              method="GET" path="/api/skills/{slug}" summary="Get skill"
              description="Returns a single skill by slug, including the full Markdown content. Increments install counters."
              params={<Param name="slug" type="string" required desc="Skill slug, e.g. review-pr" />}
              response={`{
  "slug": "review-pr",
  "name": "Review PR",
  "type": "prompt",
  "content": "Review the current changes...",
  "tags": ["code-review", "git"]
}`}
            />
            <Endpoint
              method="POST" path="/api/skills" summary="Create skill 🔒"
              description="Creates a new skill or agent. Requires GitHub auth. Rate-limited to 10 per hour."
              body={<>
                <Param name="slug" type="string" required desc="URL-safe identifier, used as slash command" />
                <Param name="name" type="string" required desc="Display name" />
                <Param name="description" type="string" required desc="Short description" />
                <Param name="content" type="string" required desc="Markdown prompt or system prompt" />
                <Param name="type" type="enum" desc="prompt (default) · agent" />
                <Param name="tags" type="string[]" desc="Up to 8 tags" />
                <Param name="repoUrl" type="uri" desc="Source repository" />
                <Param name="published" type="boolean" desc="Visible in registry. Default false." />
              </>}
              response={`{
  "slug": "review-pr",
  "name": "Review PR",
  "published": true
}`}
            />
          </Section>

          {/* Stacks */}
          <Section id="stacks" title="Stacks">
            <Endpoint
              method="GET" path="/api/stacks" summary="List stacks"
              description="Returns all public community stacks with their items."
              response={`[
  {
    "slug": "fullstack-dev",
    "name": "Full-stack Dev",
    "icon": "⚡",
    "public": true,
    "createdBy": "diegoalvarezf",
    "items": [
      { "type": "server", "itemSlug": "github-mcp", "order": 0 }
    ]
  }
]`}
            />
            <Endpoint
              method="POST" path="/api/stacks" summary="Create stack 🔒"
              description="Creates a new stack. Requires GitHub auth."
              body={<>
                <Param name="name" type="string" required desc="Stack name" />
                <Param name="description" type="string" desc="Optional description" />
                <Param name="icon" type="string" desc="Emoji icon. Default 📦" />
                <Param name="public" type="boolean" desc="Visible to everyone. Default false." />
              </>}
              response={`{
  "slug": "my-stack",
  "name": "My Stack",
  "createdAt": "2025-01-15T10:00:00Z"
}`}
            />
            <Endpoint
              method="POST" path="/api/stacks/{slug}/items" summary="Add item to stack 🔒"
              description="Adds a server, skill, or agent to a stack. Owner only."
              params={<Param name="slug" type="string" required desc="Stack slug" />}
              body={<>
                <Param name="type" type="enum" required desc="server · skill · agent" />
                <Param name="itemSlug" type="string" required desc="Slug of the item to add" />
              </>}
              response={`{ "ok": true }`}
            />
            <Endpoint
              method="DELETE" path="/api/stacks/{slug}/items" summary="Remove item from stack 🔒"
              description="Removes an item from a stack. Owner only."
              params={<Param name="slug" type="string" required desc="Stack slug" />}
              body={<Param name="itemSlug" type="string" required desc="Slug of the item to remove" />}
              response={`{ "ok": true }`}
            />
          </Section>

        </div>
      </div>
    </div>
  );
}
