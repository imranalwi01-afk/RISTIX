// packages/backend/src/core/application/cqrs/queries/LoanQueryHandlers.ts

import { QueryHandler } from '@nestjs/cqrs';
import { IQuery } from '../interfaces/IQuery';
import { ILoanRepository } from '../../../domain/ifrs9/repositories/ILoanRepository';
import { ILoanManagementUseCase } from '../../usecases/loan/ILoanManagementUseCase';
import { Logger } from '@nestjs/common';

/**
 * Query: Get Loan Details
 */
export class GetLoanDetailsQuery implements IQuery {
  constructor(
    public readonly loanId: string,
    public readonly includeECLHistory?: boolean,
    public readonly includeStageHistory?: boolean
  ) {}
}

@QueryHandler(GetLoanDetailsQuery)
export class GetLoanDetailsHandler {
  private readonly logger = new Logger(GetLoanDetailsHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(query: GetLoanDetailsQuery): Promise<any> {
    this.logger.log(`Executing GetLoanDetailsQuery for loan: ${query.loanId}`);

    try {
      const result = await this.loanManagementUseCase.getLoanDetails({
        loanId: query.loanId,
        includeECLHistory: query.includeECLHistory,
        includeStageHistory: query.includeStageHistory
      });

      this.logger.log(`Successfully retrieved loan details: ${query.loanId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get loan details: ${query.loanId}`, error);
      throw error;
    }
  }
}

/**
 * Query: Search Loans
 */
export class SearchLoansQuery implements IQuery {
  constructor(
    public readonly criteria: {
      customerId?: string;
      productType?: string;
      stage?: number;
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
    },
    public readonly pagination?: {
      page: number;
      limit: number;
    },
    public readonly sortBy?: string,
    public readonly sortOrder?: 'asc' | 'desc'
  ) {}
}

@QueryHandler(SearchLoansQuery)
export class SearchLoansHandler {
  private readonly logger = new Logger(SearchLoansHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(query: SearchLoansQuery): Promise<any> {
    this.logger.log(`Executing SearchLoansQuery with criteria: ${JSON.stringify(query.criteria)}`);

    try {
      const result = await this.loanManagementUseCase.searchLoans({
        criteria: query.criteria,
        pagination: query.pagination,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder
      });

      this.logger.log(`Successfully searched loans: ${result.loans.length} results`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to search loans`, error);
      throw error;
    }
  }
}

/**
 * Query: Get Loan Portfolio Summary
 */
export class GetLoanPortfolioSummaryQuery implements IQuery {
  constructor(
    public readonly filters?: {
      customerId?: string;
      productType?: string;
      stage?: number;
      dateRange?: {
        startDate: Date;
        endDate: Date;
      };
    },
    public readonly groupBy?: 'stage' | 'productType' | 'riskGrade' | 'customer'
  ) {}
}

@QueryHandler(GetLoanPortfolioSummaryQuery)
export class GetLoanPortfolioSummaryHandler {
  private readonly logger = new Logger(GetLoanPortfolioSummaryHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(query: GetLoanPortfolioSummaryQuery): Promise<any> {
    this.logger.log(`Executing GetLoanPortfolioSummaryQuery`);

    try {
      const result = await this.loanManagementUseCase.getLoanPortfolioSummary({
        filters: query.filters,
        groupBy: query.groupBy
      });

      this.logger.log(`Successfully retrieved loan portfolio summary`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get loan portfolio summary`, error);
      throw error;
    }
  }
}

/**
 * Query: Get Loan Stage History
 */
export class GetLoanStageHistoryQuery implements IQuery {
  constructor(
    public readonly loanId: string,
    public readonly dateRange?: {
      startDate: Date;
      endDate: Date;
    }
  ) {}
}

@QueryHandler(GetLoanStageHistoryQuery)
export class GetLoanStageHistoryHandler {
  private readonly logger = new Logger(GetLoanStageHistoryHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(query: GetLoanStageHistoryQuery): Promise<any> {
    this.logger.log(`Executing GetLoanStageHistoryQuery for loan: ${query.loanId}`);

    try {
      const result = await this.loanManagementUseCase.getLoanStageHistory({
        loanId: query.loanId,
        dateRange: query.dateRange
      });

      this.logger.log(`Successfully retrieved loan stage history: ${query.loanId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get loan stage history: ${query.loanId}`, error);
      throw error;
    }
  }
}

/**
 * Query: Get Loans Requiring Assessment
 */
export class GetLoansRequiringAssessmentQuery implements IQuery {
  constructor(
    public readonly asOfDate?: Date
  ) {}
}

@QueryHandler(GetLoansRequiringAssessmentQuery)
export class GetLoansRequiringAssessmentHandler {
  private readonly logger = new Logger(GetLoansRequiringAssessmentHandler.name);

  constructor(
    private readonly loanRepository: ILoanRepository
  ) {}

