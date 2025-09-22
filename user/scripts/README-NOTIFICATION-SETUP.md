# Casa Nirvana Notification Test Data Setup

## Quick Setup Guide

### 1. Get Your Supabase Project Details

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **Casa Nirvana** project
3. Go to **Settings** → **API**
4. Copy your:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **Anon/Public Key** (starts with `eyJhbGciOiJIUzI1NiIs...`)

### 2. Update the Seeder Script

1. Open `supabaseNotificationSeeder.js`
2. Replace these lines:
   ```javascript
   const SUPABASE_URL = 'https://your-project-ref.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```
   
   With your actual values:
   ```javascript
   const SUPABASE_URL = 'https://your-actual-project-url.supabase.co';
   const SUPABASE_ANON_KEY = 'your-actual-anon-key';
   ```

### 3. Install Dependencies

```bash
cd /Users/andromeda/casanirvana/user/scripts
npm install @supabase/supabase-js
```

### 4. Run the Seeder

```bash
node supabaseNotificationSeeder.js
```

## What This Will Add

The script will add **16 test notifications** covering all the enhanced message types:

### 🏠 Community Management
- `join_request_approved` - Welcome message with community benefits
- `join_request_rejected` - Application update with next steps

### 👥 Visitor Management  
- `visitor_approved` - Visitor access granted
- `visitor_denied` - Visitor access denied with guidance

### 💰 Payment Notifications
- `payment_reminder` - Friendly payment due notice
- `payment_overdue` - Urgent overdue payment alert

### 🔧 Maintenance Updates
- `maintenance_scheduled` - Upcoming maintenance notice
- `maintenance_completed` - Work completion confirmation

### 🛡️ Security & Safety
- `security` - Security alerts with guidelines
- `emergency` - Critical emergency notifications

### 🎉 Community Events
- `event_reminder` - Event details and preparation
- `amenity_booking` - Facility reservation confirmation

### 📢 General Communications
- `community_update` - Policy and guideline updates
- `complaint_resolved` - Issue resolution updates
- `utility_maintenance` - Service interruption notices
- `announcement` - General community announcements

## Testing the Enhanced Messages

After running the seeder:

1. **Open your app** and go to notifications
2. **Pull to refresh** to load the new data
3. **Tap any notification** to see the detailed, structured messages
4. **Test the favorite and reminder buttons** on the notification detail screen
5. **Try different notification types** to see varied message formats

## Safety Features

The script includes:
- ✅ Connection validation
- ✅ User authentication check
- ✅ Existing data verification
- ✅ Error handling and rollback
- ✅ No data deletion or modification

## Troubleshooting

### "No authenticated user found"
- Make sure you're logged into your app first
- The script uses your current session

### "Connection failed" 
- Double-check your Supabase URL and key
- Ensure your project is active

### "User profile not found"
- Make sure your user has a profile in the `profiles` table
- Check that the `user_id` field matches your auth user

## Manual Alternative

If the script doesn't work, you can manually add notifications via Supabase Dashboard:

1. Go to **Table Editor** → **notifications**
2. Click **Insert** → **Insert row**
3. Use the sample data from `addTestNotifications.js`
4. Set `user_id` to your profile ID
5. Set `created_at` to current timestamp
6. Set `is_read` to `false` and `read_at` to `null`
