const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration. Keep credentials in local/CI env only.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables: EXPO_PUBLIC_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample notification data with various types
const sampleNotifications = [
  {
    title: 'Welcome to Casa Nirvana Community!',
    body: 'Your membership request has been approved. Welcome to our community!',
    notification_type: 'join_request_approved',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Visitor Access Approved',
    body: 'Your visitor John Doe has been approved for entry today.',
    notification_type: 'visitor_approved',
    priority: 'medium',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Monthly Maintenance Payment Due',
    body: 'Your monthly maintenance fee of $150 is due in 3 days.',
    notification_type: 'payment_reminder',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Elevator Maintenance Completed',
    body: 'The scheduled elevator maintenance has been completed successfully.',
    notification_type: 'maintenance_completed',
    priority: 'medium',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Community Pool Booking Confirmed',
    body: 'Your pool booking for Saturday 2PM-4PM has been confirmed.',
    notification_type: 'amenity_booking',
    priority: 'medium',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Security Alert - Building B',
    body: 'Please be aware of increased security measures in Building B area.',
    notification_type: 'security',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Community BBQ Event Tomorrow',
    body: 'Don\'t forget about the community BBQ event tomorrow at 6PM in the garden area.',
    notification_type: 'event_reminder',
    priority: 'medium',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Water Supply Maintenance Notice',
    body: 'Water supply will be interrupted tomorrow from 10AM-2PM for maintenance.',
    notification_type: 'utility_maintenance',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Your Complaint Has Been Resolved',
    body: 'Your noise complaint #123 has been investigated and resolved.',
    notification_type: 'complaint_resolved',
    priority: 'medium',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'New Community Guidelines',
    body: 'Updated community guidelines are now available. Please review the changes.',
    notification_type: 'community_update',
    priority: 'medium',
    reference_id: null,
    action_url: null,
  },
];

async function seedNotifications() {
  try {
    console.log('🌱 Starting notification data seeding...');
    
    // First, get a sample user to assign notifications to
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.error('❌ No profiles found. Please create a user profile first.');
      return;
    }
    
    const userId = profiles[0].id;
    console.log('👤 Using profile ID:', userId);
    
    // Add user_id to all notifications
    const notificationsWithUser = sampleNotifications.map(notification => ({
      ...notification,
      user_id: userId,
      is_read: Math.random() > 0.7, // 30% chance of being read
      read_at: Math.random() > 0.7 ? new Date().toISOString() : null,
    }));
    
    // Insert notifications
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationsWithUser)
      .select();
    
    if (error) {
      console.error('❌ Error inserting notifications:', error);
      return;
    }
    
    console.log('✅ Successfully seeded', data.length, 'notifications');
    console.log('🎉 Notification types included:');
    sampleNotifications.forEach(notification => {
      console.log(`   - ${notification.notification_type}: ${notification.title}`);
    });
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the seeding function
seedNotifications();
