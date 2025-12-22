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
