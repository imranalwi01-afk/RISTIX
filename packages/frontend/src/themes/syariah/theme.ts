// packages/frontend/src/themes/syariah/theme.ts
// ============================================================================
// IFRS9 SYARIAH BANKING THEME - SURGICAL FIX: SELECTIVE ROUNDED CORNERS
// ============================================================================
// Purpose: Material-UI theme for Islamic banking interface
// ✅ SURGICAL FIX: AppBar & Sidebar SHARP, other components ROUNDED
// ✅ PERFECT: Sharp navigation, modern rounded components
// ============================================================================

import { createTheme, Theme } from '@mui/material/styles';

// Syariah Banking Color Palette (Islamic-inspired)
const syariahColors = {
  primary: {
    main: '#2e7d32',      // Islamic green
    light: '#66bb6a',     // Light green
    dark: '#1b5e20',      // Dark green
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#8bc34a',      // Lighter green
    light: '#c5e1a5',     // Very light green
    dark: '#689f38',      // Medium green
    contrastText: '#ffffff',
  },
  success: {
    main: '#4caf50',      // Success green
    light: '#81c784',
    dark: '#388e3c',
  },
  warning: {
    main: '#ff9800',      // Halal-compliant orange
    light: '#ffb74d',
    dark: '#f57c00',
  },
  error: {
    main: '#f44336',      // Error red
    light: '#e57373',
    dark: '#d32f2f',
  },
  info: {
    main: '#00acc1',      // Teal (Islamic color)
    light: '#4dd0e1',
    dark: '#00838f',
  },
  background: {
    default: '#f1f8e9',   // Very light green
    paper: '#ffffff',     // White
  },
  text: {
    primary: '#1b5e20',   // Dark green
    secondary: '#2e7d32', // Islamic green
  },
};

// Typography with Islamic-friendly fonts
const typography = {
  fontFamily: [
    'Roboto',
    'Noto Sans Arabic',  // Support for Arabic text
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.43,
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 600,
  },
};

// ✅ SURGICAL FIX: Component customizations - SHARP navigation, ROUNDED components
const components = {
  // ✅ KEEP SHARP: AppBar (navigation header)
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: syariahColors.primary.main,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        borderRadius: 0, // ✅ SHARP: AppBar stays boxy
      },
    },
  },

  // ✅ KEEP SHARP: Drawer (Sidebar) components
  MuiDrawer: {
    styleOverrides: {
      root: {
        '& .MuiDrawer-paper': {
          borderRadius: 0, // ✅ SHARP: Sidebar stays boxy
        },
      },
      paper: {
        borderRadius: 0, // ✅ SHARP: Sidebar paper stays boxy
      },
    },
  },

  // ✅ KEEP SHARP: Toolbar (inside AppBar)
  MuiToolbar: {
    styleOverrides: {
      root: {
        borderRadius: 0, // ✅ SHARP: Toolbar stays boxy
      },
    },
  },

  // ✅ KEEP SHARP: List components (sidebar menu items)
  MuiList: {
    styleOverrides: {
      root: {
        borderRadius: 0, // ✅ SHARP: Sidebar lists stay boxy
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 0, // ✅ SHARP: Sidebar list items stay boxy
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 0, // ✅ SHARP: Sidebar menu buttons stay boxy
      },
    },
  },

  // ✅ MAKE ROUNDED: Regular buttons (content area)
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8, // ✅ ROUNDED: Modern rounded buttons
        textTransform: 'none' as const,
        fontWeight: 600,
        minHeight: 40,
      },
      contained: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },

  // ✅ MAKE ROUNDED: Cards (content area) - FIXED HEIGHT ISSUES
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 10, // Smaller radius for cleaner look
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',  // Subtler shadow
        border: `1px solid ${syariahColors.primary.light}`,
        height: 'auto', // ✅ FIXED: Auto height to follow content
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.2s ease',
        overflow: 'hidden', // Prevent content overflow
        '&:hover': {
          boxShadow: '0 4px 12px rgba(46,125,50,0.15)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },

  // ✅ MAKE ROUNDED: Papers (content area)
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8, // ✅ ROUNDED: Modern rounded papers
      },
    },
  },

  // ✅ MAKE ROUNDED: Text fields (forms)
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8, // ✅ ROUNDED: Modern rounded text fields
          '&.Mui-focused fieldset': {
            borderColor: syariahColors.primary.main,
          },
        },
      },
    },
  },

  // ✅ MAKE ROUNDED: Chips (tags/badges)
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16, // ✅ ROUNDED: Modern rounded chips
        backgroundColor: syariahColors.primary.light,
        color: syariahColors.text.primary,
      },
    },
  },

  // ✅ TABLE HEADERS: Keep clean (no specific rounding)
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: syariahColors.background.default,
        '& .MuiTableCell-head': {
          fontWeight: 600,
          color: syariahColors.text.primary,
        },
      },
    },
  },

  // ✅ ISLAMIC-SPECIFIC: Rounded alerts with cultural styling
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8, // ✅ ROUNDED: Modern rounded alerts
      },
      standardSuccess: {
        backgroundColor: '#e8f5e8',
        border: `1px solid ${syariahColors.success.main}`,
        borderRadius: 8, // ✅ ROUNDED: Success alerts
      },
      standardInfo: {
        backgroundColor: '#e0f2f1',
        border: `1px solid ${syariahColors.info.main}`,
        borderRadius: 8, // ✅ ROUNDED: Info alerts
      },
    },
  },

  // ✅ BOX: Default component - no specific styling (inherits global)
  MuiBox: {
    defaultProps: {
      suppressHydrationWarning: true,
    },
  },
};

