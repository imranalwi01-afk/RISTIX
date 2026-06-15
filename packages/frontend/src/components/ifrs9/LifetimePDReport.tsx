'use client';

// packages/frontend/src/components/ifrs9/LifetimePDReport.tsx
import React, { useState, useCallback, useMemo, useRef } from 'react';
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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  Switch,
  FormControlLabel,
  CircularProgress,
  useTheme,
  alpha,
  AccordionSummary,
  Accordion,
  AccordionDetails,
  Autocomplete
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import LifetimePDKPIs from './LifetimePDKPIs';
import SurvivalChart from './LifetimePDCharts/SurvivalChart';
import MarginalPDChart from './LifetimePDCharts/MarginalPDChart';
import BaseIfrs9Report from './BaseIfrs9Report';
import api from '@/services/api';
import { format } from 'date-fns';
import { pdConfigurationsApi } from '../../services/api/pd-configurations.api';
import { flScalarAPI } from '../../services/api/fl-scalar.api';
import { productSegmentsApi, type ProductSegment } from '../../services/api/product-segments.api';

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

const getDefaultLifetimePdFilters = () => ({
  prcDate: '2022-10-31',
  pdConfigId: '', // Will be set after configs are loaded
  pdMethod: 1,
  isForwardLooking: undefined as boolean | undefined,
  scalarId: undefined as number | undefined,
  selectedSegmentLabel: '',
  selectedSegmentId: undefined as number | undefined,
  isCompareMode: false,
  pdConfigIdB: '',
  pdMethodB: 2,
  scalarIdB: undefined as number | undefined,
});

const getDefaultLifetimePdDraft = () => ({
  procDate: new Date('2022-10-31'),
  pdConfigId: '', // Will be set after configs are loaded
  pdMethod: 1,
  flFlagSelection: 'all' as 'all' | 'with' | 'without',
  selectedSegment: null as ProductSegment | null,
  scalarId: '',
  isCompareMode: false,
  pdConfigIdB: '',
  pdMethodB: 2,
  scalarIdB: '',
});

const PD_METHOD_OPTIONS: Array<{ value: number; label: string }> = [
  { value: 1, label: 'NOA Migration' },
  { value: 2, label: 'OS Migration' },
  { value: 3, label: 'Proxy PD' },
];

const PD_CONFIG_ALLOWLIST_ORDER = [
  'PD Factoring',
  'PD Model All Segment',
  'PD Repo',
  'PD Treasury Fitch',
  'PD Treasury Moodys',
  'PD Treasury Pefindo',
  'PD Treasury S&P',
];

