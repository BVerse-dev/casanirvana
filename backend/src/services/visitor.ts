import { supabase } from '../lib/supabase';

export async function createVisitorPass(data: {
  visitor_name: string;
  visitor_phone: string;
  unit_id: string;
  purpose: string;
  expected_time: string;
  valid_until: string;
}) {
  const { data: pass, error } = await supabase
    .from('visitor_passes')
    .insert({
      ...data,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return pass;
}

export async function getVisitorPassesByUnit(unitId: string) {
  const { data, error } = await supabase
    .from('visitor_passes')
    .select('*')
    .eq('unit_id', unitId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getPendingVisitorPasses() {
  const { data, error } = await supabase
    .from('visitor_passes')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateVisitorPassStatus(id: string, status: string) {
  const { data, error } = await supabase
    .from('visitor_passes')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createEntryLog(data: {
  visitor_name: string;
  unit_id: string;
  entry_time: string;
  exit_time?: string;
  purpose: string;
  guard_id?: string;
}) {
  const { data: log, error } = await supabase
    .from('entry_logs')
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return log;
}
