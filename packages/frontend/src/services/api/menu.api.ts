// packages/frontend/src/services/api/menu.api.ts
// ============================================================================
// Menu API Service
// ============================================================================
// Generated: 2025-01-12
// Purpose: API client for database-driven menu system
// Methodology: Core Platform MVP - Frontend Menu API
// Dependencies: Axios, TypeScript
// ============================================================================

import { AxiosResponse } from 'axios';
import { apiClient, apiClient as menuApiClient } from '../api-client';
import '../api-setup'; // Ensure interceptors are registered
import { getStaticFallbackMenu } from '@/components/banking/BankingSidebarUtils';
import { frontendEnvironmentLoader } from '@/config/environment-loader-frontend';

// NOTE: We use the shared apiClient which is already configured with:
// 1. Correct Base URL (auto-detected via environment-loader -> api.ts)
// 2. Auth token interceptor (api.ts)
// 3. Error handling interceptor (api.ts)
// 4. Rate limiting (api.ts)

// No need to re-implement getAuthToken, getApiBaseUrl, or interceptors here.
// The apiClient imported from ../../api-client is the SAME instance configured in ../../services/api.ts

// Types
export interface MenuApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  meta?: {
    timestamp: string;
    user_id?: string;
    tenant_id?: string;
    [key: string]: any;
  };
}

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
  requiredPermissions?: string[];
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

export interface UserMenuResponse {
  menu_configuration: MenuConfiguration;
  menu_items: MenuItem[];
  context: MenuContext;
}

export interface BreadcrumbsResponse {
  breadcrumbs: BreadcrumbItem[];
  current_path: string;
}

export interface MenuAccessLogRequest {
  menu_item_id: string;
  accessed_url?: string;
  response_time?: number;
}

export interface MenuConfigurationRequest {
  id?: string;
  name: string;
  description?: string;
  target_audience: 'banking_staff' | 'consultant' | 'regulator' | 'platform_admin';
  banking_mode?: 'conventional' | 'syariah' | 'dual';
  tenant_specific?: boolean;
  is_default?: boolean;
  is_active?: boolean;
  version?: string;
  menu_items?: MenuItem[];
}

export interface MenuAnalyticsResponse {
  summary: {
    total_accesses: number;
    unique_users: number;
    most_accessed_items: Array<{
      menu_item: string;
      title: string;
      access_count: number;
    }>;
    least_accessed_items: Array<{
      menu_item: string;
      title: string;
      access_count: number;
    }>;
  };
  time_series: Array<{
    date: string;
    accesses: number;
  }>;
  user_patterns: {
    peak_hours: string[];
    average_session_items: number;
    bounce_rate: number;
  };
}

const buildStaticMenuTreeFallback = (): MenuItem[] => {
  const toMenuItem = (item: any): MenuItem => ({
    id: String(item.id),
    key: String(item.key || item.id),
    title: String(item.title || item.label || item.id || 'Unknown'),
    description: item.description || undefined,
    icon: item.icon || undefined,
    url: item.url || undefined,
    type: item.type === 'divider' ? 'divider' : (item.children && item.children.length > 0 ? 'group' : 'item'),
    permissions: Array.isArray(item.user_types) ? item.user_types : [],
    requiredPermissions: Array.isArray(item.requiredPermissions) ? item.requiredPermissions : [],
    sort_order: Number(item.sort_order || 0),
    children: Array.isArray(item.children) ? item.children.map(toMenuItem) : [],
  });

  const flatItems = getStaticFallbackMenu();
  const byId = new Map<string, any>();

  flatItems.forEach((item) => {
    byId.set(String(item.id), { ...item, children: [] as any[] });
  });

  const roots: any[] = [];
  byId.forEach((item) => {
    const parentId = item.parent_id ? String(item.parent_id) : null;
    if (parentId && byId.has(parentId)) {
      byId.get(parentId).children.push(item);
    } else {
      roots.push(item);
    }
  });

  roots.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
  roots.forEach((item) => {
    if (Array.isArray(item.children)) {
      item.children.sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    }
  });

  return roots.map(toMenuItem);
};

const isDynamicMenuEnabled = (): boolean => {
  try {
    return frontendEnvironmentLoader.getConfiguration().features.dynamicMenu;
  } catch {
    return process.env.NEXT_PUBLIC_DYNAMIC_MENU_ENABLED === 'true';
  }
};

// Menu API Service Class
export class MenuApiService {
  /**
   * Get menu for current user context
   */
  async getUserMenu(): Promise<MenuApiResponse<UserMenuResponse>> {
    const response: AxiosResponse<MenuApiResponse<UserMenuResponse>> = await menuApiClient.get('/menu');
    return response.data;
  }


  /**
   * Get breadcrumbs for current path
   */
  async getBreadcrumbs(path: string): Promise<MenuApiResponse<BreadcrumbsResponse>> {
    const response: AxiosResponse<MenuApiResponse<BreadcrumbsResponse>> = await menuApiClient.get('/menu/breadcrumbs', {
      params: { path }
    });
    return response.data;
  }

  /**
   * Log menu access for analytics
   */
  async logMenuAccess(accessData: MenuAccessLogRequest): Promise<MenuApiResponse<void>> {
    const response: AxiosResponse<MenuApiResponse<void>> = await menuApiClient.post('/menu/access-log', accessData);
    return response.data;
  }

