-- ============================================================================
-- Seed USR_DEPT and USR_POS business parameters
-- These provide the dropdown options for Department and Position
-- in the User Management form (UserFormDialog.tsx fetches from these)
-- ============================================================================

-- Header: frs9_param_commonh
-- Detail: frs9_param_commond (value1 = option label)

-- USR_DEPT
INSERT INTO frs9_param_commonh (param_code, param_name, param_usage, param_type, createdby, createddate, createdhost, banking_type)
SELECT 'USR_DEPT', 'Department List', 'User department options', 'B', 'SYSTEM', NOW(), 'localhost', 'conventional'
WHERE NOT EXISTS (SELECT 1 FROM frs9_param_commonh WHERE param_code = 'USR_DEPT');

INSERT INTO frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost)
SELECT * FROM (VALUES
    ('USR_DEPT', 1,  'Finance & Accounting',   '', '', 'Finance & Accounting Department',  'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 2,  'Risk Management',         '', '', 'Risk Management Department',        'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 3,  'Information Technology',  '', '', 'Information Technology Department', 'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 4,  'Operations',              '', '', 'Operations Department',             'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 5,  'Legal & Compliance',      '', '', 'Legal & Compliance Department',    'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 6,  'Internal Audit',          '', '', 'Internal Audit Department',        'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 7,  'Treasury',                '', '', 'Treasury Department',              'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 8,  'Credit Analysis',         '', '', 'Credit Analysis Department',       'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 9,  'Human Resources',         '', '', 'Human Resources Department',       'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 10, 'General Affairs',         '', '', 'General Affairs Department',       'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 11, 'Marketing',               '', '', 'Marketing Department',             'SYSTEM', NOW(), 'localhost'),
    ('USR_DEPT', 12, 'Business Development',    '', '', 'Business Development Department',  'SYSTEM', NOW(), 'localhost')
) AS v WHERE NOT EXISTS (SELECT 1 FROM frs9_param_commond WHERE param_code = 'USR_DEPT');

-- USR_POS
INSERT INTO frs9_param_commonh (param_code, param_name, param_usage, param_type, createdby, createddate, createdhost, banking_type)
SELECT 'USR_POS', 'Position List', 'User position options', 'B', 'SYSTEM', NOW(), 'localhost', 'conventional'
WHERE NOT EXISTS (SELECT 1 FROM frs9_param_commonh WHERE param_code = 'USR_POS');

INSERT INTO frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost)
SELECT * FROM (VALUES
    ('USR_POS', 1,  'Director',              '', '', 'Director',                        'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 2,  'General Manager',       '', '', 'General Manager',                 'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 3,  'Senior Manager',        '', '', 'Senior Manager',                  'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 4,  'Manager',               '', '', 'Manager',                         'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 5,  'Assistant Manager',     '', '', 'Assistant Manager',               'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 6,  'Supervisor',            '', '', 'Supervisor',                      'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 7,  'Senior Staff',          '', '', 'Senior Staff',                    'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 8,  'Staff',                 '', '', 'Staff',                           'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 9,  'Analyst',              '', '', 'Analyst',                          'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 10, 'Officer',              '', '', 'Officer',                          'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 11, 'Administrator',        '', '', 'Administrator',                    'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 12, 'Specialist',           '', '', 'Specialist',                       'SYSTEM', NOW(), 'localhost'),
    ('USR_POS', 13, 'Intern',               '', '', 'Intern',                           'SYSTEM', NOW(), 'localhost')
) AS v WHERE NOT EXISTS (SELECT 1 FROM frs9_param_commond WHERE param_code = 'USR_POS');
