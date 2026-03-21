import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/library", "/api/"],
      },
    ],
    sitemap: "https://mcp-registry-sigma.vercel.app/sitemap.xml",
  };
}
