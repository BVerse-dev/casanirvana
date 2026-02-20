// Sample Societies Data for Casa Nirvana
import type { Database } from "@/lib/database.types";

type Society = Database["public"]["Tables"]["societies"]["Row"];

export const getSampleSocietiesData = (): Society[] => [
  {
    id: "society-001",
    name: "Green Valley Apartments",
    address: "123 Park Avenue, Mumbai",
    description: "Modern residential complex with premium amenities",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z"
  },
  {
    id: "society-002",
    name: "Sunset Heights",
    address: "456 Marine Drive, Mumbai",
    description: "Luxury towers with sea view and world-class facilities",
    created_at: "2024-01-15T00:00:00Z",
    updated_at: "2024-01-15T00:00:00Z"
  },
  {
    id: "society-003",
    name: "Royal Gardens",
    address: "789 Hill Road, Pune",
    description: "Garden community with family-friendly amenities",
    created_at: "2024-02-01T00:00:00Z",
    updated_at: "2024-02-01T00:00:00Z"
  },
  {
    id: "society-004",
    name: "Tech Hub Residency",
    address: "321 IT Park, Bangalore",
    description: "Smart homes designed for professionals",
    created_at: "2024-02-15T00:00:00Z",
    updated_at: "2024-02-15T00:00:00Z"
  },
  {
    id: "society-005",
    name: "Harmony Homes",
    address: "567 Ring Road, Delhi",
    description: "Eco-friendly housing with sustainable living",
    created_at: "2024-03-01T00:00:00Z",
    updated_at: "2024-03-01T00:00:00Z"
  }
];