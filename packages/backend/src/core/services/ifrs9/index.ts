// packages/backend/src/core/services/ifrs9/index.ts
// ============================================================================
// IFRS9 Services Export Index
// ============================================================================
// Generated: 2025-01-12
// Purpose: Central export for all IFRS9 calculation services
// Methodology: Core Platform MVP - IFRS9 Engine Completion
// ============================================================================

export { EclCalculationService } from './ecl-calculation.service';
export { StagingAnalysisService } from './staging-analysis.service';
export { PdModelService } from './pd-model.service';
export { LgdCalculationService } from './lgd-calculation.service';
export { EadComputationService } from './ead-computation.service';
export { ResultAggregationService } from './result-aggregation.service';
export { ValidationRulesService } from './validation-rules.service';
export { CalculationAuditService } from './calculation-audit.service';
export { RAnalyticsIntegrationService } from './r-analytics-integration.service';

// Re-export types and interfaces
export type {
  EclCalculationInput,
  EclCalculationResult,
  EclCalculationSummary
} from './ecl-calculation.service';

export type {
  StagingAnalysisInput,
  StagingAnalysisResult
} from './staging-analysis.service';

export type {
  PdCalculationInput,
  PdCalculationResult,
  PdModelParameters
} from './pd-model.service';

export type {
  LgdCalculationInput,
  LgdCalculationResult
} from './lgd-calculation.service';

export type {
  EadComputationInput,
  EadComputationResult
} from './ead-computation.service';

export type {
  ResultAggregationInput,
  AggregationResult
} from './result-aggregation.service';

export type {
  ValidationInput,
  ValidationResult
} from './validation-rules.service';

// IFRS9 Service Factory
export class Ifrs9ServiceFactory {
  static createEclCalculationService(
    models: any,
    auditService: any,
    configService: any,
    logger: any
  ): EclCalculationService {
    return new EclCalculationService(
      models.EclCalculation,
      models.EclParameter,
      auditService,
      configService,
      logger
    );
  }

  static createStagingAnalysisService(
    models: any,
    configService: any,
    logger: any
  ): StagingAnalysisService {
    return new StagingAnalysisService(
      models.PortfolioAccount,
      models.StagingHistory,
      configService,
      logger
    );
  }

  static createAllServices(dependencies: {
    models: any;
    auditService: any;
    configService: any;
    logger: any;
  }) {
    const {
      models,
      auditService,
      configService,
      logger
    } = dependencies;

    return {
      eclCalculationService: this.createEclCalculationService(
        models, auditService, configService, logger
      ),
      stagingAnalysisService: this.createStagingAnalysisService(
        models, configService, logger
      ),
      pdModelService: new PdModelService(
        models.PdModel, models.PdCalculation, configService, logger
      ),
      lgdCalculationService: new LgdCalculationService(
        models.LgdModel, models.LgdCalculation, configService, logger
      ),
      eadComputationService: new EadComputationService(
        models.EadModel, models.EadCalculation, configService, logger
      ),
      resultAggregationService: new ResultAggregationService(
        models.CalculationSummary, configService, logger
      ),
      validationRulesService: new ValidationRulesService(
        models.ValidationRule, models.ValidationResult, configService, logger
      ),
      calculationAuditService: new CalculationAuditService(
        models.CalculationAuditLog, auditService, logger
      )
    };
  }
}