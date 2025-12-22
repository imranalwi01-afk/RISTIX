// packages/backend/src/core/models/bucket-parameter.models.ts
// ============================================================================
// BUCKET PARAMETER MODELS - PHASE 3 MODULE 3.3
// ============================================================================
// Sequelize models for bucket parameter management
// Features: Range-based bucket logic, IFRS 9 aging buckets, master-detail relationships
// Legacy compliance: ASP.NET MVC bucket parameter data structure
// ============================================================================

import { DataTypes, Model, Sequelize, Association } from 'sequelize';

// ============================================================================
// BUCKET PARAMETER HEADER MODEL
// ============================================================================

export interface BucketParameterHeaderAttributes {
  id: number;
  bucket_name: string;
  bucket_description?: string;
  bucket_type: 'AGING' | 'RATING' | 'AMOUNT' | 'CUSTOM';
  min_range?: number;
  max_range?: number;
  range_unit?: 'DAYS' | 'MONTHS' | 'YEARS' | 'AMOUNT' | 'SCORE';
  active_flag: boolean;
  seq?: number;
  created_by?: string;
  created_date?: Date;
  created_host?: string;
  updated_by?: string;
  updated_date?: Date;
  updated_host?: string;
}

export interface BucketParameterHeaderCreationAttributes 
  extends Omit<BucketParameterHeaderAttributes, 'id' | 'created_date' | 'updated_date'> {}

export class BucketParameterHeader extends Model<
  BucketParameterHeaderAttributes,
  BucketParameterHeaderCreationAttributes
> implements BucketParameterHeaderAttributes {
  public id!: number;
  public bucket_name!: string;
  public bucket_description?: string;
  public bucket_type!: 'AGING' | 'RATING' | 'AMOUNT' | 'CUSTOM';
  public min_range?: number;
  public max_range?: number;
  public range_unit?: 'DAYS' | 'MONTHS' | 'YEARS' | 'AMOUNT' | 'SCORE';
  public active_flag!: boolean;
  public seq?: number;
  public created_by?: string;
  public readonly created_date?: Date;
  public created_host?: string;
  public updated_by?: string;
  public readonly updated_date?: Date;
  public updated_host?: string;

  // Association properties
  public details?: BucketParameterDetail[];

  // Association methods
  public static associations: {
    details: Association<BucketParameterHeader, BucketParameterDetail>;
  };
}

// ============================================================================
// BUCKET PARAMETER DETAIL MODEL
// ============================================================================

export interface BucketParameterDetailAttributes {
  id: number;
  bucket_header_id: number;
  range_from: number;
  range_to: number;
  bucket_label: string;
  bucket_code: string;
  pd_rate?: number;
  lgd_rate?: number;
  weight: number;
  active_flag: boolean;
  seq: number;
  created_by?: string;
  created_date?: Date;
  created_host?: string;
  updated_by?: string;
  updated_date?: Date;
  updated_host?: string;
}

export interface BucketParameterDetailCreationAttributes 
  extends Omit<BucketParameterDetailAttributes, 'id' | 'created_date' | 'updated_date'> {}

export class BucketParameterDetail extends Model<
  BucketParameterDetailAttributes,
  BucketParameterDetailCreationAttributes
> implements BucketParameterDetailAttributes {
  public id!: number;
  public bucket_header_id!: number;
  public range_from!: number;
  public range_to!: number;
  public bucket_label!: string;
  public bucket_code!: string;
  public pd_rate?: number;
  public lgd_rate?: number;
  public weight!: number;
  public active_flag!: boolean;
  public seq!: number;
  public created_by?: string;
  public readonly created_date?: Date;
  public created_host?: string;
  public updated_by?: string;
  public readonly updated_date?: Date;
  public updated_host?: string;

  // Association properties
  public header?: BucketParameterHeader;

  // Association methods
  public static associations: {
    header: Association<BucketParameterDetail, BucketParameterHeader>;
  };
}

// ============================================================================
// MODEL INITIALIZATION FUNCTION
// ============================================================================

