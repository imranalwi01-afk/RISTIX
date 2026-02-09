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
  useTheme,
  alpha
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
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
import { reportsAPI } from '@/services/api.reports';
import { impairmentApi } from '@/services/api/impairment.api';
import { format } from 'date-fns';

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
  const [currentFilters, setCurrentFilters] = useState<any>({
    prcDate: format(new Date(), 'yyyy-MM-dd'),
    pdModelId: '',
    isCompareMode: false,
    pdModelIdB: ''
  });

  const fetchData = useCallback(async (filters: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await reportsAPI.lifetimePD.getYearly({
        prcDate: filters.prcDate,
        pdModelId: filters.pdModelId
      });
      if (response.success) {
        setYearlyData(response.data);
        if (response.metadata) setValidationMetadata(response.metadata);
      } else {
        setError(response.message || 'Failed to fetch yearly data');
      }

      // Fetch comparison yearly data if active
      if (filters.isCompareMode && filters.pdModelIdB) {
        const responseB = await reportsAPI.lifetimePD.getYearly({
          prcDate: filters.prcDate,
          pdModelId: filters.pdModelIdB
        });
        if (responseB.success) setYearlyDataB(responseB.data);
      } else {
        setYearlyDataB([]);
      }

      // Fetch monthly data
      const monthlyResponse = await reportsAPI.lifetimePD.getMonthly({
        prcDate: filters.prcDate,
        pdModelId: filters.pdModelId
      });
      if (monthlyResponse.success) {
        setMonthlyData(monthlyResponse.data);
      }

      // Fetch comparison monthly data if active
      if (filters.isCompareMode && filters.pdModelIdB) {
        const monthlyResponseB = await reportsAPI.lifetimePD.getMonthly({
          prcDate: filters.prcDate,
          pdModelId: filters.pdModelIdB
        });
        if (monthlyResponseB.success) setMonthlyDataB(monthlyResponseB.data);
      } else {
        setMonthlyDataB([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('An error occurred while fetching data');
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
    try {
      setLoading(true);
      const payload = {
        calculationName: `PD Run ${format(config.procDate, 'yyyyMMdd')}`,
        calculationType: 'PD',
        portfolioId: config.selectedSegments?.[0] || 'ALL',
        reportingDate: format(config.procDate, 'yyyy-MM-dd'),
        currency: 'IDR',
        assumptions: `Method: ${config.pdMethod}, FL: ${config.isForwardLooking}`
      };
      
      const response = await impairmentApi.runCalculation(payload);
      if (response.data.success) {
        setLastCalculation(new Date());
        setCurrentFilters({
          prcDate: format(config.procDate, 'yyyy-MM-dd'),
          pdModelId: config.pdConfigId,
          isCompareMode: config.isCompareMode,
          pdModelIdB: config.pdConfigIdB
        });
      }
    } catch (err) {
      console.error('Run analysis error:', err);
      setError('Failed to trigger analysis');
    } finally {
      setLoading(false);
      setConfigOpen(false);
    }
  };

  // Transform backend data for charts
  const chartData = useMemo(() => {
    if (!yearlyData || yearlyData.length === 0) return [];
    
    // Backend returns flat list of pdYear, pdRate
    // We sort by year and calculate survival rate
    const sorted = [...yearlyData].sort((a, b) => (a.pdYear || 0) - (b.pdYear || 0));
    const sortedB = currentFilters.isCompareMode ? [...yearlyDataB].sort((a, b) => (a.pdYear || 0) - (b.pdYear || 0)) : [];
    
    let cumulativeSurvival = 100;
    let cumulativeSurvivalB = 100;
    
    return sorted.map((item, index) => {
      const marginalPD = (item.pdRate || 0) * 100;
      cumulativeSurvival = cumulativeSurvival * (1 - (item.pdRate || 0));
      
      const itemB = sortedB[index];
      const marginalPDB = itemB ? (itemB.pdRate || 0) * 100 : undefined;
      if (itemB) {
        cumulativeSurvivalB = cumulativeSurvivalB * (1 - (itemB.pdRate || 0));
      }

      return {
        year: `Year ${item.pdYear}`,
        marginalPD: item.pdRate || 0,
        marginalPDB: itemB ? (itemB.pdRate || 0) : undefined,
        survival: cumulativeSurvival / 100,
        survivalB: itemB ? (cumulativeSurvivalB / 100) : undefined,
        cumulativePD: 1 - (cumulativeSurvival / 100),
        cumulativePDB: itemB ? (1 - (cumulativeSurvivalB / 100)) : undefined
      };
    });
  }, [yearlyData, yearlyDataB, currentFilters.isCompareMode]);

  const monthlyChartData = useMemo(() => {
    if (!monthlyData || monthlyData.length === 0) return [];
    
    const sorted = [...monthlyData].sort((a, b) => (a.pdMonth || 0) - (b.pdMonth || 0));
    const sortedB = currentFilters.isCompareMode ? [...monthlyDataB].sort((a, b) => (a.pdMonth || 0) - (b.pdMonth || 0)) : [];

    return sorted.map((item, index) => {
      const itemB = sortedB[index];
      return {
        month: `M${item.pdMonth}`,
        marginalPD: item.pdRate || 0,
        marginalPDB: itemB?.pdRate || 0
      };
    });
  }, [monthlyData, monthlyDataB, currentFilters.isCompareMode]);

  // Transform KPIs
  const kpiData = useMemo(() => {
    if (chartData.length === 0) return { y1: 0, y3: 0, y5: 0, survival: 100 };
    const getY = (y: number) => chartData.find(d => d.year === `Year ${y}`);
    return {
      y1: getY(1)?.marginalPD || 0,
      y3: 1 - (getY(3)?.survival || 1),
      y5: 1 - (getY(5)?.survival || 1),
      survival: chartData[chartData.length - 1]?.survival || 1
    };
  }, [chartData]);

  const currentGranularity = tabValue === 1 ? 'Monthly' : 'Yearly';

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
              background: 'linear-gradient(90deg, #1a237e 0%, #0d47a1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
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
              <IconButton color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Results">
              <IconButton color="primary" onClick={() => setExportDialogOpen(true)}>
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
      <LifetimePDKPIs 
        y1pd={kpiData.y1}
        y3pd={kpiData.y3 * 100}
        y5pd={kpiData.y5 * 100}
        survivalRate={kpiData.survival * 100}
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
              prc_date: currentFilters.prcDate ? new Date(currentFilters.prcDate) : null,
              pd_config_id: currentFilters.pdModelId ? Number(currentFilters.pdModelId) : undefined
            }}
            onDataLoaded={(data) => console.log('Account Details Loaded:', data.length)}
        />
        
        <LifetimePDExportDialog 
            open={exportDialogOpen} 
            onClose={() => setExportDialogOpen(false)}
            onExport={(options) => {
                const auditMetadata = {
                  reportName: 'Yearly Lifetime PD',
                  procDate: currentFilters.prcDate,
                  segments: currentFilters.selectedSegments || 'All Segments',
                  pdConfigId: currentFilters.pdModelId,
                  compareMode: currentFilters.isCompareMode,
                  pdConfigIdB: currentFilters.pdModelIdB,
                  modelVersion: validationMetadata?.modelVersion || 'v2.1.0-prod',
                  generatedAt: new Date().toISOString()
                };
                console.log('Initiating Export with Audit Metadata:', auditMetadata, options);
                // Real implementation would call reportsAPI.export here
            }}
        />

    </Box>
  );
};


export default LifetimePDReport;