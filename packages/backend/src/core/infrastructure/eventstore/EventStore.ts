// packages/backend/src/core/infrastructure/eventstore/EventStore.ts

import { IEvent, IEventStore, IEventStream } from '../../domain/shared/events/IEventBus';
import { Logger } from '@nestjs/common';

/**
 * In-memory Event Store implementation
 * Provides event persistence and replay capabilities for event sourcing
 */

export class EventStore implements IEventStore {
  private readonly logger = new Logger(EventStore.name);
  private readonly events: Map<string, IEventStream> = new Map();
  private readonly snapshots: Map<string, any> = new Map();
  private readonly eventSubscriptions: Map<string, Array<(event: IEvent) => void>> = new Map();

  constructor(
    private readonly config: {
      maxEventsPerStream: number;
      snapshotInterval: number;
      enableCompression: boolean;
    }
  ) {
    this.logger.log('EventStore initialized');
  }

  /**
   * Save an event to a stream
   */
  async saveEvent(streamId: string, event: IEvent): Promise<void> {
    this.logger.log(`Saving event ${event.id} to stream ${streamId}`);

    try {
      // Get or create event stream
      let stream = this.events.get(streamId);
      if (!stream) {
        stream = {
          streamId,
          aggregateId: event.aggregateId,
          aggregateType: event.aggregateType,
          version: 0,
          events: [],
          createdAt: new Date(),
          lastUpdated: new Date()
        };
        this.events.set(streamId, stream);
      }

      // Validate event sequence
      if (event.metadata.version !== stream.version + 1) {
        throw new Error(`Event version mismatch. Expected ${stream.version + 1}, got ${event.metadata.version}`);
      }

      // Add event to stream
      stream.events.push(event);
      stream.version = event.metadata.version;
      stream.lastUpdated = new Date();

      // Check if snapshot is needed
      if (this.shouldCreateSnapshot(stream)) {
        await this.createSnapshot(streamId, stream);
      }

      // Trim old events if needed
      if (stream.events.length > this.config.maxEventsPerStream) {
        await this.trimStream(stream);
      }

      // Notify subscribers
      await this.notifySubscribers(streamId, event);

      this.logger.log(`Successfully saved event ${event.id} to stream ${streamId} at version ${stream.version}`);
    } catch (error) {
      this.logger.error(`Failed to save event ${event.id} to stream ${streamId}`, error);
      throw error;
    }
  }

  /**
   * Get events for a stream
   */
  async getEvents(
    streamId: string,
    fromVersion?: number,
    toVersion?: number
  ): Promise<IEvent[]> {
    this.logger.log(`Getting events for stream ${streamId}`);

    try {
      const stream = this.events.get(streamId);
      if (!stream) {
        return [];
      }

      let events = stream.events;

      // Apply version filters
      if (fromVersion !== undefined) {
        events = events.filter(event => event.metadata.version >= fromVersion);
      }
      if (toVersion !== undefined) {
        events = events.filter(event => event.metadata.version <= toVersion);
      }

      return events;
    } catch (error) {
      this.logger.error(`Failed to get events for stream ${streamId}`, error);
      throw error;
    }
  }

  /**
   * Get event stream information
   */
  async getStream(streamId: string): Promise<IEventStream | null> {
    return this.events.get(streamId) || null;
  }

  /**
   * Create a snapshot for an event stream
   */
  async createSnapshot(streamId: string, stream: IEventStream): Promise<void> {
    this.logger.log(`Creating snapshot for stream ${streamId} at version ${stream.version}`);

    try {
      const snapshot = {
        streamId,
        aggregateId: stream.aggregateId,
        aggregateType: stream.aggregateType,
        version: stream.version,
        data: this.extractAggregateState(stream),
        createdAt: new Date(),
        eventCount: stream.events.length
      };

      this.snapshots.set(streamId, snapshot);
      this.logger.log(`Successfully created snapshot for stream ${streamId}`);
    } catch (error) {
      this.logger.error(`Failed to create snapshot for stream ${streamId}`, error);
      throw error;
    }
  }

