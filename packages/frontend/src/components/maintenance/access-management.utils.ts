export interface AccessManagementPermission {
  id: string;
  code?: string;
  module: string;
  resource: string;
  action: string;
  displayName: string;
  description: string;
  category: 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  requiredApprovalLevel?: number | null;
  requiredApprovers?: number;
  bankingSpecific?: boolean;
  syariahRequired?: boolean;
}

export interface AccessManagementRole {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  bankingAccess?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  isActive: boolean;
  isBuiltIn: boolean;
  permissions: AccessManagementPermission[];
  assignedUsers: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PermissionMatrixItem {
  permission: AccessManagementPermission;
  fullKey: string;
  categoryKey: string;
  groupKey: string;
  actionKey: string;
}

export type PermissionGroupingMode = 'resource' | 'module' | 'category';

export interface PermissionSelectionGroup {
  key: string;
  label: string;
  hint: string;
  permissions: AccessManagementPermission[];
}

const ACTION_KEYWORDS = new Set([
  'view',
  'create',
  'update',
  'edit',
  'delete',
  'manage',
  'approve',
  'reject',
  'assign',
  'export',
  'import',
  'run',
  'execute',
  'submit',
  'read',
  'write'
]);

const RESOURCE_GROUP_ALIASES: Record<string, string> = {
  'banking.application_config': 'banking.setup.application',
  'banking.business_config': 'banking.setup.business',
  'banking.product_params': 'banking.parameter.product',
  'banking.accounting_params': 'banking.parameter.journal',
};

export const toKeySegments = (value?: string): string[] =>
  (value || '')
    .toLowerCase()
    .replace(/[:]/g, '.')
    .split(/[.\s/_-]+/)
    .filter(Boolean);

export const toDisplayLabel = (key: string): string =>
  key
    .split('.')
    .map(part => {
      if (part === 'ifrs9') return 'IFRS9';
      if (part.length <= 3) return part.toUpperCase();
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join(' / ');

const firstNonEmptyString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return undefined;
};

export const flattenPermissionsFromApi = (
  groupedPermissions: Record<string, AccessManagementPermission[]>
): AccessManagementPermission[] => Object.values(groupedPermissions || {}).flat();

export const buildPermissionMatrixItem = (
  permission: AccessManagementPermission
): PermissionMatrixItem => {
  const code = permission.code?.trim().toLowerCase();
  const codeSegments = code ? code.replace(/[:]/g, '.').split('.').filter(Boolean) : [];
  const moduleSegment = toKeySegments(permission.module)[0] || 'banking';
  const aliasKey = `${moduleSegment}.${permission.resource.toLowerCase()}`;
  const actionSegment = permission.action.toLowerCase();

  if (codeSegments.length >= 3) {
    const hasAction = ACTION_KEYWORDS.has(codeSegments[codeSegments.length - 1]);
    const groupSegments = hasAction ? codeSegments.slice(0, -1) : codeSegments;
    const categorySegments = groupSegments.length >= 2 ? groupSegments.slice(0, 2) : groupSegments;
    const finalAction = hasAction ? codeSegments[codeSegments.length - 1] : 'access';
    return {
      permission,
      fullKey: codeSegments.join('.'),
      categoryKey: categorySegments.join('.'),
      groupKey: groupSegments.join('.'),
      actionKey: finalAction,
    };
  }

  const groupKey = RESOURCE_GROUP_ALIASES[aliasKey]
    || [moduleSegment, ...toKeySegments(permission.resource)].join('.');
  const categorySegments = groupKey.split('.').filter(Boolean).slice(0, 2);

  return {
    permission,
    fullKey: `${groupKey}.${actionSegment}`,
    categoryKey: categorySegments.join('.'),
    groupKey,
    actionKey: actionSegment,
  };
};

export const getPermissionCanonicalKey = (permission: AccessManagementPermission): string =>
  buildPermissionMatrixItem(permission).fullKey;

export const buildPermissionSelectionGroups = (
  permissions: AccessManagementPermission[],
  permissionGroupingMode: PermissionGroupingMode
): PermissionSelectionGroup[] => {
  const groups = new Map<string, PermissionSelectionGroup>();
  const moduleCounts = new Map<string, number>();

  permissions.forEach((permission) => {
    const matrixItem = buildPermissionMatrixItem(permission);
    const moduleKey = toKeySegments(permission.module)[0]
      || matrixItem.categoryKey.split('.').filter(Boolean)[0]
      || 'general';
    moduleCounts.set(moduleKey, (moduleCounts.get(moduleKey) || 0) + 1);
  });

  permissions.forEach((permission) => {
    const matrixItem = buildPermissionMatrixItem(permission);
    const moduleKey = toKeySegments(permission.module)[0]
      || matrixItem.categoryKey.split('.').filter(Boolean)[0]
      || 'general';

    let key: string = permission.category;
    let label: string = permission.category.replace(/_/g, ' ');
    let hint: string = 'Legacy category';

    if (permissionGroupingMode === 'resource') {
      key = matrixItem.groupKey;
      label = toDisplayLabel(matrixItem.groupKey);
      hint = toDisplayLabel(matrixItem.categoryKey || moduleKey);
    } else if (permissionGroupingMode === 'module') {
      key = moduleKey;
      label = toDisplayLabel(moduleKey);
      hint = `${moduleCounts.get(moduleKey) || 0} permissions`;
    }

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        label,
        hint,
        permissions: [],
      });
    }

    groups.get(key)!.permissions.push(permission);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      permissions: [...group.permissions].sort((left, right) =>
        getPermissionCanonicalKey(left).localeCompare(getPermissionCanonicalKey(right))
      ),
    }))
    .sort((left, right) => left.label.localeCompare(right.label));
};

