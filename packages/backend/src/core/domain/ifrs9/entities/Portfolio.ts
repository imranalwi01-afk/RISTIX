// packages/backend/src/core/domain/ifrs9/entities/Portfolio.ts

import { Money } from '../../shared/value-objects/Money';
import { DateRange } from '../../shared/value-objects/DateRange';
import { Stage } from '../../shared/value-objects/Stage';
import { BaseEvent } from '../../shared/events/BaseEvent';

/**
 * Portfolio Entity - IFRS9 portfolio with business logic
 * Represents a collection of loans/credit facilities managed as a portfolio
 */

export interface PortfolioProps {
  id: string;
  portfolioCode: string;
  portfolioName: string;
  portfolioType: 'retail' | 'corporate' | 'sme' | 'syariah_retail' | 'syariah_corporate' | 'syariah_sme';
  managerId: string;
  managerName: string;
  currency: string;
  reportingDate: Date;
  period: DateRange;
  summary: {
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
  };
  riskMetrics: {
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
  };
  methodology: {
    eclModel: string;
    pdModel: string;
    lgdModel: string;
    eadModel: string;
    stagingModel: string;
    macroeconomicScenarios: string[];
    version: string;
    assumptions: Record<string, any>;
  };
  compliance: {
    ifrs9Compliant: boolean;
    lastValidationDate: Date;
    validationErrors: string[];
    regulatoryApprovals: string[];
    auditStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
}

export interface PortfolioRebalanceResult {
  portfolioId: string;
  previousRiskMetrics: {
    totalECL: Money;
    coverageRatio: number;
    averagePD: number;
    averageLGD: number;
  };
  newRiskMetrics: {
    totalECL: Money;
    coverageRatio: number;
    averagePD: number;
    averageLGD: number;
  };
  changes: {
    facilitiesAdded: number;
    facilitiesRemoved: number;
    facilitiesUpgraded: number;
    facilitiesDowngraded: number;
    totalOutstandingChange: Money;
    eclChange: Money;
    coverageRatioChange: number;
  };
  recommendations: string[];
  rebalanceDate: Date;
}

export interface PortfolioAllocationStrategy {
  strategyName: string;
  targetAllocations: {
    byStage: {
      stage1: number; // percentage
      stage2: number;
      stage3: number;
    };
    byRiskGrade: {
      aaa: number;
      aa: number;
      a: number;
      bbb: number;
      bb: number;
      b: number;
      ccc: number;
    };
    byIndustry: Record<string, number>;
    byProductType: Record<string, number>;
  };
  limits: {
    maxSingleBorrower: number; // percentage of total portfolio
    maxIndustryExposure: number;
    maxGeographicExposure: number;
    maxEADFacility: Money;
  };
  constraints: {
    minCoverageRatio: number;
    maxPD: number;
    maxLGD: number;
    maxConcentration: number;
  };
}

export class PortfolioRebalanced extends BaseEvent {
  constructor(
    aggregateId: string,
    data: {
      portfolioId: string;
      previousECL: number;
      newECL: number;
      facilitiesAffected: number;
      riskChange: number;
      rebalanceReason: string;
    },
    options?: {
      userId?: string;
      tenantId?: string;
      correlationId?: string;
      version?: number;
    }
  ) {
    super(aggregateId, 'Portfolio', data, options);
    this.validate();
  }

  protected validate(): void {
    if (!this.data.portfolioId) {
      throw new Error('Portfolio ID is required');
    }
    if (typeof this.data.previousECL !== 'number' || this.data.previousECL < 0) {
      throw new Error('Previous ECL must be a non-negative number');
    }
    if (typeof this.data.newECL !== 'number' || this.data.newECL < 0) {
      throw new Error('New ECL must be a non-negative number');
    }
  }
}

export class PortfolioValued extends BaseEvent {
  constructor(
    aggregateId: string,
    data: {
      portfolioId: string;
      totalOutstanding: number;
      totalEAD: number;
      totalECL: number;
      coverageRatio: number;
      valuationDate: Date;
      methodology: string;
    },
    options?: {
      userId?: string;
      tenantId?: string;
      correlationId?: string;
      version?: number;
    }
  ) {
    super(aggregateId, 'Portfolio', data, options);
    this.validate();
  }

