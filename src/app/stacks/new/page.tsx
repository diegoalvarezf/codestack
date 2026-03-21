import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateStackForm } from "./CreateStackForm";

export const metadata = { title: "Create Stack — MCPHub" };

export default async function NewStackPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/stacks/new");
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <a href="/stacks" className="text-sm text-gray-400 hover:text-white transition-colors">← All stacks</a>
      </div>
      <h1 className="text-2xl font-bold mb-2">Create a stack</h1>
      <p className="text-gray-400 text-sm mb-8">
        Combine MCP servers, skills, and agents into a shareable kit for a specific workflow.
      </p>
      <CreateStackForm />
    </div>
  );
}
