'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { invalidateBusinessFeature } from '@/features/shared/query/query-invalidation';
import {
  assignPlatformRbacUserRole,
  checkPlatformRbacPermission,
  fetchPlatformRbacRoleDetail,
  fetchPlatformRbacTenantData,
  fetchPlatformRbacUserRoles,
  removePlatformRbacUserRole,
  savePlatformRbacRolePermissions,
} from '../api/platform-rbac.api';

const extractCollection = <T,>(payload: unknown, keys: string[] = []): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const root = payload as Record<string, unknown>;
  for (const key of keys) {
    if (Array.isArray(root[key])) return root[key] as T[];
  }

  if (Array.isArray(root.data)) return root.data as T[];
  if (root.data && typeof root.data === 'object') {
    const nested = root.data as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(nested[key])) return nested[key] as T[];
    }
    if (Array.isArray(nested.data)) return nested.data as T[];
  }

  return [];
};

const normalizeRole = (role: any) => ({
  id: String(role?.id || role?.roleId || ''),
  roleName: String(role?.roleName || role?.roleCode || role?.name || 'Unnamed Role'),
  roleCode: role?.roleCode ? String(role.roleCode) : undefined,
  description: role?.description ? String(role.description) : null,
  isActive: typeof role?.isActive === 'boolean' ? role.isActive : true,
});

const normalizeUser = (user: any) => ({
  id: String(user?.id || ''),
  fullName: String(user?.fullName || user?.name || user?.email || 'Unknown User'),
  email: String(user?.email || ''),
  username: String(user?.username || user?.email?.split('@')?.[0] || ''),
  isActive: typeof user?.isActive === 'boolean' ? user.isActive : true,
});

const normalizePermission = (permission: any) => ({
  id: String(permission?.id || ''),
  code: String(permission?.code || permission?.id || ''),
  name: String(permission?.name || permission?.displayName || permission?.code || 'Unnamed Permission'),
  category: permission?.category ? String(permission.category) : undefined,
  module: permission?.module ? String(permission.module) : undefined,
  resource: permission?.resource ? String(permission.resource) : undefined,
  action: permission?.action ? String(permission.action) : undefined,
});

const extractRolePermissionCodes = (rolePayload: any): string[] => {
  const grouped = rolePayload?.permissions;
  if (!grouped || typeof grouped !== 'object') return [];

  const values = Object.values(grouped as Record<string, unknown>);
  const codes = values.flatMap((entry) => {
    if (!Array.isArray(entry)) return [];
    return entry
      .map((item: any) => item?.code || item?.id)
      .filter((code: unknown): code is string => typeof code === 'string' && code.length > 0);
  });

  return Array.from(new Set(codes));
};

export function usePlatformRbacTenantDataQuery(tenantId: string | null, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('platform-rbac-tenant-data', { tenantId }),
    queryFn: async () => {
      const responses = await fetchPlatformRbacTenantData(tenantId || '');
      const roles = extractCollection<any>(responses.rolesResponse, ['roles'])
        .map(normalizeRole)
        .filter((role) => role.id);
      const permissions = extractCollection<any>(responses.permissionsResponse, ['permissions'])
        .map(normalizePermission)
        .filter((permission) => permission.code);
      const users = extractCollection<any>(responses.usersResponse, ['users'])
        .map(normalizeUser)
        .filter((user) => user.id);

      const roleDetails = await Promise.allSettled(
        roles.map(async (role) => {
          const detail = await fetchPlatformRbacRoleDetail(tenantId || '', role.id);
          const payload = (detail as any)?.data ?? detail;
          return { roleId: role.id, codes: extractRolePermissionCodes(payload) };
        }),
      );

      const rolePermissionMap: Record<string, string[]> = {};
      roleDetails.forEach((result, index) => {
        const fallbackId = roles[index]?.id;
        if (!fallbackId) return;
        if (result.status === 'fulfilled') {
          rolePermissionMap[result.value.roleId] = result.value.codes;
        } else {
          rolePermissionMap[fallbackId] = [];
        }
      });

      const userRoleResults = await Promise.allSettled(
        users.map(async (user) => {
          const response = await fetchPlatformRbacUserRoles(tenantId || '', user.id);
          const assignedRoles = extractCollection<any>(response, ['roles'])
            .map((entry) => normalizeRole(entry?.role || entry))
            .filter((role) => role.id)
            .map((role) => role.id);
          return { userId: user.id, roleIds: assignedRoles };
        }),
      );

      const userRoleMap: Record<string, string[]> = {};
      userRoleResults.forEach((result, index) => {
        const fallbackUserId = users[index]?.id;
        if (!fallbackUserId) return;
        if (result.status === 'fulfilled') {
          userRoleMap[result.value.userId] = result.value.roleIds;
        } else {
          userRoleMap[fallbackUserId] = [];
        }
      });

      return { roles, permissions, users, rolePermissionMap, userRoleMap };
    },
    enabled: enabled && Boolean(tenantId),
  });
}

export function usePlatformRbacPermissionCheckQuery(
  tenantId: string | null,
  userId: string | null,
  input: { resource?: string; action?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: businessQueryKeys.detail('platform-rbac-permission-check', userId || 'none', {
      tenantId,
      resource: input.resource,
      action: input.action,
    }),
    queryFn: async () => {
      const response = await checkPlatformRbacPermission(tenantId || '', userId || '', {
        resource: input.resource || '',
        action: input.action || '',
      });
      const result = (response as any)?.data ?? response;
      return Boolean(result?.hasPermission);
    },
    enabled: enabled && Boolean(tenantId) && Boolean(userId) && Boolean(input.resource) && Boolean(input.action),
  });
}

function usePlatformRbacInvalidatingMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await invalidateBusinessFeature(queryClient, 'platform-rbac-tenant-data');
    },
  });
}

export function useSavePlatformRbacPermissionsMutation() {
  return usePlatformRbacInvalidatingMutation<{
    tenantId: string;
    roleId: string;
    permissionCodes: string[];
    options?: { submitForApproval?: boolean; approvalReason?: string };
  }>(({ tenantId, roleId, permissionCodes, options }) =>
    savePlatformRbacRolePermissions(tenantId, roleId, permissionCodes, options),
  );
}

export function useSavePlatformRbacAssignmentsMutation() {
  return usePlatformRbacInvalidatingMutation<{
    tenantId: string;
    userId: string;
    initialRoleIds: string[];
    currentRoleIds: string[];
  }>(async ({ tenantId, userId, initialRoleIds, currentRoleIds }) => {
    const toAssign = currentRoleIds.filter((roleId) => !initialRoleIds.includes(roleId));
    const toRemove = initialRoleIds.filter((roleId) => !currentRoleIds.includes(roleId));

    await Promise.allSettled([
      ...toAssign.map((roleId) => assignPlatformRbacUserRole(tenantId, roleId, userId)),
      ...toRemove.map((roleId) => removePlatformRbacUserRole(tenantId, roleId, userId)),
    ]);

    return { success: true };
  });
}
