#!/bin/bash
# scripts/codegen/d2h4-generate-etl-data-quality.sh
# Day 2 Hour 4: Generate ETL Data Quality Engine and Lineage Tracking

set -e
set -u

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
LOG_FILE="${PROJECT_ROOT}/logs/d2h4-etl-quality-$(date +%Y%m%d-%H%M%S).log"

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

# Generate Data Quality Engine
generate_data_quality_engine() {
    log_info "Generating ETL Data Quality Engine..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/quality"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/quality/quality.engine.ts" << 'EOF'
// packages/backend/src/core/services/etl/quality/quality.engine.ts

import { injectable } from 'inversify';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import { QualityRule, QualityRuleDefinition, QualitySeverity } from '../../../../types/etl.types';

export interface QualityCheckResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  score: number;
  errorCount: number;
  warningCount: number;
  totalRecords: number;
  details: QualityIssue[];
  executionTime: number;
}

export interface QualityIssue {
  recordId?: string;
  field: string;
  value: any;
  issue: string;
  severity: QualitySeverity;
  suggestion?: string;
}

export interface QualityReport {
  workflowId: string;
  nodeId: string;
  timestamp: Date;
  overallScore: number;
  totalRecords: number;
  passedRules: number;
  failedRules: number;
  rules: QualityCheckResult[];
  recommendations: string[];
}

@injectable()
export class DataQualityEngine {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async validateData(data: any[], rules: QualityRule[]): Promise<QualityReport> {
    const startTime = Date.now();
    
    try {
      this.logger.info(`Starting data quality validation with ${rules.length} rules for ${data.length} records`);

      const ruleResults: QualityCheckResult[] = [];
      
      for (const rule of rules) {
        const result = await this.executeQualityRule(data, rule);
        ruleResults.push(result);
      }

      const report = this.generateQualityReport(data.length, ruleResults);
      
      // Store quality report in database
      await this.storeQualityReport(report);
      
      const executionTime = Date.now() - startTime;
      this.logger.info(`Data quality validation completed in ${executionTime}ms, overall score: ${report.overallScore}`);

      return report;
      
    } catch (error) {
      this.logger.error(`Data quality validation failed: ${error.message}`);
      throw new Error(`Data quality validation failed: ${error.message}`);
    }
  }

  private async executeQualityRule(data: any[], rule: QualityRule): Promise<QualityCheckResult> {
    const startTime = Date.now();
    const issues: QualityIssue[] = [];
    let passedRecords = 0;

    try {
      for (const [index, record] of data.entries()) {
        const ruleResult = this.checkRecord(record, rule, index);
        
        if (ruleResult.passed) {
          passedRecords++;
        } else {
          issues.push(...ruleResult.issues);
        }
      }

      const score = data.length > 0 ? (passedRecords / data.length) * 100 : 100;
      const errorCount = issues.filter(i => i.severity === 'error' || i.severity === 'critical').length;
      const warningCount = issues.filter(i => i.severity === 'warning').length;

      return {
        ruleId: rule.id,
        ruleName: rule.name,
        passed: score >= (rule.ruleDefinition.threshold || 95),
        score,
        errorCount,
        warningCount,
        totalRecords: data.length,
        details: issues,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      this.logger.error(`Failed to execute quality rule ${rule.name}: ${error.message}`);
      
      return {
        ruleId: rule.id,
        ruleName: rule.name,
        passed: false,
        score: 0,
        errorCount: data.length,
        warningCount: 0,
        totalRecords: data.length,
        details: [{
          field: 'general',
          value: null,
          issue: `Rule execution failed: ${error.message}`,
          severity: 'critical'
        }],
        executionTime: Date.now() - startTime
      };
    }
  }

  private checkRecord(record: any, rule: QualityRule, recordIndex: number): { passed: boolean; issues: QualityIssue[] } {
    const issues: QualityIssue[] = [];
    const { ruleType, ruleDefinition } = rule;

    switch (ruleType) {
      case 'completeness':
        return this.checkCompleteness(record, ruleDefinition, recordIndex);
      
      case 'uniqueness':
        return this.checkUniqueness(record, ruleDefinition, recordIndex);
      
      case 'validity':
        return this.checkValidity(record, ruleDefinition, recordIndex);
      
      case 'consistency':
        return this.checkConsistency(record, ruleDefinition, recordIndex);
      
      case 'accuracy':
        return this.checkAccuracy(record, ruleDefinition, recordIndex);
      
      case 'timeliness':
        return this.checkTimeliness(record, ruleDefinition, recordIndex);
      
      default:
        issues.push({
          recordId: recordIndex.toString(),
          field: 'rule',
          value: ruleType,
          issue: `Unknown rule type: ${ruleType}`,
          severity: 'error'
        });
        return { passed: false, issues };
    }
  }

  private checkCompleteness(record: any, definition: QualityRuleDefinition, recordIndex: number): { passed: boolean; issues: QualityIssue[] } {
    const issues: QualityIssue[] = [];
    const { targetField, condition } = definition;

    if (targetField) {
      const value = record[targetField];
      
      if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
        issues.push({
          recordId: recordIndex.toString(),
          field: targetField,
          value,
          issue: `Field ${targetField} is empty or null`,
          severity: 'error',
          suggestion: `Provide a value for ${targetField}`
        });
      }
    } else if (condition) {
      // Custom completeness condition
      try {
        const isComplete = this.evaluateCondition(record, condition);
        if (!isComplete) {
          issues.push({
            recordId: recordIndex.toString(),
            field: 'record',
            value: record,
            issue: `Completeness condition failed: ${condition}`,
            severity: 'warning'
          });
        }
      } catch (error) {
        issues.push({
          recordId: recordIndex.toString(),
          field: 'condition',
          value: condition,
          issue: `Failed to evaluate condition: ${error.message}`,
          severity: 'error'
        });
      }
    }

    return { passed: issues.length === 0, issues };
  }

