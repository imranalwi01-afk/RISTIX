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

import { store, persistor } from '../store';

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
          <ConfigurationProvider>
            <AuthProvider>
              <BankingThemeProvider>
                <CssBaseline />
                {children as any}
              </BankingThemeProvider>
            </AuthProvider>
          </ConfigurationProvider>
        </PersistGate>
      </Provider>
    </AppRouterCacheProvider>
  );
}