
export interface SystemOverviewData {
  totalSocieties: number;
  totalUnits: number;
  activeResidents: number;
  pendingComplaints: number;
  maintenanceRequests: number;
  visitorPassesToday: number;
  emergencyAlerts: number;
  pendingPaymentsAmount: number;
  totalCollections: number;
  amenityBookingsToday: number;
  serviceRequests: number;
  occupancyRate: number;
}

export interface RecentActivityData {
  id: string;
  type: 'complaint' | 'maintenance' | 'visitor' | 'payment' | 'emergency' | 'service';
  title: string;
  description: string;
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';
  society?: string;
  unit?: string;
  amount?: number;
}

export interface TopSocietyData {
  id: string;
  name: string;
  totalUnits: number;
  occupiedUnits: number;
  occupancyRate: number;
  maintenanceScore: number;
  pendingComplaints: number;
  totalCollections: number;
  established: string;
}

export interface MonthlyTrendData {
  month: string;
  complaints: number;
  maintenance: number;
  visitors: number;
  payments: number;
  amenityBookings: number;
  serviceRequests: number;
}

export const systemOverviewStats: SystemOverviewData = {
  totalSocieties: 24,
  totalUnits: 1847,
  activeResidents: 1345,
  pendingComplaints: 43,
  maintenanceRequests: 67,
  visitorPassesToday: 89,
  emergencyAlerts: 2,
  pendingPaymentsAmount: 4567800,
  totalCollections: 23456700,
  amenityBookingsToday: 34,
  serviceRequests: 23,
  occupancyRate: 87.5
};

export const recentActivities: RecentActivityData[] = [
  {
    id: '1',
    type: 'emergency',
    title: 'Emergency Alert: Power Outage',
    description: 'Main power supply disrupted in Block A',
    timestamp: '2025-05-31T10:30:00Z',
    priority: 'high',
    status: 'in-progress',
    society: 'Greenfield Residency',
    unit: 'Block A'
  },
  {
    id: '2',
    type: 'complaint',
    title: 'Noise Complaint',
    description: 'Excessive noise from construction work',
    timestamp: '2025-05-31T09:45:00Z',
    priority: 'medium',
    status: 'pending',
    society: 'Sunset Heights',
    unit: 'A-501'
  },
  {
    id: '3',
    type: 'maintenance',
    title: 'Elevator Malfunction',
    description: 'Main elevator not working properly',
    timestamp: '2025-05-31T08:20:00Z',
    priority: 'high',
    status: 'in-progress',
    society: 'Royal Gardens',
    unit: 'Tower B'
  },
  {
    id: '4',
    type: 'payment',
    title: 'Payment Received',
    description: 'Monthly maintenance fee payment',
    timestamp: '2025-05-31T07:15:00Z',
    priority: 'low',
    status: 'completed',
    society: 'Paradise View',
    unit: 'C-203',
    amount: 8500
  },
  {
    id: '5',
    type: 'visitor',
    title: 'Visitor Pass Approved',
    description: 'Delivery person access approved',
    timestamp: '2025-05-31T06:30:00Z',
    priority: 'low',
    status: 'approved',
    society: 'Metro Heights',
    unit: 'B-402'
  },
  {
    id: '6',
    type: 'service',
    title: 'Plumbing Service Request',
    description: 'Kitchen sink pipe leakage repair',
    timestamp: '2025-05-30T18:45:00Z',
    priority: 'medium',
    status: 'pending',
    society: 'Ocean View',
    unit: 'D-105'
  },
  {
    id: '7',
    type: 'maintenance',
    title: 'Garden Maintenance',
    description: 'Monthly garden landscaping completed',
    timestamp: '2025-05-30T16:20:00Z',
    priority: 'low',
    status: 'completed',
    society: 'Green Valley',
    unit: 'Common Area'
  },
  {
    id: '8',
    type: 'complaint',
    title: 'Parking Issue',
    description: 'Unauthorized vehicle in reserved parking',
    timestamp: '2025-05-30T14:10:00Z',
    priority: 'medium',
    status: 'pending',
    society: 'City Center',
    unit: 'Parking Lot'
  }
];

