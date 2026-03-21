import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SubmitForm } from "./SubmitForm";
import { getT } from "@/lib/i18n";

export const metadata = {
  title: "Submit — MCPHub",
  description: "Submit an MCP Server, Skill, or Agent to the MCPHub registry",
};

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const [session, lang] = await Promise.all([
    auth(),
    cookies().then(c => c.get("lang")?.value ?? "en"),
  ]);
  if (!session) redirect("/auth/signin?callbackUrl=/submit");
  const t = getT(lang);

  const defaultType = (searchParams.type === "prompt" || searchParams.type === "agent") ? searchParams.type : "server";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t.submitTitle}</h1>
        <p className="text-gray-400 text-sm">
          {t.submitDesc}
        </p>
      </div>

      <SubmitForm defaultType={defaultType as any} />
    </div>
  );
}
