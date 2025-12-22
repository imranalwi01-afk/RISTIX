-- packages/backend/src/core/database/migrations/001-auth-system.sql
-- IFRS9 Platform Authentication System Migration
-- Based on actual database schemas from backup files

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create core schema if not exists
CREATE SCHEMA IF NOT EXISTS core;
CREATE SCHEMA IF NOT EXISTS audit;

-- ============================================================================
-- AUTHENTICATION SYSTEM TABLES (Based on actual schemas)
-- ============================================================================

-- Users table (enhanced from existing system)
CREATE TABLE IF NOT EXISTS core.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER, -- For migration from existing system
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    position VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    
    -- Multi-factor authentication
    mfa_enabled BOOLEAN DEFAULT false,
    mfa_secret VARCHAR(255),
    
    -- Banking access control
    banking_access VARCHAR(20) DEFAULT 'CONVENTIONAL' CHECK (banking_access IN ('CONVENTIONAL', 'SYARIAH', 'BOTH')),
    
    -- Syariah-specific fields
    syariah_certified BOOLEAN DEFAULT false,
    syariah_certification_date DATE,
    syariah_certification_level VARCHAR(50),
    
    -- Session management
    login_count INTEGER DEFAULT 0,
    current_session_id UUID,
    
    -- Security
    force_password_change BOOLEAN DEFAULT false,
    password_history JSONB DEFAULT '[]',
    
    -- Tenant isolation
    tenant_id UUID NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Roles table (enhanced from existing system)
CREATE TABLE IF NOT EXISTS core.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER,
    role_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    
    -- Banking-specific role configuration
    banking_type_specific VARCHAR(20) CHECK (banking_type_specific IN ('CONVENTIONAL', 'SYARIAH', 'BOTH')),
    compliance_level VARCHAR(50),
    hierarchy_level INTEGER DEFAULT 1 CHECK (hierarchy_level >= 1 AND hierarchy_level <= 10),
    
    -- System roles (cannot be deleted/modified)
    is_system_role BOOLEAN DEFAULT false,
    
    -- Tenant isolation
    tenant_id UUID,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- User roles mapping (enhanced from existing system)
CREATE TABLE IF NOT EXISTS core.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    
    -- Assignment metadata
    assigned_by UUID,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Status and validity
    is_active BOOLEAN DEFAULT true,
    valid_from DATE,
    valid_until DATE,
    
    -- Banking context
    banking_type_restriction VARCHAR(20) CHECK (banking_type_restriction IN ('CONVENTIONAL', 'SYARIAH', 'BOTH')),
    
    -- Temporary assignments
    is_temporary BOOLEAN DEFAULT false,
    temporary_reason TEXT,
    
    -- Tenant isolation
    tenant_id UUID NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- Audit logs table (comprehensive from existing system)
CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_id INTEGER, -- For migration
    
    -- User and session context
    user_id UUID,
    session_id VARCHAR(255),
    correlation_id UUID DEFAULT uuid_generate_v4(),
    
    -- Event details
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Entity information
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    entity_name VARCHAR(200),
    
    -- Change tracking
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Request context
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    
    -- Application context
    application_name VARCHAR(100),
    module_name VARCHAR(100),
    function_name VARCHAR(100),
    
    -- Business context
    business_date DATE,
    calculation_date DATE,
    
    -- Risk and compliance
    risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    compliance_category VARCHAR(50),
    
    -- Performance metrics
    execution_time_ms INTEGER,
    
    -- Tenant isolation
    tenant_id UUID,
    
    -- Timestamps
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- User table constraints
ALTER TABLE core.users
    ADD CONSTRAINT fk_users_created_by FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT fk_users_updated_by FOREIGN KEY (updated_by) REFERENCES core.users(id);

-- Role table constraints
ALTER TABLE core.roles
    ADD CONSTRAINT fk_roles_created_by FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT fk_roles_updated_by FOREIGN KEY (updated_by) REFERENCES core.users(id);