  protected validate(): void {
    if (!this.data.portfolioId) {
      throw new Error('Portfolio ID is required');
    }
    if (typeof this.data.totalOutstanding !== 'number' || this.data.totalOutstanding < 0) {
      throw new Error('Total outstanding must be a non-negative number');
    }
    if (typeof this.data.totalECL !== 'number' || this.data.totalECL < 0) {
      throw new Error('Total ECL must be a non-negative number');
    }
  }
}

export class Portfolio {
  public readonly id: string;
  public readonly portfolioCode: string;
  public readonly portfolioName: string;
  public readonly portfolioType: 'retail' | 'corporate' | 'sme' | 'syariah_retail' | 'syariah_corporate' | 'syariah_sme';
  public readonly managerId: string;
  public readonly managerName: string;
  public readonly currency: string;
  public readonly reportingDate: Date;
  public readonly period: DateRange;
  public readonly summary: {
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
  };
  public readonly riskMetrics: {
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
  };
  public readonly methodology: {
    eclModel: string;
    pdModel: string;
    lgdModel: string;
    eadModel: string;
    stagingModel: string;
    macroeconomicScenarios: string[];
    version: string;
    assumptions: Record<string, any>;
  };
  public readonly compliance: {
    ifrs9Compliant: boolean;
    lastValidationDate: Date;
    validationErrors: string[];
    regulatoryApprovals: string[];
    auditStatus: 'pending' | 'in_progress' | 'completed' | 'failed';
  };
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly tenantId: string;

  constructor(props: PortfolioProps) {
    this.validate(props);
    this.id = props.id;
    this.portfolioCode = props.portfolioCode;
    this.portfolioName = props.portfolioName;
    this.portfolioType = props.portfolioType;
    this.managerId = props.managerId;
    this.managerName = props.managerName;
    this.currency = props.currency;
    this.reportingDate = props.reportingDate;
    this.period = props.period;
    this.summary = props.summary;
    this.riskMetrics = props.riskMetrics;
    this.methodology = props.methodology;
    this.compliance = props.compliance;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.tenantId = props.tenantId;
  }

  /**
   * Create a new Portfolio instance
   */
  static create(props: PortfolioProps): Portfolio {
    return new Portfolio(props);
  }

