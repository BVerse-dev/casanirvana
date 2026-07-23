import { permanentRedirect } from 'next/navigation'
export default function LegacyAgencyDetailsPage({ searchParams }: { searchParams: { id?: string } }) { permanentRedirect(searchParams.id ? `/agencies/${searchParams.id}` : '/agencies') }
