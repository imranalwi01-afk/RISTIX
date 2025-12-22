-- packages/backend/src/migrations/002-create-user-activity-tracking-schema.sql
-- ============================================================================
-- COMPREHENSIVE USER ACTIVITY TRACKING SYSTEM - IAF IFRS9 PLATFORM
-- ============================================================================
-- Purpose: Complete audit trail and activity monitoring system
-- Author: Generated for IAF IFRS9 Step 01 Implementation
-- Date: 2025-01-11

-- =============================================================================
-- 1. USER ACTIVITY LOGS TABLE
-- =============================================================================

-- Main user activity logs table
CREATE TABLE IF NOT EXISTS audit.user_activity_logs (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),

    -- User and session context
    user_id UUID REFERENCES core.users(id),
    session_id VARCHAR(255) NOT NULL,
    correlation_id UUID NOT NULL DEFAULT gen_random_uuid(),

    -- Activity details
    activity_type VARCHAR(100) NOT NULL,
    action_performed VARCHAR(255) NOT NULL,
    activity_description TEXT,

    -- Entity information
    target_entity VARCHAR(100),
    target_id VARCHAR(255),
    target_name VARCHAR(500),

    -- Request and navigation context
    page_url VARCHAR(1000),
    referrer_url VARCHAR(1000),
    request_path VARCHAR(500),
    request_method VARCHAR(10),
    api_endpoint VARCHAR(500),

    -- Result and performance
    action_result VARCHAR(20) NOT NULL CHECK (action_result IN ('SUCCESS', 'FAILURE', 'PARTIAL')),
    error_message TEXT,
    error_code VARCHAR(100),
    response_time_ms INTEGER,
    server_processing_time_ms INTEGER,
    client_render_time_ms INTEGER,

    -- Location and device information
    ip_address INET,
    country_code VARCHAR(2),
    country_name VARCHAR(100),
    city VARCHAR(100),
    user_agent TEXT,
    device_type VARCHAR(50),
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),

    -- Business context
    module_accessed VARCHAR(100),
    business_process VARCHAR(100),
    banking_type VARCHAR(20) CHECK (banking_type IN ('conventional', 'syariah', 'dual')),

    -- Risk and compliance
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    compliance_relevant BOOLEAN DEFAULT FALSE,
    regulatory_impact BOOLEAN DEFAULT FALSE,
    gdpr_basis VARCHAR(100),
    data_classification VARCHAR(50),

    -- Session metrics
    session_duration_ms INTEGER,
    page_dwell_time_ms INTEGER,
    user_engagement_score INTEGER CHECK (user_engagement_score >= 0 AND user_engagement_score <= 100),

    -- Technical metrics
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    database_query_time_ms INTEGER,
    cache_hit_ratio DECIMAL(5,2),

    -- Additional metadata
    metadata JSONB,
    tags TEXT[],

    -- Timestamps
    activity_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. SESSION TRACKING TABLE
-- =============================================================================

-- Session tracking and analytics
CREATE TABLE IF NOT EXISTS audit.session_tracking (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),

    -- Session information
    session_id VARCHAR(255) NOT NULL UNIQUE,
    user_id UUID REFERENCES core.users(id),

    -- Session lifecycle
    session_start TIMESTAMP WITH TIME ZONE NOT NULL,
    session_end TIMESTAMP WITH TIME ZONE,
    session_duration_ms INTEGER GENERATED ALWAYS AS (
        CASE
            WHEN session_end IS NOT NULL THEN
                EXTRACT(EPOCH FROM (session_end - session_start)) * 1000
            ELSE NULL
        END
    ) STORED,

    -- Session status
    session_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
        CHECK (session_status IN ('ACTIVE', 'INACTIVE', 'EXPIRED', 'TERMINATED', 'TIMEOUT')),

    -- Access patterns
    first_page_visited VARCHAR(1000),
    last_page_visited VARCHAR(1000),
    total_page_views INTEGER DEFAULT 0,
    total_actions INTEGER DEFAULT 0,
    total_errors INTEGER DEFAULT 0,

    -- Geographic information
    ip_address INET,
    country_code VARCHAR(2),
    country_name VARCHAR(100),
    city VARCHAR(100),

    -- Device and browser
    user_agent TEXT,
    device_type VARCHAR(50),
    browser_name VARCHAR(100),
    browser_version VARCHAR(50),
    os_name VARCHAR(100),
    os_version VARCHAR(50),

    -- Performance metrics
    avg_response_time_ms DECIMAL(10,2),
    max_response_time_ms INTEGER,
    min_response_time_ms INTEGER,
    total_data_transferred_mb DECIMAL(10,2),

    -- Business context
    banking_type VARCHAR(20) CHECK (banking_type IN ('conventional', 'syariah', 'dual')),
    modules_accessed TEXT[],

    -- Security metrics
    failed_login_attempts INTEGER DEFAULT 0,
    security_events INTEGER DEFAULT 0,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),

    -- Session quality metrics
    user_engagement_score INTEGER CHECK (user_engagement_score >= 0 AND user_engagement_score <= 100),
    bounce_rate DECIMAL(5,2) CHECK (bounce_rate >= 0 AND bounce_rate <= 100),

    -- Additional data
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. PERFORMANCE METRICS TABLE
-- =============================================================================

