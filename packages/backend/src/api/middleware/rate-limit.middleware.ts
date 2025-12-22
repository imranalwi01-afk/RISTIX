// packages/backend/src/api/middleware/rate-limit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

export class RateLimitMiddleware {
  constructor() {}

  /**
   * General API rate limiting
   */
  generalLimit() {
    // More lenient rate limiting for development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDevelopment ? 10000 : 1000, // Much higher limit for development
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes',
        waitTime: this.calculateWaitTime(15 * 60 * 1000),
        nextRequestTime: new Date(Date.now() + 15 * 60 * 1000).toISOString()
      },
      standardHeaders: true,
      legacyHeaders: false,

      keyGenerator: (req: Request) => {
        return this.getClientIdentifier(req);
      }
    });
  }

  /**
   * Authentication endpoint rate limiting (stricter)
   */
  authLimit() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 10, // Limit each IP to 10 login attempts per windowMs
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        retryAfter: '15 minutes',
        waitTime: this.calculateWaitTime(15 * 60 * 1000),
        nextRequestTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        suggestion: 'Please wait before attempting another login or contact support if you believe this is an error.'
      },
      standardHeaders: true,
      legacyHeaders: false,

      keyGenerator: (req: Request) => {
        // Combine IP and email for more granular control
        const identifier = this.getClientIdentifier(req);
        const email = req.body?.email || '';
        return `${identifier}:${email}`;
      },

      skipSuccessfulRequests: true // Only count failed attempts
    });
  }

  /**
   * Token refresh rate limiting
   */
  tokenLimit() {
    return rateLimit({
      windowMs: 60 * 1000, // 1 minute
      max: 10, // Limit each IP to 10 token refresh requests per minute
      message: {
        success: false,
        error: 'Too many token refresh attempts',
        code: 'TOKEN_RATE_LIMIT_EXCEEDED',
        retryAfter: '1 minute',
        waitTime: this.calculateWaitTime(60 * 1000),
        nextRequestTime: new Date(Date.now() + 60 * 1000).toISOString(),
        suggestion: 'Token refresh requests are limited. Please wait before refreshing again.'
      },
      standardHeaders: true,
      legacyHeaders: false,

      keyGenerator: (req: Request) => {
        return this.getClientIdentifier(req);
      }
    });
  }

  /**
   * Data fetching rate limiting (for login-data endpoint)
   */
  dataLimit() {
    // More lenient rate limiting for development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isDevelopment ? 500 : 50, // Higher limit for development
      message: {
        success: false,
        error: 'Too many data requests, please try again later',
        code: 'DATA_RATE_LIMIT_EXCEEDED',
        retryAfter: isDevelopment ? '1 minute' : '15 minutes',
        waitTime: this.calculateWaitTime(15 * 60 * 1000),
        nextRequestTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        suggestion: 'Data fetching requests are limited to prevent server overload. Please wait before making another request.'
      },
      standardHeaders: true,
      legacyHeaders: false,

      keyGenerator: (req: Request) => {
        return this.getClientIdentifier(req);
      }
    });
  }

  // Private helper methods
  private calculateWaitTime(windowMs: number): string {
    const totalSeconds = Math.ceil(windowMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''}, ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}, ${seconds} second${seconds > 1 ? 's' : ''}`;
    } else {
      return `${seconds} second${seconds > 1 ? 's' : ''}`;
    }
  }

  private getClientIdentifier(req: Request): string {
    // Try to get user ID if authenticated
    const authReq = req as any;
    if (authReq.user?.id) {
      return `user:${authReq.user.id}`;
    }

    // Fall back to IP address
    const ip = req.headers['x-forwarded-for'] as string ||
               req.headers['x-real-ip'] as string ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress ||
               req.ip ||
               '0.0.0.0';

    return `ip:${ip.split(',')[0].trim()}`;
  }
}

// Convenience exports
const rateLimitMiddleware = new RateLimitMiddleware();
export const rateLimiter = {
  auth: rateLimitMiddleware.authLimit(),
  token: rateLimitMiddleware.tokenLimit(),
  data: rateLimitMiddleware.dataLimit(),
  general: rateLimitMiddleware.generalLimit()
};
