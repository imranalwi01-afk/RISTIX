import { apiClient } from '../api-client';

const unwrapTenant = (response: any) => response?.data?.data ?? response?.data ?? response;

export const securityConfigAPI = {
  // Get security configuration
  get: async () => {
    const response = await apiClient.get('/tenants/current');
    const tenant = unwrapTenant(response);
    const settings = tenant?.settings || {};
    return {
      passwordPolicy: settings.passwordPolicy || {
        minLength: 8,
        requireUppercase: false,
        requireLowercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
        maxFailedAttempts: 5,
        historyCount: 3,
        expiryDays: 90
      },
      sessionTimeout: settings.sessionTimeout || 30,
      mfaEnabled: settings.mfaEnabled || false
    };
  },

  // Update security configuration
  update: async (config: any) => {
    const current = await apiClient.get('/tenants/current');
    const tenant = unwrapTenant(current);
    const tenantId = tenant?.id;
    if (!tenantId) throw new Error('No tenant found');
    
    const newSettings = {
      ...(tenant.settings || {}),
      passwordPolicy: config.passwordPolicy,
      sessionTimeout: config.sessionTimeout,
      mfaEnabled: config.mfaEnabled
    };
    
    const response = await apiClient.put(`/tenants/${tenantId}`, {
      name: tenant.name,
      description: tenant.description ?? undefined,
      bankingMode: tenant.bankingMode ?? undefined,
      settings: newSettings
    });
    return unwrapTenant(response);
  }
};
