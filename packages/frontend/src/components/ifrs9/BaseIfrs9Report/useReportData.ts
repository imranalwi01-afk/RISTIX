// useReportData.ts – Custom hook for report data fetching, column building, and lookup loading
import { useState, useEffect } from 'react';
import React from 'react';
import type { GridColDef } from '@mui/x-data-grid';
import api from '../../../services/api';
import {
  formatLocalDate,
  LOOKUP_CACHE_TTL_MS,
  lookupCache,
  EAD_CONFIG_ALLOWLIST_ORDER,
} from './constants';
import { generateDynamicColumns } from './reportColumnHelpers';
import type {
  ReportFilters,
  ReportResponse,
  ReportDebugConfigResponse,
  SegmentOption,
  LgdMethodOption,
  LgdConfigOption,
  EadConfigOption,
  BaseIfrs9ReportProps,
} from './types';

export interface UseReportDataParams {
  reportType: BaseIfrs9ReportProps['reportType'];
  tenant: { id: string; slug: string | undefined } | null;
  filters: ReportFilters;
  requiredParams: string[];
  missingParams: string[];
  reportQuery: {
    data?: ReportResponse;
    error: Error | null;
  };
  onDataLoaded?: (data: Record<string, unknown>[], summary?: Record<string, unknown> | null) => void;
  externalFilters?: Partial<ReportFilters>;
  setFilters: React.Dispatch<React.SetStateAction<ReportFilters>>;
}

