// packages/backend/src/core/services/ifrs9/ecl-calculation.service.ts
// ============================================================================
// Enhanced ECL Calculation Service for IFRS9 Multi-Tenant Platform
// ============================================================================
// Purpose: Complete Expected Credit Loss calculation orchestration
// Dependencies: PD, LGD, EAD services, R Analytics integration, banking models
// Banking Support: Conventional + Syariah (Islamic) banking
// ============================================================================

import { PortfolioAccount, Customer, ProductType, Collateral } from '../../models/banking';
import { PdModelService } from './pd-model.service';
import { LgdCalculationService } from './lgd-calculation.service';
import { EadComputationService } from './ead-computation.service';
import { RAnalyticsIntegrationService } from './r-analytics-integration.service';
import { configService } from '../configuration/configuration.service';

export interface EclCalculationRequest {
  tenantId: string;
  portfolioAccountIds?: string[];
  reportingDate: Date;
  scenario: 'base' | 'adverse' | 'severely_adverse';
  bankingType: 'conventional' | 'syariah';
  includeForwardLooking: boolean;
  macroeconomicFactors?: any;
}

export interface EclCalculationResult {
  accountId: string;
  customerId: string;
  productType: string;
  
  // Current staging
  currentStage: number;
  previousStage?: number;
  stageTransition: boolean;
  
  // Risk parameters
  pd12Month: number;
  pdLifetime: number;
  lgd: number;
  ead: number;
  
  // ECL calculations
  ecl12Month: number;
  eclLifetime: number;
  finalEcl: number;
  
  // Supporting information
  outstandingAmount: number;
  collateralValue: number;
  effectiveRecoveryRate: number;
  daysPastDue: number;
  
  // Banking type specific
  bankingType: 'conventional' | 'syariah';
  shariahContractType?: string;
  shariahCompliant: boolean;
  
  // Calculation metadata
  calculationDate: Date;
  modelVersions: {
    pdModel: string;
    lgdModel: string;
    eadModel: string;
  };
  
  // Stress testing results
  stressEcl?: {
    mild: number;
    moderate: number;
    severe: number;
  };
}

export interface EclPortfolioSummary {
  tenantId: string;
  reportingDate: Date;
  scenario: string;
  totalAccounts: number;
  
  // Portfolio composition
  stageDistribution: {
    stage1: { count: number; amount: number; ecl: number };
    stage2: { count: number; amount: number; ecl: number };
    stage3: { count: number; amount: number; ecl: number };
  };
  
  // Banking type breakdown
  bankingTypeBreakdown: {
    conventional: { count: number; amount: number; ecl: number };
    syariah: { count: number; amount: number; ecl: number };
  };
  
  // Product type analysis
  productAnalysis: Array<{
    productType: string;
    count: number;
    outstandingAmount: number;
    totalEcl: number;
    averagePd: number;
    averageLgd: number;
  }>;
  
  // Total metrics
  totalOutstanding: number;
  totalEcl: number;
  overallCoverageRatio: number;
  
  // Quality indicators
  qualityMetrics: {
    portfolioAge: number;
    averageDaysPastDue: number;
    collateralizationRatio: number;
    concentrationRisk: number;
  };
}

export class EclCalculationService {
  private readonly pdModelService: PdModelService;
  private readonly lgdCalculationService: LgdCalculationService;
  private readonly eadComputationService: EadComputationService;
  private readonly rAnalyticsService: RAnalyticsIntegrationService;

  constructor() {
    this.pdModelService = new PdModelService();
    this.lgdCalculationService = new LgdCalculationService();
    this.eadComputationService = new EadComputationService();
    this.rAnalyticsService = new RAnalyticsIntegrationService();
  }

  private log(message: string, data?: any): void {
    console.log(`[EclCalculationService] ${message}`, data || '');
  }

  private logError(message: string, error?: any): void {
    console.error(`[EclCalculationService] ${message}`, error || '');
  }

