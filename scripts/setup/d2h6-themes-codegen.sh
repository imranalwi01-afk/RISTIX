#!/bin/bash
# ============================================================================
# PSDD METHODOLOGY - DAY 2 HOUR 6 CODE GENERATION SCRIPT
# ============================================================================
# File Path: scripts/setup/d2h6-themes-codegen.sh
# Phase: D2H6 - Dual Banking Admin Themes Code Generation
# Objective: Generate all React Admin dual banking theme files
# Generated: $(date)
# Methodology: Phased Shell-Driven Development (PSDD)
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/psdd-d2h6-codegen-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D2H6-CODEGEN"
PHASE_NAME="Dual Banking Themes Code Generation"
FRONTEND_ROOT="${PROJECT_ROOT}/packages/frontend"

# MANDATORY: Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    local line_number=$1
    log_error "Script failed at line ${line_number} with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap 'handle_error ${LINENO}' ERR

# MANDATORY: Code generation function with path documentation
generate_code_file() {
    local file_path="$1"
    local file_type="$2"
    local description="$3"
    
    log_info "Generating ${file_type}: ${file_path}"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "${file_path}")"
    
    # The content will be added by specific generator functions
    log_success "Prepared to generate: ${file_path}"
}

# Generate conventional banking theme
generate_conventional_theme() {
    local theme_file="${FRONTEND_ROOT}/src/themes/conventional/theme.ts"
    generate_code_file "$theme_file" "Conventional Banking Theme" "Professional corporate banking theme"
    
    cat > "$theme_file" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/themes/conventional/theme.ts
// Generated: $(date)
// Phase: D2H6 - Dual Banking Admin Themes
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Material-UI, React Admin
// Purpose: Conventional banking professional theme configuration
// ============================================================================

import { createTheme, Theme } from '@mui/material/styles';
import { defaultTheme } from 'react-admin';

export interface ConventionalThemeConfig {
  palette: {
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    background: {
      default: string;
      paper: string;
    };
    success: {
      main: string;
      light: string;
      dark: string;
    };
    warning: {
      main: string;
      light: string;
      dark: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
    };
  };
  typography: {
    fontFamily: string;
    h1: object;
    h2: object;
    h3: object;
    h4: object;
    h5: object;
    h6: object;
    body1: object;
    body2: object;
  };
  components: object;
}

/**
 * Conventional Banking Theme Configuration
 * Professional corporate banking aesthetic with blue/gray color scheme
 */
export const conventionalThemeConfig: ConventionalThemeConfig = {
  palette: {
    primary: {
      main: '#1976D2',        // Professional Blue
      light: '#42A5F5',       // Light Blue
      dark: '#0D47A1',        // Dark Blue
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#424242',        // Corporate Gray
      light: '#616161',       // Light Gray
      dark: '#212121',        // Dark Gray
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#F5F5F5',     // Light Gray Background
      paper: '#FFFFFF'        // White Paper
    },
    success: {
      main: '#4CAF50',        // Success Green
      light: '#81C784',       // Light Green
      dark: '#388E3C'         // Dark Green
    },
    warning: {
      main: '#FF9800',        // Warning Orange
      light: '#FFB74D',       // Light Orange
      dark: '#F57C00'         // Dark Orange
    },
    error: {
      main: '#F44336',        // Error Red
      light: '#E57373',       // Light Red
      dark: '#D32F2F'         // Dark Red
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 500,
      color: '#1976D2',
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 500,
      color: '#1976D2',
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#424242',
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#424242',
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#424242',
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#424242',
      lineHeight: 1.6
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#212121'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: '#424242'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.12)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '4px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1976D2'
            }
          }
        }
      }
    }
  }
};

/**
 * Create conventional banking Material-UI theme
 */
export const createConventionalTheme = (): Theme => {
  return createTheme({
    ...defaultTheme,
    palette: {
      ...defaultTheme.palette,
      ...conventionalThemeConfig.palette,
      mode: 'light'
    },
    typography: {
      ...defaultTheme.typography,
      ...conventionalThemeConfig.typography
    },
    components: {
      ...defaultTheme.components,
      ...conventionalThemeConfig.components
    }
  });
};

/**
 * Export conventional banking theme instance
 */
export const conventionalBankingTheme = createConventionalTheme();

/**
 * Theme metadata for identification
 */
