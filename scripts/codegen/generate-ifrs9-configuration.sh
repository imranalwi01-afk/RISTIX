#!/bin/bash
# scripts/codegen/generate-ifrs9-configuration.sh
# IFRS 9 Configuration Files Generator - DAY 3 HOUR 1

set -e
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CONFIG_DIR="${PROJECT_ROOT}/packages/backend/src/config/ifrs9"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Generate IFRS 9 main configuration
generate_ifrs9_config() {
    log_info "Generating IFRS 9 main configuration..."
    
    cat > "${CONFIG_DIR}/ifrs9.config.ts" << 'EOF'
// packages/backend/src/config/ifrs9/ifrs9.config.ts
import { z } from 'zod';

// Configuration schema validation
const IfrsConfigSchema = z.object({
  enabled: z.boolean().default(true),
  calculationFrequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly']).default('monthly'),
  
  // R Analytics Service Configuration
  rAnalyticsService: z.object({
    enabled: z.boolean().default(true),
    url: z.string().url().default('http://localhost:8001'),
    timeout: z.number().min(1000).max(600000).default(300000), // 5 minutes
    retries: z.number().min(0).max(5).default(3),
    healthCheckInterval: z.number().min(1000).default(30000) // 30 seconds
  }),
  
  // PD Model Configuration
  pdModel: z.object({
    defaultMethod: z.enum(['historical', 'logistic', 'market']).default('historical'),
    minPd: z.number().min(0).max(1).default(0.0001),
    maxPd: z.number().min(0).max(1).default(1.0),
    defaultPd: z.number().min(0).max(1).default(0.05),
    ratingOverride: z.boolean().default(true),
    dpdAdjustment: z.boolean().default(true),
    ageAdjustment: z.boolean().default(true)
  }),
  
  // LGD Model Configuration
  lgdModel: z.object({
    defaultMethod: z.enum(['historical', 'beta', 'workout']).default('historical'),
    minLgd: z.number().min(0).max(1).default(0.01),
    maxLgd: z.number().min(0).max(1).default(1.0),
    defaultLgd: z.number().min(0).max(1).default(0.45),
    collateralAdjustment: z.boolean().default(true),
    syariahAdjustment: z.boolean().default(true),
    productTypeAdjustment: z.boolean().default(true)
  }),
  
  // EAD Model Configuration
  eadModel: z.object({
    defaultMethod: z.enum(['current', 'stressed', 'regulatory']).default('current'),
    defaultCcf: z.number().min(0).max(1).default(0.75),
    maxCcf: z.number().min(0).max(1).default(1.0),
    stressedCcfMultiplier: z.number().min(1).max(3).default(1.5)
  }),
  
  // Stage Classification Configuration
  stageClassification: z.object({
    stage2PdThreshold: z.number().min(0).max(1).default(0.10),
    stage2DpdThreshold: z.number().min(0).max(365).default(30),
    stage3DpdThreshold: z.number().min(0).max(365).default(90),
    significantIncreaseFactor: z.number().min(1).default(2.0),
    pdIncreaseAbsoluteThreshold: z.number().min(0).max(1).default(0.005),
    qualitativeIndicators: z.boolean().default(true)
  }),
  
  // Forward-looking Configuration
  forwardLooking: z.object({
    enabled: z.boolean().default(false),
    defaultScenarioWeights: z.object({
      base: z.number().min(0).max(1).default(0.5),
      upside: z.number().min(0).max(1).default(0.2),
      downside: z.number().min(0).max(1).default(0.3)
    }),
    macroeconomicVariables: z.array(z.string()).default(['gdp_growth', 'unemployment_rate', 'interest_rate']),
    scenarioUpdateFrequency: z.enum(['monthly', 'quarterly', 'annually']).default('quarterly')
  }),
  
  // Calculation Performance
  performance: z.object({
    batchSize: z.number().min(100).max(10000).default(1000),
    maxConcurrentJobs: z.number().min(1).max(10).default(3),
    timeoutMinutes: z.number().min(5).max(120).default(30),
    memoryLimitMb: z.number().min(512).max(8192).default(2048)
  }),
  
  // Data Quality
  dataQuality: z.object({
    validationEnabled: z.boolean().default(true),
    requireRating: z.boolean().default(false),
    requireCollateral: z.boolean().default(false),
    maxMissingDataPercent: z.number().min(0).max(100).default(10),
    autoCorrectData: z.boolean().default(false)
  }),
  
  // Audit and Compliance
  audit: z.object({
    enabled: z.boolean().default(true),
    retentionDays: z.number().min(30).max(2555).default(365), // 1 year default
    logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    trackModelChanges: z.boolean().default(true),
    requireApproval: z.boolean().default(false)
  })
});

type IfrsConfig = z.infer<typeof IfrsConfigSchema>;

// Default configuration
const defaultConfig: IfrsConfig = {
  enabled: true,
  calculationFrequency: 'monthly',
  
  rAnalyticsService: {
    enabled: true,
    url: process.env.R_ANALYTICS_URL || 'http://localhost:8001',
    timeout: parseInt(process.env.R_TIMEOUT_SECONDS || '300') * 1000,
    retries: 3,
    healthCheckInterval: 30000
  },
  
  pdModel: {
    defaultMethod: 'historical',
    minPd: 0.0001,
    maxPd: 1.0,
    defaultPd: 0.05,
    ratingOverride: true,
    dpdAdjustment: true,
    ageAdjustment: true
  },
  
  lgdModel: {
    defaultMethod: 'historical',
    minLgd: 0.01,
    maxLgd: 1.0,
    defaultLgd: 0.45,
    collateralAdjustment: true,
    syariahAdjustment: true,
    productTypeAdjustment: true
  },
  
  eadModel: {
    defaultMethod: 'current',
    defaultCcf: 0.75,
    maxCcf: 1.0,
    stressedCcfMultiplier: 1.5
  },
  
  stageClassification: {
    stage2PdThreshold: 0.10,
    stage2DpdThreshold: 30,
    stage3DpdThreshold: 90,
    significantIncreaseFactor: 2.0,
    pdIncreaseAbsoluteThreshold: 0.005,
    qualitativeIndicators: true
  },
  
  forwardLooking: {
    enabled: false,
    defaultScenarioWeights: {
      base: 0.5,
      upside: 0.2,
      downside: 0.3
    },
    macroeconomicVariables: ['gdp_growth', 'unemployment_rate', 'interest_rate'],
    scenarioUpdateFrequency: 'quarterly'
  },
  
  performance: {
    batchSize: 1000,
    maxConcurrentJobs: 3,
    timeoutMinutes: 30,
    memoryLimitMb: 2048
  },
  
  dataQuality: {
    validationEnabled: true,
    requireRating: false,
    requireCollateral: false,
    maxMissingDataPercent: 10,
    autoCorrectData: false
  },
  
  audit: {
    enabled: true,
    retentionDays: 365,
    logLevel: 'info',
    trackModelChanges: true,
    requireApproval: false
  }
};

// Configuration loader with validation
export const loadIfrsConfig = (): IfrsConfig => {
  try {
    // Load from environment variables or database
    const config = { ...defaultConfig };
    
    // Override with environment variables if present
    if (process.env.IFRS9_ENABLED !== undefined) {
      config.enabled = process.env.IFRS9_ENABLED === 'true';
    }
    
    if (process.env.IFRS9_CALCULATION_FREQUENCY) {
      config.calculationFrequency = process.env.IFRS9_CALCULATION_FREQUENCY as any;
    }
    
    if (process.env.IFRS9_PD_METHOD) {
      config.pdModel.defaultMethod = process.env.IFRS9_PD_METHOD as any;
    }
    
    if (process.env.IFRS9_LGD_METHOD) {
      config.lgdModel.defaultMethod = process.env.IFRS9_LGD_METHOD as any;
    }
    
    if (process.env.IFRS9_EAD_METHOD) {
      config.eadModel.defaultMethod = process.env.IFRS9_EAD_METHOD as any;
    }
    
    if (process.env.IFRS9_FORWARD_LOOKING_ENABLED !== undefined) {
      config.forwardLooking.enabled = process.env.IFRS9_FORWARD_LOOKING_ENABLED === 'true';
    }
    
    // Validate configuration
    return IfrsConfigSchema.parse(config);
    
  } catch (error) {
    console.error('Invalid IFRS 9 configuration:', error);
    throw new Error('Failed to load IFRS 9 configuration');
  }
};

// Export configuration
export const ifrsConfig = loadIfrsConfig();

// Configuration getters for different modules
export const getRAnalyticsConfig = () => ifrsConfig.rAnalyticsService;
export const getPdModelConfig = () => ifrsConfig.pdModel;
export const getLgdModelConfig = () => ifrsConfig.lgdModel;
export const getEadModelConfig = () => ifrsConfig.eadModel;
export const getStageClassificationConfig = () => ifrsConfig.stageClassification;
export const getForwardLookingConfig = () => ifrsConfig.forwardLooking;
export const getPerformanceConfig = () => ifrsConfig.performance;
export const getDataQualityConfig = () => ifrsConfig.dataQuality;
export const getAuditConfig = () => ifrsConfig.audit;

// Export types
export type { IfrsConfig };
EOF

    log_success "IFRS 9 main configuration generated"
}

