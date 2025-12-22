// packages/backend/src/models/index.ts
// ✅ SURGICAL UPDATE: Add FRS9 models integration to your existing ModelManager

import { Sequelize } from 'sequelize';
import { sequelize, platformSequelize, sharedSequelize, getTenantConnection } from '../core/database/connection';
import { User, Role, UserRole, AuditLog, defineAssociations } from '../core/models';
// ✅ SURGICAL ADD: Import FRS9 models
import { initializeFRS9Models, ParamCommonh, ParamCommond, ParamProduct, ParamJournal } from '../core/models/frs9-parameter.models';
// ✅ SURGICAL ADD: Import Menu models
import { initializeMenuModels, MenuItem, RoleMenuAccess, MenuConfiguration } from '../core/models/menu.models';
import logger from '../config/logger';

export class ModelManager {
  private initialized: boolean = false;
  private tenantModels: Map<string, any> = new Map();
  private frs9ModelsInitialized: boolean = false; // ✅ SURGICAL ADD: Track FRS9 initialization
  private menuModelsInitialized: boolean = false; // ✅ SURGICAL ADD: Track Menu models initialization

  // ✅ SURGICAL UPDATE: Enhanced model initialization with FRS9
  public async initializeModels(): Promise<void> {
    try {
      logger.info('🏗️ Initializing database models...');

      // Define associations between core models
      defineAssociations();

      // Test platform connection
      await platformSequelize.authenticate();
      logger.info('✅ Platform database connection verified');

      // Test shared services connection  
      await sharedSequelize.authenticate();
      logger.info('✅ Shared services database connection verified');

      // ✅ SURGICAL ADD: Initialize FRS9 models
      try {
        await initializeFRS9Models();
        this.frs9ModelsInitialized = true;
        logger.info('✅ FRS9 parameter models initialized successfully');
      } catch (frs9Error) {
        logger.warn('⚠️ FRS9 models initialization failed - continuing without FRS9:', frs9Error instanceof Error ? frs9Error.message : String(frs9Error));
        this.frs9ModelsInitialized = false;
      }

      // ✅ SURGICAL ADD: Initialize Menu models
      try {
        await initializeMenuModels(platformSequelize);
        this.menuModelsInitialized = true;
        logger.info('✅ Menu management models initialized successfully');
      } catch (menuError) {
        logger.warn('⚠️ Menu models initialization failed - continuing without menu management:', menuError instanceof Error ? menuError.message : String(menuError));
        this.menuModelsInitialized = false;
      }

      // Sync core models (in development only)
      if (process.env.NODE_ENV === 'development') {
        await this.syncModels();
      }

      this.initialized = true;
      logger.info('✅ All models initialized successfully');

    } catch (error) {
      logger.error('❌ Failed to initialize models:', error);
      throw error;
    }
  }

  // ✅ Sync models with database (development only)
  private async syncModels(): Promise<void> {
    try {
      logger.info('🔄 Syncing models with database...');

      // Sync core models in dependency order
      await Role.sync({ alter: true });
      await User.sync({ alter: true });
      await UserRole.sync({ alter: true });
      await AuditLog.sync({ alter: true });

      logger.info('✅ Core models synchronized with database');

      // ✅ SURGICAL ADD: FRS9 models are handled by their own sync logic
      if (this.frs9ModelsInitialized) {
        logger.info('✅ FRS9 models sync handled by FRS9 initialization');
      }

      // ✅ SURGICAL ADD: Menu models are handled by their own sync logic
      if (this.menuModelsInitialized) {
        logger.info('✅ Menu models sync handled by Menu initialization');
      }

    } catch (error) {
      logger.error('❌ Failed to sync models:', error);
      throw error;
    }
  }

