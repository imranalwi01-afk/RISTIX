// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/providers/i18n/i18nProvider.ts
// Generated: 2025-07-22T20:25:00Z
// Phase: D2H6 - Dual Banking Admin Themes (i18n Provider Fixed)
// Purpose: React Admin i18n provider with proper imports
// ============================================================================

import polyglotI18nProvider from 'ra-i18n-polyglot';
import englishMessages from 'ra-language-english';

// Enhanced messages with banking support
const messages = {
  en: {
    ...englishMessages,
    banking: {
      conventional: {
        name: 'Conventional Banking',
        description: 'Professional corporate banking interface',
      },
      syariah: {
        name: 'Syariah Banking', 
        description: 'Islamic banking interface with cultural elements',
      },
      themes: {
        switch_to_conventional: 'Switch to Conventional Banking',
        switch_to_syariah: 'Switch to Syariah Banking',
        current_theme: 'Current Theme',
        theme_applied: 'Theme Applied Successfully',
      },
    },
  },
};

export const i18nProvider = polyglotI18nProvider(
  (locale) => messages[locale as keyof typeof messages] || messages.en,
  'en'
);
