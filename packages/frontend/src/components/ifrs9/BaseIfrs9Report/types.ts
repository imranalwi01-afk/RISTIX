// types.ts – Shared interfaces for BaseIfrs9Report and sub-components
import type { EnterpriseFilterDefinition, EnterprisePaginationMode } from '@/types/enterprise-table';

export interface BaseIfrs9ReportProps {
  title: string;
  description?: string;
  reportType: 'nominative-report' | 'lifetime-pd-yearly' | 'lifetime-pd-monthly' | 'lifetime-pd-account-details' |
  'lifetime-lgd' | 'ead-model' | 'ecl-result' | 'ecl-movement' | 'gca-movement' | 'gl-outbound';
  requiredParams: string[];
  optionalParams?: string[];
  supportsPagination?: boolean;
  paginationMode?: EnterprisePaginationMode;
  supportsCharts?: boolean;
  headerIcon?: React.ReactNode;
  statusLabel?: string;
  granularity?: string;
  scope?: string;
  onDataLoaded?: (data: Record<string, unknown>[], summary?: Record<string, unknown> | null) => void;
  children?: React.ReactNode;
  hideHeader?: boolean;
  headerAtTop?: boolean;
  hideFilters?: boolean;
  hideDataGrid?: boolean;
  externalFilters?: Partial<ReportFilters>;
}

export interface ReportFilters {
  prc_date: Date | null;
  period_from?: Date | null;
  period_to?: Date | null;
  pd_config_id?: number;
  pd_method?: number;
  scalar_id?: number;
  lgd_config_id?: number;
  lgd_method?: number;
  model_id?: number;
  ead_config_id?: number;
  segment_id?: number;
  segment_ids?: number[];
  scenario_id?: number;
  stage?: string | string[];
  fl_flag?: boolean;
  branch_code?: string;
  group_segment?: string;
  account_status?: string;
  assessment_type?: string;
  page?: number;
  limit?: number;
}

export interface SegmentOption {
  id: number | string;
  segment_name?: string;
  group_segment?: string;
  groupSegment?: string;
  segment_type?: string;
  segmentType?: string;
}

export interface LgdConfigOption {
  id: number | string;
  model_name?: string;
  segment_id?: number;
}

export interface LgdMethodOption {
  value: number;
  label: string;
}

export interface EadConfigOption {
  id: number | string;
  model_name: string;
  segment_id?: number;
}

export interface ReportResponse {
  success: boolean;
  data: Record<string, unknown>[];
  columns?: Array<{
    field?: string;
    column_name?: string;
    headerName?: string;
    width?: number;
    type?: 'string' | 'number' | 'date' | 'boolean';
  }>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    database: string;
    responseTime: number;
    debugEnabled?: boolean;
    debug?: ReportDebugMetadata;
  };
  message?: string;
  effectivePrcDate?: string | null;
  summary?: Record<string, unknown> | null;
  filterDefinitions?: Record<string, EnterpriseFilterDefinition>;
}

export interface ReportDebugMetadata {
  reportKey: string;
  reportTitle: string;
  sourceTables: string[];
  joins?: string[];
  filterKeys?: string[];
  filtersApplied?: Record<string, unknown>;
  sqlPreview?: string;
  effectivePrcDate?: string | null;
  rowCount?: number;
  queryMode?: string;
  fallbackUsed?: boolean;
  emptyReason?: string | null;
  variant?: string;
}

export interface ReportDebugConfigResponse {
  success: boolean;
  data?: {
    enabled: boolean;
    source: 'db' | 'default';
    paramCode: string;
  };
}

export interface ThemeStyles {
  gradient: string;
  primary: string;
  shadow: string;
}
