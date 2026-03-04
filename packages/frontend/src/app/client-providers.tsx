'use client';

import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import CssBaseline from '@mui/material/CssBaseline';

// ✅ Import our custom providers
import { AuthProvider } from '../providers/AuthProvider';
import { ConfigurationProvider } from '../providers/ConfigurationProvider';
import { BankingThemeProvider } from '../providers/BankingThemeProvider';
import { PlatformSettingsProvider } from '../providers/PlatformSettingsProvider';

import { store, persistor } from '../store';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import '@/services/logging.service';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  // WORKAROUND: Prevent MUI v7 SvgIcon from trying to access _theme_vars
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any)._theme_vars = {};
    }
  }, []);

  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <PlatformSettingsProvider>
            <ConfigurationProvider>
              <AuthProvider>
                <BankingThemeProvider>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <CssBaseline />
                    {children as any}
                  </LocalizationProvider>
                </BankingThemeProvider>
              </AuthProvider>
            </ConfigurationProvider>
          </PlatformSettingsProvider>
        </PersistGate>
      </Provider>
    </AppRouterCacheProvider>
  );
}
