import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define types (mirrored from page.tsx and existing api)
export interface BankingProduct {
    id: string;
    product_code: string;
    product_name: string;
    product_type: string;
    product_category: string;
    banking_type: 'conventional' | 'syariah';
    interest_rate_min?: number;
    interest_rate_max?: number;
    profit_rate_min?: number;
    profit_rate_max?: number;
    tenor_min: number;
    tenor_max: number;
    loan_amount_min: number;
    loan_amount_max: number;
    collateral_required: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export const portfolioQueryApi = createApi({
    reducerPath: 'portfolioQueryApi',
    baseQuery: fetchBaseQuery({
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4232/api/v1',
        prepareHeaders: (headers) => {
            if (typeof window !== 'undefined') {
                const token = window.localStorage.getItem('accessToken') || window.localStorage.getItem('auth_token');
                if (token) {
                    headers.set('authorization', `Bearer ${token}`);
                }
            }
            return headers;
        },
    }),
    tagTypes: ['Products'],
    endpoints: (builder) => ({
        getProducts: builder.query<{ success: boolean; data: BankingProduct[] }, void>({
            query: () => '/banking/portfolio/products',
            providesTags: (result) =>
                result
                    ? [
                        ...result.data.map(({ id }) => ({ type: 'Products' as const, id })),
                        { type: 'Products', id: 'LIST' },
                    ]
                    : [{ type: 'Products', id: 'LIST' }],
        }),
        getProductById: builder.query<{ success: boolean; data: BankingProduct }, string>({
            query: (id) => `/banking/portfolio/products/${id}`,
            providesTags: (result, error, id) => [{ type: 'Products', id }],
        }),
        createProduct: builder.mutation<{ success: boolean; data: BankingProduct }, Partial<BankingProduct>>({
            query: (body) => ({
                url: '/banking/portfolio/products',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'Products', id: 'LIST' }],
        }),
        updateProduct: builder.mutation<{ success: boolean; message: string }, { id: string; data: Partial<BankingProduct> }>({
            query: ({ id, data }) => ({
                url: `/banking/portfolio/products/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Products', id }, { type: 'Products', id: 'LIST' }],
        }),
        deleteProduct: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/banking/portfolio/products/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Products', id }, { type: 'Products', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetProductsQuery,
    useGetProductByIdQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} = portfolioQueryApi;
