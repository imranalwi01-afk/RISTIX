// packages/backend/src/core/services/r-analytics/r-analytics.service.ts
// ============================================================================
// 🩹 SURGICAL FIX: PROPER DEPENDENCY INJECTION & SERVICE FACTORY
// ============================================================================
// ✅ FIXED: Lazy initialization to prevent circular dependencies
// ✅ FIXED: Proper AuditService instantiation with required parameters
// ✅ PRESERVED: All existing functionality and interfaces
// ============================================================================

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { configService } from '../configuration/configuration.service';

// ============================================================================
// 🩹 SURGICAL FIX: LAZY SERVICE LOADING to prevent circular dependencies
// ============================================================================

let AuditService: any;
let DatabaseService: any;

// Lazy load services to prevent circular dependency issues
function getAuditService() {
  if (!AuditService) {
    try {
      AuditService = require('../audit/audit.service').AuditService;
    } catch (error) {
      console.warn('⚠️ AuditService not available:', error);
      AuditService = null;
    }
  }
  return AuditService;
}

function getDatabaseService() {
  if (!DatabaseService) {
    try {
      DatabaseService = require('../database/database.service').DatabaseService;
    } catch (error) {
      console.warn('⚠️ DatabaseService not available:', error);
      DatabaseService = null;
    }
  }
  return DatabaseService;
}

export interface RAnalyticsConfig {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
  apiKey?: string;
  healthCheckInterval: number;
}

export interface CalculationRequest {
  modelName: string;
  data: any[];
  parameters: Record<string, any>;
  calculationType: 'ECL' | 'PD' | 'LGD' | 'EAD' | 'STAGING';
  bankingType: 'CONVENTIONAL' | 'SYARIAH';
  tenantId: string;
  userId: string;
  requestId: string;
}

export interface CalculationResponse {
  success: boolean;
  results: any;
  metadata: {
    executionTime: number;
    recordsProcessed: number;
    modelVersion: string;
    rVersion: string;
    warnings?: string[];
    errors?: string[];
  };
  requestId: string;
  timestamp: Date;
}

export interface ModelInfo {
  name: string;
  version: string;
  description: string;
  parameters: Record<string, any>;
  bankingTypeSupported: string[];
  lastUpdated: Date;
  isActive: boolean;
}

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  rVersion: string;
  availableModels: string[];
  memory: {
    used: number;
    available: number;
    percentage: number;
  };
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  errors: string[];
}

export class RAnalyticsService {
  private client: AxiosInstance;
  private config: RAnalyticsConfig;
  private isInitialized: boolean = false;
  private healthStatus: HealthCheckResult | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  
  // ============================================================================
  // 🩹 SURGICAL FIX: LAZY AUDIT SERVICE INSTANCE
  // ============================================================================
  private _auditService: any = null;

  // ✅ NEW: No constructor parameters - all dependencies are lazy loaded
  constructor() {
    this.loadConfiguration();
    this.initializeClient();
  }

  // ✅ NEW: Lazy audit service getter with proper initialization
  private getAuditServiceInstance() {
    if (!this._auditService) {
      const AuditServiceClass = getAuditService();
      const DatabaseServiceClass = getDatabaseService();
      
      if (AuditServiceClass) {
        try {
          // 🩹 CRITICAL FIX: Properly instantiate AuditService with required dependencies
          const databaseService = DatabaseServiceClass ? new DatabaseServiceClass() : null;
          this._auditService = new AuditServiceClass(databaseService, configService);
          console.log('✅ AuditService instance created for R Analytics');
        } catch (error) {
          console.warn('⚠️ Failed to create AuditService instance:', error);
          // Create mock audit service to prevent crashes
          this._auditService = {
            log: async (input: any) => {
              console.log('📋 Mock Audit Log:', input);
            }
          };
        }
      } else {
        // Create mock audit service
        this._auditService = {
          log: async (input: any) => {
            console.log('📋 Mock Audit Log (AuditService not available):', input);
          }
        };
      }
    }
    return this._auditService;
  }

  // ============================================================================
  // 🔧 INITIALIZATION AND CONFIGURATION
  // ============================================================================

