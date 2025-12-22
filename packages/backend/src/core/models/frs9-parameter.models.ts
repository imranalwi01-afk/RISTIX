// packages/backend/src/core/models/frs9-parameter.models.ts
// ✅ CENTRALIZED CONFIGURATION: Use backend environment loader for database connections

import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { backendEnvironmentLoader } from '../../config/environment-loader-backend';

// ✅ Create proper Sequelize instance using centralized backend environment configuration
let frs9Sequelize: Sequelize;

function initializeFRS9Sequelize(): Sequelize {
  if (frs9Sequelize) {
    return frs9Sequelize;
  }

  try {
    const envConfig = backendEnvironmentLoader.getConfiguration();
    const frs9Config = envConfig.database.frs9;

    frs9Sequelize = new Sequelize(
      frs9Config.database,
      frs9Config.user,
      frs9Config.password,
      {
        host: frs9Config.host,
        port: frs9Config.port,
        dialect: 'postgres',
        logging: envConfig.deploymentTarget === 'localdev' ? console.log : false,
        ssl: frs9Config.ssl ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        pool: {
          max: envConfig.database.pool?.max || 20,
          min: envConfig.database.pool?.min || 5,
          acquire: envConfig.database.pool?.acquire || 30000,
        idle: envConfig.database.pool?.idle || 10000,
      },
      dialectOptions: frs9Config.ssl ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      } : {}
    }
  );

  console.log('✅ FRS9 models initialized with centralized configuration');
    console.log(`📊 FRS9 Database: ${frs9Config.database} at ${frs9Config.host}:${frs9Config.port}`);
    console.log(`🔒 SSL Enabled: ${frs9Config.ssl}`);

    return frs9Sequelize;
  } catch (error) {
    console.error('❌ CRITICAL: Failed to initialize FRS9 models with centralized config:', error);
    console.error('🚨 This indicates a serious configuration problem - halting startup');

    // Instead of falling back to hardcoded values, throw the error to make it visible
    throw new Error(`FRS9 Database initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Initialize and export the sequelize instance
frs9Sequelize = initializeFRS9Sequelize();
export { frs9Sequelize };

// ==========================================
// frs9_param_commonh Model (Header Table)
// ==========================================
export interface ParamCommonhAttributes {
  pkid: number;
  param_code: string;
  param_name: string;
  param_usage: string;
  param_type: string;
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

interface ParamCommonhCreationAttributes extends Optional<ParamCommonhAttributes, 
  'pkid' | 'updatedby' | 'updateddate' | 'updatedhost'
> {}

export class ParamCommonh extends Model<ParamCommonhAttributes, ParamCommonhCreationAttributes> 
  implements ParamCommonhAttributes {
  public pkid!: number;
  public param_code!: string;
  public param_name!: string;
  public param_usage!: string;
  public param_type!: string;
  public createdby!: string;
  public createddate!: Date;
  public createdhost!: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;
}

ParamCommonh.init(
  {
    pkid: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    param_code: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    param_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    param_usage: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    param_type: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    createdby: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdhost: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    updatedby: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedhost: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize: frs9Sequelize, // ✅ Now using proper Sequelize instance
    tableName: 'frs9_param_commonh',
    timestamps: false,
    indexes: [
      {
        fields: ['param_code']
      },
      {
        fields: ['param_type']
      }
    ]
  }
);

// ==========================================
// frs9_param_commond Model (Detail Table)
// ==========================================
export interface ParamCommondAttributes {
  pkid: number;
  param_code: string;
  param_seq: number;
  value1: string;
  value2: string;
  value3: string;
  paramdesc: string;
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

interface ParamCommondCreationAttributes extends Optional<ParamCommondAttributes, 
  'pkid' | 'updatedby' | 'updateddate' | 'updatedhost'
> {}

export class ParamCommond extends Model<ParamCommondAttributes, ParamCommondCreationAttributes> 
  implements ParamCommondAttributes {
  public pkid!: number;
  public param_code!: string;
  public param_seq!: number;
  public value1!: string;
  public value2!: string;
  public value3!: string;
  public paramdesc!: string;
  public createdby!: string;
  public createddate!: Date;
  public createdhost!: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;
}

ParamCommond.init(
  {
    pkid: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    param_code: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    param_seq: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    value1: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    value2: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    value3: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    paramdesc: {
      type: DataTypes.STRING(1000),
      allowNull: false
    },
    createdby: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdhost: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    updatedby: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedhost: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize: frs9Sequelize, // ✅ Now using proper Sequelize instance
    tableName: 'frs9_param_commond',
    timestamps: false,
    indexes: [
      {
        fields: ['param_code']
      },
      {
        fields: ['param_code', 'param_seq']
      }
    ]
  }
);

// ==========================================
// frs9_param_product Model
// ==========================================
export interface ParamProductAttributes {
  pkid: number;
  data_source: string;
  prd_group: string;
  prd_type: string;
  prd_code: string;
  prd_desc: string;
  currency: string;
  amortization_type?: string;
  al_flag?: string;
  impaired_flag?: boolean;
  bm_flag?: boolean;
  expected_life?: number;
  borrowing_rate?: number;
  market_rate?: number;
  active_flag: boolean;
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

interface ParamProductCreationAttributes extends Optional<ParamProductAttributes, 
  'pkid' | 'amortization_type' | 'al_flag' | 'impaired_flag' | 'bm_flag' | 
  'expected_life' | 'borrowing_rate' | 'market_rate' | 'updatedby' | 'updateddate' | 'updatedhost'
> {}

export class ParamProduct extends Model<ParamProductAttributes, ParamProductCreationAttributes> 
  implements ParamProductAttributes {
  public pkid!: number;
  public data_source!: string;
  public prd_group!: string;
  public prd_type!: string;
  public prd_code!: string;
  public prd_desc!: string;
  public currency!: string;
  public amortization_type?: string;
  public al_flag?: string;
  public impaired_flag?: boolean;
  public bm_flag?: boolean;
  public expected_life?: number;
  public borrowing_rate?: number;
  public market_rate?: number;
  public active_flag!: boolean;
  public createdby!: string;
  public createddate!: Date;
  public createdhost!: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;
}

ParamProduct.init(
  {
    pkid: {
      type: DataTypes.SMALLINT,
      autoIncrement: true,
      primaryKey: true
    },
    data_source: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    prd_group: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    prd_type: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    prd_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    prd_desc: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    amortization_type: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    al_flag: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    impaired_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    bm_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    expected_life: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    borrowing_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    market_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    active_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    createdby: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdhost: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    updatedby: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedhost: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize: frs9Sequelize, // ✅ Now using proper Sequelize instance
    tableName: 'frs9_param_product',
    timestamps: false,
    indexes: [
      {
        fields: ['prd_code']
      },
      {
        fields: ['active_flag']
      }
    ]
  }
);

// ==========================================
// frs9_param_journal Model
// ==========================================
export interface ParamJournalAttributes {
  pkid: number;
  gl_group?: string;
  currency?: string;
  gl_type?: string;
  gl_code?: string;
  gl_number?: string;
  dbcr?: string;
  gl_desc?: string;
  active_flag?: boolean;
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

interface ParamJournalCreationAttributes extends Optional<ParamJournalAttributes, 
  'pkid' | 'gl_group' | 'currency' | 'gl_type' | 'gl_code' | 'gl_number' | 
  'dbcr' | 'gl_desc' | 'active_flag' | 'updatedby' | 'updateddate' | 'updatedhost'
> {}

export class ParamJournal extends Model<ParamJournalAttributes, ParamJournalCreationAttributes> 
  implements ParamJournalAttributes {
  public pkid!: number;
  public gl_group?: string;
  public currency?: string;
  public gl_type?: string;
  public gl_code?: string;
  public gl_number?: string;
  public dbcr?: string;
  public gl_desc?: string;
  public active_flag?: boolean;
  public createdby!: string;
  public createddate!: Date;
  public createdhost!: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;
}

ParamJournal.init(
  {
    pkid: {
      type: DataTypes.SMALLINT,
      autoIncrement: true,
      primaryKey: true
    },
    gl_group: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    currency: {
      type: DataTypes.CHAR(3),
      allowNull: true
    },
    gl_type: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    gl_code: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    gl_number: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    dbcr: {
      type: DataTypes.CHAR(1),
      allowNull: true
    },
    gl_desc: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    active_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true
    },
    createdby: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    createdhost: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    updatedby: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updatedhost: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  },
  {
    sequelize: frs9Sequelize, // ✅ Now using proper Sequelize instance
    tableName: 'frs9_param_journal',
    timestamps: false,
    indexes: [
      {
        fields: ['gl_group']
      },
      {
        fields: ['active_flag']
      }
    ]
  }
);

// ==========================================
// Model Associations
// ==========================================
// Header-Detail relationship for commonh/commond
ParamCommonh.hasMany(ParamCommond, {
  foreignKey: 'param_code',
  sourceKey: 'param_code',
  as: 'details'
});

ParamCommond.belongsTo(ParamCommonh, {
  foreignKey: 'param_code',
  targetKey: 'param_code',
  as: 'header'
});

// ==========================================
// ✅ Health Check Function
// ==========================================
export async function checkFRS9DatabaseHealth(): Promise<any> {
  try {
    console.log('🏥 Checking FRS9 database health...');

    // Ensure FRS9 Sequelize is initialized
    const sequelize = initializeFRS9Sequelize();

    // Test connection first
    await sequelize.authenticate();
    
    // Get table counts
    const [productCount, journalCount, headerCount, detailCount] = await Promise.all([
      ParamProduct.count().catch(() => 0),
      ParamJournal.count().catch(() => 0), 
      ParamCommonh.count().catch(() => 0),
      ParamCommond.count().catch(() => 0)
    ]);
    
    try {
      const envConfig = backendEnvironmentLoader.getConfiguration();
      const frs9Config = envConfig.database.frs9;

      return {
        connection: 'healthy',
        database: frs9Config.database,
        host: `${frs9Config.host}:${frs9Config.port}`,
        tables: {
          frs9_param_product: productCount,
          frs9_param_journal: journalCount,
          frs9_param_commonh: headerCount,
          frs9_param_commond: detailCount
        },
        last_check: new Date().toISOString(),
        status: 'operational'
      };

    } catch (error) {
      console.error('❌ FRS9 database health check failed:', error);

      // ✅ FIXED: Use centralized configuration instead of hardcoded fallback
      let fallbackInfo;
      try {
        const envConfig = backendEnvironmentLoader.getConfiguration();
        const frs9Config = envConfig.database.frs9;
        fallbackInfo = {
          database: frs9Config.database,
          host: `${frs9Config.host}:${frs9Config.port}`,
        };
      } catch (configError) {
        fallbackInfo = {
          database: 'FRS9PRO',
          host: 'CONFIG_UNAVAILABLE',
        };
      }

      return {
        connection: 'unhealthy',
        database: fallbackInfo.database,
        host: fallbackInfo.host,
        error: error instanceof Error ? error.message : 'Unknown error',
        last_check: new Date().toISOString(),
        status: 'failed',
        details: 'FRS9 database connection failed - check network connectivity'
      };
    }
  } catch (error) {
    console.error('❌ FRS9 database health check failed:', error);

    // ✅ FIXED: Use centralized configuration instead of hardcoded fallback
    let fallbackInfo;
    try {
      const envConfig = backendEnvironmentLoader.getConfiguration();
      const frs9Config = envConfig.database.frs9;
      fallbackInfo = {
        database: frs9Config.database,
        host: `${frs9Config.host}:${frs9Config.port}`,
      };
    } catch (configError) {
      fallbackInfo = {
        database: 'FRS9PRO',
        host: 'CONFIG_UNAVAILABLE',
      };
    }

    return {
      connection: 'unhealthy',
      database: fallbackInfo.database,
      host: fallbackInfo.host,
      error: error instanceof Error ? error.message : 'Unknown error',
      last_check: new Date().toISOString(),
      status: 'failed',
      details: 'FRS9 database health check failed - unable to connect'
    };
  }
}

// ==========================================
// ✅ Model Initialization Function
// ==========================================
export async function initializeFRS9Models(): Promise<void> {
  try {
    console.log('🔗 Initializing FRS9 parameter models...');

    // Ensure FRS9 Sequelize is initialized
    const sequelize = initializeFRS9Sequelize();

    // Test FRS9 database connection
    await sequelize.authenticate();
    console.log('✅ FRS9 database connection established');

    console.log('✅ FRS9 parameter models initialized successfully');

  } catch (error) {
    console.error('❌ Failed to initialize FRS9 models:', error);
    throw error;
  }
}

// Export all models and types - Models are already exported at declaration