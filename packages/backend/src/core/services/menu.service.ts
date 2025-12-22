// packages/backend/src/core/services/menu.service.ts
// Menu management service with role-based access control

import { MenuItem, RoleMenuAccess, MenuConfiguration, modelManager } from '../../models';
import { MenuItem as MenuItemType } from '../../types/menu.types';
import logger from '../../config/logger';

export interface MenuQueryOptions {
  userRole?: string;
  bankingMode?: 'conventional' | 'syariah' | 'dual';
  includeInactive?: boolean;
  parentId?: string;
  level?: number;
}

export interface MenuHierarchyItem extends MenuItemType {
  children?: MenuHierarchyItem[];
}

export class MenuService {
  private readonly menuItemModel: typeof MenuItem;
  private readonly roleMenuAccessModel: typeof RoleMenuAccess;
  private readonly menuConfigurationModel: typeof MenuConfiguration;

  constructor() {
    const models = modelManager.getAllModels();
    this.menuItemModel = models.MenuItem;
    this.roleMenuAccessModel = models.RoleMenuAccess;
    this.menuConfigurationModel = models.MenuConfiguration;

    if (!this.menuItemModel) {
      throw new Error('Menu models not initialized. Please check database connection.');
    }
  }

  // ============================================================================
  // MENU ITEM CRUD OPERATIONS
  // ============================================================================

