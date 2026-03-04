// packages/frontend/src/app/banking/ifrs9/calculations/page.tsx
// ============================================================================
// IFRS9 CALCULATION DASHBOARD - COMPREHENSIVE ECL PROCESSING
// ============================================================================
// Purpose: IFRS9 Expected Credit Loss calculation monitoring and execution
// Based on: frs9_imp_ca_result_h, frs9_imp_ca_result_d, frs9_prc_date tables
// Generated: 2025-01-11
// Stakeholder: Banking Institution
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tab,
  Tabs,
  LinearProgress,
  IconButton
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  PlayArrow as RunIcon,
  Refresh as RefreshIcon,
  Timeline as ResultsIcon,
  Settings as ConfigIcon,
  Download as ExportIcon,
  Visibility as ViewIcon,
  Assessment as ReportIcon,
  AccountBalance as PortfolioIcon,
  TrendingUp as StageIcon,
  MonetizationOn as EclIcon,
  Speed as PerformanceIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api, { handleAPIError } from '../../../../services/api';
import ReportPageLayout from '@/components/ifrs9/ReportPageLayout';
import ReportSummaryGrid, { KPIItem } from '@/components/ifrs9/ReportSummaryGrid';
import ReportDataGrid from '@/components/ifrs9/ReportDataGrid';

// TypeScript interfaces based on actual database structure
interface ProcessDate {
  pkid: number;
  currdate: string;
  prevdate: string | null;
  batch_status: string;
  remark: string | null;
  last_process_date: string | null;
  sessionid: string | null;
  createdby: string;
  createddate: string;
}

interface CalculationResult {
  prc_date: string;
  account_id: number;
  facility_number: string;
  cif_number: string;
  segment_id: number;
  stage: number;
  currency: string;
  outstanding: number;
  ecl_amount: number;
  overlay_amount: number;
  ecl_final: number;
  bucket_group: string;
  bucket_id: number;
  internal_rating_code: string;
  ext_rating_code: string;
}

interface CalculationSummary {
  total_accounts: number;
  total_outstanding: number;
  total_ecl: number;
  stage1_count: number;
  stage2_count: number;
  stage3_count: number;
  stage1_ecl: number;
  stage2_ecl: number;
  stage3_ecl: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
    </div>
  );
}

