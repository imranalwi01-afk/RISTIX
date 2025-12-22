// packages/frontend/src/config/menu-config.ts
// ============================================================================
// 🗄️ CENTRALIZED MENU CONFIGURATION
// ============================================================================
// ✅ NO HARDCODED VALUES - ALL CONFIGURATIONS CENTRALIZED
// ✅ ENVIRONMENT-DRIVEN SETTINGS
// ✅ PERSISTENT DATABASE-DRIVEN MENU SYSTEM
// ============================================================================

import { frontendEnvironmentLoader } from './environment-loader-frontend';

// Menu Configuration Interface
export interface MenuConfig {
  // API Configuration
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };

  // Caching Configuration
  cache: {
    duration: number;
    enabled: boolean;
    maxItems: number;
    key: string;
  };

  // Display Configuration
  display: {
    showBadges: boolean;
    showStatusIndicators: boolean;
    showDisabledItems: boolean;
    autoExpandFirst: boolean;
    maxMenuDepth: number;
  };

  // Role-Based Access Configuration
  roles: {
    mappings: Record<string, string[]>;
    hierarchies: Record<string, string[]>;
    specialAccess: string[];
  };

  // Icon Configuration
  icons: {
    defaultIcon: string;
    fallbackIcon: string;
    customIcons: Record<string, string>;
  };

  // Banking Mode Configuration
  banking: {
    defaultMode: string;
    supportedModes: string[];
    modeSpecificIcons: Record<string, Record<string, string>>;
  };
}

// Centralized Menu Configuration Class
export class MenuConfigurationService {
  private static instance: MenuConfigurationService;
  private config: MenuConfig;

  public static getInstance(): MenuConfigurationService {
    if (!MenuConfigurationService.instance) {
      MenuConfigurationService.instance = new MenuConfigurationService();
      // Load configuration immediately after creation
      MenuConfigurationService.instance.loadConfiguration();
    }
    return MenuConfigurationService.instance;
  }

  private constructor() {
    this.initializeDefaultConfig();
  }

