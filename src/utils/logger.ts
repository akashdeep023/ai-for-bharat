// Logging utility for development and production

import { config } from '@config/environment';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = config.enableLogging;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.isEnabled && level !== 'error') return;

    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

    switch (level) {
      case 'debug':
        console.debug(logMessage, data);
        break;
      case 'info':
        console.info(logMessage, data);
        break;
      case 'warn':
        console.warn(logMessage, data);
        break;
      case 'error':
        console.error(logMessage, data);
        break;
    }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.log('error', message, data);
  }
}

export const logger = new Logger();
