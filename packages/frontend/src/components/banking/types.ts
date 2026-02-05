// packages/frontend/src/components/banking/types.ts
// ============================================================================
// BANKING COMPONENTS TYPES - IFRS9 PRO SYSTEM
// ============================================================================
// File Path: packages/frontend/src/components/banking/types.ts
// Purpose: TypeScript interfaces for banking components
// Architecture: Dual banking support with Syariah compliance
// ============================================================================

import React from 'react';

// ✅ Core Banking Types
export type BankingMode = 'conventional' | 'syariah' | 'dual';

export type IFRS9Stage = 1 | 2 | 3;

export type CurrencyCode = 'IDR' | 'USD' | 'EUR' | 'GBP' | 'SGD' | 'MYR';

// ✅ ECL Calculation Data
export interface ECLCalculationData {
  id: string;
  accountId: string;
  calculationDate: Date;
  stage: IFRS9Stage;
  pdRate: number;
  lgdRate: number;
  eadAmount: number;
  eclAmount: number;
  currency: CurrencyCode;
  bankingMode: BankingMode;
  syariahCompliant?: boolean;
}

// ✅ Portfolio Metrics
export interface PortfolioMetrics {
  totalExposure: number;
  totalECL: number;
  coverageRatio: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  stage1Amount: number;
  stage2Amount: number;
  stage3Amount: number;
  currency: CurrencyCode;
  asOfDate: Date;
}

// ✅ Compliance Status
export interface ComplianceStatus {
  isCompliant: boolean;
  complianceScore: number;
  lastAuditDate: Date;
  nextAuditDate: Date;
  violations: ComplianceViolation[];
  recommendations: string[];
}

export interface ComplianceViolation {
  id: string;
  type: 'minor' | 'major' | 'critical';
  description: string;
  detectedDate: Date;
  status: 'open' | 'in_progress' | 'resolved';
  remedyPlan?: string;
}

// ✅ Syariah-Specific Types
export interface SyariahComplianceData {
  isHalalCertified: boolean;
  syariahBoardApproval: boolean;
  dpsApprovalDate?: Date;
  halalCertificationDate?: Date;
  prohibitedSectors: string[];
  profitSharingRatio: number;
  islamicContractType: string;
  underlyingAssetType: string;
  complianceValidation: SyariahValidation;
}

export interface SyariahValidation {
  aaoifiCompliant: boolean;
  ojkCompliant: boolean;
  customSyariahRules: boolean;
  validationDate: Date;
  validatedBy: string;
  notes?: string;
}

// ✅ Banking Product Types
export interface BankingProduct {
  id: string;
  productCode: string;
  productName: string;
  productType: 'loan' | 'deposit' | 'investment' | 'financing';
  bankingMode: BankingMode;
  interestRate?: number; // For conventional products
  profitSharingRatio?: number; // For Syariah products
  currency: CurrencyCode;
  minAmount: number;
  maxAmount: number;
  tenure: number; // in months
  syariahCompliant: boolean;
  islamicContractType?: string;
  isActive: boolean;
}

// ✅ Account Information
export interface BankingAccount {
  id: string;
  accountNumber: string;
  customerId: string;
  productId: string;
  bankingMode: BankingMode;
  accountType: string;
  balance: number;
  currency: CurrencyCode;
  status: 'active' | 'inactive' | 'suspended' | 'closed';
  ifrs9Stage: IFRS9Stage;
  syariahCompliant: boolean;
  openingDate: Date;
  maturityDate?: Date;
  lastPaymentDate?: Date;
  nextPaymentDate?: Date;
}

// ✅ Customer Information
export interface BankingCustomer {
  id: string;
  customerNumber: string;
  customerType: 'individual' | 'corporate';
  fullName: string;
  legalEntityName?: string;
  nationality: string;
  industrySector?: string;
  riskCategory: 'low' | 'medium' | 'high';
  creditScore?: number;
  totalExposure: number;
  syariahCustomer: boolean;
  registrationDate: Date;
  lastReviewDate: Date;
}

// ✅ Risk Assessment
export interface RiskAssessment {
  customerId: string;
  assessmentDate: Date;
  creditRating: string;
  pd12m: number;
  pdLifetime: number;
  lgd: number;
  ead: number;
  riskCategory: 'low' | 'medium' | 'high';
  assessmentMethod: string;
  validUntil: Date;
  remarks?: string;
}

// ✅ Transaction Types
export interface BankingTransaction {
  id: string;
  accountId: string;
  transactionNumber: string;
  transactionType: 'debit' | 'credit';
  amount: number;
  currency: CurrencyCode;
  transactionDate: Date;
  valueDate: Date;
  description: string;
  balanceAfter: number;
  profitSharingAmount?: number; // For Syariah transactions
  syariahContractReference?: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed';
}

// ✅ Component Props Types
export interface BankingComponentProps {
  tenantId?: string;
  bankingMode?: BankingMode;
  theme?: 'conventional' | 'syariah';
  readonly?: boolean;
  onDataChange?: (data: any) => void;
  onError?: (error: Error) => void;
}

// ✅ API Response Types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    tenantId: string;
    bankingMode: BankingMode;
    timestamp: Date;
  };
}

// ✅ Database menu item structure (from API)
export interface DatabaseMenuItem {
  id: string;
  key?: string;
  menu_key?: string; // Backend field name for menu key
  title?: string;
  label?: string; // Alternative field name for title
  description?: string;
  icon?: string;
  url?: string;
  href?: string; // Alternative field name for URL
  type?: string;
  sort_order?: number;
  is_active?: boolean;
  user_types?: string[];
  roles?: string[]; // Alternative field name for user types
  requiredPermissions?: string[];
  banking_types?: string[];
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  parent_id?: string | null;
  children?: DatabaseMenuItem[];
  created_at?: string;
  updated_at?: string;
  isNew?: boolean;
  requires_setup?: boolean;
  requiresSetup?: boolean;
  badge_info?: {
    content?: string | number;
    color?: string;
  };
}

// ✅ Menu structure (for UI components)
export interface MenuItem {
  id: string;
  code?: string; // Optional for static menu compatibility
  label: string;
  isActive?: boolean;
  href?: string;
  icon: React.ReactElement<any>;
  description?: string;
  parent_id?: string | null;
  sort_order?: number; // Optional for static menu compatibility
  level?: number; // Optional for static menu compatibility
  path?: string; // Optional for static menu compatibility
  children?: MenuItem[];
  roles?: string[];
  requiredPermissions?: string[];
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  badge?: {
    content: string | number;
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  isNew?: boolean; // Added isNew
  requiresSetup?: boolean; // Added requiresSetup
  status?: string; // Added status
}
