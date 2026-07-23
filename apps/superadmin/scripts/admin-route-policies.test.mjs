import assert from "node:assert/strict";
import test from "node:test";
import {
  guardedRoutePolicyCount,
  isAdminRouteAuthorized,
  resolveAdminRoutePolicy,
} from "../src/config/admin-route-policies.ts";

const search = (value) => new URLSearchParams(value);

test("guard and agency route families are centrally covered", () => {
  assert.ok(guardedRoutePolicyCount >= 21);
  assert.equal(resolveAdminRoutePolicy("/guards/details", search(""))?.capability, "guards:workspace:view");
  assert.equal(resolveAdminRoutePolicy("/agency/details", search(""))?.capability, "agency:workspace:view");
  assert.equal(resolveAdminRoutePolicy("/agencies/example/edit", search(""))?.capability, "agency:workspace:view");
});

test("specialized routes require their exact capability", () => {
  assert.equal(resolveAdminRoutePolicy("/guards/schedules", search(""))?.capability, "guards:schedules:view");
  assert.equal(resolveAdminRoutePolicy("/agency/finance", search(""))?.capability, "agency:finance:view");
  assert.equal(resolveAdminRoutePolicy("/guards/manage", search("tab=training"))?.capability, "guards:training:view");
  assert.equal(resolveAdminRoutePolicy("/agency/manage", search("tab=documents"))?.capability, "agency:documents:view");
});

test("unknown workspace tabs fall back to the parent workspace capability", () => {
  assert.equal(resolveAdminRoutePolicy("/guards/manage", search("tab=unknown"))?.capability, "guards:workspace:view");
  assert.equal(resolveAdminRoutePolicy("/agency/manage", search("tab=unknown"))?.capability, "agency:workspace:view");
});

test("authorization denies missing capabilities without affecting unrelated routes", () => {
  const guardPolicy = resolveAdminRoutePolicy("/guards/assignments", search(""));
  assert.equal(isAdminRouteAuthorized(guardPolicy, ["guards:assignments:view"]), true);
  assert.equal(isAdminRouteAuthorized(guardPolicy, ["guards:profiles:view"]), false);
  assert.equal(isAdminRouteAuthorized(resolveAdminRoutePolicy("/payments", search("")), []), true);
  assert.equal(resolveAdminRoutePolicy("/guardsman", search("")), null);
});
