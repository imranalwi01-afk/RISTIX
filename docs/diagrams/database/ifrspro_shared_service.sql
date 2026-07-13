-- ============================================================================
-- IFRSPRO SHARED SERVICES DATABASE SCHEMA
-- ============================================================================
-- Database: ifrspro_shared_services
-- Purpose: Shared services and resources across all tenants
-- Server: 172.25.0.25 (or as configured)
-- ============================================================================

-- Create database (run as superuser)
-- CREATE DATABASE ifrspro_shared_services
--     WITH 
--     OWNER = postgres
--     ENCODING = 'UTF8'
--     LC_COLLATE = 'en_US.UTF-8'
--     LC_CTYPE = 'en_US.UTF-8'
--     TABLESPACE = pg_default
--     CONNECTION LIMIT = -1;

-- Connect to the database
-- \c ifrspro_shared_services

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- SHARED CONFIGURATION TABLES
-- ============================================================================

-- System-wide configuration
CREATE TABLE IF NOT EXISTS shared_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(255) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    config_type VARCHAR(50) NOT NULL, -- 'system', 'feature', 'integration'
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_shared_config_key ON shared_config(config_key);
CREATE INDEX idx_shared_config_type ON shared_config(config_type);

-- Feature flags shared across tenants
CREATE TABLE IF NOT EXISTS feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_key VARCHAR(255) NOT NULL UNIQUE,
    flag_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    target_tenants TEXT[], -- Array of tenant IDs, NULL means all tenants
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feature_flags_key ON feature_flags(flag_key);
CREATE INDEX idx_feature_flags_enabled ON feature_flags(is_enabled);

-- ============================================================================
-- SHARED RESOURCES
-- ============================================================================

-- Shared file storage metadata
CREATE TABLE IF NOT EXISTS shared_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    storage_provider VARCHAR(50) DEFAULT 'local', -- 'local', 's3', 'azure', 'gcs'
    storage_bucket VARCHAR(255),
    storage_key TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    access_level VARCHAR(50) DEFAULT 'private', -- 'public', 'private', 'tenant-shared'
    allowed_tenants TEXT[], -- Array of tenant IDs that can access
    checksum VARCHAR(64),
    metadata JSONB,
    uploaded_by VARCHAR(255),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_shared_files_path ON shared_files(file_path);
CREATE INDEX idx_shared_files_provider ON shared_files(storage_provider);
CREATE INDEX idx_shared_files_access ON shared_files(access_level);

-- Shared templates (email, reports, documents)
CREATE TABLE IF NOT EXISTS shared_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_key VARCHAR(255) NOT NULL UNIQUE,
    template_name VARCHAR(255) NOT NULL,
    template_type VARCHAR(50) NOT NULL, -- 'email', 'report', 'document', 'notification'
    template_content TEXT NOT NULL,
    template_format VARCHAR(50) DEFAULT 'html', -- 'html', 'markdown', 'json', 'xml'
    variables JSONB, -- Available template variables
    is_active BOOLEAN DEFAULT TRUE,
    version INTEGER DEFAULT 1,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255),
    updated_by VARCHAR(255)
);

CREATE INDEX idx_shared_templates_key ON shared_templates(template_key);
CREATE INDEX idx_shared_templates_type ON shared_templates(template_type);
CREATE INDEX idx_shared_templates_active ON shared_templates(is_active);

-- ============================================================================
-- SHARED INTEGRATIONS
-- ============================================================================

-- External service integrations
CREATE TABLE IF NOT EXISTS shared_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_key VARCHAR(255) NOT NULL UNIQUE,
    integration_name VARCHAR(255) NOT NULL,
    integration_type VARCHAR(100) NOT NULL, -- 'email', 'sms', 'payment', 'analytics', 'storage'
    provider VARCHAR(100) NOT NULL, -- 'sendgrid', 'twilio', 'stripe', etc.
    config JSONB NOT NULL, -- Integration-specific configuration
    credentials JSONB, -- Encrypted credentials
    is_active BOOLEAN DEFAULT TRUE,
    health_status VARCHAR(50) DEFAULT 'unknown', -- 'healthy', 'degraded', 'down', 'unknown'
    last_health_check TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_integrations_key ON shared_integrations(integration_key);
CREATE INDEX idx_shared_integrations_type ON shared_integrations(integration_type);
CREATE INDEX idx_shared_integrations_active ON shared_integrations(is_active);

-- Integration usage logs
CREATE TABLE IF NOT EXISTS integration_usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    integration_id UUID REFERENCES shared_integrations(id) ON DELETE CASCADE,
    tenant_id VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(50) NOT NULL, -- 'success', 'failure', 'pending'
    error_message TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_integration_logs_integration ON integration_usage_logs(integration_id);
