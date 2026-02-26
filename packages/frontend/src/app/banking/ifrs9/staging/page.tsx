// packages/frontend/src/app/banking/ifrs9/staging/page.tsx
// ============================================================================
// IFRS9 STAGING PAGE - REAL IMPLEMENTATION
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Alert,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Category as PageIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  AccountBalance as ExposureIcon,
  Calculate as CalculationIcon,
  CheckCircle as Stage1Icon,
  Warning as Stage3Icon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import ReportSummaryGrid, { KPIItem } from '@/components/ifrs9/ReportSummaryGrid';
import ReportDataGrid from '@/components/ifrs9/ReportDataGrid';
import { stagingApi } from '@/services/api/staging.api';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function IFRS9StagingPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    stage: '',
    segmentId: ''
  });


  // Table columns setup
  const columns: GridColDef[] = [
    { field: 'prcDate', headerName: 'Process Date', width: 130, valueFormatter: (params) => params || '-' },
    {
      field: 'stage',
      headerName: 'Stage',
      width: 160,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={getStageLabel(params.value as string)}
          size="small"
          sx={{
            backgroundColor: getStageColor(params.value as string),
            color: 'white',
            fontWeight: 'bold'
          }}
        />
      )
    },
    { field: 'segmentId', headerName: 'Segment ID', width: 120, valueFormatter: (params) => params || '-' },
    {
      field: 'totalOutstanding',
      headerName: 'Total Outstanding',
      width: 180,
      type: 'number',
      valueFormatter: (value) => value ? formatCurrency(Number(value)) : '-'
    },
    {
      field: 'totalECL',
      headerName: 'Total ECL',
      width: 180,
      type: 'number',
      valueFormatter: (value) => value ? formatCurrency(Number(value)) : '-'
    },
    {
      field: 'avgOutstanding',
      headerName: 'Avg Outstanding',
      width: 180,
      type: 'number',
      valueFormatter: (value) => value ? formatCurrency(Number(value)) : '-'
    }
  ];

  // Load staging data
  const loadStagingData = async () => {
    setLoading(true);
    setError(null);

    try {
      const requestFilters = {
        startDate: filters.startDate ? filters.startDate.toISOString().split('T')[0] : undefined,
        endDate: filters.endDate ? filters.endDate.toISOString().split('T')[0] : undefined,
        stage: filters.stage || undefined,
        segmentId: filters.segmentId ? Number(filters.segmentId) : undefined
      };

      const [analysisResponse, summaryResponse] = await Promise.all([
        stagingApi.getStagingAnalysis(requestFilters),
        stagingApi.getStagingSummary()
      ]);

      const analysisPayload = analysisResponse?.data ?? analysisResponse;
      const summaryPayload = summaryResponse?.data ?? summaryResponse;

      if (analysisPayload?.success) {
        setData(analysisPayload.data || []);
      } else if (Array.isArray(analysisPayload)) {
        setData(analysisPayload);
      }

      if (summaryPayload?.success) {
        setSummary(summaryPayload.data);
      } else if (summaryPayload) {
        setSummary(summaryPayload);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load staging data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStagingData();
  }, []);

  const getStageColor = (stage: string | null) => {
    switch (stage) {
      case '1': return '#4caf50';
      case '2': return '#ff9800';
      case '3': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStageLabel = (stage: string | null) => {
    switch (stage) {
      case '1': return 'Stage 1 (12-month)';
      case '2': return 'Stage 2 (Lifetime)';
      case '3': return 'Stage 3 (Impaired)';
      default: return 'Unknown';
    }
  };

  // Set up KPI items
  const kpiItems: KPIItem[] = summary ? [
    {
      title: 'Total Outstanding',
      value: parseFloat(summary.totalOutstanding) || 0,
      format: 'currency',
      icon: <ExposureIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      mainColor: '#4facfe',
      chipLabel: 'PORTFOLIO'
    },
    {
      title: 'Total ECL',
      value: parseFloat(summary.totalECL) || 0,
      format: 'currency',
      icon: <CalculationIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
      mainColor: '#ff4e50',
      chipLabel: 'ECL RESERVE'
    },
    {
      title: 'Stage 1 Accounts',
      value: parseInt(summary.stage1Count) || 0,
      format: 'count',
      icon: <Stage1Icon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      mainColor: '#43e97b',
      chipLabel: `${formatCurrency(parseFloat(summary.stage1ECL) || 0)} ECL`
    },
    {
      title: 'Stage 3 Accounts',
      value: parseInt(summary.stage3Count) || 0,
      format: 'count',
      icon: <Stage3Icon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      mainColor: '#667eea',
      chipLabel: `${formatCurrency(parseFloat(summary.stage3ECL) || 0)} ECL`
    }
  ] : [];

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ReportPageLayout
        title="IFRS 9 Staging Analysis"
        description="IFRS 9 staging classification and stage management analysis"
        icon={<PageIcon fontSize="inherit" />}
        actionButtons={[
          {
            label: 'Refresh',
            icon: <RefreshIcon />,
            onClick: loadStagingData,
            variant: 'outlined',
            color: 'inherit',
            disabled: loading
          },
          {
            label: 'Export',
            icon: <DownloadIcon />,
            onClick: () => {}, // placeholder
            variant: 'contained',
            color: 'primary',
            disabled: loading || data.length === 0
          }
        ]}
      >

        {/* Summary Cards */}
        {summary && (
          <ReportSummaryGrid items={kpiItems} mdCols={2} sx={{ mb: 4 }} />
        )}

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1 }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(newValue: any) => setFilters(prev => ({ ...prev, startDate: newValue as any }))}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(newValue: any) => setFilters(prev => ({ ...prev, endDate: newValue as any }))}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Stage</InputLabel>
                <Select
                  value={filters.stage}
                  label="Stage"
                  onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                >
                  <MenuItem value="">All Stages</MenuItem>
                  <MenuItem value="1">Stage 1 (12-month)</MenuItem>
                  <MenuItem value="2">Stage 2 (Lifetime)</MenuItem>
                  <MenuItem value="3">Stage 3 (Impaired)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                onClick={loadStagingData}
                disabled={loading}
                sx={{ height: '40px' }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Staging Data Table */}
        <Box sx={{ width: '100%', height: 600 }}>
          <ReportDataGrid
            rows={data.map((row, index) => ({ id: `${row.prcDate}-${row.segmentId}-${index}`, ...row }))}
            columns={columns}
            loading={loading}
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{
              pagination: { paginationModel: { pageSize: 25 } }
            }}
            disableRowSelectionOnClick
          />
        </Box>
      </ReportPageLayout>
    </LocalizationProvider>
  );
}
