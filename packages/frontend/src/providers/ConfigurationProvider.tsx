// packages/frontend/src/providers/ConfigurationProvider.tsx
// ============================================================================
// IFRS9 CONFIGURATION PROVIDER
// ============================================================================
// Purpose: Initialize and provide configuration throughout the app
// Dependencies: environment.config.ts
// ============================================================================

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import {
  getEnvironmentConfig,
  initializeConfiguration,
  diagnoseEnvironment,
  getStakeholderType,
  isIslamicBankingEnabled,
  type EnvironmentConfig
} from '../config/environment.config';
import { setConfiguration } from '../store/slices/configurationSlice';

interface ConfigurationContextType {
  config: EnvironmentConfig | null;
  isLoaded: boolean;
  error: string | null;
  reload: () => void;
}

const ConfigurationContext = createContext<ConfigurationContextType | undefined>(undefined);

interface ConfigurationProviderProps {
  children: ReactNode;
}

export const ConfigurationProvider: React.FC<ConfigurationProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const [config, setConfig] = useState<EnvironmentConfig | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConfiguration = async () => {
    try {

      // Initialize configuration service
      initializeConfiguration();

      // Get configuration
      const envConfig = getEnvironmentConfig();

      // Validate configuration in development
      if (process.env.NODE_ENV === 'development') {
        diagnoseEnvironment();
      }

      // Update Redux store
      dispatch(setConfiguration({
        apiUrl: envConfig.api.baseUrl,
        environment: envConfig.app.environment,
        bankingMode: envConfig.banking.mode,
        features: {
          analytics: envConfig.features.rAnalytics,
          realTime: false,
          mobileView: true,
          islamicBanking: envConfig.banking.mode !== 'conventional',
          multiTenant: envConfig.features.multiTenant,
          auditTrail: envConfig.features.auditTrail,
          advancedReporting: true,
          consultantPortal: envConfig.features.consultantHub,
          regulatorPortal: false,
          platformAdmin: true,
        },
        settings: {
          theme: envConfig.theme.defaultTheme as any, // Cast to match expected union type
          language: 'en',
          currency: 'IDR',
          dateFormat: 'DD/MM/YYYY',
          timezone: 'Asia/Jakarta',
          notifications: true,
          autoSave: true,
          sessionTimeout: envConfig.security.sessionTimeout
        },
        loaded: true,
      }));

      setConfig(envConfig);
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown configuration error';
      console.error('❌ ConfigurationProvider: Configuration failed:', errorMessage);
      setError(errorMessage);

      // Set fallback configuration
      const fallbackConfig = getEnvironmentConfig(); // This has safe defaults
      setConfig(fallbackConfig);
    } finally {
      setIsLoaded(true);
    }
  };

  const reload = () => {
    setIsLoaded(false);
    setError(null);
    loadConfiguration();
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const contextValue: ConfigurationContextType = {
    config,
    isLoaded,
    error,
    reload,
  };

  // Show loading state while configuration loads
  if (!isLoaded) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '10px' }}>
            🔧 Initializing IFRS9 Platform...
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Loading configuration and environment
          </div>
        </div>
      </div>
    );
  }

  // Show error state if configuration failed
  if (error && !config) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #ffebee 0%, #f8bbd9 100%)',
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <div style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#d32f2f' }}>
            ❌ Configuration Error
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
            {error}
          </div>
          <button
            onClick={reload}
            style={{
              background: '#d32f2f',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Retry Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <ConfigurationContext.Provider value={contextValue}>
      {children as any}
    </ConfigurationContext.Provider>
  );
};

// Custom hook to use configuration
export const useConfiguration = (): ConfigurationContextType => {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error('useConfiguration must be used within a ConfigurationProvider');
  }
  return context;
};

// Export context for advanced usage
export { ConfigurationContext };