  /**
   * Get all menu items with hierarchy support
   */
  async getMenuTree(options: MenuQueryOptions = {}): Promise<MenuHierarchyItem[]> {
    try {
      const {
        userRole,
        bankingMode,
        includeInactive = false,
        parentId = null,
        level = 0
      } = options;

      const whereConditions: any = {
        parent_id: parentId,
        level: level
      };

      if (!includeInactive) {
        whereConditions.is_active = true;
      }

      // Get menu items
      const menuItems = await this.menuItemModel.findAll({
        where: whereConditions,
        order: [
          ['sort_order', 'ASC'],
          ['label', 'ASC']
        ],
        include: [
          {
            model: this.roleMenuAccessModel,
            as: 'roleAccess',
            required: false,
            where: userRole ? {
              role_id: userRole,
              can_view: true,
              is_active: true
            } : undefined
          }
        ]
      });

      // Filter by banking mode and roles
      const filteredItems = menuItems.filter(item => {
        const itemData = item.get({ plain: true }) as MenuItemType;

        // Filter by banking mode
        if (bankingMode && itemData.banking_modes && !itemData.banking_modes.includes(bankingMode)) {
          return false;
        }

        // Filter by roles
        if (userRole && itemData.roles && !itemData.roles.includes(userRole)) {
          return false;
        }

        // Filter by role-based access
        if (userRole && itemData.roleAccess && itemData.roleAccess.length === 0) {
          return false;
        }

        // Filter by status
        if (itemData.status === 'disabled') {
          return false;
        }

        return true;
      });

      // Build hierarchy with children
      const hierarchyItems: MenuHierarchyItem[] = [];
      for (const item of filteredItems) {
        const itemData = item.get({ plain: true }) as MenuItemType;

        const hierarchyItem: MenuHierarchyItem = {
          ...itemData,
          children: []
        };

        // Get children recursively
        const children = await this.getMenuTree({
          userRole,
          bankingMode,
          includeInactive,
          parentId: item.id,
          level: level + 1
        });

        if (children.length > 0) {
          hierarchyItem.children = children;
        }

        hierarchyItems.push(hierarchyItem);
      }

      return hierarchyItems;
    } catch (error) {
      logger.error('Error getting menu tree:', error);
      throw new Error(`Failed to retrieve menu tree: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get menu item by ID
   */
  async getMenuItemById(id: string): Promise<MenuItem | null> {
    try {
      const menuItem = await this.menuItemModel.findByPk(id, {
        include: [
          {
            model: this.roleMenuAccessModel,
            as: 'roleAccess',
            required: false
          }
        ]
      });

      return menuItem;
    } catch (error) {
      logger.error(`Error getting menu item ${id}:`, error);
      throw new Error(`Failed to retrieve menu item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get menu item by code
   */
  async getMenuItemByCode(code: string): Promise<MenuItem | null> {
    try {
      const menuItem = await this.menuItemModel.findOne({
        where: { code },
        include: [
          {
            model: this.roleMenuAccessModel,
            as: 'roleAccess',
            required: false
          }
        ]
      });

      return menuItem;
    } catch (error) {
      logger.error(`Error getting menu item by code ${code}:`, error);
      throw new Error(`Failed to retrieve menu item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create new menu item
   */
  async createMenuItem(menuData: Partial<MenuItemAttributes>): Promise<MenuItem> {
    try {
      // Validate parent exists if specified
      if (menuData.parent_id) {
        const parent = await this.menuItemModel.findByPk(menuData.parent_id);
        if (!parent) {
          throw new Error(`Parent menu item with ID ${menuData.parent_id} not found`);
        }
        menuData.level = (parent.level + 1);
        menuData.path = `${parent.path}/${menuData.code || ''}`;
      } else {
        menuData.level = 0;
        menuData.path = `/${menuData.code || ''}`;
      }

      // Get next sort order if not specified
      if (!menuData.sort_order) {
        const maxSortOrder = await this.menuItemModel.max('sort_order', {
          where: {
            parent_id: menuData.parent_id || null,
            level: menuData.level
          }
        });
        menuData.sort_order = (maxSortOrder || 0) + 1;
      }

      const menuItem = await this.menuItemModel.create(menuData);
      logger.info(`Created menu item: ${menuItem.code}`);
      return menuItem;
    } catch (error) {
      logger.error('Error creating menu item:', error);
      throw new Error(`Failed to create menu item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update menu item
   */
  async updateMenuItem(id: string, updateData: Partial<MenuItemAttributes>): Promise<MenuItem> {
    try {
      const menuItem = await this.menuItemModel.findByPk(id);
      if (!menuItem) {
        throw new Error(`Menu item with ID ${id} not found`);
      }

      // Handle parent change
      if (updateData.parent_id !== undefined && updateData.parent_id !== menuItem.parent_id) {
        if (updateData.parent_id) {
          const parent = await this.menuItemModel.findByPk(updateData.parent_id);
          if (!parent) {
            throw new Error(`Parent menu item with ID ${updateData.parent_id} not found`);
          }
          updateData.level = parent.level + 1;
          updateData.path = `${parent.path}/${menuItem.code}`;
        } else {
          updateData.level = 0;
          updateData.path = `/${menuItem.code}`;
        }

        // Update all children paths and levels
        await this.updateChildrenPaths(id, updateData.path, updateData.level);
      }

      await menuItem.update(updateData);
      logger.info(`Updated menu item: ${menuItem.code}`);
      return menuItem;
    } catch (error) {
      logger.error(`Error updating menu item ${id}:`, error);
      throw new Error(`Failed to update menu item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(id: string): Promise<boolean> {
    try {
      const menuItem = await this.menuItemModel.findByPk(id);
      if (!menuItem) {
        throw new Error(`Menu item with ID ${id} not found`);
      }

      // Check if has children
      const childrenCount = await this.menuItemModel.count({
        where: { parent_id: id }
      });

      if (childrenCount > 0) {
        throw new Error('Cannot delete menu item with children. Delete children first.');
      }

      await menuItem.destroy();
      logger.info(`Deleted menu item: ${menuItem.code}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting menu item ${id}:`, error);
      throw new Error(`Failed to delete menu item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(items: Array<{ id: string; sort_order: number }>): Promise<boolean> {
    try {
      const transaction = await this.menuItemModel.sequelize!.transaction();

      try {
        for (const item of items) {
          await this.menuItemModel.update(
            { sort_order: item.sort_order },
            {
              where: { id: item.id },
              transaction
            }
          );
        }

        await transaction.commit();
        logger.info('Reordered menu items successfully');
        return true;
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      logger.error('Error reordering menu items:', error);
      throw new Error(`Failed to reorder menu items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // ROLE-BASED ACCESS MANAGEMENT
  // ============================================================================

  /**
   * Get role menu access for a role
   */
  async getRoleMenuAccess(roleId: string): Promise<RoleMenuAccess[]> {
    try {
      const access = await this.roleMenuAccessModel.findAll({
        where: { role_id: roleId },
        include: [
          {
            model: this.menuItemModel,
            as: 'menuItem',
            required: true
          }
        ],
        order: [
          [{ model: this.menuItemModel, as: 'menuItem' }, 'sort_order', 'ASC']
        ]
      });

      return access;
    } catch (error) {
      logger.error(`Error getting role menu access for ${roleId}:`, error);
      throw new Error(`Failed to retrieve role menu access: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update role menu access
   */
  async updateRoleMenuAccess(roleId: string, menuItemId: string, accessData: {
    can_view: boolean;
    can_create: boolean;
    can_update: boolean;
    can_delete: boolean;
  }): Promise<RoleMenuAccess> {
    try {
      const [access, created] = await this.roleMenuAccessModel.findOrCreate({
        where: { role_id: roleId, menu_item_id: menuItemId },
        defaults: {
          ...accessData,
          is_active: true
        }
      });

      if (!created) {
        await access.update(accessData);
      }

      logger.info(`Updated role menu access for role ${roleId}, menu ${menuItemId}`);
      return access;
    } catch (error) {
      logger.error(`Error updating role menu access:`, error);
      throw new Error(`Failed to update role menu access: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // MENU CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Get menu configuration value
   */
  async getMenuConfiguration(key: string): Promise<MenuConfiguration | null> {
    try {
      const config = await this.menuConfigurationModel.findOne({
        where: { key, is_active: true }
      });

      return config;
    } catch (error) {
      logger.error(`Error getting menu configuration ${key}:`, error);
      throw new Error(`Failed to retrieve menu configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Set menu configuration value
   */
  async setMenuConfiguration(key: string, value: any, type: 'string' | 'number' | 'boolean' | 'json' = 'string', options: {
    category?: 'general' | 'appearance' | 'behavior' | 'security';
    description?: string;
    is_encrypted?: boolean;
    created_by?: string;
  } = {}): Promise<MenuConfiguration> {
    try {
      const [config, created] = await this.menuConfigurationModel.findOrCreate({
        where: { key },
        defaults: {
          value: typeof value === 'string' ? value : JSON.stringify(value),
          type,
          category: options.category || 'general',
          description: options.description,
          is_encrypted: options.is_encrypted || false,
          is_active: true,
          created_by: options.created_by
        }
      });

      if (!created) {
        await config.update({
          value: typeof value === 'string' ? value : JSON.stringify(value),
          type,
          updated_by: options.created_by
        });
      }

      logger.info(`Set menu configuration: ${key}`);
      return config;
    } catch (error) {
      logger.error(`Error setting menu configuration ${key}:`, error);
      throw new Error(`Failed to set menu configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Update children paths when parent changes
   */
  private async updateChildrenPaths(parentId: string, newParentPath: string, newParentLevel: number): Promise<void> {
    const children = await this.menuItemModel.findAll({
      where: { parent_id: parentId }
    });

    for (const child of children) {
      const newChildPath = `${newParentPath}/${child.code}`;
      const newChildLevel = newParentLevel + 1;

      await child.update({
        path: newChildPath,
        level: newChildLevel
      });

      // Recursively update grandchildren
      await this.updateChildrenPaths(child.id, newChildPath, newChildLevel);
    }
  }

  /**
   * Check if menu item is accessible by user
   */
  async isMenuItemAccessible(menuItemId: string, userRole: string, bankingMode?: string): Promise<boolean> {
    try {
      const menuItem = await this.menuItemModel.findByPk(menuItemId);
      if (!menuItem || !menuItem.is_active) {
        return false;
      }

      // Check banking mode filter
      if (bankingMode && menuItem.banking_modes && !menuItem.banking_modes.includes(bankingMode as any)) {
        return false;
      }

      // Check role-based filter
      if (menuItem.roles && !menuItem.roles.includes(userRole)) {
        return false;
      }

      // Check role-based access
      const roleAccess = await this.roleMenuAccessModel.findOne({
        where: {
          role_id: userRole,
          menu_item_id: menuItemId,
          can_view: true,
          is_active: true
        }
      });

      if (!roleAccess) {
        return false;
      }

      return true;
    } catch (error) {
      logger.error(`Error checking menu item accessibility:`, error);
      return false;
    }
  }

  /**
   * Initialize default menu structure from hardcoded data
   */
  async initializeDefaultMenuStructure(): Promise<void> {
    try {
      // Check if menu items already exist
      const existingCount = await this.menuItemModel.count();
      if (existingCount > 0) {
        logger.info('Menu structure already initialized');
        return;
      }

      // Import default menu structure from BankingSidebar
      const { BANKING_MENU_STRUCTURE } = await import('../../components/banking/BankingSidebar');

      // Create menu items recursively
      for (const menuItem of BANKING_MENU_STRUCTURE) {
        await this.createMenuItemFromData(menuItem, null);
      }

      logger.info('Default menu structure initialized successfully');
    } catch (error) {
      logger.error('Error initializing default menu structure:', error);
      throw new Error(`Failed to initialize default menu structure: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create menu item from data structure
   */
  private async createMenuItemFromData(menuData: any, parentId: string | null): Promise<void> {
    try {
      const menuItem = await this.createMenuItem({
        code: menuData.id,
        label: menuData.label,
        href: menuData.href,
        description: menuData.description,
        icon: this.serializeIcon(menuData.icon),
        parent_id: parentId,
        banking_modes: menuData.bankingModes,
        roles: menuData.roles,
        badge: menuData.badge,
        status: menuData.status,
        is_new: menuData.isNew,
        requires_setup: menuData.requiresSetup,
        target: menuData.target,
        external_url: menuData.external_url,
        created_by: 'system'
      });

      // Create children recursively
      if (menuData.children && menuData.children.length > 0) {
        for (const childData of menuData.children) {
          await this.createMenuItemFromData(childData, menuItem.id);
        }
      }
    } catch (error) {
      logger.error(`Error creating menu item from data ${menuData.id}:`, error);
    }
  }

  /**
   * Serialize React icon to string
   */
  private serializeIcon(icon: any): string {
    if (!icon) return null;

    // Try to extract icon name from React element
    if (icon && icon.type) {
      return icon.type.displayName || icon.type.name || 'unknown';
    }

    return 'unknown';
  }
}

// Export singleton instance
export const menuService = new MenuService();