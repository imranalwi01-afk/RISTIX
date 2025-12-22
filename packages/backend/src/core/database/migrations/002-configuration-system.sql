-- packages/backend/src/core/database/migrations/002-configuration-system.sql
-- ============================================================================
-- CONFIGURATION SYSTEM MIGRATION
-- ============================================================================
-- Based on TodoList-v2.md Hour 4 requirements
-- Features: Database-driven configuration with environment/tenant support
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create core schema if not exists
CREATE SCHEMA IF NOT EXISTS core;

-- ============================================================================
-- CONFIGURATION SYSTEM TABLES
-- ============================================================================

-- Configuration table for database-driven settings
CREATE TABLE IF NOT EXISTS core.app_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_key VARCHAR(255) NOT NULL,
    config_value JSONB NOT NULL,
    config_type VARCHAR(20) DEFAULT 'string' CHECK (config_type IN ('string', 'number', 'boolean', 'json', 'array', 'encrypted')),
    category VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Tenant and environment context
    tenant_id UUID,
    environment VARCHAR(20) CHECK (environment IN ('development', 'staging', 'production', 'test')),
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    is_encrypted BOOLEAN DEFAULT false,
    access_level VARCHAR(20) DEFAULT 'internal' CHECK (access_level IN ('public', 'internal', 'admin', 'system')),
    
    -- Metadata
    tags TEXT[] DEFAULT '{}',
    version INTEGER DEFAULT 1,
    schema JSONB,
    
    -- Validation
    validation_rules JSONB,
    default_value JSONB,
    is_required BOOLEAN DEFAULT false,
    
    -- Status and lifecycle
    is_active BOOLEAN DEFAULT true,
    deprecated BOOLEAN DEFAULT false,
    deprecation_message TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Unique constraint for key + tenant + environment
    CONSTRAINT unique_config_key_tenant_env UNIQUE (config_key, tenant_id, environment)
);

-- Business rules configuration (specialized for IFRS 9)
CREATE TABLE IF NOT EXISTS core.business_rules_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_name VARCHAR(255) NOT NULL,
    rule_category VARCHAR(100) NOT NULL,
    rule_definition JSONB NOT NULL,
    conditions JSONB DEFAULT '{}',
    actions JSONB DEFAULT '{}',
    priority INTEGER DEFAULT 1,
    
    -- Banking type specific
    banking_type VARCHAR(20) CHECK (banking_type IN ('conventional', 'syariah', 'both')),
    compliance_standard VARCHAR(100), -- e.g., 'AAOIFI', 'BASEL_III', 'IFRS_9'
    
    -- Validation and testing
    test_cases JSONB DEFAULT '[]',
    validation_schema JSONB,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    effective_from DATE,
    effective_until DATE,
    
    -- Tenant isolation
    tenant_id UUID,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    -- Unique constraint
    CONSTRAINT unique_rule_name_tenant UNIQUE (rule_name, tenant_id)
);

-- Security policies configuration
CREATE TABLE IF NOT EXISTS core.security_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_name VARCHAR(255) NOT NULL,
    policy_type VARCHAR(50) NOT NULL, -- 'password', 'session', 'mfa', 'access'
    policy_rules JSONB NOT NULL,
    enforcement_level VARCHAR(20) DEFAULT 'strict' CHECK (enforcement_level IN ('strict', 'moderate', 'lenient')),
    
    -- Scope
    scope VARCHAR(50) DEFAULT 'global' CHECK (scope IN ('global', 'tenant', 'role', 'user')),
    target_id UUID, -- tenant_id, role_id, or user_id depending on scope
    
    -- Banking compliance
    compliance_requirements JSONB DEFAULT '{}',
    audit_frequency VARCHAR(20) DEFAULT 'daily', -- 'real_time', 'hourly', 'daily', 'weekly'
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 1,
    
    -- Tenant isolation
    tenant_id UUID,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT unique_policy_name_tenant UNIQUE (policy_name, tenant_id)
);

