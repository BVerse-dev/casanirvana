import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sqlPath = resolve(process.argv[2] || `${root}/wordpress/sql/studio-backup-db-export-2026-07-15-13-56-31.sql`);
const outputPath = resolve(process.argv[3] || `${root}/apps/marketing-web/reference/wordpress-parity.generated.json`);
const approvedSlugs = new Set(['home-03', 'about-us', 'core-features', 'pricing-plans', 'faqs', 'contact-us', 'our-products', 'residents', 'security-guards', 'facility-managers', 'marketplace']);
const trackedMetaKeys = new Set(['_elementor_data', '_elementor_page_settings', 'header_layout', 'footer_layout']);
const trackedOptionKeys = new Set(['home', 'siteurl', 'show_on_front', 'page_on_front', 'stylesheet', 'template', 'elementor_active_kit']);
const comparisonViewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'smallDesktop', width: 1280, height: 800 },
  { name: 'tabletLandscape', width: 1024, height: 768 },
  { name: 'tabletPortrait', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
  { name: 'smallMobile', width: 360, height: 800 },
];

if (!existsSync(sqlPath)) throw new Error(`WordPress SQL export not found: ${sqlPath}`);

function parseTuple(line) {
  const start = line.indexOf('VALUES (');
  if (start < 0) return [];
  const source = line.slice(start + 8, line.lastIndexOf(');'));
  const values = [];
  let value = '';
  let quoted = false;
  let escaped = false;
  for (const character of source) {
    if (escaped) {
      const mapped = { n: '\n', r: '\r', t: '\t', 0: '\0' }[character];
      value += mapped ?? character;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === "'") {
      quoted = !quoted;
    } else if (character === ',' && !quoted) {
      values.push(value === 'NULL' ? null : value);
      value = '';
    } else {
      value += character;
    }
  }
  values.push(value === 'NULL' ? null : value);
  return values;
}

function parseJson(value, fallback = null) {
  if (typeof value !== 'string' || !value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function compact(value) {
  if (Array.isArray(value)) {
    const values = value.map(compact).filter((item) => item !== undefined);
    return values.length ? values : undefined;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compact(item)])
      .filter(([, item]) => item !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}

function normalizeAsset(asset) {
  const normalized = asset.replaceAll('\\/', '/');
  try {
    const url = new URL(normalized);
    return { sourceUrl: normalized, pathname: decodeURIComponent(url.pathname) };
  } catch {
    return { sourceUrl: normalized, pathname: normalized };
  }
}

function collectStrings(value, visit) {
  if (typeof value === 'string') visit(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, visit));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, visit));
}

function summarizeElementor(value) {
  const tree = parseJson(value);
  if (!Array.isArray(tree)) return { parsed: false, hierarchy: [], sectionOrder: [], widgets: [], assets: [], responsiveSettings: [], animations: [], colors: [], fonts: [] };

  const widgets = new Set();
  const assets = new Map();
  const responsiveSettings = new Set();
  const animations = new Set();
  const colors = new Set();
  const fonts = new Set();
  const settingKeys = new Set();
  const assetPattern = /https?:\\?\/\\?\/[^"'<> ]+?\.(?:png|jpe?g|webp|svg|gif|woff2?|ttf|otf)(?:\?[^"'<> ]*)?/gi;
  const colorPattern = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)/gi;

  function mapElement(element) {
    const settings = compact(element.settings || {}) || {};
    for (const [key, setting] of Object.entries(settings)) {
      settingKeys.add(key);
      if (/(?:_tablet|_mobile)$/.test(key)) responsiveSettings.add(key);
      if (/animation/i.test(key)) collectStrings(setting, (item) => animations.add(`${key}:${item}`));
      if (/font|typography/i.test(key)) collectStrings(setting, (item) => fonts.add(`${key}:${item}`));
    }
    collectStrings(settings, (item) => {
      for (const match of item.match(assetPattern) || []) {
        const asset = normalizeAsset(match);
        assets.set(asset.sourceUrl, asset);
      }
      for (const match of item.match(colorPattern) || []) colors.add(match.toLowerCase());
    });
    if (element.widgetType) widgets.add(element.widgetType);
    return {
      id: element.id || null,
      elType: element.elType || null,
      widgetType: element.widgetType || null,
      isInner: Boolean(element.isInner),
      settings,
      elements: (element.elements || []).map(mapElement),
    };
  }

  return {
    parsed: true,
    hierarchy: tree.map(mapElement),
    sectionOrder: tree.map((element) => element.id).filter(Boolean),
    widgets: [...widgets].sort(),
    settingKeys: [...settingKeys].sort(),
    responsiveSettings: [...responsiveSettings].sort(),
    animations: [...animations].sort(),
    colors: [...colors].sort(),
    fonts: [...fonts].sort(),
    assets: [...assets.values()].sort((left, right) => left.pathname.localeCompare(right.pathname)),
  };
}

