// This script connects to Supabase, checks existing tables, and creates any missing tables
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Connect to Supabase using environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: VITE_SUPABASE_URL and/or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// List of expected tables based on feature map
const expectedTables = [
  'profiles',
  'societies',
  'units',
  'visitor_passes',
  'notices',
  'payments',
  'amenities',
  'amenity_bookings',
  'complaints',
  'messages',
  'services',
  'service_requests',
  'emergency_alerts',
  'app_settings',
  'email_settings',
  'payment_settings',
  'notification_templates',
  'notifications',
  'admins',
  'roles_permissions',
  'languages',
  'system_config'
];

// Map of table schemas for tables that need to be created
const tableSchemas = {
  profiles: `
    CREATE TABLE IF NOT EXISTS profiles (
      id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'guard', 'admin', 'superadmin')),
      phone TEXT,
      profile_pic_url TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view their own profile
    CREATE POLICY "Users can view own profile" ON profiles
      FOR SELECT USING (auth.uid() = id);
    
    -- Policy for users to update their own profile
    CREATE POLICY "Users can update own profile" ON profiles
      FOR UPDATE USING (auth.uid() = id);
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON profiles
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin'));
  `,

  societies: `
    CREATE TABLE IF NOT EXISTS societies (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      type TEXT CHECK (type IN ('apartment', 'villa', 'gated_community')),
      total_units INTEGER NOT NULL,
      image_url TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE societies ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view societies they belong to
    CREATE POLICY "Users can view their societies" ON societies
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM units
          WHERE units.society_id = id
          AND units.user_id = auth.uid()
        )
      );
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON societies
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin', 'admin'));

    -- Policy for guards to view societies they are assigned to
    CREATE POLICY "Guards can view assigned societies" ON societies
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM guard_assignments
          WHERE guard_assignments.society_id = id
          AND guard_assignments.guard_id = auth.uid()
        )
      );
  `,

  units: `
    CREATE TABLE IF NOT EXISTS units (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      unit_number TEXT NOT NULL,
      floor_number TEXT,
      block_number TEXT,
      type TEXT CHECK (type IN ('1BHK', '2BHK', '3BHK', '4BHK', 'villa', 'penthouse')),
      area_sqft NUMERIC,
      society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
      user_id UUID REFERENCES auth.users(id),
      is_owner BOOLEAN DEFAULT false,
      is_rented BOOLEAN DEFAULT false,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(society_id, unit_number, block_number)
    );
    
    -- Enable Row Level Security
    ALTER TABLE units ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view their own units
    CREATE POLICY "Users can view own units" ON units
      FOR SELECT USING (auth.uid() = user_id);
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON units
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin'));
    
    -- Policy for guards to view units in societies they are assigned to
    CREATE POLICY "Guards can view units in assigned societies" ON units
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM guard_assignments
          WHERE guard_assignments.society_id = units.society_id
          AND guard_assignments.guard_id = auth.uid()
        )
      );
  `,

  visitor_passes: `
    CREATE TABLE IF NOT EXISTS visitor_passes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
      unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      created_by UUID NOT NULL REFERENCES auth.users(id),
      visitor_name TEXT NOT NULL,
      visitor_phone TEXT,
      vehicle_number TEXT,
      visitor_type TEXT CHECK (type IN ('guest', 'delivery', 'service', 'taxi', 'other')),
      visit_date DATE NOT NULL,
      visit_time TIME NOT NULL,
      expected_duration INTEGER, -- Duration in minutes
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'checked_in', 'checked_out', 'cancelled')),
      approved_by UUID REFERENCES auth.users(id),
      approved_at TIMESTAMP WITH TIME ZONE,
      checked_in_by UUID REFERENCES auth.users(id),
      check_in_time TIMESTAMP WITH TIME ZONE,
      checked_out_by UUID REFERENCES auth.users(id),
      check_out_time TIMESTAMP WITH TIME ZONE,
      rejection_reason TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE visitor_passes ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view their own visitor passes
    CREATE POLICY "Users can view own visitor passes" ON visitor_passes
      FOR SELECT USING (auth.uid() = created_by);
    
    -- Policy for users to create visitor passes for their units
    CREATE POLICY "Users can create visitor passes for own units" ON visitor_passes
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM units
          WHERE units.id = visitor_passes.unit_id
          AND units.user_id = auth.uid()
        )
      );
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON visitor_passes
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin'));
    
    -- Policy for guards to view visitor passes in societies they are assigned to
    CREATE POLICY "Guards can view visitor passes in assigned societies" ON visitor_passes
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM guard_assignments
          WHERE guard_assignments.society_id = visitor_passes.society_id
          AND guard_assignments.guard_id = auth.uid()
        )
      );
    
    -- Policy for guards to update visitor passes in societies they are assigned to
    CREATE POLICY "Guards can update visitor passes in assigned societies" ON visitor_passes
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM guard_assignments
          WHERE guard_assignments.society_id = visitor_passes.society_id
          AND guard_assignments.guard_id = auth.uid()
        )
      );
  `,

  amenities: `
    CREATE TABLE IF NOT EXISTS amenities (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      capacity INTEGER,
      opening_time TIME,
      closing_time TIME,
      is_bookable BOOLEAN DEFAULT TRUE,
      pricing_type TEXT CHECK (pricing_type IN ('free', 'hourly', 'daily', 'fixed')),
      price NUMERIC DEFAULT 0,
      availability_schedule JSONB,
      rules TEXT,
      contact_info TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(society_id, name)
    );
    
    -- Enable Row Level Security
    ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view amenities in their society
    CREATE POLICY "Users can view amenities in their society" ON amenities
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM units
          WHERE units.society_id = amenities.society_id
          AND units.user_id = auth.uid()
        )
      );
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON amenities
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin', 'admin'));
  `,

  amenity_bookings: `
    CREATE TABLE IF NOT EXISTS amenity_bookings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      amenity_id UUID NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
      society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id),
      unit_id UUID NOT NULL REFERENCES units(id),
      booking_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      number_of_guests INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled', 'completed')),
      payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded', 'free')),
      amount NUMERIC DEFAULT 0,
      approved_by UUID REFERENCES auth.users(id),
      approved_at TIMESTAMP WITH TIME ZONE,
      rejection_reason TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE amenity_bookings ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view their own bookings
    CREATE POLICY "Users can view own amenity bookings" ON amenity_bookings
      FOR SELECT USING (auth.uid() = user_id);
    
    -- Policy for users to create bookings for their units
    CREATE POLICY "Users can create bookings for own units" ON amenity_bookings
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM units
          WHERE units.id = amenity_bookings.unit_id
          AND units.user_id = auth.uid()
        )
      );
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON amenity_bookings
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin', 'admin'));
  `,

  emergency_alerts: `
    CREATE TABLE IF NOT EXISTS emergency_alerts (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
      unit_id UUID REFERENCES units(id),
      raised_by UUID NOT NULL REFERENCES auth.users(id),
      alert_type TEXT NOT NULL CHECK (alert_type IN ('fire', 'medical', 'security', 'other')),
      description TEXT,
      location TEXT,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved')),
      acknowledged_by UUID REFERENCES auth.users(id),
      acknowledged_at TIMESTAMP WITH TIME ZONE,
      resolved_by UUID REFERENCES auth.users(id),
      resolved_at TIMESTAMP WITH TIME ZONE,
      resolution_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE emergency_alerts ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view alerts in their society
    CREATE POLICY "Users can view emergency alerts in their society" ON emergency_alerts
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM units
          WHERE units.society_id = emergency_alerts.society_id
          AND units.user_id = auth.uid()
        )
      );
    
    -- Policy for users to create emergency alerts
    CREATE POLICY "Users can create emergency alerts" ON emergency_alerts
      FOR INSERT WITH CHECK (auth.uid() = raised_by);
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON emergency_alerts
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin'));
    
    -- Policy for guards to view and update alerts in societies they are assigned to
    CREATE POLICY "Guards can view and update emergency alerts in assigned societies" ON emergency_alerts
      USING (
        EXISTS (
          SELECT 1 FROM guard_assignments
          WHERE guard_assignments.society_id = emergency_alerts.society_id
          AND guard_assignments.guard_id = auth.uid()
        )
      );
  `,

  notifications: `
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      notification_type TEXT NOT NULL,
      is_read BOOLEAN DEFAULT FALSE,
      read_at TIMESTAMP WITH TIME ZONE,
      action_url TEXT,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view their own notifications
    CREATE POLICY "Users can view own notifications" ON notifications
      FOR SELECT USING (auth.uid() = user_id);
    
    -- Policy for users to mark their own notifications as read
    CREATE POLICY "Users can update own notifications" ON notifications
      FOR UPDATE USING (auth.uid() = user_id);
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON notifications
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin'));
  `,

  services: `
    CREATE TABLE IF NOT EXISTS services (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      is_active BOOLEAN DEFAULT TRUE,
      cost_type TEXT CHECK (cost_type IN ('free', 'fixed', 'hourly', 'variable')),
      base_cost NUMERIC DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE services ENABLE ROW LEVEL SECURITY;
    
    -- Policy for everyone to view active services
    CREATE POLICY "Anyone can view active services" ON services
      FOR SELECT USING (is_active = TRUE);
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON services
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin', 'admin'));
  `,

  service_requests: `
    CREATE TABLE IF NOT EXISTS service_requests (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      service_id UUID NOT NULL REFERENCES services(id),
      society_id UUID NOT NULL REFERENCES societies(id) ON DELETE CASCADE,
      unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id),
      description TEXT NOT NULL,
      requested_date DATE,
      requested_time TIME,
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
      payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'refunded', 'free')),
      amount NUMERIC DEFAULT 0,
      assigned_to UUID REFERENCES auth.users(id),
      assigned_at TIMESTAMP WITH TIME ZONE,
      completed_by UUID REFERENCES auth.users(id),
      completed_at TIMESTAMP WITH TIME ZONE,
      completion_notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Enable Row Level Security
    ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
    
    -- Policy for users to view their own service requests
    CREATE POLICY "Users can view own service requests" ON service_requests
      FOR SELECT USING (auth.uid() = user_id);
    
    -- Policy for users to create service requests for their units
    CREATE POLICY "Users can create service requests for own units" ON service_requests
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM units
          WHERE units.id = service_requests.unit_id
          AND units.user_id = auth.uid()
        )
      );
    
    -- Policy for service role and superadmin to do everything
    CREATE POLICY "Service role and superadmin can do everything" ON service_requests
      USING (auth.jwt() ->> 'role' IN ('service_role', 'supabase_admin', 'superadmin', 'admin'));
  `

  // Add more table schemas here...
};

async function checkAndCreateTables() {
  try {
    console.log('Checking existing tables in Supabase...');

    // Query to get all existing tables in the public schema
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      throw new Error(`Error fetching tables: ${tablesError.message}`);
    }

    const existingTableNames = existingTables.map(table => table.table_name);
    console.log('Existing tables:', existingTableNames);

    // Find missing tables
    const missingTables = expectedTables.filter(table => !existingTableNames.includes(table));
    console.log('Missing tables that need to be created:', missingTables);

    // Create missing tables
    for (const table of missingTables) {
      if (tableSchemas[table]) {
        console.log(`Creating table: ${table}`);
        const { error } = await supabase.rpc('exec_sql', { sql: tableSchemas[table] });

        if (error) {
          console.error(`Error creating table ${table}:`, error);
        } else {
          console.log(`Successfully created table: ${table}`);
        }
      } else {
        console.warn(`Schema definition not found for table: ${table}`);
      }
    }

    console.log('Table check and creation process completed.');
  } catch (error) {
    console.error('Error in checkAndCreateTables:', error);
  }
}

// Run the function
checkAndCreateTables();
