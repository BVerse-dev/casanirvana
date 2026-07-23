import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('canonical agency lifecycle uses backend directory contracts', async () => {
  const profile = await read('../src/app/(admin)/agencies/components/AgencyProfile.tsx')
  const edit = await read('../src/app/(admin)/agencies/components/AgencyEdit.tsx')
  const hook = await read('../src/hooks/useAgencyDirectory.ts')
  assert.match(profile, /useGetAgencyDirectorySummary\(agencyId/)
  assert.match(edit, /useUpdateAgencyDirectory\(\)/)
  assert.match(hook, /method: "PATCH"/)
  assert.doesNotMatch(profile + edit, /supabase/i)
})

test('agency create and detail navigation is canonical', async () => {
  const form = await read('../src/app/(admin)/agency/add/components/AgencyAdd.tsx')
  const grid = await read('../src/app/(admin)/agencies/components/AgencyDirectoryGrid.tsx')
  const list = await read('../src/app/(admin)/agencies/components/AgencyDirectoryList.tsx')
  assert.match(form, /router\.push\(`\/agencies\/\$\{created\.agency\.id\}`\)/)
  assert.match(grid + list, /`\/agencies\/\$\{agency\.id\}`/)
})

test('legacy agency lifecycle routes redirect intentionally', async () => {
  const add = await read('../src/app/(admin)/agency/add/page.tsx')
  const details = await read('../src/app/(admin)/agency/details/page.tsx')
  assert.match(add, /permanentRedirect\('\/agencies\/add'\)/)
  assert.match(details, /permanentRedirect/)
})
