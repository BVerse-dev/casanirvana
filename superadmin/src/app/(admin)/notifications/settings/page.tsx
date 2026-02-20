import { Metadata } from 'next'
import NotificationSettingsView from './components/NotificationSettingsView'

export const metadata: Metadata = {
  title: 'Notification Settings',
  description: 'Configure notification settings and preferences'
}

export default function SettingsPage() {
  return <NotificationSettingsView />
}
