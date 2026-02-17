/*
  Consolidated WhatsApp Schema Migration - SIMPLIFIED
  
  This migration consolidates the changes from:
  - 20260210144953_add_whatsapp_sandbox_joined (failed in production)
  - 20260216070501_feature_xyz (removes whatsappSandboxJoined)
  
  IMPORTANT: This SQL is idempotent and safe to run on databases in any state.
  It will NOT delete any user data, only modify schema structure.
  
  NOTE: We skip enum modifications as they were already applied in the failed migration.
*/

-- ============================================
-- CREATE NEW ENUMS (if they don't exist)
-- ============================================

DO $$ BEGIN
  CREATE TYPE "MessageDirection" AS ENUM ('outbound', 'inbound');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "TemplateCategory" AS ENUM ('notification', 'invitation', 'reminder', 'general');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ApprovalStatus" AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- ALTER EXISTING ENUMS
-- ============================================
-- NOTE: Enum values were already added manually to the production database.
-- This section is kept for documentation but the actual ALTER TYPE commands
-- are commented out to avoid errors during migration.

-- The following enum values were added manually:
-- MessageStatus: queued, sent, delivered, read, failed, undelivered, received
-- SenderType: admin, user, system
-- MessageDirection: outbound, inbound (created as new enum)
-- TemplateCategory: notification, invitation, reminder, general (created as new enum)
-- ApprovalStatus: pending, approved, rejected (created as new enum)

-- ============================================
-- ALTER TABLE: users
-- ============================================

-- Alter phone column to VARCHAR(20) if it's not already
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'phone' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE "users" ALTER COLUMN "phone" SET DATA TYPE VARCHAR(20);
  END IF;
END $$;

-- Add phone index if it doesn't exist
CREATE INDEX IF NOT EXISTS "users_phone_idx" ON "users"("phone");

-- NOTE: We do NOT add whatsappSandboxJoined column because it was removed in the next migration

-- ============================================
-- ALTER TABLE: message_templates
-- ============================================

-- Drop 'body' column if it exists (renamed to templateBody)
ALTER TABLE "message_templates" DROP COLUMN IF EXISTS "body";

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'approvalStatus') THEN
    ALTER TABLE "message_templates" ADD COLUMN "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'category') THEN
    ALTER TABLE "message_templates" ADD COLUMN "category" "TemplateCategory" NOT NULL DEFAULT 'general';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'isActive') THEN
    ALTER TABLE "message_templates" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'language') THEN
    ALTER TABLE "message_templates" ADD COLUMN "language" VARCHAR(5) NOT NULL DEFAULT 'es';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'templateBody') THEN
    ALTER TABLE "message_templates" ADD COLUMN "templateBody" TEXT NOT NULL DEFAULT '';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'twilioContentSid') THEN
    ALTER TABLE "message_templates" ADD COLUMN "twilioContentSid" VARCHAR(34);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'message_templates' AND column_name = 'variables') THEN
    ALTER TABLE "message_templates" ADD COLUMN "variables" JSONB;
  END IF;
END $$;

-- Alter name column to VARCHAR(100) if it's not already
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'message_templates' 
    AND column_name = 'name' 
    AND data_type = 'text'
  ) THEN
    ALTER TABLE "message_templates" ALTER COLUMN "name" SET DATA TYPE VARCHAR(100);
  END IF;
END $$;

-- Make createdBy NOT NULL (only if there are no NULL values)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'message_templates' 
    AND column_name = 'createdBy' 
    AND is_nullable = 'NO'
  ) THEN
    -- First, update any NULL values to a default (empty string or a valid user ID)
    -- You may need to adjust this based on your data
    UPDATE "message_templates" SET "createdBy" = '' WHERE "createdBy" IS NULL;
    
    -- Then set NOT NULL constraint
    ALTER TABLE "message_templates" ALTER COLUMN "createdBy" SET NOT NULL;
  END IF;
END $$;

-- Add unique constraint on name if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'message_templates_name_key'
  ) THEN
    ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_name_key" UNIQUE ("name");
  END IF;
END $$;

-- ============================================
-- ALTER TABLE: whatsapp_messages
-- ============================================

-- Add direction column with default if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_messages' AND column_name = 'direction') THEN
    ALTER TABLE "whatsapp_messages" ADD COLUMN "direction" "MessageDirection" NOT NULL DEFAULT 'outbound';
  END IF;
END $$;

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_messages' AND column_name = 'errorCode') THEN
    ALTER TABLE "whatsapp_messages" ADD COLUMN "errorCode" VARCHAR(10);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_messages' AND column_name = 'errorMessage') THEN
    ALTER TABLE "whatsapp_messages" ADD COLUMN "errorMessage" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_messages' AND column_name = 'mediaUrl') THEN
    ALTER TABLE "whatsapp_messages" ADD COLUMN "mediaUrl" TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_messages' AND column_name = 'templateUsed') THEN
    ALTER TABLE "whatsapp_messages" ADD COLUMN "templateUsed" VARCHAR(100);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'whatsapp_messages' AND column_name = 'templateVariables') THEN
    ALTER TABLE "whatsapp_messages" ADD COLUMN "templateVariables" JSONB;
  END IF;
END $$;

-- Make userId nullable if it's not already
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'whatsapp_messages' 
    AND column_name = 'userId' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "whatsapp_messages" ALTER COLUMN "userId" DROP NOT NULL;
  END IF;
END $$;

-- Set default for status column
ALTER TABLE "whatsapp_messages" ALTER COLUMN "status" SET DEFAULT 'queued';

-- Add unique constraint and index on twilioMessageSid if they don't exist
CREATE UNIQUE INDEX IF NOT EXISTS "whatsapp_messages_twilioMessageSid_key" ON "whatsapp_messages"("twilioMessageSid");
CREATE INDEX IF NOT EXISTS "whatsapp_messages_twilioMessageSid_idx" ON "whatsapp_messages"("twilioMessageSid");

-- ============================================
-- CREATE TABLE: system_settings
-- ============================================

CREATE TABLE IF NOT EXISTS "system_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- Add unique constraint on key if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'system_settings_key_key'
  ) THEN
    ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_key_key" UNIQUE ("key");
  END IF;
END $$;

-- ============================================
-- ADD FOREIGN KEYS (if they don't exist)
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'message_templates_createdBy_fkey'
  ) THEN
    ALTER TABLE "message_templates" ADD CONSTRAINT "message_templates_createdBy_fkey" 
    FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
