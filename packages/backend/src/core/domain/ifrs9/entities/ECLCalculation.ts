// packages/backend/src/core/domain/ifrs9/entities/ECLCalculation.ts

import { Money } from '../../shared/value-objects/Money';
import { DateRange } from '../../shared/value-Objects/DateRange';
import { BaseEvent } from '../../shared/events/BaseEvent';

/**
 * ECL Calculation Entity - IFRS9 Expected Credit Loss calculation
 * Represents a complete ECL calculation with inputs, outputs, and metadata
 */

export interface ECLCalculationProps {
  id: string;
  loanId: string;
  calculationDate: Date;
  reportingDate: Date;
  calculationPeriod: DateRange;
  eclAmount: Money;
  stage12MonthECL?: Money;
  stageLifetimeECL?: Money;
  pdRate: number;
  lgdRate: number;
  eadAmount: Money;
  riskParameters: {
    macroEconomicFactors?: Record<string, number>;
    qualitativeAdjustments?: number;
    forwardLookingAdjustments?: number;
  };
  methodology: {
    modelType: string;
    version: string;
    assumptions: Record<string, any>;
  };
  status: 'pending' | 'running' | 'completed' | 'failed';
  errorMessage?: string;
  executionTime?: number;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
}

export class ECLCalculationCompleted extends BaseEvent {
  constructor(
    aggregateId: string,
    data: {
      calculationId: string;
      loanId: string;
      eclAmount: number;
      stage12MonthECL?: number;
      stageLifetimeECL?: number;
      pdRate: number;
      lgdRate: number;
      eadAmount: number;
      executionTime: number;
    },
    options?: {
      userId?: string;
      tenantId?: string;
      correlationId?: string;
      version?: number;
    }
  ) {
    super(aggregateId, 'ECLCalculation', data, options);
    this.validate();
  }

  protected validate(): void {
    if (!this.data.calculationId) {
      throw new Error('Calculation ID is required');
    }
    if (!this.data.loanId) {
      throw new Error('Loan ID is required');
    }
    if (typeof this.data.eclAmount !== 'number' || this.data.eclAmount < 0) {
      throw new Error('ECL amount must be a non-negative number');
    }
    if (typeof this.data.pdRate !== 'number' || this.data.pdRate < 0 || this.data.pdRate > 1) {
      throw new Error('PD rate must be between 0 and 1');
    }
    if (typeof this.data.lgdRate !== 'number' || this.data.lgdRate < 0 || this.data.lgdRate > 1) {
      throw new Error('LGD rate must be between 0 and 1');
    }
    if (typeof this.data.eadAmount !== 'number' || this.data.eadAmount < 0) {
      throw new Error('EAD amount must be a non-negative number');
    }
    if (typeof this.data.executionTime !== 'number' || this.data.executionTime < 0) {
      throw new Error('Execution time must be a non-negative number');
    }
  }
}

export class ECLCalculation {
  public readonly id: string;
  public readonly loanId: string;
  public readonly calculationDate: Date;
  public readonly reportingDate: Date;
  public readonly calculationPeriod: DateRange;
  public readonly eclAmount: Money;
  public readonly stage12MonthECL?: Money;
  public readonly stageLifetimeECL?: Money;
  public readonly pdRate: number;
  public readonly lgdRate: number;
  public readonly eadAmount: Money;
  public readonly riskParameters: {
    macroEconomicFactors?: Record<string, number>;
    qualitativeAdjustments?: number;
    forwardLookingAdjustments?: number;
  };
  public readonly methodology: {
    modelType: string;
    version: string;
    assumptions: Record<string, any>;
  };
  public readonly status: 'pending' | 'running' | 'completed' | 'failed';
  public readonly errorMessage?: string;
  public readonly executionTime?: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly tenantId: string;
  public readonly createdBy: string;
  public readonly approvedBy?: string;
  public readonly approvedAt?: Date;

