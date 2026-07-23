import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('canonical guard details use the scoped backend snapshot', async () => {
  const page = await read('../src/app/(admin)/guards/[id]/page.tsx')
  const profile = await read('../src/app/(admin)/guards/components/GuardProfile.tsx')
  const snapshot = await read('../src/hooks/useGuardDetailSnapshot.ts')
  assert.match(page, /<GuardProfile guardId=\{id\}/)
  assert.match(profile, /useGuardDetailSnapshot\(guardId\)/)
  assert.match(profile, /`\/guards\/manage\?tab=assignments&guardId=\$\{guard\.id\}`/)
  assert.match(snapshot, /\/admin\/guards\/profiles/)
  assert.doesNotMatch(page + profile + snapshot, /supabase/i)
})

test('guard directory and provisioning navigate through canonical routes', async () => {
  const grid = await read('../src/app/(admin)/guards/components/GuardDirectoryGrid.tsx')
  const list = await read('../src/app/(admin)/guards/components/GuardDirectoryList.tsx')
  const form = await read('../src/app/(admin)/guards/add/components/GuardAdd_Enhanced.tsx')
  assert.match(grid, /`\/guards\/\$\{guard\.id\}`/)
  assert.match(list, /`\/guards\/\$\{guard\.id\}`/)
  assert.doesNotMatch(grid + list, /guards\/details\?id=/)
  assert.match(form, /router\.push\('\/guards'\)/)
  assert.doesNotMatch(form, /guards\/manage\?tab=profiles/)
})

test('legacy guard details redirect intentionally without advertising unsupported profile editing', async () => {
  const legacy = await read('../src/app/(admin)/guards/details/page.tsx')
  const profile = await read('../src/app/(admin)/guards/components/GuardProfile.tsx')
  assert.match(legacy, /permanentRedirect/)
  assert.match(legacy, /`\/guards\/\$\{searchParams\.id\}`/)
  assert.doesNotMatch(profile, /\/edit/)
})
