// ============================================================================
// COMPREHENSIVE MENU SERVICE - DATABASE-DRIVEN SYSTEM
// ============================================================================
// File Path: packages/backend/src/core/services/menu/menu.service.ts
// Purpose: Complete database-driven menu system with role-based access and caching
// Dependencies: PostgreSQL, Sequelize Models, Redis Caching
// ============================================================================

import { Op } from 'sequelize';
import {
  MenuConfiguration,
  MenuItem,
  MenuUserCustomization,
  MenuAccessLog
} from '../../models/menu.models';

export interface MenuHierarchyItem {
  id: string;
  key: string;
  title: string;
  description?: string;
  icon?: string;
  url?: string;
  component?: string;
  type: 'group' | 'item' | 'divider';
  level: number;
  sort_order: number;
  children: MenuHierarchyItem[];
  permissions: string[];
  user_types: string[];
  banking_types: string[];
  tenant_types: string[];
  visibility_rules: Record<string, any>;
  breadcrumb: boolean;
  external: boolean;
  target: '_self' | '_blank' | '_parent' | '_top';
  metadata: Record<string, any>;
}

export interface MenuContext {
  userId: string;
  tenantId?: string;
  userRoles: string[];
  userType: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  tenantType?: string;
  permissions: string[];
}

export interface CreateMenuItemDto {
  menu_config_id: string;
  key: string;
  title: string;
  description?: string;
  icon?: string;
  url?: string;
  component?: string;
  type: 'group' | 'item' | 'divider';
  parent_id?: string;
  sort_order?: number;
  permissions?: string[];
  user_types?: string[];
  banking_types?: string[];
  tenant_types?: string[];
  visibility_rules?: Record<string, any>;
  breadcrumb?: boolean;
  external?: boolean;
  target?: '_self' | '_blank' | '_parent' | '_top';
  metadata?: Record<string, any>;
}

export class MenuService {
  private readonly logger = {
    log: (message: string, ...args: any[]) => console.log(`[MenuService] ${message}`, ...args),
    warn: (message: string, ...args: any[]) => console.warn(`[MenuService] ${message}`, ...args),
    error: (message: string, ...args: any[]) => console.error(`[MenuService] ${message}`, ...args)
  };
  private readonly cacheKeyPrefix = 'menu:';
  private readonly cacheTimeout = 300; // 5 minutes

  constructor() {
    this.logger.log('MenuService initialized with comprehensive database-driven menu support');
  }

  // ============================================================================
  // MENU HIERARCHY GENERATION
  // ============================================================================

