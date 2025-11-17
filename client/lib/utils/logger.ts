/**
 * Centralized logging utility for OctaPulse
 * Logs only in development mode, prevents console noise in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  /**
   * General log message (development only)
   */
  log(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.log(`[OctaPulse] ${message}`, ...args);
    }
  }

  /**
   * Info message (development only)
   */
  info(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.info(`[OctaPulse] ${message}`, ...args);
    }
  }

  /**
   * Warning message (always logged)
   */
  warn(message: string, ...args: any[]): void {
    console.warn(`[OctaPulse] ${message}`, ...args);
  }

  /**
   * Error message (always logged)
   * In production, could be sent to error tracking service
   */
  error(message: string, ...args: any[]): void {
    console.error(`[OctaPulse] ${message}`, ...args);

    // TODO: In production, send to error tracking service (Sentry, LogRocket, etc.)
    // if (!this.isDevelopment) {
    //   errorTrackingService.captureError(message, args);
    // }
  }

  /**
   * Debug message (development only)
   */
  debug(message: string, ...args: any[]): void {
    if (this.isDevelopment) {
      console.debug(`[OctaPulse] 🐛 ${message}`, ...args);
    }
  }

  /**
   * API request log (development only)
   */
  apiRequest(method: string, url: string, data?: any): void {
    if (this.isDevelopment) {
      console.log(`[OctaPulse] 📡 API ${method.toUpperCase()} ${url}`, data || '');
    }
  }

  /**
   * API response log (development only)
   */
  apiResponse(status: number, url: string, data?: any): void {
    if (this.isDevelopment) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`[OctaPulse] ${emoji} API ${status} ${url}`, data || '');
    }
  }

  /**
   * API error log (always logged)
   */
  apiError(error: any, context?: string): void {
    const contextStr = context ? ` [${context}]` : '';
    console.error(`[OctaPulse]${contextStr} API Error:`, error);
  }

  /**
   * Performance measurement (development only)
   */
  performance(label: string, durationMs: number): void {
    if (this.isDevelopment) {
      console.log(`[OctaPulse] ⚡ Performance: ${label} took ${durationMs.toFixed(2)}ms`);
    }
  }

  /**
   * Group start (development only)
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(`[OctaPulse] ${label}`);
    }
  }

  /**
   * Group end (development only)
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Export default for convenience
export default logger;
