// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/providers/dataProvider.ts
// Generated: Day 2 Hour 6 - Part 1 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin v4, Fetch API
// Purpose: Multi-tenant data provider with banking type support
// ============================================================================

import { DataProvider, GetListParams, GetOneParams, CreateParams, UpdateParams, DeleteParams } from 'react-admin';

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://iaf-ifrs-be.danafin.com/api/v1';

// Helper function to get authentication headers
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');
  const bankingType = localStorage.getItem('bankingType') || 'conventional';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }
  
  headers['X-Banking-Type'] = bankingType;
  
  return headers;
};

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type');
  
  if (!response.ok) {
    let errorMessage = 'Network response was not ok';
    
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } else {
      errorMessage = await response.text();
    }
    
    throw new Error(`${response.status}: ${errorMessage}`);
  }
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

// Convert React Admin filters to API query parameters
const convertFilters = (filters: any): Record<string, string> => {
  const params: Record<string, string> = {};
  
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'object') {
        // Handle complex filters
        if (value.q) {
          params[`${key}_contains`] = value.q;
        } else if (value.gte) {
          params[`${key}_gte`] = value.gte;
        } else if (value.lte) {
          params[`${key}_lte`] = value.lte;
        } else {
          params[key] = JSON.stringify(value);
        }
      } else {
        params[key] = value;
      }
    }
  });
  
  return params;
};

/**
 * Multi-tenant Data Provider for IFRS 9 Platform
 * Handles API communication with tenant isolation and banking type context
 */
