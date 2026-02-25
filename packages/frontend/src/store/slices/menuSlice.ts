// packages/frontend/src/store/slices/menuSlice.ts
// ============================================================================
// Menu State Management with Redux Toolkit
// ============================================================================
// Generated: 2025-01-12
// Purpose: Redux slice for database-driven menu state management
// Methodology: Core Platform MVP - Frontend Menu State
// Dependencies: Redux Toolkit, Menu API
// ============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { menuApi } from '../../services/api/menu.api';
import { getErrorMessage } from '@/utils/error-message';

export interface MenuItem {
  id: string;
  key: string;
  title: string;
  description?: string;
  icon?: string;
  url?: string;
  type: 'group' | 'item' | 'divider';
  children?: MenuItem[];
  permissions?: string[];
  external?: boolean;
  target?: '_self' | '_blank' | '_parent' | '_top';
  breadcrumb?: boolean;
  sort_order: number;
}

export interface MenuConfiguration {
  id: string;
  name: string;
  description: string;
  target_audience: string;
  banking_mode?: string;
  version: string;
}

export interface BreadcrumbItem {
  title: string;
  url?: string;
  active: boolean;
}

export interface MenuContext {
  user_type: string;
  banking_type?: string;
  tenant_name?: string;
}

export interface MenuState {
  // Menu data
  menuConfiguration: MenuConfiguration | null;
  menuItems: MenuItem[] | null;
  context: MenuContext | null;
  
  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  currentPath: string;
  
  // User customizations
  expandedItems: string[];
  hiddenItems: string[];
  bookmarks: MenuItem[];
  customOrder: Record<string, number>;
  
  // UI state
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Analytics
  accessCounts: Record<string, number>;
  lastAccessed: Record<string, number>;
}

const initialState: MenuState = {
  menuConfiguration: null,
  menuItems: null,
  context: null,
  breadcrumbs: [],
  currentPath: '',
  expandedItems: [],
  hiddenItems: [],
  bookmarks: [],
  customOrder: {},
  loading: false,
  error: null,
  lastFetched: null,
  accessCounts: {},
  lastAccessed: {}
};

// Async thunks for API calls

/**
 * Fetch user menu configuration and items
 */
export const fetchUserMenu = createAsyncThunk(
  'menu/fetchUserMenu',
  async (_, { rejectWithValue }) => {
    try {
      const response = await menuApi.getUserMenu();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch menu'));
    }
  }
);

/**
 * Fetch breadcrumbs for current path
 */
export const fetchBreadcrumbs = createAsyncThunk(
  'menu/fetchBreadcrumbs',
  async (path: string, { rejectWithValue }) => {
    try {
      const response = await menuApi.getBreadcrumbs(path);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(getErrorMessage(error, 'Failed to fetch breadcrumbs'));
    }
  }
);

/**
 * Log menu access for analytics
 */
export const logMenuAccess = createAsyncThunk(
  'menu/logMenuAccess',
  async (accessData: {
    menu_item_id: string;
    accessed_url?: string;
    response_time?: number;
  }, { rejectWithValue }) => {
    try {
      await menuApi.logMenuAccess(accessData);
      return accessData;
    } catch (error: any) {
      // Don't reject for analytics failures - just log
      console.warn('Menu access logging failed:', error);
      return accessData;
    }
  }
);

// Menu slice
const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // Menu expansion state
    toggleMenuExpansion: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const index = state.expandedItems.indexOf(itemId);
      
      if (index >= 0) {
        state.expandedItems.splice(index, 1);
      } else {
        state.expandedItems.push(itemId);
      }
    },

    setExpandedItems: (state, action: PayloadAction<string[]>) => {
      state.expandedItems = action.payload;
    },

    expandMenuPath: (state, action: PayloadAction<string[]>) => {
      // Expand all items in the path
      action.payload.forEach(itemId => {
        if (!state.expandedItems.includes(itemId)) {
          state.expandedItems.push(itemId);
        }
      });
    },

    // Menu item visibility
    hideMenuItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      if (!state.hiddenItems.includes(itemId)) {
        state.hiddenItems.push(itemId);
      }
    },

    showMenuItem: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      const index = state.hiddenItems.indexOf(itemId);
      if (index >= 0) {
        state.hiddenItems.splice(index, 1);
      }
    },

    setHiddenItems: (state, action: PayloadAction<string[]>) => {
      state.hiddenItems = action.payload;
    },

    // Bookmarks
    addBookmark: (state, action: PayloadAction<MenuItem>) => {
      const menuItem = action.payload;
      const exists = state.bookmarks.find(b => b.id === menuItem.id);
      if (!exists) {
        state.bookmarks.push(menuItem);
      }
    },

    removeBookmark: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.bookmarks = state.bookmarks.filter(b => b.id !== itemId);
    },

    // Custom ordering
    setCustomOrder: (state, action: PayloadAction<Record<string, number>>) => {
      state.customOrder = action.payload;
    },

    updateItemOrder: (state, action: PayloadAction<{ itemId: string; order: number }>) => {
      const { itemId, order } = action.payload;
      state.customOrder[itemId] = order;
    },

    // Current path tracking
    setCurrentPath: (state, action: PayloadAction<string>) => {
      state.currentPath = action.payload;
    },

    // Analytics
    incrementAccessCount: (state, action: PayloadAction<string>) => {
      const itemId = action.payload;
      state.accessCounts[itemId] = (state.accessCounts[itemId] || 0) + 1;
      state.lastAccessed[itemId] = Date.now();
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    // Reset menu state
    resetMenuState: (state) => {
      return { ...initialState };
    },

    // Load user customizations from localStorage
    loadUserCustomizations: (state) => {
      try {
        const stored = localStorage.getItem('menu_customizations');
        if (stored) {
          const customizations = JSON.parse(stored);
          state.expandedItems = customizations.expandedItems || [];
          state.hiddenItems = customizations.hiddenItems || [];
          state.bookmarks = customizations.bookmarks || [];
          state.customOrder = customizations.customOrder || {};
        }
      } catch (error) {
        console.warn('Failed to load menu customizations:', error);
      }
    },

    // Save user customizations to localStorage
    saveUserCustomizations: (state) => {
      try {
        const customizations = {
          expandedItems: state.expandedItems,
          hiddenItems: state.hiddenItems,
          bookmarks: state.bookmarks,
          customOrder: state.customOrder
        };
        localStorage.setItem('menu_customizations', JSON.stringify(customizations));
      } catch (error) {
        console.warn('Failed to save menu customizations:', error);
      }
    }
  },

  extraReducers: (builder) => {
    // Fetch user menu
    builder
      .addCase(fetchUserMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.menuConfiguration = action.payload.menu_configuration;
        state.menuItems = action.payload.menu_items;
        state.context = action.payload.context;
        state.lastFetched = Date.now();
        
        // Load user customizations after menu is loaded
        menuSlice.caseReducers.loadUserCustomizations(state);
      })
      .addCase(fetchUserMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch breadcrumbs
    builder
      .addCase(fetchBreadcrumbs.pending, (state) => {
        // Don't show loading for breadcrumbs - it's too fast
      })
      .addCase(fetchBreadcrumbs.fulfilled, (state, action) => {
        state.breadcrumbs = action.payload.breadcrumbs;
        state.currentPath = action.payload.current_path;
      })
      .addCase(fetchBreadcrumbs.rejected, (state, action) => {
        // Don't show error for breadcrumbs - use fallback
        console.warn('Breadcrumb fetch failed:', action.payload);
      });

    // Log menu access
    builder
      .addCase(logMenuAccess.fulfilled, (state, action) => {
        const { menu_item_id } = action.payload;
        state.accessCounts[menu_item_id] = (state.accessCounts[menu_item_id] || 0) + 1;
        state.lastAccessed[menu_item_id] = Date.now();
      });
  }
});