  private loadConfiguration(): void {
    // 🔧 CRITICAL FIX: Read from process.env directly for R Analytics URL
    const rAnalyticsUrl = process.env.R_ANALYTICS_URL || configService.get('R_ANALYTICS_URL', 'http://10.18.11.35:4241');
    
    this.config = {
      baseUrl: rAnalyticsUrl,
      timeout: configService.getNumber('R_ANALYTICS_TIMEOUT', 30000), // 30 seconds
      maxRetries: configService.getNumber('R_ANALYTICS_MAX_RETRIES', 3),
      retryDelay: configService.getNumber('R_ANALYTICS_RETRY_DELAY', 1000),
      apiKey: configService.get('R_ANALYTICS_API_KEY'),
      healthCheckInterval: configService.getNumber('R_ANALYTICS_HEALTH_CHECK_INTERVAL', 60000) // 1 minute
    };
    
    console.log(`🔧 R Analytics configured with URL: ${this.config.baseUrl}`);
  }

  // ✅ NEW: Get tenant-specific R Analytics URL
  private getTenantRAnalyticsUrl(tenantId: string, bankingType?: string): string {
    // Determine tenant type for URL routing
    const tenantLower = tenantId.toLowerCase();
    
    // Check for tenant-specific configurations
    if (tenantLower === 'dana') {
      const domain = configService.get('R_ANALYTICS_DANA_DOMAIN');
      return domain || `https://i9model-dana.ifrspro.id`;
    }
    
    if (tenantLower === 'iaf') {
      const domain = configService.get('R_ANALYTICS_IAF_DOMAIN');
      return domain || `https://i9model-iaf.ifrspro.id`;
    }
    
    // Check banking type for demo tenants
    if (bankingType === 'SYARIAH' || tenantLower.includes('syariah')) {
      const domain = configService.get('R_ANALYTICS_SYARIAH_DOMAIN');
      return domain || `https://i9model-syariah.ifrspro.id`;
    }
    
    // Default to conventional for other tenants
    if (bankingType === 'CONVENTIONAL' || tenantLower.includes('conv') || tenantLower.includes('metro')) {
      const domain = configService.get('R_ANALYTICS_CONVENTIONAL_DOMAIN');
      return domain || `https://i9model-conventional.ifrspro.id`;
    }
    
    // Fallback to main R Analytics service
    return this.config.baseUrl;
  }

  // ✅ NEW: Create tenant-specific Axios client
  private createTenantClient(tenantId: string, bankingType?: string): AxiosInstance {
    const tenantUrl = this.getTenantRAnalyticsUrl(tenantId, bankingType);
    
    const clientConfig: AxiosRequestConfig = {
      baseURL: tenantUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'IFRS9-Backend/1.0.0',
        'X-Tenant-ID': tenantId,
        ...(bankingType && { 'X-Banking-Type': bankingType }),
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
      }
    };

    const client = axios.create(clientConfig);
    
    // Add interceptors
    client.interceptors.request.use(
      (config) => {
        console.log(`🔬 R Analytics [${tenantId}] Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      }
    );

    client.interceptors.response.use(
      (response) => {
        console.log(`🔬 R Analytics [${tenantId}] Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`🔬 R Analytics [${tenantId}] Response Error:`, error.response?.status, error.message);
        return Promise.reject(this.transformError(error));
      }
    );

