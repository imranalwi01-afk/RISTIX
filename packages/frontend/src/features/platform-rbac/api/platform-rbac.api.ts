import { rolesAPI, usersAPI } from '@/services/api';

export async function fetchPlatformRbacTenantData(tenantId: string) {
  const [rolesResponse, permissionsResponse, usersResponse] = await Promise.all([
    rolesAPI.getAll({ page: 1, limit: 200 }, tenantId),
    rolesAPI.getPermissions(tenantId),
    usersAPI.getAll({ page: 1, limit: 200 }, tenantId),
  ]);

  return {
    rolesResponse,
    permissionsResponse,
    usersResponse,
  };
}

export async function fetchPlatformRbacRoleDetail(tenantId: string, roleId: string) {
  return rolesAPI.getById(roleId, tenantId);
}

export async function fetchPlatformRbacUserRoles(tenantId: string, userId: string) {
  return rolesAPI.getUserRoles(userId, tenantId);
}

export async function checkPlatformRbacPermission(
  tenantId: string,
  userId: string,
  input: { resource: string; action: string },
) {
  return rolesAPI.checkUserPermission(userId, input, tenantId);
}

export async function savePlatformRbacRolePermissions(
  tenantId: string,
  roleId: string,
  permissionCodes: string[],
  options?: { submitForApproval?: boolean; approvalReason?: string },
) {
  return rolesAPI.updatePermissions(roleId, permissionCodes, tenantId, options);
}

export async function assignPlatformRbacUserRole(tenantId: string, roleId: string, userId: string) {
  return rolesAPI.assignUser(roleId, userId, tenantId);
}

export async function removePlatformRbacUserRole(tenantId: string, roleId: string, userId: string) {
  return rolesAPI.removeUser(roleId, userId, tenantId);
}
