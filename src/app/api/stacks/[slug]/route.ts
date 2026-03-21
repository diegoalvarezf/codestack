import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const stack = await prisma.userStack.findUnique({
    where: { slug: params.slug },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!stack) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(stack);
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stack = await prisma.userStack.findUnique({ where: { slug: params.slug } });
  if (!stack) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (stack.createdBy !== session.user.githubLogin && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const updated = await prisma.userStack.update({
    where: { slug: params.slug },
    data: {
      name: body.name ?? undefined,
      description: body.description ?? undefined,
      icon: body.icon ?? undefined,
      public: body.public ?? undefined,
    },
    include: { items: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const stack = await prisma.userStack.findUnique({ where: { slug: params.slug } });
  if (!stack) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (stack.createdBy !== session.user.githubLogin && session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.userStack.delete({ where: { slug: params.slug } });
  return NextResponse.json({ ok: true });
}
