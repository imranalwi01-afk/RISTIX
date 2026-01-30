-- Fix tenant users schema to match Drizzle definition
-- Adding missing is_platform_admin column

ALTER TABLE "core"."users" ADD COLUMN IF NOT EXISTS "is_platform_admin" boolean DEFAULT false NOT NULL;
