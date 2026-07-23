import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../src/", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("communities has one canonical grid-default directory", async () => {
  const [page, directory, hook] = await Promise.all([
    read("app/(admin)/communities/page.tsx"),
    read("app/(admin)/communities/components/CommunityDirectory.tsx"),
    read("hooks/useDirectoryView.ts"),
  ]);
  assert.match(page, /CommunityDirectory/);
  assert.match(directory, /useDirectoryView\("communities"\)/);
  assert.match(directory, /view === "grid"/);
  assert.match(hook, /DirectoryViewMode = "grid" \| "list"/);
  assert.match(hook, /localStorage/);
});

test("legacy directory routes preserve query state and redirect canonically", async () => {
  const [grid, list] = await Promise.all([
    read("app/(admin)/communities/grid/page.tsx"),
    read("app/(admin)/communities/list/page.tsx"),
  ]);
  assert.match(grid, /permanentRedirect\(`\/communities\?\$\{params\.toString\(\)\}`\)/);
  assert.match(list, /permanentRedirect\(`\/communities\?\$\{params\.toString\(\)\}`\)/);
  assert.match(grid, /view: "grid"/);
  assert.match(list, /view: "list"/);
});

test("sidebar exposes one Communities directory destination", async () => {
  const menu = await read("assets/data/menu-items.ts");
  assert.match(menu, /key: "communities-directory"[\s\S]*?url: "\/communities"/);
  assert.doesNotMatch(menu, /label: "Communities (Grid|List)"/);
});

test("both views share canonical links and one backend query", async () => {
  const directory = await read("app/(admin)/communities/components/CommunityDirectory.tsx");
  assert.equal((directory.match(/useListCommunities\(/g) || []).length, 1);
  assert.match(directory, /`\/communities\/\$\{community\.id\}`/);
  assert.doesNotMatch(directory, /communities\/details\?id=/);
});
