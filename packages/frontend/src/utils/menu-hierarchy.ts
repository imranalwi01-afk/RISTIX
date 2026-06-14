// packages/frontend/src/utils/menu-hierarchy.ts
// ============================================================================
// 🔄 DATABASE-DRIVEN MENU HIERARCHY TRANSFORMATION UTILITIES
// ============================================================================
// ✅ PURPOSE: Transform flat database menu items into hierarchical tree structure
// ✅ SUPPORT: Parent-child relationships, role-based filtering, expansion state
// =============================================================================

import {
  buildPermissionContext,
  checkPermission,
  evaluatePermission,
} from './permission-evaluator';

// Database menu item interface (matches backend response)
interface DatabaseMenuItem {
  id: string;
  key: string;
  menu_key: string;
  title: string;
  description?: string;
  icon: string;
  url: string | null;
  type: 'group' | 'item';
  sort_order: number;
  parent_id: string | null;
  is_active: boolean;
  banking_types: string[];
  user_types: string[];
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  tenant_id: string;
  children?: DatabaseMenuItem[];
}

// Enhanced hierarchical menu item interface
export interface HierarchicalMenuItem {
  id: string;
  key: string;
  title: string;
  description?: string;
  icon: string;
  url: string | null;
  type: 'group' | 'item';
  sort_order: number;
  parent_id: string | null;
  children?: HierarchicalMenuItem[];
  level: number;
  expanded: boolean;
  active: boolean;
  visible: boolean;
  permissions: string[];
  requiredPermissions?: string[];
  banking_modes: string[];
  banking_types?: string[]; // Backend field name compatibility
  user_types: string[];
  tenant_types: string[];
  metadata?: Record<string, any>;
}

// Transform flat database menu to hierarchical structure
export const transformFlatToHierarchical = (
  items: any[]
): HierarchicalMenuItem[] => {


  // Check if data is already hierarchical
  const hasHierarchy = items.some(item => item.children && Array.isArray(item.children));

  if (hasHierarchy) {

    // Data is already hierarchical, ensure field compatibility recursively
    const ensureCompatibility = (item: any): HierarchicalMenuItem => {
      const result: HierarchicalMenuItem = {
        id: item.id,
        key: item.menu_key || item.key || item.id,
        title: item.title || item.label || 'Unknown',
        description: item.description,
        icon: item.icon || 'menu',
        url: item.url || item.href,
        type: item.type === 'group' ? 'group' : 'item',
        sort_order: item.sort_order || 999,
        parent_id: item.parent_id,
        children: [],
        level: 0,
        expanded: false,
        active: false,
        visible: true,
        permissions: item.user_types || item.roles || [],
        requiredPermissions: item.requiredPermissions,
        banking_modes: item.bankingTypes || item.banking_types || item.banking_modes || [],
        user_types: item.requiredPermissions || item.user_types || item.roles || [],
        tenant_types: [],
        metadata: item.metadata || {}
      };

      // Recursively ensure children compatibility
      if (item.children && Array.isArray(item.children)) {
        result.children = item.children.map(child => ensureCompatibility(child));
      }

      return result;
    };

    return items.map(item => ensureCompatibility(item));
  }


  // Data is flat, build hierarchy
  const itemMap = new Map<string, HierarchicalMenuItem>();
  const rootItems: HierarchicalMenuItem[] = [];

  // Phase 1: Create item map for all items
  items.forEach(item => {
    const hierarchicalItem: HierarchicalMenuItem = {
      id: item.id,
      key: item.menu_key || item.key || item.id, // Handle both menu_key (backend) and key (frontend)
      title: item.title || item.label || 'Unknown',
      description: item.description,
      icon: item.icon || 'menu',
      url: item.url || item.href,
      type: item.type === 'group' ? 'group' : 'item',
      sort_order: item.sort_order || 999,
      parent_id: item.parent_id,
      children: [],
      level: 0,
      expanded: false,
      active: false,
      visible: true,
      permissions: item.user_types || item.roles || [],
      requiredPermissions: item.requiredPermissions,
      banking_modes: item.bankingTypes || item.banking_types || item.banking_modes || [],
      user_types: item.requiredPermissions || item.user_types || item.roles || [],
      tenant_types: [],
      metadata: item.metadata || {}
    };

    itemMap.set(item.id, hierarchicalItem);
  });

  // Phase 2: Build hierarchy by linking children to parents
  items.forEach(item => {
    const hierarchicalItem = itemMap.get(item.id)!;

    if (item.parent_id === null || item.parent_id === '') {
      // Root level item
      rootItems.push(hierarchicalItem);
      hierarchicalItem.level = 0;
    } else {
      // Child item - find and link to parent
      const parent = itemMap.get(item.parent_id);
      if (parent) {
        parent.children!.push(hierarchicalItem);
        hierarchicalItem.level = parent.level + 1;

        // Inherit some properties from parent if not explicitly set
        const itemBankingModes = hierarchicalItem.banking_modes || hierarchicalItem.banking_types || [];
        const parentBankingModes = parent.banking_modes || parent.banking_types || [];
        if (itemBankingModes.length === 0) {
          hierarchicalItem.banking_modes = [...parentBankingModes];
          hierarchicalItem.banking_types = [...parentBankingModes];
        }
        if (hierarchicalItem.permissions.length === 0) {
          hierarchicalItem.permissions = [...parent.permissions];
        }
      } else {
        console.warn('⚠️ [MENU HIERARCHY] Parent not found for item:', {
          itemId: item.id,
          parentId: item.parent_id,
          itemKey: item.menu_key
        });
        // Treat as root item if parent not found
        rootItems.push(hierarchicalItem);
        hierarchicalItem.level = 0;
      }
    }
  });

  // Phase 3: Sort hierarchy by sort_order
  const sortHierarchy = (items: HierarchicalMenuItem[]): HierarchicalMenuItem[] => {
    return items
      .sort((a, b) => a.sort_order - b.sort_order)
      .map(item => ({
        ...item,
        children: item.children && item.children.length > 0
          ? sortHierarchy(item.children)
          : undefined
      }));
  };

  const sortedHierarchy = sortHierarchy(rootItems);



  return sortedHierarchy;
};

