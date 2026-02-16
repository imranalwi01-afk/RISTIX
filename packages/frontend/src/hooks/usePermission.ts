import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
    buildPermissionContext,
    checkAllPermissions,
    checkAnyPermission,
    checkPermission,
    normalizePermissionInput,
} from '@/utils/permission-evaluator';

type ActionOrResource = string | string[];
type MatchMode = 'any' | 'all';

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

const safeTokenPermissions = (token: string | null | undefined): string[] => {
    if (!token || typeof window === 'undefined') return [];
    try {
        const payloadPart = token.split('.')[1];
        if (!payloadPart) return [];
        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const padded = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
        const decoded = JSON.parse(atob(padded));
        return Array.isArray(decoded?.permissions)
            ? decoded.permissions.filter((item: unknown): item is string => typeof item === 'string')
            : [];
    } catch {
        return [];
    }
};

export const usePermission = () => {
    const auth = useSelector((state: RootState) => state.auth);
    const reduxPermissions = auth?.user?.permissions;
    const fallbackPermissions = useMemo(
        () => safeLocalStoragePermissions(),
        [auth?.token, auth?.user?.id, Array.isArray(reduxPermissions) ? reduxPermissions.length : 0]
    );
    const tokenPermissions = useMemo(() => safeTokenPermissions(auth?.token), [auth?.token]);

    const permissions = useMemo(() => {
        const primary =
            Array.isArray(reduxPermissions) && reduxPermissions.length > 0
                ? reduxPermissions
                : fallbackPermissions.length > 0
                    ? fallbackPermissions
                    : tokenPermissions;

        return primary.filter((item): item is string => typeof item === 'string');
    }, [reduxPermissions, fallbackPermissions, tokenPermissions]);

    const permissionContext = useMemo(() => buildPermissionContext(permissions), [permissions]);
    const isSuperAdmin = permissionContext.isSuperAdmin;

    const hasPermission = (code: string): boolean => checkPermission(code, permissionContext);
    const hasAnyPermission = (codes: string[]): boolean => checkAnyPermission(codes, permissionContext);
    const hasAllPermissions = (codes: string[]): boolean => checkAllPermissions(codes, permissionContext);

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
                const normalizedAction = normalizePermissionInput(a);
                const normalizedResource = normalizePermissionInput(r);
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
