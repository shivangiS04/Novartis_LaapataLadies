/**
 * Logger Utility
 */
import { ILogger } from '../interfaces/components';
export declare class Logger implements ILogger {
    private context;
    constructor(context: string);
    info(message: string, context?: Record<string, unknown>): void;
    warn(message: string, context?: Record<string, unknown>): void;
    error(message: string, error?: Error, context?: Record<string, unknown>): void;
    debug(message: string, context?: Record<string, unknown>): void;
}
export declare const createLogger: (context: string) => ILogger;
//# sourceMappingURL=logger.d.ts.map