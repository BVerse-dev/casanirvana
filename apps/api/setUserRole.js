// Usage: node setUserRole.js
// Make sure to set SUPABASE_SERVICE_ROLE_KEY and SUPABASE_URL in your environment or .env file

import { createClient } from '@supabase/supabase-js';
import readline from 'readline';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  try {
    const email = await ask('User email to update: ');
    const role = await ask('New role (user, guard, admin, superadmin): ');
    
    if (!['user', 'guard', 'admin', 'superadmin'].includes(role)) {
      console.error('Invalid role. Must be one of: user, guard, admin, superadmin');
      process.exit(1);
    }
    
    console.log(`\nLooking up user with email: ${email}`);
    
    // 1. Find user in auth
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error listing users:', authError);
      process.exit(1);
    }
    
    const authUser = users.find(u => u.email === email);
    
    if (!authUser) {
      console.error('User not found in authentication system');
      process.exit(1);
    }

    // 2. Check if profile exists
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', authUser.id)
      .single();
    
    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error checking profile:', profileError);
      process.exit(1);
    }
    
    let userData = profileData;
    
    // Create profile if it doesn't exist
    if (!profileData) {
      console.log('Profile not found, creating new profile...');
      // Get first and last name
      const firstName = await ask('Enter first name: ');
      const lastName = await ask('Enter last name: ');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: authUser.email,
          first_name: firstName,
          last_name: lastName,
          role: role
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating profile:', createError);
        process.exit(1);
      }
      
      userData = newProfile;
      console.log('Created new profile successfully');
    }
    
    console.log(`Found user: ${userData.email} (${userData.id}), current role: ${userData.role}`);
    
    // 2. Update the user's role
    console.log(`\nUpdating role to: ${role}`);
    
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userData.id)
      .select();
    
    if (updateError) {
      console.error('Error updating user role:', updateError);
      
      console.log('\nTrying alternative direct SQL update...');
      // Try raw SQL as fallback
      const { data: sqlData, error: sqlError } = await supabase
        .rpc('execute_sql', {
          query: `UPDATE profiles SET role = '${role}' WHERE id = '${userData.id}'`
        });
      
      if (sqlError) {
        console.error('SQL update failed:', sqlError);
        console.log('\nMANUAL INSTRUCTIONS:');
        console.log('Run this SQL command in the Supabase dashboard SQL editor:');
        console.log(`UPDATE profiles SET role = '${role}' WHERE id = '${userData.id}';`);
        process.exit(1);
      } else {
        console.log('SQL update succeeded');
      }
    } else {
      console.log('Update succeeded:', updateData);
    }
    
    // 3. Verify the update
    const { data: checkData, error: checkError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', userData.id)
      .single();
    
    if (checkError) {
      console.error('Error checking updated user:', checkError);
    } else {
      console.log('\nUpdated user profile:');
      console.log(checkData);
      
      if (checkData.role === role) {
        console.log(`\n✅ SUCCESS: User role updated to ${role}`);
      } else {
        console.log(`\n⚠️ WARNING: Role update failed. Current role: ${checkData.role}`);
        console.log('\nMANUAL INSTRUCTIONS:');
        console.log('Run this SQL command in the Supabase dashboard SQL editor:');
        console.log(`UPDATE profiles SET role = '${role}' WHERE id = '${userData.id}';`);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
