const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesStructure() {
  try {
    console.log('Checking updated profiles table structure...');
    
    // Test query to get a profile with unit and community data
    const { data: testProfile, error: testError } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        unit_id,
        community_id,
        units:unit_id (
          id,
          unit_number,
          communities:community_id (
            id,
            name
          )
        )
      `)
      .limit(1)
      .single();

    if (testError) {
      console.error('Error testing profile query:', testError);
      
      // Try to get any profile first to see structure
      const { data: simpleProfile, error: simpleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
        
      if (simpleError) {
        console.error('Error getting simple profile:', simpleError);
      } else {
        console.log('Simple profile structure:');
        console.log(JSON.stringify(simpleProfile, null, 2));
      }
    } else {
      console.log('Sample profile with unit and community data:');
      console.log(JSON.stringify(testProfile, null, 2));
    }

    // Also test getting units to see if they exist
    const { data: units, error: unitsError } = await supabase
      .from('units')
      .select('*')
      .limit(3);

    if (unitsError) {
      console.error('Error getting units:', unitsError);
    } else {
      console.log('Sample units:');
      console.log(JSON.stringify(units, null, 2));
    }

    // Test getting communities
    const { data: communities, error: communitiesError } = await supabase
      .from('communities')
      .select('*')
      .limit(3);

    if (communitiesError) {
      console.error('Error getting communities:', communitiesError);
    } else {
      console.log('Sample communities:');
      console.log(JSON.stringify(communities, null, 2));
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkProfilesStructure();
