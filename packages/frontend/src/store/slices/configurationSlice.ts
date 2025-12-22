// packages/frontend/src/store/slices/configurationSlice.ts
// ============================================================================
// 🩹 SURGICAL FIX: Complete Configuration Slice for your store
// ============================================================================
// ✅ CREATED: Matches the imports in your store/index.ts
// ✅ COMPATIBLE: Works with your existing Redux setup
// ============================================================================

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================================================
// CONFIGURATION STATE INTERFACE
// ============================================================================
interface ConfigurationState {
  // API Configuration
  apiUrl: string;
  environment: 'development' | 'staging' | 'production';
  
  // Banking Mode Configuration
  bankingMode: 'conventional' | 'syariah' | 'dual';
  defaultBankingMode: 'conventional' | 'syariah';
  
  // Feature Flags
  features: {
    analytics: boolean;
    syariahMode: boolean;
    realTime: boolean;
    mobileView: boolean;
    islamicBanking: boolean;
    multiTenant: boolean;
    auditTrail: boolean;
    advancedReporting: boolean;
    consultantPortal: boolean;
    regulatorPortal: boolean;
    platformAdmin: boolean;
  };
  
  // Application Settings
  settings: {
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'ar' | 'id';
    currency: string;
    dateFormat: string;
    timezone: string;
    notifications: boolean;
    autoSave: boolean;
    sessionTimeout: number;
  };
  
  // System Status
  loaded: boolean;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// ============================================================================
// INITIAL STATE
// ============================================================================
const getInitialApiUrl = (): string => {
  // Simple environment-based URL detection without require()
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('danafin.com')) {
      return 'https://iaf-ifrs-be.danafin.com/api/v1';
    } else if (hostname.includes('ifrspro.id')) {
      return 'https://iaf-ifrs-be.ifrspro.id/api/v1';
    }
  }

  // Fallback to environment variable
  return process.env.NEXT_PUBLIC_API_URL || 'https://iaf-ifrs-be.ifrspro.id/api/v1';
};

const initialState: ConfigurationState = {
  // API Configuration
  apiUrl: getInitialApiUrl(),
  environment: (process.env.NEXT_PUBLIC_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
  
  // Banking Mode Configuration
  bankingMode: 'conventional',
  defaultBankingMode: 'conventional',
  
  // Feature Flags
  features: {
    analytics: true,
    syariahMode: true,
    realTime: true,
    mobileView: true,
    islamicBanking: true,
    multiTenant: true,
    auditTrail: true,
    advancedReporting: true,
    consultantPortal: true,
    regulatorPortal: true,
    platformAdmin: true,
  },
  
  // Application Settings
  settings: {
    theme: 'light',
    language: 'en',
    currency: 'USD',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'UTC',
    notifications: true,
    autoSave: true,
    sessionTimeout: 3600000, // 1 hour in milliseconds
  },
  
  // System Status
  loaded: false,
  loading: false,
  error: null,
  lastUpdated: null,
};

// ============================================================================
// CONFIGURATION SLICE
// ============================================================================
const configurationSlice = createSlice({
  name: 'configuration',
  initialState,
  reducers: {
    // Set entire configuration
    setConfiguration: (state, action: PayloadAction<Partial<ConfigurationState>>) => {
      Object.assign(state, action.payload);
      state.loaded = true;
      state.error = null;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Banking mode actions
    setBankingMode: (state, action: PayloadAction<'conventional' | 'syariah' | 'dual'>) => {
      state.bankingMode = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Feature toggle actions
    updateFeature: (state, action: PayloadAction<{ feature: keyof ConfigurationState['features']; enabled: boolean }>) => {
      state.features[action.payload.feature] = action.payload.enabled;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Settings update actions
    updateSetting: (state, action: PayloadAction<{ key: keyof ConfigurationState['settings']; value: any }>) => {
      state.settings[action.payload.key] = action.payload.value;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Batch settings update
    updateSettings: (state, action: PayloadAction<Partial<ConfigurationState['settings']>>) => {
      Object.assign(state.settings, action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    // Batch features update
    updateFeatures: (state, action: PayloadAction<Partial<ConfigurationState['features']>>) => {
      Object.assign(state.features, action.payload);
      state.lastUpdated = new Date().toISOString();
    },
    
    // Loading states
    setConfigurationLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    
    // Error handling
    setConfigurationError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Clear error
    clearConfigurationError: (state) => {
      state.error = null;
    },
    
    // Reset to initial state
    resetConfiguration: () => {
      return { ...initialState };
    },
    
    // Update API URL
    setApiUrl: (state, action: PayloadAction<string>) => {
      state.apiUrl = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    
    // Update environment
    setEnvironment: (state, action: PayloadAction<'development' | 'staging' | 'production'>) => {
      state.environment = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

// ============================================================================
// ACTION EXPORTS (matches your store/index.ts imports)
// ============================================================================
export const {
  setConfiguration,
  setBankingMode,
  updateFeature,
  updateSetting,
  updateSettings,
  updateFeatures,
  setConfigurationLoading,
  setConfigurationError,
  clearConfigurationError,
  resetConfiguration,
  setApiUrl,
  setEnvironment,
} = configurationSlice.actions;

// ============================================================================
// REDUCER EXPORT
// ============================================================================
export default configurationSlice.reducer;

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type { ConfigurationState };