const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pswnlowvmdgeifhxilao.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd25sb3d2bWRnZWlmaHhpbGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc4MTkxNiwiZXhwIjoyMDYzMzU3OTE2fQ.0HGfUIRxfhF6MvJE9HBZmXOT9KHEeSkV8VVksA1GHnM';

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
        society_id,
        units:unit_id (
          id,
          unit_number,
          societies:society_id (
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

    // Also get the society directly
    const { data: society, error: societyError } = await supabase
      .from('societies')
      .select('*')
      .eq('id', '550e8400-e29b-41d4-a716-446655440001')
      .single();

    if (societyError) {
      console.error('Error getting society:', societyError);
    } else {
      console.log('Society details:');
      console.log(JSON.stringify(society, null, 2));
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
