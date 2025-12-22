-- ========================================
-- IFRS9 IAF PLATFORM - USER ROLES & PERMISSIONS
-- ========================================
-- Database: ifrspro_platform_admin
-- Purpose: Create roles, menu navigation, and permissions structure
-- User: admin@iaf.co.id should have SUPERADMIN role with all permissions

-- Create roles table
CREATE TABLE IF NOT EXISTS platform_admin.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    level INTEGER NOT NULL DEFAULT 1, -- 1=lowest, 10=highest
    is_active BOOLEAN DEFAULT true,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create menu navigation table
CREATE TABLE IF NOT EXISTS platform_admin.menu_navigation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES platform_admin.menu_navigation(id),
    code VARCHAR(50) UNIQUE NOT NULL,
    label VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    path VARCHAR(500),
    component VARCHAR(200),
    sort_order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    banking_modes TEXT[] DEFAULT ARRAY['conventional', 'syariah'],
    required_roles TEXT[] DEFAULT ARRAY[],
    requires_setup BOOLEAN DEFAULT false,
    target VARCHAR(20) DEFAULT '_self',
    external_url VARCHAR(500),
    badge JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user roles mapping table
CREATE TABLE IF NOT EXISTS platform_admin.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL, -- 'tenant', 'platform', 'consultant', 'regulator'
    tenant_id UUID,
    role_id UUID REFERENCES platform_admin.roles(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, role_id, tenant_id)
);

-- Create role permissions table
CREATE TABLE IF NOT EXISTS platform_admin.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id UUID REFERENCES platform_admin.roles(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES platform_admin.menu_navigation(id) ON DELETE CASCADE,
    permissions JSONB DEFAULT '{"read": true, "write": false, "delete": false, "admin": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert basic roles
INSERT INTO platform_admin.roles (code, name, description, level, permissions) VALUES
('SUPERADMIN', 'Super Administrator', 'Full system access with all permissions', 10, '["all"]'),
('PLATFORM_ADMIN', 'Platform Administrator', 'Platform management access', 9, '["platform_management", "user_management", "tenant_management", "system_configuration"]'),
('TENANT_ADMIN', 'Tenant Administrator', 'Tenant management access', 8, '["tenant_management", "user_management", "menu_configuration"]'),
('BANK_CRO', 'Chief Risk Officer', 'Banking risk management access', 7, '["risk_management", "ifrs9_read", "ifrs9_write", "reports_read"]'),
('BANK_IFRS_MANAGER', 'IFRS 9 Manager', 'IFRS 9 calculation management', 6, '["ifrs9_management", "ifrs9_read", "ifrs9_write", "reports_read", "data_upload", "data_process"]'),
('BANK_RISK_ANALYST', 'Risk Analyst', 'Risk analysis and reporting', 5, '["risk_analysis", "ifrs9_read", "reports_read", "portfolio_read"]'),
('BANK_PORTFOLIO_MANAGER', 'Portfolio Manager', 'Portfolio management access', 5, '["portfolio_management", "portfolio_read", "portfolio_write"]'),
('BANK_DATA_ADMIN', 'Data Administrator', 'Data management and upload', 4, '["data_management", "data_upload", "data_process", "portfolio_read"]'),
('SYARIAH_BANK_CRO', 'Syariah Bank CRO', 'Islamic banking risk management', 7, '["risk_management", "ifrs9_read", "ifrs9_write", "reports_read", "syariah_compliance"]'),
('SYARIAH_COMPLIANCE_OFFICER', 'Syariah Compliance Officer', 'Islamic compliance oversight', 6, '["syariah_compliance", "ifrs9_read", "reports_read", "compliance_auditing"]'),
('SENIOR_IFRS9_CONSULTANT', 'Senior IFRS 9 Consultant', 'Consulting and advisory access', 8, '["consulting", "ifrs9_read", "ifrs9_write", "reports_read", "implementation_support"]'),
('BANKING_SUPERVISION_HEAD', 'Banking Supervision Head', 'Regulatory oversight', 9, '["regulatory_oversight", "compliance_monitoring", "audit_access", "reports_read"]')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    level = EXCLUDED.level,
    permissions = EXCLUDED.permissions;

-- Get the admin user ID from tenant database (we know it exists)
-- First, let's insert the SUPERADMIN role assignment for admin@iaf.co.id
INSERT INTO platform_admin.user_roles (user_id, user_email, user_type, role_id, assigned_by)
SELECT
    u.id,
    u.email,
    'tenant',
    r.id,
    u.id
FROM ifrspro_tenant_iaf.core.users u
CROSS JOIN platform_admin.roles r
WHERE u.email = 'admin@iaf.co.id'
  AND r.code = 'SUPERADMIN'
ON CONFLICT (user_id, role_id, tenant_id) DO UPDATE SET
    is_active = EXCLUDED.is_active,
    assigned_at = CURRENT_TIMESTAMP;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_menu_navigation_parent_id ON platform_admin.menu_navigation(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_navigation_code ON platform_admin.menu_navigation(code);
CREATE INDEX IF NOT EXISTS idx_menu_navigation_level ON platform_admin.menu_navigation(level);
CREATE INDEX IF NOT EXISTS idx_menu_navigation_is_active ON platform_admin.menu_navigation(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON platform_admin.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_email ON platform_admin.user_roles(user_email);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON platform_admin.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON platform_admin.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_menu_item_id ON platform_admin.role_permissions(menu_item_id);

COMMIT;