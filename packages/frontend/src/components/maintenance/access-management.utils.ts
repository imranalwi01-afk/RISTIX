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

export interface PermissionSelectionSection {
  key: string;
  label: string;
  hint: string;
  permissions: AccessManagementPermission[];
}

const SIDEBAR_CATEGORY_LABELS: Record<string, string> = {
  'banking.dashboard': 'Dashboard',
  'banking.setup': 'System Setup',
  'banking.parameter': 'Parameter Management',
  'banking.collective': 'Collective Impairment',
  'banking.individual': 'Individual Impairment',
  'banking.processing': 'IFRS 9',
  'banking.reports': 'IFRS 9 Reports',
  'banking.reports.ifrs9': 'IFRS 9 Reports',
  'banking.analytics': 'Advanced Analytics',
  'approval': 'Workflow Management',
  'approval.requests': 'Workflow Management',
  'banking.configuration': 'Tools',
  'admin.maintenance': 'Admin & Maintenance',
  'admin.roles': 'Admin & Maintenance',
  'admin.users': 'Admin & Maintenance',
  'admin.system': 'Admin & Maintenance',
  'jobs': 'Admin & Maintenance',
};

const SIDEBAR_GROUP_LABELS: Record<string, { label: string; breadcrumb: string }> = {
  'banking.dashboard': {
    label: 'Dashboard',
    breadcrumb: 'Dashboard',
  },
  'banking.setup.application': {
    label: 'Application Configuration',
    breadcrumb: 'System Setup > Application Configuration',
  },
  'banking.setup.business': {
    label: 'Business Configuration',
    breadcrumb: 'System Setup > Business Configuration',
  },
  'banking.parameter.product': {
    label: 'Product Parameters',
    breadcrumb: 'Parameter Management > Product Parameters',
  },
  'banking.parameter.journal': {
    label: 'Accounting Parameters',
    breadcrumb: 'Parameter Management > Accounting Parameters',
  },
  'banking.parameter.segmentation': {
    label: 'Segmentation Configuration',
    breadcrumb: 'Collective Impairment > Segmentation Configuration',
  },
  'banking.collective': {
    label: 'Collective Impairment',
    breadcrumb: 'Collective Impairment',
  },
  'banking.collective.rule_base': {
    label: 'Rule Base Setting',
    breadcrumb: 'Collective Impairment > Rule Base Setting',
  },
  'banking.collective.bucket': {
    label: 'Bucket Parameter',
    breadcrumb: 'Collective Impairment > Bucket Parameter',
  },
  'banking.collective.pd': {
    label: 'PD Setup Management',
    breadcrumb: 'Collective Impairment > PD Setup Management',
  },
  'banking.collective.fl': {
    label: 'FL Scalar',
    breadcrumb: 'Collective Impairment > FL Scalar',
  },
  'banking.collective.fl_scalar': {
    label: 'FL Scalar',
    breadcrumb: 'Collective Impairment > FL Scalar',
  },
  'banking.collective.lgd': {
    label: 'LGD Setup Management',
    breadcrumb: 'Collective Impairment > LGD Setup Management',
  },
  'banking.collective.ead': {
    label: 'EAD Setup Management',
    breadcrumb: 'Collective Impairment > EAD Setup Management',
  },
  'banking.collective.ecl': {
    label: 'ECL Configuration',
    breadcrumb: 'Collective Impairment > ECL Configuration',
  },
  'banking.individual': {
    label: 'Individual Impairment',
    breadcrumb: 'Individual Impairment',
  },
  'banking.individual.assessment': {
    label: 'Assessment Workspace',
    breadcrumb: 'Individual Impairment > Assessment Workspace',
  },
  'banking.reports.ifrs9.nominative': {
    label: 'Nominative Report',
    breadcrumb: 'IFRS 9 Reports > Nominative Report',
  },
  'banking.reports.ifrs9.lifetime_pd': {
    label: 'Lifetime PD',
    breadcrumb: 'IFRS 9 Reports > Lifetime PD',
  },
  'banking.reports.ifrs9.lifetime_lgd': {
    label: 'Lifetime LGD',
    breadcrumb: 'IFRS 9 Reports > Lifetime LGD',
  },
  'banking.reports.ifrs9.ead_model': {
    label: 'EAD Model',
    breadcrumb: 'IFRS 9 Reports > EAD Model',
  },
  'banking.reports.ifrs9.ecl_result': {
    label: 'ECL Result',
    breadcrumb: 'IFRS 9 Reports > ECL Result',
  },
  'banking.reports.ifrs9.ecl_movement': {
    label: 'ECL Movement',
    breadcrumb: 'IFRS 9 Reports > ECL Movement',
  },
  'banking.reports.ifrs9.gca_movement': {
    label: 'GCA Movement',
    breadcrumb: 'IFRS 9 Reports > GCA Movement',
  },
  'banking.analytics.r': {
    label: 'R Analytics',
    breadcrumb: 'Advanced Analytics > R Analytics',
  },
  'approval.requests': {
    label: 'Approval System',
    breadcrumb: 'Workflow Management > Approval System',
  },
  'notifications': {
    label: 'Notifications',
    breadcrumb: 'Workflow Management > Notifications',
  },
  'banking.configuration.ifrs9': {
    label: 'Tools',
    breadcrumb: 'Tools',
  },
  'admin.maintenance.access': {
    label: 'Access Management',
    breadcrumb: 'Admin & Maintenance > Access Management',
  },
  'admin.users': {
    label: 'User Management',
    breadcrumb: 'Admin & Maintenance > User Management',
  },
  'admin.roles': {
    label: 'Role Management',
    breadcrumb: 'Admin & Maintenance > Role Management',
  },
  'admin.system': {
    label: 'System Administration',
    breadcrumb: 'Admin & Maintenance > System Administration',
  },
  'jobs': {
    label: 'Job Monitoring',
    breadcrumb: 'Admin & Maintenance > Job Monitoring',
  },
};

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

