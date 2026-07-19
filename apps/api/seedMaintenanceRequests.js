// seedMaintenanceRequests.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from the backend directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env file.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const sampleMaintenanceList = [
  {
    title: 'Electricity',
    description: 'Power fluctuates sometime',
    priority: 'Medium',
    status: 'resolved',
    requested_by: 'user-id-or-null', // replace with a real user id if needed
    unit_id: 'unit-id-or-null',      // replace with a real unit id if needed
    created_at: new Date().toISOString(),
  },
  {
    title: 'Plumbing',
    description: 'Valve is not working',
    priority: 'Medium',
    status: 'pending',
    requested_by: 'user-id-or-null',
    unit_id: 'unit-id-or-null',
    created_at: new Date().toISOString(),
  },
  {
    title: 'Electricity',
    description: 'Power fluctuates sometime',
    priority: 'Medium',
    status: 'resolved',
    requested_by: 'user-id-or-null',
    unit_id: 'unit-id-or-null',
    created_at: new Date().toISOString(),
  },
  {
    title: 'Parking',
    description: 'Water leakage in parking area',
    priority: 'Medium',
    status: 'pending',
    requested_by: 'user-id-or-null',
    unit_id: 'unit-id-or-null',
    created_at: new Date().toISOString(),
  },
];

async function seed() {
  for (const req of sampleMaintenanceList) {
    const { error, data } = await supabase.from('maintenance_requests').insert([req]);
    if (error) {
      console.error('Error inserting:', req.title, error);
    } else {
      console.log('Inserted:', req.title, data);
    }
  }
  console.log('Seeding complete.');
}

seed();