CREATE INDEX idx_integration_logs_tenant ON integration_usage_logs(tenant_id);
CREATE INDEX idx_integration_logs_created ON integration_usage_logs(created_at);

-- ============================================================================
-- SHARED NOTIFICATIONS
-- ============================================================================

-- Notification queue for cross-tenant notifications
CREATE TABLE IF NOT EXISTS shared_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_type VARCHAR(100) NOT NULL, -- 'email', 'sms', 'push', 'in-app'
    recipient_type VARCHAR(50) NOT NULL, -- 'user', 'tenant', 'admin', 'system'
    recipient_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    template_id UUID REFERENCES shared_templates(id),
    template_data JSONB,
    priority VARCHAR(50) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
    scheduled_at TIMESTAMP WITH TIME ZONE,
    sent_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_notifications_status ON shared_notifications(status);
CREATE INDEX idx_shared_notifications_type ON shared_notifications(notification_type);
CREATE INDEX idx_shared_notifications_recipient ON shared_notifications(recipient_id);
CREATE INDEX idx_shared_notifications_scheduled ON shared_notifications(scheduled_at);

-- ============================================================================
-- SHARED AUDIT & LOGGING
-- ============================================================================

-- System-wide audit trail
CREATE TABLE IF NOT EXISTS shared_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id VARCHAR(255),
    user_id VARCHAR(255),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_audit_tenant ON shared_audit_logs(tenant_id);
CREATE INDEX idx_shared_audit_user ON shared_audit_logs(user_id);
CREATE INDEX idx_shared_audit_action ON shared_audit_logs(action);
CREATE INDEX idx_shared_audit_resource ON shared_audit_logs(resource_type, resource_id);
CREATE INDEX idx_shared_audit_created ON shared_audit_logs(created_at);

-- ============================================================================
-- SHARED CACHE & SESSIONS
-- ============================================================================

-- Shared cache entries (for cross-tenant caching)
CREATE TABLE IF NOT EXISTS shared_cache (
    cache_key VARCHAR(500) PRIMARY KEY,
    cache_value JSONB NOT NULL,
    tenant_id VARCHAR(255),
    ttl INTEGER, -- Time to live in seconds
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_cache_tenant ON shared_cache(tenant_id);
CREATE INDEX idx_shared_cache_expires ON shared_cache(expires_at);

-- ============================================================================
-- SHARED JOBS & TASKS
-- ============================================================================

-- Background job queue
CREATE TABLE IF NOT EXISTS shared_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(100) NOT NULL,
    job_name VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255),
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    failed_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    result JSONB,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_shared_jobs_status ON shared_jobs(status);
CREATE INDEX idx_shared_jobs_type ON shared_jobs(job_type);
CREATE INDEX idx_shared_jobs_tenant ON shared_jobs(tenant_id);
CREATE INDEX idx_shared_jobs_scheduled ON shared_jobs(scheduled_at);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_shared_config_updated_at BEFORE UPDATE ON shared_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_templates_updated_at BEFORE UPDATE ON shared_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_integrations_updated_at BEFORE UPDATE ON shared_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_cache_updated_at BEFORE UPDATE ON shared_cache
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shared_jobs_updated_at BEFORE UPDATE ON shared_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default system configuration
INSERT INTO shared_config (config_key, config_value, config_type, description) VALUES
    ('system.version', '"1.0.0"', 'system', 'Current system version'),
    ('system.maintenance_mode', 'false', 'system', 'System maintenance mode flag'),
    ('email.default_from', '"noreply@ifrspro.id"', 'integration', 'Default email sender'),
    ('storage.default_provider', '"local"', 'integration', 'Default storage provider')
ON CONFLICT (config_key) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON DATABASE ifrspro_shared_services IS 'Shared services and resources across all IFRS9 tenants';
COMMENT ON TABLE shared_config IS 'System-wide configuration shared across tenants';
COMMENT ON TABLE feature_flags IS 'Feature flags for gradual rollout and A/B testing';
COMMENT ON TABLE shared_files IS 'Shared file storage metadata';
COMMENT ON TABLE shared_templates IS 'Reusable templates for emails, reports, and documents';
COMMENT ON TABLE shared_integrations IS 'External service integrations';
COMMENT ON TABLE shared_notifications IS 'Cross-tenant notification queue';
COMMENT ON TABLE shared_audit_logs IS 'System-wide audit trail';
COMMENT ON TABLE shared_cache IS 'Shared cache for cross-tenant data';
COMMENT ON TABLE shared_jobs IS 'Background job queue';
