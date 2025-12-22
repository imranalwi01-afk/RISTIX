// packages/backend/src/modules/ifrs9/services/EclCalculationService.ts
import { PortfolioAccount } from '../models/PortfolioAccount';
import { EclJob } from '../models/EclJob';
import { RAnalyticsService } from '../../../core/services/RAnalyticsService';
import { TenantContext } from '../../../core/interfaces/TenantContext';
import { ValidationError, BusinessLogicError } from '../../../core/errors';
import { Transaction } from 'sequelize';
import Decimal from 'decimal.js';

export interface EclCalculationInput {
  accountIds?: string[];
  calculationDate: Date;
  parameters?: {
    pd12mMethod?: 'historical' | 'logistic' | 'market';
    lgdMethod?: 'historical' | 'beta' | 'workout';
    eadMethod?: 'current' | 'stressed' | 'regulatory';
    forwardLookingAdjustment?: boolean;
    scenarioWeights?: {
      base: number;
      upside: number;
      downside: number;
    };
  };
}

export interface EclCalculationResult {
  jobId: string;
  totalAccounts: number;
  processedAccounts: number;
  results: {
    stage1Count: number;
    stage2Count: number;
    stage3Count: number;
    totalEcl12m: number;
    totalEclLifetime: number;
    totalEcl: number;
  };
  accountResults: Array<{
    accountId: string;
    stage: number;
    pd12m: number;
    pdLifetime: number;
    lgd: number;
    ead: number;
    ecl12m: number;
    eclLifetime: number;
    finalEcl: number;
  }>;
}

export class EclCalculationService {
  private rAnalyticsService: RAnalyticsService;

  constructor() {
    this.rAnalyticsService = new RAnalyticsService();
  }

  /**
   * Perform basic ECL calculation for portfolio accounts
   */
  public async calculateEcl(
    input: EclCalculationInput,
    tenantContext: TenantContext,
    transaction?: Transaction
  ): Promise<EclCalculationResult> {
    const t = transaction;
    
    try {
      // 1. Create calculation job
      const job = await this.createCalculationJob(input, tenantContext, t);
      
      // 2. Get portfolio accounts to process
      const accounts = await this.getPortfolioAccounts(input, tenantContext, t);
      
      if (accounts.length === 0) {
        throw new ValidationError('No accounts found for calculation');
      }

      // 3. Update job with total accounts
      await job.update({
        totalAccounts: accounts.length,
        status: 'running',
        startedAt: new Date()
      }, { transaction: t });

      // 4. Process accounts in batches
      const results = await this.processAccountsBatch(accounts, input, job, t);
      
      // 5. Aggregate results
      const aggregatedResults = this.aggregateResults(results);
      
      // 6. Update job completion
      await job.update({
        status: 'completed',
        completedAt: new Date(),
        processedAccounts: accounts.length,
        results: aggregatedResults
      }, { transaction: t });

      return {
        jobId: job.id,
        totalAccounts: accounts.length,
        processedAccounts: accounts.length,
        results: aggregatedResults,
        accountResults: results
      };

    } catch (error) {
      // Update job status on error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      throw new BusinessLogicError(`ECL calculation failed: ${errorMessage}`);
    }
  }

  /**
   * Calculate basic PD (Probability of Default)
   */
  private async calculatePd(
    account: PortfolioAccount, 
    parameters: EclCalculationInput['parameters']
  ): Promise<{ pd12m: number; pdLifetime: number }> {
    
    // Basic PD calculation using simple historical approach
    const daysPastDue = this.calculateDaysPastDue(account);
    const yearsFromOrigination = this.calculateYearsFromOrigination(account);
    
    // Simple PD model based on DPD and rating
    let basePd12m = this.getBasePdFromRating(account.internalRating);
    
    // Adjust for DPD
    if (daysPastDue > 0) {
      basePd12m *= (1 + Math.log(1 + daysPastDue / 30) * 0.5);
    }
    
    // Adjust for age of loan
    const ageFactor = Math.min(1 + yearsFromOrigination * 0.1, 2);
    basePd12m *= ageFactor;
    
    // Cap PD at 1.0 (100%)
    const pd12m = Math.min(basePd12m, 1.0);
    
    // Lifetime PD is cumulative (simplified)
    const pd_lifetime = Math.min(pd12m * 2.5, 1.0);
    
    return {
      pd12m: new Decimal(pd12m).toDP(6).toNumber(),
      pdLifetime: new Decimal(pd_lifetime).toDP(6).toNumber()
    };
  }

