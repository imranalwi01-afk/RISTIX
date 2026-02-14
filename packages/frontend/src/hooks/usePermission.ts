import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

type ActionOrResource = string | string[];
type MatchMode = 'any' | 'all';

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

const normalizeInput = (value: string): string =>
    value.trim().replace(/:/g, '.').replace(/\s+/g, '_').toLowerCase();

const normalizeLegacyKey = (value: string): string =>
    normalizeInput(value).replace(/\./g, '_');

const toCanonical = (value: string): string => {
    const normalized = normalizeInput(value);
    return LEGACY_PERMISSION_ALIASES[normalizeLegacyKey(normalized)] || normalized;
};

const toList = (value: ActionOrResource): string[] => (Array.isArray(value) ? value : [value]);

const safeLocalStoragePermissions = (): string[] => {
    if (typeof window === 'undefined') return [];
    try {
        const userDataRaw = localStorage.getItem('user_data');
        if (!userDataRaw) return [];
        const parsed = JSON.parse(userDataRaw);
        return Array.isArray(parsed?.permissions)
            ? parsed.permissions.filter((item: unknown): item is string => typeof item === 'string')
            : [];
    } catch {
        return [];
    }
};

export const usePermission = () => {
    const auth = useSelector((state: RootState) => state.auth);
    const reduxPermissions = auth?.user?.permissions;
    const fallbackPermissions = useMemo(() => safeLocalStoragePermissions(), []);

    const permissions = useMemo(() => {
        const combined =
            Array.isArray(reduxPermissions) && reduxPermissions.length > 0
                ? reduxPermissions
                : fallbackPermissions;
        return combined.filter((item): item is string => typeof item === 'string');
    }, [reduxPermissions, fallbackPermissions]);

    const normalizedPermissionSet = useMemo(() => {
        const set = new Set<string>();
        for (const permission of permissions) {
            const canonical = toCanonical(permission);
            set.add(canonical);
            set.add(normalizeInput(permission));
        }
        return set;
    }, [permissions]);

    const isSuperAdmin =
        normalizedPermissionSet.has('*') ||
        normalizedPermissionSet.has('admin.super_admin') ||
        normalizedPermissionSet.has('super_admin') ||
        normalizedPermissionSet.has('platform_admin');

    const hasPermission = (code: string): boolean => {
        if (!code) return false;
        if (isSuperAdmin) return true;

        const requested = toCanonical(code);
        const requestedParts = requested.split('.');
        const requestedAction = requestedParts[requestedParts.length - 1];
        const hasAction = ACTION_SUFFIXES.has(requestedAction);
        const requestedBase = hasAction ? requestedParts.slice(0, -1).join('.') : requested;

        if (
            normalizedPermissionSet.has(requested) ||
            normalizedPermissionSet.has(normalizeInput(code))
        ) {
            return true;
        }

        if (
            normalizedPermissionSet.has(`${requestedBase}.manage`) ||
            normalizedPermissionSet.has(`${requestedBase}.access`)
        ) {
            return true;
        }

        if (!hasAction) {
            if (
                normalizedPermissionSet.has(`${requested}.view`) ||
                normalizedPermissionSet.has(`${requested}.manage`) ||
                normalizedPermissionSet.has(`${requested}.access`)
            ) {
                return true;
            }
        }

        for (const permission of normalizedPermissionSet) {
            if (permission.endsWith('.*')) {
                const prefix = permission.slice(0, -2);
                if (requested === prefix || requested.startsWith(`${prefix}.`)) return true;
            }

            if (permission.startsWith(`${requested}.`)) return true;
            if (requested.startsWith(`${permission}.`) && !ACTION_SUFFIXES.has(permission.split('.').at(-1) || '')) {
                return true;
            }
        }

        return false;
    };

    const hasAnyPermission = (codes: string[]): boolean => codes.some((code) => hasPermission(code));
    const hasAllPermissions = (codes: string[]): boolean => codes.every((code) => hasPermission(code));

    const can = (
        action: ActionOrResource,
        resource: ActionOrResource,
        match: MatchMode = 'any'
    ): boolean => {
        const actions = toList(action);
        const resources = toList(resource);
        if (!actions.length || !resources.length) return false;

        const checks = actions.flatMap((a) =>
            resources.flatMap((r) => {
                const normalizedAction = normalizeInput(a);
                const normalizedResource = normalizeInput(r);
                const dotted = `${normalizedResource}.${normalizedAction}`;
                const legacy = `${normalizedAction}_${normalizedResource.replace(/\./g, '_')}`;
                return [dotted, legacy.toUpperCase()];
            })
        );

        return match === 'all' ? hasAllPermissions(checks) : hasAnyPermission(checks);
    };

    return {
        permissions,
        isSuperAdmin,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        can,
    };
};
