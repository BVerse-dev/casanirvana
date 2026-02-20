import { Metadata } from 'next'
import NotificationAnalyticsView from './components/NotificationAnalyticsView'

export const metadata: Metadata = {
  title: 'Notification Analytics',
  description: 'Comprehensive analytics and reports for notification campaigns'
}

export default function AnalyticsPage() {
  return <NotificationAnalyticsView />
}
