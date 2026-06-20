-- =============================================================================
-- IAF: Seed Business Setting B0031 — Impact Level Configuration
-- =============================================================================
-- This setting configures approval requirements, SLA hours, and queue priorities
-- per impact level. Managed via Business Settings UI (/banking/setup/business).
-- Falls back to hardcoded defaults if not found.
-- =============================================================================

BEGIN;

-- Insert header
INSERT INTO frs9_param_commonh (param_code, param_name, param_usage, param_type, createdby, createddate, createdhost, banking_type, is_active, requires_approval)
VALUES ('B0031', 'Impact Level Config', 'Approval requirements, SLA hours, and queue priority per impact level', 'B', 'system', NOW(), 'migration', 'dual', true, false)
ON CONFLICT (param_code) DO NOTHING;

-- Low level
INSERT INTO frs9_param_commond (param_code, param_seq, value1, value2, value3, paramdesc, createdby, createddate, createdhost)
VALUES
('B0031', 1,  'levels.low.approvalsRequired',        '1',   '', 'Low: Number of approvals required', 'system', NOW(), 'migration'),
('B0031', 2,  'levels.low.slaHours',                 '24',  '', 'Low: SLA in hours', 'system', NOW(), 'migration'),
('B0031', 3,  'levels.low.escalationAfterHours',     '12',  '', 'Low: Escalation after hours', 'system', NOW(), 'migration'),
('B0031', 4,  'levels.low.requireDecisionComment',   'false', '', 'Low: Require decision comment', 'system', NOW(), 'migration'),
('B0031', 5,  'levels.low.queuePriority',            '5',   '', 'Low: BullMQ priority (0=highest)', 'system', NOW(), 'migration'),
-- Medium level
('B0031', 6,  'levels.medium.approvalsRequired',     '1',   '', 'Medium: Number of approvals required', 'system', NOW(), 'migration'),
('B0031', 7,  'levels.medium.slaHours',              '8',   '', 'Medium: SLA in hours', 'system', NOW(), 'migration'),
('B0031', 8,  'levels.medium.escalationAfterHours',  '4',   '', 'Medium: Escalation after hours', 'system', NOW(), 'migration'),
('B0031', 9,  'levels.medium.requireDecisionComment', 'false', '', 'Medium: Require decision comment', 'system', NOW(), 'migration'),
('B0031', 10, 'levels.medium.queuePriority',         '5',   '', 'Medium: BullMQ priority (0=highest)', 'system', NOW(), 'migration'),
-- High level
('B0031', 11, 'levels.high.approvalsRequired',        '2',   '', 'High: Number of approvals required', 'system', NOW(), 'migration'),
('B0031', 12, 'levels.high.slaHours',                 '4',   '', 'High: SLA in hours', 'system', NOW(), 'migration'),
('B0031', 13, 'levels.high.escalationAfterHours',     '2',   '', 'High: Escalation after hours', 'system', NOW(), 'migration'),
('B0031', 14, 'levels.high.requireDecisionComment',   'true', '', 'High: Require decision comment', 'system', NOW(), 'migration'),
('B0031', 15, 'levels.high.queuePriority',            '1',   '', 'High: BullMQ priority (0=highest)', 'system', NOW(), 'migration'),
-- Critical level
('B0031', 16, 'levels.critical.approvalsRequired',    '2',   '', 'Critical: Number of approvals required', 'system', NOW(), 'migration'),
('B0031', 17, 'levels.critical.slaHours',             '2',   '', 'Critical: SLA in hours', 'system', NOW(), 'migration'),
('B0031', 18, 'levels.critical.escalationAfterHours', '1',   '', 'Critical: Escalation after hours', 'system', NOW(), 'migration'),
('B0031', 19, 'levels.critical.requireDecisionComment', 'true', '', 'Critical: Require decision comment', 'system', NOW(), 'migration'),
('B0031', 20, 'levels.critical.queuePriority',        '0',   '', 'Critical: BullMQ priority (0=highest)', 'system', NOW(), 'migration');

COMMIT;
