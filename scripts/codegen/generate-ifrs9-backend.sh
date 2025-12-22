#!/bin/bash
# scripts/codegen/generate-ifrs9-backend.sh
# IFRS 9 Backend Code Generator - DAY 3 HOUR 1

set -e
set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
BACKEND_DIR="${PROJECT_ROOT}/packages/backend"

log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1"
}

# Generate IFRS 9 Models
generate_ifrs9_models() {
    log_info "Generating IFRS 9 models..."
    
    # Portfolio Account Model
    cat > "${BACKEND_DIR}/src/modules/ifrs9/models/PortfolioAccount.ts" << 'EOF'
// packages/backend/src/modules/ifrs9/models/PortfolioAccount.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../core/database/connection';

export interface PortfolioAccountAttributes {
  id: string;
  legacyId?: string;
  accountId: string;
  customerId: string;
  contractId?: string;
  productType: string;
  outstandingAmount: number;
  committedAmount: number;
  originalAmount: number;
  currencyCode: string;
  originationDate: Date;
  maturityDate: Date;
  reportingDate: Date;
  currentStage: number;
  previousStage?: number;
  stageChangeDate?: Date;
  customerName: string;
  customerType: string;
  industrySector: string;
  internalRating?: string;
  externalRating?: string;
  pd12m?: number;
  pdLifetime?: number;
  lgd?: number;
  ead?: number;
  ecl12m?: number;
  eclLifetime?: number;
  isSyariahCompliant: boolean;
  syariahContractType?: string;
  syariahStructure?: string;
  profitSharingRatio?: number;
  underlyingAssetType?: string;
  assetOwnershipStructure?: string;
  syariahComplianceStatus?: string;
  syariahReviewDate?: Date;
  syariahBoardApprovalDate?: Date;
  aaoifiClassification?: string;
  accountStatus: string;
  isActive: boolean;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

export interface PortfolioAccountCreationAttributes 
  extends Optional<PortfolioAccountAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class PortfolioAccount extends Model<PortfolioAccountAttributes, PortfolioAccountCreationAttributes>
  implements PortfolioAccountAttributes {
  
  public id!: string;
  public legacyId?: string;
  public accountId!: string;
  public customerId!: string;
  public contractId?: string;
  public productType!: string;
  public outstandingAmount!: number;
  public committedAmount!: number;
  public originalAmount!: number;
  public currencyCode!: string;
  public originationDate!: Date;
  public maturityDate!: Date;
  public reportingDate!: Date;
  public currentStage!: number;
  public previousStage?: number;
  public stageChangeDate?: Date;
  public customerName!: string;
  public customerType!: string;
  public industrySector!: string;
  public internalRating?: string;
  public externalRating?: string;
  public pd12m?: number;
  public pdLifetime?: number;
  public lgd?: number;
  public ead?: number;
  public ecl12m?: number;
  public eclLifetime?: number;
  public isSyariahCompliant!: boolean;
  public syariahContractType?: string;
  public syariahStructure?: string;
  public profitSharingRatio?: number;
  public underlyingAssetType?: string;
  public assetOwnershipStructure?: string;
  public syariahComplianceStatus?: string;
  public syariahReviewDate?: Date;
  public syariahBoardApprovalDate?: Date;
  public aaoifiClassification?: string;
  public accountStatus!: string;
  public isActive!: boolean;
  public tenantId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
  public updatedBy?: string;
}

PortfolioAccount.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  legacyId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  accountId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  customerId: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  contractId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  productType: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  outstandingAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  committedAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  originalAmount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0
  },
  currencyCode: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  originationDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  maturityDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  reportingDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  currentStage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      isIn: [[1, 2, 3]]
    }
  },
  previousStage: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      isIn: [[1, 2, 3]]
    }
  },
  stageChangeDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  customerName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  customerType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  industrySector: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  internalRating: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  externalRating: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  pd12m: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true
  },
  pdLifetime: {
    type: DataTypes.DECIMAL(8, 6),
    allowNull: true
  },
  lgd: {
    type: DataTypes.DECIMAL(8, 4),
    allowNull: true
  },
  ead: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: true
  },
  ecl12m: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: true,
    defaultValue: 0
  },
  eclLifetime: {
    type: DataTypes.DECIMAL(18, 6),
    allowNull: true,
    defaultValue: 0
  },
  isSyariahCompliant: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  syariahContractType: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  syariahStructure: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  profitSharingRatio: {
    type: DataTypes.DECIMAL(5, 4),
    allowNull: true
  },
  underlyingAssetType: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  assetOwnershipStructure: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  syariahComplianceStatus: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  syariahReviewDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  syariahBoardApprovalDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  aaoifiClassification: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  accountStatus: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'active'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'portfolio_accounts',
  schema: 'core',
  timestamps: true,
  indexes: [
    { fields: ['accountId'] },
    { fields: ['customerId'] },
    { fields: ['reportingDate'] },
    { fields: ['currentStage'] },
    { fields: ['tenantId'] },
    { fields: ['isSyariahCompliant'] }
  ]
});
EOF

    # ECL Job Model
    cat > "${BACKEND_DIR}/src/modules/ifrs9/models/EclJob.ts" << 'EOF'
