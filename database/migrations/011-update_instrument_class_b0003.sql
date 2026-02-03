-- Migration: Update Instrument Class (B0003) to IFRS 9 Standards
-- Date: 2026-02-02
-- Description: Updates the 'Instrument Class' dropdown values from legacy 'A'/'L' to IFRS 9 standard 'AC'/'FVTPL'/'FVOCI'.

BEGIN;

-- 1. Clean up existing legacy B0003 entries
DELETE FROM frs9_param_commond 
WHERE param_code = 'B0003';

-- 2. Insert new IFRS 9 Standard values
INSERT INTO frs9_param_commond (
    param_code, 
    param_seq, 
    value1,
    value2,
    value3, 
    paramdesc,
    createdby,
    createddate,
    createdhost
) VALUES 
('B0003', 1, 'AC',    '', '', 'Amortised Cost',                                'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),
('B0003', 2, 'FVTPL', '', '', 'Fair Value Through Profit or Loss',             'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'),
('B0003', 3, 'FVOCI', '', '', 'Fair Value Through Other Comprehensive Income', 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM');

COMMIT;
