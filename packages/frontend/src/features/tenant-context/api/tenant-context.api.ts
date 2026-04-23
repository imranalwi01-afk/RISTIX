'use client';

import { apiClient } from '@/services/api-client';

export interface TenantOption {
  id: string;
  slug: string;
  name: string;
  displayName?: string;
  bankingType: string;
  isActive: boolean;
}

export async function fetchAdminTenants() {
  const response = await apiClient.get('/auth/login-data', {
    params: { mode: 'admin' },
  });

  return response.data as {
    success?: boolean;
    data?: {
      tenants?: TenantOption[];
    };
  };
}
