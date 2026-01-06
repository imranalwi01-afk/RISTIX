'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { StyledEngineProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';

// ✅ Import our custom providers
import { AuthProvider } from '../providers/AuthProvider';
import { ConfigurationProvider } from '../providers/ConfigurationProvider';
import { BankingThemeProvider } from '../providers/BankingThemeProvider';

import { store, persistor } from '../store';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <StyledEngineProvider injectFirst>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ConfigurationProvider>
              <AuthProvider>
                <BankingThemeProvider>
                  <CssBaseline />
                  {children}
                </BankingThemeProvider>
              </AuthProvider>
            </ConfigurationProvider>
          </PersistGate>
        </Provider>
      </StyledEngineProvider>
    </AppRouterCacheProvider>
  );
}