export const conventionalThemeMetadata = {
  name: 'Conventional Banking Theme',
  type: 'conventional',
  version: '1.0.0',
  description: 'Professional corporate banking theme with blue/gray color scheme',
  features: [
    'Professional blue primary color',
    'Corporate gray secondary color',
    'Clean typography',
    'Subtle hover effects',
    'Professional card design'
  ]
};
EOF

    log_success "Generated conventional banking theme"
}

# Generate syariah banking theme
generate_syariah_theme() {
    local theme_file="${FRONTEND_ROOT}/src/themes/syariah/theme.ts"
    generate_code_file "$theme_file" "Syariah Banking Theme" "Islamic banking theme with cultural elements"
    
    cat > "$theme_file" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/themes/syariah/theme.ts
// Generated: $(date)
// Phase: D2H6 - Dual Banking Admin Themes
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Material-UI, React Admin
// Purpose: Syariah banking Islamic theme with cultural design elements
// ============================================================================

import { createTheme, Theme } from '@mui/material/styles';
import { defaultTheme } from 'react-admin';

export interface SyariahThemeConfig {
  palette: {
    primary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    secondary: {
      main: string;
      light: string;
      dark: string;
      contrastText: string;
    };
    background: {
      default: string;
      paper: string;
    };
    success: {
      main: string;
      light: string;
      dark: string;
    };
    warning: {
      main: string;
      light: string;
      dark: string;
    };
    error: {
      main: string;
      light: string;
      dark: string;
    };
    halal: {
      main: string;
      light: string;
      dark: string;
    };
  };
  typography: {
    fontFamily: string;
    h1: object;
    h2: object;
    h3: object;
    h4: object;
    h5: object;
    h6: object;
    body1: object;
    body2: object;
  };
  components: object;
}

/**
 * Syariah Banking Theme Configuration
 * Islamic banking aesthetic with green/gold color scheme and cultural elements
 */
export const syariahThemeConfig: SyariahThemeConfig = {
  palette: {
    primary: {
      main: '#2E7D32',        // Islamic Green
      light: '#4CAF50',       // Light Green
      dark: '#1B5E20',        // Dark Green
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FF8F00',        // Islamic Gold
      light: '#FFB74D',       // Light Gold
      dark: '#E65100',        // Dark Gold
      contrastText: '#FFFFFF'
    },
    background: {
      default: '#FFF8E1',     // Warm Cream Background
      paper: '#FFFFFF'        // White Paper
    },
    success: {
      main: '#4CAF50',        // Halal Green
      light: '#81C784',       // Light Halal Green
      dark: '#388E3C'         // Dark Halal Green
    },
    warning: {
      main: '#FF9800',        // Warning Orange
      light: '#FFB74D',       // Light Orange
      dark: '#F57C00'         // Dark Orange
    },
    error: {
      main: '#D32F2F',        // Error Red (Haram)
      light: '#E57373',       // Light Red
      dark: '#B71C1C'         // Dark Red
    },
    halal: {
      main: '#4CAF50',        // Halal Indicator Green
      light: '#81C784',       // Light Halal Green
      dark: '#388E3C'         // Dark Halal Green
    }
  },
  typography: {
    fontFamily: '"Noto Sans Arabic", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#2E7D32',
      lineHeight: 1.2,
      fontFamily: '"Amiri", "Noto Serif Arabic", serif'
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#2E7D32',
      lineHeight: 1.3,
      fontFamily: '"Amiri", "Noto Serif Arabic", serif'
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: '#FF8F00',
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
      color: '#FF8F00',
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
      color: '#2E7D32',
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
      color: '#2E7D32',
      lineHeight: 1.6
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
      color: '#212121'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
      color: '#424242'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 500,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(46,125,50,0.2)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0 2px 12px rgba(46,125,50,0.1)',
          transition: 'all 0.3s ease',
          border: '1px solid rgba(46,125,50,0.1)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(46,125,50,0.15)',
            transform: 'translateY(-2px)'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#2E7D32'
            }
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          '&.halal-indicator': {
            backgroundColor: '#4CAF50',
            color: '#FFFFFF',
            fontWeight: 600
          },
          '&.haram-indicator': {
            backgroundColor: '#D32F2F',
            color: '#FFFFFF',
            fontWeight: 600
          }
        }
      }
    }
  }
};

/**
 * Create syariah banking Material-UI theme
 */
