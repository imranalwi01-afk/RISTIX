// packages/frontend/src/app/providers.tsx
// ============================================================================
// IFRS9 PLATFORM - APP LEVEL PROVIDERS (FIXED)
// ============================================================================
// ✅ FIXED: Removed duplicate code (lines 51-100)
// ✅ FIXED: Proper provider imports and structure
// ✅ FIXED: Compatible with Next.js 15 App Router
// ============================================================================

'use client';

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider, CssBaseline, StyledEngineProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';

// ✅ Redux store
import { store } from '../store';

// ✅ Import providers (will create these next)
import { ConfigurationProvider } from '../providers/ConfigurationProvider';
import { BankingThemeProvider } from '../providers/BankingThemeProvider';
import { AuthProvider } from '../providers/AuthProvider';

// ✅ Import theme (fallback to default if missing)
import { conventionalBankingTheme } from '../themes/conventional/theme';

interface AppProvidersProps {
  children: React.ReactNode;
}

// ✅ FIXED: Single, clean provider wrapper
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <StyledEngineProvider injectFirst>
        <ReduxProvider store={store}>
          <ConfigurationProvider>
            <AuthProvider>
              <BankingThemeProvider>
                <ThemeProvider theme={conventionalBankingTheme}>
                  <CssBaseline />
                  {children}
                </ThemeProvider>
              </BankingThemeProvider>
            </AuthProvider>
          </ConfigurationProvider>
        </ReduxProvider>
      </StyledEngineProvider>
    </AppRouterCacheProvider>
  );
};

export default AppProviders;