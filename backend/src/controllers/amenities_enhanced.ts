import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

// Amenity CRUD operations with all fields support

export interface AmenityCreateRequest {
  // Basic Information
  name: string;
  description?: string;
  amenity_type: string;
  location?: string;
  capacity?: number;
  
  // Booking Rules
  is_active?: boolean;
  is_paid?: boolean;
  price?: number;
  price_per_hour?: number;
  advance_booking_hours?: number;
  max_advance_booking_days?: number;
  minimum_booking_duration_hours?: number;
  maximum_booking_duration_hours?: number;
  booking_slots_per_day?: number;
  booking_cancellation_hours?: number;
  
  // Contact and Schedule
  contact_person?: string;
  contact_phone?: string; // PHONE FIELD
  availability_schedule?: any; // JSONB
  maintenance_schedule?: any; // JSONB
  rules?: string;
  
  // Society and Images
  society_id: string;
  images?: string[]; // Array of image URLs
}

export interface AmenityUpdateRequest extends Partial<AmenityCreateRequest> {}

export interface AmenityBookingCreateRequest {
  amenity_id: string;
  unit_id: string;
  booked_by: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount?: number;
  payment_status?: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_id?: string;
  status?: string;
  contact_phone?: string; // PHONE FIELD
}

// Create Amenity
export async function createAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    const amenityData: AmenityCreateRequest = req.body;
    
    const { data, error } = await supabase
      .from('amenities')
      .insert({
        name: amenityData.name,
        description: amenityData.description,
        amenity_type: amenityData.amenity_type,
        location: amenityData.location,
        capacity: amenityData.capacity,
        is_active: amenityData.is_active ?? true,
        is_paid: amenityData.is_paid ?? false,
        price: amenityData.price,
        price_per_hour: amenityData.price_per_hour,
        advance_booking_hours: amenityData.advance_booking_hours ?? 24,
        max_advance_booking_days: amenityData.max_advance_booking_days ?? 30,
        minimum_booking_duration_hours: amenityData.minimum_booking_duration_hours ?? 1,
        maximum_booking_duration_hours: amenityData.maximum_booking_duration_hours ?? 8,
        booking_slots_per_day: amenityData.booking_slots_per_day ?? 1,
        booking_cancellation_hours: amenityData.booking_cancellation_hours ?? 24,
        contact_person: amenityData.contact_person,
        contact_phone: amenityData.contact_phone,
        availability_schedule: amenityData.availability_schedule,
        maintenance_schedule: amenityData.maintenance_schedule,
        rules: amenityData.rules,
        society_id: amenityData.society_id,
        images: amenityData.images || [],
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data,
      message: 'Amenity created successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Get All Amenities
export async function getAllAmenities(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const society_id = req.query.society_id as string;
    const amenity_type = req.query.amenity_type as string;
    const is_active = req.query.is_active as string;
    const is_paid = req.query.is_paid as string;
    const search = req.query.search as string;
    
    let query = supabase
      .from('amenities')
      .select(`
        *,
        societies (
          id,
          name,
          address,
          phone,
          manager_contact,
          secretary_contact
        )
      `);
    
    // Apply filters
    if (society_id) {
      query = query.eq('society_id', society_id);
    }
    
    if (amenity_type) {
      query = query.eq('amenity_type', amenity_type);
    }
    
    if (is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    
    if (is_paid !== undefined) {
      query = query.eq('is_paid', is_paid === 'true');
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,contact_person.ilike.%${search}%,contact_phone.ilike.%${search}%`);
    }
    
    // Apply pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (err) {
    next(err);
  }
}

// Get Single Amenity
export async function getAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('amenities')
      .select(`
        *,
        societies (
          id,
          name,
          address,
          phone,
          manager_contact,
          secretary_contact
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Amenity not found'
      });
    }
    
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

// Update Amenity
export async function updateAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const amenityData: AmenityUpdateRequest = req.body;
    
    const { data, error } = await supabase
      .from('amenities')
      .update({
        name: amenityData.name,
        description: amenityData.description,
        amenity_type: amenityData.amenity_type,
        location: amenityData.location,
        capacity: amenityData.capacity,
        is_active: amenityData.is_active,
        is_paid: amenityData.is_paid,
        price: amenityData.price,
        price_per_hour: amenityData.price_per_hour,
        advance_booking_hours: amenityData.advance_booking_hours,
        max_advance_booking_days: amenityData.max_advance_booking_days,
        minimum_booking_duration_hours: amenityData.minimum_booking_duration_hours,
        maximum_booking_duration_hours: amenityData.maximum_booking_duration_hours,
        booking_slots_per_day: amenityData.booking_slots_per_day,
        booking_cancellation_hours: amenityData.booking_cancellation_hours,
        contact_person: amenityData.contact_person,
        contact_phone: amenityData.contact_phone,
        availability_schedule: amenityData.availability_schedule,
        maintenance_schedule: amenityData.maintenance_schedule,
        rules: amenityData.rules,
        society_id: amenityData.society_id,
        images: amenityData.images,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Amenity not found'
      });
    }
    
    res.json({
      success: true,
      data,
      message: 'Amenity updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Create Amenity Booking
export async function createAmenityBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const bookingData: AmenityBookingCreateRequest = req.body;
    
    // Check for conflicting bookings
    const { data: existingBooking } = await supabase
      .from('amenity_bookings')
      .select('id')
      .eq('amenity_id', bookingData.amenity_id)
      .eq('booking_date', bookingData.booking_date)
      .eq('start_time', bookingData.start_time)
      .single();
    
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already booked'
      });
    }
    
    const { data, error } = await supabase
      .from('amenity_bookings')
      .insert({
        amenity_id: bookingData.amenity_id,
        unit_id: bookingData.unit_id,
        booked_by: bookingData.booked_by,
        booking_date: bookingData.booking_date,
        start_time: bookingData.start_time,
        end_time: bookingData.end_time,
        total_amount: bookingData.total_amount,
        payment_status: bookingData.payment_status || 'pending',
        payment_id: bookingData.payment_id,
        status: bookingData.status || 'confirmed',
        contact_phone: bookingData.contact_phone,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data,
      message: 'Amenity booking created successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Search Amenities by Contact Phone
export async function searchAmenitiesByPhone(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    const { data, error } = await supabase
      .from('amenities')
      .select(`
        *,
        societies (
          id,
          name,
          phone,
          manager_contact,
          secretary_contact
        )
      `)
      .ilike('contact_phone', `%${phone}%`)
      .eq('is_active', true);
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: `Found ${data.length} amenities with matching contact phone`
    });
  } catch (err) {
    next(err);
  }
}

// Get Amenity Bookings
export async function getAmenityBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const { amenity_id } = req.params;
    const date = req.query.date as string;
    
    let query = supabase
      .from('amenity_bookings')
      .select(`
        *,
        amenities (
          id,
          name,
          contact_phone
        ),
        units (
          id,
          block,
          number,
          owner_phone,
          tenant_phone
        )
      `)
      .eq('amenity_id', amenity_id);
    
    if (date) {
      query = query.eq('booking_date', date);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

// Delete Amenity
export async function deleteAmenity(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // First check if amenity exists
    const { data: existingAmenity, error: fetchError } = await supabase
      .from('amenities')
      .select('id, name')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!existingAmenity) {
      return res.status(404).json({
        success: false,
        message: 'Amenity not found'
      });
    }
    
    // Delete the amenity
    const { error } = await supabase
      .from('amenities')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: `Amenity "${existingAmenity.name}" deleted successfully`
    });
  } catch (err) {
    next(err);
  }
}
