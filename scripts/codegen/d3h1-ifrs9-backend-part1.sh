#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/codegen/d3h1-ifrs9-backend-part1.sh
# Generated: 2025-07-22 15:30:00
# Phase: D3H1 - Basic IFRS 9 Data Models
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Backend code generation (Part 1/2) - Models and Services
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d3h1-backend-part1-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D3H1"
PHASE_NAME="Basic IFRS 9 Data Models - Backend Part 1"
CURRENT_PHASE="${PHASE_ID}"

# Create logs directory
mkdir -p "${PROJECT_ROOT}/logs"

# MANDATORY: Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# MANDATORY: Error handling
handle_error() {
    local exit_code=$?
    log_error "Code generation failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# MANDATORY: Code generation function
generate_code_file() {
    local file_path="$1"
    local file_type="$2"
    local description="$3"
    local template_content="$4"
    
    log_info "Generating ${file_type}: ${file_path}"
    
    # Create directory if it doesn't exist
    mkdir -p "$(dirname "${file_path}")"
    
    # Generate file with MANDATORY path documentation
    cat > "${file_path}" << EOF
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: ${file_path}
// Generated: $(date)
// Phase: ${CURRENT_PHASE} - ${PHASE_NAME}
// Methodology: Phased Shell-Driven Development (PSDD)
// Purpose: ${description}
// ============================================================================

${template_content}
EOF
    
    log_success "Generated: ${file_path}"
}

# Generate IFRS 9 ECL Job Model
generate_ecl_job_model() {
    local template_content='import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from "typeorm";
import { PortfolioAccount } from "./portfolio-account.model";
import { EclResult } from "./ecl-result.model";

@Entity("ecl_jobs")
export class EclJob {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId: string;

  @Column({ name: "job_name", length: 200 })
  jobName: string;

  @Column({ name: "calculation_date", type: "date" })
  calculationDate: Date;

  @Column({ name: "calculation_type", length: 50 })
  calculationType: string; // "monthly", "quarterly", "annual", "ad_hoc"

  @Column({ name: "portfolio_filter", type: "jsonb", nullable: true })
  portfolioFilter: any;

  @Column({ name: "model_parameters", type: "jsonb" })
  modelParameters: {
    pdMethod: string;
    lgdMethod: string;
    eadMethod: string;
    stagingCriteria: any;
    macroScenarios: any;
  };

  @Column({ name: "status", length: 50, default: "pending" })
  status: string; // "pending", "running", "completed", "failed"

  @Column({ name: "progress_percentage", type: "integer", default: 0 })
  progressPercentage: number;

  @Column({ name: "total_accounts", type: "integer", nullable: true })
  totalAccounts: number;

  @Column({ name: "processed_accounts", type: "integer", default: 0 })
  processedAccounts: number;

  @Column({ name: "calculation_start_time", type: "timestamp", nullable: true })
  calculationStartTime: Date;

  @Column({ name: "calculation_end_time", type: "timestamp", nullable: true })
  calculationEndTime: Date;

  @Column({ name: "error_message", type: "text", nullable: true })
  errorMessage: string;

  @Column({ name: "created_by", type: "uuid" })
  createdBy: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => EclResult, result => result.eclJob)
  results: EclResult[];
}

// Type definitions for IFRS 9 calculations
export interface EclCalculationInput {
  tenantId: string;
  portfolioFilter?: {
    productTypes?: string[];
    customerTypes?: string[];
    stageFilter?: number[];
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
  modelParameters: {
    pdMethod: "historical" | "through_the_cycle" | "point_in_time";
    lgdMethod: "historical" | "downturn" | "best_estimate";
    eadMethod: "current" | "credit_conversion_factor" | "behavioral";
    stagingCriteria: {
      stage1_criteria: any;
      stage2_criteria: any;
      stage3_criteria: any;
    };
    macroScenarios: {
      base_scenario: any;
      adverse_scenario?: any;
      severely_adverse_scenario?: any;
    };
  };
}

export interface EclCalculationOutput {
  accountId: string;
  stage: number;
  pd12m: number;
  pdLifetime: number;
  lgd: number;
  ead: number;
  ecl12m: number;
  eclLifetime: number;
  finalEcl: number;
}

export interface EclJobSummary {
  totalAccounts: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  totalEcl12m: number;
  totalEclLifetime: number;
  totalFinalEcl: number;
  calculationDuration: number;
}'

    generate_code_file \
        "packages/backend/src/modules/ifrs9/models/ecl-job.model.ts" \
        "TypeScript Model" \
        "ECL calculation job model with IFRS 9 parameters and status tracking" \
        "$template_content"
}

# Generate IFRS 9 ECL Result Model
generate_ecl_result_model() {
    local template_content='import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { EclJob } from "./ecl-job.model";
import { PortfolioAccount } from "./portfolio-account.model";

@Entity("ecl_results")
export class EclResult {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId: string;

  @Column({ name: "job_id", type: "uuid" })
  jobId: string;

  @Column({ name: "account_id", type: "uuid" })
  accountId: string;

  @Column({ name: "calculation_date", type: "date" })
  calculationDate: Date;

  // IFRS 9 Stage Information
  @Column({ name: "ifrs9_stage", type: "integer" })
  ifrs9Stage: number;

  @Column({ name: "stage_change_flag", type: "boolean", default: false })
  stageChangeFlag: boolean;

  @Column({ name: "previous_stage", type: "integer", nullable: true })
  previousStage: number;

  // Probability of Default (PD)
  @Column({ name: "pd_12m", type: "decimal", precision: 10, scale: 8 })
  pd12m: number;

  @Column({ name: "pd_lifetime", type: "decimal", precision: 10, scale: 8 })
  pdLifetime: number;

  @Column({ name: "pd_method", length: 50 })
  pdMethod: string;

  // Loss Given Default (LGD)
  @Column({ name: "lgd", type: "decimal", precision: 8, scale: 6 })
  lgd: number;

  @Column({ name: "lgd_method", length: 50 })
  lgdMethod: string;

  @Column({ name: "collateral_adjustment", type: "decimal", precision: 8, scale: 6, default: 0 })
  collateralAdjustment: number;

  // Exposure at Default (EAD)
  @Column({ name: "ead", type: "decimal", precision: 20, scale: 2 })
  ead: number;

  @Column({ name: "ead_method", length: 50 })
  eadMethod: string;

  @Column({ name: "credit_conversion_factor", type: "decimal", precision: 8, scale: 6, nullable: true })
  creditConversionFactor: number;

  // ECL Calculations
  @Column({ name: "ecl_12m", type: "decimal", precision: 20, scale: 2 })
  ecl12m: number;

  @Column({ name: "ecl_lifetime", type: "decimal", precision: 20, scale: 2 })
  eclLifetime: number;

  @Column({ name: "final_ecl", type: "decimal", precision: 20, scale: 2 })
  finalEcl: number;

  // Discount Factor for ECL
  @Column({ name: "discount_factor", type: "decimal", precision: 10, scale: 8, default: 1.0 })
  discountFactor: number;

  @Column({ name: "effective_interest_rate", type: "decimal", precision: 8, scale: 6, nullable: true })
  effectiveInterestRate: number;

  // Model Details
  @Column({ name: "model_version", length: 50 })
  modelVersion: string;

  @Column({ name: "calculation_details", type: "jsonb" })
  calculationDetails: {
    inputs: any;
    intermediateSteps: any;
    modelParameters: any;
    qualityFlags: any;
  };

  // Islamic Banking Specific
  @Column({ name: "is_syariah_compliant", type: "boolean", default: false })
  isSyariahCompliant: boolean;

  @Column({ name: "syariah_adjustments", type: "jsonb", nullable: true })
  syariahAdjustments: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  // Relationships
  @ManyToOne(() => EclJob, job => job.results)
  @JoinColumn({ name: "job_id" })
  eclJob: EclJob;

  @ManyToOne(() => PortfolioAccount)
  @JoinColumn({ name: "account_id" })
  portfolioAccount: PortfolioAccount;
}

// Data Transfer Objects
export interface EclResultDto {
  id: string;
  accountId: string;
  calculationDate: Date;
  ifrs9Stage: number;
  stageChangeFlag: boolean;
  pd12m: number;
  pdLifetime: number;
  lgd: number;
  ead: number;
  ecl12m: number;
  eclLifetime: number;
  finalEcl: number;
  modelVersion: string;
  isSyariahCompliant: boolean;
}

export interface EclSummaryDto {
  totalAccounts: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  totalOutstanding: number;
  totalEcl12m: number;
  totalEclLifetime: number;
  totalFinalEcl: number;
  coverageRatio: number;
  averagePd12m: number;
  averageLgd: number;
}'

    generate_code_file \
        "packages/backend/src/modules/ifrs9/models/ecl-result.model.ts" \
        "TypeScript Model" \
        "ECL calculation result model with comprehensive IFRS 9 metrics" \
        "$template_content"
}

# Generate Portfolio Account Model Enhancement
generate_portfolio_account_model() {
    local template_content='import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { EclResult } from "./ecl-result.model";

@Entity("portfolio_accounts")
export class PortfolioAccount {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "tenant_id", type: "uuid" })
  tenantId: string;

  @Column({ name: "account_id", length: 100 })
  accountId: string;

  @Column({ name: "customer_id", length: 100 })
  customerId: string;

  @Column({ name: "contract_id", length: 100, nullable: true })
  contractId: string;

  @Column({ name: "product_type", length: 100 })
  productType: string;

  // Financial Information
  @Column({ name: "outstanding_amount", type: "decimal", precision: 20, scale: 2, default: 0 })
  outstandingAmount: number;

  @Column({ name: "committed_amount", type: "decimal", precision: 20, scale: 2, nullable: true })
  committedAmount: number;

  @Column({ name: "original_amount", type: "decimal", precision: 20, scale: 2 })
  originalAmount: number;

  @Column({ name: "currency_code", length: 3, default: "IDR" })
  currencyCode: string;

  // Dates
  @Column({ name: "origination_date", type: "date" })
  originationDate: Date;

  @Column({ name: "maturity_date", type: "date", nullable: true })
  maturityDate: Date;

  @Column({ name: "reporting_date", type: "date" })
  reportingDate: Date;

  @Column({ name: "next_payment_date", type: "date", nullable: true })
  nextPaymentDate: Date;

  // IFRS 9 Staging
  @Column({ name: "current_stage", type: "integer", default: 1 })
  currentStage: number;

  @Column({ name: "previous_stage", type: "integer", nullable: true })
  previousStage: number;

  @Column({ name: "stage_change_date", type: "date", nullable: true })
  stageChangeDate: Date;

  @Column({ name: "days_past_due", type: "integer", default: 0 })
  daysPastDue: number;

  // Customer Information
  @Column({ name: "customer_name", length: 200, nullable: true })
  customerName: string;

  @Column({ name: "customer_type", length: 50, nullable: true })
  customerType: string;

  @Column({ name: "industry_sector", length: 100, nullable: true })
  industrySector: string;

  @Column({ name: "geographical_region", length: 100, nullable: true })
  geographicalRegion: string;

  // Ratings
  @Column({ name: "internal_rating", length: 20, nullable: true })
  internalRating: string;

  @Column({ name: "external_rating", length: 20, nullable: true })
  externalRating: string;

  @Column({ name: "credit_rating", length: 10, nullable: true })
  creditRating: string;

  // IFRS 9 Parameters
  @Column({ name: "pd_12m", type: "decimal", precision: 10, scale: 8, nullable: true })
  pd12m: number;

  @Column({ name: "pd_lifetime", type: "decimal", precision: 10, scale: 8, nullable: true })
  pdLifetime: number;

  @Column({ name: "lgd", type: "decimal", precision: 8, scale: 6, nullable: true })
  lgd: number;

  @Column({ name: "ead", type: "decimal", precision: 20, scale: 2, nullable: true })
  ead: number;

  @Column({ name: "ecl_12m", type: "decimal", precision: 20, scale: 2, default: 0 })
  ecl12m: number;

  @Column({ name: "ecl_lifetime", type: "decimal", precision: 20, scale: 2, default: 0 })
  eclLifetime: number;

  @Column({ name: "provision_amount", type: "decimal", precision: 15, scale: 2, nullable: true })
  provisionAmount: number;

  // Interest/Profit Information
  @Column({ name: "interest_rate", type: "decimal", precision: 5, scale: 4, nullable: true })
  interestRate: number;

  @Column({ name: "profit_rate", type: "decimal", precision: 5, scale: 4, nullable: true })
  profitRate: number;

  @Column({ name: "accrued_interest", type: "decimal", precision: 15, scale: 2, nullable: true })
  accruedInterest: number;

  // Collateral Information
  @Column({ name: "collateral_value", type: "decimal", precision: 15, scale: 2, nullable: true })
  collateralValue: number;

  @Column({ name: "collateral_type", length: 100, nullable: true })
  collateralType: string;

  @Column({ name: "guarantee_amount", type: "decimal", precision: 15, scale: 2, nullable: true })
  guaranteeAmount: number;

  // Islamic Banking Specific
  @Column({ name: "is_syariah_compliant", type: "boolean", default: false })
  isSyariahCompliant: boolean;

  @Column({ name: "syariah_contract_type", length: 50, nullable: true })
  syariahContractType: string;

  @Column({ name: "syariah_structure", length: 100, nullable: true })
  syariahStructure: string;

  @Column({ name: "profit_sharing_ratio", type: "decimal", precision: 8, scale: 6, nullable: true })
  profitSharingRatio: number;

  @Column({ name: "syariah_product_code", length: 50, nullable: true })
  syariahProductCode: string;

  // Status
  @Column({ name: "account_status", length: 20, default: "active" })
  accountStatus: string;

  @Column({ name: "is_active", type: "boolean", default: true })
  isActive: boolean;

  @Column({ name: "created_by", type: "uuid", nullable: true })
  createdBy: string;

  @Column({ name: "updated_by", type: "uuid", nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => EclResult, result => result.portfolioAccount)
  eclResults: EclResult[];

  // Methods for IFRS 9 calculations
  public getDaysToMaturity(): number {
    if (!this.maturityDate) return 0;
    const today = new Date();
    const maturity = new Date(this.maturityDate);
    const diffTime = Math.abs(maturity.getTime() - today.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public isDefaulted(): boolean {
    return this.currentStage === 3;
  }

  public hasSignificantCreditRiskIncrease(): boolean {
    return this.currentStage === 2;
  }

  public getCollateralCoverageRatio(): number {
    if (!this.collateralValue || this.outstandingAmount === 0) return 0;
    return this.collateralValue / this.outstandingAmount;
  }
}

// Data Transfer Objects
export interface PortfolioAccountDto {
  id: string;
  accountId: string;
  customerId: string;
  productType: string;
  outstandingAmount: number;
  currentStage: number;
  daysPastDue: number;
  customerName: string;
  isSyariahCompliant: boolean;
  pd12m?: number;
  lgd?: number;
  ecl12m: number;
  eclLifetime: number;
}

export interface PortfolioSummaryDto {
  totalAccounts: number;
  totalOutstanding: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  stage1Outstanding: number;
  stage2Outstanding: number;
  stage3Outstanding: number;
  totalEcl: number;
  coverageRatio: number;
  syariahOutstanding: number;
  conventionalOutstanding: number;
}'

    generate_code_file \
        "packages/backend/src/modules/ifrs9/models/portfolio-account.model.ts" \
        "TypeScript Model" \
        "Enhanced portfolio account model with comprehensive IFRS 9 support" \
        "$template_content"
}

# Generate Basic ECL Calculation Service
generate_ecl_calculation_service() {
    local template_content='import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PortfolioAccount } from "../models/portfolio-account.model";
import { EclJob } from "../models/ecl-job.model";
import { EclResult } from "../models/ecl-result.model";
import { EclCalculationInput, EclCalculationOutput, EclJobSummary } from "../models/ecl-job.model";

@Injectable()
export class EclCalculationService {
  private readonly logger = new Logger(EclCalculationService.name);

  constructor(
    @InjectRepository(PortfolioAccount)
    private portfolioAccountRepository: Repository<PortfolioAccount>,
    @InjectRepository(EclJob)
    private eclJobRepository: Repository<EclJob>,
    @InjectRepository(EclResult)
    private eclResultRepository: Repository<EclResult>
  ) {}

  /**
   * Calculate ECL for a portfolio
   */
  async calculateEcl(input: EclCalculationInput): Promise<string> {
    const transaction = await this.portfolioAccountRepository.manager.transaction(async manager => {
      try {
        this.logger.log(`Starting ECL calculation for tenant: ${input.tenantId}`);

        // Create ECL job
        const eclJob = new EclJob();
        eclJob.tenantId = input.tenantId;
        eclJob.jobName = `ECL Calculation - ${new Date().toISOString()}`;
        eclJob.calculationDate = new Date();
        eclJob.calculationType = "monthly";
        eclJob.portfolioFilter = input.portfolioFilter;
        eclJob.modelParameters = input.modelParameters;
        eclJob.status = "running";
        eclJob.calculationStartTime = new Date();
        eclJob.createdBy = "system"; // TODO: Get from auth context

        const savedJob = await manager.save(eclJob);

        // Get portfolio accounts
        const accounts = await this.getPortfolioAccounts(input.tenantId, input.portfolioFilter, manager);
        
        // Update job with total accounts
        savedJob.totalAccounts = accounts.length;
        await manager.save(savedJob);

        this.logger.log(`Processing ${accounts.length} accounts for ECL calculation`);

        // Calculate ECL for each account
        const eclResults: EclResult[] = [];
        for (let i = 0; i < accounts.length; i++) {
          const account = accounts[i];
          
          try {
            const eclOutput = await this.calculateAccountEcl(account, input.modelParameters);
            
            const eclResult = new EclResult();
            eclResult.tenantId = input.tenantId;
            eclResult.jobId = savedJob.id;
            eclResult.accountId = account.id;
            eclResult.calculationDate = new Date();
            eclResult.ifrs9Stage = eclOutput.stage;
            eclResult.pd12m = eclOutput.pd12m;
            eclResult.pdLifetime = eclOutput.pdLifetime;
            eclResult.lgd = eclOutput.lgd;
            eclResult.ead = eclOutput.ead;
            eclResult.ecl12m = eclOutput.ecl12m;
            eclResult.eclLifetime = eclOutput.eclLifetime;
            eclResult.finalEcl = eclOutput.finalEcl;
            eclResult.pdMethod = input.modelParameters.pdMethod;
            eclResult.lgdMethod = input.modelParameters.lgdMethod;
            eclResult.eadMethod = input.modelParameters.eadMethod;
            eclResult.modelVersion = "1.0.0";
            eclResult.isSyariahCompliant = account.isSyariahCompliant;
            eclResult.calculationDetails = {
              inputs: { accountId: account.accountId, outstandingAmount: account.outstandingAmount },
              intermediateSteps: {},
              modelParameters: input.modelParameters,
              qualityFlags: {}
            };

            eclResults.push(eclResult);

            // Update progress
            savedJob.processedAccounts = i + 1;
            savedJob.progressPercentage = Math.round(((i + 1) / accounts.length) * 100);
            await manager.save(savedJob);

          } catch (error) {
            this.logger.error(`Error calculating ECL for account ${account.accountId}: ${error.message}`);
            // Continue with other accounts
          }
        }

        // Save all ECL results
        await manager.save(eclResults);

        // Complete the job
        savedJob.status = "completed";
        savedJob.calculationEndTime = new Date();
        savedJob.progressPercentage = 100;
        await manager.save(savedJob);

        this.logger.log(`ECL calculation completed for job: ${savedJob.id}`);
        return savedJob.id;

      } catch (error) {
        this.logger.error(`ECL calculation failed: ${error.message}`, error.stack);
        throw new Error(`ECL calculation failed: ${error.message}`);
      }
    });

    return transaction;
  }

  /**
   * Get portfolio accounts based on filter
   */
  private async getPortfolioAccounts(
    tenantId: string, 
    filter: any, 
    manager: any
  ): Promise<PortfolioAccount[]> {
    const queryBuilder = manager
      .createQueryBuilder(PortfolioAccount, "account")
      .where("account.tenantId = :tenantId", { tenantId })
      .andWhere("account.isActive = true");

    if (filter?.productTypes?.length > 0) {
      queryBuilder.andWhere("account.productType IN (:...productTypes)", { 
        productTypes: filter.productTypes 
      });
    }

    if (filter?.customerTypes?.length > 0) {
      queryBuilder.andWhere("account.customerType IN (:...customerTypes)", { 
        customerTypes: filter.customerTypes 
      });
    }

    if (filter?.stageFilter?.length > 0) {
      queryBuilder.andWhere("account.currentStage IN (:...stages)", { 
        stages: filter.stageFilter 
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Calculate ECL for a single account (Basic implementation)
   */
  private async calculateAccountEcl(
    account: PortfolioAccount, 
    modelParameters: any
  ): Promise<EclCalculationOutput> {
    
    // Basic IFRS 9 ECL calculation
    
    // 1. Determine IFRS 9 stage
    const stage = this.determineIfrs9Stage(account);
    
    // 2. Calculate PD (Probability of Default)
    const pd12m = this.calculatePd12m(account, modelParameters.pdMethod);
    const pdLifetime = this.calculatePdLifetime(account, modelParameters.pdMethod);
    
    // 3. Calculate LGD (Loss Given Default)
    const lgd = this.calculateLgd(account, modelParameters.lgdMethod);
    
    // 4. Calculate EAD (Exposure at Default)
    const ead = this.calculateEad(account, modelParameters.eadMethod);
    
    // 5. Calculate ECL
    const ecl12m = stage === 1 ? pd12m * lgd * ead : 0;
    const eclLifetime = stage > 1 ? pdLifetime * lgd * ead : 0;
    const finalEcl = Math.max(ecl12m, eclLifetime);

    return {
      accountId: account.id,
      stage,
      pd12m,
      pdLifetime,
      lgd,
      ead,
      ecl12m,
      eclLifetime,
      finalEcl
    };
  }

  /**
   * Determine IFRS 9 stage based on basic criteria
   */
  private determineIfrs9Stage(account: PortfolioAccount): number {
    // Basic staging logic
    if (account.daysPastDue >= 90) {
      return 3; // Default
    } else if (account.daysPastDue >= 30) {
      return 2; // Significant increase in credit risk
    } else {
      return 1; // Performing
    }
  }

  /**
   * Calculate 12-month PD (Basic implementation)
   */
  private calculatePd12m(account: PortfolioAccount, method: string): number {
    // Basic PD calculation based on days past due and ratings
    let basePd = 0.02; // 2% base rate

    // Adjust based on days past due
    if (account.daysPastDue > 0) {
      basePd *= (1 + (account.daysPastDue / 30) * 0.5);
    }

    // Adjust based on internal rating (simplified)
    if (account.internalRating) {
      const ratingAdjustments: { [key: string]: number } = {
        "AAA": 0.1, "AA": 0.2, "A": 0.5, "BBB": 1.0,
        "BB": 2.0, "B": 4.0, "CCC": 8.0, "CC": 15.0, "C": 25.0
      };
      
      for (const [rating, multiplier] of Object.entries(ratingAdjustments)) {
        if (account.internalRating.includes(rating)) {
          basePd *= multiplier;
          break;
        }
      }
    }

    // Islamic banking adjustment
    if (account.isSyariahCompliant) {
      basePd *= 0.9; // 10% reduction for Syariah products
    }

    return Math.min(basePd, 1.0); // Cap at 100%
  }

  /**
   * Calculate lifetime PD (Basic implementation)
   */
  private calculatePdLifetime(account: PortfolioAccount, method: string): number {
    const pd12m = this.calculatePd12m(account, method);
    const yearsToMaturity = account.getDaysToMaturity() / 365;
    
    // Simple geometric progression for lifetime PD
    return 1 - Math.pow(1 - pd12m, yearsToMaturity);
  }

  /**
   * Calculate LGD (Basic implementation)
   */
  private calculateLgd(account: PortfolioAccount, method: string): number {
    // Basic LGD calculation
    let baseLgd = 0.45; // 45% base LGD

    // Adjust based on collateral
    const collateralRatio = account.getCollateralCoverageRatio();
    if (collateralRatio > 0) {
      baseLgd *= (1 - Math.min(collateralRatio * 0.7, 0.8)); // Max 80% reduction
    }

    // Product type adjustment
    const productLgdAdjustments: { [key: string]: number } = {
      "Personal Loan": 1.2,
      "Mortgage Loan": 0.6,
      "Working Capital": 1.0,
      "Murabaha": 0.8,
      "Musharaka": 1.1,
      "Mudharaba": 1.3
    };

    const adjustment = productLgdAdjustments[account.productType] || 1.0;
    baseLgd *= adjustment;

    return Math.min(Math.max(baseLgd, 0.05), 0.95); // Between 5% and 95%
  }

  /**
   * Calculate EAD (Basic implementation)
   */
  private calculateEad(account: PortfolioAccount, method: string): number {
    // For most products, EAD = Outstanding Amount
    let ead = account.outstandingAmount;

    // Add undrawn commitments with credit conversion factor
    if (account.committedAmount && account.committedAmount > account.outstandingAmount) {
      const undrawnAmount = account.committedAmount - account.outstandingAmount;
      const ccf = 0.75; // 75% credit conversion factor (basic)
      ead += undrawnAmount * ccf;
    }

    return ead;
  }

  /**
   * Get ECL job summary
   */
  async getEclJobSummary(jobId: string): Promise<EclJobSummary> {
    const job = await this.eclJobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new Error("ECL job not found");
    }

    const results = await this.eclResultRepository.find({ where: { jobId } });
    
    const summary: EclJobSummary = {
      totalAccounts: results.length,
      stage1Count: results.filter(r => r.ifrs9Stage === 1).length,
      stage2Count: results.filter(r => r.ifrs9Stage === 2).length,
      stage3Count: results.filter(r => r.ifrs9Stage === 3).length,
      totalEcl12m: results.reduce((sum, r) => sum + r.ecl12m, 0),
      totalEclLifetime: results.reduce((sum, r) => sum + r.eclLifetime, 0),
      totalFinalEcl: results.reduce((sum, r) => sum + r.finalEcl, 0),
      calculationDuration: job.calculationEndTime && job.calculationStartTime ? 
        job.calculationEndTime.getTime() - job.calculationStartTime.getTime() : 0
    };

    return summary;
  }
}'

    generate_code_file \
        "packages/backend/src/modules/ifrs9/services/ecl-calculation.service.ts" \
        "TypeScript Service" \
        "Basic ECL calculation service with IFRS 9 logic implementation" \
        "$template_content"
}

# Main execution function
main() {
    log_info "Starting IFRS 9 Backend Code Generation (Part 1)..."
    
    # Generate models
    generate_ecl_job_model
    generate_ecl_result_model
    generate_portfolio_account_model
    generate_ecl_calculation_service
    
    log_success "Backend code generation (Part 1) completed successfully"
    log_info "Generated files logged in: ${LOG_FILE}"
    
    # Auto-continue to Part 2
    if [[ -f "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-backend-part2.sh" ]]; then
        log_info "Auto-continuing to Part 2..."
        "${PROJECT_ROOT}/scripts/codegen/d3h1-ifrs9-backend-part2.sh"
    fi
}

# Execute main function
main "$@"