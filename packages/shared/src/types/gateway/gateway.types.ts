// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/shared/src/types/gateway/gateway.types.ts
// Generated: $(date '+%Y-%m-%d %H:%M:%S')
// Phase: D2H7P3 - Database-Driven Menu & Infrastructure (Gateway Types)
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: TypeScript
// Purpose: Shared type definitions for API Gateway
// ============================================================================

export interface GatewayRoute {
  id: string;
  path: string;
  target: string;
  methods: string[];
  secured: boolean;
  timeout?: number;
  pathRewrite?: Record<string, string>;
  rateLimit?: RateLimitConfig;
  circuitBreaker?: CircuitBreakerConfig;
}

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  distributed?: boolean;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  threshold: number;
  timeout: number;
  monitor: number;
}

export interface ProxyConfig {
  target: string;
  changeOrigin: boolean;
  timeout: number;
  pathRewrite?: Record<string, string>;
}

export interface SecurityConfig {
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
    headers: string[];
  };
  rateLimit: RateLimitConfig;
  headers: {
    contentSecurityPolicy: boolean;
    frameOptions: string;
    xssProtection: boolean;
    strictTransportSecurity: boolean;
  };
}

export interface GatewayMiddleware {
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}
