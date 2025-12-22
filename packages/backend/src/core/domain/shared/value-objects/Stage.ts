// packages/backend/src/core/domain/shared/value-objects/Stage.ts

/**
 * Stage Value Object - IFRS9 impairment stage with validation
 * Follows Value Object pattern: equality based on stage number
 */

export enum StageType {
  STAGE_1 = 1,
  STAGE_2 = 2,
  STAGE_3 = 3
}

export interface StageProps {
  number: number;
  name?: string;
  description?: string;
}

export class Stage {
  public readonly number: number;
  public readonly name: string;
  public readonly description: string;

  constructor(number: number, name?: string, description?: string) {
    this.validate(number);
    this.number = number;
    this.name = name || this.getDefaultName(number);
    this.description = description || this.getDefaultDescription(number);
  }

  /**
   * Create a Stage instance
   */
  static create(number: number, name?: string, description?: string): Stage {
    return new Stage(number, name, description);
  }

  /**
   * Create Stage 1
   */
  static stage1(): Stage {
    return new Stage(StageType.STAGE_1, 'Stage 1', '12-month expected credit losses');
  }

  /**
   * Create Stage 2
   */
  static stage2(): Stage {
    return new Stage(StageType.STAGE_2, 'Stage 2', 'Lifetime expected credit losses');
  }

  /**
   * Create Stage 3
   */
  static stage3(): Stage {
    return new Stage(StageType.STAGE_3, 'Stage 3', 'Lifetime expected credit losses');
  }

  /**
   * Create from stage type enum
   */
  static fromType(stageType: StageType): Stage {
    return new Stage(stageType);
  }

  /**
   * Check if this is Stage 1
   */
  isStage1(): boolean {
    return this.number === StageType.STAGE_1;
  }

  /**
   * Check if this is Stage 2
   */
  isStage2(): boolean {
    return this.number === StageType.STAGE_2;
  }

  /**
   * Check if this is Stage 3
   */
  isStage3(): boolean {
    return this.number === StageType.STAGE_3;
  }

  /**
   * Check if this stage requires lifetime ECL calculation
   */
  requiresLifetimeECL(): boolean {
    return this.isStage2() || this.isStage3();
  }

  /**
   * Check if this stage requires 12-month ECL calculation
   */
  requires12MonthECL(): boolean {
    return this.isStage1();
  }

  /**
   * Check if this is an impaired stage (2 or 3)
   */
  isImpaired(): boolean {
    return this.number >= StageType.STAGE_2;
  }

  /**
   * Check if this is a performing stage (1)
   */
  isPerforming(): boolean {
    return this.number === StageType.STAGE_1;
  }

  /**
   * Get the next higher stage
   */
  getNextStage(): Stage | null {
    switch (this.number) {
      case StageType.STAGE_1:
        return Stage.stage2();
      case StageType.STAGE_2:
        return Stage.stage3();
      case StageType.STAGE_3:
        return null; // No higher stage
      default:
        throw new Error(`Invalid stage number: ${this.number}`);
    }
  }

  /**
   * Get the previous lower stage
   */
  getPreviousStage(): Stage | null {
    switch (this.number) {
      case StageType.STAGE_2:
        return Stage.stage1();
      case StageType.STAGE_3:
        return Stage.stage2();
      case StageType.STAGE_1:
        return null; // No lower stage
      default:
        throw new Error(`Invalid stage number: ${this.number}`);
    }
  }

  /**
   * Check if this stage can downgrade to another stage
   */
  canDowngradeTo(stage: Stage): boolean {
    return stage.number < this.number;
  }

  /**
   * Check if this stage can upgrade to another stage
   */
  canUpgradeTo(stage: Stage): boolean {
    return stage.number > this.number;
  }

  /**
   * Get the risk level associated with this stage
   */
  getRiskLevel(): 'low' | 'medium' | 'high' {
    switch (this.number) {
      case StageType.STAGE_1:
        return 'low';
      case StageType.STAGE_2:
        return 'medium';
      case StageType.STAGE_3:
        return 'high';
      default:
        throw new Error(`Invalid stage number: ${this.number}`);
    }
  }

  /**
   * Get the provision level required for this stage
   */
  getProvisionLevel(): '12-month' | 'lifetime' {
    return this.requiresLifetimeECL() ? 'lifetime' : '12-month';
  }

  /**
   * Check if this stage is equal to another
   */
  equals(other: Stage): boolean {
    return this.number === other.number;
  }

  /**
   * Compare this stage with another (returns -1, 0, or 1)
   */
  compareTo(other: Stage): number {
    if (this.number < other.number) return -1;
    if (this.number > other.number) return 1;
    return 0;
  }

  /**
   * Format stage for display
   */
  format(): string {
    return `${this.name} (${this.number})`;
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `Stage ${this.number}: ${this.name}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): StageProps {
    return {
      number: this.number,
      name: this.name,
      description: this.description
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(props: StageProps): Stage {
    return new Stage(props.number, props.name, props.description);
  }

  /**
   * Get default stage name
   */
  private getDefaultName(number: number): string {
    switch (number) {
      case StageType.STAGE_1:
        return 'Stage 1';
      case StageType.STAGE_2:
        return 'Stage 2';
      case StageType.STAGE_3:
        return 'Stage 3';
      default:
        throw new Error(`Invalid stage number: ${number}`);
    }
  }

  /**
   * Get default stage description
   */
  private getDefaultDescription(number: number): string {
    switch (number) {
      case StageType.STAGE_1:
        return '12-month expected credit losses';
      case StageType.STAGE_2:
        return 'Lifetime expected credit losses';
      case StageType.STAGE_3:
        return 'Lifetime expected credit losses';
      default:
        throw new Error(`Invalid stage number: ${number}`);
    }
  }

  /**
   * Validate stage number
   */
  private validate(number: number): void {
    if (typeof number !== 'number' || !Number.isInteger(number)) {
      throw new Error('Stage number must be an integer');
    }

    if (number < StageType.STAGE_1 || number > StageType.STAGE_3) {
      throw new Error('Stage number must be between 1 and 3');
    }
  }

  /**
   * Stage constants
   */
  static readonly STAGE_1 = Stage.stage1();
  static readonly STAGE_2 = Stage.stage2();
  static readonly STAGE_3 = Stage.stage3();

  /**
   * All stages array
   */
  static readonly ALL_STAGES = [
    Stage.STAGE_1,
    Stage.STAGE_2,
    Stage.STAGE_3
  ];

  /**
   * Get stage by number
   */
  static getByNumber(number: number): Stage {
    const stage = Stage.ALL_STAGES.find(s => s.number === number);
    if (!stage) {
      throw new Error(`Invalid stage number: ${number}`);
    }
    return stage;
  }

  /**
   * Validate stage number
   */
  static isValidStageNumber(number: number): boolean {
    return number >= StageType.STAGE_1 && number <= StageType.STAGE_3;
  }
}