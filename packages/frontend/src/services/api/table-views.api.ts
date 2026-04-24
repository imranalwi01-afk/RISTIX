import { apiClient } from '../api-client';
import type { EnterpriseSavedTableView } from '@/types/enterprise-table';

export async function listTableViews(userId: string, scope: string) {
  const response = await apiClient.get<{ success: true; data: EnterpriseSavedTableView[] }>(
    `/users/${userId}/table-views`,
    { params: { scope } },
  );
  return response.data.data;
}

export async function saveTableView(userId: string, view: EnterpriseSavedTableView) {
  const response = await apiClient.put<{ success: true; data: EnterpriseSavedTableView }>(
    `/users/${userId}/table-views/${view.viewKey}`,
    {
      scope: view.scope,
      name: view.name,
      isDefault: view.isDefault,
      state: view.state,
    },
  );
  return response.data.data;
}

export async function deleteTableView(userId: string, scope: string, viewKey: string) {
  const response = await apiClient.delete<{ success: true; data: EnterpriseSavedTableView | null }>(
    `/users/${userId}/table-views/${viewKey}`,
    { params: { scope } },
  );
  return response.data.data;
}
