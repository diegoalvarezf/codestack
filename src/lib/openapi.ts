/**
 * OpenAPI 3.1 specification for the MCPHub public API.
 * Served at GET /api/openapi.json and rendered at /docs.
 */

const REGISTRY_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://mcp-registry-sigma.vercel.app";

// ─── Reusable schemas ─────────────────────────────────────────────────────────

const EnvVar = {
  type: "object",
  required: ["name", "description", "required"],
  properties: {
    name:        { type: "string", example: "GITHUB_TOKEN" },
    description: { type: "string", example: "GitHub personal access token" },
    required:    { type: "boolean" },
    example:     { type: "string", example: "ghp_abc123" },
  },
};

const Server = {
  type: "object",
  properties: {
    id:            { type: "string" },
    slug:          { type: "string", example: "github-mcp" },
    name:          { type: "string", example: "GitHub MCP" },
    description:   { type: "string" },
    longDesc:      { type: "string", nullable: true },
    repoUrl:       { type: "string", format: "uri", example: "https://github.com/modelcontextprotocol/servers" },
    npmPackage:    { type: "string", nullable: true, example: "@modelcontextprotocol/server-github" },
    authorName:    { type: "string" },
    authorUrl:     { type: "string", format: "uri", nullable: true },
    license:       { type: "string", example: "MIT" },
    version:       { type: "string", example: "0.1.0" },
    tags:          { type: "array", items: { type: "string" }, example: ["github", "git"] },
    tools:         { type: "array", items: { type: "string" }, example: ["create_issue", "list_repos"] },
    clients:       { type: "array", items: { type: "string", enum: ["claude-code", "cursor", "continue", "other"] } },
    transport:     { type: "string", enum: ["stdio", "sse", "http"] },
    installCmd:    { type: "string", nullable: true, example: "npx -y @modelcontextprotocol/server-github" },
    configJson:    { type: "string", nullable: true },
    envVars:       { type: "array", items: { "$ref": "#/components/schemas/EnvVar" }, nullable: true },
    category:      { type: "string", enum: ["official", "community", "enterprise"], nullable: true },
    stars:         { type: "integer" },
    verified:      { type: "boolean" },
    featured:      { type: "boolean" },
    downloadCount:  { type: "integer" },
    weeklyInstalls: { type: "integer" },
    dailyInstalls:  { type: "integer" },
    avgRating:     { type: "number", nullable: true, example: 4.5 },
    reviewCount:   { type: "integer" },
    riskLevel:     { type: "string", enum: ["safe", "low", "medium", "high", "unknown"] },
    repoSlug:      { type: "string", nullable: true, example: "modelcontextprotocol/servers" },
    createdAt:     { type: "string", format: "date-time" },
    updatedAt:     { type: "string", format: "date-time" },
  },
};

const Review = {
  type: "object",
  properties: {
    id:        { type: "string" },
    serverId:  { type: "string" },
    rating:    { type: "integer", minimum: 1, maximum: 5 },
    comment:   { type: "string", nullable: true },
    author:    { type: "string" },
    createdAt: { type: "string", format: "date-time" },
  },
};

const Skill = {
  type: "object",
  properties: {
    id:            { type: "string" },
    slug:          { type: "string", example: "review-pr" },
    name:          { type: "string", example: "Review PR" },
    description:   { type: "string" },
    type:          { type: "string", enum: ["prompt", "agent"] },
    content:       { type: "string", description: "Markdown prompt or system prompt content" },
    tags:          { type: "array", items: { type: "string" } },
    authorName:    { type: "string" },
    authorUrl:     { type: "string", format: "uri", nullable: true },
    repoUrl:       { type: "string", format: "uri", nullable: true },
    verified:      { type: "boolean" },
    featured:      { type: "boolean" },
    published:     { type: "boolean" },
    installCount:   { type: "integer" },
    weeklyInstalls: { type: "integer" },
    dailyInstalls:  { type: "integer" },
    createdAt:     { type: "string", format: "date-time" },
  },
};

const Stack = {
  type: "object",
  properties: {
    id:          { type: "string" },
    slug:        { type: "string" },
    name:        { type: "string" },
    description: { type: "string", nullable: true },
    icon:        { type: "string", example: "📦" },
    public:      { type: "boolean" },
    createdBy:   { type: "string", description: "GitHub login of creator" },
    createdAt:   { type: "string", format: "date-time" },
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id:       { type: "string" },
          type:     { type: "string", enum: ["server", "skill", "agent"] },
          itemSlug: { type: "string" },
          order:    { type: "integer" },
        },
      },
    },
  },
};

