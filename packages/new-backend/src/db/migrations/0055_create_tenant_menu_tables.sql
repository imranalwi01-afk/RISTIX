-- ============================================================================
-- Create core.menu_categories + core.menu_items in Tenant DB
-- These tables are synced from Platform DB's menu.menu_categories /
-- menu.menu_items at server startup so tenant navigation works even if
-- the Platform DB is down.
-- ============================================================================

CREATE TABLE IF NOT EXISTS core.menu_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    name varchar(100) NOT NULL,
    description text,
    icon varchar(50),
    color varchar(20),
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid,
    updated_by uuid
);

CREATE INDEX IF NOT EXISTS tenant_menu_categories_tenant_idx ON core.menu_categories (tenant_id);
CREATE UNIQUE INDEX IF NOT EXISTS tenant_menu_categories_tenant_name_idx ON core.menu_categories (tenant_id, name);

CREATE TABLE IF NOT EXISTS core.menu_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id uuid NOT NULL,
    category_id uuid,
    parent_id uuid,
    name varchar(100) NOT NULL,
    description text,
    path varchar(255),
    icon varchar(50),
    component varchar(100),
    external_url varchar(500),
    sort_order integer DEFAULT 0,
    level integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_visible boolean DEFAULT true,
    is_external boolean DEFAULT false,
    requires_auth boolean DEFAULT true,
    banking_type varchar(20) DEFAULT 'both',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    created_by uuid,
    updated_by uuid
);

CREATE INDEX IF NOT EXISTS tenant_menu_items_tenant_idx ON core.menu_items (tenant_id);
CREATE INDEX IF NOT EXISTS tenant_menu_items_category_idx ON core.menu_items (category_id);
CREATE INDEX IF NOT EXISTS tenant_menu_items_parent_idx ON core.menu_items (parent_id);

-- Apply foreign key after both tables exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'tenant_menu_items_parent_id_fkey'
          AND table_schema = 'core'
          AND table_name = 'menu_items'
    ) THEN
        ALTER TABLE core.menu_items
        ADD CONSTRAINT tenant_menu_items_parent_id_fkey
        FOREIGN KEY (parent_id) REFERENCES core.menu_items(id);
    END IF;
END $$;
