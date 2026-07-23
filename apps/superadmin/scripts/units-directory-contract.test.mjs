import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../src/", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("units uses one grid-default directory and backend query", async () => {
  const directory = await read("app/(admin)/units/components/UnitDirectory.tsx");
  assert.match(directory, /useDirectoryView\("units"\)/);
  assert.match(directory, /view === "grid"/);
  assert.equal((directory.match(/useListUnits\(/g) || []).length, 1);
  assert.doesNotMatch(directory, /mapUnitToPropertyImage|\$\{unit\.rent_amount/);
});

test("units uses canonical index, detail and create routes", async () => {
  const [directory, menu] = await Promise.all([read("app/(admin)/units/components/UnitDirectory.tsx"), read("assets/data/menu-items.ts")]);
  assert.match(directory, /`\/units\/\$\{unit\.id\}`/);
  assert.match(directory, /href="\/units\/add"/);
  assert.match(menu, /key: "units-directory"[\s\S]*?url: "\/units"/);
  assert.doesNotMatch(menu, /label: "Units (Grid|List)"/);
});

test("legacy property routes redirect to canonical units routes", async () => {
  const [grid, list, details, add] = await Promise.all([read("app/(admin)/property/grid/page.tsx"), read("app/(admin)/property/list/page.tsx"), read("app/(admin)/property/details/page.tsx"), read("app/(admin)/property/add/page.tsx")]);
  assert.match(grid, /permanentRedirect\(`\/units\?/);
  assert.match(list, /permanentRedirect\(`\/units\?/);
  assert.match(details, /`\/units\/\$\{searchParams\.id\}`/);
  assert.match(add, /permanentRedirect\("\/units\/add"\)/);
});

test("canonical unit creation renders the form without redirecting", async () => {
  const add = await read("app/(admin)/units/add/page.tsx");
  assert.match(add, /UnitAddForm/);
  assert.doesNotMatch(add, /Redirect|redirect/);
});

test("unit details remain backend-owned and scope-aware", async () => {
  const details = await read("app/(admin)/units/components/UnitDetails.tsx");
  assert.match(details, /useGetUnit\(unitId\)/);
  assert.match(details, /outside your authorized scope/);
  assert.doesNotMatch(details, /maps\.google|iframe/);
});
