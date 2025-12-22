// packages/backend/src/core/models/frs9-segmentation.models.ts
// ============================================================================
// 🎯 FRS9PRO SEGMENTATION DATA MODELS - REAL DATABASE STRUCTURE
// ============================================================================
// Based on actual FRS9PRO database tables:
// - frs9_param_segmenth: Segmentation configuration header
// - frs9_param_segmentd: Segmentation configuration details
// 
// ✅ FIELD NAME CASE CONFIRMED (January 2025):
// - FRS9PRO uses lowercase field names: frs9_master_account.prd_code
// - Business Settings B0016 API updated with case normalization
// - Real data confirmed: PRD_CODE contains "HE,KPR,CF,TNH" values
// ============================================================================

import { DataTypes, Model, Sequelize } from 'sequelize';

// ==========================================
// SEGMENTATION HEADER INTERFACE
// ==========================================

export interface SegmentationHeaderAttributes {
  pkid: number;
  group_segment: string;
  segment: string;
  sub_segment: string;
  segment_type: string;
  seq: number;
  active_flag: boolean;
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

// ==========================================
// SEGMENTATION DETAIL INTERFACE  
// ==========================================

export interface SegmentationDetailAttributes {
  pkid: number;
  segment_id: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1: string;
  value2?: string;
  condition: string;
  createdby: string;
  createddate: Date;
  createdhost: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

// ==========================================
// SEGMENTATION HEADER MODEL
// ==========================================

export class SegmentationHeader extends Model<SegmentationHeaderAttributes> 
  implements SegmentationHeaderAttributes {
  
  public pkid!: number;
  public group_segment!: string;
  public segment!: string;
  public sub_segment!: string;
  public segment_type!: string;
  public seq!: number;
  public active_flag!: boolean;
  public createdby!: string;
  public createddate!: Date;
  public createdhost!: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  // Associations
  public details?: SegmentationDetail[];
}

// ==========================================
// SEGMENTATION DETAIL MODEL
// ==========================================

export class SegmentationDetail extends Model<SegmentationDetailAttributes> 
  implements SegmentationDetailAttributes {
  
  public pkid!: number;
  public segment_id!: number;
  public query_group!: number;
  public seq!: number;
  public table_name!: string;
  public column_name!: string;
  public data_type!: string;
  public operator!: string;
  public value1!: string;
  public value2?: string;
  public condition!: string;
  public createdby!: string;
  public createddate!: Date;
  public createdhost!: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  // Associations
  public header?: SegmentationHeader;
}

// ==========================================
// MODEL INITIALIZATION FUNCTIONS
// ==========================================

export const initSegmentationHeader = (sequelize: Sequelize) => {
  SegmentationHeader.init({
    pkid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key for segmentation header'
    },
    group_segment: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Group segment name'
    },
    segment: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Segment name'
    },
    sub_segment: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Sub segment name'
    },
    segment_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Segment type (PF, PD, LGD, EAD)'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Sequence number'
    },
    active_flag: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Active flag'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Created by user'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Created date'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Created host'
    },
    updatedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Updated by user'
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Updated date'
    },
    updatedhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Updated host'
    }
  }, {
    sequelize,
    modelName: 'SegmentationHeader',
    tableName: 'frs9_param_segmenth',
    timestamps: false, // Using custom timestamp fields
    freezeTableName: true,
    comment: 'FRS9 Segmentation Configuration Header'
  });

  return SegmentationHeader;
};

export const initSegmentationDetail = (sequelize: Sequelize) => {
  SegmentationDetail.init({
    pkid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key for segmentation detail'
    },
    segment_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Reference to segmentation header PKID'
    },
    query_group: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Query grouping number'
    },
    seq: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Sequence number within query group'
    },
    table_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Database table name'
    },
    column_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Database column name'
    },
    data_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Column data type (VARCHAR, NUMBER, DATE, BOOLEAN)'
    },
    operator: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'SQL operator (=, >, <, IN, LIKE, BETWEEN)'
    },
    value1: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Primary value or start value for BETWEEN'
    },
    value2: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'End value for BETWEEN operator'
    },
    condition: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Logical condition (AND, OR)'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Created by user'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Created date'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Created host'
    },
    updatedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Updated by user'
    },
    updateddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Updated date'
    },
    updatedhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Updated host'
    }
  }, {
    sequelize,
    modelName: 'SegmentationDetail',
    tableName: 'frs9_param_segmentd',
    timestamps: false, // Using custom timestamp fields
    freezeTableName: true,
    comment: 'FRS9 Segmentation Configuration Detail'
  });

  return SegmentationDetail;
};

// ==========================================
// MODEL ASSOCIATIONS
// ==========================================

export const setupSegmentationAssociations = () => {
  // Header has many Details
  SegmentationHeader.hasMany(SegmentationDetail, {
    foreignKey: 'segment_id',
    sourceKey: 'pkid',
    as: 'details'
  });

  // Detail belongs to Header
  SegmentationDetail.belongsTo(SegmentationHeader, {
    foreignKey: 'segment_id',
    targetKey: 'pkid',
    as: 'header'
  });
};

// ==========================================
// EXPORT SUMMARY
// ==========================================

console.log('✅ [FRS9-SEGMENTATION] Models loaded successfully - Real FRS9PRO database structure');
console.log('📋 [FRS9-SEGMENTATION] Available models: SegmentationHeader, SegmentationDetail');
console.log('🔗 [FRS9-SEGMENTATION] Tables: frs9_param_segmenth, frs9_param_segmentd');