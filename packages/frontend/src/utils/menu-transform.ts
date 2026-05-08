// packages/frontend/src/utils/menu-transform.ts
// ============================================================================
// 📊 ENHANCED MENU TRANSFORMATION UTILITIES
// ============================================================================
// ✅ PURPOSE: Transform flat database menu into proper hierarchical structure
// ✅ FIXED: Proper parent-child relationships following IFRS9 Neo patterns
// ✅ ENHANCED: Intelligent menu grouping and sorting
// ============================================================================

/**
 * Transforms flat menu payloads into the hierarchical structure rendered by the banking sidebar.
 * This is part of the generated docs because menu composition and access-driven rendering
 * are shared concerns across the frontend.
 */
import { MenuItem } from '@/services/menu.service';

// Extended interface to handle compatibility between different MenuItem definitions
export interface ExtendedMenuItem extends MenuItem {
  children?: ExtendedMenuItem[];
  key: string;
}

// Enhanced menu category definitions based on IFRS9 Neo analysis
export interface MenuCategory {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  sort_order: number;
  children: string[]; // Child menu keys
}

// IAF Menu Hierarchy following IFRS9 Neo patterns
const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: 'dashboard',
    key: 'dashboard',
    title: 'Dashboard',
    description: 'Main banking dashboard and overview',
    icon: 'dashboard',
    sort_order: 1,
    children: ['dashboard', 'overview']
  },
  {
    id: 'general-setup',
    key: 'general-setup',
    title: 'General Setup',
    description: 'Application and business configuration',
    icon: 'settings',
    sort_order: 2,
    children: ['application_setting', 'business_setting']
  },
  {
    id: 'parameter-setup',
    key: 'parameter-setup',
    title: 'Parameter Setup',
    description: 'System parameter configuration',
    icon: 'tune',
    sort_order: 3,
    children: ['product_parameter', 'journal_parameter']
  },
  {
    id: 'portfolio-management',
    key: 'portfolio-management',
    title: 'Portfolio Management',
    description: 'Portfolio and account management',
    icon: 'account_balance_wallet',
    sort_order: 4,
    children: [] // Will be populated dynamically
  },
  {
    id: 'collective-impairment',
    key: 'collective-impairment',
    title: 'Collective Impairment',
    description: 'Collective impairment calculations and configuration',
    icon: 'trending_down',
    sort_order: 5,
    children: [
      'segmentation_config',
      'rule_base_setting',
      'bucket_parameter',
      'pd_setup',
      'lgd_setup',
      'ead_setup',
      'ecl_config'
    ]
  },
  {
    id: 'individual-impairment',
    key: 'individual-impairment',
    title: 'Individual Impairment',
    description: 'Individual impairment assessment and management',
    icon: 'person',
    sort_order: 6,
    children: ['individual_assessment_v1', 'individual_assessment_v2', 'individual_reports', 'individual_assessment_override']
  },
  {
    id: 'ifrs9',
    key: 'ifrs9',
    title: 'IFRS9',
    description: 'IFRS9 calculations and reporting',
    icon: 'analytics',
    sort_order: 7,
    children: ['impairment_module', 'amortization_module', 'ecl_calculations', 'ifrs9_staging']
  },
  {
    id: 'ifrs9-reports',
    key: 'ifrs9-reports',
    title: 'IFRS9 Reports',
    description: 'Comprehensive IFRS9 reporting suite',
    icon: 'bar_chart',
    sort_order: 8,
    children: [
      'nominative_report',
      'lifetime_pd',
      'lifetime_lgd',
      'ead_model',
      'ecl_result',
      'ecl_movement',
      'gca_movement'
    ]
  },
  {
    id: 'advanced-analytics',
    key: 'advanced-analytics',
    title: 'Advanced Analytics',
    description: 'Advanced analytics and insights',
    icon: 'analytics',
    sort_order: 9,
    children: ['analytics']
  },
  {
    id: 'maintenance',
    key: 'maintenance',
    title: 'Maintenance',
    description: 'System administration and maintenance',
    icon: 'build',
    sort_order: 10,
    children: [
      'approval',
      'user_activity',
      'job_monitoring',
      'user_management',
      'role_management'
    ]
  },
  {
    id: 'tools',
    key: 'tools',
    title: 'Tools',
    description: 'Data tools and utilities',
    icon: 'build',
    sort_order: 11,
    children: ['manual_upload']
  }
];

