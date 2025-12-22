// packages/backend/src/core/services/etl/recovery/recovery.manager.ts

import { injectable } from 'inversify';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import { ExecutionHistory, ErrorDetails } from '../../../../types/etl.types';

export interface RecoveryStrategy {
  type: 'retry' | 'skip' | 'manual' | 'rollback' | 'alternative_path';
  maxAttempts?: number;
  backoffStrategy?: 'linear' | 'exponential' | 'fixed';
  initialDelay?: number;
  maxDelay?: number;
  skipOnErrors?: string[];
  rollbackSteps?: string[];
  alternativePath?: string[];
}

export interface RecoveryContext {
  executionId: string;
  workflowId: string;
  nodeId: string;
  attemptNumber: number;
  originalError: ErrorDetails;
  recoveryStrategy: RecoveryStrategy;
  checkpoint?: RecoveryCheckpoint;
}

export interface RecoveryCheckpoint {
  id: string;
  executionId: string;
  nodeId: string;
  timestamp: Date;
  state: any;
  processedRecords: number;
  lastProcessedId?: string;
}

export interface RecoveryResult {
  success: boolean;
  strategy: string;
  attempts: number;
  finalError?: ErrorDetails;
  recoveredData?: any;
  skipCount?: number;
  rollbackActions?: string[];
}

export interface RecoveryAnalysis {
  errorPattern: string;
  frequency: number;
  suggestedStrategy: RecoveryStrategy;
  confidence: number;
  historicalSuccessRate: number;
}

@injectable()
export class ErrorRecoveryManager {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async handleExecutionError(
    executionId: string,
    nodeId: string,
    error: ErrorDetails,
    context?: any
  ): Promise<RecoveryResult> {
    try {
      this.logger.info(`Handling execution error for ${executionId}:${nodeId}: ${error.message}`);

      // Analyze error and determine recovery strategy
      const analysis = await this.analyzeError(error, nodeId);
      const strategy = analysis.suggestedStrategy;

      // Create recovery context
      const recoveryContext: RecoveryContext = {
        executionId,
        workflowId: context?.workflowId || '',
        nodeId,
        attemptNumber: 1,
        originalError: error,
        recoveryStrategy: strategy,
        checkpoint: await this.getLatestCheckpoint(executionId, nodeId)
      };

      // Execute recovery
      const result = await this.executeRecovery(recoveryContext);

      // Log recovery attempt
      await this.logRecoveryAttempt(recoveryContext, result);

      this.logger.info(`Recovery ${result.success ? 'successful' : 'failed'} for ${executionId}:${nodeId}`);

      return result;
    } catch (recoveryError) {
      this.logger.error(`Recovery handling failed: ${recoveryError.message}`);
      return {
        success: false,
        strategy: 'failed',
        attempts: 1,
        finalError: {
          code: 'RECOVERY_FAILED',
          message: recoveryError.message,
          context: { originalError: error }
        }
      };
    }
  }

  private async analyzeError(error: ErrorDetails, nodeId: string): Promise<RecoveryAnalysis> {
    // Get historical error patterns for this node
    const historicalErrors = await this.getHistoricalErrors(nodeId, 50);
    
    // Classify error type
    const errorPattern = this.classifyError(error);
    
    // Calculate frequency of similar errors
    const similarErrors = historicalErrors.filter(e => 
      this.classifyError(e.error_details) === errorPattern
    );
    const frequency = similarErrors.length;

    // Analyze recovery success rates for similar errors
    const recoveryAttempts = await this.getRecoveryHistory(nodeId, errorPattern);
    const successfulRecoveries = recoveryAttempts.filter(r => r.success);
    const successRate = recoveryAttempts.length > 0 ? 
      (successfulRecoveries.length / recoveryAttempts.length) * 100 : 0;

    // Determine suggested strategy based on error pattern
    const suggestedStrategy = this.determineBestStrategy(errorPattern, successRate, frequency);
    
    // Calculate confidence in suggestion
    const confidence = this.calculateConfidence(frequency, successRate, recoveryAttempts.length);

    return {
      errorPattern,
      frequency,
      suggestedStrategy,
      confidence,
      historicalSuccessRate: successRate
    };
  }