# Generate model parameter mappings
generate_model_mappings() {
    log_info "Generating IFRS 9 model parameter mappings..."
    
    cat > "${CONFIG_DIR}/model-mappings.ts" << 'EOF'
// packages/backend/src/config/ifrs9/model-mappings.ts

// Rating to PD mappings (Basel-like approach)
export const RATING_PD_MAPPING = {
  // Investment Grade
  'AAA': 0.001,
  'AA+': 0.002,
  'AA': 0.003,
  'AA-': 0.005,
  'A+': 0.008,
  'A': 0.012,
  'A-': 0.018,
  'BBB+': 0.025,
  'BBB': 0.035,
  'BBB-': 0.050,
  
  // Sub-investment Grade
  'BB+': 0.075,
  'BB': 0.100,
  'BB-': 0.150,
  'B+': 0.200,
  'B': 0.300,
  'B-': 0.450,
  'CCC+': 0.600,
  'CCC': 0.750,
  'CCC-': 0.900,
  'CC': 0.950,
  'C': 0.990,
  'D': 1.000,
  
  // Default fallback
  'NR': 0.05, // Not Rated
  'DEFAULT': 0.05
} as const;

// Product type to LGD mappings
export const PRODUCT_LGD_MAPPING = {
  // Secured products (lower LGD)
  'mortgage': 0.35,
  'home_financing': 0.35,
  'auto_loan': 0.55,
  'vehicle_financing': 0.55,
  'asset_backed_loan': 0.40,
  'secured_loan': 0.40,
  
  // Unsecured products (higher LGD)
  'personal_loan': 0.75,
  'credit_card': 0.85,
  'unsecured_loan': 0.70,
  'overdraft': 0.80,
  
  // Islamic banking products
  'murabaha': 0.30,        // Asset-backed
  'musharaka': 0.40,       // Partnership
  'mudharaba': 0.60,       // Investment
  'ijara': 0.35,           // Leasing
  'salam': 0.50,           // Forward sale
  'istisna': 0.45,         // Manufacturing
  
  // Business products
  'working_capital': 0.60,
  'term_loan': 0.55,
  'trade_finance': 0.50,
  'revolving_credit': 0.65,
  
  // Default
  'default': 0.45
} as const;

// Collateral type adjustments for LGD
export const COLLATERAL_LGD_ADJUSTMENT = {
  'real_estate': 0.7,      // 30% reduction in LGD
  'property': 0.7,
  'residential': 0.75,
  'commercial': 0.8,
  
  'vehicle': 0.9,          // 10% reduction
  'auto': 0.9,
  'machinery': 0.85,
  
  'cash': 0.1,             // 90% reduction
  'deposit': 0.1,
  'government_securities': 0.15,
  
  'inventory': 0.95,       // 5% reduction
  'receivables': 0.9,
  
  'none': 1.0,             // No reduction
  'unsecured': 1.0,
  'default': 1.0
} as const;

// Product type to CCF (Credit Conversion Factor) mappings for EAD
export const PRODUCT_CCF_MAPPING = {
  // Term loans (fully drawn)
  'term_loan': 0.0,
  'mortgage': 0.0,
  'auto_loan': 0.0,
  'personal_loan': 0.0,
  
  // Islamic term products
  'murabaha': 0.0,
  'ijara': 0.0,
  'istisna': 0.0,
  
  // Revolving facilities
  'credit_card': 0.75,
  'line_of_credit': 0.50,
  'revolving_credit': 0.75,
  'overdraft': 0.75,
  
  // Trade finance
  'letter_of_credit': 0.50,
  'bank_guarantee': 0.50,
  'trade_finance': 0.50,
  
  // Islamic revolving products
  'musharaka_revolving': 0.50,
  'mudharaba_investment': 0.25,
  
  // Working capital
  'working_capital': 0.75,
  
  // Default
  'default': 0.75
} as const;

// Days Past Due to risk factor mappings
export const DPD_RISK_MULTIPLIER = {
  0: 1.0,        // Current
  1: 1.1,        // 1-30 DPD
  30: 1.2,       // 31-60 DPD
  60: 1.5,       // 61-90 DPD
  90: 2.0,       // 91-120 DPD
  120: 2.5,      // 121-150 DPD
  150: 3.0,      // 151-180 DPD
  180: 4.0       // 180+ DPD
} as const;

// Industry sector risk adjustments
export const INDUSTRY_RISK_ADJUSTMENT = {
  // Low risk industries
  'government': 0.8,
  'utilities': 0.9,
  'healthcare': 0.9,
  'education': 0.9,
  'telecommunications': 0.95,
  
  // Medium risk industries
  'manufacturing': 1.0,
  'retail': 1.0,
  'services': 1.0,
  'technology': 1.0,
  'financial_services': 1.0,
  
  // Higher risk industries
  'construction': 1.2,
  'real_estate': 1.2,
  'transportation': 1.1,
  'agriculture': 1.3,
  'mining': 1.4,
  'oil_gas': 1.3,
  'hospitality': 1.2,
  'aviation': 1.5,
  
  // Default
  'default': 1.0
} as const;

// Customer type risk factors
export const CUSTOMER_TYPE_RISK_FACTOR = {
  'government': 0.8,
  'multinational_corporate': 0.9,
  'large_corporate': 0.95,
  'corporate': 1.0,
  'sme': 1.1,
  'small_business': 1.2,
  'individual': 1.0,
  'high_net_worth': 0.9,
  'mass_market': 1.0,
  'default': 1.0
} as const;

// Islamic banking risk adjustments
export const SYARIAH_RISK_ADJUSTMENT = {
  // Generally lower risk due to asset backing
  'murabaha': 0.9,     // Asset-backed sale
  'ijara': 0.85,       // Leasing with asset ownership
  'salam': 0.95,       // Some delivery risk
  'istisna': 0.9,      // Manufacturing with progress payments
  'musharaka': 1.0,    // Partnership, shared risk
  'mudharaba': 1.1,    // Investment, higher risk
  'qard': 0.8,         // Benevolent loan
  'takaful': 0.9,      // Islamic insurance
  'sukuk': 0.95,       // Islamic bonds
  'default': 0.9       // Generally lower risk
} as const;

// Forward-looking adjustment factors (example for macroeconomic scenarios)
export const MACRO_ADJUSTMENT_FACTORS = {
  base_scenario: {
    gdp_growth: 1.0,
    unemployment_rate: 1.0,
    interest_rate: 1.0,
    inflation_rate: 1.0,
    currency_stability: 1.0
  },
  upside_scenario: {
    gdp_growth: 0.8,     // Better economy, lower risk
    unemployment_rate: 0.85,
    interest_rate: 0.9,
    inflation_rate: 0.95,
    currency_stability: 0.9
  },
  downside_scenario: {
    gdp_growth: 1.3,     // Worse economy, higher risk
    unemployment_rate: 1.4,
    interest_rate: 1.2,
    inflation_rate: 1.15,
    currency_stability: 1.25
  }
} as const;

// Utility functions for mapping lookups
export const getRatingPd = (rating?: string): number => {
  if (!rating) return RATING_PD_MAPPING.DEFAULT;
  const upperRating = rating.toUpperCase();
  return RATING_PD_MAPPING[upperRating as keyof typeof RATING_PD_MAPPING] || RATING_PD_MAPPING.DEFAULT;
};

export const getProductLgd = (productType?: string): number => {
  if (!productType) return PRODUCT_LGD_MAPPING.default;
  const lowerProduct = productType.toLowerCase().replace(/\s+/g, '_');
  return PRODUCT_LGD_MAPPING[lowerProduct as keyof typeof PRODUCT_LGD_MAPPING] || PRODUCT_LGD_MAPPING.default;
};

export const getCollateralAdjustment = (collateralType?: string): number => {
  if (!collateralType) return COLLATERAL_LGD_ADJUSTMENT.default;
  const lowerCollateral = collateralType.toLowerCase().replace(/\s+/g, '_');
  return COLLATERAL_LGD_ADJUSTMENT[lowerCollateral as keyof typeof COLLATERAL_LGD_ADJUSTMENT] || COLLATERAL_LGD_ADJUSTMENT.default;
};

export const getProductCcf = (productType?: string): number => {
  if (!productType) return PRODUCT_CCF_MAPPING.default;
  const lowerProduct = productType.toLowerCase().replace(/\s+/g, '_');
  return PRODUCT_CCF_MAPPING[lowerProduct as keyof typeof PRODUCT_CCF_MAPPING] || PRODUCT_CCF_MAPPING.default;
};

export const getDpdRiskMultiplier = (daysPastDue: number): number => {
  const dpdBrackets = Object.keys(DPD_RISK_MULTIPLIER).map(Number).sort((a, b) => a - b);
  
  for (let i = dpdBrackets.length - 1; i >= 0; i--) {
    if (daysPastDue >= dpdBrackets[i]) {
      return DPD_RISK_MULTIPLIER[dpdBrackets[i] as keyof typeof DPD_RISK_MULTIPLIER];
    }
  }
  
  return DPD_RISK_MULTIPLIER[0];
};

export const getIndustryRiskAdjustment = (industrySector?: string): number => {
  if (!industrySector) return INDUSTRY_RISK_ADJUSTMENT.default;
  const lowerIndustry = industrySector.toLowerCase().replace(/\s+/g, '_');
  return INDUSTRY_RISK_ADJUSTMENT[lowerIndustry as keyof typeof INDUSTRY_RISK_ADJUSTMENT] || INDUSTRY_RISK_ADJUSTMENT.default;
};

export const getCustomerTypeRiskFactor = (customerType?: string): number => {
  if (!customerType) return CUSTOMER_TYPE_RISK_FACTOR.default;
  const lowerCustomerType = customerType.toLowerCase().replace(/\s+/g, '_');
  return CUSTOMER_TYPE_RISK_FACTOR[lowerCustomerType as keyof typeof CUSTOMER_TYPE_RISK_FACTOR] || CUSTOMER_TYPE_RISK_FACTOR.default;
};

export const getSyariahRiskAdjustment = (contractType?: string): number => {
  if (!contractType) return SYARIAH_RISK_ADJUSTMENT.default;
  const lowerContract = contractType.toLowerCase().replace(/\s+/g, '_');
  return SYARIAH_RISK_ADJUSTMENT[lowerContract as keyof typeof SYARIAH_RISK_ADJUSTMENT] || SYARIAH_RISK_ADJUSTMENT.default;
};
EOF

    log_success "IFRS 9 model parameter mappings generated"
}

