import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
export const appRoot = resolve(scriptDirectory, "..");
export const repositoryRoot = resolve(appRoot, "../..");

const pageRoot = join(appRoot, "src", "app");
const sourceRoot = join(appRoot, "src");
const menuFile = join(sourceRoot, "assets", "data", "menu-items.ts");

const retiredPrefixes = new Set([
  "advanced-ul",
  "agents",
  "base-ui",
  "charts",
  "customers",
  "direct-api-test",
  "forms",
  "icons",
  "maps",
  "pages",
  "reviews",
  "tables",
  "transactions",
  "widgets",
]);

const canonicalResources = {
  agency: "/agencies",
  communities: "/communities",
  guards: "/guards",
  property: "/units",
  residents: "/residents",
  visitors: "/visitors",
};

const normalizePath = (value) => {
  if (!value || !value.startsWith("/")) return value;
  const path = value.split(/[?#]/, 1)[0].replace(/\/+$/, "");
  return path || "/";
};

const walk = async (directory, predicate) => {
  const entries = await readdir(directory, { withFileTypes: true });
  const paths = [];

  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".next") continue;
    const absolutePath = join(directory, entry.name);
    if (entry.isDirectory()) paths.push(...(await walk(absolutePath, predicate)));
    else if (predicate(absolutePath)) paths.push(absolutePath);
  }

  return paths;
};

const toRoute = (pageFile) => {
  const segments = relative(pageRoot, dirname(pageFile))
    .split(sep)
    .filter(Boolean)
    .filter((segment) => !(segment.startsWith("(") && segment.endsWith(")")))
    .map((segment) => {
      if (/^\[\[\.\.\..+\]\]$/.test(segment)) return `*${segment.slice(5, -2)}`;
      if (/^\[\.\.\..+\]$/.test(segment)) return `*${segment.slice(4, -1)}`;
      if (/^\[.+\]$/.test(segment)) return `:${segment.slice(1, -1)}`;
      return segment;
    });

  return segments.length ? `/${segments.join("/")}` : "/";
};

const routePattern = (route) => {
  const escaped = route
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) return "[^/]+";
      if (segment.startsWith("*")) return ".+";
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return new RegExp(`^${escaped}/?$`);
};

const routeExists = (path, routePatterns) =>
  routePatterns.some(({ pattern }) => pattern.test(path));

const classifyRoute = (route) => {
  const firstSegment = route.split("/").filter(Boolean)[0] || "root";
  if (retiredPrefixes.has(firstSegment)) return "retire";
  if (firstSegment === "property" || firstSegment === "agency") return "legacy_redirect";
  if (/\/(grid|list|grid-view|list-view)$/.test(route)) return "legacy_redirect";
  return "product_audit";
};

const plannedCanonical = (route) => {
  const segments = route.split("/").filter(Boolean);
  const resource = canonicalResources[segments[0]];
  if (!resource) return null;

  const view = segments.at(-1);
  if (view === "grid" || view === "grid-view") return `${resource}?view=grid`;
  if (view === "list" || view === "list-view") return `${resource}?view=list`;
  if (segments[0] === "property") return route.replace(/^\/property/, resource);
  if (segments[0] === "agency") return route.replace(/^\/agency/, resource);
  return resource;
};

const extractMenuUrls = async () => {
  const content = await readFile(menuFile, "utf8");
  return [...content.matchAll(/\burl:\s*["']([^"']+)["']/g)].map((match) => match[1]);
};

const extractInternalLinks = async () => {
  const files = await walk(sourceRoot, (path) => /\.(?:ts|tsx)$/.test(path));
  const links = [];
  const emptyLinks = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const patterns = [
      /\bhref\s*=\s*["']([^"']*)["']/g,
      /\b(?:push|replace)\(\s*["']([^"']*)["']/g,
    ];

    for (const pattern of patterns) {
      for (const match of content.matchAll(pattern)) {
        const value = match[1];
        const record = { file: relative(repositoryRoot, file), value };
        if (!value) emptyLinks.push(record);
        else if (value.startsWith("/")) links.push(record);
      }
    }
  }

  return { links, emptyLinks };
};

