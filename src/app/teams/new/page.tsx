import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { NewTeamForm } from "./NewTeamForm";

export const metadata: Metadata = { title: "New Team — Codestack" };

export default async function NewTeamPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-8">
        <a href="/teams" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">← Back to teams</a>
        <h1 className="text-2xl font-bold mt-4">Create a team</h1>
        <p className="text-gray-400 text-sm mt-2">
          Teams let you share a set of MCP servers with your colleagues. Each member can sync all servers with one command.
        </p>
      </div>
      <NewTeamForm />
    </div>
  );
}