-- Feature flags configuration
CREATE TABLE IF NOT EXISTS core.feature_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flag_name VARCHAR(255) NOT NULL,
    flag_key VARCHAR(255) NOT NULL,
    description TEXT,
    flag_type VARCHAR(20) DEFAULT 'boolean' CHECK (flag_type IN ('boolean', 'percentage', 'variant', 'json')),
    default_value JSONB NOT NULL,
    
    -- Targeting rules
    targeting_rules JSONB DEFAULT '{}',
    rollout_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    user_targeting JSONB DEFAULT '{}',
    
    -- Environment and tenant context
    environments TEXT[] DEFAULT '{}',
    tenant_id UUID,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_permanent BOOLEAN DEFAULT false,
    
    -- Lifecycle
    rollout_start_date TIMESTAMPTZ,
    rollout_end_date TIMESTAMPTZ,
    cleanup_date TIMESTAMPTZ,
    
    -- Audit fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT unique_flag_key_tenant UNIQUE (flag_key, tenant_id)
);

-- Configuration history (for auditing and rollback)
CREATE TABLE IF NOT EXISTS core.configuration_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    config_id UUID NOT NULL,
    config_key VARCHAR(255) NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('create', 'update', 'delete', 'deprecate')),
    change_reason TEXT,
    
    -- Context
    tenant_id UUID,
    environment VARCHAR(20),
    
    -- Audit fields
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    changed_by UUID,
    change_source VARCHAR(50) DEFAULT 'manual' -- 'manual', 'api', 'migration', 'automated'
);

-- ============================================================================
-- INDEXES (Performance optimization)
-- ============================================================================

-- App configurations indexes
CREATE INDEX IF NOT EXISTS idx_app_configs_category ON core.app_configurations(category);
CREATE INDEX IF NOT EXISTS idx_app_configs_tenant_id ON core.app_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_app_configs_environment ON core.app_configurations(environment);
CREATE INDEX IF NOT EXISTS idx_app_configs_active ON core.app_configurations(is_active);
CREATE INDEX IF NOT EXISTS idx_app_configs_access_level ON core.app_configurations(access_level);
CREATE INDEX IF NOT EXISTS idx_app_configs_deprecated ON core.app_configurations(deprecated);
CREATE INDEX IF NOT EXISTS idx_app_configs_tags ON core.app_configurations USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_app_configs_key_tenant_env ON core.app_configurations(config_key, tenant_id, environment);

-- Business rules indexes
CREATE INDEX IF NOT EXISTS idx_business_rules_category ON core.business_rules_config(rule_category);
CREATE INDEX IF NOT EXISTS idx_business_rules_tenant_id ON core.business_rules_config(tenant_id);
CREATE INDEX IF NOT EXISTS idx_business_rules_banking_type ON core.business_rules_config(banking_type);
CREATE INDEX IF NOT EXISTS idx_business_rules_active ON core.business_rules_config(is_active);
CREATE INDEX IF NOT EXISTS idx_business_rules_effective FROM core.business_rules_config(effective_from, effective_until);
CREATE INDEX IF NOT EXISTS idx_business_rules_priority ON core.business_rules_config(priority);

-- Security policies indexes
CREATE INDEX IF NOT EXISTS idx_security_policies_type ON core.security_policies(policy_type);
CREATE INDEX IF NOT EXISTS idx_security_policies_tenant_id ON core.security_policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_policies_scope ON core.security_policies(scope);
CREATE INDEX IF NOT EXISTS idx_security_policies_active ON core.security_policies(is_active);
CREATE INDEX IF NOT EXISTS idx_security_policies_target ON core.security_policies(target_id);

