import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Join Team — Codestack" };

export default async function JoinPage({ params }: { params: { token: string } }) {
  const session = await auth();
  if (!session) redirect(`/auth/signin?callbackUrl=/join/${params.token}`);

  const team = await prisma.team.findUnique({ where: { inviteToken: params.token } });
  if (!team) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔗</p>
        <h1 className="text-xl font-bold mb-2">Invalid invite link</h1>
        <p className="text-gray-400 text-sm">This invite link is invalid or has expired.</p>
        <a href="/" className="text-blue-400 hover:underline text-sm mt-4 inline-block">← Back to Codestack</a>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { githubLogin: session.user.githubLogin! } });
  if (!user) redirect("/auth/signin");

  const existing = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId: team.id, userId: user.id } },
  });

  if (!existing) {
    await prisma.teamMember.create({
      data: { teamId: team.id, userId: user.id, role: "member" },
    });
  }

  redirect(`/teams/${team.slug}`);
}