export function initBucketParameterModels(sequelize: Sequelize): void {
  // =========================================================================
  // BUCKET PARAMETER HEADER INITIALIZATION
  // =========================================================================
  
  BucketParameterHeader.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Unique identifier for bucket parameter header'
      },
      bucket_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Unique name for the bucket parameter set',
        validate: {
          notEmpty: true,
          len: [1, 100]
        }
      },
      bucket_description: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Detailed description of the bucket parameter purpose'
      },
      bucket_type: {
        type: DataTypes.ENUM('AGING', 'RATING', 'AMOUNT', 'CUSTOM'),
        allowNull: false,
        comment: 'Type of bucket classification (AGING=DPD-based, RATING=Credit Score, AMOUNT=Exposure Size, CUSTOM=User-defined)',
        validate: {
          isIn: [['AGING', 'RATING', 'AMOUNT', 'CUSTOM']]
        }
      },
      min_range: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Minimum range value for the bucket parameter',
        validate: {
          min: 0
        }
      },
      max_range: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Maximum range value for the bucket parameter',
        validate: {
          min: 0
        }
      },
      range_unit: {
        type: DataTypes.ENUM('DAYS', 'MONTHS', 'YEARS', 'AMOUNT', 'SCORE'),
        allowNull: true,
        comment: 'Unit of measurement for the range values',
        validate: {
          isIn: [['DAYS', 'MONTHS', 'YEARS', 'AMOUNT', 'SCORE']]
        }
      },
      active_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indicates if the bucket parameter is active'
      },
      seq: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Display sequence for ordering bucket parameters',
        validate: {
          min: 1
        }
      },
      created_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'User who created the record'
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Record creation timestamp'
      },
      created_host: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Host/IP address where record was created'
      },
      updated_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'User who last updated the record'
      },
      updated_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Record last update timestamp'
      },
      updated_host: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Host/IP address where record was last updated'
      }
    },
    {
      sequelize,
      modelName: 'BucketParameterHeader',
      tableName: 'bucket_parameter_headers',
      schema: 'collective_impairment',
      timestamps: false, // We handle timestamps manually
      underscored: true,
      comment: 'Header table for bucket parameter configurations used in IFRS 9 collective impairment calculations',
      indexes: [
        {
          name: 'idx_bucket_param_header_name',
          unique: true,
          fields: ['bucket_name']
        },
        {
          name: 'idx_bucket_param_header_type',
          fields: ['bucket_type']
        },
        {
          name: 'idx_bucket_param_header_active',
          fields: ['active_flag']
        },
        {
          name: 'idx_bucket_param_header_seq',
          fields: ['seq']
        },
        {
          name: 'idx_bucket_param_header_created',
          fields: ['created_date']
        }
      ],
      validate: {
        // Custom validation for range logic
        rangeValidation() {
          if (this.min_range !== null && this.max_range !== null) {
            if (this.min_range >= this.max_range) {
              throw new Error('Minimum range must be less than maximum range');
            }
          }
        }
      }
    }
  );

  // =========================================================================
  // BUCKET PARAMETER DETAIL INITIALIZATION
  // =========================================================================
  
  BucketParameterDetail.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: 'Unique identifier for bucket parameter detail'
      },
      bucket_header_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Foreign key reference to bucket parameter header',
        references: {
          model: 'bucket_parameter_headers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      range_from: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Starting value of the bucket range (inclusive)',
        validate: {
          min: 0
        }
      },
      range_to: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Ending value of the bucket range (exclusive)',
        validate: {
          min: 0
        }
      },
      bucket_label: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Display label for the bucket range',
        validate: {
          notEmpty: true,
          len: [1, 50]
        }
      },
      bucket_code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'Unique code for the bucket within the parameter set',
        validate: {
          notEmpty: true,
          len: [1, 20]
        }
      },
      pd_rate: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        comment: 'Probability of Default rate for this bucket (0.0 to 1.0)',
        validate: {
          min: 0,
          max: 1
        }
      },
      lgd_rate: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: true,
        comment: 'Loss Given Default rate for this bucket (0.0 to 1.0)',
        validate: {
          min: 0,
          max: 1
        }
      },
      weight: {
        type: DataTypes.DECIMAL(10, 6),
        allowNull: false,
        defaultValue: 0,
        comment: 'Weight factor for this bucket in calculations (0.0 to 1.0)',
        validate: {
          min: 0,
          max: 1
        }
      },
      active_flag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Indicates if the bucket detail is active'
      },
      seq: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Display sequence for ordering bucket details within a parameter set',
        validate: {
          min: 1
        }
      },
      created_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'User who created the record'
      },
      created_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Record creation timestamp'
      },
      created_host: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Host/IP address where record was created'
      },
      updated_by: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'User who last updated the record'
      },
      updated_date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        comment: 'Record last update timestamp'
      },
      updated_host: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Host/IP address where record was last updated'
      }
    },
    {
      sequelize,
      modelName: 'BucketParameterDetail',
      tableName: 'bucket_parameter_details',
      schema: 'collective_impairment',
      timestamps: false, // We handle timestamps manually
      underscored: true,
      comment: 'Detail table for bucket parameter range configurations used in IFRS 9 collective impairment calculations',
      indexes: [
        {
          name: 'idx_bucket_param_detail_header_id',
          fields: ['bucket_header_id']
        },
        {
          name: 'idx_bucket_param_detail_range',
          fields: ['bucket_header_id', 'range_from', 'range_to']
        },
        {
          name: 'idx_bucket_param_detail_code',
          fields: ['bucket_header_id', 'bucket_code'],
          unique: true
        },
        {
          name: 'idx_bucket_param_detail_seq',
          fields: ['bucket_header_id', 'seq']
        },
        {
          name: 'idx_bucket_param_detail_active',
          fields: ['active_flag']
        },
        {
          name: 'idx_bucket_param_detail_created',
          fields: ['created_date']
        }
      ],
      validate: {
        // Custom validation for range logic
        rangeValidation() {
          if (this.range_from >= this.range_to) {
            throw new Error('Range from must be less than range to');
          }
        }
      }
    }
  );

  // =========================================================================
  // ASSOCIATIONS
  // =========================================================================

  // Header has many Details
  BucketParameterHeader.hasMany(BucketParameterDetail, {
    foreignKey: 'bucket_header_id',
    as: 'details',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Detail belongs to Header
  BucketParameterDetail.belongsTo(BucketParameterHeader, {
    foreignKey: 'bucket_header_id',
    as: 'header',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get bucket types for dropdowns
 */
export const getBucketTypes = () => [
  { value: 'AGING', label: 'Aging Buckets (DPD-based)', description: 'Days Past Due bucket classification' },
  { value: 'RATING', label: 'Rating Buckets (Credit Score)', description: 'Credit rating or score-based buckets' },
  { value: 'AMOUNT', label: 'Amount Buckets (Exposure Size)', description: 'Outstanding amount or exposure size buckets' },
  { value: 'CUSTOM', label: 'Custom Buckets (User-defined)', description: 'Custom user-defined bucket criteria' }
];

/**
 * Get range units for dropdowns
 */
export const getRangeUnits = () => [
  { value: 'DAYS', label: 'Days', description: 'Time period in days (aging analysis)' },
  { value: 'MONTHS', label: 'Months', description: 'Time period in months (term analysis)' },
  { value: 'YEARS', label: 'Years', description: 'Time period in years (long-term analysis)' },
  { value: 'AMOUNT', label: 'Amount', description: 'Currency amount units' },
  { value: 'SCORE', label: 'Score', description: 'Rating or score points' }
];

/**
 * Validate range overlaps
 */
export const validateRangeOverlap = (
  range1From: number, 
  range1To: number, 
  range2From: number, 
  range2To: number
): boolean => {
  return !(range1To <= range2From || range2To <= range1From);
};

/**
 * Generate bucket codes automatically
 */
export const generateBucketCode = (bucketType: string, sequence: number): string => {
  const prefix = {
    'AGING': 'AGE',
    'RATING': 'RTG',
    'AMOUNT': 'AMT',
    'CUSTOM': 'CST'
  }[bucketType] || 'BKT';
  
  return `${prefix}${sequence.toString().padStart(3, '0')}`;
};

/**
 * Generate bucket labels automatically
 */
export const generateBucketLabel = (
  bucketType: string, 
  rangeFrom: number, 
  rangeTo: number, 
  rangeUnit?: string
): string => {
  const unit = rangeUnit || '';
  
  if (bucketType === 'AGING') {
    if (rangeFrom === 0) {
      return `Current (0 ${unit})`;
    } else if (rangeTo === 999999) {
      return `${rangeFrom}+ ${unit}`;
    } else {
      return `${rangeFrom}-${rangeTo} ${unit}`;
    }
  } else if (bucketType === 'RATING') {
    return `Rating ${rangeFrom}-${rangeTo}`;
  } else if (bucketType === 'AMOUNT') {
    return `${rangeFrom.toLocaleString()}-${rangeTo.toLocaleString()}`;
  } else {
    return `Range ${rangeFrom}-${rangeTo}`;
  }
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  BucketParameterHeader,
  BucketParameterDetail,
  initBucketParameterModels,
  getBucketTypes,
  getRangeUnits,
  validateRangeOverlap,
  generateBucketCode,
  generateBucketLabel
};