-- User roles constraints
ALTER TABLE core.user_roles
    ADD CONSTRAINT fk_user_roles_user_id FOREIGN KEY (user_id) REFERENCES core.users(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_user_roles_role_id FOREIGN KEY (role_id) REFERENCES core.roles(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_user_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES core.users(id);

-- Audit log constraints
ALTER TABLE audit.audit_logs
    ADD CONSTRAINT fk_audit_logs_user_id FOREIGN KEY (user_id) REFERENCES core.users(id);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

-- Core schema indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON core.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON core.users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON core.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON core.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_banking_access ON core.users(banking_access);
CREATE INDEX IF NOT EXISTS idx_users_syariah_certified ON core.users(syariah_certified);
CREATE INDEX IF NOT EXISTS idx_users_legacy_id ON core.users(legacy_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_tenant_email ON core.users(tenant_id, email);

CREATE INDEX IF NOT EXISTS idx_roles_name ON core.roles(role_name);
CREATE INDEX IF NOT EXISTS idx_roles_active ON core.roles(is_active);
CREATE INDEX IF NOT EXISTS idx_roles_tenant_id ON core.roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_roles_banking_type ON core.roles(banking_type_specific);
CREATE INDEX IF NOT EXISTS idx_roles_system ON core.roles(is_system_role);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON core.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON core.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_tenant_id ON core.user_roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON core.user_roles(is_active);
CREATE INDEX IF NOT EXISTS idx_user_roles_valid_from ON core.user_roles(valid_from);
CREATE INDEX IF NOT EXISTS idx_user_roles_valid_until ON core.user_roles(valid_until);

-- Audit schema indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit.audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit.audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_risk_level ON audit.audit_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_audit_logs_compliance ON audit.audit_logs(compliance_category);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_event_time ON audit.audit_logs(tenant_id, event_type, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_time ON audit.audit_logs(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_time ON audit.audit_logs(entity_type, entity_id, timestamp);

-- ============================================================================
-- ROW LEVEL SECURITY (Tenant Isolation)
-- ============================================================================

-- Enable RLS on core tables
ALTER TABLE core.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.user_roles ENABLE ROW LEVEL SECURITY;

-- Enable RLS on audit tables
ALTER TABLE audit.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tenant isolation
CREATE POLICY tenant_isolation_users ON core.users
    USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_roles ON core.roles
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_user_roles ON core.user_roles
    USING (tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_audit ON audit.audit_logs
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- ============================================================================
-- DEFAULT SYSTEM ROLES
-- ============================================================================

-- Insert default system roles (these will be created for each tenant)
INSERT INTO core.roles (id, role_name, description, permissions, is_system_role, banking_type_specific, hierarchy_level)
VALUES 
    (uuid_generate_v4(), 'PLATFORM_ADMIN', 'Platform Administrator with full system access', 
     '{"*": ["*"]}', true, 'BOTH', 10),
    
    (uuid_generate_v4(), 'TENANT_ADMIN', 'Tenant Administrator with full tenant access', 
     '{"tenant": ["*"], "users": ["*"], "roles": ["*"], "audit": ["read"]}', true, 'BOTH', 9),
    
    (uuid_generate_v4(), 'RISK_MANAGER', 'Risk Manager with portfolio and calculation access', 
     '{"portfolio": ["*"], "calculations": ["*"], "reports": ["*"], "audit": ["read"]}', true, 'BOTH', 8),
    
    (uuid_generate_v4(), 'SYARIAH_OFFICER', 'Syariah Officer with compliance oversight', 
     '{"syariah": ["*"], "compliance": ["*"], "audit": ["read"], "portfolio": ["read"]}', true, 'SYARIAH', 8),
    
    (uuid_generate_v4(), 'CREDIT_ANALYST', 'Credit Analyst with portfolio analysis access', 
     '{"portfolio": ["read", "analyze"], "calculations": ["read"], "reports": ["read"]}', true, 'BOTH', 6),
    
    (uuid_generate_v4(), 'MODEL_VALIDATOR', 'Model Validator with validation and approval rights', 
     '{"models": ["*"], "calculations": ["validate", "approve"], "audit": ["read"]}', true, 'BOTH', 7),
    
    (uuid_generate_v4(), 'DATA_ENTRY_USER', 'Data Entry User with limited portfolio access', 
     '{"portfolio": ["create", "read", "update"], "staging": ["*"]}', true, 'BOTH', 3),
    
    (uuid_generate_v4(), 'READ_ONLY_USER', 'Read-only access to reports and dashboards', 
     '{"reports": ["read"], "dashboards": ["read"], "portfolio": ["read"]}', true, 'BOTH', 1);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON core.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON core.roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON core.user_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA FOR DEVELOPMENT (Optional)
-- ============================================================================

-- Note: This will be populated by the application during tenant creation
-- Sample data should be inserted through the application layer to ensure
-- proper tenant context and security
