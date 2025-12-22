// packages/backend/src/core/application/eventhandlers/LoanEventHandler.ts

import { IEventHandler } from '../../domain/shared/events/IEventBus';
import { LoanStageChanged } from '../../domain/ifrs9/entities/Loan';
import { ILoanRepository } from '../../domain/ifrs9/repositories/ILoanRepository';
import { ICustomerRepository } from '../../domain/ifrs9/repositories/ICustomerRepository';
import { IPortfolioRepository } from '../../domain/ifrs9/repositories/IPortfolioRepository';
import { Logger } from '@nestjs/common';
import { EventBus } from '../../domain/shared/events/EventBus';

/**
 * Event Handler for Loan-related domain events
 * Handles side effects and read model updates when loan events occur
 */

export class LoanEventHandler implements IEventHandler<LoanStageChanged> {
  private readonly logger = new Logger(LoanEventHandler.name);

  constructor(
    private readonly loanRepository: ILoanRepository,
    private readonly customerRepository: ICustomerRepository,
    private readonly portfolioRepository: IPortfolioRepository,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Handle loan stage change events
   */
  async handle(event: LoanStageChanged): Promise<void> {
    try {
      this.logger.log(`Handling loan stage change event: ${event.id}`);

      // 1. Update loan in read model
      await this.updateLoanReadModel(event);

      // 2. Update customer risk metrics
      await this.updateCustomerRiskMetrics(event);

      // 3. Update portfolio statistics
      await this.updatePortfolioStatistics(event);

      // 4. Check for automatic actions
      await this.processAutomaticActions(event);

      // 5. Publish notification events
      await this.publishNotifications(event);

      this.logger.log(`Successfully processed loan stage change event: ${event.id}`);
    } catch (error) {
      this.logger.error(`Error handling loan stage change event: ${event.id}`, error);
      throw error;
    }
  }

  /**
   * Update loan read model for query optimization
   */
  private async updateLoanReadModel(event: LoanStageChanged): Promise<void> {
    const loan = await this.loanRepository.findById(event.aggregateId);
    if (!loan) {
      this.logger.warn(`Loan not found for event: ${event.id}`);
      return;
    }

    // Update loan summary for fast queries
    const loanSummary = {
      loanId: loan.id,
      customerId: loan.customerId,
      accountNumber: loan.accountNumber,
      currentStage: event.data.newStage,
      previousStage: event.data.previousStage,
      stageChangeDate: new Date(),
      stageChangeReason: event.data.reason,
      outstandingBalance: loan.outstandingBalance.amount,
      isImpaired: loan.isImpaired(),
      lastUpdated: new Date()
    };

    // This would typically update a read model database
    await this.updateLoanSummaryReadModel(loanSummary);
  }

  /**
   * Update customer risk metrics based on loan stage changes
   */
  private async updateCustomerRiskMetrics(event: LoanStageChanged): Promise<void> {
    const loan = await this.loanRepository.findById(event.aggregateId);
    if (!loan) return;

    const customer = await this.customerRepository.findById(loan.customerId);
    if (!customer) return;

    // Get all loans for the customer
    const customerLoans = await this.loanRepository.findByCustomerId(loan.customerId);

    // Calculate new risk metrics
    const activeLoans = customerLoans.filter(l => l.isActive);
    const totalOutstanding = activeLoans.reduce((sum, l) => sum + l.outstandingBalance.amount, 0);
    const impairedLoans = activeLoans.filter(l => l.isImpaired());
    const impairedOutstanding = impairedLoans.reduce((sum, l) => sum + l.outstandingBalance.amount, 0);

    const stageDistribution = {
      stage1: activeLoans.filter(l => l.currentStage.isStage1()).length,
      stage2: activeLoans.filter(l => l.currentStage.isStage2()).length,
      stage3: activeLoans.filter(l => l.currentStage.isStage3()).length
    };

    // Update customer banking relationship
    await this.customerRepository.updateBankingRelationship(customer.id, {
      totalAccounts: activeLoans.length,
      activeAccounts: activeLoans.length,
      totalExposure: {
        amount: totalOutstanding,
        currency: loan.currency
      } as any,
      performingExposure: {
        amount: totalOutstanding - impairedOutstanding,
        currency: loan.currency
      } as any,
      impairedExposure: {
        amount: impairedOutstanding,
        currency: loan.currency
      } as any,
      relationshipScore: this.calculateRelationshipScore(stageDistribution, impairedLoans.length)
    });
  }

  /**
   * Update portfolio statistics for reporting
   */
  private async updatePortfolioStatistics(event: LoanStageChanged): Promise<void> {
    const loan = await this.loanRepository.findById(event.aggregateId);
    if (!loan) return;

    // Get portfolio statistics
    const portfolioStats = await this.loanRepository.getStatistics({
      // Add portfolio-specific filters if needed
    });

    // Update portfolio summary
    const portfolioSummary = {
      totalFacilities: portfolioStats.totalLoans,
      totalOutstanding: portfolioStats.totalOutstanding,
      stageDistribution: portfolioStats.stageDistribution,
      impairmentRatio: portfolioStats.impairmentRatio,
      averagePD: portfolioStats.averagePD,
      averageLGD: portfolioStats.averageLGD,
      lastUpdated: new Date()
    };

    // This would update a portfolio read model
    await this.updatePortfolioReadModel(loan.id, portfolioSummary);
  }

  /**
   * Process automatic actions based on stage changes
   */
  private async processAutomaticActions(event: LoanStageChanged): Promise<void> {
    const loan = await this.loanRepository.findById(event.aggregateId);
    if (!loan) return;

    // Automatic actions based on stage transitions
    if (event.data.newStage === 3) { // Stage 3
      // Trigger immediate ECL recalculation
      await this.triggerECLRecalculation(loan.id);

      // Set up enhanced monitoring
      await this.setupEnhancedMonitoring(loan.id);

      // Notify relationship manager
      await this.notifyRelationshipManager(loan.id, 'stage3_transition');
    }

    if (event.data.newStage === 2 && event.data.previousStage === 1) { // Stage 1 to 2
      // Schedule customer risk reassessment
      await this.scheduleCustomerRiskReassessment(loan.customerId);

      // Update credit limit if necessary
      await this.reviewCreditLimit(loan.customerId);
    }

    if (event.data.newStage === 1 && event.data.previousStage > 1) { // Recovery
      // Remove enhanced monitoring
      await this.removeEnhancedMonitoring(loan.id);

      // Schedule credit limit review
      await this.scheduleCreditLimitReview(loan.customerId);
    }
  }

  /**
   * Publish notification events
   */
  private async publishNotifications(event: LoanStageChanged): Promise<void> {
    const loan = await this.loanRepository.findById(event.aggregateId);
    if (!loan) return;

    const customer = await this.customerRepository.findById(loan.customerId);
    if (!customer) return;

    // Publish notification events
    const notificationData = {
      loanId: loan.id,
      customerId: customer.id,
      customerName: customer.legalName,
      accountNumber: loan.accountNumber,
      previousStage: event.data.previousStage,
      newStage: event.data.newStage,
      reason: event.data.reason,
      outstandingBalance: loan.outstandingBalance.amount,
      timestamp: new Date()
    };

    // Different notifications based on stage change type
    if (event.data.newStage === 3) {
      // High-priority notification for Stage 3
      await this.publishHighPriorityNotification({
        type: 'LOAN_STAGE_THREE',
        data: notificationData,
        recipients: ['relationship_manager', 'risk_manager', 'compliance'],
        priority: 'high'
      });
    } else if (event.data.newStage === 2) {
      // Medium-priority notification for Stage 2
      await this.publishMediumPriorityNotification({
        type: 'LOAN_STAGE_TWO',
        data: notificationData,
        recipients: ['relationship_manager', 'risk_manager'],
        priority: 'medium'
      });
    } else if (event.data.newStage === 1 && event.data.previousStage > 1) {
      // Recovery notification
      await this.publishRecoveryNotification({
        type: 'LOAN_RECOVERY',
        data: notificationData,
        recipients: ['relationship_manager', 'collections'],
        priority: 'medium'
      });
    }
  }

  /**
   * Calculate relationship score based on portfolio health
   */
  private calculateRelationshipScore(stageDistribution: any, impairedCount: number): number {
    const totalLoans = stageDistribution.stage1 + stageDistribution.stage2 + stageDistribution.stage3;
    if (totalLoans === 0) return 0;

    // Base score calculation
    let score = 100;

    // Deduct points for impaired loans
    score -= (impairedCount / totalLoans) * 50;

    // Deduct points for Stage 3 loans
    score -= (stageDistribution.stage3 / totalLoans) * 30;

    // Deduct points for Stage 2 loans
    score -= (stageDistribution.stage2 / totalLoans) * 15;

    return Math.max(0, Math.round(score));
  }

  /**
   * Update loan summary read model
   */
  private async updateLoanSummaryReadModel(summary: any): Promise<void> {
    // This would typically update a NoSQL database or read-optimized SQL table
    // Implementation depends on the chosen read model storage
    this.logger.log(`Updating loan summary read model for loan: ${summary.loanId}`);
  }

  /**
   * Update portfolio read model
   */
  private async updatePortfolioReadModel(loanId: string, summary: any): Promise<void> {
    // This would update portfolio-level read models for reporting
    this.logger.log(`Updating portfolio read model for loan: ${loanId}`);
  }

  /**
   * Trigger ECL recalculation
   */
  private async triggerECLRecalculation(loanId: string): Promise<void> {
    // Publish event to trigger ECL calculation
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'ECL_RECALCULATION_TRIGGERED',
      aggregateId: loanId,
      aggregateType: 'Loan',
      data: {
        loanId,
        reason: 'Stage 3 transition',
        priority: 'high'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Setup enhanced monitoring
   */
  private async setupEnhancedMonitoring(loanId: string): Promise<void> {
    // Publish event to setup enhanced monitoring
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'ENHANCED_MONITORING_SETUP',
      aggregateId: loanId,
      aggregateType: 'Loan',
      data: {
        loanId,
        monitoringLevel: 'enhanced',
        triggers: ['payment_delay', 'balance_increase', 'credit_utilization']
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Remove enhanced monitoring
   */
  private async removeEnhancedMonitoring(loanId: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'ENHANCED_MONITORING_REMOVED',
      aggregateId: loanId,
      aggregateType: 'Loan',
      data: {
        loanId,
        reason: 'Loan recovery to Stage 1'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Schedule customer risk reassessment
   */
  private async scheduleCustomerRiskReassessment(customerId: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'CUSTOMER_RISK_REASSESSMENT_SCHEDULED',
      aggregateId: customerId,
      aggregateType: 'Customer',
      data: {
        customerId,
        reason: 'Loan transitioned to Stage 2',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        priority: 'medium'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Review credit limit
   */
  private async reviewCreditLimit(customerId: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'CREDIT_LIMIT_REVIEW_REQUESTED',
      aggregateId: customerId,
      aggregateType: 'Customer',
      data: {
        customerId,
        reason: 'Portfolio risk profile change',
        reviewType: 'automatic'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Schedule credit limit review
   */
  private async scheduleCreditLimitReview(customerId: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'CREDIT_LIMIT_REVIEW_SCHEDULED',
      aggregateId: customerId,
      aggregateType: 'Customer',
      data: {
        customerId,
        reason: 'Loan recovery to Stage 1',
        scheduledDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        priority: 'low'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Notify relationship manager
   */
  private async notifyRelationshipManager(loanId: string, reason: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'RELATIONSHIP_MANAGER_NOTIFICATION',
      aggregateId: loanId,
      aggregateType: 'Loan',
      data: {
        loanId,
        notificationType: reason,
        urgency: 'high',
        requiresAction: true
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Publish high priority notification
   */
  private async publishHighPriorityNotification(notification: any): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'HIGH_PRIORITY_NOTIFICATION',
      aggregateId: notification.data.loanId,
      aggregateType: 'Loan',
      data: notification,
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Publish medium priority notification
   */
  private async publishMediumPriorityNotification(notification: any): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'MEDIUM_PRIORITY_NOTIFICATION',
      aggregateId: notification.data.loanId,
      aggregateType: 'Loan',
      data: notification,
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Publish recovery notification
   */
  private async publishRecoveryNotification(notification: any): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'RECOVERY_NOTIFICATION',
      aggregateId: notification.data.loanId,
      aggregateType: 'Loan',
      data: notification,
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }
}