  // ✅ SURGICAL UPDATE: Enhanced model getter with FRS9 support
  public getModel(modelName: string): any {
    switch (modelName) {
      case 'User':
        return User;
      case 'Role':
        return Role;
      case 'UserRole':
        return UserRole;
      case 'AuditLog':
        return AuditLog;
      // ✅ SURGICAL ADD: FRS9 models
      case 'ParamCommonh':
        return this.frs9ModelsInitialized ? ParamCommonh : null;
      case 'ParamCommond':
        return this.frs9ModelsInitialized ? ParamCommond : null;
      case 'ParamProduct':
        return this.frs9ModelsInitialized ? ParamProduct : null;
      case 'ParamJournal':
        return this.frs9ModelsInitialized ? ParamJournal : null;
      // ✅ SURGICAL ADD: Menu models
      case 'MenuItem':
        return this.menuModelsInitialized ? MenuItem : null;
      case 'RoleMenuAccess':
        return this.menuModelsInitialized ? RoleMenuAccess : null;
      case 'MenuConfiguration':
        return this.menuModelsInitialized ? MenuConfiguration : null;
      default:
        logger.warn(`Model ${modelName} not found`);
        return null;
    }
  }

  // ✅ Get tenant-specific models
  public async getTenantModels(tenantId: string): Promise<any> {
    if (this.tenantModels.has(tenantId)) {
      return this.tenantModels.get(tenantId);
    }

    try {
      const tenantConnection = await getTenantConnection(tenantId);
      
      // Initialize tenant-specific models here
      // This would include PortfolioAccount, Transaction, etc.
      const tenantModels = {
        // Add tenant models as they're created
        connection: tenantConnection
      };

      this.tenantModels.set(tenantId, tenantModels);
      return tenantModels;

    } catch (error) {
      logger.error(`Failed to get tenant models for ${tenantId}:`, error);
      throw error;
    }
  }

  // ✅ Check if models are initialized
  public isInitialized(): boolean {
    return this.initialized;
  }

  // ✅ SURGICAL ADD: Check if FRS9 models are initialized
  public isFRS9Initialized(): boolean {
    return this.frs9ModelsInitialized;
  }

  // ✅ SURGICAL ADD: Check if Menu models are initialized
  public isMenuInitialized(): boolean {
    return this.menuModelsInitialized;
  }

  // ✅ SURGICAL UPDATE: Enhanced model list with FRS9 models
  public getAllModels(): Record<string, any> {
    const coreModels = {
      User,
      Role,
      UserRole,
      AuditLog
    };

    // ✅ SURGICAL ADD: Add FRS9 models if initialized
    if (this.frs9ModelsInitialized && this.menuModelsInitialized) {
      return {
        ...coreModels,
        ParamCommonh,
        ParamCommond,
        ParamProduct,
        ParamJournal,
        MenuItem,
        RoleMenuAccess,
        MenuConfiguration
      };
    } else if (this.frs9ModelsInitialized) {
      return {
        ...coreModels,
        ParamCommonh,
        ParamCommond,
        ParamProduct,
        ParamJournal
      };
    } else if (this.menuModelsInitialized) {
      return {
        ...coreModels,
        MenuItem,
        RoleMenuAccess,
        MenuConfiguration
      };
    }

    return coreModels;
  }

  // ✅ SURGICAL UPDATE: Enhanced health check with FRS9
  public async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    // Test core models
    try {
      await User.findOne({ limit: 1 });
      health.User = true;
    } catch {
      health.User = false;
    }

    try {
      await Role.findOne({ limit: 1 });
      health.Role = true;
    } catch {
      health.Role = false;
    }

    try {
      await UserRole.findOne({ limit: 1 });
      health.UserRole = true;
    } catch {
      health.UserRole = false;
    }

    try {
      await AuditLog.findOne({ limit: 1 });
      health.AuditLog = true;
    } catch {
      health.AuditLog = false;
    }

