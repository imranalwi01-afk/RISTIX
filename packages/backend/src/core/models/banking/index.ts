// packages/backend/src/core/models/banking/index.ts
// ============================================================================
// Banking Models Index - IFRS9 Multi-Tenant Platform
// ============================================================================
// Purpose: Central export for all banking domain models
// Dependencies: Sequelize models for banking operations
// Banking Support: Conventional + Syariah (Islamic) banking
// ============================================================================

// Core banking models
export { PortfolioAccount, type PortfolioAccountAttributes, type PortfolioAccountCreationAttributes } from './portfolio-account.model';
export { Customer, type CustomerAttributes, type CustomerCreationAttributes } from './customer.model';
export { ProductType, type ProductTypeAttributes, type ProductTypeCreationAttributes } from './product-type.model';
export { Collateral, type CollateralAttributes, type CollateralCreationAttributes } from './collateral.model';

// Model initialization function
import { Sequelize } from 'sequelize';
import { PortfolioAccount } from './portfolio-account.model';
import { Customer } from './customer.model';
import { ProductType } from './product-type.model';
import { Collateral } from './collateral.model';

/**
 * Initialize all banking models and their associations
 * @param sequelize - Sequelize instance
 */
export const initBankingModels = (sequelize: Sequelize): void => {
  // Initialize models
  PortfolioAccount.init({}, { sequelize });
  Customer.init({}, { sequelize });
  ProductType.init({}, { sequelize });
  Collateral.init({}, { sequelize });

  // Define associations
  setupBankingAssociations();
};

/**
 * Setup model associations for banking domain
 */
export const setupBankingAssociations = (): void => {
  // PortfolioAccount associations
  PortfolioAccount.belongsTo(Customer, {
    foreignKey: 'customer_id',
    as: 'customer'
  });

  PortfolioAccount.belongsTo(ProductType, {
    foreignKey: 'product_type_id',
    as: 'productType'
  });

  PortfolioAccount.hasMany(Collateral, {
    foreignKey: 'account_id',
    as: 'collateral'
  });

  // Customer associations
  Customer.hasMany(PortfolioAccount, {
    foreignKey: 'customer_id',
    as: 'portfolioAccounts'
  });

  // ProductType associations
  ProductType.hasMany(PortfolioAccount, {
    foreignKey: 'product_type_id',
    as: 'portfolioAccounts'
  });

  // Collateral associations
  Collateral.belongsTo(PortfolioAccount, {
    foreignKey: 'account_id',
    as: 'portfolioAccount'
  });
};

/**
 * Get all banking model classes
 */
export const getBankingModels = () => {
  return {
    PortfolioAccount,
    Customer,
    ProductType,
    Collateral
  };
};

/**
 * Banking model metadata for IFRS9 calculations
 */
export const BANKING_MODEL_METADATA = {
  PortfolioAccount: {
    tableName: 'portfolio_accounts',
    schema: 'core',
    primaryKey: 'id',
    ifrs9Relevant: true,
    calculationFields: ['pd_12_month', 'pd_lifetime', 'lgd', 'ead', 'ecl_12_month', 'ecl_lifetime', 'final_ecl'],
    stagingField: 'current_stage',
    bankingTypeField: 'banking_type'
  },
  Customer: {
    tableName: 'customers',
    schema: 'core',
    primaryKey: 'id',
    ifrs9Relevant: true,
    riskFields: ['risk_category', 'internal_rating', 'external_rating'],
    bankingTypeField: 'banking_type'
  },
  ProductType: {
    tableName: 'product_types',
    schema: 'core',
    primaryKey: 'id',
    ifrs9Relevant: true,
    modelFields: ['pd_model_type', 'lgd_model_type', 'ead_model_type'],
    parametersFields: ['pd_base_rate', 'lgd_base_rate', 'credit_conversion_factor'],
    bankingTypeField: 'banking_type'
  },
  Collateral: {
    tableName: 'collateral',
    schema: 'core',
    primaryKey: 'id',
    ifrs9Relevant: true,
    valuationFields: ['current_market_value', 'haircut_percentage', 'recovery_rate'],
    bankingTypeField: 'banking_type'
  }
} as const;

