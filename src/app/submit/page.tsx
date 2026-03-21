import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubmitForm } from "./SubmitForm";

export const metadata = {
  title: "Submit — MCPHub",
  description: "Submit an MCP Server, Skill, or Agent to the MCPHub registry",
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin?callbackUrl=/submit");

  const defaultType = (searchParams.type === "prompt" || searchParams.type === "agent") ? searchParams.type : "server";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Submit to MCPHub</h1>
        <p className="text-gray-400 text-sm">
          Share an MCP server, a slash-command skill, or an AI agent with the community — or save it privately to your library.
        </p>
      </div>

      <SubmitForm defaultType={defaultType as any} />
    </div>
  );
}
