// Simple script to add test notifications to the database
// This script demonstrates the notification types we've added to the detail screen

const testNotifications = [
  {
    title: 'Welcome to Casa Nirvana Community!',
    body: 'Your membership request has been approved. Welcome to our community!',
    notification_type: 'join_request_approved',
    priority: 'high'
  },
  {
    title: 'Visitor Access Approved',
    body: 'Your visitor John Doe has been approved for entry today.',
    notification_type: 'visitor_approved',
    priority: 'medium'
  },
  {
    title: 'Visitor Access Denied',
    body: 'Your visitor request for Jane Smith could not be approved.',
    notification_type: 'visitor_denied',
    priority: 'medium'
  },
  {
    title: 'Monthly Maintenance Payment Due',
    body: 'Your monthly maintenance fee of $150 is due in 3 days.',
    notification_type: 'payment_reminder',
    priority: 'high'
  },
  {
    title: 'Payment Overdue Notice',
    body: 'Your monthly maintenance payment is now overdue. Please pay immediately.',
    notification_type: 'payment_overdue',
    priority: 'high'
  },
  {
    title: 'Elevator Maintenance Scheduled',
    body: 'Elevator maintenance is scheduled for tomorrow 10AM-2PM.',
    notification_type: 'maintenance_scheduled',
    priority: 'medium'
  },
  {
    title: 'Elevator Maintenance Completed',
    body: 'The scheduled elevator maintenance has been completed successfully.',
    notification_type: 'maintenance_completed',
    priority: 'medium'
  },
  {
    title: 'Security Alert - Building B',
    body: 'Please be aware of increased security measures in Building B area.',
    notification_type: 'security',
    priority: 'high'
  },
  {
    title: 'Community BBQ Event Tomorrow',
    body: 'Don\'t forget about the community BBQ event tomorrow at 6PM in the garden area.',
    notification_type: 'event_reminder',
    priority: 'medium'
  },
  {
    title: 'Community Pool Booking Confirmed',
    body: 'Your pool booking for Saturday 2PM-4PM has been confirmed.',
    notification_type: 'amenity_booking',
    priority: 'medium'
  },
  {
    title: 'New Community Guidelines',
    body: 'Updated community guidelines are now available. Please review the changes.',
    notification_type: 'community_update',
    priority: 'medium'
  },
  {
    title: 'Your Complaint Has Been Resolved',
    body: 'Your noise complaint #123 has been investigated and resolved.',
    notification_type: 'complaint_resolved',
    priority: 'medium'
  },
  {
    title: 'Water Supply Maintenance Notice',
    body: 'Water supply will be interrupted tomorrow from 10AM-2PM for maintenance.',
    notification_type: 'utility_maintenance',
    priority: 'high'
  },
  {
    title: 'Emergency Alert - Power Outage',
    body: 'Emergency power outage in Building A. Please use emergency exits and stairs only.',
    notification_type: 'emergency',
    priority: 'urgent'
  },
  {
    title: 'Community Newsletter Available',
    body: 'The monthly community newsletter is now available on the notice board.',
    notification_type: 'announcement',
    priority: 'low'
  }
];

console.log('📋 Test Notifications Ready to Add:');
console.log('=====================================');
testNotifications.forEach((notification, index) => {
  console.log(`${index + 1}. ${notification.notification_type}: ${notification.title}`);
});

console.log('\n💡 To add these to your database:');
console.log('1. Open your Supabase dashboard');
console.log('2. Go to Table Editor > notifications');
console.log('3. Insert new rows using the data above');
console.log('4. Make sure to set user_id to your profile ID');
console.log('5. Set created_at to current timestamp');
console.log('6. Set is_read to false and read_at to null for unread notifications');

console.log('\n🎯 Notification Types Covered:');
const types = [...new Set(testNotifications.map(n => n.notification_type))];
types.forEach(type => console.log(`   - ${type}`));

// Export for potential programmatic use
module.exports = { testNotifications };
