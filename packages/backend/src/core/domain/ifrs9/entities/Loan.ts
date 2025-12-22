// packages/backend/src/core/domain/ifrs9/entities/Loan.ts

import { Money } from '../../shared/value-objects/Money';
import { Stage } from '../../shared/value-objects/Stage';
import { DateRange } from '../../shared/value-objects/DateRange';
import { BaseEvent } from '../../shared/events/BaseEvent';

/**
 * Loan Entity - IFRS9 loan with business logic
 * Represents a single loan/credit facility
 */

export interface LoanProps {
  id: string;
  customerId: string;
  productId: string;
  accountNumber: string;
  outstandingBalance: Money;
  originalBalance: Money;
  currency: string;
  originationDate: Date;
  maturityDate?: Date;
  interestRate: number;
  currentStage: Stage;
  previousStage?: Stage;
  lastStageChangeDate?: Date;
  daysPastDue?: number;
  pdRate?: number;
  lgdRate?: number;
  eadRate?: number;
  collateralValue?: Money;
  riskGrade?: string;
  segment?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface LoanStageAssessmentResult {
  newStage: Stage;
  previousStage: Stage;
  stageChanged: boolean;
  reason: string;
  riskFactors: string[];
}

export class LoanStageChanged extends BaseEvent {
  constructor(
    aggregateId: string,
    data: {
      loanId: string;
      previousStage: number;
      newStage: number;
      reason: string;
      riskFactors: string[];
    },
    options?: {
      userId?: string;
      tenantId?: string;
      correlationId?: string;
      version?: number;
    }
  ) {
    super(aggregateId, 'Loan', data, options);
    this.validate();
  }

  protected validate(): void {
    if (!this.data.loanId) {
      throw new Error('Loan ID is required');
    }
    if (typeof this.data.previousStage !== 'number' || this.data.previousStage < 1 || this.data.previousStage > 3) {
      throw new Error('Previous stage must be a valid stage number (1-3)');
    }
    if (typeof this.data.newStage !== 'number' || this.data.newStage < 1 || this.data.newStage > 3) {
      throw new Error('New stage must be a valid stage number (1-3)');
    }
    if (!this.data.reason) {
      throw new Error('Stage change reason is required');
    }
  }
}

export class Loan {
  public readonly id: string;
  public readonly customerId: string;
  public readonly productId: string;
  public readonly accountNumber: string;
  public readonly outstandingBalance: Money;
  public readonly originalBalance: Money;
  public readonly currency: string;
  public readonly originationDate: Date;
  public readonly maturityDate?: Date;
  public readonly interestRate: number;
  public readonly currentStage: Stage;
  public readonly previousStage?: Stage;
  public readonly lastStageChangeDate?: Date;
  public readonly daysPastDue?: number;
  public readonly pdRate?: number;
  public readonly lgdRate?: number;
  public readonly eadRate?: number;
  public readonly collateralValue?: Money;
  public readonly riskGrade?: string;
  public readonly segment?: string;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly tenantId: string;

  constructor(props: LoanProps) {
    this.validate(props);
    this.id = props.id;
    this.customerId = props.customerId;
    this.productId = props.productId;
    this.accountNumber = props.accountNumber;
    this.outstandingBalance = props.outstandingBalance;
    this.originalBalance = props.originalBalance;
    this.currency = props.currency;
    this.originationDate = props.originationDate;
    this.maturityDate = props.maturityDate;
    this.interestRate = props.interestRate;
    this.currentStage = props.currentStage;
    this.previousStage = props.previousStage;
    this.lastStageChangeDate = props.lastStageChangeDate;
    this.daysPastDue = props.daysPastDue;
    this.pdRate = props.pdRate;
    this.lgdRate = props.lgdRate;
    this.eadRate = props.eadRate;
    this.collateralValue = props.collateralValue;
    this.riskGrade = props.riskGrade;
    this.segment = props.segment;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.tenantId = props.tenantId;
  }

  /**
   * Create a new Loan instance
   */
  static create(props: LoanProps): Loan {
    return new Loan(props);
  }

