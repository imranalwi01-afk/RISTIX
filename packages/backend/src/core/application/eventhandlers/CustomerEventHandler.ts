// packages/backend/src/core/application/eventhandlers/CustomerEventHandler.ts

import { IEventHandler } from '../../domain/shared/events/IEventBus';
import { CustomerRiskAssessed } from '../../domain/ifrs9/entities/Customer';
import { ICustomerRepository } from '../../domain/ifrs9/repositories/ICustomerRepository';
import { ILoanRepository } from '../../domain/ifrs9/repositories/ILoanRepository';
import { Logger } from '@nestjs/common';
import { EventBus } from '../../domain/shared/events/EventBus';

/**
 * Event Handler for Customer-related domain events
 * Handles side effects and read model updates when customer events occur
 */

export class CustomerEventHandler implements IEventHandler<CustomerRiskAssessed> {
  private readonly logger = new Logger(CustomerEventHandler.name);

  constructor(
    private readonly customerRepository: ICustomerRepository,
    private readonly loanRepository: ILoanRepository,
    private readonly eventBus: EventBus
  ) {}

  /**
   * Handle customer risk assessment events
   */
  async handle(event: CustomerRiskAssessed): Promise<void> {
    try {
      this.logger.log(`Handling customer risk assessment event: ${event.id}`);

      // 1. Update customer read model
      await this.updateCustomerReadModel(event);

      // 2. Update loan portfolio risk parameters
      await this.updateLoanRiskParameters(event);

      // 3. Check for automatic credit limit actions
      await this.processCreditLimitActions(event);

      // 4. Update monitoring and alerting
      await this.updateCustomerMonitoring(event);

      // 5. Generate compliance and audit events
      await this.generateComplianceEvents(event);

      this.logger.log(`Successfully processed customer risk assessment event: ${event.id}`);
    } catch (error) {
      this.logger.error(`Error handling customer risk assessment event: ${event.id}`, error);
      throw error;
    }
  }

  /**
   * Update customer read model for query optimization
   */
  private async updateCustomerReadModel(event: CustomerRiskAssessed): Promise<void> {
    const customer = await this.customerRepository.findById(event.data.customerId);
    if (!customer) {
      this.logger.warn(`Customer not found for event: ${event.id}`);
      return;
    }

    // Update customer summary for fast queries
    const customerSummary = {
      customerId: customer.id,
      customerNumber: customer.customerNumber,
      legalName: customer.legalName,
      customerType: customer.customerType,
      currentRiskGrade: event.data.newRiskGrade,
      previousRiskGrade: event.data.previousRiskGrade,
      riskGradeChanged: event.data.riskGradeChanged,
      pdRate: event.data.newPD,
      lgdRate: event.data.newLGD,
      creditLimit: customer.riskProfile.creditLimit.amount,
      totalExposure: customer.bankingRelationship.totalExposure.amount,
      lastAssessmentDate: event.metadata.timestamp,
      nextReviewDate: event.data.nextReviewDate,
      isHighRisk: this.isHighRiskCustomer(event.data.newRiskGrade, event.data.newPD),
      requiresEnhancedMonitoring: this.requiresEnhancedMonitoring(customer, event.data.newRiskGrade),
      lastUpdated: new Date()
    };

    // This would typically update a read model database
    await this.updateCustomerSummaryReadModel(customerSummary);
  }

