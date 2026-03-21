import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getServer } from "@/lib/servers";
import { getT } from "@/lib/i18n";
import { SubmittedBanner } from "./SubmittedBanner";
import { ReviewSection } from "@/components/ReviewSection";
import { InstallPanel } from "./InstallPanel";
import { IconGitHub, IconExternalLink } from "@/components/Icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const server = await getServer(params.slug);
  if (!server) return {};
  const title = `${server.name} — MCPHub`;
  const description = server.description;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://mcp-registry-sigma.vercel.app/server/${server.slug}`,
      siteName: "MCPHub",
      type: "website",
    },
    twitter: { card: "summary", title, description },
  };
}

export default async function ServerPage({ params }: { params: { slug: string } }) {
  const [server, cookieStore] = await Promise.all([getServer(params.slug), cookies()]);
  if (!server) notFound();

  const lang = cookieStore.get("lang")?.value ?? "en";
  const t = getT(lang);

  const clientLabels: Record<string, string> = {
    "claude-code": "Claude Code",
    cursor: "Cursor",
    continue: "Continue.dev",
    other: "Other",
  };

  // Derive owner/repo from repoSlug or repoUrl
  const repoIdentifier = server.repoSlug
    ?? server.repoUrl.replace(/^https?:\/\/(www\.)?github\.com\//, "").replace(/\/$/, "");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <Suspense><SubmittedBanner /></Suspense>
      {/* Back */}
      <a href="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors mb-6">
        {t.backToMcpHub}
      </a>
      {/* Header */}
      <div className="mb-8 sm:mb-10">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
          <h1 className="text-2xl sm:text-3xl font-bold">{server.name}</h1>
          {server.verified && (
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
              {t.verifiedBadge}
            </span>
          )}
          {server.featured && (
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
              {t.featuredBadge}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-base sm:text-lg mb-4">{server.description}</p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
          <span>{t.by} {server.authorUrl
            ? <a href={server.authorUrl} className="text-blue-400 hover:underline">{server.authorName}</a>
            : server.authorName
          }</span>
          <span>·</span>
          <span>v{server.version}</span>
          <span>·</span>
          <span>{server.license}</span>
          {server.avgRating && (
            <>
              <span>·</span>
              <span className="text-yellow-400">★ {server.avgRating} ({server.reviewCount})</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Install panel */}
          {server.installCmd && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                Install
              </h2>
              <InstallPanel
                slug={server.slug}
                installCmd={server.installCmd}
                configJson={server.configJson}
                envVars={server.envVars}
              />
            </section>
          )}

          {/* Tools */}
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
              {t.mcpTools} ({server.tools.length})
            </h2>
            <div className="space-y-2">
              {server.tools.map((tool) => (
                <div
                  key={tool}
                  className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 font-mono text-sm text-gray-300"
                >
                  {tool}
                </div>
              ))}
            </div>
          </section>

          {/* Long description */}
          {server.longDesc && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-3">
                {t.about}
              </h2>
              <p className="text-gray-400 leading-relaxed">{server.longDesc}</p>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
            <a
              href={server.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors"
            >
              <IconGitHub size={15} className="shrink-0" />
              {t.viewOnGitHub}
              <IconExternalLink size={12} className="text-gray-600 ml-auto" />
            </a>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Repository</p>
              <span className="font-mono text-xs text-gray-400">{repoIdentifier}</span>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t.transport}</p>
              <span className="font-mono text-sm text-gray-300">{server.transport}</span>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t.compatibleWith}</p>
              <div className="flex flex-wrap gap-1.5">
                {server.clients.map((c) => (
                  <span key={c} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md border border-gray-700">
                    {clientLabels[c] ?? c}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{t.tags}</p>
              <div className="flex flex-wrap gap-1.5">
                {server.tags.map((tag) => (
                  <a
                    key={tag}
                    href={`/?tag=${tag}`}
                    className="text-xs bg-gray-800 text-gray-400 hover:text-gray-200 px-2 py-1 rounded-full border border-gray-700 transition-colors"
                  >
                    #{tag}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ReviewSection
        slug={server.slug}
        initialReviews={server.reviews.map((r) => ({
          ...r,
          createdAt: r.createdAt.toISOString(),
        }))}
        avgRating={server.avgRating}
      />
    </div>
  );
}
