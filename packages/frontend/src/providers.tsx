// packages/frontend/src/providers.tsx
// ============================================================================
// IFRS9 PLATFORM - MAIN PROVIDERS WRAPPER
// ============================================================================
// File Path: packages/frontend/src/providers.tsx
// Purpose: Central providers setup for all stakeholder types
// Dependencies: Redux, Material-UI, Configuration, Banking Themes
// Configuration: Environment-driven setup (NO HARDCODED VALUES)
// ============================================================================

'use client';

import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { ConfigurationProvider } from './providers/ConfigurationProvider';
import { BankingThemeProvider } from './providers/BankingThemeProvider';
import { AuthProvider } from './providers/AuthProvider';
import { store } from './store';
import { conventionalBankingTheme } from './themes/conventional/theme';

interface ProvidersProps {
  children: React.ReactNode;
}

// ✅ Main providers wrapper following established patterns
const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
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
  );
};

export default Providers;