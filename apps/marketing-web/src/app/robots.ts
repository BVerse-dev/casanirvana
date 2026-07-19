import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://casanirvana.app" : "http://localhost:3001")).replace(/\/$/, "");
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/wordpress-snapshot/"] },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