  /**
   * Get latest snapshot for a stream
   */
  async getSnapshot(streamId: string): Promise<any | null> {
    return this.snapshots.get(streamId) || null;
  }

  /**
   * Replay events from a stream
   */
  async replayEvents(
    streamId: string,
    fromVersion?: number,
    toVersion?: number,
    eventHandler?: (event: IEvent) => void
  ): Promise<void> {
    this.logger.log(`Replaying events for stream ${streamId}`);

    try {
      const events = await this.getEvents(streamId, fromVersion, toVersion);

      // Start from latest snapshot if available
      let snapshot = null;
      if (fromVersion && fromVersion > 1) {
        snapshot = await this.getSnapshot(streamId);
        if (snapshot && snapshot.version >= fromVersion) {
          // Replay state from snapshot
          if (eventHandler) {
            // This would normally rebuild the aggregate from snapshot data
            this.logger.log(`Replaying from snapshot version ${snapshot.version}`);
          }
        }
      }

      // Replay events
      for (const event of events) {
        if (eventHandler) {
          await eventHandler(event);
        }
        await this.notifySubscribers(streamId, event);
      }

      this.logger.log(`Successfully replayed ${events.length} events for stream ${streamId}`);
    } catch (error) {
      this.logger.error(`Failed to replay events for stream ${streamId}`, error);
      throw error;
    }
  }

  /**
   * Subscribe to events for a stream
   */
  async subscribe(streamId: string, handler: (event: IEvent) => void): Promise<string> {
    const subscriptionId = require('uuid').v4();

    if (!this.eventSubscriptions.has(streamId)) {
      this.eventSubscriptions.set(streamId, []);
    }

    const subscriptions = this.eventSubscriptions.get(streamId)!;
    subscriptions.push(handler);

    this.logger.log(`Subscribed to stream ${streamId} with subscription ID ${subscriptionId}`);
    return subscriptionId;
  }

  /**
   * Unsubscribe from events for a stream
   */
  async unsubscribe(streamId: string, subscriptionId: string): Promise<void> {
    const subscriptions = this.eventSubscriptions.get(streamId);
    if (subscriptions) {
      const index = subscriptions.findIndex(handler => {
        // This is a simplified check - in practice, you'd need a proper handler reference
        return true; // This would be implemented with proper handler comparison
      });

      if (index !== -1) {
        subscriptions.splice(index, 1);
        this.logger.log(`Unsubscribed from stream ${streamId} with subscription ID ${subscriptionId}`);
      }
    }
  }

  /**
   * Get all streams
   */
  async getAllStreams(): Promise<IEventStream[]> {
    return Array.from(this.events.values());
  }

  /**
   * Delete a stream and all its data
   */
  async deleteStream(streamId: string): Promise<void> {
    this.logger.log(`Deleting stream ${streamId}`);

    this.events.delete(streamId);
    this.snapshots.delete(streamId);
    this.eventSubscriptions.delete(streamId);

    this.logger.log(`Successfully deleted stream ${streamId}`);
  }

  /**
   * Get event store statistics
   */
  async getStats(): Promise<{
    totalStreams: number;
    totalEvents: number;
    totalSnapshots: number;
    memoryUsage: number;
    oldestEvent: Date | null;
    newestEvent: Date | null;
  }> {
    const totalStreams = this.events.size;
    let totalEvents = 0;
    let oldestEvent: Date | null = null;
    let newestEvent: Date | null = null;

    for (const stream of this.events.values()) {
      totalEvents += stream.events.length;

      if (stream.events.length > 0) {
        const streamOldest = stream.events[0].metadata.timestamp;
        const streamNewest = stream.events[stream.events.length - 1].metadata.timestamp;

        if (!oldestEvent || streamOldest < oldestEvent) {
          oldestEvent = streamOldest;
        }
        if (!newestEvent || streamNewest > newestEvent) {
          newestEvent = streamNewest;
        }
      }
    }

    return {
      totalStreams,
      totalEvents,
      totalSnapshots: this.snapshots.size,
      memoryUsage: this.calculateMemoryUsage(),
      oldestEvent,
      newestEvent
    };
  }