  /**
   * Calculate ECL for a portfolio of accounts
   */
  async calculatePortfolioEcl(request: EclCalculationRequest): Promise<{
    results: EclCalculationResult[];
    summary: EclPortfolioSummary;
  }> {
    this.log(`Starting ECL calculation for tenant ${request.tenantId}, scenario: ${request.scenario}`);

    try {
      // Validate inputs
      this.validateCalculationRequest(request);
      
      // 1. Load portfolio accounts with related data
      const accounts = await this.loadPortfolioAccounts(request);
      
      // 2. Perform staging analysis
      const stagingResults = await this.performStagingAnalysis(accounts, request);
      
      // 3. Calculate risk parameters for each account
      const calculationResults: EclCalculationResult[] = [];
      
      for (const account of accounts) {
        const result = await this.calculateAccountEcl(account, request, stagingResults);
        calculationResults.push(result);
      }
      
      // 4. Generate portfolio summary
      const summary = this.generatePortfolioSummary(calculationResults, request);
      
      // 5. Store results in database
      await this.storeCalculationResults(calculationResults, request);
      
      this.log(`ECL calculation completed for ${calculationResults.length} accounts`);
      
      return {
        results: calculationResults,
        summary
      };

    } catch (error) {
      this.logError('ECL calculation failed', error);
      throw new Error(`ECL calculation failed: ${error.message}`);
    }
  }

  /**
   * Calculate ECL for a single account
   */
  private async calculateAccountEcl(
    account: PortfolioAccount & {
      customer: Customer;
      productType: ProductType;
      collateral: Collateral[];
    },
    request: EclCalculationRequest,
    stagingResults: Map<string, number>
  ): Promise<EclCalculationResult> {
    
    // Get current stage (use staging analysis result or existing stage)
    const currentStage = stagingResults.get(account.account_id) || account.current_stage;
    const stageTransition = currentStage !== account.current_stage;
    
    // Calculate PD (12-month and lifetime)
    const pdResults = await this.pdModelService.calculatePd({
      accountId: account.account_id,
      customerId: account.customer_id,
      customerType: account.customer.customer_type,
      industryCode: account.customer.industry_code || 'UNKNOWN',
      productType: account.product_type,
      outstandingAmount: account.outstanding_amount,
      daysPastDue: account.days_past_due,
      tenorMonths: this.calculateTenorMonths(account),
      currentStage,
      bankingType: account.banking_type || 'conventional',
      historicalDefaults: account.customer.default_history || [],
      macroeconomicFactors: request.macroeconomicFactors
    });

    // Calculate LGD
    const lgdResults = await this.lgdCalculationService.calculateLgd({
      accountId: account.account_id,
      exposureAmount: account.outstanding_amount,
      collateral: account.collateral.map(c => ({
        type: c.collateral_type,
        value: c.current_market_value,
        haircutPercentage: c.haircut_percentage,
        recoveryRate: c.recovery_rate,
        liquidationTime: c.time_to_disposal_months || 12,
        securityRanking: c.security_ranking
      })),
      productType: account.product_type,
      recoveryHistory: account.customer.recovery_history || [],
      scenario: request.scenario,
      bankingType: account.banking_type || 'conventional'
    });

    // Calculate EAD
    const eadResults = await this.eadComputationService.calculateEad({
      accountId: account.account_id,
      currentExposure: account.outstanding_amount,
      creditLimit: account.credit_limit,
      committedAmount: account.committed_amount || 0,
      productType: account.product_type,
      utilizationHistory: [], // TODO: Implement utilization history
      customerType: account.customer.customer_type,
      creditConversionFactor: account.productType.credit_conversion_factor || 1.0,
      maturityDate: account.maturity_date,
      scenario: request.scenario
    });

    // Calculate ECL amounts
    const pd12Month = pdResults.pd12Month;
    const pdLifetime = pdResults.pdLifetime;
    const lgd = lgdResults.lgd;
    const ead = eadResults.ead;

    // Calculate ECL
    const ecl12Month = pd12Month * lgd * ead;
    const eclLifetime = pdLifetime * lgd * ead;
    const finalEcl = currentStage === 1 ? ecl12Month : eclLifetime;

    // Apply discounting if required
    const discountedEcl = this.applyDiscounting(finalEcl, account.productType, currentStage);

    // Calculate effective collateral value
    const totalCollateralValue = account.collateral.reduce((sum, c) => 
      sum + c.getNetRealizableValue(), 0);

    return {
      accountId: account.account_id,
      customerId: account.customer_id,
      productType: account.product_type,
      
      currentStage,
      previousStage: account.current_stage !== currentStage ? account.current_stage : undefined,
      stageTransition,
      
      pd12Month,
      pdLifetime,
      lgd,
      ead,
      
      ecl12Month,
      eclLifetime,
      finalEcl: discountedEcl,
      
      outstandingAmount: account.outstanding_amount,
      collateralValue: totalCollateralValue,
      effectiveRecoveryRate: lgdResults.effectiveRecoveryRate,
      daysPastDue: account.days_past_due,
      
      bankingType: account.banking_type || 'conventional',
      shariahContractType: account.syariah_contract_type,
      shariahCompliant: account.isShariahCompliant(),
      
      calculationDate: new Date(),
      modelVersions: {
        pdModel: pdResults.modelVersion,
        lgdModel: lgdResults.modelVersion,
        eadModel: eadResults.modelVersion
      },
      
      stressEcl: await this.calculateStressEcl(
        { pd12Month, pdLifetime, lgd, ead },
        account,
        request
      )
    };
  }

