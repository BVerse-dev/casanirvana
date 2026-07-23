import { access, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  buildSuperadminRouteAudit,
  renderInitialChecklist,
  repositoryRoot,
} from "./superadmin-route-audit.mjs";

const audit = await buildSuperadminRouteAudit();
const manifestPath = join(repositoryRoot, "SUPERADMIN_ROUTE_MANIFEST.json");
const checklistPath = join(repositoryRoot, "SUPERADMIN_LAUNCH_AUDIT_CHECKLIST.md");

await writeFile(manifestPath, `${JSON.stringify(audit, null, 2)}\n`);

if (process.argv.includes("--init-checklist")) {
  try {
    await access(checklistPath);
    throw new Error(`Refusing to overwrite existing checklist: ${checklistPath}`);
  } catch (error) {
    if (error && error.code !== "ENOENT") throw error;
    await writeFile(checklistPath, renderInitialChecklist(audit));
  }
}

console.log(
  `Superadmin route manifest: ${audit.summary.filesystemRoutes} routes, ${audit.summary.menuDestinations} menu destinations, ${audit.summary.unresolvedMenuDestinations} unresolved menu destinations.`,
);
