// seedUserAndUnit.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function seedUserAndUnit() {
  // 1. Create a user via Auth API
  const email = 'testuser@example.com';
  const password = 'TestPassword123!';
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (userError) {
    console.error('Error creating user:', userError);
    return;
  }
  const userId = userData.user.id;

  // 2. Insert into profiles
  const { error: profileError } = await supabase.from('profiles').insert([
    {
      id: userId,
      first_name: 'Test',
      last_name: 'User',
      email,
      role: 'user',
    },
  ]);
  if (profileError) {
    console.error('Error inserting profile:', profileError);
    return;
  }

  // 3. Insert a society
  const { data: societyData, error: societyError } = await supabase.from('societies').insert([
    {
      name: 'Test Society',
      address: '123 Test Lane',
    },
  ]).select('id').single();
  if (societyError) {
    console.error('Error inserting society:', societyError);
    return;
  }
  const societyId = societyData.id;

  // 4. Insert a unit
  const { data: unitData, error: unitError } = await supabase.from('units').insert([
    {
      society_id: societyId,
      block: 'A',
      number: '101',
      owner_id: userId,
    },
  ]).select('id').single();
  if (unitError) {
    console.error('Error inserting unit:', unitError);
    return;
  }
  const unitId = unitData.id;

  console.log('Seeded userId:', userId);
  console.log('Seeded unitId:', unitId);
  console.log('Seeded societyId:', societyId);
}

seedUserAndUnit();
