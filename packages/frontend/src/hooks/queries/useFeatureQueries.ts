import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';

// ============================================================================
// APPLICATION SETTINGS
// ============================================================================
export function useApplicationSettingsQuery() {
  return useQuery({
    queryKey: ['application-settings'],
    queryFn: async () => {
      const res = await api.banking.application.getSettings();
      return res?.data || res;
    },
    staleTime: 30000,
  });
}

export function useUpdateApplicationSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: any) => api.banking.application.updateSettings(settings),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['application-settings'] }),
  });
}

// ============================================================================
// BUSINESS SETTINGS
// ============================================================================
export function useBusinessSettingsQuery() {
  return useQuery({
    queryKey: ['business-settings'],
    queryFn: async () => {
      const res = await api.banking.businessSettings.getAll();
      return res?.data || res;
    },
    staleTime: 30000,
  });
}

// ============================================================================
// DASHBOARD
// ============================================================================
export function useDashboardDataQuery() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.banking.dashboard.getData();
      return res?.data || res;
    },
    staleTime: 15000,
  });
}

// ============================================================================
// PARAMETERS
// ============================================================================
export function useProductParametersQuery() {
  return useQuery({
    queryKey: ['product-parameters'],
    queryFn: async () => {
      const res = await api.banking.productParameters.getAll();
      return res?.data || res;
    },
    staleTime: 30000,
  });
}

// ============================================================================
// COLLECTIVE - SEGMENTATION
// ============================================================================
export function useSegmentationHeadersQuery(params?: any) {
  return useQuery({
    queryKey: ['segmentation-headers', params],
    queryFn: () => api.banking.segmentation.getHeaders(params),
    staleTime: 15000,
  });
}

// ============================================================================
// COLLECTIVE - BUCKET
// ============================================================================
export function useBucketHeadersQuery(params?: any) {
  return useQuery({
    queryKey: ['bucket-headers', params],
    queryFn: () => api.banking.bucket.getHeaders(params),
    staleTime: 15000,
  });
}

// ============================================================================
// COLLECTIVE - PD CONFIG
// ============================================================================
export function usePDConfigurationsQuery(params?: any) {
  return useQuery({
    queryKey: ['pd-configurations', params],
    queryFn: () => api.banking.pdConfigurations.getHeaders(params),
    staleTime: 15000,
  });
}

// ============================================================================
// COLLECTIVE - LGD CONFIG
// ============================================================================
export function useLGDConfigurationsQuery(params?: any) {
  return useQuery({
    queryKey: ['lgd-configurations', params],
    queryFn: () => api.banking.lgdConfigurations.getHeaders(params),
    staleTime: 15000,
  });
}

// ============================================================================
// COLLECTIVE - EAD CONFIG
// ============================================================================
export function useEADConfigurationsQuery(params?: any) {
  return useQuery({
    queryKey: ['ead-configurations', params],
    queryFn: () => api.banking.eadConfigurations.getHeaders(params),
    staleTime: 15000,
  });
}

// ============================================================================
// COLLECTIVE - ECL CONFIG
// ============================================================================
export function useECLConfigurationsQuery(params?: any) {
  return useQuery({
    queryKey: ['ecl-configurations', params],
    queryFn: () => api.banking.eclConfigurations.getHeaders(params),
    staleTime: 15000,
  });
}

// ============================================================================
// APPROVALS
// ============================================================================
export function usePendingApprovalsQuery() {
  return useQuery({
    queryKey: ['pending-approvals'],
    queryFn: async () => {
      const res = await api.banking.approval.getPendingApprovals();
      return Array.isArray(res) ? res : res?.data || [];
    },
    staleTime: 10000,
  });
}

// ============================================================================
// AUDIT LOGS
// ============================================================================
export function useAuditLogsQuery(params?: any) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => api.banking.audit.getLogs(params),
    staleTime: 15000,
  });
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================
export function useNotificationsQuery(params?: any) {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: () => api.banking.notifications.getAll(params),
    staleTime: 10000,
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => api.banking.notifications.getUnreadCount(),
    staleTime: 10000,
    refetchInterval: 30000,
  });
}
