// packages/frontend/src/types/api.ts

/**
 * Standard API Response Format
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
    tenantId?: string;
  };
}

/**
 * API Error Response
 */
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  code?: string;
  details?: any;
  timestamp?: string;
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Filter Parameters
 */
export interface FilterParams {
  search?: string;
  filters?: Record<string, any>;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * List Request Parameters
 */
export interface ListRequestParams extends PaginationParams, FilterParams {
  include?: string[];
  fields?: string[];
}

/**
 * Bulk Operation Request
 */
export interface BulkOperationRequest<T = any> {
  operation: 'create' | 'update' | 'delete';
  data: T[];
  options?: Record<string, any>;
}

/**
 * Bulk Operation Response
 */
export interface BulkOperationResponse<T = any> {
  success: boolean;
  results: {
    success: T[];
    failed: {
      data: T;
      error: string;
    }[];
  };
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

/**
 * File Upload Response
 */
export interface FileUploadResponse {
  success: boolean;
  file: {
    id: string;
    filename: string;
    originalName: string;
    size: number;
    mimetype: string;
    path: string;
    url?: string;
  };
  message?: string;
}

/**
 * Health Check Response
 */
export interface HealthCheckResponse {
  success: boolean;
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    [key: string]: {
      status: 'up' | 'down';
      responseTime?: number;
      error?: string;
    };
  };
  timestamp: string;
}

export default ApiResponse;