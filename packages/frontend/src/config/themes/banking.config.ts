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
  DUAL_BANKING: process.env.NEXT_PUBLIC_FEATURE_DUAL_BANKING === 'true' || true,
  THEME_SWITCHING: process.env.NEXT_PUBLIC_FEATURE_THEME_SWITCHING === 'true' || true,
  TENANT_CUSTOMIZATION: process.env.NEXT_PUBLIC_FEATURE_TENANT_CUSTOMIZATION === 'true' || true,
  MULTI_LANGUAGE: process.env.NEXT_PUBLIC_FEATURE_MULTI_LANGUAGE === 'true' || true,
  CULTURAL_ELEMENTS: process.env.NEXT_PUBLIC_FEATURE_CULTURAL_ELEMENTS === 'true' || true
};

/**
 * Validate banking configuration
 */
export const validateBankingConfig = (config: BankingThemeConfig): boolean => {
  try {
    // Check if at least one banking mode is enabled
    if (!config.conventional.enabled) {
      console.error('At least one banking mode must be enabled');
      return false;
    }
    
    // Validate dual mode configuration
    if (config.dual.enabled) {
      if (config.dual.defaultMode === 'conventional' && !config.conventional.enabled) {
        console.error('Default mode cannot be conventional if conventional banking is disabled');
        return false;
      }
    }
    
    // Validate color formats (basic validation)
    const colorRegex = /^#[0-9A-F]{6}$/i;
    if (!colorRegex.test(config.conventional.primaryColor)) {
      console.error('Invalid conventional primary color format');
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
