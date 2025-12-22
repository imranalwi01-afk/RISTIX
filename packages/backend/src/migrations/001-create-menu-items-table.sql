-- Migration: Create menu_items table for database-driven menu system
-- Date: 2025-01-16
-- Purpose: Support hierarchical menu structure with parent-child relationships

-- Create menu_items table
CREATE TABLE IF NOT EXISTS platform_admin.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_config_id UUID NOT NULL REFERENCES platform_admin.menu_configurations(id) ON DELETE CASCADE,

    -- Basic menu item properties
    key VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    url VARCHAR(500),
    component VARCHAR(200),
    type VARCHAR(20) NOT NULL CHECK (type IN ('group', 'item', 'divider')),

    -- Hierarchy and ordering
    parent_id UUID REFERENCES platform_admin.menu_items(id) ON DELETE CASCADE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    path TEXT,

    -- Status and visibility
    is_active BOOLEAN NOT NULL DEFAULT true,
    breadcrumb BOOLEAN NOT NULL DEFAULT true,
    external BOOLEAN NOT NULL DEFAULT false,
    target VARCHAR(20) NOT NULL DEFAULT '_self' CHECK (target IN ('_self', '_blank', '_parent', '_top')),

    -- Access control (JSON arrays)
    permissions JSONB DEFAULT '[]'::jsonb,
    user_types JSONB DEFAULT '[]'::jsonb,
    banking_types JSONB DEFAULT '[]'::jsonb,
    tenant_types JSONB DEFAULT '[]'::jsonb,
    visibility_rules JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,

    -- Audit fields
    created_by VARCHAR(100) NOT NULL DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_by VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE,

    -- Constraints
    CONSTRAINT menu_items_menu_config_key UNIQUE (menu_config_id, key),
    CONSTRAINT menu_items_parent_check CHECK (
        parent_id IS NULL OR
        (SELECT type FROM platform_admin.menu_items WHERE id = parent_id) = 'group'
    )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_config_id ON platform_admin.menu_items(menu_config_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_parent_id ON platform_admin.menu_items(parent_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_key ON platform_admin.menu_items(key);
CREATE INDEX IF NOT EXISTS idx_menu_items_type ON platform_admin.menu_items(type);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort_order ON platform_admin.menu_items(menu_config_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_active ON platform_admin.menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_banking_types ON platform_admin.menu_items USING GIN(banking_types);
CREATE INDEX IF NOT EXISTS idx_menu_items_user_types ON platform_admin.menu_items USING GIN(user_types);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION platform_admin.update_menu_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER menu_items_updated_at
    BEFORE UPDATE ON platform_admin.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION platform_admin.update_menu_items_updated_at();

-- Create trigger for automatic path and level management
CREATE OR REPLACE FUNCTION platform_admin.update_menu_item_path()
RETURNS TRIGGER AS $$
BEGIN
    -- Update level based on parent
    IF NEW.parent_id IS NULL THEN
        NEW.level = 0;
        NEW.path = '/' || NEW.key;
    ELSE
        -- Get parent level and path
        SELECT level + 1, COALESCE(path, '/') || COALESCE(key, '') || '/' || NEW.key
        INTO NEW.level, NEW.path
        FROM platform_admin.menu_items
        WHERE id = NEW.parent_id;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER menu_item_path_update
    BEFORE INSERT OR UPDATE ON platform_admin.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION platform_admin.update_menu_item_path();

-- Function to update all children paths when parent changes
CREATE OR REPLACE FUNCTION platform_admin.update_children_menu_paths()
RETURNS TRIGGER AS $$
BEGIN
    -- If parent_id or key changed, update all children
    IF OLD.parent_id IS DISTINCT FROM NEW.parent_id OR OLD.key IS DISTINCT FROM NEW.key THEN
        UPDATE platform_admin.menu_items
        SET path = NEW.path || SUBSTRING(path FROM LENGTH(OLD.path) + 1),
            level = NEW.level + (level - OLD.level)
        WHERE path LIKE OLD.path || '%' AND id != NEW.id;
    END IF;

    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER menu_item_children_path_update
    AFTER UPDATE ON platform_admin.menu_items
    FOR EACH ROW
    EXECUTE FUNCTION platform_admin.update_children_menu_paths();

-- Insert comment
COMMENT ON TABLE platform_admin.menu_items IS 'Hierarchical menu items for database-driven menu system with role-based access control';
COMMENT ON COLUMN platform_admin.menu_items.id IS 'Primary key - UUID for uniqueness';
COMMENT ON COLUMN platform_admin.menu_items.menu_config_id IS 'Foreign key to menu_configurations table';
COMMENT ON COLUMN platform_admin.menu_items.key IS 'Unique menu item key for programmatic access';
COMMENT ON COLUMN platform_admin.menu_items.title IS 'Display title for menu item';
COMMENT ON COLUMN platform_admin.menu_items.parent_id IS 'Parent menu item for hierarchical structure';
COMMENT ON COLUMN platform_admin.menu_items.sort_order IS 'Order within same level and parent';
COMMENT ON COLUMN platform_admin.menu_items.level IS 'Depth level in menu hierarchy (0 = root)';
COMMENT ON COLUMN platform_admin.menu_items.path IS 'Full path for breadcrumb navigation';
COMMENT ON COLUMN platform_admin.menu_items.permissions IS 'JSON array of required permissions';
COMMENT ON COLUMN platform_admin.menu_items.user_types IS 'JSON array of allowed user types';
COMMENT ON COLUMN platform_admin.menu_items.banking_types IS 'JSON array of allowed banking modes';
COMMENT ON COLUMN platform_admin.menu_items.tenant_types IS 'JSON array of allowed tenant types';
COMMENT ON COLUMN platform_admin.menu_items.visibility_rules IS 'JSON object for custom visibility rules';
COMMENT ON COLUMN platform_admin.menu_items.metadata IS 'JSON object for additional menu item data';