    return client;
  }

  private initializeClient(): void {
    try {
      const clientConfig: AxiosRequestConfig = {
        baseURL: this.config.baseUrl,
        timeout: this.config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'IFRS9-Backend/1.0.0',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        }
      };

      this.client = axios.create(clientConfig);

      // Add request interceptor
      this.client.interceptors.request.use(
        (config) => {
          console.log(`🔬 R Analytics Request: ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          console.error('🔬 R Analytics Request Error:', error);
          return Promise.reject(error);
        }
      );

      // Add response interceptor
      this.client.interceptors.response.use(
        (response) => {
          console.log(`🔬 R Analytics Response: ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          console.error('🔬 R Analytics Response Error:', error.response?.status, error.message);
          return Promise.reject(this.transformError(error));
        }
      );

      this.isInitialized = true;
      console.log('✅ R Analytics Service initialized');

      // Start health monitoring
      this.startHealthMonitoring();

    } catch (error) {
      console.error('❌ Failed to initialize R Analytics Service:', error);
      throw error;
    }
  }

  // ============================================================================
  // 🏥 HEALTH MONITORING
  // ============================================================================

  public async checkHealth(tenantId?: string): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Use tenant-specific client if tenantId provided, otherwise use default client
      const client = tenantId ? this.createTenantClient(tenantId) : this.client;
      const response = await client.get('/health', { timeout: 5000 });
      const responseTime = Date.now() - startTime;

      const healthResult = {
        status: 'healthy' as const,
        rVersion: response.data.r_version || 'unknown',
        availableModels: response.data.available_models || [],
        memory: response.data.memory || { used: 0, available: 0, percentage: 0 },
        uptime: response.data.uptime || 0,
        lastCheck: new Date(),
        responseTime,
        errors: [],
        ...(tenantId && { tenantId })
      };

      // Update global health status if this is default health check
      if (!tenantId) {
        this.healthStatus = healthResult;
      }

      console.log(`🏥 R Analytics health check${tenantId ? ` [${tenantId}]` : ''}: ${healthResult.status} (${responseTime}ms)`);
      return healthResult;

    } catch (error) {
      const responseTime = Date.now() - startTime;

      const healthResult = {
        status: 'unhealthy' as const,
        rVersion: 'unknown',
        availableModels: [],
        memory: { used: 0, available: 0, percentage: 0 },
        uptime: 0,
        lastCheck: new Date(),
        responseTime,
        errors: [error.message],
        ...(tenantId && { tenantId })
      };

      // Update global health status if this is default health check
      if (!tenantId) {
        this.healthStatus = healthResult;
      }

      console.error(`🏥 R Analytics health check${tenantId ? ` [${tenantId}]` : ''} failed: ${error.message} (${responseTime}ms)`);
      return healthResult;
    }
  }

  public getHealthStatus(): HealthCheckResult | null {
    return this.healthStatus;
  }

  private startHealthMonitoring(): void {
    // Initial health check
    this.checkHealth();

    // Schedule periodic health checks
    this.healthCheckTimer = setInterval(async () => {
      await this.checkHealth();
    }, this.config.healthCheckInterval);

    console.log(`🏥 Health monitoring started (interval: ${this.config.healthCheckInterval}ms)`);
  }

  public stopHealthMonitoring(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
      console.log('🏥 Health monitoring stopped');
    }
  }

  // ============================================================================
  // 🧮 IFRS 9 CALCULATION METHODS
  // ============================================================================

  /**
   * Calculate Expected Credit Loss (ECL)
   */
  public async calculateECL(request: Omit<CalculationRequest, 'calculationType'>): Promise<CalculationResponse> {
    return this.executeCalculation({
      ...request,
      calculationType: 'ECL'
    });
  }

  /**
   * Calculate Probability of Default (PD)
   */
  public async calculatePD(request: Omit<CalculationRequest, 'calculationType'>): Promise<CalculationResponse> {
    return this.executeCalculation({
      ...request,
      calculationType: 'PD'
    });
  }

  /**
   * Calculate Loss Given Default (LGD)
   */
  public async calculateLGD(request: Omit<CalculationRequest, 'calculationType'>): Promise<CalculationResponse> {
    return this.executeCalculation({
      ...request,
      calculationType: 'LGD'
    });
  }

  /**
   * Calculate Exposure at Default (EAD)
   */
  public async calculateEAD(request: Omit<CalculationRequest, 'calculationType'>): Promise<CalculationResponse> {
    return this.executeCalculation({
      ...request,
      calculationType: 'EAD'
    });
  }

  /**
   * Perform IFRS 9 Staging Classification
   */
  public async performStaging(request: Omit<CalculationRequest, 'calculationType'>): Promise<CalculationResponse> {
    return this.executeCalculation({
      ...request,
      calculationType: 'STAGING'
    });
  }

  // ============================================================================
  // 🔧 CORE CALCULATION ENGINE
  // ============================================================================

  private async executeCalculation(request: CalculationRequest): Promise<CalculationResponse> {
    const startTime = Date.now();

    try {
      console.log(`🧮 Executing ${request.calculationType} calculation for tenant ${request.tenantId}`);

      // Validate request
      this.validateCalculationRequest(request);

      // ✅ TENANT ROUTING: Create tenant-specific client for R Analytics routing
      const tenantClient = this.createTenantClient(request.tenantId, request.bankingType);

      // Prepare R API request
      const rRequest = {
        model: request.modelName,
        calculation_type: request.calculationType.toLowerCase(),
        banking_type: request.bankingType.toLowerCase(),
        data: request.data,
        parameters: request.parameters,
        metadata: {
          tenant_id: request.tenantId,
          user_id: request.userId,
          request_id: request.requestId,
          timestamp: new Date().toISOString()
        }
      };

      // ✅ TENANT ROUTING: Execute calculation with tenant-specific client and retry logic
      const response = await this.executeWithRetry(async () => {
        return await tenantClient.post(`/api/ifrs9/${request.calculationType.toLowerCase()}`, rRequest);
      });

      const executionTime = Date.now() - startTime;

      // Build response
      const calculationResponse: CalculationResponse = {
        success: true,
        results: response.data.results,
        metadata: {
          executionTime,
          recordsProcessed: response.data.records_processed || request.data.length,
          modelVersion: response.data.model_version || 'unknown',
          rVersion: response.data.r_version || 'unknown',
          warnings: response.data.warnings || [],
          errors: response.data.errors || []
        },
        requestId: request.requestId,
        timestamp: new Date()
      };

      // Audit the calculation
      await this.auditCalculation(request, calculationResponse);

      console.log(`✅ ${request.calculationType} calculation completed in ${executionTime}ms`);
      return calculationResponse;

    } catch (error) {
      const executionTime = Date.now() - startTime;

      console.error(`❌ ${request.calculationType} calculation failed:`, error);

      // Audit the failed calculation
      await this.auditCalculationError(request, error, executionTime);

      // Return error response
      return {
        success: false,
        results: null,
        metadata: {
          executionTime,
          recordsProcessed: 0,
          modelVersion: 'unknown',
          rVersion: 'unknown',
          errors: [error.message]
        },
        requestId: request.requestId,
        timestamp: new Date()
      };
    }
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.config.maxRetries) {
          throw error;
        }

        console.warn(`🔄 R Analytics attempt ${attempt} failed, retrying in ${this.config.retryDelay}ms...`);
        await this.delay(this.config.retryDelay);
      }
    }

    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ============================================================================
  // 📊 MODEL MANAGEMENT
  // ============================================================================

  public async getAvailableModels(tenantId?: string): Promise<ModelInfo[]> {
    try {
      // Use tenant-specific client if tenantId provided, otherwise use default client
      const client = tenantId ? this.createTenantClient(tenantId) : this.client;
      const response = await client.get('/api/models');
      return response.data.models.map(this.transformModelInfo);
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  public async getModelInfo(modelName: string, tenantId?: string): Promise<ModelInfo | null> {
    try {
      // Use tenant-specific client if tenantId provided, otherwise use default client
      const client = tenantId ? this.createTenantClient(tenantId) : this.client;
      const response = await client.get(`/api/models/${modelName}`);
      return this.transformModelInfo(response.data);
    } catch (error) {
      console.error(`Failed to get model info for ${modelName}:`, error);
      return null;
    }
  }

  public async validateModel(modelName: string, bankingType: 'CONVENTIONAL' | 'SYARIAH', tenantId?: string): Promise<boolean> {
    try {
      const modelInfo = await this.getModelInfo(modelName, tenantId);
      return modelInfo?.isActive === true && 
             modelInfo.bankingTypeSupported.includes(bankingType);
    } catch (error) {
      console.error(`Model validation failed for ${modelName}:`, error);
      return false;
    }
  }

  private transformModelInfo(rawModel: any): ModelInfo {
    return {
      name: rawModel.name,
      version: rawModel.version || '1.0.0',
      description: rawModel.description || '',
      parameters: rawModel.parameters || {},
      bankingTypeSupported: rawModel.banking_types || ['CONVENTIONAL', 'SYARIAH'],
      lastUpdated: new Date(rawModel.last_updated || Date.now()),
      isActive: rawModel.active !== false
    };
  }

  // ============================================================================
  // 🔍 VALIDATION
  // ============================================================================

  private validateCalculationRequest(request: CalculationRequest): void {
    if (!request.modelName) {
      throw new Error('Model name is required');
    }

    if (!request.data || !Array.isArray(request.data) || request.data.length === 0) {
      throw new Error('Data array is required and must not be empty');
    }

    if (!request.calculationType || !['ECL', 'PD', 'LGD', 'EAD', 'STAGING'].includes(request.calculationType)) {
      throw new Error('Valid calculation type is required');
    }

    if (!request.bankingType || !['CONVENTIONAL', 'SYARIAH'].includes(request.bankingType)) {
      throw new Error('Valid banking type is required');
    }

    if (!request.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (!request.userId) {
      throw new Error('User ID is required');
    }

    if (!request.requestId) {
      throw new Error('Request ID is required');
    }

    // Validate data size
    const maxDataSize = configService.getNumber('R_ANALYTICS_MAX_DATA_SIZE', 10000);
    if (request.data.length > maxDataSize) {
      throw new Error(`Data size exceeds maximum allowed (${maxDataSize} records)`);
    }
  }

  // ============================================================================
  // 🔧 UTILITY METHODS
  // ============================================================================

  private transformError(error: any): Error {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || error.response.data?.error || error.message;
      const customError = new Error(`R Analytics API Error: ${message}`);
      (customError as any).status = error.response.status;
      (customError as any).code = error.response.data?.code || 'R_API_ERROR';
      return customError;
    } else if (error.request) {
      // Network error
      return new Error('R Analytics service is not available');
    } else {
      // Other error
      return new Error(`R Analytics request failed: ${error.message}`);
    }
  }

  // ============================================================================
  // 🩹 SURGICAL FIX: SAFE AUDIT METHODS
  // ============================================================================

  private async auditCalculation(request: CalculationRequest, response: CalculationResponse): Promise<void> {
    try {
      const auditService = this.getAuditServiceInstance();
      await auditService.log({
        userId: request.userId,
        tenantId: request.tenantId,
        eventType: 'CALCULATION',
        action: `R_ANALYTICS_${request.calculationType}`,
        description: `R Analytics ${request.calculationType} calculation completed`,
        metadata: {
          requestId: request.requestId,
          modelName: request.modelName,
          calculationType: request.calculationType,
          bankingType: request.bankingType,
          recordsProcessed: response.metadata.recordsProcessed,
          executionTime: response.metadata.executionTime,
          success: response.success
        }
      });
    } catch (error) {
      console.error('Failed to audit calculation:', error);
      // Don't throw - audit logging should never crash the main operation
    }
  }

  private async auditCalculationError(request: CalculationRequest, error: Error, executionTime: number): Promise<void> {
    try {
      const auditService = this.getAuditServiceInstance();
      await auditService.log({
        userId: request.userId,
        tenantId: request.tenantId,
        eventType: 'CALCULATION_ERROR',
        action: `R_ANALYTICS_${request.calculationType}_ERROR`,
        description: `R Analytics ${request.calculationType} calculation failed`,
        metadata: {
          requestId: request.requestId,
          modelName: request.modelName,
          calculationType: request.calculationType,
          bankingType: request.bankingType,
          error: error.message,
          executionTime
        }
      });
    } catch (auditError) {
      console.error('Failed to audit calculation error:', auditError);
      // Don't throw - audit logging should never crash the main operation
    }
  }

  // ============================================================================
  // 🏁 CLEANUP
  // ============================================================================

  public async shutdown(): Promise<void> {
    console.log('🏁 Shutting down R Analytics Service...');
    
    this.stopHealthMonitoring();
    this.isInitialized = false;
    
    console.log('✅ R Analytics Service shutdown complete');
  }

  public isReady(): boolean {
    return this.isInitialized && this.healthStatus?.status !== 'unhealthy';
  }
}

// ============================================================================
// 🩹 SURGICAL FIX: SERVICE FACTORY PATTERN (prevents circular dependencies)
// ============================================================================

let rAnalyticsServiceInstance: RAnalyticsService | null = null;

export function createRAnalyticsService(): RAnalyticsService {
  if (!rAnalyticsServiceInstance) {
    rAnalyticsServiceInstance = new RAnalyticsService();
    console.log('✅ R Analytics Service instance created with lazy dependencies');
  }
  return rAnalyticsServiceInstance;
}

// ✅ FIXED: Export factory function instead of direct instantiation
export const rAnalyticsService = createRAnalyticsService();

export default RAnalyticsService;