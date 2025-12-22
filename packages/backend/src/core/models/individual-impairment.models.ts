// packages/backend/src/core/models/individual-impairment.models.ts
// ============================================================================
// 🔧 INDIVIDUAL IMPAIRMENT ASSESSMENT OVERRIDE MODELS
// ============================================================================
// ✅ PATTERN: Multi-table system with DCF analysis integration
// ✅ DATABASE: frs9_imp_ia_* tables (header, detail, dcf, result, recovery)
// ✅ FEATURES: Individual account assessment, scenario analysis, DCF calculations
// ============================================================================

import { DataTypes, Model, Sequelize } from 'sequelize';

// ============================================================================
// 1. INDIVIDUAL IMPAIRMENT HEADER TABLE
// ============================================================================

interface IndividualImpairmentHeaderAttributes {
  pkid?: number;
  ia_id?: number;
  prc_date: Date;
  eff_date: Date;
  cif_number: string;
  cif_name: string;
  account_id: number;
  account_number: string;
  currency: string;
  eff_interest_rate: number;
  interest_rate: number;
  dpd: number;
  collectability: number;
  rating_code: string;
  impaired_flag: 'I' | 'N';
  method: string;
  plafond: number;
  outstanding: number;
  accrued_interest: number;
  carrying_amt: number;
  ead_amt: number;
  pv_dcf_amt: number;
  ecl_ia_amt: number;
  scenario_id: number;
  n_of_scenario: number;
  po_rate_1?: number;
  po_rate_2?: number;
  po_rate_3?: number;
  sc_name_1?: string;
  sc_name_2?: string;
  sc_name_3?: string;
  status: number;
  trigger_remarks?: string;
  createdby?: string;
  createddate?: Date;
  createdhost?: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
  reviewedby?: string;
  revieweddate?: Date;
  reviewedhost?: string;
}

