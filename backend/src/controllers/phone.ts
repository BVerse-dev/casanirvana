import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

/**
 * Enhanced backend controllers with comprehensive phone field support
 */

// Visitor Pass Management with Phone Fields
export async function createVisitorPass(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      visitor_name, 
      visitor_phone, 
      host_phone, 
      unit_id, 
      from_date, 
      to_date, 
      purpose,
      vehicle_number 
    } = req.body;

    const { data, error } = await supabase
      .from('visitor_passes')
      .insert({
        visitor_name,
        visitor_phone,
        host_phone,
        unit_id,
        from_date,
        to_date,
        purpose,
        vehicle_number,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create visitor pass', details: error });
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function getVisitorPasses(req: Request, res: Response, next: NextFunction) {
  try {
    const { society_id, status, search } = req.query;
    
    let query = supabase
      .from('visitor_passes')
      .select(`
        *,
        units:unit_id(block, number, society_id),
        created_by_user:created_by(first_name, last_name, phone)
      `);

    if (society_id) {
      query = query.eq('units.society_id', society_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`visitor_name.ilike.%${search}%,visitor_phone.ilike.%${search}%`);
    }

    const { data, error } = await query
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch visitor passes', details: error });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

// Unit Management with Owner/Tenant Phone Fields
export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      block,
      number,
      society_id,
      owner_name,
      owner_email,
      owner_phone,
      tenant_name,
      tenant_email,
      tenant_phone,
      ownership_type
    } = req.body;

    const { data, error } = await supabase
      .from('units')
      .insert({
        block,
        number,
        society_id,
        owner_name,
        owner_email,
        owner_phone,
        tenant_name,
        tenant_email,
        tenant_phone,
        ownership_type: ownership_type || 'owned'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create unit', details: error });
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

export async function updateUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Ensure phone fields are properly handled
    const allowedFields = [
      'block', 'number', 'floor', 'floor_area', 'bedrooms', 'bathrooms',
      'owner_name', 'owner_email', 'owner_phone',
      'tenant_name', 'tenant_email', 'tenant_phone',
      'ownership_type', 'is_occupied'
    ];

    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {} as any);

    const { data, error } = await supabase
      .from('units')
      .update(filteredData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update unit', details: error });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

// Guard Management with Phone Fields
export async function createGuard(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      guard_phone,
      emergency_contact_name,
      emergency_contact_phone,
      society_id,
      shift_type,
      license_number
    } = req.body;

    const { data, error } = await supabase
      .from('guards')
      .insert({
        first_name,
        last_name,
        email,
        phone,
        guard_phone,
        emergency_contact_name,
        emergency_contact_phone,
        society_id,
        shift_type,
        license_number,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to create guard', details: error });
    }

    res.status(201).json(data);
  } catch (err) {
    next(err);
  }
}

// Society Management with Contact Phone Fields
export async function updateSociety(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      phone,
      manager_name,
      manager_contact,
      secretary_name,
      secretary_contact,
      ...otherData
    } = req.body;

    const { data, error } = await supabase
      .from('societies')
      .update({
        name,
        address,
        phone,
        manager_name,
        manager_contact,
        secretary_name,
        secretary_contact,
        ...otherData
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Failed to update society', details: error });
    }

    res.json(data);
  } catch (err) {
    next(err);
  }
}

// Search functionality across phone fields
export async function searchByPhone(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, society_id } = req.query;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const phonePattern = `%${phone}%`;

    // Search across multiple tables
    const [users, guards, visitorPasses, units] = await Promise.all([
      // Search users
      supabase
        .from('users')
        .select('*, units(*)')
        .eq('society_id', society_id)
        .or(`phone.ilike.${phonePattern},mobile.ilike.${phonePattern},emergency_contact_phone.ilike.${phonePattern}`)
        .limit(10),

      // Search guards
      supabase
        .from('guards')
        .select('*')
        .eq('society_id', society_id)
        .or(`phone.ilike.${phonePattern},guard_phone.ilike.${phonePattern},emergency_contact_phone.ilike.${phonePattern}`)
        .limit(10),

      // Search visitor passes
      supabase
        .from('visitor_passes')
        .select('*, units(block, number)')
        .or(`visitor_phone.ilike.${phonePattern},host_phone.ilike.${phonePattern}`)
        .limit(10),

      // Search units by owner/tenant phone
      supabase
        .from('units')
        .select('*')
        .eq('society_id', society_id)
        .or(`owner_phone.ilike.${phonePattern},tenant_phone.ilike.${phonePattern}`)
        .limit(10)
    ]);

    res.json({
      users: users.data || [],
      guards: guards.data || [],
      visitor_passes: visitorPasses.data || [],
      units: units.data || []
    });
  } catch (err) {
    next(err);
  }
}

// Phone number validation utility
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Check for valid patterns (adjust based on your requirements)
  return digits.length >= 10 && digits.length <= 13;
}

// Phone number formatting utility
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const digits = phone.replace(/\D/g, '');
  
  // Format for Indian numbers (adjust as needed)
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  return phone;
}
