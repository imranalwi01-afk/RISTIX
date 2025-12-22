// packages/backend/src/core/domain/shared/events/IEventBus.ts

/**
 * Interface for Event Bus implementation
 * Handles publishing and subscribing to domain events
 */

export interface IEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: any;
  metadata: {
    timestamp: Date;
    userId?: string;
    tenantId?: string;
    version: number;
    correlationId?: string;
  };
}

export interface IEventHandler<T extends IEvent = IEvent> {
  handle(event: T): Promise<void>;
  eventType: string;
}

export interface IEventSubscription {
  id: string;
  eventType: string;
  handler: IEventHandler;
  filter?: (event: IEvent) => boolean;
}

export interface IEventBus {
  /**
   * Publish an event to the event bus
   */
  publish(event: IEvent): Promise<void>;

  /**
   * Subscribe to events of a specific type
   */
  subscribe<T extends IEvent>(
    eventType: string,
    handler: IEventHandler<T>,
    filter?: (event: T) => boolean
  ): Promise<IEventSubscription>;

  /**
   * Unsubscribe from events
   */
  unsubscribe(subscriptionId: string): Promise<void>;

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): IEventSubscription[];

  /**
   * Clear all subscriptions
   */
  clear(): Promise<void>;
}

export interface IEventStore {
  /**
   * Store an event
   */
  save(event: IEvent): Promise<void>;

  /**
   * Get events for an aggregate
   */
  getEvents(aggregateId: string, fromVersion?: number): Promise<IEvent[]>;

  /**
   * Get events by type
   */
  getEventsByType(eventType: string, fromTimestamp?: Date): Promise<IEvent[]>;

  /**
   * Get events for a tenant
   */
  getTenantEvents(tenantId: string, fromTimestamp?: Date): Promise<IEvent[]>;
}

export interface IEventPublisher {
  publish(event: IEvent): Promise<void>;
  publishBatch(events: IEvent[]): Promise<void>;
}

export interface IEventDispatcher {
  dispatch(event: IEvent): Promise<void>;
  registerHandler(eventType: string, handler: IEventHandler): void;
  unregisterHandler(eventType: string, handler: IEventHandler): void;
}