import { Request, Response, NextFunction } from 'express';
import { createHttpError } from '../lib/httpError';
import { supabase } from '../lib/supabase';

// Guard CRUD operations with all fields support

export interface GuardCreateRequest {
  // Basic Information
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  guard_phone?: string; // Alternative phone field
  date_of_birth?: string;
  address?: string;
  avatar_url?: string;
  
  // Employment Details
  society_id?: string;
  shift_type?: 'morning' | 'evening' | 'night';
  shift_start_time?: string;
  shift_end_time?: string;
  gate_assignment?: string;
  license_number?: string;
  employment_date?: string;
  salary?: number;
  
  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_phone?: string; // Phone field
  
  // System Fields
  role: 'guard';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface GuardUpdateRequest extends Partial<GuardCreateRequest> {}

// Create Guard
export async function createGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const guardData: GuardCreateRequest = req.body;
    
    // First create user in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        first_name: guardData.first_name,
        last_name: guardData.last_name,
        email: guardData.email,
        phone: guardData.phone,
        mobile: guardData.guard_phone, // Alternative phone field
        date_of_birth: guardData.date_of_birth,
        address: guardData.address,
        avatar_url: guardData.avatar_url,
        society_id: guardData.society_id,
        role: 'guard',
        status: guardData.status || 'active',
        emergency_contact_name: guardData.emergency_contact_name,
        emergency_contact_phone: guardData.emergency_contact_phone,
      })
      .select()
      .single();
    
    if (userError) throw userError;
    
    // Then create guard-specific record
    const { data: guardRecord, error: guardError } = await supabase
      .from('guards')
      .insert({
        user_id: userData.id,
        first_name: guardData.first_name,
        last_name: guardData.last_name,
        email: guardData.email,
        phone: guardData.phone,
        guard_phone: guardData.guard_phone,
        license_number: guardData.license_number,
        employment_date: guardData.employment_date,
        shift_type: guardData.shift_type,
        shift_start_time: guardData.shift_start_time,
        shift_end_time: guardData.shift_end_time,
        gate_assignment: guardData.gate_assignment,
        society_id: guardData.society_id,
        status: guardData.status || 'active',
        salary: guardData.salary,
        address: guardData.address,
        emergency_contact_name: guardData.emergency_contact_name,
        emergency_contact_phone: guardData.emergency_contact_phone,
      })
      .select()
      .single();
    
    if (guardError) throw guardError;
    
    res.status(201).json({
      success: true,
      data: guardRecord,
      message: 'Guard created successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Get All Guards
export async function getAllGuards(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const society_id = req.query.society_id as string;
    const status = req.query.status as string;
    const search = req.query.search as string;
    
    let query = supabase
      .from('guards')
      .select('*');
    
    // Apply filters
    if (society_id) {
      query = query.eq('society_id', society_id);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,guard_phone.ilike.%${search}%`);
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

// Get Single Guard
export async function getGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('guards')
      .select(`
        *,
        societies (
          id,
          name,
          address,
          phone,
          manager_contact,
          secretary_contact
        ),
        users (
          id,
          emergency_contact_name,
          emergency_contact_phone
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return next(createHttpError(404, 'GUARD_NOT_FOUND', 'Guard not found'));
    }
    
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

// Update Guard
export async function updateGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const guardData: GuardUpdateRequest = req.body;
    
    // Update guards table
    const { data, error } = await supabase
      .from('guards')
      .update({
        first_name: guardData.first_name,
        last_name: guardData.last_name,
        email: guardData.email,
        phone: guardData.phone,
        guard_phone: guardData.guard_phone,
        license_number: guardData.license_number,
        employment_date: guardData.employment_date,
        shift_type: guardData.shift_type,
        shift_start_time: guardData.shift_start_time,
        shift_end_time: guardData.shift_end_time,
        gate_assignment: guardData.gate_assignment,
        society_id: guardData.society_id,
        status: guardData.status,
        salary: guardData.salary,
        address: guardData.address,
        emergency_contact_name: guardData.emergency_contact_name,
        emergency_contact_phone: guardData.emergency_contact_phone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return next(createHttpError(404, 'GUARD_NOT_FOUND', 'Guard not found'));
    }
    
    // Also update corresponding user record if exists
    if (data.user_id) {
      await supabase
        .from('users')
        .update({
          first_name: guardData.first_name,
          last_name: guardData.last_name,
          email: guardData.email,
          phone: guardData.phone,
          mobile: guardData.guard_phone,
          date_of_birth: guardData.date_of_birth,
          address: guardData.address,
          avatar_url: guardData.avatar_url,
          society_id: guardData.society_id,
          status: guardData.status,
          emergency_contact_name: guardData.emergency_contact_name,
          emergency_contact_phone: guardData.emergency_contact_phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.user_id);
    }
    
    res.json({
      success: true,
      data,
      message: 'Guard updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Delete Guard
export async function deleteGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // Get guard data first to get user_id
    const { data: guardData } = await supabase
      .from('guards')
      .select('user_id')
      .eq('id', id)
      .single();
    
    // Delete guard record
    const { error } = await supabase
      .from('guards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    // Also delete corresponding user record if exists
    if (guardData?.user_id) {
      await supabase
        .from('users')
        .delete()
        .eq('id', guardData.user_id);
    }
    
    res.json({
      success: true,
      message: 'Guard deleted successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Search Guards by Phone
export async function searchGuardsByPhone(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return next(createHttpError(400, 'PHONE_REQUIRED', 'Phone number is required'));
    }
    
    const { data, error } = await supabase
      .from('guards')
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
      .or(`phone.ilike.%${phone}%,guard_phone.ilike.%${phone}%,emergency_contact_phone.ilike.%${phone}%`)
      .eq('status', 'active');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: `Found ${data.length} guards matching phone number`
    });
  } catch (err) {
    next(err);
  }
}
