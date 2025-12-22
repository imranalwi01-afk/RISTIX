// packages/backend/src/core/models/config/calculation-parameters.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('calculation_parameters', { schema: 'configuration' })
@Index(['tenantId', 'parameterCategory', 'parameterKey', 'scenarioIdentifier'], { unique: true })
@Index(['parameterCategory'])
@Index(['scenarioIdentifier'])
@Index(['effectiveDate'])
export class CalculationParameters {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ name: 'parameter_category', type: 'varchar', length: 100 })
  parameterCategory: string;

  @Column({ name: 'parameter_key', type: 'varchar', length: 100 })
  parameterKey: string;

  @Column({ name: 'parameter_value', type: 'text' })
  parameterValue: string;

  @Column({ 
    name: 'parameter_type', 
    type: 'varchar', 
    length: 50, 
    default: 'string'
  })
  parameterType: 'string' | 'number' | 'percentage' | 'rate' | 'boolean' | 'date';

  @Column({ name: 'unit_of_measure', type: 'varchar', length: 50, nullable: true })
  unitOfMeasure?: string;

  @Column({ name: 'scenario_identifier', type: 'varchar', length: 100, nullable: true })
  scenarioIdentifier?: string;

  @Column({ name: 'product_type', type: 'varchar', length: 100, nullable: true })
  productType?: string;

  @Column({ name: 'customer_segment', type: 'varchar', length: 100, nullable: true })
  customerSegment?: string;

  @Column({ name: 'geographic_region', type: 'varchar', length: 100, nullable: true })
  geographicRegion?: string;

  @Column({ name: 'currency_code', type: 'varchar', length: 3, default: 'USD' })
  currencyCode: string;

  @Column({ name: 'effective_date', type: 'date', default: () => 'CURRENT_DATE' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'data_source', type: 'varchar', length: 200, nullable: true })
  dataSource?: string;

  @Column({ name: 'update_frequency', type: 'varchar', length: 50, nullable: true })
  updateFrequency?: string;

  @Column({ name: 'is_regulatory_required', type: 'boolean', default: false })
  isRegulatoryRequired: boolean;

  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules?: Record<string, any>;

  @Column({ 
    name: 'approval_status', 
    type: 'varchar', 
    length: 20, 
    default: 'draft'
  })
  approvalStatus: 'draft' | 'pending' | 'approved' | 'rejected';

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy?: string;

  @Column({ name: 'approval_date', type: 'timestamp with time zone', nullable: true })
  approvalDate?: Date;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Helper methods
  getParsedValue(): any {
    if (!this.parameterValue) return null;
    
    switch (this.parameterType) {
      case 'boolean':
        return this.parameterValue === 'true';
      case 'number':
      case 'percentage':
      case 'rate':
        return Number(this.parameterValue);
      case 'date':
        return new Date(this.parameterValue);
      default:
        return this.parameterValue;
    }
  }

  setParsedValue(value: any): void {
    if (value === null || value === undefined) {
      this.parameterValue = '';
      return;
    }
    
    switch (this.parameterType) {
      case 'date':
        this.parameterValue = value instanceof Date ? value.toISOString() : String(value);
        break;
      default:
        this.parameterValue = String(value);
    }
  }

  isActive(): boolean {
    const now = new Date();
    const effective = new Date(this.effectiveDate);
    const expiry = this.expiryDate ? new Date(this.expiryDate) : null;
    
    return effective <= now && (!expiry || expiry > now) && this.approvalStatus === 'approved';
  }

  getFullKey(): string {
    const parts = [this.parameterCategory, this.parameterKey];
    if (this.scenarioIdentifier) parts.push(this.scenarioIdentifier);
    if (this.productType) parts.push(this.productType);
    if (this.customerSegment) parts.push(this.customerSegment);
    return parts.join('.');
  }
}
