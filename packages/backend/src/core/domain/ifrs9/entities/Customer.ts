// packages/backend/src/core/domain/ifrs9/entities/Customer.ts

import { Money } from '../../shared/value-objects/Money';
import { DateRange } from '../../shared/value-objects/DateRange';
import { BaseEvent } from '../../shared/events/BaseEvent';

/**
 * Customer Entity - IFRS9 customer with business logic
 * Represents a customer with their banking relationships and risk profile
 */

export interface CustomerProps {
  id: string;
  customerNumber: string;
  legalName: string;
  displayName: string;
  customerType: 'individual' | 'corporate' | 'sme' | 'msme' | 'syariah_individual' | 'syariah_corporate';
  taxIdentificationNumber?: string;
  nationalIdNumber?: string;
  incorporationDate?: Date;
  registrationDate: Date;
  customerSince: Date;
  primaryContact: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  riskProfile: {
    riskGrade: string;
    pdRate: number;
    lgdRate: number;
    eadRate: number;
    creditLimit: Money;
    exposureAmount: Money;
    lastAssessmentDate: Date;
  };
  bankingRelationship: {
    totalAccounts: number;
    activeAccounts: number;
    totalExposure: Money;
    performingExposure: Money;
    impairedExposure: Money;
    oldestAccountDate: Date;
    relationshipScore: number;
  };
  compliance: {
    amlRiskLevel: 'low' | 'medium' | 'high';
    kycStatus: 'verified' | 'pending' | 'expired';
    lastKycUpdate: Date;
    sanctionScreeningClear: boolean;
    pepStatus: 'none' | 'domestic' | 'foreign';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface CustomerAssessmentResult {
  customerId: string;
  newRiskGrade: string;
  previousRiskGrade: string;
  riskGradeChanged: boolean;
  pdRate: number;
  lgdRate: number;
  eadRate: number;
  creditLimitAdjustment: Money;
  reason: string;
  riskFactors: string[];
  assessmentDate: Date;
  nextReviewDate: Date;
}

export class CustomerRiskAssessed extends BaseEvent {
  constructor(
    aggregateId: string,
    data: {
      customerId: string;
      previousRiskGrade: string;
      newRiskGrade: string;
      previousPD: number;
      newPD: number;
      previousLGD: number;
      newLGD: number;
      creditLimitAdjustment: number;
      assessmentFactors: string[];
    },
    options?: {
      userId?: string;
      tenantId?: string;
      correlationId?: string;
      version?: number;
    }
  ) {
    super(aggregateId, 'Customer', data, options);
    this.validate();
  }

  protected validate(): void {
    if (!this.data.customerId) {
      throw new Error('Customer ID is required');
    }
    if (!this.data.newRiskGrade) {
      throw new Error('New risk grade is required');
    }
    if (typeof this.data.newPD !== 'number' || this.data.newPD < 0 || this.data.newPD > 1) {
      throw new Error('New PD rate must be between 0 and 1');
    }
    if (typeof this.data.newLGD !== 'number' || this.data.newLGD < 0 || this.data.newLGD > 1) {
      throw new Error('New LGD rate must be between 0 and 1');
    }
  }
}

export class CustomerCreated extends BaseEvent {
  constructor(
    aggregateId: string,
    data: {
      customerId: string;
      customerNumber: string;
      legalName: string;
      customerType: string;
      initialRiskGrade: string;
      initialCreditLimit: number;
    },
    options?: {
      userId?: string;
      tenantId?: string;
      correlationId?: string;
      version?: number;
    }
  ) {
    super(aggregateId, 'Customer', data, options);
    this.validate();
  }

  protected validate(): void {
    if (!this.data.customerId) {
      throw new Error('Customer ID is required');
    }
    if (!this.data.customerNumber) {
      throw new Error('Customer number is required');
    }
    if (!this.data.legalName) {
      throw new Error('Legal name is required');
    }
  }
}

export class Customer {
  public readonly id: string;
  public readonly customerNumber: string;
  public readonly legalName: string;
  public readonly displayName: string;
  public readonly customerType: 'individual' | 'corporate' | 'sme' | 'msme' | 'syariah_individual' | 'syariah_corporate';
  public readonly taxIdentificationNumber?: string;
  public readonly nationalIdNumber?: string;
  public readonly incorporationDate?: Date;
  public readonly registrationDate: Date;
  public readonly customerSince: Date;
  public readonly primaryContact: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  public readonly riskProfile: {
    riskGrade: string;
    pdRate: number;
    lgdRate: number;
    eadRate: number;
    creditLimit: Money;
    exposureAmount: Money;
    lastAssessmentDate: Date;
  };
  public readonly bankingRelationship: {
    totalAccounts: number;
    activeAccounts: number;
    totalExposure: Money;
    performingExposure: Money;
    impairedExposure: Money;
    oldestAccountDate: Date;
    relationshipScore: number;
  };
  public readonly compliance: {
    amlRiskLevel: 'low' | 'medium' | 'high';
    kycStatus: 'verified' | 'pending' | 'expired';
    lastKycUpdate: Date;
    sanctionScreeningClear: boolean;
    pepStatus: 'none' | 'domestic' | 'foreign';
  };
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly tenantId: string;

  constructor(props: CustomerProps) {
    this.validate(props);
    this.id = props.id;
    this.customerNumber = props.customerNumber;
    this.legalName = props.legalName;
    this.displayName = props.displayName;
    this.customerType = props.customerType;
    this.taxIdentificationNumber = props.taxIdentificationNumber;
    this.nationalIdNumber = props.nationalIdNumber;
    this.incorporationDate = props.incorporationDate;
    this.registrationDate = props.registrationDate;
    this.customerSince = props.customerSince;
    this.primaryContact = props.primaryContact;
    this.riskProfile = props.riskProfile;
    this.bankingRelationship = props.bankingRelationship;
    this.compliance = props.compliance;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.tenantId = props.tenantId;
  }

  /**
   * Create a new Customer instance
   */
  static create(props: CustomerProps): Customer {
    return new Customer(props);
  }

  /**
   * Assess customer risk profile based on multiple factors
   */
  assessRiskProfile(options: {
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
  } = {}): CustomerAssessmentResult {
    const previousRiskGrade = this.riskProfile.riskGrade;
    const previousPD = this.riskProfile.pdRate;
    const previousLGD = this.riskProfile.lgdRate;

    let newRiskGrade = previousRiskGrade;
    let newPD = previousPD;
    let newLGD = previousLGD;
    let creditLimitAdjustment = this.riskProfile.creditLimit.multiply(0);

    const riskFactors: string[] = [];
    const reasons: string[] = [];

    // Account Performance Assessment
    if (options.accountPerformance) {
      const { pastDueDays, paymentHistory, utilizationRate } = options.accountPerformance;

      if (pastDueDays > 90) {
        newRiskGrade = this.upgradeRiskGrade(newRiskGrade, 2);
        newPD = Math.min(newPD * 1.5, 0.95);
        riskFactors.push('90+ days past due');
        reasons.push('Significant payment delinquency');
      } else if (pastDueDays > 30) {
        newRiskGrade = this.upgradeRiskGrade(newRiskGrade, 1);
        newPD = Math.min(newPD * 1.2, 0.90);
        riskFactors.push('30-89 days past due');
        reasons.push('Payment delinquency');
      }

      if (utilizationRate > 0.9) {
        newPD = Math.min(newPD * 1.1, 0.95);
        riskFactors.push('High credit utilization');
        reasons.push('High utilization of available credit');
      }

      const recentMissedPayments = paymentHistory.filter(p => p === 'missed').length;
      if (recentMissedPayments > 2) {
        newRiskGrade = this.upgradeRiskGrade(newRiskGrade, 1);
        newPD = Math.min(newPD * 1.15, 0.95);
        riskFactors.push('Multiple missed payments');
        reasons.push('Poor payment history');
      }
    }

    // Financial Indicators Assessment
    if (options.financialIndicators) {
      const { debtToIncomeRatio, liquidityRatio, profitabilityTrend } = options.financialIndicators;

      if (debtToIncomeRatio > 0.5) {
        newRiskGrade = this.upgradeRiskGrade(newRiskGrade, 1);
        newPD = Math.min(newPD * 1.1, 0.95);
        riskFactors.push('High debt-to-income ratio');
        reasons.push('Elevated leverage');
      }

      if (liquidityRatio < 1.0) {
        newPD = Math.min(newPD * 1.05, 0.95);
        riskFactors.push('Low liquidity ratio');
        reasons.push('Liquidity concerns');
      }

      if (profitabilityTrend === 'declining') {
        newRiskGrade = this.upgradeRiskGrade(newRiskGrade, 1);
        newPD = Math.min(newPD * 1.1, 0.95);
        riskFactors.push('Declining profitability');
        reasons.push('Deteriorating financial performance');
      }
    }

    // Market Conditions Assessment
    if (options.marketConditions) {
      const { industryRisk, economicOutlook } = options.marketConditions;

      if (industryRisk === 'high') {
        newPD = Math.min(newPD * 1.05, 0.95);
        riskFactors.push('High industry risk');
        reasons.push('Industry sector headwinds');
      }

      if (economicOutlook === 'negative') {
        newPD = Math.min(newPD * 1.03, 0.95);
        riskFactors.push('Negative economic outlook');
        reasons.push('Economic downturn risk');
      }
    }

    // Compliance Updates Assessment
    if (options.complianceUpdates) {
      const { newAmlRisk, kycExpired, sanctionHits } = options.complianceUpdates;

      if (newAmlRisk === 'high' || this.compliance.amlRiskLevel === 'high') {
        newRiskGrade = this.upgradeRiskGrade(newRiskGrade, 1);
        riskFactors.push('High AML risk');
        reasons.push('Elevated money laundering risk');
      }

      if (kycExpired || this.compliance.kycStatus === 'expired') {
        riskFactors.push('KYC documentation expired');
        reasons.push('KYC update required');
      }

      if (sanctionHits && sanctionHits > 0) {
        newRiskGrade = this.upgradeRiskGrade(newRiskGrade, 2);
        newPD = Math.min(newPD * 1.5, 0.95);
        riskFactors.push('Sanctions screening hits');
        reasons.push('Regulatory compliance concerns');
      }
    }

    // Calculate credit limit adjustment
    if (newPD > previousPD) {
      const pdIncrease = (newPD - previousPD) / previousPD;
      creditLimitAdjustment = this.riskProfile.creditLimit.multiply(-Math.min(pdIncrease * 0.5, 0.3));
    } else if (newPD < previousPD) {
      const pdDecrease = (previousPD - newPD) / previousPD;
      creditLimitAdjustment = this.riskProfile.creditLimit.multiply(Math.min(pdDecrease * 0.3, 0.2));
    }

    // Determine next review date
    const nextReviewDate = new Date();
    if (newRiskGrade.includes('high') || newPD > 0.1) {
      nextReviewDate.setMonth(nextReviewDate.getMonth() + 3); // Quarterly for high risk
    } else if (newRiskGrade.includes('medium') || newPD > 0.05) {
      nextReviewDate.setMonth(nextReviewDate.getMonth() + 6); // Semi-annual for medium risk
    } else {
      nextReviewDate.setFullYear(nextReviewDate.getFullYear() + 1); // Annual for low risk
    }

    const riskGradeChanged = newRiskGrade !== previousRiskGrade;

    return {
      customerId: this.id,
      newRiskGrade,
      previousRiskGrade,
      riskGradeChanged,
      pdRate: newPD,
      lgdRate: newLGD,
      eadRate: this.riskProfile.eadRate,
      creditLimitAdjustment,
      reason: reasons.join('; ') || 'Periodic review - no change',
      riskFactors,
      assessmentDate: new Date(),
      nextReviewDate
    };
  }

  /**
   * Update customer risk profile
   */
  updateRiskProfile(assessment: CustomerAssessmentResult): Customer {
    return new Customer({
      ...this.toJSON(),
      riskProfile: {
        ...this.riskProfile,
        riskGrade: assessment.newRiskGrade,
        pdRate: assessment.pdRate,
        lgdRate: assessment.lgdRate,
        creditLimit: this.riskProfile.creditLimit.add(assessment.creditLimitAdjustment),
        lastAssessmentDate: assessment.assessmentDate
      },
      updatedAt: new Date()
    });
  }

  /**
   * Update customer contact information
   */
  updateContactInformation(contact: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  }): Customer {
    return new Customer({
      ...this.toJSON(),
      primaryContact: {
        ...this.primaryContact,
        ...contact
      },
      updatedAt: new Date()
    });
  }

  /**
   * Update compliance information
   */
  updateComplianceInformation(compliance: {
    amlRiskLevel?: 'low' | 'medium' | 'high';
    kycStatus?: 'verified' | 'pending' | 'expired';
    sanctionScreeningClear?: boolean;
    pepStatus?: 'none' | 'domestic' | 'foreign';
  }): Customer {
    return new Customer({
      ...this.toJSON(),
      compliance: {
        ...this.compliance,
        ...compliance,
        lastKycUpdate: compliance.kycStatus ? new Date() : this.compliance.lastKycUpdate
      },
      updatedAt: new Date()
    });
  }

  /**
   * Update banking relationship metrics
   */
  updateBankingRelationship(metrics: {
    totalAccounts?: number;
    activeAccounts?: number;
    totalExposure?: Money;
    performingExposure?: Money;
    impairedExposure?: Money;
    relationshipScore?: number;
  }): Customer {
    return new Customer({
      ...this.toJSON(),
      bankingRelationship: {
        ...this.bankingRelationship,
        ...metrics
      },
      updatedAt: new Date()
    });
  }

  /**
   * Check if customer is high risk
   */
  isHighRisk(): boolean {
    return (
      this.riskProfile.riskGrade.toLowerCase().includes('high') ||
      this.riskProfile.pdRate > 0.1 ||
      this.compliance.amlRiskLevel === 'high' ||
      this.compliance.pepStatus !== 'none'
    );
  }

  /**
   * Check if customer requires enhanced monitoring
   */
  requiresEnhancedMonitoring(): boolean {
    return (
      this.isHighRisk() ||
      this.bankingRelationship.totalExposure.amount > 10000000 || // > $10M
      this.bankingRelationship.impairedExposure.amount > 0 ||
      this.compliance.kycStatus !== 'verified'
    );
  }

  /**
   * Get customer age in months
   */
  getCustomerAgeInMonths(): number {
    const now = new Date();
    const monthsDiff = (now.getFullYear() - this.customerSince.getFullYear()) * 12 +
                     (now.getMonth() - this.customerSince.getMonth());
    return monthsDiff;
  }

  /**
   * Get relationship duration in years
   */
  getRelationshipDurationInYears(): number {
    return Math.floor(this.getCustomerAgeInMonths() / 12);
  }

  /**
   * Check if customer is eligible for credit increase
   */
  isEligibleForCreditIncrease(): boolean {
    return (
      this.isActive &&
      !this.isHighRisk() &&
      this.compliance.kycStatus === 'verified' &&
      this.compliance.sanctionScreeningClear &&
      this.bankingRelationship.relationshipScore > 70 &&
      this.getCustomerAgeInMonths() > 6 // Minimum 6 months relationship
    );
  }

  /**
   * Calculate credit utilization rate
   */
  getCreditUtilizationRate(): number {
    if (this.riskProfile.creditLimit.isZero()) {
      return 1; // 100% utilization if no credit limit
    }
    return this.bankingRelationship.totalExposure.amount / this.riskProfile.creditLimit.amount;
  }

  /**
   * Get impairment ratio
   */
  getImpairmentRatio(): number {
    if (this.bankingRelationship.totalExposure.isZero()) {
      return 0;
    }
    return this.bankingRelationship.impairedExposure.amount / this.bankingRelationship.totalExposure.amount;
  }

  /**
   * Deactivate customer
   */
  deactivate(): Customer {
    return new Customer({
      ...this.toJSON(),
      isActive: false,
      updatedAt: new Date()
    });
  }

  /**
   * Reactivate customer
   */
  reactivate(): Customer {
    return new Customer({
      ...this.toJSON(),
      isActive: true,
      updatedAt: new Date()
    });
  }

  /**
   * Convert to JSON
   */
  toJSON(): CustomerProps {
    return {
      id: this.id,
      customerNumber: this.customerNumber,
      legalName: this.legalName,
      displayName: this.displayName,
      customerType: this.customerType,
      taxIdentificationNumber: this.taxIdentificationNumber,
      nationalIdNumber: this.nationalIdNumber,
      incorporationDate: this.incorporationDate,
      registrationDate: this.registrationDate,
      customerSince: this.customerSince,
      primaryContact: this.primaryContact,
      riskProfile: {
        ...this.riskProfile,
        creditLimit: this.riskProfile.creditLimit.toJSON(),
        exposureAmount: this.riskProfile.exposureAmount.toJSON()
      },
      bankingRelationship: {
        ...this.bankingRelationship,
        totalExposure: this.bankingRelationship.totalExposure.toJSON(),
        performingExposure: this.bankingRelationship.performingExposure.toJSON(),
        impairedExposure: this.bankingRelationship.impairedExposure.toJSON()
      },
      compliance: this.compliance,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tenantId: this.tenantId
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(props: CustomerProps): Customer {
    return new Customer({
      ...props,
      riskProfile: {
        ...props.riskProfile,
        creditLimit: Money.fromJSON(props.riskProfile.creditLimit),
        exposureAmount: Money.fromJSON(props.riskProfile.exposureAmount)
      },
      bankingRelationship: {
        ...props.bankingRelationship,
        totalExposure: Money.fromJSON(props.bankingRelationship.totalExposure),
        performingExposure: Money.fromJSON(props.bankingRelationship.performingExposure),
        impairedExposure: Money.fromJSON(props.bankingRelationship.impairedExposure)
      }
    });
  }

  /**
   * Validate customer properties
   */
  private validate(props: CustomerProps): void {
    if (!props.id) {
      throw new Error('Customer ID is required');
    }
    if (!props.customerNumber) {
      throw new Error('Customer number is required');
    }
    if (!props.legalName) {
      throw new Error('Legal name is required');
    }
    if (!props.customerType) {
      throw new Error('Customer type is required');
    }
    if (!props.registrationDate) {
      throw new Error('Registration date is required');
    }
    if (!props.customerSince) {
      throw new Error('Customer since date is required');
    }
    if (!props.primaryContact) {
      throw new Error('Primary contact information is required');
    }
    if (!props.riskProfile) {
      throw new Error('Risk profile is required');
    }
    if (typeof props.riskProfile.pdRate !== 'number' || props.riskProfile.pdRate < 0 || props.riskProfile.pdRate > 1) {
      throw new Error('PD rate must be between 0 and 1');
    }
    if (typeof props.riskProfile.lgdRate !== 'number' || props.riskProfile.lgdRate < 0 || props.riskProfile.lgdRate > 1) {
      throw new Error('LGD rate must be between 0 and 1');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  /**
   * Upgrade risk grade by specified levels
   */
  private upgradeRiskGrade(currentGrade: string, levels: number): string {
    const gradeHierarchy = [
      'excellent', 'very_good', 'good', 'average',
      'fair', 'weak', 'poor', 'very_poor', 'high_risk'
    ];

    const currentIndex = gradeHierarchy.indexOf(currentGrade.toLowerCase());
    if (currentIndex === -1) {
      return 'high_risk'; // Default to high risk if grade not found
    }

    const newIndex = Math.min(currentIndex + levels, gradeHierarchy.length - 1);
    return gradeHierarchy[newIndex];
  }

  /**
   * Customer risk grades
   */
  static readonly RISK_GRADES = {
    EXCELLENT: 'excellent',
    VERY_GOOD: 'very_good',
    GOOD: 'good',
    AVERAGE: 'average',
    FAIR: 'fair',
    WEAK: 'weak',
    POOR: 'poor',
    VERY_POOR: 'very_poor',
    HIGH_RISK: 'high_risk'
  } as const;

  /**
   * Customer types
   */
  static readonly CUSTOMER_TYPES = {
    INDIVIDUAL: 'individual',
    CORPORATE: 'corporate',
    SME: 'sme',
    MSME: 'msme',
    SYARIAH_INDIVIDUAL: 'syariah_individual',
    SYARIAH_CORPORATE: 'syariah_corporate'
  } as const;
}