import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../src/", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("community details are canonical and backend-owned", async () => {
  const [page, details, legacy] = await Promise.all([read("app/(admin)/communities/[id]/page.tsx"), read("app/(admin)/communities/components/CommunityDetails.tsx"), read("app/(admin)/communities/details/page.tsx")]);
  assert.match(page, /CommunityDetails/);
  assert.match(details, /useGetCommunity\(communityId\)/);
  assert.match(details, /outside your authorized scope/);
  assert.match(legacy, /permanentRedirect\(searchParams\.id \? `\/communities\/\$\{searchParams\.id\}`/);
  assert.doesNotMatch(page, /useEffect|router\.replace/);
});

test("community form uses scoped agencies and canonical success routing", async () => {
  const form = await read("app/(admin)/communities/add/components/CommunityAddForm.tsx");
  assert.match(form, /useListAgenciesDirectory\(\)/);
  assert.match(form, /agency_id: data\.agency_id \|\| null/);
  assert.match(form, /router\.push\(`\/communities\/\$\{communityId\}`\)/);
  assert.match(form, /createdId \? `\/communities\/\$\{createdId\}` : "\/communities"/);
  assert.doesNotMatch(form, /communities\/list|FileUpload/);
});

test("community form and preview do not advertise fabricated or unsupported data", async () => {
  const [form, preview] = await Promise.all([read("app/(admin)/communities/add/components/CommunityAddForm.tsx"), read("app/(admin)/communities/add/components/CommunityAddCard.tsx")]);
  assert.doesNotMatch(preview, /total_units \|\| 0\) \* 3|Residents/);
  assert.match(preview, /GH₵/);
  assert.match(form, /GH₵/);
  assert.match(form, /communityLoading/);
  assert.match(form, /communityError/);
});
