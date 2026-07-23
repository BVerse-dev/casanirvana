import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Guards has one canonical grid-default backend directory", async () => {
  const source = await read("../src/app/(admin)/guards/components/GuardDirectory.tsx");
  assert.match(source, /useDirectoryView\("guards"\)/);
  assert.match(source, /useListGuardsDirectory\(\{ page, pageSize: PAGE_SIZE, search, status \}\)/);
  assert.match(source, /href="\/guards\/manage"/);
});

test("guard profile API exposes normalized pagination without losing scoped enrichment", async () => {
  const source = await read("../../api/src/controllers/adminGuardsOperations.ts");
  assert.match(source, /count: filteredRows\.length/);
  assert.match(source, /totalPages: filteredRows\.length/);
  assert.match(source, /resolved_community_name/);
  assert.match(source, /getScopedGuardIds\(scope\)/);
});

test("legacy guard view routes redirect and sidebar has one directory entry", async () => {
  const grid = await read("../src/app/(admin)/guards/grid-view/page.tsx");
  const list = await read("../src/app/(admin)/guards/list-view/page.tsx");
  const menu = await read("../src/assets/data/menu-items.ts");
  assert.match(grid, /permanentRedirect\("\/guards\?view=grid"\)/);
  assert.match(list, /permanentRedirect\("\/guards\?view=list"\)/);
  assert.match(menu, /key: "guards-directory"[\s\S]*?url: "\/guards"/);
  assert.doesNotMatch(menu, /url: "\/guards\/(?:grid-view|list-view)"/);
});
