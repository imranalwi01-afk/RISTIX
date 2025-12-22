// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/themes/syariahTheme.ts
// Generated: Day 2 Hour 6 - Part 1 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Material-UI v6, React Admin v4
// Purpose: Islamic banking theme with cultural elements and AAOIFI compliance
// ============================================================================

import { createTheme, Theme } from '@mui/material/styles';
import { RaThemeOptions } from 'react-admin';

/**
 * Syariah Banking Theme Configuration
 * Islamic-inspired design with green color scheme and cultural elements
 * Optimized for Islamic banking operations and AAOIFI compliance
 */

// Islamic Banking Color Palette
const syariahColors = {
  primary: {
    main: '#2e7d32',       // Islamic green
    light: '#4caf50',      // Light green
    dark: '#1b5e20',       // Dark green
    contrastText: '#ffffff'
  },
  secondary: {
    main: '#d4af37',       // Islamic gold
    light: '#f9e79f',      // Light gold
    dark: '#b7950b',       // Dark gold
    contrastText: '#000000'
  },
  success: {
    main: '#27ae60',       // Success green
    light: '#2ecc71',
    dark: '#1e8449',
    contrastText: '#ffffff'
  },
  warning: {
    main: '#f39c12',       // Islamic orange
    light: '#f7dc6f',
    dark: '#d68910',
    contrastText: '#000000'
  },
  error: {
    main: '#c0392b',       // Muted red (culturally appropriate)
    light: '#e74c3c',
    dark: '#922b21',
    contrastText: '#ffffff'
  },
  info: {
    main: '#3498db',       // Info blue
    light: '#5dade2',
    dark: '#2874a6',
    contrastText: '#ffffff'
  },
  background: {
    default: '#f8f9fa',    // Very light background
    paper: '#ffffff'       // Pure white paper
  },
  text: {
    primary: '#2c3e50',    // Dark blue-grey text
    secondary: '#7f8c8d'   // Medium grey text
  }
};

// Typography Configuration for Islamic Banking
const syariahTypography = {
  fontFamily: [
    'Amiri',              // Arabic-friendly font
    'Roboto',
    'Arial',
    'sans-serif'
  ].join(','),
  fontSize: 14,
  h1: {
    fontSize: '2.5rem',
    fontWeight: 400,
    letterSpacing: '-0.01562em',
    fontFamily: 'Amiri, serif'
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 400,
    letterSpacing: '-0.00833em',
    fontFamily: 'Amiri, serif'
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 400,
    letterSpacing: '0em',
    fontFamily: 'Amiri, serif'
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 400,
    letterSpacing: '0.00735em'
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 400,
    letterSpacing: '0em'
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 500,
    letterSpacing: '0.0075em'
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    letterSpacing: '0.00938em',
    lineHeight: 1.6
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    letterSpacing: '0.01071em',
    lineHeight: 1.5
  }
};

// Component Style Overrides for Islamic Banking
const syariahComponents = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: syariahColors.primary.main,
        color: syariahColors.primary.contrastText,
        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.2)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${syariahColors.primary.main}, ${syariahColors.secondary.main}, ${syariahColors.primary.main})`
        }
      }
    }
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#fafafa',
        borderRight: `2px solid ${syariahColors.primary.light}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '4px',
          background: `linear-gradient(180deg, ${syariahColors.primary.main}, ${syariahColors.secondary.main})`
        }
      }
    }
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        textTransform: 'none',
        fontWeight: 500,
        padding: '8px 16px'
      },
      contained: {
        boxShadow: '0 3px 6px rgba(46, 125, 50, 0.2)',
        '&:hover': {
          boxShadow: '0 6px 12px rgba(46, 125, 50, 0.3)',
          transform: 'translateY(-1px)'
        }
      }
    }
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        border: `1px solid ${syariahColors.primary.light}`,
        '&:hover': {
          boxShadow: '0 8px 24px rgba(46, 125, 50, 0.15)',
          transform: 'translateY(-2px)'
        },
        transition: 'all 0.3s ease-in-out'
      }
    }
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: syariahColors.primary.light,
        background: `linear-gradient(45deg, ${syariahColors.primary.light}, ${syariahColors.primary.main})`,
        '& .MuiTableCell-head': {
          fontWeight: 600,
          color: syariahColors.primary.contrastText,
          textAlign: 'center'
        }
      }
    }
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 20,
        fontWeight: 500,
        border: `1px solid ${syariahColors.primary.light}`
      },
      filled: {
        background: `linear-gradient(45deg, ${syariahColors.primary.main}, ${syariahColors.primary.light})`
      }
    }
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 12,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: syariahColors.primary.main,
            borderWidth: 2
          }
        }
      }
    }
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        '&:before': {
          display: 'none'
        },
        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.1)'
      }
    }
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': {
            color: syariahColors.primary.main
          }
        },
        '& .MuiTabs-indicator': {
          backgroundColor: syariahColors.secondary.main,
          height: 3,
          borderRadius: 2
        }
      }
    }
  }
};

