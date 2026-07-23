import type { Metadata } from 'next'

import AgencyDirectory from './components/AgencyDirectory'

export const metadata: Metadata = { title: 'Agencies | Casa Nirvana Admin' }

export default function AgenciesPage() {
  return <AgencyDirectory />
}
