const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testProfileRelationships() {
  try {
    // Test the relationship query with the updated demo user
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
      .eq('email', 'user@demo.com')
      .single();

    if (testError) {
      console.error('Error testing relationship:', testError);
    } else {
      console.log('Profile with relationships:');
      console.log(JSON.stringify(testProfile, null, 2));
    }

    // Also get the community directly
    const { data: community, error: communityError } = await supabase
      .from('communities')
      .select('*')
      .eq('id', '550e8400-e29b-41d4-a716-446655440001')
      .single();

    if (communityError) {
      console.error('Error getting community:', communityError);
    } else {
      console.log('Community details:');
      console.log(JSON.stringify(community, null, 2));
    }

    // Get the unit directly
    const { data: unit, error: unitError } = await supabase
      .from('units')
      .select('*')
      .eq('id', '550e8400-e29b-41d4-a716-446655440001')
      .single();

    if (unitError) {
      console.error('Error getting unit:', unitError);
    } else {
      console.log('Unit details:');
      console.log(JSON.stringify(unit, null, 2));
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

testProfileRelationships();
