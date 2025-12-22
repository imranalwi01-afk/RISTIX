// packages/backend/src/core/application/cqrs/interfaces/ICommand.ts

/**
 * Base Command interface for CQRS pattern
 * All commands should implement this interface
 */

export interface ICommand {
  /**
   * Unique identifier for the command
   */
  readonly id: string;

  /**
   * Timestamp when the command was created
   */
  readonly createdAt: Date;

  /**
   * ID of the user who initiated the command
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
   * Command metadata
   */
  readonly metadata?: Record<string, any>;
}

/**
 * Base Command class that implements ICommand interface
 */
export abstract class BaseCommand implements ICommand {
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
   * Validate command data
   */
  abstract validate(): void;
}

/**
 * Command Result interface
 */
export interface ICommandResult<T = any> {
  /**
   * Indicates if the command was successful
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
   * Validation errors if any
   */
  validationErrors?: Array<{
    field: string;
    message: string;
    code: string;
  }>;

  /**
   * Timestamp when the command was processed
   */
  processedAt: Date;

  /**
   * Processing duration in milliseconds
   */
  processingTime?: number;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Command Bus interface for publishing commands
 */
export interface ICommandBus {
  /**
   * Publish a command for processing
   */
  publish<T extends ICommand>(command: T): Promise<ICommandResult>;

  /**
   * Publish multiple commands
   */
  publishBatch<T extends ICommand>(commands: T[]): Promise<ICommandResult[]>;

  /**
   * Subscribe to command results
   */
  subscribe<T extends ICommand>(
    commandType: string,
    handler: (result: ICommandResult) => void
  ): void;

  /**
   * Unsubscribe from command results
   */
  unsubscribe(subscriptionId: string): void;
}