  private checkUniqueness(record: any, definition: QualityRuleDefinition, recordIndex: number): { passed: boolean; issues: QualityIssue[] } {
    const issues: QualityIssue[] = [];
    
    // Note: True uniqueness checking requires comparing across all records
    // This is a simplified version that checks for obvious duplicates
    const { targetField } = definition;
    
    if (targetField) {
      const value = record[targetField];
      
      // Check for duplicate values within the same record (if it's an array)
      if (Array.isArray(value)) {
        const uniqueValues = new Set(value);
        if (uniqueValues.size !== value.length) {
          issues.push({
            recordId: recordIndex.toString(),
            field: targetField,
            value,
            issue: `Duplicate values found in array field ${targetField}`,
            severity: 'warning',
            suggestion: `Remove duplicate values from ${targetField}`
          });
        }
      }
    }

    return { passed: issues.length === 0, issues };
  }

  private checkValidity(record: any, definition: QualityRuleDefinition, recordIndex: number): { passed: boolean; issues: QualityIssue[] } {
    const issues: QualityIssue[] = [];
    const { targetField, condition } = definition;

    if (targetField && condition) {
      const value = record[targetField];
      
      try {
        const isValid = this.evaluateValidityCondition(value, condition);
        
        if (!isValid) {
          issues.push({
            recordId: recordIndex.toString(),
            field: targetField,
            value,
            issue: `Value does not meet validity condition: ${condition}`,
            severity: 'error',
            suggestion: this.generateValiditySuggestion(condition, value)
          });
        }
      } catch (error) {
        issues.push({
          recordId: recordIndex.toString(),
          field: targetField,
          value,
          issue: `Failed to validate: ${error.message}`,
          severity: 'error'
        });
      }
    }

    return { passed: issues.length === 0, issues };
  }

  private checkConsistency(record: any, definition: QualityRuleDefinition, recordIndex: number): { passed: boolean; issues: QualityIssue[] } {
    const issues: QualityIssue[] = [];
    const { condition } = definition;

    if (condition) {
      try {
        const isConsistent = this.evaluateCondition(record, condition);
        
        if (!isConsistent) {
          issues.push({
            recordId: recordIndex.toString(),
            field: 'record',
            value: record,
            issue: `Record fails consistency check: ${condition}`,
            severity: 'warning',
            suggestion: 'Review related fields for consistency'
          });
        }
      } catch (error) {
        issues.push({
          recordId: recordIndex.toString(),
          field: 'condition',
          value: condition,
          issue: `Failed to evaluate consistency: ${error.message}`,
          severity: 'error'
        });
      }
    }

    return { passed: issues.length === 0, issues };
  }

  private checkAccuracy(record: any, definition: QualityRuleDefinition, recordIndex: number): { passed: boolean; issues: QualityIssue[] } {
    const issues: QualityIssue[] = [];
    const { targetField, condition } = definition;

    // Accuracy checking often requires external reference data
    // This is a simplified implementation
    if (targetField && condition) {
      const value = record[targetField];
      
      try {
        const isAccurate = this.evaluateCondition({ [targetField]: value }, condition);
        
        if (!isAccurate) {
          issues.push({
            recordId: recordIndex.toString(),
            field: targetField,
            value,
            issue: `Value may be inaccurate based on condition: ${condition}`,
            severity: 'warning',
            suggestion: 'Verify value accuracy against authoritative source'
          });
        }
      } catch (error) {
        issues.push({
          recordId: recordIndex.toString(),
          field: targetField,
          value,
          issue: `Failed to check accuracy: ${error.message}`,
          severity: 'error'
        });
      }
    }

    return { passed: issues.length === 0, issues };
  }

  private checkTimeliness(record: any, definition: QualityRuleDefinition, recordIndex: number): { passed: boolean; issues: QualityIssue[] } {
    const issues: QualityIssue[] = [];
    const { targetField, condition } = definition;

    if (targetField) {
      const value = record[targetField];
      
      try {
        const dateValue = new Date(value);
        
        if (isNaN(dateValue.getTime())) {
          issues.push({
            recordId: recordIndex.toString(),
            field: targetField,
            value,
            issue: `Invalid date format in ${targetField}`,
            severity: 'error',
            suggestion: 'Use valid date format (YYYY-MM-DD)'
          });
        } else if (condition) {
          // Check if date meets timeliness condition
          const isTimely = this.evaluateTimelinessCondition(dateValue, condition);
          
          if (!isTimely) {
            issues.push({
              recordId: recordIndex.toString(),
              field: targetField,
              value,
              issue: `Date does not meet timeliness requirement: ${condition}`,
              severity: 'warning',
              suggestion: 'Update with more recent data'
            });
          }
        }
      } catch (error) {
        issues.push({
          recordId: recordIndex.toString(),
          field: targetField,
          value,
          issue: `Failed to check timeliness: ${error.message}`,
          severity: 'error'
        });
      }
    }

    return { passed: issues.length === 0, issues };
  }

  private evaluateCondition(record: any, condition: string): boolean {
    try {
      // Simple condition evaluator
      // In production, use a more robust expression evaluator
      let expression = condition;
      
      // Replace field references with actual values
      Object.keys(record).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        expression = expression.replace(regex, JSON.stringify(record[key]));
      });

