// packages/backend/src/utils/errors.ts
// ============================================================================
// 🔧 ERROR CLASSES - STANDARDIZED ERROR TYPES
// ============================================================================
// ✅ PURPOSE: Provides standardized error classes for the application
// ✅ INTEGRATION: Works with centralized error handling and response patterns
// ✅ PATTERN: Express.js compatible error classes with proper error codes
// ============================================================================

import { ValidationErrorDetail } from './error-handler';

// ============================================================================
// MAIN ERROR CLASSES
// ============================================================================

/**
 * ValidationError - Standard validation error class
 * Used for input validation failures throughout the application
 */
export class ValidationError extends Error {
  public statusCode: number;
  public code: string;
  public details?: ValidationErrorDetail[];
  public isOperational: boolean;

  constructor(
    message: string,
    details?: ValidationErrorDetail[],
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

/**
 * AuthenticationError - Standard authentication error class
 * Used for authentication failures
 */
export class AuthenticationError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string = 'Authentication failed', code: string = 'AUTHENTICATION_ERROR') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
    this.code = code;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationError);
    }
  }
}

/**
 * AuthorizationError - Standard authorization error class
 * Used for permission/authorization failures
 */
export class AuthorizationError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string = 'Access denied', code: string = 'AUTHORIZATION_ERROR') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
    this.code = code;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthorizationError);
    }
  }
}

/**
 * NotFoundError - Standard not found error class
 * Used for resource not found scenarios
 */
export class NotFoundError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
    this.code = code;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}

/**
 * ConflictError - Standard conflict error class
 * Used for resource conflict scenarios (e.g., duplicate entries)
 */
export class ConflictError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string = 'Resource conflict', code: string = 'CONFLICT') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
    this.code = code;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConflictError);
    }
  }
}

/**
 * BusinessLogicError - Standard business logic error class
 * Used for business rule violations
 */
export class BusinessLogicError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, code: string = 'BUSINESS_LOGIC_ERROR') {
    super(message);
    this.name = 'BusinessLogicError';
    this.statusCode = 422;
    this.code = code;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessLogicError);
    }
  }
}

/**
 * DatabaseError - Standard database error class
 * Used for database operation failures
 */
export class DatabaseError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, code: string = 'DATABASE_ERROR') {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
    this.code = code;
    this.isOperational = false; // Database errors are typically not operational

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
  }
}

/**
 * ExternalServiceError - Standard external service error class
 * Used for third-party service failures
 */
export class ExternalServiceError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, code: string = 'EXTERNAL_SERVICE_ERROR') {
    super(message);
    this.name = 'ExternalServiceError';
    this.statusCode = 502;
    this.code = code;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ExternalServiceError);
    }
  }
}

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export * from './error-handler';