import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/auth-token';
import type { MenuItem } from '../../services/api/menu.api';

const getBaseUrl = (): string => {
    if (typeof window !== 'undefined') {
        const env = (window as any).__NEXT_DATA__?.runtimeConfig?.NEXT_PUBLIC_API_URL
            || process.env.NEXT_PUBLIC_API_URL
            || '';
        return env ? `${env.replace(/\/+$/, '')}` : '/api/v1';
    }
    return '/api/v1';
};

// Define the API slice
export const menuQueryApi = createApi({
    reducerPath: 'menuQueryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: getBaseUrl(),
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
                const result = await baseQuery({
                    url: '/menu/flat',
                    params: { bankingMode, includeInactive },
                })

                if ('data' in result) {
                    const payload = result.data as { data?: MenuItem[] }
                    if (Array.isArray(payload?.data) && payload.data.length > 0) {
                        return { data: payload.data }
                    }
                }

                return { data: [] }
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
