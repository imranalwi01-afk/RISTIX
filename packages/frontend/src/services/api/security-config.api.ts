import { apiClient } from '../api-client';

export const securityConfigAPI = {
  // Get security configuration
  get: async () => {
    const response = await apiClient.get('/tenants/current');
    const settings = response.data?.settings || {};
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
    const tenantId = current.data?.id;
    if (!tenantId) throw new Error('No tenant found');
    
    const newSettings = {
      ...current.data.settings,
      passwordPolicy: config.passwordPolicy,
      sessionTimeout: config.sessionTimeout,
      mfaEnabled: config.mfaEnabled
    };
    
    const response = await apiClient.put(`/tenants/${tenantId}`, {
      ...current.data,
      settings: newSettings
    });
    return response.data;
  }
};