const Team = {
  type: "object",
  properties: {
    id:          { type: "string" },
    slug:        { type: "string" },
    name:        { type: "string" },
    description: { type: "string", nullable: true },
    inviteToken: { type: "string" },
    role:        { type: "string", enum: ["owner", "member"] },
    memberCount: { type: "integer" },
    serverCount: { type: "integer" },
    createdAt:   { type: "string", format: "date-time" },
  },
};

const ErrorResponse = {
  type: "object",
  properties: {
    error: { type: "string" },
  },
  required: ["error"],
};

const ValidationError = {
  type: "object",
  properties: {
    error:   { type: "string", example: "Validation failed" },
    details: { type: "object" },
  },
};

// ─── Shared response refs ─────────────────────────────────────────────────────

const r401 = { description: "Unauthorized — GitHub login required", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } };
const r403 = { description: "Forbidden", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } };
const r404 = { description: "Not found",   content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } };
const r409 = { description: "Conflict — slug already exists", content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } };
const r422 = { description: "Validation error", content: { "application/json": { schema: { "$ref": "#/components/schemas/ValidationError" } } } };
const r429 = { description: "Rate limit exceeded", headers: { "Retry-After": { schema: { type: "integer" }, description: "Seconds until the rate limit resets" } }, content: { "application/json": { schema: { "$ref": "#/components/schemas/ErrorResponse" } } } };

// ─── Spec ─────────────────────────────────────────────────────────────────────

