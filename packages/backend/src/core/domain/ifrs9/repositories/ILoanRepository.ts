// packages/backend/src/core/domain/ifrs9/repositories/ILoanRepository.ts

import { Loan, LoanProps } from '../entities/Loan';
import { Stage } from '../../shared/value-objects/Stage';

/**
 * Repository interface for Loan aggregate
 * Defines the contract for loan persistence and retrieval operations
 */

export interface ILoanRepository {
  /**
   * Save a loan entity
   */
  save(loan: Loan): Promise<void>;

  /**
   * Find loan by ID
   */
  findById(id: string): Promise<Loan | null>;

  /**
   * Find loan by account number
   */
  findByAccountNumber(accountNumber: string): Promise<Loan | null>;

  /**
   * Find loans by customer ID
   */
  findByCustomerId(customerId: string): Promise<Loan[]>;

  /**
   * Find loans by stage
   */
  findByStage(stage: Stage): Promise<Loan[]>;

  /**
   * Find loans by product type
   */
  findByProductType(productType: string): Promise<Loan[]>;

  /**
   * Find loans by date range (origination)
   */
  findByOriginationDateRange(startDate: Date, endDate: Date): Promise<Loan[]>;

  /**
   * Find loans requiring stage assessment
   */
  findLoansRequiringAssessment(asOfDate?: Date): Promise<Loan[]>;

  /**
   * Find active loans
   */
  findActiveLoans(): Promise<Loan[]>;

  /**
   * Find impaired loans
   */
  findImpairedLoans(): Promise<Loan[]>;

  /**
   * Find loans by multiple criteria
   */
  findByCriteria(criteria: {
    customerId?: string;
    stage?: Stage;
    productType?: string;
    isActive?: boolean;
    isImpaired?: boolean;
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
    limit?: number;
    offset?: number;
  }): Promise<{
    loans: Loan[];
    total: number;
  }>;

  /**
   * Update loan stage
   */
  updateStage(loanId: string, newStage: Stage, reason: string): Promise<void>;

  /**
   * Update loan outstanding balance
   */
  updateOutstandingBalance(loanId: string, newBalance: number): Promise<void>;

  /**
   * Bulk update loan stages
   */
  bulkUpdateStages(updates: Array<{
    loanId: string;
    newStage: Stage;
    reason: string;
  }>): Promise<void>;

  /**
   * Get loan statistics
   */
  getStatistics(filters?: {
    customerId?: string;
    productType?: string;
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
  }): Promise<{
    totalLoans: number;
    totalOutstanding: number;
    stageDistribution: {
      stage1: number;
      stage2: number;
      stage3: number;
    };
    impairmentRatio: number;
    averagePD: number;
    averageLGD: number;
  }>;

  /**
   * Check if loan exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Delete a loan (soft delete)
   */
  delete(loanId: string): Promise<void>;

  /**
   * Count loans by criteria
   */
  count(criteria?: {
    customerId?: string;
    stage?: Stage;
    productType?: string;
    isActive?: boolean;
    isImpaired?: boolean;
  }): Promise<number>;
}