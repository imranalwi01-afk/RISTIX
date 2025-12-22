#!/bin/bash
# ============================================================================
# PSDD ARTIFACT DOCUMENTATION
# ============================================================================
# File Path: ./scripts/codegen/d3h1-ifrs9-backend-part2.sh
# Generated: 2025-07-22 15:30:00
# Phase: D3H1 - Basic IFRS 9 Data Models
# Methodology: Phased Shell-Driven Development (PSDD)
# Purpose: Backend code generation (Part 2/2) - Controllers and Routes
# ============================================================================

set -e  # Exit on any error
set -u  # Exit on undefined variables

# MANDATORY: Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d3h1-backend-part2-$(date +%Y%m%d-%H%M%S).log"

# MANDATORY: Phase identification
PHASE_ID="D3H1"
PHASE_NAME="Basic IFRS 9 Data Models - Backend Part 2"
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

# Generate IFRS 9 ECL Controller
generate_ecl_controller() {
    local template_content='import { Controller, Post, Get, Body, Param, Query, UseGuards, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { EclCalculationService } from "../services/ecl-calculation.service";
import { EclCalculationInput, EclJobSummary } from "../models/ecl-job.model";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../../tenant/guards/tenant.guard";
import { CurrentTenant } from "../../../tenant/decorators/current-tenant.decorator";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";

@ApiTags("IFRS 9 - ECL Calculations")
@Controller("api/ifrs9/ecl")
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class EclCalculationController {
  private readonly logger = new Logger(EclCalculationController.name);

  constructor(private readonly eclCalculationService: EclCalculationService) {}

  @Post("calculate")
  @ApiOperation({ summary: "Start ECL calculation for portfolio" })
  @ApiResponse({ status: 201, description: "ECL calculation job started successfully" })
  @ApiResponse({ status: 400, description: "Invalid input parameters" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - insufficient permissions" })
  async calculateEcl(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() input: Omit<EclCalculationInput, "tenantId">
  ) {
    try {
      this.logger.log(`Starting ECL calculation for tenant: ${tenantId}`);
      
      const calculationInput: EclCalculationInput = {
        ...input,
        tenantId
      };
      
      const jobId = await this.eclCalculationService.calculateEcl(calculationInput);
      
      return {
        success: true,
        data: {
          jobId,
          message: "ECL calculation started successfully"
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`ECL calculation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get("jobs/:jobId")
  @ApiOperation({ summary: "Get ECL calculation job status" })
  @ApiResponse({ status: 200, description: "Job status retrieved successfully" })
  @ApiResponse({ status: 404, description: "Job not found" })
  async getJobStatus(@Param("jobId") jobId: string) {
    try {
      const job = await this.eclCalculationService.getJobById(jobId);
      
      return {
        success: true,
        data: {
          id: job.id,
          status: job.status,
          progressPercentage: job.progressPercentage,
          totalAccounts: job.totalAccounts,
          processedAccounts: job.processedAccounts,
          calculationStartTime: job.calculationStartTime,
          calculationEndTime: job.calculationEndTime,
          errorMessage: job.errorMessage
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get job status: ${error.message}`);
      throw error;
    }
  }

  @Get("jobs/:jobId/summary")
  @ApiOperation({ summary: "Get ECL calculation job summary" })
  @ApiResponse({ status: 200, description: "Job summary retrieved successfully" })
  @ApiResponse({ status: 404, description: "Job not found" })
  async getJobSummary(@Param("jobId") jobId: string): Promise<{ success: boolean; data: EclJobSummary }> {
    try {
      const summary = await this.eclCalculationService.getEclJobSummary(jobId);
      
      return {
        success: true,
        data: summary
      };
    } catch (error) {
      this.logger.error(`Failed to get job summary: ${error.message}`);
      throw error;
    }
  }

  @Get("jobs/:jobId/results")
  @ApiOperation({ summary: "Get ECL calculation results" })
  @ApiResponse({ status: 200, description: "Results retrieved successfully" })
  async getJobResults(
    @Param("jobId") jobId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("stage") stage?: number,
    @Query("sortBy") sortBy: string = "accountId",
    @Query("sortOrder") sortOrder: "ASC" | "DESC" = "ASC"
  ) {
    try {
      const results = await this.eclCalculationService.getJobResults(jobId, {
        page,
        limit,
        stage,
        sortBy,
        sortOrder
      });
      
      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get job results: ${error.message}`);
      throw error;
    }
  }

  @Get("portfolio/summary")
  @ApiOperation({ summary: "Get portfolio ECL summary" })
  @ApiResponse({ status: 200, description: "Portfolio summary retrieved successfully" })
  async getPortfolioSummary(
    @CurrentTenant() tenantId: string,
    @Query("asOfDate") asOfDate?: string
  ) {
    try {
      const summary = await this.eclCalculationService.getPortfolioSummary(tenantId, asOfDate);
      
      return {
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get portfolio summary: ${error.message}`);
      throw error;
    }
  }

  @Get("models/parameters")
  @ApiOperation({ summary: "Get available model parameters" })
  @ApiResponse({ status: 200, description: "Model parameters retrieved successfully" })
  async getModelParameters(@CurrentTenant() tenantId: string) {
    try {
      return {
        success: true,
        data: {
          pdMethods: ["historical", "through_the_cycle", "point_in_time"],
          lgdMethods: ["historical", "downturn", "best_estimate"],
          eadMethods: ["current", "credit_conversion_factor", "behavioral"],
          stagingCriteria: {
            stage1_criteria: {
              max_days_past_due: 30,
              credit_quality: "good"
            },
            stage2_criteria: {
              min_days_past_due: 31,
              max_days_past_due: 89,
              credit_quality: "satisfactory"
            },
            stage3_criteria: {
              min_days_past_due: 90,
              credit_quality: "poor"
            }
          },
          defaultMacroScenarios: {
            base_scenario: {
              gdp_growth: 5.2,
              unemployment_rate: 5.1,
              interest_rate: 6.0
            },
            adverse_scenario: {
              gdp_growth: 2.1,
              unemployment_rate: 8.5,
              interest_rate: 8.0
            }
          }
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get model parameters: ${error.message}`);
      throw error;
    }
  }
}'

    generate_code_file \
        "packages/backend/src/modules/ifrs9/controllers/ecl-calculation.controller.ts" \
        "TypeScript Controller" \
        "ECL calculation REST API controller with comprehensive endpoints" \
        "$template_content"
}

# Generate Portfolio Management Controller
generate_portfolio_controller() {
    local template_content='import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Logger } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { PortfolioAccountService } from "../services/portfolio-account.service";
import { PortfolioAccount } from "../models/portfolio-account.model";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../../tenant/guards/tenant.guard";
import { CurrentTenant } from "../../../tenant/decorators/current-tenant.decorator";
import { CurrentUser } from "../../../auth/decorators/current-user.decorator";

@ApiTags("IFRS 9 - Portfolio Management")
@Controller("api/ifrs9/portfolio")
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class PortfolioController {
  private readonly logger = new Logger(PortfolioController.name);

  constructor(private readonly portfolioAccountService: PortfolioAccountService) {}

  @Get("accounts")
  @ApiOperation({ summary: "Get portfolio accounts with filtering" })
  @ApiResponse({ status: 200, description: "Portfolio accounts retrieved successfully" })
  async getAccounts(
    @CurrentTenant() tenantId: string,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 50,
    @Query("productType") productType?: string,
    @Query("stage") stage?: number,
    @Query("customerType") customerType?: string,
    @Query("isActive") isActive?: boolean,
    @Query("syariahCompliant") syariahCompliant?: boolean,
    @Query("search") search?: string,
    @Query("sortBy") sortBy: string = "accountId",
    @Query("sortOrder") sortOrder: "ASC" | "DESC" = "ASC"
  ) {
    try {
      const accounts = await this.portfolioAccountService.getAccounts(tenantId, {
        page,
        limit,
        productType,
        stage,
        customerType,
        isActive,
        syariahCompliant,
        search,
        sortBy,
        sortOrder
      });
      
      return {
        success: true,
        data: accounts,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get portfolio accounts: ${error.message}`);
      throw error;
    }
  }

  @Get("accounts/:accountId")
  @ApiOperation({ summary: "Get portfolio account details" })
  @ApiResponse({ status: 200, description: "Account details retrieved successfully" })
  @ApiResponse({ status: 404, description: "Account not found" })
  async getAccountDetails(
    @CurrentTenant() tenantId: string,
    @Param("accountId") accountId: string
  ) {
    try {
      const account = await this.portfolioAccountService.getAccountById(tenantId, accountId);
      
      return {
        success: true,
        data: account,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get account details: ${error.message}`);
      throw error;
    }
  }

  @Get("summary")
  @ApiOperation({ summary: "Get portfolio summary statistics" })
  @ApiResponse({ status: 200, description: "Portfolio summary retrieved successfully" })
  async getPortfolioSummary(
    @CurrentTenant() tenantId: string,
    @Query("asOfDate") asOfDate?: string,
    @Query("groupBy") groupBy?: string
  ) {
    try {
      const summary = await this.portfolioAccountService.getPortfolioSummary(tenantId, asOfDate, groupBy);
      
      return {
        success: true,
        data: summary,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get portfolio summary: ${error.message}`);
      throw error;
    }
  }

  @Get("staging/analysis")
  @ApiOperation({ summary: "Get IFRS 9 staging analysis" })
  @ApiResponse({ status: 200, description: "Staging analysis retrieved successfully" })
  async getStagingAnalysis(
    @CurrentTenant() tenantId: string,
    @Query("period") period?: string
  ) {
    try {
      const analysis = await this.portfolioAccountService.getStagingAnalysis(tenantId, period);
      
      return {
        success: true,
        data: analysis,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to get staging analysis: ${error.message}`);
      throw error;
    }
  }

  @Post("accounts")
  @ApiOperation({ summary: "Create new portfolio account" })
  @ApiResponse({ status: 201, description: "Account created successfully" })
  @ApiResponse({ status: 400, description: "Invalid input data" })
  async createAccount(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() accountData: Partial<PortfolioAccount>
  ) {
    try {
      const account = await this.portfolioAccountService.createAccount(tenantId, accountData, user.id);
      
      return {
        success: true,
        data: account,
        message: "Portfolio account created successfully",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to create account: ${error.message}`);
      throw error;
    }
  }

  @Put("accounts/:accountId")
  @ApiOperation({ summary: "Update portfolio account" })
  @ApiResponse({ status: 200, description: "Account updated successfully" })
  @ApiResponse({ status: 404, description: "Account not found" })
  async updateAccount(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param("accountId") accountId: string,
    @Body() updateData: Partial<PortfolioAccount>
  ) {
    try {
      const account = await this.portfolioAccountService.updateAccount(tenantId, accountId, updateData, user.id);
      
      return {
        success: true,
        data: account,
        message: "Portfolio account updated successfully",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to update account: ${error.message}`);
      throw error;
    }
  }

  @Delete("accounts/:accountId")
  @ApiOperation({ summary: "Delete portfolio account" })
  @ApiResponse({ status: 200, description: "Account deleted successfully" })
  @ApiResponse({ status: 404, description: "Account not found" })
  async deleteAccount(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Param("accountId") accountId: string
  ) {
    try {
      await this.portfolioAccountService.deleteAccount(tenantId, accountId, user.id);
      
      return {
        success: true,
        message: "Portfolio account deleted successfully",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to delete account: ${error.message}`);
      throw error;
    }
  }

  @Post("upload")
  @ApiOperation({ summary: "Upload portfolio data from Excel/CSV" })
  @ApiResponse({ status: 201, description: "Data uploaded successfully" })
  @ApiResponse({ status: 400, description: "Invalid file format" })
  async uploadPortfolioData(
    @CurrentTenant() tenantId: string,
    @CurrentUser() user: any,
    @Body() uploadData: {
      fileContent: string;
      fileType: "excel" | "csv";
      mappingConfiguration: any;
    }
  ) {
    try {
      const result = await this.portfolioAccountService.uploadPortfolioData(
        tenantId, 
        uploadData,
        user.id
      );
      
      return {
        success: true,
        data: result,
        message: "Portfolio data uploaded successfully",
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      this.logger.error(`Failed to upload portfolio data: ${error.message}`);
      throw error;
    }
  }
}'

    generate_code_file \
        "packages/backend/src/modules/ifrs9/controllers/portfolio.controller.ts" \
        "TypeScript Controller" \
        "Portfolio management REST API controller with CRUD operations" \
        "$template_content"
}

# Generate IFRS 9 Routes Module
generate_ifrs9_routes() {
    local template_content='import { Router } from "express";
import { eclCalculationRoutes } from "./ecl-calculation.routes";
import { portfolioRoutes } from "./portfolio.routes";
import { stagingRoutes } from "./staging.routes";
import { authenticate } from "../../../middleware/auth.middleware";
import { validateTenant } from "../../../middleware/tenant.middleware";
import { auditLog } from "../../../middleware/audit.middleware";

const router = Router();

// Apply common middleware to all IFRS 9 routes
router.use(authenticate);
router.use(validateTenant);
router.use(auditLog);

// Route modules
router.use("/ecl", eclCalculationRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/staging", stagingRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "IFRS 9 Module",
    version: "1.0.0",
    features: {
      eclCalculation: true,
      portfolioManagement: true,
      stagingAnalysis: true,
      dualBanking: true,
      rAnalytics: true
    },
    timestamp: new Date().toISOString()
  });
});

// API documentation endpoint
router.get("/info", (req, res) => {
  res.json({
    success: true,
    module: "IFRS 9 Multi-Tenant Platform",
    description: "Comprehensive IFRS 9 implementation with dual banking support",
    endpoints: {
      ecl: {
        calculate: "POST /ecl/calculate",
        jobStatus: "GET /ecl/jobs/:jobId",
        summary: "GET /ecl/jobs/:jobId/summary",
        results: "GET /ecl/jobs/:jobId/results",
        portfolioSummary: "GET /ecl/portfolio/summary",
        modelParameters: "GET /ecl/models/parameters"
      },
      portfolio: {
        accounts: "GET /portfolio/accounts",
        accountDetails: "GET /portfolio/accounts/:accountId",
        summary: "GET /portfolio/summary",
        stagingAnalysis: "GET /portfolio/staging/analysis",
        createAccount: "POST /portfolio/accounts",
        updateAccount: "PUT /portfolio/accounts/:accountId",
        deleteAccount: "DELETE /portfolio/accounts/:accountId",
        upload: "POST /portfolio/upload"
      },
      staging: {
        analysis: "GET /staging/analysis",
        transitions: "GET /staging/transitions",
        criteria: "GET /staging/criteria",
        updateCriteria: "PUT /staging/criteria"
      }
    },
    bankingTypes: ["conventional", "syariah"],
    modelTypes: {
      pd: ["historical", "through_the_cycle", "point_in_time"],
      lgd: ["historical", "downturn", "best_estimate"],
      ead: ["current", "credit_conversion_factor", "behavioral"]
    },
    timestamp: new Date().toISOString()
  });
});

export { router as ifrs9Routes };'

    generate_code_file \
        "packages/backend/src/modules/ifrs9/routes/index.ts" \
        "TypeScript Routes" \
        "Main IFRS 9 routes module with comprehensive API endpoints" \
        "$template_content"
}

# Generate Portfolio Account Service
generate_portfolio_service() {
    local template_content='import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { PortfolioAccount, PortfolioAccountDto, PortfolioSummaryDto } from "../models/portfolio-account.model";

@Injectable()
export class PortfolioAccountService {
  private readonly logger = new Logger(PortfolioAccountService.name);

  constructor(
    @InjectRepository(PortfolioAccount)
    private portfolioAccountRepository: Repository<PortfolioAccount>
  ) {}

  /**
   * Get portfolio accounts with filtering and pagination
   */
  async getAccounts(tenantId: string, filters: any) {
    const queryBuilder = this.createBaseQuery(tenantId);
    
    // Apply filters
    this.applyFilters(queryBuilder, filters);
    
    // Apply pagination
    const { page, limit } = filters;
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    
    // Apply sorting
    const { sortBy, sortOrder } = filters;
    queryBuilder.orderBy(`account.${sortBy}`, sortOrder);
    
    // Execute query
    const [accounts, total] = await queryBuilder.getManyAndCount();
    
    return {
      accounts: accounts.map(account => this.mapToDto(account)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get account by ID
   */
  async getAccountById(tenantId: string, accountId: string): Promise<PortfolioAccount> {
    const account = await this.portfolioAccountRepository.findOne({
      where: { tenantId, id: accountId, isActive: true }
    });
    
    if (!account) {
      throw new NotFoundException(`Portfolio account not found: ${accountId}`);
    }
    
    return account;
  }

  /**
   * Get portfolio summary
   */
  async getPortfolioSummary(tenantId: string, asOfDate?: string, groupBy?: string): Promise<PortfolioSummaryDto> {
    const queryBuilder = this.createBaseQuery(tenantId);
    
    if (asOfDate) {
      queryBuilder.andWhere("account.reportingDate <= :asOfDate", { asOfDate });
    }
    
    const accounts = await queryBuilder.getMany();
    
    const summary: PortfolioSummaryDto = {
      totalAccounts: accounts.length,
      totalOutstanding: accounts.reduce((sum, acc) => sum + acc.outstandingAmount, 0),
      stage1Count: accounts.filter(acc => acc.currentStage === 1).length,
      stage2Count: accounts.filter(acc => acc.currentStage === 2).length,
      stage3Count: accounts.filter(acc => acc.currentStage === 3).length,
      stage1Outstanding: accounts.filter(acc => acc.currentStage === 1)
        .reduce((sum, acc) => sum + acc.outstandingAmount, 0),
      stage2Outstanding: accounts.filter(acc => acc.currentStage === 2)
        .reduce((sum, acc) => sum + acc.outstandingAmount, 0),
      stage3Outstanding: accounts.filter(acc => acc.currentStage === 3)
        .reduce((sum, acc) => sum + acc.outstandingAmount, 0),
      totalEcl: accounts.reduce((sum, acc) => sum + acc.ecl12m + acc.eclLifetime, 0),
      coverageRatio: 0, // Calculate later
      syariahOutstanding: accounts.filter(acc => acc.isSyariahCompliant)
        .reduce((sum, acc) => sum + acc.outstandingAmount, 0),
      conventionalOutstanding: accounts.filter(acc => !acc.isSyariahCompliant)
        .reduce((sum, acc) => sum + acc.outstandingAmount, 0)
    };
    
    // Calculate coverage ratio
    if (summary.totalOutstanding > 0) {
      summary.coverageRatio = (summary.totalEcl / summary.totalOutstanding) * 100;
    }
    
    return summary;
  }

  /**
   * Get staging analysis
   */
  async getStagingAnalysis(tenantId: string, period?: string) {
    const queryBuilder = this.createBaseQuery(tenantId);
    
    if (period) {
      // Add period filter based on reporting date
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case "month":
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case "quarter":
          startDate.setMonth(endDate.getMonth() - 3);
          break;
        case "year":
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }
      
      queryBuilder.andWhere("account.reportingDate BETWEEN :startDate AND :endDate", {
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0]
      });
    }
    
    const accounts = await queryBuilder.getMany();
    
    // Analyze staging distribution
    const stagingAnalysis = {
      totalAccounts: accounts.length,
      stageDistribution: {
        stage1: {
          count: accounts.filter(acc => acc.currentStage === 1).length,
          percentage: 0,
          outstanding: accounts.filter(acc => acc.currentStage === 1)
            .reduce((sum, acc) => sum + acc.outstandingAmount, 0)
        },
        stage2: {
          count: accounts.filter(acc => acc.currentStage === 2).length,
          percentage: 0,
          outstanding: accounts.filter(acc => acc.currentStage === 2)
            .reduce((sum, acc) => sum + acc.outstandingAmount, 0)
        },
        stage3: {
          count: accounts.filter(acc => acc.currentStage === 3).length,
          percentage: 0,
          outstanding: accounts.filter(acc => acc.currentStage === 3)
            .reduce((sum, acc) => sum + acc.outstandingAmount, 0)
        }
      },
      stageTransitions: this.analyzeStageTransitions(accounts),
      riskMetrics: this.calculateRiskMetrics(accounts)
    };
    
    // Calculate percentages
    if (stagingAnalysis.totalAccounts > 0) {
      stagingAnalysis.stageDistribution.stage1.percentage = 
        (stagingAnalysis.stageDistribution.stage1.count / stagingAnalysis.totalAccounts) * 100;
      stagingAnalysis.stageDistribution.stage2.percentage = 
        (stagingAnalysis.stageDistribution.stage2.count / stagingAnalysis.totalAccounts) * 100;
      stagingAnalysis.stageDistribution.stage3.percentage = 
        (stagingAnalysis.stageDistribution.stage3.count / stagingAnalysis.totalAccounts) * 100;
    }
    
    return stagingAnalysis;
  }

  /**
   * Create account
   */
  async createAccount(tenantId: string, accountData: Partial<PortfolioAccount>, userId: string): Promise<PortfolioAccount> {
    const account = this.portfolioAccountRepository.create({
      ...accountData,
      tenantId,
      createdBy: userId,
      reportingDate: new Date()
    });
    
    return await this.portfolioAccountRepository.save(account);
  }

  /**
   * Update account
   */
  async updateAccount(tenantId: string, accountId: string, updateData: Partial<PortfolioAccount>, userId: string): Promise<PortfolioAccount> {
    const account = await this.getAccountById(tenantId, accountId);
    
    Object.assign(account, updateData);
    account.updatedBy = userId;
    
    return await this.portfolioAccountRepository.save(account);
  }

  /**
   * Delete account (soft delete)
   */
  async deleteAccount(tenantId: string, accountId: string, userId: string): Promise<void> {
    const account = await this.getAccountById(tenantId, accountId);
    
    account.isActive = false;
    account.updatedBy = userId;
    
    await this.portfolioAccountRepository.save(account);
  }

  /**
   * Upload portfolio data from Excel/CSV
   */
  async uploadPortfolioData(tenantId: string, uploadData: any, userId: string) {
    // This would integrate with file processing service
    // For now, return a placeholder response
    this.logger.log(`Processing portfolio data upload for tenant: ${tenantId}`);
    
    return {
      uploadId: "upload_" + Date.now(),
      status: "processing",
      totalRecords: 0,
      processedRecords: 0,
      errors: [],
      message: "Upload processing started"
    };
  }

  // Private helper methods
  private createBaseQuery(tenantId: string): SelectQueryBuilder<PortfolioAccount> {
    return this.portfolioAccountRepository
      .createQueryBuilder("account")
      .where("account.tenantId = :tenantId", { tenantId })
      .andWhere("account.isActive = true");
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<PortfolioAccount>, filters: any): void {
    if (filters.productType) {
      queryBuilder.andWhere("account.productType = :productType", { productType: filters.productType });
    }
    
    if (filters.stage) {
      queryBuilder.andWhere("account.currentStage = :stage", { stage: filters.stage });
    }
    
    if (filters.customerType) {
      queryBuilder.andWhere("account.customerType = :customerType", { customerType: filters.customerType });
    }
    
    if (filters.syariahCompliant !== undefined) {
      queryBuilder.andWhere("account.isSyariahCompliant = :syariahCompliant", { 
        syariahCompliant: filters.syariahCompliant 
      });
    }
    
    if (filters.search) {
      queryBuilder.andWhere(
        "(account.accountId ILIKE :search OR account.customerName ILIKE :search)",
        { search: `%${filters.search}%` }
      );
    }
  }

  private mapToDto(account: PortfolioAccount): PortfolioAccountDto {
    return {
      id: account.id,
      accountId: account.accountId,
      customerId: account.customerId,
      productType: account.productType,
      outstandingAmount: account.outstandingAmount,
      currentStage: account.currentStage,
      daysPastDue: account.daysPastDue,
      customerName: account.customerName,
      isSyariahCompliant: account.isSyariahCompliant,
      pd12m: account.pd12m,
      lgd: account.lgd,
      ecl12m: account.ecl12m,
      eclLifetime: account.eclLifetime
    };
  }

  private analyzeStageTransitions(accounts: PortfolioAccount[]) {
    // Analyze accounts that have changed stages
    const transitions = accounts.filter(acc => acc.previousStage && acc.previousStage !== acc.currentStage);
    
    return {
      totalTransitions: transitions.length,
      upgrades: transitions.filter(acc => acc.currentStage < acc.previousStage).length,
      downgrades: transitions.filter(acc => acc.currentStage > acc.previousStage).length,
      transitionMatrix: {
        "1_to_2": transitions.filter(acc => acc.previousStage === 1 && acc.currentStage === 2).length,
        "1_to_3": transitions.filter(acc => acc.previousStage === 1 && acc.currentStage === 3).length,
        "2_to_1": transitions.filter(acc => acc.previousStage === 2 && acc.currentStage === 1).length,
        "2_to_3": transitions.filter(acc => acc.previousStage === 2 && acc.currentStage === 3).length,
        "3_to_1": transitions.filter(acc => acc.previousStage === 3 && acc.currentStage === 1).length,
        "3_to_2": transitions.filter(acc => acc.previousStage === 3 && acc.currentStage === 2).length
      }
    };
  }

  private calculateRiskMetrics(accounts: PortfolioAccount[]) {
    const totalOutstanding = accounts.reduce((sum, acc) => sum + acc.outstandingAmount, 0);
    const totalEcl = accounts.reduce((sum, acc) => sum + acc.ecl12m + acc.eclLifetime, 0);
    
    return {
      averagePd12m: accounts.filter(acc => acc.pd12m).length > 0 ? 
        accounts.reduce((sum, acc) => sum + (acc.pd12m || 0), 0) / accounts.filter(acc => acc.pd12m).length : 0,
      averageLgd: accounts.filter(acc => acc.lgd).length > 0 ? 
        accounts.reduce((sum, acc) => sum + (acc.lgd || 0), 0) / accounts.filter(acc => acc.lgd).length : 0,
      coverageRatio: totalOutstanding > 0 ? (totalEcl / totalOutstanding) * 100 : 0,
      defaultRate: accounts.length > 0 ? 
        (accounts.filter(acc => acc.currentStage === 3).length / accounts.length) * 100 : 0
    };
  }
}'

    generate_code_file \
        "packages/backend/src/modules/ifrs9/services/portfolio-account.service.ts" \
        "TypeScript Service" \
        "Portfolio account management service with comprehensive operations" \
        "$template_content"
}

# Main execution function
main() {
    log_info "Starting IFRS 9 Backend Code Generation (Part 2)..."
    
    # Generate controllers
    generate_ecl_controller
    generate_portfolio_controller
    
    # Generate routes
    generate_ifrs9_routes
    
    # Generate additional services
    generate_portfolio_service
    
    log_success "Backend code generation (Part 2) completed successfully"
    log_info "Generated files logged in: ${LOG_FILE}"
    
    log_info "Next: R Analytics scripts generation..."
}

# Execute main function
main "$@"