# Generate environment template
generate_env_template() {
    log_info "Generating IFRS 9 environment template..."
    
    cat > "${PROJECT_ROOT}/.env.ifrs9.template" << 'EOF'
# IFRS 9 Configuration Template
# Copy this to your .env.development or .env.production file

# ===== IFRS 9 GENERAL SETTINGS =====
IFRS9_ENABLED=true
IFRS9_CALCULATION_FREQUENCY=monthly

# ===== R ANALYTICS SERVICE =====
R_ANALYTICS_URL=http://localhost:8001
R_ANALYTICS_TIMEOUT_SECONDS=300
R_ANALYTICS_RETRIES=3
R_MAX_MEMORY_MB=2048
R_SERVICE_PORT=8001
R_SERVICE_HOST=0.0.0.0

# ===== IFRS 9 MODEL METHODS =====
IFRS9_PD_METHOD=historical
IFRS9_LGD_METHOD=historical
IFRS9_EAD_METHOD=current

# ===== FORWARD-LOOKING ADJUSTMENTS =====
IFRS9_FORWARD_LOOKING_ENABLED=false
IFRS9_BASE_SCENARIO_WEIGHT=0.5
IFRS9_UPSIDE_SCENARIO_WEIGHT=0.2
IFRS9_DOWNSIDE_SCENARIO_WEIGHT=0.3

# ===== PERFORMANCE SETTINGS =====
IFRS9_BATCH_SIZE=1000
IFRS9_MAX_CONCURRENT_JOBS=3
IFRS9_TIMEOUT_MINUTES=30

# ===== STAGE CLASSIFICATION THRESHOLDS =====
IFRS9_STAGE2_PD_THRESHOLD=0.10
IFRS9_STAGE2_DPD_THRESHOLD=30
IFRS9_STAGE3_DPD_THRESHOLD=90
IFRS9_SIGNIFICANT_INCREASE_FACTOR=2.0

# ===== DATA QUALITY SETTINGS =====
IFRS9_VALIDATION_ENABLED=true
IFRS9_REQUIRE_RATING=false
IFRS9_REQUIRE_COLLATERAL=false
IFRS9_MAX_MISSING_DATA_PERCENT=10
IFRS9_AUTO_CORRECT_DATA=false

# ===== AUDIT AND COMPLIANCE =====
IFRS9_AUDIT_ENABLED=true
IFRS9_AUDIT_RETENTION_DAYS=365
IFRS9_AUDIT_LOG_LEVEL=info
IFRS9_TRACK_MODEL_CHANGES=true
IFRS9_REQUIRE_APPROVAL=false

# ===== MODEL PARAMETERS =====
# PD Model
IFRS9_MIN_PD=0.0001
IFRS9_MAX_PD=1.0
IFRS9_DEFAULT_PD=0.05
IFRS9_RATING_OVERRIDE=true
IFRS9_DPD_ADJUSTMENT=true
IFRS9_AGE_ADJUSTMENT=true

# LGD Model
IFRS9_MIN_LGD=0.01
IFRS9_MAX_LGD=1.0
IFRS9_DEFAULT_LGD=0.45
IFRS9_COLLATERAL_ADJUSTMENT=true
IFRS9_SYARIAH_ADJUSTMENT=true
IFRS9_PRODUCT_TYPE_ADJUSTMENT=true

# EAD Model
IFRS9_DEFAULT_CCF=0.75
IFRS9_MAX_CCF=1.0
IFRS9_STRESSED_CCF_MULTIPLIER=1.5

# ===== FILE PATHS =====
R_SCRIPTS_PATH=/app/packages/r-analytics/scripts
R_MODELS_PATH=/app/packages/r-analytics/models
R_DATA_PATH=/app/packages/r-analytics/data
IFRS9_UPLOAD_PATH=/var/uploads/ifrs9
IFRS9_TEMP_PATH=/tmp/ifrs9

# ===== LOGGING =====
IFRS9_LOG_LEVEL=info
IFRS9_LOG_FILE=/var/log/ifrspro/ifrs9.log
IFRS9_LOG_MAX_SIZE=100MB
IFRS9_LOG_MAX_FILES=10

# ===== DEVELOPMENT SETTINGS =====
# Set to true for development mode with additional debugging
IFRS9_DEBUG_MODE=false
IFRS9_VERBOSE_LOGGING=false
IFRS9_DEVELOPMENT_OVERRIDES=false

# ===== PRODUCTION SETTINGS =====
# Set to true for production mode with performance optimizations
IFRS9_PRODUCTION_MODE=false
IFRS9_CACHE_ENABLED=true
IFRS9_CACHE_TTL_SECONDS=3600

# ===== INTEGRATION SETTINGS =====
# External system integration
IFRS9_EXTERNAL_API_ENABLED=false
IFRS9_EXTERNAL_API_URL=
IFRS9_EXTERNAL_API_KEY=
IFRS9_EXTERNAL_API_TIMEOUT=30000

# Email notifications for calculation completion
IFRS9_EMAIL_NOTIFICATIONS=false
IFRS9_NOTIFICATION_EMAIL=admin@company.com
IFRS9_SMTP_HOST=
IFRS9_SMTP_PORT=587
IFRS9_SMTP_USER=
IFRS9_SMTP_PASSWORD=
EOF

    log_success "IFRS 9 environment template generated"
}

