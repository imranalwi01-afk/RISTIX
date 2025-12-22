// packages/backend/src/core/application/usecases/loan/ILoanManagementUseCase.ts

import { Money } from '../../../domain/shared/value-objects/Money';
import { Stage } from '../../../domain/shared/value-objects/Stage';
import { DateRange } from '../../../domain/shared/value-objects/DateRange';
import { Loan } from '../../../domain/ifrs9/entities/Loan';

/**
 * Use Case interface for Loan Management
 * Defines the contract for loan-related business operations
 */

export interface ILoanManagementUseCase {
  /**
   * Create a new loan
   */
  createLoan(request: {
    customerId: string;
    productId: string;
    accountNumber: string;
    originalBalance: Money;
    currency: string;
    originationDate: Date;
    maturityDate?: Date;
    interestRate: number;
    productType: string;
    bankingType?: 'conventional' | 'syariah';
    syariahContractType?: string;
    collateralValue?: Money;
    riskGrade?: string;
    segment?: string;
    requestedBy: string;
  }): Promise<{
    loan: Loan;
    success: boolean;
    message: string;
  }>;

  /**
   * Update loan information
   */
  updateLoan(request: {
    loanId: string;
    updates: {
      outstandingBalance?: Money;
      maturityDate?: Date;
      interestRate?: number;
      collateralValue?: Money;
      riskGrade?: string;
      segment?: string;
      isActive?: boolean;
    };
    updatedBy: string;
  }): Promise<{
    loan: Loan;
    success: boolean;
    message: string;
  }>;

  /**
   * Assess and update loan stage
   */
  assessLoanStage(request: {
    loanId: string;
    assessmentOptions?: {
      daysPastDue?: number;
      creditQualityIndicators?: string[];
      collateralCoverage?: number;
    };
    assessedBy: string;
  }): Promise<{
    loan: Loan;
    assessmentResult: {
      newStage: Stage;
      previousStage: Stage;
      stageChanged: boolean;
      reason: string;
      riskFactors: string[];
    };
    success: boolean;
    message: string;
  }>;

  /**
   * Bulk stage assessment for multiple loans
   */
  bulkAssessLoanStages(request: {
    loanIds: string[];
    assessmentOptions?: {
      daysPastDue?: number;
      creditQualityIndicators?: string[];
      collateralCoverage?: number;
    };
    assessedBy: string;
  }): Promise<{
    results: Array<{
      loanId: string;
      success: boolean;
      loan?: Loan;
      assessmentResult?: any;
      error?: string;
    }>;
    summary: {
      totalProcessed: number;
      successful: number;
      failed: number;
      stageChanges: number;
    };
  }>;

  /**
   * Calculate ECL for a loan
   */
  calculateLoanECL(request: {
    loanId: string;
    calculationDate?: Date;
    scenario?: 'baseline' | 'adverse' | 'severe';
    useLifetimeECL?: boolean;
    calculatedBy: string;
  }): Promise<{
    calculationId: string;
    twelveMonthECL: Money;
    lifetimeECL: Money;
    stage: Stage;
    calculationDetails: any;
    success: boolean;
    message: string;
  }>;

  /**
   * Get loan details
   */
  getLoanDetails(request: {
    loanId: string;
    includeECLHistory?: boolean;
    includeStageHistory?: boolean;
  }): Promise<{
    loan: Loan;
    eclHistory?: Array<{
      calculationDate: Date;
      eclAmount: Money;
      stage: Stage;
      methodology: string;
    }>;
    stageHistory?: Array<{
      changeDate: Date;
      previousStage: Stage;
      newStage: Stage;
      reason: string;
      changedBy: string;
    }>;
    success: boolean;
    message: string;
  }>;

  /**
   * Search loans
   */
  searchLoans(request: {
    criteria: {
      customerId?: string;
      productType?: string;
      stage?: Stage;
      isActive?: boolean;
      isImpaired?: boolean;
      dateRange?: {
        field: 'originationDate' | 'maturityDate';
        startDate: Date;
        endDate: Date;
      };
      balanceRange?: {
        min?: number;
        max?: number;
      };
    };
    pagination?: {
      page: number;
      limit: number;
    };
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<{
    loans: Array<{
      loan: Loan;
      currentECL?: Money;
      daysPastDue?: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    success: boolean;
    message: string;
  }>;

  /**
   * Get loan portfolio summary
   */
  getLoanPortfolioSummary(request: {
    filters?: {
      customerId?: string;
      productType?: string;
      stage?: Stage;
      dateRange?: {
        startDate: Date;
        endDate: Date;
      };
    };
    groupBy?: 'stage' | 'productType' | 'riskGrade' | 'customer';
  }): Promise<{
    summary: {
      totalLoans: number;
      totalOutstanding: Money;
      totalECL: Money;
      coverageRatio: number;
      averagePD: number;
      averageLGD: number;
    };
    breakdowns?: Record<string, {
      count: number;
      outstanding: Money;
      ecl: Money;
      percentage: number;
    }>;
    trends?: Array<{
      period: string;
      outstanding: Money;
      ecl: Money;
      newLoans: number;
      closedLoans: number;
    }>;
    success: boolean;
    message: string;
  }>;

  /**
   * Deactivate a loan
   */
  deactivateLoan(request: {
    loanId: string;
    reason: string;
    deactivatedBy: string;
  }): Promise<{
    loan: Loan;
    success: boolean;
    message: string;
  }>;

  /**
   * Reactivate a loan
   */
  reactivateLoan(request: {
    loanId: string;
    reason: string;
    reactivatedBy: string;
  }): Promise<{
    loan: Loan;
    success: boolean;
    message: string;
  }>;

  /**
   * Validate loan data
   */
  validateLoanData(request: {
    loanData: any;
    validationType: 'create' | 'update' | 'stage_assessment';
  }): Promise<{
    isValid: boolean;
    errors: Array<{
      field: string;
      message: string;
      code: string;
    }>;
    warnings?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  }>;

  /**
   * Get loan stage transition history
   */
  getLoanStageHistory(request: {
    loanId: string;
    dateRange?: DateRange;
  }): Promise<{
    history: Array<{
      changeDate: Date;
      previousStage: Stage;
      newStage: Stage;
      reason: string;
      changedBy: string;
      assessmentFactors?: string[];
    }>;
    summary: {
      totalTransitions: number;
      currentStage: Stage;
      timeInCurrentStage: number;
      averageTimePerStage: Record<string, number>;
    };
    success: boolean;
    message: string;
  }>;
}