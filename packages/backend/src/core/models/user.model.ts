// packages/backend/src/core/models/user.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/connection';

// User attributes interface (based on actual database schema from backup files)
export interface UserAttributes {
  id: string;
  legacyId?: number;
  username: string;
  email: string;
  passwordHash: string;
  fullName: string;
  employeeId?: string;
  department?: string;
  position?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  passwordChangedAt: Date;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  
  // Multi-factor authentication
  mfaEnabled: boolean;
  mfaSecret?: string;
  
  // Banking access control
  bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  
  // Syariah-specific fields
  syariahCertified?: boolean;
  syariahCertificationDate?: Date;
  syariahCertificationLevel?: string;
  
  // Session management
  loginCount: number;
  currentSessionId?: string;
  
  // Security
  forcePasswordChange: boolean;
  passwordHistory?: string[];
  
  // Tenant isolation
  tenantId: string;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Optional attributes for creation
interface UserCreationAttributes extends Optional<UserAttributes, 
  'id' | 'legacyId' | 'lastLoginAt' | 'passwordChangedAt' | 'failedLoginAttempts' | 
  'lockedUntil' | 'mfaEnabled' | 'mfaSecret' | 'syariahCertified' | 
  'syariahCertificationDate' | 'syariahCertificationLevel' | 'loginCount' | 
  'currentSessionId' | 'forcePasswordChange' | 'passwordHistory' | 'createdAt' | 
  'updatedAt' | 'createdBy' | 'updatedBy'
> {}

// User model class
export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public legacyId?: number;
  public username!: string;
  public email!: string;
  public passwordHash!: string;
  public fullName!: string;
  public employeeId?: string;
  public department?: string;
  public position?: string;
  public isActive!: boolean;
  public lastLoginAt?: Date;
  public passwordChangedAt!: Date;
  public failedLoginAttempts!: number;
  public lockedUntil?: Date;
  
  // Multi-factor authentication
  public mfaEnabled!: boolean;
  public mfaSecret?: string;
  
  // Banking access control
  public bankingAccess!: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  
  // Syariah-specific fields
  public syariahCertified?: boolean;
  public syariahCertificationDate?: Date;
  public syariahCertificationLevel?: string;
  
  // Session management
  public loginCount!: number;
  public currentSessionId?: string;
  
  // Security
  public forcePasswordChange!: boolean;
  public passwordHistory?: string[];
  
  // Tenant isolation
  public tenantId!: string;
  
  // Audit fields
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
  public updatedBy?: string;

  // Instance methods
  public async incrementFailedAttempts(): Promise<void> {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    }
    
    await this.save();
  }

  public async resetFailedAttempts(): Promise<void> {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    await this.save();
  }

  public async updateLoginInfo(): Promise<void> {
    this.lastLoginAt = new Date();
    this.loginCount += 1;
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
    await this.save();
  }

  public isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  public hasBankingAccess(bankingType: 'CONVENTIONAL' | 'SYARIAH'): boolean {
    return this.bankingAccess === 'BOTH' || this.bankingAccess === bankingType;
  }

  public isSyariahCompliant(): boolean {
    return this.syariahCertified === true && 
           this.syariahCertificationDate && 
           this.syariahCertificationDate <= new Date();
  }
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    legacyId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'For migration from existing system'
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    fullName: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    employeeId: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    failedLoginAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    lockedUntil: {
      type: DataTypes.DATE,
      allowNull: true
    },
    
    // Multi-factor authentication
    mfaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    mfaSecret: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    
    // Banking access control
    bankingAccess: {
      type: DataTypes.ENUM('CONVENTIONAL', 'SYARIAH', 'BOTH'),
      defaultValue: 'CONVENTIONAL'
    },
    
    // Syariah-specific fields
    syariahCertified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    syariahCertificationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    syariahCertificationLevel: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    
    // Session management
    loginCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currentSessionId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    
    // Security
    forcePasswordChange: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    passwordHistory: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    
    // Tenant isolation
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id'
      }
    },
    
    // Audit fields
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    updatedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    schema: 'core',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        unique: true,
        fields: ['username']
      },
      {
        fields: ['tenantId']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['legacyId']
      },
      {
        fields: ['bankingAccess']
      },
      {
        fields: ['syariahCertified']
      },
      {
        unique: true,
        fields: ['tenantId', 'email'],
        name: 'unique_tenant_email'
      }
    ],
    scopes: {
      active: {
        where: {
          isActive: true
        }
      },
      syariahCertified: {
        where: {
          syariahCertified: true
        }
      },
      byTenant: (tenantId: string) => ({
        where: {
          tenantId
        }
      }),
      byBankingAccess: (bankingType: string) => ({
        where: {
          bankingAccess: [bankingType, 'BOTH']
        }
      })
    }
  }
);

export default User;