const getMappedLabel = (key: string, mapping: Record<string, string>): string | undefined => {
  const normalizedKey = key.trim().toLowerCase();
  const sortedEntries = Object.entries(mapping).sort((left, right) => right[0].length - left[0].length);

  for (const [prefix, label] of sortedEntries) {
    if (normalizedKey === prefix || normalizedKey.startsWith(`${prefix}.`)) {
      return label;
    }
  }

  return undefined;
};

export const getPermissionCategoryDisplayLabel = (key: string): string =>
  getMappedLabel(key, SIDEBAR_CATEGORY_LABELS) || toDisplayLabel(key);

export const getPermissionGroupDisplayLabel = (
  key: string,
  variant: 'leaf' | 'breadcrumb' = 'leaf'
): string => {
  const normalizedKey = key.trim().toLowerCase();
  const mapped = SIDEBAR_GROUP_LABELS[normalizedKey];
  if (mapped) {
    return variant === 'breadcrumb' ? mapped.breadcrumb : mapped.label;
  }

  return toDisplayLabel(key);
};

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
      label = getPermissionGroupDisplayLabel(matrixItem.groupKey, 'breadcrumb');
      hint = getPermissionCategoryDisplayLabel(matrixItem.categoryKey || moduleKey);
    } else if (permissionGroupingMode === 'module') {
      key = moduleKey;
      label = getPermissionCategoryDisplayLabel(moduleKey);
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

export const buildPermissionSelectionSections = (
  permissions: AccessManagementPermission[]
): PermissionSelectionSection[] => {
  const sections = new Map<string, PermissionSelectionSection>();

  permissions.forEach((permission) => {
    const matrixItem = buildPermissionMatrixItem(permission);

    if (!sections.has(matrixItem.groupKey)) {
      sections.set(matrixItem.groupKey, {
        key: matrixItem.groupKey,
        label: getPermissionGroupDisplayLabel(matrixItem.groupKey, 'breadcrumb'),
        hint: `${permissions.length} permissions`,
        permissions: [],
      });
    }

    sections.get(matrixItem.groupKey)!.permissions.push(permission);
  });

  return Array.from(sections.values())
    .map((section) => ({
      ...section,
      hint: `${section.permissions.length} permissions`,
      permissions: [...section.permissions].sort((left, right) =>
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
