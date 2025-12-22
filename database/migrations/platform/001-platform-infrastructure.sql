-- DAY 2 HOUR 1: Platform Infrastructure Database Migration
-- Generated automatically for IFRS Pro Platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create platform admin schema if not exists
CREATE SCHEMA IF NOT EXISTS platform_admin;

-- Configuration table
CREATE TABLE IF NOT EXISTS platform_admin.configuration (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    category VARCHAR(50) NOT NULL DEFAULT 'general',
    tenant_id UUID,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(tenant_id, key)
);

-- System metrics table
CREATE TABLE IF NOT EXISTS platform_admin.system_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cpu_usage DECIMAL(5,2) NOT NULL,
    memory_usage DECIMAL(5,2) NOT NULL,
    disk_usage DECIMAL(5,2) NOT NULL DEFAULT 0,
    database_connections INTEGER NOT NULL,
    cache_hit_rate DECIMAL(5,2) NOT NULL,
    request_count INTEGER NOT NULL,
    error_rate DECIMAL(5,2) NOT NULL,
    response_time INTEGER NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS platform_admin.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID,
    user_id UUID NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    changes JSONB,
    metadata JSONB,
    severity VARCHAR(20) NOT NULL DEFAULT 'low' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('access', 'data', 'calculation', 'configuration', 'workflow', 'security')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_created ON platform_admin.audit_logs(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON platform_admin.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON platform_admin.system_metrics(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_configuration_tenant_category ON platform_admin.configuration(tenant_id, category);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION platform_admin.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for configuration table
CREATE TRIGGER update_configuration_updated_at
    BEFORE UPDATE ON platform_admin.configuration
    FOR EACH ROW EXECUTE FUNCTION platform_admin.update_updated_at_column();
