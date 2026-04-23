'use client';

import { tenantsAPI } from '@/services/api';

export interface PlatformTenantsListParams {
  page: number;
  limit: number;
  search?: string;
  mode?: 'admin';
}

export async function fetchPlatformTenants(params: PlatformTenantsListParams) {
  return tenantsAPI.getAll(params);
}

export async function createPlatformTenant(input: Record<string, unknown>) {
  return tenantsAPI.create(input);
}

export async function updatePlatformTenant(id: string, input: Record<string, unknown>) {
  return tenantsAPI.update(id, input);
}

export async function deletePlatformTenant(id: string) {
  return tenantsAPI.delete(id);
}

export async function enablePlatformTenant(id: string) {
  return tenantsAPI.enable(id);
}

export async function disablePlatformTenant(id: string) {
  return tenantsAPI.disable(id);
}
