-- packages/backend/src/core/database/migrations/001-create-platform-tables.sql
-- Platform Admin Database Migration
-- Generated: $(date)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS platform_admin;
CREATE SCHEMA IF NOT EXISTS platform_audit;
CREATE SCHEMA IF NOT EXISTS platform_billing;
CREATE SCHEMA IF NOT EXISTS platform_monitoring;
CREATE SCHEMA IF NOT EXISTS platform_integration;
CREATE SCHEMA IF NOT EXISTS platform_analytics;

-- Set search path
SET search_path TO platform_admin, platform_audit, platform_billing, platform_monitoring, platform_integration, platform_analytics, public;

-- ============================================================================
-- PLATFORM ADMIN SCHEMA
-- ============================================================================

-- Tenants table (core tenant management)
CREATE TABLE platform_admin.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_slug VARCHAR(100) NOT NULL UNIQUE,
    tenant_name VARCHAR(200) NOT NULL,
    banking_type VARCHAR(20) NOT NULL CHECK (banking_type IN ('conventional', 'syariah', 'dual')),
    database_name VARCHAR(100) NOT NULL UNIQUE,
    database_host VARCHAR(255) DEFAULT 'localhost',
    database_port INTEGER DEFAULT 5432,
    database_user VARCHAR(100) NOT NULL,
    database_password VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated', 'pending')),
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    max_users INTEGER DEFAULT 10,
    max_accounts INTEGER DEFAULT 1000,
    storage_limit_gb INTEGER DEFAULT 10,
    features JSONB DEFAULT '{}',
    custom_domain VARCHAR(255),
    subdomain VARCHAR(100),
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    locale VARCHAR(10) DEFAULT 'id-ID',
    currency VARCHAR(3) DEFAULT 'IDR',
    business_license VARCHAR(100),
    contact_person VARCHAR(200),
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    province VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Indonesia',
    postal_code VARCHAR(20),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    annual_revenue DECIMAL(15,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    last_accessed_at TIMESTAMPTZ,
    created_by UUID,
    updated_by UUID
);

-- Platform users table (super admin, support, etc.)
CREATE TABLE platform_admin.platform_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'support',
    permissions JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Tenant billing information
CREATE TABLE platform_billing.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES platform_admin.tenants(id) ON DELETE CASCADE,
    plan_name VARCHAR(100) NOT NULL,
    plan_type VARCHAR(50) NOT NULL DEFAULT 'monthly',
    price_per_month DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'IDR',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renewal BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'suspended')),
    payment_method VARCHAR(50),
    payment_details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLATFORM AUDIT SCHEMA
-- ============================================================================

-- Tenant activity audit
CREATE TABLE platform_audit.tenant_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES platform_admin.tenants(id),
    user_id UUID,
    session_id UUID,
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    risk_level VARCHAR(20) DEFAULT 'low',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Platform system audit
CREATE TABLE platform_audit.system_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform_user_id UUID REFERENCES platform_admin.platform_users(id),
    event_type VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    description TEXT,
    affected_tenant_id UUID REFERENCES platform_admin.tenants(id),
    system_component VARCHAR(100),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- PLATFORM MONITORING SCHEMA
-- ============================================================================

-- Tenant performance metrics
CREATE TABLE platform_monitoring.tenant_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES platform_admin.tenants(id),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(20),
    metric_category VARCHAR(50),
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

-- System health monitoring
CREATE TABLE platform_monitoring.health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    check_name VARCHAR(100) NOT NULL,
    check_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    response_time_ms INTEGER,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    checked_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Tenants indexes
CREATE INDEX idx_tenants_slug ON platform_admin.tenants(tenant_slug);
CREATE INDEX idx_tenants_banking_type ON platform_admin.tenants(banking_type);
CREATE INDEX idx_tenants_status ON platform_admin.tenants(status);
CREATE INDEX idx_tenants_created_at ON platform_admin.tenants(created_at);

-- Platform users indexes
CREATE INDEX idx_platform_users_email ON platform_admin.platform_users(email);
CREATE INDEX idx_platform_users_username ON platform_admin.platform_users(username);
CREATE INDEX idx_platform_users_active ON platform_admin.platform_users(is_active);

-- Audit indexes
CREATE INDEX idx_tenant_audit_tenant ON platform_audit.tenant_audit_logs(tenant_id);
CREATE INDEX idx_tenant_audit_timestamp ON platform_audit.tenant_audit_logs(timestamp);
CREATE INDEX idx_tenant_audit_event ON platform_audit.tenant_audit_logs(event_type, event_category);

-- Monitoring indexes
CREATE INDEX idx_performance_tenant ON platform_monitoring.tenant_performance_metrics(tenant_id);
CREATE INDEX idx_performance_recorded_at ON platform_monitoring.tenant_performance_metrics(recorded_at);
CREATE INDEX idx_health_checks_checked_at ON platform_monitoring.health_checks(checked_at);

-- Success message
SELECT 'Platform Admin database structure created successfully!' as result;
