import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../src/", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("join requests use backend pagination, search and status filters", async () => {
  const [hook, list] = await Promise.all([read("hooks/useJoinRequests.ts"), read("app/(admin)/communities/join-requests/components/JoinRequestsList.tsx")]);
  assert.match(hook, /pageSize = 20/);
  assert.match(hook, /params\.set\("search"/);
  assert.match(hook, /params\.set\("status"/);
  assert.doesNotMatch(hook, /limit=1000|pageSize: 1000/);
  assert.match(list, /useListJoinRequests\(\{ page, pageSize: PAGE_SIZE, search, status \}\)/);
});

test("join request decisions are guarded and rejection notes are required", async () => {
  const list = await read("app/(admin)/communities/join-requests/components/JoinRequestsList.tsx");
  assert.match(list, /selected\.status !== "pending" && selected\.status !== "pending_manual_review"/);
  assert.match(list, /decision === "rejected" && !notes\.trim\(\)/);
  assert.match(list, /status: decision/);
  assert.match(list, /review_notes: notes\.trim\(\) \|\| null/);
});

test("join request UI exposes truthful states and review metadata", async () => {
  const list = await read("app/(admin)/communities/join-requests/components/JoinRequestsList.tsx");
  assert.match(list, /query\.isLoading/);
  assert.match(list, /query\.isError/);
  assert.match(list, /No join requests found/);
  assert.match(list, /selected\.reviewer_name/);
  assert.match(list, /selected\.reviewed_at/);
});
