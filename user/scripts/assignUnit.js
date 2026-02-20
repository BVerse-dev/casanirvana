const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

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

    // Update the demo user profile with unit and community
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        unit_id: availableUnit.id,
        community_id: availableUnit.community_id,
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
