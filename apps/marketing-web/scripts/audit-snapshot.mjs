import { access, readFile } from "node:fs/promises";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(appRoot, "public");
const manifest = JSON.parse(await readFile(path.join(publicRoot, "wordpress-snapshot", "manifest.json"), "utf8"));
const approvedRoutes = ["/", "/about-us/", "/our-products/", "/residents/", "/security-guards/", "/facility-managers/", "/marketplace/", "/pricing-plans/", "/core-features/", "/faqs/", "/contact-us/"];
const failures = [];

for (const route of approvedRoutes) {
  const page = manifest.pages[route];
  if (!page) {
    failures.push(`${route}: missing manifest entry`);
    continue;
  }
  const source = await readFile(path.join(publicRoot, page.output.replace(/^\/+/, "")), "utf8");
  const checks = [
    ["single title", (source.match(/<title\b/gi) || []).length === 1],
    ["single description", (source.match(/<meta\b[^>]*name=["']description["']/gi) || []).length === 1],
    ["single canonical", (source.match(/<link\b[^>]*rel=["']canonical["']/gi) || []).length === 1],
    ["single h1", (source.match(/<h1\b/gi) || []).length === 1],
    ["language", /<html\b[^>]*\blang=["']en["']/i.test(source)],
    ["scroll behavior declaration", /<html\b[^>]*\bdata-scroll-behavior=["']smooth["']/i.test(source)],
    ["skip link", /class=["'][^"']*casa-skip-link/i.test(source)],
    ["skip target", /id=["']main-content["']/i.test(source)],
    ["reduced motion", /prefers-reduced-motion\s*:\s*reduce/i.test(source)],
    ["structured data", /type=["']application\/ld\+json["']/i.test(source)],
    ["no missing image alt", !/<img\b(?![^>]*\balt=)[^>]*>/i.test(source)],
    ["no missing iframe title", !/<iframe\b(?![^>]*\btitle=)[^>]*>/i.test(source)],
    ["no WordPress control endpoint", !/(?:\/wp-admin\/|\/wp-json\/|xmlrpc\.php)/i.test(source)],
    ["no Studio origin", !/localhost:8882/i.test(source)],
    ["no WordPress editor runtime", !/\/wp-includes\/js\/dist\//i.test(source)],
    ["no plugin admin runtime", !/(?:woocommerce\/assets\/js|contact-form-7\/includes\/swv|elementor\/assets\/js\/(?:common|web-cli|dev-tools|app-loader))/i.test(source)],
    ["native forms runtime", /src=["']\/assets\/casa-native-forms\.js/i.test(source)],
    ["static form compatibility", /id=["']casa-static-form-compat["']/i.test(source)],
    ["owned favicon", /rel=["']icon["'][^>]*href=["']\/icon\.svg["']/i.test(source)],
    ["stable decorative assets", !/\/wp-content\/uploads\/2025\/(?:03\/(?:bg-ss1-h3\.webp|Vector\.png|pattern-h3\.webp|bg-qr-h3\.png|Pattern_bg\.png)|04\/bg-last-7\.webp|05\/pattern1221\.png)/i.test(source)],
    ["no legacy upload paths", !/\/wp-content\/uploads\//i.test(source)],
  ];
  for (const [label, passed] of checks) if (!passed) failures.push(`${route}: ${label}`);
  const ownedUploads = new Set([...source.matchAll(/\/assets\/uploads\/[^\s"'()\\<>?]+/gi)].map((match) => match[0]));
  for (const pathname of ownedUploads) {
    try {
      await access(path.join(publicRoot, decodeURIComponent(pathname.replace(/^\/+/, ""))));
    } catch {
      failures.push(`${route}: missing owned upload ${pathname}`);
    }
  }
}

if (failures.length) {
  process.stderr.write(`Snapshot audit failed:\n- ${failures.join("\n- ")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Snapshot audit passed for ${approvedRoutes.length} approved routes.\n`);
}
