import { createHash } from "node:crypto";
import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const appRoot = path.resolve(import.meta.dirname, "..");
const baseUrl = new URL(process.env.WORDPRESS_CAPTURE_URL || "http://localhost:8882/");
const outputRoot = path.join(appRoot, "public", "wordpress-snapshot");
const pageRoot = path.join(outputRoot, "pages");
const publicRoot = path.join(appRoot, "public");
const manifestPath = path.join(outputRoot, "manifest.json");
const delayMs = Number(process.env.WORDPRESS_CAPTURE_DELAY_MS || 1200);
const maxAttempts = Number(process.env.WORDPRESS_CAPTURE_ATTEMPTS || 8);
const requestTimeoutMs = Number(process.env.WORDPRESS_CAPTURE_TIMEOUT_MS || 45_000);
const skipSitemap = process.env.WORDPRESS_CAPTURE_SKIP_SITEMAP === "1";
const captureQuery = process.env.WORDPRESS_CAPTURE_QUERY || "static-capture=1";
const resumeCapture = process.env.WORDPRESS_CAPTURE_RESUME === "1";
const explicitSeeds = [
  "/",
  "/about-us/",
  "/our-products/",
  "/residents/",
  "/security-guards/",
  "/facility-managers/",
  "/marketplace/",
  "/pricing-plans/",
  "/faqs/",
  "/contact-us/",
];
const blockedPagePrefixes = [
  "/wp-admin",
  "/wp-json",
  "/wp-login.php",
  "/xmlrpc.php",
  "/comments/",
  "/feed/",
  "/tools/",
  "/speed/",
  "/404-error",
  "/about-company/",
];
const assetPrefixes = ["/wp-content/", "/wp-includes/"];
const pageExtensions = new Set(["", ".html", ".htm", ".php"]);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cleanPathname(value) {
  let pathname = decodeURIComponent(value || "/").replace(/\/+/g, "/");
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  return pathname;
}

function isPageUrl(url) {
  if (url.origin !== baseUrl.origin) return false;
  const pathname = cleanPathname(url.pathname);
  if (/[{}"'\\]/.test(pathname)) return false;
  if (blockedPagePrefixes.some((prefix) => pathname.startsWith(prefix))) return false;
  if (assetPrefixes.some((prefix) => pathname.startsWith(prefix))) return false;
  if (pathname === "/wp-sitemap.xml" || pathname.endsWith("/feed/")) return false;
  return pageExtensions.has(path.extname(pathname).toLowerCase());
}

function isAssetUrl(url) {
  return url.origin === baseUrl.origin && assetPrefixes.some((prefix) => url.pathname.startsWith(prefix));
}

function normalizePageUrl(value) {
  const url = new URL(value, baseUrl);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (key.startsWith("utm_") || ["ver", "elementor-preview", "preview", "preview_id", "preview_nonce"].includes(key)) {
      url.searchParams.delete(key);
    }
  }
  return url;
}

function pageOutputName(pathname) {
  if (pathname === "/") return "index.html";
  const normalized = pathname.replace(/^\/+|\/+$/g, "") || "index";
  return `${normalized}/index.html`;
}

function extractAttributeUrls(source) {
  const found = [];
  const attributePattern = /\b(?:href|src|poster|data-src|data-lazy-src)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/gi;
  for (const match of source.matchAll(attributePattern)) found.push(match[1] || match[2] || match[3]);
  const srcsetPattern = /\b(?:srcset|data-srcset)\s*=\s*(?:"([^"]+)"|'([^']+)')/gi;
  for (const match of source.matchAll(srcsetPattern)) {
    for (const candidate of (match[1] || match[2]).split(",")) found.push(candidate.trim().split(/\s+/)[0]);
  }
  return found;
}

function extractCssUrls(source, stylesheetUrl) {
  const found = [];
  for (const match of source.matchAll(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)/gi)) {
    const value = match[1] || match[2] || match[3];
    if (!value.startsWith("data:") && !value.startsWith("#")) found.push(new URL(value, stylesheetUrl).href);
  }
  for (const match of source.matchAll(/@import\s+(?:url\()?\s*(?:"([^"]+)"|'([^']+)'|([^)'";\s]+))/gi)) {
    found.push(new URL(match[1] || match[2] || match[3], stylesheetUrl).href);
  }
  return found;
}

