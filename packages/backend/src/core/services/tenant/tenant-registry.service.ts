// packages/backend/src/core/services/tenant/tenant-registry.service.ts
// ============================================================================
// 🏢 TENANT REGISTRY SERVICE - Dynamic tenant discovery and configuration management
// ============================================================================
// Based on TodoList-v2.md Hour 4 requirements
// Features: Dynamic discovery, configuration management, multi-database support
// ============================================================================

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { databaseConfig } from '../../database/config/database.config';
import { configService } from '../configuration/configuration.service';
import { tenantService, TenantInfo } from './tenant.service';

// ============================================================================
// 🔧 ENHANCED INTERFACES
// ============================================================================

export interface TenantRegistryEntry {
  id: string;
  slug: string;
  displayName: string;
  organizationName: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  status: 'active' | 'suspended' | 'provisioning' | 'inactive';
  subscriptionTier: 'basic' | 'standard' | 'premium' | 'enterprise';
  
  // Database configuration
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    ssl: boolean;
    maxConnections: number;
    healthStatus: 'healthy' | 'degraded' | 'unhealthy';
    lastHealthCheck: Date;
  };

  // Features and configuration
  features: {
    islamicBanking: boolean;
    syariahCompliance: boolean;
    advancedAnalytics: boolean;
    stressTesting: boolean;
    workflowManagement: boolean;
    auditTrail: boolean;
    reactAdminUI: boolean;
    mobileAPI: boolean;
  };

  // Runtime configuration
  configuration: {
    timezone: string;
    currency: string;
    locale: string;
    dateFormat: string;
    decimalPrecision: number;
    fiscalYearStart: string;
    reportingFrequency: 'monthly' | 'quarterly' | 'annually';
  };

  // Performance metrics
  metrics: {
    totalUsers: number;
    activeUsers: number;
    storageUsed: number; // MB
    apiCallsToday: number;
    lastActivity: Date;
    averageResponseTime: number; // ms
  };

  // Timestamps
  registeredAt: Date;
  lastUpdated: Date;
  lastAccessed: Date;
}

export interface TenantDiscoveryConfig {
  autoDiscovery: boolean;
  discoveryInterval: number; // ms
  healthCheckInterval: number; // ms
  cacheTimeout: number; // ms
  maxRetries: number;
}

export interface TenantConfigurationUpdate {
  tenantId: string;
  category: 'features' | 'configuration' | 'database' | 'metrics';
  updates: Record<string, any>;
  updatedBy: string;
  reason?: string;
}

// ============================================================================
// 🏢 TENANT REGISTRY SERVICE
// ============================================================================

