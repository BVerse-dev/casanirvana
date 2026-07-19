import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load environment variables
const dotenvPath = process.env.NODE_ENV === 'production' ? '.env.production' : '.env';
require('dotenv').config({ path: dotenvPath });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../../supabase/migrations/20250922153000_fix_payment_ref_id.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration...');
    
    // Execute the migration SQL
    const { error } = await supabase.rpc('pg_exec', { query: migrationSql });
    
    if (error) {
      throw error;
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

runMigration();

