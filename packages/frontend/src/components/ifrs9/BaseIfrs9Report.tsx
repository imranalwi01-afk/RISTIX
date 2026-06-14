// packages/frontend/src/components/ifrs9/BaseIfrs9Report.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAuth } from '../../providers/AuthProvider';
import api from '../../services/api';
import ModernLoader from '../common/ModernLoader';
import { useBankingTheme } from '../../providers/BankingThemeProvider';
import { usePermission } from '@/hooks/usePermission';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import { useIfrs9ReportQuery } from '@/features/ifrs9-reports/hooks/useIfrs9ReportQuery';

// Sub-components
import Ifrs9ReportHeader from './BaseIfrs9Report/Ifrs9ReportHeader';
import Ifrs9ReportToolbar from './BaseIfrs9Report/Ifrs9ReportToolbar';
import Ifrs9ReportFilters from './BaseIfrs9Report/Ifrs9ReportFilters';
import Ifrs9ReportDataGrid from './BaseIfrs9Report/Ifrs9ReportDataGrid';
import Ifrs9ReportExportDialog from './BaseIfrs9Report/Ifrs9ReportExportDialog';
import Ifrs9ReportConfigDrawer from './BaseIfrs9Report/Ifrs9ReportConfigDrawer';
import Ifrs9ReportDebugPanel from './BaseIfrs9Report/Ifrs9ReportDebugPanel';

// Types, constants, and helpers
import type {
  BaseIfrs9ReportProps,
  ReportFilters,
  SegmentOption,
  LgdMethodOption,
  LgdConfigOption,
  EadConfigOption,
  ReportDebugConfigResponse,
  ThemeStyles,
} from './BaseIfrs9Report/types';
import {
  formatLocalDate,
  LOOKUP_CACHE_TTL_MS,
  lookupCache,
  EAD_CONFIG_ALLOWLIST_ORDER,
  GROUP_SEGMENT_ALLOWLIST_ORDER,
  getDefaultFilters,
} from './BaseIfrs9Report/constants';
import type { ExportOptions } from './BaseIfrs9Report/Ifrs9ReportExportDialog';

// Re-export types for external consumers
export type {
  BaseIfrs9ReportProps,
  ReportFilters,
  ReportResponse,
  ReportDebugMetadata,
} from './BaseIfrs9Report/types';

// --- Dynamic column generation (kept local for clarity) ---

const generateDynamicColumns = (data: Record<string, unknown>[]): GridColDef[] => {
  if (!data || data.length === 0) return [];

  const baseColumns: GridColDef[] = [];

  const formatHeaderName = (key: string) => {
    if (/^seq_\d+$/i.test(key)) {
      return `RECOVERY SEQ ${key.split('_')[1]}`;
    }
    const explicitLabels: Record<string, string> = {
      movement_order: 'MOVEMENT ORDER',
      movement: 'MOVEMENT',
      stage_1_collective: 'STAGE 1 COLLECTIVE',
      stage_2_collective: 'STAGE 2 COLLECTIVE',
      stage_3_collective: 'STAGE 3 COLLECTIVE',
      stage_1_individual: 'STAGE 1 INDIVIDUAL',
      stage_2_individual: 'STAGE 2 INDIVIDUAL',
      stage_3_individual: 'STAGE 3 INDIVIDUAL',
      total: 'TOTAL',
    };
    return explicitLabels[key] || key.replace(/_/g, ' ').toUpperCase();
  };

  const keySet = new Set<string>();
  for (const row of data) {
    Object.keys(row || {}).forEach((k) => keySet.add(k));
  }

  const firstRowKeys = Object.keys(data[0] || {});
  const extraKeys = Array.from(keySet).filter((k) => !firstRowKeys.includes(k)).sort();
  const orderedKeys = firstRowKeys.concat(extraKeys);

  const getSampleValue = (key: string) => {
    for (const row of data) {
      const v = (row as any)?.[key];
      if (v === null || v === undefined || v === '') continue;
      return v;
    }
    return undefined;
  };

  orderedKeys.forEach(key => {
    const value = getSampleValue(key);
    const column: GridColDef = {
      field: key,
      headerName: formatHeaderName(key),
      width: 150,
      sortable: true,
      filterable: true
    };

    if (typeof value === 'number' || (typeof value === 'string' && Number.isFinite(Number(value)))) {
      column.type = 'number';
      column.valueFormatter = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('id-ID', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }).format(value);
      };
      column.align = 'right';
      column.headerAlign = 'right';
    } else if (key.includes('date') || key.includes('_dt')) {
      column.type = 'date';
      column.valueFormatter = (value: string | number | Date | null | undefined) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('id-ID');
      };
      column.width = 120;
    } else if (typeof value === 'boolean') {
      column.type = 'boolean';
      column.renderCell = (params) => (
        <Chip
          size="small"
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'success' : 'default'}
        />
      );
      column.width = 100;
    } else if (key === 'stage' || key.endsWith('_stage')) {
      column.renderCell = (params) => (
        <Chip
          size="small"
          label={`Stage ${params.value}`}
          color={params.value === 1 ? 'success' : params.value === 2 ? 'warning' : 'error'}
        />
      );
      column.width = 100;
    }

    if (key.includes('amount') || key.includes('balance') || key.includes('ecl')) {
      column.valueFormatter = (value: number | null | undefined) => {
        if (value === null || value === undefined) return '';
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          minimumFractionDigits: 0
        }).format(value);
      };
      column.width = 180;
    }

    if (key === 'movement') {
      column.width = 280;
    }

    if (/^seq_\d+$/i.test(key)) {
      column.width = 140;
    }

    if (!column.renderCell) {
      column.renderCell = (params: GridRenderCellParams) => (
        <Box sx={{ fontWeight: 500 }}>{params.formattedValue ?? params.value ?? ''}</Box>
      );
    }

    baseColumns.push(column);
  });

  return baseColumns;
};

