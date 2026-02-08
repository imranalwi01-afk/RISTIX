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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  alpha
} from '@mui/material';
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
  Assessment as AssessmentIcon
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
  reportType: 'nominative-report' | 'lifetime-pd-yearly' | 'lifetime-pd-monthly' |
  'lifetime-lgd' | 'ead-model' | 'ecl-result' | 'ecl-movement' | 'gca-movement';
  requiredParams: string[];
  optionalParams?: string[];
  supportsPagination?: boolean;
  supportsCharts?: boolean;
  headerIcon?: React.ReactNode;
  statusLabel?: string;
  granularity?: string;
  scope?: string;
  onDataLoaded?: (data: Record<string, unknown>[]) => void;
  children?: React.ReactNode;
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
  stage?: '1' | '2' | '3';
  fl_flag?: boolean;
  branch_code?: string;
  page?: number;
  limit?: number;
}

export interface ReportResponse {
  success: boolean;
  data: Record<string, unknown>[];
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
  children
}) => {
  const { user } = useAuth();
  const { bankingMode } = useBankingTheme();

  // Extract tenant from user data - Memoized to prevent infinite loops
  const tenant = React.useMemo(() =>
    user?.tenantId ? { id: user.tenantId, slug: user.tenantSlug } : null
    , [user?.tenantId, user?.tenantSlug]);

  // State management
  const fetchRef = React.useRef(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [columns, setColumns] = useState<GridColDef[]>([]);
  const [filters, setFilters] = useState<ReportFilters>({
    prc_date: new Date('2023-12-31'), // Use date with available FRS9PRO data
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [showFilters, setShowFilters] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

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

      column.renderCell = (params) => (
        <Box sx={{ fontWeight: 500 }}>{params.formattedValue}</Box>
      );

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
      const params = {
        ...filters,
        prc_date: filters.prc_date.toISOString().split('T')[0]
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
        case 'lifetime-lgd':
          response = await api.banking.ifrs9Reports.lifetimeLGD.get(params);
          break;
        case 'ead-model':
          response = await api.banking.ifrs9Reports.eadModel.get(params);
          break;
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

        // Generate dynamic columns
        const dynamicColumns = generateDynamicColumns(response.data || []);
        setColumns(dynamicColumns);

        // Handle pagination
        if (response.pagination) {
          setPagination(response.pagination);
        }

        // Notify parent component
        if (onDataLoaded) {
          onDataLoaded(response.data || []);
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

  // Handle filter changes
  const handleFilterChange = (field: keyof ReportFilters, value: string | number | boolean | Date | null | undefined) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle pagination change
  const handlePaginationChange = (page: number, pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      page,
      limit: pageSize
    }));
  };

  // Export functionality - Client-side using xlsx library
  const handleExport = async (format: 'xlsx' | 'csv' | 'pdf') => {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    setExportLoading(true);
    try {
      // Create worksheet from data
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Create workbook
      const workbook = XLSX.utils.book_new();
      const sheetName = title.substring(0, 31).replace(/[/\\*?[\]]/g, ''); // Max 31 chars, no special chars
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Auto-size columns
      const maxWidth = 30;
      const colWidths = Object.keys(data[0] || {}).map(key => ({
        wch: Math.min(maxWidth, Math.max(key.length, ...data.map(row => String(row[key] || '').length)))
      }));
      worksheet['!cols'] = colWidths;

      // Generate filename
      const dateStr = filters.prc_date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
      const filename = `${reportType}-${dateStr}`;

      if (format === 'xlsx') {
        // Export as XLSX
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else if (format === 'csv') {
        // Export as CSV
        XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
      }

      console.log(`✅ Exported ${data.length} rows to ${filename}.${format}`);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    if (tenant && filters.prc_date) {
      fetchData();
    }
  }, [tenant, fetchData, filters.prc_date]);

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

        {/* Action buttons & Control Bar */}
        <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
            onClick={() => handleExport('xlsx')}
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

        {/* Filters */}
        {showFilters && (
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
                      // Handle Dayjs or Date
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

                {/* Optional Parameters */}
                {optionalParams.includes('segment_id') && (
                  <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TextField
                      label="Segment ID"
                      type="number"
                      size="small"
                      value={filters.segment_id || ''}
                      onChange={(e) => handleFilterChange('segment_id', parseInt(e.target.value) || undefined)}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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

                {optionalParams.includes('scalar_id') && (
                  <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TextField
                      label="Scalar ID"
                      type="number"
                      size="small"
                      value={filters.scalar_id || ''}
                      onChange={(e) => handleFilterChange('scalar_id', parseInt(e.target.value) || undefined)}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                      label={<Typography variant="body2" fontWeight={500}>Forward Looking</Typography>}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                )}

                {optionalParams.includes('stage') && (
                  <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Stage</InputLabel>
                      <Select
                        value={filters.stage || ''}
                        onChange={(e) => handleFilterChange('stage', e.target.value)}
                        label="Stage"
                        sx={{ borderRadius: 2 }}
                      >
                        <MenuItem value="">All Stages</MenuItem>
                        <MenuItem value="1">Stage 1</MenuItem>
                        <MenuItem value="2">Stage 2</MenuItem>
                        <MenuItem value="3">Stage 3</MenuItem>
                      </Select>
                    </FormControl>
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
                        <MenuItem value={1}>Workout</MenuItem>
                        <MenuItem value={2}>Model-Based</MenuItem>
                      </Select>
                    </FormControl>
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
                    />
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

                {optionalParams.includes('branch_code') && (
                  <Grid size={{ xs: 12, sm: 4, md: 2 }}>
                    <TextField
                      label="Branch Code"
                      size="small"
                      value={filters.branch_code || ''}
                      onChange={(e) => handleFilterChange('branch_code', e.target.value)}
                      fullWidth
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                )}
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={fetchData}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                  sx={{ 
                    borderRadius: 2,
                    px: 4,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                    textTransform: 'none',
                    fontWeight: 700
                  }}
                >
                  {loading ? 'Processing...' : 'Run Analysis'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setFilters({
                    prc_date: new Date('2023-12-31'),
                    page: 1,
                    limit: 20
                  })}
                  startIcon={<ClearIcon />}
                  sx={{ 
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Clear Filters
                </Button>
              </Box>
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
        {columns.length > 0 && (
          <Paper sx={{ height: 600, width: '100%' }}>
            <SafeDataGrid
              rows={data}
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
            />
          </Paper>
        )}

        {/* Summary */}
        {data.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {data.length} {data.length === 1 ? 'record' : 'records'}
              {supportsPagination && ` (Page ${pagination.page} of ${pagination.totalPages})`}
              {' • '}
              Generated at {new Date().toLocaleString('id-ID')}
            </Typography>
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default BaseIfrs9Report;