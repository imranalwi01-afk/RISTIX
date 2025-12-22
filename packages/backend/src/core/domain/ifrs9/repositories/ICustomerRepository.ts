// packages/backend/src/core/domain/ifrs9/repositories/ICustomerRepository.ts

import { Customer, CustomerProps } from '../entities/Customer';
import { Money } from '../../shared/value-objects/Money';

/**
 * Repository interface for Customer aggregate
 * Defines the contract for customer persistence and retrieval operations
 */

export interface ICustomerRepository {
  /**
   * Save a customer entity
   */
  save(customer: Customer): Promise<void>;

  /**
   * Find customer by ID
   */
  findById(id: string): Promise<Customer | null>;

  /**
   * Find customer by customer number
   */
  findByCustomerNumber(customerNumber: string): Promise<Customer | null>;

  /**
   * Find customers by type
   */
  findByCustomerType(customerType: string): Promise<Customer[]>;

  /**
   * Find customers by risk grade
   */
  findByRiskGrade(riskGrade: string): Promise<Customer[]>;

  /**
   * Find high-risk customers
   */
  findHighRiskCustomers(): Promise<Customer[]>;

  /**
   * Find customers requiring enhanced monitoring
   */
  findCustomersRequiringEnhancedMonitoring(): Promise<Customer[]>;

  /**
   * Find customers eligible for credit increase
   */
  findCustomersEligibleForCreditIncrease(): Promise<Customer[]>;

  /**
   * Find customers by relationship duration
   */
  findByRelationshipDuration(minMonths: number, maxMonths?: number): Promise<Customer[]>;

  /**
   * Find customers by compliance status
   */
  findByComplianceStatus(criteria: {
    amlRiskLevel?: 'low' | 'medium' | 'high';
    kycStatus?: 'verified' | 'pending' | 'expired';
    pepStatus?: 'none' | 'domestic' | 'foreign';
    sanctionScreeningClear?: boolean;
  }): Promise<Customer[]>;

  /**
   * Find customers by credit utilization
   */
  findByCreditUtilization(minUtilization: number, maxUtilization?: number): Promise<Customer[]>;

  /**
   * Find customers by multiple criteria
   */
  findByCriteria(criteria: {
    customerType?: string;
    riskGrade?: string;
    isActive?: boolean;
    amlRiskLevel?: 'low' | 'medium' | 'high';
    kycStatus?: 'verified' | 'pending' | 'expired';
    minExposure?: Money;
    maxExposure?: Money;
    dateRange?: {
      field: 'customerSince' | 'registrationDate';
      startDate: Date;
      endDate: Date;
    };
    limit?: number;
    offset?: number;
  }): Promise<{
    customers: Customer[];
    total: number;
  }>;

  /**
   * Update customer risk profile
   */
  updateRiskProfile(customerId: string, riskProfile: {
    riskGrade: string;
    pdRate: number;
    lgdRate: number;
    eadRate: number;
    creditLimit: Money;
    lastAssessmentDate: Date;
  }): Promise<void>;

  /**
   * Update customer compliance information
   */
  updateComplianceInformation(customerId: string, compliance: {
    amlRiskLevel: 'low' | 'medium' | 'high';
    kycStatus: 'verified' | 'pending' | 'expired';
    lastKycUpdate: Date;
    sanctionScreeningClear: boolean;
    pepStatus: 'none' | 'domestic' | 'foreign';
  }): Promise<void>;

  /**
   * Update customer banking relationship
   */
  updateBankingRelationship(customerId: string, relationship: {
    totalAccounts: number;
    activeAccounts: number;
    totalExposure: Money;
    performingExposure: Money;
    impairedExposure: Money;
    relationshipScore: number;
  }): Promise<void>;

  /**
   * Get customer statistics
   */
  getStatistics(filters?: {
    customerType?: string;
    riskGrade?: string;
    dateRange?: {
      field: 'customerSince' | 'registrationDate';
      startDate: Date;
      endDate: Date;
    };
  }): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    totalExposure: number;
    averageExposure: number;
    riskDistribution: Record<string, number>;
    impairmentRatio: number;
    averagePD: number;
    averageLGD: number;
    highRiskCount: number;
    enhancedMonitoringCount: number;
  }>;

  /**
   * Get customer portfolio summary
   */
  getPortfolioSummary(customerId: string): Promise<{
    customer: Customer;
    loanCount: number;
    totalOutstanding: number;
    stageDistribution: {
      stage1: number;
      stage2: number;
      stage3: number;
    };
    productDistribution: Record<string, number>;
    monthlyTrend: Array<{
      month: string;
      outstanding: number;
      ecl: number;
    }>;
  }>;

  /**
   * Search customers by name or identifier
   */
  search(searchTerm: string, limit?: number): Promise<Customer[]>;

  /**
   * Check if customer exists
   */
  exists(id: string): Promise<boolean>;

  /**
   * Check if customer number exists
   */
  existsByCustomerNumber(customerNumber: string): Promise<boolean>;

  /**
   * Deactivate customer
   */
  deactivate(customerId: string): Promise<void>;

  /**
   * Reactivate customer
   */
  reactivate(customerId: string): Promise<void>;

  /**
   * Count customers by criteria
   */
  count(criteria?: {
    customerType?: string;
    riskGrade?: string;
    isActive?: boolean;
    amlRiskLevel?: 'low' | 'medium' | 'high';
    kycStatus?: 'verified' | 'pending' | 'expired';
  }): Promise<number>;

  /**
   * Get customers with upcoming KYC expiry
   */
  getCustomersWithUpcomingKycExpiry(daysAhead: number): Promise<Customer[]>;

  /**
   * Get customers with overdue reviews
   */
  getCustomersWithOverdueReviews(): Promise<Customer[]>;
}