      return Function(`"use strict"; return (${expression})`)();
    } catch (error) {
      this.logger.warn(`Failed to evaluate condition: ${condition}, error: ${error.message}`);
      return false;
    }
  }

  private evaluateValidityCondition(value: any, condition: string): boolean {
    try {
      // Common validity patterns
      if (condition.startsWith('regex:')) {
        const pattern = condition.substring(6);
        const regex = new RegExp(pattern);
        return regex.test(String(value));
      }
      
      if (condition.startsWith('range:')) {
        const [min, max] = condition.substring(6).split(',').map(Number);
        const numValue = Number(value);
        return !isNaN(numValue) && numValue >= min && numValue <= max;
      }
      
      if (condition.startsWith('length:')) {
        const [min, max] = condition.substring(7).split(',').map(Number);
        const length = String(value).length;
        return length >= min && length <= max;
      }
      
      if (condition.startsWith('enum:')) {
        const allowedValues = condition.substring(5).split(',').map(s => s.trim());
        return allowedValues.includes(String(value));
      }

      // Fallback to general condition evaluation
      return this.evaluateCondition({ value }, condition.replace(/value/g, 'value'));
    } catch (error) {
      this.logger.warn(`Failed to evaluate validity condition: ${condition}, error: ${error.message}`);
      return false;
    }
  }

  private evaluateTimelinessCondition(dateValue: Date, condition: string): boolean {
    try {
      const now = new Date();
      
      if (condition.includes('days_ago')) {
        const daysMatch = condition.match(/(\d+)\s*days_ago/);
        if (daysMatch) {
          const days = parseInt(daysMatch[1]);
          const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
          return dateValue >= threshold;
        }
      }
      
      if (condition.includes('future')) {
        return dateValue > now;
      }
      
      if (condition.includes('past')) {
        return dateValue < now;
      }

      // Fallback to general condition evaluation
      const daysDiff = Math.floor((now.getTime() - dateValue.getTime()) / (1000 * 60 * 60 * 24));
      return this.evaluateCondition({ days_ago: daysDiff, date: dateValue }, condition);
    } catch (error) {
      this.logger.warn(`Failed to evaluate timeliness condition: ${condition}, error: ${error.message}`);
      return false;
    }
  }

  private generateValiditySuggestion(condition: string, value: any): string {
    if (condition.startsWith('regex:')) {
      return `Value should match pattern: ${condition.substring(6)}`;
    }
    
    if (condition.startsWith('range:')) {
      const [min, max] = condition.substring(6).split(',');
      return `Value should be between ${min} and ${max}`;
    }
    
    if (condition.startsWith('length:')) {
      const [min, max] = condition.substring(7).split(',');
      return `Text length should be between ${min} and ${max} characters`;
    }
    
    if (condition.startsWith('enum:')) {
      const allowedValues = condition.substring(5);
      return `Value should be one of: ${allowedValues}`;
    }

    return `Value should satisfy: ${condition}`;
  }

  private generateQualityReport(totalRecords: number, ruleResults: QualityCheckResult[]): QualityReport {
    const passedRules = ruleResults.filter(r => r.passed).length;
    const failedRules = ruleResults.length - passedRules;
    
    // Calculate overall score as weighted average
    const overallScore = ruleResults.length > 0 
      ? ruleResults.reduce((sum, rule) => sum + rule.score, 0) / ruleResults.length 
      : 100;

    // Generate recommendations based on failed rules
    const recommendations = this.generateRecommendations(ruleResults.filter(r => !r.passed));

    return {
      workflowId: '', // Will be set by caller
      nodeId: '', // Will be set by caller
      timestamp: new Date(),
      overallScore: Math.round(overallScore),
      totalRecords,
      passedRules,
      failedRules,
      rules: ruleResults,
      recommendations
    };
  }

  private generateRecommendations(failedRules: QualityCheckResult[]): string[] {
    const recommendations: string[] = [];

    failedRules.forEach(rule => {
      if (rule.errorCount > 0) {
        recommendations.push(`Address ${rule.errorCount} errors in rule "${rule.ruleName}"`);
      }
      
      if (rule.score < 50) {
        recommendations.push(`Rule "${rule.ruleName}" has very low quality score (${rule.score}%) - requires immediate attention`);
      } else if (rule.score < 80) {
        recommendations.push(`Rule "${rule.ruleName}" has moderate quality issues (${rule.score}%) - consider data cleansing`);
      }
    });

    // Generic recommendations
    if (failedRules.length > 0) {
      recommendations.push('Review data source quality and implement upstream validation');
      recommendations.push('Consider adding data cleansing transformations before quality checks');
    }

    return recommendations;
  }

  private async storeQualityReport(report: QualityReport): Promise<void> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        INSERT INTO etl_designer.quality_reports (
          workflow_id, node_id, timestamp, overall_score, 
          total_records, passed_rules, failed_rules, 
          report_data
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;

      await pool.query(query, [
        report.workflowId,
        report.nodeId,
        report.timestamp,
        report.overallScore,
        report.totalRecords,
        report.passedRules,
        report.failedRules,
        JSON.stringify(report)
      ]);

    } catch (error) {
      this.logger.error(`Failed to store quality report: ${error.message}`);
      // Don't throw error as this is not critical for workflow execution
    }
  }

  async getQualityHistory(workflowId: string, nodeId?: string, limit = 50): Promise<QualityReport[]> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      let query = `
        SELECT report_data
        FROM etl_designer.quality_reports
        WHERE workflow_id = $1
      `;
      
      const params: any[] = [workflowId];
      
      if (nodeId) {
        query += ' AND node_id = $2';
        params.push(nodeId);
        query += ' ORDER BY timestamp DESC LIMIT $3';
        params.push(limit);
      } else {
        query += ' ORDER BY timestamp DESC LIMIT $2';
        params.push(limit);
      }

      const result = await pool.query(query, params);
      
      return result.rows.map(row => row.report_data);
    } catch (error) {
      this.logger.error(`Failed to get quality history: ${error.message}`);
      return [];
    }
  }
}
EOF

    log_success "Data Quality Engine generated"
}

# Generate Data Lineage Tracker
generate_data_lineage_tracker() {
    log_info "Generating Data Lineage Tracker..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/lineage"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/lineage/lineage.tracker.ts" << 'EOF'
// packages/backend/src/core/services/etl/lineage/lineage.tracker.ts

import { injectable } from 'inversify';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import { WorkflowDefinition, DataLineage, LineageMetadata } from '../../../../types/etl.types';

export interface LineageNode {
  id: string;
  type: 'source' | 'transformation' | 'target';
  name: string;
  description?: string;
  metadata: any;
  level: number;
}

export interface LineageEdge {
  id: string;
  source: string;
  target: string;
  transformationType: string;
  metadata: any;
}

export interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  levels: number;
  paths: LineagePath[];
}

export interface LineagePath {
  id: string;
  source: string;
  target: string;
  nodes: string[];
  transformations: string[];
  hops: number;
}

export interface FieldLineage {
  field: string;
  source: string;
  transformations: FieldTransformation[];
  dependencies: string[];
}

export interface FieldTransformation {
  nodeId: string;
  transformationType: string;
  expression?: string;
  description?: string;
}

export interface ImpactAnalysis {
  affectedNodes: string[];
  affectedFields: string[];
  downstreamWorkflows: string[];
  estimatedRecords: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

@injectable()
export class DataLineageTracker {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async trackWorkflowLineage(workflowId: string, definition: WorkflowDefinition): Promise<void> {
    try {
      this.logger.info(`Tracking data lineage for workflow: ${workflowId}`);

      // Build lineage graph from workflow definition
      const lineageGraph = this.buildLineageGraph(definition);
      
      // Store lineage information
      await this.storeLineageGraph(workflowId, lineageGraph);
      
      // Track field-level lineage
      await this.trackFieldLineage(workflowId, definition);
      
      this.logger.info(`Data lineage tracking completed for workflow: ${workflowId}`);
      
    } catch (error) {
      this.logger.error(`Failed to track workflow lineage: ${error.message}`);
      throw new Error(`Failed to track workflow lineage: ${error.message}`);
    }
  }

