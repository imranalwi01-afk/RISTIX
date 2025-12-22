// packages/backend/src/core/services/ifrs9/r-analytics-integration.service.ts
// ============================================================================
// R Analytics Integration Service for IFRS9 Calculations
// ============================================================================
// Generated: 2025-01-12
// Purpose: Bridge between Node.js backend and R Analytics statistical functions
// Methodology: Core Platform MVP - IFRS9 Engine Completion
// Dependencies: R Analytics enhanced global.R functions
// ============================================================================

import { Injectable } from '@nestjs/common';
import { Logger } from 'winston';
import axios, { AxiosInstance } from 'axios';
import { ConfigurationService } from '../configuration/configuration.service';
import { backendEnvironmentLoader } from '../../../config/environment-loader-backend';

export interface RAnalyticsConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}

export interface StatisticalModelRequest {
  tenantId: string;
  modelType: 'pd_calculation' | 'lgd_calculation' | 'ead_computation' | 'staging_analysis' | 'ecl_calculation';
  data: any[];
  parameters: any;
  bankingMode: 'conventional' | 'syariah';
}

export interface StatisticalModelResponse {
  success: boolean;
  modelType: string;
  tenantId: string;
  results: any;
  executionTime: number;
  metadata: {
    dataPoints: number;
    modelParameters: any;
    rVersion: string;
    calculationDate: string;
  };
  errors?: string[];
  warnings?: string[];
}

export interface PdModelCalculationRequest {
  accounts: Array<{
    accountId: string;
    outstandingAmount: number;
    daysPastDue: number;
    customerType: string;
    industryCode: string;
    collateralValue?: number;
    creditRating?: string;
    historicalDefaults?: any[];
  }>;
  modelParameters: {
    baseRate: number;
    industryAdjustments: Record<string, number>;
    stageMultipliers: Record<number, number>;
    timeHorizon: number;
  };
}

export interface LgdModelCalculationRequest {
  accounts: Array<{
    accountId: string;
    exposureAmount: number;
    collateralType: string;
    collateralValue: number;
    recoveryHistory?: any[];
    productType: string;
  }>;
  modelParameters: {
    baseRecoveryRate: number;
    collateralHaircuts: Record<string, number>;
    recoveryTimeFactors: Record<string, number>;
  };
}

export interface StagingAnalysisRequest {
  accounts: Array<{
    accountId: string;
    currentPd: number;
    originationPd: number;
    daysPastDue: number;
    currentStage: number;
    paymentHistory: any[];
  }>;
  stagingCriteria: {
    stage2DpdThreshold: number;
    stage3DpdThreshold: number;
    sicrPdMultiple: number;
    backstopCriteria: any;
  };
}

@Injectable()
export class RAnalyticsIntegrationService {
  private readonly logger: Logger;
  private readonly httpClient: AxiosInstance;
  private readonly config: RAnalyticsConfig;