export const dataProvider: DataProvider = {
  // Get list of records
  getList: async (resource: string, params: GetListParams) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const filters = convertFilters(params.filter);

    const query = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      sort: field,
      order: order.toLowerCase(),
      ...filters,
    });

    const url = `${API_URL}/${resource}?${query}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);

      // Special handling for users resource to match backend API response structure
      if (resource === 'users') {
        return {
          data: data.data?.users || data.data || data.items || data,
          total: data.total || data.data?.pagination?.total || (data.data?.users ? data.data.users.length : data.length),
          pageInfo: data.data?.pagination || data.pageInfo || {}
        };
      }

      // Special handling for roles resource to match backend API response structure
      if (resource === 'roles') {
        return {
          data: data.data || data.items || data,
          total: data.total || data.pagination?.total || (Array.isArray(data) ? data.length : 0),
          pageInfo: data.pagination || data.pageInfo || {}
        };
      }

      // Special handling for menu items resource to match backend API response structure
      if (resource === 'menu_items' || resource === 'menus') {
        return {
          data: data.data || data.items || data,
          total: data.total || data.pagination?.total || (Array.isArray(data) ? data.length : 0),
          pageInfo: data.pagination || data.pageInfo || {}
        };
      }

      return {
        data: data.data || data.items || data,
        total: data.total || data.count || (data.data ? data.data.length : data.length),
        pageInfo: data.pageInfo || {}
      };
    } catch (error) {
      console.error(`Error fetching ${resource}:`, error);
      throw error;
    }
  },

  // Get single record
  getOne: async (resource: string, params: GetOneParams) => {
    const url = `${API_URL}/${resource}/${params.id}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await handleResponse(response);

      // Special handling for users resource to match backend API response structure
      if (resource === 'users') {
        return {
          data: data.data?.user || data.data || data
        };
      }

      // Special handling for roles resource to match backend API response structure
      if (resource === 'roles') {
        return {
          data: data.data || data
        };
      }

      return {
        data: data.data || data
      };
    } catch (error) {
      console.error(`Error fetching ${resource} ${params.id}:`, error);
      throw error;
    }
  },

  // Get many records by IDs
  getMany: async (resource: string, params: { ids: any[] }) => {
    const query = new URLSearchParams({
      ids: params.ids.join(',')
    });
    
    const url = `${API_URL}/${resource}/batch?${query}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      
      return {
        data: data.data || data
      };
    } catch (error) {
      console.error(`Error fetching multiple ${resource}:`, error);
      throw error;
    }
  },

  // Get many records by references
  getManyReference: async (resource: string, params: any) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;
    const filters = convertFilters(params.filter);
    
    const query = new URLSearchParams({
      page: page.toString(),
      limit: perPage.toString(),
      sort: field,
      order: order.toLowerCase(),
      [params.target]: params.id,
      ...filters,
    });
    
    const url = `${API_URL}/${resource}?${query}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      const data = await handleResponse(response);
      
      return {
        data: data.data || data.items || data,
        total: data.total || data.count || (data.data ? data.data.length : data.length),
      };
    } catch (error) {
      console.error(`Error fetching ${resource} by reference:`, error);
      throw error;
    }
  },

  // Create new record
  create: async (resource: string, params: CreateParams) => {
    const url = `${API_URL}/${resource}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params.data),
      });
      
      const data = await handleResponse(response);
      
      return {
        data: { ...params.data, id: data.id || data.data?.id, ...data.data }
      };
    } catch (error) {
      console.error(`Error creating ${resource}:`, error);
      throw error;
    }
  },

  // Update existing record
  update: async (resource: string, params: UpdateParams) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(params.data),
      });
      
      const data = await handleResponse(response);
      
      return {
        data: { ...params.data, ...data.data }
      };
    } catch (error) {
      console.error(`Error updating ${resource} ${params.id}:`, error);
      throw error;
    }
  },

  // Update many records
  updateMany: async (resource: string, params: { ids: any[]; data: any }) => {
    const url = `${API_URL}/${resource}/batch`;
    
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          ids: params.ids,
          data: params.data
        }),
      });
      
      const data = await handleResponse(response);
      
      return {
        data: data.updatedIds || params.ids
      };
    } catch (error) {
      console.error(`Error updating multiple ${resource}:`, error);
      throw error;
    }
  },

  // Delete record
  delete: async (resource: string, params: DeleteParams) => {
    const url = `${API_URL}/${resource}/${params.id}`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      
      return {
        data: params.previousData || { id: params.id }
      };
    } catch (error) {
      console.error(`Error deleting ${resource} ${params.id}:`, error);
      throw error;
    }
  },

  // Delete many records
  deleteMany: async (resource: string, params: { ids: any[] }) => {
    const url = `${API_URL}/${resource}/batch`;
    
    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ids: params.ids }),
      });
      
      const data = await handleResponse(response);
      
      return {
        data: data.deletedIds || params.ids
      };
    } catch (error) {
      console.error(`Error deleting multiple ${resource}:`, error);
      throw error;
    }
  },
};

// Data provider helpers
export const dataProviderHelpers = {
  // Custom API call
  apiCall: async (endpoint: string, options: RequestInit = {}) => {
    const url = `${API_URL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    });

    return handleResponse(response);
  },

  // Upload file
  uploadFile: async (file: File, resource: string = 'files') => {
    const formData = new FormData();
    formData.append('file', file);

    const headers = getAuthHeaders();
    delete (headers as any)['Content-Type']; // Let browser set content-type for FormData

    const response = await fetch(`${API_URL}/${resource}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return handleResponse(response);
  },

  // Download file
  downloadFile: async (fileId: string, resource: string = 'files') => {
    const response = await fetch(`${API_URL}/${resource}/${fileId}/download`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return response.blob();
  },

  // Trigger calculation
  triggerCalculation: async (calculationType: string, parameters: any) => {
    return dataProviderHelpers.apiCall('/calculations/trigger', {
      method: 'POST',
      body: JSON.stringify({
        type: calculationType,
        parameters
      })
    });
  },

  // Get calculation status
  getCalculationStatus: async (calculationId: string) => {
    return dataProviderHelpers.apiCall(`/calculations/${calculationId}/status`);
  },

  // Custom users API calls for backend integration
  users: {
    // Get users with role information
    getUsersWithRoles: async (params: any = {}) => {
      const query = new URLSearchParams({
        ...params,
        includeRoles: 'true'
      });

      const response = await dataProviderHelpers.apiCall(`/user?${query}`);
      return {
        data: response.data?.users || [],
        total: response.data?.pagination?.total || 0,
        pagination: response.data?.pagination || {}
      };
    },

    // Get single user with roles
    getUserWithRoles: async (userId: string) => {
      const response = await dataProviderHelpers.apiCall(`/user/${userId}?includeRoles=true`);
      return {
        data: response.data?.user || response.data
      };
    },

    // Create user with role assignment
    createUserWithRoles: async (userData: any) => {
      return dataProviderHelpers.apiCall('/user', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },

    // Update user
    updateUser: async (userId: string, userData: any) => {
      return dataProviderHelpers.apiCall(`/user/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    },

    // Enable/Disable user
    enableUser: async (userId: string) => {
      return dataProviderHelpers.apiCall(`/user/${userId}/enable`, {
        method: 'POST'
      });
    },

    disableUser: async (userId: string) => {
      return dataProviderHelpers.apiCall(`/user/${userId}/disable`, {
        method: 'POST'
      });
    },

    // Reset password
    resetPassword: async (userId: string, newPassword: string) => {
      return dataProviderHelpers.apiCall(`/user/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ newPassword })
      });
    },

    // Assign roles
    assignRoles: async (userId: string, roleIds: string[]) => {
      return dataProviderHelpers.apiCall(`/user/${userId}/assign-roles`, {
        method: 'POST',
        body: JSON.stringify({ roleIds })
      });
    }
  },

  // Custom roles API calls for backend integration
  roles: {
    // Get roles with user counts
    getRolesWithUserCounts: async (params: any = {}) => {
      const query = new URLSearchParams({
        ...params,
        includeUserCounts: 'true'
      });

      const response = await dataProviderHelpers.apiCall(`/roles?${query}`);
      return {
        data: response.data || [],
        total: response.pagination?.total || 0,
        pagination: response.pagination || {}
      };
    },

    // Get permissions available for current tenant
    getAvailablePermissions: async () => {
      const response = await dataProviderHelpers.apiCall('/permissions');
      return {
        data: response.data || [],
        categories: response.categories || []
      };
    },

    // Get single role
    getRoleWithPermissions: async (roleId: string) => {
      const response = await dataProviderHelpers.apiCall(`/roles/${roleId}`);
      return {
        data: response.data || response
      };
    },

    // Create role
    createRole: async (roleData: any) => {
      return dataProviderHelpers.apiCall('/roles', {
        method: 'POST',
        body: JSON.stringify(roleData)
      });
    },

    // Update role
    updateRole: async (roleId: string, roleData: any) => {
      return dataProviderHelpers.apiCall(`/roles/${roleId}`, {
        method: 'PUT',
        body: JSON.stringify(roleData)
      });
    },

    // Update role permissions
    updateRolePermissions: async (roleId: string, permissions: any[]) => {
      return dataProviderHelpers.apiCall(`/roles/${roleId}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ permissions })
      });
    },

    // Toggle role active status
    toggleRoleStatus: async (roleId: string) => {
      return dataProviderHelpers.apiCall(`/roles/${roleId}/toggle`, {
        method: 'POST'
      });
    },

    // Get users assigned to a role
    getRoleUsers: async (roleId: string) => {
      const response = await dataProviderHelpers.apiCall(`/roles/users?roleId=${roleId}`);
      return {
        data: response.data || [],
        total: response.data?.length || 0
      };
    },

    // Assign role to user
    assignRoleToUser: async (roleId: string, userId: string) => {
      return dataProviderHelpers.apiCall(`/roles/${roleId}/users/${userId}`, {
        method: 'POST'
      });
    },

    // Remove role assignment from user
    removeRoleFromUser: async (roleId: string, userId: string) => {
      return dataProviderHelpers.apiCall(`/roles/${roleId}/users/${userId}`, {
        method: 'DELETE'
      });
    }
  },

  // Custom menu API calls for backend integration
  menus: {
    // Get menu hierarchy for current user
    getMenuHierarchy: async (params: any = {}) => {
      const query = new URLSearchParams({
        ...params,
        includeHierarchy: 'true'
      });

      const response = await dataProviderHelpers.apiCall(`/menu/hierarchy?${query}`);
      return {
        data: response.data || [],
        total: response.data?.length || 0,
        hierarchy: response.hierarchy || []
      };
    },

    // Get flat menu items list
    getMenuItems: async (params: any = {}) => {
      const query = new URLSearchParams({
        ...params
      });

      const response = await dataProviderHelpers.apiCall(`/menu/items?${query}`);
      return {
        data: response.data || [],
        total: response.pagination?.total || response.data?.length || 0,
        pagination: response.pagination || {}
      };
    },

    // Get single menu item
    getMenuItem: async (menuId: string) => {
      const response = await dataProviderHelpers.apiCall(`/menu/${menuId}`);
      return {
        data: response.data || response
      };
    },

    // Create new menu item
    createMenuItem: async (menuData: any) => {
      return dataProviderHelpers.apiCall('/menu', {
        method: 'POST',
        body: JSON.stringify(menuData)
      });
    },

    // Update menu item
    updateMenuItem: async (menuId: string, menuData: any) => {
      return dataProviderHelpers.apiCall(`/menu/${menuId}`, {
        method: 'PUT',
        body: JSON.stringify(menuData)
      });
    },

    // Delete menu item
    deleteMenuItem: async (menuId: string) => {
      return dataProviderHelpers.apiCall(`/menu/${menuId}`, {
        method: 'DELETE'
      });
    },

    // Reorder menu items
    reorderMenuItems: async (items: Array<{ id: string; sort_order: number }>) => {
      return dataProviderHelpers.apiCall('/menu/reorder', {
        method: 'POST',
        body: JSON.stringify({ items })
      });
    },

    // Initialize default menu structure
    initializeMenuStructure: async () => {
      return dataProviderHelpers.apiCall('/menu/initialize', {
        method: 'POST'
      });
    },

    // Get menu by category
    getMenuByCategory: async (category: string, params: any = {}) => {
      const query = new URLSearchParams({
        category,
        ...params
      });

      const response = await dataProviderHelpers.apiCall(`/menu/category?${query}`);
      return {
        data: response.data || [],
        total: response.data?.length || 0
      };
    },

    // Get accessible menus for user role
    getAccessibleMenus: async (userRole: string, bankingType?: string) => {
      const query = new URLSearchParams({
        role: userRole,
        bankingType: bankingType || 'both'
      });

      const response = await dataProviderHelpers.apiCall(`/menu/accessible?${query}`);
      return {
        data: response.data || [],
        total: response.data?.length || 0
      };
    },

    // Toggle menu active status
    toggleMenuStatus: async (menuId: string) => {
      return dataProviderHelpers.apiCall(`/menu/${menuId}/toggle`, {
        method: 'POST'
      });
    },

    // Get menu breadcrumbs for path
    getMenuBreadcrumbs: async (path: string) => {
      const query = new URLSearchParams({
        path
      });

      const response = await dataProviderHelpers.apiCall(`/menu/breadcrumbs?${query}`);
      return {
        data: response.data || [],
        path: path
      };
    }
  }
};

export default dataProvider;