export const topSocieties: TopSocietyData[] = [
  {
    id: '1',
    name: 'Greenfield Residency',
    totalUnits: 156,
    occupiedUnits: 142,
    occupancyRate: 91.0,
    maintenanceScore: 4.8,
    pendingComplaints: 2,
    totalCollections: 1890000,
    established: '2019'
  },
  {
    id: '2',
    name: 'Sunset Heights',
    totalUnits: 89,
    occupiedUnits: 81,
    occupancyRate: 91.0,
    maintenanceScore: 4.6,
    pendingComplaints: 1,
    totalCollections: 1456000,
    established: '2020'
  },
  {
    id: '3',
    name: 'Royal Gardens',
    totalUnits: 124,
    occupiedUnits: 108,
    occupancyRate: 87.1,
    maintenanceScore: 4.5,
    pendingComplaints: 4,
    totalCollections: 1678000,
    established: '2018'
  },
  {
    id: '4',
    name: 'Paradise View',
    totalUnits: 67,
    occupiedUnits: 59,
    occupancyRate: 88.1,
    maintenanceScore: 4.7,
    pendingComplaints: 1,
    totalCollections: 987000,
    established: '2021'
  },
  {
    id: '5',
    name: 'Metro Heights',
    totalUnits: 203,
    occupiedUnits: 176,
    occupancyRate: 86.7,
    maintenanceScore: 4.4,
    pendingComplaints: 6,
    totalCollections: 2340000,
    established: '2017'
  }
];

export const monthlyTrends: MonthlyTrendData[] = [
  {
    month: 'Jan 2025',
    complaints: 45,
    maintenance: 78,
    visitors: 892,
    payments: 156780,
    amenityBookings: 234,
    serviceRequests: 67
  },
  {
    month: 'Feb 2025',
    complaints: 38,
    maintenance: 65,
    visitors: 756,
    payments: 148920,
    amenityBookings: 201,
    serviceRequests: 52
  },
  {
    month: 'Mar 2025',
    complaints: 52,
    maintenance: 89,
    visitors: 943,
    payments: 162340,
    amenityBookings: 278,
    serviceRequests: 74
  },
  {
    month: 'Apr 2025',
    complaints: 41,
    maintenance: 72,
    visitors: 817,
    payments: 154650,
    amenityBookings: 245,
    serviceRequests: 61
  },
  {
    month: 'May 2025',
    complaints: 43,
    maintenance: 67,
    visitors: 889,
    payments: 159870,
    amenityBookings: 234,
    serviceRequests: 58
  }
];

export const amenityUsageData = [
  { name: 'Swimming Pool', bookings: 89, capacity: 120, utilizationRate: 74.2 },
  { name: 'Gym & Fitness', bookings: 156, capacity: 200, utilizationRate: 78.0 },
  { name: 'Club House', bookings: 23, capacity: 40, utilizationRate: 57.5 },
  { name: 'Tennis Court', bookings: 34, capacity: 60, utilizationRate: 56.7 },
  { name: 'Children Play Area', bookings: 67, capacity: 80, utilizationRate: 83.8 },
  { name: 'Community Hall', bookings: 12, capacity: 25, utilizationRate: 48.0 },
  { name: 'Library', bookings: 45, capacity: 60, utilizationRate: 75.0 },
  { name: 'Yoga Center', bookings: 78, capacity: 90, utilizationRate: 86.7 }
];

export const maintenanceStatusData = [
  { category: 'Elevator', total: 24, working: 22, underMaintenance: 2, outOfOrder: 0 },
  { category: 'Water Pumps', total: 48, working: 45, underMaintenance: 2, outOfOrder: 1 },
  { category: 'Generators', total: 24, working: 23, underMaintenance: 1, outOfOrder: 0 },
  { category: 'CCTV Cameras', total: 340, working: 325, underMaintenance: 12, outOfOrder: 3 },
  { category: 'Street Lights', total: 156, working: 148, underMaintenance: 6, outOfOrder: 2 },
  { category: 'Fire Safety', total: 89, working: 87, underMaintenance: 2, outOfOrder: 0 }
];

export const emergencyResponseData = [
  {
    type: 'Medical Emergency',
    responseTime: '3.2 min',
    incidents: 12,
    resolved: 12,
    pending: 0
  },
  {
    type: 'Fire Emergency',
    responseTime: '2.8 min',
    incidents: 2,
    resolved: 2,
    pending: 0
  },
  {
    type: 'Security Alert',
    responseTime: '4.5 min',
    incidents: 8,
    resolved: 7,
    pending: 1
  },
  {
    type: 'Power Outage',
    responseTime: '12.3 min',
    incidents: 15,
    resolved: 13,
    pending: 2
  }
];
