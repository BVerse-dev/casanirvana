import avatar3 from '@/assets/images/users/avatar-3.jpg'
import avatar4 from '@/assets/images/users/avatar-4.jpg'
import { StaticImageData } from 'next/image'

export type PropertyStatusType = {
  icon: string
  title: string
  count: number
  progress: number
  variant: string
}

export type ReviewType = {
  name: string
  userName: string
  image: StaticImageData
  country: string
  description: string
  day: number
}

export type PropertyFileType = {
  name: string
  icon: string
  data: number
  variant: string
}

export const propertyStatusData: PropertyStatusType[] = [
  {
    icon: 'solar:home-bold',
    title: 'Total Requests',
    count: 12,
    progress: 80,
    variant: '#02bc9c',
  },
  {
    icon: 'solar:wallet-money-bold',
    title: 'Payments Made',
    count: 8,
    progress: 40,
    variant: '#e1360d',
  },
  {
    icon: 'solar:hand-money-bold',
    title: 'Active Services',
    count: 3,
    progress: 56,
    variant: '#027ef4',
  },
]

export const reviewData: ReviewType[] = [
  {
    name: 'Sarah Johnson',
    country: 'India',
    userName: 'sarahj',
    description:
      'Great resident to have in our community. Always follows the society rules and is very cooperative with the management team. Highly recommended neighbor.',
    day: 3,
    image: avatar3,
  },
  {
    name: 'David Wilson',
    country: 'India',
    userName: 'davidw',
    description:
      'Very respectful and considerate resident. Always maintains cleanliness in common areas and is helpful during society events and meetings.',
    day: 15,
    image: avatar4,
  },
]

export const propertyFileData: PropertyFileType[] = [
  {
    name: 'Identity-Proof.pdf',
    icon: 'solar:file-check-bold',
    data: 2.4,
    variant: 'danger',
  },
  {
    name: 'Address-Proof.pdf',
    icon: 'solar:user-bold',
    data: 1.6,
    variant: 'primary',
  },
  {
    name: 'Agreement-Copy.pdf',
    icon: 'solar:gallery-minimalistic-bold',
    data: 23.2,
    variant: 'success',
  },
  {
    name: 'Payment-Receipt.png',
    icon: 'solar:streets-map-point-bold',
    data: 2.3,
    variant: 'warning',
  },
]