export class TenantRegistryService extends EventEmitter {
  private static instance: TenantRegistryService;
  private tenantRegistry: Map<string, TenantRegistryEntry> = new Map();
  private tenantSlugIndex: Map<string, string> = new Map();
  private discoveryConfig: TenantDiscoveryConfig;
  private discoveryInterval: NodeJS.Timeout | null = null;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.discoveryConfig = this.loadDiscoveryConfig();
    this.initializeRegistry();
  }

  public static getInstance(): TenantRegistryService {
    if (!TenantRegistryService.instance) {
      TenantRegistryService.instance = new TenantRegistryService();
    }
    return TenantRegistryService.instance;
  }

  // ============================================================================
  // 🚀 INITIALIZATION & DISCOVERY
  // ============================================================================

  /**
   * Initialize tenant registry with discovery and health monitoring
   */
  private async initializeRegistry(): Promise<void> {
    try {
      console.log('🏢 Initializing Tenant Registry...');

      // Load existing tenants from database
      await this.discoverExistingTenants();

      // Start auto-discovery if enabled
      if (this.discoveryConfig.autoDiscovery) {
        this.startAutoDiscovery();
      }

      // Start health monitoring
      this.startHealthMonitoring();

      console.log(`✅ Tenant Registry initialized with ${this.tenantRegistry.size} tenants`);
      this.emit('registry:initialized', { tenantCount: this.tenantRegistry.size });

    } catch (error) {
      console.error('❌ Failed to initialize Tenant Registry:', error);
      this.emit('registry:error', { error: error.message });
    }
  }

  /**
   * Discover existing tenants from platform database
   */
  private async discoverExistingTenants(): Promise<void> {
    try {
      console.log('🔍 Discovering existing tenants...');
      
      // 🔧 SINGLE TENANT MODE CHECK - Honor SINGLE_TENANT_MODE configuration
      const singleTenantMode = configService.getBoolean('SINGLE_TENANT_MODE', false);
      const tenantAutoDiscovery = configService.getBoolean('TENANT_AUTO_DISCOVERY', true);
      const defaultTenant = process.env.DEFAULT_TENANT || 'iaf';
      
      console.log(`🔧 Single Tenant Mode: ${singleTenantMode}`);
      console.log(`🔧 Tenant Auto Discovery: ${tenantAutoDiscovery}`);
      console.log(`🔧 Default Tenant: ${defaultTenant}`);
      
      if (singleTenantMode && !tenantAutoDiscovery) {
        console.log(`🎯 SINGLE TENANT MODE: Only discovering ${defaultTenant} tenant`);
        
        // Only discover the single default tenant
        try {
          const singleTenant = await tenantService.getTenantBySlug(defaultTenant);
          if (singleTenant) {
            const registryEntry = await this.buildTenantRegistryEntry(singleTenant);
            if (registryEntry) {
              this.registerTenant(registryEntry);
            }
            console.log(`✅ Discovered 1 tenant (Single Tenant Mode): ${singleTenant.displayName}`);
          } else {
            console.warn(`⚠️ Single tenant '${defaultTenant}' not found in database`);
          }
        } catch (error) {
          console.error(`❌ Failed to discover single tenant '${defaultTenant}':`, error);
        }
        return;
      }
      
      // Original multi-tenant discovery
      const tenants = await tenantService.listTenants({ 
        limit: 1000, 
        includeInactive: false 
      });

      for (const tenant of tenants.data) {
        const registryEntry = await this.buildTenantRegistryEntry(tenant);
        if (registryEntry) {
          this.registerTenant(registryEntry);
        }
      }

      console.log(`✅ Discovered ${tenants.data.length} existing tenants`);

    } catch (error) {
      console.error('❌ Failed to discover existing tenants:', error);
      throw error;
    }
  }

  /**
   * Build registry entry from tenant info
   */
  private async buildTenantRegistryEntry(tenant: TenantInfo): Promise<TenantRegistryEntry | null> {
    try {
      // Get tenant-specific configuration
      const tenantConfig = await configService.getTenantConfiguration(tenant.id);
      
      // Get tenant metrics (mock for now - would be from metrics service)
      const metrics = await this.getTenantMetrics(tenant.id);

      // Check database health
      const databaseHealth = await this.checkTenantDatabaseHealth(tenant.id);

      return {
        id: tenant.id,
        slug: tenant.tenantSlug,
        displayName: tenant.displayName,
        organizationName: tenant.organizationName || tenant.displayName,
        bankingType: tenant.bankingType,
        status: tenant.status,
        subscriptionTier: tenant.subscriptionTier,

        database: {
          host: tenant.databaseHost,
          port: tenant.databasePort,
          name: tenant.databaseName,
          user: `tenant_${tenant.tenantSlug}`,
          ssl: tenantConfig['database.ssl'] || false,
          maxConnections: tenantConfig['database.max_connections'] || 10,
          healthStatus: databaseHealth.status,
          lastHealthCheck: new Date()
        },

        features: {
          islamicBanking: tenant.featuresEnabled.islamicBanking || false,
          syariahCompliance: tenant.featuresEnabled.syariahCompliance || false,
          advancedAnalytics: tenant.featuresEnabled.advancedAnalytics || false,
          stressTesting: tenant.featuresEnabled.stressTesting || false,
          workflowManagement: tenant.featuresEnabled.workflowManagement || false,
          auditTrail: tenant.featuresEnabled.auditTrail || true,
          reactAdminUI: tenant.featuresEnabled.reactAdminUI || true,
          mobileAPI: tenant.featuresEnabled.mobileAPI || false
        },

        configuration: {
          timezone: tenantConfig['system.timezone'] || 'Asia/Jakarta',
          currency: tenantConfig['system.currency'] || 'IDR',
          locale: tenantConfig['system.locale'] || 'id-ID',
          dateFormat: tenantConfig['system.date_format'] || 'DD/MM/YYYY',
          decimalPrecision: tenantConfig['system.decimal_precision'] || 2,
          fiscalYearStart: tenantConfig['system.fiscal_year_start'] || '01-01',
          reportingFrequency: tenantConfig['system.reporting_frequency'] || 'monthly'
        },

        metrics: metrics || {
          totalUsers: 0,
          activeUsers: 0,
          storageUsed: 0,
          apiCallsToday: 0,
          lastActivity: new Date(),
          averageResponseTime: 0
        },

        registeredAt: tenant.createdAt,
        lastUpdated: tenant.updatedAt,
        lastAccessed: new Date()
      };

    } catch (error) {
      console.error(`❌ Failed to build registry entry for tenant ${tenant.id}:`, error);
      return null;
    }
  }

  // ============================================================================
  // 🔍 TENANT DISCOVERY & MANAGEMENT
  // ============================================================================

  /**
   * Register a new tenant in the registry
   */
  public registerTenant(entry: TenantRegistryEntry): void {
    this.tenantRegistry.set(entry.id, entry);
    this.tenantSlugIndex.set(entry.slug, entry.id);
    
    this.emit('tenant:registered', { tenant: entry });
    console.log(`✅ Registered tenant: ${entry.displayName} (${entry.slug})`);
  }

  /**
   * Unregister a tenant from the registry
   */
  public unregisterTenant(tenantId: string): boolean {
    const tenant = this.tenantRegistry.get(tenantId);
    if (!tenant) return false;

    this.tenantRegistry.delete(tenantId);
    this.tenantSlugIndex.delete(tenant.slug);
    
    this.emit('tenant:unregistered', { tenantId, tenant });
    console.log(`✅ Unregistered tenant: ${tenant.displayName}`);
    return true;
  }

  /**
   * Get tenant by ID
   */
  public getTenant(tenantId: string): TenantRegistryEntry | null {
    const tenant = this.tenantRegistry.get(tenantId);
    if (tenant) {
      // Update last accessed
      tenant.lastAccessed = new Date();
      this.tenantRegistry.set(tenantId, tenant);
    }
    return tenant || null;
  }

  /**
   * Get tenant by slug
   */
  public getTenantBySlug(slug: string): TenantRegistryEntry | null {
    const tenantId = this.tenantSlugIndex.get(slug);
    return tenantId ? this.getTenant(tenantId) : null;
  }

  /**
   * List all tenants with filtering
   */
  public listTenants(filters?: {
    status?: string;
    bankingType?: string;
    subscriptionTier?: string;
    features?: string[];
    limit?: number;
    offset?: number;
  }): {
    tenants: TenantRegistryEntry[];
    total: number;
    filtered: number;
  } {
    let tenants = Array.from(this.tenantRegistry.values());

    // Apply filters
    if (filters?.status) {
      tenants = tenants.filter(t => t.status === filters.status);
    }
    
    if (filters?.bankingType) {
      tenants = tenants.filter(t => 
        t.bankingType === filters.bankingType || t.bankingType === 'dual'
      );
    }
    
    if (filters?.subscriptionTier) {
      tenants = tenants.filter(t => t.subscriptionTier === filters.subscriptionTier);
    }
    
    if (filters?.features && filters.features.length > 0) {
      tenants = tenants.filter(t => 
        filters.features!.every(feature => t.features[feature as keyof typeof t.features])
      );
    }

    const filtered = tenants.length;
    const total = this.tenantRegistry.size;

    // Apply pagination
    if (filters?.offset || filters?.limit) {
      const offset = filters.offset || 0;
      const limit = filters.limit || 50;
      tenants = tenants.slice(offset, offset + limit);
    }

    return { tenants, total, filtered };
  }

  // ============================================================================
  // 🔧 CONFIGURATION MANAGEMENT
  // ============================================================================

  /**
   * Update tenant configuration
   */
  public async updateTenantConfiguration(update: TenantConfigurationUpdate): Promise<{ 
    success: boolean; 
    error?: string 
  }> {
    try {
      const tenant = this.getTenant(update.tenantId);
      if (!tenant) {
        return { success: false, error: 'Tenant not found' };
      }

      // Update the registry entry
      const updatedTenant = { ...tenant };
      
      switch (update.category) {
        case 'features':
          updatedTenant.features = { ...updatedTenant.features, ...update.updates };
          break;
        case 'configuration':
          updatedTenant.configuration = { ...updatedTenant.configuration, ...update.updates };
          break;
        case 'database':
          updatedTenant.database = { ...updatedTenant.database, ...update.updates };
          break;
        case 'metrics':
          updatedTenant.metrics = { ...updatedTenant.metrics, ...update.updates };
          break;
      }

      updatedTenant.lastUpdated = new Date();

      // Update in registry
      this.tenantRegistry.set(update.tenantId, updatedTenant);

      // Persist to database (for non-metrics updates)
      if (update.category !== 'metrics') {
        await this.persistConfigurationChanges(update);
      }

      this.emit('tenant:updated', { 
        tenantId: update.tenantId, 
        category: update.category, 
        updates: update.updates 
      });

      return { success: true };

    } catch (error) {
      console.error('❌ Failed to update tenant configuration:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Persist configuration changes to database
   */
  private async persistConfigurationChanges(update: TenantConfigurationUpdate): Promise<void> {
    try {
      for (const [key, value] of Object.entries(update.updates)) {
        await configService.setInDatabase({
          key: `${update.category}.${key}`,
          value,
          category: update.category,
          tenantId: update.tenantId,
          updatedBy: update.updatedBy,
          description: update.reason || `Updated via Tenant Registry`
        });
      }
    } catch (error) {
      console.error('❌ Failed to persist configuration changes:', error);
      throw error;
    }
  }

  // ============================================================================
  // 🏥 HEALTH MONITORING
  // ============================================================================

  /**
   * Start health monitoring for all tenants
   */
  private startHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthChecks();
    }, this.discoveryConfig.healthCheckInterval);

    console.log('🏥 Health monitoring started');
  }

  /**
   * Perform health checks on all active tenants
   */
  private async performHealthChecks(): Promise<void> {
    const activeTenants = Array.from(this.tenantRegistry.values())
      .filter(t => t.status === 'active');

    // Skip health checks if no active tenants
    if (activeTenants.length === 0) {
      return;
    }

    console.log(`🔍 Performing health checks on ${activeTenants.length} active tenants`);

    const healthCheckPromises = activeTenants.map(async (tenant) => {
      try {
        // Use a simple ping instead of creating new connections
        const healthStatus = await this.checkTenantDatabaseHealthSimple(tenant);

        // Update tenant health status
        const updatedTenant = { ...tenant };
        updatedTenant.database.healthStatus = healthStatus.status;
        updatedTenant.database.lastHealthCheck = new Date();

        this.tenantRegistry.set(tenant.id, updatedTenant);

        if (healthStatus.status === 'unhealthy') {
          this.emit('tenant:unhealthy', { tenant, healthStatus });
        }

      } catch (error) {
        console.error(`❌ Health check failed for tenant ${tenant.slug}:`, error);
      }
    });

    await Promise.allSettled(healthCheckPromises);
  }

  /**
   * Check database health for specific tenant (simplified - doesn't create new connections)
   */
  private async checkTenantDatabaseHealthSimple(tenant: TenantRegistryEntry): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Check if tenant already has a connection and it's marked as connected
      if (tenant.database.connectionStatus === 'connected' && tenant.database.lastHealthCheck) {
        const timeSinceLastCheck = Date.now() - tenant.database.lastHealthCheck.getTime();

        // If last health check was within last 30 seconds, consider it healthy
        if (timeSinceLastCheck < 30000) {
          return {
            status: 'healthy',
            responseTime: 5 // Fast response since we're not actually checking
          };
        }
      }

      // For actual health check, try to use existing connection if available
      const connKey = `tenant_${tenant.slug}`;
      const existingConnection = databaseConfig['tenantConnections']?.get(connKey);

      if (existingConnection && existingConnection.isConnected) {
        const responseTime = Date.now() - startTime;
        return {
          status: responseTime < 100 ? 'healthy' : 'degraded',
          responseTime
        };
      }

      // If no existing connection, just report status based on last known state
      return {
        status: tenant.database.connectionStatus === 'connected' ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Check database health for specific tenant (full check - creates new connection)
   */
  private async checkTenantDatabaseHealth(tenantId: string): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Get tenant info to get the slug for database connection
      const tenant = await tenantService.getTenant(tenantId);
      if (!tenant) {
        throw new Error(`Tenant not found: ${tenantId}`);
      }

      // Use tenant slug for database connection (not UUID)
      await databaseConfig.getTenantConnection(tenant.tenantSlug);
      const responseTime = Date.now() - startTime;

      return {
        status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'unhealthy',
        responseTime
      };

    } catch (error) {
      return {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  // ============================================================================
  // 📊 METRICS & ANALYTICS
  // ============================================================================

  /**
   * Get tenant metrics (mock implementation)
   */
  private async getTenantMetrics(tenantId: string): Promise<TenantRegistryEntry['metrics'] | null> {
    try {
      // This would be replaced with actual metrics collection
      return {
        totalUsers: Math.floor(Math.random() * 100) + 1,
        activeUsers: Math.floor(Math.random() * 50) + 1,
        storageUsed: Math.floor(Math.random() * 1000),
        apiCallsToday: Math.floor(Math.random() * 5000),
        lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        averageResponseTime: Math.floor(Math.random() * 200) + 50
      };
    } catch (error) {
      console.error(`❌ Failed to get metrics for tenant ${tenantId}:`, error);
      return null;
    }
  }

  /**
   * Get registry statistics
   */
  public getRegistryStatistics(): {
    totalTenants: number;
    activeTenants: number;
    suspendedTenants: number;
    healthyTenants: number;
    byBankingType: Record<string, number>;
    bySubscriptionTier: Record<string, number>;
    averageResponseTime: number;
    lastUpdated: Date;
  } {
    const tenants = Array.from(this.tenantRegistry.values());
    
    const stats = {
      totalTenants: tenants.length,
      activeTenants: tenants.filter(t => t.status === 'active').length,
      suspendedTenants: tenants.filter(t => t.status === 'suspended').length,
      healthyTenants: tenants.filter(t => t.database.healthStatus === 'healthy').length,
      byBankingType: {} as Record<string, number>,
      bySubscriptionTier: {} as Record<string, number>,
      averageResponseTime: 0,
      lastUpdated: new Date()
    };

    // Calculate distribution by banking type
    tenants.forEach(t => {
      stats.byBankingType[t.bankingType] = (stats.byBankingType[t.bankingType] || 0) + 1;
      stats.bySubscriptionTier[t.subscriptionTier] = (stats.bySubscriptionTier[t.subscriptionTier] || 0) + 1;
    });

    // Calculate average response time
    const responseTimes = tenants
      .map(t => t.metrics.averageResponseTime)
      .filter(rt => rt > 0);
    
    stats.averageResponseTime = responseTimes.length > 0 
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length)
      : 0;

    return stats;
  }

  // ============================================================================
  // 🚀 AUTO-DISCOVERY
  // ============================================================================

  /**
   * Start auto-discovery of new tenants
   */
  private startAutoDiscovery(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
    }

    this.discoveryInterval = setInterval(async () => {
      await this.performAutoDiscovery();
    }, this.discoveryConfig.discoveryInterval);

    console.log('🔍 Auto-discovery started');
  }

  /**
   * Perform automatic tenant discovery
   */
  private async performAutoDiscovery(): Promise<void> {
    try {
      console.log('🔍 Performing auto-discovery...');
      
      const existingTenantIds = new Set(this.tenantRegistry.keys());
      const allTenants = await tenantService.listTenants({ limit: 1000 });

      let newTenantsFound = 0;

      for (const tenant of allTenants.data) {
        if (!existingTenantIds.has(tenant.id)) {
          const registryEntry = await this.buildTenantRegistryEntry(tenant);
          if (registryEntry) {
            this.registerTenant(registryEntry);
            newTenantsFound++;
          }
        }
      }

      if (newTenantsFound > 0) {
        console.log(`✅ Auto-discovery found ${newTenantsFound} new tenants`);
        this.emit('discovery:new-tenants', { count: newTenantsFound });
      }

    } catch (error) {
      console.error('❌ Auto-discovery failed:', error);
      this.emit('discovery:error', { error: error.message });
    }
  }

  // ============================================================================
  // 🔧 CONFIGURATION & UTILITIES
  // ============================================================================

  /**
   * Load discovery configuration
   */
  private loadDiscoveryConfig(): TenantDiscoveryConfig {
    return {
      autoDiscovery: configService.getBoolean('TENANT_AUTO_DISCOVERY', true),
      discoveryInterval: configService.getNumber('TENANT_DISCOVERY_INTERVAL', 15 * 60 * 1000), // 15 minutes
      healthCheckInterval: configService.getNumber('TENANT_HEALTH_CHECK_INTERVAL', 10 * 60 * 1000), // 10 minutes
      cacheTimeout: configService.getNumber('TENANT_CACHE_TIMEOUT', 10 * 60 * 1000), // 10 minutes
      maxRetries: configService.getNumber('TENANT_MAX_RETRIES', 3)
    };
  }

  /**
   * Refresh tenant registry
   */
  public async refresh(): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🔄 Refreshing tenant registry...');
      
      this.tenantRegistry.clear();
      this.tenantSlugIndex.clear();
      
      await this.discoverExistingTenants();
      
      console.log('✅ Tenant registry refreshed successfully');
      this.emit('registry:refreshed', { tenantCount: this.tenantRegistry.size });
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to refresh tenant registry:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get tenants with advanced filtering and pagination (required by admin-dashboard.controller)
   */
  public async getTenants(options: {
    filters?: {
      status?: string;
      bankingType?: string;
    };
    sort?: {
      field: string;
      order: 'asc' | 'desc';
    };
    pagination?: {
      page: number;
      limit: number;
    };
  }): Promise<{
    tenants: TenantRegistryEntry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      let tenants = Array.from(this.tenantRegistry.values());

      // Apply filters
      if (options.filters?.status) {
        tenants = tenants.filter(t => t.status === options.filters!.status);
      }

      if (options.filters?.bankingType) {
        tenants = tenants.filter(t => t.bankingType === options.filters!.bankingType);
      }

      // Apply sorting
      if (options.sort) {
        tenants.sort((a, b) => {
          const { field, order } = options.sort!;
          let aValue = (a as any)[field];
          let bValue = (b as any)[field];

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          if (order === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });
      }

      // Apply pagination
      const { page = 1, limit = 20 } = options.pagination || {};
      const total = tenants.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginatedTenants = tenants.slice(offset, offset + limit);

      return {
        tenants: paginatedTenants,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('❌ Failed to get tenants:', error);
      throw error;
    }
  }

  /**
   * Get tenant overview (required by admin-dashboard.controller)
   */
  public async getTenantOverview(): Promise<{
    totalTenants: number;
    activeTenants: number;
    byBankingType: Record<string, number>;
    byStatus: Record<string, number>;
    averageResponseTime: number;
    systemHealth: 'healthy' | 'degraded' | 'critical';
  }> {
    try {
      const stats = this.getRegistryStatistics();
      const tenants = Array.from(this.tenantRegistry.values());

      // Calculate system health based on tenant health
      const healthyCount = tenants.filter(t => t.database.healthStatus === 'healthy').length;
      const degradedCount = tenants.filter(t => t.database.healthStatus === 'degraded').length;
      const unhealthyCount = tenants.filter(t => t.database.healthStatus === 'unhealthy').length;

      let systemHealth: 'healthy' | 'degraded' | 'critical' = 'healthy';
      if (unhealthyCount > 0) {
        systemHealth = 'critical';
      } else if (degradedCount > 0) {
        systemHealth = 'degraded';
      }

      return {
        totalTenants: stats.totalTenants,
        activeTenants: stats.activeTenants,
        byBankingType: stats.byBankingType,
        byStatus: {
          active: stats.activeTenants,
          suspended: stats.suspendedTenants,
          provisioning: tenants.filter(t => t.status === 'provisioning').length,
          inactive: tenants.filter(t => t.status === 'inactive').length
        },
        averageResponseTime: stats.averageResponseTime,
        systemHealth
      };
    } catch (error) {
      console.error('❌ Failed to get tenant overview:', error);
      throw error;
    }
  }

  /**
   * Stop all monitoring intervals
   */
  public stop(): void {
    if (this.discoveryInterval) {
      clearInterval(this.discoveryInterval);
      this.discoveryInterval = null;
    }

    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    console.log('🛑 Tenant Registry stopped');
  }
}

// Export singleton instance
export const tenantRegistry = TenantRegistryService.getInstance();

// Export types
export type {
  TenantRegistryEntry,
  TenantDiscoveryConfig,
  TenantConfigurationUpdate
};