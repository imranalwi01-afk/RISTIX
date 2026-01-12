import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getAuthToken } from '../../utils/auth-token';

// Define the API slice
export const menuQueryApi = createApi({
    reducerPath: 'menuQueryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4232/api/v1',
        prepareHeaders: (headers) => {
            // Get the token from cookie or local storage using the centralized utility
            const token = getAuthToken();
            if (token) {
                headers.set('authorization', `Bearer ${token}`);

                if (typeof window !== 'undefined') {
                    const tenantId = window.localStorage.getItem('tenant_id') || 'default';
                    // Only set header if it's a specific tenant ID, otherwise let backend infer from token
                    if (tenantId && tenantId !== 'default') {
                        headers.set('x-tenant-id', tenantId);
                    }
                }
            }
            return headers;
        },
    }),
    tagTypes: ['Menu'],
    endpoints: (builder) => ({
        getMenuTree: builder.query<any[], { bankingMode?: string; includeInactive?: boolean }>({
            query: ({ bankingMode = 'conventional', includeInactive = false }) => ({
                url: '/menu/hierarchy', // Updated to match new-backend
                params: undefined, // Backend does not use query params, it filters by auth token/context
            }),
            transformResponse: (response: { data: any[] }) => response.data, // ✅ Unwrap the 'data' property
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