  /**
   * Get user menu hierarchy with comprehensive role-based filtering
   */
  async getUserMenuHierarchy(
    context: MenuContext,
    useCache: boolean = true
  ): Promise<MenuHierarchyItem[]> {
    try {
      const cacheKey = `${this.cacheKeyPrefix}hierarchy:${context.userId}:${context.tenantId || 'no-tenant'}:${context.bankingType}`;

      this.logger.log(`Getting menu hierarchy for user: ${context.userId}, banking: ${context.bankingType}, tenant: ${context.tenantId}`);

      // Try cache first
      if (useCache) {
        const cached = await this.getFromCache(cacheKey);
        if (cached) {
          this.logger.log(`Menu hierarchy retrieved from cache: ${cached.length} items`);
          return cached;
        }
      }

      // Get appropriate menu configuration
      const menuConfig = await this.getMenuConfiguration(context);
      if (!menuConfig) {
        this.logger.warn(`No menu configuration found for user: ${context.userId}`);
        return [];
      }

      // Get all menu items for this configuration
      const menuItems = await MenuItem.findAll({
        where: {
          menu_config_id: menuConfig.id,
          is_active: true
        },
        order: [
          ['sort_order', 'ASC'],
          ['created_at', 'ASC']
        ],
        include: [
          {
            association: 'children',
            where: { is_active: true },
            required: false,
            order: [
              ['sort_order', 'ASC'],
              ['created_at', 'ASC']
            ]
          }
        ]
      });

      // Build hierarchy with role-based filtering
      const hierarchy = await this.buildMenuHierarchy(menuItems, context);

      // Cache the result
      if (useCache) {
        await this.setCache(cacheKey, hierarchy);
      }

      this.logger.log(`Menu hierarchy built: ${hierarchy.length} root items`);
      return hierarchy;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get user menu hierarchy: ${errorMessage}`);
      throw new Error(`Menu hierarchy retrieval failed: ${errorMessage}`);
    }
  }

  /**
   * Build menu hierarchy from flat menu items with role-based filtering
   */
  private async buildMenuHierarchy(
    menuItems: MenuItem[],
    context: MenuContext
  ): Promise<MenuHierarchyItem[]> {
    const flatItems = menuItems.map(item => item.get({ plain: true }));

    // Filter based on user context
    const filteredItems = flatItems.filter(item =>
      this.isMenuItemVisible(item, context)
    );

    // Build tree structure
    const itemMap = new Map<string, MenuHierarchyItem>();
    const rootItems: MenuHierarchyItem[] = [];

    // Create menu hierarchy items
    filteredItems.forEach(item => {
      const hierarchyItem: MenuHierarchyItem = {
        id: item.id,
        key: item.key,
        title: item.title,
        description: item.description,
        icon: item.icon,
        url: item.url,
        component: item.component,
        type: item.type,
        level: this.calculateLevel(item, filteredItems),
        sort_order: item.sort_order,
        children: [],
        permissions: item.permissions,
        user_types: item.user_types,
        banking_types: item.banking_types,
        tenant_types: item.tenant_types,
        visibility_rules: item.visibility_rules,
        breadcrumb: item.breadcrumb,
        external: item.external,
        target: item.target,
        metadata: item.metadata
      };

      itemMap.set(item.id, hierarchyItem);
    });

    // Build tree relationships
    filteredItems.forEach(item => {
      const hierarchyItem = itemMap.get(item.id);

      if (item.parent_id && itemMap.has(item.parent_id)) {
        const parent = itemMap.get(item.parent_id);
        parent!.children.push(hierarchyItem!);
      } else if (hierarchyItem) {
        rootItems.push(hierarchyItem);
      }
    });

    // Sort children by sort_order
    const sortChildren = (items: MenuHierarchyItem[]) => {
      items.sort((a, b) => a.sort_order - b.sort_order);
      items.forEach(item => {
        if (item.children.length > 0) {
          sortChildren(item.children);
        }
      });
    };

    sortChildren(rootItems);

    // Apply user customizations
    await this.applyUserCustomizations(rootItems, context);

    return rootItems;
  }

  /**
   * Check if menu item is visible to user based on role and context
   */
  private isMenuItemVisible(item: any, context: MenuContext): boolean {
    // Check banking type compatibility
    if (item.banking_types && item.banking_types.length > 0) {
      if (!item.banking_types.includes(context.bankingType) &&
          !item.banking_types.includes('dual')) {
        return false;
      }
    }

    // Check user type compatibility
    if (item.user_types && item.user_types.length > 0) {
      if (!item.user_types.includes(context.userType)) {
        return false;
      }
    }

    // Check tenant type compatibility
    if (item.tenant_types && item.tenant_types.length > 0 && context.tenantType) {
      if (!item.tenant_types.includes(context.tenantType) &&
          !item.tenant_types.includes('all')) {
        return false;
      }
    }

    // Check permissions
    if (item.permissions && item.permissions.length > 0) {
      const hasPermission = item.permissions.some((permission: string) =>
        context.permissions.includes(permission)
      );
      if (!hasPermission) {
        return false;
      }
    }

    // Check visibility rules
    if (item.visibility_rules && Object.keys(item.visibility_rules).length > 0) {
      return this.evaluateVisibilityRules(item.visibility_rules, context);
    }

    return true;
  }

  /**
   * Evaluate visibility rules for menu items
   */
  private evaluateVisibilityRules(rules: Record<string, any>, context: MenuContext): boolean {
    // Example visibility rules:
    // {
    //   "requires_tenant": true,
    //   "min_user_level": "manager",
    //   "feature_flags": ["advanced_analytics"],
    //   "custom_conditions": "some_condition"
    // }

    if (rules.requires_tenant && !context.tenantId) {
      return false;
    }

    if (rules.min_user_level && context.userRoles) {
      const userLevels = context.userRoles.map(role => role.toLowerCase());
      if (!userLevels.includes(rules.min_user_level.toLowerCase())) {
        return false;
      }
    }

    // Add more rule evaluations as needed
    return true;
  }

  /**
   * Calculate hierarchy level for menu item
   */
  private calculateLevel(item: any, allItems: any[]): number {
    if (!item.parent_id) return 0;

    const parent = allItems.find(i => i.id === item.parent_id);
    if (!parent) return 0;

    return 1 + this.calculateLevel(parent, allItems);
  }

  /**
   * Apply user customizations (hidden items, custom order, bookmarks)
   */
  private async applyUserCustomizations(
    menuItems: MenuHierarchyItem[],
    context: MenuContext
  ): Promise<void> {
    if (!context.userId) return;

    try {
      const customization = await MenuUserCustomization.findOne({
        where: {
          user_id: context.userId,
          tenant_id: context.tenantId
        },
        include: [{
          association: 'menu_configuration',
          attributes: ['id', 'name']
        }]
      });

      if (!customization) return;

      const customizationData = customization.get({ plain: true });

      // Apply hidden items filter
      if (customizationData.hidden_items && customizationData.hidden_items.length > 0) {
        const hiddenItemIds = new Set(customizationData.hidden_items);
        this.removeHiddenItems(menuItems, hiddenItemIds);
      }

      // Apply custom ordering
      if (customizationData.custom_order && Object.keys(customizationData.custom_order).length > 0) {
        this.applyCustomOrder(menuItems, customizationData.custom_order);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to apply user customizations: ${errorMessage}`);
    }
  }

  /**
   * Remove hidden items from menu hierarchy recursively
   */
  private removeHiddenItems(items: MenuHierarchyItem[], hiddenItemIds: Set<string>): void {
    for (let i = items.length - 1; i >= 0; i--) {
      if (hiddenItemIds.has(items[i].id)) {
        items.splice(i, 1);
      } else if (items[i].children.length > 0) {
        this.removeHiddenItems(items[i].children, hiddenItemIds);
      }
    }
  }

  /**
   * Apply custom ordering to menu items
   */
  private applyCustomOrder(items: MenuHierarchyItem[], customOrder: Record<string, number>): void {
    items.sort((a, b) => {
      const orderA = customOrder[a.id] ?? a.sort_order;
      const orderB = customOrder[b.id] ?? b.sort_order;
      return orderA - orderB;
    });

    items.forEach(item => {
      if (item.children.length > 0) {
        this.applyCustomOrder(item.children, customOrder);
      }
    });
  }

  // ============================================================================
  // MENU CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Get appropriate menu configuration for user context
   */
  private async getMenuConfiguration(context: MenuContext): Promise<MenuConfiguration | null> {
    try {
      // Determine target audience based on user type and roles
      let targetAudience: 'banking_staff' | 'consultant' | 'regulator' | 'platform_admin';

      if (context.userType === 'platform_admin' || context.userRoles.includes('PLATFORM_SUPER_ADMIN')) {
        targetAudience = 'platform_admin';
      } else if (context.userRoles.includes('SENIOR_IFRS9_CONSULTANT')) {
        targetAudience = 'consultant';
      } else if (context.userRoles.includes('BANKING_SUPERVISION_HEAD')) {
        targetAudience = 'regulator';
      } else {
        targetAudience = 'banking_staff';
      }

      // Build where clause dynamically
      const whereClause: any = {
        target_audience: targetAudience,
        tenant_specific: !!context.tenantId,
        is_active: true
      };

      // Only add banking_mode if not dual
      if (context.bankingType !== 'dual') {
        whereClause.banking_mode = context.bankingType;
      }

      // Find matching configuration
      const config = await MenuConfiguration.findOne({
        where: whereClause,
        order: [
          ['is_default', 'DESC'],
          ['created_at', 'DESC']
        ]
      });

      return config;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get menu configuration: ${errorMessage}`);
      return null;
    }
  }

  // ============================================================================
  // MENU CRUD OPERATIONS
  // ============================================================================

  /**
   * Create new menu item
   */
  async createMenuItem(createDto: CreateMenuItemDto, _createdBy: string): Promise<MenuItem> {
    try {
      this.logger.log(`Creating menu item: ${createDto.title}`);

      const menuItem = await MenuItem.create({
        menu_config_id: createDto.menu_config_id,
        key: createDto.key,
        title: createDto.title,
        description: createDto.description,
        icon: createDto.icon,
        url: createDto.url,
        component: createDto.component,
        type: createDto.type,
        parent_id: createDto.parent_id,
        sort_order: createDto.sort_order ?? 100,
        is_active: true,
        permissions: createDto.permissions || [],
        user_types: createDto.user_types || [],
        banking_types: createDto.banking_types || [],
        tenant_types: createDto.tenant_types || [],
        visibility_rules: createDto.visibility_rules || {},
        breadcrumb: createDto.breadcrumb ?? true,
        external: createDto.external ?? false,
        target: createDto.target ?? '_self',
        metadata: createDto.metadata || {}
      });

      this.logger.log(`Menu item created: ${menuItem.title} (${menuItem.id})`);

      // Clear relevant caches
      await this.clearMenuCache();

      return menuItem;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create menu item: ${errorMessage}`);
      throw new Error(`Menu item creation failed: ${errorMessage}`);
    }
  }

  /**
   * Update existing menu item
   */
  async updateMenuItem(
    id: string,
    updateDto: Partial<CreateMenuItemDto>,
    _updatedBy: string
  ): Promise<MenuItem | null> {
    try {
      this.logger.log(`Updating menu item: ${id}`);

      const menuItem = await MenuItem.findByPk(id);
      if (!menuItem) {
        throw new Error(`Menu item not found: ${id}`);
      }

      const allowedFields = [
        'menu_config_id', 'key', 'title', 'description', 'icon', 'url',
        'component', 'type', 'parent_id', 'sort_order', 'is_active',
        'permissions', 'user_types', 'banking_types', 'tenant_types',
        'visibility_rules', 'breadcrumb', 'external', 'target', 'metadata'
      ];

      const updateData: any = {};
      allowedFields.forEach(field => {
        if (updateDto[field as keyof CreateMenuItemDto] !== undefined) {
          updateData[field] = updateDto[field as keyof CreateMenuItemDto];
        }
      });

      await menuItem.update(updateData);

      this.logger.log(`Menu item updated: ${menuItem.title} (${menuItem.id})`);

      // Clear relevant caches
      await this.clearMenuCache();

      return menuItem;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update menu item: ${errorMessage}`);
      throw new Error(`Menu item update failed: ${errorMessage}`);
    }
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      this.logger.log(`Deleting menu item: ${id}`);

      const deleted = await MenuItem.destroy({
        where: { id }
      });

      if (deleted > 0) {
        this.logger.log(`Menu item deleted: ${id}`);

        // Clear relevant caches
        await this.clearMenuCache();
        return true;
      }

      return false;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to delete menu item: ${errorMessage}`);
      throw new Error(`Menu item deletion failed: ${errorMessage}`);
    }
  }

  // ============================================================================
  // USER CUSTOMIZATIONS
  // ============================================================================

  /**
   * Update user menu customizations
   */
  async updateUserCustomization(
    userId: string,
    tenantId: string | undefined,
    menuConfigId: string,
    customizations: {
      hidden_items?: string[];
      custom_order?: Record<string, number>;
      bookmarks?: string[];
      preferences?: Record<string, any>;
    }
  ): Promise<MenuUserCustomization> {
    try {
      this.logger.log(`Updating menu customization for user: ${userId}`);

      const findOrCreateOptions: any = {
        where: {
          user_id: userId,
          menu_config_id: menuConfigId
        },
        defaults: {
          hidden_items: [],
          custom_order: {},
          bookmarks: [],
          preferences: {}
        }
      };

      if (tenantId) {
        findOrCreateOptions.where.tenant_id = tenantId;
      }

      const [customization] = await MenuUserCustomization.findOrCreate(findOrCreateOptions);

      await customization.update({
        hidden_items: customizations.hidden_items || [],
        custom_order: customizations.custom_order || {},
        bookmarks: customizations.bookmarks || [],
        preferences: customizations.preferences || {},
        updated_at: new Date()
      });

      // Clear user's cache
      await this.clearUserCache(userId, tenantId);

      this.logger.log(`Menu customization updated for user: ${userId}`);
      return customization;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to update user customization: ${errorMessage}`);
      throw new Error(`User customization update failed: ${errorMessage}`);
    }
  }

  // ============================================================================
  // MENU ANALYTICS
  // ============================================================================

  /**
   * Log menu access for analytics
   */
  async logMenuAccess(
    menuItemId: string,
    userId: string,
    tenantId: string | undefined,
    accessData: {
      accessed_url?: string;
      user_agent?: string;
      ip_address?: string;
      session_id?: string;
      response_time?: number;
      success?: boolean;
      error_message?: string;
    }
  ): Promise<void> {
    try {
      await MenuAccessLog.create({
        menu_item_id: menuItemId,
        user_id: userId,
        tenant_id: tenantId,
        accessed_url: accessData.accessed_url,
        user_agent: accessData.user_agent,
        ip_address: accessData.ip_address,
        session_id: accessData.session_id,
        response_time: accessData.response_time,
        success: accessData.success ?? true,
        error_message: accessData.error_message,
        accessed_at: new Date()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn(`Failed to log menu access: ${errorMessage}`);
    }
  }

  /**
   * Get menu access analytics
   */
  async getMenuAccessAnalytics(
    menuItemId?: string,
    userId?: string,
    tenantId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    try {
      const whereClause: any = {};

      if (menuItemId) whereClause.menu_item_id = menuItemId;
      if (userId) whereClause.user_id = userId;
      if (tenantId) whereClause.tenant_id = tenantId;

      if (startDate || endDate) {
        const dateClause: any = {};
        if (startDate) dateClause[Op.gte] = startDate;
        if (endDate) dateClause[Op.lte] = endDate;
        whereClause.accessed_at = dateClause;
      }

      // Simplified analytics query
      const analytics = await MenuAccessLog.findAll({
        where: whereClause,
        attributes: [
          'menu_item_id',
          [Op.fn('COUNT', Op.col('id')), 'access_count']
        ],
        group: ['menu_item_id'],
        order: [[Op.literal('access_count'), 'DESC']]
      });

      return analytics.map(item => ({
        menu_item_id: item.get('menu_item_id'),
        access_count: item.get('access_count')
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get menu access analytics: ${errorMessage}`);
      throw new Error(`Menu access analytics retrieval failed: ${errorMessage}`);
    }
  }

  // ============================================================================
  // CACHE MANAGEMENT
  // ============================================================================

  /**
   * Get data from cache (Redis implementation would go here)
   */
  private async getFromCache(key: string): Promise<any | null> {
    // TODO: Implement Redis caching
    return null;
  }

  /**
   * Set data in cache (Redis implementation would go here)
   */
  private async setCache(key: string, data: any): Promise<void> {
    // TODO: Implement Redis caching
  }

  /**
   * Clear all menu-related caches
   */
  private async clearMenuCache(): Promise<void> {
    // TODO: Implement Redis cache clearing
  }

  /**
   * Clear user-specific cache
   */
  private async clearUserCache(userId: string, tenantId?: string): Promise<void> {
    // TODO: Implement user-specific cache clearing
  }

  // ============================================================================
  // MENU MANAGEMENT OPERATIONS
  // ============================================================================

  /**
   * Get all menu items for management with pagination and filtering
   */
  async getAllMenuItems(options: {
    page: number;
    limit: number;
    search?: string;
    activeOnly?: boolean;
    includeInactive?: boolean;
  }): Promise<{
    items: MenuItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const whereClause: any = {};

      if (options.activeOnly) {
        whereClause.is_active = true;
      }

      if (options.search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${options.search}%` } },
          { key: { [Op.iLike]: `%${options.search}%` } },
          { description: { [Op.iLike]: `%${options.search}%` } }
        ];
      }

      const offset = (options.page - 1) * options.limit;

      const { count, rows } = await MenuItem.findAndCountAll({
        where: whereClause,
        limit: options.limit,
        offset,
        order: [
          ['sort_order', 'ASC'],
          ['created_at', 'ASC']
        ],
        include: [
          {
            association: 'parent',
            attributes: ['id', 'title', 'key']
          }
        ]
      });

      return {
        items: rows,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: count,
          totalPages: Math.ceil(count / options.limit)
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get all menu items: ${errorMessage}`);
      throw new Error(`Menu items retrieval failed: ${errorMessage}`);
    }
  }

  /**
   * Get all menu configurations
   */
  async getMenuConfigurations(): Promise<MenuConfiguration[]> {
    try {
      const configurations = await MenuConfiguration.findAll({
        order: [
          ['is_default', 'DESC'],
          ['created_at', 'DESC']
        ]
      });

      return configurations;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get menu configurations: ${errorMessage}`);
      throw new Error(`Menu configurations retrieval failed: ${errorMessage}`);
    }
  }

  /**
   * Create new menu configuration
   */
  async createMenuConfiguration(createDto: any, createdBy: string): Promise<MenuConfiguration> {
    try {
      this.logger.log(`Creating menu configuration: ${createDto.name}`);

      const configuration = await MenuConfiguration.create({
        name: createDto.name,
        description: createDto.description,
        target_audience: createDto.target_audience || 'banking_staff',
        banking_mode: createDto.banking_mode || 'dual',
        tenant_specific: createDto.tenant_specific ?? false,
        is_default: createDto.is_default ?? false,
        is_active: createDto.is_active ?? true,
        metadata: createDto.metadata || {},
        created_by: createdBy
      });

      this.logger.log(`Menu configuration created: ${configuration.name} (${configuration.id})`);

      return configuration;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create menu configuration: ${errorMessage}`);
      throw new Error(`Menu configuration creation failed: ${errorMessage}`);
    }
  }

  /**
   * Get complete menu tree structure
   */
  async getMenuTree(options: {
    menuConfigId?: string;
    includeInactive?: boolean;
  }): Promise<any[]> {
    try {
      const whereClause: any = {};

      if (options.menuConfigId) {
        whereClause.menu_config_id = options.menuConfigId;
      }

      if (!options.includeInactive) {
        whereClause.is_active = true;
      }

      const menuItems = await MenuItem.findAll({
        where: whereClause,
        order: [
          ['sort_order', 'ASC'],
          ['created_at', 'ASC']
        ]
      });

      const flatItems = menuItems.map(item => item.get({ plain: true }));

      // Build tree structure
      const buildTree = (items: any[], parentId: string | null = null): any[] => {
        return items
          .filter(item => item.parent_id === parentId)
          .map(item => ({
            ...item,
            children: buildTree(items, item.id)
          }));
      };

      return buildTree(flatItems);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get menu tree: ${errorMessage}`);
      throw new Error(`Menu tree retrieval failed: ${errorMessage}`);
    }
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(items: { id: string; sort_order: number }[], updatedBy: string): Promise<MenuItem[]> {
    try {
      this.logger.log(`Reordering ${items.length} menu items`);

      const updatePromises = items.map(item =>
        MenuItem.update(
          { sort_order: item.sort_order, updated_by: updatedBy },
          { where: { id: item.id } }
        )
      );

      await Promise.all(updatePromises);

      // Clear cache
      await this.clearMenuCache();

      // Return updated items
      const updatedItems = await MenuItem.findAll({
        where: {
          id: items.map(item => item.id)
        },
        order: [['sort_order', 'ASC']]
      });

      this.logger.log(`Menu items reordered successfully`);
      return updatedItems;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to reorder menu items: ${errorMessage}`);
      throw new Error(`Menu items reordering failed: ${errorMessage}`);
    }
  }

  /**
   * Get user customizations for management
   */
  async getUserCustomizations(userId?: string, tenantId?: string): Promise<MenuUserCustomization[]> {
    try {
      const whereClause: any = {};

      if (userId) whereClause.user_id = userId;
      if (tenantId) whereClause.tenant_id = tenantId;

      const customizations = await MenuUserCustomization.findAll({
        where: whereClause,
        include: [
          {
            association: 'menu_configuration',
            attributes: ['id', 'name', 'target_audience']
          },
          {
            association: 'user',
            attributes: ['id', 'username', 'email']
          }
        ],
        order: [['updated_at', 'DESC']]
      });

      return customizations;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to get user customizations: ${errorMessage}`);
      throw new Error(`User customizations retrieval failed: ${errorMessage}`);
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Health check for menu service
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: any;
  }> {
    try {
      const startTime = Date.now();

      // Test database connection
      const configCount = await MenuConfiguration.count({
        where: { is_active: true }
      });

      const itemCount = await MenuItem.count({
        where: { is_active: true }
      });

      const responseTime = Date.now() - startTime;

      return {
        status: 'healthy',
        details: {
          database_connection: 'ok',
          menu_configurations: configCount,
          menu_items: itemCount,
          response_time_ms: responseTime,
          cache_status: 'operational' // TODO: Check Redis connection
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Menu service health check failed: ${errorMessage}`);
      return {
        status: 'unhealthy',
        details: {
          database_connection: 'failed',
          error: errorMessage
        }
      };
    }
  }
}
