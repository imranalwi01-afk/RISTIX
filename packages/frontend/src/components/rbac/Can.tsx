import React from 'react';
import { usePermission } from '../../hooks/usePermission';

interface CanProps {
    /**
     * The action to perform (e.g., 'view', 'create', 'edit')
     */
    I: string;
    /**
     * The resource to act upon (e.g., 'users', 'roles')
     */
    a: string;
    /**
     * Content to render if permission is granted
     */
    children: React.ReactNode;
    /**
     * Optional content to render if permission is denied
     */
    fallback?: React.ReactNode;
}

/**
 * RBAC/ACL Component to conditionally render content based on permissions.
 * Usage: <Can I="view" a="users"> <UserList /> </Can>
 */
export const Can: React.FC<CanProps> = ({ I, a, children, fallback = null }) => {
    const { can } = usePermission();

    if (can(I, a)) {
        return <>{children}</>;
    }

    return <>{fallback}</>;
};