  async execute(query: GetLoansRequiringAssessmentQuery): Promise<any> {
    this.logger.log(`Executing GetLoansRequiringAssessmentQuery`);

    try {
      const loans = await this.loanRepository.findLoansRequiringAssessment(query.asOfDate);

      const result = {
        loans: loans.map(loan => ({
          loanId: loan.id,
          accountNumber: loan.accountNumber,
          customerId: loan.customerId,
          currentStage: loan.currentStage.number,
          daysPastDue: loan.daysPastDue,
          lastStageChangeDate: loan.lastStageChangeDate,
          outstandingBalance: loan.outstandingBalance.amount,
          isImpaired: loan.isImpaired(),
          requiresAssessment: loan.isDueForAssessment()
        })),
        total: loans.length,
        assessmentDate: query.asOfDate || new Date()
      };

      this.logger.log(`Found ${result.total} loans requiring assessment`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get loans requiring assessment`, error);
      throw error;
    }
  }
}

/**
 * Query: Get Active Loans
 */
export class GetActiveLoansQuery implements IQuery {
  constructor(
    public readonly limit?: number,
    public readonly offset?: number
  ) {}
}

@QueryHandler(GetActiveLoansQuery)
export class GetActiveLoansHandler {
  private readonly logger = new Logger(GetActiveLoansHandler.name);

  constructor(
    private readonly loanRepository: ILoanRepository
  ) {}

  async execute(query: GetActiveLoansQuery): Promise<any> {
    this.logger.log(`Executing GetActiveLoansQuery`);

    try {
      const loans = await this.loanRepository.findActiveLoans();

      let resultLoans = loans.map(loan => ({
        loanId: loan.id,
        accountNumber: loan.accountNumber,
        customerId: loan.customerId,
        productType: loan.productType,
        currentStage: loan.currentStage.number,
        outstandingBalance: loan.outstandingBalance.amount,
        currency: loan.currency,
        originationDate: loan.originationDate,
        maturityDate: loan.maturityDate,
        interestRate: loan.interestRate,
        isImpaired: loan.isImpaired()
      }));

      // Apply pagination if specified
      if (query.offset || query.limit) {
        const startIndex = query.offset || 0;
        const endIndex = query.limit ? startIndex + query.limit : resultLoans.length;
        resultLoans = resultLoans.slice(startIndex, endIndex);
      }

      const result = {
        loans: resultLoans,
        total: loans.length,
        hasMore: query.limit ? (query.offset || 0) + query.limit < loans.length : false
      };

      this.logger.log(`Retrieved ${result.loans.length} active loans`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get active loans`, error);
      throw error;
    }
  }
}

/**
 * Query: Get Impaired Loans
 */
export class GetImpairedLoansQuery implements IQuery {
  constructor(
    public readonly limit?: number,
    public readonly offset?: number
  ) {}
}

@QueryHandler(GetImpairedLoansQuery)
export class GetImpairedLoansHandler {
  private readonly logger = new Logger(GetImpairedLoansHandler.name);

  constructor(
    private readonly loanRepository: ILoanRepository
  ) {}

  async execute(query: GetImpairedLoansQuery): Promise<any> {
    this.logger.log(`Executing GetImpairedLoansQuery`);

    try {
      const loans = await this.loanRepository.findImpairedLoans();

      let resultLoans = loans.map(loan => ({
        loanId: loan.id,
        accountNumber: loan.accountNumber,
        customerId: loan.customerId,
        productType: loan.productType,
        currentStage: loan.currentStage.number,
        outstandingBalance: loan.outstandingBalance.amount,
        currency: loan.currency,
        daysPastDue: loan.daysPastDue,
        impairmentRatio: loan.getECLAsPercentageOfEAD(),
        originationDate: loan.originationDate,
        lastStageChangeDate: loan.lastStageChangeDate
      }));

      // Apply pagination if specified
      if (query.offset || query.limit) {
        const startIndex = query.offset || 0;
        const endIndex = query.limit ? startIndex + query.limit : resultLoans.length;
        resultLoans = resultLoans.slice(startIndex, endIndex);
      }

      const result = {
        loans: resultLoans,
        total: loans.length,
        totalOutstanding: loans.reduce((sum, loan) => sum + loan.outstandingBalance.amount, 0),
        averageImpairmentRatio: loans.length > 0
          ? loans.reduce((sum, loan) => sum + loan.getECLAsPercentageOfEAD(), 0) / loans.length
          : 0,
        hasMore: query.limit ? (query.offset || 0) + query.limit < loans.length : false
      };

      this.logger.log(`Retrieved ${result.loans.length} impaired loans`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get impaired loans`, error);
      throw error;
    }
  }
}

/**
 * Query: Get Loan Statistics
 */
export class GetLoanStatisticsQuery implements IQuery {
  constructor(
    public readonly filters?: {
      customerId?: string;
      productType?: string;
      stage?: number;
      dateRange?: {
        startDate: Date;
        endDate: Date;
      };
    }
  ) {}
}

@QueryHandler(GetLoanStatisticsQuery)
export class GetLoanStatisticsHandler {
  private readonly logger = new Logger(GetLoanStatisticsHandler.name);

  constructor(
    private readonly loanRepository: ILoanRepository
  ) {}

  async execute(query: GetLoanStatisticsQuery): Promise<any> {
    this.logger.log(`Executing GetLoanStatisticsQuery`);

    try {
      const stats = await this.loanRepository.getStatistics(query.filters);

      const result = {
        ...stats,
        calculatedAt: new Date(),
        filters: query.filters
      };

      this.logger.log(`Retrieved loan statistics`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get loan statistics`, error);
      throw error;
    }
  }
}

/**
 * Query: Validate Loan Data
 */
export class ValidateLoanDataQuery implements IQuery {
  constructor(
    public readonly loanData: any,
    public readonly validationType: 'create' | 'update' | 'stage_assessment'
  ) {}
}

@QueryHandler(ValidateLoanDataQuery)
export class ValidateLoanDataHandler {
  private readonly logger = new Logger(ValidateLoanDataHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(query: ValidateLoanDataQuery): Promise<any> {
    this.logger.log(`Executing ValidateLoanDataQuery for type: ${query.validationType}`);

    try {
      const result = await this.loanManagementUseCase.validateLoanData({
        loanData: query.loanData,
        validationType: query.validationType
      });

      this.logger.log(`Loan data validation completed: ${result.isValid ? 'Valid' : 'Invalid'}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to validate loan data`, error);
      throw error;
    }
  }
}