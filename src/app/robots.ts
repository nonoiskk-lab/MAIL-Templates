import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mailcraft.ai";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/generate", "/templates", "/history", "/settings", "/onboarding", "/api"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
