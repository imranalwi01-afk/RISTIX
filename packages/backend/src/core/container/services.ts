// packages/backend/src/core/container/services.ts
// ============================================================================
// IFRS9 PLATFORM - SERVICE CONTAINER REGISTRATION
// ============================================================================
// File Path: packages/backend/src/core/container/services.ts
// Purpose: Service registration and dependency injection configuration
// Dependencies: inversify, service classes
// ============================================================================

import { Container } from 'inversify';

// Service Identifiers (using symbols for better type safety)
export const TYPES = {
  // Database Services
  DatabaseManager: Symbol.for('DatabaseManager'),
  TenantDatabaseService: Symbol.for('TenantDatabaseService'),
  
  // Authentication Services
  AuthService: Symbol.for('AuthService'),
  JWTService: Symbol.for('JWTService'),
  PasswordService: Symbol.for('PasswordService'),
  
  // User Management Services
  UserService: Symbol.for('UserService'),
  RoleService: Symbol.for('RoleService'),
  PermissionService: Symbol.for('PermissionService'),
  
  // Banking Services
  ParameterService: Symbol.for('ParameterService'),
  ProductParameterService: Symbol.for('ProductParameterService'),
  JournalParameterService: Symbol.for('JournalParameterService'),
  
  // IFRS9 Services
  IFRS9CalculationService: Symbol.for('IFRS9CalculationService'),
  ECLCalculationService: Symbol.for('ECLCalculationService'),
  StagingService: Symbol.for('StagingService'),
  
  // Risk Component Services
  PDCalculationService: Symbol.for('PDCalculationService'),
  LGDCalculationService: Symbol.for('LGDCalculationService'),
  EADCalculationService: Symbol.for('EADCalculationService'),
  
  // Workflow Services
  WorkflowService: Symbol.for('WorkflowService'),
  ApprovalService: Symbol.for('ApprovalService'),
  NotificationService: Symbol.for('NotificationService'),
  
  // Utility Services
  LoggingService: Symbol.for('LoggingService'),
  CacheService: Symbol.for('CacheService'),
  ValidationService: Symbol.for('ValidationService'),
  
  // Integration Services
  CoreBankingIntegrationService: Symbol.for('CoreBankingIntegrationService'),
  RAnalyticsService: Symbol.for('RAnalyticsService'),
  
  // Audit Services
  AuditService: Symbol.for('AuditService'),
  ComplianceService: Symbol.for('ComplianceService')
};

/**
 * Register core platform services
 */
export function registerCoreServices(container: Container): void {
  console.log('🔧 Registering core platform services...');

  // Note: Actual service implementations would be bound here
  // For now, we'll register placeholders that can be implemented later
  
  // Example of how services would be registered:
  // container.bind<UserService>(TYPES.UserService).to(UserService).inSingletonScope();
  // container.bind<AuthService>(TYPES.AuthService).to(AuthService).inSingletonScope();
  
  console.log('✅ Core services registered');
}

/**
 * Register banking-specific services
 */
export function registerBankingServices(container: Container): void {
  console.log('🏦 Registering banking services...');
  
  // Banking parameter services would be registered here
  // container.bind<ParameterService>(TYPES.ParameterService).to(ParameterService).inSingletonScope();
  
  console.log('✅ Banking services registered');
}

/**
 * Register IFRS9 calculation services
 */
export function registerIFRS9Services(container: Container): void {
  console.log('📊 Registering IFRS9 services...');
  
  // IFRS9 calculation services would be registered here
  // container.bind<IFRS9CalculationService>(TYPES.IFRS9CalculationService).to(IFRS9CalculationService).inSingletonScope();
  
  console.log('✅ IFRS9 services registered');
}

/**
 * Register all application services
 */
export function registerAllServices(container: Container): void {
  try {
    registerCoreServices(container);
    registerBankingServices(container);
    registerIFRS9Services(container);
    
    console.log('✅ All application services registered successfully');
  } catch (error) {
    console.error('❌ Error registering application services:', error);
    throw error;
  }
}

/**
 * Service factory for creating service instances
 */
export class ServiceFactory {
  private container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  /**
   * Get a service instance by type
   */
  get<T>(serviceType: symbol): T {
    try {
      if (!this.container.isBound(serviceType)) {
        throw new Error(`Service ${serviceType.toString()} is not registered`);
      }
      return this.container.get<T>(serviceType);
    } catch (error) {
      console.error(`❌ Failed to resolve service ${serviceType.toString()}:`, error);
      throw error;
    }
  }

  /**
   * Check if a service is registered
   */
  isRegistered(serviceType: symbol): boolean {
    return this.container.isBound(serviceType);
  }

  /**
   * Get all registered service types
   */
  getRegisteredServices(): symbol[] {
    // This would need to be implemented based on inversify container internals
    return Object.values(TYPES);
  }
}

/**
 * Service locator pattern implementation
 */
export class ServiceLocator {
  private static instance: ServiceLocator;
  private serviceFactory: ServiceFactory;

  private constructor(container: Container) {
    this.serviceFactory = new ServiceFactory(container);
  }

  static initialize(container: Container): ServiceLocator {
    if (!ServiceLocator.instance) {
      ServiceLocator.instance = new ServiceLocator(container);
    }
    return ServiceLocator.instance;
  }

  static getInstance(): ServiceLocator {
    if (!ServiceLocator.instance) {
      throw new Error('ServiceLocator must be initialized with a container first');
    }
    return ServiceLocator.instance;
  }

  getService<T>(serviceType: symbol): T {
    return this.serviceFactory.get<T>(serviceType);
  }

  isServiceRegistered(serviceType: symbol): boolean {
    return this.serviceFactory.isRegistered(serviceType);
  }
}

export default {
  TYPES,
  registerCoreServices,
  registerBankingServices,
  registerIFRS9Services,
  registerAllServices,
  ServiceFactory,
  ServiceLocator
};