// --- Lifetime LGD Detail Panel ---

const renderLifetimeLgdDetailPanel = (params: { row: any }) => {
  const row = params.row || {};
  const detailRows = Array.isArray(row._detail_rows) ? row._detail_rows : [];
  const sequenceFieldSet = new Set<string>();

  detailRows.forEach((detailRow: Record<string, unknown>) => {
    Object.keys(detailRow || {}).forEach((key) => {
      if (/^seq_\d+$/.test(key)) {
        sequenceFieldSet.add(key);
      }
    });
  });

  const sequenceFields = Array.from(sequenceFieldSet).sort(
    (left: string, right: string) => Number(left.replace('seq_', '')) - Number(right.replace('seq_', ''))
  );

  const detailColumns: GridColDef[] = [
    { field: 'account_number', headerName: 'ACCOUNT_NUMBER', minWidth: 220, flex: 1 },
    { field: 'cif_name', headerName: 'CIF_NAME', minWidth: 260, flex: 1.1 },
    {
      field: 'first_npl_date',
      headerName: 'FIRST_NPL_DATE',
      minWidth: 180,
      valueFormatter: (value: string | null | undefined) => {
        if (!value) return '';
        const parsed = new Date(String(value));
        return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      },
    },
    {
      field: 'os_at_default',
      headerName: 'OS_AT_DEFAULT',
      minWidth: 180,
      type: 'number',
    },
    ...sequenceFields.map((field: string): GridColDef => ({
      field,
      headerName: field.replace('seq_', ''),
      minWidth: 180,
      type: 'number' as const,
    })),
  ];

  return (
    <Box sx={{ p: 1, minWidth: 0 }}>
      <Box component="h3" sx={{ fontWeight: 800, mb: 2, fontSize: '1rem' }}>
        Lifetime LGD Detail
      </Box>
      {detailRows.length > 0 ? (
        <SafeDataGrid
          rows={detailRows}
          columns={detailColumns}
          getRowId={(detailRow) => detailRow.id || detailRow.account_id || detailRow.account_number || Math.random()}
          pagination
          paginationMode="client"
          initialState={{
            pagination: {
              paginationModel: {
                page: 0,
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50, 75, 100]}
          responsiveMode="scroll"
          showEnterpriseControls
          sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}
        />
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          No account-level Lifetime LGD detail is available for this summary row.
        </Alert>
      )}
    </Box>
  );
};

// --- Main Component ---

const BaseIfrs9Report: React.FC<BaseIfrs9ReportProps> = ({
  title,
  description,
  reportType,
  requiredParams,
  optionalParams = [],
  supportsPagination = false,
  supportsCharts = false,
  headerIcon,
  statusLabel = 'Live Production Data',
  granularity = 'Transaction / Account Level',
  scope = 'IFRS 9 Regulatory Compliance',
  onDataLoaded,
  children,
  hideHeader = false,
  headerAtTop = false,
  hideFilters = false,
  hideDataGrid = false,
  externalFilters
}) => {
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission();
  const { bankingMode } = useBankingTheme();
  const canManageReportDebug = hasAnyPermission(['admin.system.manage', 'admin.maintenance.access']);

  const tenant = React.useMemo(() => {
    return user?.tenantId ? { id: user.tenantId, slug: user.tenantSlug } : null;
  }, [user?.tenantId, user?.tenantSlug]);

  // State management
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [filterDefinitions, setFilterDefinitions] = useState<Record<string, any>>({});
  const [filters, setFilters] = useState<ReportFilters>(getDefaultFilters(reportType));
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = React.useDeferredValue(searchTerm);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    scope: 'all_pages',
    format: 'xlsx',
    fromDate: null,
    toDate: null,
  });
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [scalars, setScalars] = useState<Record<string, unknown>[]>([]);
  const [lgdMethods, setLgdMethods] = useState<LgdMethodOption[]>([]);
  const [lgdConfigs, setLgdConfigs] = useState<LgdConfigOption[]>([]);
  const [eadConfigs, setEadConfigs] = useState<EadConfigOption[]>([]);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [effectivePrcDate, setEffectivePrcDate] = useState<string | null>(null);
  const [reportMeta, setReportMeta] = useState<any>(null);
  const [reportDebugEnabled, setReportDebugEnabled] = useState(false);
  const [reportDebugLoading, setReportDebugLoading] = useState(false);
  const [reportDebugSaving, setReportDebugSaving] = useState(false);

  const {
    queryState,
    queryParams,
    setPaginationModel,
    setColumnFilters,
    setSort,
    setColumnVisibilityModel,
    setDensity,
    applySavedView,
    toSavedViewState,
    resetView,
  } = useEnterpriseTableQuery({
    pageKey: `ifrs9-report:${reportType}`,
    paginationMode: supportsPagination ? 'offset' : 'client',
    initialPageSize: getDefaultFilters(reportType).limit ?? 20,
    syncUrl: supportsPagination,
  });

  const savedView = useSavedTableView({
    userId: user?.id,
    scope: `ifrs9-report:${reportType}`,
    enabled: Boolean(user?.id),
    onApplyView: (view) => {
      applySavedView(view);
      const savedSearch = typeof view.state.search === 'string' ? view.state.search : '';
      setSearchTerm(savedSearch);
    },
  });

  const missingParams = React.useMemo(
    () => requiredParams.filter((param) => {
      const value = filters[param as keyof ReportFilters];
      return value === null || value === undefined || value === '';
    }),
    [filters, requiredParams],
  );

  const reportQuery = useIfrs9ReportQuery({
    reportType,
    filters,
    requiredParams,
    supportsPagination,
    queryParams,
    deferredSearchTerm,
    enabled: Boolean(tenant && filters.prc_date && missingParams.length === 0),
  });
  const loading = reportQuery.isLoading || reportQuery.isFetching;

  // Client-side search filtering
  const filteredData = React.useMemo(() => {
    if (supportsPagination) return data;
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter(row => {
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(lowerTerm)
      );
    });
  }, [data, searchTerm, supportsPagination]);

  const gridDensity = React.useMemo(() => {
    if (!supportsPagination) return undefined;
    return queryState.density === 'dense' ? 'compact' : queryState.density;
  }, [queryState.density, supportsPagination]);

  const segmentOptions = React.useMemo(() => {
    if (reportType !== 'lifetime-lgd' && reportType !== 'ead-model') return segments;
    const target = reportType === 'ead-model' ? 'ead' : 'lgd'
    const isTarget = (s: SegmentOption) => {
      const t = String((s as any).segment_type ?? (s as any).segmentType ?? '').toLowerCase();
      if (t) return t.includes(target);
      const name = String(s.segment_name ?? '').toLowerCase();
      const group = String(s.group_segment ?? s.groupSegment ?? '').toLowerCase();
      return new RegExp(`\\\\b${target}\\\\b`).test(name)
        || name.startsWith(target)
        || new RegExp(`\\\\b${target}\\\\b`).test(group)
        || group.startsWith(target);
    };
    return segments.filter(isTarget);
  }, [reportType, segments]);

  const groupSegmentOptions = React.useMemo(() => {
    if (reportType === 'gca-movement') {
      return [...GROUP_SEGMENT_ALLOWLIST_ORDER];
    }
    const unique = Array.from(
      new Set(
        segments
          .map((segment) => String(segment.group_segment || segment.groupSegment || '').trim())
          .filter((value) => value.length > 0)
      )
    );
    const byName = new Map<string, string>();
    for (const name of unique) {
      const key = name.toLowerCase();
      if (!byName.has(key)) byName.set(key, name);
    }
    return Array.from(byName.values()).sort((a, b) => a.localeCompare(b));
  }, [reportType, segments]);

  // --- Handlers ---

  const handleFilterChange = useCallback(<K extends keyof ReportFilters>(field: K, value: ReportFilters[K]) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }));
  }, []);

  const handleSaveCurrentView = useCallback(async () => {
    try {
      await savedView.saveDefaultView({
        ...toSavedViewState(),
        search: searchTerm,
      });
      setInfoMessage('Current table view saved.');
    } catch (err) {
      console.error('Failed to save table view:', err);
      setError(err instanceof Error ? err.message : 'Failed to save table view.');
    }
  }, [savedView, searchTerm, toSavedViewState]);

  const handleResetCurrentView = useCallback(async () => {
    try {
      await savedView.clearSavedView();
      resetView();
      setSearchTerm('');
      setInfoMessage('Saved table view cleared.');
    } catch (err) {
      console.error('Failed to clear table view:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear table view.');
    }
  }, [resetView, savedView]);

  const loadReportDebugConfig = useCallback(async () => {
    if (!canManageReportDebug) return;
    setReportDebugLoading(true);
    try {
      const response = await api.banking.ifrs9Reports.debugConfig.get() as ReportDebugConfigResponse;
      setReportDebugEnabled(Boolean(response?.data?.enabled));
    } catch (err) {
      console.error('Failed to load IFRS9 report debug config:', err);
    } finally {
      setReportDebugLoading(false);
    }
  }, [canManageReportDebug]);

  const handleToggleReportDebug = useCallback(async (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (!canManageReportDebug) return;
    setReportDebugSaving(true);
    try {
      const response = await api.banking.ifrs9Reports.debugConfig.update(checked) as ReportDebugConfigResponse;
      setReportDebugEnabled(Boolean(response?.data?.enabled ?? checked));
      await reportQuery.refetch();
    } catch (err) {
      console.error('Failed to update IFRS9 report debug config:', err);
      setError(err instanceof Error ? err.message : 'Failed to update report debug configuration.');
    } finally {
      setReportDebugSaving(false);
    }
  }, [canManageReportDebug, reportQuery]);

  const handleRun = useCallback(() => {
    void reportQuery.refetch();
  }, [reportQuery]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setFilters(getDefaultFilters(reportType));
    setColumnFilters({});
    setSort([]);
    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
  }, [queryState.paginationModel.pageSize, reportType, setColumnFilters, setPaginationModel, setSort]);

  const handleExportExecute = useCallback(async () => {
    setExportLoading(true);
    setExportDialogOpen(false);

    try {
      type XLSXNamespace = typeof import('xlsx');
      const xlsxModule = (await import('xlsx')) as XLSXNamespace & { default?: XLSXNamespace };
      const XLSX: XLSXNamespace = xlsxModule.default ?? xlsxModule;
      const format = exportOptions.format as 'xlsx' | 'csv' | 'pdf';
      const scopeVal = exportOptions.scope as 'visible' | 'by_date' | 'date_range' | 'all_pages';

      const fetchReportPage = async (params: any) => {
        switch (reportType) {
          case 'nominative-report': return api.banking.ifrs9Reports.nominativeReport.get(params);
          case 'lifetime-pd-yearly': return api.banking.ifrs9Reports.lifetimePD.getYearly(params);
          case 'lifetime-pd-monthly': return api.banking.ifrs9Reports.lifetimePD.getMonthly(params);
          case 'lifetime-pd-account-details': return api.banking.ifrs9Reports.lifetimePD.getAccountDetails(params);
          case 'lifetime-lgd': return api.banking.ifrs9Reports.lifetimeLGD.get(params);
          case 'ead-model': return api.banking.ifrs9Reports.eadModel.get(params);
          case 'ecl-result': return api.banking.ifrs9Reports.eclResult.get(params);
          case 'ecl-movement': return api.banking.ifrs9Reports.eclMovement.get(params);
          case 'gca-movement': return api.banking.ifrs9Reports.gcaMovement.get(params);
          default: throw new Error(`Unsupported report type for export: ${reportType}`);
        }
      };

      const buildCurrentTableQueryParams = (processingDate: Date, page: number, limit: number) => {
        if (!supportsPagination) return {};
        return {
          ...queryParams,
          page,
          offset: (page - 1) * limit,
          limit,
          cursor: undefined,
          paginationMode: 'offset',
          search: deferredSearchTerm.trim() || undefined,
          prc_date: formatLocalDate(processingDate),
        };
      };

      const buildBaseParams = (processingDate: Date) => {
        const params: Record<string, any> = {
          prc_date: formatLocalDate(processingDate),
        };
        if (filters.segment_id) params.segment_id = filters.segment_id;
        if (filters.stage && (Array.isArray(filters.stage) ? filters.stage.length > 0 : true)) params.stage = filters.stage;
        if (filters.branch_code) params.branch_code = filters.branch_code;
        if (filters.group_segment) params.group_segment = filters.group_segment;
        if (filters.pd_config_id) params.pd_config_id = filters.pd_config_id;
        if (filters.pd_method) params.pd_method = filters.pd_method;
        if (filters.scalar_id) params.scalar_id = filters.scalar_id;
        if (typeof filters.fl_flag === 'boolean') params.fl_flag = filters.fl_flag;
        if (filters.lgd_config_id) params.lgd_config_id = filters.lgd_config_id;
        if (filters.lgd_method) params.lgd_method = filters.lgd_method;
        if (filters.model_id) params.model_id = filters.model_id;
        if (filters.ead_config_id) params.ead_config_id = filters.ead_config_id;
        return params;
      };

      const fetchAllRowsForDate = async (processingDate: Date) => {
        if (!supportsPagination) {
          const result = await fetchReportPage({
            ...buildBaseParams(processingDate),
            search: deferredSearchTerm.trim() || undefined,
          });
          const rows = Array.isArray(result?.data) ? result.data : [];
          return rows as Record<string, unknown>[];
        }

        const limit = 1000;
        const first = await fetchReportPage({
          ...buildBaseParams(processingDate),
          ...buildCurrentTableQueryParams(processingDate, 1, limit),
        });
        const firstRows = Array.isArray(first?.data) ? first.data : [];
        const totalPages = Math.max(1, Number(first?.pagination?.totalPages ?? 1));

        if (totalPages === 1) return firstRows as Record<string, unknown>[];

        const pages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, idx) => {
            const page = idx + 2;
            return fetchReportPage({
              ...buildBaseParams(processingDate),
              ...buildCurrentTableQueryParams(processingDate, page, limit),
            });
          })
        );

        const restRows = pages.flatMap((p: any) => (Array.isArray(p?.data) ? p.data : []));
        return [...firstRows, ...restRows] as Record<string, unknown>[];
      };

      const buildHeaderT1 = (processingDate: Date | null) => [
        ['Report Name', title],
        ['Processing Date', processingDate ? formatLocalDate(processingDate) : 'N/A'],
        ['Segments', filters.segment_id ? String(filters.segment_id) : 'All'],
        ['LGD Config / Method', `${filters.lgd_config_id || 'N/A'} / ${filters.lgd_method || 'N/A'}`],
        ['Model Version / ID', `v1.2 / ${filters.model_id || 'DEFAULT'}`],
        ['Forward Looking', filters.fl_flag ? `ON (Scenario=${filters.scenario_id}; Scalar=${filters.scalar_id})` : 'OFF'],
        ['Last Calculation', new Date().toISOString()],
        ['Environment', 'Production'],
        ['Generated By', user?.fullName || user?.email || 'System'],
        ['Generated At', new Date().toLocaleString()],
        ['Notes', 'Confidential – Internal Use Only'],
        [],
      ];

      const addSheet = (workbook: import('xlsx').WorkBook, sheetTitle: string, processingDate: Date | null, rows: Record<string, unknown>[]) => {
        const headerT1 = buildHeaderT1(processingDate);
        const worksheet = XLSX.utils.aoa_to_sheet(headerT1);
        if (rows.length > 0) {
          XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A13' });
          const maxWidth = 30;
          const colWidths = Object.keys(rows[0] || {}).map((key) => ({
            wch: Math.min(maxWidth, Math.max(key.length, ...rows.map((row) => String((row as any)[key] ?? '').length))),
          }));
          worksheet['!cols'] = colWidths;
        }
        const safeName = sheetTitle.substring(0, 31).replace(/[/\\*?[\\]]/g, '');
        XLSX.utils.book_append_sheet(workbook, worksheet, safeName);
      };

      const createCombinedWorksheet = (rows: Record<string, unknown>[], processingDate: Date | null) => {
        const headerT1 = buildHeaderT1(processingDate);
        const worksheet = XLSX.utils.aoa_to_sheet(headerT1);
        if (rows.length > 0) {
          XLSX.utils.sheet_add_json(worksheet, rows, { origin: 'A13' });
        }
        return worksheet;
      };

      const workbook = XLSX.utils.book_new();
      let csvWorksheet: import('xlsx').WorkSheet | null = null;
      let pdfPayload: { title: string; rows: Record<string, unknown>[]; processingDate: Date | null } | null = null;

      if (scopeVal === 'date_range') {
        const from = exportOptions.fromDate;
        const to = exportOptions.toDate;
        if (!from || !to) throw new Error('Please select both From and To dates.');
        if (from > to) throw new Error('From date must be earlier than To date.');

        const start = new Date(from.getFullYear(), from.getMonth(), 1);
        const end = new Date(to.getFullYear(), to.getMonth(), 1);
        const dates: Date[] = [];

        for (let d = new Date(start); d <= end; d = new Date(d.getFullYear(), d.getMonth() + 1, 1)) {
          const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
          dates.push(monthEnd);
        }

        if (format === 'xlsx') {
          for (const processingDate of dates) {
            const rows = await fetchAllRowsForDate(processingDate);
            addSheet(workbook, formatLocalDate(processingDate), processingDate, rows);
          }
        } else {
          const combined: Record<string, unknown>[] = [];
          for (const processingDate of dates) {
            const rows = await fetchAllRowsForDate(processingDate);
            for (const row of rows) {
              combined.push({ processing_date: formatLocalDate(processingDate), ...row });
            }
          }
          csvWorksheet = createCombinedWorksheet(combined, null);
          pdfPayload = { title, rows: combined, processingDate: null };
        }
      } else if (scopeVal === 'visible') {
        const visibleRows = supportsPagination ? data : filteredData;
        if (visibleRows.length === 0) throw new Error('No data to export.');
        if (format === 'xlsx') {
          addSheet(workbook, title, filters.prc_date, visibleRows);
        } else {
          csvWorksheet = createCombinedWorksheet(visibleRows, filters.prc_date);
          pdfPayload = { title, rows: visibleRows, processingDate: filters.prc_date };
        }
      } else {
        if (!filters.prc_date) throw new Error('Please select a processing date.');
        const rows = await fetchAllRowsForDate(filters.prc_date);
        if (rows.length === 0) throw new Error('No data to export for the selected date.');
        if (format === 'xlsx') {
          addSheet(workbook, title, filters.prc_date, rows);
        } else {
          csvWorksheet = createCombinedWorksheet(rows, filters.prc_date);
          pdfPayload = { title, rows, processingDate: filters.prc_date };
        }
      }

      const dateStr = filters.prc_date ? formatLocalDate(filters.prc_date) : formatLocalDate(new Date());
      const filename = `${reportType}-${dateStr}-export`;

      if (format === 'xlsx') {
        const arrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([arrayBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const sheet =
          csvWorksheet ||
          (workbook.SheetNames.length > 0 ? workbook.Sheets[workbook.SheetNames[0]] : null);
        if (!sheet) throw new Error('No export data available.');

        const csv = XLSX.utils.sheet_to_csv(sheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        if (!pdfPayload) throw new Error('No export data available.');

        const jspdfModule: any = await import('jspdf');
        const jsPDF = jspdfModule?.jsPDF ?? jspdfModule?.default;
        if (!jsPDF) throw new Error('PDF export library not available.');

        const autoTableModule: any = await import('jspdf-autotable');
        const autoTable = autoTableModule?.default ?? autoTableModule;

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'pt',
          format: 'a4',
        });

        const headerLines = buildHeaderT1(pdfPayload.processingDate)
          .filter((row) => Array.isArray(row) && row.length >= 2 && row[0])
          .map((row) => `${String(row[0])}: ${String(row[1] ?? '')}`);

        doc.setFontSize(16);
        doc.text('Export Report', 40, 40);
        doc.setFontSize(10);
        let y = 60;
        for (const line of headerLines) {
          doc.text(line, 40, y);
          y += 14;
          if (y > 140) break;
        }

        const rows = pdfPayload.rows;
        if (rows.length === 0) {
          doc.text('No data available.', 40, y + 20);
        } else {
          const allKeys = Array.from(
            rows.reduce((set, row) => {
              Object.keys(row).forEach((k) => set.add(k));
              return set;
            }, new Set<string>())
          );

          const head = [allKeys.map((k) => k.replace(/_/g, ' ').toUpperCase())];
          const body = rows.map((row) => allKeys.map((k) => String((row as any)[k] ?? '')));

          autoTable(doc, {
            head,
            body,
            startY: Math.max(120, y + 10),
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: { fillColor: [25, 118, 210] },
            alternateRowStyles: { fillColor: [245, 247, 250] },
            margin: { left: 40, right: 40 },
          });
        }

        doc.save(`${filename}.pdf`);
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  }, [exportOptions, reportType, filters, data, filteredData, supportsPagination, title, user, deferredSearchTerm, queryParams]);

  // --- Effects ---

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
      onDataLoaded(nextData, response.summary ?? null);
    }
  }, [filters.prc_date, missingParams, onDataLoaded, reportQuery.data, reportType, tenant]);

  useEffect(() => {
    if (reportQuery.error) {
      console.error('Report fetch error:', reportQuery.error);
      setReportMeta(null);
      setError(reportQuery.error instanceof Error ? reportQuery.error.message : 'Failed to fetch report data');
    }
  }, [reportQuery.error]);

  useEffect(() => {
    if (externalFilters) {
      setFilters(prev => ({ ...prev, ...externalFilters }));
    }
  }, [externalFilters]);

  useEffect(() => { loadReportDebugConfig(); }, [loadReportDebugConfig]);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const now = Date.now();
        const segmentsFresh = lookupCache.segments && now - lookupCache.segments.ts < LOOKUP_CACHE_TTL_MS;
        const scalarsFresh = lookupCache.scalars && now - lookupCache.scalars.ts < LOOKUP_CACHE_TTL_MS;

        if (segmentsFresh) setSegments(lookupCache.segments!.value);
        if (scalarsFresh) setScalars(lookupCache.scalars!.value);

        if (!segmentsFresh || !scalarsFresh) {
          const [segData, scalData] = await Promise.all([
            segmentsFresh ? Promise.resolve(lookupCache.segments!.value) : api.banking.populationSegments.getAll({ active_flag: true }),
            scalarsFresh ? Promise.resolve(lookupCache.scalars!.value) : api.banking.pdSetup.getFLScalars()
          ]);

          if (!segmentsFresh) {
            const normalizedSegments = (Array.isArray(segData) ? segData : []).map((segment: any) => {
              const id = segment?.id ?? segment?.pkid ?? segment?.segment_id ?? segment?.segmentId;
              return { ...segment, id };
            });
            lookupCache.segments = { ts: now, value: normalizedSegments };
            setSegments(normalizedSegments);
          }

          if (!scalarsFresh) {
            const normalizedScalars = Array.isArray(scalData) ? scalData : [];
            lookupCache.scalars = { ts: now, value: normalizedScalars };
            setScalars(normalizedScalars);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'r': e.preventDefault(); handleRun(); break;
          case 'e': e.preventDefault(); if (data.length > 0) setExportDialogOpen(true); break;
          case 'c': e.preventDefault(); handleClear(); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleClear, data.length]);

  // --- Theme Styles ---

  const themeStyles = React.useMemo((): ThemeStyles => {
    switch (bankingMode) {
      case 'syariah':
        return { gradient: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)', primary: '#00695c', shadow: 'rgba(0, 105, 92, 0.3)' };
      case 'dual':
        return { gradient: 'linear-gradient(135deg, #37474f 0%, #263238 100%)', primary: '#37474f', shadow: 'rgba(55, 71, 79, 0.3)' };
      default:
        return { gradient: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)', primary: '#1976D2', shadow: 'rgba(25, 118, 210, 0.3)' };
    }
  }, [bankingMode]);

  // --- Render ---

  const headerNode = !hideHeader ? (
    <Ifrs9ReportHeader
      title={title}
      description={description}
      statusLabel={statusLabel}
      granularity={granularity}
      scope={scope}
      headerIcon={headerIcon}
      themeStyles={themeStyles}
    />
  ) : null;

  const debugMeta = reportMeta?.debug ?? null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 0, position: 'relative', minHeight: '60vh' }}>
        <ModernLoader
          open={loading}
          message={`Loading ${title}`}
          subMessage="Retrieving financial data..."
        />

        {headerAtTop ? headerNode : null}

        {!hideHeader && (
          <Ifrs9ReportToolbar
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              if (supportsPagination) {
                setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
              }
            }}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            hideFilters={hideFilters}
            supportsCharts={supportsCharts}
            loading={loading}
            exportLoading={exportLoading}
            hasData={data.length > 0}
            onRefresh={handleRun}
            onExport={() => setExportDialogOpen(true)}
            headerAtTop={headerAtTop}
            themeStyles={themeStyles}
          />
        )}

        {!headerAtTop ? headerNode : null}

        {!hideHeader && !hideFilters && showFilters && (
          <Ifrs9ReportFilters
            filters={filters}
            reportType={reportType}
            optionalParams={optionalParams}
            segmentOptions={segmentOptions}
            groupSegmentOptions={groupSegmentOptions}
            lgdConfigs={lgdConfigs}
            lgdMethods={lgdMethods}
            eadConfigs={eadConfigs}
            loading={loading}
            onFilterChange={handleFilterChange}
            onClear={handleClear}
            onRun={handleRun}
            onOpenConfigDrawer={() => setConfigDrawerOpen(true)}
            themeStyles={themeStyles}
          />
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {infoMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInfoMessage(null)}>{infoMessage}</Alert>}

        {effectivePrcDate && filters.prc_date && effectivePrcDate !== formatLocalDate(filters.prc_date) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Snapshot used: <strong>{effectivePrcDate}</strong>{' '}
            {effectivePrcDate < formatLocalDate(filters.prc_date)
              ? '(latest available data on or before the selected processing date).'
              : '(nearest available data after the selected processing date).'}
          </Alert>
        )}

        <Ifrs9ReportDebugPanel
          canManageReportDebug={canManageReportDebug}
          reportDebugEnabled={reportDebugEnabled}
          reportDebugLoading={reportDebugLoading}
          reportDebugSaving={reportDebugSaving}
          onToggleReportDebug={handleToggleReportDebug}
          debugMeta={debugMeta}
          title={title}
          dataLength={data.length}
          themeStyles={themeStyles}
        />

        {children}

        <Ifrs9ReportDataGrid
          columns={columns}
          filteredData={filteredData}
          data={data}
          loading={loading}
          hideDataGrid={hideDataGrid}
          supportsPagination={supportsPagination}
          reportType={reportType}
          pagination={pagination}
          queryState={queryState}
          gridDensity={gridDensity}
          filterDefinitions={filterDefinitions}
          onPaginationModelChange={(model) => {
            setPaginationModel({ page: model.page, pageSize: model.pageSize });
            handlePaginationChange(model.page + 1, model.pageSize);
          }}
          onColumnFiltersChange={setColumnFilters}
          onSortModelChange={(model) => {
            setSort(
              model
                .filter((item) => item.sort === 'asc' || item.sort === 'desc')
                .map((item) => ({ field: item.field, direction: item.sort as 'asc' | 'desc' }))
            );
          }}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          onDensityChange={setDensity}
          onSaveView={handleSaveCurrentView}
          onResetView={handleResetCurrentView}
          renderDetailPanel={reportType === 'lifetime-lgd' ? renderLifetimeLgdDetailPanel : undefined}
          themeStyles={themeStyles}
        />

        {data.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Box component="p" sx={{ m: 0, fontSize: '0.875rem', color: 'text.secondary' }}>
              Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} (filtered from {data.length})
              {supportsPagination && ` (Page ${pagination.page} of ${pagination.totalPages})`}
              {' • '}
              Generated at {new Date().toLocaleString('id-ID')}
            </Box>
          </Box>
        )}

        <Ifrs9ReportExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          exportOptions={exportOptions}
          onExportOptionsChange={setExportOptions}
          onExecute={handleExportExecute}
          themeStyles={themeStyles}
        />

        <Ifrs9ReportConfigDrawer
          open={configDrawerOpen}
          onClose={() => setConfigDrawerOpen(false)}
          filters={filters}
          themeStyles={themeStyles}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default BaseIfrs9Report;
