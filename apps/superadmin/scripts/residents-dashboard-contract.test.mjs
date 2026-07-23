import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const directory = path.resolve("src/app/(admin)/dashboards/agent");
const read = (file) => readFile(path.join(directory, file), "utf8");

test("residents dashboard uses the resident product identity", async () => {
  const page = await read("page.tsx");
  assert.match(page, /Residents Dashboard/);
  assert.match(page, /ResidentOnboarding/);
  assert.doesNotMatch(page, /Guards Dashboard/);
});

test("resident roster never substitutes stock people for missing profile photos", async () => {
  const [recent, latest, avatar] = await Promise.all([
    read("components/JoinAgent.tsx"),
    read("components/TopAgents.tsx"),
    read("components/ResidentAvatar.tsx"),
  ]);
  assert.doesNotMatch(recent, /avatar-1\.jpg|avatar-2\.jpg/);
  assert.doesNotMatch(latest, /avatar-1\.jpg|avatar-2\.jpg|Featured Resident/);
  assert.match(avatar, /profile initials/);
});

test("dashboard routes default to grid workspaces and use truthful collection labels", async () => {
  const [recent, communities, payments, collections] = await Promise.all([
    read("components/JoinAgent.tsx"),
    read("components/SessionsCountry.tsx"),
    read("components/CollectionRent.tsx"),
    read("components/TotalRevenue.tsx"),
  ]);
  assert.match(recent, /href="\/residents\/grid-view"/);
  assert.match(communities, /href="\/communities\/grid"/);
  assert.match(payments, /Total Obligations Due/);
  assert.match(collections, /Resident Collections/);
  assert.doesNotMatch(collections, /Resident Revenue|Revenue Sources/);
});
