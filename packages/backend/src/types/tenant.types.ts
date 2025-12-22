// packages/backend/src/types/tenant.types.ts
// Tenant Types for IFRS 9 Multi-Tenant Platform

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  bankingType: 'conventional' | 'syariah' | 'dual';
  status: 'active' | 'inactive' | 'suspended';
  tier: 'basic' | 'premium' | 'enterprise';
  features: string[];
  settings: TenantSettings;
  compliance?: ComplianceSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantSettings {
  timezone: string;
  currency: string;
  locale: string;
  dateFormat: string;
  maxUsers: number;
  maxConnections: number;
  dataRetentionDays: number;
  auditLevel: 'basic' | 'detailed' | 'comprehensive';
  syariahBoardApproval?: boolean;
}

export interface ComplianceSettings {
  aaoifiCompliant: boolean;
  syariahBoardRequired: boolean;
  prohibitedSectors: string[];
  complianceOfficer: string;
  auditFrequency: 'monthly' | 'quarterly' | 'annually';
  certificationRequired: boolean;
}

export interface TenantDatabase {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
  idleTimeoutMillis: number;
}

export interface TenantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  tenantId: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: Date;
  syariahCertified?: boolean;
  certificationDetails?: any;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      tenant?: TenantContext;
      tenantContext?: TenantContext;
      user?: TenantUser;
    }
  }
}