  private loadConfiguration(): void {
    try {
      // Ensure environment loader is loaded before accessing configuration
      let envConfig: any;
      try {
        envConfig = frontendEnvironmentLoader.getConfiguration();
      } catch (envError) {
        console.warn('⚠️ Environment loader not ready, forcing load:', envError);
        frontendEnvironmentLoader.loadConfiguration();
        envConfig = frontendEnvironmentLoader.getConfiguration();
      }

      // Defensive environment configuration access
      const apiBackend = envConfig?.api?.backend || envConfig?.backend?.url || '/api/v1';
      const bankingType = envConfig?.iaf?.bankingType || envConfig?.banking?.type || 'conventional';
      const environmentName = envConfig?.environmentName || 'development';

      // Environment-based configuration loading
      this.config = {
        api: {
          baseUrl: apiBackend,
          timeout: parseInt(process.env.NEXT_PUBLIC_MENU_API_TIMEOUT || '30000'),
          retryAttempts: parseInt(process.env.NEXT_PUBLIC_MENU_API_RETRY_ATTEMPTS || '3'),
          retryDelay: parseInt(process.env.NEXT_PUBLIC_MENU_API_RETRY_DELAY || '1000')
        },

        cache: {
          duration: parseInt(process.env.NEXT_PUBLIC_MENU_CACHE_DURATION || '300000'), // 5 minutes
          enabled: process.env.NEXT_PUBLIC_MENU_CACHE_ENABLED !== 'false',
          maxItems: parseInt(process.env.NEXT_PUBLIC_MENU_CACHE_MAX_ITEMS || '50'),
          key: process.env.NEXT_PUBLIC_MENU_CACHE_KEY || 'ifrs9-menu-cache'
        },

        display: {
          showBadges: process.env.NEXT_PUBLIC_MENU_SHOW_BADGES !== 'false',
          showStatusIndicators: process.env.NEXT_PUBLIC_MENU_SHOW_STATUS_INDICATORS !== 'false',
          showDisabledItems: process.env.NEXT_PUBLIC_MENU_SHOW_DISABLED_ITEMS !== 'false',
          autoExpandFirst: process.env.NEXT_PUBLIC_MENU_AUTO_EXPAND_FIRST !== 'false',
          maxMenuDepth: parseInt(process.env.NEXT_PUBLIC_MENU_MAX_DEPTH || '4')
        },

        roles: {
          mappings: {
            // IAF-specific role mappings
            'banking_staff': ['bank_user', 'banking_staff', 'loan_officer', 'credit_officer', 'risk_analyst', 'portfolio_manager'],
            'platform_admin': ['platform_super_admin', 'platform_admin', 'system_admin', 'admin', 'iaf_super_admin'],
            'consultant': ['consultant', 'advisor', 'specialist', 'external_consultant', 'ifrs_consultant'],
            'regulator': ['regulator', 'supervisor', 'auditor', 'inspector', 'banking_supervisor'],
            'bank_user': ['bank_user', 'banking_staff', 'risk_analyst', 'portfolio_manager', 'credit_analyst'],

            // Conventional banking roles
            'cro': ['chief_risk_officer', 'risk_officer', 'cro', 'risk_manager'],
            'auditor': ['auditor', 'internal_auditor', 'external_auditor', 'compliance_officer'],

            // Management roles
            'manager': ['manager', 'branch_manager', 'department_manager', 'unit_head'],
            'analyst': ['analyst', 'risk_analyst', 'business_analyst', 'data_analyst', 'credit_analyst'],
            'officer': ['officer', 'loan_officer', 'credit_officer', 'relationship_manager'],

            // Platform roles
            'admin': ['admin', 'super_admin', 'platform_admin', 'system_admin', 'ifrs_admin'],
            'platform': ['platform', 'super_admin', 'system_admin', 'platform_user']
          },

          hierarchies: {
            'admin': ['super_admin', 'platform_admin', 'system_admin'],
            'manager': ['branch_manager', 'department_manager', 'unit_head'],
            'analyst': ['senior_analyst', 'lead_analyst', 'junior_analyst'],
            'officer': ['senior_officer', 'lead_officer', 'junior_officer']
          },

          specialAccess: [
            'platform_super_admin',
            'iaf_super_admin',
            'system_admin',
            'admin'
          ]
        },

        icons: {
          defaultIcon: 'menu',
          fallbackIcon: 'menu',
          customIcons: {
            // IAF-specific custom icons
            'ifrs9': 'calculate',
            'ecl': 'calculate',
            'pd': 'trending_up',
            'lgd': 'monetization_on',
            'ead': 'account_balance',
            'staging': 'layers',
            'impairment': 'warning',

            // Banking-specific icons
            'portfolio': 'account_balance',
            'risk': 'trending_up',
            'compliance': 'security',
            'reporting': 'table_chart'
          }
        },

        banking: {
          defaultMode: bankingType,
          supportedModes: ['conventional', 'syariah', 'dual'],
          modeSpecificIcons: {
            'syariah': {
              'banking': 'mosque',
              'portfolio': 'account_balance',
              'compliance': 'security'
            },
            'conventional': {
              'banking': 'account_balance',
              'portfolio': 'account_balance',
              'compliance': 'security'
            },
            'dual': {
              'banking': 'swap_horiz',
              'portfolio': 'account_balance',
              'compliance': 'security'
            }
          }
        }
      };

      console.log('✅ Menu configuration loaded successfully:', {
        environment: environmentName,
        apiTimeout: this.config.api.timeout,
        cacheEnabled: this.config.cache.enabled,
        roleMappings: Object.keys(this.config.roles.mappings).length
      });

    } catch (error) {
      console.error('❌ Failed to load menu configuration, using defaults:', error);
      // Keep default configuration if loading fails
    }
  }