const LifetimePDReport: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
  const [lastCalculation, setLastCalculation] = useState<Date | null>(new Date());
  const requestSeqRef = useRef(0);
  
  // Data states
  const [yearlyData, setYearlyData] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [validationMetadata, setValidationMetadata] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [effectivePrcDate, setEffectivePrcDate] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<any>(getDefaultLifetimePdFilters);
  const [draftFilters, setDraftFilters] = useState<any>(getDefaultLifetimePdDraft);
  const [segments, setSegments] = useState<ProductSegment[]>([]);
  const [pdConfigs, setPdConfigs] = useState<any[]>([]);
  const [scalars, setScalars] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);
  const [availablePrcDates, setAvailablePrcDates] = useState<string[]>([]);

  const fetchData = useCallback(async (filters: any) => {
    const requestSeq = (requestSeqRef.current += 1);
    setLoading(true);
    setError(null);
    try {
      // Validate required parameters
      if (!filters.prcDate) {
        console.warn('⚠️ No processing date provided');
        setError('Processing date is required');
        setLoading(false);
        return;
      }
       
      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(filters.prcDate)) {
        console.warn('⚠️ Invalid date format:', filters.prcDate);
        setError('Invalid processing date format. Please use YYYY-MM-DD format.');
        setLoading(false);
        return;
      }
       
      const baseParams = {
        prc_date: filters.prcDate,
        pd_config_id: filters.pdConfigId ? Number(filters.pdConfigId) : undefined,
        pd_method: filters.pdMethod !== '' && filters.pdMethod !== null && filters.pdMethod !== undefined
          ? Number(filters.pdMethod)
          : undefined,
        fl_flag: filters.isForwardLooking,
        scalar_id: filters.isForwardLooking === true && filters.scalarId ? Number(filters.scalarId) : undefined,
        segment_id: filters.selectedSegmentId ? Number(filters.selectedSegmentId) : undefined,
      };
       
      console.log('🔍 Fetching Lifetime PD data with params:', baseParams);

      const results = await Promise.allSettled([
        api.banking.ifrs9Reports.lifetimePD.getYearly(baseParams),
        api.banking.ifrs9Reports.lifetimePD.getMonthly(baseParams),
      ]);
      
      console.log('📡 API Results:', results.map(r => ({
        status: r.status,
        value: r.status === 'fulfilled' ? r.value : null,
        reason: r.status === 'rejected' ? r.reason : null
      })));

      if (requestSeq !== requestSeqRef.current) return;

      const yearlyRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const monthlyRes = results[1].status === 'fulfilled' ? results[1].value : null;

      console.log('📡 Yearly Response:', yearlyRes);
      console.log('📡 Monthly Response:', monthlyRes);

      const errors: string[] = [];
      if (results[0].status === 'rejected') errors.push((results[0].reason as any)?.message || 'Failed to load yearly data');
      if (results[1].status === 'rejected') errors.push((results[1].reason as any)?.message || 'Failed to load monthly data');

      if (yearlyRes?.success) {
        const yearlyDataArray = Array.isArray(yearlyRes.data) ? yearlyRes.data : [];
        console.log('📊 Yearly data received:', yearlyDataArray.length, 'records');
        console.log('📅 Effective PRC Date from API:', yearlyRes.effectivePrcDate);
        setYearlyData(yearlyDataArray);
        setEffectivePrcDate(yearlyRes.effectivePrcDate ?? filters.prcDate);
        if (yearlyRes.metadata) setValidationMetadata(yearlyRes.metadata);
        
        // Check if data is empty and provide specific message
        if (yearlyDataArray.length === 0) {
          errors.push(yearlyRes.message || 'No yearly Lifetime PD data available for the selected filters. Try adjusting the processing date or configuration.');
        }
        
        // Check if effectivePrcDate is null
        if (!yearlyRes.effectivePrcDate) {
          errors.push('No data available for the selected processing date. The system could not find any Lifetime PD data on or before the selected date.');
        }
      } else if (yearlyRes && !yearlyRes.success) {
        errors.push(yearlyRes.message || 'Failed to load yearly data');
        setYearlyData([]);
      }

      if (monthlyRes?.success) {
        const monthlyDataArray = Array.isArray(monthlyRes.data) ? monthlyRes.data : [];
        console.log('📊 Monthly data received:', monthlyDataArray.length, 'records');
        setMonthlyData(monthlyDataArray);
        if (!yearlyRes?.effectivePrcDate && monthlyRes.effectivePrcDate) {
          setEffectivePrcDate(monthlyRes.effectivePrcDate);
        }
        
        // Check if data is empty
        if (monthlyDataArray.length === 0 && yearlyRes?.data?.length === 0) {
          errors.push('No monthly Lifetime PD data available for the selected filters.');
        }
      } else if (monthlyRes && !monthlyRes.success) {
        errors.push(monthlyRes.message || 'Failed to load monthly data');
        setMonthlyData([]);
      }

      if (errors.length > 0) {
        setError(errors[0]);
      } else if (yearlyRes?.success && monthlyRes?.success && 
                 yearlyRes.data?.length === 0 && monthlyRes.data?.length === 0) {
        // Both APIs returned success but no data
        setError('No Lifetime PD data available for the selected configuration. Please try different filter settings or check if data has been processed for the selected date.');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      const message =
        (err as any)?.response?.data?.message
        || (err as any)?.message
        || 'Backend is not reachable. Please refresh and try again.';
      setError(String(message));
      setEffectivePrcDate(null);
    } finally {
      if (requestSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadAvailablePrcDates = useCallback(async () => {
    setAvailablePrcDates([]);
  }, []);

  React.useEffect(() => {
    if (!currentFilters?.prcDate) return;
    console.log('🔄 Initial data fetch with filters:', currentFilters);
    fetchData(currentFilters);
  }, [fetchData, currentFilters]);

  React.useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [segmentData, pdData, scalarData] = await Promise.all([
          productSegmentsApi.getAll(),
          pdConfigurationsApi.getAll({ is_active: true }),
          flScalarAPI.getAll(),
        ]);
        const configs = Array.isArray(pdData) ? pdData : [];
        const rawSegments = Array.isArray(segmentData) ? segmentData : [];
        const normalizedSegments = rawSegments.filter((segment) => {
          const type = String((segment as any).segmentType || '').toLowerCase();
          const group = String((segment as any).groupSegment || '').toLowerCase();
          const name = String((segment as any).segment || '').toLowerCase();
          const subSegment = String((segment as any).subSegment || '').toLowerCase();
          return (
            type.includes('pd')
            || /\bpd\b/.test(group)
            || group.startsWith('pd')
            || /\bpd\b/.test(name)
            || name.startsWith('pd')
            || /\bpd\b/.test(subSegment)
            || subSegment.startsWith('pd')
          );
        });

        console.log('📋 PD Configurations loaded:', configs.length, 'configs');
        setSegments(normalizedSegments);
        setPdConfigs(configs);
        setScalars(Array.isArray(scalarData) ? scalarData : []);
        
        // Check if no configurations available
        if (configs.length === 0) {
          console.warn('⚠️ No PD configurations available');
        }
      } catch (err: any) {
        const message = err?.message || 'Failed to load filter metadata.'
        console.error('❌ Error loading PD configurations:', err);
        setError(String(message))
      } finally {
        setLoadingLookups(false);
      }
    };
    void loadLookups();
  }, []);

  const pdConfigOptions = useMemo(() => {
    const byName = new Map<string, any[]>();
    for (const c of pdConfigs) {
      const name = String(c?.model_name || '').trim();
      if (!name) continue;
      const arr = byName.get(name) || [];
      arr.push(c);
      byName.set(name, arr);
    }

    const allowlisted = PD_CONFIG_ALLOWLIST_ORDER
      .map((name) => {
        const candidates = byName.get(name);
        const c = candidates?.[0];
        if (!c) return null;
        const id = c?.id ?? c?.pkid ?? c?.model_id ?? c?.modelId;
        const value = id === null || id === undefined ? '' : String(id);
        return value ? { value, label: name } : null;
      })
      .filter(Boolean) as Array<{ value: string; label: string }>;

    if (allowlisted.length > 0) return allowlisted;

    const excluded = new Set(['PD Before FL', 'PD Testing']);
    const fallback = pdConfigs
      .map((c: any) => {
        const name = String(c?.model_name || '').trim();
        if (!name || !name.startsWith('PD ')) return null;
        if (excluded.has(name)) return null;
        const id = c?.id ?? c?.pkid ?? c?.model_id ?? c?.modelId;
        const value = id === null || id === undefined ? '' : String(id);
        return value ? { value, label: name } : null;
      })
      .filter(Boolean) as Array<{ value: string; label: string }>;

    fallback.sort((a, b) => a.label.localeCompare(b.label));
    return fallback;
  }, [pdConfigs]);

  React.useEffect(() => {
    if (!availablePrcDates.length) return;
    const newest = availablePrcDates[0];
    if (!newest) return;

    const availableSet = new Set(availablePrcDates);

    setCurrentFilters((prev: any) => {
      const prevDate = prev?.prcDate;
      if (prevDate && availableSet.has(String(prevDate))) return prev;
      return { ...prev, prcDate: newest };
    });

    setDraftFilters((prev: any) => {
      const prevDate = prev?.procDate ? format(prev.procDate, 'yyyy-MM-dd') : '';
      if (prevDate && availableSet.has(prevDate)) return prev;
      return { ...prev, procDate: new Date(newest) };
    });
  }, [availablePrcDates]);

  React.useEffect(() => {
    void loadAvailablePrcDates();
  }, [loadAvailablePrcDates]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const applyDraftFilters = useCallback(() => {
    const normalizedFlFlag =
      draftFilters.flFlagSelection === 'with'
        ? true
        : draftFilters.flFlagSelection === 'without'
          ? false
          : undefined;

    setCurrentFilters({
      prcDate: format(draftFilters.procDate, 'yyyy-MM-dd'),
      pdConfigId: draftFilters.pdConfigId,
      pdMethod: draftFilters.pdMethod === '' ? '' : Number(draftFilters.pdMethod),
      isForwardLooking: normalizedFlFlag,
      scalarId: normalizedFlFlag === true && draftFilters.scalarId ? Number(draftFilters.scalarId) : undefined,
      selectedSegmentLabel: draftFilters.selectedSegment
        ? (draftFilters.selectedSegment.segment || draftFilters.selectedSegment.subSegment || draftFilters.selectedSegment.groupSegment || String(draftFilters.selectedSegment.id))
        : '',
      selectedSegmentId: draftFilters.selectedSegment ? Number(draftFilters.selectedSegment.id) : undefined,
      isCompareMode: Boolean(draftFilters.isCompareMode),
      pdConfigIdB: draftFilters.isCompareMode ? draftFilters.pdConfigIdB : '',
      pdMethodB: draftFilters.isCompareMode ? Number(draftFilters.pdMethodB) : 2,
      scalarIdB: draftFilters.isCompareMode && normalizedFlFlag === true && draftFilters.scalarIdB ? Number(draftFilters.scalarIdB) : undefined,
    });
    setLastCalculation(new Date());
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setCurrentFilters(getDefaultLifetimePdFilters());
    setDraftFilters(getDefaultLifetimePdDraft());
    setTabValue(0);
    setAvailablePrcDates([]);
  }, []);

  // Transform backend data for charts
  const chartData = useMemo(() => {
    console.log('📊 Transforming yearly data for charts:', yearlyData);
    if (!yearlyData || yearlyData.length === 0) return [];
    
    const baseBucket = yearlyData[0];
    console.log('📊 Base bucket data:', baseBucket);
    
    const yearKeys = Object.keys(baseBucket)
      .filter(k => k.startsWith('year_'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('year_', '')) || 0;
        const numB = parseInt(b.replace('year_', '')) || 0;
        return numA - numB;
      });
      
    console.log('📊 Year keys found:', yearKeys);
    
    let survivalA = 1;
    
    const transformedData = yearKeys.map((key, index) => {
      const yearVal = parseInt(key.replace('year_', '')) || index + 1;
      const pdA = baseBucket[key] || 0;
      survivalA = survivalA * (1 - pdA);

      return {
        year: `Year ${yearVal}`,
        bucketYear: yearVal,
        marginalPD: pdA,
        survival: survivalA,
        cumulativePD: 1 - survivalA,
      };
    });
    
    console.log('📊 Transformed chart data:', transformedData);
    return transformedData;
  }, [yearlyData]);

  const monthlyChartData = useMemo(() => {
    console.log('📊 Transforming monthly data for charts:', monthlyData);
    if (!monthlyData || monthlyData.length === 0) return [];
    
    const baseBucket = monthlyData[0];
    console.log('📊 Base monthly bucket data:', baseBucket);
    
    const monthKeys = Object.keys(baseBucket)
      .filter(k => k.startsWith('month_'))
      .sort((a, b) => {
        const numA = parseInt(a.replace('month_', '')) || 0;
        const numB = parseInt(b.replace('month_', '')) || 0;
        return numA - numB;
      });

    console.log('📊 Month keys found:', monthKeys);
    
    const transformedData = monthKeys.map((key, index) => {
      const monthVal = parseInt(key.replace('month_', '')) || index + 1;
      const pdA = baseBucket[key] || 0;

      return {
        month: `M${monthVal}`,
        marginalPD: pdA,
      };
    });
    
    console.log('📊 Transformed monthly chart data:', transformedData);
    return transformedData;
  }, [monthlyData]);

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

  const toTitleCase = useCallback((value: string) => {
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (m) => m.toUpperCase())
  }, [])

  const buildTableFromObjects = useCallback((rows: any[]) => {
    const keys = Array.from(
      new Set(
        rows.flatMap((r) => Object.keys(r || {}))
      )
    )
    const head = [keys.map((k) => toTitleCase(k))]
    const body = rows.map((r) => keys.map((k) => {
      const v = (r || {})[k]
      if (v === null || v === undefined) return ''
      if (typeof v === 'number' && Number.isFinite(v)) return v
      return String(v)
    }))
    return { head, body, keys }
  }, [toTitleCase])

  const fetchAccountDetailsForExport = useCallback(async () => {
    const maxRows = 2000
    const pageSize = 500
    const prc_date = effectivePrcDate || currentFilters.prcDate
    if (!prc_date) return { rows: [], truncated: false }

    const paramsBase = {
      prc_date,
      pd_config_id: currentFilters.pdConfigId ? Number(currentFilters.pdConfigId) : undefined,
      pd_method: currentFilters.pdMethod,
      fl_flag: currentFilters.isForwardLooking,
      scalar_id: currentFilters.isForwardLooking === true && currentFilters.scalarId ? Number(currentFilters.scalarId) : undefined,
      segment_id: currentFilters.selectedSegmentId ? Number(currentFilters.selectedSegmentId) : undefined,
    } as const

    let page = 1
    let out: any[] = []
    let truncated = false

    while (out.length < maxRows) {
      const remaining = maxRows - out.length
      const limit = Math.min(pageSize, remaining)
      const resp = await api.ifrs9Reports.lifetimePD.getAccountDetails({
        ...paramsBase,
        page,
        limit,
      })

      const data = Array.isArray(resp?.data) ? resp.data : (Array.isArray(resp) ? resp : [])
      if (!data.length) break
      out = out.concat(data)
      if (data.length < limit) break
      page += 1
    }

    if (out.length >= maxRows) truncated = true
    return { rows: out, truncated }
  }, [currentFilters.isForwardLooking, currentFilters.pdConfigId, currentFilters.pdMethod, currentFilters.prcDate, currentFilters.scalarId, currentFilters.selectedSegmentId, effectivePrcDate])

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
            <Tooltip title={showFilters ? "Hide Filters" : "Show Filters"}>
              <Button 
                variant={showFilters ? "contained" : "outlined"} 
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters((prev) => !prev)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </Tooltip>
            <Tooltip title="Refresh Data">
              <IconButton color="primary" onClick={() => fetchData(currentFilters)} disabled={loading} aria-label="Refresh data">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Reset Filter">
              <IconButton color="primary" onClick={handleResetFilters} disabled={loading} aria-label="Reset filters">
                <ClearAllIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
      </Paper>

      {showFilters ? (
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
            gap: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FilterListIcon style={{ marginRight: 8, color: theme.palette.primary.main }} />
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.primary.main }}>
                Analysis Configuration
              </Typography>
            </Box>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <DatePicker
                    label="Processing Date"
                    value={draftFilters.procDate}
                    onChange={(date: any) => setDraftFilters((prev: any) => ({ ...prev, procDate: date || prev.procDate }))}
                    enableAccessibleFieldDOMStructure={false}
                    slots={{ textField: TextField as any }}
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

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>PD Config</InputLabel>
                    <Select
                      value={draftFilters.pdConfigId}
                      label="PD Config"
                      onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, pdConfigId: String(e.target.value) }))}
                      sx={{ borderRadius: 2 }}
                    >
                      {loadingLookups ? (
                        <MenuItem value="">
                          <CircularProgress size={16} />
                        </MenuItem>
                      ) : (
                        [
                          <MenuItem key="placeholder" value="">
                            Select PD Config
                          </MenuItem>,
                          ...pdConfigOptions.map((c) => (
                            <MenuItem key={c.value} value={c.value}>
                              {c.label}
                            </MenuItem>
                          ))
                        ]
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    sx={{
                      minHeight: 40,
                      pl: { xs: 0, sm: 1 },
                      pt: { xs: 0, sm: 1 }
                    }}
                  >
                    <Typography variant="body1" fontWeight={700} sx={{ minWidth: 96 }}>
                      FL Flag
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={draftFilters.flFlagSelection === 'with'}
                          onChange={(_, checked) =>
                            setDraftFilters((prev: any) => ({
                              ...prev,
                              flFlagSelection: checked ? 'with' : 'all',
                              scalarId: checked ? prev.scalarId : '',
                              scalarIdB: checked ? prev.scalarIdB : '',
                            }))
                          }
                        />
                      }
                      label="With FL"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={draftFilters.flFlagSelection === 'without'}
                          onChange={(_, checked) =>
                            setDraftFilters((prev: any) => ({
                              ...prev,
                              flFlagSelection: checked ? 'without' : 'all',
                              scalarId: checked ? '' : prev.scalarId,
                              scalarIdB: checked ? '' : prev.scalarIdB,
                            }))
                          }
                        />
                      }
                      label="Without FL"
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>PD Method</InputLabel>
                    <Select
                      value={draftFilters.pdMethod}
                      label="PD Method"
                      onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, pdMethod: String(e.target.value) === '' ? '' : Number(e.target.value) }))}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">Select PD Method</MenuItem>
                      {PD_METHOD_OPTIONS.map((m) => (
                        <MenuItem key={String(m.value)} value={m.value}>
                          {m.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Accordion
                    variant="outlined"
                    sx={{
                      mt: 1,
                      borderRadius: '12px !important',
                      borderColor: alpha(theme.palette.primary.main, 0.1),
                      '&:before': { display: 'none' },
                      boxShadow: 'none',
                      bgcolor: alpha(theme.palette.primary.main, 0.005)
                    }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ px: 2, minHeight: 48, '& .MuiAccordionSummary-content': { my: 1 } }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <TuneIcon sx={{ mr: 1, fontSize: 20, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle2" fontWeight={700} color={theme.palette.primary.main}>
                          Advanced Parameters
                        </Typography>
                      </Box>
                    </AccordionSummary>
                      <AccordionDetails sx={{ px: 2, pb: 3, pt: 1 }}>
                        <Grid container spacing={2.5}>
                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Autocomplete
                              size="small"
                              options={segments}
                              loading={loadingLookups}
                              getOptionLabel={(option) => option.segment || option.subSegment || option.groupSegment || String(option.id)}
                              isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                              value={draftFilters.selectedSegment}
                              onChange={(_, newValue) => setDraftFilters((prev: any) => ({ ...prev, selectedSegment: newValue }))}
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                label="Segment ID (PD)"
                                placeholder="All Segments"
                                helperText="Opsional"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                              />
                            )}
                          />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <FormControl fullWidth size="small" disabled={draftFilters.flFlagSelection !== 'with'}>
                              <InputLabel>Scalar</InputLabel>
                              <Select
                                value={draftFilters.scalarId}
                              label="Scalar"
                              onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, scalarId: String(e.target.value) }))}
                              sx={{ borderRadius: 2 }}
                            >
                              <MenuItem value="">Default</MenuItem>
                              {scalars.map((s: any) => (
                                <MenuItem key={String(s.id)} value={String(s.id)}>
                                  {s.scalarName || s.scalar_name || `Scalar ${s.id}`}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={Boolean(draftFilters.isCompareMode)}
                                onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, isCompareMode: e.target.checked }))}
                              />
                            }
                            label={<Typography variant="body2" fontWeight={700}>Compare Mode</Typography>}
                          />
                        </Grid>

                        {draftFilters.isCompareMode ? (
                          <>
                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>PD Config (B)</InputLabel>
                                <Select
                                  value={draftFilters.pdConfigIdB}
                                  label="PD Config (B)"
                                  onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, pdConfigIdB: String(e.target.value) }))}
                                  sx={{ borderRadius: 2 }}
                                >
                                  {pdConfigs.map((c: any) => (
                                    <MenuItem key={String(c.id)} value={String(c.id)}>
                                      {c.config_name || c.name || `Config ${c.id}`}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>PD Method (B)</InputLabel>
                                <Select
                                  value={draftFilters.pdMethodB}
                                  label="PD Method (B)"
                                  onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, pdMethodB: Number(e.target.value) }))}
                                  sx={{ borderRadius: 2 }}
                                >
                                  <MenuItem value={1}>TTC</MenuItem>
                                  <MenuItem value={2}>PIT</MenuItem>
                                  <MenuItem value={3}>Hybrid</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                              <FormControl fullWidth size="small" disabled={!draftFilters.isForwardLooking}>
                                <InputLabel>Scalar (B)</InputLabel>
                                <Select
                                  value={draftFilters.scalarIdB}
                                  label="Scalar (B)"
                                  onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, scalarIdB: String(e.target.value) }))}
                                  sx={{ borderRadius: 2 }}
                                >
                                  <MenuItem value="">Default</MenuItem>
                                  {scalars.map((s: any) => (
                                    <MenuItem key={String(s.id)} value={String(s.id)}>
                                      {s.scalarName || s.scalar_name || `Scalar ${s.id}`}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            </Grid>
                          </>
                        ) : null}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="center"
                    sx={{ pt: 1 }}
                  >
                    <Button
                      variant="contained"
                      startIcon={<SearchIcon />}
                      onClick={applyDraftFilters}
                      disabled={loading || loadingLookups}
                      sx={{
                        minWidth: 180,
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: theme.palette.error.main,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.35)}`,
                        '&:hover': {
                          bgcolor: theme.palette.error.dark,
                          boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.45)}`
                        }
                      }}
                    >
                      Search
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<ClearAllIcon />}
                      onClick={handleResetFilters}
                      disabled={loading}
                      sx={{
                        minWidth: 180,
                        textTransform: 'none',
                        fontWeight: 700,
                        bgcolor: theme.palette.error.main,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.35)}`,
                        '&:hover': {
                          bgcolor: theme.palette.error.dark,
                          boxShadow: `0 6px 20px ${alpha(theme.palette.error.main, 0.45)}`
                        }
                      }}
                    >
                      Clear
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </LocalizationProvider>
          </CardContent>
        </Card>
      ) : null}

      {error ? (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 3 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" color="inherit" onClick={() => setShowFilters(true)}>
                Open Filters
              </Button>
              <Button size="small" color="inherit" onClick={() => fetchData(currentFilters)} disabled={loading}>
                Retry
              </Button>
            </Stack>
          }
        >
          {error}
        </Alert>
      ) : null}

      {/* Results KPIs */}
      {effectivePrcDate && effectivePrcDate !== currentFilters.prcDate && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          Snapshot used: <strong>{effectivePrcDate}</strong> (latest available data on or before the selected processing date).
        </Alert>
      )}

      {/* Loading State */}
      {loading && !error && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }} icon={<CircularProgress size={16} />}>
          Loading Lifetime PD data...
        </Alert>
      )}

      {/* No Data State */}
      {!loading && !error && yearlyData.length === 0 && monthlyData.length === 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3, borderRadius: 3 }}
          action={
            <Stack direction="row" spacing={1}>
              <Button size="small" color="inherit" onClick={() => setShowFilters(true)}>
                Adjust Filters
              </Button>
              <Button size="small" color="inherit" onClick={() => fetchData(currentFilters)}>
                Retry
              </Button>
            </Stack>
          }
        >
          No Lifetime PD data available for the selected filters. Try adjusting the processing date, PD configuration, or method.
        </Alert>
      )}

      {/* Data Visualization - Only show if we have data */}
      {!loading && (yearlyData.length > 0 || monthlyData.length > 0) && (
        <>
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
      
      {/* Detailed Data Table - Always show if no error */}
      {!error ? (
        <BaseIfrs9Report 
          title="Lifetime PD - Account Details" 
          description="Account-level PD outputs used for detailed review and export"
          reportType="lifetime-pd-account-details"
          headerAtTop
          hideFilters
          requiredParams={['prc_date']}
          optionalParams={[]}
          supportsPagination={true}
          externalFilters={{
            prc_date: effectivePrcDate ? new Date(effectivePrcDate) : currentFilters.prcDate ? new Date(currentFilters.prcDate) : null,
            pd_config_id: currentFilters.pdConfigId ? Number(currentFilters.pdConfigId) : undefined,
            pd_method: currentFilters.pdMethod,
            fl_flag: currentFilters.isForwardLooking,
            scalar_id: currentFilters.isForwardLooking === true && currentFilters.scalarId ? Number(currentFilters.scalarId) : undefined,
            segment_id: currentFilters.selectedSegmentId ? Number(currentFilters.selectedSegmentId) : undefined,
          }}
          onDataLoaded={(data) => console.log('Account Details Loaded:', data.length)}
        />
      ) : null}
        </>
      )}

    </Box>
  );
};


export default LifetimePDReport;