-- Feature flags indexes
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON core.feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_tenant_id ON core.feature_flags(tenant_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_active ON core.feature_flags(is_active);
CREATE INDEX IF NOT EXISTS idx_feature_flags_environments ON core.feature_flags USING GIN(environments);
CREATE INDEX IF NOT EXISTS idx_feature_flags_rollout ON core.feature_flags(rollout_start_date, rollout_end_date);

-- Configuration history indexes
CREATE INDEX IF NOT EXISTS idx_config_history_config_id ON core.configuration_history(config_id);
CREATE INDEX IF NOT EXISTS idx_config_history_key ON core.configuration_history(config_key);
CREATE INDEX IF NOT EXISTS idx_config_history_tenant_id ON core.configuration_history(tenant_id);
CREATE INDEX IF NOT EXISTS idx_config_history_changed_at ON core.configuration_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_config_history_type ON core.configuration_history(change_type);

-- ============================================================================
-- FOREIGN KEY CONSTRAINTS
-- ============================================================================

-- App configurations constraints
ALTER TABLE core.app_configurations
    ADD CONSTRAINT fk_app_configs_created_by FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT fk_app_configs_updated_by FOREIGN KEY (updated_by) REFERENCES core.users(id);

-- Business rules constraints
ALTER TABLE core.business_rules_config
    ADD CONSTRAINT fk_business_rules_created_by FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT fk_business_rules_updated_by FOREIGN KEY (updated_by) REFERENCES core.users(id);

-- Security policies constraints
ALTER TABLE core.security_policies
    ADD CONSTRAINT fk_security_policies_created_by FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT fk_security_policies_updated_by FOREIGN KEY (updated_by) REFERENCES core.users(id);

-- Feature flags constraints
ALTER TABLE core.feature_flags
    ADD CONSTRAINT fk_feature_flags_created_by FOREIGN KEY (created_by) REFERENCES core.users(id),
    ADD CONSTRAINT fk_feature_flags_updated_by FOREIGN KEY (updated_by) REFERENCES core.users(id);

-- Configuration history constraints
ALTER TABLE core.configuration_history
    ADD CONSTRAINT fk_config_history_config_id FOREIGN KEY (config_id) REFERENCES core.app_configurations(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_config_history_changed_by FOREIGN KEY (changed_by) REFERENCES core.users(id);

-- ============================================================================
-- ROW LEVEL SECURITY (Tenant Isolation)
-- ============================================================================

-- Enable RLS on configuration tables
ALTER TABLE core.app_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.business_rules_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.security_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE core.configuration_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY tenant_isolation_app_configs ON core.app_configurations
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_business_rules ON core.business_rules_config
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_security_policies ON core.security_policies
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_feature_flags ON core.feature_flags
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

CREATE POLICY tenant_isolation_config_history ON core.configuration_history
    USING (tenant_id IS NULL OR tenant_id = (current_setting('app.current_tenant_id', true))::uuid);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Function to track configuration changes
CREATE OR REPLACE FUNCTION track_configuration_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into history table
    IF TG_OP = 'UPDATE' THEN
        INSERT INTO core.configuration_history (
            config_id, config_key, old_value, new_value, 
            change_type, tenant_id, environment, changed_by
        ) VALUES (
            NEW.id, NEW.config_key, OLD.config_value, NEW.config_value,
            'update', NEW.tenant_id, NEW.environment, NEW.updated_by
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO core.configuration_history (
            config_id, config_key, old_value, new_value,
            change_type, tenant_id, environment, changed_by
        ) VALUES (
            NEW.id, NEW.config_key, NULL, NEW.config_value,
            'create', NEW.tenant_id, NEW.environment, NEW.created_by
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO core.configuration_history (
            config_id, config_key, old_value, new_value,
            change_type, tenant_id, environment, changed_by
        ) VALUES (
            OLD.id, OLD.config_key, OLD.config_value, NULL,
            'delete', OLD.tenant_id, OLD.environment, OLD.updated_by
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for change tracking
CREATE TRIGGER track_app_config_changes
    AFTER INSERT OR UPDATE OR DELETE ON core.app_configurations
    FOR EACH ROW EXECUTE FUNCTION track_configuration_changes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_app_configs_updated_at BEFORE UPDATE ON core.app_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_rules_updated_at BEFORE UPDATE ON core.business_rules_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_security_policies_updated_at BEFORE UPDATE ON core.security_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON core.feature_flags
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DEFAULT SYSTEM CONFIGURATIONS
-- ============================================================================

-- Insert default system configurations
INSERT INTO core.app_configurations (config_key, config_value, config_type, category, description, access_level, tags) VALUES
    ('system.platform_name', '"IFRS9 Multi-Tenant Platform"', 'string', 'system', 'Platform display name', 'public', '{"system", "branding"}'),
    ('system.platform_version', '"1.0.0"', 'string', 'system', 'Platform version', 'public', '{"system", "version"}'),
    ('banking.islamic_banking_enabled', 'true', 'boolean', 'banking', 'Enable Islamic banking features', 'admin', '{"banking", "islamic"}'),
    ('banking.dual_banking_supported', 'true', 'boolean', 'banking', 'Support both conventional and Islamic banking', 'admin', '{"banking", "dual"}'),
    ('security.session_timeout', '28800', 'number', 'security', 'Session timeout in seconds (8 hours)', 'admin', '{"security", "session"}'),
    ('security.max_login_attempts', '5', 'number', 'security', 'Maximum failed login attempts before lockout', 'admin', '{"security", "login"}'),
    ('ifrs9.calculation_frequency', '"monthly"', 'string', 'ifrs9', 'Frequency of IFRS 9 calculations', 'internal', '{"ifrs9", "calculation"}'),
    ('ifrs9.enable_stress_testing', 'true', 'boolean', 'ifrs9', 'Enable stress testing scenarios', 'internal', '{"ifrs9", "stress_testing"}'),
    ('system.maintenance_mode', 'false', 'boolean', 'system', 'Enable maintenance mode', 'system', '{"system", "maintenance"}'),
    ('system.max_file_upload_size', '52428800', 'number', 'system', 'Maximum file upload size in bytes (50MB)', 'admin', '{"system", "upload"}')
ON CONFLICT (config_key, tenant_id, environment) DO NOTHING;

-- Insert default security policies
INSERT INTO core.security_policies (policy_name, policy_type, policy_rules, enforcement_level, scope) VALUES
    ('Default Password Policy', 'password', '{"min_length": 8, "require_uppercase": true, "require_lowercase": true, "require_numbers": true, "require_special": false, "max_age_days": 90}', 'strict', 'global'),
    ('Default Session Policy', 'session', '{"timeout_seconds": 28800, "concurrent_sessions": 3, "idle_timeout": 3600}', 'strict', 'global'),
    ('Default MFA Policy', 'mfa', '{"required_for_admin": true, "required_for_high_risk": false, "allowed_methods": ["totp", "sms", "email"]}', 'moderate', 'global')
ON CONFLICT (policy_name, tenant_id) DO NOTHING;

-- Insert default feature flags
INSERT INTO core.feature_flags (flag_name, flag_key, description, flag_type, default_value, environments) VALUES
    ('Advanced Analytics', 'advanced_analytics', 'Enable advanced analytics features', 'boolean', 'true', '{"development", "staging", "production"}'),
    ('Islamic Banking', 'islamic_banking', 'Enable Islamic banking mode', 'boolean', 'true', '{"development", "staging", "production"}'),
    ('Stress Testing', 'stress_testing', 'Enable stress testing calculations', 'boolean', 'true', '{"development", "staging", "production"}'),
    ('Mobile API', 'mobile_api', 'Enable mobile API endpoints', 'boolean', 'false', '{"development", "staging"}'),
    ('Audit Trail', 'audit_trail', 'Enable comprehensive audit logging', 'boolean', 'true', '{"development", "staging", "production"}')
ON CONFLICT (flag_key, tenant_id) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE core.app_configurations IS 'Database-driven configuration settings with tenant and environment support';
COMMENT ON TABLE core.business_rules_config IS 'IFRS 9 and banking-specific business rules configuration';
COMMENT ON TABLE core.security_policies IS 'Security policies and compliance rules';
COMMENT ON TABLE core.feature_flags IS 'Feature flags for controlled feature rollouts';
COMMENT ON TABLE core.configuration_history IS 'Audit trail for configuration changes';

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$ 
BEGIN
    RAISE NOTICE '✅ Configuration system migration completed successfully';
    RAISE NOTICE '📊 Tables created: app_configurations, business_rules_config, security_policies, feature_flags, configuration_history';
    RAISE NOTICE '🔐 Row-level security enabled for tenant isolation';
    RAISE NOTICE '📝 Default configurations inserted';
END $$;