  private classifyError(error: ErrorDetails): string {
    const message = error.message.toLowerCase();
    const code = error.code?.toLowerCase() || '';

    // Network/Connection errors
    if (message.includes('connection') || message.includes('timeout') || 
        message.includes('network') || code.includes('econnreset')) {
      return 'network_error';
    }

    // Database errors
    if (message.includes('deadlock') || message.includes('lock timeout') ||
        code.includes('db_') || message.includes('constraint')) {
      return 'database_error';
    }

    // Memory errors
    if (message.includes('out of memory') || message.includes('heap') ||
        message.includes('allocation failed')) {
      return 'memory_error';
    }

    // Permission errors
    if (message.includes('permission') || message.includes('access denied') ||
        message.includes('unauthorized') || code.includes('auth')) {
      return 'permission_error';
    }

    // Data validation errors
    if (message.includes('validation') || message.includes('invalid data') ||
        message.includes('constraint violation') || message.includes('format')) {
      return 'data_validation_error';
    }

    // Rate limiting errors
    if (message.includes('rate limit') || message.includes('too many requests') ||
        code.includes('429')) {
      return 'rate_limit_error';
    }

    // Resource unavailable
    if (message.includes('resource unavailable') || message.includes('service unavailable') ||
        code.includes('503') || code.includes('502')) {
      return 'resource_unavailable';
    }

    return 'unknown_error';
  }

  private determineBestStrategy(
    errorPattern: string,
    successRate: number,
    frequency: number
  ): RecoveryStrategy {
    switch (errorPattern) {
      case 'network_error':
      case 'database_error':
      case 'resource_unavailable':
        return {
          type: 'retry',
          maxAttempts: 3,
          backoffStrategy: 'exponential',
          initialDelay: 1000,
          maxDelay: 30000
        };

      case 'rate_limit_error':
        return {
          type: 'retry',
          maxAttempts: 5,
          backoffStrategy: 'exponential',
          initialDelay: 5000,
          maxDelay: 120000
        };

      case 'memory_error':
        return {
          type: 'alternative_path',
          alternativePath: ['reduce_batch_size', 'enable_streaming']
        };

      case 'data_validation_error':
        return {
          type: 'skip',
          skipOnErrors: ['validation_failed', 'invalid_format']
        };

      case 'permission_error':
        return {
          type: 'manual',
          maxAttempts: 1
        };

      default:
        // For unknown errors, use retry with conservative settings
        return {
          type: 'retry',
          maxAttempts: 2,
          backoffStrategy: 'linear',
          initialDelay: 2000,
          maxDelay: 10000
        };
    }
  }

  private calculateConfidence(frequency: number, successRate: number, totalAttempts: number): number {
    // Base confidence on historical data availability and success rate
    let confidence = 0;

    // Historical data factor (0-40 points)
    if (totalAttempts >= 10) {
      confidence += 40;
    } else if (totalAttempts >= 5) {
      confidence += 25;
    } else if (totalAttempts >= 2) {
      confidence += 15;
    }

    // Success rate factor (0-40 points)
    confidence += (successRate / 100) * 40;

    // Frequency factor (0-20 points) - more frequent errors give better insight
    if (frequency >= 10) {
      confidence += 20;
    } else if (frequency >= 5) {
      confidence += 15;
    } else if (frequency >= 2) {
      confidence += 10;
    }

    return Math.min(100, confidence);
  }

  private async executeRecovery(context: RecoveryContext): Promise<RecoveryResult> {
    const { recoveryStrategy } = context;

    switch (recoveryStrategy.type) {
      case 'retry':
        return await this.executeRetryStrategy(context);
      
      case 'skip':
        return await this.executeSkipStrategy(context);
      
      case 'rollback':
        return await this.executeRollbackStrategy(context);
      
      case 'alternative_path':
        return await this.executeAlternativePathStrategy(context);
      
      case 'manual':
        return await this.executeManualStrategy(context);
      
      default:
        throw new Error(`Unknown recovery strategy: ${recoveryStrategy.type}`);
    }
  }

  private async executeRetryStrategy(context: RecoveryContext): Promise<RecoveryResult> {
    const { recoveryStrategy, executionId, nodeId } = context;
    const maxAttempts = recoveryStrategy.maxAttempts || 3;
    
    let currentAttempt = context.attemptNumber;
    let lastError = context.originalError;

    while (currentAttempt <= maxAttempts) {
      this.logger.info(`Retry attempt ${currentAttempt}/${maxAttempts} for ${executionId}:${nodeId}`);

      // Calculate delay based on strategy
      const delay = this.calculateRetryDelay(
        currentAttempt,
        recoveryStrategy.backoffStrategy || 'exponential',
        recoveryStrategy.initialDelay || 1000,
        recoveryStrategy.maxDelay || 30000
      );

      // Wait before retry
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      try {
        // Attempt to resume execution from checkpoint
        const resumeResult = await this.resumeFromCheckpoint(context);
        
        if (resumeResult.success) {
          return {
            success: true,
            strategy: 'retry',
            attempts: currentAttempt,
            recoveredData: resumeResult.data
          };
        }

        lastError = resumeResult.error || lastError;
      } catch (error) {
        lastError = {
          code: 'RETRY_FAILED',
          message: error.message,
          context: { attempt: currentAttempt }
        };
      }

      currentAttempt++;
    }

    return {
      success: false,
      strategy: 'retry',
      attempts: maxAttempts,
      finalError: lastError
    };
  }