  /**
   * Rebalance portfolio based on target allocation strategy
   */
  rebalancePortfolio(strategy: PortfolioAllocationStrategy, changes: {
    facilitiesAdded?: number;
    facilitiesRemoved?: number;
    outstandingChange?: Money;
    eclChange?: Money;
    stageChanges?: {
      stage1ToStage2: number;
      stage2ToStage3: number;
      stage3ToStage2: number;
      stage2ToStage1: number;
    };
  }): PortfolioRebalanceResult {
    const previousRiskMetrics = {
      totalECL: this.summary.totalECL,
      coverageRatio: this.summary.coverageRatio,
      averagePD: this.summary.averagePD,
      averageLGD: this.summary.averageLGD
    };

    // Calculate new metrics based on changes
    let newTotalECL = this.summary.totalECL;
    let newTotalOutstanding = this.summary.totalOutstanding;
    let newStageDistribution = {
      stage1Count: this.summary.stage1Count,
      stage1Outstanding: this.summary.stage1Outstanding,
      stage1ECL: this.summary.stage1ECL,
      stage2Count: this.summary.stage2Count,
      stage2Outstanding: this.summary.stage2Outstanding,
      stage2ECL: this.summary.stage2ECL,
      stage3Count: this.summary.stage3Count,
      stage3Outstanding: this.summary.stage3Outstanding,
      stage3ECL: this.summary.stage3ECL
    };

    // Apply facility changes
    if (changes.facilitiesAdded) {
      // Assume new facilities are Stage 1 initially
      newStageDistribution.stage1Count += changes.facilitiesAdded;
      // Estimate average outstanding for new facilities
      const avgNewOutstanding = this.summary.totalOutstanding.amount / this.summary.totalFacilities;
      newStageDistribution.stage1Outstanding = newStageDistribution.stage1Outstanding.add(
        new Money(avgNewOutstanding * changes.facilitiesAdded, this.currency)
      );
      newTotalOutstanding = newTotalOutstanding.add(
        new Money(avgNewOutstanding * changes.facilitiesAdded, this.currency)
      );
    }

    if (changes.facilitiesRemoved) {
      // Assume removed facilities are proportionally distributed
      const removalRatio = changes.facilitiesRemoved / this.summary.totalFacilities;
      newStageDistribution.stage1Count -= Math.floor(changes.facilitiesRemoved * 0.7);
      newStageDistribution.stage2Count -= Math.floor(changes.facilitiesRemoved * 0.2);
      newStageDistribution.stage3Count -= Math.floor(changes.facilitiesRemoved * 0.1);
    }

    // Apply stage transitions
    if (changes.stageChanges) {
      const { stage1ToStage2, stage2ToStage3, stage3ToStage2, stage2ToStage1 } = changes.stageChanges;

      // Stage 1 to Stage 2
      if (stage1ToStage2 > 0) {
        const avgStage1Outstanding = newStageDistribution.stage1Outstanding.amount / newStageDistribution.stage1Count;
        const transferredOutstanding = new Money(avgStage1Outstanding * stage1ToStage2, this.currency);
        const transferredECL = transferredOutstanding.multiply(this.summary.averageLGD).multiply(0.05); // Stage 2 PD ~5%

        newStageDistribution.stage1Count -= stage1ToStage2;
        newStageDistribution.stage1Outstanding = newStageDistribution.stage1Outstanding.subtract(transferredOutstanding);
        newStageDistribution.stage1ECL = newStageDistribution.stage1ECL.subtract(transferredOutstanding.multiply(this.summary.averageLGD).multiply(0.01));

        newStageDistribution.stage2Count += stage1ToStage2;
        newStageDistribution.stage2Outstanding = newStageDistribution.stage2Outstanding.add(transferredOutstanding);
        newStageDistribution.stage2ECL = newStageDistribution.stage2ECL.add(transferredECL);
      }

      // Stage 2 to Stage 3
      if (stage2ToStage3 > 0) {
        const avgStage2Outstanding = newStageDistribution.stage2Outstanding.amount / newStageDistribution.stage2Count;
        const transferredOutstanding = new Money(avgStage2Outstanding * stage2ToStage3, this.currency);
        const transferredECL = transferredOutstanding.multiply(this.summary.averageLGD).multiply(0.15); // Stage 3 PD ~15%

        newStageDistribution.stage2Count -= stage2ToStage3;
        newStageDistribution.stage2Outstanding = newStageDistribution.stage2Outstanding.subtract(transferredOutstanding);
        newStageDistribution.stage2ECL = newStageDistribution.stage2ECL.subtract(transferredOutstanding.multiply(this.summary.averageLGD).multiply(0.05));

        newStageDistribution.stage3Count += stage2ToStage3;
        newStageDistribution.stage3Outstanding = newStageDistribution.stage3Outstanding.add(transferredOutstanding);
        newStageDistribution.stage3ECL = newStageDistribution.stage3ECL.add(transferredECL);
      }
    }

    // Apply outstanding and ECL changes
    if (changes.outstandingChange) {
      newTotalOutstanding = newTotalOutstanding.add(changes.outstandingChange);
    }

    if (changes.eclChange) {
      newTotalECL = newTotalECL.add(changes.eclChange);
    }

    // Calculate new totals and averages
    const totalNewECL = newStageDistribution.stage1ECL
      .add(newStageDistribution.stage2ECL)
      .add(newStageDistribution.stage3ECL);

    const newCoverageRatio = newTotalOutstanding.isZero() ? 0 :
      (totalNewECL.amount / newTotalOutstanding.amount) * 100;

    // Generate recommendations
    const recommendations: string[] = [];

    if (newCoverageRatio > strategy.constraints.minCoverageRatio * 1.2) {
      recommendations.push('Coverage ratio is significantly above minimum - consider optimizing provisioning');
    } else if (newCoverageRatio < strategy.constraints.minCoverageRatio) {
      recommendations.push('Coverage ratio below minimum - increase provisions or reduce risk exposure');
    }

    if (newStageDistribution.stage3Count > this.summary.stage3Count * 1.1) {
      recommendations.push('Stage 3 exposure increasing - review credit risk management');
    }

    const concentrationRisk = Math.max(
      this.riskMetrics.concentrationRisk.industryConcentration,
      this.riskMetrics.concentrationRisk.geographicConcentration,
      this.riskMetrics.concentrationRisk.borrowerConcentration
    );

    if (concentrationRisk > strategy.constraints.maxConcentration) {
      recommendations.push('Concentration risk exceeds limits - diversify portfolio');
    }

    return {
      portfolioId: this.id,
      previousRiskMetrics,
      newRiskMetrics: {
        totalECL: totalNewECL,
        coverageRatio: newCoverageRatio,
        averagePD: this.summary.averagePD, // Would need recalculation in real implementation
        averageLGD: this.summary.averageLGD
      },
      changes: {
        facilitiesAdded: changes.facilitiesAdded || 0,
        facilitiesRemoved: changes.facilitiesRemoved || 0,
        facilitiesUpgraded: changes.stageChanges?.stage3ToStage2 || 0,
        facilitiesDowngraded: (changes.stageChanges?.stage1ToStage2 || 0) + (changes.stageChanges?.stage2ToStage3 || 0),
        totalOutstandingChange: changes.outstandingChange || new Money(0, this.currency),
        eclChange: changes.eclChange || new Money(0, this.currency),
        coverageRatioChange: newCoverageRatio - this.summary.coverageRatio
      },
      recommendations,
      rebalanceDate: new Date()
    };
  }

