// packages/backend/src/core/application/usecases/customer/ICustomerManagementUseCase.ts

import { Money } from '../../../domain/shared/value-objects/Money';
import { DateRange } from '../../../domain/shared/value-objects/DateRange';
import { Customer } from '../../../domain/ifrs9/entities/Customer';

/**
 * Use Case interface for Customer Management
 * Defines the contract for customer-related business operations
 */

export interface ICustomerManagementUseCase {
  /**
   * Create a new customer
   */
  createCustomer(request: {
    customerNumber: string;
    legalName: string;
    displayName: string;
    customerType: 'individual' | 'corporate' | 'sme' | 'msme' | 'syariah_individual' | 'syariah_corporate';
    taxIdentificationNumber?: string;
    nationalIdNumber?: string;
    incorporationDate?: Date;
    primaryContact: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    initialRiskGrade: string;
    initialCreditLimit: Money;
    createdBy: string;
  }): Promise<{
    customer: Customer;
    success: boolean;
    message: string;
  }>;

  /**
   * Update customer information
   */
  updateCustomer(request: {
    customerId: string;
    updates: {
      legalName?: string;
      displayName?: string;
      primaryContact?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: string;
      };
      isActive?: boolean;
    };
    updatedBy: string;
  }): Promise<{
    customer: Customer;
    success: boolean;
    message: string;
  }>;

  /**
   * Assess customer risk profile
   */
  assessCustomerRisk(request: {
    customerId: string;
    assessmentOptions?: {
      accountPerformance?: {
        pastDueDays: number;
        paymentHistory: string[];
        utilizationRate: number;
      };
      financialIndicators?: {
        debtToIncomeRatio: number;
        liquidityRatio: number;
        profitabilityTrend: 'improving' | 'stable' | 'declining';
      };
      marketConditions?: {
        industryRisk: 'low' | 'medium' | 'high';
        economicOutlook: 'positive' | 'stable' | 'negative';
      };
      complianceUpdates?: {
        newAmlRisk?: 'low' | 'medium' | 'high';
        kycExpired?: boolean;
        sanctionHits?: number;
      };
    };
    assessedBy: string;
  }): Promise<{
    customer: Customer;
    assessmentResult: {
      newRiskGrade: string;
      previousRiskGrade: string;
      riskGradeChanged: boolean;
      creditLimitAdjustment: Money;
      reason: string;
      riskFactors: string[];
      nextReviewDate: Date;
    };
    success: boolean;
    message: string;
  }>;

  /**
   * Update customer compliance information
   */
  updateCustomerCompliance(request: {
    customerId: string;
    complianceUpdates: {
      amlRiskLevel?: 'low' | 'medium' | 'high';
      kycStatus?: 'verified' | 'pending' | 'expired';
      sanctionScreeningClear?: boolean;
      pepStatus?: 'none' | 'domestic' | 'foreign';
    };
    updatedBy: string;
  }): Promise<{
    customer: Customer;
    success: boolean;
    message: string;
  }>;

  /**
   * Get customer details
   */
  getCustomerDetails(request: {
    customerId: string;
    includeLoanPortfolio?: boolean;
    includeRiskHistory?: boolean;
    includeComplianceHistory?: boolean;
  }): Promise<{
    customer: Customer;
    loanPortfolio?: Array<{
      loanId: string;
      accountNumber: string;
      productType: string;
      outstandingBalance: Money;
      stage: string;
      ecl: Money;
      daysPastDue?: number;
    }>;
    riskHistory?: Array<{
      assessmentDate: Date;
      riskGrade: string;
      pdRate: number;
      lgdRate: number;
      creditLimit: Money;
      assessmentFactors: string[];
    }>;
    complianceHistory?: Array<{
      updateDate: Date;
      amlRiskLevel: string;
      kycStatus: string;
      sanctionScreeningClear: boolean;
      pepStatus: string;
      updatedBy: string;
    }>;
    success: boolean;
    message: string;
  }>;

  /**
   * Search customers
   */
  searchCustomers(request: {
    criteria: {
      searchTerm?: string;
      customerType?: string;
      riskGrade?: string;
      isActive?: boolean;
      amlRiskLevel?: 'low' | 'medium' | 'high';
      kycStatus?: 'verified' | 'pending' | 'expired';
      dateRange?: {
        field: 'customerSince' | 'registrationDate';
        startDate: Date;
        endDate: Date;
      };
      exposureRange?: {
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
    customers: Array<{
      customer: Customer;
      loanCount: number;
      totalExposure: Money;
      impairmentRatio: number;
      daysSinceLastReview?: number;
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
   * Get customer portfolio summary
   */
  getCustomerPortfolioSummary(request: {
    customerId: string;
    dateRange?: DateRange;
  }): Promise<{
    customer: Customer;
    portfolioSummary: {
      totalLoans: number;
      activeLoans: number;
      totalOutstanding: Money;
      totalECL: Money;
      coverageRatio: number;
      stageDistribution: {
        stage1: { count: number; outstanding: Money; ecl: Money };
        stage2: { count: number; outstanding: Money; ecl: Money };
        stage3: { count: number; outstanding: Money; ecl: Money };
      };
      productDistribution: Record<string, {
        count: number;
        outstanding: Money;
        ecl: Money;
      }>;
      monthlyTrend: Array<{
        month: string;
        outstanding: Money;
        ecl: Money;
        newLoans: number;
        closedLoans: number;
      }>;
    };
    success: boolean;
    message: string;
  }>;

  /**
   * Get customers requiring attention
   */
  getCustomersRequiringAttention(request: {
    attentionTypes?: Array<'high_risk' | 'kyc_expiry' | 'overdue_review' | 'compliance_issues'>;
    limit?: number;
  }): Promise<{
    customers: Array<{
      customer: Customer;
      attentionReasons: string[];
      urgency: 'high' | 'medium' | 'low';
      recommendedActions: string[];
      nextActionDate?: Date;
    }>;
    summary: {
      totalCustomers: number;
      byUrgency: {
        high: number;
        medium: number;
        low: number;
      };
      byAttentionType: Record<string, number>;
    };
    success: boolean;
    message: string;
  }>;

  /**
   * Process credit limit increase request
   */
  processCreditLimitIncrease(request: {
    customerId: string;
    requestedLimit: Money;
    reason: string;
    supportingDocuments?: string[];
    requestedBy: string;
  }): Promise<{
    approved: boolean;
    newCreditLimit?: Money;
    decisionReason: string;
    conditions?: string[];
    reviewedBy?: string;
    success: boolean;
    message: string;
  }>;

  /**
   * Validate customer data
   */
  validateCustomerData(request: {
    customerData: any;
    validationType: 'create' | 'update' | 'risk_assessment';
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
   * Get customer risk assessment report
   */
  getCustomerRiskAssessmentReport(request: {
    customerId: string;
    reportType?: 'comprehensive' | 'summary' | 'regulatory';
    dateRange?: DateRange;
  }): Promise<{
    report: {
      customerInfo: any;
      riskProfile: {
        currentRiskGrade: string;
        riskGradeHistory: Array<{
          date: Date;
          grade: string;
          reason: string;
        }>;
        keyRiskFactors: string[];
        riskMitigation: string[];
      };
      creditMetrics: {
        currentExposure: Money;
        creditLimit: Money;
        utilizationRate: number;
        paymentHistory: any;
      };
      compliance: {
        amlRisk: string;
        kycStatus: string;
        lastScreening: Date;
        anyIssues: boolean;
      };
      recommendations: Array<{
        priority: 'high' | 'medium' | 'low';
        action: string;
        timeframe: string;
      }>;
    };
    generatedAt: Date;
    generatedBy: string;
    success: boolean;
    message: string;
  }>;

  /**
   * Deactivate customer
   */
  deactivateCustomer(request: {
    customerId: string;
    reason: string;
    deactivatedBy: string;
  }): Promise<{
    customer: Customer;
    success: boolean;
    message: string;
  }>;

  /**
   * Reactivate customer
   */
  reactivateCustomer(request: {
    customerId: string;
    reason: string;
    reactivatedBy: string;
  }): Promise<{
    customer: Customer;
    success: boolean;
    message: string;
  }>;
}