  /**
   * Calculate basic LGD (Loss Given Default)
   */
  private async calculateLgd(account: PortfolioAccount): Promise<number> {
    let baseLgd = 0.45; // Default 45% LGD
    
    // Adjust based on collateral
    if (account.underlyingAssetType) {
      switch (account.underlyingAssetType.toLowerCase()) {
        case 'real_estate':
        case 'property':
          baseLgd = 0.35;
          break;
        case 'vehicle':
        case 'machinery':
          baseLgd = 0.55;
          break;
        case 'cash':
        case 'deposit':
          baseLgd = 0.05;
          break;
        default:
          baseLgd = 0.45;
      }
    }
    
    // Adjust for Islamic banking (typically lower LGD due to asset backing)
    if (account.isSyariahCompliant) {
      baseLgd *= 0.9;
    }
    
    return new Decimal(baseLgd).toDP(4).toNumber();
  }

  /**
   * Calculate basic EAD (Exposure at Default)
   */
  private async calculateEad(account: PortfolioAccount): Promise<number> {
    // For on-balance sheet exposures, EAD = outstanding amount
    let ead = new Decimal(account.outstandingAmount);
    
    // Add committed but undrawn amounts (simplified)
    if (account.committedAmount > account.outstandingAmount) {
      const undrawnAmount = new Decimal(account.committedAmount).minus(account.outstandingAmount);
      const creditConversionFactor = 0.75; // 75% CCF for undrawn
      ead = ead.plus(undrawnAmount.mul(creditConversionFactor));
    }
    
    return ead.toDP(2).toNumber();
  }

  /**
   * Determine IFRS 9 stage based on credit deterioration
   */
  private determineIfrs9Stage(
    account: PortfolioAccount,
    pd12m: number,
    currentPd12m: number
  ): number {
    const daysPastDue = this.calculateDaysPastDue(account);
    
    // Stage 3: Default (>90 DPD or other default indicators)
    if (daysPastDue > 90 || account.accountStatus === 'default') {
      return 3;
    }
    
    // Stage 2: Significant increase in credit risk
    // Simplified: if PD increased by more than 100% from origination
    const pdIncrease = currentPd12m / pd12m;
    if (pdIncrease > 2.0 || daysPastDue > 30) {
      return 2;
    }
    
    // Stage 1: Normal credit risk
    return 1;
  }

  /**
   * Create ECL calculation job
   */
  private async createCalculationJob(
    input: EclCalculationInput,
    tenantContext: TenantContext,
    transaction?: Transaction
  ): Promise<EclJob> {
    return await EclJob.create({
      jobName: `ECL Calculation - ${input.calculationDate.toISOString().split('T')[0]}`,
      description: 'Basic IFRS 9 ECL calculation',
      calculationDate: input.calculationDate,
      parameters: input.parameters,
      tenantId: tenantContext.tenantId,
      createdBy: tenantContext.userId
    }, { transaction });
  }

  /**
   * Get portfolio accounts for calculation
   */
  private async getPortfolioAccounts(
    input: EclCalculationInput,
    tenantContext: TenantContext,
    transaction?: Transaction
  ): Promise<PortfolioAccount[]> {
    const whereClause: any = {
      tenantId: tenantContext.tenantId,
      isActive: true
    };

    if (input.accountIds?.length) {
      whereClause.accountId = input.accountIds;
    }

    return await PortfolioAccount.findAll({
      where: whereClause,
      transaction
    });
  }

