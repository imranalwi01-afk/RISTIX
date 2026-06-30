import { STAKEHOLDER_TYPES } from './constants';

export const PERMISSIONS = {
    // Platform Admin permissions
    PLATFORM_MANAGE_ALL: 'platform:manage:all',
    PLATFORM_VIEW_ALL_TENANTS: 'platform:view:all_tenants',
    PLATFORM_MANAGE_USERS: 'platform:manage:users',
    PLATFORM_MANAGE_INSTITUTIONS: 'platform:manage:institutions',
    PLATFORM_MANAGE_CONSULTANTS: 'platform:manage:consultants',

    // Bank Admin permissions
    TENANT_MANAGE_USERS: 'tenant:manage:users',
    TENANT_MANAGE_IFRS9: 'tenant:manage:ifrs9',
    TENANT_VIEW_REPORTS: 'tenant:view:reports',
    TENANT_MANAGE_CONSULTANTS: 'tenant:manage:consultants',

    // Bank User permissions    TENANT_MANAGE_ACCOUNTS: 'tenant:manage:accounts',

    // Consultant permissions
    CONSULTANT_ACCESS_PROJECTS: 'consultant:access:projects',
    CONSULTANT_PERFORM_VALIDATION: 'consultant:perform:validation',
    CONSULTANT_SUBMIT_DELIVERABLES: 'consultant:submit:deliverables',
    CONSULTANT_ACCESS_TENANT_DATA: 'consultant:access:tenant_data',

    // Tenant permissions
    TENANT_CALCULATE_ECL: 'tenant:calculate:ecl',
    TENANT_MANAGE_ACCOUNTS: 'tenant:manage:accounts',

    // Regulator permissions
    REGULATOR_VIEW_ALL_BANKS: 'regulator:view:all_banks',
    REGULATOR_AUDIT_COMPLIANCE: 'regulator:audit:compliance',
    REGULATOR_VIEW_CONSULTANT_WORK: 'regulator:view:consultant_work',
} as const;

export const STAKEHOLDER_PERMISSIONS = {
    [STAKEHOLDER_TYPES.PLATFORM_ADMIN]: [
        PERMISSIONS.PLATFORM_MANAGE_ALL,
        PERMISSIONS.PLATFORM_VIEW_ALL_TENANTS,
        PERMISSIONS.PLATFORM_MANAGE_USERS,
        PERMISSIONS.PLATFORM_MANAGE_INSTITUTIONS,
        PERMISSIONS.PLATFORM_MANAGE_CONSULTANTS,
    ],
    [STAKEHOLDER_TYPES.BANK_ADMIN]: [
        PERMISSIONS.TENANT_MANAGE_USERS,
        PERMISSIONS.TENANT_MANAGE_IFRS9,
        PERMISSIONS.TENANT_VIEW_REPORTS,
        PERMISSIONS.TENANT_MANAGE_CONSULTANTS,
        PERMISSIONS.TENANT_CALCULATE_ECL,
        PERMISSIONS.TENANT_MANAGE_ACCOUNTS,
    ],
    [STAKEHOLDER_TYPES.BANK_USER]: [
        PERMISSIONS.TENANT_CALCULATE_ECL,
        PERMISSIONS.TENANT_MANAGE_ACCOUNTS,
    ],
    [STAKEHOLDER_TYPES.CONSULTANT]: [
        PERMISSIONS.CONSULTANT_ACCESS_PROJECTS,
        PERMISSIONS.CONSULTANT_PERFORM_VALIDATION,
        PERMISSIONS.CONSULTANT_SUBMIT_DELIVERABLES,
        PERMISSIONS.CONSULTANT_ACCESS_TENANT_DATA,
    ],
    [STAKEHOLDER_TYPES.REGULATOR]: [
        PERMISSIONS.REGULATOR_VIEW_ALL_BANKS,
        PERMISSIONS.REGULATOR_AUDIT_COMPLIANCE,
        PERMISSIONS.REGULATOR_VIEW_CONSULTANT_WORK,
        PERMISSIONS.TENANT_VIEW_REPORTS,
    ],
} as const;

export function hasPermission(userStakeholderType: string, requiredPermission: string): boolean {
    const userPermissions = STAKEHOLDER_PERMISSIONS[userStakeholderType as keyof typeof STAKEHOLDER_PERMISSIONS];
    return userPermissions ? (userPermissions as readonly string[]).includes(requiredPermission) : false;
}

export function hasAnyPermission(userStakeholderType: string, requiredPermissions: string[]): boolean {
    return requiredPermissions.some(permission => hasPermission(userStakeholderType, permission));
}

export function hasAllPermissions(userStakeholderType: string, requiredPermissions: string[]): boolean {
    return requiredPermissions.every(permission => hasPermission(userStakeholderType, permission));
}
