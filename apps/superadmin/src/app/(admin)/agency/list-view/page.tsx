import { permanentRedirect } from 'next/navigation'

export default function LegacyAgencyListPage() {
  permanentRedirect('/agencies?view=list')
}
