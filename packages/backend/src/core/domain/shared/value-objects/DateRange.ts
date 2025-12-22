// packages/backend/src/core/domain/shared/value-objects/DateRange.ts

/**
 * DateRange Value Object - Immutable date range with validation
 * Follows Value Object pattern: equality based on start and end dates
 */

export interface DateRangeProps {
  startDate: Date;
  endDate: Date;
}

export class DateRange {
  public readonly startDate: Date;
  public readonly endDate: Date;

  constructor(startDate: Date, endDate: Date) {
    this.validate(startDate, endDate);
    this.startDate = new Date(startDate);
    this.endDate = new Date(endDate);
  }

  /**
   * Create a DateRange instance
   */
  static create(startDate: Date, endDate: Date): DateRange {
    return new DateRange(startDate, endDate);
  }

  /**
   * Create a DateRange from strings
   */
  static fromStrings(startDateStr: string, endDateStr: string): DateRange {
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    return new DateRange(startDate, endDate);
  }

  /**
   * Create a DateRange from timestamps
   */
  static fromTimestamps(startTimestamp: number, endTimestamp: number): DateRange {
    const startDate = new Date(startTimestamp);
    const endDate = new Date(endTimestamp);
    return new DateRange(startDate, endDate);
  }

  /**
   * Create a DateRange for today (single day)
   */
  static today(): DateRange {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    return new DateRange(startOfDay, endOfDay);
  }

  /**
   * Create a DateRange for this month
   */
  static thisMonth(): DateRange {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return new DateRange(startOfMonth, endOfMonth);
  }

  /**
   * Create a DateRange for this year
   */
  static thisYear(): DateRange {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    const endOfYear = new Date(today.getFullYear() + 1, 0, 1);
    return new DateRange(startOfYear, endOfYear);
  }

  /**
   * Create a DateRange for the last N days
   */
  static lastDays(days: number): DateRange {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    return new DateRange(startDate, endDate);
  }

  /**
   * Get the duration in days
   */
  getDurationInDays(): number {
    const msInDay = 24 * 60 * 60 * 1000;
    return Math.ceil((this.endDate.getTime() - this.startDate.getTime()) / msInDay);
  }

  /**
   * Get the duration in months (approximate)
   */
  getDurationInMonths(): number {
    const yearDiff = this.endDate.getFullYear() - this.startDate.getFullYear();
    const monthDiff = this.endDate.getMonth() - this.startDate.getMonth();
    return yearDiff * 12 + monthDiff;
  }

  /**
   * Get the duration in years (approximate)
   */
  getDurationInYears(): number {
    return this.getDurationInMonths() / 12;
  }

  /**
   * Check if a date is within the range
   */
  includes(date: Date): boolean {
    return date >= this.startDate && date < this.endDate;
  }

  /**
   * Check if this range overlaps with another
   */
  overlaps(other: DateRange): boolean {
    return this.startDate < other.endDate && this.endDate > other.startDate;
  }

  /**
   * Get the intersection with another range
   */
  intersection(other: DateRange): DateRange | null {
    if (!this.overlaps(other)) {
      return null;
    }

    const intersectionStart = new Date(Math.max(this.startDate.getTime(), other.startDate.getTime()));
    const intersectionEnd = new Date(Math.min(this.endDate.getTime(), other.endDate.getTime()));

    return new DateRange(intersectionStart, intersectionEnd);
  }

  /**
   * Get the union with another range
   */
  union(other: DateRange): DateRange {
    if (!this.overlaps(other)) {
      throw new Error('Cannot create union of non-overlapping date ranges');
    }

    const unionStart = new Date(Math.min(this.startDate.getTime(), other.startDate.getTime()));
    const unionEnd = new Date(Math.max(this.endDate.getTime(), other.endDate.getTime()));

    return new DateRange(unionStart, unionEnd);
  }

  /**
   * Extend the range by a number of days
   */
  extend(days: number): DateRange {
    const newStartDate = new Date(this.startDate);
    const newEndDate = new Date(this.endDate);
    newStartDate.setDate(newStartDate.getDate() - days);
    newEndDate.setDate(newEndDate.getDate() + days);
    return new DateRange(newStartDate, newEndDate);
  }

  /**
   * Shift the range by a number of days
   */
  shift(days: number): DateRange {
    const newStartDate = new Date(this.startDate);
    const newEndDate = new Date(this.endDate);
    newStartDate.setDate(newStartDate.getDate() + days);
    newEndDate.setDate(newEndDate.getDate() + days);
    return new DateRange(newStartDate, newEndDate);
  }

  /**
   * Check if this range is before another date
   */
  isBefore(date: Date): boolean {
    return this.endDate <= date;
  }

  /**
   * Check if this range is after another date
   */
  isAfter(date: Date): boolean {
    return this.startDate >= date;
  }

  /**
   * Check if this range is equal to another
   */
  equals(other: DateRange): boolean {
    return this.startDate.getTime() === other.startDate.getTime() &&
           this.endDate.getTime() === other.endDate.getTime();
  }

  /**
   * Get the start date as ISO string
   */
  getStartDateISO(): string {
    return this.startDate.toISOString();
  }

  /**
   * Get the end date as ISO string
   */
  getEndDateISO(): string {
    return this.endDate.toISOString();
  }

  /**
   * Format date range for display
   */
  format(locale: string = 'en-US'): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };

    const startDateStr = this.startDate.toLocaleDateString(locale, options);
    const endDateStr = this.endDate.toLocaleDateString(locale, options);

    return `${startDateStr} - ${endDateStr}`;
  }

  /**
   * Convert to string representation
   */
  toString(): string {
    return `${this.startDate.toISOString()} - ${this.endDate.toISOString()}`;
  }

  /**
   * Convert to JSON
   */
  toJSON(): DateRangeProps {
    return {
      startDate: this.startDate,
      endDate: this.endDate
    };
  }

  /**
   * Create from JSON
   */
  static fromJSON(props: DateRangeProps): DateRange {
    return new DateRange(new Date(props.startDate), new Date(props.endDate));
  }

  /**
   * Validate date range
   */
  private validate(startDate: Date, endDate: Date): void {
    if (!(startDate instanceof Date) || isNaN(startDate.getTime())) {
      throw new Error('Start date must be a valid Date');
    }

    if (!(endDate instanceof Date) || isNaN(endDate.getTime())) {
      throw new Error('End date must be a valid Date');
    }

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }
  }

  /**
   * Check if this date range is in the past
   */
  isPast(): boolean {
    return this.endDate < new Date();
  }

  /**
   * Check if this date range is in the future
   */
  isFuture(): boolean {
    return this.startDate > new Date();
  }

  /**
   * Check if this date range contains the current date
   */
  isCurrent(): boolean {
    return this.includes(new Date());
  }
}