  constructor(props: ECLCalculationProps) {
    this.validate(props);
    this.id = props.id;
    this.loanId = props.loanId;
    this.calculationDate = props.calculationDate;
    this.reportingDate = props.reportingDate;
    this.calculationPeriod = props.calculationPeriod;
    this.eclAmount = props.eclAmount;
    this.stage12MonthECL = props.stage12MonthECL;
    this.stageLifetimeECL = props.stageLifetimeECL;
    this.pdRate = props.pdRate;
    this.lgdRate = props.lgdRate;
    this.eadAmount = props.eadAmount;
    this.riskParameters = props.riskParameters;
    this.methodology = props.methodology;
    this.status = props.status;
    this.errorMessage = props.errorMessage;
    this.executionTime = props.executionTime;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.tenantId = props.tenantId;
    this.createdBy = props.createdBy;
    this.approvedBy = props.approvedBy;
    this.approvedAt = props.approvedAt;
  }

  /**
   * Create a new ECL Calculation
   */
  static create(props: ECLCalculationProps): ECLCalculation {
    return new ECLCalculation(props);
  }

  /**
   * Start calculation
   */
  startCalculation(): ECLCalculation {
    if (this.status !== 'pending') {
      throw new Error(`Cannot start calculation in status: ${this.status}`);
    }

    return new ECLCalculation({
      ...this.toJSON(),
      status: 'running',
      updatedAt: new Date()
    });
  }

  /**
   * Complete calculation with results
   */
  completeCalculation(results: {
    eclAmount: Money;
    stage12MonthECL?: Money;
    stageLifetimeECL?: Money;
    executionTime: number;
  }): ECLCalculation {
    if (this.status !== 'running') {
      throw new Error(`Cannot complete calculation in status: ${this.status}`);
    }

    return new ECLCalculation({
      ...this.toJSON(),
      eclAmount: results.eclAmount,
      stage12MonthECL: results.stage12MonthECL,
      stageLifetimeECL: results.stageLifetimeECL,
      executionTime: results.executionTime,
      status: 'completed',
      updatedAt: new Date()
    });
  }

  /**
   * Fail calculation with error
   */
  failCalculation(errorMessage: string, executionTime?: number): ECLCalculation {
    if (this.status !== 'running') {
      throw new Error(`Cannot fail calculation in status: ${this.status}`);
    }

    return new ECLCalculation({
      ...this.toJSON(),
      status: 'failed',
      errorMessage,
      executionTime,
      updatedAt: new Date()
    });
  }

  /**
   * Approve calculation
   */
  approve(approvedBy: string): ECLCalculation {
    if (this.status !== 'completed') {
      throw new Error('Cannot approve calculation that is not completed');
    }

    return new ECLCalculation({
      ...this.toJSON(),
      approvedBy,
      approvedAt: new Date(),
      updatedAt: new Date()
    });
  }

  /**
   * Check if calculation is ready for execution
   */
  isReadyForExecution(): boolean {
    return this.status === 'pending' && (!this.approvedBy || this.approvedAt);
  }

  /**
   * Check if calculation has been approved
   */
  isApproved(): boolean {
    return !!(this.approvedBy && this.approvedAt);
  }

  /**
   * Check if calculation is completed
   */
  isCompleted(): boolean {
    return this.status === 'completed';
  }

  /**
   * Check if calculation failed
   */
  isFailed(): boolean {
    return this.status === 'failed';
  }

  /**
   * Check if calculation is running
   */
  isRunning(): boolean {
    return this.status === 'running';
  }

  /**
   * Get total ECL (12-month + lifetime)
   */
  getTotalECL(): Money {
    let total = this.eclAmount;

    if (this.stage12MonthECL) {
      total = total.add(this.stage12MonthECL);
    }

    if (this.stageLifetimeECL) {
      total = total.add(this.stageLifetimeECL);
    }

    return total;
  }

  /**
   * Get ECL as percentage of EAD
   */
  getECLAsPercentageOfEAD(): number {
    if (this.eadAmount.isZero()) {
      return 0;
    }
    return (this.eclAmount.amount / this.eadAmount.amount) * 100;
  }

  /**
   * Update risk parameters
   */
  updateRiskParameters(riskParameters: {
    macroEconomicFactors?: Record<string, number>;
    qualitativeAdjustments?: number;
    forwardLookingAdjustments?: number;
  }): ECLCalculation {
    return new ECLCalculation({
      ...this.toJSON(),
      riskParameters: {
        ...this.riskParameters,
        ...riskParameters
      },
      updatedAt: new Date()
    });
  }