class IndividualImpairmentHeader extends Model<IndividualImpairmentHeaderAttributes> implements IndividualImpairmentHeaderAttributes {
  public pkid!: number;
  public ia_id?: number;
  public prc_date!: Date;
  public eff_date!: Date;
  public cif_number!: string;
  public cif_name!: string;
  public account_id!: number;
  public account_number!: string;
  public currency!: string;
  public eff_interest_rate!: number;
  public interest_rate!: number;
  public dpd!: number;
  public collectability!: number;
  public rating_code!: string;
  public impaired_flag!: 'I' | 'N';
  public method!: string;
  public plafond!: number;
  public outstanding!: number;
  public accrued_interest!: number;
  public carrying_amt!: number;
  public ead_amt!: number;
  public pv_dcf_amt!: number;
  public ecl_ia_amt!: number;
  public scenario_id!: number;
  public n_of_scenario!: number;
  public po_rate_1?: number;
  public po_rate_2?: number;
  public po_rate_3?: number;
  public sc_name_1?: string;
  public sc_name_2?: string;
  public sc_name_3?: string;
  public status!: number;
  public trigger_remarks?: string;
  public createdby?: string;
  public createddate?: Date;
  public createdhost?: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;
  public reviewedby?: string;
  public revieweddate?: Date;
  public reviewedhost?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ============================================================================
// 2. INDIVIDUAL IMPAIRMENT DETAIL TABLE
// ============================================================================

interface IndividualImpairmentDetailAttributes {
  pkid?: number;
  ia_id: number;
  account_id: number;
  eff_interest_rate?: number;
  mob?: number;
  periode?: Date;
  principal?: number;
  interest?: number;
  installment?: number;
  collateral?: number;
  po_rate_1?: number;
  po_rate_2?: number;
  po_rate_3?: number;
  rr_rate_1?: number;
  rr_rate_2?: number;
  rr_rate_3?: number;
  default_1?: number;
  default_2?: number;
  default_3?: number;
  pw_amt?: number;
  discount_factor?: number;
  pv_amt?: number;
  eir_amt?: number;
  beginning_balance?: number;
  ending_balance?: number;
  createdby?: string;
  createddate?: Date;
  createdhost?: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

class IndividualImpairmentDetail extends Model<IndividualImpairmentDetailAttributes> implements IndividualImpairmentDetailAttributes {
  public pkid!: number;
  public ia_id!: number;
  public account_id!: number;
  public eff_interest_rate?: number;
  public mob?: number;
  public periode?: Date;
  public principal?: number;
  public interest?: number;
  public installment?: number;
  public collateral?: number;
  public po_rate_1?: number;
  public po_rate_2?: number;
  public po_rate_3?: number;
  public rr_rate_1?: number;
  public rr_rate_2?: number;
  public rr_rate_3?: number;
  public default_1?: number;
  public default_2?: number;
  public default_3?: number;
  public pw_amt?: number;
  public discount_factor?: number;
  public pv_amt?: number;
  public eir_amt?: number;
  public beginning_balance?: number;
  public ending_balance?: number;
  public createdby?: string;
  public createddate?: Date;
  public createdhost?: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ============================================================================
// 3. DCF CALCULATION TABLE
// ============================================================================

interface IndividualImpairmentDCFAttributes {
  pkid?: number;
  ia_id: number;
  account_id: number;
  account_number: string;
  mob?: number;
  periode?: Date;
  principal?: number;
  interest?: number;
  collateral?: number;
  status?: 'A' | 'I' | 'C'; // Active, Impaired, Closed
  createdby?: string;
  createddate?: Date;
  createdhost?: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

class IndividualImpairmentDCF extends Model<IndividualImpairmentDCFAttributes> implements IndividualImpairmentDCFAttributes {
  public pkid!: number;
  public ia_id!: number;
  public account_id!: number;
  public account_number!: string;
  public mob?: number;
  public periode?: Date;
  public principal?: number;
  public interest?: number;
  public collateral?: number;
  public status?: 'A' | 'I' | 'C';
  public createdby?: string;
  public createddate?: Date;
  public createdhost?: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ============================================================================
// 4. RESULT HEADER TABLE
// ============================================================================

interface IndividualImpairmentResultHeaderAttributes {
  pkid?: number;
  ia_id: number;
  account_id: number;
  scenario_id: number;
  total_ecl: number;
  total_pv: number;
  weighted_default_rate: number;
  weighted_recovery_rate: number;
  calculation_date: Date;
  status: 'P' | 'F' | 'E'; // Pending, Final, Error
  createdby?: string;
  createddate?: Date;
  createdhost?: string;
}

class IndividualImpairmentResultHeader extends Model<IndividualImpairmentResultHeaderAttributes> implements IndividualImpairmentResultHeaderAttributes {
  public pkid!: number;
  public ia_id!: number;
  public account_id!: number;
  public scenario_id!: number;
  public total_ecl!: number;
  public total_pv!: number;
  public weighted_default_rate!: number;
  public weighted_recovery_rate!: number;
  public calculation_date!: Date;
  public status!: 'P' | 'F' | 'E';
  public createdby?: string;
  public createddate?: Date;
  public createdhost?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ============================================================================
// 5. RESULT DETAIL TABLE
// ============================================================================

interface IndividualImpairmentResultDetailAttributes {
  pkid?: number;
  result_header_id: number;
  ia_id: number;
  account_id: number;
  scenario_id: number;
  periode: Date;
  principal_cf: number;
  interest_cf: number;
  collateral_cf: number;
  discount_factor: number;
  pv_cf: number;
  pd_rate: number;
  lgd_rate: number;
  ecl_amount: number;
  createdby?: string;
  createddate?: Date;
  createdhost?: string;
}

class IndividualImpairmentResultDetail extends Model<IndividualImpairmentResultDetailAttributes> implements IndividualImpairmentResultDetailAttributes {
  public pkid!: number;
  public result_header_id!: number;
  public ia_id!: number;
  public account_id!: number;
  public scenario_id!: number;
  public periode!: Date;
  public principal_cf!: number;
  public interest_cf!: number;
  public collateral_cf!: number;
  public discount_factor!: number;
  public pv_cf!: number;
  public pd_rate!: number;
  public lgd_rate!: number;
  public ecl_amount!: number;
  public createdby?: string;
  public createddate?: Date;
  public createdhost?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ============================================================================
// 6. RECOVERY RATE TABLE
// ============================================================================

interface IndividualImpairmentRecoveryRateAttributes {
  pkid?: number;
  scenario_id: number;
  scenario_name: string;
  rating_code: string;
  collateral_type: string;
  recovery_rate: number;
  effective_from: Date;
  effective_to?: Date;
  status: 'A' | 'I'; // Active, Inactive
  createdby?: string;
  createddate?: Date;
  createdhost?: string;
  updatedby?: string;
  updateddate?: Date;
  updatedhost?: string;
}

class IndividualImpairmentRecoveryRate extends Model<IndividualImpairmentRecoveryRateAttributes> implements IndividualImpairmentRecoveryRateAttributes {
  public pkid!: number;
  public scenario_id!: number;
  public scenario_name!: string;
  public rating_code!: string;
  public collateral_type!: string;
  public recovery_rate!: number;
  public effective_from!: Date;
  public effective_to?: Date;
  public status!: 'A' | 'I';
  public createdby?: string;
  public createddate?: Date;
  public createdhost?: string;
  public updatedby?: string;
  public updateddate?: Date;
  public updatedhost?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// ============================================================================
// MODEL INITIALIZATION FUNCTIONS
// ============================================================================

export const initIndividualImpairmentHeader = (sequelize: Sequelize) => {
  IndividualImpairmentHeader.init({
    pkid: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key'
    },
    ia_id: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Individual assessment ID'
    },
    prc_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Processing date'
    },
    eff_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Effective date'
    },
    cif_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Customer CIF number'
    },
    cif_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: 'Customer name'
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Account ID (unique)'
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Account number'
    },
    currency: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Currency code'
    },
    eff_interest_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Effective interest rate'
    },
    interest_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Contractual interest rate'
    },
    dpd: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Days past due'
    },
    collectability: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Collectibility score'
    },
    rating_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Rating code'
    },
    impaired_flag: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'N',
      comment: 'Impairment flag (I/N)'
    },
    method: {
      type: DataTypes.STRING(20),
      allowNull: false,
      comment: 'Assessment method'
    },
    plafond: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Credit limit'
    },
    outstanding: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Outstanding balance'
    },
    accrued_interest: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Accrued interest'
    },
    carrying_amt: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Carrying amount'
    },
    ead_amt: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'EAD amount'
    },
    pv_dcf_amt: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Present value DCF amount'
    },
    ecl_ia_amt: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'ECL individual amount'
    },
    scenario_id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Scenario ID'
    },
    n_of_scenario: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Number of scenarios'
    },
    po_rate_1: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Probability of default rate 1'
    },
    po_rate_2: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Probability of default rate 2'
    },
    po_rate_3: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Probability of default rate 3'
    },
    sc_name_1: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Scenario name 1'
    },
    sc_name_2: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Scenario name 2'
    },
    sc_name_3: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Scenario name 3'
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Assessment status'
    },
    trigger_remarks: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: 'Trigger remarks'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created by'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Created date'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created host'
    },
    updatedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Updated by'
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
    },
    reviewedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Reviewed by'
    },
    revieweddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Reviewed date'
    },
    reviewedhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Reviewed host'
    }
  }, {
    sequelize,
    modelName: 'IndividualImpairmentHeader',
    tableName: 'frs9_imp_ia_header',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['ia_id'] },
      { fields: ['account_id'] },
      { fields: ['cif_number'] },
      { fields: ['account_number'] },
      { fields: ['prc_date'] },
      { fields: ['impaired_flag'] },
      { fields: ['status'] }
    ]
  });

  return IndividualImpairmentHeader;
};