export const createSyariahTheme = (): Theme => {
  return createTheme({
    ...defaultTheme,
    palette: {
      ...defaultTheme.palette,
      ...syariahThemeConfig.palette,
      mode: 'light'
    },
    typography: {
      ...defaultTheme.typography,
      ...syariahThemeConfig.typography
    },
    components: {
      ...defaultTheme.components,
      ...syariahThemeConfig.components
    }
  });
};

/**
 * Export syariah banking theme instance
 */
export const syariahBankingTheme = createSyariahTheme();

/**
 * Theme metadata for identification
 */
export const syariahThemeMetadata = {
  name: 'Syariah Banking Theme',
  type: 'syariah',
  version: '1.0.0',
  description: 'Islamic banking theme with green/gold color scheme and cultural elements',
  features: [
    'Islamic green primary color',
    'Golden secondary color',
    'Arabic typography support',
    'Halal/Haram indicators',
    'Cultural design patterns',
    'Rounded corners for Islamic aesthetics'
  ]
};
EOF

    log_success "Generated syariah banking theme"
}

# Generate dual banking theme provider
generate_theme_provider() {
    local provider_file="${FRONTEND_ROOT}/src/themes/shared/theme.provider.tsx"
    generate_code_file "$provider_file" "Dual Banking Theme Provider" "React context provider for theme switching"
    
    cat > "$provider_file" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/themes/shared/theme.provider.tsx
// Generated: $(date)
// Phase: D2H6 - Dual Banking Admin Themes
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React, Material-UI, Redux Toolkit
// Purpose: Dual banking theme provider with dynamic switching
// ============================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeProvider as MUIThemeProvider, Theme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
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
 */
export const DualBankingThemeProvider: React.FC<DualBankingThemeProviderProps> = ({
  children,
  defaultBankingType = 'conventional',
  tenantConfig
}) => {
  const [currentBankingType, setCurrentBankingType] = useState<BankingType>(defaultBankingType);
  const [isLoading, setIsLoading] = useState(false);

  // Get theme preferences from Redux store
  const { 
    bankingType: storeBankingType,
    tenantId,
    themePreferences 
  } = useSelector((state: any) => ({
    bankingType: state.banking?.currentType || state.tenant?.currentTenant?.bankingType || defaultBankingType,
    tenantId: state.tenant?.currentTenant?.id,
    themePreferences: state.theme?.preferences
  }));

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

  // Get current theme based on banking type
  const getCurrentTheme = (): Theme => {
    switch (currentBankingType) {
      case 'syariah':
        return syariahBankingTheme;
      case 'conventional':
      case 'dual':
      default:
        return conventionalBankingTheme;
    }
  };

  // Get current theme metadata
  const getCurrentThemeMetadata = () => {
    switch (currentBankingType) {
      case 'syariah':
        return syariahThemeMetadata;
      case 'conventional':
      case 'dual':
      default:
        return conventionalThemeMetadata;
    }
  };

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

  // Context value
  const contextValue: ThemeContextValue = {
    currentTheme: getCurrentTheme(),
    bankingType: currentBankingType,
    switchTheme,
    themeMetadata: getCurrentThemeMetadata(),
    isLoading
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MUIThemeProvider theme={contextValue.currentTheme}>
        <CssBaseline />
        {children}
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
export const withDualBankingTheme = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.forwardRef<any, P>((props, ref) => {
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
EOF

    log_success "Generated dual banking theme provider"
}

# Generate React Admin theme provider
generate_react_admin_theme_provider() {
    local admin_provider_file="${FRONTEND_ROOT}/src/admin/themes/providers/DualBankingThemeProvider.tsx"
    generate_code_file "$admin_provider_file" "React Admin Theme Provider" "React Admin specific theme provider"
    
    cat > "$admin_provider_file" << 'EOF'
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
EOF

    log_success "Generated React Admin dual banking theme provider"
}

# Generate banking configuration
generate_banking_config() {
    local config_file="${FRONTEND_ROOT}/src/config/themes/banking.config.ts"
    generate_code_file "$config_file" "Banking Theme Configuration" "Central configuration for banking themes"
    
    cat > "$config_file" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/config/themes/banking.config.ts
// Generated: $(date)
// Phase: D2H6 - Dual Banking Admin Themes
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Environment Variables
// Purpose: Central banking theme configuration management
// ============================================================================

import { BankingType } from '../../themes/shared/theme.provider';

/**
 * Banking Theme Configuration Interface
 */
export interface BankingThemeConfig {
  conventional: {
    enabled: boolean;
    name: string;
    displayName: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    features: string[];
  };
  syariah: {
    enabled: boolean;
    name: string;
    displayName: string;
    description: string;
    primaryColor: string;
    secondaryColor: string;
    features: string[];
    complianceFeatures: string[];
  };
  dual: {
    enabled: boolean;
    defaultMode: BankingType;
    allowSwitching: boolean;
  };
}

/**
 * Default Banking Theme Configuration
 * All values should be configurable through environment variables
 */
export const defaultBankingThemeConfig: BankingThemeConfig = {
  conventional: {
    enabled: process.env.NEXT_PUBLIC_BANKING_CONVENTIONAL === 'true' || true,
    name: 'conventional',
    displayName: 'Conventional Banking',
    description: 'Professional corporate banking interface',
    primaryColor: process.env.NEXT_PUBLIC_CONVENTIONAL_PRIMARY_COLOR || '#1976D2',
    secondaryColor: process.env.NEXT_PUBLIC_CONVENTIONAL_SECONDARY_COLOR || '#424242',
    features: [
      'Interest-based calculations',
      'Corporate reporting',
      'Traditional banking products',
      'Standard risk management',
      'Conventional compliance reporting'
    ]
  },
  syariah: {
    enabled: process.env.NEXT_PUBLIC_BANKING_SYARIAH === 'true' || true,
    name: 'syariah',
    displayName: 'Syariah Banking',
    description: 'Islamic banking interface with cultural elements',
    primaryColor: process.env.NEXT_PUBLIC_SYARIAH_PRIMARY_COLOR || '#2E7D32',
    secondaryColor: process.env.NEXT_PUBLIC_SYARIAH_SECONDARY_COLOR || '#FF8F00',
    features: [
      'Profit-sharing calculations',
      'Islamic product management',
      'Syariah-compliant reporting',
      'Halal/Haram indicators',
      'Cultural design elements'
    ],
    complianceFeatures: [
      'AAOIFI standards compliance',
      'Syariah board approval tracking',
      'Prohibited sector screening',
      'Islamic calendar support',
      'Arabic language support',
      'Zakat calculation support'
    ]
  },
  dual: {
    enabled: process.env.NEXT_PUBLIC_BANKING_DUAL_MODE === 'true' || true,
    defaultMode: (process.env.NEXT_PUBLIC_BANKING_DEFAULT_TYPE as BankingType) || 'conventional',
    allowSwitching: process.env.NEXT_PUBLIC_ALLOW_BANKING_SWITCHING === 'true' || true
  }
};

/**
 * Environment-specific configurations
 */
export const environmentBankingConfig = {
  development: {
    ...defaultBankingThemeConfig,
    dual: {
      ...defaultBankingThemeConfig.dual,
      allowSwitching: true
    }
  },
  staging: {
    ...defaultBankingThemeConfig,
    dual: {
      ...defaultBankingThemeConfig.dual,
      allowSwitching: true
    }
  },
  production: {
    ...defaultBankingThemeConfig,
    dual: {
      ...defaultBankingThemeConfig.dual,
      allowSwitching: process.env.NEXT_PUBLIC_ALLOW_BANKING_SWITCHING === 'true' || false
    }
  }
};

/**
 * Get banking configuration for current environment
 */
export const getBankingConfig = (): BankingThemeConfig => {
  const environment = process.env.NODE_ENV as keyof typeof environmentBankingConfig;
  return environmentBankingConfig[environment] || defaultBankingThemeConfig;
};

/**
 * Banking Feature Flags
 */
export const bankingFeatureFlags = {
  CONVENTIONAL_BANKING: process.env.NEXT_PUBLIC_FEATURE_CONVENTIONAL_BANKING === 'true' || true,
  SYARIAH_BANKING: process.env.NEXT_PUBLIC_FEATURE_SYARIAH_BANKING === 'true' || true,
  DUAL_BANKING: process.env.NEXT_PUBLIC_FEATURE_DUAL_BANKING === 'true' || true,
  THEME_SWITCHING: process.env.NEXT_PUBLIC_FEATURE_THEME_SWITCHING === 'true' || true,
  TENANT_CUSTOMIZATION: process.env.NEXT_PUBLIC_FEATURE_TENANT_CUSTOMIZATION === 'true' || true,
  MULTI_LANGUAGE: process.env.NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE === 'true' || true,
  SYARIAH_COMPLIANCE: process.env.NEXT_PUBLIC_FEATURE_SYARIAH_COMPLIANCE === 'true' || true,
  CULTURAL_ELEMENTS: process.env.NEXT_PUBLIC_FEATURE_CULTURAL_ELEMENTS === 'true' || true
};

/**
 * Validate banking configuration
 */
export const validateBankingConfig = (config: BankingThemeConfig): boolean => {
  try {
    // Check if at least one banking mode is enabled
    if (!config.conventional.enabled && !config.syariah.enabled) {
      console.error('At least one banking mode must be enabled');
      return false;
    }
    
    // Validate dual mode configuration
    if (config.dual.enabled) {
      if (!config.conventional.enabled && !config.syariah.enabled) {
        console.error('Dual mode requires at least one banking mode to be enabled');
        return false;
      }
      
      if (config.dual.defaultMode === 'conventional' && !config.conventional.enabled) {
        console.error('Default mode cannot be conventional if conventional banking is disabled');
        return false;
      }
      
      if (config.dual.defaultMode === 'syariah' && !config.syariah.enabled) {
        console.error('Default mode cannot be syariah if syariah banking is disabled');
        return false;
      }
    }
    
    // Validate color formats (basic validation)
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(config.conventional.primaryColor)) {
      console.error('Invalid conventional primary color format');
      return false;
    }
    
    if (!colorRegex.test(config.syariah.primaryColor)) {
      console.error('Invalid syariah primary color format');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Banking configuration validation error:', error);
    return false;
  }
};

/**
 * Export current banking configuration
 */
export const currentBankingConfig = getBankingConfig();

/**
 * Validate current configuration on module load
 */
if (!validateBankingConfig(currentBankingConfig)) {
  console.warn('Banking configuration validation failed, using defaults');
}
EOF

    log_success "Generated banking theme configuration"
}

# Generate theme types
generate_theme_types() {
    local types_file="${FRONTEND_ROOT}/src/types/theme.types.ts"
    generate_code_file "$types_file" "Theme Type Definitions" "TypeScript types for theme system"
    
    cat > "$types_file" << 'EOF'
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/types/theme.types.ts
// Generated: $(date)
// Phase: D2H6 - Dual Banking Admin Themes
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Material-UI, React Admin
// Purpose: TypeScript type definitions for dual banking theme system
// ============================================================================

import { Theme } from '@mui/material/styles';

/**
 * Banking Types
 */
export type BankingType = 'conventional' | 'syariah' | 'dual';

/**
 * Theme Mode Types
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Language Types
 */
export type LanguageType = 'en' | 'id' | 'ar';

/**
 * Direction Types for RTL support
 */
export type DirectionType = 'ltr' | 'rtl';

/**
 * Banking Theme Configuration
 */
export interface BankingThemeConfiguration {
  bankingType: BankingType;
  mode: ThemeMode;
  primaryColor: string;
  secondaryColor: string;
  backgroundDefault: string;
  backgroundPaper: string;
  textPrimary: string;
  textSecondary: string;
  fontFamily: string;
  borderRadius: number;
  customizations?: ThemeCustomizations;
}

/**
 * Theme Customizations
 */
export interface ThemeCustomizations {
  logoUrl?: string;
  brandName?: string;
  faviconUrl?: string;
  customCss?: string;
  headerHeight?: number;
  sidebarWidth?: number;
  primaryFont?: string;
  secondaryFont?: string;
  accentColor?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
}

/**
 * Tenant Theme Configuration
 */
export interface TenantThemeConfiguration {
  tenantId: string;
  tenantName: string;
  bankingType: BankingType;
  allowThemeSwitching: boolean;
  defaultLanguage: LanguageType;
  defaultDirection: DirectionType;
  customizations: ThemeCustomizations;
  createdAt: string;
  updatedAt: string;
}

/**
 * Theme Context State
 */
export interface ThemeContextState {
  currentTheme: Theme;
  bankingType: BankingType;
  mode: ThemeMode;
  language: LanguageType;
  direction: DirectionType;
  isLoading: boolean;
  error?: string;
  tenantConfig?: TenantThemeConfiguration;
}

/**
 * Theme Actions
 */
export interface ThemeActions {
  switchBankingType: (type: BankingType) => Promise<void>;
  switchMode: (mode: ThemeMode) => Promise<void>;
  switchLanguage: (language: LanguageType) => Promise<void>;
  switchDirection: (direction: DirectionType) => Promise<void>;
  updateCustomizations: (customizations: Partial<ThemeCustomizations>) => Promise<void>;
  resetTheme: () => Promise<void>;
}

/**
 * Theme Provider Props
 */
export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultBankingType?: BankingType;
  defaultMode?: ThemeMode;
  defaultLanguage?: LanguageType;
  tenantConfig?: TenantThemeConfiguration;
  onThemeChange?: (state: ThemeContextState) => void;
}

/**
 * Banking Theme Metadata
 */
export interface BankingThemeMetadata {
  name: string;
  type: BankingType;
  version: string;
  description: string;
  features: string[];
  complianceFeatures?: string[];
  culturalElements?: string[];
  supportedLanguages: LanguageType[];
  supportedDirections: DirectionType[];
}

/**
 * Theme Validation Result
 */
export interface ThemeValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Theme Configuration Response
 */
export interface ThemeConfigurationResponse {
  success: boolean;
  data?: TenantThemeConfiguration;
  error?: string;
  message?: string;
}

/**
 * Islamic Design Elements
 */
export interface IslamicDesignElements {
  geometricPatterns: boolean;
  arabicCalligraphy: boolean;
  islamicColors: boolean;
  halalIndicators: boolean;
  haramIndicators: boolean;
  qiblaDirection: boolean;
  islamicCalendar: boolean;
  zakatCalculator: boolean;
}

/**
 * Conventional Banking Elements
 */
export interface ConventionalBankingElements {
  corporateDesign: boolean;
  professionalColors: boolean;
  traditionalLayouts: boolean;
  businessGraphics: boolean;
  corporateTypography: boolean;
  standardCompliance: boolean;
}

/**
 * Extended Banking Theme Configuration
 */
export interface ExtendedBankingThemeConfiguration extends BankingThemeConfiguration {
  islamicElements?: IslamicDesignElements;
  conventionalElements?: ConventionalBankingElements;
  compliance: {
    aaoifi?: boolean;
    ifrs?: boolean;
    basel?: boolean;
    localRegulations?: string[];
  };
}

/**
 * Theme Event Types
 */
export type ThemeEventType = 
  | 'theme-switched'
  | 'banking-type-changed'
  | 'mode-changed'
  | 'language-changed'
  | 'direction-changed'
  | 'customizations-updated'
  | 'theme-reset'
  | 'theme-error';

/**
 * Theme Event Data
 */
export interface ThemeEventData {
  type: ThemeEventType;
  timestamp: string;
  tenantId?: string;
  userId?: string;
  previousState?: Partial<ThemeContextState>;
  newState?: Partial<ThemeContextState>;
  error?: string;
}

/**
 * Theme Analytics Data
 */
export interface ThemeAnalyticsData {
  themeUsage: Record<BankingType, number>;
  modeUsage: Record<ThemeMode, number>;
  languageUsage: Record<LanguageType, number>;
  directionUsage: Record<DirectionType, number>;
  switchingFrequency: number;
  popularCustomizations: string[];
  tenantPreferences: Record<string, BankingType>;
}

/**
 * Theme Export Configuration
 */
export interface ThemeExportConfiguration {
  includeCustomizations: boolean;
  includeAnalytics: boolean;
  format: 'json' | 'css' | 'scss' | 'javascript';
  minify: boolean;
  includeMetadata: boolean;
}

/**
 * Type Guards
 */
export const isBankingType = (value: any): value is BankingType => {
  return ['conventional', 'syariah', 'dual'].includes(value);
};

export const isThemeMode = (value: any): value is ThemeMode => {
  return ['light', 'dark'].includes(value);
};

export const isLanguageType = (value: any): value is LanguageType => {
  return ['en', 'id', 'ar'].includes(value);
};

export const isDirectionType = (value: any): value is DirectionType => {
  return ['ltr', 'rtl'].includes(value);
};
EOF

    log_success "Generated theme type definitions"
}

# Main execution function
main() {
    log_info "Starting ${PHASE_NAME} code generation (${PHASE_ID})..."
    
    # Generate all theme files
    generate_conventional_theme
    generate_syariah_theme
    generate_theme_provider
    generate_react_admin_theme_provider
    generate_banking_config
    generate_theme_types
    
    log_success "=== ${PHASE_NAME} code generation completed successfully! ==="
    log_info "Generated files:"
    log_info "- Conventional banking theme"
    log_info "- Syariah banking theme"
    log_info "- Dual banking theme provider"
    log_info "- React Admin theme provider"
    log_info "- Banking configuration"
    log_info "- Theme type definitions"
}

# Execute main function
main "$@"