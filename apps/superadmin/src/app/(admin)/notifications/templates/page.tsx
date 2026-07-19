import { Metadata } from 'next'
import NotificationTemplatesView from './components/NotificationTemplatesView'

export const metadata: Metadata = {
  title: 'Notification Templates | Casa Nirvana Admin',
  description: 'Manage notification templates for SMS, Email, Push and In-App messages'
}

export default function NotificationTemplatesPage() {
  return <NotificationTemplatesView />
}
