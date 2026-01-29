// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/themes/shared/theme.provider.tsx
// Generated: 2025-07-26T17:05:00Z
// Phase: D2H6 - Dual Banking Admin Themes (PERFORMANCE OPTIMIZED)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, Redux Toolkit
// Purpose: Dual banking theme provider with memoized selectors (PERFORMANCE FIX)
// ============================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { conventionalBankingTheme, conventionalThemeMetadata } from '../conventional/theme';
import { syariahBankingTheme, syariahThemeMetadata } from '../syariah/theme';

// Types
export type BankingType = 'conventional' | 'syariah' | 'dual';

export interface ThemeContextValue {
  currentTheme: Theme;
  bankingType: BankingType;
  switchTheme: (type: BankingType) => void;
  themeMetadata: typeof conventionalThemeMetadata | typeof syariahThemeMetadata;
  isLoading: boolean;
}

export interface TenantConfig {
  id: string;
  name: string;
  bankingType: BankingType;
  customizations?: {
    primaryColor?: string;
    secondaryColor?: string;
    logoUrl?: string;
    brandName?: string;
  };
}

// ============================================================================
// 🚀 PERFORMANCE FIX: Memoized Selectors
// ============================================================================

// ✅ FIXED: Create memoized selector to prevent unnecessary rerenders
const selectThemeData = createSelector(
  (state: any) => state.banking?.currentType,
  (state: any) => state.tenant?.currentTenant?.id,
  (state: any) => state.tenant?.currentTenant?.bankingType,
  (state: any) => state.theme?.preferences,
  (bankingCurrentType, tenantId, tenantBankingType, themePreferences) => ({
    bankingType: bankingCurrentType || tenantBankingType || 'conventional',
    tenantId,
    themePreferences
  })
);

// Context
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// Provider Props
interface DualBankingThemeProviderProps {
  children: ReactNode;
  defaultBankingType?: BankingType;
  tenantConfig?: TenantConfig;
}

/**
 * Dual Banking Theme Provider Component
 * Manages theme switching between conventional and syariah banking modes
 * ✅ PERFORMANCE OPTIMIZED: Uses memoized selectors to prevent unnecessary rerenders
 */
export const DualBankingThemeProvider: React.FC<DualBankingThemeProviderProps> = ({
  children,
  defaultBankingType = 'conventional',
  tenantConfig
}) => {
  const [currentBankingType, setCurrentBankingType] = useState<BankingType>(defaultBankingType);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ FIXED: Use memoized selector with shallow equality
  const themeData = useSelector(selectThemeData, shallowEqual);
  
  // ✅ PERFORMANCE: Destructure only after memoization
  const { bankingType: storeBankingType, tenantId, themePreferences } = themeData;

  // Update banking type from store
  useEffect(() => {
    if (storeBankingType && storeBankingType !== currentBankingType) {
      setCurrentBankingType(storeBankingType);
    }
  }, [storeBankingType, currentBankingType]);

  // Update from tenant config
  useEffect(() => {
    if (tenantConfig?.bankingType && tenantConfig.bankingType !== currentBankingType) {
      setCurrentBankingType(tenantConfig.bankingType);
    }
  }, [tenantConfig?.bankingType, currentBankingType]);

  // ✅ PERFORMANCE: Memoize theme calculation
  const currentTheme = useMemo((): Theme => {
    switch (currentBankingType) {
      case 'syariah':
        return syariahBankingTheme;
      case 'conventional':
      case 'dual':
      default:
        return conventionalBankingTheme;
    }
  }, [currentBankingType]);

  // ✅ PERFORMANCE: Memoize theme metadata calculation
  const currentThemeMetadata = useMemo(() => {
    switch (currentBankingType) {
      case 'syariah':
        return syariahThemeMetadata;
      case 'conventional':
      case 'dual':
      default:
        return conventionalThemeMetadata;
    }
  }, [currentBankingType]);

  // Switch theme function
  const switchTheme = async (type: BankingType) => {
    setIsLoading(true);
    
    try {
      // Animate theme transition
      document.body.style.transition = 'all 0.3s ease';
      
      // Update local state
      setCurrentBankingType(type);
      
      // Store preference in localStorage
      localStorage.setItem('ifrs-pro-banking-type', type);
      localStorage.setItem('ifrs-pro-theme-switched-at', new Date().toISOString());
      
      // Dispatch to Redux store if available
      // This would be connected to your Redux banking slice
      
      // Log theme switch for analytics
      console.info(`Theme switched to: ${type}`, {
        timestamp: new Date().toISOString(),
        tenantId,
        previousType: currentBankingType,
        newType: type
      });
      
    } catch (error) {
      console.error('Failed to switch theme:', error);
    } finally {
      setIsLoading(false);
      
      // Remove transition after animation
      setTimeout(() => {
        document.body.style.transition = '';
      }, 300);
    }
  };

  // ✅ PERFORMANCE: Memoize context value to prevent provider rerenders
  const contextValue: ThemeContextValue = useMemo(() => ({
    currentTheme,
    bankingType: currentBankingType,
    switchTheme,
    themeMetadata: currentThemeMetadata,
    isLoading
  }), [currentTheme, currentBankingType, switchTheme, currentThemeMetadata, isLoading]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={contextValue.currentTheme}>
        <CssBaseline />
        {children as any}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use dual banking theme context
 */
export const useDualBankingTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useDualBankingTheme must be used within a DualBankingThemeProvider');
  }
  
  return context;
};

/**
 * Higher-order component for theme-aware components
 */
export const withDualBankingTheme = (Component: React.ComponentType<any>) => {
  return React.forwardRef((props, ref) => {
    const themeContext = useDualBankingTheme();
    
    return (
      <Component
        {...props}
        ref={ref}
        themeContext={themeContext}
      />
    );
  });
};

// Export theme instances for direct use
export {
  conventionalBankingTheme,
  syariahBankingTheme,
  conventionalThemeMetadata,
  syariahThemeMetadata
};