// packages/backend/src/core/models/menu.models.ts
// Database-driven menu management system for IAF project - COMPREHENSIVE VERSION

import { DataTypes, Model, Sequelize } from 'sequelize';

// ============================================================================
// MENU CONFIGURATION MODEL
// ============================================================================

export interface MenuConfigurationAttributes {
  id: string;
  name: string;
  description?: string;
  target_audience: 'banking_staff' | 'consultant' | 'regulator' | 'platform_admin';
  banking_mode?: 'conventional' | 'syariah' | 'dual';
  tenant_specific: boolean;
  is_default: boolean;
  is_active: boolean;
  version: string;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export class MenuConfiguration extends Model<MenuConfigurationAttributes> implements MenuConfigurationAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public target_audience!: 'banking_staff' | 'consultant' | 'regulator' | 'platform_admin';
  public banking_mode?: 'conventional' | 'syariah' | 'dual';
  public tenant_specific!: boolean;
  public is_default!: boolean;
  public is_active!: boolean;
  public version!: string;
  public created_by!: string;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ============================================================================
// MENU ITEM MODEL
// ============================================================================

export interface MenuItemAttributes {
  id: string;
  menu_config_id: string;
  key: string;
  title: string;
  description?: string;
  icon?: string;
  url?: string;
  component?: string;
  type: 'group' | 'item' | 'divider';
  parent_id?: string | null;
  sort_order: number;
  is_active: boolean;
  permissions: string[];
  user_types: string[];
  banking_types: string[];
  tenant_types: string[];
  visibility_rules: Record<string, any>;
  breadcrumb: boolean;
  external: boolean;
  target: '_self' | '_blank' | '_parent' | '_top';
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export class MenuItem extends Model<MenuItemAttributes> implements MenuItemAttributes {
  public id!: string;
  public menu_config_id!: string;
  public key!: string;
  public title!: string;
  public description?: string;
  public icon?: string;
  public url?: string;
  public component?: string;
  public type!: 'group' | 'item' | 'divider';
  public parent_id?: string | null;
  public sort_order!: number;
  public is_active!: boolean;
  public permissions!: string[];
  public user_types!: string[];
  public banking_types!: string[];
  public tenant_types!: string[];
  public visibility_rules!: Record<string, any>;
  public breadcrumb!: boolean;
  public external!: boolean;
  public target!: '_self' | '_blank' | '_parent' | '_top';
  public metadata!: Record<string, any>;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ============================================================================
// MENU USER CUSTOMIZATION MODEL
// ============================================================================

export interface MenuUserCustomizationAttributes {
  id: string;
  user_id: string;
  tenant_id?: string;
  menu_config_id: string;
  hidden_items: string[];
  custom_order: Record<string, any>;
  bookmarks: string[];
  preferences: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export class MenuUserCustomization extends Model<MenuUserCustomizationAttributes> implements MenuUserCustomizationAttributes {
  public id!: string;
  public user_id!: string;
  public tenant_id?: string;
  public menu_config_id!: string;
  public hidden_items!: string[];
  public custom_order!: Record<string, any>;
  public bookmarks!: string[];
  public preferences!: Record<string, any>;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

// ============================================================================
// MENU ACCESS LOG MODEL
// ============================================================================

export interface MenuAccessLogAttributes {
  id: string;
  user_id: string;
  tenant_id?: string;
  menu_item_id: string;
  accessed_url?: string;
  user_agent?: string;
  ip_address?: string;
  session_id?: string;
  response_time?: number;
  success: boolean;
  error_message?: string;
  accessed_at: Date;
}

export class MenuAccessLog extends Model<MenuAccessLogAttributes> implements MenuAccessLogAttributes {
  public id!: string;
  public user_id!: string;
  public tenant_id?: string;
  public menu_item_id!: string;
  public accessed_url?: string;
  public user_agent?: string;
  public ip_address?: string;
  public session_id?: string;
  public response_time?: number;
  public success!: boolean;
  public error_message?: string;
  public readonly accessed_at!: Date;
}

// ============================================================================
// MODEL INITIALIZATION FUNCTIONS
// ============================================================================

export const initMenuConfiguration = (sequelize: Sequelize) => {
  MenuConfiguration.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    target_audience: {
      type: DataTypes.ENUM('banking_staff', 'consultant', 'regulator', 'platform_admin'),
      allowNull: false
    },
    banking_mode: {
      type: DataTypes.ENUM('conventional', 'syariah', 'dual'),
      allowNull: true
    },
    tenant_specific: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    version: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: '1.0.0'
    },
    created_by: {
      type: DataTypes.STRING(255),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'MenuConfiguration',
    tableName: 'menu_configurations',
    schema: 'core',
    timestamps: true,
    underscored: true
  });

  return MenuConfiguration;
};

export const initMenuItem = (sequelize: Sequelize) => {
  MenuItem.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    menu_config_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'menu_configurations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    component: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('group', 'item', 'divider'),
      allowNull: false,
      defaultValue: 'item'
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'menu_items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    permissions: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    user_types: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    banking_types: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    tenant_types: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    visibility_rules: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    breadcrumb: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    external: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    target: {
      type: DataTypes.ENUM('_self', '_blank', '_parent', '_top'),
      allowNull: false,
      defaultValue: '_self'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'MenuItem',
    tableName: 'menu_items',
    schema: 'core',
    timestamps: true,
    underscored: true
  });

