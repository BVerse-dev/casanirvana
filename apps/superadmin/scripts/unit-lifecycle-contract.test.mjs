import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("canonical unit details exposes the canonical edit route", async () => {
  const source = await read("../src/app/(admin)/units/components/UnitDetails.tsx");
  assert.match(source, /href={`\/units\/\$\{unit\.id\}\/edit`}/);
});

test("unit form supports scoped create and update through the backend hooks", async () => {
  const source = await read("../src/app/(admin)/property/add/components/UnitAddForm.tsx");
  assert.match(source, /useCreateUnit, useGetUnit, useUpdateUnit/);
  assert.match(source, /updateUnitMutation\.mutateAsync\(unitData\)/);
  assert.doesNotMatch(source, /FileUpload/);
  assert.doesNotMatch(source, /supabase/i);
});

test("backend unit read and update contracts retain supported fields and scope", async () => {
  const source = await read("../../api/src/controllers/adminUnits.ts");
  assert.match(source, /status, type, unit_name/);
  assert.match(source, /bathroom_count, balconies, rent_amount/);
  assert.match(source, /canAccessCommunity\(scope, payload\.community_id\)/);
  assert.doesNotMatch(source, /ownership_type/);
});