export function buildOpenApiSpec() {
  return {
    openapi: "3.1.0",
    info: {
      title: "MCPHub API",
      version: "1.0.0",
      description: `
The MCPHub public API lets you discover, search, and manage MCP servers, skills, and stacks.

## Authentication

Endpoints marked 🔒 require a valid GitHub OAuth session (cookie-based when used from the web UI).
For programmatic access, authenticate via the \`/auth/signin\` flow.

## Rate limits

Write endpoints are rate-limited per IP:
- **POST /api/servers** — 5 requests / hour
- **POST /api/skills** — 10 requests / hour
- **POST /api/servers/{slug}/reviews** — 10 requests / hour

Rate-limited responses return HTTP **429** with a \`Retry-After\` header.
      `.trim(),
      contact: {
        name: "MCPHub",
        url: REGISTRY_URL,
      },
      license: { name: "MIT" },
    },
    servers: [{ url: REGISTRY_URL, description: "Production" }],
    tags: [
      { name: "Servers",  description: "MCP server registry — discover and publish MCP servers" },
      { name: "Reviews",  description: "Community reviews and ratings for servers" },
      { name: "Skills",   description: "Reusable prompts and agents" },
      { name: "Stacks",   description: "Curated collections of servers and skills" },
      { name: "Teams",    description: "Team workspaces with shared server/skill lists" },
    ],
    components: {
      schemas: { EnvVar, Server, Review, Skill, Stack, Team, ErrorResponse, ValidationError },
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "next-auth.session-token",
          description: "GitHub OAuth session cookie (set automatically after signing in at /auth/signin)",
        },
      },
    },
    paths: {

      // ── Servers ──────────────────────────────────────────────────────────────

      "/api/servers": {
        get: {
          tags: ["Servers"],
          summary: "List servers",
          description: "Returns a list of MCP servers with optional filtering and full-text search.",
          operationId: "listServers",
          parameters: [
            { name: "q",      in: "query", description: "Full-text search query (supports quoted phrases and `-term` exclusions)", schema: { type: "string" } },
            { name: "tag",    in: "query", description: "Filter by tag", schema: { type: "string" } },
            { name: "client", in: "query", description: "Filter by supported client", schema: { type: "string", enum: ["claude-code", "cursor", "continue", "other"] } },
            { name: "limit",  in: "query", description: "Maximum number of results (default 50, max 100)", schema: { type: "integer", default: 50, maximum: 100 } },
          ],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      servers: { type: "array", items: { "$ref": "#/components/schemas/Server" } },
                      total:   { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Servers"],
          summary: "Submit a server 🔒",
          description: "Submits a new MCP server to the registry. Requires GitHub authentication. Rate-limited to 5 per hour per IP.",
          operationId: "createServer",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "description", "repoUrl", "authorName", "tags", "tools", "clients"],
                  properties: {
                    name:        { type: "string", minLength: 2, maxLength: 60, example: "My MCP Server" },
                    description: { type: "string", minLength: 20, maxLength: 280, example: "A useful MCP server for doing things with AI tools" },
                    longDesc:    { type: "string", maxLength: 2000 },
                    repoUrl:     { type: "string", format: "uri", example: "https://github.com/example/my-mcp" },
                    npmPackage:  { type: "string", example: "@example/my-mcp" },
                    authorName:  { type: "string", maxLength: 80 },
                    authorUrl:   { type: "string", format: "uri" },
                    license:     { type: "string", default: "MIT" },
                    version:     { type: "string", default: "0.1.0" },
                    tags:        { type: "array", items: { type: "string" }, minItems: 1, maxItems: 8 },
                    tools:       { type: "array", items: { type: "string" }, minItems: 1, maxItems: 20 },
                    clients:     { type: "array", items: { type: "string", enum: ["claude-code", "cursor", "continue", "other"] }, minItems: 1 },
                    transport:   { type: "string", enum: ["stdio", "sse", "http"], default: "stdio" },
                    installCmd:  { type: "string", maxLength: 300 },
                    configJson:  { type: "string", maxLength: 2000 },
                    envVars:     { type: "array", items: { "$ref": "#/components/schemas/EnvVar" }, maxItems: 20 },
                    category:    { type: "string", enum: ["official", "community", "enterprise"] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { type: "object", properties: { server: { "$ref": "#/components/schemas/Server" } } } } } },
            401: r401, 409: r409, 422: r422, 429: r429,
          },
        },
      },

      "/api/servers/{slug}": {
        get: {
          tags: ["Servers"],
          summary: "Get server",
          description: "Returns a single MCP server by its slug.",
          operationId: "getServer",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" }, example: "github-mcp" }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { server: { "$ref": "#/components/schemas/Server" } } } } } },
            404: r404,
          },
        },
      },

      "/api/servers/{slug}/install": {
        post: {
          tags: ["Servers"],
          summary: "Track install",
          description: "Increments download and install counters. Called automatically by the CLI on successful install.",
          operationId: "trackInstall",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
          },
        },
      },

      // ── Reviews ──────────────────────────────────────────────────────────────

      "/api/servers/{slug}/reviews": {
        get: {
          tags: ["Reviews"],
          summary: "List reviews",
          description: "Returns all reviews for a server, ordered newest first.",
          operationId: "listReviews",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { reviews: { type: "array", items: { "$ref": "#/components/schemas/Review" } } } } } } },
            404: r404,
          },
        },
        post: {
          tags: ["Reviews"],
          summary: "Submit review",
          description: "Submits a review for a server. Rate-limited to 10 per hour per IP. Updates the server's cached `avgRating` and `reviewCount`.",
          operationId: "createReview",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rating", "author"],
                  properties: {
                    rating:  { type: "integer", minimum: 1, maximum: 5 },
                    comment: { type: "string", maxLength: 1000 },
                    author:  { type: "string", minLength: 1, maxLength: 80 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { type: "object", properties: { review: { "$ref": "#/components/schemas/Review" } } } } } },
            404: r404, 422: r422, 429: r429,
          },
        },
      },

      // ── Skills ───────────────────────────────────────────────────────────────

      "/api/skills": {
        get: {
          tags: ["Skills"],
          summary: "List skills",
          description: "Returns paginated published skills (prompts and agents), 24 per page.",
          operationId: "listSkills",
          parameters: [
            { name: "q",    in: "query", description: "Search query", schema: { type: "string" } },
            { name: "type", in: "query", description: "Filter by skill type", schema: { type: "string", enum: ["prompt", "agent"] } },
            { name: "tag",  in: "query", description: "Filter by tag", schema: { type: "string" } },
            { name: "page", in: "query", description: "Page number (1-based)", schema: { type: "integer", default: 1 } },
          ],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      skills: { type: "array", items: { "$ref": "#/components/schemas/Skill" } },
                      total:  { type: "integer" },
                      pages:  { type: "integer" },
                    },
                  },
                },
              },
            },
          },
        },
        post: {
          tags: ["Skills"],
          summary: "Create skill 🔒",
          description: "Creates a new skill (prompt or agent). Requires GitHub authentication. Rate-limited to 10 per hour per IP.",
          operationId: "createSkill",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["slug", "name", "description", "content"],
                  properties: {
                    slug:        { type: "string", example: "review-pr" },
                    name:        { type: "string", example: "Review PR" },
                    description: { type: "string" },
                    type:        { type: "string", enum: ["prompt", "agent"], default: "prompt" },
                    content:     { type: "string", description: "Markdown prompt or system prompt content" },
                    tags:        { type: "array", items: { type: "string" } },
                    repoUrl:     { type: "string", format: "uri" },
                    published:   { type: "boolean", default: false },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { "$ref": "#/components/schemas/Skill" } } } },
            401: r401, 409: r409, 429: r429,
          },
        },
      },

      "/api/skills/{slug}": {
        get: {
          tags: ["Skills"],
          summary: "Get skill",
          description: "Returns a single skill by slug. Increments install counters.",
          operationId: "getSkill",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { "$ref": "#/components/schemas/Skill" } } } },
            404: r404,
          },
        },
        patch: {
          tags: ["Skills"],
          summary: "Update skill 🔒",
          description: "Updates a skill. Owners can toggle `published`. Admins can update any field.",
          operationId: "updateSkill",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    published: { type: "boolean" },
                    name:        { type: "string" },
                    description: { type: "string" },
                    content:     { type: "string" },
                    tags:        { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { "$ref": "#/components/schemas/Skill" } } } },
            401: r401, 403: r403, 404: r404,
          },
        },
        delete: {
          tags: ["Skills"],
          summary: "Delete skill 🔒",
          description: "Deletes a skill. Owner or admin only.",
          operationId: "deleteSkill",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
            401: r401, 403: r403, 404: r404,
          },
        },
      },

      // ── Stacks ───────────────────────────────────────────────────────────────

      "/api/stacks": {
        get: {
          tags: ["Stacks"],
          summary: "List stacks",
          description: "Returns all public user stacks with their items.",
          operationId: "listStacks",
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Stack" } } } } },
          },
        },
        post: {
          tags: ["Stacks"],
          summary: "Create stack 🔒",
          description: "Creates a new curated stack of servers and skills.",
          operationId: "createStack",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name:        { type: "string" },
                    description: { type: "string" },
                    icon:        { type: "string", default: "📦" },
                    public:      { type: "boolean", default: false },
                    items: {
                      type: "array",
                      items: {
                        type: "object",
                        required: ["type", "itemSlug"],
                        properties: {
                          type:     { type: "string", enum: ["server", "skill", "agent"] },
                          itemSlug: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { "$ref": "#/components/schemas/Stack" } } } },
            401: r401, 409: r409,
          },
        },
      },

      "/api/stacks/{slug}": {
        get: {
          tags: ["Stacks"],
          summary: "Get stack",
          description: "Returns a stack with resolved server, skill, and agent slugs. Works for both curated and user stacks.",
          operationId: "getStack",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      slug:      { type: "string" },
                      name:      { type: "string" },
                      servers:   { type: "array", items: { type: "string" } },
                      skills:    { type: "array", items: { type: "string" } },
                      agents:    { type: "array", items: { type: "string" } },
                      curated:   { type: "boolean" },
                      createdBy: { type: "string" },
                    },
                  },
                },
              },
            },
            404: r404,
          },
        },
        patch: {
          tags: ["Stacks"],
          summary: "Update stack 🔒",
          description: "Updates stack metadata. Owner or admin only.",
          operationId: "updateStack",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name:        { type: "string" },
                    description: { type: "string" },
                    icon:        { type: "string" },
                    public:      { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { "$ref": "#/components/schemas/Stack" } } } },
            401: r401, 403: r403, 404: r404,
          },
        },
        delete: {
          tags: ["Stacks"],
          summary: "Delete stack 🔒",
          operationId: "deleteStack",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
            401: r401, 403: r403, 404: r404,
          },
        },
      },

      "/api/stacks/{slug}/items": {
        post: {
          tags: ["Stacks"],
          summary: "Add item to stack 🔒",
          operationId: "addStackItem",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["type", "itemSlug"],
                  properties: {
                    type:     { type: "string", enum: ["server", "skill", "agent"] },
                    itemSlug: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            401: r401, 403: r403, 404: r404, 409: r409,
          },
        },
        delete: {
          tags: ["Stacks"],
          summary: "Remove item from stack 🔒",
          operationId: "removeStackItem",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["itemSlug"],
                  properties: { itemSlug: { type: "string" } },
                },
              },
            },
          },
          responses: {
            200: { description: "OK" },
            401: r401, 403: r403, 404: r404,
          },
        },
      },

      // ── Teams ────────────────────────────────────────────────────────────────

      "/api/teams": {
        get: {
          tags: ["Teams"],
          summary: "List my teams 🔒",
          description: "Returns all teams the authenticated user belongs to.",
          operationId: "listTeams",
          security: [{ cookieAuth: [] }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { teams: { type: "array", items: { "$ref": "#/components/schemas/Team" } } } } } } },
            401: r401,
          },
        },
        post: {
          tags: ["Teams"],
          summary: "Create team 🔒",
          operationId: "createTeam",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name:        { type: "string", minLength: 2, maxLength: 50 },
                    description: { type: "string", maxLength: 200 },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { type: "object", properties: { team: { "$ref": "#/components/schemas/Team" } } } } } },
            401: r401, 422: r422,
          },
        },
      },

      "/api/teams/{slug}": {
        get: {
          tags: ["Teams"],
          summary: "Get team 🔒",
          description: "Returns full team details including members and servers. Must be a team member.",
          operationId: "getTeam",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      team: { "$ref": "#/components/schemas/Team" },
                      role: { type: "string", enum: ["owner", "member"] },
                    },
                  },
                },
              },
            },
            401: r401, 404: r404,
          },
        },
        delete: {
          tags: ["Teams"],
          summary: "Delete team 🔒",
          description: "Deletes a team and all its memberships. Owner only.",
          operationId: "deleteTeam",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { ok: { type: "boolean" } } } } } },
            401: r401, 403: r403, 404: r404,
          },
        },
      },

      "/api/teams/{slug}/servers": {
        post: {
          tags: ["Teams"],
          summary: "Add server to team 🔒",
          operationId: "addTeamServer",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["serverSlug"],
                  properties: {
                    serverSlug: { type: "string" },
                    notes:      { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "OK (upserted)" },
            401: r401, 404: r404, 422: r422,
          },
        },
        delete: {
          tags: ["Teams"],
          summary: "Remove server from team 🔒",
          operationId: "removeTeamServer",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "slug",   in: "path",  required: true, schema: { type: "string" } },
            { name: "server", in: "query", required: true, schema: { type: "string" }, description: "Server slug to remove" },
          ],
          responses: {
            200: { description: "OK" },
            401: r401, 404: r404,
          },
        },
      },

      "/api/teams/{slug}/skills": {
        get: {
          tags: ["Teams"],
          summary: "List team skills 🔒",
          operationId: "listTeamSkills",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: { description: "OK", content: { "application/json": { schema: { type: "array", items: { "$ref": "#/components/schemas/Skill" } } } } },
            401: r401, 403: r403, 404: r404,
          },
        },
        post: {
          tags: ["Teams"],
          summary: "Create team skill 🔒",
          description: "Creates a custom skill (slash command) for the team. Owner only.",
          operationId: "createTeamSkill",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "slug", "content"],
                  properties: {
                    name:        { type: "string" },
                    slug:        { type: "string", description: "Used as the slash command name, e.g. 'review-pr'" },
                    type:        { type: "string", enum: ["prompt", "agent"], default: "prompt" },
                    description: { type: "string" },
                    content:     { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            401: r401, 403: r403, 404: r404, 409: r409,
          },
        },
      },

      "/api/teams/{slug}/skills/{skillSlug}": {
        delete: {
          tags: ["Teams"],
          summary: "Remove team skill 🔒",
          description: "Removes a custom skill from a team. Owner only.",
          operationId: "deleteTeamSkill",
          security: [{ cookieAuth: [] }],
          parameters: [
            { name: "slug",      in: "path", required: true, schema: { type: "string" } },
            { name: "skillSlug", in: "path", required: true, schema: { type: "string" } },
          ],
          responses: {
            200: { description: "OK" },
            401: r401, 403: r403, 404: r404,
          },
        },
      },

      "/api/teams/{slug}/sync": {
        get: {
          tags: ["Teams"],
          summary: "Sync team config",
          description: "Returns the full team configuration (servers + skills) for CLI sync. Authenticated via invite token instead of session.",
          operationId: "syncTeam",
          parameters: [
            { name: "slug",  in: "path",  required: true, schema: { type: "string" } },
            { name: "token", in: "query", required: true, schema: { type: "string" }, description: "Team invite token" },
          ],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      team:    { type: "object", properties: { slug: { type: "string" }, name: { type: "string" } } },
                      servers: { type: "array", items: { "$ref": "#/components/schemas/Server" } },
                      skills:  { type: "array", items: { "$ref": "#/components/schemas/Skill" } },
                    },
                  },
                },
              },
            },
            403: r403, 404: r404,
          },
        },
      },

      "/api/join/{token}": {
        post: {
          tags: ["Teams"],
          summary: "Join team via invite link 🔒",
          description: "Adds the authenticated user to a team using an invite token.",
          operationId: "joinTeam",
          security: [{ cookieAuth: [] }],
          parameters: [{ name: "token", in: "path", required: true, schema: { type: "string" }, description: "Team invite token" }],
          responses: {
            302: { description: "Redirect to /teams/{slug} on success" },
            401: r401, 404: r404,
          },
        },
      },
    },
  };
}
