// constants.ts – Shared constants and helpers for BaseIfrs9Report
import type { ReportFilters, BaseIfrs9ReportProps } from './types';

export const formatLocalDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

export const LOOKUP_CACHE_TTL_MS = 5 * 60 * 1000;

export const lookupCache: {
  segments: { ts: number; value: any[] } | null;
  scalars: { ts: number; value: any[] } | null;
  lgdMethods: { ts: number; value: any[] } | null;
  lgdConfigs: { ts: number; value: any[] } | null;
  eadConfigs: { ts: number; value: any[] } | null;
} = {
  segments: null,
  scalars: null,
  lgdMethods: null,
  lgdConfigs: null,
  eadConfigs: null,
};

export const EAD_CONFIG_ALLOWLIST_ORDER = [
  'EAD Model',
  'EAD All Segment',
  'EAD Factoring',
  'EAD Repo',
  'EAD Treasury',
  'EAD Model - Stable',
  'EAD Model - Run Off',
] as const;

export const GROUP_SEGMENT_ALLOWLIST_ORDER = [
  'PF Lending All Segment',
  'Repo',
  'PD Lending All Segment',
  'Treasury Moodys',
  'LGD Lending All Segment',
  'EAD Lending All Segment',
  'Treasury Pefindo',
  'Treasury Fitch',
  'Treasury S&P',
  'Factoring',
  'PD Factoring',
  'LGD Factoring',
  'EAD Factoring',
  'PD Repo',
  'LGD Repo',
] as const;

export const getDefaultFilters = (reportType: BaseIfrs9ReportProps['reportType']): ReportFilters => ({
  prc_date: reportType === 'ead-model' ? new Date('2020-12-31') :
            reportType.includes('pd') ? new Date('2022-10-31') :
            reportType === 'lifetime-lgd' ? new Date() :
            new Date('2023-12-31'),
  page: 1,
  limit: 20,
  segment_id: undefined,
  segment_ids: [],
  stage: [],
  fl_flag: false,
  group_segment: undefined,
  ead_config_id: undefined,
  pd_config_id: reportType.includes('pd') ? 1 : undefined,
  pd_method: reportType.includes('pd') ? 1 : undefined,
  lgd_config_id: undefined
});