export const initIndividualImpairmentDetail = (sequelize: Sequelize) => {
  IndividualImpairmentDetail.init({
    pkid: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key'
    },
    ia_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Link to header'
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Account ID'
    },
    eff_interest_rate: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Effective interest rate'
    },
    mob: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Months on books'
    },
    periode: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Period date'
    },
    principal: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Principal amount'
    },
    interest: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Interest amount'
    },
    installment: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Installment amount'
    },
    collateral: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Collateral value'
    },
    po_rate_1: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'PO rate scenario 1'
    },
    po_rate_2: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'PO rate scenario 2'
    },
    po_rate_3: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'PO rate scenario 3'
    },
    rr_rate_1: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Recovery rate scenario 1'
    },
    rr_rate_2: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Recovery rate scenario 2'
    },
    rr_rate_3: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Recovery rate scenario 3'
    },
    default_1: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Default amount scenario 1'
    },
    default_2: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Default amount scenario 2'
    },
    default_3: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Default amount scenario 3'
    },
    pw_amt: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Present worth amount'
    },
    discount_factor: {
      type: DataTypes.DOUBLE,
      allowNull: true,
      comment: 'Discount factor'
    },
    pv_amt: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Present value amount'
    },
    eir_amt: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'EIR amount'
    },
    beginning_balance: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Beginning balance'
    },
    ending_balance: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Ending balance'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created by'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Created date'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created host'
    },
    updatedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Updated by'
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
    modelName: 'IndividualImpairmentDetail',
    tableName: 'frs9_imp_ia_detail',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['ia_id'] },
      { fields: ['account_id'] },
      { fields: ['periode'] },
      { fields: ['mob'] }
    ]
  });

  return IndividualImpairmentDetail;
};