    // ✅ SURGICAL ADD: Test FRS9 models if initialized
    if (this.frs9ModelsInitialized) {
      try {
        await ParamProduct.findOne({ limit: 1 });
        health.ParamProduct = true;
      } catch {
        health.ParamProduct = false;
      }

      try {
        await ParamJournal.findOne({ limit: 1 });
        health.ParamJournal = true;
      } catch {
        health.ParamJournal = false;
      }

      try {
        await ParamCommonh.findOne({ limit: 1 });
        health.ParamCommonh = true;
      } catch {
        health.ParamCommonh = false;
      }

      try {
        await ParamCommond.findOne({ limit: 1 });
        health.ParamCommond = true;
      } catch {
        health.ParamCommond = false;
      }
    }

    // ✅ SURGICAL ADD: Test Menu models if initialized
    if (this.menuModelsInitialized) {
      try {
        await MenuItem.findOne({ limit: 1 });
        health.MenuItem = true;
      } catch {
        health.MenuItem = false;
      }

      try {
        await RoleMenuAccess.findOne({ limit: 1 });
        health.RoleMenuAccess = true;
      } catch {
        health.RoleMenuAccess = false;
      }

      try {
        await MenuConfiguration.findOne({ limit: 1 });
        health.MenuConfiguration = true;
      } catch {
        health.MenuConfiguration = false;
      }
    }

    return health;
  }

  // ✅ Close all model connections
  public async closeConnections(): Promise<void> {
    try {
      // Close tenant connections
      for (const [tenantId, models] of this.tenantModels) {
        if (models.connection) {
          await models.connection.close();
          logger.info(`✅ Closed tenant connection: ${tenantId}`);
        }
      }

      this.tenantModels.clear();
      this.initialized = false;
      this.frs9ModelsInitialized = false; // ✅ SURGICAL ADD: Reset FRS9 status
      this.menuModelsInitialized = false; // ✅ SURGICAL ADD: Reset Menu models status

      logger.info('✅ All model connections closed');
    } catch (error) {
      logger.error('❌ Failed to close model connections:', error);
    }
  }

  // ✅ SURGICAL ADD: Get FRS9 model status for monitoring
  public getFRS9Status(): { initialized: boolean; models: string[] } {
    if (this.frs9ModelsInitialized) {
      return {
        initialized: true,
        models: ['ParamCommonh', 'ParamCommond', 'ParamProduct', 'ParamJournal']
      };
    }
    
    return {
      initialized: false,
      models: []
    };
  }
}

// ✅ Create singleton instance
export const modelManager = new ModelManager();

// ✅ Export core models for direct access
export {
  User,
  Role,
  UserRole,
  AuditLog,
  defineAssociations
};

// ✅ SURGICAL ADD: Export FRS9 models
export {
  ParamCommonh,
  ParamCommond,
  ParamProduct,
  ParamJournal
};

// ✅ SURGICAL ADD: Export Menu models
export {
  MenuItem,
  RoleMenuAccess,
  MenuConfiguration
};

// ✅ Export types
export type {
  UserAttributes,
  RoleAttributes,
  UserRoleAttributes,
  AuditLogAttributes
} from '../core/models';

// ✅ SURGICAL ADD: Export FRS9 types
export type {
  ParamCommonhAttributes,
  ParamCommondAttributes,
  ParamProductAttributes,
  ParamJournalAttributes
} from '../core/models/frs9-parameter.models';

// ✅ SURGICAL ADD: Export Menu types
export type {
  MenuItemAttributes,
  RoleMenuAccessAttributes,
  MenuConfigurationAttributes
} from '../core/models/menu.models';

// ✅ Default export for app.ts compatibility
export default {
  modelManager,
  User,
  Role,
  UserRole,
  AuditLog,
  // ✅ SURGICAL ADD: Include FRS9 models in default export
  ParamCommonh,
  ParamCommond,
  ParamProduct,
  ParamJournal,
  // ✅ SURGICAL ADD: Include Menu models in default export
  MenuItem,
  RoleMenuAccess,
  MenuConfiguration
};