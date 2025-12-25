"use strict";
/**
 * Event Bus Service
 * Handles event publishing and subscription
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const logger_1 = require("../utils/logger");
class EventBus {
    constructor() {
        this.handlers = new Map();
        this.logger = (0, logger_1.createLogger)('EventBus');
    }
    async publish(eventType, payload) {
        this.logger.debug(`Publishing event: ${eventType}`, { payload });
        const eventHandlers = this.handlers.get(eventType);
        if (!eventHandlers || eventHandlers.size === 0) {
            this.logger.debug(`No handlers registered for event: ${eventType}`);
            return;
        }
        const promises = Array.from(eventHandlers).map((handler) => handler(payload).catch((error) => {
            this.logger.error(`Error in event handler for ${eventType}`, error);
        }));
        await Promise.all(promises);
    }
    subscribe(eventType, handler) {
        if (!this.handlers.has(eventType)) {
            this.handlers.set(eventType, new Set());
        }
        this.handlers.get(eventType).add(handler);
        this.logger.debug(`Handler subscribed to event: ${eventType}`);
    }
    unsubscribe(eventType, handler) {
        const eventHandlers = this.handlers.get(eventType);
        if (eventHandlers) {
            eventHandlers.delete(handler);
            this.logger.debug(`Handler unsubscribed from event: ${eventType}`);
        }
    }
}
exports.EventBus = EventBus;
//# sourceMappingURL=EventBus.js.map