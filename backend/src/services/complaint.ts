import { supabase } from '../lib/supabase';

export async function getComplaintsByUnit(unitId: string) {
  const { data, error } = await supabase
    .from('complaints')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createComplaint(data: {
  unit_id: string;
  subject: string;
  details: string;
  priority?: string;
  category_id?: string;
  created_by?: string;
}) {
  const { data: complaint, error } = await supabase
    .from('complaints')
    .insert({
      ...data,
      status: 'open',
      filed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return complaint;
}

export async function updateComplaint(id: string, data: {
  status?: string;
  assigned_to?: string;
  resolution?: string;
  resolved_at?: string;
  in_progress_at?: string;
}) {
  const updateData: any = { ...data };
  
  if (data.status === 'in_progress' && !data.in_progress_at) {
    updateData.in_progress_at = new Date().toISOString();
  }
  
  if (data.status === 'resolved' && !data.resolved_at) {
    updateData.resolved_at = new Date().toISOString();
  }

  const { data: complaint, error } = await supabase
    .from('complaints')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return complaint;
}
