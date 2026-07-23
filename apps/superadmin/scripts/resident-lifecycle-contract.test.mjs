import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("canonical resident profile and edit routes use backend hooks", async () => {
  const profile = await read("../src/app/(admin)/residents/components/ResidentProfile.tsx");
  const edit = await read("../src/app/(admin)/residents/components/ResidentEdit.tsx");
  assert.match(profile, /useGetResident\(residentId\)/);
  assert.match(profile, /`\/residents\/\$\{resident\.id\}\/edit`/);
  assert.match(edit, /useGetResident\(residentId\)/);
  assert.doesNotMatch(profile + edit, /supabase/i);
});

test("resident form saves and returns through canonical routes", async () => {
  const form = await read("../src/app/(admin)/residents/add/components/ResidentAdd_Enhanced.tsx");
  assert.match(form, /router\.push\(`\/residents\/\$\{residentId\}`\)/);
  assert.match(form, /router\.push\(`\/residents\/\$\{createdResident\.id\}`\)/);
  assert.match(form, /id="resident-form"/);
});

test("legacy resident detail and edit URLs redirect intentionally", async () => {
  const details = await read("../src/app/(admin)/residents/details/page.tsx");
  const edit = await read("../src/app/(admin)/residents/edit/page.tsx");
  assert.match(details, /permanentRedirect/);
  assert.match(edit, /permanentRedirect/);
});
