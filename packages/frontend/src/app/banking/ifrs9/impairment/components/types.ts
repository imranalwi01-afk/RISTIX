'use client';

export interface ImpairmentAnalytics {
  totalAccounts: number;
  totalExposure: number;
  impairedAccounts: number;
  impairedExposure: number;
  stageDistribution: Record<number, number>;
  averageECLRatio: number;
  totalProvision: number;
}

export type SortField =
  | 'account_number'
  | 'cif_name'
  | 'outstanding_balance'
  | 'ecl_amount'
  | 'stage'
  | 'dpd'
  | 'rating_code';

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: SortField;
  order: SortOrder;
}
