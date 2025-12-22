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
