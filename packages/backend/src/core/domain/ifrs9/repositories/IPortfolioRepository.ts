// packages/backend/src/core/domain/ifrs9/repositories/IPortfolioRepository.ts

import { Portfolio, PortfolioProps } from '../entities/Portfolio';
import { Money } from '../../shared/value-objects/Money';
import { DateRange } from '../../shared/value-objects/DateRange';

/**
 * Repository interface for Portfolio aggregate
 * Defines the contract for portfolio persistence and retrieval operations
 */

export interface IPortfolioRepository {
  /**
   * Save a portfolio entity
   */
  save(portfolio: Portfolio): Promise<void>;

  /**
   * Find portfolio by ID
   */
  findById(id: string): Promise<Portfolio | null>;

  /**
   * Find portfolio by code
   */
  findByCode(portfolioCode: string): Promise<Portfolio | null>;

  /**
   * Find portfolios by manager
   */
  findByManager(managerId: string): Promise<Portfolio[]>;

  /**
   * Find portfolios by type
   */
  findByType(portfolioType: string): Promise<Portfolio[]>;

  /**
   * Find portfolios by currency
   */
  findByCurrency(currency: string): Promise<Portfolio[]>;

  /**
   * Find active portfolios
   */
  findActivePortfolios(): Promise<Portfolio[]>;

  /**
   * Find portfolios requiring rebalancing
   */
  findPortfoliosRequiringRebalancing(): Promise<Portfolio[]>;

  /**
   * Find portfolios by risk rating
   */
  findByRiskRating(rating: string): Promise<Portfolio[]>;

  /**
   * Find portfolios by compliance status
   */
  findByComplianceStatus(status: 'pending' | 'in_progress' | 'completed' | 'failed'): Promise<Portfolio[]>;

  /**
   * Find portfolios by date range
   */
  findByReportingDateRange(startDate: Date, endDate: Date): Promise<Portfolio[]>;

  /**
   * Find portfolios by multiple criteria
   */
  findByCriteria(criteria: {
    portfolioType?: string;
    managerId?: string;
    currency?: string;
    isActive?: boolean;
    ifrs9Compliant?: boolean;
    riskRating?: string;
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
    limit?: number;
    offset?: number;
  }): Promise<{
    portfolios: Portfolio[];
    total: number;
  }>;

  /**
   * Update portfolio summary
   */
  updateSummary(portfolioId: string, summary: {
    totalFacilities: number;
    totalOutstanding: Money;
    totalEAD: Money;
    totalECL: Money;
    stage1Count: number;
    stage1Outstanding: Money;
    stage1ECL: Money;
    stage2Count: number;
    stage2Outstanding: Money;
    stage2ECL: Money;
    stage3Count: number;
    stage3Outstanding: Money;
    stage3ECL: Money;
    coverageRatio: number;
    averagePD: number;
    averageLGD: number;
  }): Promise<void>;

  /**
   * Update portfolio risk metrics
   */
  updateRiskMetrics(portfolioId: string, riskMetrics: {
    valueAtRisk: Money;
    expectedLoss: Money;
    unexpectedLoss: Money;
    economicCapital: Money;
    riskWeightedAssets: Money;
    riskContribution: number;
    concentrationRisk: {
      industryConcentration: number;
      geographicConcentration: number;
      borrowerConcentration: number;
      productConcentration: number;
    };
  }): Promise<void>;

  /**
   * Update portfolio compliance status
   */
  updateComplianceStatus(portfolioId: string, compliance: {
    ifrs9Compliant: boolean;
    lastValidationDate: Date;
    validationErrors: string[];
    auditStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  }): Promise<void>;

  /**
   * Update portfolio methodology
   */
  updateMethodology(portfolioId: string, methodology: {
    eclModel: string;
    pdModel: string;
    lgdModel: string;
    eadModel: string;
    stagingModel: string;
    macroeconomicScenarios: string[];
    version: string;
    assumptions: Record<string, any>;
  }): Promise<void>;

