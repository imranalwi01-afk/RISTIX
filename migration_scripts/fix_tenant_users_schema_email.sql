-- Fix tenant users schema to match Drizzle definition
-- Adding missing is_email_verified column

ALTER TABLE "core"."users" ADD COLUMN IF NOT EXISTS "is_email_verified" boolean DEFAULT false NOT NULL;

-- Optional: Sync with existing is_verified if it exists
-- UPDATE "core"."users" SET "is_email_verified" = "is_verified" WHERE "is_verified" IS NOT NULL;