/**
 * IFRS9 calculation helper functions
 */
export const IFRS9_HELPERS = {
  /**
   * Get all IFRS9 relevant models
   */
  getIfrs9Models: () => {
    return Object.entries(BANKING_MODEL_METADATA)
      .filter(([, metadata]) => metadata.ifrs9Relevant)
      .map(([modelName]) => modelName);
  },

  /**
   * Get staging thresholds for a product type
   */
  getStagingThresholds: (productType: ProductType) => {
    return {
      stage1: productType.stage_1_threshold_days,
      stage2: productType.stage_2_threshold_days,
      stage3: productType.stage_3_threshold_days
    };
  },

  /**
   * Determine IFRS9 stage based on days past due and product type
   */
  determineStage: (daysPastDue: number, productType: ProductType): number => {
    if (daysPastDue >= productType.stage_3_threshold_days) {
      return 3;
    } else if (daysPastDue >= productType.stage_2_threshold_days) {
      return 2;
    } else {
      return 1;
    }
  },

  /**
   * Check if account requires lifetime ECL
   */
  requiresLifetimeEcl: (stage: number): boolean => {
    return stage === 2 || stage === 3;
  },

  /**
   * Get effective collateral value for LGD calculation
   */
  getEffectiveCollateralValue: (collateral: Collateral[]): number => {
    return collateral
      .filter(c => c.is_active && c.collateral_status === 'active')
      .reduce((total, c) => total + c.getNetRealizableValue(), 0);
  }
};

/**
 * Banking type validation helpers
 */
export const BANKING_TYPE_HELPERS = {
  /**
   * Validate Syariah compliance across banking models
   */
  validateShariahCompliance: (models: {
    account?: PortfolioAccount;
    customer?: Customer;
    productType?: ProductType;
    collateral?: Collateral[];
  }): { isCompliant: boolean; violations: string[] } => {
    const violations: string[] = [];

    // Check account compliance
    if (models.account && models.account.banking_type === 'syariah') {
      if (!models.account.isShariahCompliant()) {
        violations.push('Portfolio account is not Syariah compliant');
      }
    }

    // Check customer compliance
    if (models.customer && models.customer.banking_type === 'syariah') {
      if (!models.customer.isShariahCompliant()) {
        violations.push('Customer is not Syariah compliant');
      }
    }

    // Check product compliance
    if (models.productType && models.productType.banking_type === 'syariah') {
      if (!models.productType.isShariahCompliant()) {
        violations.push('Product type is not Syariah compliant');
      }
    }

    // Check collateral compliance
    if (models.collateral) {
      models.collateral.forEach((c, index) => {
        if (c.banking_type === 'syariah' && !c.isShariahCompliant()) {
          violations.push(`Collateral ${index + 1} is not Syariah compliant`);
        }
      });
    }

    return {
      isCompliant: violations.length === 0,
      violations
    };
  },

  /**
   * Get supported banking types for a model combination
   */
  getSupportedBankingTypes: (models: {
    productType?: ProductType;
    customer?: Customer;
  }): ('conventional' | 'syariah')[] => {
    const types: Set<'conventional' | 'syariah'> = new Set();

    // Check product type support
    if (models.productType) {
      if (models.productType.banking_type === 'dual') {
        types.add('conventional');
        types.add('syariah');
      } else {
        types.add(models.productType.banking_type);
      }
    }

    // Filter by customer preference
    if (models.customer) {
      if (types.has(models.customer.banking_type)) {
        return [models.customer.banking_type];
      }
    }

    return Array.from(types);
  }
};

export default {
  PortfolioAccount,
  Customer,
  ProductType,
  Collateral,
  initBankingModels,
  setupBankingAssociations,
  getBankingModels,
  BANKING_MODEL_METADATA,
  IFRS9_HELPERS,
  BANKING_TYPE_HELPERS
};