export function useReportData({
  reportType,
  tenant,
  filters,
  requiredParams,
  missingParams,
  reportQuery,
  onDataLoaded,
  externalFilters,
  setFilters,
}: UseReportDataParams) {
  // --- State ---
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [filterDefinitions, setFilterDefinitions] = useState<Record<string, any>>({});
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [scalars, setScalars] = useState<Record<string, unknown>[]>([]);
  const [lgdMethods, setLgdMethods] = useState<LgdMethodOption[]>([]);
  const [lgdConfigs, setLgdConfigs] = useState<LgdConfigOption[]>([]);
  const [eadConfigs, setEadConfigs] = useState<EadConfigOption[]>([]);
  const [effectivePrcDate, setEffectivePrcDate] = useState<string | null>(null);
  const [reportMeta, setReportMeta] = useState<any>(null);

  // --- Effect: Process report query data and build columns ---
  useEffect(() => {
    if (!tenant) { setError('Tenant context required'); return; }
    if (!filters.prc_date) { setError('Processing date is required'); return; }
    if (missingParams.length > 0) { setError(`Missing required parameters: ${missingParams.join(', ')}`); return; }
    if (!reportQuery.data) return;

    const response = reportQuery.data;
    if (!response.success) {
      setEffectivePrcDate(null);
      setReportMeta(response.meta ?? null);
      setError(response.message || 'Failed to fetch report data');
      return;
    }

    const rawData = response.data || [];
    let nextData = rawData;

    if (reportType === 'gca-movement' || reportType === 'ecl-movement') {
      const numericKeys = new Set<string>();
      for (const row of rawData) {
        for (const [key, value] of Object.entries(row || {})) {
          if (value === null || value === undefined || value === '') continue;
          if (typeof value === 'number') numericKeys.add(key);
          if (typeof value === 'string' && Number.isFinite(Number(value))) numericKeys.add(key);
        }
      }
      nextData = rawData.map((row) => {
        const out: Record<string, unknown> = { ...(row || {}) };
        for (const key of numericKeys) {
          const value = out[key];
          if (value === null || value === undefined || value === '') out[key] = 0;
        }
        return out;
      });
    }

    setData(nextData);
    setEffectivePrcDate(response.effectivePrcDate ?? null);
    setReportMeta(response.meta ?? null);
    setError(nextData.length === 0 ? (response.message || 'No data available for the selected processing date and filters.') : null);

    let finalColumns: GridColDef[] = [];

    if (response.columns && Array.isArray(response.columns) && response.columns.length > 0) {
      finalColumns = response.columns.map((col) => ({
        field: col.field || col.column_name || '',
        headerName: col.headerName || col.field?.replace(/_/g, ' ').toUpperCase() || col.column_name?.replace(/_/g, ' ').toUpperCase() || '',
        width: col.width ?? 150,
        type: col.type ?? 'string',
        sortable: true,
        filterable: true,
        ...(col.type === 'number' && {
          valueFormatter: (value: number | null | undefined) => {
            if (value === null || value === undefined) return '';
            const field = col.field || '';
            // Code/ID fields: no formatting (no commas, no decimals)
            if (/branch[_ ]?code|branch_id|_id$|^id$|^pkid$|^seq$|^seqno$/i.test(field)) {
              return String(value);
            }
            // Integer fields like stage, account/account_count, count: no decimal places, no commas
            if (/stage|account[_ ]?count|count|total[_ ]?(account|count)/i.test(field)) {
              return new Intl.NumberFormat('id-ID', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(value);
            }
            // Default: 2 decimal places
            return new Intl.NumberFormat('id-ID', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(value);
          },
          align: 'right' as const,
          headerAlign: 'right' as const,
        }),
      }));
    } else if (nextData.length > 0) {
      finalColumns = generateDynamicColumns(nextData);
    }

    if (reportType === 'gca-movement' || reportType === 'ecl-movement') {
      finalColumns = finalColumns.map((col) => {
        if (col.type !== 'number' || col.field === 'movement_order') return col;
        return {
          ...col,
          valueFormatter: (value: number | null | undefined) => {
            if (value === null || value === undefined) return '';
            return new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              minimumFractionDigits: 0,
            }).format(value);
          },
          width: typeof col.width === 'number' ? col.width : 180,
          align: 'right',
          headerAlign: 'right',
        } as GridColDef;
      });
    }

    setColumns(finalColumns);
    if (response.pagination) setPagination(response.pagination);
    setFilterDefinitions(response.filterDefinitions || {});

    if (onDataLoaded) {
      const enhancedSummary = {
        ...(response.summary || {}),
        _paginationTotal: response.pagination?.total
      };
      onDataLoaded(nextData, enhancedSummary);
    }
  }, [filters.prc_date, missingParams, onDataLoaded, reportQuery.data, reportType, tenant]);

  // --- Effect: Report query error ---
  useEffect(() => {
    if (reportQuery.error) {
      console.error('Report fetch error:', reportQuery.error);
      setReportMeta(null);
      setError(reportQuery.error instanceof Error ? reportQuery.error.message : 'Failed to fetch report data');
    }
  }, [reportQuery.error]);

  // --- Effect: External filters ---
  useEffect(() => {
    if (externalFilters) {
      setFilters(prev => ({ ...prev, ...externalFilters }));
    }
  }, [externalFilters]);

  // --- Effect: Load lookup data (segments, LGD/EAD configs) ---
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const now = Date.now();
        const segmentsFresh = lookupCache.segments && now - lookupCache.segments.ts < LOOKUP_CACHE_TTL_MS;

        if (segmentsFresh) setSegments(lookupCache.segments!.value);

        if (!segmentsFresh) {
          const [segData] = await Promise.all([
            segmentsFresh ? Promise.resolve(lookupCache.segments!.value) : api.banking.populationSegments.getAll({ active_flag: true }),
          ]);

          if (!segmentsFresh) {
            const normalizedSegments = (Array.isArray(segData) ? segData : []).map((segment: any) => {
              const id = segment?.id ?? segment?.pkid ?? segment?.segment_id ?? segment?.segmentId;
              return { ...segment, id };
            });
            lookupCache.segments = { ts: now, value: normalizedSegments };
            setSegments(normalizedSegments);
          }
        }

        if (reportType === 'lifetime-lgd') {
          const methodsFresh = lookupCache.lgdMethods && now - lookupCache.lgdMethods.ts < LOOKUP_CACHE_TTL_MS;
          const configsFresh = lookupCache.lgdConfigs && now - lookupCache.lgdConfigs.ts < LOOKUP_CACHE_TTL_MS;

          if (methodsFresh) setLgdMethods(lookupCache.lgdMethods!.value);
          if (configsFresh) setLgdConfigs(lookupCache.lgdConfigs!.value);

          if (!methodsFresh || !configsFresh) {
            const [methods, configs] = await Promise.all([
              methodsFresh ? Promise.resolve(lookupCache.lgdMethods!.value) : api.banking.lgdConfigurations.getMethods(),
              configsFresh ? Promise.resolve(lookupCache.lgdConfigs!.value) : api.banking.lgdConfigurations.getAll(),
            ]);

            if (!methodsFresh) {
              const normalized = Array.isArray(methods) ? methods : [];
              lookupCache.lgdMethods = { ts: now, value: normalized };
              setLgdMethods(normalized);
            }
            if (!configsFresh) {
              const normalized = (Array.isArray(configs) ? configs : [])
                .map((config: any) => {
                  const id = config?.id ?? config?.pkid ?? config?.lgd_config_id ?? config?.lgdConfigId;
                  const model_name = String(config?.model_name ?? config?.modelName ?? '').trim();
                  const rawSegmentId = config?.segment_id ?? config?.segmentId;
                  const segment_id = Number.isFinite(Number(rawSegmentId)) ? Number(rawSegmentId) : undefined;
                  return { ...config, id, model_name, segment_id };
                })
                .filter((config: any) => config.id !== undefined && config.id !== null && config.model_name);
              lookupCache.lgdConfigs = { ts: now, value: normalized };
              setLgdConfigs(normalized);
            }
          }
        }

        if (reportType === 'ead-model') {
          const eadConfigsFresh = lookupCache.eadConfigs && now - lookupCache.eadConfigs.ts < LOOKUP_CACHE_TTL_MS;

          if (eadConfigsFresh) {
            setEadConfigs(lookupCache.eadConfigs!.value);
          } else {
            const rawConfigs = await api.banking.eadConfigurations.getAll({ is_active: true });
            const normalizedConfigs = Array.isArray(rawConfigs) ? rawConfigs : [];

            const candidates = normalizedConfigs
              .map((config: any) => {
                const id = config?.id ?? config?.pkid ?? config?.ead_config_id ?? config?.eadConfigId;
                const model_name = String(config?.model_name ?? config?.modelName ?? '').trim();
                const rawSegmentId = config?.segment_id ?? config?.segmentId;
                const segment_id = Number.isFinite(Number(rawSegmentId)) ? Number(rawSegmentId) : undefined;
                return { id, model_name, segment_id };
              })
              .filter((config: any) => config.id !== undefined && config.id !== null && config.model_name);

            const sortedById = candidates.slice().sort((a: any, b: any) => Number(a.id) - Number(b.id));

            const byModelName = new Map<string, EadConfigOption>();
            for (const config of sortedById) {
              const key = config.model_name.toLowerCase();
              if (!byModelName.has(key)) byModelName.set(key, config);
            }

            const filteredOrdered = EAD_CONFIG_ALLOWLIST_ORDER
              .map((name) => byModelName.get(name.toLowerCase()))
              .filter(Boolean) as EadConfigOption[];

            const finalConfigs =
              filteredOrdered.length > 0
                ? filteredOrdered
                : Array.from(byModelName.values()).sort((a, b) => a.model_name.localeCompare(b.model_name));

            lookupCache.eadConfigs = { ts: now, value: finalConfigs };
            setEadConfigs(finalConfigs);
          }
        }
      } catch (err) {
        console.error('Failed to load lookups:', err);
      }
    };
    loadLookups();
  }, [reportType]);

  // --- Effect: Auto-select EAD config when eadConfigs load ---
  useEffect(() => {
    if (reportType !== 'ead-model') return;
    if (!eadConfigs.length) return;
    setFilters((prev) => {
      if (prev.ead_config_id) {
        return prev.segment_id === undefined ? prev : { ...prev, segment_id: undefined, segment_ids: [] };
      }
      const preferred = eadConfigs.find((c) => c.model_name.trim().toLowerCase() === 'ead model');
      const selected = preferred ?? eadConfigs[0];
      const parsed = Number(selected?.id);
      return Number.isFinite(parsed)
        ? { ...prev, ead_config_id: parsed, segment_id: undefined, segment_ids: [] }
        : prev;
    });
  }, [reportType, eadConfigs]);

  return {
    data,
    columns,
    pagination,
    filterDefinitions,
    segments,
    scalars,
    lgdMethods,
    lgdConfigs,
    eadConfigs,
    effectivePrcDate,
    reportMeta,
    error,
    infoMessage,
    setError,
    setInfoMessage,
  };
}