  /**
   * Perform staging analysis for all accounts
   */
  private async performStagingAnalysis(
    accounts: PortfolioAccount[],
    request: EclCalculationRequest
  ): Promise<Map<string, number>> {
    
    const stagingData = accounts.map(account => ({
      accountId: account.account_id,
      currentPd: account.pd_12_month || 0,
      originationPd: 0.01, // TODO: Get from historical data
      daysPastDue: account.days_past_due,
      currentStage: account.current_stage,
      paymentHistory: [] // TODO: Implement payment history
    }));

    try {
      // Use R Analytics for advanced staging analysis
      const response = await this.rAnalyticsService.performStagingAnalysis(
        request.tenantId,
        {
          accounts: stagingData,
          stagingCriteria: {
            stage2DpdThreshold: 30,
            stage3DpdThreshold: 90,
            sicrPdMultiple: 2.0,
            backstopCriteria: {
              stage2Days: 30,
              stage3Days: 90
            }
          }
        }
      );

      // Convert R results to Map
      const results = new Map<string, number>();
      if (response.success && response.results.stagingResults) {
        response.results.stagingResults.forEach((result: any) => {
          results.set(result.accountId, result.recommendedStage);
        });
      }

      return results;

    } catch (error) {
      console.warn('R Analytics staging analysis failed, using fallback logic', error);
      
      // Fallback to simple staging logic
      const results = new Map<string, number>();
      accounts.forEach(account => {
        let stage = 1;
        if (account.days_past_due >= 90) {
          stage = 3;
        } else if (account.days_past_due >= 30) {
          stage = 2;
        }
        results.set(account.account_id, stage);
      });
      
      return results;
    }
  }

  /**
   * Load portfolio accounts with related data
   */
  private async loadPortfolioAccounts(
    request: EclCalculationRequest
  ): Promise<Array<PortfolioAccount & {
    customer: Customer;
    productType: ProductType;
    collateral: Collateral[];
  }>> {
    
    // Build query filters
    const whereClause: any = {
      is_active: true
    };

    if (request.portfolioAccountIds && request.portfolioAccountIds.length > 0) {
      whereClause.account_id = { $in: request.portfolioAccountIds };
    }

    if (request.bankingType) {
      whereClause.banking_type = request.bankingType;
    }

    // Load accounts with all related data
    const accounts = await PortfolioAccount.findAll({
      where: whereClause,
      include: [
        {
          model: Customer,
          as: 'customer',
          required: true
        },
        {
          model: ProductType,
          as: 'productType',
          required: true
        },
        {
          model: Collateral,
          as: 'collateral',
          required: false,
          where: { is_active: true }
        }
      ]
    });

    return accounts as any;
  }