  /**
   * Clear all data (for testing)
   */
  async clear(): Promise<void> {
    this.logger.log('Clearing event store');
    this.events.clear();
    this.snapshots.clear();
    this.eventSubscriptions.clear();
  }

  /**
   * Check if snapshot should be created
   */
  private shouldCreateSnapshot(stream: IEventStream): boolean {
    return stream.events.length % this.config.snapshotInterval === 0;
  }

  /**
   * Trim old events from stream
   */
  private async trimStream(stream: IEventStream): Promise<void> {
    const excessCount = stream.events.length - this.config.maxEventsPerStream;
    if (excessCount > 0) {
      const removedEvents = stream.events.splice(0, excessCount);
      this.logger.log(`Trimmed ${removedEvents.length} old events from stream ${stream.streamId}`);
    }
  }

  /**
   * Extract aggregate state from events
   */
  private extractAggregateState(stream: IEventStream): any {
    // This would rebuild the aggregate state from events
    // For now, returning a placeholder
    return {
      aggregateId: stream.aggregateId,
      aggregateType: stream.aggregateType,
      version: stream.version,
      lastUpdated: stream.lastUpdated,
      eventCount: stream.events.length
    };
  }

  /**
   * Notify subscribers of events
   */
  private async notifySubscribers(streamId: string, event: IEvent): Promise<void> {
    const subscriptions = this.eventSubscriptions.get(streamId);
    if (subscriptions) {
      for (const handler of subscriptions) {
        try {
          await handler(event);
        } catch (error) {
          this.logger.error(`Error in event subscriber for stream ${streamId}`, error);
        }
      }
    }
  }

  /**
   * Calculate memory usage estimate
   */
  private calculateMemoryUsage(): number {
    let size = 0;

    // Estimate events size
    for (const stream of this.events.values()) {
      size += stream.events.length * 1000; // Rough estimate per event
    }

    // Estimate snapshots size
    for (const snapshot of this.snapshots.values()) {
      size += 5000; // Rough estimate per snapshot
    }

    return size;
  }

  /**
   * Get events by aggregate type
   */
  async getEventsByAggregateType(aggregateType: string): Promise<IEvent[]> {
    const allEvents: IEvent[] = [];

    for (const stream of this.events.values()) {
      if (stream.aggregateType === aggregateType) {
        allEvents.push(...stream.events);
      }
    }

    return allEvents.sort((a, b) =>
      a.metadata.timestamp.getTime() - b.metadata.timestamp.getTime()
    );
  }

  /**
   * Get events by date range
   */
  async getEventsByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<IEvent[]> {
    const allEvents: IEvent[] = [];

    for (const stream of this.events.values()) {
      const filteredEvents = stream.events.filter(event =>
        event.metadata.timestamp >= startDate && event.metadata.timestamp <= endDate
      );
      allEvents.push(...filteredEvents);
    }

    return allEvents.sort((a, b) =>
      a.metadata.timestamp.getTime() - b.metadata.timestamp.getTime()
    );
  }

  /**
   * Get events for correlation tracking
   */
  async getEventsByCorrelationId(correlationId: string): Promise<IEvent[]> {
    const allEvents: IEvent[] = [];

    for (const stream of this.events.values()) {
      const filteredEvents = stream.events.filter(event =>
        event.metadata.correlationId === correlationId
      );
      allEvents.push(...filteredEvents);
    }

    return allEvents.sort((a, b) =>
      a.metadata.timestamp.getTime() - b.metadata.timestamp.getTime()
    );
  }
}