import { supabase } from '../utils/supabase';

const sampleMaintenanceRequests = [
  {
    title: "Air Conditioning Not Working",
    description: "The AC unit in the living room has stopped working completely. It's not cooling and makes strange noises when turned on.",
    priority: "High",
    request_type: "HVAC",
    status: "pending"
  },
  {
    title: "Kitchen Sink Faucet Leak",
    description: "The kitchen sink faucet has been dripping continuously for the past week. The leak is getting worse and wasting water.",
    priority: "Medium",
    request_type: "Plumbing",
    status: "pending"
  },
  {
    title: "Bathroom Light Flickering",
    description: "The main bathroom light fixture keeps flickering and sometimes doesn't turn on at all. May be a wiring issue.",
    priority: "Medium",
    request_type: "Electricity",
    status: "pending"
  },
  {
    title: "Bedroom Ceiling Fan Repair",
    description: "The ceiling fan in the master bedroom is making loud rattling noises and wobbling when running. Needs immediate attention.",
    priority: "High",
    request_type: "Electricity",
    status: "resolved"
  },
  {
    title: "Water Heater Temperature Issue",
    description: "Water heater is not maintaining consistent temperature. Hot water runs out very quickly during showers.",
    priority: "High",
    request_type: "Plumbing",
    status: "pending"
  },
  {
    title: "Balcony Door Lock Stuck",
    description: "The sliding door lock to the balcony is completely stuck and cannot be opened or closed properly.",
    priority: "Medium",
    request_type: "General",
    status: "pending"
  },
  {
    title: "Kitchen Exhaust Fan Not Working",
    description: "The exhaust fan above the stove has stopped working. There's no ventilation when cooking, causing smoke to accumulate.",
    priority: "Low",
    request_type: "HVAC",
    status: "resolved"
  },
  {
    title: "Bathroom Toilet Running Continuously",
    description: "The toilet in the guest bathroom keeps running water continuously. The flush mechanism seems to be stuck.",
    priority: "Medium",
    request_type: "Plumbing",
    status: "pending"
  },
  {
    title: "Living Room Power Outlet Dead",
    description: "One of the power outlets in the living room has completely stopped working. No devices can be plugged in.",
    priority: "Low",
    request_type: "Electricity", 
    status: "resolved"
  },
  {
    title: "Heating System Not Responding",
    description: "The central heating system is not responding to thermostat changes. The temperature remains cold despite setting higher values.",
    priority: "High",
    request_type: "HVAC",
    status: "pending"
  }
];

async function seedMaintenanceRequests() {
  try {
    console.log('Starting to seed maintenance requests...');
    
    // First, get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('Error getting user:', userError);
      console.log('Please make sure you are logged in to seed data');
      return;
    }
    
    console.log('Current user:', user.email);
    
    // Get user profile to find unit_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, unit_id, first_name, last_name')
      .eq('user_id', user.id)
      .single();
    
    if (profileError || !profile) {
      console.error('Error getting user profile:', profileError);
      return;
    }
    
    if (!profile.unit_id) {
      console.error('User profile does not have a unit_id. Please assign a unit to this user first.');
      return;
    }
    
    console.log(`Found profile for ${profile.first_name} ${profile.last_name}, Unit ID: ${profile.unit_id}`);
    
    // Clear existing maintenance requests for this unit (optional)
    const { error: deleteError } = await supabase
      .from('maintenance_requests')
      .delete()
      .eq('unit_id', profile.unit_id);
    
    if (deleteError) {
      console.warn('Warning: Could not clear existing requests:', deleteError.message);
    } else {
      console.log('Cleared existing maintenance requests for this unit');
    }
    
    // Insert new maintenance requests
    const requestsToInsert = sampleMaintenanceRequests.map(request => ({
      ...request,
      requested_by: profile.id, // Use profile ID, not user ID
      unit_id: profile.unit_id,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
      updated_at: new Date().toISOString()
    }));
    
    const { data: insertedRequests, error: insertError } = await supabase
      .from('maintenance_requests')
      .insert(requestsToInsert)
      .select();
    
    if (insertError) {
      console.error('Error inserting maintenance requests:', insertError);
      return;
    }
    
    console.log(`Successfully seeded ${insertedRequests.length} maintenance requests!`);
    console.log('Sample requests created:');
    insertedRequests.forEach((request, index) => {
      console.log(`${index + 1}. ${request.title} (${request.priority} priority, ${request.status})`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Export for use in other files
export { seedMaintenanceRequests };

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedMaintenanceRequests();
}