// Menu key mapping to handle variations
const MENU_KEY_MAPPINGS: Record<string, string> = {
  // Dashboard mappings
  'overview': 'dashboard',

  // General Setup mappings
  'application-setting': 'application_setting',
  'business-setting': 'business_setting',

  // Parameter Setup mappings
  'product-parameter': 'product_parameter',
  'journal-parameter': 'journal_parameter',

  // Collective Impairment mappings
  'segmentation_config': 'segmentation_config',
  'segmentation-configuration': 'segmentation_config',
  'rule_base_setting': 'rule_base_setting',
  'rule-base-setting': 'rule_base_setting',
  'bucket_parameter': 'bucket_parameter',
  'bucket-parameter': 'bucket_parameter',
  'pd_setup': 'pd_setup',
  'pd-setup-management': 'pd_setup',
  'lgd_setup': 'lgd_setup',
  'lgd-setup-management': 'lgd_setup',
  'ead_setup': 'ead_setup',
  'ead-setup-management': 'ead_setup',
  'ecl_config': 'ecl_config',
  'ecl-configuration': 'ecl_config',

  // Individual Impairment mappings
  'individual_assessment_v1': 'individual_assessment_v1',
  'individual-assessment-v1': 'individual_assessment_v1',
  'assessment-workspace': 'individual_assessment_v1',
  'assessment-workspace-v1': 'individual_assessment_v1',
  'individual_assessment_v2': 'individual_assessment_v2',
  'individual-assessment-v2': 'individual_assessment_v2',
  'assessment-workspace-v2': 'individual_assessment_v2',
  'individual_reports': 'individual_reports',
  'individual-reports': 'individual_reports',
  'individual_assessment_override': 'individual_assessment_override',
  'individual-assessment-override': 'individual_assessment_override',
  'assessment-override': 'individual_assessment_override',

  // IFRS9 mappings
  'impairment_module': 'impairment_module',
  'impairment-module': 'impairment_module',
  'amortization_module': 'amortization_module',
  'amortization-module': 'amortization_module',
  'ecl-calculations': 'ecl_calculations',
  'ecl_calculations': 'ecl_calculations',
  'ifrs9-staging': 'ifrs9_staging',

  // Reports mappings
  'nominative_report': 'nominative_report',
  'nominative-report': 'nominative_report',
  'lifetime_pd': 'lifetime_pd',
  'lifetime-pd': 'lifetime_pd',
  'lifetime_lgd': 'lifetime_lgd',
  'lifetime-lgd': 'lifetime_lgd',
  'ead_model': 'ead_model',
  'ead-model': 'ead_model',
  'ecl_result': 'ecl_result',
  'ecl-result': 'ecl_result',
  'ecl_movement': 'ecl_movement',
  'ecl-movement': 'ecl_movement',
  'gca_movement': 'gca_movement',
  'gca-movement': 'gca_movement',

  // Maintenance mappings
  'user-management': 'user_management',
  'user_management': 'user_management',
  'role_management': 'role_management',
  'role-management': 'role_management',
  'user_activity': 'user_activity',
  'user-activity': 'user_activity',
  'job_monitoring': 'job_monitoring',
  'job-monitoring': 'job_monitoring',

  // Tools mappings
  'manual_upload': 'manual_upload',
  'manual-upload': 'manual_upload',

  // Analytics mappings
  'analytics': 'analytics',
  'bar_chart': 'analytics'
};

/**
 * Transform flat database menu items into hierarchical structure
 * @param flatItems Array of flat menu items from database
 * @returns Hierarchical menu structure
 */
