import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getStack } from "@/lib/stacks";

// GET — resolve either a curated or user stack, returning normalized shape for the CLI
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const curated = getStack(params.slug);

  if (curated) {
    return NextResponse.json({
      slug: curated.slug,
      name: curated.name,
      description: curated.description,
      icon: curated.icon,
      servers: curated.servers,
      skills: curated.skills,
      agents: curated.agents,
      curated: true,
    });
  }

  const stack = await prisma.userStack.findUnique({
    where: { slug: params.slug },
    include: { items: { orderBy: { order: "asc" } } },
  });
  if (!stack) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    slug: stack.slug,
    name: stack.name,
    description: stack.description,
    icon: stack.icon,
    servers: stack.items.filter(i => i.type === "server").map(i => i.itemSlug),
    skills: stack.items.filter(i => i.type === "skill").map(i => i.itemSlug),
    agents: stack.items.filter(i => i.type === "agent").map(i => i.itemSlug),
    curated: false,
    createdBy: stack.createdBy,
  });
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