  /**
   * Process accounts in batch
   */
  private async processAccountsBatch(
    accounts: PortfolioAccount[],
    input: EclCalculationInput,
    job: EclJob,
    transaction?: Transaction
  ): Promise<Array<{
    accountId: string;
    stage: number;
    pd12m: number;
    pdLifetime: number;
    lgd: number;
    ead: number;
    ecl12m: number;
    eclLifetime: number;
    finalEcl: number;
  }>> {
    const results = [];
    
    for (const account of accounts) {
      try {
        // Calculate risk parameters
        const { pd12m, pdLifetime } = await this.calculatePd(account, input.parameters);
        const lgd = await this.calculateLgd(account);
        const ead = await this.calculateEad(account);
        
        // Determine IFRS 9 stage
        const stage = this.determineIfrs9Stage(account, 0.01, pd12m);
        
        // Calculate ECL
        const ecl12m = new Decimal(pd12m).mul(lgd).mul(ead).toDP(6).toNumber();
        const eclLifetime = new Decimal(pdLifetime).mul(lgd).mul(ead).toDP(6).toNumber();
        const finalEcl = stage === 1 ? ecl12m : eclLifetime;
        
        // Update account with calculated values
        await account.update({
          currentStage: stage,
          pd12m,
          pdLifetime,
          lgd,
          ead,
          ecl12m,
          eclLifetime
        }, { transaction });
        
        results.push({
          accountId: account.accountId,
          stage,
          pd12m,
          pdLifetime,
          lgd,
          ead,
          ecl12m,
          eclLifetime,
          finalEcl
        });
        
      } catch (error) {
        console.error(`Error processing account ${account.accountId}:`, error);
        // Continue with other accounts
      }
    }
    
    return results;
  }

  /**
   * Aggregate calculation results
   */
  private aggregateResults(results: Array<any>): any {
    const stage1Accounts = results.filter(r => r.stage === 1);
    const stage2Accounts = results.filter(r => r.stage === 2);
    const stage3Accounts = results.filter(r => r.stage === 3);
    
    const totalEcl12m = new Decimal(
      results.reduce((sum, r) => sum + r.ecl12m, 0)
    ).toDP(2).toNumber();
    
    const totalEclLifetime = new Decimal(
      results.reduce((sum, r) => sum + r.eclLifetime, 0)
    ).toDP(2).toNumber();
    
    const totalEcl = new Decimal(
      results.reduce((sum, r) => sum + r.finalEcl, 0)
    ).toDP(2).toNumber();
    
    return {
      stage1Count: stage1Accounts.length,
      stage2Count: stage2Accounts.length,
      stage3Count: stage3Accounts.length,
      totalEcl12m,
      totalEclLifetime,
      totalEcl
    };
  }

  // Helper methods
  private calculateDaysPastDue(account: PortfolioAccount): number {
    // Simplified DPD calculation
    // In real implementation, this would be calculated based on payment history
    return 0;
  }

  private calculateYearsFromOrigination(account: PortfolioAccount): number {
    const now = new Date();
    const origination = new Date(account.originationDate);
    return (now.getTime() - origination.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  }

  private getBasePdFromRating(rating?: string): number {
    if (!rating) return 0.05; // Default 5%
    
    const ratingPdMap: { [key: string]: number } = {
      'AAA': 0.001, 'AA+': 0.002, 'AA': 0.003, 'AA-': 0.005,
      'A+': 0.008, 'A': 0.012, 'A-': 0.018,
      'BBB+': 0.025, 'BBB': 0.035, 'BBB-': 0.050,
      'BB+': 0.075, 'BB': 0.100, 'BB-': 0.150,
      'B+': 0.200, 'B': 0.300, 'B-': 0.450,
      'CCC+': 0.600, 'CCC': 0.750, 'CCC-': 0.900,
      'CC': 0.950, 'C': 0.990, 'D': 1.000
    };
    
    return ratingPdMap[rating.toUpperCase()] || 0.05;
  }
}
