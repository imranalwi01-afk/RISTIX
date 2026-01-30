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
  FormControlLabel
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
  BarChart as ChartIcon
} from '@mui/icons-material';
import { SafeDataGrid, SafeGridActionsCellItem, SafeDataGridProps } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridToolbar, GridValidRowModel } from '@mui/x-data-grid';
import { useAuth } from '../../providers/AuthProvider';
import api from '../../services/api';
import ModernLoader from '../common/ModernLoader'; // ✅ Import ModernLoader
import * as XLSX from 'xlsx'; // ✅ Import xlsx for client-side export

export interface BaseIfrs9ReportProps {
  title: string;
  description?: string;
  reportType: 'nominative-report' | 'lifetime-pd-yearly' | 'lifetime-pd-monthly' |
  'lifetime-lgd' | 'ead-model' | 'ecl-result' | 'ecl-movement' | 'gca-movement';
  requiredParams: string[];
  optionalParams?: string[];
  supportsPagination?: boolean;
  supportsCharts?: boolean;
  onDataLoaded?: (data: any[]) => void;
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
  data: any[];
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
  onDataLoaded,
  children
}) => {
  const { user } = useAuth();

  // Extract tenant from user data - Memoized to prevent infinite loops
  const tenant = React.useMemo(() =>
    user?.tenantId ? { id: user.tenantId, slug: user.tenantSlug } : null
    , [user?.tenantId, user?.tenantSlug]);

  // State management
  const [data, setData] = useState<any[]>([]);
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

  // Dynamic column generation for pivot tables
  const generateDynamicColumns = useCallback((data: any[]): GridColDef[] => {
    if (!data || data.length === 0) return [];

    const firstRow = data[0];
    const baseColumns: GridColDef[] = [];

    // Generate columns based on data structure
    Object.keys(firstRow).forEach(key => {
      const value = firstRow[key];
      let column: GridColDef = {
        field: key,
        headerName: key.replace(/_/g, ' ').toUpperCase(),
        width: 150,
        sortable: true,
        filterable: true
      };

      // Type-specific column configuration
      if (typeof value === 'number') {
        column.type = 'number';
        column.valueFormatter = (value: any) => {
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
        column.valueFormatter = (value: any) => {
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
        column.valueFormatter = (value: any) => {
          if (value === null || value === undefined) return '';
          return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
          }).format(value);
        };
        column.width = 180;
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
    } catch (err: any) {
      console.error('Report fetch error:', err);
      setError(err.message || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  }, [reportType, filters, tenant, requiredParams, generateDynamicColumns]);

  // Handle filter changes
  const handleFilterChange = (field: keyof ReportFilters, value: any) => {
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

  // Initial data fetch
  useEffect(() => {
    if (tenant && filters.prc_date) {
      fetchData();
    }
  }, [tenant, fetchData]);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3, position: 'relative', minHeight: '60vh' }}>
        {/* ✅ ADD: Modern Loader Overlay */}
        <ModernLoader
          open={loading}
          message={`Loading ${title}`}
          subMessage="Retrieving financial data..."
        />

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {description}
            </Typography>
          )}

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <Tooltip title="Refresh Data">
              <IconButton onClick={fetchData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            {supportsCharts && (
              <Tooltip title="Charts View">
                <IconButton>
                  <ChartIcon />
                </IconButton>
              </Tooltip>
            )}

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('xlsx')}
              disabled={exportLoading || data.length === 0}
            >
              Export XLSX
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        {showFilters && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Report Filters
              </Typography>

              <Grid container spacing={2}>
                {/* Processing Date (Required) */}
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Processing Date *"
                    value={filters.prc_date}
                    onChange={(date) => handleFilterChange('prc_date', date)}
                    enableAccessibleFieldDOMStructure={false}
                    slots={{
                      textField: TextField
                    }}
                    slotProps={{
                      textField: { fullWidth: true, required: true }
                    }}
                  />
                </Grid>

                {/* Optional Parameters */}
                {optionalParams.includes('segment_id') && (
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Segment ID"
                      type="number"
                      value={filters.segment_id || ''}
                      onChange={(e) => handleFilterChange('segment_id', parseInt(e.target.value) || undefined)}
                      fullWidth
                    />
                  </Grid>
                )}

                {optionalParams.includes('pd_config_id') && (
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="PD Config ID"
                      type="number"
                      value={filters.pd_config_id || ''}
                      onChange={(e) => handleFilterChange('pd_config_id', parseInt(e.target.value) || undefined)}
                      fullWidth
                    />
                  </Grid>
                )}

                {optionalParams.includes('pd_method') && (
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>PD Method</InputLabel>
                      <Select
                        value={filters.pd_method || ''}
                        onChange={(e) => handleFilterChange('pd_method', e.target.value ? Number(e.target.value) : undefined)}
                        label="PD Method"
                      >
                        <MenuItem value="">All Methods</MenuItem>
                        <MenuItem value={1}>TTC (Through-the-Cycle)</MenuItem>
                        <MenuItem value={2}>PIT (Point-in-Time)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {optionalParams.includes('scalar_id') && (
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Scalar ID"
                      type="number"
                      value={filters.scalar_id || ''}
                      onChange={(e) => handleFilterChange('scalar_id', parseInt(e.target.value) || undefined)}
                      fullWidth
                      helperText="Optional FL scalar"
                    />
                  </Grid>
                )}

                {optionalParams.includes('fl_flag') && (
                  <Grid item xs={12} md={2}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={filters.fl_flag || false}
                          onChange={(e) => handleFilterChange('fl_flag', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Forward Looking"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                )}

                {optionalParams.includes('stage') && (
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>Stage</InputLabel>
                      <Select
                        value={filters.stage || ''}
                        onChange={(e) => handleFilterChange('stage', e.target.value)}
                        label="Stage"
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
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="LGD Config ID"
                      type="number"
                      value={filters.lgd_config_id || ''}
                      onChange={(e) => handleFilterChange('lgd_config_id', parseInt(e.target.value) || undefined)}
                      fullWidth
                    />
                  </Grid>
                )}

                {optionalParams.includes('lgd_method') && (
                  <Grid item xs={12} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>LGD Method</InputLabel>
                      <Select
                        value={filters.lgd_method || ''}
                        onChange={(e) => handleFilterChange('lgd_method', e.target.value ? Number(e.target.value) : undefined)}
                        label="LGD Method"
                      >
                        <MenuItem value="">All Methods</MenuItem>
                        <MenuItem value={1}>Workout</MenuItem>
                        <MenuItem value={2}>Model-Based</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}

                {optionalParams.includes('model_id') && (
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Model ID"
                      type="number"
                      value={filters.model_id || ''}
                      onChange={(e) => handleFilterChange('model_id', parseInt(e.target.value) || undefined)}
                      fullWidth
                      helperText="Optional LGD model"
                    />
                  </Grid>
                )}

                {optionalParams.includes('ead_config_id') && (
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="EAD Config ID"
                      type="number"
                      value={filters.ead_config_id || ''}
                      onChange={(e) => handleFilterChange('ead_config_id', parseInt(e.target.value) || undefined)}
                      fullWidth
                    />
                  </Grid>
                )}

                {optionalParams.includes('branch_code') && (
                  <Grid item xs={12} md={2}>
                    <TextField
                      label="Branch Code"
                      value={filters.branch_code || ''}
                      onChange={(e) => handleFilterChange('branch_code', e.target.value)}
                      fullWidth
                    />
                  </Grid>
                )}
              </Grid>

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={fetchData}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                >
                  {loading ? 'Loading...' : 'Apply Filters'}
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
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
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