  /**
   * Assess the loan stage based on IFRS9 criteria
   */
  assessStage(options: {
    daysPastDue?: number;
    creditQualityIndicators?: string[];
    collateralCoverage?: number;
  } = {}): LoanStageAssessmentResult {
    const previousStage = this.currentStage;
    let newStage = previousStage;
    let stageChanged = false;
    const reason: string[] = [];
    const riskFactors: string[] = [];

    // IFRS9 Stage assessment logic
    const daysPastDue = options.daysPastDue ?? this.daysPastDue ?? 0;

    // Check for Stage 2 or 3 indicators
    if (daysPastDue >= 90) {
      newStage = Stage.stage3();
      reason.push('90+ days past due');
      riskFactors.push('Significant payment default');
      stageChanged = true;
    } else if (daysPastDue >= 30) {
      newStage = Stage.stage2();
      reason.push('30-89 days past due');
      riskFactors.push('Payment delinquency');
      stageChanged = true;
    }

    // Check for other significant deterioration
    if (options.creditQualityIndicators) {
      const hasSignificantDeterioration = options.creditQualityIndicators.some(
        indicator => this.isSignificantDeterioration(indicator)
      );

      if (hasSignificantDeterioration && previousStage.isStage1()) {
        newStage = Stage.stage2();
        reason.push('Significant credit quality deterioration');
        riskFactors.push('Credit quality downgrade');
        stageChanged = true;
      }
    }

    // Check collateral coverage
    const collateralCoverage = options.collateralCoverage ?? this.calculateCollateralCoverage();
    if (collateralCoverage < 0.8 && previousStage.isStage1()) {
      newStage = Stage.stage2();
      reason.push('Inadequate collateral coverage');
      riskFactors.push('Low collateral coverage');
      stageChanged = true;
    }

    return {
      newStage,
      previousStage,
      stageChanged,
      reason: reason.join('; '),
      riskFactors
    };
  }

  /**
   * Update loan stage
   */
  updateStage(newStage: Stage, reason: string, options?: {
    userId?: string;
    correlationId?: string;
  }): Loan {
    const updatedLoan = new Loan({
      ...this.toJSON(),
      previousStage: this.currentStage,
      currentStage: newStage,
      lastStageChangeDate: new Date(),
      updatedAt: new Date()
    });

    return updatedLoan;
  }

  /**
   * Calculate ECL for this loan
   */
  calculateECL(): Money {
    const ead = this.calculateEAD();
    const pd = this.pdRate ?? 0;
    const lgd = this.lgdRate ?? 0;

    const eclAmount = ead.multiply(pd).multiply(lgd);
    return eclAmount;
  }

  /**
   * Calculate Exposure at Default (EAD)
   */
  calculateEAD(): Money {
    // EAD = Outstanding Balance * (1 + Recovery Rate)
    // For simplicity, we'll use outstanding balance as EAD
    // In a real implementation, this would include undrawn commitments, etc.
    return this.outstandingBalance;
  }

  /**
   * Calculate collateral coverage ratio
   */
  calculateCollateralCoverage(): number {
    if (!this.collateralValue || this.collateralValue.isZero()) {
      return 0;
    }
    return this.outstandingBalance.amount / this.collateralValue.amount;
  }

  /**
   * Check if loan is performing
   */
  isPerforming(): boolean {
    return this.currentStage.isStage1() && (!this.daysPastDue || this.daysPastDue < 30);
  }

  /**
   * Check if loan is impaired
   */
  isImpaired(): boolean {
    return this.currentStage.isImpaired();
  }

  /**
   * Check if loan is due for stage assessment
   */
  isDueForAssessment(): boolean {
    // Assess monthly or when significant changes occur
    const now = new Date();
    const lastAssessment = this.lastStageChangeDate || this.createdAt;
    const daysSinceLastAssessment = Math.floor((now.getTime() - lastAssessment.getTime()) / (1000 * 60 * 60 * 24));

    return daysSinceLastAssessment >= 30;
  }

  /**
   * Get loan age in months
   */
  getAgeInMonths(): number {
    const now = new Date();
    const monthsDiff = (now.getFullYear() - this.originationDate.getFullYear()) * 12 +
                     (now.getMonth() - this.originationDate.getMonth());
    return monthsDiff;
  }

