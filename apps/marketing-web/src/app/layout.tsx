import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

import "./globals.css";

const walsheim = localFont({
  variable: "--font-walsheim",
  display: "swap",
  src: [
    { path: "../../public/fonts/GTWalsheimPro-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/GTWalsheimPro-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/GTWalsheimPro-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/GTWalsheimPro-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const jakarta = localFont({
  variable: "--font-jakarta",
  display: "swap",
  src: [
    { path: "../../public/fonts/PlusJakartaSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/PlusJakartaSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/PlusJakartaSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../../public/fonts/PlusJakartaSans-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NODE_ENV === "production" ? "https://casanirvana.app" : "http://localhost:3001");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Casa Nirvana | Connected Community Operations", template: "%s | Casa Nirvana" },
  description: "Casa Nirvana connects residents, security guards, facility managers and trusted services in one community operations platform.",
  applicationName: "Casa Nirvana",
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: "Casa Nirvana", title: "Casa Nirvana | Connected Community Operations", description: "Safer communities run better together.", images: [{ url: "/opengraph-image" }] },
  twitter: { card: "summary_large_image", title: "Casa Nirvana", description: "The connected operating system for safer, better-run communities.", images: ["/opengraph-image"] },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#9bea69" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Casa Nirvana",
    applicationCategory: "BusinessApplication",
    description: "Connected community operations for residents, guards and facility managers.",
    url: siteUrl,
  };

  return (
    <html lang="en" className={`${walsheim.variable} ${jakarta.variable}`} data-scroll-behavior="smooth">
      <body>
        <a className="pxl-skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      </body>
    </html>
  );
}
