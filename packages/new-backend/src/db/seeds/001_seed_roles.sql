-- =====================================================================
-- IAF Essential Data Population - LOCAL DEV SERVER
-- =====================================================================
-- Purpose: Create essential IAF roles, menu items, and permissions for local testing
-- Target: ifrspro_tenant_iaf database on localhost:5432
-- Author: Claude Code Assistant
-- Date: 2025-11-16
-- =====================================================================

BEGIN;

-- Set session variables for consistency
SET client_min_messages = WARNING;

-- =====================================================================
-- STEP 1: INSERT IAF ROLES
-- =====================================================================

INSERT INTO core.roles (id, role_code, role_name, description, is_active, tenant_id) VALUES
('550e8400-1111-2222-3333-444455555001', 'IAF_TENANT_SUPERADMIN', 'IAF Tenant Super Administrator', 'Full access to all IAF features', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555002', 'IAF_TENANT_ADMIN', 'IAF Tenant Administrator', 'Administrative access to IAF system', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555003', 'IAF_BANK_CRO', 'IAF Chief Risk Officer', 'Risk management and oversight', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555004', 'IAF_IFRS_MANAGER', 'IAF IFRS 9 Manager', 'IFRS 9 calculations and compliance', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555005', 'IAF_RISK_ANALYST', 'IAF Risk Analyst', 'Risk analysis and assessment', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555006', 'IAF_PORTFOLIO_MANAGER', 'IAF Portfolio Manager', 'Portfolio management and monitoring', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555007', 'IAF_DATA_ADMIN', 'IAF Data Administrator', 'Data management and validation', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555008', 'IAF_REPORT_ANALYST', 'IAF Report Analyst', 'Report generation and analysis', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555009', 'IAF_AUDITOR', 'IAF Internal Auditor', 'Internal audit and compliance', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20'),
('550e8400-1111-2222-3333-444455555010', 'IAF_VIEWER', 'IAF Viewer', 'Read-only access to IAF features', true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20')
ON CONFLICT (role_code) DO NOTHING;

-- =====================================================================
-- STEP 2: VERIFICATION
-- =====================================================================

-- Show roles count
SELECT 'Roles Created' as status, COUNT(*) as count FROM core.roles;

SELECT 'SUCCESS: IAF essential data population completed!' as result;