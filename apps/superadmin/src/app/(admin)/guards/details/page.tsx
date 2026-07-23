import { permanentRedirect } from 'next/navigation'

export default function LegacyGuardDetailsPage({ searchParams }: { searchParams: { id?: string } }) {
  permanentRedirect(searchParams.id ? `/guards/${searchParams.id}` : '/guards')
}
