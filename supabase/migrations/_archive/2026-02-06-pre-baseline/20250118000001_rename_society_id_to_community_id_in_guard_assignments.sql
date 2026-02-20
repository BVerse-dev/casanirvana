-- Migration: Rename society_id to community_id in guard_assignments table
-- This migration updates the column name to align with the frontend terminology changes

-- Check if guard_assignments table exists and has society_id column
DO $$
BEGIN
    -- Check if the table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'guard_assignments') THEN
        -- Check if society_id column exists
        IF EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'guard_assignments' AND column_name = 'society_id') THEN
            
            -- Rename society_id column to community_id
            ALTER TABLE guard_assignments RENAME COLUMN society_id TO community_id;
            
            -- Update any indexes that reference the old column name
            -- Note: PostgreSQL automatically updates index names when columns are renamed
            
            RAISE NOTICE 'Successfully renamed society_id to community_id in guard_assignments table';
        ELSE
            RAISE NOTICE 'Column society_id does not exist in guard_assignments table';
        END IF;
    ELSE
        RAISE NOTICE 'Table guard_assignments does not exist';
    END IF;
END $$;

-- Update any foreign key constraints if they exist
-- This will update the constraint names to reflect the new column name
DO $$
BEGIN
    -- Check if there are any foreign key constraints on the old column
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'guard_assignments' 
          AND kcu.column_name = 'community_id'
          AND tc.constraint_type = 'FOREIGN KEY'
    ) THEN
        RAISE NOTICE 'Foreign key constraints found and will be automatically updated';
    END IF;
END $$;

-- Add comment to track this change
COMMENT ON COLUMN guard_assignments.community_id IS 'Community ID - renamed from society_id for consistency with frontend terminology';
