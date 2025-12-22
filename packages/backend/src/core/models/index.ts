// packages/backend/src/core/models/index.ts
import { Sequelize } from 'sequelize';
import User from './user.model';
import Role from './role.model';
import UserRole from './user-role.model';
import AuditLog from './audit-log.model';

// Import FRS9 models
import {
  ParamCommonh,
  ParamCommond,
  ParamProduct,
  ParamJournal,
  ParamCommonhAttributes,
  ParamCommondAttributes,
  ParamProductAttributes,
  ParamJournalAttributes
} from './frs9-parameter.models';

// Import other models that will be created
// import Tenant from './tenant.model';
// import PortfolioAccount from './portfolio-account.model';
import Customer from './customer.model';
import BankingProduct from './banking-product.model';

// Define model associations
export function defineAssociations(): void {
  // User <-> Role many-to-many through UserRole
  User.belongsToMany(Role, {
    through: UserRole,
    foreignKey: 'userId',
    otherKey: 'roleId',
    as: 'roles'
  });

  Role.belongsToMany(User, {
    through: UserRole,
    foreignKey: 'roleId',
    otherKey: 'userId',
    as: 'users'
  });

  // Direct associations with UserRole junction table
  User.hasMany(UserRole, {
    foreignKey: 'userId',
    as: 'userRoles'
  });

  Role.hasMany(UserRole, {
    foreignKey: 'roleId',
    as: 'userRoles'
  });

  UserRole.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  UserRole.belongsTo(Role, {
    foreignKey: 'roleId',
    as: 'role'
  });

  // UserRole assignment tracking
  UserRole.belongsTo(User, {
    foreignKey: 'assignedBy',
    as: 'assignedByUser'
  });

  // Audit log associations
  AuditLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
  });

  User.hasMany(AuditLog, {
    foreignKey: 'userId',
    as: 'auditLogs'
  });

  // Self-referencing associations for User (created/updated by)
  User.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  User.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });

  // Self-referencing associations for Role (created/updated by)
  Role.belongsTo(User, {
    foreignKey: 'createdBy',
    as: 'creator'
  });

  Role.belongsTo(User, {
    foreignKey: 'updatedBy',
    as: 'updater'
  });

  // FRS9 Parameter Model Associations (already defined in frs9-parameter.models.ts)
  // Header-Detail relationship for commonh/commond is handled in the FRS9 models file
  
  console.log('✅ FRS9 parameter model associations loaded');

  // TODO: Add tenant associations when Tenant model is created
  // User.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  // Role.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  // UserRole.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
  // AuditLog.belongsTo(Tenant, { foreignKey: 'tenantId', as: 'tenant' });
}

// Export all models
export {
  User,
  Role,
  UserRole,
  AuditLog,
  // FRS9 Models
  ParamCommonh,
  ParamCommond,
  ParamProduct,
  ParamJournal,
  // Portfolio Management Models
  Customer,
  BankingProduct
};

// Export types
export type {
  UserAttributes,
  RoleAttributes,
  UserRoleAttributes,
  AuditLogAttributes,
  // FRS9 Model Types
  ParamCommonhAttributes,
  ParamCommondAttributes,
  ParamProductAttributes,
  ParamJournalAttributes
} from './user.model';

export type {
  RoleAttributes as RoleModelAttributes
} from './role.model';

export type {
  UserRoleAttributes as UserRoleModelAttributes
} from './user-role.model';

export type {
  AuditLogAttributes as AuditLogModelAttributes
} from './audit-log.model';

// Database sync utility (for development only)
export async function syncModels(options: { force?: boolean; alter?: boolean } = {}): Promise<void> {
  try {
    // Define associations first
    defineAssociations();

    // Sync models in dependency order
    await Role.sync(options);
    await User.sync(options);
    await UserRole.sync(options);
    await AuditLog.sync(options);

    // Sync FRS9 models
    await ParamCommonh.sync(options);
    await ParamCommond.sync(options);
    await ParamProduct.sync(options);
    await ParamJournal.sync(options);

    // Sync Portfolio Management models
    await Customer.sync(options);
    await BankingProduct.sync(options);

    console.log('✅ Database models synchronized successfully (including FRS9 and Portfolio Management models)');
  } catch (error) {
    console.error('❌ Database model synchronization failed:', error);
    throw error;
  }
}