// React Admin specific theme customizations for Islamic Banking
const reactAdminOverrides: Partial<RaThemeOptions> = {
  sidebar: {
    width: 260,
    closedWidth: 55
  },
  components: {
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 12px',
          padding: '8px 16px',
          '&.RaMenuItemLink-active': {
            background: `linear-gradient(45deg, ${syariahColors.primary.main}, ${syariahColors.primary.light})`,
            color: syariahColors.primary.contrastText,
            boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
            '& .MuiListItemIcon-root': {
              color: syariahColors.primary.contrastText
            }
          },
          '&:hover': {
            backgroundColor: syariahColors.primary.light,
            color: syariahColors.primary.contrastText,
            '& .MuiListItemIcon-root': {
              color: syariahColors.primary.contrastText
            }
          }
        }
      }
    },
    RaLayout: {
      styleOverrides: {
        root: {
          '& .RaLayout-appFrame': {
            marginTop: 0
          }
        }
      }
    },
    RaTopToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          minHeight: 48,
          borderRadius: 12,
          margin: '8px'
        }
      }
    },
    RaSidebar: {
      styleOverrides: {
        root: {
          '& .MuiDrawer-paper': {
            '&::after': {
              content: '"☪"',
              position: 'absolute',
              bottom: 16,
              right: 16,
              fontSize: '24px',
              color: syariahColors.primary.light,
              opacity: 0.3
            }
          }
        }
      }
    }
  }
};

/**
 * Create Syariah Banking Theme
 * Islamic-inspired theme optimized for Syariah banking operations
 */
export const syariahTheme: Theme = createTheme({
  palette: {
    mode: 'light',
    ...syariahColors
  },
  typography: syariahTypography,
  shape: {
    borderRadius: 12
  },
  spacing: 8,
  components: syariahComponents,
  ...reactAdminOverrides
} as any);

// Export theme variants
export const syariahThemeVariants = {
  light: syariahTheme,
  dark: createTheme({
    ...syariahTheme,
    palette: {
      mode: 'dark',
      primary: {
        main: '#66bb6a',
        light: '#81c784',
        dark: '#388e3c',
        contrastText: '#000000'
      },
      secondary: {
        main: '#ffecb3',
        light: '#fff8e1',
        dark: '#ffc02c',
        contrastText: '#000000'
      },
      background: {
        default: '#1a1a1a',
        paper: '#2d2d2d'
      },
      text: {
        primary: '#ffffff',
        secondary: '#cccccc'
      }
    }
  } as any)
};

// Theme configuration metadata
export const syariahThemeConfig = {
  name: 'Syariah Banking',
  type: 'syariah',
  description: 'Islamic-inspired theme for Syariah banking operations',
  features: [
    'Islamic green and gold color scheme',
    'Arabic-friendly typography (Amiri font)',
    'Cultural design elements',
    'AAOIFI compliance optimized',
    'Rounded, organic shapes',
    'Gradient accents',
    'Islamic geometric patterns'
  ],
  compliance: [
    'AAOIFI Shariah compliant',
    'Cultural sensitivity maintained',
    'WCAG 2.1 AA compliant',
    'RTL (Right-to-Left) ready',
    'Islamic calendar support'
  ],
  culturalElements: [
    'Islamic crescent moon symbol',
    'Green and gold color harmony',
    'Geometric pattern inspirations',
    'Arabic typography support',
    'Respectful visual hierarchy'
  ]
};

export default syariahTheme;