export function transformFlatToHierarchical(flatItems: MenuItem[]): ExtendedMenuItem[] {
  console.log('🔄 Transforming flat menu to hierarchical structure:', {
    inputItems: flatItems.length,
    sampleItems: flatItems.slice(0, 3).map(item => ({ id: item.id, key: item.code, parent_id: item.parent_id }))
  });

  // Step 1: Create a map of all items for quick lookup
  const itemMap = new Map<string, ExtendedMenuItem>();
  flatItems.forEach(item => {
    // Normalize the key using mappings
    const normalizedKey = MENU_KEY_MAPPINGS[item.code] || item.code;
    const normalizedItem: ExtendedMenuItem = {
      ...item,
      key: normalizedKey,
      children: []
    };
    itemMap.set(item.id, normalizedItem);
  });

  // Step 2: Create or update parent categories from MENU_CATEGORIES
  const parentCategories = new Map<string, ExtendedMenuItem>();

  MENU_CATEGORIES.forEach(category => {
    const parentItem: ExtendedMenuItem = {
      id: category.id,
      key: category.key,
      label: category.title,
      description: category.description,
      icon: category.icon,
      sort_order: category.sort_order,
      parent_id: undefined,
      is_active: true,
      children: [],
      level: 1,
      path: category.key,
      href: undefined, // Parent items typically don't have direct links
      code: category.key,
      banking_modes: undefined,
      roles: undefined,
      status: 'active',
      is_new: false,
      requires_setup: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    parentCategories.set(category.id, parentItem);
    itemMap.set(category.id, parentItem);
  });

  // Step 3: Assign children to parents
  flatItems.forEach(item => {
    const normalizedKey = MENU_KEY_MAPPINGS[item.code] || item.code;
    const menuItem = itemMap.get(item.id);

    if (!menuItem) return;

    // Find the appropriate parent category
    let parentCategory: MenuCategory | undefined;

    for (const category of MENU_CATEGORIES) {
      if (category.children.includes(normalizedKey)) {
        parentCategory = category;
        break;
      }
    }

    if (parentCategory) {
      const parentItem = parentCategories.get(parentCategory.id);
      if (parentItem) {
        parentItem.children!.push(menuItem);
        menuItem.parent_id = parentCategory.id;
        menuItem.level = 2;
      }
    } else if (item.parent_id) {
      // Handle existing parent-child relationships
      const parentItem = itemMap.get(item.parent_id);
      if (parentItem) {
        parentItem.children!.push(menuItem);
        menuItem.level = (parentItem.level || 1) + 1;
      }
    }
  });

  // Step 4: Build final hierarchical structure
  const hierarchicalMenu: ExtendedMenuItem[] = [];

  // Add parent categories first (sorted by sort_order)
  MENU_CATEGORIES
    .filter(category => {
      const categoryItem = parentCategories.get(category.id);
      return categoryItem && categoryItem.children && categoryItem.children.length > 0;
    })
    .sort((a, b) => a.sort_order - b.sort_order)
    .forEach(category => {
      const categoryItem = parentCategories.get(category.id);
      if (categoryItem) {
        // Sort children by sort_order
        if (categoryItem.children) {
          categoryItem.children.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
        }
        hierarchicalMenu.push(categoryItem);
      }
    });

  // Add any remaining orphan items (items without parents)
  flatItems.forEach(item => {
    const menuItem = itemMap.get(item.id);
    if (menuItem && !menuItem.parent_id && !parentCategories.has(item.id)) {
      // Check if it's not already in the menu
      const exists = hierarchicalMenu.some(existing => existing.id === menuItem.id);
      if (!exists) {
        hierarchicalMenu.push(menuItem);
      }
    }
  });

  // Step 5: Sort the final menu
  hierarchicalMenu.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  console.log('✅ Menu transformation completed:', {
    outputCategories: hierarchicalMenu.length,
    totalItems: countTotalMenuItems(hierarchicalMenu),
    structure: hierarchicalMenu.map(item => ({
      id: item.id,
      label: item.label,
      children: item.children?.length || 0
    }))
  });

  return hierarchicalMenu;
}

/**
 * Count total menu items in hierarchical structure
 */
function countTotalMenuItems(menuItems: ExtendedMenuItem[]): number {
  let count = 0;

  function countRecursive(items: ExtendedMenuItem[]) {
    items.forEach(item => {
      count++;
      if (item.children && item.children.length > 0) {
        countRecursive(item.children);
      }
    });
  }

  countRecursive(menuItems);
  return count;
}

/**
 * Get menu breadcrumb for navigation
 */
export function getMenuBreadcrumb(menuTree: ExtendedMenuItem[], currentPath: string): ExtendedMenuItem[] {
  const breadcrumb: ExtendedMenuItem[] = [];
  const pathSegments = currentPath.replace('/banking/', '').split('/').filter(Boolean);

  // Find matching menu items for each path segment
  let currentTree = menuTree;

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    const foundItem = currentTree.find(item =>
      item.href && item.href.includes(segment)
    );

    if (foundItem) {
      breadcrumb.push(foundItem);
      // Move to children for next segment
      currentTree = foundItem.children || [];
    } else {
      // Try to find by key or partial match
      const partialMatch = currentTree.find(item =>
        item.key.toLowerCase().includes(segment.toLowerCase()) ||
        item.label.toLowerCase().includes(segment.toLowerCase())
      );

      if (partialMatch) {
        breadcrumb.push(partialMatch);
        currentTree = partialMatch.children || [];
      }
    }
  }

  return breadcrumb;
}

