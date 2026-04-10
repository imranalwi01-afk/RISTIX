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
} = {
  segments: null,
  scalars: null,
  lgdMethods: null,
  lgdConfigs: null,
};

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
  hideHeader,
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
    scope: 'summary',
    format: 'xlsx'
  });
  const [segments, setSegments] = useState<SegmentOption[]>([]);
  const [scalars, setScalars] = useState<Record<string, unknown>[]>([]);
  const [lgdMethods, setLgdMethods] = useState<LgdMethodOption[]>([]);
  const [lgdConfigs, setLgdConfigs] = useState<LgdConfigOption[]>([]);
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
      const params: Record<string, string | number | boolean | string[] | undefined> = {
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
    if (filteredData.length === 0) {
      console.warn('No data to export');
      return;
    }

    setExportLoading(true);
    setExportDialogOpen(false);

    try {
      type XLSXNamespace = typeof import('xlsx');
      const xlsxModule = (await import('xlsx')) as XLSXNamespace & { default?: XLSXNamespace };
      const XLSX: XLSXNamespace = xlsxModule.default ?? xlsxModule;
      const format = exportOptions.format as 'xlsx' | 'csv' | 'pdf';
      const scope = exportOptions.scope;

      // Inject T1 Header if it's Excel/CSV
      const headerT1 = [
        ['Report Name', title],
        ['Processing Date', filters.prc_date ? formatLocalDate(filters.prc_date) : 'N/A'],
        ['Segments', filters.segment_id ? String(filters.segment_id) : 'All'],
        ['LGD Config / Method', `${filters.lgd_config_id || 'N/A'} / ${filters.lgd_method || 'N/A'}`],
        ['Model Version / ID', `v1.2 / ${filters.model_id || 'DEFAULT'}`],
        ['Forward Looking', filters.fl_flag ? `ON (Scenario=${filters.scenario_id}; Scalar=${filters.scalar_id})` : 'OFF'],
        ['Last Calculation', new Date().toISOString()],
        ['Environment', 'Production'],
        ['Generated By', user?.fullName || user?.email || 'System'],
        ['Generated At', new Date().toLocaleString()],
        ['Notes', 'Confidential – Internal Use Only'],
        [] // Spacer
      ];

      if (format === 'pdf') {
        const [{ jsPDF }, autoTableModule] = await Promise.all([
          import('jspdf'),
          import('jspdf-autotable'),
        ])
        const autoTable = (autoTableModule as any).default || (autoTableModule as any)

        const rows = scope === 'summary' && supportsCharts ? filteredData.slice(0, 10) : filteredData
        const columns = Object.keys(rows[0] || {})

        const safeCell = (value: unknown) => {
          if (value === null || value === undefined) return ''
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
          try {
            return JSON.stringify(value)
          } catch {
            return String(value)
          }
        }

        const capturePngFromSvg = async (svg: SVGSVGElement) => {
          const rect = svg.getBoundingClientRect()
          const width = Math.max(1, Math.round(rect.width))
          const height = Math.max(1, Math.round(rect.height))
          const cloned = svg.cloneNode(true) as SVGSVGElement
          if (!cloned.getAttribute('xmlns')) {
            cloned.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
          }
          if (!cloned.getAttribute('xmlns:xlink')) {
            cloned.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')
          }
          cloned.setAttribute('width', String(width))
          cloned.setAttribute('height', String(height))

          const serialized = new XMLSerializer().serializeToString(cloned)
          const blob = new Blob([serialized], { type: 'image/svg+xml;charset=utf-8' })
          const url = URL.createObjectURL(blob)

          try {
            const img = new Image()
            img.decoding = 'async'
            const loaded = new Promise<void>((resolve, reject) => {
              img.onload = () => resolve()
              img.onerror = () => reject(new Error('Failed to load SVG image'))
            })
            img.src = url
            await loaded

            const scale = 2
            const canvas = document.createElement('canvas')
            canvas.width = width * scale
            canvas.height = height * scale
            const ctx = canvas.getContext('2d')
            if (!ctx) return null

            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.scale(scale, scale)
            ctx.drawImage(img, 0, 0, width, height)
            return { dataUrl: canvas.toDataURL('image/png'), width, height }
          } finally {
            URL.revokeObjectURL(url)
          }
        }

        const capturePdfCharts = async () => {
          if (typeof document === 'undefined') return []
          const chartNodes = Array.from(document.querySelectorAll(`[data-pdf-export-chart="${reportType}"]`))
          const out: Array<{ dataUrl: string; width: number; height: number }> = []

          for (const node of chartNodes.slice(0, 2)) {
            const el = node as HTMLElement
            const canvas = el.querySelector('canvas') as HTMLCanvasElement | null
            if (canvas) {
              try {
                const rect = canvas.getBoundingClientRect()
                const width = Math.max(1, Math.round(rect.width))
                const height = Math.max(1, Math.round(rect.height))
                out.push({ dataUrl: canvas.toDataURL('image/png'), width, height })
                continue
              } catch {
                continue
              }
            }

            const svg = el.querySelector('svg') as SVGSVGElement | null
            if (!svg) continue
            try {
              const captured = await capturePngFromSvg(svg)
              if (captured) out.push(captured)
            } catch {
              continue
            }
          }

          return out
        }

        const orientation = columns.length > 8 ? 'landscape' : 'portrait'
        const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' })
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()

        doc.setFontSize(14)
        doc.setTextColor(17, 24, 39)
        doc.text(title, 32, 32)

        doc.setFontSize(9)
        doc.setTextColor(71, 85, 105)
        const requestedDate = filters.prc_date ? formatLocalDate(filters.prc_date) : 'N/A'
        const effectiveDateLabel = effectivePrcDate ? ` (Effective: ${effectivePrcDate})` : ''
        doc.text(`Processing Date: ${requestedDate}${effectiveDateLabel}`, 32, 48, { maxWidth: pageWidth - 64 })
        doc.text(`Generated By: ${user?.fullName || user?.email || 'System'} | Generated At: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`, 32, 62, {
          maxWidth: pageWidth - 64,
        })

        const footer = () => {
          const pageNumber = doc.getCurrentPageInfo().pageNumber
          const totalPages = doc.getNumberOfPages()
          doc.setFontSize(9)
          doc.setTextColor(100)
          doc.text(`Page ${pageNumber} / ${totalPages}`, pageWidth - 32, pageHeight - 18, { align: 'right' })
        }

        const auditBody = headerT1
          .filter((row) => Array.isArray(row) && row.length >= 2 && row[0])
          .map((row) => [safeCell(row[0]), safeCell(row[1])])

        autoTable(doc, {
          head: [['Field', 'Value']],
          body: auditBody,
          startY: 80,
          margin: { left: 32, right: 32, bottom: 36 },
          styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
          headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          didDrawPage: footer,
        })

        const afterAuditY = (doc as any).lastAutoTable?.finalY
        let cursorY = (typeof afterAuditY === 'number' ? afterAuditY : 120) + 22

        const charts = supportsCharts ? await capturePdfCharts() : []
        if (charts.length > 0) {
          doc.setFontSize(11)
          doc.setTextColor(17, 24, 39)
          doc.text('Chart', 32, cursorY + 14)
          cursorY += 22

          for (const chart of charts) {
            const maxWidth = pageWidth - 64
            const aspect = chart.height > 0 ? chart.width / chart.height : 1
            const targetWidth = maxWidth
            let targetHeight = aspect > 0 ? targetWidth / aspect : 240

            const availableHeight = pageHeight - cursorY - 80
            if (targetHeight > availableHeight && availableHeight > 60) {
              targetHeight = availableHeight
            }

            if (cursorY + targetHeight > pageHeight - 60) {
              doc.addPage()
              doc.setFontSize(14)
              doc.setTextColor(17, 24, 39)
              doc.text(title, 32, 32)
              doc.setFontSize(9)
              doc.setTextColor(71, 85, 105)
              const requestedDate = filters.prc_date ? formatLocalDate(filters.prc_date) : 'N/A'
              const effectiveDateLabel = effectivePrcDate ? ` (Effective: ${effectivePrcDate})` : ''
              doc.text(`Processing Date: ${requestedDate}${effectiveDateLabel}`, 32, 48, { maxWidth: pageWidth - 64 })
              doc.text(`Generated By: ${user?.fullName || user?.email || 'System'} | Generated At: ${new Date().toISOString().replace('T', ' ').slice(0, 19)}`, 32, 62, {
                maxWidth: pageWidth - 64,
              })
              cursorY = 80
            }

            doc.addImage(chart.dataUrl, 'PNG', 32, cursorY, targetWidth, targetHeight)
            cursorY += targetHeight + 16
          }
        }

        const dataStartY = cursorY + 18

        doc.setFontSize(11)
        doc.setTextColor(17, 24, 39)
        doc.text(scope === 'summary' && supportsCharts ? 'Top Results' : 'Data', 32, dataStartY - 10)

        autoTable(doc, {
          head: [columns],
          body: rows.map((row) => columns.map((key) => safeCell((row as any)[key]))),
          startY: dataStartY,
          margin: { left: 32, right: 32, bottom: 36, top: 80 },
          styles: { fontSize: columns.length > 10 ? 6 : 7, cellPadding: 3, overflow: 'linebreak' },
          headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          didDrawPage: footer,
        })

        const dateStr = filters.prc_date ? formatLocalDate(filters.prc_date) : formatLocalDate(new Date())
        doc.save(`${reportType}-${dateStr}.pdf`)
        return
      }

      // Create workbook
      const workbook = XLSX.utils.book_new();
      let worksheet: import('xlsx').WorkSheet;

      if (scope === 'summary' && supportsCharts) {
        worksheet = XLSX.utils.aoa_to_sheet(headerT1);
        XLSX.utils.sheet_add_json(worksheet, filteredData.slice(0, 10), { origin: 'A13' });
      } else {
        worksheet = XLSX.utils.aoa_to_sheet(headerT1);
        XLSX.utils.sheet_add_json(worksheet, filteredData, { origin: 'A13' });
      }

      const sheetName = title.substring(0, 31).replace(/[/\\*?[\]]/g, '');
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Auto-size columns
      const maxWidth = 30;
      const colWidths = Object.keys(filteredData[0] || {}).map(key => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...filteredData.map(row => String(row[key] || '').length)))
      }));
      worksheet['!cols'] = colWidths;

      const dateStr = filters.prc_date ? formatLocalDate(filters.prc_date) : formatLocalDate(new Date());
      const filename = `${reportType}-${dateStr}`;

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
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      }

      console.log(`✅ Exported ${filteredData.length} rows with audit header to ${filename}.${format}`);
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
      } catch (err) {
        console.error('Failed to load lookups:', err);
      }
    };
    loadLookups();
  }, [reportType]);

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
    () =>
      Array.from(
        new Set(
          segments
            .map((segment) => String(segment.group_segment || segment.groupSegment || '').trim())
            .filter((value) => value.length > 0)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [segments]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 0, position: 'relative', minHeight: '60vh' }}>
        {/* ✅ ADD: Modern Loader Overlay */}
        <ModernLoader
          open={loading}
          message={`Loading ${title}`}
          subMessage="Retrieving financial data..."
        />

        {/* Enhanced Page Header with Gradient - Premium Look */}
        {!hideHeader && (
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
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em', fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
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

              {/* Quick Stats / Info Bar */}
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
                  <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}>
                    Report Granularity
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{granularity}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}>
                    Scope
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{scope}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.2, display: 'block', mb: 0.5 }}>
                    Last Calculation
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Action buttons & Control Bar */}
        {!hideHeader && (
          <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
              {exportLoading ? 'Processing...' : 'Export to Excel'}
            </Button>
          </Box>
        )}

        {/* Filters */}
        {!hideHeader && showFilters && (
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
                              <Autocomplete
                                size="small"
                                options={groupSegmentOptions}
                                value={filters.group_segment || null}
                                onChange={(_, newValue) => handleFilterChange('group_segment', newValue || undefined)}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Group Segment"
                                    placeholder="All Group Segments"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                  />
                                )}
                              />
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
                              <TextField
                                label="EAD Config ID"
                                type="number"
                                size="small"
                                value={filters.ead_config_id || ''}
                                onChange={(e) => handleFilterChange('ead_config_id', parseInt(e.target.value) || undefined)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
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
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, bgcolor: alpha(themeStyles.primary, 0.03) }}>
            Export Report
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="export-scope-label">Export Scope</InputLabel>
              <Select
                labelId="export-scope-label"
                label="Export Scope"
                value={exportOptions.scope}
                onChange={(e) => setExportOptions(prev => ({ ...prev, scope: String(e.target.value) }))}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="summary">Summary & Top Results</MenuItem>
                <MenuItem value="account">Account-level Details</MenuItem>
                <MenuItem value="all" disabled>All Data (ZIP)</MenuItem>
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
                <MenuItem value="xlsx">Excel</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
              </Select>
            </FormControl>

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
