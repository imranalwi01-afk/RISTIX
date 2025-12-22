-- ============================================================================
-- PSDD ARTIFACT DOCUMENTATION
-- ============================================================================
-- File Path: database/schemas/menu/001-menu-system-schema.sql
-- Generated: $(date '+%Y-%m-%d %H:%M:%S')
-- Phase: D2H7P2 - Database-Driven Menu & Infrastructure (Menu Schema)
-- Methodology: Phased Shell-Driven Development (PSDD)
-- Dependencies: PostgreSQL 13+, UUID extension
-- Purpose: Database schema for dynamic menu system with role-based access
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create menu schema
CREATE SCHEMA IF NOT EXISTS menu;

-- Set search path
SET search_path TO menu, public;

-- ============================================================================
-- MENU SYSTEM TABLES
-- ============================================================================

-- Menu categories table
CREATE TABLE menu.menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Menu items table (hierarchical structure)
CREATE TABLE menu.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    category_id UUID REFERENCES menu.menu_categories(id),
    parent_id UUID REFERENCES menu.menu_items(id),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    path VARCHAR(255),
    icon VARCHAR(50),
    component VARCHAR(100),
    external_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_visible BOOLEAN DEFAULT true,
    is_external BOOLEAN DEFAULT false,
    requires_auth BOOLEAN DEFAULT true,
    banking_type VARCHAR(20) CHECK (banking_type IN ('conventional', 'syariah', 'both')) DEFAULT 'both',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID
);

-- Menu permissions table
CREATE TABLE menu.menu_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    menu_item_id UUID NOT NULL REFERENCES menu.menu_items(id) ON DELETE CASCADE,
    role_id UUID NOT NULL,
    permission_type VARCHAR(20) CHECK (permission_type IN ('view', 'edit', 'delete', 'admin')) DEFAULT 'view',
    is_allowed BOOLEAN DEFAULT true,
    conditions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    UNIQUE(tenant_id, menu_item_id, role_id, permission_type)
);

-- Menu user preferences table
CREATE TABLE menu.menu_user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    menu_item_id UUID NOT NULL REFERENCES menu.menu_items(id) ON DELETE CASCADE,
    is_favorite BOOLEAN DEFAULT false,
    is_pinned BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    custom_name VARCHAR(100),
    custom_icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_id, menu_item_id)
);

-- Menu configuration table
CREATE TABLE menu.menu_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    configuration JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    environment VARCHAR(20) DEFAULT 'production',
    version VARCHAR(20) DEFAULT '1.0.0',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    updated_by UUID,
    UNIQUE(tenant_id, name, environment)
);

-- Menu analytics table
CREATE TABLE menu.menu_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    menu_item_id UUID NOT NULL REFERENCES menu.menu_items(id),
    session_id UUID,
    action_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duration_ms INTEGER,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT
);

-- ============================================================================
-- INFRASTRUCTURE MONITORING TABLES
-- ============================================================================

-- System health checks table
CREATE TABLE menu.system_health_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    check_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('healthy', 'warning', 'critical', 'unknown')) DEFAULT 'unknown',
    message TEXT,
    response_time_ms INTEGER,
    metadata JSONB,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE menu.performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(20),
    tags JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Load balancer status table
CREATE TABLE menu.load_balancer_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    instance_id VARCHAR(100) NOT NULL,
    instance_name VARCHAR(100),
    status VARCHAR(20) CHECK (status IN ('active', 'inactive', 'maintenance', 'failed')) DEFAULT 'active',
    health_score DECIMAL(5,2) DEFAULT 100.00,
    current_connections INTEGER DEFAULT 0,
    max_connections INTEGER DEFAULT 1000,
    cpu_usage DECIMAL(5,2),
    memory_usage DECIMAL(5,2),
    last_check TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- API gateway logs table
CREATE TABLE menu.api_gateway_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL,
    request_id UUID NOT NULL,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    request_size BIGINT,
    response_size BIGINT,
    user_id UUID,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Menu items indexes
CREATE INDEX idx_menu_items_tenant_id ON menu.menu_items(tenant_id);
CREATE INDEX idx_menu_items_category_id ON menu.menu_items(category_id);
CREATE INDEX idx_menu_items_parent_id ON menu.menu_items(parent_id);
CREATE INDEX idx_menu_items_active ON menu.menu_items(is_active) WHERE is_active = true;
CREATE INDEX idx_menu_items_visible ON menu.menu_items(is_visible) WHERE is_visible = true;
CREATE INDEX idx_menu_items_banking_type ON menu.menu_items(banking_type);
CREATE INDEX idx_menu_items_path ON menu.menu_items(path);