/**
 * Find menu item by path in hierarchical tree
 */
export function findMenuItemByPath(menuTree: ExtendedMenuItem[], path: string): ExtendedMenuItem | null {
  for (const item of menuTree) {
    if (item.href === path || (item.href && path.startsWith(item.href + '/'))) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuItemByPath(item.children, path);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Find menu item by key in hierarchical tree
 */
export function findMenuItemByKey(menuTree: ExtendedMenuItem[], key: string): ExtendedMenuItem | null {
  for (const item of menuTree) {
    if (item.key === key) {
      return item;
    }

    if (item.children && item.children.length > 0) {
      const found = findMenuItemByKey(item.children, key);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Get all expandable parent menu items
 */
export function getExpandableMenuItems(menuTree: ExtendedMenuItem[]): string[] {
  const expandableItems: string[] = [];

  function findExpandable(items: ExtendedMenuItem[]) {
    items.forEach(item => {
      if (item.children && item.children.length > 0) {
        expandableItems.push(item.id);
        findExpandable(item.children);
      }
    });
  }

  findExpandable(menuTree);
  return expandableItems;
}

/**
 * Validate menu hierarchy structure
 */
export function validateMenuHierarchy(menuTree: ExtendedMenuItem[]): {
  isValid: boolean;
  issues: string[];
  statistics: {
    totalItems: number;
    maxDepth: number;
    orphanedItems: number;
    emptyParents: number;
  };
} {
  const issues: string[] = [];
  const statistics = {
    totalItems: 0,
    maxDepth: 0,
    orphanedItems: 0,
    emptyParents: 0
  };

  function validateRecursive(items: ExtendedMenuItem[], depth: number = 1): void {
    items.forEach(item => {
      statistics.totalItems++;
      statistics.maxDepth = Math.max(statistics.maxDepth, depth);

      // Check for items that should have children but don't
      if (!item.children || item.children.length === 0) {
        if (!item.href) {
          // Parent item without children and no href
          statistics.emptyParents++;
          issues.push(`Parent item "${item.label}" has no children and no href`);
        }
      }

      // Check for orphaned items
      if (item.parent_id && !item.href) {
        // Item has parent_id but no href - should be a child
        // This is actually normal, so we don't count it as an issue
      }

      if (item.children && item.children.length > 0) {
        validateRecursive(item.children, depth + 1);
      }
    });
  }

  validateRecursive(menuTree);

  return {
    isValid: issues.length === 0,
    issues,
    statistics
  };
}
