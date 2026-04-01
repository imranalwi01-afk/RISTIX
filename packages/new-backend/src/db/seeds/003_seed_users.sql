-- =====================================================================
-- IAF Users Population - LOCAL DEV SERVER
-- =====================================================================
-- Purpose: Create essential IAF users for local testing
-- Target: ifrspro_tenant_iaf database on localhost:5432
-- Author: Claude Code Assistant
-- Date: 2025-11-16
-- =====================================================================

BEGIN;

-- Set session variables for consistency
SET client_min_messages = WARNING;

-- =====================================================================
-- STEP 1: INSERT IAF USERS
-- =====================================================================

INSERT INTO core.users (id, email, username, full_name, password_hash, is_active, tenant_id) VALUES
('550e8400-1111-2222-3333-444455555201', 'admin@iaf.co.id', 'admin_iaf', 'IAF Tenant Super Administrator', '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm', true, 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'),
('550e8400-1111-2222-3333-444455555202', 'ifrs.manager@iaf.co.id', 'ifrs_manager_iaf', 'IAF IFRS 9 Manager', '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm', true, 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'),
('550e8400-1111-2222-3333-444455555203', 'cro@iaf.co.id', 'cro_iaf', 'IAF Chief Risk Officer', '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm', true, 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'),
('550e8400-1111-2222-3333-444455555204', 'risk.analyst@iaf.co.id', 'risk_analyst_iaf', 'IAF Risk Analyst', '$2b$12$tKOOToVFaC2Jg80mdawWGuZgOMH1YBIobz8eJuMSVDkq0WqCBaZpm', true, 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be')
ON CONFLICT (email, tenant_id) DO NOTHING;

-- =====================================================================
-- STEP 2: ASSIGN ROLES TO USERS
-- =====================================================================

-- Assign SUPERADMIN role to admin@iaf.co.id
INSERT INTO core.user_roles (user_id, role_id, assigned_by, assigned_at, tenant_id)
SELECT u.id, r.id, u.id, CURRENT_TIMESTAMP, u.tenant_id
FROM core.users u, core.roles r
WHERE u.email = 'admin@iaf.co.id' AND r.role_code = 'IAF_TENANT_SUPERADMIN'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign IFRS_MANAGER role to ifrs.manager@iaf.co.id
INSERT INTO core.user_roles (user_id, role_id, assigned_by, assigned_at, tenant_id)
SELECT u.id, r.id, u.id, CURRENT_TIMESTAMP, u.tenant_id
FROM core.users u, core.roles r
WHERE u.email = 'ifrs.manager@iaf.co.id' AND r.role_code = 'IAF_IFRS_MANAGER'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign CRO role to cro@iaf.co.id
INSERT INTO core.user_roles (user_id, role_id, assigned_by, assigned_at, tenant_id)
SELECT u.id, r.id, u.id, CURRENT_TIMESTAMP, u.tenant_id
FROM core.users u, core.roles r
WHERE u.email = 'cro@iaf.co.id' AND r.role_code = 'IAF_BANK_CRO'
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign RISK_ANALYST role to risk.analyst@iaf.co.id
INSERT INTO core.user_roles (user_id, role_id, assigned_by, assigned_at, tenant_id)
SELECT u.id, r.id, u.id, CURRENT_TIMESTAMP, u.tenant_id
FROM core.users u, core.roles r
WHERE u.email = 'risk.analyst@iaf.co.id' AND r.role_code = 'IAF_RISK_ANALYST'
ON CONFLICT (user_id, role_id) DO NOTHING;

COMMIT;

-- =====================================================================
-- STEP 3: VERIFICATION
-- =====================================================================

-- Show users created
SELECT 'Users Created' as status, COUNT(*) as count FROM core.users WHERE tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be';

-- Show user roles assigned
SELECT 'User Roles Assigned' as status, COUNT(*) as count FROM core.user_roles;

-- Show user details with roles
SELECT
    u.email,
    u.username,
    u.full_name,
    u.is_active,
    STRING_AGG(r.role_code, ', ') as roles
FROM core.users u
LEFT JOIN core.user_roles ur ON u.id = ur.user_id
LEFT JOIN core.roles r ON ur.role_id = r.id
WHERE u.tenant_id = 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
GROUP BY u.id, u.email, u.username, u.full_name, u.is_active
ORDER BY u.email;

SELECT 'SUCCESS: IAF users and roles assigned!' as result;

-- Note: Password hash for all users is "1019181716" (already hashed with bcrypt)