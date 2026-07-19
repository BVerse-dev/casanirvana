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

const publicAssetAliases = [
  ["/wp-content/uploads/2025/03/bg-ss1-h3.webp", "/assets/legacy/bg-ss1-h3.webp"],
  ["/wp-content/uploads/2025/03/Vector.png", "/assets/legacy/vector.png"],
  ["/wp-content/uploads/2025/03/pattern-h3.webp", "/assets/legacy/pattern-h3.webp"],
  ["/wp-content/uploads/2025/03/bg-qr-h3.png", "/assets/legacy/bg-qr-h3.png"],
  ["/wp-content/uploads/2025/03/Pattern_bg.png", "/assets/legacy/pattern-bg.png"],
  ["/wp-content/uploads/2025/04/bg-last-7.webp", "/assets/legacy/bg-last-7.webp"],
  ["/wp-content/uploads/2025/05/pattern1221.png", "/assets/legacy/pattern1221.png"],
];

function normalizeDocument(source) {
  let output = source;
  for (const origin of studioOrigins) output = output.replaceAll(origin, "");
  for (const [sourcePath, publicPath] of publicAssetAliases) {
    output = output.replaceAll(sourcePath, publicPath);
    output = output.replaceAll(sourcePath.replaceAll("/", "\\/"), publicPath.replaceAll("/", "\\/"));
  }
  output = output
    .replaceAll("/wp-content/uploads/", "/assets/uploads/")
    .replaceAll("\\/wp-content\\/uploads\\/", "\\/assets\\/uploads\\/");
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
  if (!/<h1\b/i.test(output)) {
    output = output.replace(
      /<(h[2-6])\b([^>]*)>([\s\S]*?)<\/\1>/i,
      (_tag, _level, attributes, content) => `<h1${attributes}>${content}</h1>`,
    );
  }
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
  if (!output.includes('href="/icon.svg"')) {
    output = output.replace(/<\/head>/i, '<link rel="icon" href="/icon.svg" type="image/svg+xml"></head>');
  }
  return output;
}

function shouldRemoveLink(tag) {
  const value = tag.toLowerCase();
  return [
    "admin-bar",
    "dashicons",
    "bertha-ai-free",
    "/wp-content/plugins/contact-form-7/",
    "/wp-content/plugins/duplicate-post/",
    "/wp-content/plugins/litespeed-cache/",
    "/wp-content/plugins/woocommerce/",
    "/wp-content/plugins/wordpress-seo/",
    "/wp-content/plugins/wp-optimize/",
    "/wp-content/plugins/elementor/assets/css/common.min.css",
    "/wp-content/plugins/elementor/assets/css/theme-light.min.css",
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
    "/wp-includes/js/dist/",
    "/wp-includes/js/underscore.min.js",
    "/wp-includes/js/backbone.min.js",
    "/wp-includes/js/api-request.min.js",
    "/wp-includes/js/hoverintent-js.min.js",
    "/wp-content/plugins/contact-form-7/",
    "/wp-content/plugins/woocommerce/",
    "/wp-content/plugins/elementor/assets/lib/backbone/",
    "/wp-content/plugins/elementor/assets/lib/dialog/",
    "/wp-content/plugins/elementor/assets/js/common-modules.min.js",
    "/wp-content/plugins/elementor/assets/js/common.min.js",
    "/wp-content/plugins/elementor/assets/js/web-cli.min.js",
    "/wp-content/plugins/elementor/assets/js/dev-tools.min.js",
    "/wp-content/plugins/elementor/assets/js/app-loader.min.js",
    "/wp-content/themes/saliver/woocommerce/",
    "wp-i18n-js-after",
    "wp-data-js-after",
    "moment-js-after",
    "wp-date-js-after",
    "wp-preferences-js-after",
    "wp-editor-js-after",
    "_wpemojisettings",
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
