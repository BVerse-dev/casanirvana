import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Use the hardcoded values from utils/supabase.js
const supabaseUrl = "https://pswnlowvmdgeifhxilao.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd25sb3d2bWRnZWlmaHhpbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODE5MTYsImV4cCI6MjA2MzM1NzkxNn0.QOqSJr0qxefrIwM087IKlJJYWwMLCHV_v5iEb-SI7S0";

// Create a service client with admin privileges
// Note: This requires the SUPABASE_SERVICE_KEY environment variable to be set
const serviceKey = process.env.SUPABASE_SERVICE_KEY;
if (!serviceKey) {
  console.error('Missing SUPABASE_SERVICE_KEY environment variable');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function fixDatabaseSchema() {
  try {
    console.log('Starting database schema fix...');
    
    // First, let's check if the metadata column exists in the payments table
    const { data: paymentsColumns, error: columnsError } = await supabase
      .from('_metadata')
      .select('*')
      .eq('table', 'payments')
      .eq('column_name', 'metadata');
    
    if (columnsError) {
      console.error('Error checking metadata column:', columnsError);
    } else {
      console.log('Metadata column check:', paymentsColumns);
    }
    
    // Add metadata column to payments table if it doesn't exist
    console.log('Adding metadata column to payments table...');
    const { error: addMetadataError } = await supabase.rpc('pg_exec', {
      query: 'ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT \'{}\';'
    });
    
    if (addMetadataError) {
      console.error('Error adding metadata column:', addMetadataError);
    } else {
      console.log('Successfully added metadata column to payments table');
    }
    
    // Read and execute the SQL script
    const sqlPath = path.join(__dirname, 'fixDatabaseSchema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL script...');
    
    // Split the SQL into individual statements
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('pg_exec', {
        query: stmt + ';'
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }
    
    console.log('Database schema fix completed');
    
  } catch (error) {
    console.error('Error fixing database schema:', error);
  }
}

fixDatabaseSchema();

