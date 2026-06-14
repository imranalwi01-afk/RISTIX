import {
  normalizePermissionFromApi,
  normalizeRoleFromApi,
} from '@/components/maintenance/access-management.utils';

const extractCollection = <T,>(payload: unknown, keys: string[] = []): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }

  if (Array.isArray(record.data)) return record.data as T[];

  const nestedData = record.data;
  if (nestedData && typeof nestedData === 'object') {
    const nestedRecord = nestedData as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(nestedRecord[key])) return nestedRecord[key] as T[];
    }
    if (Array.isArray(nestedRecord.data)) return nestedRecord.data as T[];
  }

  return [];
};

export function toAccessManagementData(payload: {
  rolesResponse: unknown;
  permissionsResponse: unknown;
}) {
  const roleRows = extractCollection<Record<string, unknown>>(payload.rolesResponse, ['roles']);
  const permissionRows = extractCollection<Record<string, unknown>>(payload.permissionsResponse, ['permissions']);

  return {
    roles: roleRows.map(normalizeRoleFromApi),
    permissions: permissionRows.map(normalizePermissionFromApi),
  };
}
