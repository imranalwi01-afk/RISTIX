import React from 'react';
import { usePermission } from '../../hooks/usePermission';

type MatchMode = 'any' | 'all';

interface CanProps {
    /** Canonical permission code(s), e.g. "banking.parameter.product.create" */
    permission?: string | string[];
    /** Alias for permission list */
    permissions?: string[];
    /** The action(s) to perform (e.g., 'view', 'create', ['view', 'edit']) */
    I?: string | string[];
    /** The resource(s) (e.g., 'users', 'roles', ['users', 'roles']) */
    a?: string | string[];
    /** Rendered when permission is granted */
    children: React.ReactNode;
    /** Optional fallback when denied */
    fallback?: React.ReactNode;
    /** Match rule: any (default) or all action-resource combos must be allowed */
    match?: MatchMode;
    /** Invert logic: render children only when not allowed */
    not?: boolean;
}

/**
 * RBAC/ACL component to conditionally render content based on permissions.
 * Usage:
 *   <Can permission="banking.parameter.product.create"> <CreateButton /> </Can>
 *   <Can permission={['admin.roles.manage','admin.super_admin']}> ... </Can>
 *   <Can I="view" a="users"> <UserList /> </Can>
 *   <Can I={['create','edit']} a="users" match="all"> ... </Can>
 *   <Can I="delete" a="users" not fallback={<></>} />
 */
export const Can: React.FC<CanProps> = ({
    permission,
    permissions,
    I,
    a,
    children,
    fallback = null,
    match = 'any',
    not = false,
}) => {
    const { can, hasAnyPermission, hasAllPermissions } = usePermission();

    const directPermissions = [
        ...(Array.isArray(permission) ? permission : permission ? [permission] : []),
        ...(permissions || []),
    ].filter(Boolean);

    const allowed = directPermissions.length > 0
        ? (match === 'all' ? hasAllPermissions(directPermissions) : hasAnyPermission(directPermissions))
        : I && a
            ? can(I, a, match)
            : false;

    const shouldRender = not ? !allowed : allowed;

    return <>{shouldRender ? children : fallback}</>;
};
