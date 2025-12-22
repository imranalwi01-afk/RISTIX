// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/themes/providers/DualBankingThemeProvider.tsx
// Generated: $(date)
// Phase: D2H6 - Dual Banking Admin Themes
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin, Material-UI, Redux Toolkit
// Purpose: React Admin specific dual banking theme provider
// ============================================================================

import React, { ReactNode } from 'react';
import { Admin, AdminContext, AdminUI, Resource } from 'react-admin';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { useDualBankingTheme } from '../../../themes/shared/theme.provider';
import { conventionalBankingTheme } from '../../../themes/conventional/theme';
import { syariahBankingTheme } from '../../../themes/syariah/theme';

// React Admin theme configurations
export const reactAdminConventionalTheme = {
  ...conventionalBankingTheme,
  components: {
    ...conventionalBankingTheme.components,
    // React Admin specific component overrides
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          margin: '2px 8px',
          '&.RaMenuItemLink-active': {
            backgroundColor: '#1976D2',
            color: '#FFFFFF',
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF'
            }
          }
        }
      }
    },
    RaLayout: {
      styleOverrides: {
        root: {
          '& .RaLayout-appFrame': {
            marginTop: '0px'
          },
          '& .RaLayout-contentWithSidebar': {
            marginTop: '48px'
          }
        }
      }
    },
    RaSidebar: {
      styleOverrides: {
        root: {
          '& .MuiDrawer-paper': {
            backgroundColor: '#F5F5F5',
            borderRight: '1px solid #E0E0E0'
          }
        }
      }
    }
  }
};

export const reactAdminSyariahTheme = {
  ...syariahBankingTheme,
  components: {
    ...syariahBankingTheme.components,
    // React Admin specific component overrides
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '2px 8px',
          '&.RaMenuItemLink-active': {
            backgroundColor: '#2E7D32',
            color: '#FFFFFF',
            '& .MuiListItemIcon-root': {
              color: '#FFFFFF'
            }
          }
        }
      }
    },
    RaLayout: {
      styleOverrides: {
        root: {
          '& .RaLayout-appFrame': {
            marginTop: '0px'
          },
          '& .RaLayout-contentWithSidebar': {
            marginTop: '48px'
          }
        }
      }
    },
    RaSidebar: {
      styleOverrides: {
        root: {
          '& .MuiDrawer-paper': {
            backgroundColor: '#FFF8E1',
            borderRight: '1px solid rgba(46,125,50,0.2)',
            background: 'linear-gradient(180deg, #FFF8E1 0%, #F1F8E9 100%)'
          }
        }
      }
    }
  }
};

interface ReactAdminDualBankingThemeProviderProps {
  children: ReactNode;
  dataProvider: any;
  authProvider?: any;
  i18nProvider?: any;
}

/**
 * React Admin Dual Banking Theme Provider
 * Provides React Admin with banking-specific themes
 */
export const ReactAdminDualBankingThemeProvider: React.FC<ReactAdminDualBankingThemeProviderProps> = ({
  children,
  dataProvider,
  authProvider,
  i18nProvider
}) => {
  const { bankingType } = useDualBankingTheme();
  
  // Select theme based on banking type
  const getReactAdminTheme = () => {
    switch (bankingType) {
      case 'syariah':
        return reactAdminSyariahTheme;
      case 'conventional':
      case 'dual':
      default:
        return reactAdminConventionalTheme;
    }
  };

  return (
    <Admin
      dataProvider={dataProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      theme={getReactAdminTheme()}
      layout={ReactAdminDualBankingLayout}
    >
      {children}
    </Admin>
  );
};

/**
 * Custom React Admin Layout with Banking Context
 */
const ReactAdminDualBankingLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { bankingType, themeMetadata } = useDualBankingTheme();
  
  return (
    <div className={`ra-layout banking-${bankingType}`}>
      {/* Banking Mode Indicator */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          zIndex: 1300,
          padding: '8px 16px',
          backgroundColor: bankingType === 'syariah' ? '#2E7D32' : '#1976D2',
          color: '#FFFFFF',
          fontSize: '0.75rem',
          fontWeight: 600,
          borderBottomLeftRadius: '8px'
        }}
      >
        {bankingType === 'syariah' ? '🕌 Syariah Banking' : '🏛️ Conventional Banking'}
      </div>
      
      {children}
    </div>
  );
};

/**
 * Banking Theme Selector Component
 * Allows users to switch between banking themes
 */
export const BankingThemeSelector: React.FC = () => {
  const { bankingType, switchTheme, isLoading } = useDualBankingTheme();
  
  const handleThemeSwitch = (newType: 'conventional' | 'syariah') => {
    if (newType !== bankingType && !isLoading) {
      switchTheme(newType);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', padding: '8px' }}>
      <button
        onClick={() => handleThemeSwitch('conventional')}
        disabled={isLoading || bankingType === 'conventional'}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          backgroundColor: bankingType === 'conventional' ? '#1976D2' : '#E0E0E0',
          color: bankingType === 'conventional' ? '#FFFFFF' : '#424242',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}
      >
        🏛️ Conventional
      </button>
      
      <button
        onClick={() => handleThemeSwitch('syariah')}
        disabled={isLoading || bankingType === 'syariah'}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '8px',
          backgroundColor: bankingType === 'syariah' ? '#2E7D32' : '#E0E0E0',
          color: bankingType === 'syariah' ? '#FFFFFF' : '#424242',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontWeight: 500,
          fontSize: '0.875rem'
        }}
      >
        🕌 Syariah
      </button>
    </div>
  );
};

export default ReactAdminDualBankingThemeProvider;
