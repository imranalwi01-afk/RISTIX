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
