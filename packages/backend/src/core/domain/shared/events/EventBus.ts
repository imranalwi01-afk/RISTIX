// packages/backend/src/core/domain/shared/events/EventBus.ts

import { IEvent, IEventBus, IEventHandler, IEventSubscription } from './IEventBus';
import { v4 as uuidv4 } from 'uuid';

/**
 * In-memory Event Bus implementation
 * Handles publishing and subscribing to domain events
 */
export class EventBus implements IEventBus {
  private subscriptions: Map<string, IEventSubscription> = new Map();
  private eventTypeSubscriptions: Map<string, IEventSubscription[]> = new Map();

  /**
   * Publish an event to the event bus
   */
  async publish(event: IEvent): Promise<void> {
    const subscriptions = this.eventTypeSubscriptions.get(event.type) || [];

    // Create array of handler promises for concurrent execution
    const handlerPromises = subscriptions
      .filter(sub => !sub.filter || sub.filter(event))
      .map(async (subscription) => {
        try {
          await subscription.handler.handle(event);
        } catch (error) {
          console.error(`Error handling event ${event.type} in subscription ${subscription.id}:`, error);
          // In production, you might want to implement retry logic or dead letter queue
        }
      });

    // Wait for all handlers to complete
    await Promise.allSettled(handlerPromises);
  }

  /**
   * Subscribe to events of a specific type
   */
  async subscribe<T extends IEvent>(
    eventType: string,
    handler: IEventHandler<T>,
    filter?: (event: T) => boolean
  ): Promise<IEventSubscription> {
    const subscriptionId = uuidv4();
    const subscription: IEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      filter
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Add to event type index
    if (!this.eventTypeSubscriptions.has(eventType)) {
      this.eventTypeSubscriptions.set(eventType, []);
    }
    this.eventTypeSubscriptions.get(eventType)!.push(subscription);

    return subscription;
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }

    // Remove from main subscriptions map
    this.subscriptions.delete(subscriptionId);

    // Remove from event type index
    const eventTypeSubscriptions = this.eventTypeSubscriptions.get(subscription.eventType);
    if (eventTypeSubscriptions) {
      const index = eventTypeSubscriptions.findIndex(sub => sub.id === subscriptionId);
      if (index !== -1) {
        eventTypeSubscriptions.splice(index, 1);
      }
    }
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): IEventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Clear all subscriptions
   */
  async clear(): Promise<void> {
    this.subscriptions.clear();
    this.eventTypeSubscriptions.clear();
  }

  /**
   * Get subscription count for an event type
   */
  getSubscriptionCount(eventType: string): number {
    return this.eventTypeSubscriptions.get(eventType)?.length || 0;
  }

  /**
   * Get all event types that have subscriptions
   */
  getSubscribedEventTypes(): string[] {
    return Array.from(this.eventTypeSubscriptions.keys());
  }

  /**
   * Check if there are any subscriptions for an event type
   */
  hasSubscriptions(eventType: string): boolean {
    return this.getSubscriptionCount(eventType) > 0;
  }
}

/**
 * Redis-backed Event Bus implementation
 * For distributed systems and persistence
 */
export class RedisEventBus implements IEventBus {
  private subscriptions: Map<string, IEventSubscription> = new Map();
  private redis: any; // Redis client instance
  private channelPrefix: string;

  constructor(redis: any, channelPrefix: string = 'events') {
    this.redis = redis;
    this.channelPrefix = channelPrefix;
  }

  /**
   * Publish an event to Redis
   */
  async publish(event: IEvent): Promise<void> {
    const channel = `${this.channelPrefix}:${event.type}`;
    const message = JSON.stringify(event);

    // Publish to Redis channel
    await this.redis.publish(channel, message);

    // Also handle local subscriptions
    await this.handleLocalEvent(event);
  }

  /**
   * Subscribe to events from Redis
   */
  async subscribe<T extends IEvent>(
    eventType: string,
    handler: IEventHandler<T>,
    filter?: (event: T) => boolean
  ): Promise<IEventSubscription> {
    const subscriptionId = uuidv4();
    const subscription: IEventSubscription = {
      id: subscriptionId,
      eventType,
      handler,
      filter
    };

    this.subscriptions.set(subscriptionId, subscription);

    // Subscribe to Redis channel
    const channel = `${this.channelPrefix}:${eventType}`;

    // This would need to be implemented based on your Redis client library
    // Example implementation pattern:
    /*
    this.redis.subscribe(channel, (message: string) => {
      try {
        const event = JSON.parse(message);
        if (!filter || filter(event)) {
          await handler.handle(event);
        }
      } catch (error) {
        console.error(`Error handling Redis event ${eventType}:`, error);
      }
    });
    */

    return subscription;
  }

  /**
   * Unsubscribe from events
   */
  async unsubscribe(subscriptionId: string): Promise<void> {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }

    // Remove from local subscriptions
    this.subscriptions.delete(subscriptionId);

    // Unsubscribe from Redis channel
    const channel = `${this.channelPrefix}:${subscription.eventType}`;
    await this.redis.unsubscribe(channel);
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): IEventSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  /**
   * Clear all subscriptions
   */
  async clear(): Promise<void> {
    // Unsubscribe from all Redis channels
    const channels = this.getSubscriptions().map(sub => `${this.channelPrefix}:${sub.eventType}`);
    if (channels.length > 0) {
      await this.redis.unsubscribe(...channels);
    }

    this.subscriptions.clear();
  }

  /**
   * Handle local event processing
   */
  private async handleLocalEvent(event: IEvent): Promise<void> {
    const localSubscriptions = Array.from(this.subscriptions.values())
      .filter(sub => sub.eventType === event.type)
      .filter(sub => !sub.filter || sub.filter(event));

    const handlerPromises = localSubscriptions.map(async (subscription) => {
      try {
        await subscription.handler.handle(event);
      } catch (error) {
        console.error(`Error handling local event ${event.type}:`, error);
      }
    });

    await Promise.allSettled(handlerPromises);
  }
}

/**
 * Factory for creating Event Bus instances
 */
export class EventBusFactory {
  /**
   * Create an in-memory event bus
   */
  static createInMemory(): IEventBus {
    return new EventBus();
  }

  /**
   * Create a Redis-backed event bus
   */
  static createRedis(redis: any, channelPrefix?: string): IEventBus {
    return new RedisEventBus(redis, channelPrefix);
  }

  /**
   * Create event bus based on configuration
   */
  static create(config: {
    type: 'memory' | 'redis';
    redis?: any;
    channelPrefix?: string;
  }): IEventBus {
    switch (config.type) {
      case 'memory':
        return this.createInMemory();
      case 'redis':
        if (!config.redis) {
          throw new Error('Redis client is required for Redis event bus');
        }
        return this.createRedis(config.redis, config.channelPrefix);
      default:
        throw new Error(`Unsupported event bus type: ${config.type}`);
    }
  }
}