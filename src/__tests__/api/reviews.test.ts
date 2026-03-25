import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/servers/[slug]/reviews/route";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

function makeRequest(slug: string, options?: RequestInit) {
  return new NextRequest(new Request(`http://localhost/api/servers/${slug}/reviews`, options));
}

const fakeServer = { id: "server-1", slug: "test-server" };
const fakeReview = {
  id: "review-1",
  serverId: "server-1",
  rating: 5,
  comment: "Great server!",
  author: "Alice",
  createdAt: new Date(),
};

// ── GET /api/servers/[slug]/reviews ───────────────────────────────────────────

describe("GET /api/servers/[slug]/reviews", () => {
  beforeEach(() => {
    vi.mocked(prisma.server.findUnique).mockResolvedValue(fakeServer as any);
    vi.mocked(prisma.review.findMany).mockResolvedValue([fakeReview] as any);
  });

  it("returns 200 with reviews array", async () => {
    const res = await GET(makeRequest("test-server"), { params: { slug: "test-server" } });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(Array.isArray(body.reviews)).toBe(true);
    expect(body.reviews[0].rating).toBe(5);
  });

  it("returns 404 when server does not exist", async () => {
    vi.mocked(prisma.server.findUnique).mockResolvedValue(null);
    const res = await GET(makeRequest("unknown"), { params: { slug: "unknown" } });
    expect(res.status).toBe(404);
  });

  it("returns empty array when no reviews", async () => {
    vi.mocked(prisma.review.findMany).mockResolvedValue([]);
    const res = await GET(makeRequest("test-server"), { params: { slug: "test-server" } });
    const body = await res.json();
    expect(body.reviews).toHaveLength(0);
  });
});

// ── POST /api/servers/[slug]/reviews ─────────────────────────────────────────

describe("POST /api/servers/[slug]/reviews", () => {
  beforeEach(() => {
    vi.mocked(prisma.server.findUnique).mockResolvedValue(fakeServer as any);
    vi.mocked(prisma.review.create).mockResolvedValue(fakeReview as any);
    vi.mocked(prisma.review.aggregate).mockResolvedValue({
      _avg: { rating: 5 },
      _count: { rating: 1 },
    } as any);
    // $transaction runs the callback with prisma itself (configured in setup.ts)
  });

  it("returns 201 and created review", async () => {
    const req = makeRequest("test-server", {
      method: "POST",
      body: JSON.stringify({ rating: 5, author: "Alice", comment: "Excellent!" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, { params: { slug: "test-server" } });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty("review");
  });

  it("returns 404 when server does not exist", async () => {
    vi.mocked(prisma.server.findUnique).mockResolvedValue(null);
    const req = makeRequest("unknown", {
      method: "POST",
      body: JSON.stringify({ rating: 4, author: "Bob" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, { params: { slug: "unknown" } });
    expect(res.status).toBe(404);
  });

  it("returns 422 for rating out of range", async () => {
    const req = makeRequest("test-server", {
      method: "POST",
      body: JSON.stringify({ rating: 6, author: "Bob" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, { params: { slug: "test-server" } });
    expect(res.status).toBe(422);
  });

  it("returns 422 when author is missing", async () => {
    const req = makeRequest("test-server", {
      method: "POST",
      body: JSON.stringify({ rating: 4 }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, { params: { slug: "test-server" } });
    expect(res.status).toBe(422);
  });

  it("returns 400 for invalid JSON", async () => {
    const req = makeRequest("test-server", {
      method: "POST",
      body: "bad-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, { params: { slug: "test-server" } });
    expect(res.status).toBe(400);
  });

  it("returns 429 when rate limit exceeded", async () => {
    vi.mocked(rateLimit).mockResolvedValueOnce({ allowed: false, remaining: 0, resetAt: Date.now() + 3600_000 });
    const req = makeRequest("test-server", {
      method: "POST",
      body: JSON.stringify({ rating: 3, author: "Spammer" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req, { params: { slug: "test-server" } });
    expect(res.status).toBe(429);
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("strips HTML from comment and author", async () => {
    const req = makeRequest("test-server", {
      method: "POST",
      body: JSON.stringify({ rating: 4, author: "<b>Alice</b>", comment: "<script>alert(1)</script>Great!" }),
      headers: { "Content-Type": "application/json" },
    });
    await POST(req, { params: { slug: "test-server" } });
    const createCall = vi.mocked(prisma.review.create).mock.calls[0][0];
    expect(createCall.data.author).toBe("Alice");
    expect(createCall.data.comment).toBe("Great!");
  });
});
