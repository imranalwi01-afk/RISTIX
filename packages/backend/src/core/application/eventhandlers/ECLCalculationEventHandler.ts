// packages/backend/src/core/application/eventhandlers/ECLCalculationEventHandler.ts

import { IEventHandler } from '../../domain/shared/events/IEventBus';
import { ECLCalculationCompleted } from '../../domain/ifrs9/entities/ECLCalculation';
import { IECLCalculationService } from '../../domain/ifrs9/services/IECLCalculationService';
import { ILoanRepository } from '../../domain/ifrs9/repositories/ILoanRepository';
import { IPortfolioRepository } from '../../domain/ifrs9/repositories/IPortfolioRepository';
import { Logger } from '@nestjs/common';
import { EventBus } from '../../domain/shared/events/EventBus';

/**
 * Event Handler for ECL Calculation related domain events
 * Handles side effects and read model updates when ECL calculation events occur
 */

export class ECLCalculationEventHandler implements IEventHandler<ECLCalculationCompleted> {
  private readonly logger = new Logger(ECLCalculationEventHandler.name);

  constructor(
    private readonly eclCalculationService: IECLCalculationService,
    private readonly loanRepository: ILoanRepository,
    private readonly portfolioRepository: IPortfolioRepository,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Handle ECL calculation completion events
   */
  async handle(event: ECLCalculationCompleted): Promise<void> {
    try {
      this.logger.log(`Handling ECL calculation completion event: ${event.id}`);

      // 1. Update ECL calculation read model
      await this.updateECLCalculationReadModel(event);

      // 2. Update loan ECL values
      await this.updateLoanECLValues(event);

      // 3. Update portfolio ECL statistics
      await this.updatePortfolioECLStatistics(event);

      // 4. Check for regulatory reporting requirements
      await this.checkRegulatoryReportingRequirements(event);

      // 5. Trigger downstream processes
      await this.triggerDownstreamProcesses(event);

      // 6. Update provisioning and accounting
      await this.updateProvisioningAccounting(event);

      this.logger.log(`Successfully processed ECL calculation completion event: ${event.id}`);
    } catch (error) {
      this.logger.error(`Error handling ECL calculation completion event: ${event.id}`, error);
      throw error;
    }
  }

  /**
   * Update ECL calculation read model for query optimization
   */
  private async updateECLCalculationReadModel(event: ECLCalculationCompleted): Promise<void> {
    // Update calculation summary for fast queries
    const calculationSummary = {
      calculationId: event.data.calculationId,
      loanId: event.data.loanId,
      calculationDate: new Date(),
      executionTime: event.data.executionTime,
      methodology: {
        modelType: 'PD_LGD_EAD',
        assumptions: {
          pdRate: event.data.pdRate,
          lgdRate: event.data.lgdRate,
          eadAmount: event.data.eadAmount
        }
      },
      results: {
        eclAmount: event.data.eclAmount,
        stage12MonthECL: event.data.stage12MonthECL,
        stageLifetimeECL: event.data.stageLifetimeECL,
        totalECL: this.calculateTotalECL(event.data)
      },
      status: 'completed',
      completedAt: new Date()
    };

    // This would typically update a read model database
    await this.updateECLCalculationSummaryReadModel(calculationSummary);
  }

  /**
   * Update loan ECL values
   */
  private async updateLoanECLValues(event: ECLCalculationCompleted): Promise<void> {
    const loan = await this.loanRepository.findById(event.data.loanId);
    if (!loan) {
      this.logger.warn(`Loan not found for ECL calculation event: ${event.id}`);
      return;
    }

    // Update loan ECL values
    const loanECLUpdate = {
      loanId: event.data.loanId,
      currentECL: event.data.eclAmount,
      stage12MonthECL: event.data.stage12MonthECL,
      stageLifetimeECL: event.data.stageLifetimeECL,
      lastCalculationDate: new Date(),
      calculationMethodology: 'PD_LGD_EAD',
      calculationId: event.data.calculationId
    };

    // Publish loan ECL update event
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'LOAN_ECL_VALUES_UPDATED',
      aggregateId: event.data.loanId,
      aggregateType: 'Loan',
      data: loanECLUpdate,
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });

