// Sample Residents Data for Casa Nirvana
import type { Database } from "@/lib/database.types";
import { avatars } from "@/assets/images/users";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  units?: {
    id: string;
    block: string;
    number: string;
    society_id: string;
  };
  societies?: {
    id: string;
    name: string;
  };
};

export type ResidentProfile = Profile & {
  full_name: string;
  unit_number?: string;
  is_active: boolean;
  avatar_url?: string | null;
};

export const getSampleResidentsData = (): ResidentProfile[] => [
  {
    id: "resident-001",
    first_name: "Rajesh",
    last_name: "Sharma",
    email: "rajesh.sharma@email.com",
    role: "user",
    phone: "+91-9876543210",
    profile_pic_url: avatars.avatar1.src,
    created_at: "2024-01-15T10:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
    full_name: "Rajesh Sharma",
    unit_number: "A-101",
    is_active: true,
    avatar_url: avatars.avatar1.src,
    units: {
      id: "unit-001",
      block: "A",
      number: "101",
      society_id: "society-001"
    },
    societies: {
      id: "society-001",
      name: "Green Valley Apartments"
    }
  },
  {
    id: "resident-002",
    first_name: "Priya",
    last_name: "Patel",
    email: "priya.patel@email.com",
    role: "user",
    phone: "+91-9876543211",
    profile_pic_url: avatars.avatar2.src,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T10:00:00Z",
    full_name: "Priya Patel",
    unit_number: "B-205",
    is_active: true,
    avatar_url: avatars.avatar2.src,
    units: {
      id: "unit-002",
      block: "B",
      number: "205",
      society_id: "society-001"
    },
    societies: {
      id: "society-001",
      name: "Green Valley Apartments"
    }
  },
  {
    id: "resident-003",
    first_name: "Amit",
    last_name: "Kumar",
    email: "amit.kumar@email.com",
    role: "user",
    phone: "+91-9876543212",
    profile_pic_url: avatars.avatar3.src,
    created_at: "2024-02-01T10:00:00Z",
    updated_at: "2024-02-01T10:00:00Z",
    full_name: "Amit Kumar",
    unit_number: "C-310",
    is_active: true,
    avatar_url: avatars.avatar3.src,
    units: {
      id: "unit-003",
      block: "C",
      number: "310",
      society_id: "society-002"
    },
    societies: {
      id: "society-002",
      name: "Sunset Heights"
    }
  },
  {
    id: "resident-004",
    first_name: "Sneha",
    last_name: "Reddy",
    email: "sneha.reddy@email.com",
    role: "user",
    phone: "+91-9876543213",
    profile_pic_url: avatars.avatar4.src,
    created_at: "2024-02-10T10:00:00Z",
    updated_at: "2024-02-10T10:00:00Z",
    full_name: "Sneha Reddy",
    unit_number: "D-415",
    is_active: false,
    avatar_url: avatars.avatar4.src,
    units: {
      id: "unit-004",
      block: "D",
      number: "415",
      society_id: "society-002"
    },
    societies: {
      id: "society-002",
      name: "Sunset Heights"
    }
  },
  {
    id: "resident-005",
    first_name: "Vikram",
    last_name: "Singh",
    email: "vikram.singh@email.com",
    role: "user",
    phone: "+91-9876543214",
    profile_pic_url: avatars.avatar5.src,
    created_at: "2024-02-15T10:00:00Z",
    updated_at: "2024-02-15T10:00:00Z",
    full_name: "Vikram Singh",
    unit_number: "E-520",
    is_active: true,
    avatar_url: avatars.avatar5.src,
    units: {
      id: "unit-005",
      block: "E",
      number: "520",
      society_id: "society-003"
    },
    societies: {
      id: "society-003",
      name: "Royal Gardens"
    }
  },
  {
    id: "resident-006",
    first_name: "Kavya",
    last_name: "Nair",
    email: "kavya.nair@email.com",
    role: "user",
    phone: "+91-9876543215",
    profile_pic_url: avatars.avatar6.src,
    created_at: "2024-02-20T10:00:00Z",
    updated_at: "2024-02-20T10:00:00Z",
    full_name: "Kavya Nair",
    unit_number: "B-625",
    is_active: true,
    avatar_url: avatars.avatar6.src,
    units: {
      id: "unit-006",
      block: "B",
      number: "625",
      society_id: "society-003"
    },
    societies: {
      id: "society-003",
      name: "Royal Gardens"
    }
  },
  {
    id: "resident-007",
    first_name: "Arjun",
    last_name: "Mehta",
    email: "arjun.mehta@email.com",
    role: "user",
    phone: "+91-9876543216",
    profile_pic_url: avatars.avatar7.src,
    created_at: "2024-03-01T10:00:00Z",
    updated_at: "2024-03-01T10:00:00Z",
    full_name: "Arjun Mehta",
    unit_number: "C-730",
    is_active: true,
    avatar_url: avatars.avatar7.src,
    units: {
      id: "unit-007",
      block: "C",
      number: "730",
      society_id: "society-004"
    },
    societies: {
      id: "society-004",
      name: "Tech Hub Residency"
    }
  },
  {
    id: "resident-008",
    first_name: "Divya",
    last_name: "Agarwal",
    email: "divya.agarwal@email.com",
    role: "user",
    phone: "+91-9876543217",
    profile_pic_url: avatars.avatar8.src,
    created_at: "2024-03-05T10:00:00Z",
    updated_at: "2024-03-05T10:00:00Z",
    full_name: "Divya Agarwal",
    unit_number: "D-835",
    is_active: true,
    avatar_url: avatars.avatar8.src,
    units: {
      id: "unit-008",
      block: "D",
      number: "835",
      society_id: "society-004"
    },
    societies: {
      id: "society-004",
      name: "Tech Hub Residency"
    }
  },
  {
    id: "resident-009",
    first_name: "Rahul",
    last_name: "Gupta",
    email: "rahul.gupta@email.com",
    role: "user",
    phone: "+91-9876543218",
    profile_pic_url: avatars.avatar9.src,
    created_at: "2024-03-10T10:00:00Z",
    updated_at: "2024-03-10T10:00:00Z",
    full_name: "Rahul Gupta",
    unit_number: "A-940",
    is_active: true,
    avatar_url: avatars.avatar9.src,
    units: {
      id: "unit-009",
      block: "A",
      number: "940",
      society_id: "society-005"
    },
    societies: {
      id: "society-005",
      name: "Harmony Homes"
    }
  },
  {
    id: "resident-010",
    first_name: "Pooja",
    last_name: "Krishnan",
    email: "pooja.krishnan@email.com",
    role: "user",
    phone: "+91-9876543219",
    profile_pic_url: avatars.avatar10.src,
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-03-15T10:00:00Z",
    full_name: "Pooja Krishnan",
    unit_number: "B-1045",
    is_active: false,
    avatar_url: avatars.avatar10.src,
    units: {
      id: "unit-010",
      block: "B",
      number: "1045",
      society_id: "society-005"
    },
    societies: {
      id: "society-005",
      name: "Harmony Homes"
    }
  },
  {
    id: "resident-011",
    first_name: "Suresh",
    last_name: "Iyer",
    email: "suresh.iyer@email.com",
    role: "user",
    phone: "+91-9876543220",
    profile_pic_url: null,
    created_at: "2024-03-20T10:00:00Z",
    updated_at: "2024-03-20T10:00:00Z",
    full_name: "Suresh Iyer",
    unit_number: "C-1150",
    is_active: true,
    avatar_url: null,
    units: {
      id: "unit-011",
      block: "C",
      number: "1150",
      society_id: "society-001"
    },
    societies: {
      id: "society-001",
      name: "Green Valley Apartments"
    }
  },
  {
    id: "resident-012",
    first_name: "Anita",
    last_name: "Joshi",
    email: "anita.joshi@email.com",
    role: "user",
    phone: "+91-9876543221",
    profile_pic_url: avatars.avatar11.src,
    created_at: "2024-03-25T10:00:00Z",
    updated_at: "2024-03-25T10:00:00Z",
    full_name: "Anita Joshi",
    unit_number: "D-1255",
    is_active: true,
    avatar_url: avatars.avatar11.src,
    units: {
      id: "unit-012",
      block: "D",
      number: "1255",
      society_id: "society-002"
    },
    societies: {
      id: "society-002",
      name: "Sunset Heights"
    }
  }
];