function rewriteDocument(source) {
  const escapedOrigin = baseUrl.origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return source
    .replace(new RegExp(escapedOrigin, "g"), "")
    .replace(new RegExp(`//${baseUrl.host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g"), "")
    .replace(
      /<\/head>/i,
      '<style id="casa-static-capture-cleanup">#wpadminbar{display:none!important}html{margin-top:0!important}</style></head>',
    );
}

async function fetchWithRetry(url, expectedType) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      if (attempt > 1) await sleep(delayMs * attempt);
      const response = await fetch(url, {
        headers: { "user-agent": "CasaNirvanaStaticCapture/1.0" },
        redirect: "follow",
        signal: AbortSignal.timeout(requestTimeoutMs),
      });
      const contentType = response.headers.get("content-type") || "";
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      if (expectedType && !contentType.includes(expectedType)) throw new Error(`Unexpected content type ${contentType}`);
      return response;
    } catch (error) {
      lastError = error;
      process.stdout.write(`retry ${attempt}/${maxAttempts} ${url}: ${error.message}\n`);
    }
  }
  throw new Error(`Failed after ${maxAttempts} attempts: ${url} (${lastError?.message || "unknown error"})`);
}

async function discoverSitemapUrls() {
  const pending = [new URL("/wp-sitemap.xml", baseUrl).href];
  const visited = new Set();
  const pages = new Set();
  while (pending.length) {
    const current = pending.shift();
    if (visited.has(current)) continue;
    visited.add(current);
    try {
      const response = await fetchWithRetry(current, "xml");
      const xml = await response.text();
      for (const match of xml.matchAll(/<loc>([\s\S]*?)<\/loc>/gi)) {
        const value = match[1].replaceAll("&amp;", "&").trim();
        const url = normalizePageUrl(value);
        if (url.pathname.endsWith(".xml")) pending.push(url.href);
        else if (isPageUrl(url)) pages.add(url.href);
      }
    } catch (error) {
      process.stdout.write(`sitemap skipped ${current}: ${error.message}\n`);
    }
    await sleep(delayMs);
  }
  return pages;
}

async function mirrorAsset(value, assetQueue, mirroredAssets, failedAssets) {
  const url = new URL(value, baseUrl);
  url.hash = "";
  if (!isAssetUrl(url) || mirroredAssets.has(url.pathname) || failedAssets.has(url.href)) return;
  try {
    const response = await fetchWithRetry(url.href);
    const buffer = Buffer.from(await response.arrayBuffer());
    const destination = path.join(publicRoot, cleanPathname(url.pathname));
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, buffer);
    mirroredAssets.set(url.pathname, {
      source: url.href,
      bytes: buffer.byteLength,
      sha256: createHash("sha256").update(buffer).digest("hex"),
    });
    if ((response.headers.get("content-type") || "").includes("text/css") || url.pathname.endsWith(".css")) {
      const css = buffer.toString("utf8");
      for (const nested of extractCssUrls(css, url)) assetQueue.add(nested);
    }
  } catch (error) {
    failedAssets.set(url.href, error.message);
  }
  await sleep(delayMs);
}

if (!resumeCapture) await rm(outputRoot, { recursive: true, force: true });
await mkdir(pageRoot, { recursive: true });

const sitemapPages = skipSitemap ? new Set() : await discoverSitemapUrls();
const pageQueue = [...new Set([...explicitSeeds.map((value) => new URL(value, baseUrl).href), ...sitemapPages])];
const queuedPages = new Set(pageQueue);
const capturedPages = new Map();
const failedPages = new Map();
const assetQueue = new Set();

while (pageQueue.length) {
  const current = pageQueue.shift();
  const url = normalizePageUrl(current);
  if (!isPageUrl(url) || capturedPages.has(url.pathname)) continue;
  try {
    const outputName = pageOutputName(url.pathname);
    const outputPath = path.join(pageRoot, outputName);
    let html;
    let rewritten;
    if (resumeCapture) {
      try {
        await access(outputPath);
        rewritten = await readFile(outputPath, "utf8");
        html = rewritten;
      } catch {
        // The route has not been captured yet.
      }
    }
    if (!html) {
      const requestUrl = new URL(url);
      for (const [key, value] of new URLSearchParams(captureQuery)) requestUrl.searchParams.set(key, value);
      const response = await fetchWithRetry(requestUrl.href, "text/html");
      html = await response.text();
      rewritten = rewriteDocument(html);
      await mkdir(path.dirname(outputPath), { recursive: true });
      await writeFile(outputPath, rewritten);
    }
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.replace(/<[^>]+>/g, "").trim() || "";
    capturedPages.set(url.pathname, {
      source: url.href,
      output: `/wordpress-snapshot/pages/${outputName}`,
      title,
      bytes: Buffer.byteLength(rewritten),
      sha256: createHash("sha256").update(rewritten).digest("hex"),
    });
    for (const value of extractAttributeUrls(html)) {
      if (!value || /["'\\]/.test(value) || /^(?:data:|mailto:|tel:|javascript:|#)/i.test(value)) continue;
      let discovered;
      try {
        discovered = normalizePageUrl(value);
      } catch {
        continue;
      }
      if (isAssetUrl(discovered)) assetQueue.add(discovered.href);
      if (isPageUrl(discovered) && !queuedPages.has(discovered.href)) {
        queuedPages.add(discovered.href);
        pageQueue.push(discovered.href);
      }
    }
    process.stdout.write(`page ${url.pathname} -> ${outputName} (${Buffer.byteLength(rewritten)} bytes)\n`);
  } catch (error) {
    failedPages.set(url.href, error.message);
  }
  await sleep(delayMs);
}

const mirroredAssets = new Map();
const failedAssets = new Map();
while (assetQueue.size) {
  const current = assetQueue.values().next().value;
  assetQueue.delete(current);
  await mirrorAsset(current, assetQueue, mirroredAssets, failedAssets);
}

const manifest = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  sourceOrigin: baseUrl.origin,
  pages: Object.fromEntries([...capturedPages.entries()].sort(([a], [b]) => a.localeCompare(b))),
  assets: Object.fromEntries([...mirroredAssets.entries()].sort(([a], [b]) => a.localeCompare(b))),
  failures: {
    pages: Object.fromEntries(failedPages),
    assets: Object.fromEntries(failedAssets),
  },
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`\nCaptured ${capturedPages.size} pages and ${mirroredAssets.size} assets.\nManifest: ${manifestPath}\n`);
if (failedPages.size) process.exitCode = 2;
