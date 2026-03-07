import { Metadata } from 'next'
import NotificationAnalyticsView from './components/NotificationAnalyticsView'

export const metadata: Metadata = {
  title: 'Notification Reports',
  description: 'Cross-channel reporting and delivery analytics for notification operations'
}

export default function AnalyticsPage() {
  return <NotificationAnalyticsView />
}
