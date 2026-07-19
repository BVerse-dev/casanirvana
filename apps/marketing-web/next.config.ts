import type { NextConfig } from "next";
import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

type SnapshotManifest = {
  pages: Record<string, { output: string }>;
};

const snapshotManifest = JSON.parse(
  readFileSync(new URL("./public/wordpress-snapshot/manifest.json", import.meta.url), "utf8"),
) as SnapshotManifest;

const monorepoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

const approvedSnapshotRoutes = new Set([
  "/",
  "/about-us/",
  "/our-products/",
  "/residents/",
  "/security-guards/",
  "/facility-managers/",
  "/marketplace/",
  "/pricing-plans/",
  "/core-features/",
  "/faqs/",
  "/contact-us/",
]);

const snapshotRewrites = Object.entries(snapshotManifest.pages)
  .filter(([route]) => approvedSnapshotRoutes.has(route))
  .map(([route, page]) => ({
    source: route === "/" ? route : route.replace(/\/$/, ""),
    destination: page.output,
  }));

const legacyArticleSlugs = [
  "adaptive-grazing-promotes-soil-vitality",
  "holistic-grazing-strengthens-biodiversity",
  "managed-grazing-enhances-biodiversity",
  "planned-grazing-boosts-native-species",
  "regenerative-grazing-boosts-soil-health-rapidly",
  "regenerative-grazing-enriches-ecosystems",
  "rotational-grazing-improves-water-retention",
  "rotational-grazing-supports-ecosystem-health",
  "sustainable-grazing-restores-habitats",
];

const nextConfig: NextConfig = {
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  trailingSlash: true,
  async rewrites() {
    return {
      beforeFiles: snapshotRewrites,
      afterFiles: [],
      fallback: [],
    };
  },
  async redirects() {
    return [
      { source: "/about", destination: "/about-us", permanent: true },
      { source: "/products", destination: "/our-products", permanent: true },
      { source: "/pricing", destination: "/pricing-plans", permanent: true },
      { source: "/contact", destination: "/contact-us", permanent: true },
      { source: "/terms-and-conditions", destination: "/terms-of-service", permanent: true },
      { source: "/our-team", destination: "/about-us", permanent: true },
      { source: "/team-details", destination: "/about-us", permanent: true },
      { source: "/careers", destination: "/about-us", permanent: true },
      { source: "/career/:path*", destination: "/about-us", permanent: true },
      { source: "/blog-standard/:path*", destination: "/core-features", permanent: true },
      { source: "/service/:path*", destination: "/core-features", permanent: true },
      { source: "/portfolio/:path*", destination: "/our-products", permanent: true },
      { source: "/shop/:path*", destination: "/marketplace", permanent: true },
      { source: "/product/:path*", destination: "/marketplace", permanent: true },
      { source: "/product-tag/:path*", destination: "/marketplace", permanent: true },
      { source: "/author/:path*", destination: "/about-us", permanent: true },
      { source: "/category/:path*", destination: "/core-features", permanent: true },
      { source: "/tag/:path*", destination: "/core-features", permanent: true },
      ...legacyArticleSlugs.map((slug) => ({
        source: `/${slug}`,
        destination: "/core-features",
        permanent: true,
      })),
    ];
  },
  async headers() {
    const immutableCache = [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }];
    const previewRobots = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production"
      ? [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }]
      : [];
    return [
      { source: "/assets/:path*", headers: immutableCache },
      { source: "/fonts/:path*", headers: immutableCache },
      { source: "/wp-content/:path*", headers: immutableCache },
      { source: "/wp-includes/:path*", headers: immutableCache },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...previewRobots,
        ],
      },
    ];
  },
};

export default nextConfig;
