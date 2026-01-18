'use client';

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { CssBaseline, StyledEngineProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';

// ✅ Redux store
import { store } from '../store';

// ✅ Import providers
import { ConfigurationProvider } from '../providers/ConfigurationProvider';
import { BankingThemeProvider } from '../providers/BankingThemeProvider';
import { AuthProvider } from '../providers/AuthProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

// ✅ FIXED: Single, clean provider wrapper
// Removed inner ThemeProvider as BankingThemeProvider now handles it dynamically
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <StyledEngineProvider injectFirst>
        <ReduxProvider store={store}>
          <ConfigurationProvider>
            <AuthProvider>
              <BankingThemeProvider>
                <CssBaseline />
                {children}
              </BankingThemeProvider>
            </AuthProvider>
          </ConfigurationProvider>
        </ReduxProvider>
      </StyledEngineProvider>
    </AppRouterCacheProvider>
  );
};

export default AppProviders;