-- Create auth schema if not exists
CREATE SCHEMA IF NOT EXISTS "auth";

-- Create sessions table
CREATE TABLE IF NOT EXISTS "auth"."sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "core"."users"("id") ON DELETE CASCADE,
    "tenant_id" uuid REFERENCES "core"."tenants"("id"),
    "access_token_id" uuid NOT NULL,
    "refresh_token_id" uuid NOT NULL,
    "user_agent" text,
    "ip_address" varchar(45),
    "device_type" varchar(50),
    "device_name" varchar(100),
    "is_active" boolean DEFAULT true NOT NULL,
    "last_activity_at" timestamp DEFAULT now() NOT NULL,
    "expires_at" timestamp NOT NULL,
    "refresh_expires_at" timestamp NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "revoked_at" timestamp,
    "revoke_reason" varchar(100)
);

CREATE INDEX IF NOT EXISTS "sessions_user_idx" ON "auth"."sessions" ("user_id");
CREATE INDEX IF NOT EXISTS "sessions_tenant_idx" ON "auth"."sessions" ("tenant_id");
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_access_token_idx" ON "auth"."sessions" ("access_token_id");
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_refresh_token_idx" ON "auth"."sessions" ("refresh_token_id");
CREATE INDEX IF NOT EXISTS "sessions_active_idx" ON "auth"."sessions" ("is_active");
CREATE INDEX IF NOT EXISTS "sessions_expires_idx" ON "auth"."sessions" ("expires_at");

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS "auth"."password_reset_tokens" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "core"."users"("id") ON DELETE CASCADE,
    "token" varchar(255) NOT NULL,
    "expires_at" timestamp NOT NULL,
    "used_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "password_reset_user_idx" ON "auth"."password_reset_tokens" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_token_idx" ON "auth"."password_reset_tokens" ("token");
CREATE INDEX IF NOT EXISTS "password_reset_expires_idx" ON "auth"."password_reset_tokens" ("expires_at");

-- Create email_verification_tokens table
CREATE TABLE IF NOT EXISTS "auth"."email_verification_tokens" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL REFERENCES "core"."users"("id") ON DELETE CASCADE,
    "token" varchar(255) NOT NULL,
    "expires_at" timestamp NOT NULL,
    "verified_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "email_verification_user_idx" ON "auth"."email_verification_tokens" ("user_id");
CREATE UNIQUE INDEX IF NOT EXISTS "email_verification_token_idx" ON "auth"."email_verification_tokens" ("token");
