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
  Radio,
  RadioGroup,
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
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  RadioButtonChecked as RadioButtonCheckedIcon
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
import { GridColDef } from '@mui/x-data-grid';
import { useAuth } from '../../providers/AuthProvider';
import api from '../../services/api';
import ModernLoader from '../common/ModernLoader'; // ✅ Import ModernLoader
import * as XLSX from 'xlsx'; // ✅ Import xlsx for client-side export
import { useBankingTheme } from '../../providers/BankingThemeProvider';

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
  onDataLoaded?: (data: Record<string, unknown>[], summary?: Record<string, any>) => void;
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
  page?: number;
  limit?: number;
}

export interface ReportResponse {
  success: boolean;
  data: Record<string, unknown>[];
  columns?: Array<{
    field: string;
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
  const [filters, setFilters] = useState<ReportFilters>({
    prc_date: reportType === 'ead-model' ? new Date('2020-12-31') : 
              reportType.includes('pd') ? new Date('2022-10-31') : 
              new Date('2023-12-31'),
    page: 1,
    limit: 20,
    segment_ids: [],
    fl_flag: false,
    ead_config_id: reportType === 'ead-model' ? 1 : undefined,
    pd_config_id: reportType.includes('pd') ? 1 : undefined,
    pd_method: reportType.includes('pd') ? 1 : undefined
  });

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
  const [segments, setSegments] = useState<any[]>([]);
  const [scalars, setScalars] = useState<any[]>([]);
  const [lgdMethods, setLgdMethods] = useState<any[]>([]);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);

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

  // --- Handlers & Logic (Defined early to avoid hoisting issues) ---

