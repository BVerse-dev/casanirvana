import type { Metadata } from 'next'
import GuardProfile from '../components/GuardProfile'

export const metadata: Metadata = { title: 'Guard Details | Casa Nirvana Admin' }

export default async function GuardProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <GuardProfile guardId={id} />
}
