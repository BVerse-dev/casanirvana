/**
 * Sample Member Data Seeder Script
 * 
 * This script can be used to populate the database with sample member data
 * for testing and development purposes.
 * 
 * Usage: node scripts/seedMemberData.js
 * 
 * Note: This is for development only. In production, real user data
 * will be managed through the admin dashboard and user registration.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sample data structure matching the database schema
const sampleCommunityData = {
  name: "Ayi Mensah Park Community",
  description: "A modern residential community with world-class amenities",
  address: "123 Ayi Mensah Street, Accra, Ghana",
  city: "Accra",
  state: "Greater Accra",
  country: "Ghana",
  postal_code: "GA-123-4567",
  total_units: 150,
  established_year: 2018
};

const sampleUnits = [
  // Block A
  { block: 'A', number: '101', unit_type: '2BHK', floor: 1 },
  { block: 'A', number: '156', unit_type: '3BHK', floor: 1 },
  { block: 'A', number: '178', unit_type: '2BHK', floor: 1 },
  { block: 'A', number: '501', unit_type: '3BHK', floor: 5 },
  { block: 'A', number: '502', unit_type: '3BHK', floor: 5 },
  { block: 'A', number: '605', unit_type: '2BHK', floor: 6 },
  
  // Block B
  { block: 'B', number: '205', unit_type: '2BHK', floor: 2 },
  { block: 'B', number: '223', unit_type: '3BHK', floor: 2 },
  { block: 'B', number: '267', unit_type: '2BHK', floor: 2 },
  { block: 'B', number: '503', unit_type: '3BHK', floor: 5 },
  
  // Block C
  { block: 'C', number: '312', unit_type: '2BHK', floor: 3 },
  { block: 'C', number: '334', unit_type: '3BHK', floor: 3 },
  { block: 'C', number: '389', unit_type: '2BHK', floor: 3 },
  { block: 'C', number: '601', unit_type: '3BHK', floor: 6 },
  { block: 'C', number: '602', unit_type: '3BHK', floor: 6 },
  
  // Block D
  { block: 'D', number: '408', unit_type: '2BHK', floor: 4 },
  { block: 'D', number: '445', unit_type: '3BHK', floor: 4 },
  { block: 'D', number: '478', unit_type: '2BHK', floor: 4 },
  { block: 'D', number: '603', unit_type: '3BHK', floor: 6 },
  { block: 'D', number: '604', unit_type: '3BHK', floor: 6 },
];

const sampleMembers = [
  // Regular Members
  { first_name: 'Sarah', last_name: 'Johnson', email: 'sarah.johnson@email.com', phone: '+233 24 123 4567', role: 'user', unit_block: 'A', unit_number: '101' },
  { first_name: 'Michael', last_name: 'Chen', email: 'michael.chen@email.com', phone: '+233 24 234 5678', role: 'user', unit_block: 'B', unit_number: '205' },
  { first_name: 'Emily', last_name: 'Rodriguez', email: 'emily.rodriguez@email.com', phone: '+233 24 345 6789', role: 'user', unit_block: 'C', unit_number: '312' },
  { first_name: 'David', last_name: 'Thompson', email: 'david.thompson@email.com', phone: '+233 24 456 7890', role: 'user', unit_block: 'D', unit_number: '408' },
  { first_name: 'Lisa', last_name: 'Wang', email: 'lisa.wang@email.com', phone: '+233 24 567 8901', role: 'user', unit_block: 'A', unit_number: '156' },
  { first_name: 'Robert', last_name: 'Kumar', email: 'robert.kumar@email.com', phone: '+233 24 678 9012', role: 'user', unit_block: 'B', unit_number: '223' },
  { first_name: 'Jennifer', last_name: 'Smith', email: 'jennifer.smith@email.com', phone: '+233 24 789 0123', role: 'user', unit_block: 'C', unit_number: '334' },
  { first_name: 'James', last_name: 'Wilson', email: 'james.wilson@email.com', phone: '+233 24 890 1234', role: 'user', unit_block: 'D', unit_number: '445' },
  { first_name: 'Maria', last_name: 'Garcia', email: 'maria.garcia@email.com', phone: '+233 24 901 2345', role: 'user', unit_block: 'A', unit_number: '178' },
  { first_name: 'Daniel', last_name: 'Lee', email: 'daniel.lee@email.com', phone: '+233 24 012 3456', role: 'user', unit_block: 'B', unit_number: '267' },
  { first_name: 'Anna', last_name: 'Patel', email: 'anna.patel@email.com', phone: '+233 24 123 4567', role: 'user', unit_block: 'C', unit_number: '389' },
  { first_name: 'Thomas', last_name: 'Brown', email: 'thomas.brown@email.com', phone: '+233 24 234 5678', role: 'user', unit_block: 'D', unit_number: '478' },
  
  // Admins
  { first_name: 'John', last_name: 'Anderson', email: 'john.anderson@admin.com', phone: '+233 24 111 2222', role: 'admin', unit_block: 'A', unit_number: '501' },
  { first_name: 'Patricia', last_name: 'Williams', email: 'patricia.williams@admin.com', phone: '+233 24 222 3333', role: 'admin', unit_block: 'A', unit_number: '502' },
  { first_name: 'Christopher', last_name: 'Davis', email: 'christopher.davis@admin.com', phone: '+233 24 333 4444', role: 'admin', unit_block: 'B', unit_number: '503' },
  
  // Committee Members
  { first_name: 'Margaret', last_name: 'Taylor', email: 'margaret.taylor@committee.com', phone: '+233 24 444 5555', role: 'management', unit_block: 'C', unit_number: '601' },
  { first_name: 'Richard', last_name: 'Miller', email: 'richard.miller@committee.com', phone: '+233 24 555 6666', role: 'management', unit_block: 'C', unit_number: '602' },
  { first_name: 'Susan', last_name: 'Jackson', email: 'susan.jackson@committee.com', phone: '+233 24 666 7777', role: 'management', unit_block: 'D', unit_number: '603' },
  { first_name: 'Kevin', last_name: 'White', email: 'kevin.white@committee.com', phone: '+233 24 777 8888', role: 'management', unit_block: 'D', unit_number: '604' },
  { first_name: 'Linda', last_name: 'Harris', email: 'linda.harris@committee.com', phone: '+233 24 888 9999', role: 'management', unit_block: 'A', unit_number: '605' },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // 1. Create or get community
    console.log('📍 Creating community...');
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .upsert([sampleCommunityData], { onConflict: 'name' })
      .select()
      .single();

    if (communityError) {
      console.error('❌ Error creating community:', communityError);
      return;
    }

    console.log('✅ Community created:', community.name);

    // 2. Create units
    console.log('🏠 Creating units...');
    const unitsToCreate = sampleUnits.map(unit => ({
      ...unit,
      community_id: community.id,
      status: 'occupied'
    }));

    const { data: units, error: unitsError } = await supabase
      .from('units')
      .upsert(unitsToCreate, { onConflict: 'community_id,block,number' })
      .select();

    if (unitsError) {
      console.error('❌ Error creating units:', unitsError);
      return;
    }

    console.log('✅ Units created:', units?.length || 0);

    // 3. Create users/profiles
    console.log('👥 Creating members...');
    
    for (const member of sampleMembers) {
      // Find the unit for this member
      const unit = units?.find(u => u.block === member.unit_block && u.number === member.unit_number);
      
      if (!unit) {
        console.warn(`⚠️ Unit not found for ${member.first_name} ${member.last_name} (${member.unit_block}-${member.unit_number})`);
        continue;
      }

      // Create profile
      const profileData = {
        first_name: member.first_name,
        last_name: member.last_name,
        full_name: `${member.first_name} ${member.last_name}`,
        email: member.email,
        phone: member.phone,
        role: member.role,
        community_id: community.id,
        unit_id: unit.id,
        status: 'active',
        is_active: true,
        current_community_id: community.id,
      };

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'email' })
        .select()
        .single();

      if (profileError) {
        console.error(`❌ Error creating profile for ${member.first_name}:`, profileError);
      } else {
        console.log(`✅ Created profile: ${profile.full_name} (${profile.role})`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   • Community: ${community.name}`);
    console.log(`   • Units: ${units?.length || 0}`);
    console.log(`   • Members: ${sampleMembers.length}`);
    console.log(`   • Admins: ${sampleMembers.filter(m => m.role === 'admin').length}`);
    console.log(`   • Committee: ${sampleMembers.filter(m => m.role === 'management').length}`);
    console.log(`   • Regular Members: ${sampleMembers.filter(m => m.role === 'user').length}`);

  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
  }
}

// Run the seeder
if (require.main === module) {
  seedDatabase().then(() => {
    console.log('🏁 Seeding script completed');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Seeding script failed:', error);
    process.exit(1);
  });
}

module.exports = { seedDatabase, sampleCommunityData, sampleUnits, sampleMembers };
