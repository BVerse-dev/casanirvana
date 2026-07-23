import type { Metadata } from 'next'
import AgencyEdit from '../../components/AgencyEdit'
export const metadata: Metadata = { title: 'Edit Agency | Casa Nirvana Admin' }
export default async function EditAgencyPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AgencyEdit agencyId={id} /> }