export default function IFRS9CalculationDashboard() {

  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [processStatus, setProcessStatus] = useState<'idle' | 'running' | 'queued' | 'completed' | 'error'>('idle');
  const [calculationProgress, setCalculationProgress] = useState(0);
  const [runConfigOpen, setRunConfigOpen] = useState(false);
  const [resultDetailsOpen, setResultDetailsOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<CalculationResult | null>(null);

  // Data state
  const [processHistory, setProcessHistory] = useState<ProcessDate[]>([]);
  const [calculationResults, setCalculationResults] = useState<CalculationResult[]>([]);
  const [calculationSummary, setCalculationSummary] = useState<CalculationSummary | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedProcessDate, setSelectedProcessDate] = useState<string | null>(null);

  // Configuration state
  const [runConfig, setRunConfig] = useState({
    process_date: new Date().toISOString().split('T')[0],
    segment_ids: [] as number[],
    recalculate: false,
    scenarios: ['Base', 'Optimistic', 'Pessimistic'],
    calculation_type: 'full'
  });

  // Load real data from API instead of mock data

  // Chart data - will be populated from API response
  const [stageDistributionData, setStageDistributionData] = useState<any[]>([]);
  const [eclTrendData, setEclTrendData] = useState<any[]>([]);

  // Update chart data when calculation summary changes
  useEffect(() => {
    if (calculationSummary) {
      setStageDistributionData([
        { name: 'Stage 1', value: calculationSummary.stage1_count || 0, color: '#4CAF50' },
        { name: 'Stage 2', value: calculationSummary.stage2_count || 0, color: '#FF9800' },
        { name: 'Stage 3', value: calculationSummary.stage3_count || 0, color: '#F44336' }
      ]);
    }
  }, [calculationSummary]);

  // DataGrid columns
  const processHistoryColumns: GridColDef[] = [
    { field: 'currdate', headerName: 'Process Date', width: 120 },
    {
      field: 'batch_status', headerName: 'Status', width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value}
          color={params.value === 'COMPLETED' ? 'success' : params.value === 'FAILED' ? 'error' : 'warning'}
          size="small"
        />
      )
    },
    { field: 'sessionid', headerName: 'Session ID', width: 150 },
    { field: 'remark', headerName: 'Remark', width: 300 },
    { field: 'createdby', headerName: 'Created By', width: 120 },
    { field: 'createddate', headerName: 'Created Date', width: 180 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <IconButton size="small" onClick={() => handleViewResults(params.row)}>
            <ViewIcon />
          </IconButton>
          <IconButton size="small" onClick={() => handleExportResults(params.row)}>
            <ExportIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const calculationResultColumns: GridColDef[] = [
    { field: 'facility_number', headerName: 'Facility', width: 120 },
    { field: 'cif_number', headerName: 'CIF Number', width: 120 },
    {
      field: 'stage', headerName: 'Stage', width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={`Stage ${params.value}`}
          color={params.value === 1 ? 'success' : params.value === 2 ? 'warning' : 'error'}
          size="small"
        />
      )
    },
    { field: 'currency', headerName: 'Currency', width: 80 },
    {
      field: 'outstanding',
      headerName: 'Outstanding',
      width: 150,
      type: 'number',
      valueFormatter: (value) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(Number(value))
    },
    {
      field: 'ecl_final',
      headerName: 'ECL Final',
      width: 150,
      type: 'number',
      valueFormatter: (value) => new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
      }).format(Number(value))
    },
    { field: 'bucket_group', headerName: 'Bucket Group', width: 150 },
    { field: 'internal_rating_code', headerName: 'Internal Rating', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <IconButton size="small" onClick={() => handleViewResultDetails(params.row)}>
          <InfoIcon />
        </IconButton>
      )
    }
  ];

  // Event handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRunCalculation = () => {
    setRunConfigOpen(true);
  };

  const handleConfirmRun = async () => {
    setRunConfigOpen(false);
    setProcessStatus('running');
    setCalculationProgress(0);
    setError(null);

    try {
      console.log('🚀 Starting ECL calculation...');
      console.log('Configuration:', runConfig);

      // Call real ECL calculation API
      const response = await api.ifrs9.runECLCalculation({
        processDate: runConfig.process_date,
        segmentIds: runConfig.segment_ids,
        calculationType: runConfig.calculation_type,
        recalculate: runConfig.recalculate,
        scenarios: runConfig.scenarios
      });

      if (response.success) {
        setProcessStatus('queued');
        setCalculationProgress(0);
        const executionId = response.executionId || response.jobId || '-';
        setSuccess(`ECL calculation queued successfully (Execution ID: ${executionId}).`);
        // Refresh data so queued execution is visible in process history.
        loadData(runConfig.process_date);
        setSelectedProcessDate(runConfig.process_date);
      } else {
        throw new Error(response.message || 'Failed to start ECL calculation');
      }

    } catch (error: any) {
      console.error('❌ ECL calculation failed:', error);
      setProcessStatus('error');
      setError(`ECL calculation failed: ${handleAPIError(error).message}`);
    }
  };

  const handleViewResults = async (processData: ProcessDate) => {
    console.log("Viewing results for:", processData);
    setSelectedProcessDate(processData.currdate);
    setLoading(true);
    try {
      setTabValue(1);
      const results = await fetchBatchResults(processData.currdate);
      setCalculationResults(results);
      loadData(processData.currdate);

      if (results.length > 0) {
        setSuccess(
          `Loaded ${results.length} results for batch ${processData.currdate}`,
        );
      } else {
        setError(`No results found for batch ${processData.currdate}`);
      }
    } catch (error: any) {
      console.error("Failed to view results:", error);
      setError("Failed to load batch results");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatchResults = async (date: string) => {
    try {
      const response = await api.ifrs9.getCalculationResults(date);
      console.log(`📊 Batch results for ${date}:`, response);

      // Standarized: response is body, response.data.items is the array
      // Also being defensive to support direct array mapping if structure varies
      const resultsArray = response?.data?.items || (Array.isArray(response?.data) ? response.data : []);

      if (resultsArray.length > 0) {
        return resultsArray.map((r: any) => ({
          prc_date: date,
          account_id: r.accountId,
          facility_number: r.accountNumber || r.facilityNumber || r.accountId?.toString(),
          cif_number: r.cifNumber || "-",
          segment_id: r.segmentId || 1,
          stage: r.stage,
          currency: r.currency || "IDR",
          outstanding: r.outstanding,
          ecl_amount: r.eclAmount,
          ecl_final: r.eclFinal || r.eclAmount,
          bucket_group: r.bucketGroup || "-",
          bucket_id: r.bucketId || 0,
          internal_rating_code: r.internalRatingCode || "-",
          ext_rating_code: r.extRatingCode || "-",
        }));
      }
    } catch (err) {
      console.error('❌ Error in fetchBatchResults:', err);
    }
    return [];
  };

  const handleExportResults = async (processData: ProcessDate) => {
    console.log("Exporting results for:", processData);
    setLoading(true);
    try {
      // Always fetch fresh data for the selected batch to ensure correct export
      const results = await fetchBatchResults(processData.currdate);

      if (results.length === 0) {
        setError(`No data found to export for batch ${processData.currdate}`);
        return;
      }

      const headers = [
        "Process Date",
        "Account ID",
        "Facility",
        "Stage",
        "Outstanding",
        "ECL Amount",
      ];
      const csvContent = [
        headers.join(","),
        ...results.map((row: any) =>
          [
            row.prc_date,
            row.account_id,
            row.facility_number,
            row.stage,
            row.outstanding,
            row.ecl_amount,
          ].join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `ecl_results_${processData.currdate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(`Exported results for ${processData.currdate}`);
    } catch (error: any) {
      console.error("Export failed:", error);
      setError("Failed to export results");
    } finally {
      setLoading(false);
    }
  };

  const handleViewResultDetails = (result: CalculationResult) => {
    setSelectedResult(result);
    setResultDetailsOpen(true);
  };

  const handleRefreshData = () => {
    loadData();
  };

  // Data loading
  const loadData = useCallback(async (date?: string) => {
    setLoading(true);
    setError(null);

    try {
      const prcDate = date || selectedProcessDate || undefined;
      console.log(`🔄 Loading IFRS9 calculation data${prcDate ? ' for ' + prcDate : ' (latest)'}...`);

      // Load calculation summary from real API
      const summaryResponse = await api.ifrs9.getCalculationsSummary(prcDate);
      if (summaryResponse.success && summaryResponse.data) {
        // Convert API response to CalculationSummary format
        const summaryData: CalculationSummary = {
          total_accounts: summaryResponse.data.totalAccounts || 0,
          total_outstanding: summaryResponse.data.totalPortfolio || 0,
          total_ecl: summaryResponse.data.totalECL || 0,
          stage1_count: summaryResponse.data.stage1Count || 0,
          stage2_count: summaryResponse.data.stage2Count || 0,
          stage3_count: summaryResponse.data.stage3Count || 0,
          stage1_ecl: summaryResponse.data.stage1ECL || 0,
          stage2_ecl: summaryResponse.data.stage2ECL || 0,
          stage3_ecl: summaryResponse.data.stage3ECL || 0
        };
        setCalculationSummary(summaryData);
        if (summaryResponse.data.lastUpdated && !selectedProcessDate) {
          setSelectedProcessDate(summaryResponse.data.lastUpdated);
        }
        console.log('✅ Loaded calculation summary:', summaryData);
      }

      // Load trend data
      const trendResponse = await api.ifrs9.getPortfolioTrend(prcDate);
      if (trendResponse.success && trendResponse.data) {
        setEclTrendData(trendResponse.data);
        console.log(`✅ Loaded trend data: ${trendResponse.data.length} points`);
      }

      // Load available dates for the selector
      const datesResponse = await api.ifrs9.getAvailableDates();
      if (datesResponse.success && datesResponse.data) {
        setAvailableDates(datesResponse.data);
      }

      // Load calculation batches from real API
      const batchesResponse = await api.ifrs9.getCalculationBatches();
      if (batchesResponse.success && batchesResponse.data) {
        // ... (preserving existing mapping logic)
        const historyData: ProcessDate[] = batchesResponse.data.batches.map((batch: any, index: number) => ({
          pkid: batch.id || index + 1,
          currdate: batch.processDate || new Date().toISOString().split('T')[0],
          prevdate: batch.previousDate || null,
          batch_status: batch.status || 'UNKNOWN',
          remark: batch.description || 'Calculation batch',
          last_process_date: batch.completedAt || null,
          sessionid: batch.sessionId || `SESS_${Date.now()}`,
          createdby: batch.createdBy || 'system',
          createddate: batch.createdAt || new Date().toISOString()
        }));
        setProcessHistory(historyData);
        console.log(`✅ Loaded ${historyData.length} calculation batches`);
      }

      // Note: Individual calculation results would need a separate API endpoint
      if (prcDate) {
        const results = await fetchBatchResults(prcDate);
        setCalculationResults(results);
      } else {
        setCalculationResults([]);
      }

    } catch (error: any) {
      console.error('❌ Failed to load calculation data:', error);
      setError(`Failed to load calculation data: ${handleAPIError(error).message}`);
    } finally {
      setLoading(false);
    }
  }, [selectedProcessDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !calculationSummary) {
    return (
      <ReportPageLayout title="IFRS9 Calculation Dashboard" icon={<CalculateIcon />}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      </ReportPageLayout>
    );
  }

  // Build KPI items from calculationSummary
  const coverageRatio = calculationSummary && calculationSummary.total_outstanding > 0
    ? (calculationSummary.total_ecl / calculationSummary.total_outstanding) * 100
    : 0;

  const kpiItems: KPIItem[] = [
    {
      title: 'Total Accounts',
      value: calculationSummary?.total_accounts ?? 0,
      format: 'count',
      icon: <PortfolioIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      mainColor: '#4facfe',
      chipLabel: 'ECL ENGINE'
    },
    {
      title: 'Total Outstanding',
      value: calculationSummary?.total_outstanding ?? 0,
      format: 'currency',
      icon: <EclIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      mainColor: '#43e97b',
      chipLabel: 'ECL ENGINE'
    },
    {
      title: 'Total ECL',
      value: calculationSummary?.total_ecl ?? 0,
      format: 'currency',
      icon: <EclIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #f9d423 0%, #ff4e50 100%)',
      mainColor: '#ff4e50',
      chipLabel: 'ECL ENGINE'
    },
    {
      title: 'Coverage Ratio',
      value: `${coverageRatio.toFixed(2)}%`,
      format: 'raw',
      icon: <PerformanceIcon sx={{ fontSize: 28 }} />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      mainColor: '#667eea',
      chipLabel: 'ECL ENGINE'
    }
  ];

  return (
    <ReportPageLayout
      title="IFRS9 Calculation Dashboard"
      description="Expected Credit Loss calculation monitoring and execution"
      icon={<CalculateIcon />}
    >
      {/* Action buttons row */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="process-date-select-label">View Date</InputLabel>
          <Select
            labelId="process-date-select-label"
            id="process-date-select"
            value={selectedProcessDate || ''}
            label="View Date"
            onChange={(e) => {
              const date = e.target.value;
              setSelectedProcessDate(date);
              loadData(date);
            }}
          >
            <MenuItem value="">
              <em>Latest</em>
            </MenuItem>
            {availableDates.map((date, idx) => (
              <MenuItem key={`${date}-${idx}`} value={date}>
                {date}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<RunIcon />}
          onClick={handleRunCalculation}
          disabled={processStatus === 'running'}
          color="primary"
        >
          Run ECL Calculation
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={handleRefreshData}
          disabled={processStatus === 'running'}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          <Typography variant="body2">{success}</Typography>
        </Alert>
      )}

      {/* Progress Alert */}
      {processStatus === 'running' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="body2">
              ECL calculation in progress... {Math.round(calculationProgress)}% complete
            </Typography>
            <LinearProgress variant="determinate" value={calculationProgress} sx={{ mt: 1 }} />
          </Box>
        </Alert>
      )}

      {processStatus === 'queued' && (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ECL calculation is queued and will run in background via SQL stored procedure executor.
          </Typography>
        </Alert>
      )}

      {/* KPI Summary */}
      <ReportSummaryGrid items={kpiItems} mdCols={2} sx={{ mb: 3 }} />

      {/* Main Content Tabs */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="calculation tabs">
            <Tab icon={<ResultsIcon />} label="Process History" />
            <Tab icon={<ReportIcon />} label="Calculation Results" />
            <Tab icon={<StageIcon />} label="Analytics" />
            <Tab icon={<ConfigIcon />} label="Configuration" />
          </Tabs>
        </Box>

        {/* Process History Tab */}
        <TabPanel value={tabValue} index={0}>
          <ReportDataGrid
            rows={processHistory}
            columns={processHistoryColumns}
            getRowId={(row) => row.pkid}
            checkboxSelection
            disableRowSelectionOnClick
            height={500}
          />
        </TabPanel>

        {/* Calculation Results Tab */}
        <TabPanel value={tabValue} index={1}>
          <ReportDataGrid
            rows={calculationResults}
            columns={calculationResultColumns}
            getRowId={(row) => row.account_id}
            checkboxSelection
            disableRowSelectionOnClick
            height={500}
          />
        </TabPanel>

        {/* Analytics Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Stage Distribution</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stageDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={70}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stageDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>ECL Trend by Stage</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={eclTrendData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => new Intl.NumberFormat('id-ID', { notation: "compact" }).format(value)} />
                      <RechartsTooltip formatter={(value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)} />
                      <Legend />
                      <Line type="monotone" dataKey="stage1" stroke="#4CAF50" name="Stage 1" strokeWidth={2} />
                      <Line type="monotone" dataKey="stage2" stroke="#FF9800" name="Stage 2" strokeWidth={2} />
                      <Line type="monotone" dataKey="stage3" stroke="#F44336" name="Stage 3" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Configuration Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Calculation Settings</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Process Date:</strong> {selectedProcessDate || 'Not selected'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Calculation Type:</strong> ECL (Expected Credit Loss)
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Currency:</strong> IDR
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Total Accounts:</strong> {calculationSummary?.total_accounts?.toLocaleString('id-ID') || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      <strong>Total ECL:</strong> {calculationSummary ? formatCurrency(calculationSummary.total_ecl) : 'Rp 0'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Model Parameters</Typography>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Stage Distribution:</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      • Stage 1: {calculationSummary?.stage1_count?.toLocaleString('id-ID') || 0} accounts
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      • Stage 2: {calculationSummary?.stage2_count?.toLocaleString('id-ID') || 0} accounts
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                      • Stage 3: {calculationSummary?.stage3_count?.toLocaleString('id-ID') || 0} accounts
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                      <strong>Coverage Ratio:</strong> {
                        calculationSummary && calculationSummary.total_outstanding > 0
                          ? ((calculationSummary.total_ecl / calculationSummary.total_outstanding) * 100).toFixed(2)
                          : '0.00'
                      }%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Run Configuration Dialog */}
      <Dialog open={runConfigOpen} onClose={() => setRunConfigOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Run ECL Calculation</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Process Date"
                value={runConfig.process_date ? new Date(runConfig.process_date) : null}
                onChange={(newValue) => {
                  if (newValue) {
                    const dateStr = newValue instanceof Date
                      ? newValue.toISOString().split('T')[0]
                      : (newValue as any).toISOString().split('T')[0];
                    setRunConfig(prev => ({ ...prev, process_date: dateStr }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    InputLabelProps: { shrink: true }
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Calculation Type</InputLabel>
                <Select
                  value={runConfig.calculation_type}
                  label="Calculation Type"
                  onChange={(e) => setRunConfig(prev => ({ ...prev, calculation_type: e.target.value }))}
                >
                  <MenuItem value="full">Full Calculation</MenuItem>
                  <MenuItem value="incremental">Incremental Update</MenuItem>
                  <MenuItem value="validation">Validation Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">
                This will execute IFRS9 ECL calculations for all configured segments and models.
                The process may take several minutes to complete.
              </Alert>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRunConfigOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmRun} variant="contained">
            Start Calculation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Result Details Dialog */}
      <Dialog open={resultDetailsOpen} onClose={() => setResultDetailsOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Account Calculation Details</DialogTitle>
        <DialogContent>
          {selectedResult && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Facility Number:</Typography>
                <Typography variant="body1">{selectedResult?.facility_number}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">CIF Number:</Typography>
                <Typography variant="body1">{selectedResult?.cif_number}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Current Stage:</Typography>
                <Chip
                  label={`Stage ${selectedResult?.stage}`}
                  color={selectedResult?.stage === 1 ? 'success' : selectedResult?.stage === 2 ? 'warning' : 'error'}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Outstanding Amount:</Typography>
                <Typography variant="body1">{formatCurrency(selectedResult?.outstanding || 0)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">ECL Amount:</Typography>
                <Typography variant="body1">{formatCurrency(selectedResult?.ecl_amount || 0)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2">Final ECL:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {formatCurrency(selectedResult?.ecl_final || 0)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </ReportPageLayout>
  );
}