  /**
   * Generate portfolio summary statistics
   */
  private generatePortfolioSummary(
    results: EclCalculationResult[],
    request: EclCalculationRequest
  ): EclPortfolioSummary {
    
    const stageDistribution = {
      stage1: { count: 0, amount: 0, ecl: 0 },
      stage2: { count: 0, amount: 0, ecl: 0 },
      stage3: { count: 0, amount: 0, ecl: 0 }
    };

    const bankingTypeBreakdown = {
      conventional: { count: 0, amount: 0, ecl: 0 },
      syariah: { count: 0, amount: 0, ecl: 0 }
    };

    const productMap = new Map<string, {
      count: number;
      outstandingAmount: number;
      totalEcl: number;
      totalPd: number;
      totalLgd: number;
    }>();

    let totalOutstanding = 0;
    let totalEcl = 0;
    let totalDaysPastDue = 0;
    let totalCollateralValue = 0;

    // Aggregate results
    results.forEach(result => {
      // Stage distribution
      const stageKey = `stage${result.currentStage}` as keyof typeof stageDistribution;
      stageDistribution[stageKey].count++;
      stageDistribution[stageKey].amount += result.outstandingAmount;
      stageDistribution[stageKey].ecl += result.finalEcl;

      // Banking type breakdown
      bankingTypeBreakdown[result.bankingType].count++;
      bankingTypeBreakdown[result.bankingType].amount += result.outstandingAmount;
      bankingTypeBreakdown[result.bankingType].ecl += result.finalEcl;

      // Product analysis
      if (!productMap.has(result.productType)) {
        productMap.set(result.productType, {
          count: 0,
          outstandingAmount: 0,
          totalEcl: 0,
          totalPd: 0,
          totalLgd: 0
        });
      }
      
      const productData = productMap.get(result.productType)!;
      productData.count++;
      productData.outstandingAmount += result.outstandingAmount;
      productData.totalEcl += result.finalEcl;
      productData.totalPd += result.currentStage === 1 ? result.pd12Month : result.pdLifetime;
      productData.totalLgd += result.lgd;

      // Totals
      totalOutstanding += result.outstandingAmount;
      totalEcl += result.finalEcl;
      totalDaysPastDue += result.daysPastDue;
      totalCollateralValue += result.collateralValue;
    });

    // Convert product map to array
    const productAnalysis = Array.from(productMap.entries()).map(([productType, data]) => ({
      productType,
      count: data.count,
      outstandingAmount: data.outstandingAmount,
      totalEcl: data.totalEcl,
      averagePd: data.totalPd / data.count,
      averageLgd: data.totalLgd / data.count
    }));

    return {
      tenantId: request.tenantId,
      reportingDate: request.reportingDate,
      scenario: request.scenario,
      totalAccounts: results.length,
      
      stageDistribution,
      bankingTypeBreakdown,
      productAnalysis,
      
      totalOutstanding,
      totalEcl,
      overallCoverageRatio: totalOutstanding > 0 ? totalEcl / totalOutstanding : 0,
      
      qualityMetrics: {
        portfolioAge: this.calculateAveragePortfolioAge(results),
        averageDaysPastDue: totalDaysPastDue / results.length,
        collateralizationRatio: totalOutstanding > 0 ? totalCollateralValue / totalOutstanding : 0,
        concentrationRisk: this.calculateConcentrationRisk(productAnalysis)
      }
    };
  }

  /**
   * Apply discounting to ECL based on time to maturity
   */
  private applyDiscounting(
    ecl: number,
    productType: ProductType,
    stage: number
  ): number {
    
    // Only apply discounting for lifetime ECL (stages 2 and 3)
    if (stage === 1) {
      return ecl;
    }

    const discountRate = productType.discount_rate || 0.05; // Default 5%
    const forwardLookingPeriods = productType.forward_looking_periods || 12;
    
    // Simple present value calculation
    const months = Math.min(forwardLookingPeriods, 36); // Cap at 3 years
    const monthlyDiscountRate = discountRate / 12;
    const discountFactor = 1 / Math.pow(1 + monthlyDiscountRate, months);
    
    return ecl * discountFactor;
  }

