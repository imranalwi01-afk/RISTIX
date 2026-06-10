// ============================================================================
// IFRS9 FRONTEND - CENTRALIZED LOGGING SERVICE
// ============================================================================
// File Path: packages/frontend/src/services/logging.service.ts
// Purpose: Centralized logging for debugging, audit trail, and monitoring
// Features: Console logs, backend API logging, error tracking, route monitoring
// ============================================================================

import { getEnvironmentConfig } from '@/config/environment.config';
import { getAuthToken } from '../utils/auth-token';

// ✅ Log levels enum
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// ✅ Log category enum
export enum LogCategory {
  ROUTING = 'routing',
  AUTHENTICATION = 'authentication',
  API = 'api',
  USER_ACTION = 'user_action',
  SYSTEM = 'system',
  BANKING = 'banking',
  IFRS9 = 'ifrs9',
  PERFORMANCE = 'performance',
  SECURITY = 'security'
}

// ✅ Log entry interface
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
  userId?: string;
  userRole?: string;
  stakeholderType?: string;
  sessionId?: string;
  pathname?: string;
  userAgent?: string;
  environment: string;
}

// ✅ Centralized Logging Service
class CentralizedLoggingService {
  private config = getEnvironmentConfig();
  private sessionId: string;
  private logBuffer: LogEntry[] = [];
  private bufferSize = 100;
  private flushInterval = 30000; // 30 seconds
  private flushTimer?: NodeJS.Timeout;
  private isLogging = false;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeLogging();
  }

  // ✅ Initialize logging service
  private initializeLogging() {
    if (typeof window !== 'undefined') {
      // Set up periodic buffer flush
      this.flushTimer = setInterval(() => {
        this.flushBuffer();
      }, this.flushInterval);

      // Set up page unload handler to flush remaining logs
      window.addEventListener('beforeunload', () => {
        this.flushBuffer();
      });

      // Set up error capture
      window.addEventListener('error', (event) => {
        if (String(event.filename || '').includes('logging.service')) return;

        this.error(LogCategory.SYSTEM, 'Unhandled JavaScript Error', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: this.normalizeErrorLike(event.error),
        });
      });

      // Set up unhandled promise rejection capture
      window.addEventListener('unhandledrejection', (event) => {
        this.error(LogCategory.SYSTEM, 'Unhandled Promise Rejection', {
          reason: this.normalizeErrorLike(event.reason),
        });
      });

      if (this.config.app.environment === 'development') {
        console.log('🚀 Centralized Logging Service Initialized', {
          sessionId: this.sessionId,
          environment: this.config.app.environment,
          bufferSize: this.bufferSize,
          flushInterval: this.flushInterval
        });
      }
    }
  }

  // ✅ Generate unique session ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ✅ Get current user context
  private getCurrentUser() {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  private normalizeErrorLike(value: unknown): unknown {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack,
      };
    }

    if (value === null || value === undefined) return value;

    if (typeof value === 'object') {
      try {
        const record = value as Record<string, unknown>;
        const keys = Object.keys(record);
        if (keys.length === 0) {
          return { message: '[empty object]' };
        }
      } catch {
        return { message: '[uninspectable object]' };
      }
    }

    return value;
  }

  private sanitizeLogData(value: unknown): unknown {
    const seen = new WeakSet<object>();

    const sanitize = (item: unknown): unknown => {
      if (item === null || item === undefined) return item;
      if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') return item;
      if (typeof item === 'bigint') return item.toString();
      if (typeof item === 'function') return `[Function ${(item as Function).name || 'anonymous'}]`;
      if (item instanceof Error) return this.normalizeErrorLike(item);
      if (typeof Promise !== 'undefined' && item instanceof Promise) return '[Promise]';

      if (typeof item === 'object') {
        if (seen.has(item)) return '[Circular]';
        seen.add(item);

        if (typeof Event !== 'undefined' && item instanceof Event) {
          return {
            type: item.type,
            target: item.target ? '[EventTarget]' : null,
          };
        }

        if (Array.isArray(item)) {
          return item.map(sanitize);
        }

        return Object.fromEntries(
          Object.entries(item as Record<string, unknown>).map(([key, nestedValue]) => [key, sanitize(nestedValue)]),
        );
      }

      return String(item);
    };

    try {
      return sanitize(value);
    } catch (error) {
      return {
        message: 'Failed to sanitize log payload',
        error: this.normalizeErrorLike(error),
      };
    }
  }

  // ✅ Create log entry
  private createLogEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    data?: any
  ): LogEntry {
    const user = this.getCurrentUser();
    const id = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data: this.sanitizeLogData(data),
      userId: user?.id,
      userRole: user?.role,
      stakeholderType: user?.stakeholderType,
      sessionId: this.sessionId,
      pathname: typeof window !== 'undefined' ? window.location.pathname : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      environment: this.config.app.environment
    };
  }

  // ✅ Add log entry to buffer
  private addToBuffer(logEntry: LogEntry) {
    this.logBuffer.push(logEntry);

    // Maintain buffer size
    if (this.logBuffer.length > this.bufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.bufferSize);
    }

    // Auto-flush on critical errors
    if (logEntry.level === LogLevel.CRITICAL || logEntry.level === LogLevel.ERROR) {
      this.flushBuffer();
    }
  }

  // ✅ Flush log buffer to backend
  private async flushBuffer() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];
    const errorLogs = logsToSend.filter((entry) =>
      entry.level === LogLevel.ERROR || entry.level === LogLevel.CRITICAL
    );

    if (errorLogs.length === 0) return;

    if (this.config.features.auditTrail && typeof window !== 'undefined') {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${this.config.api.baseUrl}/monitoring/frontend-errors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken() || ''}`
          },
          body: JSON.stringify({ logs: errorLogs }),
          keepalive: true,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!response.ok && this.config.app.environment === 'development') {
          console.warn('Failed to send logs to backend:', response.statusText);
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        if (this.config.app.environment === 'production') return;
        if (this.config.app.environment === 'development') {
          console.warn('Error sending logs to backend:', error);
        }
        this.logBuffer = [...errorLogs, ...this.logBuffer];
      }
    }
  }

  // ✅ Console formatting for development
  private formatConsoleMessage(logEntry: LogEntry): string {
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const emoji = this.getLevelEmoji(logEntry.level);
    const category = `[${logEntry.category.toUpperCase()}]`;

    return `${emoji} ${timestamp} ${category} ${logEntry.message}`;
  }

  // ✅ Get emoji for log level
  private getLevelEmoji(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: return '🐛';
      case LogLevel.INFO: return 'ℹ️';
      case LogLevel.WARN: return '⚠️';
      case LogLevel.ERROR: return '❌';
      case LogLevel.CRITICAL: return '🚨';
      default: return 'ℹ️';
    }
  }

  // ✅ Log to console in development
  private logToConsole(logEntry: LogEntry) {
    if (this.config.app.environment !== 'development') return;

    try {
      const message = this.formatConsoleMessage(logEntry);
      const data = logEntry.data;
      const isGlobalCapture =
        logEntry.category === LogCategory.SYSTEM &&
        (logEntry.message === 'Unhandled JavaScript Error' || logEntry.message === 'Unhandled Promise Rejection');

      switch (logEntry.level) {
        case LogLevel.DEBUG:
          console.debug(message, data);
          break;
        case LogLevel.INFO:
          console.info(message, data);
          break;
        case LogLevel.WARN:
          console.warn(message, data);
          break;
        case LogLevel.ERROR:
        case LogLevel.CRITICAL:
          // Avoid making Next dev overlay point at the logger instead of the original error.
          if (isGlobalCapture) {
            console.warn(message, data);
          } else {
            console.error(message, data);
          }
          break;
        default:
          console.log(message, data);
      }
    } catch (error) {
      console.warn('Logging console output failed', this.normalizeErrorLike(error));
    }
  }

  // ✅ Main logging method
  private log(level: LogLevel, category: LogCategory, message: string, data?: any) {
    if (this.isLogging) return;

    try {
      this.isLogging = true;
      const logEntry = this.createLogEntry(level, category, message, data);

      this.logToConsole(logEntry);
      this.addToBuffer(logEntry);
    } catch (error) {
      console.warn('Logging failed', this.normalizeErrorLike(error));
    } finally {
      this.isLogging = false;
    }
  }

  // ✅ Public logging methods
  debug(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.DEBUG, category, message, data);
  }

  info(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.INFO, category, message, data);
  }

  warn(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.WARN, category, message, data);
  }

  error(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.ERROR, category, message, data);
  }

  critical(category: LogCategory, message: string, data?: any) {
    this.log(LogLevel.CRITICAL, category, message, data);
  }

  // ✅ Specialized logging methods for common use cases

  // Route transition logging
  logRouteTransition(from: string, to: string, stakeholderType?: string, user?: any) {
    this.info(LogCategory.ROUTING, `Route transition: ${from} → ${to}`, {
      from,
      to,
      stakeholderType,
      userId: user?.id,
      userRole: user?.role
    });
  }

  // Authentication logging
  logAuthentication(action: string, success: boolean, user?: any) {
    const level = success ? LogLevel.INFO : LogLevel.WARN;
    this.log(level, LogCategory.AUTHENTICATION, `Authentication ${action}: ${success ? 'Success' : 'Failed'}`, {
      action,
      success,
      userId: user?.id,
      userRole: user?.role
    });
  }

  // API call logging
  logApiCall(method: string, url: string, statusCode?: number, duration?: number, error?: any) {
    const level = error ? LogLevel.ERROR : statusCode && statusCode >= 400 ? LogLevel.WARN : LogLevel.DEBUG;
    this.log(level, LogCategory.API, `${method} ${url} - ${statusCode || 'No Response'}`, {
      method,
      url,
      statusCode,
      duration,
      error
    });
  }

  // User action logging
  logUserAction(action: string, component?: string, data?: any) {
    this.info(LogCategory.USER_ACTION, `User action: ${action}`, {
      action,
      component,
      data
    });
  }

  // Banking operation logging
  logBankingOperation(operation: string, bankingMode?: string, data?: any) {
    this.info(LogCategory.BANKING, `Banking operation: ${operation}`, {
      operation,
      bankingMode,
      data
    });
  }

  // IFRS9 calculation logging
  logIFRS9Calculation(calculationType: string, status: string, data?: any) {
    const level = status === 'error' ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, LogCategory.IFRS9, `IFRS9 ${calculationType}: ${status}`, {
      calculationType,
      status,
      data
    });
  }

  // Performance logging
  logPerformance(metric: string, value: number, unit: string = 'ms') {
    this.debug(LogCategory.PERFORMANCE, `Performance: ${metric} = ${value}${unit}`, {
      metric,
      value,
      unit
    });
  }

  // Security logging
  logSecurity(event: string, severity: 'low' | 'medium' | 'high' | 'critical', data?: any) {
    const level = severity === 'critical' ? LogLevel.CRITICAL :
      severity === 'high' ? LogLevel.ERROR :
        severity === 'medium' ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, LogCategory.SECURITY, `Security event: ${event}`, {
      event,
      severity,
      data
    });
  }

  // ✅ Utility methods

  // Get current session logs
  getSessionLogs(): LogEntry[] {
    return [...this.logBuffer];
  }

  // Manual buffer flush
  flushNow() {
    this.flushBuffer();
  }

  // Get session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Cleanup method
  cleanup() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushBuffer();
  }

  // ✅ Development utilities

  // Show debug information
  showDebugInfo() {
    if (this.config.app.environment === 'development') {
      console.group('🔧 Logging Service Debug Info');
      console.log('Session ID:', this.sessionId);
      console.log('Buffer Size:', this.logBuffer.length);
      console.log('Configuration:', this.config);
      console.log('Current User:', this.getCurrentUser());
      console.log('Recent Logs:', this.logBuffer.slice(-10));
      console.groupEnd();
    }
  }

  // Export logs as JSON (for debugging)
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// ✅ Create singleton instance
const loggingService = new CentralizedLoggingService();

// ✅ Export service instance
export { loggingService };

// ✅ Export convenience methods for easier usage
export const log = {
  debug: (category: LogCategory, message: string, data?: any) => loggingService.debug(category, message, data),
  info: (category: LogCategory, message: string, data?: any) => loggingService.info(category, message, data),
  warn: (category: LogCategory, message: string, data?: any) => loggingService.warn(category, message, data),
  error: (category: LogCategory, message: string, data?: any) => loggingService.error(category, message, data),
  critical: (category: LogCategory, message: string, data?: any) => loggingService.critical(category, message, data),

  // Specialized methods
  routeTransition: (from: string, to: string, stakeholderType?: string, user?: any) =>
    loggingService.logRouteTransition(from, to, stakeholderType, user),
  authentication: (action: string, success: boolean, user?: any) =>
    loggingService.logAuthentication(action, success, user),
  apiCall: (method: string, url: string, statusCode?: number, duration?: number, error?: any) =>
    loggingService.logApiCall(method, url, statusCode, duration, error),
  userAction: (action: string, component?: string, data?: any) =>
    loggingService.logUserAction(action, component, data),
  bankingOperation: (operation: string, bankingMode?: string, data?: any) =>
    loggingService.logBankingOperation(operation, bankingMode, data),
  ifrs9Calculation: (calculationType: string, status: string, data?: any) =>
    loggingService.logIFRS9Calculation(calculationType, status, data),
  performance: (metric: string, value: number, unit?: string) =>
    loggingService.logPerformance(metric, value, unit),
  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', data?: any) =>
    loggingService.logSecurity(event, severity, data)
};

// ✅ Default export
export default loggingService;
