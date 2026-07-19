import { Metadata } from 'next'
import NotificationCampaignsView from './components/NotificationCampaignsView'

export const metadata: Metadata = {
  title: 'Notification Campaigns',
  description: 'Manage and schedule notification campaigns'
}

export default function CampaignsPage() {
  return <NotificationCampaignsView />
}