// Find menu item by URL path
export const findMenuItemByPath = (
  hierarchicalItems: HierarchicalMenuItem[],
  pathname: string
): HierarchicalMenuItem | null => {
  const findInChildren = (items: HierarchicalMenuItem[]): HierarchicalMenuItem | null => {
    for (const item of items) {
      // Check if this item matches the path
      if (item.url && (pathname === item.url || pathname.startsWith(item.url + '/'))) {
        return item;
      }

      // Search in children
      if (item.children && item.children.length > 0) {
        const found = findInChildren(item.children);
        if (found) return found;
      }
    }
    return null;
  };

  return findInChildren(hierarchicalItems);
};

// Get all parent IDs for a given menu item
export const getParentIds = (
  hierarchicalItems: HierarchicalMenuItem[],
  itemId: string
): string[] => {
  const parentIds: string[] = [];

  const findParents = (items: HierarchicalMenuItem[], targetId: string, currentParents: string[] = []): boolean => {
    for (const item of items) {
      if (item.id === targetId) {
        parentIds.push(...currentParents);
        return true;
      }

      if (item.children && item.children.length > 0) {
        if (findParents(item.children, targetId, [...currentParents, item.id])) {
          return true;
        }
      }
    }
    return false;
  };

  findParents(hierarchicalItems, itemId);
  return parentIds;
};

