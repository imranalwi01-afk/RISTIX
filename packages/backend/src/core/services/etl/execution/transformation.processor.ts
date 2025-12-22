// packages/backend/src/core/services/etl/execution/transformation.processor.ts

import { injectable } from 'inversify';
import { ETLNode } from '../../../../types/etl.types';
import { DatabaseService } from '../../database/database.service';
import { LoggerService } from '../../../../utils/logger.service';
import * as csv from 'fast-csv';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

@injectable()
export class TransformationProcessor {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async processSource(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;

    switch (config.sourceType) {
      case 'database':
        return await this.processDatabaseSource(config);
      case 'file':
        return await this.processFileSource(config);
      case 'api':
        return await this.processApiSource(config);
      default:
        throw new Error(`Unknown source type: ${config.sourceType}`);
    }
  }

  async processTransform(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData) {
      throw new Error('Transform node requires input data');
    }

    let data = Array.isArray(inputData) ? inputData : [inputData];

    // Apply transformations sequentially
    for (const transformation of config.transformations || []) {
      data = await this.applyTransformation(data, transformation);
    }

    return {
      data,
      recordCount: data.length,
      schema: this.inferSchema(data)
    };
  }

  async processFilter(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData || !inputData.data) {
      throw new Error('Filter node requires input data');
    }

    let filteredData = inputData.data;

    // Apply filters
    if (config.conditions) {
      for (const condition of config.conditions) {
        filteredData = filteredData.filter((record: any) => 
          this.evaluateCondition(record, condition)
        );
      }
    }

    return {
      data: filteredData,
      recordCount: filteredData.length,
      schema: inputData.schema,
      originalCount: inputData.recordCount,
      filteredCount: inputData.recordCount - filteredData.length
    };
  }

  async processAggregate(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData || !inputData.data) {
      throw new Error('Aggregate node requires input data');
    }

    const { groupBy, aggregations } = config;
    const data = inputData.data;

    // Group data
    const grouped = this.groupData(data, groupBy);
    
    // Apply aggregations
    const aggregatedData = Object.keys(grouped).map(key => {
      const group = grouped[key];
      const result: any = {};

      // Add grouping fields
      if (Array.isArray(groupBy)) {
        groupBy.forEach((field: string, index: number) => {
          result[field] = key.split('|')[index];
        });
      } else {
        result[groupBy] = key;
      }

      // Apply aggregation functions
      for (const agg of aggregations) {
        result[agg.outputField || `${agg.function}_${agg.field}`] = 
          this.applyAggregation(group, agg.field, agg.function);
      }

      return result;
    });

    return {
      data: aggregatedData,
      recordCount: aggregatedData.length,
      schema: this.inferSchema(aggregatedData),
      originalCount: inputData.recordCount
    };
  }

  async processJoin(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!Array.isArray(inputData) || inputData.length < 2) {
      throw new Error('Join node requires at least two input datasets');
    }

    const [leftData, rightData] = inputData;
    const { joinType, leftKey, rightKey } = config;

    const joinedData = this.performJoin(
      leftData.data,
      rightData.data,
      leftKey,
      rightKey,
      joinType
    );

    return {
      data: joinedData,
      recordCount: joinedData.length,
      schema: this.mergeSchemas(leftData.schema, rightData.schema)
    };
  }

  async processValidate(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData || !inputData.data) {
      throw new Error('Validate node requires input data');
    }

    const validationResults: any[] = [];
    const validRecords: any[] = [];
    const invalidRecords: any[] = [];

    for (const record of inputData.data) {
      const recordValidation = this.validateRecord(record, config.rules || []);
      
      if (recordValidation.isValid) {
        validRecords.push(record);
      } else {
        invalidRecords.push({
          ...record,
          _validationErrors: recordValidation.errors
        });
      }

      validationResults.push(recordValidation);
    }

    return {
      data: config.includeInvalid ? [...validRecords, ...invalidRecords] : validRecords,
      recordCount: validRecords.length,
      schema: inputData.schema,
      validation: {
        totalRecords: inputData.recordCount,
        validRecords: validRecords.length,
        invalidRecords: invalidRecords.length,
        validationRate: (validRecords.length / inputData.recordCount) * 100,
        errors: validationResults.filter(v => !v.isValid)
      }
    };
  }

  async processOutput(node: ETLNode, inputData: any): Promise<any> {
    const { config } = node;
    
    if (!inputData) {
      throw new Error('Output node requires input data');
    }

    switch (config.outputType) {
      case 'database':
        return await this.processDatabaseOutput(config, inputData);
      case 'file':
        return await this.processFileOutput(config, inputData);
      case 'api':
        return await this.processApiOutput(config, inputData);
      default:
        throw new Error(`Unknown output type: ${config.outputType}`);
    }
  }

  private async processDatabaseSource(config: any): Promise<any> {
    const { connectionId, query, database } = config;
    
    // Get database connection based on connectionId or use tenant database
    const pool = await this.databaseService.getPool(database || 'tenant');
    
    const result = await pool.query(query);
    
    return {
      data: result.rows,
      recordCount: result.rows.length,
      schema: this.inferSchemaFromDbResult(result.fields)
    };
  }

  private async processFileSource(config: any): Promise<any> {
    const { filePath, fileType, options = {} } = config;

    switch (fileType.toLowerCase()) {
      case 'csv':
        return await this.processCsvFile(filePath, options);
      case 'xlsx':
      case 'xls':
        return await this.processExcelFile(filePath, options);
      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  }

  private async processApiSource(config: any): Promise<any> {
    const { url, method = 'GET', headers = {}, body } = config;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    const records = Array.isArray(data) ? data : [data];

    return {
      data: records,
      recordCount: records.length,
      schema: this.inferSchema(records)
    };
  }

  private async applyTransformation(data: any[], transformation: any): Promise<any[]> {
    const { type, ...params } = transformation;

    switch (type) {
      case 'add_column':
        return data.map(record => ({
          ...record,
          [params.name]: this.evaluateExpression(record, params.expression)
        }));
      
      case 'remove_column':
        return data.map(record => {
          const newRecord = { ...record };
          delete newRecord[params.field];
          return newRecord;
        });
      
      case 'rename_column':
        return data.map(record => {
          const newRecord = { ...record };
          newRecord[params.newName] = newRecord[params.oldName];
          delete newRecord[params.oldName];
          return newRecord;
        });
      
      case 'format_currency':
        return data.map(record => ({
          ...record,
          [params.field]: this.formatCurrency(record[params.field], params.currency)
        }));
      
      case 'calculate_age':
        return data.map(record => ({
          ...record,
          [params.outputField]: this.calculateAge(record[params.dateField])
        }));
      
      default:
        throw new Error(`Unknown transformation type: ${type}`);
    }
  }

  private evaluateCondition(record: any, condition: any): boolean {
    const { field, operator, value } = condition;
    const recordValue = record[field];

    switch (operator) {
      case 'equals':
        return recordValue === value;
      case 'not_equals':
        return recordValue !== value;
      case 'greater_than':
        return recordValue > value;
      case 'less_than':
        return recordValue < value;
      case 'contains':
        return String(recordValue).includes(value);
      case 'in':
        return Array.isArray(value) && value.includes(recordValue);
      case 'is_null':
        return recordValue == null;
      case 'is_not_null':
        return recordValue != null;
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  private groupData(data: any[], groupBy: string | string[]): { [key: string]: any[] } {
    const grouped: { [key: string]: any[] } = {};

    data.forEach(record => {
      let key: string;
      
      if (Array.isArray(groupBy)) {
        key = groupBy.map(field => record[field]).join('|');
      } else {
        key = record[groupBy];
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(record);
    });

    return grouped;
  }

  private applyAggregation(group: any[], field: string, func: string): any {
    switch (func) {
      case 'count':
        return group.length;
      case 'sum':
        return group.reduce((sum, record) => sum + (parseFloat(record[field]) || 0), 0);
      case 'avg':
        const sum = group.reduce((sum, record) => sum + (parseFloat(record[field]) || 0), 0);
        return sum / group.length;
      case 'min':
        return Math.min(...group.map(record => parseFloat(record[field]) || 0));
      case 'max':
        return Math.max(...group.map(record => parseFloat(record[field]) || 0));
      case 'first':
        return group[0][field];
      case 'last':
        return group[group.length - 1][field];
      default:
        throw new Error(`Unknown aggregation function: ${func}`);
    }
  }

  private performJoin(
    leftData: any[],
    rightData: any[],
    leftKey: string,
    rightKey: string,
    joinType: string
  ): any[] {
    const result: any[] = [];

    switch (joinType) {
      case 'inner':
        leftData.forEach(leftRecord => {
          const rightMatches = rightData.filter(rightRecord => 
            leftRecord[leftKey] === rightRecord[rightKey]
          );
          rightMatches.forEach(rightRecord => {
            result.push({ ...leftRecord, ...rightRecord });
          });
        });
        break;

      case 'left':
        leftData.forEach(leftRecord => {
          const rightMatches = rightData.filter(rightRecord => 
            leftRecord[leftKey] === rightRecord[rightKey]
          );
          if (rightMatches.length > 0) {
            rightMatches.forEach(rightRecord => {
              result.push({ ...leftRecord, ...rightRecord });
            });
          } else {
            result.push(leftRecord);
          }
        });
        break;

      default:
        throw new Error(`Unsupported join type: ${joinType}`);
    }

    return result;
  }

  private validateRecord(record: any, rules: any[]): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const rule of rules) {
      const { field, type, ...params } = rule;
      const value = record[field];

      switch (type) {
        case 'required':
          if (value == null || value === '') {
            errors.push(`Field ${field} is required`);
          }
          break;
        case 'numeric':
          if (isNaN(value)) {
            errors.push(`Field ${field} must be numeric`);
          }
          if (params.min != null && value < params.min) {
            errors.push(`Field ${field} must be >= ${params.min}`);
          }
          if (params.max != null && value > params.max) {
            errors.push(`Field ${field} must be <= ${params.max}`);
          }
          break;
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Field ${field} must be a string`);
          }
          if (params.minLength != null && value.length < params.minLength) {
            errors.push(`Field ${field} must be at least ${params.minLength} characters`);
          }
          break;
        case 'enum':
          if (!params.values.includes(value)) {
            errors.push(`Field ${field} must be one of: ${params.values.join(', ')}`);
          }
          break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private async processDatabaseOutput(config: any, inputData: any): Promise<any> {
    const { table, writeMode = 'insert', keyColumns } = config;
    const pool = await this.databaseService.getPool('tenant');

    let recordsAffected = 0;

    if (writeMode === 'upsert' && keyColumns) {
      // Implement upsert logic
      for (const record of inputData.data) {
        const result = await this.upsertRecord(pool, table, record, keyColumns);
        recordsAffected += result.rowCount || 0;
      }
    } else {
      // Simple insert
      const columns = Object.keys(inputData.data[0]);
      const values = inputData.data.map((record: any) => 
        columns.map(col => record[col])
      );

      const placeholders = values.map((_, index) => 
        `(${columns.map((_, colIndex) => `$${index * columns.length + colIndex + 1}`).join(', ')})`
      ).join(', ');

      const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders}`;
      const flatValues = values.flat();

      const result = await pool.query(query, flatValues);
      recordsAffected = result.rowCount || 0;
    }

    return {
      success: true,
      recordsAffected,
      table,
      writeMode
    };
  }

  private async upsertRecord(pool: any, table: string, record: any, keyColumns: string[]): Promise<any> {
    const columns = Object.keys(record);
    const values = Object.values(record);
    
    const insertColumns = columns.join(', ');
    const insertPlaceholders = columns.map((_, index) => `$${index + 1}`).join(', ');
    
    const updateSet = columns
      .filter(col => !keyColumns.includes(col))
      .map(col => `${col} = EXCLUDED.${col}`)
      .join(', ');
    
    const conflictColumns = keyColumns.join(', ');
    
    const query = `
      INSERT INTO ${table} (${insertColumns})
      VALUES (${insertPlaceholders})
      ON CONFLICT (${conflictColumns})
      DO UPDATE SET ${updateSet}
    `;

    return await pool.query(query, values);
  }

  private async processFileOutput(config: any, inputData: any): Promise<any> {
    const { filePath, fileType, options = {} } = config;

    switch (fileType.toLowerCase()) {
      case 'csv':
        return await this.writeCsvFile(filePath, inputData.data, options);
      case 'xlsx':
        return await this.writeExcelFile(filePath, inputData.data, options);
      default:
        throw new Error(`Unsupported output file type: ${fileType}`);
    }
  }

  private async processApiOutput(config: any, inputData: any): Promise<any> {
    const { url, method = 'POST', headers = {} } = config;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(inputData.data)
    });

    if (!response.ok) {
      throw new Error(`API output failed: ${response.statusText}`);
    }

    return {
      success: true,
      response: await response.json(),
      recordsSent: inputData.recordCount
    };
  }

  private inferSchema(data: any[]): any {
    if (data.length === 0) return {};

    const schema: any = {};
    const sample = data[0];

    Object.keys(sample).forEach(key => {
      const value = sample[key];
      schema[key] = {
        type: typeof value,
        nullable: data.some(record => record[key] == null)
      };
    });

    return schema;
  }

  private inferSchemaFromDbResult(fields: any[]): any {
    const schema: any = {};

    fields.forEach(field => {
      schema[field.name] = {
        type: this.mapDbTypeToJs(field.dataTypeID),
        nullable: true // Assume nullable unless specified
      };
    });

    return schema;
  }

  private mapDbTypeToJs(dataTypeID: number): string {
    // PostgreSQL OID mappings
    const typeMap: { [key: number]: string } = {
      16: 'boolean',
      20: 'number',
      21: 'number',
      23: 'number',
      25: 'string',
      1114: 'date',
      1184: 'date'
    };

    return typeMap[dataTypeID] || 'string';
  }

  private evaluateExpression(record: any, expression: string): any {
    // Simple expression evaluator
    // In production, you'd want a more robust solution
    try {
      // Replace field references with actual values
      let evaluatedExpression = expression;
      Object.keys(record).forEach(key => {
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        evaluatedExpression = evaluatedExpression.replace(regex, JSON.stringify(record[key]));
      });

      // Evaluate the expression (be careful with eval in production!)
      return Function(`"use strict"; return (${evaluatedExpression})`)();
    } catch (error) {
      this.logger.warn(`Failed to evaluate expression: ${expression}, error: ${error.message}`);
      return null;
    }
  }

  private formatCurrency(value: any, currency: string): string {
    const numValue = parseFloat(value) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR'
    }).format(numValue);
  }

  private calculateAge(dateValue: any): number {
    const birthDate = new Date(dateValue);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    
    return age;
  }

  private async processCsvFile(filePath: string, options: any): Promise<any> {
    // Implementation would read CSV file
    // Simplified for brevity
    throw new Error('CSV file processing not implemented');
  }

  private async processExcelFile(filePath: string, options: any): Promise<any> {
    // Implementation would read Excel file
    // Simplified for brevity
    throw new Error('Excel file processing not implemented');
  }

  private async writeCsvFile(filePath: string, data: any[], options: any): Promise<any> {
    // Implementation would write CSV file
    // Simplified for brevity
    throw new Error('CSV file writing not implemented');
  }

  private async writeExcelFile(filePath: string, data: any[], options: any): Promise<any> {
    // Implementation would write Excel file
    // Simplified for brevity
    throw new Error('Excel file writing not implemented');
  }

  private mergeSchemas(leftSchema: any, rightSchema: any): any {
    return { ...leftSchema, ...rightSchema };
  }
}