// ✅ SURGICAL FIX: Create theme with SELECTIVE rounding
let syariahBankingTheme: Theme;

try {
  syariahBankingTheme = createTheme({
    palette: syariahColors,
    typography,
    components: components as any,
    shape: {
      borderRadius: 8, // ✅ GLOBAL DEFAULT: Modern rounded (overridden where needed)
    },
    spacing: 8,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
    },
    direction: 'ltr', // Can be changed to 'rtl' for Arabic layouts
  });
} catch (error) {
  console.error('❌ Error creating syariah banking theme:', error);
  // ✅ SURGICAL FIX: Fallback to basic theme if creation fails
  syariahBankingTheme = createTheme({
    palette: {
      primary: { main: '#2e7d32' },
      secondary: { main: '#8bc34a' },
    },
    shape: {
      borderRadius: 8, // ✅ ROUNDED: Modern fallback
    },
  });
}

// Custom theme extensions for Syariah banking
export const syariahThemeExtensions = {
  banking: {
    mode: 'syariah' as const,
    colors: syariahColors,
    gradients: {
      primary: 'linear-gradient(135deg, #2e7d32 0%, #66bb6a 100%)',
      secondary: 'linear-gradient(135deg, #8bc34a 0%, #c5e1a5 100%)',
      success: 'linear-gradient(135deg, #4caf50 0%, #81c784 100%)',
    },
    shadows: {
      card: '0 2px 8px rgba(46, 125, 50, 0.1)',
      button: '0 2px 4px rgba(46, 125, 50, 0.1)',
      hover: '0 4px 8px rgba(46, 125, 50, 0.15)',
    },
    shape: {
      navigation: 0,    // ✅ SHARP: Navigation elements
      content: 8,       // ✅ ROUNDED: Content elements
      cards: 12,        // ✅ ROUNDED: Cards
      chips: 16,        // ✅ ROUNDED: Chips
    },
    islamic: {
      // Islamic-specific design elements
      patterns: {
        geometric: '🕌', // Islamic geometric patterns
        calligraphy: true,
      },
      compliance: {
        halal: true,
        syariahBoard: true,
        islamicFinance: true,
      },
      cultural: {
        prayerTimes: true,
        hijriCalendar: true,
        qiblaDirection: true,
      },
    },
  },
};

// RTL (Right-to-Left) theme variant for Arabic interfaces
export const syariahBankingThemeRTL: Theme = createTheme({
  ...syariahBankingTheme,
  direction: 'rtl',
  shape: {
    borderRadius: 8, // ✅ ROUNDED: Modern default for RTL
  },
  components: {
    ...components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...components.MuiAppBar.styleOverrides.root,
          direction: 'rtl',
          borderRadius: 0, // ✅ SHARP: AppBar stays boxy in RTL
        },
      },
    },
  } as any,
});

// ✅ SURGICAL FIX: Multiple export formats to ensure compatibility
export { syariahBankingTheme };
export default syariahBankingTheme;
export const syariahThemeMetadata = {
  name: 'Syariah Banking',
  description: 'Islamic green theme optimized for Syariah banking operations',
  mode: 'light',
};
