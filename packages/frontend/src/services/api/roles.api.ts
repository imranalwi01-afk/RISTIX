import { apiClient } from '../api-client';
import type { AxiosResponse } from 'axios';
import { normalizeRolesMutationResponse } from '../roles-api.utils';
import { getErrorMessage } from '@/utils/error-message';

export const rolesAPI = {
  normalizeMutationResponse: (
    response: AxiosResponse<any>,
    fallbackSuccessMessage: string
  ): Record<string, any> & {
    success: boolean;
    approvalRequired: boolean;
    status?: number;
    message: string;
    requestId?: string;
  } => normalizeRolesMutationResponse(response, fallbackSuccessMessage),

  // Get all roles from tenant database with filtering and pagination
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: 'SYSTEM' | 'BANKING' | 'CUSTOM';
    level?: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
    isActive?: boolean;
    includeInactive?: boolean;
  }, tenantId?: string) => {
    console.log(`🔒 Fetching roles from tenant database with real API${tenantId ? ` (tenant: ${tenantId})` : ''}`, params);
    const config: any = { params };
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get('/roles', config);
    return response.data;
  },

  // Get role by ID from tenant database
  getById: async (id: string, tenantId?: string) => {
    console.log(`🔒 Fetching role ${id} from tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get(`/roles/${id}`, config);
    return response.data;
  },

  // Create role in tenant database
  create: async (roleData: {
    roleName?: string;
    name: string;
    displayName?: string;
    description?: string;
    permissions?: string[];
    type?: 'SYSTEM' | 'BANKING' | 'CUSTOM';
    level?: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
    complianceLevel?: string;
    hierarchyLevel?: number;
    isActive?: boolean;
  }, tenantId?: string) => {
    console.log(`➕ Creating role in tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`, roleData.name);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const payload = {
      roleName: roleData.roleName || roleData.name || roleData.displayName,
      description: roleData.description,
      permissions: roleData.permissions || [],
      complianceLevel: roleData.complianceLevel,
      hierarchyLevel: roleData.hierarchyLevel,
      isActive: roleData.isActive,
    };
    const response = await apiClient.post('/roles', payload, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role created successfully');
  },

  // Update role in tenant database
  update: async (id: string, roleData: {
    roleName?: string;
    name?: string;
    displayName?: string;
    description?: string;
    permissions?: string[];
    complianceLevel?: string;
    hierarchyLevel?: number;
    isActive?: boolean;
  }, tenantId?: string) => {
    console.log(`✏️ Updating role ${id} in tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const payload = {
      roleName: roleData.roleName || roleData.name || roleData.displayName,
      description: roleData.description,
      permissions: roleData.permissions,
      complianceLevel: roleData.complianceLevel,
      hierarchyLevel: roleData.hierarchyLevel,
      isActive: roleData.isActive,
    };
    const response = await apiClient.put(`/roles/${id}`, payload, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role updated successfully');
  },

  // Delete role from tenant database
  delete: async (id: string, tenantId?: string) => {
    console.log(`🗑️ Deleting role ${id} from tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.delete(`/roles/${id}`, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role deleted successfully');
  },

  // Toggle role active status
  toggle: async (id: string, tenantId?: string) => {
    console.log(`🔄 Toggling role ${id} active status${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/roles/${id}/toggle`, {}, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role status updated successfully');
  },

  // Get all available permissions
  getPermissions: async (tenantId?: string) => {
    console.log(`🔑 Fetching permissions from tenant database${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get('/roles/permissions', config);
    return response.data;
  },

  // Update role permissions
  updatePermissions: async (
    id: string,
    permissions: string[],
    tenantId?: string,
    options?: { submitForApproval?: boolean; approvalReason?: string }
  ) => {
    console.log(`🔑 Updating permissions for role ${id}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.put(`/roles/${id}/permissions`, {
      permissions,
      submitForApproval: options?.submitForApproval ?? true,
      approvalReason: options?.approvalReason
    }, config);
    return rolesAPI.normalizeMutationResponse(response, 'Role permissions updated successfully');
  },

  // Get users assigned to role
  getUsers: async (roleId: string, tenantId?: string) => {
    console.log(`👥 Fetching users for role ${roleId}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get(`/roles/${roleId}/users`, config);
    return response.data;
  },

  // Get roles assigned to user
  getUserRoles: async (userId: string, tenantId?: string) => {
    console.log(`👤 Fetching role assignments for user ${userId}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.get(`/roles/users/${userId}/roles`, config);
    return response.data;
  },

  // Assign role to user
  assignUser: async (roleId: string, userId: string, tenantId?: string) => {
    console.log(`👤 Assigning role ${roleId} to user ${userId}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const payload = { isTemporary: false };
    try {
      // Preferred RBAC route in new-backend: /roles/users/:userId/roles/:roleId
      const response = await apiClient.post(`/roles/users/${userId}/roles/${roleId}`, payload, config);
      return rolesAPI.normalizeMutationResponse(response, 'Role assigned successfully');
    } catch (error: any) {
      // Compatibility fallback for legacy route shape if RBAC-prefixed path is unavailable.
      if (error?.response?.status === 404) {
        const response = await apiClient.post(`/users/${userId}/roles/${roleId}`, payload, config);
        return rolesAPI.normalizeMutationResponse(response, 'Role assigned successfully');
      }
      throw error;
    }
  },

  // Remove role from user
  removeUser: async (roleId: string, userId: string, tenantId?: string) => {
    console.log(`👤 Removing role ${roleId} from user ${userId}${tenantId ? ` (tenant: ${tenantId})` : ''}`);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    try {
      // Preferred RBAC route in new-backend: /roles/users/:userId/roles/:roleId
      const response = await apiClient.delete(`/roles/users/${userId}/roles/${roleId}`, config);
      return rolesAPI.normalizeMutationResponse(response, 'Role removed successfully');
    } catch (error: any) {
      // Compatibility fallback for legacy route shape if RBAC-prefixed path is unavailable.
      if (error?.response?.status === 404) {
        const response = await apiClient.delete(`/users/${userId}/roles/${roleId}`, config);
        return rolesAPI.normalizeMutationResponse(response, 'Role removed successfully');
      }
      throw error;
    }
  },

  checkUserPermission: async (
    userId: string,
    input: { resource: string; action: string },
    tenantId?: string
  ) => {
    console.log(`🔍 Checking permission for user ${userId}${tenantId ? ` (tenant: ${tenantId})` : ''}`, input);
    const config: any = {};
    if (tenantId) config.headers = { 'X-Tenant-ID': tenantId };
    const response = await apiClient.post(`/roles/users/${userId}/permissions/check`, input, config);
    return response.data;
  }
};