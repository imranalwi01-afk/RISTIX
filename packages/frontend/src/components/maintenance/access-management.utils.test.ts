import { describe, expect, test } from 'bun:test';
import {
  buildPermissionMatrixItem,
  buildPermissionSelectionGroups,
  buildPermissionSelectionSections,
  getPermissionCategoryDisplayLabel,
  getPermissionGroupDisplayLabel,
  getPermissionCanonicalKey,
  normalizePermissionFromApi,
  normalizeRoleFromApi,
  type AccessManagementPermission,
} from './access-management.utils';

const makePermission = (
  overrides: Partial<AccessManagementPermission> = {}
): AccessManagementPermission => ({
  id: overrides.id ?? 'perm-1',
  code: overrides.code,
  module: overrides.module ?? 'banking',
  resource: overrides.resource ?? 'application_config',
  action: overrides.action ?? 'view',
  displayName: overrides.displayName ?? 'View application config',
  description: overrides.description ?? '',
  category: overrides.category ?? 'BANKING',
  riskLevel: overrides.riskLevel ?? 'LOW',
  requiresApproval: overrides.requiresApproval ?? false,
  requiredApprovalLevel: overrides.requiredApprovalLevel ?? null,
  requiredApprovers: overrides.requiredApprovers ?? 1,
  bankingSpecific: overrides.bankingSpecific ?? true,
  syariahRequired: overrides.syariahRequired ?? false,
});

describe('access-management utils', () => {
  test('buildPermissionMatrixItem prefers dotted permission codes', () => {
    const item = buildPermissionMatrixItem(
      makePermission({
        code: 'banking.setup.application.create',
        action: 'create',
      })
    );

    expect(item.fullKey).toBe('banking.setup.application.create');
    expect(item.categoryKey).toBe('banking.setup');
    expect(item.groupKey).toBe('banking.setup.application');
    expect(item.actionKey).toBe('create');
  });

  test('buildPermissionMatrixItem applies resource aliases for legacy permissions', () => {
    const item = buildPermissionMatrixItem(
      makePermission({
        code: undefined,
        module: 'banking',
        resource: 'application_config',
        action: 'view',
      })
    );

    expect(item.groupKey).toBe('banking.setup.application');
    expect(item.fullKey).toBe('banking.setup.application.view');
    expect(getPermissionCanonicalKey(item.permission)).toBe('banking.setup.application.view');
  });

  test('buildPermissionSelectionGroups groups permissions by module', () => {
    const groups = buildPermissionSelectionGroups(
      [
        makePermission({
          id: 'perm-1',
          code: 'banking.setup.application.view',
          module: 'banking',
          resource: 'application_config',
        }),
        makePermission({
          id: 'perm-2',
          code: 'reporting.ecl.results.export',
          module: 'reporting',
          resource: 'ecl_results',
          action: 'export',
          displayName: 'Export ECL results',
          category: 'REPORTING',
          bankingSpecific: false,
        }),
      ],
      'module'
    );

    expect(groups).toHaveLength(2);
    expect(groups[0]?.key).toBe('banking');
    expect(groups[0]?.hint).toBe('1 permissions');
    expect(groups[1]?.key).toBe('reporting');
  });

  test('buildPermissionSelectionSections groups permissions by menu key', () => {
    const sections = buildPermissionSelectionSections([
      makePermission({
        id: 'perm-1',
        code: 'banking.collective.bucket.view',
        resource: 'bucket',
      }),
      makePermission({
        id: 'perm-2',
        code: 'banking.collective.bucket.create',
        resource: 'bucket',
        action: 'create',
      }),
      makePermission({
        id: 'perm-3',
        code: 'banking.collective.ead.view',
        resource: 'ead',
      }),
    ]);

    expect(sections).toHaveLength(2);
    expect(sections[0]?.key).toBe('banking.collective.bucket');
    expect(sections[0]?.label).toBe('Collective Impairment > Bucket Parameter');
    expect(sections[0]?.permissions).toHaveLength(2);
    expect(sections[1]?.key).toBe('banking.collective.ead');
    expect(sections[1]?.label).toBe('Collective Impairment > EAD Setup Management');
    expect(sections[1]?.permissions).toHaveLength(1);
  });

  test('uses sidebar-aware labels for menu and category grouping', () => {
    expect(getPermissionCategoryDisplayLabel('banking.collective')).toBe('Collective Impairment');
    expect(getPermissionGroupDisplayLabel('banking.collective.pd')).toBe('PD Setup Management');
    expect(getPermissionGroupDisplayLabel('banking.collective.pd', 'breadcrumb'))
      .toBe('Collective Impairment > PD Setup Management');
    expect(getPermissionGroupDisplayLabel('banking.collective.lgd', 'breadcrumb'))
      .toBe('Collective Impairment > LGD Setup Management');
    expect(getPermissionGroupDisplayLabel('banking.collective.ead', 'breadcrumb'))
      .toBe('Collective Impairment > EAD Setup Management');
  });

  test('normalizePermissionFromApi fills frontend defaults', () => {
    const normalized = normalizePermissionFromApi({
      id: 'perm-77',
      resource: 'approval_requests',
      action: 'approve',
      name: 'Approve requests',
    });

    expect(normalized.module).toBe('core');
    expect(normalized.displayName).toBe('Approve requests');
    expect(normalized.category).toBe('CORE');
    expect(normalized.riskLevel).toBe('LOW');
    expect(normalized.requiredApprovers).toBe(1);
  });

  test('normalizeRoleFromApi flattens grouped permissions and resolves aliases', () => {
    const normalized = normalizeRoleFromApi({
      id: 'role-1',
      roleCode: 'APPROVER',
      roleName: 'Approver',
      isSystemRole: true,
      assigned_users: '2',
      permissions: {
        BANKING: [
          makePermission({
            id: 'perm-a',
            code: 'banking.setup.application.view',
          }),
        ],
        ADMIN: [
          makePermission({
            id: 'perm-b',
            code: 'admin.roles.manage',
            module: 'admin',
            resource: 'roles',
            action: 'manage',
            category: 'ADMIN',
            displayName: 'Manage roles',
            bankingSpecific: false,
          }),
        ],
      },
    });

    expect(normalized.displayName).toBe('Approver');
    expect(normalized.name).toBe('APPROVER');
    expect(normalized.type).toBe('SYSTEM');
    expect(normalized.level).toBe('TENANT');
    expect(normalized.assignedUsers).toBe(2);
    expect(normalized.permissions.map((permission) => permission.id)).toEqual(['perm-a', 'perm-b']);
  });
});