-- System and user performance tracking
CREATE TABLE IF NOT EXISTS audit.performance_metrics (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),

    -- Context
    user_id UUID REFERENCES core.users(id),
    session_id VARCHAR(255),
    activity_log_id UUID REFERENCES audit.user_activity_logs(id),

    -- Performance timing
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,

    -- Timing measurements
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_ms INTEGER NOT NULL,

    -- Resource usage
    memory_usage_mb DECIMAL(10,2),
    cpu_usage_percent DECIMAL(5,2),
    disk_usage_mb DECIMAL(10,2),
    network_io_mb DECIMAL(10,2),

    -- Database performance
    database_query_time_ms INTEGER,
    database_queries_count INTEGER DEFAULT 0,
    database_rows_affected INTEGER DEFAULT 0,

    -- API performance
    api_endpoint VARCHAR(500),
    http_method VARCHAR(10),
    http_status_code INTEGER,
    response_size_bytes INTEGER,

    -- Frontend performance
    page_load_time_ms INTEGER,
    dom_content_loaded_time_ms INTEGER,
    first_contentful_paint_time_ms INTEGER,
    largest_contentful_paint_time_ms INTEGER,

    -- Business context
    module_accessed VARCHAR(100),
    business_process VARCHAR(100),
    banking_type VARCHAR(20) CHECK (banking_type IN ('conventional', 'syariah', 'dual')),

    -- Performance classification
    performance_category VARCHAR(20) CHECK (performance_category IN ('EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', 'CRITICAL')),
    sla_compliance BOOLEAN DEFAULT TRUE,

    -- Additional data
    metadata JSONB,
    tags TEXT[],

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. SECURITY EVENTS TABLE
-- =============================================================================

-- Security incident tracking
CREATE TABLE IF NOT EXISTS audit.security_events (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),

    -- Event information
    event_type VARCHAR(50) NOT NULL,
    event_severity VARCHAR(20) NOT NULL CHECK (event_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    event_status VARCHAR(20) NOT NULL DEFAULT 'OPEN' CHECK (event_status IN ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED')),

    -- User and session context
    user_id UUID REFERENCES core.users(id),
    session_id VARCHAR(255),

    -- Event details
    event_description TEXT NOT NULL,
    event_category VARCHAR(50),

    -- Location and technical details
    ip_address INET,
    user_agent TEXT,
    request_path VARCHAR(500),
    request_method VARCHAR(10),

    -- Business context
    module_accessed VARCHAR(100),
    banking_type VARCHAR(20) CHECK (banking_type IN ('conventional', 'syariah', 'dual')),

    -- Investigation tracking
    assigned_to UUID REFERENCES core.users(id),
    investigation_notes TEXT,
    resolution_details TEXT,

    -- Risk assessment
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    business_impact VARCHAR(20) CHECK (business_impact IN ('NONE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),

    -- Compliance
    compliance_relevant BOOLEAN DEFAULT FALSE,
    regulatory_impact BOOLEAN DEFAULT FALSE,

    -- Additional data
    metadata JSONB,

    -- Timestamps
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 5. AUDIT LOG CONFIGURATION TABLE
-- =============================================================================

-- Configuration for audit logging
CREATE TABLE IF NOT EXISTS audit.audit_configuration (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),

    -- Configuration key and value
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value JSONB NOT NULL,

    -- Configuration metadata
    config_type VARCHAR(50) NOT NULL,
    description TEXT,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, config_key)
);

-- =============================================================================
-- 6. DATA RETENTION POLICIES TABLE
-- =============================================================================

-- Data retention and archival policies
CREATE TABLE IF NOT EXISTS audit.data_retention_policies (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),

    -- Policy details
    table_name VARCHAR(100) NOT NULL,
    policy_name VARCHAR(100) NOT NULL,

    -- Retention periods
    retention_days INTEGER NOT NULL,
    archive_after_days INTEGER,
    delete_after_days INTEGER,

    -- Policy criteria
    retention_criteria JSONB,

    -- Status
    is_active BOOLEAN DEFAULT TRUE,

    -- Additional data
    description TEXT,
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, table_name, policy_name)
);

-- =============================================================================
-- 7. COMPLIANCE REPORTS TABLE
-- =============================================================================

