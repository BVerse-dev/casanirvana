// This script creates test users in Supabase for development and testing purposes
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables: EXPO_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample users to create
const testUsers = [
  {
    email: 'resident@example.com',
    password: 'Password123!',
    userData: {
      first_name: 'John',
      last_name: 'Resident',
      phone_number: '+9198765432101',
      profile_image: 'https://i.pravatar.cc/300?u=resident',
      role: 'resident',
    }
  },
  {
    email: 'owner@example.com',
    password: 'Password123!',
    userData: {
      first_name: 'Sarah',
      last_name: 'Owner',
      phone_number: '+9198765432102',
      profile_image: 'https://i.pravatar.cc/300?u=owner',
      role: 'owner',
    }
  },
  {
    email: 'admin@example.com',
    password: 'Password123!',
    userData: {
      first_name: 'Admin',
      last_name: 'User',
      phone_number: '+9198765432103',
      profile_image: 'https://i.pravatar.cc/300?u=admin',
      role: 'admin',
    }
  }
];

// Function to create a user and their profile
async function createTestUser(user) {
  console.log(`Creating user: ${user.email}...`);

  try {
    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true, // Auto-confirm email
    });

    if (authError) throw authError;
    console.log(`✓ Auth user created: ${user.email}`);

    // Check if users profile table exists
    const { data: tableExists } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'profiles')
      .single();

    if (tableExists) {
      // Now create the user profile with the user ID from auth
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: authData.user.id,
          ...user.userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (profileError) throw profileError;
      console.log(`✓ User profile created for: ${user.email}`);
    } else {
      console.log('⚠️ Profiles table does not exist, skipping profile creation');
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error(`❌ Error creating user ${user.email}:`, error.message);
    return { success: false, error };
  }
}

// Create all test users
async function createAllTestUsers() {
  console.log('🚀 Starting user creation process...');

  // Process each test user
  for (const user of testUsers) {
    await createTestUser(user);
  }

  console.log('✅ User creation process completed');
}

// Run the script
createAllTestUsers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
