// packages/backend/src/core/application/cqrs/commands/LoanCommandHandlers.ts

import { CommandHandler } from '@nestjs/cqrs';
import { ICommand } from '../interfaces/ICommand';
import { ILoanRepository } from '../../../domain/ifrs9/repositories/ILoanRepository';
import { ILoanManagementUseCase } from '../../usecases/loan/ILoanManagementUseCase';
import { Logger } from '@nestjs/common';

/**
 * Command: Create Loan
 */
export class CreateLoanCommand implements ICommand {
  constructor(
    public readonly customerId: string,
    public readonly productId: string,
    public readonly accountNumber: string,
    public readonly originalBalance: number,
    public readonly currency: string,
    public readonly originationDate: Date,
    public readonly maturityDate?: Date,
    public readonly interestRate: number,
    public readonly productType: string,
    public readonly bankingType?: 'conventional' | 'syariah',
    public readonly syariahContractType?: string,
    public readonly collateralValue?: number,
    public readonly riskGrade?: string,
    public readonly segment?: string,
    public readonly createdBy: string
  ) {}
}

@CommandHandler(CreateLoanCommand)
export class CreateLoanHandler {
  private readonly logger = new Logger(CreateLoanHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(command: CreateLoanCommand): Promise<any> {
    this.logger.log(`Executing CreateLoanCommand for account: ${command.accountNumber}`);

    try {
      const result = await this.loanManagementUseCase.createLoan({
        customerId: command.customerId,
        productId: command.productId,
        accountNumber: command.accountNumber,
        originalBalance: {
          amount: command.originalBalance,
          currency: command.currency
        },
        currency: command.currency,
        originationDate: command.originationDate,
        maturityDate: command.maturityDate,
        interestRate: command.interestRate,
        productType: command.productType,
        bankingType: command.bankingType,
        syariahContractType: command.syariahContractType,
        collateralValue: command.collateralValue ? {
          amount: command.collateralValue,
          currency: command.currency
        } : undefined,
        riskGrade: command.riskGrade,
        segment: command.segment,
        requestedBy: command.createdBy
      });

      this.logger.log(`Successfully created loan: ${result.loan.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to create loan: ${command.accountNumber}`, error);
      throw error;
    }
  }
}

/**
 * Command: Update Loan
 */
export class UpdateLoanCommand implements ICommand {
  constructor(
    public readonly loanId: string,
    public readonly updates: {
      outstandingBalance?: number;
      maturityDate?: Date;
      interestRate?: number;
      collateralValue?: number;
      riskGrade?: string;
      segment?: string;
      isActive?: boolean;
    },
    public readonly updatedBy: string
  ) {}
}

@CommandHandler(UpdateLoanCommand)
export class UpdateLoanHandler {
  private readonly logger = new Logger(UpdateLoanHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(command: UpdateLoanCommand): Promise<any> {
    this.logger.log(`Executing UpdateLoanCommand for loan: ${command.loanId}`);

    try {
      const result = await this.loanManagementUseCase.updateLoan({
        loanId: command.loanId,
        updates: command.updates,
        updatedBy: command.updatedBy
      });

      this.logger.log(`Successfully updated loan: ${result.loan.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to update loan: ${command.loanId}`, error);
      throw error;
    }
  }
}

/**
 * Command: Assess Loan Stage
 */
export class AssessLoanStageCommand implements ICommand {
  constructor(
    public readonly loanId: string,
    public readonly assessmentOptions?: {
      daysPastDue?: number;
      creditQualityIndicators?: string[];
      collateralCoverage?: number;
    },
    public readonly assessedBy: string
  ) {}
}

@CommandHandler(AssessLoanStageCommand)
export class AssessLoanStageHandler {
  private readonly logger = new Logger(AssessLoanStageHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(command: AssessLoanStageCommand): Promise<any> {
    this.logger.log(`Executing AssessLoanStageCommand for loan: ${command.loanId}`);

    try {
      const result = await this.loanManagementUseCase.assessLoanStage({
        loanId: command.loanId,
        assessmentOptions: command.assessmentOptions,
        assessedBy: command.assessedBy
      });

      this.logger.log(`Successfully assessed loan stage: ${result.loan.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to assess loan stage: ${command.loanId}`, error);
      throw error;
    }
  }
}

/**
 * Command: Bulk Assess Loan Stages
 */
export class BulkAssessLoanStagesCommand implements ICommand {
  constructor(
    public readonly loanIds: string[],
    public readonly assessmentOptions?: {
      daysPastDue?: number;
      creditQualityIndicators?: string[];
      collateralCoverage?: number;
    },
    public readonly assessedBy: string
  ) {}
}

@CommandHandler(BulkAssessLoanStagesCommand)
export class BulkAssessLoanStagesHandler {
  private readonly logger = new Logger(BulkAssessLoanStagesHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(command: BulkAssessLoanStagesCommand): Promise<any> {
    this.logger.log(`Executing BulkAssessLoanStagesCommand for ${command.loanIds.length} loans`);

    try {
      const result = await this.loanManagementUseCase.bulkAssessLoanStages({
        loanIds: command.loanIds,
        assessmentOptions: command.assessmentOptions,
        assessedBy: command.assessedBy
      });

      this.logger.log(`Successfully bulk assessed loan stages: ${result.summary.totalProcessed} processed`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to bulk assess loan stages`, error);
      throw error;
    }
  }
}

/**
 * Command: Calculate Loan ECL
 */
export class CalculateLoanECLCommand implements ICommand {
  constructor(
    public readonly loanId: string,
    public readonly calculationDate?: Date,
    public readonly scenario?: 'baseline' | 'adverse' | 'severe',
    public readonly useLifetimeECL?: boolean,
    public readonly calculatedBy: string
  ) {}
}

@CommandHandler(CalculateLoanECLCommand)
export class CalculateLoanECLHandler {
  private readonly logger = new Logger(CalculateLoanECLHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(command: CalculateLoanECLCommand): Promise<any> {
    this.logger.log(`Executing CalculateLoanECLCommand for loan: ${command.loanId}`);

    try {
      const result = await this.loanManagementUseCase.calculateLoanECL({
        loanId: command.loanId,
        calculationDate: command.calculationDate,
        scenario: command.scenario,
        useLifetimeECL: command.useLifetimeECL,
        calculatedBy: command.calculatedBy
      });

      this.logger.log(`Successfully calculated loan ECL: ${result.calculationId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to calculate loan ECL: ${command.loanId}`, error);
      throw error;
    }
  }
}

/**
 * Command: Deactivate Loan
 */
export class DeactivateLoanCommand implements ICommand {
  constructor(
    public readonly loanId: string,
    public readonly reason: string,
    public readonly deactivatedBy: string
  ) {}
}

@CommandHandler(DeactivateLoanCommand)
export class DeactivateLoanHandler {
  private readonly logger = new Logger(DeactivateLoanHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(command: DeactivateLoanCommand): Promise<any> {
    this.logger.log(`Executing DeactivateLoanCommand for loan: ${command.loanId}`);

    try {
      const result = await this.loanManagementUseCase.deactivateLoan({
        loanId: command.loanId,
        reason: command.reason,
        deactivatedBy: command.deactivatedBy
      });

      this.logger.log(`Successfully deactivated loan: ${result.loan.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to deactivate loan: ${command.loanId}`, error);
      throw error;
    }
  }
}

/**
 * Command: Reactivate Loan
 */
export class ReactivateLoanCommand implements ICommand {
  constructor(
    public readonly loanId: string,
    public readonly reason: string,
    public readonly reactivatedBy: string
  ) {}
}

@CommandHandler(ReactivateLoanCommand)
export class ReactivateLoanHandler {
  private readonly logger = new Logger(ReactivateLoanHandler.name);

  constructor(
    private readonly loanManagementUseCase: ILoanManagementUseCase
  ) {}

  async execute(command: ReactivateLoanCommand): Promise<any> {
    this.logger.log(`Executing ReactivateLoanCommand for loan: ${command.loanId}`);

    try {
      const result = await this.loanManagementUseCase.reactivateLoan({
        loanId: command.loanId,
        reason: command.reason,
        reactivatedBy: command.reactivatedBy
      });

      this.logger.log(`Successfully reactivated loan: ${result.loan.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to reactivate loan: ${command.loanId}`, error);
      throw error;
    }
  }
}