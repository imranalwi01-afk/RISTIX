-- Add first_name and last_name columns
ALTER TABLE core.users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);

-- Populate from full_name
-- Simple split: first word is first_name, rest is last_name
UPDATE core.users
SET 
    first_name = split_part(full_name, ' ', 1),
    last_name = NULLIF(substring(full_name from position(' ' in full_name) + 1), '')
WHERE first_name IS NULL;
