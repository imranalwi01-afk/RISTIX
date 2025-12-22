// packages/backend/src/core/domain/shared/value-objects/Percentage.ts

/**
 * Percentage Value Object - Immutable percentage value with validation
 * Follows Value Object pattern: equality based on numeric value
 */

export interface PercentageProps {
  value: number;
}

export class Percentage {
  public readonly value: number;

  constructor(value: number) {
    this.validate(value);
    this.value = this.roundValue(value);
  }

  /**
   * Create a Percentage instance
   */
  static create(value: number): Percentage {
    return new Percentage(value);
  }

  /**
   * Create zero percentage
   */
  static zero(): Percentage {
    return new Percentage(0);
  }

  /**
   * Create 100% percentage
   */
  static hundred(): Percentage {
    return new Percentage(100);
  }

  /**
   * Create from decimal (0.0 to 1.0)
   */
  static fromDecimal(decimal: number): Percentage {
    return new Percentage(decimal * 100);
  }

  /**
   * Create from fraction
   */
  static fromFraction(numerator: number, denominator: number): Percentage {
    if (denominator === 0) {
      throw new Error('Denominator cannot be zero');
    }
    return new Percentage((numerator / denominator) * 100);
  }

  /**
   * Add percentage (creates new instance - immutable)
   */
  add(other: Percentage): Percentage {
    return new Percentage(this.value + other.value);
  }

  /**
   * Subtract percentage (creates new instance - immutable)
   */
  subtract(other: Percentage): Percentage {
    return new Percentage(this.value - other.value);
  }

  /**
   * Multiply by factor (creates new instance - immutable)
   */
  multiply(factor: number): Percentage {
    return new Percentage(this.value * factor);
  }

  /**
   * Divide by factor (creates new instance - immutable)
   */
  divide(factor: number): Percentage {
    if (factor === 0) {
      throw new Error('Cannot divide percentage by zero');
    }
    return new Percentage(this.value / factor);
  }

  /**
   * Check if percentage is zero
   */
  isZero(): boolean {
    return this.value === 0;
  }

  /**
   * Check if percentage is 100%
   */
  isHundred(): boolean {
    return this.value === 100;
  }

  /**
   * Check if percentage is positive
   */
  isPositive(): boolean {
    return this.value > 0;
  }

  /**
   * Check if percentage is negative
   */
  isNegative(): boolean {
    return this.value < 0;
  }

  /**
   * Check if percentage is between two values
   */
  isBetween(min: Percentage, max: Percentage): boolean {
    return this.value >= min.value && this.value <= max.value;
  }

  /**
   * Check if percentage is greater than another
   */
  greaterThan(other: Percentage): boolean {
    return this.value > other.value;
  }

  /**
   * Check if percentage is less than another
   */
  lessThan(other: Percentage): boolean {
    return this.value < other.value;
  }

  /**
   * Check if percentage is equal to another
   */
  equals(other: Percentage): boolean {
    return this.roundValue(this.value) === this.roundValue(other.value);
  }

  /**
   * Get absolute value (creates new instance)
   */
  absolute(): Percentage {
    return new Percentage(Math.abs(this.value));
  }

  /**
   * Convert to decimal (0.0 to 1.0)
   */
  toDecimal(): number {
    return this.value / 100;
  }

  /**
   * Convert to fraction
   */
  toFraction(): { numerator: number; denominator: 100 } {
    return {
      numerator: this.roundValue(this.value),
      denominator: 100
    };
  }

  /**
   * Apply percentage to a value
   */
  applyTo(value: number): number {
    return value * this.toDecimal();
  }

  /**
   * Calculate what percentage this value is of another value
   */
  percentageOf(total: number): Percentage {
    if (total === 0) {
      throw new Error('Cannot calculate percentage of zero');
    }
    return new Percentage((this.value / total) * 100);
  }

  /**
   * Format percentage for display
   */
  format(locale: string = 'en-US', options?: Intl.NumberFormatOptions): string {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    };

    return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(
      this.toDecimal()
    );
  }

  /**
   * Format percentage with percent symbol
   */
  formatWithSymbol(decimals: number = 2): string {
    return `${this.value.toFixed(decimals)}%`;
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `${this.value.toFixed(2)}%`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): PercentageProps {
    return {
      value: this.value
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(props: PercentageProps): Percentage {
    return new Percentage(props.value);
  }

  /**
   * Validate percentage value
   */
  private validate(value: number): void {
    if (typeof value !== 'number' || isNaN(value)) {
      throw new Error('Percentage value must be a valid number');
    }

    if (!Number.isFinite(value)) {
      throw new Error('Percentage value must be finite');
    }
  }

  /**
   * Round percentage value for consistency
   */
  private roundValue(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Common percentage constants
   */
  static readonly ZERO = Percentage.zero();
  static readonly QUARTER = Percentage.create(25);
  static readonly HALF = Percentage.create(50);
  static readonly THREE_QUARTERS = Percentage.create(75);
  static readonly HUNDRED = Percentage.hundred();
}