  /**
   * Update loan portfolio risk parameters based on customer risk changes
   */
  private async updateLoanRiskParameters(event: CustomerRiskAssessed): Promise<void> {
    const customer = await this.customerRepository.findById(event.data.customerId);
    if (!customer) return;

    // Get all active loans for the customer
    const customerLoans = await this.loanRepository.findByCustomerId(event.data.customerId);
    const activeLoans = customerLoans.filter(loan => loan.isActive);

    if (activeLoans.length === 0) return;

    // Update risk parameters for customer's loans
    const riskParameterUpdates = activeLoans.map(loan => ({
      loanId: loan.id,
      customerId: customer.id,
      newPD: event.data.newPD,
      newLGD: event.data.newLGD,
      reason: `Customer risk grade changed from ${event.data.previousRiskGrade} to ${event.data.newRiskGrade}`,
      updatedBy: event.metadata.userId
    }));

    // Publish bulk risk parameter update event
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'BULK_LOAN_RISK_PARAMETERS_UPDATED',
      aggregateId: event.data.customerId,
      aggregateType: 'Customer',
      data: {
        customerId: event.data.customerId,
        updates: riskParameterUpdates,
        assessmentReason: event.data.reason,
        assessmentFactors: event.data.assessmentFactors
      },
      metadata: {
        timestamp: new Date(),
        userId: event.metadata.userId,
        tenantId: event.metadata.tenantId,
        version: 1
      }
    });

    this.logger.log(`Triggered bulk risk parameter update for ${activeLoans.length} loans`);
  }

  /**
   * Process automatic credit limit actions based on risk assessment
   */
  private async processCreditLimitActions(event: CustomerRiskAssessed): Promise<void> {
    const customer = await this.customerRepository.findById(event.data.customerId);
    if (!customer) return;

    const creditLimitChange = event.data.creditLimitAdjustment;

    if (creditLimitChange.amount !== 0) {
      // Publish credit limit adjustment event
      await this.eventBus.publish({
        id: require('uuid').v4(),
        type: 'CREDIT_LIMIT_AUTOMATIC_ADJUSTMENT',
        aggregateId: event.data.customerId,
        aggregateType: 'Customer',
        data: {
          customerId: event.data.customerId,
          currentCreditLimit: customer.riskProfile.creditLimit.amount,
          adjustmentAmount: creditLimitChange.amount,
          newCreditLimit: customer.riskProfile.creditLimit.amount + creditLimitChange.amount,
          adjustmentReason: event.data.reason,
          assessmentFactors: event.data.assessmentFactors,
          automaticAdjustment: true
        },
        metadata: {
          timestamp: new Date(),
          userId: event.metadata.userId,
          tenantId: event.metadata.tenantId,
          version: 1
        }
      });

      this.logger.log(`Automatic credit limit adjustment: ${creditLimitChange.amount} for customer ${event.data.customerId}`);
    }

    // Check if manual review is needed
    if (this.requiresManualCreditReview(event)) {
      await this.scheduleCreditLimitReview(event.data.customerId, 'risk_assessment_change');
    }
  }

  /**
   * Update customer monitoring and alerting
   */
  private async updateCustomerMonitoring(event: CustomerRiskAssessed): Promise<void> {
    const customer = await this.customerRepository.findById(event.data.customerId);
    if (!customer) return;

    const isHighRisk = this.isHighRiskCustomer(event.data.newRiskGrade, event.data.newPD);
    const requiresEnhancedMonitoring = this.requiresEnhancedMonitoring(customer, event.data.newRiskGrade);

    // Update monitoring level if needed
    if (isHighRisk && !requiresEnhancedMonitoring) {
      await this.setupEnhancedCustomerMonitoring(event.data.customerId, 'high_risk_assessment');
    } else if (!isHighRisk && requiresEnhancedMonitoring) {
      await this.removeEnhancedCustomerMonitoring(event.data.customerId, 'risk_improvement');
    }

    // Update alerting thresholds
    await this.updateCustomerAlertingThresholds(event.data.customerId, {
      newRiskGrade: event.data.newRiskGrade,
      newPD: event.data.newPD,
      newLGD: event.data.newLGD
    });

    // Check for immediate alerts
    if (this.requiresImmediateAlert(event)) {
      await this.triggerImmediateCustomerAlert(event);
    }
  }

  /**
   * Generate compliance and audit events
   */
  private async generateComplianceEvents(event: CustomerRiskAssessed): Promise<void> {
    const customer = await this.customerRepository.findById(event.data.customerId);
    if (!customer) return;

    // Generate audit trail event
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'CUSTOMER_RISK_ASSESSMENT_AUDIT',
      aggregateId: event.data.customerId,
      aggregateType: 'Customer',
      data: {
        customerId: event.data.customerId,
        customerNumber: customer.customerNumber,
        assessmentDate: event.metadata.timestamp,
        previousRiskGrade: event.data.previousRiskGrade,
        newRiskGrade: event.data.newRiskGrade,
        previousPD: event.data.previousPD,
        newPD: event.data.newPD,
        assessmentFactors: event.data.assessmentFactors,
        creditLimitAdjustment: event.data.creditLimitAdjustment.amount,
        assessedBy: event.metadata.userId,
        complianceNotes: this.generateComplianceNotes(event)
      },
      metadata: {
        timestamp: new Date(),
        userId: event.metadata.userId,
        tenantId: event.metadata.tenantId,
        correlationId: event.metadata.correlationId,
        version: 1
      }
    });

    // Check for regulatory reporting requirements
    if (this.requiresRegulatoryReporting(event)) {
      await this.scheduleRegulatoryReporting(event.data.customerId);
    }
  }

  /**
   * Update customer summary read model
   */
  private async updateCustomerSummaryReadModel(summary: any): Promise<void> {
    // This would typically update a NoSQL database or read-optimized SQL table
    this.logger.log(`Updating customer summary read model for customer: ${summary.customerId}`);
  }

  /**
   * Check if customer is high risk
   */
  private isHighRiskCustomer(riskGrade: string, pdRate: number): boolean {
    const highRiskGrades = ['poor', 'very_poor', 'high_risk'];
    return highRiskGrades.includes(riskGrade.toLowerCase()) || pdRate > 0.1;
  }

  /**
   * Check if customer requires enhanced monitoring
   */
  private requiresEnhancedMonitoring(customer: any, riskGrade: string): boolean {
    return (
      this.isHighRiskCustomer(riskGrade, customer.riskProfile.pdRate) ||
      customer.bankingRelationship.totalExposure.amount > 10000000 || // > $10M
      customer.bankingRelationship.impairedExposure.amount > 0 ||
      customer.compliance.amlRiskLevel === 'high' ||
      customer.compliance.pepStatus !== 'none'
    );
  }

  /**
   * Check if manual credit review is needed
   */
  private requiresManualCreditReview(event: CustomerRiskAssessed): boolean {
    const significantPDChange = Math.abs(event.data.newPD - event.data.previousPD) > 0.05; // 5% change
    const riskGradeDowngrade = this.isRiskGradeDowngrade(event.data.previousRiskGrade, event.data.newRiskGrade);
    const largeCreditLimitChange = Math.abs(event.data.creditLimitAdjustment.amount) > 1000000; // > $1M

    return significantPDChange || riskGradeDowngrade || largeCreditLimitChange;
  }

  /**
   * Check if risk grade is a downgrade
   */
  private isRiskGradeDowngrade(previousGrade: string, newGrade: string): boolean {
    const gradeHierarchy = [
      'excellent', 'very_good', 'good', 'average',
      'fair', 'weak', 'poor', 'very_poor', 'high_risk'
    ];

    const previousIndex = gradeHierarchy.indexOf(previousGrade.toLowerCase());
    const newIndex = gradeHierarchy.indexOf(newGrade.toLowerCase());

    return newIndex > previousIndex;
  }

  /**
   * Schedule credit limit review
   */
  private async scheduleCreditLimitReview(customerId: string, reason: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'CREDIT_LIMIT_REVIEW_SCHEDULED',
      aggregateId: customerId,
      aggregateType: 'Customer',
      data: {
        customerId,
        reason,
        priority: 'medium',
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        requiresManualApproval: true
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Setup enhanced customer monitoring
   */
  private async setupEnhancedCustomerMonitoring(customerId: string, reason: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'ENHANCED_CUSTOMER_MONITORING_SETUP',
      aggregateId: customerId,
      aggregateType: 'Customer',
      data: {
        customerId,
        monitoringLevel: 'enhanced',
        reason,
        monitoringFrequency: 'daily',
        alertThresholds: {
          paymentDelay: 1,
          balanceIncrease: 0.1,
          creditUtilization: 0.8
        }
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Remove enhanced customer monitoring
   */
  private async removeEnhancedCustomerMonitoring(customerId: string, reason: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'ENHANCED_CUSTOMER_MONITORING_REMOVED',
      aggregateId: customerId,
      aggregateType: 'Customer',
      data: {
        customerId,
        reason,
        newMonitoringLevel: 'standard',
        monitoringFrequency: 'weekly'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Update customer alerting thresholds
   */
  private async updateCustomerAlertingThresholds(customerId: string, riskData: any): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'CUSTOMER_ALERT_THRESHOLDS_UPDATED',
      aggregateId: customerId,
      aggregateType: 'Customer',
      data: {
        customerId,
        riskProfile: riskData,
        newThresholds: this.calculateAlertThresholds(riskData),
        effectiveDate: new Date()
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }

  /**
   * Calculate alert thresholds based on risk profile
   */
  private calculateAlertThresholds(riskData: any): any {
    const baseThresholds = {
      paymentDelayDays: 3,
      balanceIncreasePercent: 0.2,
      creditUtilizationPercent: 0.85,
      newDelinquencyCount: 1
    };

    // Adjust thresholds based on risk grade
    if (riskData.newPD > 0.1) {
      baseThresholds.paymentDelayDays = 1;
      baseThresholds.balanceIncreasePercent = 0.1;
      baseThresholds.creditUtilizationPercent = 0.7;
    } else if (riskData.newPD > 0.05) {
      baseThresholds.paymentDelayDays = 2;
      baseThresholds.balanceIncreasePercent = 0.15;
      baseThresholds.creditUtilizationPercent = 0.8;
    }

    return baseThresholds;
  }

  /**
   * Check if immediate alert is required
   */
  private requiresImmediateAlert(event: CustomerRiskAssessed): boolean {
    return (
      event.data.newPD > 0.2 || // Very high PD
      this.isRiskGradeDowngrade(event.data.previousRiskGrade, event.data.newRiskGrade) ||
      Math.abs(event.data.creditLimitAdjustment.amount) > 5000000 // > $5M credit limit change
    );
  }

  /**
   * Trigger immediate customer alert
   */
  private async triggerImmediateCustomerAlert(event: CustomerRiskAssessed): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'IMMEDIATE_CUSTOMER_ALERT',
      aggregateId: event.data.customerId,
      aggregateType: 'Customer',
      data: {
        customerId: event.data.customerId,
        alertType: 'RISK_ASSESSMENT_CHANGE',
        severity: this.calculateAlertSeverity(event),
        message: this.generateAlertMessage(event),
        requiresAction: true,
        recipients: ['risk_manager', 'relationship_manager', 'compliance'],
        escalationLevel: 'high'
      },
      metadata: {
        timestamp: new Date(),
        userId: event.metadata.userId,
        tenantId: event.metadata.tenantId,
        version: 1
      }
    });
  }

  /**
   * Calculate alert severity
   */
  private calculateAlertSeverity(event: CustomerRiskAssessed): string {
    if (event.data.newPD > 0.2) return 'critical';
    if (event.data.newPD > 0.1) return 'high';
    if (this.isRiskGradeDowngrade(event.data.previousRiskGrade, event.data.newRiskGrade)) return 'medium';
    return 'low';
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(event: CustomerRiskAssessed): string {
    return `Customer risk grade changed from ${event.data.previousRiskGrade} to ${event.data.newRiskGrade}. ` +
           `PD rate changed from ${(event.data.previousPD * 100).toFixed(2)}% to ${(event.data.newPD * 100).toFixed(2)}%. ` +
           `Reason: ${event.data.reason}`;
  }

  /**
   * Generate compliance notes
   */
  private generateComplianceNotes(event: CustomerRiskAssessed): string[] {
    const notes: string[] = [];

    if (this.isRiskGradeDowngrade(event.data.previousRiskGrade, event.data.newRiskGrade)) {
      notes.push('Risk grade downgrade - requires additional monitoring');
    }

    if (event.data.newPD > 0.1) {
      notes.push('High PD rate - may require additional provisions');
    }

    if (Math.abs(event.data.creditLimitAdjustment.amount) > 1000000) {
      notes.push('Significant credit limit adjustment - board review may be required');
    }

    if (event.data.assessmentFactors.includes('Regulatory compliance concerns')) {
      notes.push('Compliance issues detected - immediate attention required');
    }

    return notes;
  }

  /**
   * Check if regulatory reporting is required
   */
  private requiresRegulatoryReporting(event: CustomerRiskAssessed): boolean {
    return (
      event.data.newPD > 0.15 ||
      this.isRiskGradeDowngrade(event.data.previousRiskGrade, event.data.newRiskGrade) ||
      Math.abs(event.data.creditLimitAdjustment.amount) > 5000000
    );
  }

  /**
   * Schedule regulatory reporting
   */
  private async scheduleRegulatoryReporting(customerId: string): Promise<void> {
    await this.eventBus.publish({
      id: require('uuid').v4(),
      type: 'REGULATORY_REPORTING_SCHEDULED',
      aggregateId: customerId,
      aggregateType: 'Customer',
      data: {
        customerId,
        reportType: 'CUSTOMER_RISK_CHANGE',
        reportCategory: 'material_change',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        priority: 'high'
      },
      metadata: {
        timestamp: new Date(),
        version: 1
      }
    });
  }
}