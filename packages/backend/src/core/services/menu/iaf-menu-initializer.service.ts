// packages/backend/src/core/services/menu/iaf-menu-initializer.service.ts
// IAF Menu Database Initializer Service

import { Logger } from 'winston';
import { getIAFMenuSeedData } from './iaf-menu-seed';
import { databaseConfig } from '../../database/config/database.config';

export class IAFMenuInitializerService {
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger.child({ service: 'IAFMenuInitializerService' });
  }

  /**
   * Initialize IAF menu structure in database
   */
  async initializeIAFMenu(): Promise<boolean> {
    try {
      this.logger.info('Initializing IAF menu structure in database');

      const platformDb = databaseConfig.getPlatformConnection();
      const seedData = getIAFMenuSeedData();

      // Start transaction
      const transaction = await platformDb.transaction();

      try {
        // Insert menu configurations
        for (const config of seedData.configurations) {
          await transaction.query(`
            INSERT INTO platform_admin.menu_configurations
            (id, name, description, target_audience, banking_mode, tenant_specific, is_default, is_active, version, created_by, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
          `, [
            config.id,
            config.name,
            config.description,
            config.target_audience,
            config.banking_mode,
            config.tenant_specific,
            config.is_default,
            config.is_active,
            config.version,
            config.created_by,
            config.created_at,
            config.updated_at
          ]);
        }

        // Create a map for menu item IDs to establish parent-child relationships
        const menuItemMap = new Map<string, string>();
        const groupMenuItems: any[] = [];

        // First pass: insert all menu items and build mapping
        for (const item of seedData.items) {
          await transaction.query(`
            INSERT INTO platform_admin.menu_items
            (id, menu_config_id, key, title, description, icon, url, component, type, parent_id, sort_order, is_active, permissions, user_types, banking_types, tenant_types, visibility_rules, breadcrumb, external, target, metadata, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              icon = EXCLUDED.icon,
              url = EXCLUDED.url,
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
          `, [
            item.id,
            item.menu_config_id,
            item.key,
            item.title,
            item.description,
            item.icon,
            item.url,
            item.component,
            item.type,
            item.parent_id, // Will be null initially
            item.sort_order,
            item.is_active,
            JSON.stringify(item.permissions),
            JSON.stringify(item.user_types),
            JSON.stringify(item.banking_types),
            JSON.stringify(item.tenant_types),
            JSON.stringify(item.visibility_rules),
            item.breadcrumb,
            item.external,
            item.target,
            JSON.stringify(item.metadata),
            item.created_at,
            item.updated_at
          ]);

          // Build mapping for parent-child relationships
          menuItemMap.set(item.key, item.id);

          // Track group items for second pass
          if (item.type === 'group') {
            groupMenuItems.push(item);
          }
        }

        // Second pass: update parent-child relationships for group items
        for (const groupItem of groupMenuItems) {
          // Find children of this group and update their parent_id
          const childKeys = [
            'application-configuration', 'business-configuration', // system-setup children
            'product-parameters', 'accounting-parameters', 'risk-parameters', // parameter-management children
            'portfolio-overview', 'customer-data', 'account-data', 'product-catalog', // data-management children
            'ecl-calculations', 'ifrs9-staging', // ifrs9-processing children
            'ifrs9-reports', 'advanced-analytics', // reports children
            'user-management', 'menu-management' // administration children
          ];

          const groupKeyToChildrenMap: Record<string, string[]> = {
            'system-setup': ['application-configuration', 'business-configuration'],
            'parameter-management': ['product-parameters', 'accounting-parameters', 'risk-parameters'],
            'data-management': ['portfolio-overview', 'customer-data', 'account-data', 'product-catalog'],
            'ifrs9-processing': ['ecl-calculations', 'ifrs9-staging'],
            'reports': ['ifrs9-reports', 'advanced-analytics'],
            'administration': ['user-management', 'menu-management']
          };

          const childrenKeys = groupKeyToChildrenMap[groupItem.key] || [];

          for (const childKey of childrenKeys) {
            const childId = menuItemMap.get(childKey);
            if (childId) {
              await transaction.query(`
                UPDATE platform_admin.menu_items
                SET parent_id = $1
                WHERE key = $2 AND menu_config_id = $3
              `, [groupItem.id, childKey, groupItem.menu_config_id]);
            }
          }
        }

        // Commit transaction
        await transaction.commit();

        this.logger.info('IAF menu structure initialized successfully', {
          configurationsInserted: seedData.configurations.length,
          menuItemsInserted: seedData.items.length
        });

        return true;

      } catch (error) {
        await transaction.rollback();
        throw error;
      }

    } catch (error) {
      this.logger.error('Failed to initialize IAF menu structure', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });
      return false;
    }
  }

  /**
   * Check if IAF menu structure exists
   */
  async checkIAFMenuExists(): Promise<boolean> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();

      const result = await platformDb.query(`
        SELECT COUNT(*) as count
        FROM platform_admin.menu_configurations
        WHERE name = 'IAF Banking Staff Menu'
      `);

      const count = parseInt(result.rows[0]?.count || '0');
      this.logger.info('IAF menu structure check', { count });

      return count > 0;

    } catch (error) {
      this.logger.error('Failed to check IAF menu structure', {
        error: (error as Error).message
      });
      return false;
    }
  }

  /**
   * Get menu statistics
   */
  async getMenuStatistics(): Promise<any> {
    try {
      const platformDb = databaseConfig.getPlatformConnection();

      const [configResult, itemsResult] = await Promise.all([
        platformDb.query('SELECT COUNT(*) as count FROM platform_admin.menu_configurations'),
        platformDb.query('SELECT COUNT(*) as count FROM platform_admin.menu_items')
      ]);

      return {
        configurations: parseInt(configResult.rows[0]?.count || '0'),
        items: parseInt(itemsResult.rows[0]?.count || '0')
      };

    } catch (error) {
      this.logger.error('Failed to get menu statistics', {
        error: (error as Error).message
      });
      return { configurations: 0, items: 0 };
    }
  }

  /**
   * Clear existing menu structure (for reinitialization)
   */
  async clearMenuStructure(): Promise<boolean> {
    try {
      this.logger.info('Clearing existing menu structure');

      const platformDb = databaseConfig.getPlatformConnection();

      // Clear in correct order (children first, then parents)
      await platformDb.query('DELETE FROM platform_admin.menu_items');
      await platformDb.query('DELETE FROM platform_admin.menu_configurations');

      this.logger.info('Existing menu structure cleared');
      return true;

    } catch (error) {
      this.logger.error('Failed to clear menu structure', {
        error: (error as Error).message
      });
      return false;
    }
  }
}