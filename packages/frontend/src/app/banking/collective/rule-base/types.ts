'use client';

export interface RuleBaseHeader {
  id: number;
  rule_name: string;
  rule_type: string;
  rule_type_desc?: string;
  updated_table: string;
  updated_table_desc?: string;
  updated_column: string;
  updated_column_desc?: string;
  value: string;
  seq: number;
  active_flag: boolean;
  details_count?: number;
  createdby?: string;
  createddate?: string;
  details?: RuleBaseDetail[];
}

export interface RuleBaseDetail {
  id: number;
  rule_id: number;
  query_group: number;
  seq: number;
  table_name: string;
  column_name: string;
  data_type: string;
  operator: string;
  value1?: string;
  value2?: string;
  condition: 'AND' | 'OR';
  detail_type?: string;
  stage_from?: string;
  stage_to?: string;
  createdby?: string;
  createddate?: string;
}