# Generate validation utilities
generate_validation_utils() {
    log_info "Generating IFRS 9 validation utilities..."
    
    cat > "${CONFIG_DIR}/validation.ts" << 'EOF'
// packages/backend/src/config/ifrs9/validation.ts
import { z } from 'zod';
import Decimal from 'decimal.js';

// Portfolio Account validation schema for IFRS 9
export const PortfolioAccountIfrs9Schema = z.object({
  accountId: z.string().min(1).max(50),
  customerId: z.string().min(1).max(50),
  productType: z.string().min(1).max(100),
  outstandingAmount: z.number().positive('Outstanding amount must be positive'),
  committedAmount: z.number().nonnegative('Committed amount cannot be negative'),
  currencyCode: z.string().length(3, 'Currency code must be 3 characters'),
  originationDate: z.coerce.date(),
  maturityDate: z.coerce.date(),
  reportingDate: z.coerce.date(),
  currentStage: z.number().int().min(1).max(3, 'Stage must be 1, 2, or 3'),
  customerName: z.string().min(1).max(200),
  customerType: z.string().min(1).max(50),
  industrySector: z.string().max(100).optional(),
  internalRating: z.string().max(10).optional(),
  externalRating: z.string().max(10).optional(),
  isSyariahCompliant: z.boolean(),
  syariahContractType: z.string().max(50).optional(),
  accountStatus: z.enum(['active', 'closed', 'suspended', 'default']),
  isActive: z.boolean()
}).refine(data => {
  // Maturity date must be after origination date
  return data.maturityDate > data.originationDate;
}, {
  message: "Maturity date must be after origination date",
  path: ["maturityDate"]
}).refine(data => {
  // Committed amount should be >= outstanding amount
  return data.committedAmount >= data.outstandingAmount;
}, {
  message: "Committed amount should be greater than or equal to outstanding amount",
  path: ["committedAmount"]
});

// ECL calculation input validation
export const EclCalculationInputSchema = z.object({
  accountIds: z.array(z.string()).optional(),
  calculationDate: z.coerce.date(),
  parameters: z.object({
    pd12mMethod: z.enum(['historical', 'logistic', 'market']).optional(),
    lgdMethod: z.enum(['historical', 'beta', 'workout']).optional(),
    eadMethod: z.enum(['current', 'stressed', 'regulatory']).optional(),
    forwardLookingAdjustment: z.boolean().optional(),
    scenarioWeights: z.object({
      base: z.number().min(0).max(1),
      upside: z.number().min(0).max(1),
      downside: z.number().min(0).max(1)
    }).refine(weights => {
      const sum = new Decimal(weights.base).plus(weights.upside).plus(weights.downside);
      return sum.equals(1);
    }, {
      message: "Scenario weights must sum to 1.0"
    }).optional()
  }).optional()
});

// Data quality validation functions
export class IfrsDataValidator {
  
  /**
   * Validate portfolio account data for IFRS 9 calculation
   */
  static validatePortfolioAccount(account: any): { isValid: boolean; errors: string[] } {
    try {
      PortfolioAccountIfrs9Schema.parse(account);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Validate ECL calculation input parameters
   */
  static validateEclCalculationInput(input: any): { isValid: boolean; errors: string[] } {
    try {
      EclCalculationInputSchema.parse(input);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Check data completeness for IFRS 9 calculation
   */
  static checkDataCompleteness(accounts: any[]): {
    totalAccounts: number;
    missingRating: number;
    missingCollateral: number;
    missingIndustry: number;
    zeroOutstanding: number;
    invalidDates: number;
    completenessScore: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let missingRating = 0;
    let missingCollateral = 0;
    let missingIndustry = 0;
    let zeroOutstanding = 0;
    let invalidDates = 0;

    accounts.forEach(account => {
      if (!account.internalRating && !account.externalRating) {
        missingRating++;
      }
      
      if (!account.collateralValue && !account.collateralType) {
        missingCollateral++;
      }
      
      if (!account.industrySector) {
        missingIndustry++;
      }
      
      if (account.outstandingAmount <= 0) {
        zeroOutstanding++;
      }
      
      if (!account.originationDate || !account.maturityDate || 
          new Date(account.maturityDate) <= new Date(account.originationDate)) {
        invalidDates++;
      }
    });

    // Calculate completeness score (0-100)
    const totalIssues = missingRating + missingCollateral + missingIndustry + zeroOutstanding + invalidDates;
    const completenessScore = Math.max(0, 100 - (totalIssues / accounts.length * 100));

    // Generate issues summary
    if (missingRating > 0) {
      issues.push(`${missingRating} accounts missing credit ratings`);
    }
    if (missingCollateral > 0) {
      issues.push(`${missingCollateral} accounts missing collateral information`);
    }
    if (missingIndustry > 0) {
      issues.push(`${missingIndustry} accounts missing industry sector`);
    }
    if (zeroOutstanding > 0) {
      issues.push(`${zeroOutstanding} accounts with zero or negative outstanding amount`);
    }
    if (invalidDates > 0) {
      issues.push(`${invalidDates} accounts with invalid date ranges`);
    }

    return {
      totalAccounts: accounts.length,
      missingRating,
      missingCollateral,
      missingIndustry,
      zeroOutstanding,
      invalidDates,
      completenessScore: Math.round(completenessScore * 100) / 100,
      issues
    };
  }

  /**
   * Validate calculated risk parameters
   */
  static validateRiskParameters(results: any[]): {
    validResults: number;
    invalidPd: number;
    invalidLgd: number;
    invalidEad: number;
    extremePd: number;
    extremeLgd: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let validResults = 0;
    let invalidPd = 0;
    let invalidLgd = 0;
    let invalidEad = 0;
    let extremePd = 0;
    let extremeLgd = 0;

    results.forEach(result => {
      let isValid = true;

      // Validate PD
      if (typeof result.pd12m !== 'number' || result.pd12m < 0 || result.pd12m > 1) {
        invalidPd++;
        isValid = false;
      } else if (result.pd12m > 0.5) {
        extremePd++;
      }

      // Validate LGD
      if (typeof result.lgd !== 'number' || result.lgd < 0 || result.lgd > 1) {
        invalidLgd++;
        isValid = false;
      } else if (result.lgd > 0.9) {
        extremeLgd++;
      }

      // Validate EAD
      if (typeof result.ead !== 'number' || result.ead <= 0) {
        invalidEad++;
        isValid = false;
      }

      if (isValid) {
        validResults++;
      }
    });

    // Generate issues
    if (invalidPd > 0) {
      issues.push(`${invalidPd} accounts with invalid PD values (must be 0-1)`);
    }
    if (invalidLgd > 0) {
      issues.push(`${invalidLgd} accounts with invalid LGD values (must be 0-1)`);
    }
    if (invalidEad > 0) {
      issues.push(`${invalidEad} accounts with invalid EAD values (must be positive)`);
    }
    if (extremePd > 0) {
      issues.push(`${extremePd} accounts with extremely high PD (>50%)`);
    }
    if (extremeLgd > 0) {
      issues.push(`${extremeLgd} accounts with extremely high LGD (>90%)`);
    }

    return {
      validResults,
      invalidPd,
      invalidLgd,
      invalidEad,
      extremePd,
      extremeLgd,
      issues
    };
  }
}

// Export validation schemas
export {
  PortfolioAccountIfrs9Schema,
  EclCalculationInputSchema
};
EOF

    log_success "IFRS 9 validation utilities generated"
}

# Main function
main() {
    log_info "Starting IFRS 9 configuration files generation..."
    
    # Create directories
    mkdir -p "${CONFIG_DIR}"
    
    # Generate configuration files
    generate_ifrs9_config
    generate_model_mappings
    generate_env_template
    generate_validation_utils
    
    log_success "IFRS 9 configuration files generation completed successfully!"
}

# Execute main function
main "$@"