// Model initialization utility
export async function initializeModels(): Promise<void> {
  try {
    // Define associations
    defineAssociations();

    // Validate all models
    await User.sync({ validate: true });
    await Role.sync({ validate: true });
    await UserRole.sync({ validate: true });
    await AuditLog.sync({ validate: true });

    // Validate FRS9 models
    await ParamCommonh.sync({ validate: true });
    await ParamCommond.sync({ validate: true });
    await ParamProduct.sync({ validate: true });
    await ParamJournal.sync({ validate: true });

    // Validate Portfolio Management models
    await Customer.sync({ validate: true });
    await BankingProduct.sync({ validate: true });

    console.log('✅ Database models initialized successfully (including FRS9 and Portfolio Management models)');
  } catch (error) {
    console.error('❌ Database model initialization failed:', error);
    throw error;
  }
}

// Utility functions for common queries
export const ModelQueries = {
  // Get user with roles and permissions
  async getUserWithRoles(userId: string, tenantId?: string): Promise<User | null> {
    const whereClause: any = { id: userId, isActive: true };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    return await User.findOne({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'roles',
          through: {
            where: { isActive: true },
            attributes: ['assignedAt', 'validFrom', 'validUntil', 'isTemporary']
          },
          where: { isActive: true }
        }
      ]
    });
  },

  // Get role with users
  async getRoleWithUsers(roleId: string, tenantId?: string): Promise<Role | null> {
    const whereClause: any = { id: roleId, isActive: true };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    return await Role.findOne({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'users',
          through: {
            where: { isActive: true },
            attributes: ['assignedAt', 'validFrom', 'validUntil', 'isTemporary']
          },
          where: { isActive: true }
        }
      ]
    });
  },

  // Get active user roles
  async getActiveUserRoles(userId: string, tenantId?: string): Promise<UserRole[]> {
    const whereClause: any = { 
      userId, 
      isActive: true 
    };
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }

    return await UserRole.scope('current').findAll({
      where: whereClause,
      include: [
        {
          model: Role,
          as: 'role',
          where: { isActive: true }
        }
      ]
    });
  },

  // Get audit trail for entity
  async getEntityAuditTrail(
    entityType: string, 
    entityId: string, 
    limit: number = 50
  ): Promise<AuditLog[]> {
    return await AuditLog.findAll({
      where: {
        entityType,
        entityId
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'fullName']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit
    });
  },

  // Get user activity summary
  async getUserActivitySummary(
    userId: string, 
    fromDate: Date, 
    toDate: Date
  ): Promise<any> {
    return await AuditLog.findAll({
      where: {
        userId,
        timestamp: {
          [sequelize.Op.between]: [fromDate, toDate]
        }
      },
      attributes: [
        'eventType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('MAX', sequelize.col('timestamp')), 'lastActivity']
      ],
      group: ['eventType'],
      order: [[sequelize.literal('count'), 'DESC']]
    });
  },

  // Get application setup parameters
  async getApplicationSetup(): Promise<ParamCommonh[]> {
    return await ParamCommonh.findAll({
      where: { param_type: 'A' },
      include: [{
        model: ParamCommond,
        as: 'details',
        required: false
      }],
      order: [['param_code', 'ASC']]
    });
  },

  // Get business setup parameters
  async getBusinessSetup(): Promise<ParamCommonh[]> {
    return await ParamCommonh.findAll({
      where: { param_type: 'B' },
      include: [{
        model: ParamCommond,
        as: 'details',
        required: false
      }],
      order: [['param_code', 'ASC']]
    });
  },

  // Get active product parameters
  async getActiveProducts(): Promise<ParamProduct[]> {
    return await ParamProduct.findAll({
      where: { active_flag: true },
      order: [['prd_code', 'ASC']]
    });
  },

  // Get active journal parameters
  async getActiveJournals(): Promise<ParamJournal[]> {
    return await ParamJournal.findAll({
      where: { active_flag: true },
      order: [['gl_code', 'ASC']]
    });
  }
};

export default {
  User,
  Role,
  UserRole,
  AuditLog,
  // FRS9 Models
  ParamCommonh,
  ParamCommond,
  ParamProduct,
  ParamJournal,
  // Portfolio Management Models
  Customer,
  BankingProduct,
  defineAssociations,
  syncModels,
  initializeModels,
  ModelQueries
};