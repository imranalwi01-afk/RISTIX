// packages/backend/src/core/services/platform/database-driven-menu.service.ts
// ============================================================================
// Database-Driven Menu System for IFRS9 Platform
// ============================================================================
// Generated: 2025-01-12
// Purpose: Dynamic menu configuration with multi-tenant and banking type support
// Methodology: Core Platform MVP - Database-Driven Menu Implementation
// Dependencies: ConfigurationService, TenantRegistryService, AuditService
// ============================================================================

// Note: Removed NestJS dependency - this project uses Express.js
import { Logger } from 'winston';
import { ConfigurationService } from '../configuration/configuration.service';
import { TenantRegistryService } from '../tenant/tenant-registry.service';
import { AuditService } from '../audit/audit.service';
import { databaseConfig } from '../../database/config/database.config';

export interface MenuItem {
  id: string;
  key: string;
  title: string;
  description?: string;
  icon?: string;
  url?: string;
  component?: string;
  type: 'group' | 'item' | 'divider';
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  permissions?: string[];
  user_types?: string[];
  banking_types?: string[];
  tenant_types?: string[];
  visibility_rules?: any;
  children?: MenuItem[];
  breadcrumb?: boolean;
  external?: boolean;
  target?: '_self' | '_blank' | '_parent' | '_top';
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface MenuConfiguration {
  id: string;
  name: string;
  description: string;
  target_audience: 'banking_staff' | 'consultant' | 'regulator' | 'platform_admin';
  banking_mode?: 'conventional' | 'syariah' | 'dual';
  tenant_specific: boolean;
  is_default: boolean;
  is_active: boolean;
  menu_items: MenuItem[];
  version: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface MenuPermissionCheck {
  userId: string;
  userType: string;
  role: string;
  roleCodes?: string[]; // ✅ Added role codes for menu compatibility
  tenantId?: string;
  bankingType?: string;
  permissions: string[];
}

export interface MenuRenderContext {
  user: MenuPermissionCheck;
  platform: {
    version: string;
    features: string[];
    environment: string;
  };
  tenant?: {
    id: string;
    name: string;
    slug: string;
    banking_type: string;
    features: string[];
  };
}

export interface BreadcrumbItem {
  title: string;
  url?: string;
  active: boolean;
}

export class DatabaseDrivenMenuService {
  private readonly logger: Logger;
  private menuCache: Map<string, MenuConfiguration> = new Map();
  private cacheTimeout: number = 300000; // 5 minutes

  constructor(
    private readonly configService: ConfigurationService,
    private readonly tenantRegistryService: TenantRegistryService,
    private readonly auditService: AuditService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'DatabaseDrivenMenuService' });
    this.initializeDefaultMenus();
  }

  /**
   * Get menu configuration for specific context
   */
  async getMenuForContext(context: MenuRenderContext): Promise<MenuConfiguration> {
    try {
      this.logger.info('Retrieving menu for context', {
        userType: context.user.userType,
        tenantId: context.tenant?.id,
        bankingType: context.tenant?.banking_type
      });

      // Determine menu key based on context
      const menuKey = this.determineMenuKey(context);
      
      // Check cache first
      const cachedMenu = this.menuCache.get(menuKey);
      if (cachedMenu && this.isCacheValid(menuKey)) {
        return this.filterMenuByPermissions(cachedMenu, context);
      }

      // Load menu from database
      const menuConfig = await this.loadMenuFromDatabase(context);
      
      // Cache the menu
      this.menuCache.set(menuKey, menuConfig);

      // Filter based on permissions and return
      return this.filterMenuByPermissions(menuConfig, context);

    } catch (error) {
      this.logger.error('Failed to get menu for context', {
        error: (error as Error).message,
        context: context.user.userType
      });
      
      // Return fallback menu
      return this.getFallbackMenu(context);
    }
  }

  /**
   * Get hierarchical menu tree for specific context
   */
  async getMenuTreeForContext(context: MenuRenderContext, options: {
    includeInactive?: boolean;
    bankingMode?: string;
  } = {}): Promise<MenuItem[]> {
    try {
      this.logger.info('Retrieving menu tree for context', {
        userType: context.user.userType,
        tenantId: context.tenant?.id,
        bankingType: context.tenant?.banking_type,
        bankingMode: options.bankingMode,
        includeInactive: options.includeInactive
      });

      // Get menu configuration for context
      const menuConfig = await this.getMenuForContext(context);

      // Convert to hierarchical tree structure
      let menuItems = this.buildMenuTree(menuConfig.menu_items);

      // Filter by banking mode if specified
      if (options.bankingMode && options.bankingMode !== 'dual') {
        menuItems = this.filterMenuByBankingMode(menuItems, options.bankingMode);
      }

      // Filter by active status if includeInactive is false
      if (!options.includeInactive) {
        menuItems = this.filterActiveMenuItems(menuItems);
      }

      return menuItems;

    } catch (error) {
      this.logger.error('Failed to get menu tree for context', {
        error: (error as Error).message,
        context: context.user.userType
      });

      // Return fallback menu tree
      return this.getFallbackMenuTree(context);
    }
  }

