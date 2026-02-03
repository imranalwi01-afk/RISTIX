-- Migration: Increase al_flag column length in frs9_param_product
-- Date: 2026-02-02
-- Description: Updates the 'al_flag' column from VARCHAR(1) to VARCHAR(10) to support IFRS 9 values (AC, FVTPL, FVOCI).

BEGIN;

-- Alter the column type to support longer strings
ALTER TABLE frs9_param_product 
ALTER COLUMN al_flag TYPE VARCHAR(10);

COMMIT;
