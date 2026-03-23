import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/skills/route";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

// Mock getSkills used by GET
vi.mock("@/lib/skills-db", () => ({
  getSkills: vi.fn().mockResolvedValue({ skills: [], total: 0, pages: 1 }),
}));

import { getSkills } from "@/lib/skills-db";

function makeRequest(url: string, options?: RequestInit) {
  return new NextRequest(new Request(`http://localhost${url}`, options));
}

const fakeSkill = {
  id: "skill-1",
  slug: "review-pr",
  name: "Review PR",
  description: "Reviews a pull request",
  type: "prompt",
  content: "Please review this PR...",
  tags: JSON.stringify(["git", "review"]),
  authorName: "alice",
  authorUrl: "https://github.com/alice",
  repoUrl: null,
  verified: false,
  featured: false,
  published: true,
  installCount: 0,
  weeklyInstalls: 0,
  dailyInstalls: 0,
  ownerId: "user-1",
  createdBy: "alice",
  createdAt: new Date(),
};

// ── GET /api/skills ───────────────────────────────────────────────────────────

describe("GET /api/skills", () => {
  it("returns 200 with skills result", async () => {
    vi.mocked(getSkills).mockResolvedValue({ skills: [fakeSkill] as any, total: 1, pages: 1 });
    const res = await GET(makeRequest("/api/skills"));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body).toHaveProperty("skills");
    expect(body.total).toBe(1);
  });

  it("passes query params to getSkills", async () => {
    await GET(makeRequest("/api/skills?q=review&type=prompt&tag=git&page=2"));
    expect(vi.mocked(getSkills)).toHaveBeenCalledWith(
      expect.objectContaining({ query: "review", type: "prompt", tag: "git", page: 2 })
    );
  });

  it("defaults page to 1", async () => {
    await GET(makeRequest("/api/skills"));
    expect(vi.mocked(getSkills)).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1 })
    );
  });
});

// ── POST /api/skills ──────────────────────────────────────────────────────────

const validSkillPayload = {
  slug: "review-pr",
  name: "Review PR",
  description: "Reviews a PR thoroughly",
  content: "Please review the following pull request...",
  type: "prompt",
  tags: ["git"],
  published: true,
};

describe("POST /api/skills", () => {
  beforeEach(() => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: "user-1" } as any);
    vi.mocked(prisma.skill.create).mockResolvedValue(fakeSkill as any);
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);
    const req = makeRequest("/api/skills", {
      method: "POST",
      body: JSON.stringify(validSkillPayload),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 201 when authenticated and payload is valid", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice", name: "Alice" } } as any);
    const req = makeRequest("/api/skills", {
      method: "POST",
      body: JSON.stringify(validSkillPayload),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("returns 400 when required fields are missing", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    const req = makeRequest("/api/skills", {
      method: "POST",
      body: JSON.stringify({ name: "No content here" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for invalid JSON", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    const req = makeRequest("/api/skills", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 409 when slug already exists", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    vi.mocked(prisma.skill.create).mockRejectedValue(new Error("Unique constraint"));
    const req = makeRequest("/api/skills", {
      method: "POST",
      body: JSON.stringify(validSkillPayload),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(409);
  });

  it("returns 429 when rate limit exceeded", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    vi.mocked(rateLimit).mockReturnValueOnce({ allowed: false, remaining: 0, resetAt: Date.now() + 3600_000 });
    const req = makeRequest("/api/skills", {
      method: "POST",
      body: JSON.stringify(validSkillPayload),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(429);
  });

  it("normalizes slug to lowercase alphanumeric", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    const req = makeRequest("/api/skills", {
      method: "POST",
      body: JSON.stringify({ ...validSkillPayload, slug: "My Cool Skill!" }),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);
    const createCall = vi.mocked(prisma.skill.create).mock.calls[0][0];
    expect(createCall.data.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("sanitizes name and description", async () => {
    vi.mocked(auth).mockResolvedValue({ user: { githubLogin: "alice" } } as any);
    const req = makeRequest("/api/skills", {
      method: "POST",
      body: JSON.stringify({ ...validSkillPayload, name: "<b>Review PR</b>", description: "<em>Desc</em>" }),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req);
    const createCall = vi.mocked(prisma.skill.create).mock.calls[0][0];
    expect(createCall.data.name).toBe("Review PR");
    expect(createCall.data.description).toBe("Desc");
  });
});
