// packages/backend/src/core/models/config/parameter-configurations.model.ts
import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('parameter_configurations', { schema: 'configuration' })
@Index(['tenantId', 'category', 'parameterKey', 'scenarioIdentifier'], { unique: true })
@Index(['category'])
@Index(['scenarioIdentifier'])
@Index(['effectiveDate'])
export class ParameterConfigurations {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'legacy_id', type: 'integer', nullable: true })
  legacyId?: number;

  @Column({ name: 'tenant_id', type: 'uuid', nullable: true })
  @Index()
  tenantId?: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ name: 'parameter_key', type: 'varchar', length: 100 })
  parameterKey: string;

  @Column({ name: 'parameter_value', type: 'text' })
  parameterValue: string;

  @Column({ name: 'scenario_identifier', type: 'varchar', length: 100, nullable: true })
  scenarioIdentifier?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'effective_date', type: 'date', default: () => 'CURRENT_DATE' })
  effectiveDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate?: Date;

  @Column({ name: 'parameter_metadata', type: 'jsonb', nullable: true })
  parameterMetadata?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    const effective = new Date(this.effectiveDate);
    const expiry = this.expiryDate ? new Date(this.expiryDate) : null;
    
    return effective <= now && (!expiry || expiry > now);
  }

  getFullKey(): string {
    const parts = [this.category, this.parameterKey];
    if (this.scenarioIdentifier) parts.push(this.scenarioIdentifier);
    return parts.join('.');
  }
}
