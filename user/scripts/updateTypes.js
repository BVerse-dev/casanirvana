const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://pswnlowvmdgeifhxilao.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd25sb3d2bWRnZWlmaHhpbGFvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzc4MTkxNiwiZXhwIjoyMDYzMzU3OTE2fQ.0HGfUIRxfhF6MvJE9HBZmXOT9KHEeSkV8VVksA1GHnM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkProfilesStructure() {
  try {
    console.log('Checking updated profiles table structure...');
    
    // Test query to get a profile with unit and society data
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
      console.log('Sample profile with unit and society data:');
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

    // Test getting societies
    const { data: societies, error: societiesError } = await supabase
      .from('societies')
      .select('*')
      .limit(3);

    if (societiesError) {
      console.error('Error getting societies:', societiesError);
    } else {
      console.log('Sample societies:');
      console.log(JSON.stringify(societies, null, 2));
    }

  } catch (error) {
    console.error('Script error:', error);
  }
}

checkProfilesStructure();
