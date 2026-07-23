import assert from "node:assert/strict";
import test from "node:test";

import { buildSuperadminRouteAudit } from "./superadmin-route-audit.mjs";

test("the Superadmin route inventory is complete and unique", async () => {
  const audit = await buildSuperadminRouteAudit();
  const routeNames = audit.routes.map((route) => route.route);

  assert.equal(audit.summary.filesystemRoutes, routeNames.length);
  assert.equal(new Set(routeNames).size, routeNames.length);
  assert.equal(audit.summary.filesystemRoutes, 245, "Update the tracked compatibility inventory intentionally when route dispositions change");
});

test("every sidebar destination resolves to a filesystem route", async () => {
  const audit = await buildSuperadminRouteAudit();
  assert.deepEqual(audit.unresolvedMenuUrls, []);
});

test("the six directory families have a canonical migration target", async () => {
  const audit = await buildSuperadminRouteAudit();
  assert.deepEqual(audit.canonicalResources, {
    agency: "/agencies",
    communities: "/communities",
    guards: "/guards",
    property: "/units",
    residents: "/residents",
    visitors: "/visitors",
  });
});
