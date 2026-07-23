import { permanentRedirect } from 'next/navigation'

export default function LegacyAgencyGridPage() {
  permanentRedirect('/agencies?view=grid')
}
