-- =============================================================================
-- IAF: Create core.menu_permissions in Tenant DB
-- =============================================================================
-- Menu permissions previously lived in platform DB (menu.menu_permissions)
-- with a logical FK to core.roles (no actual constraint).
-- This migration creates the table in the tenant DB with proper FK.
-- Data migration from platform DB is handled by the application at startup.
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS core.menu_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    menu_item_id uuid NOT NULL,
    role_id uuid NOT NULL REFERENCES core.roles(id) ON DELETE CASCADE,
    permission_type varchar(20) DEFAULT 'view',
    is_allowed boolean DEFAULT true,
    conditions jsonb,
    created_at timestamp DEFAULT now(),
    created_by uuid
);

CREATE UNIQUE INDEX IF NOT EXISTS tenant_menu_perm_role_item_type_idx
    ON core.menu_permissions(role_id, menu_item_id, permission_type);

CREATE INDEX IF NOT EXISTS tenant_menu_perm_tenant_idx
    ON core.menu_permissions(tenant_id);

CREATE INDEX IF NOT EXISTS tenant_menu_perm_item_idx
    ON core.menu_permissions(menu_item_id);

COMMIT;
