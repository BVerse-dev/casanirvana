import { supabase } from '../lib/supabase';

export async function getMaintenanceByUnit(unitId: string) {
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createMaintenance(data: {
  unit_id: string;
  title: string;
  description: string;
  priority?: string;
  requested_by?: string;
}) {
  const { data: maintenance, error } = await supabase
    .from('maintenance_requests')
    .insert({
      ...data,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return maintenance;
}

export async function updateMaintenance(id: string, data: {
  status?: string;
  assigned_to?: string;
  completed_at?: string;
  notes?: string;
}) {
  const { data: maintenance, error } = await supabase
    .from('maintenance_requests')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return maintenance;
}
