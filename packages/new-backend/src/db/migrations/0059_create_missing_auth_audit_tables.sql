-- ============================================================================
-- Create missing auth.* and audit.* tables
-- ============================================================================

-- Auth: sessions
CREATE TABLE IF NOT EXISTS auth.sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    tenant_id uuid,
    access_token_id uuid NOT NULL,
    refresh_token_id uuid NOT NULL,
    user_agent text,
    ip_address varchar(45),
    is_revoked boolean NOT NULL DEFAULT false,
    revoked_at timestamp,
    expires_at timestamp NOT NULL,
    last_activity_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sessions_user_idx ON auth.sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_access_token_idx ON auth.sessions (access_token_id);
CREATE INDEX IF NOT EXISTS sessions_refresh_token_idx ON auth.sessions (refresh_token_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON auth.sessions (expires_at);

-- Auth: email_verification_tokens
CREATE TABLE IF NOT EXISTS auth.email_verification_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    token varchar(255) NOT NULL,
    expires_at timestamp NOT NULL,
    verified_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_verification_user_idx ON auth.email_verification_tokens (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS email_verification_token_idx ON auth.email_verification_tokens (token);

-- Audit: data_access_logs
CREATE TABLE IF NOT EXISTS audit.data_access_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    user_id uuid,
    action varchar(50) NOT NULL,
    resource_type varchar(100) NOT NULL,
    resource_id varchar(100),
    ip_address varchar(45),
    user_agent text,
    metadata jsonb DEFAULT '{}',
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS data_access_logs_tenant_idx ON audit.data_access_logs (tenant_id);
CREATE INDEX IF NOT EXISTS data_access_logs_user_idx ON audit.data_access_logs (user_id);
CREATE INDEX IF NOT EXISTS data_access_logs_created_idx ON audit.data_access_logs (created_at);

-- Audit: calculation_audit_logs
CREATE TABLE IF NOT EXISTS audit.calculation_audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    calculation_type varchar(50) NOT NULL,
    status varchar(20) NOT NULL DEFAULT 'pending',
    parameters jsonb DEFAULT '{}',
    result jsonb,
    error_message text,
    duration_ms integer,
    started_at timestamp,
    completed_at timestamp,
    triggered_by uuid,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calc_audit_logs_tenant_idx ON audit.calculation_audit_logs (tenant_id);
CREATE INDEX IF NOT EXISTS calc_audit_logs_type_idx ON audit.calculation_audit_logs (calculation_type);
CREATE INDEX IF NOT EXISTS calc_audit_logs_status_idx ON audit.calculation_audit_logs (status);
