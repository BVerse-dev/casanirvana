import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://casanirvana.app" : "http://localhost:3001")).replace(/\/$/, "");
  const routes = [
    ["/", "weekly", 1],
    ["/about-us/", "monthly", 0.8],
    ["/our-products/", "monthly", 0.9],
    ["/residents/", "monthly", 0.9],
    ["/security-guards/", "monthly", 0.9],
    ["/facility-managers/", "monthly", 0.9],
    ["/marketplace/", "monthly", 0.8],
    ["/pricing-plans/", "monthly", 0.8],
    ["/core-features/", "monthly", 0.8],
    ["/faqs/", "monthly", 0.7],
    ["/contact-us/", "monthly", 0.7],
    ["/get-started/", "monthly", 0.7],
    ["/get-started/residents/", "monthly", 0.7],
    ["/get-started/community/", "monthly", 0.8],
  ] as const;
  return routes.map(([route, changeFrequency, priority]) => ({ url: `${baseUrl}${route}`, changeFrequency, priority }));
}
