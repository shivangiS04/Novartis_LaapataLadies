/**
 * Logger Utility
 */

import { ILogger } from '../interfaces/components';

export class Logger implements ILogger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.log(`[INFO] [${this.context}] ${message}`, context || '');
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(`[WARN] [${this.context}] ${message}`, context || '');
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    console.error(`[ERROR] [${this.context}] ${message}`, error, context || '');
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.DEBUG) {
      console.debug(`[DEBUG] [${this.context}] ${message}`, context || '');
    }
  }
}

export const createLogger = (context: string): ILogger => {
  return new Logger(context);
};
