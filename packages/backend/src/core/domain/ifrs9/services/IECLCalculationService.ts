// packages/backend/src/core/domain/ifrs9/services/IECLCalculationService.ts

import { Money } from '../../shared/value-objects/Money';
import { Stage } from '../../shared/value-objects/Stage';
import { ECLCalculation } from '../entities/ECLCalculation';
import { Loan } from '../entities/Loan';

/**
 * Service interface for ECL (Expected Credit Loss) calculations
 * Defines the contract for ECL calculation operations
 */

export interface IECLCalculationService {
  /**
   * Calculate ECL for a single loan
   */
  calculateECLForLoan(loan: Loan, options?: {
    calculationDate?: Date;
    scenario?: 'baseline' | 'adverse' | 'severe';
    useLifetimeECL?: boolean;
    macroeconomicAdjustments?: Record<string, number>;
  }): Promise<{
    twelveMonthECL: Money;
    lifetimeECL: Money;
    stage: Stage;
    calculationDetails: {
      pdRate: number;
      lgdRate: number;
      eadAmount: Money;
      discountFactor: number;
      macroeconomicAdjustment: number;
      qualitativeAdjustment: number;
    };
  }>;

  /**
   * Calculate ECL for a portfolio
   */
  calculateECLForPortfolio(portfolioId: string, options?: {
    calculationDate?: Date;
    scenario?: 'baseline' | 'adverse' | 'severe';
    includeFacilityDetails?: boolean;
    useParallelProcessing?: boolean;
  }): Promise<{
    portfolioECL: Money;
    stageBreakdown: {
      stage1: {
        count: number;
        outstanding: Money;
        ecl: Money;
      };
      stage2: {
        count: number;
        outstanding: Money;
        ecl: Money;
      };
      stage3: {
        count: number;
        outstanding: Money;
        ecl: Money;
      };
    };
    riskMetrics: {
      weightedAveragePD: number;
      weightedAverageLGD: number;
      coverageRatio: number;
      concentrationAdjustment: number;
    };
    calculationResults: ECLCalculation[];
  }>;

  /**
   * Run multiple scenario analysis
   */
  runScenarioAnalysis(loanIds: string[], scenarios: Array<{
    name: string;
    pdAdjustment: number;
    lgdAdjustment: number;
    macroeconomicFactors: Record<string, number>;
  }>): Promise<Array<{
    scenarioName: string;
    totalECL: Money;
    impact: Money;
    impactPercentage: number;
    facilityResults: Array<{
      loanId: string;
      ecl: Money;
      stage: Stage;
    }>;
  }>>;

  /**
   * Calculate ECL for staging analysis
   */
  calculateECLForStagingAnalysis(loanIds: string[]): Promise<{
    currentStageECL: Money;
    projectedStageECL: Array<{
      stage: Stage;
      ecl: Money;
      facilityCount: number;
      transitionImpact: Money;
    }>;
    stagingRecommendations: Array<{
      loanId: string;
      currentStage: Stage;
      recommendedStage: Stage;
      reason: string;
      eclImpact: Money;
    }>;
  }>;

  /**
   * Validate ECL calculation methodology
   */
  validateMethodology(calculationId: string): Promise<{
    isValid: boolean;
    validationResults: {
      modelValidation: boolean;
      dataQuality: boolean;
      assumptionValidation: boolean;
      complianceCheck: boolean;
    };
    issues: Array<{
      severity: 'error' | 'warning' | 'info';
      category: 'model' | 'data' | 'assumption' | 'compliance';
      description: string;
      recommendation?: string;
    }>;
  }>;

  /**
   * Get ECL calculation history
   */
  getCalculationHistory(criteria: {
    loanId?: string;
    portfolioId?: string;
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
    status?: 'pending' | 'running' | 'completed' | 'failed';
    limit?: number;
  }): Promise<Array<{
    id: string;
    calculationDate: Date;
    status: string;
    totalECL: Money;
    executionTime: number;
    methodology: string;
    scenario: string;
  }>>;

  /**
   * Estimate ECL calculation parameters
   */
  estimateParameters(loanIds: string[]): Promise<{
    estimatedExecutionTime: number;
    estimatedMemoryUsage: number;
    recommendedBatchSize: number;
    resourceRequirements: {
      cpuCores: number;
      memory: string;
      diskSpace: string;
    };
  }>;

  /**
   * Export ECL calculation results
   */
  exportResults(calculationId: string, format: 'json' | 'csv' | 'xlsx' | 'pdf'): Promise<{
    data: Buffer | string;
    filename: string;
    mimeType: string;
  }>;

  /**
   * Compare ECL calculations
   */
  compareCalculations(calculationIds: string[]): Promise<{
    comparison: Array<{
      calculationId: string;
      calculationDate: Date;
      totalECL: Money;
      methodology: string;
      scenario: string;
    }>;
    variance: {
      absoluteVariance: Money;
      percentageVariance: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    };
    drivers: Array<{
      factor: string;
      impact: number;
      contribution: number;
    }>;
  }>;

  /**
   * Get ECL calculation performance metrics
   */
  getPerformanceMetrics(timeRange: {
    startDate: Date;
    endDate: Date;
  }): Promise<{
    totalCalculations: number;
    averageExecutionTime: number;
    successRate: number;
    errorBreakdown: Record<string, number>;
    resourceUtilization: {
      averageCpuUsage: number;
      averageMemoryUsage: number;
      peakCpuUsage: number;
      peakMemoryUsage: number;
    };
    throughput: {
      calculationsPerHour: number;
      facilitiesPerHour: number;
    };
  }>;
}