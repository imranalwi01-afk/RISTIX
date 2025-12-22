// packages/backend/src/core/domain/shared/events/BaseEvent.ts

import { IEvent } from './IEvent';
import { v4 as uuidv4 } from 'uuid';

/**
 * Base class for all domain events
 * Provides common event functionality and validation
 */
export abstract class BaseEvent implements IEvent {
  public readonly id: string;
  public readonly type: string;
  public readonly aggregateId: string;
  public readonly aggregateType: string;
  public readonly data: any;
  public readonly metadata: {
    timestamp: Date;
    userId?: string;
    tenantId?: string;
    version: number;
    correlationId?: string;
  };

  constructor(
    aggregateId: string,
    aggregateType: string,
    data: any,
    options?: {
      userId?: string;
      tenantId?: string;
      correlationId?: string;
      version?: number;
    }
  ) {
    this.id = uuidv4();
    this.type = this.constructor.name;
    this.aggregateId = aggregateId;
    this.aggregateType = aggregateType;
    this.data = data;
    this.metadata = {
      timestamp: new Date(),
      userId: options?.userId,
      tenantId: options?.tenantId,
      version: options?.version || 1,
      correlationId: options?.correlationId
    };
  }

  /**
   * Validate the event data
   * Override in concrete event classes
   */
  protected abstract validate(): void;

  /**
   * Get event version
   */
  getVersion(): number {
    return this.metadata.version;
  }

  /**
   * Check if this event is for a specific tenant
   */
  isForTenant(tenantId: string): boolean {
    return this.metadata.tenantId === tenantId;
  }

  /**
   * Check if this event is correlated with another event
   */
  isCorrelatedWith(event: IEvent): boolean {
    return this.metadata.correlationId === event.metadata.correlationId;
  }

  /**
   * Convert event to JSON for serialization
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      type: this.type,
      aggregateId: this.aggregateId,
      aggregateType: this.aggregateType,
      data: this.data,
      metadata: this.metadata
    };
  }

  /**
   * Create event from JSON for deserialization
   */
  static fromJSON<T extends BaseEvent>(
    this: new (...args: any[]) => T,
    json: Record<string, any>
  ): T {
    const event = new this(
      json.aggregateId,
      json.aggregateType,
      json.data,
      {
        userId: json.metadata?.userId,
        tenantId: json.metadata?.tenantId,
        correlationId: json.metadata?.correlationId,
        version: json.metadata?.version
      }
    );
    // Restore the original ID and timestamp
    (event as any).id = json.id;
    (event as any).metadata.timestamp = new Date(json.metadata.timestamp);
    return event;
  }
}