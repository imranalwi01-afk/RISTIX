import { api } from '@/services/api';

export interface AccessManagementFilters {
  searchTerm?: string;
  type?: string;
  level?: string;
  isActive?: boolean;
}

export async function fetchAccessManagementRoles(filters: AccessManagementFilters) {
  const params: Record<string, unknown> = { includeInactive: true };
  if (filters.searchTerm) params.search = filters.searchTerm;
  if (filters.type && filters.type !== 'all') params.type = filters.type;
  if (filters.level && filters.level !== 'all') params.level = filters.level;
  if (typeof filters.isActive === 'boolean') params.isActive = filters.isActive;

  const [rolesResponse, permissionsResponse] = await Promise.all([
    api.roles.getAll(params),
    api.roles.getPermissions(),
  ]);

  return {
    rolesResponse,
    permissionsResponse,
  };
}

export async function createAccessRole(input: Record<string, unknown>) {
  return api.roles.create(input as any);
}

export async function updateAccessRole(roleId: string, input: Record<string, unknown>) {
  return api.roles.update(roleId, input as any);
}

export async function toggleAccessRole(roleId: string) {
  return api.roles.toggle(roleId);
}

export async function deleteAccessRole(roleId: string) {
  return api.roles.delete(roleId);
}

export async function updateAccessRolePermissions(roleId: string, permissions: string[]) {
  return api.roles.updatePermissions(roleId, permissions);
}