  /**
   * Calculate stress testing ECL scenarios
   */
  private async calculateStressEcl(
    baseParameters: { pd12Month: number; pdLifetime: number; lgd: number; ead: number },
    account: PortfolioAccount,
    request: EclCalculationRequest
  ): Promise<{ mild: number; moderate: number; severe: number }> {
    
    // Stress multipliers
    const stressFactors = {
      mild: { pd: 1.5, lgd: 1.2 },
      moderate: { pd: 2.0, lgd: 1.5 },
      severe: { pd: 3.0, lgd: 2.0 }
    };

    const results = { mild: 0, moderate: 0, severe: 0 };

    Object.entries(stressFactors).forEach(([scenario, factors]) => {
      const stressedPd = Math.min(baseParameters.pdLifetime * factors.pd, 1.0);
      const stressedLgd = Math.min(baseParameters.lgd * factors.lgd, 1.0);
      
      results[scenario as keyof typeof results] = stressedPd * stressedLgd * baseParameters.ead;
    });

    return results;
  }

  /**
   * Calculate tenor in months for an account
   */
  private calculateTenorMonths(account: PortfolioAccount): number {
    if (!account.maturity_date) {
      return 12; // Default to 12 months
    }

    const now = new Date();
    const maturity = new Date(account.maturity_date);
    const diffMonths = (maturity.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    
    return Math.max(1, Math.round(diffMonths));
  }

  /**
   * Calculate average portfolio age
   */
  private calculateAveragePortfolioAge(results: EclCalculationResult[]): number {
    // This would require origination dates - simplified for now
    return 24; // Default 24 months
  }

  /**
   * Calculate concentration risk metric
   */
  private calculateConcentrationRisk(productAnalysis: any[]): number {
    if (productAnalysis.length === 0) return 0;

    const totalAmount = productAnalysis.reduce((sum, p) => sum + p.outstandingAmount, 0);
    const herfindahlIndex = productAnalysis.reduce((sum, p) => {
      const marketShare = p.outstandingAmount / totalAmount;
      return sum + Math.pow(marketShare, 2);
    }, 0);

    return herfindahlIndex;
  }

  /**
   * Store calculation results in database
   */
  private async storeCalculationResults(
    results: EclCalculationResult[],
    request: EclCalculationRequest
  ): Promise<void> {
    
    try {
      // Update portfolio accounts with new ECL values
      for (const result of results) {
        await PortfolioAccount.update({
          current_stage: result.currentStage,
          previous_stage: result.previousStage,
          pd_12_month: result.pd12Month,
          pd_lifetime: result.pdLifetime,
          lgd: result.lgd,
          ead: result.ead,
          ecl_12_month: result.ecl12Month,
          ecl_lifetime: result.eclLifetime,
          final_ecl: result.finalEcl,
          last_calculation_date: result.calculationDate
        }, {
          where: { account_id: result.accountId }
        });
      }

      this.log(`Stored ECL results for ${results.length} accounts`);

    } catch (error) {
      this.logError('Failed to store ECL calculation results', error);
      throw error;
    }
  }

  /**
   * Start ECL calculation batch job
   */
  async startCalculationBatch(request: {
    tenantId: string;
    reportingDate: Date;
    calculationType: string;
    portfolioFilters: any;
    calculationParameters: any;
    requestedBy: string;
  }): Promise<{
    id: string;
    status: string;
    calculationType: string;
    reportingDate: Date;
    accountsToProcess: number;
    estimatedDuration: number;
    createdAt: Date;
  }> {
    try {
      this.log('Starting ECL calculation batch job', {
        tenantId: request.tenantId,
        calculationType: request.calculationType
      });

      // Generate batch ID
      const batchId = `ecl_batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Count accounts to process
      const accountsToProcess = await this.countAccountsToProcess(request);

      // Estimate duration (roughly 2 seconds per account)
      const estimatedDuration = Math.max(60, accountsToProcess * 2); // Minimum 1 minute

      // Create batch job record
      const batchJob = {
        id: batchId,
        tenantId: request.tenantId,
        status: 'INITIATED',
        calculationType: request.calculationType,
        reportingDate: request.reportingDate,
        portfolioFilters: request.portfolioFilters,
        calculationParameters: request.calculationParameters,
        requestedBy: request.requestedBy,
        accountsToProcess,
        estimatedDuration,
        createdAt: new Date(),
        startedAt: null,
        completedAt: null,
        progress: 0,
        results: null,
        errors: []
      };

      // Store batch job (in-memory for now, should be in database)
      await this.storeBatchJob(batchJob);

      // Start async processing
      this.processBatchJobAsync(batchJob);

      return {
        id: batchId,
        status: 'INITIATED',
        calculationType: request.calculationType,
        reportingDate: request.reportingDate,
        accountsToProcess,
        estimatedDuration,
        createdAt: new Date()
      };

    } catch (error) {
      this.logError('Failed to start ECL calculation batch', error);
      throw error;
    }
  }

  /**
   * Get batch job status
   */
  async getBatchStatus(tenantId: string, batchId: string): Promise<any> {
    try {
      const batchJob = await this.getBatchJob(batchId);
      
      if (!batchJob || batchJob.tenantId !== tenantId) {
        return null;
      }

      return {
        id: batchJob.id,
        status: batchJob.status,
        calculationType: batchJob.calculationType,
        reportingDate: batchJob.reportingDate,
        accountsToProcess: batchJob.accountsToProcess,
        progress: batchJob.progress,
        createdAt: batchJob.createdAt,
        startedAt: batchJob.startedAt,
        completedAt: batchJob.completedAt,
        estimatedDuration: batchJob.estimatedDuration,
        actualDuration: batchJob.completedAt ? 
          (batchJob.completedAt.getTime() - batchJob.createdAt.getTime()) / 1000 : null,
        errors: batchJob.errors || []
      };

    } catch (error) {
      this.logError('Failed to get batch status', { batchId, error });
      throw error;
    }
  }

  /**
   * Get batch calculation results
   */
  async getBatchResults(
    tenantId: string, 
    batchId: string, 
    options: { page: number; limit: number; includeDetails: boolean }
  ): Promise<any> {
    try {
      const batchJob = await this.getBatchJob(batchId);
      
      if (!batchJob || batchJob.tenantId !== tenantId) {
        throw new Error('Batch job not found');
      }

      if (batchJob.status !== 'COMPLETED') {
        throw new Error('Batch job not completed yet');
      }

      const results = batchJob.results || { calculations: [] };
      const { page, limit, includeDetails } = options;
      
      // Paginate results
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedCalculations = results.calculations.slice(startIndex, endIndex);

      return {
        calculations: paginatedCalculations,
        summary: results.summary,
        pagination: {
          page,
          limit,
          total: results.calculations.length,
          totalPages: Math.ceil(results.calculations.length / limit)
        },
        batchInfo: {
          id: batchJob.id,
          status: batchJob.status,
          completedAt: batchJob.completedAt,
          duration: batchJob.completedAt ? 
            (batchJob.completedAt.getTime() - batchJob.createdAt.getTime()) / 1000 : null
        }
      };

    } catch (error) {
      this.logError('Failed to get batch results', { batchId, error });
      throw error;
    }
  }

  /**
   * Cancel batch job
   */
  async cancelBatch(tenantId: string, batchId: string, cancelledBy: string): Promise<any> {
    try {
      const batchJob = await this.getBatchJob(batchId);
      
      if (!batchJob || batchJob.tenantId !== tenantId) {
        throw new Error('Batch job not found');
      }

      if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(batchJob.status)) {
        throw new Error(`Cannot cancel batch job in status: ${batchJob.status}`);
      }

      // Update batch job status
      batchJob.status = 'CANCELLED';
      batchJob.cancelledAt = new Date();
      batchJob.cancelledBy = cancelledBy;

      await this.updateBatchJob(batchJob);

      this.log('Batch job cancelled', { batchId, cancelledBy });

      return {
        id: batchId,
        status: 'CANCELLED',
        cancelledAt: batchJob.cancelledAt,
        cancelledBy
      };

    } catch (error) {
      this.logError('Failed to cancel batch job', { batchId, error });
      throw error;
    }
  }

  /**
   * Process batch job asynchronously
   */
  private async processBatchJobAsync(batchJob: any): Promise<void> {
    try {
      // Update status to RUNNING
      batchJob.status = 'RUNNING';
      batchJob.startedAt = new Date();
      batchJob.progress = 0;
      await this.updateBatchJob(batchJob);

      this.log('Starting ECL calculation batch processing', {
        batchId: batchJob.id,
        accountsToProcess: batchJob.accountsToProcess
      });

      // Create ECL calculation request
      const eclRequest: EclCalculationRequest = {
        tenantId: batchJob.tenantId,
        reportingDate: batchJob.reportingDate,
        scenario: batchJob.calculationParameters.scenario || 'base',
        bankingType: batchJob.calculationParameters.bankingType || 'conventional',
        includeForwardLooking: batchJob.calculationParameters.includeForwardLooking || true,
        macroeconomicFactors: batchJob.calculationParameters.macroeconomicFactors
      };

      // Execute ECL calculation
      const results = await this.calculatePortfolioEcl(eclRequest);

      // Update batch job with results
      batchJob.status = 'COMPLETED';
      batchJob.completedAt = new Date();
      batchJob.progress = 100;
      batchJob.results = results;
      await this.updateBatchJob(batchJob);

      this.log('ECL calculation batch completed successfully', {
        batchId: batchJob.id,
        accountsProcessed: results.results.length,
        totalEcl: results.summary.totalEcl
      });

    } catch (error) {
      // Update batch job status to FAILED
      batchJob.status = 'FAILED';
      batchJob.completedAt = new Date();
      batchJob.errors = batchJob.errors || [];
      batchJob.errors.push({
        timestamp: new Date(),
        message: error.message,
        stack: error.stack
      });
      await this.updateBatchJob(batchJob);

      this.logError('ECL calculation batch failed', {
        batchId: batchJob.id,
        error: error.message
      });
    }
  }

  /**
   * Count accounts to process for batch job
   */
  private async countAccountsToProcess(request: {
    tenantId: string;
    portfolioFilters: any;
    calculationType: string;
  }): Promise<number> {
    try {
      // Build where clause from filters
      const whereClause: any = {
        is_active: true
      };

      if (request.portfolioFilters.bankingType) {
        whereClause.banking_type = request.portfolioFilters.bankingType;
      }

      if (request.portfolioFilters.productType) {
        whereClause.product_type = request.portfolioFilters.productType;
      }

      if (request.portfolioFilters.stage) {
        whereClause.current_stage = request.portfolioFilters.stage;
      }

      // Count accounts
      const count = await PortfolioAccount.count({
        where: whereClause
      });

      return count;

    } catch (error) {
      console.warn('Failed to count accounts, using default estimate', error);
      return 100; // Default estimate
    }
  }

  // In-memory storage for batch jobs (should be replaced with database)
  private batchJobs: Map<string, any> = new Map();

  /**
   * Store batch job
   */
  private async storeBatchJob(batchJob: any): Promise<void> {
    this.batchJobs.set(batchJob.id, { ...batchJob });
  }

  /**
   * Get batch job
   */
  private async getBatchJob(batchId: string): Promise<any> {
    return this.batchJobs.get(batchId) || null;
  }

  /**
   * Update batch job
   */
  private async updateBatchJob(batchJob: any): Promise<void> {
    this.batchJobs.set(batchJob.id, { ...batchJob });
  }

  /**
   * Get calculation history for an account
   */
  async getCalculationHistory(accountId: string): Promise<any[]> {
    // TODO: Implement calculation history tracking
    return [];
  }

  /**
   * Validate calculation inputs
   */
  private validateCalculationRequest(request: EclCalculationRequest): void {
    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.reportingDate) {
      throw new Error('Reporting date is required');
    }

    if (!['base', 'adverse', 'severely_adverse'].includes(request.scenario)) {
      throw new Error('Invalid scenario specified');
    }

    if (!['conventional', 'syariah'].includes(request.bankingType)) {
      throw new Error('Invalid banking type specified');
    }
  }
}

export default EclCalculationService;

// Export singleton instance for easier usage
export const eclCalculationService = new EclCalculationService();