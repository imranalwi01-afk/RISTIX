-- Fix tenant users schema to match Drizzle definition
-- Adding missing first_name and last_name columns

ALTER TABLE "core"."users" ADD COLUMN IF NOT EXISTS "first_name" varchar(100);
ALTER TABLE "core"."users" ADD COLUMN IF NOT EXISTS "last_name" varchar(100);

-- Optional: Attempt to populate from full_name if simple split is possible (best effort)
-- UPDATE "core"."users" 
-- SET 
--   "first_name" = split_part("full_name", ' ', 1),
--   "last_name" = substring("full_name" from position(' ' in "full_name") + 1)
-- WHERE "first_name" IS NULL AND "full_name" IS NOT NULL;
