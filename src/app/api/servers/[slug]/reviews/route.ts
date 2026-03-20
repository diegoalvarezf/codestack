import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

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

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
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

  const review = await prisma.review.create({
    data: {
      serverId: server.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment ?? null,
      author: parsed.data.author,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
