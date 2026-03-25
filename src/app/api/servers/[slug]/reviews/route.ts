import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { rateLimit, getIp } from "@/lib/rate-limit";
import { stripHtml } from "@/lib/sanitize";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  author: z.string().min(1).max(80),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const server = await prisma.server.findUnique({ where: { slug: params.slug } });
  if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const reviews = await prisma.review.findMany({
    where: { serverId: server.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ reviews });
}

// POST — 10 reviews per hour per IP
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const ip = getIp(req);
  const rl = await rateLimit(ip, "POST /api/servers/reviews", 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const server = await prisma.server.findUnique({ where: { slug: params.slug } });
  if (!server) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 422 }
    );
  }

  // Create review and update cached avgRating + reviewCount in a transaction
  const [review] = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        serverId: server.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment ? stripHtml(parsed.data.comment) : null,
        author: stripHtml(parsed.data.author),
      },
    });

    const agg = await tx.review.aggregate({
      where: { serverId: server.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.server.update({
      where: { id: server.id },
      data: {
        avgRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : null,
        reviewCount: agg._count.rating,
      },
    });

    return [newReview];
  });

  return NextResponse.json({ review }, { status: 201 });
}