  /**
   * Update portfolio summary with new calculations
   */
  updateSummary(newSummary: Partial<PortfolioProps['summary']>): Portfolio {
    return new Portfolio({
      ...this.toJSON(),
      summary: {
        ...this.summary,
        ...newSummary
      },
      updatedAt: new Date()
    });
  }

  /**
   * Update risk metrics
   */
  updateRiskMetrics(newMetrics: Partial<PortfolioProps['riskMetrics']>): Portfolio {
    return new Portfolio({
      ...this.toJSON(),
      riskMetrics: {
        ...this.riskMetrics,
        ...newMetrics
      },
      updatedAt: new Date()
    });
  }

  /**
   * Update methodology information
   */
  updateMethodology(newMethodology: Partial<PortfolioProps['methodology']>): Portfolio {
    return new Portfolio({
      ...this.toJSON(),
      methodology: {
        ...this.methodology,
        ...newMethodology
      },
      updatedAt: new Date()
    });
  }

  /**
   * Check if portfolio meets IFRS9 compliance requirements
   */
  validateIFRS9Compliance(): {
    isCompliant: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check coverage ratio
    if (this.summary.coverageRatio < 100) {
      errors.push('Coverage ratio below 100% - insufficient provisions');
    }

    // Check stage distribution
    const stage3Ratio = this.summary.stage3Count / this.summary.totalFacilities;
    if (stage3Ratio > 0.1) {
      warnings.push(`Stage 3 ratio ${(stage3Ratio * 100).toFixed(1)}% exceeds 10% threshold`);
    }

    // Check concentration risk
    const maxConcentration = Math.max(
      this.riskMetrics.concentrationRisk.industryConcentration,
      this.riskMetrics.concentrationRisk.geographicConcentration,
      this.riskMetrics.concentrationRisk.borrowerConcentration
    );

    if (maxConcentration > 0.25) {
      warnings.push(`Concentration risk ${(maxConcentration * 100).toFixed(1)}% exceeds 25% threshold`);
    }

    // Check economic capital adequacy
    if (this.riskMetrics.economicCapital.isZero()) {
      errors.push('Economic capital not calculated');
    }

    // Check methodology completeness
    if (!this.methodology.eclModel || !this.methodology.pdModel || !this.methodology.lgdModel) {
      errors.push('Incomplete methodology configuration');
    }

    const isCompliant = errors.length === 0;

    return { isCompliant, errors, warnings };
  }

  /**
   * Calculate portfolio performance metrics
   */
  calculatePerformanceMetrics(): {
    returnOnAssets: number;
    returnOnEquity: number;
    netInterestMargin: number;
    efficiencyRatio: number;
    riskAdjustedReturn: number;
  } {
    // These would typically be calculated from actual financial data
    // For now, providing placeholder calculations

    const roa = this.summary.totalEAD.isZero() ? 0 :
      (this.summary.totalOutstanding.amount * 0.05) / this.summary.totalEAD.amount; // Assume 5% yield

    const roe = roa * 10; // Assume 10x leverage ratio

    const nim = 0.025; // 2.5% net interest margin

    const efficiencyRatio = 0.65; // 65% efficiency ratio

    const riskAdjustedReturn = roa / (1 + this.summary.averagePD * this.summary.averageLGD);

    return {
      returnOnAssets: roa,
      returnOnEquity: roe,
      netInterestMargin: nim,
      efficiencyRatio,
      riskAdjustedReturn
    };
  }

