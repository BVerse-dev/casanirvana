/**
 * Test Community Logic Script
 * 
 * This script tests the community membership logic directly
 * to debug why the homescreen isn't showing properly.
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testCommunityLogic() {
  console.log('🧪 Testing Community Logic for demo@casanirvana.com\n');

  try {
    // Test 1: Get user profile with community info
    console.log('📋 Test 1: Fetching User Profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        id,
        user_id,
        email,
        first_name,
        last_name,
        phone,
        role,
        community_id,
        unit_id,
        status,
        community:communities!profiles_society_id_fkey(id, name, address, city, state),
        unit:units(id, block, number, unit_type, floor)
      `)
      .eq('email', 'demo@casanirvana.com')
      .single();

    if (profileError) {
      console.error('❌ Profile Error:', profileError);
      return;
    }

    console.log('✅ Profile Data:', JSON.stringify(profile, null, 2));
    console.log('');

    // Test 2: Check community membership logic
    console.log('🏘️ Test 2: Community Membership Check...');
    const hasJoinedCommunity = !!profile?.community_id;
    console.log('hasJoinedCommunity:', hasJoinedCommunity);
    console.log('community_id:', profile?.community_id);
    console.log('unit_id:', profile?.unit_id);
    console.log('');

    // Test 3: Check pending requests
    console.log('📝 Test 3: Checking Pending Requests...');
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('join_requests')
      .select(`
        id,
        status,
        created_at,
        community_id,
        community_name,
        manual_unit_info,
        is_manual_entry,
        community:communities!join_requests_community_id_fkey(name),
        unit:units!join_requests_unit_id_fkey(block, number)
      `)
      .eq('user_id', profile.id)
      .in('status', ['pending', 'pending_manual_review', 'rejected'])
      .order('created_at', { ascending: false });

    if (pendingError) {
      console.error('❌ Pending Requests Error:', pendingError);
    } else {
      console.log('Pending Requests Count:', pendingRequests?.length || 0);
      if (pendingRequests?.length > 0) {
        console.log('Pending Requests:', JSON.stringify(pendingRequests, null, 2));
      }
    }
    console.log('');

    // Test 4: Expected homescreen behavior
    console.log('🏠 Test 4: Expected Homescreen Behavior...');
    if (hasJoinedCommunity) {
      const community = profile.community?.[0] || profile.community;
      const unit = profile.unit?.[0] || profile.unit;
      const unitDisplay = community && unit 
        ? `${unit.block}-${unit.number} | ${community.name}`
        : `Unit ${profile.unit_id} | Community ${profile.community_id}`;
      
      console.log('✅ SHOULD SHOW: Full Homescreen');
      console.log('✅ Unit Display:', unitDisplay);
      console.log('✅ Community Features: All 8 cards visible');
    } else {
      console.log('❌ WOULD SHOW: Join Community Card');
    }

  } catch (error) {
    console.error('💥 Test Failed:', error);
  }
}

testCommunityLogic();
