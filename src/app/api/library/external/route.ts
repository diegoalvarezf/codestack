import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

function slugify(name: string, login: string): string {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/, "")}-${login}`.slice(0, 80);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user.githubLogin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { name, description, npmPackage, repoUrl, installCmd, envVars } = body;

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  if (!repoUrl && !npmPackage) return NextResponse.json({ error: "repoUrl or npmPackage required" }, { status: 400 });

  const slug = slugify(name, session.user.githubLogin);

  try {
    const server = await prisma.server.create({
      data: {
        slug,
        name,
        description: description ?? "",
        repoUrl: repoUrl ?? `https://www.npmjs.com/package/${npmPackage}`,
        npmPackage: npmPackage ?? null,
        installCmd: installCmd ?? (npmPackage ? `npx -y ${npmPackage}` : null),
        authorName: session.user.name ?? session.user.githubLogin,
        authorUrl: `https://github.com/${session.user.githubLogin}`,
        tags: "[]",
        tools: "[]",
        clients: "[]",
        envVars: envVars ? JSON.stringify(envVars) : null,
        featured: false,
        verified: false,
        createdBy: session.user.githubLogin,
        category: "personal",
      },
    });
    return NextResponse.json(server, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Slug already exists or invalid data" }, { status: 409 });
  }
}