  /**
   * Check if portfolio requires rebalancing
   */
  requiresRebalancing(strategy: PortfolioAllocationStrategy): boolean {
    const currentStageDistribution = {
      stage1: this.summary.stage1Outstanding.amount / this.summary.totalOutstanding.amount,
      stage2: this.summary.stage2Outstanding.amount / this.summary.totalOutstanding.amount,
      stage3: this.summary.stage3Outstanding.amount / this.summary.totalOutstanding.amount
    };

    // Check if current distribution deviates significantly from target
    const stageDeviation = Math.abs(currentStageDistribution.stage1 - strategy.targetAllocations.byStage.stage1) +
                           Math.abs(currentStageDistribution.stage2 - strategy.targetAllocations.byStage.stage2) +
                           Math.abs(currentStageDistribution.stage3 - strategy.targetAllocations.byStage.stage3);

    // Check if coverage ratio is within acceptable range
    const coverageWithinBounds = this.summary.coverageRatio >= strategy.constraints.minCoverageRatio &&
                                this.summary.coverageRatio <= strategy.constraints.minCoverageRatio * 1.5;

    // Check concentration risk
    const concentrationAcceptable = Math.max(
      this.riskMetrics.concentrationRisk.industryConcentration,
      this.riskMetrics.concentrationRisk.geographicConcentration,
      this.riskMetrics.concentrationRisk.borrowerConcentration
    ) <= strategy.constraints.maxConcentration;

    return stageDeviation > 0.2 || // More than 20% deviation from target
           !coverageWithinBounds ||
           !concentrationAcceptable ||
           this.summary.averagePD > strategy.constraints.maxPD ||
           this.summary.averageLGD > strategy.constraints.maxLGD;
  }

  /**
   * Get portfolio risk rating
   */
  getPortfolioRiskRating(): {
    rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
    score: number;
    factors: {
      pdScore: number;
      lgdScore: number;
      concentrationScore: number;
      diversificationScore: number;
    };
  } {
    // Calculate individual factor scores
    const pdScore = Math.max(0, 100 - (this.summary.averagePD * 1000)); // Lower PD = higher score
    const lgdScore = Math.max(0, 100 - (this.summary.averageLGD * 100)); // Lower LGD = higher score

    const maxConcentration = Math.max(
      this.riskMetrics.concentrationRisk.industryConcentration,
      this.riskMetrics.concentrationRisk.geographicConcentration,
      this.riskMetrics.concentrationRisk.borrowerConcentration
    );
    const concentrationScore = Math.max(0, 100 - (maxConcentration * 200)); // Lower concentration = higher score

    // Diversification score based on number of facilities and stage distribution
    const diversificationScore = Math.min(100, (this.summary.totalFacilities / 100) * 20 +
                                       (1 - maxConcentration) * 80);

    // Calculate overall score
    const overallScore = (pdScore * 0.3 + lgdScore * 0.2 + concentrationScore * 0.25 + diversificationScore * 0.25);

    // Determine rating
    let rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
    if (overallScore >= 95) rating = 'AAA';
    else if (overallScore >= 90) rating = 'AA';
    else if (overallScore >= 85) rating = 'A';
    else if (overallScore >= 80) rating = 'BBB';
    else if (overallScore >= 70) rating = 'BB';
    else if (overallScore >= 60) rating = 'B';
    else rating = 'CCC';

    return {
      rating,
      score: overallScore,
      factors: {
        pdScore,
        lgdScore,
        concentrationScore,
        diversificationScore
      }
    };
  }