  /**
   * Get portfolio statistics
   */
  getStatistics(filters?: {
    portfolioType?: string;
    managerId?: string;
    currency?: string;
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
  }): Promise<{
    totalPortfolios: number;
    totalOutstanding: number;
    totalEAD: number;
    totalECL: number;
    averageCoverageRatio: number;
    riskDistribution: Record<string, number>;
    ifrs9ComplianceRate: number;
    averageRiskRating: string;
  }>;

  /**
   * Get portfolio performance metrics
   */
  getPerformanceMetrics(portfolioId: string, period: DateRange): Promise<{
    monthlyData: Array<{
      month: string;
      outstanding: number;
      ecl: number;
      coverageRatio: number;
      newFacilities: number;
      facilitiesClosed: number;
      stageTransitions: {
        toStage2: number;
        toStage3: number;
        fromStage3: number;
      };
    }>;
    keyMetrics: {
      totalReturn: number;
      returnOnAssets: number;
      returnOnEquity: number;
      netInterestMargin: number;
      efficiencyRatio: number;
      riskAdjustedReturn: number;
    };
  }>;

  /**
   * Get portfolio risk analytics
   */
  getRiskAnalytics(portfolioId: string): Promise<{
    currentRiskProfile: {
      valueAtRisk: number;
      expectedLoss: number;
      unexpectedLoss: number;
      economicCapital: number;
      riskWeightedAssets: number;
    };
    riskTrends: Array<{
      period: string;
      var: number;
      expectedLoss: number;
      economicCapital: number;
    }>;
    concentrationAnalysis: {
      topIndustries: Array<{
        industry: string;
        exposure: number;
        percentage: number;
      }>;
      topGeographies: Array<{
        geography: string;
        exposure: number;
        percentage: number;
      }>;
      topBorrowers: Array<{
        borrowerName: string;
        exposure: number;
        percentage: number;
      }>;
    };
    stressTestResults: Array<{
      scenario: string;
      impact: number;
      newECL: number;
      capitalRequirement: number;
    }>;
  }>;

  /**
   * Get portfolio IFRS9 compliance report
   */
  getIFRS9ComplianceReport(portfolioId: string): Promise<{
    overallCompliance: boolean;
    complianceScore: number;
    detailedResults: {
      methodologyCompliance: {
        eclModel: boolean;
        pdModel: boolean;
        lgdModel: boolean;
        eadModel: boolean;
        stagingModel: boolean;
      };
      operationalCompliance: {
        coverageRatioAdequate: boolean;
        provisioningTimely: boolean;
        dataQuality: boolean;
        documentationComplete: boolean;
      };
      regulatoryCompliance: {
        validationPassed: boolean;
        auditCompleted: boolean;
        reportingAccurate: boolean;
      };
    };
    recommendations: string[];
    actionItems: Array<{
      priority: 'high' | 'medium' | 'low';
      description: string;
      dueDate: Date;
      assignee?: string;
    }>;
  }>;

  /**
   * Search portfolios by name or code
   */
  search(searchTerm: string, limit?: number): Promise<Portfolio[]>;

  /**
   * Check if portfolio exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if portfolio code exists
   */
  existsByCode(portfolioCode: string): Promise<boolean>;

  /**
   * Get portfolio hierarchy (if applicable)
   */
  getPortfolioHierarchy(portfolioId: string): Promise<{
    parentPortfolio?: Portfolio;
    childPortfolios: Portfolio[];
    totalCombinedExposure: number;
    totalCombinedECL: number;
  }>;

  /**
   * Count portfolios by criteria
   */
  count(criteria?: {
    portfolioType?: string;
    managerId?: string;
    currency?: string;
    isActive?: boolean;
    ifrs9Compliant?: boolean;
  }): Promise<number>;

  /**
   * Get portfolios with upcoming valuations
   */
  getPortfoliosWithUpcomingValuations(daysAhead: number): Promise<Portfolio[]>;

  /**
   * Get portfolios with overdue compliance checks
   */
  getPortfoliosWithOverdueComplianceChecks(): Promise<Portfolio[]>;

  /**
   * Bulk update portfolio statuses
   */
  bulkUpdateStatuses(updates: Array<{
    portfolioId: string;
    isActive: boolean;
  }>): Promise<void>;
}