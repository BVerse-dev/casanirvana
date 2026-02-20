-- Migration: Extend messages table to support file attachments and message types
-- Date: 2025-01-23

-- Add columns to support message types and file attachments
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS message_type TEXT NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT NULL,
  -- Keep body for text content, can be null for file-only messages
  ALTER COLUMN body DROP NOT NULL;

-- Add check constraint for valid message types
ALTER TABLE messages 
  ADD CONSTRAINT check_message_type 
  CHECK (message_type IN ('text', 'file'));

-- Add constraint to ensure either body or attachments exist
ALTER TABLE messages 
  ADD CONSTRAINT check_message_content 
  CHECK (
    (message_type = 'text' AND body IS NOT NULL) OR
    (message_type = 'file' AND attachments IS NOT NULL) OR
    (body IS NOT NULL AND attachments IS NOT NULL)
  );

-- Create index for faster queries by message type
CREATE INDEX IF NOT EXISTS idx_messages_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_sent_at ON messages(sent_at DESC); 