-- Generated compliance reports storage
CREATE TABLE IF NOT EXISTS audit.compliance_reports (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES core.tenants(id),

    -- Report details
    report_type VARCHAR(50) NOT NULL,
    report_name VARCHAR(200) NOT NULL,
    report_description TEXT,

    -- Report period
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,

    -- Report content
    report_data JSONB NOT NULL,
    report_summary JSONB,

    -- Compliance metrics
    compliance_score DECIMAL(5,2) CHECK (compliance_score >= 0 AND compliance_score <= 100),
    total_events INTEGER,
    high_risk_events INTEGER,
    compliance_violations INTEGER,

    -- Report status
    report_status VARCHAR(20) NOT NULL DEFAULT 'GENERATED'
        CHECK (report_status IN ('GENERATING', 'GENERATED', 'FAILED', 'ARCHIVED')),

    -- Generation details
    generated_by UUID REFERENCES core.users(id),
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- File storage
    file_path VARCHAR(500),
    file_format VARCHAR(20) DEFAULT 'JSON',
    file_size_bytes INTEGER,

    -- Additional data
    metadata JSONB,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- User activity logs indexes
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_tenant_id ON audit.user_activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON audit.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_session_id ON audit.user_activity_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_timestamp ON audit.user_activity_logs(activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON audit.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_action_result ON audit.user_activity_logs(action_result);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_risk_level ON audit.user_activity_logs(risk_level);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_compliance_relevant ON audit.user_activity_logs(compliance_relevant);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_banking_type ON audit.user_activity_logs(banking_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_ip_address ON audit.user_activity_logs(ip_address);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_target_entity ON audit.user_activity_logs(target_entity);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_module_accessed ON audit.user_activity_logs(module_accessed);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_tenant_activity_time ON audit.user_activity_logs(tenant_id, activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_activity_time ON audit.user_activity_logs(user_id, activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_session_activity_time ON audit.user_activity_logs(session_id, activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_tenant_risk_time ON audit.user_activity_logs(tenant_id, risk_level, activity_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_compliance_time ON audit.user_activity_logs(compliance_relevant, activity_timestamp DESC) WHERE compliance_relevant = TRUE;

-- Session tracking indexes
CREATE INDEX IF NOT EXISTS idx_session_tracking_tenant_id ON audit.session_tracking(tenant_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_user_id ON audit.session_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_session_id ON audit.session_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_session_tracking_session_start ON audit.session_tracking(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_session_tracking_session_status ON audit.session_tracking(session_status);
CREATE INDEX IF NOT EXISTS idx_session_tracking_ip_address ON audit.session_tracking(ip_address);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_tenant_id ON audit.performance_metrics(tenant_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON audit.performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_activity_log_id ON audit.performance_metrics(activity_log_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON audit.performance_metrics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_metric_type ON audit.performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_duration_ms ON audit.performance_metrics(duration_ms DESC);

-- Security events indexes
CREATE INDEX IF NOT EXISTS idx_security_events_tenant_id ON audit.security_events(tenant_id);
CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON audit.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_timestamp ON audit.security_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON audit.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_event_severity ON audit.security_events(event_severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_status ON audit.security_events(event_status);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON audit.security_events(ip_address);

-- Compliance reports indexes
CREATE INDEX IF NOT EXISTS idx_compliance_reports_tenant_id ON audit.compliance_reports(tenant_id);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_report_type ON audit.compliance_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_period ON audit.compliance_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_compliance_reports_generated_at ON audit.compliance_reports(generated_at DESC);

-- =============================================================================
-- PARTITIONING FOR LARGE DATASETS (Optional for production)
-- =============================================================================

-- Create partitions for user_activity_logs by month (PostgreSQL 10+)
-- Uncomment for production environments with high volume

/*
-- Partition user_activity_logs by month
CREATE TABLE audit.user_activity_logs_y2025m01 PARTITION OF audit.user_activity_logs
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE audit.user_activity_logs_y2025m02 PARTITION OF audit.user_activity_logs
FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

-- Similar partitions can be created for other months
*/

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION audit.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_activity_logs_updated_at
    BEFORE UPDATE ON audit.user_activity_logs
    FOR EACH ROW EXECUTE FUNCTION audit.update_updated_at_column();

CREATE TRIGGER update_session_tracking_updated_at
    BEFORE UPDATE ON audit.session_tracking
    FOR EACH ROW EXECUTE FUNCTION audit.update_updated_at_column();

CREATE TRIGGER update_security_events_updated_at
    BEFORE UPDATE ON audit.security_events
    FOR EACH ROW EXECUTE FUNCTION audit.update_updated_at_column();

CREATE TRIGGER update_data_retention_policies_updated_at
    BEFORE UPDATE ON audit.data_retention_policies
    FOR EACH ROW EXECUTE FUNCTION audit.update_updated_at_column();

CREATE TRIGGER update_compliance_reports_updated_at
    BEFORE UPDATE ON audit.compliance_reports
    FOR EACH ROW EXECUTE FUNCTION audit.update_updated_at_column();

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for user activity summary
CREATE OR REPLACE VIEW audit.user_activity_summary AS
SELECT
    tenant_id,
    user_id,
    DATE(activity_timestamp) as activity_date,
    COUNT(*) as total_activities,
    COUNT(CASE WHEN action_result = 'SUCCESS' THEN 1 END) as successful_activities,
    COUNT(CASE WHEN action_result = 'FAILURE' THEN 1 END) as failed_activities,
    COUNT(CASE WHEN risk_level IN ('HIGH', 'CRITICAL') THEN 1 END) as high_risk_activities,
    COUNT(CASE WHEN compliance_relevant = TRUE THEN 1 END) as compliance_activities,
    AVG(response_time_ms) as avg_response_time_ms,
    MAX(response_time_ms) as max_response_time_ms,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT module_accessed) as modules_accessed
FROM audit.user_activity_logs
GROUP BY tenant_id, user_id, DATE(activity_timestamp);

-- View for session analytics
CREATE OR REPLACE VIEW audit.session_analytics AS
SELECT
    st.tenant_id,
    st.user_id,
    st.session_id,
    st.session_start,
    st.session_end,
    st.session_duration_ms,
    st.total_page_views,
    st.total_actions,
    st.total_errors,
    st.avg_response_time_ms,
    st.user_engagement_score,
    COALESCE(ual.activity_count, 0) as detailed_activity_count
FROM audit.session_tracking st
LEFT JOIN (
    SELECT
        session_id,
        COUNT(*) as activity_count
    FROM audit.user_activity_logs
    GROUP BY session_id
) ual ON st.session_id = ual.session_id;

-- =============================================================================
-- INITIAL CONFIGURATION DATA
-- =============================================================================

-- Insert default audit configuration
INSERT INTO audit.audit_configuration (tenant_id, config_key, config_value, config_type, description) VALUES
-- Default retention policies
('00000000-0000-0000-0000-000000000000', 'user_activity_retention_days', '2555', 'retention', 'User activity logs retention period (7 years)'),
('00000000-0000-0000-0000-000000000000', 'session_tracking_retention_days', '1095', 'retention', 'Session tracking retention period (3 years)'),
('00000000-0000-0000-0000-000000000000', 'performance_metrics_retention_days', '730', 'retention', 'Performance metrics retention period (2 years)'),
('00000000-0000-0000-0000-000000000000', 'security_events_retention_days', '3650', 'retention', 'Security events retention period (10 years)'),

-- Feature flags
('00000000-0000-0000-0000-000000000000', 'enable_real_time_monitoring', 'true', 'feature', 'Enable real-time activity monitoring'),
('00000000-0000-0000-0000-000000000000', 'enable_geolocation_tracking', 'true', 'feature', 'Enable IP geolocation tracking'),
('00000000-0000-0000-0000-000000000000', 'enable_performance_monitoring', 'true', 'feature', 'Enable performance monitoring'),
('00000000-0000-0000-0000-000000000000', 'enable_compliance_monitoring', 'true', 'feature', 'Enable compliance monitoring'),

-- Thresholds
('00000000-0000-0000-0000-000000000000', 'high_response_time_threshold_ms', '2000', 'threshold', 'High response time threshold in milliseconds'),
('00000000-0000-0000-0000-000000000000', 'critical_response_time_threshold_ms', '5000', 'threshold', 'Critical response time threshold in milliseconds'),
('00000000-0000-0000-0000-000000000000', 'session_timeout_minutes', '30', 'threshold', 'Session timeout threshold in minutes'),
('00000000-0000-0000-0000-000000000000', 'max_failed_login_attempts', '5', 'threshold', 'Maximum failed login attempts before lockout')

ON CONFLICT (tenant_id, config_key) DO NOTHING;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE audit.user_activity_logs IS 'Comprehensive user activity tracking with performance metrics and compliance monitoring';
COMMENT ON TABLE audit.session_tracking IS 'Session lifecycle tracking and analytics';
COMMENT ON TABLE audit.performance_metrics IS 'System and user performance metrics tracking';
COMMENT ON TABLE audit.security_events IS 'Security incident tracking and investigation';
COMMENT ON TABLE audit.audit_configuration IS 'Audit system configuration and feature flags';
COMMENT ON TABLE audit.data_retention_policies IS 'Data retention and archival policies configuration';
COMMENT ON TABLE audit.compliance_reports IS 'Generated compliance reports storage';

-- Schema completion
ALTER SCHEMA audit OWNER TO postgres;
GRANT ALL ON SCHEMA audit TO postgres;
GRANT USAGE ON SCHEMA audit TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO postgres;