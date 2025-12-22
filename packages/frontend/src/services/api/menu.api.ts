// packages/frontend/src/services/api/menu.api.ts
// ============================================================================
// Menu API Service
// ============================================================================
// Generated: 2025-01-12
// Purpose: API client for database-driven menu system
// Methodology: Core Platform MVP - Frontend Menu API
// Dependencies: Axios, TypeScript
// ============================================================================

import axios, { AxiosResponse } from 'axios';
// Authentication token helper
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

// API base URL - Centralized dual-mode configuration
const getApiBaseUrl = () => {
  try {
    // Try to use centralized environment loader first
    const { frontendEnvironmentLoader } = require('../../config/environment-loader-frontend');
    const config = frontendEnvironmentLoader.getConfiguration();
    console.log('✅ Menu API: Using centralized API base URL:', config.api.base);
    return config.api.base;
  } catch (error) {
    console.warn('⚠️ Menu API: Failed to load centralized API base URL, using fallback:', error);

    // Fallback to environment variables with hostname detection
    const isProductionDomain = typeof window !== 'undefined' && window.location.hostname.includes('danafin.com');
    const fallbackUrl = process.env.NEXT_PUBLIC_API_URL ||
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (isProductionDomain ? 'https://iaf-ifrs-be.danafin.com/api/v1' : 'https://iaf-ifrs-be.ifrspro.id/api/v1');

    console.log('🔧 Menu API: Using fallback API base URL:', fallbackUrl);
    return fallbackUrl;
  }
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default configuration
const menuApiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
menuApiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
menuApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
  external?: boolean;
  target?: '_self' | '_blank' | '_parent' | '_top';
  breadcrumb?: boolean;
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
    const response = await menuApiClient.get('/menu/hierarchy', { params });
    return response.data;
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
  getMenuInfo: () => menuApiService.getMenuInfo()
};

export default menuApiService;