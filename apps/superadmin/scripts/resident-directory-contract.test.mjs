import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("Residents has one canonical grid-default directory", async () => {
  const source = await read("../src/app/(admin)/residents/components/ResidentDirectory.tsx");
  assert.match(source, /useDirectoryView\("residents"\)/);
  assert.match(source, /useListResidents\(\{ page, pageSize: PAGE_SIZE, search, status \}\)/);
  assert.match(source, /view === "grid"/);
  assert.doesNotMatch(source, /pageSize: 200/);
});

test("legacy resident view routes are intentional compatibility redirects", async () => {
  const grid = await read("../src/app/(admin)/residents/grid-view/page.tsx");
  const list = await read("../src/app/(admin)/residents/list-view/page.tsx");
  assert.match(grid, /permanentRedirect\("\/residents\?view=grid"\)/);
  assert.match(list, /permanentRedirect\("\/residents\?view=list"\)/);
});

test("sidebar exposes one resident directory destination", async () => {
  const menu = await read("../src/assets/data/menu-items.ts");
  assert.match(menu, /key: "residents-directory"[\s\S]*?url: "\/residents"/);
  assert.doesNotMatch(menu, /url: "\/residents\/(?:grid-view|list-view)"/);
});
