"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAdminApi } from "@/hooks/useAdminApi";

const DEFAULT_OPERATING_HOURS = {
  open: "06:00",
  close: "22:00",
  days: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
};

const toTimeHHMM = (value?: string | null) => {
  if (!value) return undefined;
  const text = String(value).trim();
  if (!text) return undefined;
  if (/^\d{2}:\d{2}:\d{2}$/.test(text)) return text.slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(text)) return text;
  return undefined;
};

const pickDefined = <T>(...values: (T | undefined | null)[]): T | undefined => {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
};

const normalizeCategoryFromAmenityType = (amenityType?: string) => {
  const normalized = (amenityType || "").toLowerCase();
  switch (normalized) {
    case "fitness":
      return "fitness";
    case "utility":
      return "utility";
    case "security":
      return "security";
    case "convenience":
      return "convenience";
    case "outdoor":
      return "outdoor";
    case "community":
      return "community";
    default:
      return "recreation";
  }
};

const toLegacyAmenityType = (category?: string) => {
  if (!category) return "Common";
  return category.charAt(0).toUpperCase() + category.slice(1);
};

const buildAmenityListQuery = (filters?: {
  communityId?: string;
  amenityType?: string;
  isActive?: boolean;
  isPaid?: boolean;
  search?: string;
  status?: string;
}) => {
  const params = new URLSearchParams();

  if (filters?.communityId) {
    params.set("community_id", filters.communityId);
  }

  if (filters?.amenityType) {
    params.set("amenity_type", filters.amenityType);
  }

  if (typeof filters?.isActive === "boolean") {
    params.set("is_active", String(filters.isActive));
  }

  if (typeof filters?.isPaid === "boolean") {
    params.set("is_paid", String(filters.isPaid));
  }

  if (filters?.search) {
    params.set("search", filters.search);
  }

  if (filters?.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

const buildAmenityBookingListQuery = (filters?: {
  amenityId?: string;
  communityId?: string;
  paymentStatus?: string;
  search?: string;
  status?: string;
}) => {
  const params = new URLSearchParams();

  if (filters?.amenityId) {
    params.set("amenity_id", filters.amenityId);
  }

  if (filters?.communityId) {
    params.set("community_id", filters.communityId);
  }

  if (filters?.paymentStatus) {
    params.set("payment_status", filters.paymentStatus);
  }

  if (filters?.search) {
    params.set("search", filters.search);
  }

  if (filters?.status) {
    params.set("status", filters.status);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
};

export interface Amenity {
  id: string;
  name: string;
  description: string;
  category:
    | "recreation"
    | "fitness"
    | "utility"
    | "security"
    | "convenience"
    | "outdoor"
    | "community";
  community_id: string;
  communityName?: string;
  type: "free" | "paid" | "subscription" | "booking_required";
  location: string;
  capacity?: number;
  status: "active" | "inactive" | "maintenance" | "coming_soon" | "renovation";
  operating_hours: {
    open: string;
    close: string;
    days: string[];
  };
  booking_required: boolean;
  advance_booking_days: number;
  max_booking_duration: number;
  charges_per_hour?: number;
  monthly_charges?: number;
  security_deposit?: number;
  amenity_features?: string[];
  contact_person?: string;
  contact_phone?: string;
  maintenance_frequency: string;
  last_maintenance?: string;
  total_bookings: number;
  active_bookings: number;
  monthly_revenue: number;
  average_rating: number;
  images?: string[];
  rules?: string;
  created_at: string;
  updated_at: string;

  is_paid?: boolean;
  is_active?: boolean;
  price_per_hour?: number;
  amenity_type?: string;
  availability_start?: string;
  availability_end?: string;
  booking_limit_per_day?: number;
  cancellation_policy?: string;
  rules_and_regulations?: string;
  contact_number?: string;
  societies?: { name: string | null };
}

export interface AmenityFormData {
  name: string;
  description: string;
  category: string;
  communityId: string;
  type: string;
  location: string;
  capacity?: number;
  status: string;
  operatingHours: {
    open: string;
    close: string;
    days: string[];
  };
  bookingRequired: boolean;
  advanceBookingDays: number;
  maxBookingDuration: number;
  chargesPerHour?: number;
  monthlyCharges?: number;
  securityDeposit?: number;
  amenityFeatures?: string[];
  contactPerson?: string;
  contactPhone?: string;
  maintenanceFrequency: string;
  lastMaintenance?: string;
  rules: string[];
  images?: string[];
}

type FlexibleAmenityFormData = AmenityFormData &
  Partial<{
    advance_booking_hours: number;
    availability_schedule: Record<string, unknown>;
    availability_end: string;
    availability_start: string;
    booking_cancellation_hours: number;
    booking_limit_per_day: number;
    booking_slots_per_day: number;
    cancellation_policy: string;
    community_id: string;
    contact_person: string;
    contact_number: string;
    contact_phone: string;
    is_active: boolean;
    is_paid: boolean;
    maintenance_schedule: Record<string, unknown> | string;
    max_advance_booking_days: number;
    max_booking_duration: number;
    maximum_booking_duration_hours: number;
    minimum_booking_duration_hours: number;
    price: number;
    price_per_hour: number;
    rules_and_regulations: string;
    amenity_type: string;
  }>;

export interface AmenityStats {
  totalAmenities: number;
  activeAmenities: number;
  totalBookings: number;
  totalRevenue: number;
  categoryDistribution: Record<string, number>;
  averageRating: number;
}

type AmenityListPayload = {
  data: Array<Record<string, any>>;
};

type AmenityRecordPayload = {
  data: Record<string, any> | null;
};

const transformAmenityFromDB = (amenity: any): Amenity => {
  const operatingHours = amenity.operating_hours || {
    open: toTimeHHMM(amenity.availability_start) || DEFAULT_OPERATING_HOURS.open,
    close: toTimeHHMM(amenity.availability_end) || DEFAULT_OPERATING_HOURS.close,
    days: DEFAULT_OPERATING_HOURS.days,
  };
  const category = amenity.category || normalizeCategoryFromAmenityType(amenity.amenity_type);
  const type = amenity.type || (amenity.is_paid ? "paid" : "free");
  const status = amenity.status || (amenity.is_active === false ? "inactive" : "active");
  const communityName = amenity.communities?.name || amenity.communityName || "Unknown Community";
  const normalizedRules = pickDefined(amenity.rules, amenity.rules_and_regulations, "") as string;
  const isPaid = pickDefined<boolean>(amenity.is_paid, type === "paid" || type === "subscription") || false;

  return {
    id: amenity.id,
    name: amenity.name || "Unnamed Amenity",
    description: amenity.description || "",
    category,
    community_id: amenity.community_id,
    communityName,
    type,
    location: amenity.location || "",
    capacity: amenity.capacity,
    status,
    operating_hours: operatingHours,
    booking_required: amenity.booking_required || false,
    advance_booking_days: amenity.advance_booking_days || 0,
    max_booking_duration: amenity.max_booking_duration || 2,
    charges_per_hour: Number(amenity.charges_per_hour) || 0,
    monthly_charges: Number(amenity.monthly_charges) || 0,
    security_deposit: Number(amenity.security_deposit) || 0,
    amenity_features: amenity.amenity_features || [],
    contact_person: amenity.contact_person,
    contact_phone: amenity.contact_phone,
    maintenance_frequency: amenity.maintenance_frequency || "weekly",
    last_maintenance: amenity.last_maintenance,
    total_bookings: amenity.total_bookings || 0,
    active_bookings: amenity.active_bookings || 0,
    monthly_revenue: Number(amenity.monthly_revenue) || 0,
    average_rating: Number(amenity.average_rating) || 0,
    images: amenity.images || [],
    rules: normalizedRules,
    created_at: amenity.created_at,
    updated_at: amenity.updated_at,
    is_paid: isPaid,
    is_active: pickDefined<boolean>(amenity.is_active, status === "active"),
    price_per_hour: Number(pickDefined(amenity.price_per_hour, amenity.charges_per_hour)) || 0,
    amenity_type: amenity.amenity_type || toLegacyAmenityType(category),
    availability_start:
      toTimeHHMM(pickDefined(amenity.availability_start, operatingHours.open)) || DEFAULT_OPERATING_HOURS.open,
    availability_end:
      toTimeHHMM(pickDefined(amenity.availability_end, operatingHours.close)) || DEFAULT_OPERATING_HOURS.close,
    booking_limit_per_day: Number(amenity.booking_limit_per_day) || 1,
    cancellation_policy: amenity.cancellation_policy,
    rules_and_regulations: amenity.rules_and_regulations || normalizedRules,
    contact_number: amenity.contact_number || amenity.contact_phone,
    societies: { name: communityName },
  };
};

const transformAmenityToDB = (formData: FlexibleAmenityFormData) => {
  const category = pickDefined(
    formData.category,
    normalizeCategoryFromAmenityType(formData.amenity_type),
    "recreation",
  ) as string;
  const type = pickDefined(formData.type, formData.is_paid ? "paid" : "free", "free") as string;
  const status = pickDefined(
    formData.status,
    formData.is_active === false ? "inactive" : "active",
    "active",
  ) as string;
  const operatingOpen =
    toTimeHHMM(pickDefined(formData.operatingHours?.open, formData.availability_start)) ||
    DEFAULT_OPERATING_HOURS.open;
  const operatingClose =
    toTimeHHMM(pickDefined(formData.operatingHours?.close, formData.availability_end)) ||
    DEFAULT_OPERATING_HOURS.close;
  const operatingHours = {
    open: operatingOpen,
    close: operatingClose,
    days: formData.operatingHours?.days?.length ? formData.operatingHours.days : DEFAULT_OPERATING_HOURS.days,
  };
  const rulesText = Array.isArray(formData.rules)
    ? formData.rules.filter(Boolean).join("\n")
    : (pickDefined(formData.rules_and_regulations, "") as string);
  const chargesPerHour = Number(pickDefined(formData.chargesPerHour, formData.price_per_hour, formData.price, 0));
  const advanceBookingHours = Number(pickDefined(formData.advance_booking_hours, 0));
  const advanceBookingDays = Number(
    pickDefined(
      formData.advanceBookingDays,
      formData.max_advance_booking_days,
      advanceBookingHours > 0 ? Math.ceil(advanceBookingHours / 24) : 0,
      0,
    ),
  );
  const maxBookingDuration = Number(
    pickDefined(formData.maxBookingDuration, formData.max_booking_duration, formData.maximum_booking_duration_hours, 2),
  );

  return {
    name: formData.name,
    description: formData.description,
    category,
    community_id: pickDefined(formData.communityId, formData.community_id),
    type,
    location: formData.location,
    capacity: formData.capacity,
    status,
    operating_hours: operatingHours,
    booking_required: pickDefined(formData.bookingRequired, true),
    advance_booking_days: advanceBookingDays,
    advance_booking_hours: advanceBookingHours,
    max_advance_booking_days: advanceBookingDays,
    max_booking_duration: maxBookingDuration,
    maximum_booking_duration_hours: maxBookingDuration,
    minimum_booking_duration_hours: Number(pickDefined(formData.minimum_booking_duration_hours, 1)),
    charges_per_hour: chargesPerHour,
    monthly_charges: Number(pickDefined(formData.monthlyCharges, 0)),
    security_deposit: Number(pickDefined(formData.securityDeposit, 0)),
    amenity_features: formData.amenityFeatures,
    contact_person: pickDefined(formData.contactPerson, formData.contact_person),
    contact_phone: pickDefined(formData.contactPhone, formData.contact_phone, formData.contact_number),
    maintenance_frequency: pickDefined(formData.maintenanceFrequency, "weekly"),
    maintenance_schedule: formData.maintenance_schedule,
    last_maintenance: formData.lastMaintenance,
    rules: rulesText,
    images: formData.images,
    amenity_type: pickDefined(formData.amenity_type, toLegacyAmenityType(category)),
    is_paid: pickDefined(formData.is_paid, type === "paid" || type === "subscription"),
    is_active: pickDefined(formData.is_active, status === "active"),
    price: chargesPerHour,
    price_per_hour: chargesPerHour,
    availability_start: operatingOpen,
    availability_end: operatingClose,
    booking_limit_per_day: Number(pickDefined(formData.booking_limit_per_day, 1)),
    booking_slots_per_day: Number(pickDefined(formData.booking_slots_per_day, formData.booking_limit_per_day, 1)),
    booking_cancellation_hours: Number(pickDefined(formData.booking_cancellation_hours, 24)),
    cancellation_policy: formData.cancellation_policy,
    rules_and_regulations: pickDefined(formData.rules_and_regulations, rulesText),
    contact_number: pickDefined(formData.contact_number, formData.contact_phone, formData.contactPhone),
    availability_schedule: formData.availability_schedule,
  };
};

const amenitiesQueryKey = ["admin-amenities"] as const;
const amenityDetailQueryKey = (id?: string) => ["admin-amenities", "detail", id || ""] as const;
const amenityBookingsQueryKey = ["admin-amenity-bookings"] as const;
const amenityBookingDetailQueryKey = (id?: string) =>
  ["admin-amenity-bookings", "detail", id || ""] as const;

export const useAmenitiesRealtime = () => {};
export const useAmenityBookingsRealtime = () => {};

export const useListAmenities = (filters?: Parameters<typeof buildAmenityListQuery>[0]) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useAmenitiesRealtime();

  return useQuery({
    queryKey: [...amenitiesQueryKey, filters || {}],
    enabled: hasToken,
    queryFn: async (): Promise<Amenity[]> => {
      const payload = await fetchAdmin<AmenityListPayload>(
        `/admin/amenities${buildAmenityListQuery(filters)}`,
      );
      return (payload.data || []).map(transformAmenityFromDB);
    },
  });
};

export const useGetAmenity = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useAmenitiesRealtime();

  return useQuery({
    queryKey: amenityDetailQueryKey(id),
    enabled: hasToken && Boolean(id),
    queryFn: async (): Promise<Amenity> => {
      const payload = await fetchAdmin<AmenityRecordPayload>(`/admin/amenities/${id}`);
      return transformAmenityFromDB(payload.data);
    },
  });
};

export const useCreateAmenity = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (amenityData: AmenityFormData): Promise<Amenity> => {
      const payload = await fetchAdmin<AmenityRecordPayload>("/admin/amenities", {
        method: "POST",
        body: JSON.stringify(transformAmenityToDB(amenityData as FlexibleAmenityFormData)),
      });

      return transformAmenityFromDB(payload.data);
    },
    onSuccess: (createdAmenity) => {
      queryClient.invalidateQueries({ queryKey: amenitiesQueryKey });
      queryClient.invalidateQueries({ queryKey: amenityBookingsQueryKey });
      queryClient.setQueryData(amenityDetailQueryKey(createdAmenity.id), createdAmenity);
    },
  });
};

