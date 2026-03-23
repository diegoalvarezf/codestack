import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/servers/route";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeServer(overrides = {}) {
  return {
    id: "cltest123",
    slug: "test-server",
    name: "Test Server",
    description: "A test MCP server",
    longDesc: null,
    repoUrl: "https://github.com/example/test",
    npmPackage: null,
    authorName: "Alice",
    authorUrl: null,
    license: "MIT",
    version: "0.1.0",
    tags: JSON.stringify(["test"]),
    tools: JSON.stringify(["read_file"]),
    clients: JSON.stringify(["claude-code"]),
    transport: "stdio",
    stars: 0,
    verified: false,
    featured: false,
    installCmd: null,
    configJson: null,
    envVars: null,
    category: null,
    downloadCount: 0,
    weeklyInstalls: 0,
    dailyInstalls: 0,
    avgRating: null,
    reviewCount: 0,
    riskLevel: "unknown",
    auditNotes: null,
    auditedAt: null,
    repoSlug: null,
    createdBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new Request(`http://localhost${url}`, options));
}

// ── GET /api/servers ──────────────────────────────────────────────────────────

describe("GET /api/servers", () => {
  beforeEach(() => {
    vi.mocked(prisma.server.findMany).mockResolvedValue([makeServer()] as any);
    vi.mocked(prisma.server.count).mockResolvedValue(1);
  });

  it("returns 200 with servers array", async () => {
    const res = await GET(makeRequest("/api/servers"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveProperty("servers");
    expect(body).toHaveProperty("total");
    expect(Array.isArray(body.servers)).toBe(true);
  });

  it("parses JSON string fields into arrays", async () => {
    const res = await GET(makeRequest("/api/servers"));
    const body = await res.json();

    expect(Array.isArray(body.servers[0].tags)).toBe(true);
    expect(Array.isArray(body.servers[0].tools)).toBe(true);
    expect(Array.isArray(body.servers[0].clients)).toBe(true);
  });

  it("respects limit param (max 100)", async () => {
    await GET(makeRequest("/api/servers?limit=200"));
    expect(vi.mocked(prisma.server.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 })
    );
  });

  it("filters by tag", async () => {
    await GET(makeRequest("/api/servers?tag=github"));
    expect(vi.mocked(prisma.server.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tags: { contains: "github" } }) })
    );
  });

  it("filters by client", async () => {
    await GET(makeRequest("/api/servers?client=cursor"));
    expect(vi.mocked(prisma.server.findMany)).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ clients: { contains: "cursor" } }) })
    );
  });

  it("returns empty list when no servers exist", async () => {
    vi.mocked(prisma.server.findMany).mockResolvedValue([]);
    const res = await GET(makeRequest("/api/servers"));
    const body = await res.json();
    expect(body.servers).toHaveLength(0);
    expect(body.total).toBe(0);
  });
});

// ── POST /api/servers ─────────────────────────────────────────────────────────

const validPayload = {
  name: "My MCP Server",
  description: "A useful MCP server for doing things with AI tools",
  repoUrl: "https://github.com/example/my-mcp",
  authorName: "Alice",
  tags: ["ai", "tools"],
  tools: ["read_file", "write_file"],
  clients: ["claude-code"],
  transport: "stdio",
};

describe("POST /api/servers", () => {
  beforeEach(() => {
    vi.mocked(prisma.server.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.server.create).mockResolvedValue(makeServer() as any);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const req = makeRequest("/api/servers", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 201 and creates server when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    const req = makeRequest("/api/servers", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("server");
  });

  it("returns 422 for invalid payload", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    const req = makeRequest("/api/servers", {
      method: "POST",
      body: JSON.stringify({ name: "X" }), // too short, missing required fields
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("returns 400 for invalid JSON body", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    const req = makeRequest("/api/servers", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when slug already exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    vi.mocked(prisma.server.findUnique).mockResolvedValue(makeServer() as any);
    const req = makeRequest("/api/servers", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("strips HTML from submitted fields", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    const req = makeRequest("/api/servers", {
      method: "POST",
      body: JSON.stringify({ ...validPayload, name: "<b>My Server</b>", authorName: "<script>evil</script>Alice" }),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);
    const createCall = vi.mocked(prisma.server.create).mock.calls[0][0];
    expect(createCall.data.name).toBe("My Server");
    expect(createCall.data.authorName).toBe("Alice");
  });
});