export const normalizePermissionFromApi = (perm: Record<string, unknown>): AccessManagementPermission => ({
  id: String(perm.id ?? ''),
  code: typeof perm.code === 'string' ? perm.code : undefined,
  module: firstNonEmptyString(perm.module) ?? 'core',
  resource: String(perm.resource ?? ''),
  action: String(perm.action ?? ''),
  displayName: firstNonEmptyString(perm.displayName, perm.display_name, perm.name)
    ?? `${String(perm.resource ?? '')} ${String(perm.action ?? '')}`.trim(),
  description: firstNonEmptyString(perm.description) ?? '',
  category: (perm.category || 'CORE') as AccessManagementPermission['category'],
  riskLevel: (perm.riskLevel || 'LOW') as AccessManagementPermission['riskLevel'],
  requiresApproval: Boolean(perm.requiresApproval ?? false),
  requiredApprovalLevel:
    typeof perm.requiredApprovalLevel === 'number' ? perm.requiredApprovalLevel : null,
  requiredApprovers:
    typeof perm.requiredApprovers === 'number' ? perm.requiredApprovers : 1,
  bankingSpecific:
    typeof perm.bankingSpecific === 'boolean'
      ? perm.bankingSpecific
      : perm.module === 'banking',
  syariahRequired:
    typeof perm.syariahRequired === 'boolean' ? perm.syariahRequired : false,
});

export const normalizeRoleFromApi = (role: Record<string, unknown>): AccessManagementRole => {
  const displayName = firstNonEmptyString(
    role.displayName,
    role.display_name,
    role.roleName,
    role.role_name,
    role.name,
    role.roleCode,
    role.role_code
  ) ?? `Role ${String(role.id ?? 'unknown').slice(0, 8)}`;

  const name = firstNonEmptyString(
    role.name,
    role.roleCode,
    role.role_code,
    role.roleName,
    role.role_name,
    displayName
  ) ?? 'UNNAMED_ROLE';

  const type = (role.type ?? (role.isSystemRole ? 'SYSTEM' : 'CUSTOM')) as AccessManagementRole['type'];
  const level = (role.level ?? (role.hierarchyLevel ? 'TENANT' : 'TENANT')) as AccessManagementRole['level'];

  const bankingAccess = (role.bankingAccess
    ?? role.bankingTypeSpecific
    ?? role.supportsConventional
    ?? role.supportsSyariah
    ?? undefined) as AccessManagementRole['bankingAccess'] | undefined;
  const groupedPermissions =
    role.permissions && typeof role.permissions === 'object'
      ? role.permissions as Record<string, AccessManagementPermission[]>
      : {};

  return {
    id: String(role.id ?? ''),
    displayName,
    name,
    description: firstNonEmptyString(role.description) ?? '',
    type,
    level,
    bankingAccess,
    isActive: typeof role.isActive === 'boolean' ? role.isActive : true,
    isBuiltIn:
      typeof role.isBuiltIn === 'boolean'
        ? role.isBuiltIn
        : typeof role.isSystemRole === 'boolean'
          ? role.isSystemRole
          : false,
    assignedUsers: Number(role.assignedUsers ?? role.assigned_users ?? role.userCount ?? role.user_count ?? 0),
    createdBy: firstNonEmptyString(role.createdBy, role.created_by) ?? '',
    createdAt: String(role.createdAt ?? role.created_at ?? new Date().toISOString()),
    updatedAt:
      typeof role.updatedAt === 'string'
        ? role.updatedAt
        : typeof role.updated_at === 'string'
          ? role.updated_at
          : undefined,
    permissions: flattenPermissionsFromApi(groupedPermissions),
  };
};