  private async executeSkipStrategy(context: RecoveryContext): Promise<RecoveryResult> {
    const { executionId, nodeId, recoveryStrategy } = context;
    
    this.logger.info(`Executing skip strategy for ${executionId}:${nodeId}`);

    try {
      // Identify and skip problematic records
      const skipResult = await this.skipProblematicRecords(context);
      
      return {
        success: true,
        strategy: 'skip',
        attempts: 1,
        skipCount: skipResult.skippedCount,
        recoveredData: skipResult.processedData
      };
    } catch (error) {
      return {
        success: false,
        strategy: 'skip',
        attempts: 1,
        finalError: {
          code: 'SKIP_FAILED',
          message: error.message
        }
      };
    }
  }

  private async executeRollbackStrategy(context: RecoveryContext): Promise<RecoveryResult> {
    const { executionId, nodeId, recoveryStrategy } = context;
    
    this.logger.info(`Executing rollback strategy for ${executionId}:${nodeId}`);

    try {
      const rollbackActions = recoveryStrategy.rollbackSteps || [];
      const executedActions: string[] = [];

      for (const action of rollbackActions) {
        await this.executeRollbackAction(action, context);
        executedActions.push(action);
      }

      return {
        success: true,
        strategy: 'rollback',
        attempts: 1,
        rollbackActions: executedActions
      };
    } catch (error) {
      return {
        success: false,
        strategy: 'rollback',
        attempts: 1,
        finalError: {
          code: 'ROLLBACK_FAILED',
          message: error.message
        }
      };
    }
  }

  private async executeAlternativePathStrategy(context: RecoveryContext): Promise<RecoveryResult> {
    const { executionId, nodeId, recoveryStrategy } = context;
    
    this.logger.info(`Executing alternative path strategy for ${executionId}:${nodeId}`);

    try {
      const alternativePath = recoveryStrategy.alternativePath || [];
      
      for (const pathStep of alternativePath) {
        const result = await this.executeAlternativeStep(pathStep, context);
        if (result.success) {
          return {
            success: true,
            strategy: 'alternative_path',
            attempts: 1,
            recoveredData: result.data
          };
        }
      }

      return {
        success: false,
        strategy: 'alternative_path',
        attempts: 1,
        finalError: {
          code: 'NO_ALTERNATIVE_PATH',
          message: 'All alternative paths failed'
        }
      };
    } catch (error) {
      return {
        success: false,
        strategy: 'alternative_path',
        attempts: 1,
        finalError: {
          code: 'ALTERNATIVE_PATH_FAILED',
          message: error.message
        }
      };
    }
  }

  private async executeManualStrategy(context: RecoveryContext): Promise<RecoveryResult> {
    const { executionId, nodeId } = context;
    
    this.logger.info(`Manual intervention required for ${executionId}:${nodeId}`);

    // Create manual intervention record
    await this.createManualInterventionTicket(context);

    return {
      success: false,
      strategy: 'manual',
      attempts: 1,
      finalError: {
        code: 'MANUAL_INTERVENTION_REQUIRED',
        message: 'Error requires manual intervention - ticket created'
      }
    };
  }

  private calculateRetryDelay(
    attempt: number,
    strategy: string,
    initialDelay: number,
    maxDelay: number
  ): number {
    let delay: number;

    switch (strategy) {
      case 'exponential':
        delay = initialDelay * Math.pow(2, attempt - 1);
        break;
      case 'linear':
        delay = initialDelay * attempt;
        break;
      case 'fixed':
        delay = initialDelay;
        break;
      default:
        delay = initialDelay;
    }

    return Math.min(delay, maxDelay);
  }

