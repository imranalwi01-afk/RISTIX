'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';

// ✅ Import our custom providers
import { AuthProvider } from '../providers/AuthProvider';
import { ConfigurationProvider } from '../providers/ConfigurationProvider';
import { BankingThemeProvider } from '../providers/BankingThemeProvider';
import { PlatformSettingsProvider } from '../providers/PlatformSettingsProvider';
import { CurrencyDisplayProvider } from '../providers/CurrencyDisplayProvider';
import { getQueryClient } from '@/features/shared/query/query-client';

import { store, persistor } from '../store';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import '@/services/logging.service';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // WORKAROUND: Prevent MUI v7 SvgIcon from trying to access _theme_vars
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any)._theme_vars = {};
    }
  }, []);

  const queryClient = React.useMemo(() => getQueryClient(), []);

  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <PlatformSettingsProvider>
              <CurrencyDisplayProvider>
                <ConfigurationProvider>
                  <AuthProvider>
                    <BankingThemeProvider>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <CssBaseline />
                        <ErrorBoundary>
                          {children as any}
                        </ErrorBoundary>
                      </LocalizationProvider>
                    </BankingThemeProvider>
                  </AuthProvider>
                </ConfigurationProvider>
              </CurrencyDisplayProvider>
            </PlatformSettingsProvider>
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </AppRouterCacheProvider>
  );
}