  return MenuItem;
};

export const initMenuUserCustomization = (sequelize: Sequelize) => {
  MenuUserCustomization.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    menu_config_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'menu_configurations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    hidden_items: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    custom_order: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    },
    bookmarks: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: []
    },
    preferences: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {}
    }
  }, {
    sequelize,
    modelName: 'MenuUserCustomization',
    tableName: 'menu_user_customizations',
    schema: 'core',
    timestamps: true,
    underscored: true
  });

  return MenuUserCustomization;
};

export const initMenuAccessLog = (sequelize: Sequelize) => {
  MenuAccessLog.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    tenant_id: {
      type: DataTypes.UUID,
      allowNull: true
    },
    menu_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'menu_items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    accessed_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.INET,
      allowNull: true
    },
    session_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    response_time: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Response time in milliseconds'
    },
    success: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'MenuAccessLog',
    tableName: 'menu_access_logs',
    schema: 'core',
    timestamps: false, // We use accessed_at instead
    underscored: true
  });

  return MenuAccessLog;
};

// ============================================================================
// MODEL RELATIONSHIPS
// ============================================================================

export const defineMenuAssociations = (sequelize: Sequelize) => {
  // MenuItem has many MenuItems (self-referencing)
  MenuItem.hasMany(MenuItem, {
    foreignKey: 'parent_id',
    as: 'children',
    sourceKey: 'id'
  });

  MenuItem.belongsTo(MenuItem, {
    foreignKey: 'parent_id',
    as: 'parent',
    targetKey: 'id'
  });

  // MenuConfiguration has many MenuItems
  MenuConfiguration.hasMany(MenuItem, {
    foreignKey: 'menu_config_id',
    as: 'menu_items',
    sourceKey: 'id'
  });

  MenuItem.belongsTo(MenuConfiguration, {
    foreignKey: 'menu_config_id',
    as: 'menu_configuration',
    targetKey: 'id'
  });

  // MenuConfiguration has many MenuUserCustomizations
  MenuConfiguration.hasMany(MenuUserCustomization, {
    foreignKey: 'menu_config_id',
    as: 'user_customizations',
    sourceKey: 'id'
  });

  MenuUserCustomization.belongsTo(MenuConfiguration, {
    foreignKey: 'menu_config_id',
    as: 'menu_configuration',
    targetKey: 'id'
  });

  // MenuItem has many MenuAccessLogs
  MenuItem.hasMany(MenuAccessLog, {
    foreignKey: 'menu_item_id',
    as: 'access_logs',
    sourceKey: 'id'
  });

  MenuAccessLog.belongsTo(MenuItem, {
    foreignKey: 'menu_item_id',
    as: 'menu_item',
    targetKey: 'id'
  });
};

// ============================================================================
// MENU INITIALIZATION FUNCTION
// ============================================================================

export const initializeMenuModels = async (sequelize: Sequelize) => {
  try {
    // Initialize models
    const menuConfig = initMenuConfiguration(sequelize);
    const menuItem = initMenuItem(sequelize);
    const menuUserCustomization = initMenuUserCustomization(sequelize);
    const menuAccessLog = initMenuAccessLog(sequelize);

    // Define associations
    defineMenuAssociations(sequelize);

    return {
      MenuConfiguration: menuConfig,
      MenuItem: menuItem,
      MenuUserCustomization: menuUserCustomization,
      MenuAccessLog: menuAccessLog
    };
  } catch (error) {
    console.error('Failed to initialize menu models:', error);
    throw error;
  }
};

// Export models
export {
  MenuConfiguration,
  MenuItem,
  MenuUserCustomization,
  MenuAccessLog,
  defineMenuAssociations
};

// Export types
export type {
  MenuConfigurationAttributes,
  MenuItemAttributes,
  MenuUserCustomizationAttributes,
  MenuAccessLogAttributes
};