export const buildSuperadminRouteAudit = async () => {
  const pageFiles = await walk(pageRoot, (path) => path.endsWith(`${sep}page.tsx`));
  const menuUrls = await extractMenuUrls();
  const { links, emptyLinks } = await extractInternalLinks();
  const routes = pageFiles
    .map((file) => ({ route: toRoute(file), file: relative(repositoryRoot, file) }))
    .sort((left, right) => left.route.localeCompare(right.route));
  const routePatterns = routes.map(({ route }) => ({ route, pattern: routePattern(route) }));
  const normalizedMenuUrls = [...new Set(menuUrls.map(normalizePath))].sort();
  const unresolvedMenuUrls = normalizedMenuUrls.filter(
    (url) => url && !routeExists(url, routePatterns),
  );
  const internalRouteLinks = links.map((link) => ({ ...link, path: normalizePath(link.value) }));
  const unresolvedInternalLinks = internalRouteLinks.filter(
    ({ path }) => path && !routeExists(path, routePatterns),
  );
  const menuUrlSet = new Set(normalizedMenuUrls);
  const internalCounts = new Map();

  for (const { path } of internalRouteLinks) {
    internalCounts.set(path, (internalCounts.get(path) || 0) + 1);
  }

  const routeLedger = routes.map((record) => {
    const firstSegment = record.route.split("/").filter(Boolean)[0] || "root";
    return {
      ...record,
      area: firstSegment,
      menuReferenced: menuUrlSet.has(record.route),
      internalReferenceCount: internalCounts.get(record.route) || 0,
      disposition: classifyRoute(record.route),
      plannedCanonical: plannedCanonical(record.route),
      backendDependency: "TBD during page audit",
      databaseDependency: "TBD during page audit",
      roleCoverage: "platform, agency-scoped, community-scoped",
      status: "not_started",
      blockers: [],
      evidence: [],
    };
  });

  const countsByArea = routeLedger.reduce((counts, route) => {
    counts[route.area] = (counts[route.area] || 0) + 1;
    return counts;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    applicationRoot: "apps/superadmin",
    baselineRouteCount: 242,
    summary: {
      filesystemRoutes: routeLedger.length,
      menuDestinations: normalizedMenuUrls.length,
      unresolvedMenuDestinations: unresolvedMenuUrls.length,
      internalLiteralLinks: internalRouteLinks.length,
      unresolvedInternalLiteralLinks: unresolvedInternalLinks.length,
      emptyLiteralLinks: emptyLinks.length,
      countsByArea,
    },
    canonicalResources,
    retiredPrefixes: [...retiredPrefixes].sort(),
    menuUrls: normalizedMenuUrls,
    unresolvedMenuUrls,
    unresolvedInternalLinks,
    emptyLinks,
    routes: routeLedger,
  };
};

const escapeCell = (value) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");

export const renderInitialChecklist = (audit) => {
  const routeRows = audit.routes.map((route) =>
    `| \`${escapeCell(route.route)}\` | ${escapeCell(route.area)} | ${route.menuReferenced ? "Yes" : "No"} | ${escapeCell(route.disposition)} | ${escapeCell(route.plannedCanonical || "-")} | ${escapeCell(route.backendDependency)} | ${escapeCell(route.databaseDependency)} | ${escapeCell(route.roleCoverage)} | ${escapeCell(route.status)} | - | - |`,
  );

  return `# Superadmin Launch Audit Checklist\n\n## Operating rules\n\n- Baseline: ${audit.summary.filesystemRoutes} filesystem routes discovered on 23 July 2026.\n- The machine-readable source is \`SUPERADMIN_ROUTE_MANIFEST.json\`.\n- Work in sidebar order and one vertical slice at a time.\n- Mark a route complete only after backend/data, authorization, responsive, accessibility, build and production evidence is recorded.\n- Preserve the current visual system; correct organization, truthfulness, usability, routing and security defects without redesigning the product.\n- SMTP-dependent checks remain deferred until credentials are supplied.\n\n## Phase sequence\n\n- [x] Foundation: monorepo path reconciliation and initial 241-route inventory.\n- [ ] Application shell and authentication/authorization boundary.\n- [ ] Dashboards.\n- [ ] Community Management.\n- [ ] People.\n- [ ] Operations.\n- [ ] Communication.\n- [ ] Personal Hub.\n- [ ] Notifications and Notices.\n- [ ] Settings.\n- [ ] Inherited, hidden and legacy routes.\n- [ ] Phase 53 backend/database release hardening.\n- [ ] Phase 54 Resident mobile launch audit.\n- [ ] Phase 55 Guard mobile launch audit.\n\n## Route ledger\n\n| Route | Area | Menu | Disposition | Planned canonical route | Backend dependency | Database dependency | Role coverage | Status | Blockers | Evidence |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${routeRows.join("\n")}\n\n## Session history\n\n### 2026-07-23 - Phase 52 foundation\n\n- [x] Confirmed the active monorepo application root is \`apps/superadmin\`.\n- [x] Confirmed root scripts, CI cache paths, split-repository prefixes and database-type synchronization use the new monorepo paths.\n- [x] Generated the initial route, menu and internal-link manifest.\n- [x] Added a route-contract test before canonical navigation changes.\n- [ ] Begin the Application Shell slice after foundation verification is committed and deployed.\n`;
};
