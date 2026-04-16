// packages/frontend/src/components/ifrs9/BaseIfrs9Report.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Switch,
  FormControlLabel,
  Autocomplete,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  InputAdornment,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  Visibility as ViewIcon,
  Info as InfoIcon,
  Launch as LaunchIcon,
  SettingsSuggest as SettingsIcon,
} from '@mui/icons-material';
import {
  DatePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  BarChart as ChartIcon,
  Search as SearchIcon,
  ClearAll as ClearIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon
} from '@mui/icons-material';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAuth } from '../../providers/AuthProvider';
import api from '../../services/api';
import ModernLoader from '../common/ModernLoader'; // ✅ Import ModernLoader
import { useBankingTheme } from '../../providers/BankingThemeProvider';

const formatLocalDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const LOOKUP_CACHE_TTL_MS = 5 * 60 * 1000;
const lookupCache: {
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

const EAD_CONFIG_ALLOWLIST_ORDER = [
  'EAD Model',
  'EAD All Segment',
  'EAD Factoring',
  'EAD Repo',
  'EAD Treasury',
  'EAD Model - Stable',
  'EAD Model - Run Off',
] as const;

const GROUP_SEGMENT_ALLOWLIST_ORDER = [
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

export interface BaseIfrs9ReportProps {
  title: string;
  description?: string;
  reportType: 'nominative-report' | 'lifetime-pd-yearly' | 'lifetime-pd-monthly' | 'lifetime-pd-account-details' |
  'lifetime-lgd' | 'ead-model' | 'ecl-result' | 'ecl-movement' | 'gca-movement';
  requiredParams: string[];
  optionalParams?: string[];
  supportsPagination?: boolean;
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
  pd_config_id?: number;
  pd_method?: number;
  scalar_id?: number;
  lgd_config_id?: number;
  lgd_method?: number;
  model_id?: number;
  ead_config_id?: number;
  segment_id?: number;
  segment_ids?: number[]; // Added for multi-select
  scenario_id?: number;   // Added for FL
  stage?: string | string[];
  fl_flag?: boolean;
  branch_code?: string;
  group_segment?: string;
  page?: number;
  limit?: number;
}

interface SegmentOption {
  id: number | string;
  segment_name?: string;
  group_segment?: string;
  groupSegment?: string;
  segment_type?: string;
  segmentType?: string;
}

interface LgdConfigOption {
  id: number | string;
  model_name?: string;
}

interface LgdMethodOption {
  value: number;
  label: string;
}

interface EadConfigOption {
  id: number | string;
  model_name: string;
}

const getDefaultFilters = (reportType: BaseIfrs9ReportProps['reportType']): ReportFilters => ({
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
  };
  message?: string;
  effectivePrcDate?: string | null;
  summary?: Record<string, unknown> | null;
}

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
  const { bankingMode } = useBankingTheme();

  // Extract tenant from user data - Memoized to prevent infinite loops
  const tenant = React.useMemo(() => {
    return user?.tenantId ? { id: user.tenantId, slug: user.tenantSlug } : null;
  }, [user?.tenantId, user?.tenantSlug]);

  // State management
  const fetchRef = React.useRef(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [filters, setFilters] = useState<ReportFilters>(getDefaultFilters(reportType));

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    scope: 'all_pages',
    format: 'xlsx',
    fromDate: null as Date | null,
    toDate: null as Date | null,
  });
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [scalars, setScalars] = useState<Record<string, unknown>[]>([]);
  const [lgdMethods, setLgdMethods] = useState<LgdMethodOption[]>([]);
  const [lgdConfigs, setLgdConfigs] = useState<LgdConfigOption[]>([]);
  const [eadConfigs, setEadConfigs] = useState<EadConfigOption[]>([]);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [effectivePrcDate, setEffectivePrcDate] = useState<string | null>(null);

  // Client-side search filtering
  const filteredData = React.useMemo(() => {
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter(row => {
      return Object.values(row).some(val => 
        String(val).toLowerCase().includes(lowerTerm)
      );
    });
  }, [data, searchTerm]);

  const segmentOptions = React.useMemo(() => {
    if (reportType !== 'lifetime-lgd' && reportType !== 'ead-model') return segments;

    const target = reportType === 'ead-model' ? 'ead' : 'lgd'
    const isTarget = (s: SegmentOption) => {
      const t = String((s as any).segment_type ?? (s as any).segmentType ?? '').toLowerCase();
      if (t) return t.includes(target);

      const name = String(s.segment_name ?? '').toLowerCase();
      const group = String(s.group_segment ?? s.groupSegment ?? '').toLowerCase();
      return new RegExp(`\\b${target}\\b`).test(name)
        || name.startsWith(target)
        || new RegExp(`\\b${target}\\b`).test(group)
        || group.startsWith(target);
    };

    return segments.filter(isTarget);
  }, [reportType, segments]);

  // --- Handlers & Logic (Defined early to avoid hoisting issues) ---

  const handleFilterChange = useCallback(<K extends keyof ReportFilters>(field: K, value: ReportFilters[K]) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      page,
      limit: pageSize
    }));
  }, []);

  // Dynamic column generation for pivot tables
  const generateDynamicColumns = useCallback((data: Record<string, unknown>[]): GridColDef[] => {
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

    // Generate columns based on data structure
    orderedKeys.forEach(key => {
      const value = getSampleValue(key);
      const column: GridColDef = {
        field: key,
        headerName: formatHeaderName(key),
        width: 150,
        sortable: true,
        filterable: true
      };

      // Type-specific column configuration
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

      // Special formatting for specific fields
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

      // Apply default cell styling if renderCell wasn't already set differently
      if (!column.renderCell) {
        column.renderCell = (params: GridRenderCellParams) => (
          <Box sx={{ fontWeight: 500 }}>{params.formattedValue ?? params.value ?? ''}</Box>
        );
      }

      baseColumns.push(column);
    });

    return baseColumns;
  }, []);

  // Fetch data based on report type
  const fetchData = useCallback(async () => {
    if (!tenant) {
      setError('Tenant context required');
      return;
    }

    // Validate required parameters
    const missingParams = requiredParams.filter(param => {
      const value = filters[param as keyof ReportFilters];
      return value === null || value === undefined || value === '';
    });

    if (missingParams.length > 0) {
      setError(`Missing required parameters: ${missingParams.join(', ')}`);
      return;
    }

    if (fetchRef.current) return;
    fetchRef.current = true;

    setLoading(true);
    setError(null);

    try {
      if (!filters.prc_date) {
        setError('Processing date is required');
        return;
      }

      let response: ReportResponse;
      const params: any = {
        prc_date: formatLocalDate(filters.prc_date),
        pd_config_id: filters.pd_config_id,
        pd_method: filters.pd_method,
        scalar_id: filters.scalar_id,
        lgd_config_id: filters.lgd_config_id,
        lgd_method: filters.lgd_method,
        model_id: filters.model_id,
        ead_config_id: filters.ead_config_id,
        segment_id: Number.isFinite(Number(filters.segment_id)) ? filters.segment_id : undefined,
        scenario_id: filters.scenario_id,
        fl_flag: filters.fl_flag,
        branch_code: filters.branch_code,
        group_segment: filters.group_segment,
        page: filters.page,
        limit: filters.limit,
        stage: Array.isArray(filters.stage)
          ? (filters.stage.length > 0 ? filters.stage.map(String) : undefined)
          : (filters.stage ? String(filters.stage) : undefined),
      };

      // Route to appropriate API method based on report type
      switch (reportType) {
        case 'nominative-report':
          response = await api.banking.ifrs9Reports.nominativeReport.get(params);
          break;
        case 'lifetime-pd-yearly':
          response = await api.banking.ifrs9Reports.lifetimePD.getYearly(params);
          break;
        case 'lifetime-pd-monthly':
          response = await api.banking.ifrs9Reports.lifetimePD.getMonthly(params);
          break;
        case 'lifetime-pd-account-details':
          response = await api.banking.ifrs9Reports.lifetimePD.getAccountDetails(params);
          break;
        case 'lifetime-lgd':
          response = await api.banking.ifrs9Reports.lifetimeLGD.get(params);
          break;
        case 'ead-model': {
          const eadData = await api.banking.ifrs9Reports.eadModel.get(params);
          const eadSummary = await api.banking.ifrs9Reports.eadModel.getSummary(params);
          let summaryRow = eadSummary.data?.[0] ?? null;

          const summaryTotalAccounts =
            summaryRow && typeof summaryRow === 'object' && 'totalAccounts' in summaryRow
              ? Number((summaryRow as { totalAccounts?: unknown }).totalAccounts ?? 0)
              : 0;

          if (summaryTotalAccounts === 0) {
            const fallbackSummary = await api.banking.ifrs9Reports.eadModel.getSummary({
              ...params,
              ead_config_id: undefined,
              segment_id: undefined,
            });
            summaryRow = fallbackSummary.data?.[0] ?? summaryRow;
          }

          response = {
            ...eadData,
            summary: summaryRow
          };
          break;
        }
        case 'ecl-result':
          response = await api.banking.ifrs9Reports.eclResult.get(params);
          break;
        case 'ecl-movement':
          response = await api.banking.ifrs9Reports.eclMovement.get(params);
          break;
        case 'gca-movement':
          response = await api.banking.ifrs9Reports.gcaMovement.get(params);
          break;
        default:
          throw new Error(`Unknown report type: ${reportType}`);
      }

      if (response.success) {
        const rawData = response.data || [];
        let nextData = rawData;

        if (reportType === 'gca-movement' || reportType === 'ecl-movement') {
          const numericKeys = new Set<string>();
          for (const row of rawData) {
            for (const [k, v] of Object.entries(row || {})) {
              if (v === null || v === undefined || v === '') continue;
              if (typeof v === 'number') numericKeys.add(k);
              if (typeof v === 'string' && Number.isFinite(Number(v))) numericKeys.add(k);
            }
          }

          nextData = rawData.map((row) => {
            const out: Record<string, unknown> = { ...(row || {}) };
            for (const k of numericKeys) {
              const v = out[k];
              if (v === null || v === undefined || v === '') out[k] = 0;
            }
            return out;
          });
        }

        setData(nextData);
        setEffectivePrcDate(response.effectivePrcDate ?? null);
        if (nextData.length === 0) {
          setError(response.message || 'No data available for the selected processing date and filters.');
        }

        // Use columns from backend if available (for empty data scenarios), otherwise generate from data
        let finalColumns: GridColDef[] = [];
        
        if (response.columns && Array.isArray(response.columns) && response.columns.length > 0) {
          // Backend provided column metadata (useful when data is empty)
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
                  maximumFractionDigits: 2
                }).format(value);
              },
              align: 'right' as const,
              headerAlign: 'right' as const
            })
          }));
        } else if (nextData.length > 0) {
          // Generate columns from actual data (fallback)
          finalColumns = generateDynamicColumns(nextData);
        }

        if (reportType === 'gca-movement' || reportType === 'ecl-movement') {
          finalColumns = finalColumns.map((col) => {
            if (col.type !== 'number') return col;
            if (col.field === 'movement_order') return col;
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

        // Handle pagination
        if (response.pagination) {
          setPagination(response.pagination);
        }

        // Notify parent component
        if (onDataLoaded) {
          onDataLoaded(nextData, response.summary ?? null);
        }
      } else {
        setEffectivePrcDate(null);
        setError('Failed to fetch report data');
      }
    } catch (err: unknown) {
      console.error('Report fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch report data';
      setError(errorMessage);
    } finally {
      setLoading(false);
      fetchRef.current = false;
    }
  }, [reportType, filters, tenant, requiredParams, generateDynamicColumns, onDataLoaded]);

  const handleRun = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setFilters(getDefaultFilters(reportType));
  }, [reportType]);

  // --- Effects ---

  // Export functionality - Client-side using xlsx library with Audit Header (T1)
  const handleExportExecute = async () => {
    setExportLoading(true);
    setExportDialogOpen(false);

    try {
      type XLSXNamespace = typeof import('xlsx');
      const xlsxModule = (await import('xlsx')) as XLSXNamespace & { default?: XLSXNamespace };
      const XLSX: XLSXNamespace = xlsxModule.default ?? xlsxModule;
      const format = exportOptions.format as 'xlsx' | 'csv' | 'pdf';
      const scope = exportOptions.scope as 'visible' | 'by_date' | 'date_range' | 'all_pages';

      const fetchReportPage = async (params: any) => {
        switch (reportType) {
          case 'nominative-report':
            return api.banking.ifrs9Reports.nominativeReport.get(params);
          case 'lifetime-pd-yearly':
            return api.banking.ifrs9Reports.lifetimePD.getYearly(params);
          case 'lifetime-pd-monthly':
            return api.banking.ifrs9Reports.lifetimePD.getMonthly(params);
          case 'lifetime-pd-account-details':
            return api.banking.ifrs9Reports.lifetimePD.getAccountDetails(params);
          case 'lifetime-lgd':
            return api.banking.ifrs9Reports.lifetimeLGD.get(params);
          case 'ead-model':
            return api.banking.ifrs9Reports.eadModel.get(params);
          case 'ecl-result':
            return api.banking.ifrs9Reports.eclResult.get(params);
          case 'ecl-movement':
            return api.banking.ifrs9Reports.eclMovement.get(params);
          case 'gca-movement':
            return api.banking.ifrs9Reports.gcaMovement.get(params);
          default:
            throw new Error(`Unsupported report type for export: ${reportType}`);
        }
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
          const result = await fetchReportPage(buildBaseParams(processingDate));
          const rows = Array.isArray(result?.data) ? result.data : [];
          return rows as Record<string, unknown>[];
        }

        const limit = 1000;
        const first = await fetchReportPage({ ...buildBaseParams(processingDate), page: 1, limit });
        const firstRows = Array.isArray(first?.data) ? first.data : [];
        const totalPages = Math.max(1, Number(first?.pagination?.totalPages ?? 1));

        if (totalPages === 1) return firstRows as Record<string, unknown>[];

        const pages = await Promise.all(
          Array.from({ length: totalPages - 1 }, (_, idx) => {
            const page = idx + 2;
            return fetchReportPage({ ...buildBaseParams(processingDate), page, limit });
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

        const safeName = sheetTitle.substring(0, 31).replace(/[/\\*?[\]]/g, '');
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

      // Create workbook (XLSX only; CSV/PDF can use a single worksheet)
      const workbook = XLSX.utils.book_new();
      let csvWorksheet: import('xlsx').WorkSheet | null = null;
      let pdfPayload: { title: string; rows: Record<string, unknown>[]; processingDate: Date | null } | null = null;

      if (scope === 'date_range') {
        const from = exportOptions.fromDate;
        const to = exportOptions.toDate;
        if (!from || !to) {
          throw new Error('Please select both From and To dates.');
        }
        if (from > to) {
          throw new Error('From date must be earlier than To date.');
        }

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
      } else if (scope === 'visible') {
        if (filteredData.length === 0) {
          throw new Error('No data to export.');
        }
        if (format === 'xlsx') {
          addSheet(workbook, title, filters.prc_date, filteredData);
        } else {
          csvWorksheet = createCombinedWorksheet(filteredData, filters.prc_date);
          pdfPayload = { title, rows: filteredData, processingDate: filters.prc_date };
        }
      } else {
        if (!filters.prc_date) {
          throw new Error('Please select a processing date.');
        }
        const rows = await fetchAllRowsForDate(filters.prc_date);
        if (rows.length === 0) {
          throw new Error('No data to export for the selected date.');
        }
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

      console.log(`✅ Exported report with audit header to ${filename}.${format}`);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExportLoading(false);
    }
  };

  // Sync external filters
  useEffect(() => {
    if (externalFilters) {
      setFilters(prev => ({
        ...prev,
        ...externalFilters
      }));
    }
  }, [externalFilters]);

  // Fetch lookups
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const now = Date.now();
        const segmentsFresh = lookupCache.segments && now - lookupCache.segments.ts < LOOKUP_CACHE_TTL_MS;
        const scalarsFresh = lookupCache.scalars && now - lookupCache.scalars.ts < LOOKUP_CACHE_TTL_MS;

        if (segmentsFresh) {
          setSegments(lookupCache.segments!.value);
        }
        if (scalarsFresh) {
          setScalars(lookupCache.scalars!.value);
        }

        if (!segmentsFresh || !scalarsFresh) {
          const [segData, scalData] = await Promise.all([
            segmentsFresh ? Promise.resolve(lookupCache.segments!.value) : api.banking.populationSegments.getAll({ active_flag: true }),
            scalarsFresh ? Promise.resolve(lookupCache.scalars!.value) : api.banking.pdSetup.getFLScalars()
          ]);

          if (!segmentsFresh) {
            const normalizedSegments = (Array.isArray(segData) ? segData : []).map((segment: any) => {
              const id = segment?.id ?? segment?.pkid ?? segment?.segment_id ?? segment?.segmentId;
              return {
                ...segment,
                id
              };
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
              const normalized = Array.isArray(configs) ? configs : [];
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
                return { id, model_name };
              })
              .filter((config: any) => config.id !== undefined && config.id !== null && config.model_name);

            const sortedById = candidates
              .slice()
              .sort((a: any, b: any) => Number(a.id) - Number(b.id));

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
      if (prev.ead_config_id) return prev;
      const preferred = eadConfigs.find((c) => c.model_name.trim().toLowerCase() === 'ead model');
      const selected = preferred ?? eadConfigs[0];
      const parsed = Number(selected?.id);
      return Number.isFinite(parsed) ? { ...prev, ead_config_id: parsed } : prev;
    });
  }, [reportType, eadConfigs]);

  // Fetch data on initial load and date change
  useEffect(() => {
    if (tenant && filters.prc_date) {
      fetchData();
    }
  }, [tenant, fetchData, filters.prc_date]);

  // Keyboard Shortcuts (Accessibility)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'r':
            e.preventDefault();
            handleRun();
            break;
          case 'e':
            e.preventDefault();
            if (data.length > 0) setExportDialogOpen(true);
            break;
          case 'c':
            e.preventDefault();
            handleClear();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleClear, data.length]);

  // Dynamic Theme Colors based on Sidebar
  const themeStyles = React.useMemo(() => {
    switch (bankingMode) {
      case 'syariah':
        return {
          gradient: 'linear-gradient(135deg, #00695c 0%, #004d40 100%)',
          primary: '#00695c',
          shadow: 'rgba(0, 105, 92, 0.3)'
        };
      case 'dual':
        return {
          gradient: 'linear-gradient(135deg, #37474f 0%, #263238 100%)',
          primary: '#37474f',
          shadow: 'rgba(55, 71, 79, 0.3)'
        };
      default:
        return {
          gradient: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
          primary: '#1976D2',
          shadow: 'rgba(25, 118, 210, 0.3)'
        };
    }
  }, [bankingMode]);

  const groupSegmentOptions = React.useMemo(
    () => {
      // Keep GCA Movement dropdown fixed to match legacy UI list/order exactly.
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
    },
    [reportType, segments]
  );

  const headerNode = !hideHeader ? (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: { xs: 3, md: 5 },
        background: themeStyles.gradient,
        color: 'white',
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: themeStyles.shadow,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          filter: 'blur(40px)',
          pointerEvents: 'none'
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                fontSize: 48,
                mr: 2.5,
                p: 1.2,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 2,
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'inherit'
              }}
            >
              {headerIcon || <AssessmentIcon sx={{ fontSize: 32 }} />}
            </Box>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.5rem' } }}
              >
                {title}
              </Typography>
              {description && (
                <Typography
                  variant="body1"
                  sx={{
                    opacity: 0.9,
                    maxWidth: '800px',
                    fontWeight: 500,
                    lineHeight: 1.6
                  }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              icon={<AssessmentIcon sx={{ color: 'white !important', fontSize: '1.2rem' }} />}
              label={statusLabel}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: { xs: 'none', sm: 'flex' },
                px: 1
              }}
            />
            <Chip
              label="Live Production Data"
              color="success"
              size="small"
              sx={{
                fontWeight: 700,
                boxShadow: '0 2px 8px rgba(76, 175, 80, 0.4)',
                display: { xs: 'none', md: 'flex' }
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: { xs: 3, md: 5 },
            mt: 4,
            pt: 3,
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            flexWrap: 'wrap'
          }}
        >
          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}
            >
              Report Granularity
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {granularity}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}
            >
              Scope
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {scope}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}
            >
              Last Calculation
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  ) : null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 0, position: 'relative', minHeight: '60vh' }}>
        {/* ✅ ADD: Modern Loader Overlay */}
        <ModernLoader
          open={loading}
          message={`Loading ${title}`}
          subMessage="Retrieving financial data..."
        />

        {headerAtTop ? headerNode : null}

        {/* Action buttons & Control Bar */}
        {!hideHeader && (
          <Box sx={{
            mb: 4,
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            position: headerAtTop ? 'relative' : 'sticky',
            top: headerAtTop ? undefined : 74,
            zIndex: headerAtTop ? 1 : 2,
            py: 1,
            bgcolor: 'background.default'
          }}>
            <TextField
              placeholder="Search data..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                width: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper'
                }
              }}
            />

            {!hideFilters && (
              <Button
                variant={showFilters ? "contained" : "outlined"}
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  ...(showFilters && {
                    background: themeStyles.gradient,
                    boxShadow: `0 4px 12px ${alpha(themeStyles.primary, 0.3)}`
                  })
                }}
              >
                {showFilters ? 'Hide Filters' : 'Analysis Parameters'}
              </Button>
            )}

            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchData}
                  disabled={loading}
                  sx={{
                    bgcolor: alpha(themeStyles.primary, 0.05),
                    '&:hover': { bgcolor: alpha(themeStyles.primary, 0.1) }
                  }}
                >
                  <RefreshIcon sx={{ color: themeStyles.primary }} />
                </IconButton>
              </Tooltip>

              {supportsCharts && (
                <Tooltip title="Toggle Charts">
                  <IconButton
                    sx={{
                      bgcolor: alpha(themeStyles.primary, 0.05),
                      '&:hover': { bgcolor: alpha(themeStyles.primary, 0.1) }
                    }}
                  >
                    <ChartIcon sx={{ color: themeStyles.primary }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => setExportDialogOpen(true)}
              disabled={exportLoading || data.length === 0}
              sx={{
                borderRadius: 2,
                px: 3,
                textTransform: 'none',
                fontWeight: 700,
                background: themeStyles.gradient,
                boxShadow: `0 4px 14px ${alpha(themeStyles.primary, 0.4)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(themeStyles.primary, 0.5)}`,
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {exportLoading ? 'Processing...' : 'Export'}
            </Button>
          </Box>
        )}

        {!headerAtTop ? headerNode : null}

        {/* Filters */}
        {!hideHeader && !hideFilters && showFilters && (
          <Card sx={{
            mb: 4,
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Box sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              bgcolor: alpha(themeStyles.primary, 0.03),
              borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
            }}>
              <FilterIcon sx={{ mr: 1, color: themeStyles.primary, fontSize: 20 }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: themeStyles.primary }}>
                Analysis Configuration
              </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={2.5}>
                {/* Processing Date (Required) */}
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <DatePicker
                    label="Processing Date"
                    value={filters.prc_date}
                    onChange={(date: unknown) => {
                      const finalDate = date && (date as { toDate?: () => Date }).toDate
                        ? (date as { toDate: () => Date }).toDate()
                        : (date as Date | null);
                      handleFilterChange('prc_date', finalDate);
                    }}
                    enableAccessibleFieldDOMStructure={false}
                    slots={{
                      textField: TextField
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        size: 'small',
                        sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } }
                      }
                    }}
                  />
                </Grid>

                {/* Optional parameters wrapped in Accordion for cleaner UI */}
                {optionalParams.length > 0 && (
                  <Grid size={{ xs: 12 }}>
                    <Accordion 
                      variant="outlined" 
                      sx={{ 
                        mt: 2, 
                        borderRadius: '12px !important', 
                        borderColor: alpha(themeStyles.primary, 0.1),
                        '&:before': { display: 'none' },
                        boxShadow: 'none',
                        bgcolor: alpha(themeStyles.primary, 0.005)
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ px: 2, minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <TuneIcon sx={{ mr: 1, fontSize: 20, color: themeStyles.primary }} />
                          <Typography variant="subtitle2" fontWeight={700} color={themeStyles.primary}>
                            Advanced Parameters
                          </Typography>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ px: 2, pb: 3, pt: 1 }}>
                        <Grid container spacing={2.5}>
                          {optionalParams.includes('segment_id') && (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <Autocomplete
                                size="small"
                                options={segmentOptions}
                                getOptionLabel={(option) => option.segment_name || String(option.id)}
                                value={segmentOptions.find((s) => Number(s.id) === Number(filters.segment_id)) || null}
                                onChange={(_, newValue) => {
                                  const raw = newValue ? (newValue as any).id : undefined;
                                  const parsed = raw === null || raw === undefined ? NaN : Number(raw);
                                  const selectedSegmentId = Number.isFinite(parsed) ? parsed : undefined;
                                  handleFilterChange('segment_id', selectedSegmentId);
                                  handleFilterChange('segment_ids', selectedSegmentId ? [selectedSegmentId] : []);
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Segment ID"
                                    placeholder="All Segments"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                  />
                                )}
                              />
                            </Grid>
                          )}

                          {optionalParams.includes('group_segment') && (
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Group Segment</InputLabel>
                                <Select
                                  value={filters.group_segment || ''}
                                  onChange={(e) => handleFilterChange('group_segment', e.target.value ? String(e.target.value) : undefined)}
                                  label="Group Segment"
                                  sx={{ borderRadius: 2 }}
                                >
                                  <MenuItem value="">ALL</MenuItem>
                                  {groupSegmentOptions.map((value) => (
                                    <MenuItem key={value} value={value}>
                                      {value}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          )}

                          {optionalParams.includes('pd_config_id') && (
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <TextField
                                label="PD Config ID"
                                type="number"
                                size="small"
                                value={filters.pd_config_id || ''}
                                onChange={(e) => handleFilterChange('pd_config_id', parseInt(e.target.value) || undefined)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            </Grid>
                          )}

                          {optionalParams.includes('pd_method') && (
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>PD Method</InputLabel>
                                <Select
                                  value={filters.pd_method || ''}
                                  onChange={(e) => handleFilterChange('pd_method', e.target.value ? Number(e.target.value) : undefined)}
                                  label="PD Method"
                                  sx={{ borderRadius: 2 }}
                                >
                                  <MenuItem value="">All Methods</MenuItem>
                                  <MenuItem value={1}>TTC (Through-the-Cycle)</MenuItem>
                                  <MenuItem value={2}>PIT (Point-in-Time)</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          )}

                          {optionalParams.includes('ead_config_id') && (
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>EAD Model</InputLabel>
                                <Select
                                  value={filters.ead_config_id || ''}
                                  onChange={(e) => handleFilterChange('ead_config_id', e.target.value ? Number(e.target.value) : undefined)}
                                  label="EAD Model"
                                  sx={{ borderRadius: 2 }}
                                >
                                  {eadConfigs.length > 0 ? (
                                    eadConfigs.map((config) => (
                                      <MenuItem key={String(config.id)} value={Number(config.id)}>
                                        {config.model_name}
                                      </MenuItem>
                                    ))
                                  ) : (
                                    <MenuItem value="" disabled>
                                      No configurations
                                    </MenuItem>
                                  )}
                                </Select>
                              </FormControl>
                            </Grid>
                          )}

                          {optionalParams.includes('lgd_config_id') && (
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>LGD Config</InputLabel>
                                <Select
                                  value={filters.lgd_config_id || ''}
                                  onChange={(e) => handleFilterChange('lgd_config_id', e.target.value ? Number(e.target.value) : undefined)}
                                  label="LGD Config"
                                  sx={{ borderRadius: 2 }}
                                  endAdornment={
                                    <InputAdornment position="end" sx={{ mr: 4 }}>
                                      <Tooltip title="View Calculation Config Detailed Summary">
                                        <IconButton
                                          size="small"
                                          onClick={() => setConfigDrawerOpen(true)}
                                          sx={{
                                            color: themeStyles.primary,
                                            bgcolor: alpha(themeStyles.primary, 0.05),
                                            '&:hover': { bgcolor: alpha(themeStyles.primary, 0.1) }
                                          }}
                                        >
                                          <LaunchIcon sx={{ fontSize: '1.2rem' }} />
                                        </IconButton>
                                      </Tooltip>
                                    </InputAdornment>
                                  }
                                >
                                  <MenuItem value="">All Configurations</MenuItem>
                                  {lgdConfigs.map((config) => (
                                    <MenuItem key={config.id} value={config.id}>
                                      {config.model_name || `Config ${config.id}`}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          )}

                          {optionalParams.includes('lgd_method') && (
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>LGD Method</InputLabel>
                                <Select
                                  value={filters.lgd_method || ''}
                                  onChange={(e) => handleFilterChange('lgd_method', e.target.value ? Number(e.target.value) : undefined)}
                                  label="LGD Method"
                                  sx={{ borderRadius: 2 }}
                                >
                                  <MenuItem value="">All Methods</MenuItem>
                                  {lgdMethods.length > 0 ? (
                                    lgdMethods.map(m => (
                                      <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                                    ))
                                  ) : [
                                    <MenuItem key={1} value={1}>Workout</MenuItem>,
                                    <MenuItem key={2} value={2}>Collateral</MenuItem>,
                                    <MenuItem key={3} value={3}>Hybrid</MenuItem>
                                  ]}
                                </Select>
                              </FormControl>
                            </Grid>
                          )}

                          {optionalParams.includes('stage') && (
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <Autocomplete
                                multiple
                                size="small"
                                options={['1', '2', '3']}
                                getOptionLabel={(option) => `Stage ${option}`}
                                value={Array.isArray(filters.stage) ? filters.stage as string[] : (filters.stage ? [filters.stage as string] : [])}
                                onChange={(_, newValue) => handleFilterChange('stage', newValue)}
                                disableCloseOnSelect
                                renderInput={(params) => (
                                  <TextField 
                                    {...params} 
                                    label="Stage" 
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                  />
                                )}
                              />
                            </Grid>
                          )}

                          {optionalParams.includes('model_id') && (
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <TextField
                                label="Model ID"
                                type="number"
                                size="small"
                                value={filters.model_id || ''}
                                onChange={(e) => handleFilterChange('model_id', parseInt(e.target.value) || undefined)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                slotProps={{
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        <Tooltip title="View Model Development Details">
                                          <IconButton
                                            size="small"
                                            sx={{
                                              color: themeStyles.primary,
                                              bgcolor: alpha(themeStyles.primary, 0.05),
                                              '&:hover': { bgcolor: alpha(themeStyles.primary, 0.1) }
                                            }}
                                          >
                                            <SettingsIcon sx={{ fontSize: '1.2rem' }} />
                                          </IconButton>
                                        </Tooltip>
                                      </InputAdornment>
                                    )
                                  }
                                }}
                              />
                            </Grid>
                          )}

                          {optionalParams.includes('fl_flag') && (
                            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={filters.fl_flag || false}
                                    onChange={(e) => handleFilterChange('fl_flag', e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label={<Typography variant="body2" fontWeight={600}>Forward Looking</Typography>}
                                sx={{ mt: 0.5 }}
                              />
                            </Grid>
                          )}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                )}

                {/* Filter Actions */}
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={handleClear}
                      sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      Reset Filter
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<RefreshIcon />}
                      onClick={handleRun}
                      disabled={loading}
                      sx={{ 
                        borderRadius: 2, 
                        textTransform: 'none', 
                        fontWeight: 700,
                        background: themeStyles.gradient,
                        boxShadow: `0 4px 12px ${alpha(themeStyles.primary, 0.4)}`
                      }}
                    >
                      Run Analysis
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {effectivePrcDate && filters.prc_date && effectivePrcDate !== formatLocalDate(filters.prc_date) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Snapshot used: <strong>{effectivePrcDate}</strong>{' '}
            {effectivePrcDate < formatLocalDate(filters.prc_date)
              ? '(latest available data on or before the selected processing date).'
              : '(nearest available data after the selected processing date).'}
          </Alert>
        )}

        {/* Custom content */}
        {children}

        {/* Data Grid */}
        {columns.length > 0 && !hideDataGrid ? (
          <Paper sx={{ height: 600, width: '100%' }}>
            <SafeDataGrid
              rows={filteredData}
              columns={columns}
              loading={loading}
              pagination
              paginationMode={supportsPagination ? 'server' : 'client'}
              {...(supportsPagination && pagination.total > 0 && { rowCount: pagination.total })}
              paginationModel={{
                page: supportsPagination ? pagination.page - 1 : 0,
                pageSize: supportsPagination ? pagination.limit : 100
              }}
              onPaginationModelChange={(model) => {
                if (supportsPagination) {
                  handlePaginationChange(model.page + 1, model.pageSize);
                }
              }}
              pageSizeOptions={supportsPagination ? [10, 20, 50, 100] : [100]}
              getRowId={(row) => row.id || row.account_id || row.pkid || Math.random()}
              sx={{
                '& .MuiDataGrid-cell': {
                  fontSize: '0.875rem'
                },
                '& .MuiDataGrid-columnHeader': {
                  backgroundColor: themeStyles.primary,
                  color: '#ffffff',
                  fontWeight: 'bold'
                }
              }}
              slots={{
                noRowsOverlay: () => (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600 }}>
                      No Report Data Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please check your filter parameters and selected processing date.
                    </Typography>
                  </Box>
                )
              }}
            />
          </Paper>
        ) : !hideDataGrid && !loading ? (
          // Show message when no columns available (shouldn't happen with new backend, but fallback)
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
              No Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unable to determine table structure. Please check your database connection and filter parameters.
            </Typography>
          </Paper>
        ) : null}

        {/* Summary */}
        {data.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} (filtered from {data.length})
              {supportsPagination && ` (Page ${pagination.page} of ${pagination.totalPages})`}
              {' • '}
              Generated at {new Date().toLocaleString('id-ID')}
            </Typography>
          </Box>
        )}
        {/* Export Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, bgcolor: alpha(themeStyles.primary, 0.03) }}>
            Export Report
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="export-scope-label">Data</InputLabel>
              <Select
                labelId="export-scope-label"
                label="Data"
                value={exportOptions.scope}
                onChange={(e) => setExportOptions(prev => ({ ...prev, scope: String(e.target.value) }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="visible">Visible data</MenuItem>
                <MenuItem value="by_date">By date</MenuItem>
                <MenuItem value="date_range">Date range</MenuItem>
                <MenuItem value="all_pages">All (all pages for selected date)</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth size="small" sx={{ mt: 3 }}>
              <InputLabel id="export-format-label">Format</InputLabel>
              <Select
                labelId="export-format-label"
                label="Format"
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ ...prev, format: String(e.target.value) }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="xlsx">Excel (.xlsx)</MenuItem>
                <MenuItem value="csv">CSV (.csv)</MenuItem>
                <MenuItem value="pdf">PDF (.pdf)</MenuItem>
              </Select>
            </FormControl>

            {exportOptions.scope === 'date_range' && (
              <Box sx={{ mt: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <DatePicker
                  label="From"
                  value={exportOptions.fromDate}
                  onChange={(date: unknown) => {
                    const finalDate = date && (date as { toDate?: () => Date }).toDate
                      ? (date as { toDate: () => Date }).toDate()
                      : (date as Date | null);
                    setExportOptions(prev => ({ ...prev, fromDate: finalDate }));
                  }}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{ textField: TextField }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                    }
                  }}
                />
                <DatePicker
                  label="To"
                  value={exportOptions.toDate}
                  onChange={(date: unknown) => {
                    const finalDate = date && (date as { toDate?: () => Date }).toDate
                      ? (date as { toDate: () => Date }).toDate()
                      : (date as Date | null);
                    setExportOptions(prev => ({ ...prev, toDate: finalDate }));
                  }}
                  enableAccessibleFieldDOMStructure={false}
                  slots={{ textField: TextField }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                      sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } },
                    }
                  }}
                />
              </Box>
            )}

            <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'info.light', color: 'info.contrastText', display: 'flex', gap: 1.5 }}>
              <InfoIcon />
              <Typography variant="caption" fontWeight={600}>
                Export will include Audit Header (T1) and calculation metadata.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setExportDialogOpen(false)} color="inherit" sx={{ fontWeight: 600 }}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleExportExecute}
              sx={{
                background: themeStyles.gradient,
                fontWeight: 700,
                borderRadius: 2
              }}
            >
              Start Export
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Config Drawer */}
        <Drawer
          anchor="right"
          open={configDrawerOpen}
          onClose={() => setConfigDrawerOpen(false)}
          PaperProps={{ sx: { width: 400, p: 3 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={800} sx={{ flexGrow: 1 }}>
              Analysis Configuration
            </Typography>
            <IconButton onClick={() => setConfigDrawerOpen(false)}>
              <ClearIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Typography variant="subtitle2" color="primary" fontWeight={700} gutterBottom>
            EXECUTION PARAMETERS
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText
                primary="LGD Method"
                secondary={filters.lgd_method === 1 ? 'Workout (Recovery Curve)' : filters.lgd_method === 2 ? 'Collateral/Model-Based' : 'Hybrid/Selected'}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Processing Date"
                secondary={filters.prc_date?.toLocaleDateString() || 'N/A'}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Model Version"
                secondary={`LGD Model v1.2 (ID: ${filters.model_id || 'DEFAULT'})`}
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="Forward Looking"
                secondary={filters.fl_flag ? 'ENABLED' : 'DISABLED'}
              />
            </ListItem>
          </List>

          <Typography variant="subtitle2" color="primary" fontWeight={700} sx={{ mt: 3 }} gutterBottom>
            RECOVERY ASSUMPTIONS
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText primary="Discount Horizon" secondary="Lifetime (to legal maturity)" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Indirect Costs" secondary="3.5% of Recovery PV" />
            </ListItem>
            <ListItem>
              <ListItemText primary="Cure Rate Assumption" secondary="Model-derived (24 months)" />
            </ListItem>
          </List>

          <Box sx={{ mt: 'auto', p: 2, bgcolor: alpha(themeStyles.primary, 0.05), borderRadius: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Configurations are read-only in this view. To modify global parameters, please go to <b>LGD Setup</b>.
            </Typography>
          </Box>
        </Drawer>
      </Box>
    </LocalizationProvider>
  );
};

export default BaseIfrs9Report;
