// packages/backend/src/core/models/segmentation.models.ts
// ============================================================================
// 🔧 SEGMENTATION MODELS - PHASE 3 MODULE 3.1
// ============================================================================
// ✅ PATTERN: Sequelize Models for frs9_param_segmenth & frs9_param_segmentd
// ✅ DATABASE: DS2 FRS9PRO (192.168.0.106:5433) - Legacy Integration
// ✅ FEATURES: Master-Detail relationship, validation, audit trail support
// ============================================================================

import { DataTypes, Model, Sequelize } from 'sequelize';

// ============================================================================
// SEGMENTATION HEADER MODEL (frs9_param_segmenth)
// ============================================================================

export interface SegmentationHeaderAttributes {
  pkid: number;
  group_segment: string;
  segment: string;
  sub_segment?: string;
  segment_type: string;
  seq?: number;
  active_flag: boolean;
  createdby?: string;
  createddate?: Date;
  createdhost?: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

export class SegmentationHeader extends Model<SegmentationHeaderAttributes> implements SegmentationHeaderAttributes {
  public pkid!: number;
  public group_segment!: string;
  public segment!: string;
  public sub_segment?: string;
  public segment_type!: string;
  public seq?: number;
  public active_flag!: boolean;
  public createdby?: string;
  public createddate?: Date;
  public createdhost?: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  // Timestamps
  public readonly created_at?: Date;
  public readonly updated_at?: Date;

  // Association helpers
  public details?: SegmentationDetail[];
}

export const initSegmentationHeader = (sequelize: Sequelize) => {
  SegmentationHeader.init({
    pkid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'pkid'
    },
    group_segment: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'group_segment',
      comment: 'Group Segment name for classification'
    },
    segment: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'segment',
      comment: 'Main segment name'
    },
    sub_segment: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'sub_segment',
      comment: 'Optional sub-segment for detailed classification'
    },
    segment_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'segment_type',
      comment: 'Type of segmentation (RISK, PRODUCT, GEOGRAPHY, etc.)'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'seq',
      comment: 'Display sequence for ordering'
    },
    active_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'active_flag',
      comment: 'Status flag for active/inactive segmentations'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'createdby',
      comment: 'User who created this record'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'createddate',
      comment: 'Date when record was created'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'createdhost',
      comment: 'Host/IP where record was created'
    },
    updatedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'updatedby',
      comment: 'User who last updated this record'
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updateddate',
      comment: 'Date when record was last updated'
    },
    updatedhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'updatedhost',
      comment: 'Host/IP where record was last updated'
    }
  }, {
    sequelize,
    modelName: 'SegmentationHeader',
    tableName: 'frs9_param_segmenth',
    timestamps: false, // Using custom timestamp fields
    underscored: false, // Field names already match database
    indexes: [
      {
        name: 'idx_segmentation_header_seq',
        fields: ['seq']
      },
      {
        name: 'idx_segmentation_header_type',
        fields: ['segment_type']
      },
      {
        name: 'idx_segmentation_header_active',
        fields: ['active_flag']
      },
      {
        unique: true,
        name: 'uk_segmentation_header_group_segment',
        fields: ['group_segment', 'segment']
      }
    ]
  });

  return SegmentationHeader;
};

// ============================================================================
// SEGMENTATION DETAIL MODEL (frs9_param_segmentd)
// ============================================================================

export interface SegmentationDetailAttributes {
  pkid: number;
  segment_id: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string | null;
  value2?: string | null;
  condition?: string | null;
  createdby?: string;
  createddate?: Date;
  createdhost?: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

export class SegmentationDetail extends Model<SegmentationDetailAttributes> implements SegmentationDetailAttributes {
  public pkid!: number;
  public segment_id!: number;
  public query_group!: number;
  public seq!: number;
  public table_name!: string;
  public column_name!: string;
  public data_type!: string;
  public operator!: string;
  public value1?: string | null;
  public value2?: string | null;
  public condition?: string | null;
  public createdby?: string;
  public createddate?: Date;
  public createdhost?: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  // Timestamps
  public readonly created_at?: Date;
  public readonly updated_at?: Date;