  async createCheckpoint(
    executionId: string,
    nodeId: string,
    state: any,
    processedRecords: number,
    lastProcessedId?: string
  ): Promise<RecoveryCheckpoint> {
    const checkpoint: RecoveryCheckpoint = {
      id: `${executionId}-${nodeId}-${Date.now()}`,
      executionId,
      nodeId,
      timestamp: new Date(),
      state,
      processedRecords,
      lastProcessedId
    };

    // Store checkpoint
    await this.storeCheckpoint(checkpoint);

    return checkpoint;
  }

  private async getLatestCheckpoint(executionId: string, nodeId: string): Promise<RecoveryCheckpoint | undefined> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        SELECT *
        FROM etl_designer.recovery_checkpoints
        WHERE execution_id = $1 AND node_id = $2
        ORDER BY timestamp DESC
        LIMIT 1
      `;

      const result = await pool.query(query, [executionId, nodeId]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          executionId: row.execution_id,
          nodeId: row.node_id,
          timestamp: row.timestamp,
          state: row.state,
          processedRecords: row.processed_records,
          lastProcessedId: row.last_processed_id
        };
      }

      return undefined;
    } catch (error) {
      this.logger.error(`Failed to get latest checkpoint: ${error.message}`);
      return undefined;
    }
  }

  private async storeCheckpoint(checkpoint: RecoveryCheckpoint): Promise<void> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        INSERT INTO etl_designer.recovery_checkpoints (
          id, execution_id, node_id, timestamp, state, 
          processed_records, last_processed_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `;

      await pool.query(query, [
        checkpoint.id,
        checkpoint.executionId,
        checkpoint.nodeId,
        checkpoint.timestamp,
        JSON.stringify(checkpoint.state),
        checkpoint.processedRecords,
        checkpoint.lastProcessedId
      ]);

    } catch (error) {
      this.logger.error(`Failed to store checkpoint: ${error.message}`);
      // Don't throw as this is not critical for execution
    }
  }

  private async getHistoricalErrors(nodeId: string, limit: number): Promise<any[]> {
    const pool = await this.databaseService.getPool('platform_admin');
    
    const query = `
      SELECT error_details, start_time
      FROM etl_designer.execution_history
      WHERE status = 'failed'
        AND error_details IS NOT NULL
        AND execution_log::text ILIKE '%' || $1 || '%'
      ORDER BY start_time DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [nodeId, limit]);
    return result.rows;
  }

  private async getRecoveryHistory(nodeId: string, errorPattern: string): Promise<any[]> {
    const pool = await this.databaseService.getPool('platform_admin');
    
    const query = `
      SELECT *
      FROM etl_designer.recovery_attempts
      WHERE node_id = $1
        AND error_pattern = $2
      ORDER BY attempt_timestamp DESC
      LIMIT 20
    `;

    const result = await pool.query(query, [nodeId, errorPattern]);
    return result.rows;
  }

  private async logRecoveryAttempt(context: RecoveryContext, result: RecoveryResult): Promise<void> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        INSERT INTO etl_designer.recovery_attempts (
          execution_id, node_id, error_pattern, recovery_strategy,
          success, attempts, error_details, attempt_timestamp
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      `;

      const errorPattern = this.classifyError(context.originalError);

      await pool.query(query, [
        context.executionId,
        context.nodeId,
        errorPattern,
        JSON.stringify(context.recoveryStrategy),
        result.success,
        result.attempts,
        JSON.stringify(result.finalError)
      ]);

    } catch (error) {
      this.logger.error(`Failed to log recovery attempt: ${error.message}`);
    }
  }

  // Placeholder implementations for complex recovery operations
  private async resumeFromCheckpoint(context: RecoveryContext): Promise<{ success: boolean; data?: any; error?: ErrorDetails }> {
    // Implementation would resume execution from the last checkpoint
    return { success: false, error: context.originalError };
  }

  private async skipProblematicRecords(context: RecoveryContext): Promise<{ skippedCount: number; processedData: any }> {
    // Implementation would identify and skip problematic records
    return { skippedCount: 0, processedData: {} };
  }

  private async executeRollbackAction(action: string, context: RecoveryContext): Promise<void> {
    // Implementation would execute specific rollback actions
    this.logger.info(`Executing rollback action: ${action}`);
  }

  private async executeAlternativeStep(step: string, context: RecoveryContext): Promise<{ success: boolean; data?: any }> {
    // Implementation would execute alternative processing steps
    return { success: false };
  }

  private async createManualInterventionTicket(context: RecoveryContext): Promise<void> {
    // Implementation would create a ticket for manual intervention
    this.logger.info(`Manual intervention ticket created for ${context.executionId}:${context.nodeId}`);
  }
}
