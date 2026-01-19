import { getDatabase } from '@/config/database'
import { menuItems, roleMenuAccess } from '@/db/schema/menu.schema'
import { eq, and, inArray, sql } from 'drizzle-orm'
import { Effect, pipe } from 'effect'
import { DatabaseError, NotFoundError } from '@/lib/errors'

/**
 * @module MenuService
 * Provides services for managing application menus.
 * Handles menu hierarchy generation and role-based visibility.
 */

/**
 * Item structure for the hierarchical menu tree.
 */
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
 * Generate a hierarchical menu structure for a user.
 * 
 * The hierarchy is constructed by:
 * 1. Identifying roles assigned to the user within the tenant.
 * 2. Fetching menu items that these roles have permission to view.
 * 3. Building a tree structure based on parent-child relationships.
 * 
 * @param userId - The unique identifier of the user
 * @param tenantId - The unique identifier of the tenant
 * @param userRoles - Array of role names assigned to the user
 * @returns An Effect that succeeds with the hierarchical menu tree
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
            const db = getDatabase(tenantId)
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
 * Transform a flat list of menu items into a recursive tree structure.
 * 
 * @param items - Array of flat menu item objects from the database
 * @returns A hierarchical tree of MenuHierarchyItem objects
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
