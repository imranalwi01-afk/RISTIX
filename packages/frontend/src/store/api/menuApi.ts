import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/auth-token';
import type { MenuItem } from '../../services/api/menu.api';
import { frontendEnvironmentLoader } from '../../config/environment-loader-frontend';
import { getStaticFallbackMenu } from '@/components/banking/BankingSidebarUtils';

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const toApiV1BaseUrl = (rawValue: string): string => {
    let normalized = trimTrailingSlash((rawValue || '').trim());
    while (/\/api\/v1$/i.test(normalized)) {
        normalized = normalized.replace(/\/api\/v1$/i, '');
    }
    return normalized.length > 0 ? `${normalized}/api/v1` : '/api/v1';
};

const resolveMenuApiBaseUrl = (): string => {
    try {
        const config = frontendEnvironmentLoader.getConfiguration();
        return toApiV1BaseUrl(config?.api?.base || config?.api?.backend || '');
    } catch {
        const envBase = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4232/api/v1';
        return toApiV1BaseUrl(envBase);
    }
};

const buildStaticMenuTree = (): MenuItem[] => {
    const toMenuItem = (item: any): MenuItem => ({
        id: String(item.id),
        key: String(item.key || item.id),
        title: String(item.title || item.label || item.id || 'Unknown'),
        description: item.description || undefined,
        icon: item.icon || undefined,
        url: item.url || undefined,
        type: item.type === 'divider' ? 'divider' : (item.children && item.children.length > 0 ? 'group' : 'item'),
        permissions: Array.isArray(item.user_types) ? item.user_types : [],
        requiredPermissions: Array.isArray(item.requiredPermissions) ? item.requiredPermissions : [],
        sort_order: Number(item.sort_order || 0),
        children: Array.isArray(item.children) ? item.children.map(toMenuItem) : [],
    });

    const flatItems = getStaticFallbackMenu();
    const byId = new Map<string, any>();

    flatItems.forEach((item) => {
        byId.set(String(item.id), { ...item, children: [] as any[] });
    });

    const roots: any[] = [];
    byId.forEach((item) => {
        const parentId = item.parent_id ? String(item.parent_id) : null;
        if (parentId && byId.has(parentId)) {
            byId.get(parentId).children.push(item);
        } else {
            roots.push(item);
        }
    });

    roots.sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
    roots.forEach((item) => {
        if (Array.isArray(item.children)) {
            item.children.sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
        }
    });

    return roots.map(toMenuItem);
};

const isDynamicMenuEnabled = (): boolean => {
    try {
        return frontendEnvironmentLoader.getConfiguration().features.dynamicMenu;
    } catch {
        return process.env.NEXT_PUBLIC_DYNAMIC_MENU_ENABLED === 'true';
    }
};

// Define the API slice
export const menuQueryApi = createApi({
    reducerPath: 'menuQueryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: resolveMenuApiBaseUrl(),
        prepareHeaders: (headers) => {
            // Get the token from cookie or local storage using the centralized utility
            const token = getAuthToken();
            if (token) {
                headers.set('authorization', `Bearer ${token}`);

                if (typeof window !== 'undefined') {
                    const impersonatedTenantSlug = window.localStorage.getItem('impersonated_tenant_slug');
                    if (impersonatedTenantSlug && impersonatedTenantSlug !== 'system') {
                        headers.set('x-tenant-slug', impersonatedTenantSlug);
                        headers.set('x-impersonation-mode', 'true');
                    } else {
                        const userDataRaw = window.localStorage.getItem('user_data');
                        if (userDataRaw) {
                            try {
                                const parsed = JSON.parse(userDataRaw);
                                if (typeof parsed?.tenantSlug === 'string' && parsed.tenantSlug.length > 0) {
                                    headers.set('x-tenant-slug', parsed.tenantSlug);
                                } else if (typeof parsed?.tenantId === 'string' && parsed.tenantId.length > 0) {
                                    headers.set('x-tenant-id', parsed.tenantId);
                                }
                            } catch {
                                // Ignore malformed localStorage payload
                            }
                        }
                    }
                }
            }
            return headers;
        },
    }),
    tagTypes: ['Menu'],
    endpoints: (builder) => ({
        getMenuTree: builder.query<MenuItem[], { bankingMode?: string; includeInactive?: boolean }>({
            async queryFn({ bankingMode = 'conventional', includeInactive = false }, _api, _extraOptions, baseQuery) {
                if (!isDynamicMenuEnabled()) {
                    return { data: buildStaticMenuTree() };
                }

                const result = await baseQuery({
                    url: '/menu/hierarchy',
                    params: { bankingMode, includeInactive },
                });

                if ('data' in result) {
                    const payload = result.data as { data?: MenuItem[] };
                    return { data: Array.isArray(payload?.data) ? payload.data : [] };
                }

                const status = typeof result.error === 'object' && result.error && 'status' in result.error
                    ? result.error.status
                    : undefined;

                if (status === 404) {
                    return { data: buildStaticMenuTree() };
                }

                return { error: result.error as any };
            },
            providesTags: ['Menu'],
            // Keep unused data for 5 minutes
            keepUnusedDataFor: 300,
        }),
        getUserMenu: builder.query<any, void>({
            query: () => '/system/menu/user-menu',
            providesTags: ['Menu'],
        }),
    }),
});

// Export hooks for usage in functional components
export const { useGetMenuTreeQuery, useGetUserMenuQuery } = menuQueryApi;
