import { supabase } from '../lib/supabase';

export async function getUnitsBySociety(societyId: string) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('society_id', societyId)
    .order('block', { ascending: true })
    .order('number', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createUnit(societyId: string, data: {
  block: string;
  number: string;
  unit_type: string;
  area?: number;
  owner_id?: string;
  is_occupied?: boolean;
}) {
  const { data: unit, error } = await supabase
    .from('units')
    .insert({ 
      ...data, 
      society_id: societyId,
      unit_number: `${data.block}-${data.number}`
    })
    .select()
    .single();

  if (error) throw error;
  return unit;
}
