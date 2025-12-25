/**
 * Event Bus Service
 * Handles event publishing and subscription
 */

import { IEventBus } from '../interfaces/components';
import { createLogger } from '../utils/logger';

type EventHandler = (payload: Record<string, unknown>) => Promise<void>;

export class EventBus implements IEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private logger = createLogger('EventBus');

  async publish(eventType: string, payload: Record<string, unknown>): Promise<void> {
    this.logger.debug(`Publishing event: ${eventType}`, { payload });

    const eventHandlers = this.handlers.get(eventType);
    if (!eventHandlers || eventHandlers.size === 0) {
      this.logger.debug(`No handlers registered for event: ${eventType}`);
      return;
    }

    const promises = Array.from(eventHandlers).map((handler) =>
      handler(payload).catch((error) => {
        this.logger.error(`Error in event handler for ${eventType}`, error as Error);
      })
    );

    await Promise.all(promises);
  }

  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler);
    this.logger.debug(`Handler subscribed to event: ${eventType}`);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const eventHandlers = this.handlers.get(eventType);
    if (eventHandlers) {
      eventHandlers.delete(handler);
      this.logger.debug(`Handler unsubscribed from event: ${eventType}`);
    }
  }
}