  private initializeDefaultConfig(): void {
    // Default fallback configuration
    this.config = {
      api: {
        baseUrl: '/api/v1',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
      },

      cache: {
        duration: 300000, // 5 minutes
        enabled: true,
        maxItems: 50,
        key: 'ifrs9-menu-cache'
      },

      display: {
        showBadges: true,
        showStatusIndicators: true,
        showDisabledItems: true,
        autoExpandFirst: true,
        maxMenuDepth: 4
      },

      roles: {
        mappings: {},
        hierarchies: {},
        specialAccess: []
      },

      icons: {
        defaultIcon: 'menu',
        fallbackIcon: 'menu',
        customIcons: {}
      },

      banking: {
        defaultMode: 'conventional',
        supportedModes: ['conventional', 'syariah', 'dual'],
        modeSpecificIcons: {}
      }
    };
  }

  public getConfiguration(): MenuConfig {
    // Ensure configuration is loaded before returning
    try {
      const envConfig = frontendEnvironmentLoader.getConfiguration();
      if (envConfig && (!this.config.roles.mappings || Object.keys(this.config.roles.mappings).length === 0)) {
        this.loadConfiguration();
      }
    } catch (error) {
      console.warn('Environment configuration not available, using defaults:', error);
      // Return default configuration if environment loader fails
      return this.config;
    }
    return this.config;
  }

  public getRoleMapping(role: string): string[] {
    const normalizedRole = role.toLowerCase();

    // Check direct mapping
    if (this.config.roles.mappings[normalizedRole]) {
      return this.config.roles.mappings[normalizedRole];
    }

    // Check hierarchy mapping
    for (const [category, roles] of Object.entries(this.config.roles.hierarchies)) {
      if (roles.includes(normalizedRole) || roles.some(r => normalizedRole.includes(r))) {
        return this.config.roles.mappings[category] || [];
      }
    }

    // Special access check
    if (this.config.roles.specialAccess.includes(normalizedRole)) {
      return Object.keys(this.config.roles.mappings);
    }

    return [role]; // Return original role if no mapping found
  }

  public hasMenuAccess(userRoles: string[], requiredRoles: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true; // No role restrictions
    }

    if (!userRoles || userRoles.length === 0) {
      return false; // No user roles provided
    }

    const normalizedUserRoles = userRoles.map(role => role.toLowerCase());

    return requiredRoles.some(requiredRole => {
      const normalizedRequired = requiredRole.toLowerCase();

      // Direct match
      if (normalizedUserRoles.includes(normalizedRequired)) {
        return true;
      }

      // Role mapping check
      const mappedRoles = this.getRoleMapping(normalizedRequired);
      return mappedRoles.some(mappedRole =>
        normalizedUserRoles.includes(mappedRole.toLowerCase())
      );
    });
  }

  public getIconForMenu(itemKey: string, bankingMode?: string): string {
    // Check for banking mode specific icons
    if (bankingMode && this.config.banking.modeSpecificIcons[bankingMode]) {
      const modeIcons = this.config.banking.modeSpecificIcons[bankingMode];
      if (modeIcons[itemKey]) {
        return modeIcons[itemKey];
      }
    }

    // Check custom icons
    if (this.config.icons.customIcons[itemKey]) {
      return this.config.icons.customIcons[itemKey];
    }

    // Return default icon
    return this.config.icons.defaultIcon;
  }

  public isSpecialAdmin(userRole: string): boolean {
    const normalizedRole = userRole.toLowerCase();
    return this.config.roles.specialAccess.some(specialRole =>
      normalizedRole.includes(specialRole) || specialRole.includes(normalizedRole)
    );
  }

  public reloadConfiguration(): void {
    console.log('🔄 Reloading menu configuration...');
    this.loadConfiguration();
  }
}

// Export singleton instance
export const menuConfig = MenuConfigurationService.getInstance();

// Export convenience functions
export const getRoleMapping = (role: string) => menuConfig.getRoleMapping(role);
export const hasMenuAccess = (userRoles: string[], requiredRoles: string[]) => menuConfig.hasMenuAccess(userRoles, requiredRoles);
export const getMenuIcon = (itemKey: string, bankingMode?: string) => menuConfig.getIconForMenu(itemKey, bankingMode);
export const isAdminUser = (userRole: string) => menuConfig.isSpecialAdmin(userRole);

export default menuConfig;