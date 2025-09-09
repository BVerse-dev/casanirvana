const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://pswnlowvmdgeifhxilao.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd25sb3d2bWRnZWlmaHhpbGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc4MTkxNiwiZXhwIjoyMDYzMzU3OTE2fQ.0HGfUIRxfhF6MvJE9HBZmXOT9KHEeSkV8VVksA1GHnM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function assignUnitToUser() {
  try {
    // Get the demo user
    const { data: demoUser, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'user@demo.com')
      .single();

    if (userError) {
      console.error('Error getting demo user:', userError);
      return;
    }

    console.log('Demo user found:', demoUser);

    // Get an available unit
    const { data: availableUnit, error: unitError } = await supabase
      .from('units')
      .select('*')
      .limit(1)
      .single();

    if (unitError) {
      console.error('Error getting unit:', unitError);
      return;
    }

    console.log('Available unit:', availableUnit);

    // Update the demo user profile with unit and society
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        unit_id: availableUnit.id,
        society_id: availableUnit.society_id,
        updated_at: new Date().toISOString()
      })
      .eq('id', demoUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      return;
    }

    console.log('Updated profile:', updatedProfile);

    // Update the unit owner
    const { data: updatedUnit, error: updateUnitError } = await supabase
      .from('units')
      .update({
        owner_id: demoUser.id
      })
      .eq('id', availableUnit.id)
      .select()
      .single();

    if (updateUnitError) {
      console.error('Error updating unit:', updateUnitError);
      return;
    }

    console.log('Updated unit:', updatedUnit);

    // Test the relationship query
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
      .eq('id', demoUser.id)
      .single();

    if (testError) {
      console.error('Error testing relationship:', testError);
    } else {
      console.log('Profile with relationships:');
      console.log(JSON.stringify(testProfile, null, 2));
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

assignUnitToUser();
