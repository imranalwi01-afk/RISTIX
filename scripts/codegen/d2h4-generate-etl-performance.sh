#!/bin/bash
# scripts/codegen/d2h4-generate-etl-performance.sh
# Day 2 Hour 4: Generate ETL Performance Optimization & Error Recovery Systems

set -e
set -u

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h4-etl-performance-$(date +%Y%m%d-%H%M%S).log"

# Create logs directory if it doesn't exist
mkdir -p "${PROJECT_ROOT}/logs"

# Logging functions
log_info() {
    echo "[INFO] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

log_error() {
    echo "[ERROR] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}" >&2
}

log_success() {
    echo "[SUCCESS] $(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "${LOG_FILE}"
}

# Error handling
handle_error() {
    local exit_code=$?
    log_error "Script failed with exit code: ${exit_code}"
    log_error "Failed command: ${BASH_COMMAND}"
    exit ${exit_code}
}

trap handle_error ERR

# Generate Performance Optimization Engine
generate_performance_optimizer() {
    log_info "Generating ETL Performance Optimization Engine..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/performance"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/performance/performance.optimizer.ts" << 'EOF'
// packages/backend/src/core/services/etl/performance/performance.optimizer.ts

import { injectable } from 'inversify';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import { WorkflowDefinition, ETLFlowNode, PerformanceMetrics } from '../../../../types/etl.types';

export interface PerformanceProfile {
  workflowId: string;
  nodeId: string;
  avgExecutionTime: number;
  avgMemoryUsage: number;
  avgThroughput: number;
  errorRate: number;
  bottleneckScore: number;
  optimizationRecommendations: OptimizationRecommendation[];
}

export interface OptimizationRecommendation {
  type: 'parallelization' | 'caching' | 'indexing' | 'batching' | 'memory' | 'query' | 'configuration';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  expectedImprovement: string;
  implementation: string;
  estimatedEffort: 'minimal' | 'moderate' | 'significant';
}

export interface PerformanceOptimizationResult {
  originalMetrics: PerformanceMetrics;
  optimizedDefinition: WorkflowDefinition;
  expectedImprovements: { [key: string]: number };
  implementationPlan: ImplementationStep[];
  riskAssessment: RiskAssessment;
}

export interface ImplementationStep {
  order: number;
  description: string;
  category: string;
  effort: string;
  impact: string;
  dependencies: string[];
}

export interface RiskAssessment {
  level: 'low' | 'medium' | 'high';
  factors: string[];
  mitigations: string[];
}

@injectable()
export class PerformanceOptimizer {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async analyzeWorkflowPerformance(workflowId: string): Promise<PerformanceProfile[]> {
    try {
      this.logger.info(`Analyzing performance for workflow: ${workflowId}`);

      const executionHistory = await this.getExecutionHistory(workflowId);
      const nodeProfiles = await this.analyzeNodePerformance(workflowId, executionHistory);
      
      // Identify bottlenecks
      const bottlenecks = this.identifyBottlenecks(nodeProfiles);
      
      // Generate optimization recommendations
      const profilesWithRecommendations = await Promise.all(
        nodeProfiles.map(profile => this.generateOptimizationRecommendations(profile))
      );

      this.logger.info(`Performance analysis completed for workflow: ${workflowId}, found ${bottlenecks.length} bottlenecks`);

      return profilesWithRecommendations;
    } catch (error) {
      this.logger.error(`Failed to analyze workflow performance: ${error.message}`);
      throw new Error(`Failed to analyze workflow performance: ${error.message}`);
    }
  }

  async optimizeWorkflow(
    workflowId: string,
    definition: WorkflowDefinition
  ): Promise<PerformanceOptimizationResult> {
    try {
      this.logger.info(`Optimizing workflow: ${workflowId}`);

      const currentMetrics = await this.getCurrentPerformanceMetrics(workflowId);
      const profiles = await this.analyzeWorkflowPerformance(workflowId);
      
      const optimizedDefinition = await this.applyOptimizations(definition, profiles);
      const expectedImprovements = this.calculateExpectedImprovements(profiles);
      const implementationPlan = this.createImplementationPlan(profiles);
      const riskAssessment = this.assessOptimizationRisks(profiles, implementationPlan);

      const result: PerformanceOptimizationResult = {
        originalMetrics: currentMetrics,
        optimizedDefinition,
        expectedImprovements,
        implementationPlan,
        riskAssessment
      };

      // Store optimization results
      await this.storeOptimizationResults(workflowId, result);

      this.logger.info(`Workflow optimization completed: ${workflowId}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to optimize workflow: ${error.message}`);
      throw new Error(`Failed to optimize workflow: ${error.message}`);
    }
  }

  private async getExecutionHistory(workflowId: string, limit = 100): Promise<any[]> {
    const pool = await this.databaseService.getPool('platform_admin');
    
    const query = `
      SELECT 
        execution_id,
        start_time,
        end_time,
        status,
        metrics,
        error_details
      FROM etl_designer.execution_history
      WHERE workflow_id = $1
        AND status IN ('completed', 'failed')
      ORDER BY start_time DESC
      LIMIT $2
    `;

    const result = await pool.query(query, [workflowId, limit]);
    return result.rows;
  }

  private async analyzeNodePerformance(workflowId: string, executionHistory: any[]): Promise<PerformanceProfile[]> {
    const nodeMetrics = new Map<string, any>();

    // Aggregate metrics across executions
    executionHistory.forEach(execution => {
      if (execution.metrics && execution.metrics.nodeMetrics) {
        Object.entries(execution.metrics.nodeMetrics).forEach(([nodeId, metrics]: [string, any]) => {
          if (!nodeMetrics.has(nodeId)) {
            nodeMetrics.set(nodeId, {
              executions: [],
              totalExecutionTime: 0,
              totalMemoryUsage: 0,
              totalRecordsProcessed: 0,
              errorCount: 0
            });
          }

          const nodeData = nodeMetrics.get(nodeId);
          nodeData.executions.push(metrics);
          nodeData.totalExecutionTime += metrics.executionTime || 0;
          nodeData.totalMemoryUsage += metrics.memoryUsage || 0;
          nodeData.totalRecordsProcessed += metrics.recordsProcessed || 0;
          
          if (execution.status === 'failed') {
            nodeData.errorCount++;
          }
        });
      }
    });

    // Calculate performance profiles
    const profiles: PerformanceProfile[] = [];
    
    nodeMetrics.forEach((data, nodeId) => {
      const executionCount = data.executions.length;
      
      if (executionCount > 0) {
        const avgExecutionTime = data.totalExecutionTime / executionCount;
        const avgMemoryUsage = data.totalMemoryUsage / executionCount;
        const avgThroughput = data.totalRecordsProcessed / (data.totalExecutionTime / 1000); // records per second
        const errorRate = (data.errorCount / executionHistory.length) * 100;
        
        // Calculate bottleneck score (higher = more of a bottleneck)
        const bottleneckScore = this.calculateBottleneckScore(
          avgExecutionTime,
          avgMemoryUsage,
          errorRate,
          avgThroughput
        );

        profiles.push({
          workflowId,
          nodeId,
          avgExecutionTime,
          avgMemoryUsage,
          avgThroughput,
          errorRate,
          bottleneckScore,
          optimizationRecommendations: [] // Will be populated later
        });
      }
    });

    return profiles;
  }

  private calculateBottleneckScore(
    executionTime: number,
    memoryUsage: number,
    errorRate: number,
    throughput: number
  ): number {
    // Normalize metrics to 0-100 scale and weight them
    const timeScore = Math.min(executionTime / 10000, 100); // 10 seconds = 100
    const memoryScore = Math.min(memoryUsage / (1024 * 1024 * 1024), 100); // 1GB = 100
    const errorScore = Math.min(errorRate, 100);
    const throughputScore = Math.max(0, 100 - throughput); // Lower throughput = higher score

    // Weighted average
    return (timeScore * 0.3 + memoryScore * 0.2 + errorScore * 0.4 + throughputScore * 0.1);
  }

  private identifyBottlenecks(profiles: PerformanceProfile[]): PerformanceProfile[] {
    // Sort by bottleneck score (descending)
    const sorted = profiles.sort((a, b) => b.bottleneckScore - a.bottleneckScore);
    
    // Consider top 30% as bottlenecks, or any with score > 70
    const bottleneckThreshold = Math.max(70, sorted[Math.floor(sorted.length * 0.3)]?.bottleneckScore || 0);
    
    return sorted.filter(profile => profile.bottleneckScore >= bottleneckThreshold);
  }

  private async generateOptimizationRecommendations(profile: PerformanceProfile): Promise<PerformanceProfile> {
    const recommendations: OptimizationRecommendation[] = [];

    // High execution time recommendations
    if (profile.avgExecutionTime > 5000) { // 5 seconds
      recommendations.push({
        type: 'parallelization',
        priority: 'high',
        description: 'Consider parallelizing data processing to reduce execution time',
        expectedImprovement: '30-50% reduction in execution time',
        implementation: 'Configure parallel processing with multiple worker threads',
        estimatedEffort: 'moderate'
      });

      recommendations.push({
        type: 'batching',
        priority: 'medium',
        description: 'Optimize batch size for better throughput',
        expectedImprovement: '20-30% improvement in throughput',
        implementation: 'Adjust batch size configuration based on data volume',
        estimatedEffort: 'minimal'
      });
    }

    // High memory usage recommendations
    if (profile.avgMemoryUsage > 512 * 1024 * 1024) { // 512MB
      recommendations.push({
        type: 'memory',
        priority: 'high',
        description: 'Reduce memory usage through streaming processing',
        expectedImprovement: '40-60% reduction in memory usage',
        implementation: 'Implement streaming data processing instead of loading all data into memory',
        estimatedEffort: 'significant'
      });

      recommendations.push({
        type: 'caching',
        priority: 'medium',
        description: 'Implement intelligent caching strategy',
        expectedImprovement: '15-25% improvement in performance',
        implementation: 'Cache frequently accessed data and intermediate results',
        estimatedEffort: 'moderate'
      });
    }

    // High error rate recommendations
    if (profile.errorRate > 5) { // 5% error rate
      recommendations.push({
        type: 'configuration',
        priority: 'critical',
        description: 'Improve error handling and retry mechanisms',
        expectedImprovement: '70-90% reduction in error rate',
        implementation: 'Implement exponential backoff retry and better error handling',
        estimatedEffort: 'moderate'
      });
    }

    // Low throughput recommendations
    if (profile.avgThroughput < 100) { // 100 records per second
      recommendations.push({
        type: 'indexing',
        priority: 'medium',
        description: 'Optimize database queries and indexing',
        expectedImprovement: '2-5x improvement in throughput',
        implementation: 'Add appropriate database indexes and optimize SQL queries',
        estimatedEffort: 'moderate'
      });

      recommendations.push({
        type: 'query',
        priority: 'medium',
        description: 'Optimize data retrieval queries',
        expectedImprovement: '30-50% improvement in data loading speed',
        implementation: 'Use more efficient query patterns and reduce data transfer',
        estimatedEffort: 'moderate'
      });
    }

    return {
      ...profile,
      optimizationRecommendations: recommendations
    };
  }

  private async applyOptimizations(
    definition: WorkflowDefinition,
    profiles: PerformanceProfile[]
  ): Promise<WorkflowDefinition> {
    const optimizedDefinition = JSON.parse(JSON.stringify(definition)); // Deep clone

    // Apply automatic optimizations based on recommendations
    profiles.forEach(profile => {
      const node = optimizedDefinition.nodes.find((n: ETLFlowNode) => n.id === profile.nodeId);
      
      if (node) {
        // Apply batching optimization
        if (profile.optimizationRecommendations.some(r => r.type === 'batching')) {
          node.data.config.batchSize = this.calculateOptimalBatchSize(profile);
        }

        // Apply parallel processing
        if (profile.optimizationRecommendations.some(r => r.type === 'parallelization')) {
          node.data.config.parallelWorkers = this.calculateOptimalWorkerCount(profile);
        }

        // Apply memory optimization
        if (profile.optimizationRecommendations.some(r => r.type === 'memory')) {
          node.data.config.streaming = true;
          node.data.config.memoryLimit = '256MB';
        }

        // Apply retry configuration
        if (profile.optimizationRecommendations.some(r => r.type === 'configuration')) {
          node.data.config.retryAttempts = 3;
          node.data.config.retryDelay = 1000;
          node.data.config.backoffStrategy = 'exponential';
        }
      }
    });

    return optimizedDefinition;
  }

  private calculateOptimalBatchSize(profile: PerformanceProfile): number {
    // Calculate optimal batch size based on current performance
    const baseBatchSize = 1000;
    
    if (profile.avgMemoryUsage > 512 * 1024 * 1024) {
      return Math.max(100, baseBatchSize / 4); // Reduce for high memory usage
    } else if (profile.avgThroughput < 100) {
      return baseBatchSize * 2; // Increase for low throughput
    }
    
    return baseBatchSize;
  }

  private calculateOptimalWorkerCount(profile: PerformanceProfile): number {
    // Calculate optimal worker count based on performance characteristics
    const cpuCores = 4; // This would be detected from system
    
    if (profile.avgExecutionTime > 10000) {
      return Math.min(cpuCores, 4); // High execution time benefits from parallelization
    } else if (profile.avgMemoryUsage > 1024 * 1024 * 1024) {
      return 1; // High memory usage should avoid parallelization
    }
    
    return 2; // Default moderate parallelization
  }

  private calculateExpectedImprovements(profiles: PerformanceProfile[]): { [key: string]: number } {
    const improvements: { [key: string]: number } = {};

    profiles.forEach(profile => {
      profile.optimizationRecommendations.forEach(rec => {
        const improvement = this.parseImprovementPercentage(rec.expectedImprovement);
        
        switch (rec.type) {
          case 'parallelization':
            improvements.executionTime = (improvements.executionTime || 0) + improvement;
            break;
          case 'memory':
            improvements.memoryUsage = (improvements.memoryUsage || 0) + improvement;
            break;
          case 'configuration':
            improvements.errorRate = (improvements.errorRate || 0) + improvement;
            break;
          case 'indexing':
          case 'query':
            improvements.throughput = (improvements.throughput || 0) + improvement;
            break;
        }
      });
    });

    return improvements;
  }

  private parseImprovementPercentage(improvementText: string): number {
    const match = improvementText.match(/(\d+)-?(\d+)?%/);
    if (match) {
      const min = parseInt(match[1]);
      const max = match[2] ? parseInt(match[2]) : min;
      return (min + max) / 2; // Average of range
    }
    return 0;
  }

  private createImplementationPlan(profiles: PerformanceProfile[]): ImplementationStep[] {
    const steps: ImplementationStep[] = [];
    let order = 1;

    // Group recommendations by priority
    const criticalRecs = profiles.flatMap(p => p.optimizationRecommendations.filter(r => r.priority === 'critical'));
    const highRecs = profiles.flatMap(p => p.optimizationRecommendations.filter(r => r.priority === 'high'));
    const mediumRecs = profiles.flatMap(p => p.optimizationRecommendations.filter(r => r.priority === 'medium'));
    const lowRecs = profiles.flatMap(p => p.optimizationRecommendations.filter(r => r.priority === 'low'));

    // Add critical recommendations first
    criticalRecs.forEach(rec => {
      steps.push({
        order: order++,
        description: rec.description,
        category: rec.type,
        effort: rec.estimatedEffort,
        impact: rec.expectedImprovement,
        dependencies: []
      });
    });

    // Add high priority recommendations
    highRecs.forEach(rec => {
      steps.push({
        order: order++,
        description: rec.description,
        category: rec.type,
        effort: rec.estimatedEffort,
        impact: rec.expectedImprovement,
        dependencies: criticalRecs.length > 0 ? ['Complete critical optimizations'] : []
      });
    });

    // Add medium and low priority recommendations
    [...mediumRecs, ...lowRecs].forEach(rec => {
      steps.push({
        order: order++,
        description: rec.description,
        category: rec.type,
        effort: rec.estimatedEffort,
        impact: rec.expectedImprovement,
        dependencies: highRecs.length > 0 ? ['Complete high priority optimizations'] : []
      });
    });

    return steps;
  }

  private assessOptimizationRisks(
    profiles: PerformanceProfile[],
    implementationPlan: ImplementationStep[]
  ): RiskAssessment {
    const riskFactors: string[] = [];
    const mitigations: string[] = [];

    // Assess parallelization risks
    const hasParallelization = implementationPlan.some(step => step.category === 'parallelization');
    if (hasParallelization) {
      riskFactors.push('Parallelization may introduce race conditions or data consistency issues');
      mitigations.push('Thoroughly test with representative data volumes');
      mitigations.push('Implement proper synchronization mechanisms');
    }

    // Assess memory optimization risks
    const hasMemoryOptimization = implementationPlan.some(step => step.category === 'memory');
    if (hasMemoryOptimization) {
      riskFactors.push('Streaming processing may affect data quality checks');
      mitigations.push('Implement incremental data quality validation');
    }

    // Assess significant effort changes
    const hasSignificantChanges = implementationPlan.some(step => step.effort === 'significant');
    if (hasSignificantChanges) {
      riskFactors.push('Significant architectural changes may introduce new bugs');
      mitigations.push('Implement comprehensive regression testing');
      mitigations.push('Consider phased rollout approach');
    }

    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high';
    if (riskFactors.length === 0) {
      riskLevel = 'low';
    } else if (riskFactors.length <= 2) {
      riskLevel = 'medium';
    } else {
      riskLevel = 'high';
    }

    return {
      level: riskLevel,
      factors: riskFactors,
      mitigations: mitigations
    };
  }

  private async getCurrentPerformanceMetrics(workflowId: string): Promise<PerformanceMetrics> {
    // Get the latest execution metrics
    const pool = await this.databaseService.getPool('platform_admin');
    
    const query = `
      SELECT metrics
      FROM etl_designer.execution_history
      WHERE workflow_id = $1
        AND status = 'completed'
        AND metrics IS NOT NULL
      ORDER BY start_time DESC
      LIMIT 1
    `;

    const result = await pool.query(query, [workflowId]);
    
    if (result.rows.length > 0) {
      return result.rows[0].metrics;
    }

    // Return default metrics if no history available
    return {
      executionTime: 0,
      memoryUsage: 0,
      recordsProcessed: 0,
      throughput: 0
    };
  }

  private async storeOptimizationResults(
    workflowId: string,
    result: PerformanceOptimizationResult
  ): Promise<void> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        INSERT INTO etl_designer.optimization_results (
          workflow_id, optimization_timestamp, original_metrics,
          expected_improvements, implementation_plan, risk_assessment
        )
        VALUES ($1, NOW(), $2, $3, $4, $5)
      `;

      await pool.query(query, [
        workflowId,
        JSON.stringify(result.originalMetrics),
        JSON.stringify(result.expectedImprovements),
        JSON.stringify(result.implementationPlan),
        JSON.stringify(result.riskAssessment)
      ]);

    } catch (error) {
      this.logger.error(`Failed to store optimization results: ${error.message}`);
      // Don't throw as this is not critical for operation
    }
  }

  async getOptimizationHistory(workflowId: string, limit = 10): Promise<PerformanceOptimizationResult[]> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        SELECT 
          original_metrics,
          expected_improvements,
          implementation_plan,
          risk_assessment,
          optimization_timestamp
        FROM etl_designer.optimization_results
        WHERE workflow_id = $1
        ORDER BY optimization_timestamp DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [workflowId, limit]);
      
      return result.rows.map(row => ({
        originalMetrics: row.original_metrics,
        optimizedDefinition: {}, // Not stored
        expectedImprovements: row.expected_improvements,
        implementationPlan: row.implementation_plan,
        riskAssessment: row.risk_assessment
      }));
    } catch (error) {
      this.logger.error(`Failed to get optimization history: ${error.message}`);
      return [];
    }
  }
}
EOF

    log_success "Performance Optimization Engine generated"
}

# Generate Error Recovery & Replay System
generate_error_recovery_system() {
    log_info "Generating Error Recovery & Replay System..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/recovery"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/recovery/recovery.manager.ts" << 'EOF'
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
EOF

    log_success "Error Recovery & Replay System generated"
}

# Generate ETL API Controllers
generate_etl_controllers() {
    log_info "Generating ETL API Controllers..."
    
    cat > "${PROJECT_ROOT}/packages/backend/src/api/controllers/etl/workflow.controller.ts" << 'EOF'
// packages/backend/src/api/controllers/etl/workflow.controller.ts

import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { ETLWorkflowService } from '../../../core/services/etl/workflow.service';
import { DataQualityEngine } from '../../../core/services/etl/quality/quality.engine';
import { DataLineageTracker } from '../../../core/services/etl/lineage/lineage.tracker';
import { PerformanceOptimizer } from '../../../core/services/etl/performance/performance.optimizer';
import { ErrorRecoveryManager } from '../../../core/services/etl/recovery/recovery.manager';
import { LoggerService } from '../../../utils/logger.service';

@injectable()
export class ETLWorkflowController {
  constructor(
    @inject(ETLWorkflowService) private workflowService: ETLWorkflowService,
    @inject(DataQualityEngine) private qualityEngine: DataQualityEngine,
    @inject(DataLineageTracker) private lineageTracker: DataLineageTracker,
    @inject(PerformanceOptimizer) private performanceOptimizer: PerformanceOptimizer,
    @inject(ErrorRecoveryManager) private recoveryManager: ErrorRecoveryManager,
    @inject(LoggerService) private logger: LoggerService
  ) {}

  async createWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, workflowDefinition } = req.body;
      const tenantId = req.tenant?.id;
      const userId = req.user?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const workflow = await this.workflowService.createWorkflow(
        tenantId,
        name,
        description,
        workflowDefinition,
        userId
      );

      res.status(201).json({
        success: true,
        data: workflow
      });
    } catch (error) {
      this.logger.error(`Failed to create workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_CREATE_FAILED'
      });
    }
  }

  async getWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const workflow = await this.workflowService.getWorkflow(id, tenantId);

      if (!workflow) {
        res.status(404).json({
          success: false,
          error: 'Workflow not found',
          code: 'WORKFLOW_NOT_FOUND'
        });
        return;
      }

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      this.logger.error(`Failed to get workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_GET_FAILED'
      });
    }
  }

  async updateWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const workflow = await this.workflowService.updateWorkflow(id, tenantId, updates);

      res.json({
        success: true,
        data: workflow
      });
    } catch (error) {
      this.logger.error(`Failed to update workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_UPDATE_FAILED'
      });
    }
  }

  async deleteWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      await this.workflowService.deleteWorkflow(id, tenantId);

      res.json({
        success: true,
        message: 'Workflow deleted successfully'
      });
    } catch (error) {
      this.logger.error(`Failed to delete workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_DELETE_FAILED'
      });
    }
  }

  async executeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const executionId = await this.workflowService.executeWorkflow(id, tenantId);

      res.json({
        success: true,
        data: { executionId },
        message: 'Workflow execution started'
      });
    } catch (error) {
      this.logger.error(`Failed to execute workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_EXECUTE_FAILED'
      });
    }
  }

  async getExecutionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { limit = 50, offset = 0 } = req.query;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          error: 'Tenant context required',
          code: 'TENANT_CONTEXT_REQUIRED'
        });
        return;
      }

      const history = await this.workflowService.getExecutionHistory(
        id,
        tenantId,
        Number(limit),
        Number(offset)
      );

      res.json({
        success: true,
        data: history
      });
    } catch (error) {
      this.logger.error(`Failed to get execution history: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'EXECUTION_HISTORY_FAILED'
      });
    }
  }

  async analyzePerformance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const profiles = await this.performanceOptimizer.analyzeWorkflowPerformance(id);

      res.json({
        success: true,
        data: profiles
      });
    } catch (error) {
      this.logger.error(`Failed to analyze performance: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'PERFORMANCE_ANALYSIS_FAILED'
      });
    }
  }

  async optimizeWorkflow(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { workflowDefinition } = req.body;

      const result = await this.performanceOptimizer.optimizeWorkflow(id, workflowDefinition);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      this.logger.error(`Failed to optimize workflow: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'WORKFLOW_OPTIMIZATION_FAILED'
      });
    }
  }

  async getLineage(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const lineage = await this.lineageTracker.getLineageGraph(id);

      res.json({
        success: true,
        data: lineage
      });
    } catch (error) {
      this.logger.error(`Failed to get lineage: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'LINEAGE_GET_FAILED'
      });
    }
  }

  async analyzeImpact(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { nodeId } = req.query;

      if (!nodeId) {
        res.status(400).json({
          success: false,
          error: 'Node ID is required',
          code: 'NODE_ID_REQUIRED'
        });
        return;
      }

      const impact = await this.lineageTracker.analyzeImpact(id, String(nodeId));

      res.json({
        success: true,
        data: impact
      });
    } catch (error) {
      this.logger.error(`Failed to analyze impact: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'IMPACT_ANALYSIS_FAILED'
      });
    }
  }

  async validateDataQuality(req: Request, res: Response): Promise<void> {
    try {
      const { data, rules } = req.body;

      const report = await this.qualityEngine.validateData(data, rules);

      res.json({
        success: true,
        data: report
      });
    } catch (error) {
      this.logger.error(`Failed to validate data quality: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'DATA_QUALITY_VALIDATION_FAILED'
      });
    }
  }

  async createCheckpoint(req: Request, res: Response): Promise<void> {
    try {
      const { executionId, nodeId, state, processedRecords, lastProcessedId } = req.body;

      const checkpoint = await this.recoveryManager.createCheckpoint(
        executionId,
        nodeId,
        state,
        processedRecords,
        lastProcessedId
      );

      res.status(201).json({
        success: true,
        data: checkpoint
      });
    } catch (error) {
      this.logger.error(`Failed to create checkpoint: ${error.message}`);
      res.status(500).json({
        success: false,
        error: error.message,
        code: 'CHECKPOINT_CREATE_FAILED'
      });
    }
  }

  async handleError(req: Request, res: Response): Promise<void> {
    try {
      const { executionId, nodeId, error, context } = req.body;

      const result = await this.recoveryManager.handleExecutionError(
        executionId,
        nodeId,
        error,
        context
      );

      res.json({
        success: true,
        data: result
      });
    } catch (recoveryError) {
      this.logger.error(`Failed to handle error: ${recoveryError.message}`);
      res.status(500).json({
        success: false,
        error: recoveryError.message,
        code: 'ERROR_HANDLING_FAILED'
      });
    }
  }
}
EOF

    log_success "ETL API Controllers generated"
}

# Main execution function
main() {
    log_info "🚀 Starting Day 2 Hour 4: ETL Performance & Error Recovery Generation"
    log_info "=========================================================================="
    
    # Generate performance and recovery components
    generate_performance_optimizer
    generate_error_recovery_system
    generate_etl_controllers
    
    log_success "=========================================================================="
    log_success "✅ Day 2 Hour 4: ETL Performance & Error Recovery Generation Completed!"
    log_success "=========================================================================="
    log_info "Generated Components:"
    log_info "1. ✅ Performance Optimization Engine with Bottleneck Analysis"
    log_info "2. ✅ Error Recovery & Replay System with Smart Strategies"
    log_info "3. ✅ ETL API Controllers with Complete Workflow Management"
    log_info ""
    log_info "🔗 Next: Run ./scripts/setup/d2h4-finalize-etl-setup.sh"
}

# Execute main function
main "$@"