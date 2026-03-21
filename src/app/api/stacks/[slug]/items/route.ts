import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stack = await prisma.userStack.findUnique({
    where: { slug: params.slug },
    include: { items: true },
  });
  if (!stack) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (stack.createdBy !== session.user.githubLogin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { type, itemSlug } = await req.json();
  if (!type || !itemSlug) return NextResponse.json({ error: "type and itemSlug required" }, { status: 400 });

  try {
    const item = await prisma.userStackItem.create({
      data: { stackId: stack.id, type, itemSlug, order: stack.items.length },
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Item already in stack" }, { status: 409 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stack = await prisma.userStack.findUnique({ where: { slug: params.slug } });
  if (!stack) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (stack.createdBy !== session.user.githubLogin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { itemSlug } = await req.json();
  await prisma.userStackItem.deleteMany({
    where: { stackId: stack.id, itemSlug },
  });
  return NextResponse.json({ ok: true });
}