  constructor(
    private readonly configService: ConfigurationService,
    logger: Logger
  ) {
    this.logger = logger.child({ service: 'RAnalyticsIntegrationService' });

    // Initialize configuration using centralized environment loader
    try {
      const envConfig = backendEnvironmentLoader.getConfiguration();
      this.config = {
        baseUrl: envConfig.rAnalytics.url,
        timeout: parseInt(process.env.R_ANALYTICS_TIMEOUT || '30000'),
        maxRetries: parseInt(process.env.R_ANALYTICS_MAX_RETRIES || '3'),
        retryDelay: parseInt(process.env.R_ANALYTICS_RETRY_DELAY || '5000')
      };
      console.log(`✅ R Analytics service configured with URL: ${this.config.baseUrl}`);
    } catch (error) {
      console.warn('⚠️ Failed to load centralized R Analytics config, falling back to environment variables:', error);

      // Fallback to environment variables
      this.config = {
        baseUrl: process.env.R_ANALYTICS_URL || 'http://localhost:4236',
        timeout: parseInt(process.env.R_ANALYTICS_TIMEOUT || '30000'),
        maxRetries: parseInt(process.env.R_ANALYTICS_MAX_RETRIES || '3'),
        retryDelay: parseInt(process.env.R_ANALYTICS_RETRY_DELAY || '5000')
      };
    }

    // Initialize HTTP client
    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'IFRS9-Platform/1.0'
      }
    });

    // Add request interceptor for logging
    this.httpClient.interceptors.request.use(
      (config) => {
        this.logger.debug('R Analytics request', {
          method: config.method,
          url: config.url,
          dataSize: JSON.stringify(config.data || {}).length
        });
        return config;
      },
      (error) => {
        this.logger.error('R Analytics request error', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.httpClient.interceptors.response.use(
      (response) => {
        this.logger.debug('R Analytics response', {
          status: response.status,
          executionTime: response.headers['x-execution-time'],
          dataSize: JSON.stringify(response.data).length
        });
        return response;
      },
      (error) => {
        this.logger.error('R Analytics response error', {
          status: error.response?.status,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Test R Analytics service connectivity
   */
  async healthCheck(): Promise<{ status: string; version?: string; uptime?: number }> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data;
    } catch (error) {
      this.logger.error('R Analytics health check failed', error);
      throw new Error(`R Analytics service unavailable: ${error.message}`);
    }
  }

  /**
   * Initialize tenant connections in R Analytics service
   */
  async initializeTenantConnections(tenantSlug: string, userContext?: any): Promise<any> {
    try {
      this.logger.info('Initializing R Analytics tenant connections', { tenantSlug });

      const response = await this.httpClient.post('/initialize', {
        tenant_slug: tenantSlug,
        user_context: userContext,
        banking_mode: tenantSlug.includes('syariah') ? 'syariah' : 'conventional'
      });

      this.logger.info('R Analytics tenant connections initialized', {
        tenantSlug,
        connections: response.data.connections
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to initialize R Analytics tenant connections', {
        tenantSlug,
        error: error.message
      });
      throw new Error(`R Analytics initialization failed: ${error.message}`);
    }
  }

  /**
   * Execute PD model calculation using R statistical functions
   */
  async calculateProbabilityOfDefault(
    tenantId: string,
    request: PdModelCalculationRequest
  ): Promise<StatisticalModelResponse> {
    try {
      this.logger.info('Executing PD calculation in R Analytics', {
        tenantId,
        accountCount: request.accounts.length
      });

      const rRequest = {
        tenant_id: tenantId,
        model_type: 'pd_calculation',
        data: request.accounts,
        parameters: request.modelParameters,
        banking_mode: tenantId.includes('syariah') ? 'syariah' : 'conventional'
      };

      const response = await this.executeWithRetry('/api/models/pd/calculate', rRequest);

      this.logger.info('PD calculation completed', {
        tenantId,
        executionTime: response.data.execution_time,
        accountsProcessed: response.data.metadata.data_points
      });

      return this.transformRResponse(response.data);
    } catch (error) {
      this.logger.error('PD calculation failed', {
        tenantId,
        error: error.message
      });
      throw new Error(`PD calculation failed: ${error.message}`);
    }
  }

  /**
   * Execute LGD model calculation using R statistical functions
   */
  async calculateLossGivenDefault(
    tenantId: string,
    request: LgdModelCalculationRequest
  ): Promise<StatisticalModelResponse> {
    try {
      this.logger.info('Executing LGD calculation in R Analytics', {
        tenantId,
        accountCount: request.accounts.length
      });

      const rRequest = {
        tenant_id: tenantId,
        model_type: 'lgd_calculation',
        data: request.accounts,
        parameters: request.modelParameters,
        banking_mode: tenantId.includes('syariah') ? 'syariah' : 'conventional'
      };

      const response = await this.executeWithRetry('/api/models/lgd/calculate', rRequest);

      this.logger.info('LGD calculation completed', {
        tenantId,
        executionTime: response.data.execution_time,
        accountsProcessed: response.data.metadata.data_points
      });

      return this.transformRResponse(response.data);
    } catch (error) {
      this.logger.error('LGD calculation failed', {
        tenantId,
        error: error.message
      });
      throw new Error(`LGD calculation failed: ${error.message}`);
    }
  }

  /**
   * Execute staging analysis using R statistical functions
   */
  async performStagingAnalysis(
    tenantId: string,
    request: StagingAnalysisRequest
  ): Promise<StatisticalModelResponse> {
    try {
      this.logger.info('Executing staging analysis in R Analytics', {
        tenantId,
        accountCount: request.accounts.length
      });

      const rRequest = {
        tenant_id: tenantId,
        model_type: 'staging_analysis',
        data: request.accounts,
        parameters: request.stagingCriteria,
        banking_mode: tenantId.includes('syariah') ? 'syariah' : 'conventional'
      };

      const response = await this.executeWithRetry('/api/models/staging/analyze', rRequest);

      this.logger.info('Staging analysis completed', {
        tenantId,
        executionTime: response.data.execution_time,
        accountsProcessed: response.data.metadata.data_points
      });

      return this.transformRResponse(response.data);
    } catch (error) {
      this.logger.error('Staging analysis failed', {
        tenantId,
        error: error.message
      });
      throw new Error(`Staging analysis failed: ${error.message}`);
    }
  }

  /**
   * Execute comprehensive ECL calculation using multiple R models
   */
  async calculateExpectedCreditLoss(
    tenantId: string,
    portfolioData: any[],
    calculationParameters: any
  ): Promise<StatisticalModelResponse> {
    try {
      this.logger.info('Executing comprehensive ECL calculation', {
        tenantId,
        portfolioSize: portfolioData.length
      });

      const rRequest = {
        tenant_id: tenantId,
        model_type: 'ecl_calculation',
        data: portfolioData,
        parameters: calculationParameters,
        banking_mode: tenantId.includes('syariah') ? 'syariah' : 'conventional'
      };

      const response = await this.executeWithRetry('/api/models/ecl/calculate', rRequest);

      this.logger.info('ECL calculation completed', {
        tenantId,
        executionTime: response.data.execution_time,
        portfolioSize: response.data.metadata.data_points,
        totalEcl: response.data.results.summary?.total_ecl
      });

      return this.transformRResponse(response.data);
    } catch (error) {
      this.logger.error('ECL calculation failed', {
        tenantId,
        error: error.message
      });
      throw new Error(`ECL calculation failed: ${error.message}`);
    }
  }

  /**
   * Execute custom R script for advanced analytics
   */
  async executeCustomScript(
    tenantId: string,
    scriptName: string,
    data: any,
    parameters: any
  ): Promise<StatisticalModelResponse> {
    try {
      this.logger.info('Executing custom R script', {
        tenantId,
        scriptName
      });

      const rRequest = {
        tenant_id: tenantId,
        script_name: scriptName,
        data,
        parameters,
        banking_mode: tenantId.includes('syariah') ? 'syariah' : 'conventional'
      };

      const response = await this.executeWithRetry('/api/custom/execute', rRequest);

      this.logger.info('Custom script execution completed', {
        tenantId,
        scriptName,
        executionTime: response.data.execution_time
      });

      return this.transformRResponse(response.data);
    } catch (error) {
      this.logger.error('Custom script execution failed', {
        tenantId,
        scriptName,
        error: error.message
      });
      throw new Error(`Custom script execution failed: ${error.message}`);
    }
  }

  /**
   * Execute request with retry mechanism
   */
  private async executeWithRetry(endpoint: string, data: any): Promise<any> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await this.httpClient.post(endpoint, data);
      } catch (error) {
        lastError = error;
        this.logger.warn(`R Analytics request failed, attempt ${attempt}/${this.config.maxRetries}`, {
          endpoint,
          error: error.message
        });

        if (attempt < this.config.maxRetries) {
          await this.delay(this.config.retryDelay);
        }
      }
    }

    throw lastError!;
  }

  /**
   * Transform R response to standardized format
   */
  private transformRResponse(rResponse: any): StatisticalModelResponse {
    return {
      success: rResponse.success || false,
      modelType: rResponse.model_type || 'unknown',
      tenantId: rResponse.tenant_id || '',
      results: rResponse.results || {},
      executionTime: rResponse.execution_time || 0,
      metadata: {
        dataPoints: rResponse.metadata?.data_points || 0,
        modelParameters: rResponse.metadata?.model_parameters || {},
        rVersion: rResponse.metadata?.r_version || 'unknown',
        calculationDate: rResponse.metadata?.calculation_date || new Date().toISOString()
      },
      errors: rResponse.errors || [],
      warnings: rResponse.warnings || []
    };
  }

  /**
   * Utility delay function
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get Islamic banking specific data for Syariah compliance
   */
  async getIslamicBankingData(tenantId: string): Promise<any> {
    if (!tenantId.includes('syariah')) {
      return null;
    }

    try {
      const response = await this.httpClient.get('/api/islamic/data', {
        params: { tenant_id: tenantId }
      });

      return response.data;
    } catch (error) {
      this.logger.warn('Failed to fetch Islamic banking data', {
        tenantId,
        error: error.message
      });
      return null;
    }
  }

  /**
   * Send message to parent frame (for iframe integration)
   */
  async notifyParentFrame(
    tenantId: string,
    messageType: string,
    data: any
  ): Promise<void> {
    try {
      await this.httpClient.post('/api/notify', {
        tenant_id: tenantId,
        message_type: messageType,
        data
      });
    } catch (error) {
      this.logger.debug('Parent frame notification failed (expected in non-iframe context)', {
        tenantId,
        messageType,
        error: error.message
      });
    }
  }
}