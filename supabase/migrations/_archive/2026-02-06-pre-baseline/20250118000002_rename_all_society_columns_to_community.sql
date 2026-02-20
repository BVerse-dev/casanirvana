-- Migration: Rename all society_id columns to community_id across all tables
-- This migration ensures consistency between frontend and database terminology

-- Function to safely rename column if it exists
CREATE OR REPLACE FUNCTION rename_society_column_if_exists(
    table_name_param TEXT,
    old_column_name TEXT DEFAULT 'society_id',
    new_column_name TEXT DEFAULT 'community_id'
) RETURNS VOID AS $$
BEGIN
    -- Check if table and column exist
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = table_name_param 
        AND column_name = old_column_name
    ) THEN
        -- Rename the column
        EXECUTE format('ALTER TABLE %I RENAME COLUMN %I TO %I', 
                      table_name_param, old_column_name, new_column_name);
        
        -- Add comment
        EXECUTE format('COMMENT ON COLUMN %I.%I IS %L', 
                      table_name_param, new_column_name, 
                      'Community ID - renamed from ' || old_column_name || ' for consistency');
        
        RAISE NOTICE 'Renamed %.% to %.%', table_name_param, old_column_name, table_name_param, new_column_name;
    ELSE
        RAISE NOTICE 'Column %.% does not exist, skipping', table_name_param, old_column_name;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply column renames to all relevant tables
DO $$
BEGIN
    -- Guard related tables
    PERFORM rename_society_column_if_exists('guard_assignments');
    PERFORM rename_society_column_if_exists('guard_schedules');
    PERFORM rename_society_column_if_exists('guard_profiles');
    
    -- User profiles table
    PERFORM rename_society_column_if_exists('profiles');
    
    -- Property related tables
    PERFORM rename_society_column_if_exists('units');
    PERFORM rename_society_column_if_exists('properties');
    
    -- Maintenance and complaints
    PERFORM rename_society_column_if_exists('maintenance_requests');
    PERFORM rename_society_column_if_exists('complaints');
    
    -- Payments and billing
    PERFORM rename_society_column_if_exists('payments');
    PERFORM rename_society_column_if_exists('billing_records');
    
    -- Visitor management
    PERFORM rename_society_column_if_exists('visitor_passes');
    PERFORM rename_society_column_if_exists('visitor_logs');
    
    -- Notices and announcements
    PERFORM rename_society_column_if_exists('notices');
    PERFORM rename_society_column_if_exists('announcements');
    
    -- Amenity bookings
    PERFORM rename_society_column_if_exists('amenity_bookings');
    
    -- Documents and records
    PERFORM rename_society_column_if_exists('documents');
    PERFORM rename_society_column_if_exists('community_documents');
    
    -- Events and activities
    PERFORM rename_society_column_if_exists('events');
    PERFORM rename_society_column_if_exists('activities');
    
    -- Settings and configurations
    PERFORM rename_society_column_if_exists('community_settings');
    PERFORM rename_society_column_if_exists('system_settings');
    
    RAISE NOTICE 'Completed society_id to community_id column renames across all tables';
END $$;

-- Clean up the helper function
DROP FUNCTION IF EXISTS rename_society_column_if_exists(TEXT, TEXT, TEXT);

-- Update any views that might reference the old column names
-- Note: This would need to be customized based on actual views in the database
DO $$
BEGIN
    -- Check for views that might need updating
    IF EXISTS (
        SELECT 1 
        FROM information_schema.views 
        WHERE table_name LIKE '%guard%' OR table_name LIKE '%society%' OR table_name LIKE '%community%'
    ) THEN
        RAISE NOTICE 'Found views that may need manual updating for column name changes';
        RAISE NOTICE 'Please review and update any views that reference society_id columns';
    END IF;
END $$;
