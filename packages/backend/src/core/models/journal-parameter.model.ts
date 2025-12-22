// packages/backend/src/core/models/journal-parameter.model.ts
// ============================================================================
// 🗄️ JOURNAL PARAMETER MODEL: Standalone CRUD Pattern for frs9_param_journal
// ============================================================================
// ✅ REFERENCE: Database schema from DS2PG FRS9PRO (192.168.0.106:5433)
// ✅ PATTERN: Standalone CRUD (not master-detail like Application/Business)
// ✅ TABLE: frs9_param_journal (GL account configurations for IFRS9)
// ============================================================================

import { DataTypes, Model, Sequelize, Op } from 'sequelize';

// TypeScript interface for journal parameter attributes
export interface JournalParameterAttributes {
  pkid?: number;
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

// Journal Parameter creation attributes (required fields only)
export interface JournalParameterCreationAttributes {
  gl_group?: string;
  currency?: string;
  gl_type?: string;
  gl_code: string;
  gl_number?: string;
  dbcr?: string;
  gl_desc: string;
  active_flag?: boolean;
  createdby: string;
  createdhost: string;
}

// Sequelize model class
export class JournalParameter extends Model<JournalParameterAttributes, JournalParameterCreationAttributes>
  implements JournalParameterAttributes {
  
  public pkid!: number;
  public gl_group?: string;
  public currency?: string;
  public gl_type?: string;
  public gl_code!: string;
  public gl_number?: string;
  public dbcr?: string;
  public gl_desc!: string;
  public active_flag?: boolean;
  public createdby!: string;
  public createddate!: Date;
  public createdhost!: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // Class methods for business logic
  public static async findByGLCode(gl_code: string): Promise<JournalParameter | null> {
    return this.findOne({
      where: { gl_code }
    });
  }

  public static async findByGLGroup(gl_group: string): Promise<JournalParameter[]> {
    return this.findAll({
      where: { gl_group },
      order: [['gl_code', 'ASC']]
    });
  }

  public static async searchJournalParameters(searchTerm: string): Promise<JournalParameter[]> {
    return this.findAll({
      where: {
        [Op.or]: [
          { gl_code: { [Op.iLike]: `%${searchTerm}%` } },
          { gl_desc: { [Op.iLike]: `%${searchTerm}%` } },
          { gl_number: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      order: [['gl_code', 'ASC']],
      limit: 50
    });
  }

  public static async findActiveJournals(): Promise<JournalParameter[]> {
    return this.findAll({
      where: { active_flag: true },
      order: [['gl_group', 'ASC'], ['gl_code', 'ASC']]
    });
  }

  // Instance methods
  public getDisplayName(): string {
    return `${this.gl_code} - ${this.gl_desc}`;
  }

  public isDebitAccount(): boolean {
    return this.dbcr === 'D';
  }

  public isCreditAccount(): boolean {
    return this.dbcr === 'C';
  }
}

// Model initialization function
export const initJournalParameter = (sequelize: Sequelize): typeof JournalParameter => {
  JournalParameter.init(
    {
      pkid: {
        type: DataTypes.SMALLINT,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Primary key identifier'
      },
      gl_group: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'GL account group (ASSETS, LIABILITIES, etc.)'
      },
      currency: {
        type: DataTypes.CHAR(3),
        allowNull: true,
        comment: 'Currency code (IDR, USD, etc.)'
      },
      gl_type: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'GL account type (LOANS, PROVISIONS, etc.)'
      },
      gl_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
          name: 'unique_gl_code',
          msg: 'GL code already exists'
        },
        validate: {
          notEmpty: {
            msg: 'GL code cannot be empty'
          },
          len: {
            args: [1, 20],
            msg: 'GL code must be between 1 and 20 characters'
          }
        },
        comment: 'General Ledger code (unique identifier)'
      },
      gl_number: {
        type: DataTypes.STRING(20),
        allowNull: true,
        comment: 'Full GL account number'
      },
      dbcr: {
        type: DataTypes.CHAR(1),
        allowNull: true,
        validate: {
          isIn: {
            args: [['D', 'C']],
            msg: 'DBCR must be either D (Debit) or C (Credit)'
          }
        },
        comment: 'Debit/Credit indicator (D or C)'
      },
      gl_desc: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'GL description cannot be empty'
          },
          len: {
            args: [1, 255],
            msg: 'GL description must be between 1 and 255 characters'
          }
        },
        comment: 'General Ledger account description'
      },
      active_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: true,
        comment: 'Active status flag'
      },
      createdby: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Created by cannot be empty'
          }
        },
        comment: 'User who created the record'
      },
      createddate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Record creation timestamp'
      },
      createdhost: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: 'Created host cannot be empty'
          }
        },
        comment: 'Host/IP where record was created'
      },
      updatedby: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'User who last updated the record'
      },
      updateddate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last update timestamp'
      },
      updatedhost: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Host/IP where record was last updated'
      }
    },
    {
      sequelize,
      modelName: 'JournalParameter',
      tableName: 'frs9_param_journal',
      schema: 'public',
      timestamps: true,
      underscored: true,
      indexes: [
        {
          unique: true,
          fields: ['gl_code'],
          name: 'idx_journal_gl_code_unique'
        },
        {
          fields: ['gl_group'],
          name: 'idx_journal_gl_group'
        },
        {
          fields: ['gl_type'],
          name: 'idx_journal_gl_type'
        },
        {
          fields: ['active_flag'],
          name: 'idx_journal_active_flag'
        },
        {
          fields: ['currency'],
          name: 'idx_journal_currency'
        }
      ],
      hooks: {
        beforeUpdate: (journal: JournalParameter) => {
          journal.updateddate = new Date();
        }
      }
    }
  );

  return JournalParameter;
};

// Export default
export default JournalParameter;