// Export actions
export const {
  toggleMenuExpansion,
  setExpandedItems,
  expandMenuPath,
  hideMenuItem,
  showMenuItem,
  setHiddenItems,
  addBookmark,
  removeBookmark,
  setCustomOrder,
  updateItemOrder,
  setCurrentPath,
  incrementAccessCount,
  clearError,
  resetMenuState,
  loadUserCustomizations,
  saveUserCustomizations
} = menuSlice.actions;

// Selectors
export const selectMenuState = (state: { menu: MenuState }) => state.menu;

export const selectMenuItems = (state: { menu: MenuState }) => {
  const { menuItems, hiddenItems, customOrder } = state.menu;
  
  if (!menuItems) return null;
  
  // Filter out hidden items and apply custom ordering
  const filterItems = (items: MenuItem[]): MenuItem[] => {
    return items
      .filter(item => !hiddenItems.includes(item.id))
      .map(item => ({
        ...item,
        children: item.children ? filterItems(item.children) : undefined
      }))
      .sort((a, b) => {
        const orderA = customOrder[a.id] !== undefined ? customOrder[a.id] : a.sort_order;
        const orderB = customOrder[b.id] !== undefined ? customOrder[b.id] : b.sort_order;
        return orderA - orderB;
      });
  };
  
  return filterItems(menuItems);
};

export const selectBreadcrumbs = (state: { menu: MenuState }) => state.menu.breadcrumbs;

export const selectMenuConfiguration = (state: { menu: MenuState }) => state.menu.menuConfiguration;

export const selectMenuContext = (state: { menu: MenuState }) => state.menu.context;

export const selectMenuBookmarks = (state: { menu: MenuState }) => state.menu.bookmarks;

export const selectMenuAnalytics = (state: { menu: MenuState }) => ({
  accessCounts: state.menu.accessCounts,
  lastAccessed: state.menu.lastAccessed,
  totalAccesses: Object.values(state.menu.accessCounts).reduce((sum, count) => sum + count, 0)
});

export const selectIsMenuLoading = (state: { menu: MenuState }) => state.menu.loading;

export const selectMenuError = (state: { menu: MenuState }) => state.menu.error;

export const selectExpandedItems = (state: { menu: MenuState }) => state.menu.expandedItems;

// Helper selectors
export const selectMenuItemById = (itemId: string) => (state: { menu: MenuState }) => {
  const findMenuItem = (items: MenuItem[], id: string): MenuItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findMenuItem(item.children, id);
        if (found) return found;
      }
    }
    return null;
  };
  
  return state.menu.menuItems ? findMenuItem(state.menu.menuItems, itemId) : null;
};

export const selectMostAccessedItems = (limit: number = 5) => (state: { menu: MenuState }) => {
  const { accessCounts, menuItems } = state.menu;
  
  if (!menuItems) return [];
  
  const allItems: MenuItem[] = [];
  const flattenItems = (items: MenuItem[]) => {
    items.forEach(item => {
      if (item.type === 'item') {
        allItems.push(item);
      }
      if (item.children) {
        flattenItems(item.children);
      }
    });
  };
  
  flattenItems(menuItems);
  
  return allItems
    .filter(item => accessCounts[item.id] > 0)
    .sort((a, b) => (accessCounts[b.id] || 0) - (accessCounts[a.id] || 0))
    .slice(0, limit);
};

export default menuSlice.reducer;
