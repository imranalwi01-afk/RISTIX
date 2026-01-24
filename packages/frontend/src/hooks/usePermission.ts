import { useSelector } from 'react-redux';
import { RootState } from '../store';

type ActionOrResource = string | string[];
type MatchMode = 'any' | 'all';

export const usePermission = () => {
    const auth = useSelector((state: RootState) => state.auth);
    const user = auth?.user;
    const userPermissions = user?.permissions || [];

    const hasPermission = (code: string): boolean => {
        if (!code) return false;
        return userPermissions.includes(code) || userPermissions.includes('*');
    };

    const normalize = (value: ActionOrResource): string[] =>
        Array.isArray(value) ? value : [value];

    /**
     * Check if user can perform action(s) on resource(s)
     * match: 'any' (default) -> any combination allows access
     *        'all' -> every action-resource combination must be allowed
     */
    const can = (
        action: ActionOrResource,
        resource: ActionOrResource,
        match: MatchMode = 'any'
    ): boolean => {
        const actions = normalize(action);
        const resources = normalize(resource);

        if (!actions.length || !resources.length) return false;

        const check = (a: string, r: string) =>
            hasPermission(`${a.toUpperCase()}_${r.toUpperCase()}`);

        if (match === 'all') {
            return actions.every((a) => resources.every((r) => check(a, r)));
        }

        // default: any
        return actions.some((a) => resources.some((r) => check(a, r)));
    };

    return {
        permissions: userPermissions,
        hasPermission,
        can
    };
};
