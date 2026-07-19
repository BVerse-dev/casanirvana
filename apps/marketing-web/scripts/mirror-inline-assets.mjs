import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(appRoot, "public");
const manifest = JSON.parse(
  await readFile(path.join(publicRoot, "wordpress-snapshot", "manifest.json"), "utf8"),
);
const sourceOrigin = process.env.WORDPRESS_SOURCE_URL || manifest.sourceOrigin;
const approvedRoutes = [
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
];
const uploadPaths = new Set();

for (const route of approvedRoutes) {
  const page = manifest.pages[route];
  if (!page) throw new Error(`Missing snapshot route: ${route}`);
  const source = await readFile(path.join(publicRoot, page.output.replace(/^\/+/, "")), "utf8");
  for (const match of source.matchAll(/\/wp-content\/uploads\/[^\s"'()\\<>]+/gi)) {
    const pathname = new URL(match[0].replaceAll("&amp;", "&"), sourceOrigin).pathname;
    uploadPaths.add(pathname);
  }
}

let mirrored = 0;
for (const pathname of [...uploadPaths].sort()) {
  const relativePath = pathname.replace(/^\/wp-content\/uploads\//, "");
  const destination = path.join(publicRoot, "assets", "uploads", relativePath);
  const response = await fetch(new URL(pathname, sourceOrigin));
  if (!response.ok) throw new Error(`${pathname}: source returned ${response.status}`);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, Buffer.from(await response.arrayBuffer()));
  mirrored += 1;
}

process.stdout.write(`Mirrored ${mirrored} inline upload assets from ${sourceOrigin}.\n`);
