// Usage: node setRolePermissions.js
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

// Define permissions for each role
const rolePermissions = {
  superadmin: [
    'read:analytics',
    'write:analytics',
    'read:all_profiles',
    'write:all_profiles',
    'delete:all_profiles',
    'read:all_maintenance_requests',
    'write:all_maintenance_requests',
    'delete:all_maintenance_requests',
    'read:all_complaints',
    'write:all_complaints',
    'delete:all_complaints',
    'read:all_payments',
    'write:all_payments',
    'delete:all_payments',
    'manage:settings',
    'read:all_units',
    'write:all_units',
    'delete:all_units',
    'read:all_notices',
    'write:all_notices',
    'delete:all_notices',
    'read:all_visitor_passes',
    'write:all_visitor_passes',
    'delete:all_visitor_passes',
    'read:all_entry_logs',
    'write:all_entry_logs',
    'delete:all_entry_logs',
    'read:all_notifications',
    'write:all_notifications',
    'delete:all_notifications'
  ],
  admin: [
    'read:analytics',
    'read:all_profiles',
    'write:all_profiles',
    'read:all_maintenance_requests',
    'write:all_maintenance_requests',
    'read:all_complaints',
    'write:all_complaints',
    'read:all_payments',
    'write:all_payments',
    'read:all_units',
    'write:all_units',
    'read:all_notices',
    'write:all_notices',
    'read:all_visitor_passes',
    'write:all_visitor_passes',
    'read:all_entry_logs',
    'write:all_entry_logs',
    'read:all_notifications',
    'write:all_notifications'
  ],
  guard: [
    'read:visitor_passes',
    'write:visitor_passes',
    'read:entry_logs',
    'write:entry_logs',
    'read:notices',
    'read:basic_profiles',
    'read:assigned_maintenance_requests',
    'write:assigned_maintenance_requests',
    'read:assigned_complaints',
    'write:assigned_complaints',
    'read:notifications'
  ],
  user: [
    'read:own_profile',
    'write:own_profile',
    'read:own_maintenance_requests',
    'write:own_maintenance_requests',
    'read:own_complaints',
    'write:own_complaints',
    'read:own_payments',
    'write:own_payments',
    'read:notices',
    'read:own_visitor_passes',
    'write:own_visitor_passes',
    'read:own_notifications'
  ]
};

async function main() {
  try {
    // Clear existing permissions
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .neq('role', 'dummy'); // Delete all rows

    if (deleteError) {
      console.error('Error clearing existing permissions:', deleteError);
      process.exit(1);
    }

    console.log('Cleared existing permissions');

    // Add new permissions for each role
    for (const [role, permissions] of Object.entries(rolePermissions)) {
      console.log(`\nAdding permissions for ${role}...`);
      
      for (const permission of permissions) {
        const { error: insertError } = await supabase
          .from('role_permissions')
          .insert({ role, permission });

        if (insertError) {
          console.error(`Error adding permission ${permission} to ${role}:`, insertError);
          continue;
        }

        console.log(`✓ Added ${permission}`);
      }
    }

    console.log('\nVerifying permissions...');
    
    // Verify permissions were added correctly
    for (const [role, expectedPermissions] of Object.entries(rolePermissions)) {
      const { data: actualPermissions, error: fetchError } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('role', role);

      if (fetchError) {
        console.error(`Error fetching permissions for ${role}:`, fetchError);
        continue;
      }

      const actualPermissionSet = new Set(actualPermissions.map(p => p.permission));
      const expectedPermissionSet = new Set(expectedPermissions);
      const missing = [...expectedPermissionSet].filter(p => !actualPermissionSet.has(p));
      const extra = [...actualPermissionSet].filter(p => !expectedPermissionSet.has(p));

      console.log(`\nRole: ${role}`);
      console.log(`Total permissions: ${actualPermissions.length}`);
      
      if (missing.length > 0) {
        console.log('Missing permissions:', missing);
      }
      if (extra.length > 0) {
        console.log('Extra permissions:', extra);
      }
      if (missing.length === 0 && extra.length === 0) {
        console.log('✅ All permissions set correctly');
      }
    }

  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
