import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST — save item to library
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, itemSlug } = await req.json();
  if (!type || !itemSlug) return NextResponse.json({ error: "type and itemSlug required" }, { status: 400 });

  try {
    const item = await (prisma as any).userSavedItem.create({
      data: { userId: session.user.id, type, itemSlug },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Already saved" }, { status: 409 });
  }
}

// DELETE — remove item from library
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type, itemSlug } = await req.json();
  await (prisma as any).userSavedItem.deleteMany({
    where: { userId: session.user.id, type, itemSlug },
  });
  return NextResponse.json({ ok: true });
}

// GET — check saved items
// ?type=server&slug=mcp-github  → { saved: true }
// (no params) → returns all saved items
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const slug = url.searchParams.get("slug");

  if (type && slug) {
    const item = await (prisma as any).userSavedItem.findUnique({
      where: { userId_type_itemSlug: { userId: session.user.id, type, itemSlug: slug } },
    });
    return NextResponse.json({ saved: !!item });
  }

  const items = await (prisma as any).userSavedItem.findMany({
    where: { userId: session.user.id },
    orderBy: { addedAt: "desc" },
  });
  return NextResponse.json(items);
}
