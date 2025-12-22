// packages/backend/src/core/application/cqrs/interfaces/IQuery.ts

/**
 * Base Query interface for CQRS pattern
 * All queries should implement this interface
 */

export interface IQuery {
  /**
   * Unique identifier for the query
   */
  readonly id: string;

  /**
   * Timestamp when the query was created
   */
  readonly createdAt: Date;

  /**
   * ID of the user who initiated the query
   */
  readonly userId: string;

  /**
   * Tenant ID for multi-tenancy
   */
  readonly tenantId?: string;

  /**
   * Correlation ID for tracking across distributed systems
   */
  readonly correlationId?: string;

  /**
   * Query metadata
   */
  readonly metadata?: Record<string, any>;
}

/**
 * Base Query class that implements IQuery interface
 */
export abstract class BaseQuery implements IQuery {
  public readonly id: string;
  public readonly createdAt: Date;
  public readonly userId: string;
  public readonly tenantId?: string;
  public readonly correlationId?: string;
  public readonly metadata?: Record<string, any>;

  constructor(options?: {
    userId?: string;
    tenantId?: string;
    correlationId?: string;
    metadata?: Record<string, any>;
  }) {
    this.id = require('uuid').v4();
    this.createdAt = new Date();
    this.userId = options?.userId || 'system';
    this.tenantId = options?.tenantId;
    this.correlationId = options?.correlationId;
    this.metadata = options?.metadata;
  }

  /**
   * Validate query parameters
   */
  abstract validate(): void;
}

/**
 * Query Result interface
 */
export interface IQueryResult<T = any> {
  /**
   * Indicates if the query was successful
   */
  success: boolean;

  /**
   * Result data if successful
   */
  data?: T;

  /**
   * Error message if unsuccessful
   */
  error?: string;

  /**
   * Pagination information if applicable
   */
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  /**
   * Query execution metrics
   */
  metrics?: {
    executionTime: number;
    cacheHit: boolean;
    databaseHits: number;
    memoryUsage: number;
  };

  /**
   * Timestamp when the query was processed
   */
  processedAt: Date;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Query Bus interface for handling queries
 */
export interface IQueryBus {
  /**
   * Execute a query
   */
  execute<T extends IQuery, R>(query: T): Promise<IQueryResult<R>>;

  /**
   * Execute multiple queries in parallel
   */
  executeBatch<T extends IQuery, R>(queries: T[]): Promise<IQueryResult<R>[]>;

  /**
   * Subscribe to query results
   */
  subscribe<T extends IQuery, R>(
    queryType: string,
    handler: (result: IQueryResult<R>) => void
  ): string;

  /**
   * Unsubscribe from query results
   */
  unsubscribe(subscriptionId: string): void;

  /**
   * Clear all subscriptions
   */
  clear(): void;
}

/**
 * Query Cache interface for performance optimization
 */
export interface IQueryCache {
  /**
   * Get cached query result
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Set cached query result
   */
  set<T>(key: string, result: T, ttl?: number): Promise<void>;

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): Promise<void>;

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;

  /**
   * Get cache statistics
   */
  getStats(): Promise<{
    totalEntries: number;
    hitCount: number;
    missCount: number;
    hitRate: number;
  }>;
}

/**
 * Query Validation interface
 */
export interface IQueryValidator {
  /**
   * Validate query parameters
   */
  validate<T extends IQuery>(query: T): {
    isValid: boolean;
    errors: Array<{
      field: string;
      message: string;
      code: string;
    }>;
    warnings?: Array<{
      field: string;
      message: string;
      code: string;
    }>;
  };
}

/**
 * Query Performance Monitor interface
 */
export interface IQueryPerformanceMonitor {
  /**
   * Record query execution metrics
   */
  record(queryId: string, metrics: {
    executionTime: number;
    cacheHit: boolean;
    databaseHits: number;
    memoryUsage: number;
  }): Promise<void>;

  /**
   * Get performance statistics
   */
  getStats(): Promise<{
    totalQueries: number;
    averageExecutionTime: number;
    cacheHitRate: number;
    slowQueries: Array<{
      queryId: string;
      executionTime: number;
      queryType: string;
    }>;
  }>;

  /**
   * Get slow query threshold
   */
  getSlowQueryThreshold(): number;

  /**
   * Set slow query threshold
   */
  setSlowQueryThreshold(threshold: number): void;
}