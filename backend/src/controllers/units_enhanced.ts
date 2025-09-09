import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';

// Unit CRUD operations with all fields support

export interface UnitCreateRequest {
  // Basic Unit Information
  block: string;
  number: string;
  floor: number;
  society_id: string;
  
  // Unit Details
  ownership_type: 'owned' | 'rented';
  floor_area?: number;
  bedrooms?: number;
  bathrooms?: number;
  balconies?: number;
  parking_slots?: number;
  
  // Owner Details
  owner_id?: string;
  owner_name?: string;
  owner_email?: string;
  owner_phone?: string; // PHONE FIELD
  
  // Tenant Details (for rented units)
  tenant_id?: string;
  tenant_name?: string;
  tenant_email?: string;
  tenant_phone?: string; // PHONE FIELD
  
  // Occupancy
  is_occupied?: boolean;
  occupancy_start_date?: string;
  occupancy_end_date?: string;
  
  // Status
  status?: 'active' | 'inactive' | 'suspended' | 'pending';
}

export interface UnitUpdateRequest extends Partial<UnitCreateRequest> {}

// Create Unit
export async function createUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const unitData: UnitCreateRequest = req.body;
    
    const { data, error } = await supabase
      .from('units')
      .insert({
        block: unitData.block,
        number: unitData.number,
        floor: unitData.floor,
        society_id: unitData.society_id,
        ownership_type: unitData.ownership_type,
        floor_area: unitData.floor_area,
        bedrooms: unitData.bedrooms,
        bathrooms: unitData.bathrooms,
        balconies: unitData.balconies,
        parking_slots: unitData.parking_slots || 0,
        owner_id: unitData.owner_id,
        owner_name: unitData.owner_name,
        owner_email: unitData.owner_email,
        owner_phone: unitData.owner_phone,
        tenant_id: unitData.tenant_id,
        tenant_name: unitData.tenant_name,
        tenant_email: unitData.tenant_email,
        tenant_phone: unitData.tenant_phone,
        is_occupied: unitData.is_occupied || false,
        occupancy_start_date: unitData.occupancy_start_date,
        occupancy_end_date: unitData.occupancy_end_date,
        status: unitData.status || 'active',
      })
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data,
      message: 'Unit created successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Get All Units
export async function getAllUnits(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const society_id = req.query.society_id as string;
    const block = req.query.block as string;
    const ownership_type = req.query.ownership_type as string;
    const is_occupied = req.query.is_occupied as string;
    const search = req.query.search as string;
    
    let query = supabase
      .from('units')
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
    
    if (block) {
      query = query.eq('block', block);
    }
    
    if (ownership_type) {
      query = query.eq('ownership_type', ownership_type);
    }
    
    if (is_occupied !== undefined) {
      query = query.eq('is_occupied', is_occupied === 'true');
    }
    
    if (search) {
      query = query.or(`number.ilike.%${search}%,owner_name.ilike.%${search}%,tenant_name.ilike.%${search}%,owner_phone.ilike.%${search}%,tenant_phone.ilike.%${search}%`);
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

// Get Single Unit
export async function getUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('units')
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
        message: 'Unit not found'
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

// Update Unit
export async function updateUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const unitData: UnitUpdateRequest = req.body;
    
    const { data, error } = await supabase
      .from('units')
      .update({
        block: unitData.block,
        number: unitData.number,
        floor: unitData.floor,
        society_id: unitData.society_id,
        ownership_type: unitData.ownership_type,
        floor_area: unitData.floor_area,
        bedrooms: unitData.bedrooms,
        bathrooms: unitData.bathrooms,
        balconies: unitData.balconies,
        parking_slots: unitData.parking_slots,
        owner_id: unitData.owner_id,
        owner_name: unitData.owner_name,
        owner_email: unitData.owner_email,
        owner_phone: unitData.owner_phone,
        tenant_id: unitData.tenant_id,
        tenant_name: unitData.tenant_name,
        tenant_email: unitData.tenant_email,
        tenant_phone: unitData.tenant_phone,
        is_occupied: unitData.is_occupied,
        occupancy_start_date: unitData.occupancy_start_date,
        occupancy_end_date: unitData.occupancy_end_date,
        status: unitData.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    res.json({
      success: true,
      data,
      message: 'Unit updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

// Search Units by Phone (owner or tenant)
export async function searchUnitsByPhone(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }
    
    const { data, error } = await supabase
      .from('units')
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
      .or(`owner_phone.ilike.%${phone}%,tenant_phone.ilike.%${phone}%`)
      .eq('status', 'active');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data,
      message: `Found ${data.length} units with matching phone numbers`
    });
  } catch (err) {
    next(err);
  }
}

// Get Units by Society
export async function getUnitsBySociety(req: Request, res: Response, next: NextFunction) {
  try {
    const { society_id } = req.params;
    
    const { data, error } = await supabase
      .from('units')
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
      .eq('society_id', society_id)
      .eq('status', 'active')
      .order('block')
      .order('number');
    
    if (error) throw error;
    
    res.json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
}

// Delete Unit
export async function deleteUnit(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    // First check if unit exists
    const { data: existingUnit, error: fetchError } = await supabase
      .from('units')
      .select('id, block, number')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!existingUnit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found'
      });
    }
    
    // Delete the unit
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({
      success: true,
      message: `Unit ${existingUnit.block}-${existingUnit.number} deleted successfully`
    });
  } catch (err) {
    next(err);
  }
}