  /**
   * Calculate risk-adjusted ECL
   */
  calculateRiskAdjustedECL(): Money {
    let adjustedECL = this.eclAmount;

    if (this.riskParameters.qualitativeAdjustments) {
      const adjustmentFactor = 1 + (this.riskParameters.qualitativeAdjustments / 100);
      adjustedECL = adjustedECL.multiply(adjustmentFactor);
    }

    if (this.riskParameters.forwardLookingAdjustments) {
      const forwardFactor = 1 + (this.riskParameters.forwardLookingAdjustments / 100);
      adjustedECL = adjustedECL.multiply(forwardFactor);
    }

    return adjustedECL;
  }

  /**
   * Convert to JSON
   */
  toJSON(): ECLCalculationProps {
    return {
      id: this.id,
      loanId: this.loanId,
      calculationDate: this.calculationDate,
      reportingDate: this.reportingDate,
      calculationPeriod: this.calculationPeriod.toJSON(),
      eclAmount: this.eclAmount.toJSON(),
      stage12MonthECL: this.stage12MonthECL?.toJSON(),
      stageLifetimeECL: this.stageLifetimeECL?.toJSON(),
      pdRate: this.pdRate,
      lgdRate: this.lgdRate,
      eadAmount: this.eadAmount.toJSON(),
      riskParameters: this.riskParameters,
      methodology: this.methodology,
      status: this.status,
      errorMessage: this.errorMessage,
      executionTime: this.executionTime,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tenantId: this.tenantId,
      createdBy: this.createdBy,
      approvedBy: this.approvedBy,
      approvedAt: this.approvedAt
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(props: ECLCalculationProps): ECLCalculation {
    return new ECLCalculation({
      ...props,
      calculationPeriod: DateRange.fromJSON(props.calculationPeriod),
      eclAmount: Money.fromJSON(props.eclAmount),
      stage12MonthECL: props.stage12MonthECL ? Money.fromJSON(props.stage12MonthECL) : undefined,
      stageLifetimeECL: props.stageLifetimeECL ? Money.fromJSON(props.stageLifetimeECL) : undefined,
      eadAmount: Money.fromJSON(props.eadAmount)
    });
  }

  /**
   * Validate ECL calculation properties
   */
  private validate(props: ECLCalculationProps): void {
    if (!props.id) {
      throw new Error('ECL calculation ID is required');
    }
    if (!props.loanId) {
      throw new Error('Loan ID is required');
    }
    if (!props.calculationDate) {
      throw new Error('Calculation date is required');
    }
    if (!props.reportingDate) {
      throw new Error('Reporting date is required');
    }
    if (!props.calculationPeriod) {
      throw new Error('Calculation period is required');
    }
    if (!props.eclAmount) {
      throw new Error('ECL amount is required');
    }
    if (!props.eadAmount) {
      throw new Error('EAD amount is required');
    }
    if (typeof props.pdRate !== 'number' || props.pdRate < 0 || props.pdRate > 1) {
      throw new Error('PD rate must be between 0 and 1');
    }
    if (typeof props.lgdRate !== 'number' || props.lgdRate < 0 || props.lgdRate > 1) {
      throw new Error('LGD rate must be between 0 and 1');
    }
    if (!['pending', 'running', 'completed', 'failed'].includes(props.status)) {
      throw new Error('Invalid status value');
    }
    if (props.executionTime && props.executionTime < 0) {
      throw new Error('Execution time must be non-negative');
    }
    if (!props.methodology) {
      throw new Error('Methodology information is required');
    }
    if (!props.methodology.modelType) {
      throw new Error('Model type is required');
    }
    if (!props.methodology.version) {
      throw new Error('Model version is required');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
    if (!props.createdBy) {
      throw new Error('Created by is required');
    }
  }

  /**
   * Common ECL calculation types
   */
  static readonly MODEL_TYPES = {
    PD_LGD_EAD: 'PD_LGD_EAD',
    RISK_WEIGHTED: 'RISK_WEIGHTED',
    DISCOUNTED_CASH_FLOW: 'DISCOUNTED_CASH_FLOW',
    ROLL_RATE: 'ROLL_RATE'
  } as const;

  /**
   * Common calculation methodologies
   */
  static readonly METHODOLOGIES = {
    IFRS9_STANDARD: 'IFRS9_STANDARD',
    BASELINE: 'BASELINES',
    ADVANCED: 'ADVANCED',
    CUSTOM: 'CUSTOM'
  } as const;
}