  async updateWorkflowLineage(workflowId: string, definition: WorkflowDefinition): Promise<void> {
    try {
      this.logger.info(`Updating data lineage for workflow: ${workflowId}`);

      // Remove existing lineage
      await this.removeWorkflowLineage(workflowId);
      
      // Track new lineage
      await this.trackWorkflowLineage(workflowId, definition);
      
      this.logger.info(`Data lineage updated for workflow: ${workflowId}`);
      
    } catch (error) {
      this.logger.error(`Failed to update workflow lineage: ${error.message}`);
      throw new Error(`Failed to update workflow lineage: ${error.message}`);
    }
  }

  private buildLineageGraph(definition: WorkflowDefinition): LineageGraph {
    const nodes: LineageNode[] = [];
    const edges: LineageEdge[] = [];
    const levels = new Map<string, number>();

    // Calculate node levels using topological sort
    this.calculateNodeLevels(definition.nodes, definition.connections, levels);

    // Create lineage nodes
    definition.nodes.forEach(node => {
      const lineageNode: LineageNode = {
        id: node.id,
        type: this.getLineageNodeType(node.type),
        name: node.data.label,
        description: node.data.metadata?.description,
        metadata: {
          nodeType: node.type,
          config: node.data.config,
          position: node.position
        },
        level: levels.get(node.id) || 0
      };
      nodes.push(lineageNode);
    });

    // Create lineage edges
    definition.connections.forEach(connection => {
      const sourceNode = definition.nodes.find(n => n.id === connection.source);
      const targetNode = definition.nodes.find(n => n.id === connection.target);
      
      if (sourceNode && targetNode) {
        const lineageEdge: LineageEdge = {
          id: `${connection.source}-${connection.target}`,
          source: connection.source,
          target: connection.target,
          transformationType: this.getTransformationType(sourceNode.type, targetNode.type),
          metadata: {
            sourceType: sourceNode.type,
            targetType: targetNode.type,
            dataFlow: connection.data || {}
          }
        };
        edges.push(lineageEdge);
      }
    });

    // Generate lineage paths
    const paths = this.generateLineagePaths(nodes, edges);

    return {
      nodes,
      edges,
      levels: Math.max(...Array.from(levels.values()), 0) + 1,
      paths
    };
  }