export const useUpdateAmenity = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({
      id,
      ...amenityData
    }: Partial<AmenityFormData> & { id: string } & Record<string, any>): Promise<Amenity> => {
      const payload = await fetchAdmin<AmenityRecordPayload>(`/admin/amenities/${id}`, {
        method: "PUT",
        body: JSON.stringify(transformAmenityToDB(amenityData as FlexibleAmenityFormData)),
      });

      return transformAmenityFromDB(payload.data);
    },
    onSuccess: (updatedAmenity) => {
      queryClient.invalidateQueries({ queryKey: amenitiesQueryKey });
      queryClient.invalidateQueries({ queryKey: amenityBookingsQueryKey });
      queryClient.setQueryData(amenityDetailQueryKey(updatedAmenity.id), updatedAmenity);
    },
  });
};

export const useDeleteAmenity = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await fetchAdmin(`/admin/amenities/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesQueryKey });
      queryClient.invalidateQueries({ queryKey: amenityBookingsQueryKey });
    },
  });
};

export const useAmenitiesStats = () => {
  const { fetchAdmin, hasToken } = useAdminApi();

  return useQuery({
    queryKey: ["admin-amenities", "stats"],
    enabled: hasToken,
    queryFn: async (): Promise<AmenityStats> => {
      const [amenitiesPayload, bookingsPayload] = await Promise.all([
        fetchAdmin<AmenityListPayload>("/admin/amenities"),
        fetchAdmin<{ data: Array<Record<string, any>> }>("/admin/amenity-bookings"),
      ]);

      const amenities = (amenitiesPayload.data || []).map(transformAmenityFromDB);
      const bookings = (bookingsPayload.data || []).map(transformBookingFromDB);

      return {
        totalAmenities: amenities.length,
        activeAmenities: amenities.filter((amenity) => amenity.status === "active").length,
        totalBookings: bookings.length,
        totalRevenue: bookings
          .filter((booking) => booking.payment_status === "paid")
          .reduce((sum, booking) => sum + Number(booking.total_amount || booking.amount || 0), 0),
        categoryDistribution: amenities.reduce((accumulator: Record<string, number>, amenity) => {
          accumulator[amenity.category] = (accumulator[amenity.category] || 0) + 1;
          return accumulator;
        }, {}),
        averageRating:
          amenities.length > 0
            ? amenities.reduce((sum, amenity) => sum + Number(amenity.average_rating || 0), 0) / amenities.length
            : 0,
      };
    },
  });
};

export interface AmenityBooking {
  id: string;
  amenity_id: string;
  user_id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  total_amount: number;
  amount?: number;
  created_at: string;
  updated_at: string;
  notes?: string | null;
  special_requests?: string | null;
  amenities?: {
    id: string;
    name: string;
    description?: string | null;
    amenity_type?: string | null;
  } | null;
  user_profile?: {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string | null;
    email: string;
    phone?: string | null;
  } | null;
}

export interface CreateAmenityBookingData {
  amenity_id: string;
  user_id: string;
  booking_date?: string;
  start_time?: string;
  end_time?: string;
  start_datetime?: string;
  end_datetime?: string;
  total_days?: number;
  amount?: number;
  total_amount?: number;
  community_id?: string;
  is_paid?: boolean;
  status?: AmenityBooking["status"];
  payment_status?: AmenityBooking["payment_status"];
  notes?: string;
  special_requests?: string;
}

type AmenityBookingListPayload = {
  data: Array<Record<string, any>>;
};

type AmenityBookingRecordPayload = {
  data: Record<string, any> | null;
};

const transformBookingFromDB = (booking: any): AmenityBooking => ({
  id: booking.id,
  amenity_id: booking.amenity_id,
  user_id: booking.user_id,
  booking_date: booking.booking_date || (booking.start_datetime ? booking.start_datetime.slice(0, 10) : ""),
  start_time:
    booking.start_time ||
    (booking.start_datetime ? new Date(booking.start_datetime).toISOString().slice(11, 19) : ""),
  end_time:
    booking.end_time ||
    (booking.end_datetime ? new Date(booking.end_datetime).toISOString().slice(11, 19) : ""),
  status: booking.status || "pending",
  payment_status: booking.payment_status || "pending",
  total_amount: Number(pickDefined(booking.total_amount, booking.amount, 0)) || 0,
  amount: Number(booking.amount) || 0,
  created_at: booking.created_at,
  updated_at: booking.updated_at,
  notes: booking.notes || null,
  special_requests: booking.special_requests || null,
  amenities: booking.amenities,
  user_profile: booking.user_profile || booking.profiles || null,
});

const serializeAmenityBookingCreate = (bookingData: CreateAmenityBookingData) => ({
  amenity_id: bookingData.amenity_id,
  user_id: bookingData.user_id,
  booking_date: bookingData.booking_date,
  start_time: bookingData.start_time,
  end_time: bookingData.end_time,
  start_datetime: bookingData.start_datetime,
  end_datetime: bookingData.end_datetime,
  total_days: bookingData.total_days,
  amount: bookingData.amount,
  total_amount: bookingData.total_amount,
  community_id: bookingData.community_id,
  is_paid: bookingData.is_paid,
  status: bookingData.status,
  payment_status: bookingData.payment_status,
});

const serializeAmenityBookingUpdate = (updates: Partial<CreateAmenityBookingData>) => ({
  status: updates.status,
  payment_status: updates.payment_status,
});

export const useListAmenityBookings = (
  filters?: Parameters<typeof buildAmenityBookingListQuery>[0],
) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useAmenityBookingsRealtime();

  return useQuery({
    queryKey: [...amenityBookingsQueryKey, filters || {}],
    enabled: hasToken,
    queryFn: async (): Promise<AmenityBooking[]> => {
      const payload = await fetchAdmin<AmenityBookingListPayload>(
        `/admin/amenity-bookings${buildAmenityBookingListQuery(filters)}`,
      );
      return (payload.data || []).map(transformBookingFromDB);
    },
  });
};

export const useGetAmenityBooking = (id: string) => {
  const { fetchAdmin, hasToken } = useAdminApi();

  useAmenityBookingsRealtime();

  return useQuery({
    queryKey: amenityBookingDetailQueryKey(id),
    enabled: hasToken && Boolean(id),
    queryFn: async (): Promise<AmenityBooking | null> => {
      const payload = await fetchAdmin<AmenityBookingRecordPayload>(`/admin/amenity-bookings/${id}`);
      return payload.data ? transformBookingFromDB(payload.data) : null;
    },
  });
};

export const useCreateAmenityBooking = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (bookingData: CreateAmenityBookingData): Promise<AmenityBooking> => {
      const payload = await fetchAdmin<AmenityBookingRecordPayload>("/admin/amenity-bookings", {
        method: "POST",
        body: JSON.stringify(serializeAmenityBookingCreate(bookingData)),
      });

      return transformBookingFromDB(payload.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenitiesQueryKey });
      queryClient.invalidateQueries({ queryKey: amenityBookingsQueryKey });
    },
  });
};

export const useUpdateAmenityBooking = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<CreateAmenityBookingData>;
    }): Promise<AmenityBooking> => {
      const payload = await fetchAdmin<AmenityBookingRecordPayload>(`/admin/amenity-bookings/${id}`, {
        method: "PATCH",
        body: JSON.stringify(serializeAmenityBookingUpdate(updates)),
      });

      return transformBookingFromDB(payload.data);
    },
    onSuccess: (updatedBooking) => {
      queryClient.invalidateQueries({ queryKey: amenityBookingsQueryKey });
      queryClient.invalidateQueries({ queryKey: amenitiesQueryKey });
      queryClient.setQueryData(amenityBookingDetailQueryKey(updatedBooking.id), updatedBooking);
    },
  });
};

export const useDeleteAmenityBooking = () => {
  const queryClient = useQueryClient();
  const { fetchAdmin } = useAdminApi();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      await fetchAdmin(`/admin/amenity-bookings/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: amenityBookingsQueryKey });
      queryClient.invalidateQueries({ queryKey: amenitiesQueryKey });
    },
  });
};
