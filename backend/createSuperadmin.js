// Usage: node createSuperadmin.js
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
    const email = await ask('Superadmin email: ');
    const password = await ask('Superadmin password: ');
    const first_name = await ask('First name: ');
    const last_name = await ask('Last name: ');

    console.log('\nCreating superadmin user...');
    
    // 1. Create user in auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name }
    });
    
    if (userError || !userData?.user) {
      console.error('Error creating user:', userError);
      process.exit(1);
    }
    
    const userId = userData.user.id;
    console.log(`User created with ID: ${userId}`);

    // 2. Insert into profiles table with superadmin role using direct SQL
    console.log('\nCreating profile with superadmin role...');
    
    const { data: rawQuery, error: rawError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        first_name,
        last_name,
        email,
        role: 'superadmin'
      })
      .select();
      
    if (rawError) {
      console.log('Insert failed:', rawError);
      
      // Try an update if insert failed (user might already exist)
      console.log('Trying update instead...');
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({
          first_name,
          last_name,
          email,
          role: 'superadmin'
        })
        .eq('id', userId)
        .select();
        
      if (updateError) {
        console.error('Update also failed:', updateError);
        
        // Last resort: Try raw SQL
        console.log('Trying raw SQL as last resort...');
        const { data: sqlData, error: sqlError } = await supabase
          .rpc('execute_sql', {
            query: `UPDATE profiles SET role = 'superadmin' WHERE id = '${userId}'`
          });
          
        if (sqlError) {
          console.error('Raw SQL failed:', sqlError);
          console.log('\nFALLBACK INSTRUCTIONS:');
          console.log('Run this SQL command in the Supabase dashboard SQL editor:');
          console.log(`UPDATE profiles SET role = 'superadmin' WHERE id = '${userId}';`);
        } else {
          console.log('Raw SQL succeeded:', sqlData);
        }
      } else {
        console.log('Update succeeded:', updateData);
      }
    } else {
      console.log('Insert succeeded:', rawQuery);
    }

    // 3. Verify profile data
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching profile:', fetchError);
    } else {
      console.log('\nProfile data:', profile);
      
      if (profile && profile.role === 'superadmin') {
        console.log('\n✅ SUCCESS: Superadmin created successfully!');
        console.log(`Email: ${email}`);
        console.log(`Role: ${profile.role}`);
      } else {
        console.log('\n⚠️ WARNING: User created but role may not be set to superadmin.');
        console.log('Current role:', profile?.role);
        console.log('\nMANUAL INSTRUCTIONS:');
        console.log('Run this SQL command in the Supabase dashboard SQL editor:');
        console.log(`UPDATE profiles SET role = 'superadmin' WHERE id = '${userId}';`);
      }
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();

main();
