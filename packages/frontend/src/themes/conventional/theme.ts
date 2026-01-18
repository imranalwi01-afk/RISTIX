// packages/frontend/src/themes/conventional/theme.ts
// ============================================================================
// IFRS9 CONVENTIONAL BANKING THEME - ENHANCED COMPACT DESIGN
// ============================================================================
// Purpose: Material-UI theme for conventional banking interface
// ✅ ENHANCED: Dynamic Light/Dark Mode Support
// ✅ OPTIMIZED: Deep Corporate Slate for Dark Mode
// ============================================================================

import { createTheme, Theme, ThemeOptions } from '@mui/material/styles';

// Type definition for palette mode
export type PaletteMode = 'light' | 'dark';

// Conventional Banking Color Palette (Professional Blue Theme)
const getDesignTokens = (mode: PaletteMode): ThemeOptions => {
  const isDark = mode === 'dark';

  return {
    cssVariables: false,
    palette: {
      mode,
      primary: {
        main: isDark ? '#38BDF8' : '#0078BD',      // 🌑 Bright Sky Blue for Dark Mode (Pop!) vs Classic Corporate
        light: '#7dd3fc',
        dark: '#0284c7',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#2D4B92',      // Navy blue
        light: '#5a6fb8',
        dark: '#1e336b',
        contrastText: '#ffffff',
      },
      background: {
        default: isDark ? '#0F172A' : '#F8FAFC',   // 🌑 Richer Slate (Tailwind Slate-900) for Depth
        paper: isDark ? '#1E293B' : '#ffffff',     // 🌑 Lighter Slate (Tailwind Slate-800) for Cards
      },
      text: {
        primary: isDark ? '#F1F5F9' : '#0F172A',   // 🌑 High Contrast White (Slate-100)
        secondary: isDark ? '#94A3B8' : '#64748B', // 🌑 Muted Blue-Grey (Slate-400)
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)', // Subtle separation
    },
    typography: {
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
        fontSize: '2.25rem',
        fontWeight: 600,
        lineHeight: 1.2,
        marginBottom: '0.5rem',
      },
      h2: {
        fontSize: '1.875rem',
        fontWeight: 600,
        lineHeight: 1.3,
        marginBottom: '0.5rem',
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
        marginBottom: '0.4rem',
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
        marginBottom: '0.4rem',
      },
      h5: {
        fontSize: '1.125rem',
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
        fontSize: '0.95rem',
        lineHeight: 1.5,
      },
      body2: {
        fontSize: '0.8125rem',
        lineHeight: 1.4,
      },
      button: {
        textTransform: 'none',
        fontWeight: 500,
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 6,
    },
    components: {
      // KEEP SHARP: AppBar (navigation header)
      MuiAppBar: {
        styleOverrides: {
          root: {
            // Glassmorphism background is handled in layout.tsx, this is fallback
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            color: isDark ? '#F1F5F9' : '#0F172A',
            boxShadow: 'none',
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'}`,
          },
        },
      },
      // Enhanced Cards
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12, // Modern rounded corners
            boxShadow: isDark
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)' // Deep shadow for dark
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',     // Soft shadow for light
            border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : 'none', // Subtle border in dark mode
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      // Enhanced Table Headers
      MuiTableHead: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC', // Match card/bg
            '& .MuiTableCell-head': {
              fontWeight: 600,
              color: isDark ? '#94A3B8' : '#475569',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              borderBottom: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.06)'}`,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.04)'}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,120,189,0.04)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
              },
            },
          },
        },
      },
    },
  };
};

// Function to generate the theme based on mode
export const getConventionalTheme = (mode: PaletteMode): Theme => {
  const theme = createTheme(getDesignTokens(mode));
  
  // NUCLEAR OPTION: Completely strip any CSS variable references
  (theme as any).cssVariables = false;
  (theme as any).vars = undefined;
  (theme as any).generateCssVars = undefined;
  // Provide no-op function instead of undefined to prevent errors
  (theme as any).applyStyles = (_mode: string, _styles: any) => ({});
  
  return theme;
};

// Default export for backward compatibility (defaults to light)
export const conventionalBankingTheme = getConventionalTheme('light');
export default conventionalBankingTheme;
export const conventionalThemeMetadata = {
  name: 'Conventional Banking',
  description: 'Professional blue theme optimized for conventional banking operations',
  mode: 'light',
};
