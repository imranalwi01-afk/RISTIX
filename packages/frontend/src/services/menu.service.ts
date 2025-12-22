// packages/frontend/src/services/menu.service.ts
// Frontend menu service for IAF project

import { api } from './api';
import { menuConfig, hasMenuAccess } from '@/config/menu-config';

export interface MenuItem {
  id: string;
  code: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  level: number;
  path: string;
  is_active: boolean;
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  roles?: string[];
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled';
  is_new?: boolean;
  requires_setup?: boolean;
  target?: '_self' | '_blank';
  external_url?: string;
  children?: MenuItem[];
  created_at?: string;
  updated_at?: string;
}

export interface MenuTreeResponse {
  success: boolean;
  data: MenuItem[];
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    tenantId?: string;
  };
}

export interface MenuItemResponse {
  success: boolean;
  data: MenuItem;
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    tenantId?: string;
  };
}

export interface MenuItemsResponse {
  success: boolean;
  data: MenuItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    tenantId?: string;
  };
}

export interface CreateMenuItemRequest {
  code: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  roles?: string[];
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled';
  is_new?: boolean;
  requires_setup?: boolean;
  target?: '_self' | '_blank';
  external_url?: string;
}

export interface UpdateMenuItemRequest {
  label?: string;
  href?: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  roles?: string[];
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled';
  is_new?: boolean;
  requires_setup?: boolean;
  is_active?: boolean;
  target?: '_self' | '_blank';
  external_url?: string;
}

export interface ReorderMenuItemsRequest {
  items: Array<{
    id: string;
    sort_order: number;
  }>;
}

export interface MenuQueryParams {
  bankingMode?: 'conventional' | 'syariah' | 'dual';
  includeInactive?: boolean;
  parentId?: string;
  level?: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    tenantId?: string;
  };
}

