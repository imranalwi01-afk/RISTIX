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