  /**
   * Get remaining term in months
   */
  getRemainingTermInMonths(): number {
    if (!this.maturityDate) {
      return 0;
    }
    const now = new Date();
    const monthsDiff = (this.maturityDate.getFullYear() - now.getFullYear()) * 12 +
                     (this.maturityDate.getMonth() - now.getMonth());
    return Math.max(0, monthsDiff);
  }

  /**
   * Update outstanding balance
   */
  updateOutstandingBalance(newBalance: Money): Loan {
    if (!newBalance.currency.equals(this.outstandingBalance.currency)) {
      throw new Error('Currency mismatch');
    }

    return new Loan({
      ...this.toJSON(),
      outstandingBalance: newBalance,
      updatedAt: new Date()
    });
  }

  /**
   * Deactivate loan
   */
  deactivate(): Loan {
    return new Loan({
      ...this.toJSON(),
      isActive: false,
      updatedAt: new Date()
    });
  }

  /**
   * Reactivate loan
   */
  reactivate(): Loan {
    return new Loan({
      ...this.toJSON(),
      isActive: true,
      updatedAt: new Date()
    });
  }

  /**
   * Convert to JSON
   */
  toJSON(): LoanProps {
    return {
      id: this.id,
      customerId: this.customerId,
      productId: this.productId,
      accountNumber: this.accountNumber,
      outstandingBalance: this.outstandingBalance.toJSON(),
      originalBalance: this.originalBalance.toJSON(),
      currency: this.currency,
      originationDate: this.originationDate,
      maturityDate: this.maturityDate,
      interestRate: this.interestRate,
      currentStage: this.currentStage.number,
      previousStage: this.previousStage?.number,
      lastStageChangeDate: this.lastStageChangeDate,
      daysPastDue: this.daysPastDue,
      pdRate: this.pdRate,
      lgdRate: this.lgdRate,
      eadRate: this.eadRate,
      collateralValue: this.collateralValue?.toJSON(),
      riskGrade: this.riskGrade,
      segment: this.segment,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tenantId: this.tenantId
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(props: LoanProps): Loan {
    return new Loan({
      ...props,
      outstandingBalance: Money.fromJSON(props.outstandingBalance),
      originalBalance: Money.fromJSON(props.originalBalance),
      currentStage: Stage.create(props.currentStage),
      previousStage: props.previousStage ? Stage.create(props.previousStage) : undefined,
      collateralValue: props.collateralValue ? Money.fromJSON(props.collateralValue) : undefined
    });
  }

  /**
   * Validate loan properties
   */
  private validate(props: LoanProps): void {
    if (!props.id) {
      throw new Error('Loan ID is required');
    }
    if (!props.customerId) {
      throw new Error('Customer ID is required');
    }
    if (!props.productId) {
      throw new Error('Product ID is required');
    }
    if (!props.accountNumber) {
      throw new Error('Account number is required');
    }
    if (!props.outstandingBalance) {
      throw new Error('Outstanding balance is required');
    }
    if (!props.currency) {
      throw new Error('Currency is required');
    }
    if (!props.originationDate) {
      throw new Error('Origination date is required');
    }
    if (props.maturityDate && props.maturityDate <= props.originationDate) {
      throw new Error('Maturity date must be after origination date');
    }
    if (props.interestRate < 0 || props.interestRate > 1) {
      throw new Error('Interest rate must be between 0 and 1');
    }
    if (!props.currentStage) {
      throw new Error('Current stage is required');
    }
    if (props.pdRate && (props.pdRate < 0 || props.pdRate > 1)) {
      throw new Error('PD rate must be between 0 and 1');
    }
    if (props.lgdRate && (props.lgdRate < 0 || props.lgdRate > 1)) {
      throw new Error('LGD rate must be between 0 and 1');
    }
    if (props.eadRate && (props.eadRate < 0 || props.eadRate > 1)) {
      throw new Error('EAD rate must be between 0 and 1');
    }
  }

  /**
   * Check if indicator represents significant deterioration
   */
  private isSignificantDeterioration(indicator: string): boolean {
    const significantIndicators = [
      'credit_rating_downgrade',
      'financial_distress',
      'bankruptcy_filing',
      'missed_payments_increase',
      'cash_flow_issues',
      'collateral_devaluation'
    ];

    return significantIndicators.some(sig => indicator.toLowerCase().includes(sig));
  }
}