'use client';

export interface ProcessDate {
  pkid: number;
  currdate: string;
  prevdate: string | null;
  batch_status: string;
  remark: string | null;
  last_process_date: string | null;
  sessionid: string | null;
  createdby: string;
  createddate: string;
}

export interface CalculationResult {
  prc_date: string;
  account_id: number;
  facility_number: string;
  cif_number: string;
  segment_id: number;
  stage: number;
  currency: string;
  outstanding: number;
  ecl_amount: number;
  overlay_amount: number;
  ecl_final: number;
  bucket_group: string;
  bucket_id: number;
  internal_rating_code: string;
  ext_rating_code: string;
}

export interface CalculationSummary {
  total_accounts: number;
  total_outstanding: number;
  total_ecl: number;
  stage1_count: number;
  stage2_count: number;
  stage3_count: number;
  stage1_ecl: number;
  stage2_ecl: number;
  stage3_ecl: number;
}

export interface RunConfig {
  process_date: string;
  segment_ids: number[];
  recalculate: boolean;
  scenarios: string[];
  calculation_type: string;
}

export interface StageDistributionItem {
  name: string;
  value: number;
  color: string;
}

export interface EclTrendItem {
  month: string;
  stage1: number;
  stage2: number;
  stage3: number;
}
