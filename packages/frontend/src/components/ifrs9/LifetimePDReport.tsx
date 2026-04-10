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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  ClearAll as ClearAllIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  ExpandMore as ExpandMoreIcon,
  Tune as TuneIcon
} from '@mui/icons-material';

import { Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Autocomplete from '@mui/material/Autocomplete';
import LifetimePDKPIs from './LifetimePDKPIs';
import SurvivalChart from './LifetimePDCharts/SurvivalChart';
import MarginalPDChart from './LifetimePDCharts/MarginalPDChart';
import LifetimePDExportDialog from './LifetimePDExportDialog';
import BaseIfrs9Report from './BaseIfrs9Report';
import api from '@/services/api';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { productSegmentsApi, type ProductSegment } from '../../services/api/product-segments.api';
import { pdConfigurationsApi } from '../../services/api/pd-configurations.api';
import { flScalarAPI } from '../../services/api/fl-scalar.api';

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

const getDefaultLifetimePdDraft = () => ({
  procDate: new Date('2022-10-31'),
  selectedSegments: [] as ProductSegment[],
  pdConfigId: '',
  pdMethod: mapPdMethodToCode('TTC'),
  isForwardLooking: false,
  scalarId: '',
  isCompareMode: false,
  pdConfigIdB: '',
  pdMethodB: mapPdMethodToCode('PIT'),
  scalarIdB: '',
});

const LifetimePDReport: React.FC = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [showFilters, setShowFilters] = useState(true);
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
  const [draftFilters, setDraftFilters] = useState<any>(getDefaultLifetimePdDraft);
  const [segments, setSegments] = useState<ProductSegment[]>([]);
  const [pdConfigs, setPdConfigs] = useState<any[]>([]);
  const [scalars, setScalars] = useState<any[]>([]);
  const [loadingLookups, setLoadingLookups] = useState(false);

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
      const message =
        (err as any)?.response?.data?.message
        || (err as any)?.message
        || 'Backend tidak dapat diakses. Silakan refresh atau coba lagi.';
      setError(String(message));
      setEffectivePrcDate(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData(currentFilters);
  }, [fetchData, currentFilters]);

  React.useEffect(() => {
    const loadLookups = async () => {
      setLoadingLookups(true);
      try {
        const [segData, pdData, scData] = await Promise.all([
          productSegmentsApi.getAll(),
          pdConfigurationsApi.getAll({ is_active: true }),
          flScalarAPI.getAll()
        ]);

        const rawSegments = Array.isArray(segData) ? segData : [];
        const isPd = (s: ProductSegment) => {
          const t = String((s as any).segmentType || '').toLowerCase();
          if (t) return t.includes('pd');
          const seg = String((s as any).segment || '').toLowerCase();
          const group = String((s as any).groupSegment || '').toLowerCase();
          const sub = String((s as any).subSegment || '').toLowerCase();
          return /\bpd\b/.test(seg) || seg.startsWith('pd') || /\bpd\b/.test(group) || group.startsWith('pd') || /\bpd\b/.test(sub) || sub.startsWith('pd');
        };

        const normalizedSegments = rawSegments.filter(isPd);
        normalizedSegments.sort((a, b) => (Number((a as any).displayOrder || 0) - Number((b as any).displayOrder || 0)) || String(a.id).localeCompare(String(b.id)));
        setSegments(normalizedSegments);

        setPdConfigs(Array.isArray(pdData) ? pdData : []);
        setScalars(Array.isArray(scData) ? scData : []);
      } finally {
        setLoadingLookups(false);
      }
    };
    void loadLookups();
  }, []);

  React.useEffect(() => {
    if (!pdConfigs.length) return;
    setDraftFilters((prev: any) => (prev.pdConfigId ? prev : { ...prev, pdConfigId: String(pdConfigs[0].id) }));
    setCurrentFilters((prev: any) => (prev.pdConfigId ? prev : { ...prev, pdConfigId: String(pdConfigs[0].id) }));
  }, [pdConfigs]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const applyDraftFilters = useCallback(() => {
    setCurrentFilters({
      prcDate: format(draftFilters.procDate, 'yyyy-MM-dd'),
      pdConfigId: draftFilters.pdConfigId,
      pdMethod: Number(draftFilters.pdMethod),
      isForwardLooking: Boolean(draftFilters.isForwardLooking),
      scalarId: draftFilters.isForwardLooking ? (draftFilters.scalarId ? Number(draftFilters.scalarId) : undefined) : undefined,
      selectedSegments: (draftFilters.selectedSegments || []).map((s: ProductSegment) => (s.segment || s.subSegment || s.groupSegment || String(s.id))),
      selectedSegmentIds: (draftFilters.selectedSegments || []).map((s: ProductSegment) => Number(s.id)),
      isCompareMode: Boolean(draftFilters.isCompareMode),
      pdConfigIdB: draftFilters.isCompareMode ? draftFilters.pdConfigIdB : '',
      pdMethodB: draftFilters.isCompareMode ? Number(draftFilters.pdMethodB) : mapPdMethodToCode('PIT'),
      scalarIdB: draftFilters.isCompareMode
        ? (draftFilters.scalarIdB ? Number(draftFilters.scalarIdB) : undefined)
        : undefined
    });
    setLastCalculation(new Date());
  }, [draftFilters]);

  const handleResetFilters = useCallback(() => {
    setCurrentFilters(getDefaultLifetimePdFilters());
    setDraftFilters(getDefaultLifetimePdDraft());
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
      scalar_id: currentFilters.scalarId ? Number(currentFilters.scalarId) : undefined,
      fl_flag: currentFilters.isForwardLooking,
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
  }, [currentFilters.isForwardLooking, currentFilters.pdConfigId, currentFilters.pdMethod, currentFilters.prcDate, currentFilters.scalarId, effectivePrcDate])

  const handleExport = useCallback((options: any) => {
    void (async () => {
      if (!hasReportData) return
      try {
        setLoading(true)

        const fileDate = effectivePrcDate || currentFilters.prcDate || new Date().toISOString().slice(0, 10)
        const generatedAt = new Date().toISOString()
        const requestedPrcDate = currentFilters.prcDate
        const effectiveDate = effectivePrcDate || currentFilters.prcDate

        const auditRows = [
          ['Report Name', 'Lifetime PD'],
          ['Requested Processing Date', requestedPrcDate],
          ['Effective Processing Date', effectiveDate],
          ['PD Config ID', currentFilters.pdConfigId || 'All'],
          ['PD Method', String(currentFilters.pdMethod ?? '')],
          ['Forward Looking', currentFilters.isForwardLooking ? 'Yes' : 'No'],
          ['Segments', currentFilters.selectedSegments?.length ? currentFilters.selectedSegments.join(', ') : 'All Segments'],
          ['Segment IDs', currentFilters.selectedSegmentIds?.length ? currentFilters.selectedSegmentIds.join(', ') : 'All Segments'],
          ['Generated At', generatedAt],
          []
        ]

        if (options.format === 'pdf') {
          const [{ jsPDF }, autoTableModule] = await Promise.all([
            import('jspdf'),
            import('jspdf-autotable'),
          ])
          const autoTable = (autoTableModule as any).default || (autoTableModule as any)

          const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

          const pageWidth = doc.internal.pageSize.getWidth()
          const headerLeft = [
            'Lifetime PD Report',
            `As of: ${effectiveDate}`,
            `PD Config: ${currentFilters.pdConfigId || 'All'} | Method: ${String(currentFilters.pdMethod ?? '')} | FL: ${currentFilters.isForwardLooking ? 'Yes' : 'No'}`,
            `Segments: ${currentFilters.selectedSegments?.length ? currentFilters.selectedSegments.join(', ') : 'All'}`,
            `Generated: ${generatedAt.replace('T', ' ').slice(0, 19)}`,
          ]

          const sections: Array<{ title: string; head: any[]; body: any[] }> = []

          if (options.scope?.summary) {
            sections.push({
              title: 'Executive Summary (KPIs)',
              head: [['Metric', 'Value']],
              body: [
                ['1Y Cumulative PD', `${kpiData.y1.toFixed(2)}%`],
                ['3Y Cumulative PD', `${kpiData.y3.toFixed(2)}%`],
                ['5Y Cumulative PD', `${kpiData.y5.toFixed(2)}%`],
                ['Survival Rate', `${kpiData.survival.toFixed(2)}%`],
              ],
            })
          }

          if (options.scope?.bySegment && yearlyData.length > 0) {
            const t = buildTableFromObjects(yearlyData)
            sections.push({ title: 'Yearly PD (Base)', head: t.head, body: t.body })
          }
          if (options.scope?.bySegment && currentFilters.isCompareMode && yearlyDataB?.length > 0) {
            const t = buildTableFromObjects(yearlyDataB)
            sections.push({ title: 'Yearly PD (Compare)', head: t.head, body: t.body })
          }

          if (options.scope?.charts && monthlyData.length > 0) {
            const t = buildTableFromObjects(monthlyData)
            sections.push({ title: 'Monthly PD (Base)', head: t.head, body: t.body })
          }
          if (options.scope?.charts && currentFilters.isCompareMode && monthlyDataB?.length > 0) {
            const t = buildTableFromObjects(monthlyDataB)
            sections.push({ title: 'Monthly PD (Compare)', head: t.head, body: t.body })
          }

          if (options.scope?.fullAccount) {
            const { rows, truncated } = await fetchAccountDetailsForExport()
            if (rows.length) {
              const t = buildTableFromObjects(rows)
              const note = truncated ? ' (First 2000 rows)' : ''
              sections.push({ title: `Account Details${note}`, head: t.head, body: t.body })
            } else {
              sections.push({ title: 'Account Details', head: [['Info']], body: [['No rows returned from server']] })
            }
          }

          let cursorY = 86

          const drawHeader = () => {
            doc.setFontSize(14)
            doc.setTextColor(17, 24, 39)
            doc.text(headerLeft[0], 32, 32)
            doc.setFontSize(9)
            doc.setTextColor(71, 85, 105)
            doc.text(headerLeft[1], 32, 48)
            doc.text(headerLeft[2], 32, 62, { maxWidth: pageWidth - 64 })
            doc.text(headerLeft[3], 32, 76, { maxWidth: pageWidth - 64 })
            doc.text(headerLeft[4], 32, 90)
          }

          drawHeader()
          cursorY = 110

          const footer = () => {
            const rightX = pageWidth - 32
            const pageNumber = doc.getCurrentPageInfo().pageNumber
            const totalPages = doc.getNumberOfPages()
            doc.setFontSize(9)
            doc.setTextColor(100)
            doc.text(`Page ${pageNumber} / ${totalPages}`, rightX, doc.internal.pageSize.getHeight() - 18, { align: 'right' })
          }

          for (const section of sections) {
            autoTable(doc, {
              head: section.head,
              body: section.body,
              startY: cursorY + 18,
              margin: { top: 100, left: 32, right: 32, bottom: 36 },
              styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak' },
              headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
              alternateRowStyles: { fillColor: [248, 250, 252] },
              didDrawPage: () => {
                drawHeader()
                footer()
              },
            })

            const lastY = (doc as any).lastAutoTable?.finalY
            cursorY = typeof lastY === 'number' ? lastY + 20 : cursorY + 40
            if (cursorY > doc.internal.pageSize.getHeight() - 80) {
              doc.addPage()
              drawHeader()
              cursorY = 110
            }

            doc.setFontSize(11)
            doc.setTextColor(17, 24, 39)
            doc.text(section.title, 32, cursorY - 6)
          }

          doc.save(`lifetime-pd-${fileDate}.pdf`)
          return
        }

        const workbook = XLSX.utils.book_new()

        if (options.scope?.summary) {
          const summarySheet = XLSX.utils.aoa_to_sheet([
            ...auditRows,
            ['Metric', 'Value'],
            ['1Y Cumulative PD', `${kpiData.y1.toFixed(2)}%`],
            ['3Y Cumulative PD', `${kpiData.y3.toFixed(2)}%`],
            ['5Y Cumulative PD', `${kpiData.y5.toFixed(2)}%`],
            ['Survival Rate', `${kpiData.survival.toFixed(2)}%`],
          ])
          XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
        }

        if (options.scope?.bySegment && yearlyData.length > 0) {
          const yearlySheet = XLSX.utils.json_to_sheet(yearlyData)
          XLSX.utils.sheet_add_aoa(yearlySheet, auditRows, { origin: 'A1' })
          XLSX.utils.book_append_sheet(workbook, yearlySheet, 'Yearly PD')
        }
        if (options.scope?.bySegment && currentFilters.isCompareMode && yearlyDataB?.length > 0) {
          const yearlySheetB = XLSX.utils.json_to_sheet(yearlyDataB)
          XLSX.utils.sheet_add_aoa(yearlySheetB, auditRows, { origin: 'A1' })
          XLSX.utils.book_append_sheet(workbook, yearlySheetB, 'Yearly PD (B)')
        }

        if (options.scope?.charts && monthlyData.length > 0) {
          const monthlySheet = XLSX.utils.json_to_sheet(monthlyData)
          XLSX.utils.sheet_add_aoa(monthlySheet, auditRows, { origin: 'A1' })
          XLSX.utils.book_append_sheet(workbook, monthlySheet, 'Monthly PD')
        }
        if (options.scope?.charts && currentFilters.isCompareMode && monthlyDataB?.length > 0) {
          const monthlySheetB = XLSX.utils.json_to_sheet(monthlyDataB)
          XLSX.utils.sheet_add_aoa(monthlySheetB, auditRows, { origin: 'A1' })
          XLSX.utils.book_append_sheet(workbook, monthlySheetB, 'Monthly PD (B)')
        }

        if (options.scope?.fullAccount) {
          const { rows, truncated } = await fetchAccountDetailsForExport()
          const accountRows = truncated ? rows.map((r) => ({ ...r, export_note: 'First 2000 rows' })) : rows
          const accountSheet = XLSX.utils.json_to_sheet(accountRows)
          XLSX.utils.sheet_add_aoa(accountSheet, auditRows, { origin: 'A1' })
          XLSX.utils.book_append_sheet(workbook, accountSheet, 'Account Details')
        }

        if (!workbook.SheetNames.length) return

        if (options.format === 'csv') {
          const firstName = workbook.SheetNames[0]
          const firstSheet = workbook.Sheets[firstName]
          XLSX.writeFile({ SheetNames: [firstName], Sheets: { [firstName]: firstSheet } } as any, `lifetime-pd-${fileDate}.csv`, { bookType: 'csv' })
          return
        }

        XLSX.writeFile(workbook, `lifetime-pd-${fileDate}.xlsx`)
      } catch (error) {
        console.error('Export failed:', error)
      } finally {
        setLoading(false)
      }
    })()
  }, [buildTableFromObjects, currentFilters, effectivePrcDate, fetchAccountDetailsForExport, hasReportData, kpiData, monthlyData, monthlyDataB, yearlyData, yearlyDataB]);

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
            justifyContent: 'space-between',
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
            <Button
              variant="contained"
              onClick={applyDraftFilters}
              disabled={loading || loadingLookups}
              sx={{
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}` }
              }}
            >
              Run Analysis
            </Button>
          </Box>
          <CardContent sx={{ p: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6} md={3 as any}>
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

                <Grid item xs={12} sm={6} md={3 as any}>
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
                      ) : pdConfigs.map((c: any) => (
                        <MenuItem key={String(c.id)} value={String(c.id)}>
                          {c.config_name || c.name || `Config ${c.id}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3 as any}>
                  <FormControl fullWidth size="small">
                    <InputLabel>PD Method</InputLabel>
                    <Select
                      value={draftFilters.pdMethod}
                      label="PD Method"
                      onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, pdMethod: Number(e.target.value) }))}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value={1}>TTC</MenuItem>
                      <MenuItem value={2}>PIT</MenuItem>
                      <MenuItem value={3}>Hybrid</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3 as any}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(draftFilters.isForwardLooking)}
                        onChange={(e) => setDraftFilters((prev: any) => ({ ...prev, isForwardLooking: e.target.checked }))}
                      />
                    }
                    label={<Typography variant="body2" fontWeight={700}>Forward Looking</Typography>}
                    sx={{ height: '100%', alignItems: 'center' }}
                  />
                </Grid>

                <Grid item xs={12}>
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
                        <Grid item xs={12} sm={6} md={4 as any}>
                          <Autocomplete
                            multiple
                            size="small"
                            options={segments}
                            loading={loadingLookups}
                            getOptionLabel={(option) => option.segment || option.subSegment || option.groupSegment || String(option.id)}
                            isOptionEqualToValue={(o, v) => String(o.id) === String(v.id)}
                            value={draftFilters.selectedSegments}
                            onChange={(_, newValue) => setDraftFilters((prev: any) => ({ ...prev, selectedSegments: newValue }))}
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

                        <Grid item xs={12} sm={6} md={4 as any}>
                          <FormControl fullWidth size="small" disabled={!draftFilters.isForwardLooking}>
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

                        <Grid item xs={12} sm={6} md={4 as any}>
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
                            <Grid item xs={12} sm={6} md={4 as any}>
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

                            <Grid item xs={12} sm={6} md={4 as any}>
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

                            <Grid item xs={12} sm={6} md={4 as any}>
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
              <Button size="small" color="inherit" onClick={() => setConfigOpen(true)}>
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
        {!error && hasReportData ? (
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
        ) : null}
        
        <LifetimePDExportDialog 
            open={exportDialogOpen} 
            onClose={() => setExportDialogOpen(false)}
            onExport={handleExport}
        />

    </Box>
  );
};


export default LifetimePDReport;