  /**
   * Create or update menu configuration
   */
  async upsertMenuConfiguration(menuConfig: Partial<MenuConfiguration>): Promise<MenuConfiguration> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();
      
      this.logger.info('Upserting menu configuration', {
        name: menuConfig.name,
        targetAudience: menuConfig.target_audience
      });

      const menuId = menuConfig.id || this.generateMenuId();
      const now = new Date();

      // Upsert menu configuration
      const upsertMenuQuery = `
        INSERT INTO platform_admin.menu_configurations (
          id, name, description, target_audience, banking_mode, 
          tenant_specific, is_default, is_active, version,
          created_by, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          description = EXCLUDED.description,
          target_audience = EXCLUDED.target_audience,
          banking_mode = EXCLUDED.banking_mode,
          tenant_specific = EXCLUDED.tenant_specific,
          is_default = EXCLUDED.is_default,
          is_active = EXCLUDED.is_active,
          version = EXCLUDED.version,
          updated_at = EXCLUDED.updated_at
        RETURNING *
      `;

      const [menuResult] = await platformDb.query(upsertMenuQuery, {
        replacements: [
          menuId,
          menuConfig.name,
          menuConfig.description,
          menuConfig.target_audience,
          menuConfig.banking_mode,
          menuConfig.tenant_specific || false,
          menuConfig.is_default || false,
          menuConfig.is_active !== false,
          menuConfig.version || '1.0.0',
          menuConfig.created_by || 'system',
          now
        ],
        type: 'INSERT'
      });

      // Insert/update menu items
      if (menuConfig.menu_items && menuConfig.menu_items.length > 0) {
        await this.upsertMenuItems(menuId, menuConfig.menu_items);
      }

      // Clear cache
      this.clearMenuCache();

      // Log audit event
      await this.auditService.logSystemEvent({
        eventType: 'MENU_CONFIGURATION_UPDATED',
        description: `Menu configuration updated: ${menuConfig.name}`,
        userId: menuConfig.created_by || 'system',
        metadata: {
          menuId,
          targetAudience: menuConfig.target_audience,
          bankingMode: menuConfig.banking_mode
        }
      });

