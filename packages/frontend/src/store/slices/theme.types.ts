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
export type BankingType = 'conventional' | 'dual';

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
  return ['conventional', 'dual'].includes(value);
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
