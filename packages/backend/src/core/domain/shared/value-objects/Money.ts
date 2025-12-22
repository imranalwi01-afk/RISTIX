// packages/backend/src/core/domain/shared/value-objects/Money.ts

/**
 * Money Value Object - Immutable monetary value with currency support
 * Follows Value Object pattern: equality based on value and currency
 */

export interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money {
  public readonly amount: number;
  public readonly currency: string;

  constructor(amount: number, currency: string) {
    this.validate(amount, currency);
    this.amount = this.roundAmount(amount);
    this.currency = currency.toUpperCase();
  }

  /**
   * Create a Money instance
   */
  static create(amount: number, currency: string): Money {
    return new Money(amount, currency);
  }

  /**
   * Create zero money for a currency
   */
  static zero(currency: string): Money {
    return new Money(0, currency);
  }

  /**
   * Add money (creates new instance - immutable)
   */
  add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  /**
   * Subtract money (creates new instance - immutable)
   */
  subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount - other.amount, this.currency);
  }

  /**
   * Multiply by factor (creates new instance - immutable)
   */
  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  /**
   * Divide by factor (creates new instance - immutable)
   */
  divide(factor: number): Money {
    if (factor === 0) {
      throw new Error('Cannot divide money by zero');
    }
    return new Money(this.amount / factor, this.currency);
  }

  /**
   * Calculate percentage of this amount
   */
  percentage(percentage: number): Money {
    return new Money(this.amount * (percentage / 100), this.currency);
  }

  /**
   * Check if money is zero
   */
  isZero(): boolean {
    return this.amount === 0;
  }

  /**
   * Check if money is positive
   */
  isPositive(): boolean {
    return this.amount > 0;
  }

  /**
   * Check if money is negative
   */
  isNegative(): boolean {
    return this.amount < 0;
  }

  /**
   * Check if money is greater than another
   */
  greaterThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount > other.amount;
  }

  /**
   * Check if money is less than another
   */
  lessThan(other: Money): boolean {
    this.ensureSameCurrency(other);
    return this.amount < other.amount;
  }

  /**
   * Check if money is equal to another
   */
  equals(other: Money): boolean {
    return (
      this.currency === other.currency &&
      this.roundAmount(this.amount) === this.roundAmount(other.amount)
    );
  }

  /**
   * Get absolute value (creates new instance)
   */
  absolute(): Money {
    return new Money(Math.abs(this.amount), this.currency);
  }

  /**
   * Format money for display
   */
  format(locale: string = 'en-US', options?: Intl.NumberFormatOptions): string {
    const defaultOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };

    return new Intl.NumberFormat(locale, { ...defaultOptions, ...options }).format(
      this.amount
    );
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): MoneyProps {
    return {
      amount: this.amount,
      currency: this.currency
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(props: MoneyProps): Money {
    return new Money(props.amount, props.currency);
  }

  /**
   * Validate amount and currency
   */
  private validate(amount: number, currency: string): void {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new Error('Amount must be a valid number');
    }

    if (!Number.isFinite(amount)) {
      throw new Error('Amount must be finite');
    }

    if (!currency || typeof currency !== 'string' || currency.trim().length === 0) {
      throw new Error('Currency must be a non-empty string');
    }

    // Validate currency code format (3 letters)
    if (!/^[A-Z]{3}$/i.test(currency.trim())) {
      throw new Error('Currency must be a valid 3-letter currency code');
    }
  }

  /**
   * Ensure currencies match
   */
  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error(
        `Cannot perform operation on different currencies: ${this.currency} vs ${other.currency}`
      );
    }
  }

  /**
   * Round amount to 2 decimal places for monetary precision
   */
  private roundAmount(amount: number): number {
    return Math.round(amount * 100) / 100;
  }
}