      return await this.getMenuConfigurationById(menuId);

    } catch (error) {
      this.logger.error('Failed to upsert menu configuration', {
        error: (error as Error).message,
        menuName: menuConfig.name
      });
      throw error;
    }
  }

  /**
   * Get menu items for specific menu configuration
   */
  async getMenuItems(menuConfigId: string): Promise<MenuItem[]> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();

      const query = `
        SELECT * FROM platform_admin.menu_items
        WHERE menu_config_id = $1 AND is_active = true
        ORDER BY sort_order, title
      `;

      const [results] = await platformDb.query(query, {
        replacements: [menuConfigId],
        type: 'SELECT'
      });

      const menuItems = (results as any[]).map(dbItem => this.mapDatabaseToMenuItem(dbItem));
      
      // Build hierarchical structure
      return this.buildMenuHierarchy(menuItems);

    } catch (error) {
      this.logger.error('Failed to get menu items', {
        error: (error as Error).message,
        menuConfigId
      });
      throw error;
    }
  }

  /**
   * Generate breadcrumb trail for current path
   */
  async generateBreadcrumbs(
    currentPath: string, 
    context: MenuRenderContext
  ): Promise<BreadcrumbItem[]> {
    try {
      const menuConfig = await this.getMenuForContext(context);
      const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', url: '/', active: false }
      ];

      // Find current menu item and build trail
      const currentItem = this.findMenuItemByPath(menuConfig.menu_items, currentPath);
      if (currentItem) {
        const trail = this.buildBreadcrumbTrail(menuConfig.menu_items, currentItem);
        breadcrumbs.push(...trail);
      }

      // Mark last item as active
      if (breadcrumbs.length > 0) {
        breadcrumbs[breadcrumbs.length - 1].active = true;
      }

      return breadcrumbs;

    } catch (error) {
      this.logger.error('Failed to generate breadcrumbs', {
        error: (error as Error).message,
        currentPath
      });
      
      return [
        { title: 'Home', url: '/', active: false },
        { title: 'Current Page', active: true }
      ];
    }
  }

  /**
   * Initialize default menu configurations
   */
  private async initializeDefaultMenus(): Promise<void> {
    try {
      this.logger.info('Initializing default menu configurations');

      const defaultMenus = [
        this.createBankingStaffMenu(),
        this.createPlatformAdminMenu(),
        this.createConsultantMenu(),
        this.createRegulatorMenu(),
        this.createSyariahBankingMenu()
      ];

      for (const menu of defaultMenus) {
        await this.upsertMenuConfiguration(menu);
      }

      this.logger.info('Default menu configurations initialized');

    } catch (error) {
      this.logger.error('Failed to initialize default menus', {
        error: (error as Error).message
      });
    }
  }

  /**
   * Create banking staff menu configuration
   */
  private createBankingStaffMenu(): Partial<MenuConfiguration> {
    return {
      name: 'Banking Staff Menu',
      description: 'Comprehensive menu for banking institution staff',
      target_audience: 'banking_staff',
      banking_mode: 'conventional',
      tenant_specific: true,
      is_default: true,
      is_active: true,
      version: '1.0.0',
      created_by: 'system',
      menu_items: [
        // Dashboard
        {
          id: 'dashboard',
          key: 'dashboard',
          title: 'Dashboard',
          icon: 'DashboardIcon',
          url: '/banking/dashboard',
          type: 'item',
          sort_order: 100,
          is_active: true,
          permissions: ['VIEW_DASHBOARD'],
          breadcrumb: true
        },

        // General Setup
        {
          id: 'general-setup',
          key: 'general-setup',
          title: 'General Setup',
          icon: 'SettingsIcon',
          type: 'group',
          sort_order: 200,
          is_active: true,
          permissions: ['VIEW_SETUP']
        },
        {
          id: 'application-setting',
          key: 'application-setting',
          title: 'Application Setting',
          url: '/banking/setup/application',
          type: 'item',
          parent_id: 'general-setup',
          sort_order: 201,
          is_active: true,
          permissions: ['MANAGE_APPLICATION_SETTINGS'],
          breadcrumb: true
        },
        {
          id: 'business-setting',
          key: 'business-setting',
          title: 'Business Setting',
          url: '/banking/setup/business',
          type: 'item',
          parent_id: 'general-setup',
          sort_order: 202,
          is_active: true,
          permissions: ['MANAGE_BUSINESS_SETTINGS'],
          breadcrumb: true
        },

        // Parameter Setup
        {
          id: 'parameter-setup',
          key: 'parameter-setup',
          title: 'Parameter Setup',
          icon: 'TuneIcon',
          type: 'group',
          sort_order: 300,
          is_active: true,
          permissions: ['VIEW_PARAMETERS']
        },
        {
          id: 'product-parameter',
          key: 'product-parameter',
          title: 'Product Parameter',
          url: '/banking/parameters/product',
          type: 'item',
          parent_id: 'parameter-setup',
          sort_order: 301,
          is_active: true,
          permissions: ['MANAGE_PRODUCT_PARAMETERS'],
          breadcrumb: true
        },
        {
          id: 'journal-parameter',
          key: 'journal-parameter',
          title: 'Journal Parameter',
          url: '/banking/parameters/journal',
          type: 'item',
          parent_id: 'parameter-setup',
          sort_order: 302,
          is_active: true,
          permissions: ['MANAGE_JOURNAL_PARAMETERS'],
          breadcrumb: true
        },

        // Portfolio Management
        {
          id: 'portfolio-management',
          key: 'portfolio-management',
          title: 'Portfolio Management',
          icon: 'AccountBalanceIcon',
          type: 'group',
          sort_order: 400,
          is_active: true,
          permissions: ['VIEW_PORTFOLIO']
        },
        {
          id: 'portfolio-accounts',
          key: 'portfolio-accounts',
          title: 'Portfolio Accounts',
          url: '/banking/portfolio/accounts',
          type: 'item',
          parent_id: 'portfolio-management',
          sort_order: 401,
          is_active: true,
          permissions: ['MANAGE_PORTFOLIO_ACCOUNTS'],
          breadcrumb: true
        },
        {
          id: 'customer-management',
          key: 'customer-management',
          title: 'Customer Management',
          url: '/banking/portfolio/customers',
          type: 'item',
          parent_id: 'portfolio-management',
          sort_order: 402,
          is_active: true,
          permissions: ['MANAGE_CUSTOMERS'],
          breadcrumb: true
        },

        // IFRS9 Processing
        {
          id: 'ifrs9-processing',
          key: 'ifrs9-processing',
          title: 'IFRS9 Processing',
          icon: 'CalculateIcon',
          type: 'group',
          sort_order: 500,
          is_active: true,
          permissions: ['VIEW_IFRS9']
        },
        {
          id: 'ecl-calculations',
          key: 'ecl-calculations',
          title: 'ECL Calculations',
          url: '/banking/ifrs9/ecl-calculations',
          type: 'item',
          parent_id: 'ifrs9-processing',
          sort_order: 501,
          is_active: true,
          permissions: ['PERFORM_ECL_CALCULATIONS'],
          breadcrumb: true
        },
        {
          id: 'staging-analysis',
          key: 'staging-analysis',
          title: 'Staging Analysis',
          url: '/banking/ifrs9/staging',
          type: 'item',
          parent_id: 'ifrs9-processing',
          sort_order: 502,
          is_active: true,
          permissions: ['PERFORM_STAGING_ANALYSIS'],
          breadcrumb: true
        },

        // Reports
        {
          id: 'reports',
          key: 'reports',
          title: 'Reports',
          icon: 'AssessmentIcon',
          type: 'group',
          sort_order: 600,
          is_active: true,
          permissions: ['VIEW_REPORTS']
        },
        {
          id: 'ifrs9-reports',
          key: 'ifrs9-reports',
          title: 'IFRS9 Reports',
          url: '/banking/reports/ifrs9',
          type: 'item',
          parent_id: 'reports',
          sort_order: 601,
          is_active: true,
          permissions: ['VIEW_IFRS9_REPORTS'],
          breadcrumb: true
        },

        // Administration
        {
          id: 'administration',
          key: 'administration',
          title: 'Administration',
          icon: 'AdminPanelSettingsIcon',
          type: 'group',
          sort_order: 700,
          is_active: true,
          permissions: ['VIEW_ADMIN'],
          user_types: ['admin', 'super_admin']
        },
        {
          id: 'user-management',
          key: 'user-management',
          title: 'User Management',
          url: '/banking/admin/users',
          type: 'item',
          parent_id: 'administration',
          sort_order: 701,
          is_active: true,
          permissions: ['MANAGE_USERS'],
          breadcrumb: true
        }
      ] as MenuItem[]
    };
  }

  /**
   * Create Syariah banking menu (with Islamic-specific features)
   */
  private createSyariahBankingMenu(): Partial<MenuConfiguration> {
    const baseMenu = this.createBankingStaffMenu();
    
    return {
      ...baseMenu,
      name: 'Syariah Banking Staff Menu',
      description: 'Islamic banking menu with Syariah compliance features',
      banking_mode: 'syariah',
      menu_items: [
        ...baseMenu.menu_items!,
        
        // Syariah Compliance (additional group)
        {
          id: 'syariah-compliance',
          key: 'syariah-compliance',
          title: 'Syariah Compliance',
          icon: 'VerifiedIcon',
          type: 'group',
          sort_order: 550,
          is_active: true,
          permissions: ['VIEW_SYARIAH_COMPLIANCE'],
          banking_types: ['syariah']
        },
        {
          id: 'islamic-products',
          key: 'islamic-products',
          title: 'Islamic Products',
          url: '/banking/syariah/products',
          type: 'item',
          parent_id: 'syariah-compliance',
          sort_order: 551,
          is_active: true,
          permissions: ['MANAGE_ISLAMIC_PRODUCTS'],
          banking_types: ['syariah'],
          breadcrumb: true
        },
        {
          id: 'dps-approvals',
          key: 'dps-approvals',
          title: 'DPS Approvals',
          url: '/banking/syariah/dps-approvals',
          type: 'item',
          parent_id: 'syariah-compliance',
          sort_order: 552,
          is_active: true,
          permissions: ['MANAGE_DPS_APPROVALS'],
          banking_types: ['syariah'],
          breadcrumb: true
        }
      ] as MenuItem[]
    };
  }

  /**
   * Create platform admin menu
   */
  private createPlatformAdminMenu(): Partial<MenuConfiguration> {
    return {
      name: 'Platform Administrator Menu',
      description: 'Complete platform management and cross-tenant oversight',
      target_audience: 'platform_admin',
      tenant_specific: false,
      is_default: true,
      is_active: true,
      version: '1.0.0',
      created_by: 'system',
      menu_items: [
        {
          id: 'platform-dashboard',
          key: 'platform-dashboard',
          title: 'Platform Dashboard',
          icon: 'DashboardIcon',
          url: '/platform/dashboard',
          type: 'item',
          sort_order: 100,
          is_active: true,
          permissions: ['PLATFORM_ADMIN'],
          breadcrumb: true
        },
        {
          id: 'tenant-management',
          key: 'tenant-management',
          title: 'Tenant Management',
          icon: 'BusinessIcon',
          url: '/platform/tenants',
          type: 'item',
          sort_order: 200,
          is_active: true,
          permissions: ['MANAGE_TENANTS'],
          breadcrumb: true
        },
        {
          id: 'system-health',
          key: 'system-health',
          title: 'System Health',
          icon: 'MonitorHeartIcon',
          url: '/platform/health',
          type: 'item',
          sort_order: 300,
          is_active: true,
          permissions: ['VIEW_SYSTEM_HEALTH'],
          breadcrumb: true
        },
        {
          id: 'analytics-overview',
          key: 'analytics-overview',
          title: 'Analytics Overview',
          icon: 'AnalyticsIcon',
          url: '/platform/analytics',
          type: 'item',
          sort_order: 400,
          is_active: true,
          permissions: ['VIEW_PLATFORM_ANALYTICS'],
          breadcrumb: true
        }
      ] as MenuItem[]
    };
  }

  /**
   * Create consultant menu
   */
  private createConsultantMenu(): Partial<MenuConfiguration> {
    return {
      name: 'Consultant Menu',
      description: 'IFRS9 consulting and advisory features',
      target_audience: 'consultant',
      tenant_specific: false,
      is_default: true,
      is_active: true,
      version: '1.0.0',
      created_by: 'system',
      menu_items: [
        {
          id: 'consultant-dashboard',
          key: 'consultant-dashboard',
          title: 'Consultant Dashboard',
          icon: 'ConsultingIcon',
          url: '/consultant/dashboard',
          type: 'item',
          sort_order: 100,
          is_active: true,
          permissions: ['CONSULTANT_ACCESS'],
          breadcrumb: true
        },
        {
          id: 'client-projects',
          key: 'client-projects',
          title: 'Client Projects',
          icon: 'FolderOpenIcon',
          url: '/consultant/projects',
          type: 'item',
          sort_order: 200,
          is_active: true,
          permissions: ['MANAGE_CLIENT_PROJECTS'],
          breadcrumb: true
        },
        {
          id: 'ifrs9-advisory',
          key: 'ifrs9-advisory',
          title: 'IFRS9 Advisory',
          icon: 'SchoolIcon',
          url: '/consultant/advisory',
          type: 'item',
          sort_order: 300,
          is_active: true,
          permissions: ['PROVIDE_IFRS9_ADVISORY'],
          breadcrumb: true
        }
      ] as MenuItem[]
    };
  }

  /**
   * Create regulator menu
   */
  private createRegulatorMenu(): Partial<MenuConfiguration> {
    return {
      name: 'Regulator Menu',
      description: 'Banking supervision and regulatory oversight',
      target_audience: 'regulator',
      tenant_specific: false,
      is_default: true,
      is_active: true,
      version: '1.0.0',
      created_by: 'system',
      menu_items: [
        {
          id: 'regulator-dashboard',
          key: 'regulator-dashboard',
          title: 'Regulatory Dashboard',
          icon: 'GavelIcon',
          url: '/regulator/dashboard',
          type: 'item',
          sort_order: 100,
          is_active: true,
          permissions: ['REGULATORY_ACCESS'],
          breadcrumb: true
        },
        {
          id: 'bank-supervision',
          key: 'bank-supervision',
          title: 'Bank Supervision',
          icon: 'SupervisorAccountIcon',
          url: '/regulator/supervision',
          type: 'item',
          sort_order: 200,
          is_active: true,
          permissions: ['SUPERVISE_BANKS'],
          breadcrumb: true
        },
        {
          id: 'compliance-monitoring',
          key: 'compliance-monitoring',
          title: 'Compliance Monitoring',
          icon: 'FactCheckIcon',
          url: '/regulator/compliance',
          type: 'item',
          sort_order: 300,
          is_active: true,
          permissions: ['MONITOR_COMPLIANCE'],
          breadcrumb: true
        }
      ] as MenuItem[]
    };
  }

  // Helper methods continue...
  
  private determineMenuKey(context: MenuRenderContext): string {
    const parts = [
      context.user.userType,
      context.tenant?.banking_type || 'none',
      context.tenant?.id || 'platform'
    ];
    return parts.join('_');
  }

  private isCacheValid(menuKey: string): boolean {
    // Simple cache validation - could be enhanced
    return true; // Placeholder
  }

  private async loadMenuFromDatabase(context: MenuRenderContext): Promise<MenuConfiguration> {
    const platformDb = databaseConfig.getPlatformConnection();

    const query = `
      SELECT * FROM platform_admin.menu_configurations
      WHERE target_audience = $1 
      AND (banking_mode = $2 OR banking_mode IS NULL)
      AND is_active = true
      ORDER BY is_default DESC
      LIMIT 1
    `;

    const [results] = await platformDb.query(query, {
      replacements: [
        context.user.userType,
        context.tenant?.banking_type || null
      ],
      type: 'SELECT'
    });

    if (!results || (results as any[]).length === 0) {
      throw new Error(`No menu configuration found for user type: ${context.user.userType}`);
    }

    const menuConfig = (results as any[])[0];
    const menuItems = await this.getMenuItems(menuConfig.id);

    return {
      ...menuConfig,
      menu_items: menuItems
    };
  }

  private filterMenuByPermissions(
    menuConfig: MenuConfiguration, 
    context: MenuRenderContext
  ): MenuConfiguration {
    const filteredItems = this.filterMenuItems(menuConfig.menu_items, context);
    
    return {
      ...menuConfig,
      menu_items: filteredItems
    };
  }

  private filterMenuItems(items: MenuItem[], context: MenuRenderContext): MenuItem[] {
    return items
      .filter(item => this.hasMenuItemPermission(item, context))
      .map(item => ({
        ...item,
        children: item.children ? this.filterMenuItems(item.children, context) : undefined
      }))
      .filter(item => {
        // Remove groups with no visible children
        if (item.type === 'group' && item.children) {
          return item.children.length > 0;
        }
        return true;
      });
  }

  private hasMenuItemPermission(item: MenuItem, context: MenuRenderContext): boolean {
    // Check permissions
    if (item.permissions && item.permissions.length > 0) {
      const hasPermission = item.permissions.some(permission =>
        context.user.permissions.includes(permission)
      );
      if (!hasPermission) return false;
    }

    // Check user types and role codes (✅ Enhanced for IAF role compatibility)
    if (item.user_types && item.user_types.length > 0) {
      // First check if user type matches directly
      if (item.user_types.includes(context.user.userType)) {
        // Direct match, continue to other checks
      } else if (context.user.roleCodes && context.user.roleCodes.length > 0) {
        // Check if any of the user's role codes match the item's user_types
        const hasRoleCodeMatch = item.user_types.some(userType =>
          context.user.roleCodes!.includes(userType)
        );
        if (!hasRoleCodeMatch) return false;
      } else {
        // No direct match and no role codes
        return false;
      }
    }

    // Check banking types
    if (item.banking_types && item.banking_types.length > 0 && context.tenant) {
      if (!item.banking_types.includes(context.tenant.banking_type)) return false;
    }

    return true;
  }

  private getFallbackMenu(context: MenuRenderContext): MenuConfiguration {
    return {
      id: 'fallback',
      name: 'Basic Menu',
      description: 'Fallback menu configuration',
      target_audience: context.user.userType as any,
      tenant_specific: false,
      is_default: true,
      is_active: true,
      menu_items: [
        {
          id: 'dashboard',
          key: 'dashboard',
          title: 'Dashboard',
          icon: 'DashboardIcon',
          url: `/${context.user.userType}/dashboard`,
          type: 'item',
          sort_order: 100,
          is_active: true,
          breadcrumb: true
        } as MenuItem
      ],
      version: '1.0.0',
      created_by: 'system',
      created_at: new Date(),
      updated_at: new Date()
    };
  }

  private async upsertMenuItems(menuConfigId: string, items: MenuItem[]): Promise<void> {
    const platformDb = databaseConfig.getPlatformConnection();

    for (const item of items) {
      const query = `
        INSERT INTO platform_admin.menu_items (
          id, menu_config_id, key, title, description, icon, url, component,
          type, parent_id, sort_order, is_active, permissions, user_types,
          banking_types, tenant_types, visibility_rules, breadcrumb,
          external, target, metadata, created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $22
        )
        ON CONFLICT (id) DO UPDATE SET
          key = EXCLUDED.key,
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          icon = EXCLUDED.icon,
          url = EXCLUDED.url,
          component = EXCLUDED.component,
          type = EXCLUDED.type,
          parent_id = EXCLUDED.parent_id,
          sort_order = EXCLUDED.sort_order,
          is_active = EXCLUDED.is_active,
          permissions = EXCLUDED.permissions,
          user_types = EXCLUDED.user_types,
          banking_types = EXCLUDED.banking_types,
          tenant_types = EXCLUDED.tenant_types,
          visibility_rules = EXCLUDED.visibility_rules,
          breadcrumb = EXCLUDED.breadcrumb,
          external = EXCLUDED.external,
          target = EXCLUDED.target,
          metadata = EXCLUDED.metadata,
          updated_at = EXCLUDED.updated_at
      `;

      await platformDb.query(query, {
        replacements: [
          item.id || this.generateMenuItemId(),
          menuConfigId,
          item.key,
          item.title,
          item.description,
          item.icon,
          item.url,
          item.component,
          item.type,
          item.parent_id,
          item.sort_order,
          item.is_active,
          JSON.stringify(item.permissions || []),
          JSON.stringify(item.user_types || []),
          JSON.stringify(item.banking_types || []),
          JSON.stringify(item.tenant_types || []),
          JSON.stringify(item.visibility_rules || {}),
          item.breadcrumb || false,
          item.external || false,
          item.target || '_self',
          JSON.stringify(item.metadata || {}),
          new Date()
        ],
        type: 'INSERT'
      });
    }
  }

  private async getMenuConfigurationById(id: string): Promise<MenuConfiguration> {
    const platformDb = databaseConfig.getPlatformConnection();

    const query = `SELECT * FROM platform_admin.menu_configurations WHERE id = $1`;
    const [results] = await platformDb.query(query, {
      replacements: [id],
      type: 'SELECT'
    });

    if (!results || (results as any[]).length === 0) {
      throw new Error(`Menu configuration not found: ${id}`);
    }

    const menuConfig = (results as any[])[0];
    const menuItems = await this.getMenuItems(id);

    return {
      ...menuConfig,
      menu_items: menuItems
    };
  }

  private mapDatabaseToMenuItem(dbItem: any): MenuItem {
    return {
      id: dbItem.id,
      key: dbItem.key,
      title: dbItem.title,
      description: dbItem.description,
      icon: dbItem.icon,
      url: dbItem.url,
      component: dbItem.component,
      type: dbItem.type,
      parent_id: dbItem.parent_id,
      sort_order: dbItem.sort_order,
      is_active: dbItem.is_active,
      permissions: JSON.parse(dbItem.permissions || '[]'),
      user_types: JSON.parse(dbItem.user_types || '[]'),
      banking_types: JSON.parse(dbItem.banking_types || '[]'),
      tenant_types: JSON.parse(dbItem.tenant_types || '[]'),
      visibility_rules: JSON.parse(dbItem.visibility_rules || '{}'),
      breadcrumb: dbItem.breadcrumb,
      external: dbItem.external,
      target: dbItem.target,
      metadata: JSON.parse(dbItem.metadata || '{}'),
      created_at: dbItem.created_at,
      updated_at: dbItem.updated_at
    };
  }

  private buildMenuHierarchy(items: MenuItem[]): MenuItem[] {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // First pass: create map
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Second pass: build hierarchy
    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;
      if (item.parent_id) {
        const parent = itemMap.get(item.parent_id);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(menuItem);
        }
      } else {
        rootItems.push(menuItem);
      }
    });

    // Sort children
    const sortItems = (items: MenuItem[]): MenuItem[] => {
      return items.sort((a, b) => a.sort_order - b.sort_order).map(item => ({
        ...item,
        children: item.children ? sortItems(item.children) : undefined
      }));
    };

    return sortItems(rootItems);
  }

  private findMenuItemByPath(items: MenuItem[], path: string): MenuItem | null {
    for (const item of items) {
      if (item.url === path) {
        return item;
      }
      if (item.children) {
        const found = this.findMenuItemByPath(item.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  private buildBreadcrumbTrail(items: MenuItem[], targetItem: MenuItem): BreadcrumbItem[] {
    const trail: BreadcrumbItem[] = [];
    
    const findPath = (items: MenuItem[], target: MenuItem, currentPath: MenuItem[]): boolean => {
      for (const item of items) {
        const newPath = [...currentPath, item];
        
        if (item.id === target.id) {
          // Found target, build breadcrumb trail
          newPath.forEach((pathItem, index) => {
            if (pathItem.breadcrumb !== false) {
              trail.push({
                title: pathItem.title,
                url: pathItem.url,
                active: index === newPath.length - 1
              });
            }
          });
          return true;
        }
        
        if (item.children && findPath(item.children, target, newPath)) {
          return true;
        }
      }
      return false;
    };

    findPath(items, targetItem, []);
    return trail;
  }

  private clearMenuCache(): void {
    this.menuCache.clear();
  }

  private generateMenuId(): string {
    return `menu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateMenuItemId(): string {
    return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Build hierarchical menu tree from flat menu items
   */
  private buildMenuTree(items: MenuItem[]): MenuItem[] {
    const itemMap = new Map<string, MenuItem>();
    const rootItems: MenuItem[] = [];

    // Create map of all items
    items.forEach(item => {
      itemMap.set(item.id, { ...item, children: [] });
    });

    // Build tree structure
    items.forEach(item => {
      const menuItem = itemMap.get(item.id)!;

      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(menuItem);
      } else {
        rootItems.push(menuItem);
      }
    });

    // Sort by sort_order
    const sortByOrder = (a: MenuItem, b: MenuItem) => a.sort_order - b.sort_order;

    const sortRecursive = (items: MenuItem[]): MenuItem[] => {
      return items.sort(sortByOrder).map(item => ({
        ...item,
        children: item.children ? sortRecursive(item.children) : []
      }));
    };

    const sortedTree = sortRecursive(rootItems);

    // Debug logging
    this.logger.info('Built menu tree', {
      totalItems: items.length,
      rootItemsCount: sortedTree.length,
      treeStructure: sortedTree.map(item => ({
        key: item.key,
        title: item.title,
        childrenCount: item.children?.length || 0
      }))
    });

    return sortedTree;
  }

  /**
   * Filter menu items by banking mode
   */
  private filterMenuByBankingMode(items: MenuItem[], bankingMode: string): MenuItem[] {
    return items
      .filter(item =>
        !item.banking_types ||
        item.banking_types.length === 0 ||
        item.banking_types.includes(bankingMode) ||
        item.banking_types.includes('dual')
      )
      .map(item => ({
        ...item,
        children: item.children ? this.filterMenuByBankingMode(item.children, bankingMode) : []
      }));
  }

  /**
   * Filter active menu items
   */
  private filterActiveMenuItems(items: MenuItem[]): MenuItem[] {
    return items
      .filter(item => item.is_active)
      .map(item => ({
        ...item,
        children: item.children ? this.filterActiveMenuItems(item.children) : []
      }));
  }

  /**
   * Get fallback menu tree
   */
  private getFallbackMenuTree(context: MenuRenderContext): MenuItem[] {
    const fallbackMenu: MenuItem[] = [
      {
        id: 'dashboard',
        key: 'dashboard',
        title: 'Dashboard',
        icon: 'dashboard',
        url: '/banking/dashboard',
        type: 'item',
        sort_order: 1,
        is_active: true,
        user_types: ['banking_staff', 'consultant', 'regulator', 'platform_admin'],
        banking_types: ['conventional', 'syariah', 'dual'],
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 'ifrs9',
        key: 'ifrs9',
        title: 'IFRS 9',
        icon: 'analytics',
        type: 'group',
        sort_order: 2,
        is_active: true,
        user_types: ['banking_staff', 'consultant'],
        banking_types: ['conventional', 'syariah', 'dual'],
        created_at: new Date(),
        updated_at: new Date(),
        children: [
          {
            id: 'ifrs9-portfolio',
            key: 'ifrs9-portfolio',
            title: 'Portfolio Management',
            url: '/banking/portfolio',
            type: 'item',
            sort_order: 1,
            is_active: true,
            parent_id: 'ifrs9',
            user_types: ['banking_staff', 'consultant'],
            banking_types: ['conventional', 'syariah', 'dual'],
            created_at: new Date(),
            updated_at: new Date()
          },
          {
            id: 'ifrs9-calculations',
            key: 'ifrs9-calculations',
            title: 'ECL Calculations',
            url: '/banking/calculations',
            type: 'item',
            sort_order: 2,
            is_active: true,
            parent_id: 'ifrs9',
            user_types: ['banking_staff', 'consultant'],
            banking_types: ['conventional', 'syariah', 'dual'],
            created_at: new Date(),
            updated_at: new Date()
          }
        ]
      },
      {
        id: 'reports',
        key: 'reports',
        title: 'Reports',
        icon: 'description',
        url: '/banking/reports',
        type: 'item',
        sort_order: 3,
        is_active: true,
        user_types: ['banking_staff', 'consultant', 'regulator'],
        banking_types: ['conventional', 'syariah', 'dual'],
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    // Filter by user type and banking type
    return fallbackMenu
      .filter(item =>
        !item.user_types ||
        item.user_types.includes(context.user.userType)
      )
      .filter(item =>
        !item.banking_types ||
        item.banking_types.includes(context.user.bankingType || 'conventional') ||
        item.banking_types.includes('dual')
      );
  }
}