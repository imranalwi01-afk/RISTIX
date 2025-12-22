// packages/backend/src/core/container/dependency-injection.container.ts
// ============================================================================
// 🔧 DEPENDENCY INJECTION CONTAINER - IFRS9 STANDARDIZATION
// ============================================================================
// ✅ PURPOSE: Centralized dependency injection with configuration management
// ✅ PATTERN: InversifyJS-based container with service registration
// ✅ COMPLIANCE: IFRS9 standardization requirements for DI
// ============================================================================

import 'reflect-metadata';
import { Container, injectable, inject, interfaces } from 'inversify';
import { Sequelize } from 'sequelize';
import { ConfigurationFactoryService } from '../services/configuration/configuration-factory.service';
import { configurationFactory } from '../services/configuration/configuration-factory.service';

// Service identifiers for dependency injection
export const TYPES = {
  Configuration: Symbol.for('Configuration'),
  Database: Symbol.for('Database'),
  PlatformDatabase: Symbol.for('PlatformDatabase'),
  SharedDatabase: Symbol.for('SharedDatabase'),
  TenantDatabase: Symbol.for('TenantDatabase'),
  LegacyDatabase: Symbol.for('LegacyDatabase'),
  Logger: Symbol.for('Logger'),
  AuditService: Symbol.for('AuditService'),
  AuthenticationService: Symbol.for('AuthenticationService'),
  UserManagementService: Symbol.for('UserManagementService'),
  IFRS9CalculationService: Symbol.for('IFRS9CalculationService'),
  BankingParameterService: Symbol.for('BankingParameterService'),
  RuleBaseSettingService: Symbol.for('RuleBaseSettingService'),
  ETLService: Symbol.for('ETLService'),
  RAnalyticsService: Symbol.for('RAnalyticsService'),
  NotificationService: Symbol.for('NotificationService'),
  SecurityService: Symbol.for('SecurityService'),
  ValidationService: Symbol.for('ValidationService'),
  FileProcessingService: Symbol.for('FileProcessingService'),
  ReportService: Symbol.for('ReportService'),
  WorkflowService: Symbol.for('WorkflowService')
};

@injectable()
export class DatabaseContainer {
  private connections: Map<string, Sequelize> = new Map();

  constructor(
    @inject(TYPES.Configuration) private configuration: ConfigurationFactoryService
  ) {}

  /**
   * Get database connection by type
   */
  public getConnection(dbType: 'platform' | 'shared' | 'tenant' | 'legacy'): Sequelize {
    const connectionKey = dbType;

    if (!this.connections.has(connectionKey)) {
      this.connections.set(connectionKey, this.createConnection(dbType));
    }

    return this.connections.get(connectionKey)!;
  }

  /**
   * Get tenant-specific database connection
   */
  public getTenantConnection(tenantSlug: string): Sequelize {
    const connectionKey = `tenant_${tenantSlug}`;

    if (!this.connections.has(connectionKey)) {
      this.connections.set(connectionKey, this.createTenantConnection(tenantSlug));
    }

    return this.connections.get(connectionKey)!;
  }

  /**
   * Create database connection
   */
  private createConnection(dbType: 'platform' | 'shared' | 'tenant' | 'legacy'): Sequelize {
    const config = this.configuration.getDatabaseConfig(dbType);

    return new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: 'postgres',
      logging: this.configuration.getConfiguration().application.debug ? console.log : false,
      pool: {
        min: config.pool.min,
        max: config.pool.max,
        acquire: config.pool.acquire,
        idle: config.pool.idle
      },
      dialectOptions: {
        ssl: config.ssl ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      define: {
        underscored: true,
        freezeTableName: true,
        timestamps: true
      }
    });
  }

  /**
   * Create tenant-specific database connection
   */
  private createTenantConnection(tenantSlug: string): Sequelize {
    const config = this.configuration.getTenantDatabaseConfig(tenantSlug);

    return new Sequelize(config.database, config.username, config.password, {
      host: config.host,
      port: config.port,
      dialect: 'postgres',
      logging: this.configuration.getConfiguration().application.debug ? console.log : false,
      pool: {
        min: config.pool.min,
        max: config.pool.max,
        acquire: config.pool.acquire,
        idle: config.pool.idle
      },
      dialectOptions: {
        ssl: config.ssl ? {
          require: true,
          rejectUnauthorized: false
        } : false
      },
      define: {
        underscored: true,
        freezeTableName: true,
        timestamps: true
      }
    });
  }

  /**
   * Test all database connections
   */
  public async testConnections(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};

    for (const [key, connection] of this.connections.entries()) {
      try {
        await connection.authenticate();
        results[key] = true;
      } catch (error) {
        console.error(`❌ Database connection failed for ${key}:`, error);
        results[key] = false;
      }
    }

    return results;
  }

  /**
   * Close all database connections
   */
  public async closeAllConnections(): Promise<void> {
    const closePromises = Array.from(this.connections.values()).map(connection => connection.close());
    await Promise.all(closePromises);
    this.connections.clear();
  }
}

