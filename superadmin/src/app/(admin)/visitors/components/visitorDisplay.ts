export const VISITOR_STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'checked_in', label: 'Checked In' },
  { value: 'checked_out', label: 'Checked Out' },
  { value: 'denied', label: 'Denied' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
]

export const VISITOR_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'guest', label: 'Guest' },
  { value: 'cab', label: 'Cab' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'service', label: 'Service' },
]

export const normalizeVisitorSearch = (value?: string | null) => (value || '').trim().toLowerCase()

export const formatVisitorLabel = (value?: string | null, fallback = 'Unknown') => {
  if (!value) return fallback
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const getVisitorStatusVariant = (status?: string | null) => {
  switch (status) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'checked_in':
      return 'info'
    case 'checked_out':
      return 'secondary'
    case 'denied':
    case 'cancelled':
    case 'expired':
      return 'danger'
    default:
      return 'secondary'
  }
}
