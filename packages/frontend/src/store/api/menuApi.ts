import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/auth-token';
import type { MenuItem } from '../../services/api/menu.api';
import { frontendEnvironmentLoader } from '../../config/environment-loader-frontend';

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
            query: ({ bankingMode = 'conventional', includeInactive = false }) => ({
                url: '/menu/hierarchy', // Updated to match new-backend
                params: undefined, // Backend does not use query params, it filters by auth token/context
            }),
            transformResponse: (response: { data: MenuItem[] }) => response.data, // ✅ Unwrap the 'data' property
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