  /**
   * Get all menu configurations (Admin only)
   */
  async getMenuConfigurations(params?: {
    page?: number;
    limit?: number;
    target_audience?: string;
    banking_mode?: string;
  }): Promise<MenuApiResponse<{
    configurations: MenuConfiguration[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    const response = await menuApiClient.get('/menu/admin/configurations', { params });
    return response.data;
  }

  /**
   * Create or update menu configuration (Admin only)
   */
  async upsertMenuConfiguration(menuConfig: MenuConfigurationRequest): Promise<MenuApiResponse<MenuConfiguration>> {
    const response = await menuApiClient.post('/menu/admin/configurations', menuConfig);
    return response.data;
  }

  /**
   * Get hierarchical menu tree for current user
   */
  async getMenuTree(params?: {
    bankingMode?: 'conventional' | 'syariah' | 'dual';
    includeInactive?: boolean;
  }): Promise<MenuApiResponse<MenuItem[]>> {
    console.log('🚀 [MENU API] Fetching menu tree...', params);
    if (!isDynamicMenuEnabled()) {
      console.warn('⚠️ [MENU API] Dynamic menu disabled by configuration, using static fallback menu');
      return {
        success: true,
        data: buildStaticMenuTreeFallback(),
        message: 'Static fallback menu in use',
        meta: {
          timestamp: new Date().toISOString(),
          fallback: true,
          source: 'static',
        },
      };
    }

    try {
      const response = await menuApiClient.get('/menu/hierarchy', { params });
      console.log('✅ [MENU API] Menu tree response:', response.status, response.data?.success);
      return response.data;
    } catch (error: any) {
      const status = error?.response?.status;
      if (status === 404) {
        console.warn('⚠️ [MENU API] /menu/hierarchy not available, using static fallback menu');
        return {
          success: true,
          data: buildStaticMenuTreeFallback(),
          message: 'Static fallback menu in use',
          meta: {
            timestamp: new Date().toISOString(),
            fallback: true,
            source: 'static',
          },
        };
      }

      throw error;
    }
  }

  /**
   * Get menu items for specific configuration (Admin only)
   */
  async getMenuItems(configId: string): Promise<MenuApiResponse<{
    menu_items: MenuItem[];
    configuration_id: string;
  }>> {
    const response = await menuApiClient.get(`/menu/admin/configurations/${configId}/items`);
    return response.data;
  }

  /**
   * Get menu analytics (Admin only)
   */
  async getMenuAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    tenant_id?: string;
  }): Promise<MenuApiResponse<MenuAnalyticsResponse>> {
    const response = await menuApiClient.get('/menu/admin/analytics', { params });
    return response.data;
  }

  /**
   * Get menu system health
   */
  async getMenuHealth(): Promise<MenuApiResponse<{
    status: string;
    timestamp: string;
    checks: {
      database_connection: boolean;
      menu_cache: boolean;
      service_availability: boolean;
    };
    version: string;
  }>> {
    const response = await menuApiClient.get('/menu/health');
    return response.data;
  }

  /**
   * Get menu system info
   */
  async getMenuInfo(): Promise<MenuApiResponse<{
    service: string;
    version: string;
    description: string;
    features: string[];
    supported_audiences: string[];
    banking_modes: string[];
  }>> {
    const response = await menuApiClient.get('/menu/info');
    return response.data;
  }

  /**
   * Create a new menu item (Admin only)
   */
  async createMenuItem(menuItem: any): Promise<MenuApiResponse<any>> {
    const response = await menuApiClient.post('/menu/admin/items', menuItem);
    return response.data;
  }

  /**
   * Update an existing menu item (Admin only)
   */
  async updateMenuItem(id: string, menuItem: any): Promise<MenuApiResponse<any>> {
    const response = await menuApiClient.put(`/menu/admin/items/${id}`, menuItem);
    return response.data;
  }

  /**
   * Delete a menu item (Admin only)
   */
  async deleteMenuItem(id: string): Promise<MenuApiResponse<void>> {
    const response = await menuApiClient.delete(`/menu/admin/items/${id}`);
    return response.data;
  }

  /**
   * Initialize menu structure from seed data (Admin only)
   */
  async initializeMenuStructure(): Promise<MenuApiResponse<{
    message: string;
    items_created: number;
  }>> {
    const response = await menuApiClient.post('/menu/admin/initialize');
    return response.data;
  }
}

// Create singleton instance
const menuApiService = new MenuApiService();

// Export individual methods for convenience
export const menuApi = {
  getUserMenu: () => menuApiService.getUserMenu(),
  getMenuTree: (params?: { bankingMode?: 'conventional' | 'syariah' | 'dual'; includeInactive?: boolean }) =>
    menuApiService.getMenuTree(params),
  getBreadcrumbs: (path: string) => menuApiService.getBreadcrumbs(path),
  logMenuAccess: (accessData: MenuAccessLogRequest) => menuApiService.logMenuAccess(accessData),
  getMenuConfigurations: (params?: Parameters<MenuApiService['getMenuConfigurations']>[0]) =>
    menuApiService.getMenuConfigurations(params),
  upsertMenuConfiguration: (menuConfig: MenuConfigurationRequest) =>
    menuApiService.upsertMenuConfiguration(menuConfig),
  getMenuItems: (configId: string) => menuApiService.getMenuItems(configId),
  getMenuAnalytics: (params?: Parameters<MenuApiService['getMenuAnalytics']>[0]) =>
    menuApiService.getMenuAnalytics(params),
  getMenuHealth: () => menuApiService.getMenuHealth(),
  getMenuInfo: () => menuApiService.getMenuInfo(),
  // CRUD methods
  createMenuItem: (menuItem: any) => menuApiService.createMenuItem(menuItem),
  updateMenuItem: (id: string, menuItem: any) => menuApiService.updateMenuItem(id, menuItem),
  deleteMenuItem: (id: string) => menuApiService.deleteMenuItem(id),
  initializeMenuStructure: () => menuApiService.initializeMenuStructure()
};

export default menuApiService;