export const initIndividualImpairmentDCF = (sequelize: Sequelize) => {
  IndividualImpairmentDCF.init({
    pkid: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key'
    },
    ia_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Link to header'
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Account ID'
    },
    account_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Account number'
    },
    mob: {
      type: DataTypes.BIGINT,
      allowNull: true,
      comment: 'Months on books'
    },
    periode: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Period date'
    },
    principal: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Principal cash flow'
    },
    interest: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Interest cash flow'
    },
    collateral: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: true,
      comment: 'Collateral cash flow'
    },
    status: {
      type: DataTypes.CHAR(1),
      allowNull: true,
      defaultValue: 'A',
      comment: 'Cash flow status (A/I/C)'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created by'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Created date'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created host'
    },
    updatedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Updated by'
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
    modelName: 'IndividualImpairmentDCF',
    tableName: 'frs9_imp_ia_dcf',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['ia_id'] },
      { fields: ['account_id'] },
      { fields: ['account_number'] },
      { fields: ['periode'] },
      { fields: ['mob'] },
      { fields: ['status'] }
    ]
  });

  return IndividualImpairmentDCF;
};

export const initIndividualImpairmentResultHeader = (sequelize: Sequelize) => {
  IndividualImpairmentResultHeader.init({
    pkid: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key'
    },
    ia_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Link to IA header'
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Account ID'
    },
    scenario_id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Scenario ID'
    },
    total_ecl: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Total ECL'
    },
    total_pv: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Total Present Value'
    },
    weighted_default_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Weighted default rate'
    },
    weighted_recovery_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Weighted recovery rate'
    },
    calculation_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Calculation date'
    },
    status: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'P',
      comment: 'Status (P/F/E)'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created by'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Created date'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created host'
    }
  }, {
    sequelize,
    modelName: 'IndividualImpairmentResultHeader',
    tableName: 'frs9_imp_ia_result_h',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['ia_id'] },
      { fields: ['account_id'] },
      { fields: ['scenario_id'] },
      { fields: ['calculation_date'] },
      { fields: ['status'] }
    ]
  });

  return IndividualImpairmentResultHeader;
};

export const initIndividualImpairmentResultDetail = (sequelize: Sequelize) => {
  IndividualImpairmentResultDetail.init({
    pkid: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key'
    },
    result_header_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Link to result header'
    },
    ia_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Link to IA header'
    },
    account_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
      comment: 'Account ID'
    },
    scenario_id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Scenario ID'
    },
    periode: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Period date'
    },
    principal_cf: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Principal cash flow'
    },
    interest_cf: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Interest cash flow'
    },
    collateral_cf: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Collateral cash flow'
    },
    discount_factor: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Discount factor'
    },
    pv_cf: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'Present value cash flow'
    },
    pd_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Probability of default rate'
    },
    lgd_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Loss given default rate'
    },
    ecl_amount: {
      type: DataTypes.DECIMAL(32, 6),
      allowNull: false,
      comment: 'ECL amount'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created by'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Created date'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created host'
    }
  }, {
    sequelize,
    modelName: 'IndividualImpairmentResultDetail',
    tableName: 'frs9_imp_ia_result_d',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['result_header_id'] },
      { fields: ['ia_id'] },
      { fields: ['account_id'] },
      { fields: ['scenario_id'] },
      { fields: ['periode'] }
    ]
  });

  return IndividualImpairmentResultDetail;
};

export const initIndividualImpairmentRecoveryRate = (sequelize: Sequelize) => {
  IndividualImpairmentRecoveryRate.init({
    pkid: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Primary key'
    },
    scenario_id: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      comment: 'Scenario ID'
    },
    scenario_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Scenario name'
    },
    rating_code: {
      type: DataTypes.STRING(5),
      allowNull: false,
      comment: 'Rating code'
    },
    collateral_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: 'Collateral type'
    },
    recovery_rate: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      comment: 'Recovery rate'
    },
    effective_from: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Effective from date'
    },
    effective_to: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Effective to date'
    },
    status: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      defaultValue: 'A',
      comment: 'Status (A/I)'
    },
    createdby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created by'
    },
    createddate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Created date'
    },
    createdhost: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Created host'
    },
    updatedby: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Updated by'
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
    modelName: 'IndividualImpairmentRecoveryRate',
    tableName: 'frs9_imp_ia_rr',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['scenario_id'] },
      { fields: ['rating_code'] },
      { fields: ['collateral_type'] },
      { fields: ['effective_from'] },
      { fields: ['status'] }
    ]
  });

  return IndividualImpairmentRecoveryRate;
};

// Export all models
export {
  IndividualImpairmentHeader,
  IndividualImpairmentDetail,
  IndividualImpairmentDCF,
  IndividualImpairmentResultHeader,
  IndividualImpairmentResultDetail,
  IndividualImpairmentRecoveryRate
};