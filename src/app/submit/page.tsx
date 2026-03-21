import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata = {
  title: "Submit a server — MCPHub",
};

export default async function SubmitPage() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-3">Submit a server</h1>
        <p className="text-gray-400">
          Share your MCP server with the community. All submissions are reviewed before going live.
        </p>
      </div>
      <SubmitForm />
    </div>
  );
}
