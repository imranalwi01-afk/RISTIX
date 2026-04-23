'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { businessQueryKeys } from '@/features/shared/query/query-keys';
import { invalidateBusinessFeature } from '@/features/shared/query/query-invalidation';
import {
  assignTenantUserRole,
  createTenantUser,
  deleteTenantUser,
  fetchTenantPermissions,
  fetchTenantRoleDetail,
  fetchTenantRoles,
  fetchTenantUserRoles,
  fetchTenantUsers,
  removeTenantUserRole,
  resetTenantUserPassword,
  toggleTenantUser,
  updateTenantRolePermissions,
  updateTenantUser,
  type TenantUsersListParams,
} from '../api/tenant-user-management.api';

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

const countRolePermissions = (role: any): number => {
  if (Array.isArray(role?.rolePermissions)) return role.rolePermissions.length;
  if (role?.permissions && typeof role.permissions === 'object') {
    const groupedPermissions = Object.values(role.permissions as Record<string, unknown>);
    return groupedPermissions.reduce<number>((acc, value) => {
      if (Array.isArray(value)) return acc + value.length;
      return acc;
    }, 0);
  }
  return 0;
};

const normalizeRole = (role: any) => ({
  id: String(role?.id || role?.roleId || ''),
  roleName: String(role?.roleName || role?.roleCode || role?.name || 'Unnamed Role'),
  roleCode: role?.roleCode ? String(role.roleCode) : undefined,
  description: role?.description ? String(role.description) : null,
  isActive: typeof role?.isActive === 'boolean' ? role.isActive : true,
  hierarchyLevel: typeof role?.hierarchyLevel === 'number' ? role.hierarchyLevel : undefined,
  permissionCount: countRolePermissions(role),
});

const normalizePermission = (permission: any) => ({
  id: String(permission?.id || ''),
  code: String(permission?.code || permission?.id || ''),
  name: String(permission?.name || permission?.displayName || permission?.code || 'Unnamed Permission'),
  module: permission?.module ? String(permission.module) : undefined,
  resource: permission?.resource ? String(permission.resource) : undefined,
  action: permission?.action ? String(permission.action) : undefined,
  category: permission?.category ? String(permission.category) : undefined,
  isActive: typeof permission?.isActive === 'boolean' ? permission.isActive : true,
});

export function useTenantUsersQuery(params: TenantUsersListParams, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('tenant-users', params),
    queryFn: async () => {
      const response = await fetchTenantUsers(params);
      const responseData = (response as any)?.data;
      const users = Array.isArray(responseData?.users)
        ? responseData.users
        : Array.isArray(responseData)
          ? responseData
          : [];
      const totalRaw = (response as any)?.pagination?.total ?? (response as any)?.total ?? responseData?.total ?? users.length;
      const userRolesResults = await Promise.allSettled(
        users.map(async (user: any) => {
          const roleResponse = await fetchTenantUserRoles(params.tenantId, String(user.id));
          const roles = extractCollection<any>(roleResponse, ['roles']).map((entry) => normalizeRole(entry?.role || entry));
          return { userId: String(user.id), roles };
        }),
      );

      const userRolesMap: Record<string, any[]> = {};
      userRolesResults.forEach((result, index) => {
        const fallbackUserId = String(users[index]?.id || '');
        if (!fallbackUserId) return;
        if (result.status === 'fulfilled') {
          userRolesMap[result.value.userId] = result.value.roles;
        } else {
          userRolesMap[fallbackUserId] = [];
        }
      });

      return {
        users,
        total: Number.isFinite(Number(totalRaw)) ? Number(totalRaw) : users.length,
        userRolesMap,
      };
    },
    enabled,
  });
}

export function useTenantRoleCatalogQuery(tenantId: string | null, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('tenant-role-catalog', { tenantId }),
    queryFn: async () => {
      const response = await fetchTenantRoles(tenantId || '');
      return extractCollection<any>(response, ['roles', 'data'])
        .map(normalizeRole)
        .filter((role) => role.id);
    },
    enabled: enabled && Boolean(tenantId),
  });
}

