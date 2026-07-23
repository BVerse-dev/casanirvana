import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('Agencies has one canonical grid-default backend directory', async () => {
  const source = await read('../src/app/(admin)/agencies/components/AgencyDirectory.tsx')
  assert.match(source, /useDirectoryView\('agencies'\)/)
  assert.match(source, /usePaginatedAgenciesDirectory\(\{ page, pageSize: PAGE_SIZE, search, status \}\)/)
  assert.match(source, /href="\/agency\/manage"/)
})

test('agency directory API exposes normalized scoped pagination', async () => {
  const controller = await read('../../api/src/controllers/adminAgenciesOperations.ts')
  const schema = await read('../../api/src/validation/schemas.ts')
  assert.match(controller, /count: total, page, pageSize, totalPages: Math\.ceil\(total \/ pageSize\)/)
  assert.match(controller, /scope\.agencyIds/)
  assert.match(schema, /adminAgencyDirectoryQuery: pageLimitQuery\.merge\(withSearchQuery\)/)
})

test('legacy agency view routes redirect and sidebar has one directory entry', async () => {
  const grid = await read('../src/app/(admin)/agency/grid-view/page.tsx')
  const list = await read('../src/app/(admin)/agency/list-view/page.tsx')
  const menu = await read('../src/assets/data/menu-items.ts')
  assert.match(grid, /permanentRedirect\('\/agencies\?view=grid'\)/)
  assert.match(list, /permanentRedirect\('\/agencies\?view=list'\)/)
  assert.match(menu, /key: "agencies-directory"[\s\S]*?url: "\/agencies"/)
  assert.doesNotMatch(menu, /url: "\/agency\/(?:grid-view|list-view)"/)
})
