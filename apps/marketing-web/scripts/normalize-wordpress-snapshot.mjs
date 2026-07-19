import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const appRoot = path.resolve(import.meta.dirname, "..");
const publicRoot = path.join(appRoot, "public");
const manifestPath = path.join(publicRoot, "wordpress-snapshot", "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const studioOrigins = [
  "http://localhost:8882",
  "https://localhost:8882",
  "http:\\/\\/localhost:8882",
  "https:\\/\\/localhost:8882",
  "http:\\u002F\\u002Flocalhost:8882",
  "https:\\u002F\\u002Flocalhost:8882",
  "http%3A%2F%2Flocalhost%3A8882",
  "https%3A%2F%2Flocalhost%3A8882",
];

function normalizeDocument(source) {
  let output = source;
  for (const origin of studioOrigins) output = output.replaceAll(origin, "");
  output = output
    .replaceAll("?static-capture=1", "")
    .replaceAll("&static-capture=1", "");

  output = removeElementById(output, "wpadminbar");
  output = output.replace(/<style\s+id=["']casa-static-capture-cleanup["'][^>]*>[\s\S]*?<\/style>/gi, "");
  output = output.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, (tag) =>
    tag.toLowerCase().includes("wpadminbar") ? "" : tag,
  );
  output = output.replace(/<link\b[^>]*>/gi, (tag) => (shouldRemoveLink(tag) ? "" : tag));
  output = output.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (tag) => (shouldRemoveScript(tag) ? "" : tag));
  output = output
    .replaceAll("/wp-admin/admin-ajax.php", "/api/wordpress-disabled")
    .replaceAll("\\/wp-admin\\/admin-ajax.php", "\\/api\\/wordpress-disabled")
    .replaceAll("/wp-admin/", "/api/wordpress-disabled/")
    .replaceAll("\\/wp-admin\\/", "\\/api\\/wordpress-disabled\\/")
    .replaceAll("/wp-json/", "/api/wordpress-disabled/")
    .replaceAll("\\/wp-json\\/", "\\/api\\/wordpress-disabled\\/")
    .replaceAll("/xmlrpc.php", "/api/wordpress-disabled")
    .replace(/\sclass=(["'])admin-bar\s+/gi, " class=$1");
  if (!output.includes('id="casa-native-forms-js"')) {
    output = output.replace(
      /<\/body>/i,
      '<script id="casa-native-forms-js" src="/assets/casa-native-forms.js" defer></script></body>',
    );
  }
  return output;
}

function shouldRemoveLink(tag) {
  const value = tag.toLowerCase();
  return [
    "admin-bar",
    "bertha-ai-free",
    'rel="https://api.w.org/"',
    "rel='https://api.w.org/'",
    'rel="edituri"',
    "rel='edituri'",
    "application/json+oembed",
    "text/xml+oembed",
    'type="application/json"',
    "type='application/json'",
  ].some((marker) => value.includes(marker));
}

function shouldRemoveScript(tag) {
  const value = tag.toLowerCase();
  return [
    "bertha-ai-free",
    "bertha-",
    "divi-ssa",
    "divi-side",
    "admin-bar-js",
    "elementor-admin-bar",
    "contact-form-7-js",
    "wp-api-fetch-js-after",
  ].some((marker) => value.includes(marker));
}

function removeElementById(source, id) {
  const opener = new RegExp(`<div\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i").exec(source);
  if (!opener || opener.index === undefined) return source;
  const tokenPattern = /<\/?div\b[^>]*>/gi;
  tokenPattern.lastIndex = opener.index;
  let depth = 0;
  let token;
  while ((token = tokenPattern.exec(source))) {
    depth += /^<\/div/i.test(token[0]) ? -1 : 1;
    if (depth === 0) return source.slice(0, opener.index) + source.slice(tokenPattern.lastIndex);
  }
  throw new Error(`Unable to remove complete #${id} element`);
}

let changedPages = 0;
for (const page of Object.values(manifest.pages)) {
  const filePath = path.join(publicRoot, page.output.replace(/^\/+/, ""));
  const source = await readFile(filePath, "utf8");
  const normalized = normalizeDocument(source);
  if (/localhost:8882/i.test(normalized)) {
    throw new Error(`Studio origin remains after normalization: ${filePath}`);
  }
  if (/(?:\/wp-admin\/|\/wp-json\/|xmlrpc\.php|id=["']wpadminbar["']|bertha-ai-free)/i.test(normalized)) {
    throw new Error(`WordPress control-plane reference remains after normalization: ${filePath}`);
  }
  if (normalized !== source) {
    await writeFile(filePath, normalized);
    changedPages += 1;
  }
  page.bytes = Buffer.byteLength(normalized);
  page.sha256 = createHash("sha256").update(normalized).digest("hex");
}

manifest.normalizedAt = new Date().toISOString();
manifest.normalization = {
  studioOriginsRemoved: true,
  captureQueryRemoved: true,
  authenticatedAdminMarkupRemoved: true,
  editorRuntimeRemoved: true,
  wordpressDiscoveryRemoved: true,
  wordpressControlEndpointsDisabled: true,
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Normalized ${changedPages} of ${Object.keys(manifest.pages).length} snapshot pages.\n`);