const posts = new Map();
const approvedPages = new Map();
const meta = new Map();
const options = {};
const lines = createInterface({ input: createReadStream(sqlPath), crlfDelay: Infinity });

for await (const line of lines) {
  if (line.startsWith('INSERT INTO `wp_posts`')) {
    const row = parseTuple(line);
    const [id, , , , , title, , status, , , , slug, , , , , , parent, , menuOrder, postType] = row;
    const post = { id: Number(id), title, slug, status, postType, parentId: Number(parent) || null, menuOrder: Number(menuOrder) || 0 };
    posts.set(post.id, post);
    if (postType === 'page' && approvedSlugs.has(String(slug))) approvedPages.set(post.id, post);
  } else if (line.startsWith('INSERT INTO `wp_postmeta`')) {
    const row = parseTuple(line);
    const postId = Number(row[1]);
    const key = String(row[2]);
    if (trackedMetaKeys.has(key)) {
      if (!meta.has(postId)) meta.set(postId, {});
      meta.get(postId)[key] = row[3];
    }
  } else if (line.startsWith('INSERT INTO `wp_options`')) {
    const row = parseTuple(line);
    if (trackedOptionKeys.has(String(row[1]))) options[row[1]] = row[2];
  }
}

const homePage = [...approvedPages.values()].find((page) => page.slug === 'home-03');
const homeMeta = meta.get(homePage?.id) || {};
const defaultHeaderId = Number(homeMeta.header_layout) || null;
const defaultFooterId = Number(homeMeta.footer_layout) || null;

function resolveLayoutId(value, fallback) {
  const id = Number(value);
  return id > 0 ? id : fallback;
}

function buildTemplate(id, kind) {
  if (!id) return null;
  const post = posts.get(id) || { id, title: null, slug: null, status: null, postType: null, parentId: null, menuOrder: 0 };
  const postMeta = meta.get(id) || {};
  return {
    kind,
    ...post,
    pageSettings: parseJson(postMeta._elementor_page_settings, postMeta._elementor_page_settings || null),
    elementor: summarizeElementor(postMeta._elementor_data),
  };
}

const activeKitId = Number(options.elementor_active_kit) || null;
const activeKitMeta = meta.get(activeKitId) || {};
const manifest = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  source: sqlPath.replace(`${root}/`, ''),
  options,
  comparisonViewports,
  activeKit: activeKitId ? {
    id: activeKitId,
    post: posts.get(activeKitId) || null,
    pageSettings: parseJson(activeKitMeta._elementor_page_settings, activeKitMeta._elementor_page_settings || null),
  } : null,
  sharedLayouts: {
    header: buildTemplate(defaultHeaderId, 'header'),
    footer: buildTemplate(defaultFooterId, 'footer'),
  },
  pages: [...approvedPages.values()].map((page) => {
    const pageMeta = meta.get(page.id) || {};
    return {
      ...page,
      route: page.slug === 'home-03' ? '/' : `/${page.slug}`,
      headerId: resolveLayoutId(pageMeta.header_layout, defaultHeaderId),
      footerId: resolveLayoutId(pageMeta.footer_layout, defaultFooterId),
      sourceHeaderId: Number(pageMeta.header_layout) || null,
      sourceFooterId: Number(pageMeta.footer_layout) || null,
      pageSettings: parseJson(pageMeta._elementor_page_settings, pageMeta._elementor_page_settings || null),
      elementor: summarizeElementor(pageMeta._elementor_data),
    };
  }).sort((left, right) => left.id - right.id),
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write(`Wrote ${manifest.pages.length} approved WordPress pages plus shared layouts to ${outputPath}\n`);
