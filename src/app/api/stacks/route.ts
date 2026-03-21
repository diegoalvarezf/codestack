import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/, "");
}

// GET — list public user stacks
export async function GET() {
  const stacks = await prisma.userStack.findMany({
    where: { public: true },
    include: { items: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(stacks);
}

// POST — create a stack
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, icon, items, public: isPublic } = body;

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const slug = `${slugify(name)}-${session.user.githubLogin}`.slice(0, 80);

  try {
    const stack = await prisma.userStack.create({
      data: {
        slug,
        name,
        description: description ?? null,
        icon: icon ?? "📦",
        public: isPublic === true,
        createdBy: session.user.githubLogin!,
        items: items?.length
          ? {
              create: items.map((item: { type: string; itemSlug: string }, i: number) => ({
                type: item.type,
                itemSlug: item.itemSlug,
                order: i,
              })),
            }
          : undefined,
      },
      include: { items: true },
    });
    return NextResponse.json(stack, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
  }
}
