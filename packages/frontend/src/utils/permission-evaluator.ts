export interface PermissionContext {
  rawPermissions: string[];
  normalizedPermissionSet: Set<string>;
  isSuperAdmin: boolean;
}

export interface PermissionEvaluation {
  allowed: boolean;
  requested: string;
  canonicalRequested: string;
  reason: string;
  matchedPermission?: string;
}

const LEGACY_PERMISSION_ALIASES: Record<string, string> = {
  manage_system: 'admin.system.manage',
  manage_users: 'admin.users.manage',
  view_users: 'admin.users.view',
  manage_roles: 'admin.roles.manage',
  view_dashboard: 'banking.dashboard.view',
  view_analytics: 'banking.analytics.view',
  view_loans: 'banking.portfolio.loans.view',
  manage_loans: 'banking.portfolio.loans.manage',
  view_ifrs9_reports: 'banking.reports.ifrs9.view',
  manage_ifrs9_config: 'banking.configuration.ifrs9.manage',
  view_collective_impairment: 'banking.collective.view',
  view_individual_impairment: 'banking.individual.view',
  view_ifrs9_processing: 'banking.processing.view',
  view_r_analytics: 'banking.analytics.r.view',
  super_admin: 'admin.super_admin',
  approve_requests: 'approval.requests.approve',
};

const ACTION_SUFFIXES = new Set([
  'view',
  'create',
  'update',
  'delete',
  'manage',
  'access',
  'approve',
  'reject',
  'export',
  'import',
  'run',
  'execute',
]);

export const normalizePermissionInput = (value: string): string =>
  value.trim().replace(/:/g, '.').replace(/\s+/g, '_').toLowerCase();

const normalizeLegacyKey = (value: string): string =>
  normalizePermissionInput(value).replace(/\./g, '_');

export const toCanonicalPermission = (value: string): string => {
  const normalized = normalizePermissionInput(value);
  return LEGACY_PERMISSION_ALIASES[normalizeLegacyKey(normalized)] || normalized;
};

export const buildPermissionContext = (permissions: string[]): PermissionContext => {
  const rawPermissions = (permissions || []).filter((item): item is string => typeof item === 'string');
  const normalizedPermissionSet = new Set<string>();

  for (const permission of rawPermissions) {
    normalizedPermissionSet.add(toCanonicalPermission(permission));
    normalizedPermissionSet.add(normalizePermissionInput(permission));
  }

  const isSuperAdmin =
    normalizedPermissionSet.has('*') ||
    normalizedPermissionSet.has('admin.super_admin') ||
    normalizedPermissionSet.has('super_admin') ||
    normalizedPermissionSet.has('platform_admin');

  return { rawPermissions, normalizedPermissionSet, isSuperAdmin };
};

const getContext = (contextOrPermissions: PermissionContext | string[]): PermissionContext =>
  Array.isArray(contextOrPermissions)
    ? buildPermissionContext(contextOrPermissions)
    : contextOrPermissions;

export const evaluatePermission = (
  requestedPermission: string,
  contextOrPermissions: PermissionContext | string[]
): PermissionEvaluation => {
  const context = getContext(contextOrPermissions);
  const requested = requestedPermission || '';
  const canonicalRequested = toCanonicalPermission(requested);

  if (!requested) {
    return {
      allowed: false,
      requested,
      canonicalRequested,
      reason: 'empty_permission',
    };
  }

  if (context.isSuperAdmin) {
    return {
      allowed: true,
      requested,
      canonicalRequested,
      reason: 'super_admin_bypass',
      matchedPermission: 'admin.super_admin',
    };
  }

  if (
    context.normalizedPermissionSet.has(canonicalRequested) ||
    context.normalizedPermissionSet.has(normalizePermissionInput(requested))
  ) {
    return {
      allowed: true,
      requested,
      canonicalRequested,
      reason: 'exact_match',
      matchedPermission: canonicalRequested,
    };
  }

  const requestedParts = canonicalRequested.split('.');
  const requestedAction = requestedParts[requestedParts.length - 1];
  const hasAction = ACTION_SUFFIXES.has(requestedAction);
  const requestedBase = hasAction ? requestedParts.slice(0, -1).join('.') : canonicalRequested;

  for (const candidate of [`${requestedBase}.manage`, `${requestedBase}.access`]) {
    if (context.normalizedPermissionSet.has(candidate)) {
      return {
        allowed: true,
        requested,
        canonicalRequested,
        reason: 'base_manage_access_match',
        matchedPermission: candidate,
      };
    }
  }

  if (!hasAction) {
    for (const candidate of [`${canonicalRequested}.view`, `${canonicalRequested}.manage`, `${canonicalRequested}.access`]) {
      if (context.normalizedPermissionSet.has(candidate)) {
        return {
          allowed: true,
          requested,
          canonicalRequested,
          reason: 'module_action_variant_match',
          matchedPermission: candidate,
        };
      }
    }
  }

  for (const userPermission of context.normalizedPermissionSet) {
    if (userPermission.endsWith('.*')) {
      const prefix = userPermission.slice(0, -2);
      if (canonicalRequested === prefix || canonicalRequested.startsWith(`${prefix}.`)) {
        return {
          allowed: true,
          requested,
          canonicalRequested,
          reason: 'wildcard_match',
          matchedPermission: userPermission,
        };
      }
    }

    if (userPermission.startsWith(`${canonicalRequested}.`)) {
      return {
        allowed: true,
        requested,
        canonicalRequested,
        reason: 'child_permission_implies_parent',
        matchedPermission: userPermission,
      };
    }

    const userPermissionTail = userPermission.split('.').at(-1) || '';
    if (
      canonicalRequested.startsWith(`${userPermission}.`) &&
      !ACTION_SUFFIXES.has(userPermissionTail)
    ) {
      return {
        allowed: true,
        requested,
        canonicalRequested,
        reason: 'parent_permission_implies_child',
        matchedPermission: userPermission,
      };
    }
  }

  return {
    allowed: false,
    requested,
    canonicalRequested,
    reason: 'no_matching_permission',
  };
};

export const checkPermission = (
  requestedPermission: string,
  contextOrPermissions: PermissionContext | string[]
): boolean => evaluatePermission(requestedPermission, contextOrPermissions).allowed;

export const checkAnyPermission = (
  requestedPermissions: string[],
  contextOrPermissions: PermissionContext | string[]
): boolean => requestedPermissions.some((code) => checkPermission(code, contextOrPermissions));

export const checkAllPermissions = (
  requestedPermissions: string[],
  contextOrPermissions: PermissionContext | string[]
): boolean => requestedPermissions.every((code) => checkPermission(code, contextOrPermissions));
