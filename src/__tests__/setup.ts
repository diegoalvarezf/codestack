import { vi, beforeEach } from "vitest";

// Reset all mock call history between tests to avoid cross-test contamination
beforeEach(() => {
  vi.clearAllMocks();
});

// ── Mock Prisma ───────────────────────────────────────────────────────────────
// Each test file can override individual methods with vi.mocked(prisma.xxx)

vi.mock("@/lib/db", () => {
  const prisma = {
    server: {
      findMany:  vi.fn(),
      findUnique: vi.fn(),
      create:    vi.fn(),
      update:    vi.fn(),
      count:     vi.fn(),
      updateMany: vi.fn(),
    },
    skill: {
      findMany:  vi.fn(),
      findUnique: vi.fn(),
      create:    vi.fn(),
      update:    vi.fn(),
      count:     vi.fn(),
      updateMany: vi.fn(),
    },
    review: {
      findMany:  vi.fn(),
      create:    vi.fn(),
      aggregate: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    $queryRawUnsafe: vi.fn(),
    $transaction: vi.fn((fn: (tx: any) => any) => fn(prisma)),
  };
  return { prisma };
});

// ── Mock NextAuth ─────────────────────────────────────────────────────────────

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null as any), // unauthenticated by default
}));

// ── Mock rate-limit (always allow in tests) ───────────────────────────────────

vi.mock("@/lib/rate-limit", () => ({
  rateLimit: vi.fn().mockReturnValue({ allowed: true, remaining: 99, resetAt: Date.now() + 3600_000 }),
  getIp: vi.fn().mockReturnValue("127.0.0.1"),
}));