class MenuService {
  // Cache for menu data to avoid repeated API calls
  private menuCache: Map<string, { data: any; timestamp: number }> = new Map();
  private CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get menu hierarchy for current user
   */
  async getMenuTree(params?: MenuQueryParams): Promise<MenuTreeResponse> {
    try {
      console.log('📋 Fetching menu hierarchy from backend', params);

      const queryParams = new URLSearchParams();
      if (params?.bankingMode) {
        queryParams.append('bankingMode', params.bankingMode);
      }
      if (params?.includeInactive !== undefined) {
        queryParams.append('includeInactive', params.includeInactive.toString());
      }
      if (params?.parentId) {
        queryParams.append('parentId', params.parentId);
      }
      if (params?.level !== undefined) {
        queryParams.append('level', params.level.toString());
      }
      if (params?.useCache !== undefined) {
        queryParams.append('useCache', params.useCache.toString());
      }

      // 🔧 FIX: Try public menu endpoint first (no auth required), fallback to authenticated endpoint
      let response: any;
      try {
        // Use the api client baseURL which should be properly configured by environment loader
        const baseURL = api.client.defaults.baseURL || 'http://localhost:4232/api';
        console.log('🌐 Trying public menu endpoint (no authentication required)');
        console.log('🌐 API Base URL:', api.client.defaults.baseURL);
        console.log('🌐 Endpoint URL:', `${baseURL}/menu/sidebar?${queryParams}`);
        response = await fetch(`${baseURL}/menu/sidebar?${queryParams}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('✅ Public menu endpoint successful');
          const apiResponse = await response.json();

          console.log('✅ Menu hierarchy fetched successfully from public endpoint:', {
            itemCount: Array.isArray(apiResponse.data) ? apiResponse.data.length : 0,
            success: apiResponse.success,
            hasMeta: !!apiResponse.meta,
            timestamp: apiResponse.meta?.timestamp
          });

          return {
            success: true,
            data: apiResponse.data || [],
            meta: apiResponse.meta
          };
        } else {
          console.warn('⚠️ Public menu endpoint failed, trying authenticated endpoint');
          throw new Error(`Public endpoint returned ${response.status}`);
        }
      } catch (publicError) {
        console.log('🔄 Public menu failed, trying authenticated endpoint:', publicError instanceof Error ? publicError.message : 'Unknown error');

        // Fallback to authenticated endpoint
        response = await api.client.get<MenuTreeResponse>(`/menu/tree?${queryParams}`);
      }

      // Extract data from axios response wrapper (for authenticated endpoint)
      const apiResponse = response.data;

      console.log('✅ Menu hierarchy fetched successfully:', {
        itemCount: Array.isArray(apiResponse.data) ? apiResponse.data.length : 0,
        success: apiResponse.success,
        meta: apiResponse.meta
      });

      // Transform response to match expected format
      const transformedResponse: MenuTreeResponse = {
        success: apiResponse.success,
        data: Array.isArray(apiResponse.data) ? apiResponse.data : [],
        message: apiResponse.message,
        meta: apiResponse.meta
      };

      return transformedResponse;
    } catch (error) {
      console.error('❌ Failed to fetch menu hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get flat menu items list
   */
  async getMenuItems(params?: MenuQueryParams): Promise<MenuItemsResponse> {
    try {
      console.log('📋 Fetching menu items from backend', params);

      const queryParams = new URLSearchParams();
      if (params?.bankingMode) {
        queryParams.append('bankingType', params.bankingMode);
      }
      if (params?.includeInactive !== undefined) {
        queryParams.append('includeInactive', params.includeInactive.toString());
      }
      if (params?.parentId) {
        queryParams.append('parentId', params.parentId);
      }
      if (params?.level !== undefined) {
        queryParams.append('level', params.level.toString());
      }
      if (params?.page) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit) {
        queryParams.append('limit', params.limit.toString());
      }
      if (params?.search) {
        queryParams.append('search', params.search);
      }
      if (params?.useCache !== undefined) {
        queryParams.append('useCache', params.useCache.toString());
      }

      const response = await api.client.get<MenuItemsResponse>(`/menu/items?${queryParams}`);

      // Extract data from axios response wrapper
      const apiResponse = response.data;

      console.log('✅ Menu items fetched successfully:', {
        itemCount: Array.isArray(apiResponse.data) ? apiResponse.data.length : apiResponse.data?.length || 0,
        success: apiResponse.success,
        pagination: apiResponse.pagination
      });

      // Transform response to match expected format
      const transformedResponse: MenuItemsResponse = {
        success: apiResponse.success,
        data: Array.isArray(apiResponse.data) ? apiResponse.data : [],
        pagination: apiResponse.pagination || {
          page: 1,
          limit: 20,
          total: apiResponse.data?.length || 0,
          totalPages: 1
        },
        message: apiResponse.message,
        meta: apiResponse.meta
      };

      return transformedResponse;
    } catch (error) {
      console.error('❌ Failed to fetch menu items:', error);
      throw error;
    }
  }

  /**
   * Get single menu item by ID
   */
  async getMenuItem(id: string): Promise<MenuItemResponse> {
    try {
      console.log(`📋 Fetching menu item ${id} from backend`);

      const response = await api.client.get<MenuItemResponse>(`/menu/${id}`);

      // Extract data from axios response wrapper
      const apiResponse = response.data;

      console.log('✅ Menu item fetched successfully:', {
        success: apiResponse.success,
        itemId: apiResponse.data?.id
      });

      return apiResponse;
    } catch (error) {
      console.error(`❌ Failed to fetch menu item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create new menu item (Admin only)
   */
  async createMenuItem(menuData: CreateMenuItemRequest): Promise<MenuItemResponse> {
    try {
      console.log('➕ Creating menu item:', menuData.label);

      const response = await api.client.post<MenuItemResponse>('/menu', menuData);

      // Extract data from axios response wrapper
      const apiResponse = response.data;

      console.log('✅ Menu item created successfully:', {
        success: apiResponse.success,
        itemId: apiResponse.data?.id
      });

      // Clear cache to force refresh
      this.clearCache();

      return apiResponse;
    } catch (error) {
      console.error('❌ Failed to create menu item:', error);
      throw error;
    }
  }

  /**
   * Update menu item (Admin only)
   */
  async updateMenuItem(id: string, updateData: UpdateMenuItemRequest): Promise<MenuItemResponse> {
    try {
      console.log(`✏️ Updating menu item ${id}:`, updateData);

      const response = await api.client.put<MenuItemResponse>(`/menu/${id}`, updateData);

      // Extract data from axios response wrapper
      const apiResponse = response.data;

      console.log('✅ Menu item updated successfully:', {
        success: apiResponse.success,
        itemId: apiResponse.data?.id
      });

      // Clear cache to force refresh
      this.clearCache();

      return apiResponse;
    } catch (error) {
      console.error(`❌ Failed to update menu item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete menu item (Admin only)
   */
  async deleteMenuItem(id: string): Promise<ApiResponse> {
    try {
      console.log(`🗑️ Deleting menu item ${id}`);

      const response = await api.client.delete<ApiResponse>(`/menu/${id}`);

      // Extract data from axios response wrapper
      const apiResponse = response.data;

      console.log('✅ Menu item deleted successfully:', {
        success: apiResponse.success
      });

      // Clear cache to force refresh
      this.clearCache();

      return apiResponse;
    } catch (error) {
      console.error(`❌ Failed to delete menu item ${id}:`, error);
      throw error;
    }
  }

  /**
   * Reorder menu items (Admin only)
   */
  async reorderMenuItems(items: ReorderMenuItemsRequest): Promise<ApiResponse> {
    try {
      console.log('🔄 Reordering menu items:', items);

      const response = await api.client.post<ApiResponse>('/menu/reorder', { items });

      // Extract data from axios response wrapper
      const apiResponse = response.data;

      console.log('✅ Menu items reordered successfully:', {
        success: apiResponse.success
      });

      // Clear cache to force refresh
      this.clearCache();

      return apiResponse;
    } catch (error) {
      console.error('❌ Failed to reorder menu items:', error);
      throw error;
    }
  }

  /**
   * Initialize default menu structure (Admin only)
   */
  async initializeMenuStructure(): Promise<ApiResponse> {
    try {
      console.log('🏗️ Initializing default menu structure');

      const response = await api.client.post<ApiResponse>('/menu/initialize');

      // Extract data from axios response wrapper
      const apiResponse = response.data;

      console.log('✅ Menu structure initialized successfully:', {
        success: apiResponse.success
      });

      // Clear cache to force refresh
      this.clearCache();

      return apiResponse;
    } catch (error) {
      console.error('❌ Failed to initialize menu structure:', error);
      throw error;
    }
  }

  /**
   * Get cached menu hierarchy with automatic refresh
   */
  async getCachedMenuTree(params?: MenuQueryParams): Promise<MenuTreeResponse> {
    const cacheKey = JSON.stringify(params || {});
    const now = Date.now();

    // Check cache
    if (this.menuCache.has(cacheKey)) {
      const cached = this.menuCache.get(cacheKey)!;
      if (now - cached.timestamp < this.CACHE_DURATION) {
        console.log('📋 Using cached menu hierarchy');
        return cached.data;
      }
    }

    // Fetch fresh data
    const response = await this.getMenuTree(params);

    // Update cache
    this.menuCache.set(cacheKey, {
      data: response,
      timestamp: now
    });

    return response;
  }

  /**
   * Convert menu tree to flat list (for DataGrid)
   */
  private flattenMenuTree(items: MenuItem[]): MenuItem[] {
    const result: MenuItem[] = [];

    for (const item of items) {
      result.push(item);
      if (item.children && item.children.length > 0) {
        result.push(...this.flattenMenuTree(item.children));
      }
    }

    return result;
  }

  /**
   * Find menu item by code in tree
   */
  findMenuItemByCode(menuTree: MenuItem[], code: string): MenuItem | null {
    for (const item of menuTree) {
      if (item.code === code) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const found = this.findMenuItemByCode(item.children, code);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * Get menu breadcrumb for a path
   */
  getBreadcrumbForPath(menuTree: MenuItem[], currentPath: string): MenuItem[] {
    const breadcrumb: MenuItem[] = [];
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
        // Try to find by code or partial match
        const partialMatch = currentTree.find(item =>
          item.code.toLowerCase().includes(segment.toLowerCase()) ||
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
   * Check if menu item is accessible for current user - CENTRALIZED CONFIGURATION
   */
  isMenuItemAccessible(menuItem: MenuItem, userRole: string, bankingMode?: string): boolean {
    // Check if menu is active
    if (!menuItem.is_active) return false;

    // Check if disabled (but allow disabled items to be shown with visual indicators)
    // if (menuItem.status === 'disabled') return false;

    // Check banking mode filter
    if (bankingMode && menuItem.banking_modes && !menuItem.banking_modes.includes(bankingMode as any)) {
      return false;
    }

    // Use centralized role-based access control
    if (menuItem.roles && menuItem.roles.length > 0 && userRole) {
      return hasMenuAccess([userRole], menuItem.roles);
    }

    // If no role restrictions, allow access
    return true;
  }

  /**
   * Filter menu tree based on user context
   */
  filterMenuTree(menuTree: MenuItem[], userRole: string, bankingMode?: string): MenuItem[] {
    return menuTree
      .filter(item => this.isMenuItemAccessible(item, userRole, bankingMode))
      .map(item => ({
        ...item,
        children: item.children ? this.filterMenuTree(item.children, userRole, bankingMode) : undefined
      }));
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    this.menuCache.clear();
    console.log('🗑️ Menu cache cleared');
  }

  /**
   * Get menu statistics
   */
  getMenuStatistics(menuTree: MenuItem[]): { total: number; active: number; inactive: number; hasChildren: number; levels: number; disabled: number; newItems: number; requiresSetup: number; } {
    const flatItems = this.flattenMenuTree(menuTree);

    return {
      total: flatItems.length,
      active: flatItems.filter(item => item.is_active).length,
      inactive: flatItems.filter(item => !item.is_active).length,
      hasChildren: flatItems.filter(item => item.children && item.children.length > 0).length,
      levels: Math.max(...flatItems.map(item => item.level)) + 1,
      disabled: flatItems.filter(item => item.status === 'disabled').length,
      newItems: flatItems.filter(item => item.is_new).length,
      requiresSetup: flatItems.filter(item => item.requires_setup).length
    };
  }
}

export const menuService = new MenuService();

export default menuService;