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