  const handleFilterChange = useCallback((field: keyof ReportFilters, value: any) => {
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

    const firstRow = data[0];
    const baseColumns: GridColDef[] = [];

    // Generate columns based on data structure
    Object.keys(firstRow).forEach(key => {
      const value = firstRow[key];
      const column: GridColDef = {
        field: key,
        headerName: key.replace(/_/g, ' ').toUpperCase(),
        width: 150,
        sortable: true,
        filterable: true
      };

      // Type-specific column configuration
      if (typeof value === 'number') {
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
      } else if (key.includes('stage')) {
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

      // Apply default cell styling if renderCell wasn't already set differently
      if (!column.renderCell) {
        column.renderCell = (params: any) => (
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
<<<<<<< HEAD
      const params: any = {
        ...filters,
        prc_date: filters.prc_date.toISOString().split('T')[0],
        stage: Array.isArray(filters.stage) ? filters.stage.join(',') : filters.stage
=======
      const normalizedStage = Array.isArray(filters.stage) ? filters.stage.join(',') : filters.stage;
      const params = {
        ...filters,
        stage: normalizedStage,
        prc_date: filters.prc_date.toISOString().split('T')[0]
>>>>>>> 521306240d98329e44c992adf972ef8b04b40740
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
          response = {
            ...eadData,
            summary: eadSummary.data?.[0] || null
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
        setData(response.data || []);

        // Use columns from backend if available (for empty data scenarios), otherwise generate from data
        let finalColumns: GridColDef[] = [];
        
        if (response.columns && Array.isArray(response.columns) && response.columns.length > 0) {
          // Backend provided column metadata (useful when data is empty)
          finalColumns = response.columns.map((col: any) => ({
            field: col.field || col.column_name,
            headerName: col.headerName || col.field?.replace(/_/g, ' ').toUpperCase() || '',
            width: col.width || 150,
            type: col.type || 'string',
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
        } else if (response.data && response.data.length > 0) {
          // Generate columns from actual data (fallback)
          finalColumns = generateDynamicColumns(response.data);
        }
        
        setColumns(finalColumns);

        // Handle pagination
        if (response.pagination) {
          setPagination(response.pagination);
        }

        // Notify parent component
        if (onDataLoaded) {
          onDataLoaded(response.data || [], (response as any).summary);
        }
      } else {
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
    setFilters({
      prc_date: reportType === 'ead-model' ? new Date('2020-12-31') : 
                reportType.includes('pd') ? new Date('2022-10-31') : 
                new Date('2023-12-31'),
      page: 1,
      limit: 20,
      segment_ids: [],
      stage: [],
      fl_flag: false,
      ead_config_id: reportType === 'ead-model' ? 1 : undefined,
      pd_config_id: reportType.includes('pd') ? 1 : undefined,
      pd_method: reportType.includes('pd') ? 1 : undefined,
      lgd_config_id: reportType === 'lifetime-lgd' ? 1 : undefined
    });
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
      const format = exportOptions.format as 'xlsx' | 'csv' | 'pdf';
      const scope = exportOptions.scope;

      // Inject T1 Header if it's Excel/CSV
      const headerT1 = [
        ['Report Name', title],
        ['Processing Date', filters.prc_date?.toISOString().split('T')[0] || 'N/A'],
        ['Segments', filters.segment_ids?.length ? filters.segment_ids.join(', ') : 'All'],
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

      // Create workbook
      const workbook = XLSX.utils.book_new();
      let worksheet: XLSX.WorkSheet;

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

      const dateStr = filters.prc_date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      const filename = `${reportType}-${dateStr}`;

      if (format === 'xlsx') {
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else if (format === 'csv') {
        XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
      }

      console.log(`✅ Exported ${filteredData.length} rows with audit header to ${filename}.${format}`);
    } catch (err) {
      console.error('Export error:', err);
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
        const [segData, scalData] = await Promise.all([
          api.banking.populationSegments.getAll({ active_flag: true }),
          api.banking.pdSetup.getFLScalars()
        ]);
        setSegments(segData || []);
        setScalars(scalData || []);

        if (reportType === 'lifetime-lgd') {
          const methods = await api.banking.lgdConfigurations.getMethods();
          setLgdMethods(methods || []);
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
              {exportLoading ? 'Processing...' : 'Export Excellence'}
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
                                multiple
                                size="small"
                                options={segments}
                                disableCloseOnSelect
                                getOptionLabel={(option) => option.segment_name || String(option.id)}
                                value={segments.filter(s => filters.segment_ids?.includes(Number(s.id)))}
                                onChange={(_, newValue) => {
                                  handleFilterChange('segment_ids', newValue.map(v => Number(v.id)));
                                }}
                                renderOption={(props, option, { selected }) => {
                                  const { key, ...optionProps } = props;
                                  return (
                                    <li key={key} {...optionProps}>
                                    <Checkbox
                                      icon={<CheckBoxOutlineBlankIcon style={{ fontSize: '20px' }} />}
                                      checkedIcon={<CheckBoxIcon style={{ fontSize: '20px' }} />}
                                      style={{ marginRight: 8 }}
                                      checked={selected}
                                    />
                                    {option.segment_name}
                                  </li>
                                  );
                                }}
                                renderInput={(params) => (
                                  <TextField
                                    {...(params as any)}
                                    label="Segment ID"
                                    placeholder="All Segments"
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                  />
                                )}
                                renderTags={(value, getTagProps) =>
                                  value.map((option, index) => {
                                    const { key, ...tagProps } = getTagProps({ index });
                                    return (
                                      <Chip
                                        key={key}
                                        label={option.segment_name}
                                        size="small"
                                        {...tagProps}
                                        sx={{ borderRadius: 1, fontWeight: 600 }}
                                      />
                                    );
                                  })
                                }
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
                              <TextField
                                label="LGD Config ID"
                                type="number"
                                size="small"
                                value={filters.lgd_config_id || ''}
                                onChange={(e) => handleFilterChange('lgd_config_id', parseInt(e.target.value) || undefined)}
                                fullWidth
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                                slotProps={{
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
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
                                    )
                                  }
                                }}
                              />
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
                                    {...(params as any)} 
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
                      Reset Defaults
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
                      No Lifetime PD Data Available
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please check your filter parameters (Processing Date, PD Config ID, PD Method)
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
        {/* Export Excellence Dialog */}
        <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, bgcolor: alpha(themeStyles.primary, 0.03) }}>
            Export Excellence
          </DialogTitle>
          <DialogContent sx={{ mt: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              Export Scope
            </Typography>
            <RadioGroup
              value={exportOptions.scope}
              onChange={(e) => setExportOptions(prev => ({ ...prev, scope: e.target.value }))}
            >
              <FormControlLabel 
                value="summary" 
                control={
                  <Radio 
                    icon={<RadioButtonUncheckedIcon style={{ fontSize: '20px' }} />}
                    checkedIcon={<RadioButtonCheckedIcon style={{ fontSize: '20px' }} />}
                  />
                } 
                label="Summary & Top Results" 
              />
              <FormControlLabel 
                value="account" 
                control={
                  <Radio 
                    icon={<RadioButtonUncheckedIcon style={{ fontSize: '20px' }} />}
                    checkedIcon={<RadioButtonCheckedIcon style={{ fontSize: '20px' }} />}
                  />
                } 
                label="Account-level Details" 
              />
              <FormControlLabel 
                value="all" 
                control={
                  <Radio 
                    icon={<RadioButtonUncheckedIcon style={{ fontSize: '20px' }} />}
                    checkedIcon={<RadioButtonCheckedIcon style={{ fontSize: '20px' }} />}
                  />
                } 
                label="All Data (ZIP)" 
                disabled 
              />
            </RadioGroup>

            <Typography variant="subtitle2" fontWeight={700} gutterBottom sx={{ mt: 3 }}>
              Format
            </Typography>
            <RadioGroup
              row
              value={exportOptions.format}
              onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value }))}
            >
              <FormControlLabel 
                value="xlsx" 
                control={
                  <Radio 
                    icon={<RadioButtonUncheckedIcon style={{ fontSize: '20px' }} />}
                    checkedIcon={<RadioButtonCheckedIcon style={{ fontSize: '20px' }} />}
                  />
                } 
                label="Excel" 
              />
              <FormControlLabel 
                value="csv" 
                control={
                  <Radio 
                    icon={<RadioButtonUncheckedIcon style={{ fontSize: '20px' }} />}
                    checkedIcon={<RadioButtonCheckedIcon style={{ fontSize: '20px' }} />}
                  />
                } 
                label="CSV" 
              />
              <FormControlLabel 
                value="pdf" 
                control={
                  <Radio 
                    icon={<RadioButtonUncheckedIcon style={{ fontSize: '20px' }} />}
                    checkedIcon={<RadioButtonCheckedIcon style={{ fontSize: '20px' }} />}
                  />
                } 
                label="PDF" 
                disabled 
              />
            </RadioGroup>

            <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: 'info.light', color: 'info.contrastText', display: 'flex', gap: 1.5 }}>
              <InfoIcon style={{ fontSize: '20px' }} />
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
