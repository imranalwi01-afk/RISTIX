// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/index.ts
// Generated: 2025-07-22T20:26:00Z
// Phase: D2H6 - Dual Banking Admin Themes (Export Conflicts Fixed)
// Purpose: Main module exports (conflict-free)
// ============================================================================

export * from './app';
export * from './components';
export * from './store';
export * from './utils';

// Export specific theme items to avoid conflicts
export { 
  conventionalBankingTheme, 
  syariahBankingTheme,
  DualBankingThemeProvider,
  useDualBankingTheme 
} from './themes';

// Export specific types to avoid conflicts  
export type {
  BankingThemeConfiguration,
  TenantThemeConfiguration,
  ThemeCustomizations
} from './types';