    this.logger.log(`Updated ECL values for loan: ${event.data.loanId}`);
  }

  /**
   * Update portfolio ECL statistics
   */
  private async updatePortfolioECLStatistics(event: ECLCalculationCompleted): Promise<void> {
    const loan = await this.loanRepository.findById(event.data.loanId);
    if (!loan) return;

    // Get portfolio statistics including this loan
    const portfolioStats = await this.loanRepository.getStatistics({
      // Add portfolio-specific filters if needed
    });

    // Calculate updated portfolio ECL metrics
    const updatedPortfolioMetrics = {
      totalECL: portfolioStats.totalECL + event.data.eclAmount,
      averageECL: (portfolioStats.totalECL + event.data.eclAmount) / portfolioStats.totalLoans,
      eclDistribution: {
        stage1: this.calculateStageECLDistribution(portfolioStats, 'stage1'),
        stage2: this.calculateStageECLDistribution(portfolioStats, 'stage2'),
        stage3: this.calculateStageECLDistribution(portfolioStats, 'stage3')
      },
      coverageRatio: this.calculateUpdatedCoverageRatio(portfolioStats, event.data.eclAmount),
      lastUpdated: new Date()
    };

    // Publish portfolio ECL update event
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'PORTFOLIO_ECL_STATISTICS_UPDATED',
      aggregateId: 'portfolio',
      aggregateType: 'Portfolio',
      data: {
        portfolioId: 'portfolio', // This would be determined from loan's portfolio
        updatedMetrics: updatedPortfolioMetrics,
        calculationTrigger: {
          calculationId: event.data.calculationId,
          loanId: event.data.loanId,
          eclAmount: event.data.eclAmount
        }
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });

    this.logger.log(`Updated portfolio ECL statistics for calculation: ${event.data.calculationId}`);
  }

  /**
   * Check for regulatory reporting requirements
   */
  private async checkRegulatoryReportingRequirements(event: ECLCalculationCompleted): Promise<void> {
    const loan = await this.loanRepository.findById(event.data.loanId);
    if (!loan) return;

    const reportingRequirements = this.assessReportingRequirements(event, loan);

    if (reportingRequirements.requiresReporting) {
      await this.scheduleRegulatoryReporting(event.data.calculationId, reportingRequirements);
    }

    // Check for material change notifications
    if (reportingRequirements.isMaterialChange) {
      await this.triggerMaterialChangeNotification(event, loan);
    }
  }

  /**
   * Trigger downstream processes
   */
  private async triggerDownstreamProcesses(event: ECLCalculationCompleted): Promise<void> {
    const loan = await this.loanRepository.findById(event.data.loanId);
    if (!loan) return;

    // 1. Trigger provisioning calculation
    await this.triggerProvisioningCalculation(event.data.loanId, event.data.eclAmount);

    // 2. Update risk monitoring
    await this.updateRiskMonitoring(event.data.loanId, event.data.eclAmount);

    // 3. Check for portfolio rebalancing needs
    await this.checkPortfolioRebalancingNeeds(event, loan);

    // 4. Update capital requirements
    await this.updateCapitalRequirements(event.data.loanId, event.data.eclAmount);
  }

  /**
   * Update provisioning and accounting
   */
  private async updateProvisioningAccounting(event: ECLCalculationCompleted): Promise<void> {
    const loan = await this.loanRepository.findById(event.data.loanId);
    if (!loan) return;

    // Calculate provisioning requirements
    const provisioningCalculation = {
      loanId: event.data.loanId,
      calculationId: event.data.calculationId,
      currentECL: event.data.eclAmount,
      stage12MonthECL: event.data.stage12MonthECL,
      stageLifetimeECL: event.data.stageLifetimeECL,
      loanStage: loan.currentStage.number,
      provisioningRequirement: this.calculateProvisioningRequirement(event, loan),
      accountingEntries: this.generateAccountingEntries(event, loan)
    };

    // Publish provisioning update event
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'PROVISIONING_CALCULATION_TRIGGERED',
      aggregateId: event.data.loanId,
      aggregateType: 'Loan',
      data: provisioningCalculation,
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });

    this.logger.log(`Triggered provisioning calculation for loan: ${event.data.loanId}`);
  }

  /**
   * Update ECL calculation summary read model
   */
  private async updateECLCalculationSummaryReadModel(summary: any): Promise<void> {
    // This would typically update a NoSQL database or read-optimized SQL table
    this.logger.log(`Updating ECL calculation summary read model for calculation: ${summary.calculationId}`);
  }

  /**
   * Calculate total ECL
   */
  private calculateTotalECL(data: any): number {
    let total = data.eclAmount || 0;
    if (data.stage12MonthECL) total += data.stage12MonthECL;
    if (data.stageLifetimeECL) total += data.stageLifetimeECL;
    return total;
  }

  /**
   * Calculate stage ECL distribution
   */
  private calculateStageECLDistribution(portfolioStats: any, stage: string): number {
    // This would calculate the ECL distribution by stage
    // Implementation depends on available portfolio statistics
    return portfolioStats.stageDistribution[stage] || 0;
  }

  /**
   * Calculate updated coverage ratio
   */
  private calculateUpdatedCoverageRatio(portfolioStats: any, newECLAmount: number): number {
    const totalOutstanding = portfolioStats.totalOutstanding;
    const totalECL = portfolioStats.totalECL + newECLAmount;

    if (totalOutstanding === 0) return 0;
    return (totalECL / totalOutstanding) * 100;
  }

  /**
   * Assess reporting requirements
   */
  private assessReportingRequirements(event: ECLCalculationCompleted, loan: any): any {
    const eclPercentage = (event.data.eclAmount / loan.outstandingBalance.amount) * 100;
    const isLargeExposure = loan.outstandingBalance.amount > 10000000; // > $10M
    const isHighRisk = loan.currentStage.number > 1;

    return {
      requiresReporting: eclPercentage > 5 || isLargeExposure || isHighRisk,
      isMaterialChange: eclPercentage > 10,
      reportingType: this.determineReportingType(eclPercentage, isLargeExposure, isHighRisk),
      urgency: this.determineReportingUrgency(eclPercentage, isLargeExposure, isHighRisk)
    };
  }

  /**
   * Determine reporting type
   */
  private determineReportingType(eclPercentage: number, isLargeExposure: boolean, isHighRisk: boolean): string {
    if (eclPercentage > 20 || (isLargeExposure && isHighRisk)) {
      return 'comprehensive';
    } else if (eclPercentage > 10 || isLargeExposure || isHighRisk) {
      return 'detailed';
    } else if (eclPercentage > 5) {
      return 'summary';
    }
    return 'standard';
  }

  /**
   * Determine reporting urgency
   */
  private determineReportingUrgency(eclPercentage: number, isLargeExposure: boolean, isHighRisk: boolean): string {
    if (eclPercentage > 20 || (isLargeExposure && isHighRisk)) {
      return 'immediate';
    } else if (eclPercentage > 10 || isLargeExposure || isHighRisk) {
      return 'high';
    } else if (eclPercentage > 5) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Schedule regulatory reporting
   */
  private async scheduleRegulatoryReporting(calculationId: string, requirements: any): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'REGULATORY_ECL_REPORTING_SCHEDULED',
      aggregateId: calculationId,
      aggregateType: 'ECLCalculation',
      data: {
        calculationId,
        reportingType: requirements.reportingType,
        urgency: requirements.urgency,
        dueDate: this.calculateReportingDueDate(requirements.urgency),
        recipients: this.determineReportingRecipients(requirements.reportingType)
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Calculate reporting due date
   */
  private calculateReportingDueDate(urgency: string): Date {
    const now = new Date();
    switch (urgency) {
      case 'immediate':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      case 'high':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case 'medium':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      case 'low':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }

  /**
   * Determine reporting recipients
   */
  private determineReportingRecipients(reportingType: string): string[] {
    switch (reportingType) {
      case 'comprehensive':
        return ['risk_manager', 'compliance', 'board', 'regulator', 'audit'];
      case 'detailed':
        return ['risk_manager', 'compliance', 'board'];
      case 'summary':
        return ['risk_manager', 'compliance'];
      default:
        return ['risk_manager'];
    }
  }

  /**
   * Trigger material change notification
   */
  private async triggerMaterialChangeNotification(event: ECLCalculationCompleted, loan: any): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'MATERIAL_ECL_CHANGE_NOTIFICATION',
      aggregateId: event.data.loanId,
      aggregateType: 'Loan',
      data: {
        loanId: event.data.loanId,
        calculationId: event.data.calculationId,
        previousECL: 0, // This would be fetched from previous calculation
        newECL: event.data.eclAmount,
        percentageChange: 100, // Would calculate actual percentage
        materiality: 'high',
        requiresBoardApproval: true,
        notificationReason: 'Material ECL increase requires board notification'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Trigger provisioning calculation
   */
  private async triggerProvisioningCalculation(loanId: string, eclAmount: number): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'PROVISIONING_CALCULATION_TRIGGERED',
      aggregateId: loanId,
      aggregateType: 'Loan',
      data: {
        loanId,
        eclAmount,
        calculationType: 'ECL_BASED',
        priority: 'high'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Update risk monitoring
   */
  private async updateRiskMonitoring(loanId: string, eclAmount: number): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'RISK_MONITORING_UPDATED',
      aggregateId: loanId,
      aggregateType: 'Loan',
      data: {
        loanId,
        eclAmount,
        riskLevel: this.assessRiskLevel(eclAmount),
        monitoringActions: this.determineMonitoringActions(eclAmount),
        nextReviewDate: this.calculateNextReviewDate(eclAmount)
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Check portfolio rebalancing needs
   */
  private async checkPortfolioRebalancingNeeds(event: ECLCalculationCompleted, loan: any): Promise<void> {
    // This would check if the portfolio needs rebalancing based on the new ECL calculation
    const rebalancingNeeded = await this.assessRebalancingNeeds(event, loan);

    if (rebalancingNeeded.required) {
      await this.eventBus.publish({
        id: require('uuid').v4(),
        type: 'PORTFOLIO_REBALANCING_REQUIRED',
        aggregateId: 'portfolio',
        aggregateType: 'Portfolio',
        data: {
          portfolioId: 'portfolio', // Would be determined from loan
          triggerLoanId: event.data.loanId,
          triggerCalculationId: event.data.calculationId,
          triggerECLAmount: event.data.eclAmount,
          rebalancingReason: rebalancingNeeded.reason,
          recommendedActions: rebalancingNeeded.actions
        },
        metadata: {
          timestamp: new Date(),
          version: 1
        }
      });
    }
  }

  /**
   * Update capital requirements
   */
  private async updateCapitalRequirements(loanId: string, eclAmount: number): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'CAPITAL_REQUIREMENTS_UPDATED',
      aggregateId: loanId,
      aggregateType: 'Loan',
      data: {
        loanId,
        eclAmount,
        expectedLoss: eclAmount,
        riskWeightedAssets: this.calculateRiskWeightedAssets(eclAmount),
        capitalRequirement: this.calculateCapitalRequirement(eclAmount),
        economicCapital: this.calculateEconomicCapital(eclAmount)
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Calculate provisioning requirement
   */
  private calculateProvisioningRequirement(event: ECLCalculationCompleted, loan: any): any {
    const baseProvision = event.data.eclAmount;
    const stage = loan.currentStage.number;

    return {
      stage12MonthProvision: stage === 1 ? event.data.stage12MonthECL : 0,
      lifetimeProvision: stage > 1 ? event.data.stageLifetimeECL : 0,
      totalProvision: baseProvision,
      provisioningRatio: (baseProvision / loan.outstandingBalance.amount) * 100
    };
  }

  /**
   * Generate accounting entries
   */
  private generateAccountingEntries(event: ECLCalculationCompleted, loan: any): any[] {
    const entries = [];

    // Debit: Provision Expense
    entries.push({
      accountCode: '610001', // Provision Expense
      accountName: 'ECL Provision Expense',
      debitAmount: event.data.eclAmount,
      creditAmount: 0,
      description: `ECL provision for loan ${loan.accountNumber}`
    });

    // Credit: Provision Allowance
    entries.push({
      accountCode: '120001', // Provision Allowance
      accountName: 'ECL Provision Allowance',
      debitAmount: 0,
      creditAmount: event.data.eclAmount,
      description: `ECL provision for loan ${loan.accountNumber}`
    });

    return entries;
  }

  /**
   * Assess risk level
   */
  private assessRiskLevel(eclAmount: number): string {
    // This would assess risk level based on ECL amount and other factors
    if (eclAmount > 1000000) return 'high';
    if (eclAmount > 100000) return 'medium';
    return 'low';
  }

  /**
   * Determine monitoring actions
   */
  private determineMonitoringActions(eclAmount: number): string[] {
    const actions = [];

    if (eclAmount > 1000000) {
      actions.push('enhanced_monitoring');
      actions.push('weekly_review');
    } else if (eclAmount > 100000) {
      actions.push('monthly_review');
    }

    return actions;
  }

  /**
   * Calculate next review date
   */
  private calculateNextReviewDate(eclAmount: number): Date {
    const now = new Date();
    if (eclAmount > 1000000) {
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 1 week
    } else if (eclAmount > 100000) {
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 1 month
    }
    return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000); // 3 months
  }

  /**
   * Assess rebalancing needs
   */
  private async assessRebalancingNeeds(event: ECLCalculationCompleted, loan: any): Promise<any> {
    // This would assess if portfolio rebalancing is needed
    // For now, returning placeholder logic
    return {
      required: event.data.eclAmount > 500000, // > $500k ECL
      reason: 'High ECL amount requires portfolio review',
      actions: ['reassess_portfolio_risk', 'consider_diversification']
    };
  }

  /**
   * Calculate risk weighted assets
   */
  private calculateRiskWeightedAssets(eclAmount: number): number {
    // This would calculate risk-weighted assets based on regulatory formulas
    return eclAmount * 1.5; // Placeholder calculation
  }

  /**
   * Calculate capital requirement
   */
  private calculateCapitalRequirement(eclAmount: number): number {
    // This would calculate capital requirement based on regulatory formulas
    return eclAmount * 0.08; // 8% capital requirement
  }

  /**
   * Calculate economic capital
   */
  private calculateEconomicCapital(eclAmount: number): number {
    // This would calculate economic capital based on VaR and other models
    return eclAmount * 0.12; // Placeholder calculation
  }
}