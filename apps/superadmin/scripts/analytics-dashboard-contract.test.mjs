import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const componentDirectory = path.resolve("src/app/(admin)/dashboards/analytics/components");
const readComponent = (name) => readFile(path.join(componentDirectory, `${name}.tsx`), "utf8");

test("analytics dashboard contains no template property carousel or internal QA actions", async () => {
  const [weekly, balance] = await Promise.all([readComponent("WeeklySales"), readComponent("BalanceCard")]);
  assert.doesNotMatch(weekly, /properties\d|Carousel|alt="img-/);
  assert.doesNotMatch(balance, /Ledger Action Pending|Runtime QA Later/);
});

test("resident distribution uses scoped percentages without an unsupported world map", async () => {
  const distribution = await readComponent("SalesLocation");
  assert.doesNotMatch(distribution, /WorldVectorMap|map:\s*"world"|coordinates unavailable/i);
  assert.match(distribution, /community\.percentage/);
  assert.match(distribution, /useAdminAnalyticsDashboard/);
});

test("dashboard links resolve to active Casa Nirvana workspaces", async () => {
  const [visitors, payments, distribution] = await Promise.all([
    readComponent("SocialSource"),
    readComponent("Transaction"),
    readComponent("SalesLocation"),
  ]);
  assert.match(visitors, /href="\/visitors\/grid-view"/);
  assert.match(payments, /href="\/payments"/);
  assert.match(distribution, /href="\/communities\/grid"/);
});
