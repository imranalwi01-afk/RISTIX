// packages/backend/src/types/etl.types.ts

export interface ETLWorkflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  workflowDefinition: WorkflowDefinition;
  status: WorkflowStatus;
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowDefinition {
  nodes: ETLNode[];
  connections: NodeConnection[];
  settings: WorkflowSettings;
}

export interface ETLNode {
  id: string;
  type: NodeType;
  label: string;
  position: Position;
  config: NodeConfig;
  metadata?: NodeMetadata;
}

export interface NodeConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  metadata?: ConnectionMetadata;
}

export interface Position {
  x: number;
  y: number;
}

export interface NodeConfig {
  [key: string]: any;
}

export interface NodeMetadata {
  description?: string;
  tags?: string[];
  lastModified?: Date;
  performance?: PerformanceMetrics;
}

export interface ConnectionMetadata {
  dataType?: string;
  sampleSize?: number;
  latency?: number;
}

export interface WorkflowSettings {
  parallelExecution: boolean;
  errorHandling: ErrorHandlingStrategy;
  retryPolicy: RetryPolicy;
  monitoring: MonitoringConfig;
}

export interface PerformanceMetrics {
  executionTime: number;
  memoryUsage: number;
  recordsProcessed: number;
  throughput: number;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential';
  initialDelay: number;
  maxDelay: number;
}

export interface MonitoringConfig {
  enabled: boolean;
  metricsInterval: number;
  alertThresholds: AlertThresholds;
}

export interface AlertThresholds {
  errorRate: number;
  latency: number;
  memoryUsage: number;
}

export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'deprecated' | 'error';
export type NodeType = 'source' | 'transform' | 'filter' | 'aggregate' | 'join' | 'lookup' | 'validate' | 'output' | 'split' | 'merge';
export type ErrorHandlingStrategy = 'stop' | 'skip' | 'retry' | 'log';

export interface DataSource {
  id: string;
  tenantId: string;
  name: string;
  sourceType: SourceType;
  connectionConfig: ConnectionConfig;
  schemaDefinition?: SchemaDefinition;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SourceType = 'database' | 'file' | 'api' | 'stream' | 'queue';

export interface ConnectionConfig {
  [key: string]: any;
}

export interface SchemaDefinition {
  fields: FieldDefinition[];
  constraints?: SchemaConstraints;
}

export interface FieldDefinition {
  name: string;
  type: DataType;
  nullable: boolean;
  primaryKey?: boolean;
  description?: string;
}

export type DataType = 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'decimal' | 'json' | 'array';

export interface SchemaConstraints {
  uniqueKeys?: string[][];
  foreignKeys?: ForeignKeyConstraint[];
  checks?: CheckConstraint[];
}

export interface ForeignKeyConstraint {
  columns: string[];
  referencedTable: string;
  referencedColumns: string[];
}

export interface CheckConstraint {
  name: string;
  expression: string;
}

export interface ExecutionHistory {
  id: string;
  workflowId: string;
  executionId: string;
  status: ExecutionStatus;
  startTime: Date;
  endTime?: Date;
  executionLog?: ExecutionLog;
  errorDetails?: ErrorDetails;
  metrics?: ExecutionMetrics;
}

export type ExecutionStatus = 'running' | 'completed' | 'failed' | 'cancelled' | 'paused';

export interface ExecutionLog {
  steps: ExecutionStep[];
  warnings: LogEntry[];
  info: LogEntry[];
}

export interface ExecutionStep {
  nodeId: string;
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
  recordsProcessed?: number;
  errors?: ErrorDetails[];
}

export interface LogEntry {
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  metadata?: any;
}

export interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
  context?: any;
}

export interface ExecutionMetrics {
  totalRecordsProcessed: number;
  totalExecutionTime: number;
  avgThroughput: number;
  memoryPeak: number;
  nodeMetrics: { [nodeId: string]: PerformanceMetrics };
}

export interface QualityRule {
  id: string;
  tenantId: string;
  name: string;
  ruleType: QualityRuleType;
  ruleDefinition: QualityRuleDefinition;
  severity: QualitySeverity;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type QualityRuleType = 'completeness' | 'uniqueness' | 'validity' | 'consistency' | 'accuracy' | 'timeliness';
export type QualitySeverity = 'info' | 'warning' | 'error' | 'critical';

export interface QualityRuleDefinition {
  targetField?: string;
  condition: string;
  threshold?: number;
  customLogic?: string;
}

export interface DataLineage {
  id: string;
  workflowId: string;
  sourceEntity: string;
  targetEntity: string;
  transformationType: string;
  lineageMetadata: LineageMetadata;
}

export interface LineageMetadata {
  transformationDetails: string;
  impactRadius: string[];
  dependencies: string[];
  lastUpdated: Date;
}

export interface SchemaEvolution {
  id: string;
  dataSourceId: string;
  previousSchema?: SchemaDefinition;
  currentSchema: SchemaDefinition;
  changes: SchemaChange[];
  impactAnalysis: ImpactAnalysis;
  migrationStrategy: MigrationStrategy;
  appliedAt: Date;
}

export interface SchemaChange {
  type: 'add' | 'remove' | 'modify' | 'rename';
  field: string;
  oldValue?: any;
  newValue?: any;
  impact: 'breaking' | 'non-breaking' | 'warning';
}

export interface ImpactAnalysis {
  affectedWorkflows: string[];
  breakingChanges: SchemaChange[];
  recommendedActions: string[];
}

export interface MigrationStrategy {
  steps: MigrationStep[];
  rollbackPlan: MigrationStep[];
  validationRules: string[];
}

export interface MigrationStep {
  order: number;
  action: string;
  sql?: string;
  rollbackSql?: string;
}
