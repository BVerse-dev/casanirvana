// Usage: node setupDatabase.js
// Make sure to set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL in your environment or .env file

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function main() {
  try {
    // Create role_permissions table
    const { error: createTableError } = await supabase.rpc('execute_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS public.role_permissions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          role TEXT NOT NULL,
          permission TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(role, permission)
        );

        -- Grant access to authenticated users
        GRANT SELECT ON TABLE public.role_permissions TO authenticated;
        GRANT SELECT ON TABLE public.role_permissions TO service_role;

        -- Enable RLS
        ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

        -- Create policy to allow read access to authenticated users
        CREATE POLICY "Allow read access to authenticated users"
          ON public.role_permissions
          FOR SELECT
          TO authenticated
          USING (true);

        -- Create policy to allow all access to service role
        CREATE POLICY "Allow all access to service role"
          ON public.role_permissions
          TO service_role
          USING (true)
          WITH CHECK (true);
      `
    });

    if (createTableError) {
      console.error('Error creating role_permissions table:', createTableError);
      
      // Try alternative approach with direct SQL
      console.log('\nTrying alternative direct SQL...');
      console.log('Please run these SQL commands in the Supabase dashboard SQL editor:');
      console.log(`
        CREATE TABLE IF NOT EXISTS public.role_permissions (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          role TEXT NOT NULL,
          permission TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
          UNIQUE(role, permission)
        );

        -- Grant access to authenticated users
        GRANT SELECT ON TABLE public.role_permissions TO authenticated;
        GRANT SELECT ON TABLE public.role_permissions TO service_role;

        -- Enable RLS
        ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

        -- Create policy to allow read access to authenticated users
        CREATE POLICY "Allow read access to authenticated users"
          ON public.role_permissions
          FOR SELECT
          TO authenticated
          USING (true);

        -- Create policy to allow all access to service role
        CREATE POLICY "Allow all access to service role"
          ON public.role_permissions
          TO service_role
          USING (true)
          WITH CHECK (true);
      `);
      process.exit(1);
    }

    console.log('✅ Database schema created successfully');
    console.log('\nNow run setRolePermissions.js to set up the permissions');

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
