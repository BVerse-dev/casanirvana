import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const componentRoot = new URL("../src/app/(admin)/dashboards/customer/components/", import.meta.url);
const pageUrl = new URL("../src/app/(admin)/dashboards/customer/page.tsx", import.meta.url);

const readComponent = (name) => readFile(new URL(name, componentRoot), "utf8");

test("guards dashboard does not ship template imagery or an unsupported map", async () => {
  const sources = await Promise.all([
    readComponent("CustomerCountry.tsx"),
    readComponent("CustomerByCountry.tsx"),
    readComponent("PropertyInvestor.tsx"),
    readComponent("PurchaseProperty.tsx"),
    readComponent("TopCustomer.tsx"),
  ]);
  const source = sources.join("\n");
  assert.doesNotMatch(source, /WorldVectorMap|mapSocietyToPropertyImage|avatar-[0-9]+\.jpg/);
  assert.match(source, /Community Guard Coverage/);
  assert.match(source, /GuardAvatar/);
});

test("guards dashboard exposes truthful failure and empty states", async () => {
  const sources = await Promise.all([
    readComponent("CustomerCountry.tsx"),
    readComponent("CustomerByCountry.tsx"),
    readComponent("PropertyInvestor.tsx"),
    readComponent("PurchaseProperty.tsx"),
    readComponent("TopCustomer.tsx"),
    readComponent("CustomerVisit.tsx"),
  ]);
  const source = sources.join("\n");
  assert.match(source, /isError|trendsError/);
  assert.match(source, /No community guard staffing records are available/);
  assert.match(source, /No guard assignments have been created yet/);
});

test("guards dashboard has no dead layout row and uses active guard destinations", async () => {
  const page = await readFile(pageUrl, "utf8");
  const sources = await Promise.all([readComponent("CustomerByCountry.tsx"), readComponent("TopCustomer.tsx")]);
  assert.doesNotMatch(page, /<Col lg=\{6\}><\/Col>/);
  assert.doesNotMatch(sources.join("\n"), /guards\/(details\?id|list-view)/);
  assert.match(sources.join("\n"), /guards\/grid-view/);
});
