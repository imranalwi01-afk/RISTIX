// packages/frontend/src/hooks/useMenuState.ts
// ============================================================================
// 🔄 MENU STATE MANAGEMENT HOOK
// ============================================================================
// ✅ PURPOSE: Manage sidebar menu state (expansion, active items, navigation)
// ✅ FEATURES: Expansion tracking, active state management, auto-expansion
// =============================================================================

import { useState, useCallback, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { HierarchicalMenuItem } from '@/utils/menu-hierarchy';

export interface MenuState {
  // Expansion state
  expandedItems: Set<string>;
  collapsed: boolean;

  // Active state
  activeItems: Set<string>;
  selectedItem: string | null;
  activeParentIds: Set<string>;

  // Navigation state
  currentPath: string;
  previousPath: string | null;

  // Preferences
  autoExpandActiveParents: boolean;
  persistExpansionState: boolean;
}

export interface MenuStateActions {
  // Expansion controls
  toggleExpansion: (itemId: string) => void;
  expandItem: (itemId: string) => void;
  collapseItem: (itemId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;

  // Active state controls
  setActiveItem: (itemId: string | null) => void;
  setActiveItems: (itemIds: string[]) => void;

  // Navigation controls
  navigateToMenu: (item: HierarchicalMenuItem) => void;

  // Preference controls
  setCollapsed: (collapsed: boolean) => void;
  setAutoExpandActiveParents: (enabled: boolean) => void;

  // Utility functions
  isExpanded: (itemId: string) => boolean;
  isActive: (itemId: string) => boolean;
  resetState: () => void;
}

// Local storage keys for persistence
const STORAGE_KEYS = {
  EXPANDED_ITEMS: 'iaf_menu_expanded_items',
  COLLAPSED_STATE: 'iaf_menu_collapsed',
  AUTO_EXPAND_PREF: 'iaf_menu_auto_expand'
} as const;

export const useMenuState = (
  hierarchicalMenu: HierarchicalMenuItem[] = []
): MenuState & MenuStateActions => {
  const pathname = usePathname();
  const router = useRouter();

  // Initialize state with localStorage persistence
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.EXPANDED_ITEMS);
      if (stored) {
        const parsed = JSON.parse(stored);
        return new Set(parsed);
      }
    } catch (error) {
      console.warn('Failed to load expanded items from localStorage:', error);
    }

    return new Set();
  });

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.COLLAPSED_STATE);
      return stored === 'true';
    } catch (error) {
      console.warn('Failed to load collapsed state from localStorage:', error);
      return false;
    }
  });

  const [activeItems, setActiveItems] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [activeParentIds, setActiveParentIds] = useState<Set<string>>(new Set());
  const [previousPath, setPreviousPath] = useState<string | null>(null);
  const [autoExpandActiveParents, setAutoExpandActiveParents] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTO_EXPAND_PREF);
      return stored !== 'false'; // Default to true
    } catch (error) {
      console.warn('Failed to load auto-expand preference from localStorage:', error);
      return true;
    }
  });

  // Current path tracking
  const currentPath = pathname || '';

  // Get all parent IDs for a given item
  const getParentIds = useCallback((itemId: string, items: HierarchicalMenuItem[]): string[] => {
    const parentIds: string[] = [];

    const findParents = (menuItems: HierarchicalMenuItem[], targetId: string, currentParents: string[] = []): boolean => {
      for (const item of menuItems) {
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

    findParents(items, itemId);
    return parentIds;
  }, []);

  // Find menu item by path
  const findMenuItemByPath = useCallback((items: HierarchicalMenuItem[], path: string): HierarchicalMenuItem | null => {
    const findInChildren = (menuItems: HierarchicalMenuItem[]): HierarchicalMenuItem | null => {
      for (const item of menuItems) {
        if (item.url && (path === item.url || path.startsWith(item.url + '/'))) {
          return item;
        }

        if (item.children && item.children.length > 0) {
          const found = findInChildren(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInChildren(items);
  }, []);

  // Auto-expand parent menus when active item changes
  useEffect(() => {
    if (hierarchicalMenu.length === 0 || !autoExpandActiveParents || !currentPath) return;

    const currentMenuItem = findMenuItemByPath(hierarchicalMenu, currentPath);

    if (currentMenuItem) {
      const parentIds = getParentIds(currentMenuItem.id, hierarchicalMenu);

      // Set active states
      setActiveItems(new Set([currentMenuItem.id, ...parentIds]));
      setActiveParentIds(new Set(parentIds));
      setSelectedItem(currentMenuItem.id);

      // Auto-expand parent items
      if (parentIds.length > 0) {
        setExpandedItems(prev => {
          const newSet = new Set(prev);
          parentIds.forEach(parentId => newSet.add(parentId));
          return newSet;
        });
      }
    } else {
      // Clear active states if no matching menu item
      setActiveItems(new Set());
      setActiveParentIds(new Set());
      setSelectedItem(null);
    }
  }, [currentPath, hierarchicalMenu, autoExpandActiveParents, getParentIds, findMenuItemByPath]);

  // Track previous path
  useEffect(() => {
    setPreviousPath(currentPath);
  }, [currentPath]);

  // Persist expanded items to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.EXPANDED_ITEMS, JSON.stringify(Array.from(expandedItems)));
    } catch (error) {
      console.warn('Failed to save expanded items to localStorage:', error);
    }
  }, [expandedItems]);

  // Persist collapsed state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.COLLAPSED_STATE, JSON.stringify(collapsed));
    } catch (error) {
      console.warn('Failed to save collapsed state to localStorage:', error);
    }
  }, [collapsed]);

  // Persist auto-expand preference to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEYS.AUTO_EXPAND_PREF, JSON.stringify(autoExpandActiveParents));
    } catch (error) {
      console.warn('Failed to save auto-expand preference to localStorage:', error);
    }
  }, [autoExpandActiveParents]);

  // Expansion controls
  const toggleExpansion = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const expandItem = useCallback((itemId: string) => {
    setExpandedItems(prev => new Set([...prev, itemId]));
  }, []);

  const collapseItem = useCallback((itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    const allExpandableIds: string[] = [];

    const collectExpandableIds = (items: HierarchicalMenuItem[]) => {
      items.forEach(item => {
        if (item.children && item.children.length > 0) {
          allExpandableIds.push(item.id);
          collectExpandableIds(item.children);
        }
      });
    };

    collectExpandableIds(hierarchicalMenu);
    setExpandedItems(new Set(allExpandableIds));
  }, [hierarchicalMenu]);

  const collapseAll = useCallback(() => {
    setExpandedItems(new Set());
  }, []);

  // Active state controls
  const setActiveItem = useCallback((itemId: string | null) => {
    setSelectedItem(itemId);
    if (itemId) {
      setActiveItems(prev => new Set([...prev, itemId]));
    } else {
      setActiveItems(new Set());
    }
  }, []);

  const setActiveItemsFunc = useCallback((itemIds: string[]) => {
    setActiveItems(new Set(itemIds));
  }, []);

  // Navigation control
  const navigateToMenu = useCallback((item: HierarchicalMenuItem) => {
    if (item.url) {
      router.push(item.url);
    }
  }, [router]);

  // Preference controls
  const setCollapsedFunc = useCallback((newCollapsed: boolean) => {
    setCollapsed(newCollapsed);
  }, []);

  const setAutoExpandActiveParentsFunc = useCallback((enabled: boolean) => {
    setAutoExpandActiveParents(enabled);
  }, []);

  // Utility functions
  const isExpanded = useCallback((itemId: string) => {
    return expandedItems.has(itemId);
  }, [expandedItems]);

  const isActive = useCallback((itemId: string) => {
    return activeItems.has(itemId);
  }, [activeItems]);

  const resetState = useCallback(() => {
    setExpandedItems(new Set());
    setActiveItems(new Set());
    setSelectedItem(null);
    setActiveParentIds(new Set());
    setPreviousPath(null);
  }, []);

  return {
    // State
    expandedItems,
    collapsed,
    activeItems,
    selectedItem,
    activeParentIds,
    currentPath,
    previousPath,
    autoExpandActiveParents,
    persistExpansionState: true,

    // Actions
    toggleExpansion,
    expandItem,
    collapseItem,
    expandAll,
    collapseAll,
    setActiveItem,
    setActiveItems: setActiveItemsFunc,
    navigateToMenu,
    setCollapsed: setCollapsedFunc,
    setAutoExpandActiveParents: setAutoExpandActiveParentsFunc,
    isExpanded,
    isActive,
    resetState
  };
};