// packages/backend/src/modules/ifrs9/models/EclJob.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../core/database/connection';

export interface EclJobAttributes {
  id: string;
  legacyId?: string;
  jobName: string;
  description?: string;
  calculationDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalAccounts?: number;
  processedAccounts?: number;
  parameters?: object;
  results?: object;
  errorMessage?: string;
  startedAt?: Date;
  completedAt?: Date;
  tenantId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

export interface EclJobCreationAttributes 
  extends Optional<EclJobAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

export class EclJob extends Model<EclJobAttributes, EclJobCreationAttributes>
  implements EclJobAttributes {
  
  public id!: string;
  public legacyId?: string;
  public jobName!: string;
  public description?: string;
  public calculationDate!: Date;
  public status!: 'pending' | 'running' | 'completed' | 'failed';
  public totalAccounts?: number;
  public processedAccounts?: number;
  public parameters?: object;
  public results?: object;
  public errorMessage?: string;
  public startedAt?: Date;
  public completedAt?: Date;
  public tenantId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public createdBy?: string;
}

EclJob.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  legacyId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  jobName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  calculationDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'running', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  totalAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  processedAccounts: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  parameters: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  results: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  sequelize,
  tableName: 'ecl_jobs',
  schema: 'calculation',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['calculationDate'] },
    { fields: ['tenantId'] },
    { fields: ['createdBy'] }
  ]
});
EOF

    log_success "IFRS 9 models generated"
}

# Generate IFRS 9 Services
generate_ifrs9_services() {
    log_info "Generating IFRS 9 services..."
    
    # ECL Calculation Service
    cat > "${BACKEND_DIR}/src/modules/ifrs9/services/EclCalculationService.ts" << 'EOF'
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
EOF

    log_success "IFRS 9 services generated"
}

# Generate IFRS 9 Controllers
generate_ifrs9_controllers() {
    log_info "Generating IFRS 9 controllers..."
    
    cat > "${BACKEND_DIR}/src/modules/ifrs9/controllers/EclCalculationController.ts" << 'EOF'
// packages/backend/src/modules/ifrs9/controllers/EclCalculationController.ts
import { Request, Response, NextFunction } from 'express';
import { EclCalculationService } from '../services/EclCalculationService';
import { TenantContext } from '../../../core/interfaces/TenantContext';
import { ValidationError, BusinessLogicError } from '../../../core/errors';
import { validationResult } from 'express-validator';
import { sequelize } from '../../../core/database/connection';

export class EclCalculationController {
  private eclCalculationService: EclCalculationService;

  constructor() {
    this.eclCalculationService = new EclCalculationService();
  }

  /**
   * Start ECL calculation
   */
  public calculateEcl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transaction = await sequelize.transaction();
    
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new ValidationError('Validation failed', errors.array());
      }

      const tenantContext: TenantContext = {
        tenantId: req.headers['x-tenant-id'] as string,
        userId: req.user?.id,
        permissions: req.user?.permissions || []
      };

      const { accountIds, calculationDate, parameters } = req.body;

      // Perform calculation
      const result = await this.eclCalculationService.calculateEcl({
        accountIds,
        calculationDate: new Date(calculationDate),
        parameters
      }, tenantContext, transaction);

      await transaction.commit();

      res.status(200).json({
        success: true,
        data: result,
        message: 'ECL calculation completed successfully'
      });

    } catch (error) {
      await transaction.rollback();
      next(error);
    }
  };

  /**
   * Get calculation history
   */
  public getCalculationHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext: TenantContext = {
        tenantId: req.headers['x-tenant-id'] as string,
        userId: req.user?.id,
        permissions: req.user?.permissions || []
      };

      const { page = 1, limit = 10 } = req.query;
      
      // Get calculation jobs history (simplified)
      const jobs = await sequelize.models.EclJob.findAll({
        where: { tenantId: tenantContext.tenantId },
        order: [['createdAt', 'DESC']],
        limit: Number(limit),
        offset: (Number(page) - 1) * Number(limit)
      });

      res.status(200).json({
        success: true,
        data: jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: jobs.length
        }
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get calculation results by job ID
   */
  public getCalculationResults = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobId } = req.params;
      const tenantContext: TenantContext = {
        tenantId: req.headers['x-tenant-id'] as string,
        userId: req.user?.id,
        permissions: req.user?.permissions || []
      };

      const job = await sequelize.models.EclJob.findOne({
        where: { 
          id: jobId,
          tenantId: tenantContext.tenantId 
        }
      });

      if (!job) {
        throw new ValidationError('Calculation job not found');
      }

      res.status(200).json({
        success: true,
        data: job,
        message: 'Calculation results retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  };

  /**
   * Get portfolio summary
   */
  public getPortfolioSummary = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tenantContext: TenantContext = {
        tenantId: req.headers['x-tenant-id'] as string,
        userId: req.user?.id,
        permissions: req.user?.permissions || []
      };

      // Get portfolio summary statistics
      const summary = await sequelize.query(`
        SELECT 
          COUNT(*) as total_accounts,
          SUM(outstanding_amount) as total_outstanding,
          SUM(CASE WHEN current_stage = 1 THEN 1 ELSE 0 END) as stage1_count,
          SUM(CASE WHEN current_stage = 2 THEN 1 ELSE 0 END) as stage2_count,
          SUM(CASE WHEN current_stage = 3 THEN 1 ELSE 0 END) as stage3_count,
          SUM(ecl_12m) as total_ecl_12m,
          SUM(ecl_lifetime) as total_ecl_lifetime,
          SUM(CASE WHEN is_syariah_compliant = true THEN outstanding_amount ELSE 0 END) as syariah_outstanding
        FROM core.portfolio_accounts 
        WHERE tenant_id = :tenantId AND is_active = true
      `, {
        replacements: { tenantId: tenantContext.tenantId },
        type: sequelize.QueryTypes.SELECT
      });

      res.status(200).json({
        success: true,
        data: summary[0],
        message: 'Portfolio summary retrieved successfully'
      });

    } catch (error) {
      next(error);
    }
  };
}
EOF

    log_success "IFRS 9 controllers generated"
}