export function useTenantPermissionsCatalogQuery(tenantId: string | null, enabled = true) {
  return useQuery({
    queryKey: businessQueryKeys.list('tenant-permissions-catalog', { tenantId }),
    queryFn: async () => {
      const response = await fetchTenantPermissions(tenantId || '');
      return extractCollection<any>(response, ['permissions', 'data'])
        .map(normalizePermission)
        .filter((permission) => permission.id && permission.code);
    },
    enabled: enabled && Boolean(tenantId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTenantRolePermissionCodesQuery(
  tenantId: string | null,
  roleId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey: businessQueryKeys.detail('tenant-role-permission-codes', roleId || 'none', { tenantId }),
    queryFn: async () => {
      const roleResponse = await fetchTenantRoleDetail(tenantId || '', roleId || '');
      const rolePayload = (roleResponse as any)?.data ?? roleResponse;
      const groupedPermissions = rolePayload?.permissions;
      const selected = new Set<string>();

      if (groupedPermissions && typeof groupedPermissions === 'object') {
        Object.values(groupedPermissions as Record<string, unknown>).forEach((value) => {
          if (Array.isArray(value)) {
            value.forEach((item: any) => {
              const key = item?.code || item?.id;
              if (typeof key === 'string' && key.length > 0) selected.add(key);
            });
          }
        });
      }

      return Array.from(selected);
    },
    enabled: enabled && Boolean(tenantId) && Boolean(roleId),
  });
}

function useTenantUsersInvalidatingMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await Promise.all([
        invalidateBusinessFeature(queryClient, 'tenant-users'),
        invalidateBusinessFeature(queryClient, 'tenant-role-catalog'),
        invalidateBusinessFeature(queryClient, 'tenant-role-permission-codes'),
      ]);
    },
  });
}

export function useCreateTenantUserMutation() {
  return useTenantUsersInvalidatingMutation<{ tenantId: string; input: Record<string, unknown> }>(({ tenantId, input }) =>
    createTenantUser(tenantId, input),
  );
}

export function useUpdateTenantUserMutation() {
  return useTenantUsersInvalidatingMutation<{ tenantId: string; userId: string; input: Record<string, unknown> }>(
    ({ tenantId, userId, input }) => updateTenantUser(tenantId, userId, input),
  );
}

export function useDeleteTenantUserMutation() {
  return useTenantUsersInvalidatingMutation<{ tenantId: string; userId: string }>(({ tenantId, userId }) =>
    deleteTenantUser(tenantId, userId),
  );
}

export function useToggleTenantUserMutation() {
  return useTenantUsersInvalidatingMutation<{ tenantId: string; userId: string; isActive: boolean }>(
    ({ tenantId, userId, isActive }) => toggleTenantUser(tenantId, userId, isActive),
  );
}

export function useResetTenantUserPasswordMutation() {
  return useTenantUsersInvalidatingMutation<{
    tenantId: string;
    userId: string;
    payload: { newPassword: string; forcePasswordChange?: boolean };
  }>(({ tenantId, userId, payload }) => resetTenantUserPassword(tenantId, userId, payload));
}

export function useSaveTenantUserRolesMutation() {
  return useTenantUsersInvalidatingMutation<{
    tenantId: string;
    userId: string;
    initialRoleIds: string[];
    selectedRoleIds: string[];
  }>(async ({ tenantId, userId, initialRoleIds, selectedRoleIds }) => {
    const toAssign = selectedRoleIds.filter((roleId) => !initialRoleIds.includes(roleId));
    const toRemove = initialRoleIds.filter((roleId) => !selectedRoleIds.includes(roleId));

    await Promise.allSettled([
      ...toAssign.map((roleId) => assignTenantUserRole(tenantId, userId, roleId)),
      ...toRemove.map((roleId) => removeTenantUserRole(tenantId, userId, roleId)),
    ]);

    return { success: true };
  });
}

export function useSaveTenantRolePermissionsMutation() {
  return useTenantUsersInvalidatingMutation<{ tenantId: string; roleId: string; permissionCodes: string[] }>(
    ({ tenantId, roleId, permissionCodes }) => updateTenantRolePermissions(tenantId, roleId, permissionCodes),
  );
}
