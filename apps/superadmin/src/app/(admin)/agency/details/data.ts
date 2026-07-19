import { StaticImageData } from 'next/image'

export type PropertyStatusType = {
  icon: string
  title: string
  count: number
  progress: number
  variant: string
}

export type PropertyFileType = {
  name: string
  icon: string
  data: number
  variant: string
}

export const propertyStatusData: PropertyStatusType[] = [
  {
    icon: 'solar:buildings-3-bold',
    title: 'Managed Societies',
    count: 12,
    progress: 80,
    variant: '#02bc9c',
  },
  {
    icon: 'solar:home-bold',
    title: 'Total Units Managed',
    count: 1840,
    progress: 92,
    variant: '#e1360d',
  },
  {
    icon: 'solar:chart-square-bold',
    title: 'Occupancy Rate',
    count: 94,
    progress: 94,
    variant: '#027ef4',
  },
]

export const propertyFileData: PropertyFileType[] = [
  {
    name: 'Society-Management-Reports.pdf',
    icon: 'solar:file-check-bold',
    data: 2.4,
    variant: 'danger',
  },
  {
    name: 'Maintenance-Schedule.pdf',
    icon: 'solar:settings-bold',
    data: 1.6,
    variant: 'primary',
  },
  {
    name: 'Occupancy-Analytics.pdf',
    icon: 'solar:chart-bold',
    data: 23.2,
    variant: 'success',
  },
  {
    name: 'Unit-Portfolio.png',
    icon: 'solar:home-bold',
    data: 2.3,
    variant: 'warning',
  },
]