# Generate IFRS 9 Routes
generate_ifrs9_routes() {
    log_info "Generating IFRS 9 routes..."
    
    cat > "${BACKEND_DIR}/src/modules/ifrs9/routes/eclRoutes.ts" << 'EOF'
// packages/backend/src/modules/ifrs9/routes/eclRoutes.ts
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { EclCalculationController } from '../controllers/EclCalculationController';
import { authenticate } from '../../../core/middleware/auth';
import { requireTenantAccess } from '../../../core/middleware/tenant';
import { requirePermission } from '../../../core/middleware/permissions';

const router = Router();
const eclController = new EclCalculationController();

// Apply middleware to all routes
router.use(authenticate);
router.use(requireTenantAccess);

/**
 * POST /api/ifrs9/ecl/calculate
 * Start ECL calculation
 */
router.post('/calculate',
  requirePermission(['ifrs9:calculate']),
  [
    body('calculationDate')
      .isISO8601()
      .withMessage('Valid calculation date is required'),
    body('accountIds')
      .optional()
      .isArray()
      .withMessage('Account IDs must be an array'),
    body('parameters')
      .optional()
      .isObject()
      .withMessage('Parameters must be an object')
  ],
  eclController.calculateEcl
);

/**
 * GET /api/ifrs9/ecl/history
 * Get calculation history
 */
router.get('/history',
  requirePermission(['ifrs9:read']),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100')
  ],
  eclController.getCalculationHistory
);

/**
 * GET /api/ifrs9/ecl/results/:jobId
 * Get calculation results by job ID
 */
router.get('/results/:jobId',
  requirePermission(['ifrs9:read']),
  [
    param('jobId')
      .isUUID()
      .withMessage('Valid job ID is required')
  ],
  eclController.getCalculationResults
);

/**
 * GET /api/ifrs9/portfolio/summary
 * Get portfolio summary
 */
router.get('/portfolio/summary',
  requirePermission(['ifrs9:read']),
  eclController.getPortfolioSummary
);

export default router;
EOF

    log_success "IFRS 9 routes generated"
}

# Main function
main() {
    log_info "Starting IFRS 9 backend code generation..."
    
    # Create directories if they don't exist
    mkdir -p "${BACKEND_DIR}/src/modules/ifrs9"/{models,services,controllers,routes,validators}
    mkdir -p "${BACKEND_DIR}/src/modules/ifrs9/calculations"/{ecl,pd,lgd,ead}
    
    # Generate code files
    generate_ifrs9_models
    generate_ifrs9_services  
    generate_ifrs9_controllers
    generate_ifrs9_routes
    
    log_success "IFRS 9 backend code generation completed successfully!"
}

# Execute main function
main "$@"