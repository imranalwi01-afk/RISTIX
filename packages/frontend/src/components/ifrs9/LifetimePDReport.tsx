// packages/frontend/src/components/ifrs9/LifetimePDReport.tsx
import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Paper,
  IconButton,
  Button,
  Stack,
  Tooltip,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';

import { Grid } from '@mui/material';
import LifetimePDConfigPanel from './LifetimePDConfigPanel';
import LifetimePDKPIs from './LifetimePDKPIs';
import SurvivalChart from './LifetimePDCharts/SurvivalChart';
import MarginalPDChart from './LifetimePDCharts/MarginalPDChart';
import LifetimePDExportDialog from './LifetimePDExportDialog';
import BaseIfrs9Report from './BaseIfrs9Report';
import api from '@/services/api';
import { impairmentApi } from '@/services/api/impairment.api';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

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
      id={`pd-tabpanel-${index}`}
      aria-labelledby={`pd-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: { xs: 1, md: 3 } }}>{children}</Box>}
    </div>
  );
}

const mapPdMethodToCode = (method: string | number | undefined): number => {
  if (typeof method === 'number') return method;
  switch (method) {
    case 'PIT':
      return 2;
    case 'Hybrid':
      return 3;
    case 'TTC':
    default:
      return 1;
  }
};

const getDefaultLifetimePdFilters = () => ({
  prcDate: '2022-10-31',
  selectedSegments: [],
  selectedSegmentIds: [],
  pdConfigId: '',
  pdMethod: mapPdMethodToCode('TTC'),
  isForwardLooking: false,
  scalarId: undefined,
  isCompareMode: false,
  pdConfigIdB: '',
  pdMethodB: mapPdMethodToCode('PIT'),
  scalarIdB: undefined
});

const LifetimePDReport: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [configOpen, setConfigOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [lastCalculation, setLastCalculation] = useState<Date | null>(new Date());
  
  // Data states
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [yearlyDataB, setYearlyDataB] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [monthlyDataB, setMonthlyDataB] = useState<any[]>([]);
  const [validationMetadata, setValidationMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [effectivePrcDate, setEffectivePrcDate] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<any>(getDefaultLifetimePdFilters);

  const fetchData = useCallback(async (filters: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.banking.ifrs9Reports.lifetimePD.getYearly({
        prc_date: filters.prcDate,
        pd_config_id: filters.pdConfigId ? Number(filters.pdConfigId) : undefined,
        pd_method: filters.pdMethod,
        scalar_id: filters.scalarId ? Number(filters.scalarId) : undefined,
        fl_flag: filters.isForwardLooking
      });
      console.log('API getYearly Response:', response);
      
      if (response.success) {
        setYearlyData(response.data);
        setEffectivePrcDate(response.effectivePrcDate ?? filters.prcDate);
        if (response.metadata) setValidationMetadata(response.metadata);
      } else {
        setError(response.message || 'Failed to fetch yearly data');
        setEffectivePrcDate(null);
      }

      // Fetch comparison yearly data if active (Model B)
      if (filters.isCompareMode && filters.pdConfigIdB) {
        const responseB = await api.banking.ifrs9Reports.lifetimePD.getYearly({
          prc_date: filters.prcDate,
          pd_config_id: Number(filters.pdConfigIdB),
          pd_method: filters.pdMethodB,
          scalar_id: filters.scalarIdB ? Number(filters.scalarIdB) : undefined,
          fl_flag: filters.isForwardLooking
        });
        if (responseB.success) setYearlyDataB(responseB.data);
      } else {
        setYearlyDataB([]);
      }

      // Fetch monthly data
      const monthlyResponse = await api.banking.ifrs9Reports.lifetimePD.getMonthly({
        prc_date: filters.prcDate,
        pd_config_id: filters.pdConfigId ? Number(filters.pdConfigId) : undefined,
        pd_method: filters.pdMethod,
        scalar_id: filters.scalarId ? Number(filters.scalarId) : undefined,
        fl_flag: filters.isForwardLooking
      });
      if (monthlyResponse.success) {
        setMonthlyData(monthlyResponse.data);
        if (!response?.effectivePrcDate && monthlyResponse.effectivePrcDate) {
          setEffectivePrcDate(monthlyResponse.effectivePrcDate);
        }
      }

      // Fetch comparison monthly data if active
      if (filters.isCompareMode && filters.pdConfigIdB) {
        const monthlyResponseB = await api.banking.ifrs9Reports.lifetimePD.getMonthly({
          prc_date: filters.prcDate,
          pd_config_id: Number(filters.pdConfigIdB),
          pd_method: filters.pdMethodB,
          scalar_id: filters.scalarIdB ? Number(filters.scalarIdB) : undefined,
          fl_flag: filters.isForwardLooking
        });
        if (monthlyResponseB.success) setMonthlyDataB(monthlyResponseB.data);
      } else {
        setMonthlyDataB([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching data');
      setEffectivePrcDate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData(currentFilters);
  }, [fetchData, currentFilters]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRunAnalysis = async (config: any) => {
    console.log('Running analysis with config:', config);
    
    // Always apply filters so that the report can load data immediately
    setCurrentFilters({
      prcDate: format(config.procDate, 'yyyy-MM-dd'),
      pdConfigId: config.pdConfigId,
      pdMethod: mapPdMethodToCode(config.pdMethod),
      isForwardLooking: config.isForwardLooking,
      scalarId: config.scalarId,
      selectedSegments: config.selectedSegmentLabels || [],
      selectedSegmentIds: config.selectedSegmentIds || [],
      isCompareMode: config.isCompareMode,
      pdConfigIdB: config.pdConfigIdB,
      pdMethodB: mapPdMethodToCode(config.pdMethodB),
      scalarIdB: config.scalarIdB
    });
    setLastCalculation(new Date());
    setConfigOpen(false);

    try {
      const payload = {
        calculationName: `PD Run ${format(config.procDate, 'yyyyMMdd')}`,
        calculationType: 'PD',
        portfolioId: config.selectedSegmentIds?.[0] || 'ALL',
        reportingDate: format(config.procDate, 'yyyy-MM-dd'),
        currency: 'IDR',
        assumptions: `Method: ${config.pdMethod}, FL: ${config.isForwardLooking}`
      };
      
      // Trigger calculation in background seamlessly
      await impairmentApi.runCalculation(payload);
    } catch (err) {
      console.warn('Run analysis trigger failed (non-blocking):', err);
    }
  };

  const handleResetFilters = useCallback(() => {
    setCurrentFilters(getDefaultLifetimePdFilters());
    setTabValue(0);
  }, []);

  // Transform backend data for charts
  const chartData = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return [];
    
    const baseBucket = yearlyData[0];
    const baseBucketB = currentFilters.isCompareMode && yearlyDataB?.length > 0 ? yearlyDataB[0] : {};
    
    const yearKeys = Object.keys(baseBucket)
      .filter(k => k.startsWith('year_'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('year_', '')) || 0;
        const numB = parseInt(b.replace('year_', '')) || 0;
        return numA - numB;
      });
      
    let survivalA = 1;
    let survivalB = 1;
    
    return yearKeys.map((key, index) => {
      const yearVal = parseInt(key.replace('year_', '')) || index + 1;
      const pdA = baseBucket[key] || 0;
      survivalA = survivalA * (1 - pdA);
      
      const pdB = baseBucketB[key];
      if (pdB !== undefined) {
        survivalB = survivalB * (1 - pdB);
      }

      return {
        year: `Year ${yearVal}`,
        bucketYear: yearVal,
        marginalPD: pdA,
        marginalPDB: pdB,
        survival: survivalA,
        survivalB: pdB !== undefined ? survivalB : undefined,
        cumulativePD: 1 - survivalA,
        cumulativePDB: pdB !== undefined ? 1 - survivalB : undefined
      };
    });
  }, [yearlyData, yearlyDataB, currentFilters.isCompareMode]);

  const monthlyChartData = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    
    const baseBucket = monthlyData[0];
    const baseBucketB = currentFilters.isCompareMode && monthlyDataB?.length > 0 ? monthlyDataB[0] : {};
    
    const monthKeys = Object.keys(baseBucket)
      .filter(k => k.startsWith('month_'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('month_', '')) || 0;
        const numB = parseInt(b.replace('month_', '')) || 0;
        return numA - numB;
      });

    return monthKeys.map((key, index) => {
      const monthVal = parseInt(key.replace('month_', '')) || index + 1;
      const pdA = baseBucket[key] || 0;
      const pdB = baseBucketB[key];

      return {
        month: `M${monthVal}`,
        marginalPD: pdA,
        marginalPDB: pdB
      };
    });
  }, [monthlyData, monthlyDataB, currentFilters.isCompareMode]);

  // Transform KPIs (expressed in percentage units 0-100)
  const kpiData = useMemo(() => {
    if (chartData.length === 0) return { y1: 0, y3: 0, y5: 0, survival: 100 };

    const getByBucketYear = (y: number) =>
      chartData.find(d => d.bucketYear === y);

    const y1Row = getByBucketYear(1);
    const y3Row = getByBucketYear(3);
    const y5Row = getByBucketYear(5);
    const lastRow = chartData[chartData.length - 1];

    return {
      // Cumulative PD at each horizon (0-100%)
      y1: (y1Row?.cumulativePD || 0) * 100,
      y3: (y3Row?.cumulativePD || 0) * 100,
      y5: (y5Row?.cumulativePD || 0) * 100,
      // Survival rate at final year (0-100%)
      survival: (lastRow?.survival || 1) * 100
    };
  }, [chartData]);

  const currentGranularity = tabValue === 1 ? 'Monthly' : 'Yearly';
  const hasReportData = yearlyData.length > 0 || monthlyData.length > 0;

  const handleExport = useCallback((options: any) => {
    if (!hasReportData) return;

    const workbook = XLSX.utils.book_new();
    const auditRows = [
      ['Report Name', 'Yearly Lifetime PD'],
      ['Requested Processing Date', currentFilters.prcDate],
      ['Effective Processing Date', effectivePrcDate || currentFilters.prcDate],
      ['PD Config ID', currentFilters.pdConfigId || 'All'],
      ['PD Method', currentFilters.pdMethod],
      ['Forward Looking', currentFilters.isForwardLooking ? 'Yes' : 'No'],
      ['Segments', currentFilters.selectedSegments?.length ? currentFilters.selectedSegments.join(', ') : 'All Segments'],
      ['Segment IDs', currentFilters.selectedSegmentIds?.length ? currentFilters.selectedSegmentIds.join(', ') : 'All Segments'],
      ['Generated At', new Date().toISOString()],
      []
    ];

    if (options.scope?.summary) {
      const summarySheet = XLSX.utils.aoa_to_sheet([
        ...auditRows,
        ['Metric', 'Value'],
        ['1Y Cumulative PD', `${kpiData.y1.toFixed(2)}%`],
        ['3Y Cumulative PD', `${kpiData.y3.toFixed(2)}%`],
        ['5Y Cumulative PD', `${kpiData.y5.toFixed(2)}%`],
        ['Survival Rate', `${kpiData.survival.toFixed(2)}%`],
      ]);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }

    if (options.scope?.bySegment && yearlyData.length > 0) {
      const yearlySheet = XLSX.utils.json_to_sheet(yearlyData);
      XLSX.utils.sheet_add_aoa(yearlySheet, auditRows, { origin: 'A1' });
      XLSX.utils.book_append_sheet(workbook, yearlySheet, 'Yearly PD');
    }

    if (options.scope?.charts && monthlyData.length > 0) {
      const monthlySheet = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.sheet_add_aoa(monthlySheet, auditRows, { origin: 'A1' });
      XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly PD');
    }

    const fileDate = effectivePrcDate || currentFilters.prcDate || new Date().toISOString().slice(0, 10);
    const fileName = `lifetime-pd-${fileDate}.${options.format === 'csv' ? 'csv' : 'xlsx'}`;

    if (options.format === 'csv') {
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      XLSX.writeFile({ SheetNames: ['Summary'], Sheets: { Summary: firstSheet } }, fileName, { bookType: 'csv' });
      return;
    }

    XLSX.writeFile(workbook, fileName);
  }, [currentFilters, effectivePrcDate, hasReportData, kpiData, monthlyData, yearlyData]);

  return (
    <Box sx={{ p: 0 }}>
      {/* Hero Panel & Toolbar */}
      <Paper sx={{ 
        p: 3, 
        mb: 4, 
        borderRadius: 4, 
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          
          {/* Title & Badges */}
          <Box>
            <Typography variant="h4" fontWeight={800} gutterBottom sx={{ 
              color: theme.palette.primary.dark,
              background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Yearly Lifetime PD
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
              kepatuhan IFRS 9 & Proyeksi Multi-Tahun
            </Typography>
            
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip 
                label={`Granularity: ${currentGranularity}`} 
                color="primary" 
                variant="outlined" 
                size="small" 
                sx={{ fontWeight: 600 }}
              />
              <Chip 
                label="Scope: IFRS 9 Compliance" 
                color="success" 
                variant="outlined" 
                size="small" 
                icon={<CheckCircleIcon />}
                sx={{ fontWeight: 600 }}
              />
              <Chip 
                label={`Last Calc: ${lastCalculation ? lastCalculation.toLocaleTimeString() : 'N/A'}`} 
                variant="outlined" 
                size="small" 
                icon={<AccessTimeIcon />}
                sx={{ fontWeight: 600, borderColor: 'text.disabled', color: 'text.secondary' }}
              />
              <Chip 
                label="Live Production Data" 
                size="small" 
                sx={{ 
                  fontWeight: 700, 
                  bgcolor: alpha(theme.palette.success.main, 0.1), 
                  color: theme.palette.success.main 
                }}
              />
            </Stack>
          </Box>

          {/* Toolbar Actions */}
          <Stack direction="row" spacing={1}>
             <Tooltip title="Filter Configuration">
              <Button 
                variant={configOpen ? "contained" : "outlined"} 
                startIcon={<FilterListIcon />}
                onClick={() => setConfigOpen(true)}
              >
                Filters
              </Button>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton color="primary" onClick={() => fetchData(currentFilters)} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset Filter">
              <IconButton color="primary" onClick={handleResetFilters} disabled={loading}>
                <ClearAllIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Results">
              <IconButton color="primary" onClick={() => setExportDialogOpen(true)} disabled={!hasReportData}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {/* Configuration Drawer */}
      <LifetimePDConfigPanel 
        open={configOpen} 
        onClose={() => setConfigOpen(false)} 
        onRun={handleRunAnalysis} 
      />

      {/* Results KPIs */}
      {effectivePrcDate && effectivePrcDate !== currentFilters.prcDate && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          Snapshot used: <strong>{effectivePrcDate}</strong> (latest available data on or before the selected processing date).
        </Alert>
      )}

      <LifetimePDKPIs 
        y1pd={kpiData.y1}
        y3pd={kpiData.y3}
        y5pd={kpiData.y5}
        survivalRate={kpiData.survival}
        validationMetrics={validationMetadata}
      />

      {/* Charts & Tabs Section */}
      <Box sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            mb: 3,
            '& .MuiTabs-indicator': { height: 4, borderRadius: '4px 4px 0 0' },
            '& .MuiTab-root': { fontWeight: 700, fontSize: '1rem', textTransform: 'none' }
          }}
        >
          <Tab label="Yearly Lifetime PD (Cumulative)" />
          <Tab label="Yearly Marginal PD" />
          <Tab label="Monthly Marginal PD" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
             <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <SurvivalChart data={chartData} />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                     <MarginalPDChart data={chartData} />
                </Grid>
             </Grid>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
             <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                     <MarginalPDChart data={chartData} />
                </Grid>
             </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
             <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                     <MarginalPDChart 
                        data={monthlyChartData.map(d => ({ year: d.month, marginalPD: d.marginalPD / 100 }))} 
                     />
                </Grid>
             </Grid>
        </TabPanel>
      </Box>

        {/* Detailed Data Table */}
        <BaseIfrs9Report 
          title="Account PD Details" 
          reportType="lifetime-pd-account-details"
          hideHeader
          requiredParams={['prc_date']}
          externalFilters={{
            prc_date: effectivePrcDate ? new Date(effectivePrcDate) : currentFilters.prcDate ? new Date(currentFilters.prcDate) : null,
            pd_config_id: currentFilters.pdConfigId ? Number(currentFilters.pdConfigId) : undefined,
            pd_method: currentFilters.pdMethod,
            scalar_id: currentFilters.scalarId ? Number(currentFilters.scalarId) : undefined,
            fl_flag: currentFilters.isForwardLooking
          }}
          onDataLoaded={(data) => console.log('Account Details Loaded:', data.length)}
        />
        
        <LifetimePDExportDialog 
            open={exportDialogOpen} 
            onClose={() => setExportDialogOpen(false)}
            onExport={handleExport}
        />

    </Box>
  );
};


export default LifetimePDReport;
