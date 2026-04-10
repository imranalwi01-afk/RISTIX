'use client';

export interface ECLConfigHeader {
  pkid: number;
  ecl_model_name: string;
  module: string;
  module_name?: string;
  effective_date: string;
  active_flag: boolean;
  last_run_period?: string;
  last_run_status?: string;
  last_run_date?: string;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
  details: ECLConfigDetail[];
}

export interface ECLConfigDetail {
  pkid: number;
  ecl_model_id: number;
  pf_segment_id: number;
  pf_segment_name?: string;
  stage_rule_id: number;
  stage_rule_name?: string;
  pd_model_id: number;
  pd_model_name?: string;
  lgd_model_id: number;
  lgd_model_name?: string;
  ead_model_id: number;
  ead_model_name?: string;
  overlay_rate: number;
  period_type: number;
  period_type_name?: string;
  period_date?: string;
  createdby?: string;
  createddate?: string;
}

export interface ECLPreviewHeader {
  prc_date?: string | null;
  account_id?: number | null;
  facility_number?: string | null;
  cif_number?: string | null;
  segment_id?: number | null;
  remaining_tenor?: number | null;
  stage?: number | null;
  bucket_group?: string | null;
  bucket_id?: number | null;
  currency?: string | null;
  dpd?: number | null;
  internal_rating_code?: string | null;
  ext_rating_code?: string | null;
  outstanding?: string | null;
  plafond?: string | null;
  fib_amt?: string | null;
  accrued_interest?: string | null;
  unamort_cost_amt?: string | null;
  unamort_fee_amt?: string | null;
  ecl_amount?: string | null;
  overlay_amount?: string | null;
  ecl_final?: string | null;
  ecl_model_id?: number | null;
}

export interface ECLPreviewDetail {
  prc_date?: string | null;
  account_id?: number | null;
  facility_number?: string | null;
  cif_number?: string | null;
  segment_id?: number | null;
  remaining_tenor?: number | null;
  stage?: number | null;
  scenario_no?: number | null;
  fl_seq?: number | null;
  fl_year?: number | null;
  fl_month?: number | null;
  bucket_group?: string | null;
  bucket_id?: number | null;
  currency?: string | null;
  dpd?: number | null;
  internal_rating_code?: string | null;
  ext_rating_code?: string | null;
  outstanding?: string | null;
  plafond?: string | null;
  fib_amt?: string | null;
  accrued_interest?: string | null;
  unamort_cost_amt?: string | null;
  unamort_fee_amt?: string | null;
  ead_balance?: string | null;
  principal_amt?: string | null;
  sum_principal_amt?: string | null;
  next_interest?: string | null;
  sum_next_interest?: string | null;
  ead?: string | null;
  pd?: number | null;
  lgd?: number | null;
  ecl_amount?: string | null;
  probability?: number | null;
  ecl_weighted?: string | null;
  ecl_model_id?: number | null;
}

export interface LookupOption {
  value: string;
  label: string;
  segmentId?: string;
}
