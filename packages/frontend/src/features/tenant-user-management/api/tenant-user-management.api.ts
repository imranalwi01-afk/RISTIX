'use client';

import { rolesAPI, usersAPI } from '@/services/api';

export interface TenantUsersListParams {
  tenantId: string;
  page: number;
  limit: number;
  search?: string;
}

export async function fetchTenantUsers(params: TenantUsersListParams) {
  return usersAPI.getAll(
    {
      page: params.page,
      limit: params.limit,
      search: params.search,
    },
    params.tenantId,
  );
}

export async function fetchTenantUserRoles(tenantId: string, userId: string) {
  return rolesAPI.getUserRoles(userId, tenantId);
}

export async function fetchTenantRoles(tenantId: string) {
  return rolesAPI.getAll({ limit: 200 }, tenantId);
}

export async function fetchTenantPermissions(tenantId: string) {
  return rolesAPI.getPermissions(tenantId);
}

export async function fetchTenantRoleDetail(tenantId: string, roleId: string) {
  return rolesAPI.getById(roleId, tenantId);
}

export async function createTenantUser(tenantId: string, input: Record<string, unknown>) {
  return usersAPI.create(input, tenantId);
}

export async function updateTenantUser(tenantId: string, userId: string, input: Record<string, unknown>) {
  return usersAPI.update(userId, input, tenantId);
}

export async function deleteTenantUser(tenantId: string, userId: string) {
  return usersAPI.delete(userId, tenantId);
}

export async function toggleTenantUser(tenantId: string, userId: string, isActive: boolean) {
  return isActive ? usersAPI.disable(userId, tenantId) : usersAPI.enable(userId, tenantId);
}

export async function resetTenantUserPassword(
  tenantId: string,
  userId: string,
  payload: { newPassword: string; forcePasswordChange?: boolean },
) {
  return usersAPI.resetPassword(userId, payload, tenantId);
}

export async function assignTenantUserRole(tenantId: string, userId: string, roleId: string) {
  return rolesAPI.assignUser(roleId, userId, tenantId);
}

export async function removeTenantUserRole(tenantId: string, userId: string, roleId: string) {
  return rolesAPI.removeUser(roleId, userId, tenantId);
}

export async function updateTenantRolePermissions(tenantId: string, roleId: string, permissionCodes: string[]) {
  return rolesAPI.updatePermissions(roleId, permissionCodes, tenantId);
}
