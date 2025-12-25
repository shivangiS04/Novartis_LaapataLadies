/**
 * Event Bus Service
 * Handles event publishing and subscription
 */
import { IEventBus } from '../interfaces/components';
type EventHandler = (payload: Record<string, unknown>) => Promise<void>;
export declare class EventBus implements IEventBus {
    private handlers;
    private logger;
    publish(eventType: string, payload: Record<string, unknown>): Promise<void>;
    subscribe(eventType: string, handler: EventHandler): void;
    unsubscribe(eventType: string, handler: EventHandler): void;
}
export {};
//# sourceMappingURL=EventBus.d.ts.map