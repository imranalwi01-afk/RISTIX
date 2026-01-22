import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const usePermission = () => {
    const auth = useSelector((state: RootState) => state.auth);
    const user = auth?.user;
    // Ensure permissions is always an array
    const userPermissions = user?.permissions || [];

    /**
     * Check if user has a specific permission code
     * @param code The permission code (e.g., 'view_users', 'manage_content')
     */
    const hasPermission = (code: string): boolean => {
        if (!code) return false;
        // Check exact match or superadmin (if applicable, e.g. *)
        return userPermissions.includes(code) || userPermissions.includes('*');
    };

    /**
     * Check if user can perform an action on a resource
     * @param action The action (e.g., 'view', 'create', 'update', 'delete')
     * @param resource The resource (e.g., 'users', 'roles', 'reports')
     */
    const can = (action: string, resource: string): boolean => {
        if (!action || !resource) return false;

        // Construct code from action and resource (e.g., 'view_users')
        // Try uppercase format as used in backend (VIEW_USERS)
        const code = `${action.toUpperCase()}_${resource.toUpperCase()}`;
        return hasPermission(code);
    };

    return {
        permissions: userPermissions,
        hasPermission,
        can
    };
};