  // Association helpers
  public header?: SegmentationHeader;
}

export const initSegmentationDetail = (sequelize: Sequelize) => {
  SegmentationDetail.init({
    pkid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'pkid'
    },
    segment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'segment_id',
      comment: 'Foreign key to frs9_param_segmenth.pkid'
    },
    query_group: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'query_group',
      comment: 'Query grouping for complex rule combinations'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'seq',
      comment: 'Sequence within query group'
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'table_name',
      comment: 'Database table name for rule condition'
    },
    column_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'column_name',
      comment: 'Database column name for rule condition'
    },
    data_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'data_type',
      comment: 'Data type of column (VARCHAR, NUMBER, DATE, BOOLEAN)'
    },
    operator: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'operator',
      comment: 'Comparison operator (=, >, <, BETWEEN, IN, LIKE, etc.)'
    },
    value1: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'value1',
      comment: 'First comparison value or single value for operators'
    },
    value2: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'value2',
      comment: 'Second comparison value for BETWEEN operator'
    },
    condition: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'condition',
      comment: 'Logical condition (AND/OR) for connecting rules'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'createdby',
      comment: 'User who created this record'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'createddate',
      comment: 'Date when record was created'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'createdhost',
      comment: 'Host/IP where record was created'
    },
    updatedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'updatedby',
      comment: 'User who last updated this record'
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'updateddate',
      comment: 'Date when record was last updated'
    },
    updatedhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'updatedhost',
      comment: 'Host/IP where record was last updated'
    }
  }, {
    sequelize,
    modelName: 'SegmentationDetail',
    tableName: 'frs9_param_segmentd',
    timestamps: false, // Using custom timestamp fields
    underscored: false, // Field names already match database
    indexes: [
      {
        name: 'idx_segmentation_detail_segment_id',
        fields: ['segment_id']
      },
      {
        name: 'idx_segmentation_detail_query_group',
        fields: ['query_group']
      },
      {
        name: 'idx_segmentation_detail_seq',
        fields: ['seq']
      },
      {
        name: 'idx_segmentation_detail_table_column',
        fields: ['table_name', 'column_name']
      }
    ]
  });

  return SegmentationDetail;
};

// ============================================================================
// MODEL ASSOCIATIONS
// ============================================================================

export const initSegmentationAssociations = () => {
  // Header has many Details
  SegmentationHeader.hasMany(SegmentationDetail, {
    foreignKey: 'segment_id',
    as: 'details',
    onDelete: 'CASCADE'
  });

  // Detail belongs to Header
  SegmentationDetail.belongsTo(SegmentationHeader, {
    foreignKey: 'segment_id',
    as: 'header'
  });
};

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const VALID_OPERATORS = {
  VARCHAR: ['=', '<>', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN'],
  NUMBER: ['=', '>', '<', '>=', '<=', '<>', 'BETWEEN', 'IN', 'NOT IN'],
  DATE: ['=', '>', '<', '>=', '<=', '<>', 'BETWEEN'],
  BOOLEAN: ['=']
} as const;

export const VALID_CONDITIONS = ['AND', 'OR'] as const;

export const VALID_SEGMENT_TYPES = [
  'RISK_SEGMENT',
  'PRODUCT_SEGMENT', 
  'GEOGRAPHY_SEGMENT',
  'CUSTOMER_SEGMENT',
  'PORTFOLIO_SEGMENT',
  'BUSINESS_SEGMENT',
  'CUSTOM_SEGMENT'
] as const;

// Export types for external use
export type ValidOperatorType = keyof typeof VALID_OPERATORS;
export type ValidConditionType = typeof VALID_CONDITIONS[number];
export type ValidSegmentType = typeof VALID_SEGMENT_TYPES[number];