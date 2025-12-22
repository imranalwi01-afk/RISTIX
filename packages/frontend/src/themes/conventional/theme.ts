// packages/frontend/src/themes/conventional/theme.ts
// ============================================================================
// IFRS9 CONVENTIONAL BANKING THEME - ENHANCED COMPACT DESIGN
// ============================================================================
// Purpose: Material-UI theme for conventional banking interface
// ✅ ENHANCED: Cleaner, more compact design with fixed card heights
// ✅ OPTIMIZED: Better spacing, improved typography, responsive design
// ============================================================================

import { createTheme, Theme } from '@mui/material/styles';

// Conventional Banking Color Palette (Professional Blue Theme)
const conventionalColors = {
  primary: {
    main: '#0078BD',      // Professional blue
    light: '#3393ca',     // Light blue
    dark: '#005a8f',      // Dark blue
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#2D4B92',      // Navy blue
    light: '#5a6fb8',     // Light navy
    dark: '#1e336b',      // Dark navy
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50',      // Green
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ff9800',      // Orange
    light: '#ffb74d',
    dark: '#f57c00',
  },
  error: {
    main: '#f44336',      // Red
    light: '#e57373',
    dark: '#d32f2f',
  },
  info: {
    main: '#2196f3',      // Blue
    light: '#64b5f6',
    dark: '#1976d2',
  },
  background: {
    default: '#fafafa',   // Lighter gray for cleaner look
    paper: '#ffffff',     // White
  },
  text: {
    primary: '#2c3e50',   // Darker text for better contrast
    secondary: '#5a6c7d', // Softer secondary text
  },
};

// Enhanced Typography configuration - more compact and clean
const typography = {
  fontFamily: [
    'Roboto',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.25rem',    // Reduced from 2.5rem
    fontWeight: 600,
    lineHeight: 1.2,
    marginBottom: '0.5rem', // Compact spacing
  },
  h2: {
    fontSize: '1.875rem',   // Reduced from 2rem
    fontWeight: 600,
    lineHeight: 1.3,
    marginBottom: '0.5rem',
  },
  h3: {
    fontSize: '1.5rem',     // Reduced from 1.75rem
    fontWeight: 600,
    lineHeight: 1.3,
    marginBottom: '0.4rem',
  },
  h4: {
    fontSize: '1.25rem',    // Reduced from 1.5rem
    fontWeight: 600,
    lineHeight: 1.4,
    marginBottom: '0.4rem',
  },
  h5: {
    fontSize: '1.125rem',    // Reduced from 1.25rem
    fontWeight: 600,
    lineHeight: 1.4,
    marginBottom: '0.3rem',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
    marginBottom: '0.3rem',
  },
  body1: {
    fontSize: '0.95rem',    // Slightly reduced from 1rem
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.8125rem',  // Reduced from 0.875rem
    lineHeight: 1.4,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 500,        // Reduced from 600
    fontSize: '0.875rem',   // Smaller buttons
  },
};

