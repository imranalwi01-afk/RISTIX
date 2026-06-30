-- ============================================================================
-- Create platform_admin.email_templates table
-- Stores dynamic email templates for system notifications
-- ============================================================================

CREATE TABLE IF NOT EXISTS platform_admin.email_templates (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code varchar(100) NOT NULL,
    subject varchar(255) NOT NULL,
    body_html text NOT NULL,
    body_text text NOT NULL,
    available_variables jsonb NOT NULL DEFAULT '[]',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS platform_email_templates_code_idx ON platform_admin.email_templates (code);
