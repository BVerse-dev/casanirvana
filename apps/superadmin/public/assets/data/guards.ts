// Sample Guards Data for Casa Nirvana
import { avatars } from '@/assets/images/users'
import type { Guard } from '@/hooks/useGuards'

export const getSampleGuardsData = (): Guard[] => [
  {
    id: "guard-001",
    email: "rajesh.kumar@casanirvana.com",
    full_name: "Rajesh Kumar Singh",
    phone: "+91-9876543210",
    date_of_birth: "1985-03-15",
    avatar_url: avatars.avatar8.src,
    unit_id: null,
    society_id: "society-001",
    role: "GUARD",
    is_active: true,
    shift_type: "DAY",
    license_number: "SEC-2024-001",
    emergency_contact: "+91-9876543211",
    employment_date: "2024-01-15",
    salary: 25000,
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z",
    societies: {
      id: "society-001",
      name: "Green Valley Apartments",
      address: "123 Park Avenue, Mumbai"
    }
  },
  {
    id: "guard-002",
    email: "suresh.patil@casanirvana.com",
    full_name: "Suresh Patil",
    phone: "+91-9876543220",
    date_of_birth: "1982-07-22",
    avatar_url: avatars.avatar9.src,
    unit_id: null,
    society_id: "society-001",
    role: "GUARD",
    is_active: true,
    shift_type: "NIGHT",
    license_number: "SEC-2024-002",
    emergency_contact: "+91-9876543221",
    employment_date: "2024-02-01",
    salary: 27000,
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z",
    societies: {
      id: "society-001",
      name: "Green Valley Apartments",
      address: "123 Park Avenue, Mumbai"
    }
  },
  {
    id: "guard-003",
    email: "amit.sharma@casanirvana.com",
    full_name: "Amit Sharma",
    phone: "+91-9876543230",
    date_of_birth: "1988-11-10",
    avatar_url: avatars.avatar10.src,
    unit_id: null,
    society_id: "society-002",
    role: "GUARD",
    is_active: true,
    shift_type: "ROTATING",
    license_number: "SEC-2024-003",
    emergency_contact: "+91-9876543231",
    employment_date: "2024-01-20",
    salary: 30000,
    created_at: "2024-01-20T00:00:00Z",
    updated_at: "2024-01-20T00:00:00Z",
    societies: {
      id: "society-002",
      name: "Sunset Heights",
      address: "456 Marine Drive, Mumbai"
    }
  },
  {
    id: "guard-004",
    email: "vikash.yadav@casanirvana.com",
    full_name: "Vikash Yadav",
    phone: "+91-9876543240",
    date_of_birth: "1990-05-18",
    avatar_url: avatars.avatar11.src,
    unit_id: null,
    society_id: "society-002",
    role: "GUARD",
    is_active: true,
    shift_type: "DAY",
    license_number: "SEC-2024-004",
    emergency_contact: "+91-9876543241",
    employment_date: "2024-03-01",
    salary: 26000,
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z",
    societies: {
      id: "society-002",
      name: "Sunset Heights",
      address: "456 Marine Drive, Mumbai"
    }
  },
  {
    id: "guard-005",
    email: "ravi.singh@casanirvana.com",
    full_name: "Ravi Singh",
    phone: "+91-9876543250",
    date_of_birth: "1987-09-25",
    avatar_url: avatars.avatar12.src,
    unit_id: null,
    society_id: "society-003",
    role: "GUARD",
    is_active: true,
    shift_type: "NIGHT",
    license_number: "SEC-2024-005",
    emergency_contact: "+91-9876543251",
    employment_date: "2024-02-15",
    salary: 28000,
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z",
    societies: {
      id: "society-003",
      name: "Royal Gardens",
      address: "789 Hill Road, Pune"
    }
  },
  {
    id: "guard-006",
    email: "deepak.gupta@casanirvana.com",
    full_name: "Deepak Gupta",
    phone: "+91-9876543260",
    date_of_birth: "1984-12-08",
    avatar_url: avatars.avatar1.src,
    unit_id: null,
    society_id: "society-003",
    role: "GUARD",
    is_active: false,
    shift_type: "DAY",
    license_number: "SEC-2024-006",
    emergency_contact: "+91-9876543261",
    employment_date: "2024-01-10",
    salary: 24000,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
    societies: {
      id: "society-003",
      name: "Royal Gardens",
      address: "789 Hill Road, Pune"
    }
  },
  {
    id: "guard-007",
    email: "manoj.tiwari@casanirvana.com",
    full_name: "Manoj Tiwari",
    phone: "+91-9876543270",
    date_of_birth: "1991-04-12",
    avatar_url: avatars.avatar2.src,
    unit_id: null,
    society_id: "society-004",
    role: "GUARD",
    is_active: true,
    shift_type: "ROTATING",
    license_number: "SEC-2024-007",
    emergency_contact: "+91-9876543271",
    employment_date: "2024-03-10",
    salary: 29000,
    created_at: "2024-03-10T00:00:00Z",
    updated_at: "2024-03-10T00:00:00Z",
    societies: {
      id: "society-004",
      name: "Paradise Towers",
      address: "321 Central Avenue, Delhi"
    }
  },
  {
    id: "guard-008",
    email: "santosh.jha@casanirvana.com",
    full_name: "Santosh Jha",
    phone: "+91-9876543280",
    date_of_birth: "1986-08-30",
    avatar_url: avatars.avatar3.src,
    unit_id: null,
    society_id: "society-004",
    role: "GUARD",
    is_active: true,
    shift_type: "NIGHT",
    license_number: "SEC-2024-008",
    emergency_contact: "+91-9876543281",
    employment_date: "2024-02-20",
    salary: 26500,
    created_at: "2024-02-20T00:00:00Z",
    updated_at: "2024-02-20T00:00:00Z",
    societies: {
      id: "society-004",
      name: "Paradise Towers",
      address: "321 Central Avenue, Delhi"
    }
  },
  {
    id: "guard-009",
    email: "ashok.mishra@casanirvana.com",
    full_name: "Ashok Mishra",
    phone: "+91-9876543290",
    date_of_birth: "1989-06-14",
    avatar_url: avatars.avatar4.src,
    unit_id: null,
    society_id: "society-005",
    role: "GUARD",
    is_active: true,
    shift_type: "DAY",
    license_number: "SEC-2024-009",
    emergency_contact: "+91-9876543291",
    employment_date: "2024-01-25",
    salary: 27500,
    created_at: "2024-01-25T00:00:00Z",
    updated_at: "2024-01-25T00:00:00Z",
    societies: {
      id: "society-005",
      name: "Silver Springs",
      address: "654 Lake View Road, Bangalore"
    }
  },
  {
    id: "guard-010",
    email: "ramesh.verma@casanirvana.com",
    full_name: "Ramesh Verma",
    phone: "+91-9876543300",
    date_of_birth: "1983-10-03",
    avatar_url: avatars.avatar5.src,
    unit_id: null,
    society_id: "society-005",
    role: "GUARD",
    is_active: false,
    shift_type: "NIGHT",
    license_number: "SEC-2024-010",
    emergency_contact: "+91-9876543301",
    employment_date: "2024-01-05",
    salary: 25500,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z",
    societies: {
      id: "society-005",
      name: "Silver Springs",
      address: "654 Lake View Road, Bangalore"
    }
  }
]

export const getGuardById = (id: string): Guard | undefined => {
  return getSampleGuardsData().find(guard => guard.id === id)
}

export const getGuardsBySocietyId = (societyId: string): Guard[] => {
  return getSampleGuardsData().filter(guard => guard.society_id === societyId)
}

export const getActiveGuards = (): Guard[] => {
  return getSampleGuardsData().filter(guard => guard.is_active)
}

export const getGuardsByShiftType = (shiftType: 'DAY' | 'NIGHT' | 'ROTATING'): Guard[] => {
  return getSampleGuardsData().filter(guard => guard.shift_type === shiftType)
}
