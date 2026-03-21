import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubmitSkillForm } from "./SubmitSkillForm";

export const metadata: Metadata = { title: "Submit a Skill — MCPHub" };

export default async function SubmitSkillPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/skills/submit");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <a href="/skills" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Skills registry
        </a>
      </div>
      <h1 className="text-2xl font-bold mb-2">Submit a skill</h1>
      <p className="text-gray-400 mb-8">
        Share a prompt or agent with the MCPHub community. Verified skills appear in search and featured sections.
      </p>
      <SubmitSkillForm />
    </div>
  );
}
