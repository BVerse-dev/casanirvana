#!/usr/bin/env node

/**
 * Supabase Notification Seeder for Casa Nirvana
 * 
 * This script safely adds test notification data to your Supabase database
 * Instructions:
 * 1. Install dependencies: npm install @supabase/supabase-js
 * 2. Update SUPABASE_URL and SUPABASE_ANON_KEY below
 * 3. Run: node supabaseNotificationSeeder.js
 */

const { createClient } = require('@supabase/supabase-js');

// TODO: Replace with your actual Supabase project details
const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test notifications matching all the enhanced message types we created
const testNotifications = [
  {
    title: 'Welcome to Casa Nirvana Community!',
    body: 'Your membership request has been approved. Welcome to our community!',
    notification_type: 'join_request_approved',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Membership Application Update',
    body: 'Your membership application requires additional documentation.',
    notification_type: 'join_request_rejected',
    priority: 'medium',
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
    title: 'Visitor Access Denied',
    body: 'Your visitor request for Jane Smith could not be approved.',
    notification_type: 'visitor_denied',
    priority: 'medium',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Monthly Maintenance Payment Due',
    body: 'Your monthly maintenance fee is due in 3 days.',
    notification_type: 'payment_reminder',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Payment Overdue Notice',
    body: 'Your monthly maintenance payment is now overdue.',
    notification_type: 'payment_overdue',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Elevator Maintenance Scheduled',
    body: 'Elevator maintenance is scheduled for tomorrow 10AM-2PM.',
    notification_type: 'maintenance_scheduled',
    priority: 'medium',
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
    title: 'Security Alert',
    body: 'Please be aware of increased security measures in Building B.',
    notification_type: 'security',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Emergency Alert',
    body: 'Emergency power outage in Building A. Use emergency exits only.',
    notification_type: 'emergency',
    priority: 'urgent',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Community BBQ Event Tomorrow',
    body: 'Community BBQ event tomorrow at 6PM in the garden area.',
    notification_type: 'event_reminder',
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
    title: 'New Community Guidelines',
    body: 'Updated community guidelines are now available.',
    notification_type: 'community_update',
    priority: 'medium',
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
    title: 'Water Supply Maintenance Notice',
    body: 'Water supply will be interrupted tomorrow from 10AM-2PM.',
    notification_type: 'utility_maintenance',
    priority: 'high',
    reference_id: null,
    action_url: null,
  },
  {
    title: 'Community Newsletter Available',
    body: 'The monthly community newsletter is now available.',
    notification_type: 'announcement',
    priority: 'low',
    reference_id: null,
    action_url: null,
  },
];

async function validateConnection() {
  console.log('🔍 Validating Supabase connection...');
  
  if (SUPABASE_URL === 'https://your-project-ref.supabase.co' || SUPABASE_ANON_KEY === 'your-anon-key-here') {
    console.error('❌ Please update SUPABASE_URL and SUPABASE_ANON_KEY in the script');
    process.exit(1);
  }
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

async function getCurrentUser() {
  console.log('👤 Getting current user...');
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    console.error('❌ No authenticated user found. Please log in first.');
    process.exit(1);
  }
  
  // Get profile ID
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single();
    
  if (profileError || !profile) {
    console.error('❌ User profile not found:', profileError?.message);
    process.exit(1);
  }
  
  console.log('✅ Found user profile:', profile.id);
  return profile.id;
}

async function checkExistingNotifications(userId) {
  console.log('📊 Checking existing notifications...');
  
  const { data, error } = await supabase
    .from('notifications')
    .select('notification_type, count(*)')
    .eq('user_id', userId);
    
  if (error) {
    console.warn('⚠️  Could not check existing notifications:', error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log('📋 Existing notifications found:', data.length);
  } else {
    console.log('📋 No existing notifications found');
  }
}

async function seedNotifications() {
  try {
    console.log('🌱 Starting Casa Nirvana notification seeding...\n');
    
    // Validate connection
    await validateConnection();
    
    // Get current user
    const userId = await getCurrentUser();
    
    // Check existing notifications
    await checkExistingNotifications(userId);
    
    console.log('\n🚀 Adding test notifications...');
    
    // Prepare notifications with user ID and timestamps
    const notificationsWithMetadata = testNotifications.map((notification, index) => ({
      ...notification,
      user_id: userId,
      is_read: index % 4 === 0, // 25% chance of being read
      read_at: index % 4 === 0 ? new Date().toISOString() : null,
      created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(), // Random time in last week
    }));
    
    // Insert notifications
    const { data, error } = await supabase
      .from('notifications')
      .insert(notificationsWithMetadata)
      .select();
    
    if (error) {
      console.error('❌ Error inserting notifications:', error);
      process.exit(1);
    }
    
    console.log('✅ Successfully added', data.length, 'test notifications!');
    console.log('\n🎉 Notification types added:');
    
    const typeCount = {};
    data.forEach(notification => {
      const type = notification.notification_type;
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    Object.entries(typeCount).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count} notification${count > 1 ? 's' : ''}`);
    });
    
    console.log('\n📱 You can now test all the enhanced notification detail messages!');
    console.log('💡 Pull to refresh the notifications screen to see the new data.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedNotifications();
}

module.exports = { testNotifications, seedNotifications };
