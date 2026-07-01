-- ============================================================================
-- Create auth.password_reset_tokens table
-- Stores password reset tokens for the forgot-password flow
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES core.users(id) ON DELETE CASCADE,
    token varchar(255) NOT NULL,
    expires_at timestamp NOT NULL,
    used_at timestamp,
    created_at timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS password_reset_user_idx ON auth.password_reset_tokens (user_id);
CREATE UNIQUE INDEX IF NOT EXISTS password_reset_token_idx ON auth.password_reset_tokens (token);
CREATE INDEX IF NOT EXISTS password_reset_expires_idx ON auth.password_reset_tokens (expires_at);
