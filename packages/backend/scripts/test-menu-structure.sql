-- ========================================
-- Test IAF Menu Structure Query
-- ========================================
-- Test query to verify menu structure for admin@iaf.co.id

SET search_path TO core;

-- Get user role and menu access
WITH
-- Get the IAF super admin user and role
user_role AS (
    SELECT
        u.id as user_id,
        u.email,
        r.id as role_id,
        r.role_name
    FROM core.users u
    JOIN core.user_roles ur ON u.id = ur.user_id
    JOIN core.roles r ON ur.role_id = r.id
    WHERE u.email = 'admin@iaf.co.id' AND r.role_name = 'IAF_TENANT_SUPERADMIN'
    LIMIT 1
),

-- Get menu hierarchy with access
menu_hierarchy AS (
    SELECT
        mi.id,
        mi.menu_key,
        mi.menu_name,
        mi.menu_name_id,
        mi.route_path,
        mi.level,
        mi.display_order,
        mi.icon_name,
        mi.parent_id,
        mi.category_id,
        mc.category_name,
        CASE
            WHEN rma.menu_item_id IS NOT NULL AND rma.can_view = true THEN true
            ELSE false
        END as has_access
    FROM core.menu_items mi
    LEFT JOIN core.menu_categories mc ON mi.category_id = mc.id
    LEFT JOIN core.role_menu_access rma ON mi.id = rma.menu_item_id
    LEFT JOIN user_role ur ON rma.role_id = ur.role_id
    WHERE mi.is_active = true AND mi.is_visible = true
),

-- Build hierarchical structure
recursive_menu_tree AS (
    -- Base: Root level items
    SELECT
        mh.id,
        mh.menu_key,
        mh.menu_name,
        mh.menu_name_id,
        mh.route_path,
        mh.level,
        mh.display_order,
        mh.icon_name,
        mh.category_name,
        mh.has_access,
        ARRAY[mh.menu_name] as path,
        1 as depth
    FROM menu_hierarchy mh
    WHERE mh.parent_id IS NULL AND mh.has_access = true

    UNION ALL

    -- Recursive: Child items
    SELECT
        mh.id,
        mh.menu_key,
        mh.menu_name,
        mh.menu_name_id,
        mh.route_path,
        mh.level,
        mh.display_order,
        mh.icon_name,
        mh.category_name,
        mh.has_access,
        rmt.path || mh.menu_name,
        rmt.depth + 1
    FROM menu_hierarchy mh
    JOIN recursive_menu_tree rmt ON mh.parent_id = rmt.id
    WHERE mh.has_access = true
)

-- Final result
SELECT
    category_name,
    menu_key,
    menu_name,
    menu_name_id,
    route_path,
    level,
    display_order,
    icon_name,
    depth,
    path
FROM recursive_menu_tree
ORDER BY category_name, level, display_order;

-- Summary statistics
SELECT
    'Total Categories' as metric,
    COUNT(DISTINCT category_name)::text as value
FROM recursive_menu_tree

UNION ALL

SELECT
    'Total Menu Items' as metric,
    COUNT(*)::text as value
FROM recursive_menu_tree

UNION ALL

SELECT
    'Root Level Items' as metric,
    COUNT(CASE WHEN level = 1 THEN 1 END)::text as value
FROM recursive_menu_tree

UNION ALL

SELECT
    'Maximum Depth' as metric,
    MAX(depth)::text as value
FROM recursive_menu_tree;

