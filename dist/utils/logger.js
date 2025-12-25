"use strict";
/**
 * Logger Utility
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLogger = exports.Logger = void 0;
class Logger {
    constructor(context) {
        this.context = context;
    }
    info(message, context) {
        console.log(`[INFO] [${this.context}] ${message}`, context || '');
    }
    warn(message, context) {
        console.warn(`[WARN] [${this.context}] ${message}`, context || '');
    }
    error(message, error, context) {
        console.error(`[ERROR] [${this.context}] ${message}`, error, context || '');
    }
    debug(message, context) {
        if (process.env.DEBUG) {
            console.debug(`[DEBUG] [${this.context}] ${message}`, context || '');
        }
    }
}
exports.Logger = Logger;
const createLogger = (context) => {
    return new Logger(context);
};
exports.createLogger = createLogger;
//# sourceMappingURL=logger.js.map