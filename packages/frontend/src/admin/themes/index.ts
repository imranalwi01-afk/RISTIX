// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/themes/index.ts
// Generated: Day 2 Hour 6 - Part 1 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: Material-UI v6, React Admin v4
// Purpose: Central theme export module for dual banking themes
// ============================================================================

// Import themes
import { 
  conventionalTheme, 
  conventionalThemeVariants, 
  conventionalThemeConfig 
} from './conventionalTheme';

import { 
  syariahTheme, 
  syariahThemeVariants, 
  syariahThemeConfig 
} from './syariahTheme';

// Types
export interface ThemeConfig {
  name: string;
  type: 'conventional' | 'syariah';
  description: string;
  features: string[];
  compliance: string[];
  culturalElements?: string[];
}

export interface BankingThemes {
  conventional: typeof conventionalTheme;
  syariah: typeof syariahTheme;
}

// Export individual themes
export { conventionalTheme, syariahTheme };

// Export theme variants
export { conventionalThemeVariants, syariahThemeVariants };

// Export theme configurations
export { conventionalThemeConfig, syariahThemeConfig };

// Main themes object
export const themes: BankingThemes = {
  conventional: conventionalTheme,
  syariah: syariahTheme
};

// Theme configurations
export const themeConfigs = {
  conventional: conventionalThemeConfig,
  syariah: syariahThemeConfig
};

// Theme selector function
export const getTheme = (bankingType: 'conventional' | 'syariah' | 'dual' = 'conventional') => {
  switch (bankingType) {
    case 'syariah':
      return syariahTheme;
    case 'conventional':
    case 'dual':
    default:
      return conventionalTheme;
  }
};

// Theme variant selector
export const getThemeVariant = (
  bankingType: 'conventional' | 'syariah' = 'conventional',
  variant: 'light' | 'dark' = 'light'
) => {
  const variants = bankingType === 'syariah' ? syariahThemeVariants : conventionalThemeVariants;
  return variants[variant];
};

// Available theme list
export const availableThemes = [
  {
    key: 'conventional',
    name: conventionalThemeConfig.name,
    description: conventionalThemeConfig.description,
    preview: {
      primary: conventionalTheme.palette.primary.main,
      secondary: conventionalTheme.palette.secondary.main,
      background: conventionalTheme.palette.background.default
    }
  },
  {
    key: 'syariah',
    name: syariahThemeConfig.name,
    description: syariahThemeConfig.description,
    preview: {
      primary: syariahTheme.palette.primary.main,
      secondary: syariahTheme.palette.secondary.main,
      background: syariahTheme.palette.background.default
    }
  }
] as const;

// Default theme
export const defaultTheme = conventionalTheme;

// Export all themes for compatibility
export default {
  conventional: conventionalTheme,
  syariah: syariahTheme,
  themes,
  getTheme,
  getThemeVariant,
  availableThemes,
  defaultTheme
};