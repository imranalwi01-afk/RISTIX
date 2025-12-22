// packages/backend/src/core/models/config/model-configurations.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('ifrs9_model_configurations', { schema: 'configuration' })
@Index(['tenantId', 'modelType', 'modelName', 'modelVersion'], { unique: true })
@Index(['modelType'])
@Index(['isActive'])
@Index(['validationStatus'])
@Index(['approvalStatus'])
export class ModelConfigurations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legacy_id', type: 'integer', nullable: true })
  legacyId?: number;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ name: 'model_type', type: 'varchar', length: 50 })
  modelType: string;

  @Column({ name: 'model_name', type: 'varchar', length: 100 })
  modelName: string;

  @Column({ name: 'model_version', type: 'varchar', length: 20 })
  modelVersion: string;

  @Column({ type: 'text' })
  parameters: string;

  @Column({ name: 'calculation_formula', type: 'text', nullable: true })
  calculationFormula?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'model_metadata', type: 'jsonb', nullable: true })
  modelMetadata?: Record<string, any>;

  @Column({ name: 'input_schema', type: 'jsonb', nullable: true })
  inputSchema?: Record<string, any>;

  @Column({ name: 'output_schema', type: 'jsonb', nullable: true })
  outputSchema?: Record<string, any>;

  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules?: Record<string, any>;

  @Column({ name: 'performance_metrics', type: 'jsonb', nullable: true })
  performanceMetrics?: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ 
    name: 'validation_status', 
    type: 'varchar', 
    length: 20, 
    default: 'draft'
  })
  validationStatus: 'draft' | 'validating' | 'passed' | 'failed';

  @Column({ 
    name: 'approval_status', 
    type: 'varchar', 
    length: 20, 
    default: 'draft'
  })
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';

  @Column({ name: 'validation_report', type: 'jsonb', nullable: true })
  validationReport?: Record<string, any>;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approval_date', type: 'timestamp with time zone', nullable: true })
  approvalDate?: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes?: string;

  @Column({ name: 'regulatory_compliance', type: 'jsonb', nullable: true })
  regulatoryCompliance?: Record<string, any>;

  @Column({ name: 'audit_trail', type: 'jsonb', nullable: true })
  auditTrail?: Record<string, any>[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Helper methods
  getParsedParameters(): Record<string, any> {
    try {
      return JSON.parse(this.parameters);
    } catch {
      return {};
    }
  }

  setParsedParameters(params: Record<string, any>): void {
    this.parameters = JSON.stringify(params);
  }

  getFullName(): string {
    return `${this.modelType}.${this.modelName}`;
  }

  getVersionedName(): string {
    return `${this.getFullName()}_v${this.modelVersion}`;
  }

  isReadyForProduction(): boolean {
    return this.isActive && 
           this.validationStatus === 'passed' && 
           this.approvalStatus === 'approved';
  }

  addAuditEntry(action: string, details: any, userId?: string): void {
    if (!this.auditTrail) {
      this.auditTrail = [];
    }
    
    this.auditTrail.push({
      timestamp: new Date().toISOString(),
      action,
      details,
      userId,
      version: this.modelVersion
    });
  }

  getLatestAuditEntry(): any {
    if (!this.auditTrail || this.auditTrail.length === 0) {
      return null;
    }
    
    return this.auditTrail[this.auditTrail.length - 1];
  }
}