  private calculateNodeLevels(
    nodes: any[], 
    connections: any[], 
    levels: Map<string, number>
  ): void {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Initialize graph
    nodes.forEach(node => {
      graph.set(node.id, []);
      inDegree.set(node.id, 0);
    });

    // Build adjacency list and calculate in-degrees
    connections.forEach(conn => {
      graph.get(conn.source)?.push(conn.target);
      inDegree.set(conn.target, (inDegree.get(conn.target) || 0) + 1);
    });

    // Topological sort with level calculation
    const queue: string[] = [];
    
    // Find nodes with no incoming edges (level 0)
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) {
        levels.set(nodeId, 0);
        queue.push(nodeId);
      }
    });

    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      const currentLevel = levels.get(nodeId) || 0;
      
      // Process all neighbors
      graph.get(nodeId)?.forEach(neighbor => {
        const newInDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newInDegree);
        
        if (newInDegree === 0) {
          levels.set(neighbor, currentLevel + 1);
          queue.push(neighbor);
        }
      });
    }
  }

  private getLineageNodeType(nodeType: string): 'source' | 'transformation' | 'target' {
    switch (nodeType) {
      case 'source':
        return 'source';
      case 'output':
        return 'target';
      default:
        return 'transformation';
    }
  }

  private getTransformationType(sourceType: string, targetType: string): string {
    if (sourceType === 'source') {
      return 'extraction';
    } else if (targetType === 'output') {
      return 'loading';
    } else {
      return 'transformation';
    }
  }

  private generateLineagePaths(nodes: LineageNode[], edges: LineageEdge[]): LineagePath[] {
    const paths: LineagePath[] = [];
    const sourceNodes = nodes.filter(n => n.type === 'source');
    const targetNodes = nodes.filter(n => n.type === 'target');

    // Build adjacency list
    const graph = new Map<string, string[]>();
    nodes.forEach(node => graph.set(node.id, []));
    edges.forEach(edge => {
      graph.get(edge.source)?.push(edge.target);
    });

    // Find all paths from sources to targets
    sourceNodes.forEach(source => {
      targetNodes.forEach(target => {
        const pathNodes = this.findPath(graph, source.id, target.id);
        if (pathNodes.length > 0) {
          const transformations = pathNodes
            .slice(1, -1) // Exclude source and target
            .map(nodeId => nodes.find(n => n.id === nodeId)?.type || 'unknown');

          paths.push({
            id: `${source.id}-${target.id}`,
            source: source.id,
            target: target.id,
            nodes: pathNodes,
            transformations,
            hops: pathNodes.length - 1
          });
        }
      });
    });

    return paths;
  }

  private findPath(graph: Map<string, string[]>, start: string, end: string): string[] {
    const visited = new Set<string>();
    const path: string[] = [];

    const dfs = (current: string): boolean => {
      if (current === end) {
        path.push(current);
        return true;
      }

      if (visited.has(current)) {
        return false;
      }

      visited.add(current);
      path.push(current);

      const neighbors = graph.get(current) || [];
      for (const neighbor of neighbors) {
        if (dfs(neighbor)) {
          return true;
        }
      }

      path.pop();
      return false;
    };

    if (dfs(start)) {
      return path;
    }

    return [];
  }

  private async storeLineageGraph(workflowId: string, graph: LineageGraph): Promise<void> {
    const pool = await this.databaseService.getPool('platform_admin');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Store each lineage entry
      for (const path of graph.paths) {
        for (let i = 0; i < path.nodes.length - 1; i++) {
          const sourceEntity = path.nodes[i];
          const targetEntity = path.nodes[i + 1];
          const transformationType = path.transformations[i] || 'direct';

          const query = `
            INSERT INTO etl_designer.data_lineage (
              workflow_id, source_entity, target_entity, 
              transformation_type, lineage_metadata
            )
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (workflow_id, source_entity, target_entity) 
            DO UPDATE SET 
              transformation_type = EXCLUDED.transformation_type,
              lineage_metadata = EXCLUDED.lineage_metadata
          `;

          const metadata: LineageMetadata = {
            transformationDetails: `${sourceEntity} -> ${targetEntity}`,
            impactRadius: [targetEntity],
            dependencies: [sourceEntity],
            lastUpdated: new Date()
          };

          await client.query(query, [
            workflowId,
            sourceEntity,
            targetEntity,
            transformationType,
            JSON.stringify(metadata)
          ]);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async trackFieldLineage(workflowId: string, definition: WorkflowDefinition): Promise<void> {
    // This would track field-level lineage through transformations
    // Implementation depends on detailed transformation analysis
    this.logger.info(`Field-level lineage tracking for workflow ${workflowId} - placeholder implementation`);
  }

  async getLineageGraph(workflowId: string): Promise<LineageGraph> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        SELECT 
          source_entity,
          target_entity,
          transformation_type,
          lineage_metadata
        FROM etl_designer.data_lineage
        WHERE workflow_id = $1
        ORDER BY source_entity, target_entity
      `;

      const result = await pool.query(query, [workflowId]);
      
      return this.reconstructLineageGraph(result.rows);
    } catch (error) {
      this.logger.error(`Failed to get lineage graph: ${error.message}`);
      throw new Error(`Failed to get lineage graph: ${error.message}`);
    }
  }

  private reconstructLineageGraph(lineageRows: any[]): LineageGraph {
    const nodeMap = new Map<string, LineageNode>();
    const edges: LineageEdge[] = [];

    // Extract nodes and edges from lineage data
    lineageRows.forEach(row => {
      const { source_entity, target_entity, transformation_type, lineage_metadata } = row;
      const metadata = lineage_metadata;

      // Add source node
      if (!nodeMap.has(source_entity)) {
        nodeMap.set(source_entity, {
          id: source_entity,
          type: 'source', // This would be determined more accurately
          name: source_entity,
          metadata: {},
          level: 0 // This would be calculated
        });
      }

      // Add target node
      if (!nodeMap.has(target_entity)) {
        nodeMap.set(target_entity, {
          id: target_entity,
          type: 'transformation', // This would be determined more accurately
          name: target_entity,
          metadata: {},
          level: 1 // This would be calculated
        });
      }

      // Add edge
      edges.push({
        id: `${source_entity}-${target_entity}`,
        source: source_entity,
        target: target_entity,
        transformationType: transformation_type,
        metadata
      });
    });

    const nodes = Array.from(nodeMap.values());
    const paths = this.generateLineagePaths(nodes, edges);

    return {
      nodes,
      edges,
      levels: Math.max(...nodes.map(n => n.level), 0) + 1,
      paths
    };
  }

  async analyzeImpact(workflowId: string, nodeId: string): Promise<ImpactAnalysis> {
    try {
      this.logger.info(`Analyzing impact for node ${nodeId} in workflow ${workflowId}`);

      const lineageGraph = await this.getLineageGraph(workflowId);
      const affectedNodes = this.findDownstreamNodes(lineageGraph, nodeId);
      const affectedFields = await this.findAffectedFields(workflowId, nodeId);
      const downstreamWorkflows = await this.findDownstreamWorkflows(nodeId);

      const riskLevel = this.calculateRiskLevel(affectedNodes.length, affectedFields.length, downstreamWorkflows.length);
      const recommendations = this.generateImpactRecommendations(affectedNodes, downstreamWorkflows, riskLevel);

      return {
        affectedNodes,
        affectedFields,
        downstreamWorkflows,
        estimatedRecords: await this.estimateAffectedRecords(affectedNodes),
        riskLevel,
        recommendations
      };
    } catch (error) {
      this.logger.error(`Failed to analyze impact: ${error.message}`);
      throw new Error(`Failed to analyze impact: ${error.message}`);
    }
  }

  private findDownstreamNodes(graph: LineageGraph, nodeId: string): string[] {
    const downstream: string[] = [];
    const visited = new Set<string>();
    
    const dfs = (currentNodeId: string) => {
      if (visited.has(currentNodeId)) return;
      visited.add(currentNodeId);
      
      const outgoingEdges = graph.edges.filter(e => e.source === currentNodeId);
      outgoingEdges.forEach(edge => {
        downstream.push(edge.target);
        dfs(edge.target);
      });
    };

    dfs(nodeId);
    return [...new Set(downstream)]; // Remove duplicates
  }

  private async findAffectedFields(workflowId: string, nodeId: string): Promise<string[]> {
    // This would analyze field-level dependencies
    // Placeholder implementation
    return [];
  }

  private async findDownstreamWorkflows(nodeId: string): Promise<string[]> {
    // This would find other workflows that depend on this node's output
    // Placeholder implementation
    return [];
  }

  private calculateRiskLevel(nodeCount: number, fieldCount: number, workflowCount: number): 'low' | 'medium' | 'high' | 'critical' {
    const totalImpact = nodeCount + fieldCount + (workflowCount * 2);
    
    if (totalImpact === 0) return 'low';
    if (totalImpact <= 5) return 'low';
    if (totalImpact <= 15) return 'medium';
    if (totalImpact <= 30) return 'high';
    return 'critical';
  }

  private generateImpactRecommendations(
    affectedNodes: string[], 
    downstreamWorkflows: string[], 
    riskLevel: string
  ): string[] {
    const recommendations: string[] = [];

    if (riskLevel === 'critical') {
      recommendations.push('CRITICAL: Schedule maintenance window due to high impact');
      recommendations.push('Notify all downstream system owners before making changes');
    }

    if (affectedNodes.length > 10) {
      recommendations.push(`High impact: ${affectedNodes.length} nodes will be affected`);
      recommendations.push('Consider phased rollout to minimize disruption');
    }

    if (downstreamWorkflows.length > 0) {
      recommendations.push(`${downstreamWorkflows.length} downstream workflows depend on this node`);
      recommendations.push('Coordinate with downstream workflow owners');
    }

    recommendations.push('Test changes in development environment first');
    recommendations.push('Monitor data quality metrics after changes');

    return recommendations;
  }

  private async estimateAffectedRecords(affectedNodes: string[]): Promise<number> {
    // This would estimate the number of records affected
    // Based on historical execution data
    return affectedNodes.length * 1000; // Placeholder
  }

  private async removeWorkflowLineage(workflowId: string): Promise<void> {
    const pool = await this.databaseService.getPool('platform_admin');
    
    const query = `
      DELETE FROM etl_designer.data_lineage
      WHERE workflow_id = $1
    `;

    await pool.query(query, [workflowId]);
  }
}
EOF

    log_success "Data Lineage Tracker generated"
}

# Generate Schema Evolution Handler
generate_schema_evolution_handler() {
    log_info "Generating Schema Evolution Handler..."
    
    mkdir -p "${PROJECT_ROOT}/packages/backend/src/core/services/etl/schema"
    
    cat > "${PROJECT_ROOT}/packages/backend/src/core/services/etl/schema/evolution.handler.ts" << 'EOF'
// packages/backend/src/core/services/etl/schema/evolution.handler.ts

import { injectable } from 'inversify';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import { SchemaDefinition, SchemaChange, ImpactAnalysis, MigrationStrategy } from '../../../../types/etl.types';

export interface SchemaEvolutionResult {
  hasChanges: boolean;
  changes: SchemaChange[];
  impactAnalysis: ImpactAnalysis;
  migrationStrategy: MigrationStrategy;
  autoMigratable: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface SchemaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

@injectable()
export class SchemaEvolutionHandler {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async detectSchemaChanges(
    dataSourceId: string,
    newSchema: SchemaDefinition,
    previousSchema?: SchemaDefinition
  ): Promise<SchemaEvolutionResult> {
    try {
      this.logger.info(`Detecting schema changes for data source: ${dataSourceId}`);

      if (!previousSchema) {
        previousSchema = await this.getCurrentSchema(dataSourceId);
      }

      if (!previousSchema) {
        return this.createInitialSchemaResult(newSchema);
      }

      const changes = this.compareSchemas(previousSchema, newSchema);
      const impactAnalysis = await this.analyzeSchemaImpact(dataSourceId, changes);
      const migrationStrategy = this.generateMigrationStrategy(changes, impactAnalysis);
      const riskLevel = this.assessRiskLevel(changes, impactAnalysis);
      const autoMigratable = this.isAutoMigratable(changes, riskLevel);

      const result: SchemaEvolutionResult = {
        hasChanges: changes.length > 0,
        changes,
        impactAnalysis,
        migrationStrategy,
        autoMigratable,
        riskLevel
      };

      // Store schema evolution record
      await this.storeSchemaEvolution(dataSourceId, previousSchema, newSchema, result);

      this.logger.info(`Schema change detection completed: ${changes.length} changes found, risk level: ${riskLevel}`);

      return result;
    } catch (error) {
      this.logger.error(`Failed to detect schema changes: ${error.message}`);
      throw new Error(`Failed to detect schema changes: ${error.message}`);
    }
  }

  private compareSchemas(oldSchema: SchemaDefinition, newSchema: SchemaDefinition): SchemaChange[] {
    const changes: SchemaChange[] = [];
    const oldFields = new Map(oldSchema.fields.map(f => [f.name, f]));
    const newFields = new Map(newSchema.fields.map(f => [f.name, f]));

    // Detect added fields
    newFields.forEach((field, fieldName) => {
      if (!oldFields.has(fieldName)) {
        changes.push({
          type: 'add',
          field: fieldName,
          newValue: field,
          impact: field.nullable ? 'non-breaking' : 'warning'
        });
      }
    });

    // Detect removed fields
    oldFields.forEach((field, fieldName) => {
      if (!newFields.has(fieldName)) {
        changes.push({
          type: 'remove',
          field: fieldName,
          oldValue: field,
          impact: 'breaking'
        });
      }
    });

    // Detect modified fields
    oldFields.forEach((oldField, fieldName) => {
      const newField = newFields.get(fieldName);
      if (newField) {
        const fieldChanges = this.compareFields(oldField, newField, fieldName);
        changes.push(...fieldChanges);
      }
    });

    // Detect constraint changes
    const constraintChanges = this.compareConstraints(oldSchema.constraints, newSchema.constraints);
    changes.push(...constraintChanges);

    return changes;
  }

  private compareFields(oldField: any, newField: any, fieldName: string): SchemaChange[] {
    const changes: SchemaChange[] = [];

    // Type changes
    if (oldField.type !== newField.type) {
      const impact = this.assessTypeChangeImpact(oldField.type, newField.type);
      changes.push({
        type: 'modify',
        field: `${fieldName}.type`,
        oldValue: oldField.type,
        newValue: newField.type,
        impact
      });
    }

    // Nullable changes
    if (oldField.nullable !== newField.nullable) {
      const impact = newField.nullable ? 'non-breaking' : 'breaking';
      changes.push({
        type: 'modify',
        field: `${fieldName}.nullable`,
        oldValue: oldField.nullable,
        newValue: newField.nullable,
        impact
      });
    }

    // Primary key changes
    if (oldField.primaryKey !== newField.primaryKey) {
      changes.push({
        type: 'modify',
        field: `${fieldName}.primaryKey`,
        oldValue: oldField.primaryKey,
        newValue: newField.primaryKey,
        impact: 'breaking'
      });
    }

    return changes;
  }

  private compareConstraints(oldConstraints: any, newConstraints: any): SchemaChange[] {
    const changes: SchemaChange[] = [];

    // This is a simplified version - real implementation would be more comprehensive
    if (JSON.stringify(oldConstraints) !== JSON.stringify(newConstraints)) {
      changes.push({
        type: 'modify',
        field: 'constraints',
        oldValue: oldConstraints,
        newValue: newConstraints,
        impact: 'warning'
      });
    }

    return changes;
  }

  private assessTypeChangeImpact(oldType: string, newType: string): 'breaking' | 'non-breaking' | 'warning' {
    // Define type compatibility matrix
    const compatibilityMatrix: { [key: string]: { [key: string]: 'breaking' | 'non-breaking' | 'warning' } } = {
      'string': {
        'number': 'breaking',
        'boolean': 'breaking',
        'date': 'warning',
        'json': 'non-breaking'
      },
      'number': {
        'string': 'non-breaking',
        'boolean': 'breaking',
        'decimal': 'non-breaking',
        'date': 'breaking'
      },
      'boolean': {
        'string': 'non-breaking',
        'number': 'warning',
        'date': 'breaking'
      },
      'date': {
        'string': 'non-breaking',
        'datetime': 'non-breaking',
        'number': 'breaking'
      },
      'datetime': {
        'date': 'warning',
        'string': 'non-breaking',
        'number': 'breaking'
      }
    };

    return compatibilityMatrix[oldType]?.[newType] || 'breaking';
  }

  private async analyzeSchemaImpact(dataSourceId: string, changes: SchemaChange[]): Promise<ImpactAnalysis> {
    try {
      // Find workflows using this data source
      const affectedWorkflows = await this.findAffectedWorkflows(dataSourceId);
      
      // Identify breaking changes
      const breakingChanges = changes.filter(c => c.impact === 'breaking');
      
      // Generate recommendations
      const recommendedActions = this.generateSchemaRecommendations(changes, affectedWorkflows);

      return {
        affectedWorkflows,
        breakingChanges,
        recommendedActions
      };
    } catch (error) {
      this.logger.error(`Failed to analyze schema impact: ${error.message}`);
      return {
        affectedWorkflows: [],
        breakingChanges: changes.filter(c => c.impact === 'breaking'),
        recommendedActions: ['Manual review required due to analysis error']
      };
    }
  }

  private async findAffectedWorkflows(dataSourceId: string): Promise<string[]> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        SELECT DISTINCT w.id
        FROM etl_designer.workflows w
        JOIN etl_designer.transformations t ON w.id = t.workflow_id
        WHERE t.node_config::text ILIKE '%' || $1 || '%'
      `;

      const result = await pool.query(query, [dataSourceId]);
      return result.rows.map(row => row.id);
    } catch (error) {
      this.logger.error(`Failed to find affected workflows: ${error.message}`);
      return [];
    }
  }

  private generateSchemaRecommendations(changes: SchemaChange[], affectedWorkflows: string[]): string[] {
    const recommendations: string[] = [];

    const breakingChanges = changes.filter(c => c.impact === 'breaking');
    const warningChanges = changes.filter(c => c.impact === 'warning');

    if (breakingChanges.length > 0) {
      recommendations.push(`${breakingChanges.length} breaking changes detected - manual intervention required`);
      recommendations.push('Review and update affected workflows before applying schema changes');
      
      if (affectedWorkflows.length > 0) {
        recommendations.push(`Update ${affectedWorkflows.length} affected workflows`);
      }
    }

    if (warningChanges.length > 0) {
      recommendations.push(`${warningChanges.length} potentially problematic changes - review recommended`);
    }

    // Field-specific recommendations
    changes.forEach(change => {
      if (change.type === 'remove') {
        recommendations.push(`Field '${change.field}' removal: Ensure no downstream dependencies`);
      } else if (change.type === 'modify' && change.field.endsWith('.nullable') && !change.newValue) {
        recommendations.push(`Field '${change.field.replace('.nullable', '')}' became non-nullable: Add default value or data validation`);
      }
    });

    return recommendations;
  }

  private generateMigrationStrategy(changes: SchemaChange[], impactAnalysis: ImpactAnalysis): MigrationStrategy {
    const steps: any[] = [];
    const rollbackSteps: any[] = [];
    const validationRules: string[] = [];

    // Generate migration steps based on change types
    changes.forEach((change, index) => {
      const stepOrder = index + 1;

      switch (change.type) {
        case 'add':
          steps.push({
            order: stepOrder,
            action: `Add field '${change.field}'`,
            sql: this.generateAddFieldSQL(change),
            rollbackSql: this.generateRemoveFieldSQL(change)
          });
          validationRules.push(`Verify field '${change.field}' exists with correct type`);
          break;

        case 'remove':
          steps.push({
            order: stepOrder,
            action: `Remove field '${change.field}'`,
            sql: this.generateRemoveFieldSQL(change),
            rollbackSql: this.generateAddFieldSQL(change)
          });
          validationRules.push(`Verify field '${change.field}' no longer exists`);
          break;

        case 'modify':
          steps.push({
            order: stepOrder,
            action: `Modify field '${change.field}'`,
            sql: this.generateModifyFieldSQL(change),
            rollbackSql: this.generateModifyFieldSQL({ ...change, oldValue: change.newValue, newValue: change.oldValue })
          });
          validationRules.push(`Verify field '${change.field}' has correct type and properties`);
          break;
      }
    });

    // Add pre-migration validation
    steps.unshift({
      order: 0,
      action: 'Pre-migration validation',
      sql: 'SELECT 1', // Placeholder
      rollbackSql: 'SELECT 1'
    });

    // Add post-migration validation
    steps.push({
      order: steps.length,
      action: 'Post-migration validation',
      sql: 'SELECT 1', // Placeholder
      rollbackSql: 'SELECT 1'
    });

    // Reverse order for rollback
    rollbackSteps.push(...steps.map(step => ({
      ...step,
      sql: step.rollbackSql,
      rollbackSql: step.sql
    })).reverse());

    return {
      steps,
      rollbackPlan: rollbackSteps,
      validationRules
    };
  }

  private generateAddFieldSQL(change: SchemaChange): string {
    const field = change.newValue;
    const nullable = field.nullable ? '' : ' NOT NULL';
    const defaultValue = field.nullable ? '' : ' DEFAULT \'\'';
    
    return `ALTER TABLE ${this.getTableName()} ADD COLUMN ${change.field} ${this.mapTypeToSQL(field.type)}${nullable}${defaultValue};`;
  }

  private generateRemoveFieldSQL(change: SchemaChange): string {
    return `ALTER TABLE ${this.getTableName()} DROP COLUMN ${change.field};`;
  }

  private generateModifyFieldSQL(change: SchemaChange): string {
    if (change.field.endsWith('.type')) {
      const fieldName = change.field.replace('.type', '');
      return `ALTER TABLE ${this.getTableName()} ALTER COLUMN ${fieldName} TYPE ${this.mapTypeToSQL(change.newValue)};`;
    } else if (change.field.endsWith('.nullable')) {
      const fieldName = change.field.replace('.nullable', '');
      const constraint = change.newValue ? 'DROP NOT NULL' : 'SET NOT NULL';
      return `ALTER TABLE ${this.getTableName()} ALTER COLUMN ${fieldName} ${constraint};`;
    }
    
    return `-- Manual modification required for ${change.field}`;
  }

  private mapTypeToSQL(type: string): string {
    const typeMap: { [key: string]: string } = {
      'string': 'VARCHAR(255)',
      'number': 'INTEGER',
      'decimal': 'DECIMAL(10,2)',
      'boolean': 'BOOLEAN',
      'date': 'DATE',
      'datetime': 'TIMESTAMP',
      'json': 'JSONB',
      'array': 'TEXT[]'
    };

    return typeMap[type] || 'TEXT';
  }

  private getTableName(): string {
    // This would be determined based on the data source context
    return 'data_table'; // Placeholder
  }

  private assessRiskLevel(changes: SchemaChange[], impactAnalysis: ImpactAnalysis): 'low' | 'medium' | 'high' | 'critical' {
    const breakingChanges = changes.filter(c => c.impact === 'breaking').length;
    const affectedWorkflows = impactAnalysis.affectedWorkflows.length;

    if (breakingChanges === 0 && affectedWorkflows === 0) {
      return 'low';
    } else if (breakingChanges <= 2 && affectedWorkflows <= 3) {
      return 'medium';
    } else if (breakingChanges <= 5 && affectedWorkflows <= 10) {
      return 'high';
    } else {
      return 'critical';
    }
  }

  private isAutoMigratable(changes: SchemaChange[], riskLevel: string): boolean {
    // Auto-migration is only safe for low-risk changes
    if (riskLevel !== 'low') {
      return false;
    }

    // Only allow auto-migration for non-breaking changes
    const hasBreakingChanges = changes.some(c => c.impact === 'breaking');
    return !hasBreakingChanges;
  }

  private createInitialSchemaResult(schema: SchemaDefinition): SchemaEvolutionResult {
    return {
      hasChanges: true,
      changes: [{
        type: 'add',
        field: 'schema',
        newValue: schema,
        impact: 'non-breaking'
      }],
      impactAnalysis: {
        affectedWorkflows: [],
        breakingChanges: [],
        recommendedActions: ['Initial schema registration']
      },
      migrationStrategy: {
        steps: [{
          order: 1,
          action: 'Register initial schema',
          sql: 'SELECT 1',
          rollbackSql: 'SELECT 1'
        }],
        rollbackPlan: [],
        validationRules: ['Verify schema registration']
      },
      autoMigratable: true,
      riskLevel: 'low'
    };
  }

  private async getCurrentSchema(dataSourceId: string): Promise<SchemaDefinition | null> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        SELECT current_schema
        FROM etl_designer.schema_evolution
        WHERE data_source_id = $1
        ORDER BY applied_at DESC
        LIMIT 1
      `;

      const result = await pool.query(query, [dataSourceId]);
      
      if (result.rows.length > 0) {
        return result.rows[0].current_schema;
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to get current schema: ${error.message}`);
      return null;
    }
  }

  private async storeSchemaEvolution(
    dataSourceId: string,
    previousSchema: SchemaDefinition,
    currentSchema: SchemaDefinition,
    evolution: SchemaEvolutionResult
  ): Promise<void> {
    try {
      const pool = await this.databaseService.getPool('platform_admin');
      
      const query = `
        INSERT INTO etl_designer.schema_evolution (
          data_source_id, previous_schema, current_schema, 
          changes, impact_analysis, migration_strategy
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `;

      await pool.query(query, [
        dataSourceId,
        JSON.stringify(previousSchema),
        JSON.stringify(currentSchema),
        JSON.stringify(evolution.changes),
        JSON.stringify(evolution.impactAnalysis),
        JSON.stringify(evolution.migrationStrategy)
      ]);

    } catch (error) {
      this.logger.error(`Failed to store schema evolution: ${error.message}`);
      // Don't throw error as this is not critical for operation
    }
  }

  async validateSchema(schema: SchemaDefinition): Promise<SchemaValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Basic validation
    if (!schema.fields || schema.fields.length === 0) {
      errors.push('Schema must have at least one field');
    }

    // Field validation
    schema.fields.forEach((field, index) => {
      if (!field.name) {
        errors.push(`Field at index ${index} is missing name`);
      }

      if (!field.type) {
        errors.push(`Field '${field.name}' is missing type`);
      }

      // Naming conventions
      if (field.name && !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name)) {
        warnings.push(`Field '${field.name}' should follow naming convention (alphanumeric + underscore)`);
      }

      // Type-specific validation
      if (field.type === 'string' && !field.nullable) {
        suggestions.push(`Consider adding default value for non-nullable string field '${field.name}'`);
      }
    });

    // Check for duplicate field names
    const fieldNames = schema.fields.map(f => f.name);
    const duplicates = fieldNames.filter((name, index) => fieldNames.indexOf(name) !== index);
    if (duplicates.length > 0) {
      errors.push(`Duplicate field names found: ${duplicates.join(', ')}`);
    }

    // Primary key validation
    const primaryKeys = schema.fields.filter(f => f.primaryKey);
    if (primaryKeys.length === 0) {
      warnings.push('No primary key defined - consider adding one for better performance');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
}
EOF

    log_success "Schema Evolution Handler generated"
}

# Main execution function
main() {
    log_info "🚀 Starting Day 2 Hour 4: ETL Data Quality & Lineage Generation"
    log_info "====================================================================="
    
    # Generate core quality and lineage components
    generate_data_quality_engine
    generate_data_lineage_tracker
    generate_schema_evolution_handler
    
    log_success "====================================================================="
    log_success "✅ Day 2 Hour 4: ETL Data Quality & Lineage Generation Completed!"
    log_success "====================================================================="
    log_info "Generated Components:"
    log_info "1. ✅ Data Quality Engine with Comprehensive Rule Validation"
    log_info "2. ✅ Data Lineage Tracker with Impact Analysis"
    log_info "3. ✅ Schema Evolution Handler with Auto-Migration"
    log_info ""
    log_info "🔗 Next: Run ./scripts/codegen/d2h4-generate-etl-performance.sh"
}

# Execute main function
main "$@"