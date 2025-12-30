import { db } from '@/config'
import { menuItems, roleMenuAccess } from '@/db/schema/menu.schema'
import { eq, and, inArray, sql } from 'drizzle-orm'
import { Effect, pipe } from 'effect'
import { DatabaseError, NotFoundError } from '@/lib/errors'

export interface MenuHierarchyItem {
    id: string
    key: string
    title: string
    description: string | null
    icon: string | null
    url: string | null
    type: string
    level: number
    sortOrder: number
    children: MenuHierarchyItem[]
    requiredPermissions: string[] | null
    bankingTypes: string[] | null
}

/**
 * Get the hierarchical menu structure for a user based on their roles and tenant.
 */
export const getUserMenuHierarchy = (
    userId: string,
    tenantId: string,
    userRoles: string[]
): Effect.Effect<MenuHierarchyItem[], DatabaseError> =>
    Effect.tryPromise({
        try: async () => {
            // 1. Get IDs of menu items accessible to the user's roles
            // First find role IDs for the names provided
            const roleData = await db.query.roles.findMany({
                where: (roles, { and, inArray, eq }) =>
                    and(
                        inArray(roles.roleName, userRoles),
                        eq(roles.tenantId, tenantId)
                    ),
                columns: { id: true }
            });

            const roleIds = roleData.map(r => r.id);

            if (roleIds.length === 0) return [];

            // Get accessible menu item IDs
            const accessibleAccess = await db.query.roleMenuAccess.findMany({
                where: (rma, { inArray, eq }) =>
                    and(
                        inArray(rma.roleId, roleIds),
                        eq(rma.canView, true)
                    ),
                columns: { menuItemId: true }
            });

            const accessibleMenuItemIds = [...new Set(accessibleAccess.map(a => a.menuItemId))];

            if (accessibleMenuItemIds.length === 0) return [];

            // 2. Fetch all relevant menu items
            const items = await db.query.menuItems.findMany({
                where: (mi, { and, eq, inArray }) =>
                    and(
                        eq(mi.isActive, true),
                        eq(mi.isVisible, true),
                        inArray(mi.id, accessibleMenuItemIds)
                    ),
                orderBy: (mi, { asc }) => [asc(mi.sortOrder)]
            });

            // 3. Build hierarchy
            return buildTree(items);
        },
        catch: (error) => new DatabaseError({
            message: `Failed to fetch menu hierarchy: ${error}`,
            operation: 'query'
        })
    });

/**
 * Helper function to build a tree from a flat list of menu items
 */
function buildTree(items: any[]): MenuHierarchyItem[] {
    const itemMap = new Map<string, MenuHierarchyItem>();
    const rootItems: MenuHierarchyItem[] = [];

    // Initialize map
    items.forEach((item) => {
        itemMap.set(item.id, {
            id: item.id,
            key: item.menuKey,
            title: item.title,
            description: item.description,
            icon: item.icon,
            url: item.url,
            type: item.menuType,
            level: item.level,
            sortOrder: item.sortOrder || 0,
            children: [],
            requiredPermissions: item.requiredPermissions,
            bankingTypes: item.bankingTypes
        });
    });

    // Build tree
    items.forEach((item) => {
        const node = itemMap.get(item.id)!;
        if (item.parentId && itemMap.has(item.parentId)) {
            const parent = itemMap.get(item.parentId)!;
            parent.children.push(node);
        } else {
            rootItems.push(node);
        }
    });

    // Sort roots and their children
    const sortFn = (a: MenuHierarchyItem, b: MenuHierarchyItem) => a.sortOrder - b.sortOrder;

    const sortRecursively = (nodes: MenuHierarchyItem[]) => {
        nodes.sort(sortFn);
        nodes.forEach(node => {
            if (node.children.length > 0) {
                sortRecursively(node.children);
            }
        });
    };

    sortRecursively(rootItems);
    return rootItems;
}