@injectable()
export class LoggerService {
  constructor(
    @inject(TYPES.Configuration) private configuration: ConfigurationFactoryService
  ) {}

  /**
   * Log message with context
   */
  public log(level: 'debug' | 'info' | 'warn' | 'error', message: string, context?: any): void {
    const timestamp = new Date().toISOString();
    const config = this.configuration.getConfiguration();

    const logEntry = {
      timestamp,
      level,
      message,
      context,
      service: config.application.name,
      environment: config.application.environment
    };

    if (config.application.debug || level === 'error') {
      console.log(`[${level.toUpperCase()}] ${timestamp} - ${message}`, context || '');
    }

    // In production, send to external logging service
    if (config.application.environment === 'production') {
      // TODO: Implement external logging service integration
    }
  }

  public debug(message: string, context?: any): void {
    this.log('debug', message, context);
  }

  public info(message: string, context?: any): void {
    this.log('info', message, context);
  }

  public warn(message: string, context?: any): void {
    this.log('warn', message, context);
  }

  public error(message: string, context?: any): void {
    this.log('error', message, context);
  }
}

// Main container setup
export class ApplicationContainer {
  private container: Container;

  constructor() {
    this.container = new Container();
    this.setupBindings();
  }

  /**
   * Setup all service bindings
   */
  private setupBindings(): void {
    // Bind configuration factory as singleton
    this.container.bind<ConfigurationFactoryService>(TYPES.Configuration)
      .toConstantValue(configurationFactory)
      .inSingletonScope();

    // Bind database container
    this.container.bind<DatabaseContainer>(TYPES.Database)
      .to(DatabaseContainer)
      .inSingletonScope();

    // Bind logger service
    this.container.bind<LoggerService>(TYPES.Logger)
      .to(LoggerService)
      .inSingletonScope();

    // Dynamic database bindings
    this.container.bind<Sequelize>(TYPES.PlatformDatabase)
      .toDynamicValue((context) => {
        const dbContainer = context.container.get<DatabaseContainer>(TYPES.Database);
        return dbContainer.getConnection('platform');
      });

    this.container.bind<Sequelize>(TYPES.SharedDatabase)
      .toDynamicValue((context) => {
        const dbContainer = context.container.get<DatabaseContainer>(TYPES.Database);
        return dbContainer.getConnection('shared');
      });

    this.container.bind<Sequelize>(TYPES.LegacyDatabase)
      .toDynamicValue((context) => {
        const dbContainer = context.container.get<DatabaseContainer>(TYPES.Database);
        return dbContainer.getConnection('legacy');
      });

    // Bind factory for tenant databases
    this.container.bind<Sequelize>(TYPES.TenantDatabase)
      .toDynamicValue((context) => {
        const request = context.currentRequest;
        if (request && (request as any).tenantSlug) {
          const dbContainer = context.container.get<DatabaseContainer>(TYPES.Database);
          return dbContainer.getTenantConnection((request as any).tenantSlug);
        }
        throw new Error('Tenant context not available for database connection');
      });
  }

  /**
   * Get container instance
   */
  public getContainer(): Container {
    return this.container;
  }

  /**
   * Resolve service from container
   */
  public resolve<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): T {
    return this.container.get<T>(serviceIdentifier);
  }

  /**
   * Check if service is registered
   */
  public isBound<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): boolean {
    return this.container.isBound(serviceIdentifier);
  }

  /**
   * Rebind service (useful for testing)
   */
  public rebind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): interfaces.BindingToSyntax<T> {
    return this.container.rebind<T>(serviceIdentifier);
  }

  /**
   * Unbind service
   */
  public unbind<T>(serviceIdentifier: interfaces.ServiceIdentifier<T>): void {
    this.container.unbind(serviceIdentifier);
  }

  /**
   * Create child container for scoped operations
   */
  public createChildContainer(): Container {
    return this.container.createChild();
  }
}

// Export singleton instance
export const applicationContainer = new ApplicationContainer();
export default applicationContainer;