  /**
   * Convert to JSON
   */
  toJSON(): PortfolioProps {
    return {
      id: this.id,
      portfolioCode: this.portfolioCode,
      portfolioName: this.portfolioName,
      portfolioType: this.portfolioType,
      managerId: this.managerId,
      managerName: this.managerName,
      currency: this.currency,
      reportingDate: this.reportingDate,
      period: this.period.toJSON(),
      summary: {
        ...this.summary,
        totalOutstanding: this.summary.totalOutstanding.toJSON(),
        totalEAD: this.summary.totalEAD.toJSON(),
        totalECL: this.summary.totalECL.toJSON(),
        stage1Outstanding: this.summary.stage1Outstanding.toJSON(),
        stage1ECL: this.summary.stage1ECL.toJSON(),
        stage2Outstanding: this.summary.stage2Outstanding.toJSON(),
        stage2ECL: this.summary.stage2ECL.toJSON(),
        stage3Outstanding: this.summary.stage3Outstanding.toJSON(),
        stage3ECL: this.summary.stage3ECL.toJSON()
      },
      riskMetrics: {
        ...this.riskMetrics,
        valueAtRisk: this.riskMetrics.valueAtRisk.toJSON(),
        expectedLoss: this.riskMetrics.expectedLoss.toJSON(),
        unexpectedLoss: this.riskMetrics.unexpectedLoss.toJSON(),
        economicCapital: this.riskMetrics.economicCapital.toJSON(),
        riskWeightedAssets: this.riskMetrics.riskWeightedAssets.toJSON()
      },
      methodology: this.methodology,
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
  static fromJSON(props: PortfolioProps): Portfolio {
    return new Portfolio({
      ...props,
      period: DateRange.fromJSON(props.period),
      summary: {
        ...props.summary,
        totalOutstanding: Money.fromJSON(props.summary.totalOutstanding),
        totalEAD: Money.fromJSON(props.summary.totalEAD),
        totalECL: Money.fromJSON(props.summary.totalECL),
        stage1Outstanding: Money.fromJSON(props.summary.stage1Outstanding),
        stage1ECL: Money.fromJSON(props.summary.stage1ECL),
        stage2Outstanding: Money.fromJSON(props.summary.stage2Outstanding),
        stage2ECL: Money.fromJSON(props.summary.stage2ECL),
        stage3Outstanding: Money.fromJSON(props.summary.stage3Outstanding),
        stage3ECL: Money.fromJSON(props.summary.stage3ECL)
      },
      riskMetrics: {
        ...props.riskMetrics,
        valueAtRisk: Money.fromJSON(props.riskMetrics.valueAtRisk),
        expectedLoss: Money.fromJSON(props.riskMetrics.expectedLoss),
        unexpectedLoss: Money.fromJSON(props.riskMetrics.unexpectedLoss),
        economicCapital: Money.fromJSON(props.riskMetrics.economicCapital),
        riskWeightedAssets: Money.fromJSON(props.riskMetrics.riskWeightedAssets)
      }
    });
  }

  /**
   * Validate portfolio properties
   */
  private validate(props: PortfolioProps): void {
    if (!props.id) {
      throw new Error('Portfolio ID is required');
    }
    if (!props.portfolioCode) {
      throw new Error('Portfolio code is required');
    }
    if (!props.portfolioName) {
      throw new Error('Portfolio name is required');
    }
    if (!props.portfolioType) {
      throw new Error('Portfolio type is required');
    }
    if (!props.managerId) {
      throw new Error('Manager ID is required');
    }
    if (!props.currency) {
      throw new Error('Currency is required');
    }
    if (!props.reportingDate) {
      throw new Error('Reporting date is required');
    }
    if (!props.period) {
      throw new Error('Period is required');
    }
    if (!props.summary) {
      throw new Error('Summary is required');
    }
    if (props.summary.totalFacilities < 0) {
      throw new Error('Total facilities must be non-negative');
    }
    if (props.summary.coverageRatio < 0) {
      throw new Error('Coverage ratio must be non-negative');
    }
    if (props.summary.averagePD < 0 || props.summary.averagePD > 1) {
      throw new Error('Average PD must be between 0 and 1');
    }
    if (props.summary.averageLGD < 0 || props.summary.averageLGD > 1) {
      throw new Error('Average LGD must be between 0 and 1');
    }
    if (!props.tenantId) {
      throw new Error('Tenant ID is required');
    }
  }

  /**
   * Portfolio types
   */
  static readonly PORTFOLIO_TYPES = {
    RETAIL: 'retail',
    CORPORATE: 'corporate',
    SME: 'sme',
    SYARIAH_RETAIL: 'syariah_retail',
    SYARIAH_CORPORATE: 'syariah_corporate',
    SYARIAH_SME: 'syariah_sme'
  } as const;
}