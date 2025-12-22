-- Simple IAF tenant setup for role-based menus

-- Add IAF roles to the existing roles table
INSERT INTO core.roles (id, role_code, role_name, description, permissions, is_active, tenant_id, created_at, updated_at) VALUES
('9a1b2c3d-4e5f-6789-0abc-def123456789', 'BANK_CRO', 'Bank CRO', 'Chief Risk Officer - Indonesia Airawata Finance',
'{"can_view_dashboard": true, "can_view_reports": true, "can_approve_ecl": true, "can_manage_risk": true}',
true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('9b1c2d3e-4f5a-6789-1abc-def234567890', 'BANK_IFRS_MANAGER', 'Bank IFRS Manager', 'IFRS 9 Manager - Indonesia Airawata Finance',
'{"can_view_dashboard": true, "can_view_parameters": true, "can_manage_ifrs9": true, "can_view_reports": true}',
true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('9c1d2e3f-4f5b-6789-2abc-def345678901', 'BANK_RISK_ANALYST', 'Bank Risk Analyst', 'Risk Analyst - Indonesia Airawata Finance',
'{"can_view_dashboard": true, "can_view_portfolio": true, "can_view_reports": true, "can_analyze_risk": true}',
true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('9d1e2f3a-4f5c-6789-3abc-def456789012', 'BANK_PORTFOLIO_MANAGER', 'Bank Portfolio Manager', 'Portfolio Manager - Indonesia Airawata Finance',
'{"can_view_dashboard": true, "can_manage_portfolio": true, "can_view_customers": true, "can_manage_data": true}',
true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

('9e1f2a3b-4f5d-6789-4abc-def567890123', 'BANK_DATA_ADMIN', 'Bank Data Admin', 'Data Administrator - Indonesia Airawata Finance',
'{"can_view_dashboard": true, "can_manage_parameters": true, "can_upload_data": true, "can_manage_system": true}',
true, 'a24af6d2-3032-4d53-ae82-9cfa84f97a20', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)

ON CONFLICT DO NOTHING;

-- Update existing menu items to use IAF tenant ID
UPDATE core.menu_items SET tenant_id = 'a24af6d2-3032-4d53-ae82-9cfa84f97a20' WHERE tenant_id IS NULL;

-- Update menu configuration to use IAF tenant ID
UPDATE core.menu_configuration SET tenant_id = 'a24af6d2-3032-4d53-ae82-9cfa84f97a20' WHERE tenant_id IS NULL;