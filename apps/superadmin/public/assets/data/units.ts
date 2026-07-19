// Sample Units Data for Casa Nirvana
import type { Database } from "@/lib/database.types";

type Unit = Database["public"]["Tables"]["units"]["Row"] & {
  societies?: Database["public"]["Tables"]["societies"]["Row"];
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  // Additional fields for display purposes
  unit_number?: string;
  type?: string;
  area?: number;
  floor?: number;
  status?: string;
  rent_amount?: number;
  maintenance_amount?: number;
  images?: string[];
  tenant_id?: string | null;
  parking_slot?: string | null;
  balcony_count?: number;
  bathroom_count?: number;
  is_furnished?: boolean;
  amenities?: string[];
};

export const getSampleUnitsData = (): Unit[] => [
  {
    id: "unit-001",
    society_id: "society-001",
    block: "A",
    number: "101",
    owner_id: "owner-001",
    floor_area: 1200,
    bedrooms: 2,
    bathrooms: 2,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    // Display fields
    unit_number: "A-101",
    type: "2bhk",
    area: 1200,
    floor: 1,
    status: "occupied",
    rent_amount: 25000,
    maintenance_amount: 3500,
    images: ["/images/properties/p-1.jpg", "/images/properties/p-2.jpg"],
    tenant_id: "tenant-001",
    parking_slot: "P-A101",
    balcony_count: 2,
    bathroom_count: 2,
    is_furnished: true,
    amenities: ["gym", "swimming_pool", "parking"],
    societies: {
      id: "society-001",
      name: "Green Valley Apartments",
      address: "123 Park Avenue, Mumbai",
      description: "Modern residential complex with premium amenities",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    profiles: {
      first_name: "Rajesh",
      last_name: "Sharma",
      email: "rajesh.sharma@email.com",
      phone: "+91-9876543210"
    }
  },
  {
    id: "unit-002",
    society_id: "society-001",
    block: "B",
    number: "205",
    owner_id: "owner-002",
    floor_area: 1650,
    bedrooms: 3,
    bathrooms: 3,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
    // Display fields
    unit_number: "B-205",
    type: "3bhk",
    area: 1650,
    floor: 2,
    status: "vacant",
    rent_amount: 35000,
    maintenance_amount: 4200,
    images: ["/images/properties/p-3.jpg", "/images/properties/p-4.jpg"],
    tenant_id: null,
    parking_slot: "P-B205",
    balcony_count: 3,
    bathroom_count: 3,
    is_furnished: false,
    amenities: ["gym", "swimming_pool", "parking", "club_house"],
    societies: {
      id: "society-001",
      name: "Green Valley Apartments",
      address: "123 Park Avenue, Mumbai",
      description: "Modern residential complex with premium amenities",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    profiles: {
      first_name: "Priya",
      last_name: "Patel",
      email: "priya.patel@email.com",
      phone: "+91-9876543211"
    }
  },
  {
    id: "unit-003",
    society_id: "society-002",
    block: "C",
    number: "310",
    owner_id: "owner-003",
    floor_area: 850,
    bedrooms: 1,
    bathrooms: 1,
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
    // Display fields
    unit_number: "C-310",
    type: "1bhk",
    area: 850,
    floor: 3,
    status: "occupied",
    rent_amount: 18000,
    maintenance_amount: 2800,
    images: ["/images/properties/p-5.jpg", "/images/properties/p-6.jpg"],
    tenant_id: "tenant-003",
    parking_slot: "P-C310",
    balcony_count: 1,
    bathroom_count: 1,
    is_furnished: true,
    amenities: ["gym", "parking"],
    societies: {
      id: "society-002",
      name: "Sunset Heights",
      address: "456 Marine Drive, Mumbai",
      description: "Luxury towers with sea view and world-class facilities",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z"
    },
    profiles: {
      first_name: "Amit",
      last_name: "Kumar",
      email: "amit.kumar@email.com",
      phone: "+91-9876543212"
    }
  },
  {
    id: "unit-004",
    society_id: "society-002",
    block: "D",
    number: "415",
    owner_id: "owner-004",
    floor_area: 2200,
    bedrooms: 4,
    bathrooms: 4,
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z",
    // Display fields
    unit_number: "D-415",
    type: "4bhk",
    area: 2200,
    floor: 4,
    status: "maintenance",
    rent_amount: 50000,
    maintenance_amount: 6000,
    images: ["/images/properties/p-7.jpg", "/images/properties/p-8.jpg"],
    tenant_id: null,
    parking_slot: "P-D415",
    balcony_count: 4,
    bathroom_count: 4,
    is_furnished: true,
    amenities: ["gym", "swimming_pool", "parking", "club_house", "garden"],
    societies: {
      id: "society-002",
      name: "Sunset Heights",
      address: "456 Marine Drive, Mumbai",
      description: "Luxury towers with sea view and world-class facilities",
      created_at: "2024-01-15T00:00:00Z",
      updated_at: "2024-01-15T00:00:00Z"
    },
    profiles: {
      first_name: "Sneha",
      last_name: "Reddy",
      email: "sneha.reddy@email.com",
      phone: "+91-9876543213"
    }
  },
  {
    id: "unit-005",
    society_id: "society-003",
    block: "A",
    number: "520",
    owner_id: "owner-005",
    floor_area: 1350,
    bedrooms: 2,
    bathrooms: 2,
    created_at: "2024-02-15T10:00:00Z",
    updated_at: "2024-02-15T10:00:00Z",
    // Display fields
    unit_number: "A-520",
    type: "2bhk",
    area: 1350,
    floor: 5,
    status: "vacant",
    rent_amount: 28000,
    maintenance_amount: 3800,
    images: ["/images/properties/p-9.jpg", "/images/properties/p-10.jpg"],
    tenant_id: null,
    parking_slot: "P-A520",
    balcony_count: 2,
    bathroom_count: 2,
    is_furnished: false,
    amenities: ["gym", "parking", "security"],
    societies: {
      id: "society-003",
      name: "Royal Gardens",
      address: "789 Hill Road, Pune",
      description: "Garden community with family-friendly amenities",
      created_at: "2024-02-01T00:00:00Z",
      updated_at: "2024-02-01T00:00:00Z"
    },
    profiles: {
      first_name: "Vikram",
      last_name: "Singh",
      email: "vikram.singh@email.com",
      phone: "+91-9876543214"
    }
  },
  {
    id: "unit-006",
    society_id: "society-003",
    block: "B",
    number: "625",
    owner_id: "owner-006",
    floor_area: 1750,
    bedrooms: 3,
    bathrooms: 3,
    created_at: "2024-02-20T10:00:00Z",
    updated_at: "2024-02-20T10:00:00Z",
    // Display fields
    unit_number: "B-625",
    type: "3bhk",
    area: 1750,
    floor: 6,
    status: "occupied",
    rent_amount: 38000,
    maintenance_amount: 4500,
    images: ["/images/properties/p-11.jpg", "/images/properties/p-12.jpg"],
    tenant_id: "tenant-006",
    parking_slot: "P-B625",
    balcony_count: 3,
    bathroom_count: 3,
    is_furnished: true,
    amenities: ["gym", "parking", "security", "garden"],
    societies: {
      id: "society-003",
      name: "Royal Gardens",
      address: "789 Hill Road, Pune",
      description: "Garden community with family-friendly amenities",
      created_at: "2024-02-01T00:00:00Z",
      updated_at: "2024-02-01T00:00:00Z"
    },
    profiles: {
      first_name: "Kavya",
      last_name: "Nair",
      email: "kavya.nair@email.com",
      phone: "+91-9876543215"
    }
  },
  {
    id: "unit-007",
    society_id: "society-004",
    block: "C",
    number: "730",
    owner_id: "owner-007",
    floor_area: 650,
    bedrooms: 0,
    bathrooms: 1,
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-03-01T10:00:00Z",
    // Display fields
    unit_number: "C-730",
    type: "studio",
    area: 650,
    floor: 7,
    status: "vacant",
    rent_amount: 15000,
    maintenance_amount: 2200,
    images: ["/images/properties/p-13.jpg", "/images/properties/p-14.jpg"],
    tenant_id: null,
    parking_slot: null,
    balcony_count: 1,
    bathroom_count: 1,
    is_furnished: false,
    amenities: ["gym", "security"],
    societies: {
      id: "society-004",
      name: "Tech Hub Residency",
      address: "321 IT Park, Bangalore",
      description: "Smart homes designed for professionals",
      created_at: "2024-02-15T00:00:00Z",
      updated_at: "2024-02-15T00:00:00Z"
    },
    profiles: {
      first_name: "Arjun",
      last_name: "Mehta",
      email: "arjun.mehta@email.com",
      phone: "+91-9876543216"
    }
  },
  {
    id: "unit-008",
    society_id: "society-004",
    block: "D",
    number: "835",
    owner_id: "owner-008",
    floor_area: 1400,
    bedrooms: 2,
    bathrooms: 2,
    created_at: "2024-03-05T10:00:00Z",
    updated_at: "2024-03-05T10:00:00Z",
    // Display fields
    unit_number: "D-835",
    type: "2bhk",
    area: 1400,
    floor: 8,
    status: "occupied",
    rent_amount: 32000,
    maintenance_amount: 4000,
    images: ["/images/properties/p-15.jpg", "/images/properties/p-16.jpg"],
    tenant_id: "tenant-008",
    parking_slot: "P-D835",
    balcony_count: 2,
    bathroom_count: 2,
    is_furnished: true,
    amenities: ["gym", "swimming_pool", "parking", "security"],
    societies: {
      id: "society-004",
      name: "Tech Hub Residency",
      address: "321 IT Park, Bangalore",
      description: "Smart homes designed for professionals",
      created_at: "2024-02-15T00:00:00Z",
      updated_at: "2024-02-15T00:00:00Z"
    },
    profiles: {
      first_name: "Divya",
      last_name: "Agarwal",
      email: "divya.agarwal@email.com",
      phone: "+91-9876543217"
    }
  }
];