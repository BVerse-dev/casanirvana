import avatar3 from '@/assets/images/users/avatar-3.jpg'
import avatar4 from '@/assets/images/users/avatar-4.jpg'
import { StaticImageData } from 'next/image'

export type GuardStatusType = {
  icon: string
  title: string
  count: string
  progress: number
  variant: string
}

export type GuardReviewType = {
  name: string
  userName: string
  image: StaticImageData
  society: string
  description: string
  day: number
}

export type GuardFileType = {
  name: string
  icon: string
  data: number
  variant: string
}

export const guardStatusData: GuardStatusType[] = [
  {
    icon: 'solar:calendar-mark-bold-duotone',
    title: 'Attendance Rate',
    count: '98%',
    progress: 98,
    variant: '#0ab39c',
  },
  {
    icon: 'solar:users-group-rounded-bold-duotone',
    title: 'Visitors Checked',
    count: '156',
    progress: 85,
    variant: '#f7b84b',
  },
  {
    icon: 'solar:document-text-bold-duotone',
    title: 'Incident Reports',
    count: '12',
    progress: 75,
    variant: '#405189',
  },
]

export const guardReviewData: GuardReviewType[] = [
  {
    name: 'Priya Sharma',
    society: 'Green Valley',
    userName: 'priya_resident',
    description:
      'Excellent security guard who is always alert and professional. Very helpful with visitors and maintains proper entry logs.',
    day: 2,
    image: avatar3,
  },
  {
    name: 'Ravi Patel',
    society: 'Blue Ridge',
    userName: 'ravi_p',
    description:
      'Outstanding guard with great attention to detail. Always polite and ensures safety protocols are followed strictly.',
    day: 7,
    image: avatar4,
  },
]

export const guardFileData: GuardFileType[] = [
  {
    name: 'Security-License.pdf',
    icon: 'solar:shield-check-bold',
    data: 2.4,
    variant: 'success',
  },
  {
    name: 'Training-Certificate.pdf',
    icon: 'solar:diploma-bold',
    data: 1.6,
    variant: 'primary',
  },
  {
    name: 'Background-Check.pdf',
    icon: 'solar:document-text-bold',
    data: 3.2,
    variant: 'warning',
  },
  {
    name: 'ID-Verification.png',
    icon: 'solar:card-bold',
    data: 1.8,
    variant: 'info',
  },
]
