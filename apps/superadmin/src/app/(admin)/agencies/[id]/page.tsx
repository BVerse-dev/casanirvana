import type { Metadata } from 'next'
import AgencyProfile from '../components/AgencyProfile'
export const metadata: Metadata = { title: 'Agency Details | Casa Nirvana Admin' }
export default async function AgencyDetailsPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AgencyProfile agencyId={id} /> }