// Enhanced Component customizations - cleaner and more compact
const components = {
  // KEEP SHARP: AppBar (navigation header)
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: conventionalColors.primary.main,
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',  // Softer shadow
        borderRadius: 0,
        height: '64px', // Consistent height
      },
    },
  },

  // KEEP SHARP: Drawer components
  MuiDrawer: {
    styleOverrides: {
      root: {
        '& .MuiDrawer-paper': {
          borderRadius: 0,
          borderRight: '1px solid rgba(0,0,0,0.12)', // Subtle border
        },
      },
      paper: {
        borderRadius: 0,
      },
    },
  },

  // KEEP SHARP: Toolbar (inside AppBar)
  MuiToolbar: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        minHeight: '64px',
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
  },

  // KEEP SHARP: List components (sidebar menu items)
  MuiList: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        padding: '4px 8px', // Reduced padding
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 4, // Slightly rounded list items
        marginBottom: '2px', // Compact spacing
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        minHeight: '40px', // Compact height
        fontSize: '0.875rem',
        padding: '6px 12px',
        '&:hover': {
          backgroundColor: 'rgba(0,120,189,0.04)',
        },
      },
    },
  },

  // Enhanced Buttons (content area) - more compact
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 6, // Smaller radius for compact look
        textTransform: 'none' as const,
        fontWeight: 500,
        minHeight: '36px', // Reduced from 40px
        fontSize: '0.875rem',
        padding: '6px 16px',
        transition: 'all 0.2s ease',
      },
      contained: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        '&:hover': {
          boxShadow: '0 2px 6px rgba(0,0,0,0.16)',
          transform: 'translateY(-1px)',
        },
      },
      outlined: {
        borderWidth: '1.5px',
        '&:hover': {
          borderWidth: '2px',
        },
      },
    },
  },

  // Enhanced Cards (content area) - FIXED HEIGHT ISSUES
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8, // Smaller radius for cleaner look
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',  // Subtler shadow
        height: 'auto', // ✅ FIXED: Auto height to follow content
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        overflow: 'hidden', // Prevent content overflow
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },

  // Enhanced Papers (content area) - more compact
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 6, // Smaller radius
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
      elevation1: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      },
      elevation2: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
      },
    },
  },

  // Enhanced Text fields (forms) - more compact
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 6, // Smaller radius
          minHeight: '40px',
          fontSize: '0.875rem',
          '& fieldset': {
            borderColor: 'rgba(0,0,0,0.23)',
          },
          '&.Mui-focused fieldset': {
            borderColor: conventionalColors.primary.main,
            borderWidth: '2px',
          },
        },
      },
    },
  },

  // Enhanced Chips (tags/badges) - more compact
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 12, // Smaller radius
        fontSize: '0.75rem',
        fontWeight: 500,
        height: '24px',
      },
      label: {
        paddingLeft: '8px',
        paddingRight: '8px',
      },
    },
  },

  // Enhanced Table Headers - cleaner and more compact
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: conventionalColors.background.default,
        '& .MuiTableCell-head': {
          fontWeight: 600,
          color: conventionalColors.text.primary,
          fontSize: '0.875rem', // Smaller font
          padding: '12px 16px',   // Compact padding
          borderBottom: '2px solid rgba(0,0,0,0.06)',
        },
      },
    },
  },
  MuiTableBody: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-body': {
          fontSize: '0.8125rem',
          padding: '10px 16px', // Compact padding
          borderBottom: '1px solid rgba(0,0,0,0.04)',
        },
      },
    },
  },

  // Enhanced Alerts - more compact
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 6, // Smaller radius
        fontSize: '0.875rem',
        padding: '12px 16px',
      },
      standardSuccess: {
        backgroundColor: '#e8f5e8',
        border: '1px solid #4caf50',
        borderRadius: 6,
      },
      standardInfo: {
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: 6,
      },
    },
  },

  // Enhanced Cards Content - better spacing
  MuiCardContent: {
    styleOverrides: {
      root: {
        padding: '16px', // Reduced padding
        '&:last-child': {
          paddingBottom: '16px',
        },
      },
    },
  },

  // Enhanced Card Header - more compact
  MuiCardHeader: {
    styleOverrides: {
      root: {
        padding: '12px 16px', // Compact padding
        minHeight: '48px', // Reduced height
        '& .MuiCardHeader-title': {
          fontSize: '1rem',
          fontWeight: 600,
        },
        '& .MuiCardHeader-subheader': {
          fontSize: '0.875rem',
          color: conventionalColors.text.secondary,
        },
      },
    },
  },

  // Enhanced Box container - better spacing
  MuiBox: {
    defaultProps: {
      suppressHydrationWarning: true,
    },
  },
};

// Enhanced Theme Configuration
let conventionalBankingTheme: Theme;

try {
  conventionalBankingTheme = createTheme({
    palette: conventionalColors,
    typography,
    components,
    shape: {
      borderRadius: 6, // Smaller global radius for cleaner look
    },
    spacing: 6, // Reduced spacing unit (from 8 to 6)
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,     // Reduced from 960
        lg: 1200,    // Reduced from 1280
        xl: 1536,    // Reduced from 1920
      },
    },
    // Custom spacing for more compact design
    customSpacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 20,
    },
  });
} catch (error) {
  console.error('❌ Error creating conventional banking theme:', error);
  // Fallback to basic theme if creation fails
  conventionalBankingTheme = createTheme({
    palette: {
      primary: { main: '#0078BD' },
      secondary: { main: '#2D4B92' },
    },
    shape: {
      borderRadius: 6,
    },
  });
}

// Custom theme extensions for conventional banking
export const conventionalThemeExtensions = {
  banking: {
    mode: 'conventional' as const,
    colors: conventionalColors,
    gradients: {
      primary: 'linear-gradient(135deg, #0078BD 0%, #3393ca 100%)',
      secondary: 'linear-gradient(135deg, #2D4B92 0%, #5a6fb8 100%)',
      success: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
    },
    shadows: {
      card: '0 1px 3px rgba(0,0,0,0.1)',
      button: '0 1px 3px rgba(0,0,0,0.12)',
      hover: '0 4px 12px rgba(0,0,0,0.15)',
    },
    shape: {
      navigation: 0,    // SHARP: Navigation elements
      content: 6,       // ROUNDED: Content elements
      cards: 8,         // ROUNDED: Cards
      chips: 12,        // ROUNDED: Chips
      buttons: 6,      // ROUNDED: Buttons
      textFields: 6,   // ROUNDED: Text fields
    },
    compact: {
      enabled: true,
      scale: 0.95, // 5% smaller for more compact design
      spacing: {
        reduced: true,
        factor: 0.75,
      },
    },
  },
};

// Multiple export formats to ensure compatibility
export { conventionalBankingTheme };
export default conventionalBankingTheme;