-- Menu permissions indexes
CREATE INDEX idx_menu_permissions_tenant_role ON menu.menu_permissions(tenant_id, role_id);
CREATE INDEX idx_menu_permissions_menu_item ON menu.menu_permissions(menu_item_id);
CREATE INDEX idx_menu_permissions_allowed ON menu.menu_permissions(is_allowed) WHERE is_allowed = true;

-- Menu user preferences indexes
CREATE INDEX idx_menu_user_prefs_tenant_user ON menu.menu_user_preferences(tenant_id, user_id);
CREATE INDEX idx_menu_user_prefs_favorites ON menu.menu_user_preferences(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_menu_user_prefs_pinned ON menu.menu_user_preferences(is_pinned) WHERE is_pinned = true;

-- Menu analytics indexes
CREATE INDEX idx_menu_analytics_tenant_id ON menu.menu_analytics(tenant_id);
CREATE INDEX idx_menu_analytics_user_id ON menu.menu_analytics(user_id);
CREATE INDEX idx_menu_analytics_menu_item ON menu.menu_analytics(menu_item_id);
CREATE INDEX idx_menu_analytics_timestamp ON menu.menu_analytics(timestamp);
CREATE INDEX idx_menu_analytics_action_type ON menu.menu_analytics(action_type);

-- Infrastructure monitoring indexes
CREATE INDEX idx_health_checks_tenant_service ON menu.system_health_checks(tenant_id, service_name);
CREATE INDEX idx_health_checks_status ON menu.system_health_checks(status);
CREATE INDEX idx_health_checks_timestamp ON menu.system_health_checks(checked_at);

CREATE INDEX idx_performance_metrics_tenant ON menu.performance_metrics(tenant_id);
CREATE INDEX idx_performance_metrics_name ON menu.performance_metrics(metric_name);
CREATE INDEX idx_performance_metrics_timestamp ON menu.performance_metrics(recorded_at);

CREATE INDEX idx_load_balancer_tenant ON menu.load_balancer_status(tenant_id);
CREATE INDEX idx_load_balancer_status ON menu.load_balancer_status(status);
CREATE INDEX idx_load_balancer_instance ON menu.load_balancer_status(instance_id);

CREATE INDEX idx_gateway_logs_tenant ON menu.api_gateway_logs(tenant_id);
CREATE INDEX idx_gateway_logs_timestamp ON menu.api_gateway_logs(timestamp);
CREATE INDEX idx_gateway_logs_status ON menu.api_gateway_logs(status_code);
CREATE INDEX idx_gateway_logs_path ON menu.api_gateway_logs(path);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE menu.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.menu_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.load_balancer_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu.api_gateway_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for tenant isolation
CREATE POLICY menu_categories_tenant_isolation ON menu.menu_categories
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_items_tenant_isolation ON menu.menu_items
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_permissions_tenant_isolation ON menu.menu_permissions
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_user_preferences_tenant_isolation ON menu.menu_user_preferences
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_configurations_tenant_isolation ON menu.menu_configurations
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY menu_analytics_tenant_isolation ON menu.menu_analytics
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY system_health_checks_tenant_isolation ON menu.system_health_checks
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY performance_metrics_tenant_isolation ON menu.performance_metrics
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY load_balancer_status_tenant_isolation ON menu.load_balancer_status
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

CREATE POLICY api_gateway_logs_tenant_isolation ON menu.api_gateway_logs
    USING (tenant_id = current_setting('app.current_tenant_id')::UUID);

-- ============================================================================
-- STORED PROCEDURES AND FUNCTIONS
-- ============================================================================

-- Function to get user menu hierarchy
CREATE OR REPLACE FUNCTION menu.get_user_menu_hierarchy(
    p_tenant_id UUID,
    p_user_id UUID,
    p_banking_type VARCHAR DEFAULT 'both'
) RETURNS TABLE (
    id UUID,
    name VARCHAR,
    path VARCHAR,
    icon VARCHAR,
    level INTEGER,
    parent_id UUID,
    sort_order INTEGER,
    is_favorite BOOLEAN,
    is_pinned BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE menu_tree AS (
        -- Base case: root menu items
        SELECT 
            mi.id,
            mi.name,
            mi.path,
            mi.icon,
            mi.level,
            mi.parent_id,
            mi.sort_order,
            COALESCE(mup.is_favorite, false) as is_favorite,
            COALESCE(mup.is_pinned, false) as is_pinned
        FROM menu.menu_items mi
        LEFT JOIN menu.menu_user_preferences mup ON mi.id = mup.menu_item_id AND mup.user_id = p_user_id
        WHERE mi.tenant_id = p_tenant_id
            AND mi.parent_id IS NULL
            AND mi.is_active = true
            AND mi.is_visible = true
            AND (mi.banking_type = p_banking_type OR mi.banking_type = 'both')
            AND EXISTS (
                SELECT 1 FROM menu.menu_permissions mp
                WHERE mp.menu_item_id = mi.id
                    AND mp.tenant_id = p_tenant_id
                    AND mp.is_allowed = true
            )
        
        UNION ALL
        
        -- Recursive case: child menu items
        SELECT 
            mi.id,
            mi.name,
            mi.path,
            mi.icon,
            mi.level,
            mi.parent_id,
            mi.sort_order,
            COALESCE(mup.is_favorite, false) as is_favorite,
            COALESCE(mup.is_pinned, false) as is_pinned
        FROM menu.menu_items mi
        LEFT JOIN menu.menu_user_preferences mup ON mi.id = mup.menu_item_id AND mup.user_id = p_user_id
        INNER JOIN menu_tree mt ON mi.parent_id = mt.id
        WHERE mi.tenant_id = p_tenant_id
            AND mi.is_active = true
            AND mi.is_visible = true
            AND (mi.banking_type = p_banking_type OR mi.banking_type = 'both')
            AND EXISTS (
                SELECT 1 FROM menu.menu_permissions mp
                WHERE mp.menu_item_id = mi.id
                    AND mp.tenant_id = p_tenant_id
                    AND mp.is_allowed = true
            )
    )
    SELECT * FROM menu_tree ORDER BY level, sort_order, name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log menu analytics
CREATE OR REPLACE FUNCTION menu.log_menu_action(
    p_tenant_id UUID,
    p_user_id UUID,
    p_menu_item_id UUID,
    p_action_type VARCHAR,
    p_session_id UUID DEFAULT NULL,
    p_duration_ms INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO menu.menu_analytics (
        tenant_id, user_id, menu_item_id, action_type,
        session_id, duration_ms, metadata, ip_address, user_agent
    ) VALUES (
        p_tenant_id, p_user_id, p_menu_item_id, p_action_type,
        p_session_id, p_duration_ms, p_metadata, p_ip_address, p_user_agent
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update system health status
CREATE OR REPLACE FUNCTION menu.update_health_status(
    p_tenant_id UUID,
    p_service_name VARCHAR,
    p_check_type VARCHAR,
    p_status VARCHAR,
    p_message TEXT DEFAULT NULL,
    p_response_time_ms INTEGER DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_check_id UUID;
BEGIN
    INSERT INTO menu.system_health_checks (
        tenant_id, service_name, check_type, status,
        message, response_time_ms, metadata
    ) VALUES (
        p_tenant_id, p_service_name, p_check_type, p_status,
        p_message, p_response_time_ms, p_metadata
    ) RETURNING id INTO v_check_id;
    
    RETURN v_check_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION menu.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_menu_categories_updated_at
    BEFORE UPDATE ON menu.menu_categories
    FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();

CREATE TRIGGER trigger_menu_items_updated_at
    BEFORE UPDATE ON menu.menu_items
    FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();

CREATE TRIGGER trigger_menu_user_preferences_updated_at
    BEFORE UPDATE ON menu.menu_user_preferences
    FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();

CREATE TRIGGER trigger_menu_configurations_updated_at
    BEFORE UPDATE ON menu.menu_configurations
    FOR EACH ROW EXECUTE FUNCTION menu.update_updated_at_column();

-- ============================================================================
-- GRANTS AND PERMISSIONS
-- ============================================================================

-- Grant permissions to application user
GRANT USAGE ON SCHEMA menu TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA menu TO app_user;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA menu TO app_user;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA menu TO app_user;

-- Grant read-only access to reporting user
GRANT USAGE ON SCHEMA menu TO reporting_user;
GRANT SELECT ON ALL TABLES IN SCHEMA menu TO reporting_user;

COMMENT ON SCHEMA menu IS 'Database-driven menu system with role-based access and infrastructure monitoring';