// Filter hierarchical menu by user role, roleCodes and banking mode
export const filterHierarchicalMenu = (
  hierarchicalItems: HierarchicalMenuItem[],
  bankingMode: 'conventional' | 'dual',
  userPermissions?: string[] // ✅ Add permissions parameter for granular filtering
): HierarchicalMenuItem[] => {
  const permissionContext = buildPermissionContext(userPermissions || []);
  const isSuperAdmin = permissionContext.isSuperAdmin;
  const debugPermissionFiltering = process.env.NODE_ENV === 'development';

  const filterItems = (items: HierarchicalMenuItem[]): HierarchicalMenuItem[] => {
    return items
      .filter(item => {
        // Defensive check: ensure item is not null or undefined
        if (!item || typeof item !== 'object') {
          return false;
        }

        // Global super admin bypass (after hard-hides)
        if (isSuperAdmin) {
          return true;
        }

        // Banking mode filter
        const bankingModes = item.banking_modes || item.banking_types || [];
        if (bankingModes.length > 0 && !bankingModes.includes(bankingMode)) {
          return false;
        }

        // Permission-based filter (explicit permission codes)
        const requiredPerms = item.requiredPermissions || [];
        if (requiredPerms.length > 0) {
          const hasPermissionMatch = requiredPerms.some((requiredPerm) =>
            checkPermission(requiredPerm, permissionContext)
          );

          if (hasPermissionMatch) {
            return true;
          }

          if (debugPermissionFiltering) {
            const evaluations = requiredPerms.map((requiredPerm) =>
              evaluatePermission(requiredPerm, permissionContext)
            );
          }
          return false;
        } else if (item.permissions && item.permissions.length > 0) {
          // Treat legacy item.permissions as permission codes (not roles)
          const hasPermissionMatch = item.permissions.some((perm) =>
            checkPermission(perm, permissionContext)
          );
          if (hasPermissionMatch) return true;

          if (debugPermissionFiltering) {
            const evaluations = item.permissions.map((perm) =>
              evaluatePermission(perm, permissionContext)
            );
          }
          return false;
        }

        return true;
      })
      .map(item => {
        const filteredChildren = item.children && item.children.length > 0
          ? filterItems(item.children)
          : undefined;

        if (item.type === 'group' && (!filteredChildren || filteredChildren.length === 0)) {
          return null;
        }

        return { ...item, children: filteredChildren };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  };

  const filteredItems = filterItems(hierarchicalItems);



  return filteredItems;
};

// Get expandable menu items (items with children)
export const getExpandableMenuItems = (
  hierarchicalItems: HierarchicalMenuItem[]
): string[] => {
  const expandableIds: string[] = [];

  const collectExpandableIds = (items: HierarchicalMenuItem[]) => {
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        expandableIds.push(item.id);
        collectExpandableIds(item.children);
      }
    });
  };

  collectExpandableIds(hierarchicalItems);
  return expandableIds;
};

// Validate menu hierarchy structure
export const validateMenuHierarchy = (
  hierarchicalItems: HierarchicalMenuItem[]
): {
  isValid: boolean;
  issues: string[];
  stats: {
    totalItems: number;
    maxDepth: number;
    groups: number;
    items: number;
  };
} => {
  const issues: string[] = [];
  let maxDepth = 0;
  let groups = 0;
  let items = 0;

  const validateItem = (item: HierarchicalMenuItem, depth: number = 0): void => {
    maxDepth = Math.max(maxDepth, depth);

    if (item.type === 'group') {
      groups++;
    } else {
      items++;
    }

    // Validate required fields - check multiple possible field names
    const hasKey = item.key || (item as any).menu_key;
    const hasTitle = item.title || (item as any).label;

    if (!hasKey || (typeof hasKey === 'string' && hasKey.trim() === '')) {
      issues.push(`Menu item missing key/menu_key: ${item.id}`);
    }

    if (!hasTitle || (typeof hasTitle === 'string' && hasTitle.trim() === '')) {
      issues.push(`Menu item missing title/label: ${item.id}`);
    }

    // Validate children
    if (item.children && item.children.length > 0) {
      item.children.forEach((child: any) => {
        const childKey = child.key || child.menu_key;
        if (childKey && child.parent_id !== item.id) {
          issues.push(`Child parent_id mismatch: ${childKey} → ${item.id}`);
        }
        validateItem(child, depth + 1);
      });
    }
  };

  hierarchicalItems.forEach(item => validateItem(item));

  return {
    isValid: issues.length === 0,
    issues,
    stats: {
      totalItems: hierarchicalItems.length,
      maxDepth,
      groups,
      items
    }
  };
};

// Generate breadcrumb for current path
export const generateBreadcrumb = (
  hierarchicalItems: HierarchicalMenuItem[],
  currentPath: string
): Array<{ key: string; title: string; url: string | null }> => {
  const breadcrumb: Array<{ key: string; title: string; url: string | null }> = [];
  const visited = new Set<string>();

  const findBreadcrumb = (items: HierarchicalMenuItem[], path: string, currentBreadcrumb: typeof breadcrumb = []): typeof breadcrumb | null => {
    for (const item of items) {
      // Prevent infinite loops
      if (visited.has(item.id)) continue;
      visited.add(item.id);

      const newBreadcrumb = [...currentBreadcrumb, {
        key: item.key,
        title: item.title,
        url: item.url
      }];

      // Check if this item matches the current path
      if (item.url && (path === item.url || path.startsWith(item.url + '/'))) {
        return newBreadcrumb;
      }

      // Search in children
      if (item.children && item.children.length > 0) {
        const found = findBreadcrumb(item.children, path, newBreadcrumb);
        if (found) return found;
      }
    }
    return null;
  };

  return findBreadcrumb(hierarchicalItems, currentPath) || [];
};
