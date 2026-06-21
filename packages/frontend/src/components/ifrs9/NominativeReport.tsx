// packages/frontend/src/components/ifrs9/NominativeReport.tsx
'use client';

import React, { useCallback, useEffect, useState, useMemo, useRef } from 'react';
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Autocomplete from '@mui/material/Autocomplete'
import Stack from '@mui/material/Stack'
import IconButton from '@mui/material/IconButton'
import Skeleton from '@mui/material/Skeleton'
import Paper from '@mui/material/Paper'
import MenuItem from '@mui/material/MenuItem'
import InputAdornment from '@mui/material/InputAdornment'
import { alpha } from '@mui/material/styles'
import Checkbox from '@mui/material/Checkbox'
import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import AccountIcon from '@mui/icons-material/AccountBalance'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import WarningIcon from '@mui/icons-material/Warning'
import CheckIcon from '@mui/icons-material/CheckCircle'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import ExportIcon from '@mui/icons-material/FileDownload'
import PdfIcon from '@mui/icons-material/PictureAsPdf'
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ReportDataGrid } from './index';
import { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import { reportsAPI } from '../../services/api.reports';

interface FilterState {
  asOfDate: string;
  profitCenters: string[];
  branches: string[];
  stages: number[];
}

interface NominativeReportRow {
  pkid?: number | string;
  prc_date?: string;
  account_id?: number | string;
  account_number?: string;
  facility_number?: string;
  cif_number?: string;
  cif_name?: string;
  account_status?: string;
  branch_code?: string;
  prd_code?: string;
  start_date?: string;
  maturity_date?: string;
  currency?: string;
  interest_rate?: number | string;
  eff_interest_rate?: number | string;
  dpd?: number | string;
  impaired_status?: string;
  segment?: string;
  stage?: number | string;
  bucket_id?: number | string;
  outstanding?: number | string;
  ecl_final_amt?: number | string;
  ecl_coverage?: number | string;
  [key: string]: string | number | boolean | null | undefined;
}

interface NominativeAvailableDateRow {
  prc_date: string
  total_accounts: number
  total_outstanding: number
  total_ecl: number
}

type NominativeColumnConfig = {
  key: Extract<keyof NominativeReportRow, string>
  label: string
  width: number
  align?: 'left' | 'center' | 'right'
  headerAlign?: 'left' | 'center' | 'right'
  type?: 'currency' | 'date' | 'number' | 'percentage' | 'stage'
}

const getDefaultFilters = (): FilterState => ({
  asOfDate: new Date().toISOString().split('T')[0],
  profitCenters: [],
  branches: [],
  stages: [1, 2, 3]
});

const NOMINATIVE_OUTPUT_COLUMNS: NominativeColumnConfig[] = [
  { key: 'pkid', label: 'PKID', width: 110, type: 'number' as const },
  { key: 'prc_date', label: 'PRC Date', width: 130, type: 'date' as const },
  { key: 'account_id', label: 'Account ID', width: 120, type: 'number' as const },
  { key: 'account_number', label: 'Account Number', width: 160 },
  { key: 'facility_number', label: 'Facility Number', width: 160 },
  { key: 'cif_number', label: 'CIF Number', width: 140 },
  { key: 'cif_name', label: 'CIF Name', width: 220 },
  { key: 'account_status', label: 'Account Status', width: 130 },
  { key: 'branch_code', label: 'Branch Code', width: 130 },
  { key: 'prd_code', label: 'Product Code', width: 130 },
  { key: 'start_date', label: 'Start Date', width: 130, type: 'date' as const },
  { key: 'maturity_date', label: 'Maturity Date', width: 130, type: 'date' as const },
  { key: 'currency', label: 'Currency', width: 100 },
  { key: 'interest_rate', label: 'Interest Rate', width: 130, align: 'right' as const, headerAlign: 'right' as const, type: 'percentage' as const },
  { key: 'eff_interest_rate', label: 'Effective Interest Rate', width: 170, align: 'right' as const, headerAlign: 'right' as const, type: 'percentage' as const },
  { key: 'dpd', label: 'DPD', width: 100, align: 'right' as const, headerAlign: 'right' as const, type: 'number' as const },
  { key: 'impaired_status', label: 'Impaired Status', width: 140 },
  { key: 'segment', label: 'Segment', width: 160 },
  { key: 'stage', label: 'Stage', width: 110, align: 'center' as const, headerAlign: 'center' as const, type: 'stage' as const },
  { key: 'bucket_id', label: 'Bucket ID', width: 120, align: 'center' as const, headerAlign: 'center' as const, type: 'number' as const },
  { key: 'outstanding', label: 'Outstanding', width: 180, align: 'right' as const, headerAlign: 'right' as const, type: 'currency' as const },
  { key: 'ecl_final_amt', label: 'ECL Final Amount', width: 180, align: 'right' as const, headerAlign: 'right' as const, type: 'currency' as const },
  { key: 'ecl_coverage', label: 'ECL Coverage', width: 140, align: 'right' as const, headerAlign: 'right' as const, type: 'percentage' as const },
];

const NominativeReport: React.FC = () => {
  // Summary statistics state
  const [summaryStats, setSummaryStats] = useState({
    totalAccounts: 0,
    stage1Count: 0,
    stage2Count: 0,
    stage3Count: 0,
    totalECL: 0,
    totalOutstanding: 0
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>(() => getDefaultFilters());
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(() => getDefaultFilters());

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NominativeReportRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 20,
    page: 0,
  });

  // UI State
  const [quickSearch, setQuickSearch] = useState('');
  const [effectivePrcDate, setEffectivePrcDate] = useState<string | null>(null);
  const [availableDates, setAvailableDates] = useState<NominativeAvailableDateRow[]>([])
  const [availableDatesLoading, setAvailableDatesLoading] = useState(false)
  const [autoSnapshot, setAutoSnapshot] = useState<{ from: string; to: string; direction: 'before_or_equal' | 'after' | 'unknown' } | null>(null)
  const latestFetchRef = useRef(0)
  const skipNextAutoFetchRef = useRef(false)

  useEffect(() => {
    const fetchDefaultProcessingDate = async () => {
      try {
        const response = await reportsAPI.getProcessingDate();
        if (response?.data?.prc_date) {
          setFilters(prev => ({ ...prev, asOfDate: response.data.prc_date }));
        }
      } catch (error) {
        console.error('Error fetching processing date:', error);
      }
    };
    fetchDefaultProcessingDate();
  }, []);

  const monthLabels = useMemo(
    () => ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
    [],
  )

  const availableYearMonthSummary = useMemo(() => {
    if (!availableDates.length) return []

    const yearMap = new Map<number, number[]>()
    for (const row of availableDates) {
      const dateStr = String(row?.prc_date || '').slice(0, 10)
      const [yStr, mStr] = dateStr.split('-')
      const y = Number(yStr)
      const m = Number(mStr)
      if (!Number.isFinite(y) || !Number.isFinite(m) || m < 1 || m > 12) continue

      const months = yearMap.get(y) || []
      if (!months.includes(m)) months.push(m)
      yearMap.set(y, months)
    }

    const compressMonths = (months: number[]) => {
      const sorted = [...months].sort((a, b) => a - b)
      const parts: string[] = []
      let start = sorted[0]
      let prev = sorted[0]
      for (let i = 1; i < sorted.length; i += 1) {
        const cur = sorted[i]
        if (cur === prev + 1) {
          prev = cur
          continue
        }
        parts.push(start === prev ? monthLabels[start - 1] : `${monthLabels[start - 1]}–${monthLabels[prev - 1]}`)
        start = cur
        prev = cur
      }
      parts.push(start === prev ? monthLabels[start - 1] : `${monthLabels[start - 1]}–${monthLabels[prev - 1]}`)
      return parts.join(', ')
    }

    return Array.from(yearMap.entries())
      .map(([year, months]) => ({
        year,
        monthsText: compressMonths(months),
        monthCount: months.length,
      }))
      .sort((a, b) => b.year - a.year)
  }, [availableDates, monthLabels])

  const columns = NOMINATIVE_OUTPUT_COLUMNS;

  const profitCenterOptions = useMemo(
    () => Array.from(new Set(
      data
        .map((row) => row.segment)
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
    )).sort(),
    [data],
  );
  const branchOptions = useMemo(
    () => Array.from(new Set(
      data
        .map((row) => row.branch_code)
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
    )).sort(),
    [data],
  );

  // Handle Search / Fetch Data
  const fetchData = useCallback(async (nextFilters: FilterState, nextPaginationModel: GridPaginationModel) => {
    const fetchId = ++latestFetchRef.current
    setLoading(true);
    try {
      // 1. Fetch Nominative Report Data (Paginated)
      const tableParams: Record<string, string | number | string[] | undefined> = {
        prc_date: nextFilters.asOfDate,
        page: nextPaginationModel.page + 1,
        limit: nextPaginationModel.pageSize,
        segment: nextFilters.profitCenters.length > 0 ? nextFilters.profitCenters : undefined,
        branch_code: nextFilters.branches.length > 0 ? nextFilters.branches : undefined
      };
      
      // Add stage filter if specific stages are selected (API supports single stage value usually, or we filter client side if multiple?)
      // The backend controller supports `stage` param.
      // If multiple stages are selected in UI, and backend only supports one, we might need to adjust.
      // For now, let's send the first one if only one is selected, or don't send if all are selected.
      if (nextFilters.stages.length > 0 && nextFilters.stages.length < 3) {
        tableParams.stage = nextFilters.stages.map((stage) => String(stage));
      }

      const tableResponse = await reportsAPI.nominativeReport.get(tableParams);
      
      if (fetchId !== latestFetchRef.current) return

      if (tableResponse.success) {
        setData(tableResponse.data);
        const total = tableResponse.pagination ? tableResponse.pagination.total : tableResponse.data.length;
        setTotalRows(total);
        setEffectivePrcDate(tableResponse.effectivePrcDate ?? null);

        // Update Summary Stats from API Response (Dynamic based on filters)
        if (tableResponse.summary) {
            setSummaryStats({
                totalAccounts: total,
                stage1Count: 0, // Not available in summary yet
                stage2Count: 0,
                stage3Count: 0,
                totalECL: tableResponse.summary.totalECL,
                totalOutstanding: tableResponse.summary.totalOutstanding
            });
        } else {
            setSummaryStats({
                totalAccounts: total,
                stage1Count: 0,
                stage2Count: 0,
                stage3Count: 0,
                totalECL: 0,
                totalOutstanding: 0
            });
        }
      } else {
        setData([]);
        setTotalRows(0);
        setSummaryStats({
          totalAccounts: 0,
          stage1Count: 0,
          stage2Count: 0,
          stage3Count: 0,
          totalECL: 0,
          totalOutstanding: 0
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Optional: Show notification to user
      if (fetchId !== latestFetchRef.current) return
      setData([]);
      setTotalRows(0);
      setSummaryStats({
        totalAccounts: 0,
        stage1Count: 0,
        stage2Count: 0,
        stage3Count: 0,
        totalECL: 0,
        totalOutstanding: 0
      })
    } finally {
      if (fetchId === latestFetchRef.current) setLoading(false);
    }
  }, []);

  const fetchAvailableDates = useCallback(async () => {
    setAvailableDatesLoading(true)
    try {
      const response = await reportsAPI.nominativeReport.getAvailableDates({ limit: 120 })

      const rows: NominativeAvailableDateRow[] = Array.isArray(response?.data) ? response.data : []
      setAvailableDates(rows)
    } catch (error) {
      console.error('Error fetching available dates:', error)
      setAvailableDates([])
    } finally {
      setAvailableDatesLoading(false)
    }
  }, [])

  const resolveNearestSnapshotDate = useCallback((requested: string, rows: NominativeAvailableDateRow[]) => {
    if (!rows.length) return null
    const normalized = String(requested || '').slice(0, 10)
    const sortedDesc = [...rows].sort((a, b) => String(b.prc_date).localeCompare(String(a.prc_date)))
    const direct = sortedDesc.find((r) => String(r.prc_date).slice(0, 10) === normalized)
    if (direct) return direct.prc_date

    const requestedTs = Date.parse(normalized)
    if (!Number.isFinite(requestedTs)) return sortedDesc[0]?.prc_date ?? null

    let best = sortedDesc[0]
    let bestDiff = Infinity
    let bestIsBefore = false

    for (const candidate of sortedDesc) {
      const candDate = String(candidate.prc_date).slice(0, 10)
      const candTs = Date.parse(candDate)
      if (!Number.isFinite(candTs)) continue

      const diff = Math.abs(candTs - requestedTs)
      const isBeforeOrEqual = candTs <= requestedTs
      const isBetter =
        diff < bestDiff ||
        (diff === bestDiff && isBeforeOrEqual && !bestIsBefore)

      if (isBetter) {
        best = candidate
        bestDiff = diff
        bestIsBefore = isBeforeOrEqual
      }
    }

    return best?.prc_date ?? null
  }, [])

  useEffect(() => {
    if (!availableDates.length) return
    const normalized = String(filters.asOfDate || '').slice(0, 10)
    const hasExact = availableDates.some((d) => String(d.prc_date).slice(0, 10) === normalized)

    if (hasExact) {
      setAutoSnapshot((prev) => (prev && prev.to === normalized ? prev : null))
      return
    }

    const resolved = resolveNearestSnapshotDate(normalized, availableDates)
    if (!resolved || String(resolved).slice(0, 10) === normalized) return

    const resolvedNorm = String(resolved).slice(0, 10)
    const direction = resolvedNorm <= normalized ? 'before_or_equal' : 'after'
    setAutoSnapshot({ from: normalized, to: resolvedNorm, direction })
  }, [availableDates, filters.asOfDate, resolveNearestSnapshotDate])

  const handleSearch = useCallback(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setAppliedFilters(filters);
  }, [filters]);

  const filterSignature = useMemo(() => {
    return [
      filters.asOfDate,
      filters.profitCenters.join('|'),
      filters.branches.join('|'),
      filters.stages.join('|'),
    ].join('::')
  }, [filters])

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setPaginationModel((prev) => (prev.page === 0 ? prev : { ...prev, page: 0 }))
      setAppliedFilters(filters)
    }, 600)

    return () => window.clearTimeout(timeout)
  }, [filterSignature, filters])

  useEffect(() => {
    if (skipNextAutoFetchRef.current) {
      skipNextAutoFetchRef.current = false
      return
    }
    fetchData(appliedFilters, paginationModel);
  }, [fetchData, appliedFilters, paginationModel.page, paginationModel.pageSize]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchAvailableDates()
    }, 600)

    return () => window.clearTimeout(timeout)
  }, [fetchAvailableDates])

  // Handle Clear
  const handleClear = useCallback(() => {
    const nextFilters = getDefaultFilters();
    const nextPagination = { pageSize: 20, page: 0 };
    setFilters(nextFilters);
    setAppliedFilters(nextFilters);
    setEffectivePrcDate(null);
    setQuickSearch('');
    setPaginationModel(nextPagination);
  }, []);

  // Handle Export to Excel
  const handleExportExcel = useCallback(async () => {
    const exportClientSide = () => {
      const exportData = data.map((row) =>
        Object.fromEntries(
          columns.map((col) => {
            const raw = row[col.key];
            // Percentage: format with comma decimal separator + '%' (Indonesian locale)
            if (col.type === 'percentage') {
              const num = typeof raw === 'string' ? parseFloat(raw.replace(/,/g, '')) : Number(raw);
              if (!Number.isNaN(num)) return [col.label, (num * 100).toFixed(2).replace('.', ',') + '%'];
              return [col.label, raw];
            }
            // Currency: format as IDR with comma decimal separator
            if (col.type === 'currency') {
              const num = typeof raw === 'string' ? parseFloat(raw.replace(/,/g, '')) : Number(raw);
              if (!Number.isNaN(num)) return [col.label, num];
              return [col.label, raw];
            }
            // Number / Stage: keep as raw number for Excel
            if (col.type === 'number' || col.type === 'stage') {
              const num = typeof raw === 'string' ? parseFloat(raw.replace(/,/g, '')) : Number(raw);
              if (!Number.isNaN(num)) return [col.label, num];
            }
            return [col.label, raw];
          })
        )
      );

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Nominative Report');
      XLSX.writeFile(wb, `Nominative_Report_Page_${effectivePrcDate ?? appliedFilters.asOfDate}.xlsx`);
    };

    try {
        setLoading(true);
        const params = {
          prc_date: effectivePrcDate ?? appliedFilters.asOfDate,
          segment: appliedFilters.profitCenters.length > 0 ? appliedFilters.profitCenters : undefined,
          branch_code: appliedFilters.branches.length > 0 ? appliedFilters.branches : undefined,
          stage: appliedFilters.stages.length > 0 ? appliedFilters.stages.map((s) => String(s)) : undefined,
          format: 'xlsx',
        };

        const response = await reportsAPI.export('nominative-report', params);

        const contentType = String(response.headers?.['content-type'] ?? '').toLowerCase();
        const isExcelPayload =
          contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
          contentType.includes('application/octet-stream');

        if (response.status === 200 && response.data && isExcelPayload) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Nominative_Report_${effectivePrcDate ?? appliedFilters.asOfDate}.xlsx`);
          document.body.appendChild(link);
          link.click();
          link.parentNode?.removeChild(link);
        } else {
          exportClientSide();
        }
    } catch (error) {
      console.error('❌ Export failed:', error);
      exportClientSide();
    } finally {
        setLoading(false);
    }
  }, [data, effectivePrcDate, appliedFilters]);

  const formatCurrency = useCallback((value: unknown) => {
    const numeric = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, ''))
    if (!Number.isFinite(numeric)) return String(value ?? '')
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(numeric)
  }, [])

  const handleExportPdf = useCallback(async () => {
    try {
      setLoading(true)

      const maxRows = 1500
      const pageSize = Math.min(Math.max(totalRows || 0, 1), maxRows)

      const params: Record<string, string | number | string[] | undefined> = {
        prc_date: effectivePrcDate ?? appliedFilters.asOfDate,
        page: 1,
        limit: pageSize,
        segment: appliedFilters.profitCenters.length > 0 ? appliedFilters.profitCenters : undefined,
        branch_code: appliedFilters.branches.length > 0 ? appliedFilters.branches : undefined,
        stage: appliedFilters.stages.length > 0 ? appliedFilters.stages.map((s) => String(s)) : undefined,
      }

      const tableResponse = await reportsAPI.nominativeReport.get(params)
      const rows: NominativeReportRow[] = Array.isArray(tableResponse?.data) ? tableResponse.data : []

      const [{ jsPDF }, autoTableModule] = await Promise.all([
        import('jspdf'),
        import('jspdf-autotable'),
      ])

      const autoTable = (autoTableModule as any).default || (autoTableModule as any)
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

      const reportDate = effectivePrcDate ?? appliedFilters.asOfDate
      const generatedAt = new Date().toISOString().replace('T', ' ').slice(0, 19)

      const filterParts = [
        `As of: ${reportDate}`,
        appliedFilters.stages?.length ? `Stages: ${appliedFilters.stages.join(', ')}` : undefined,
        appliedFilters.profitCenters?.length ? `Segment: ${appliedFilters.profitCenters.join(', ')}` : undefined,
        appliedFilters.branches?.length ? `Branch: ${appliedFilters.branches.join(', ')}` : undefined,
      ].filter(Boolean)

      const metaLeft = [
        'IFRS 9 Nominative Report',
        filterParts.join(' | '),
        `Generated: ${generatedAt}`,
      ]

      const metaRight = [
        `Total Accounts: ${Number(summaryStats.totalAccounts || 0).toLocaleString('id-ID')}`,
        `Outstanding: ${formatCurrency(summaryStats.totalOutstanding)}`,
        `Total ECL: ${formatCurrency(summaryStats.totalECL)}`,
        totalRows > maxRows ? `Rows: first ${maxRows.toLocaleString('id-ID')} of ${Number(totalRows).toLocaleString('id-ID')}` : `Rows: ${rows.length.toLocaleString('id-ID')}`,
      ]

      const head = [columns.map((col) => col.label)]

      const body = rows.map((row) =>
        columns.map((col) => row[col.key] ?? '')
      )

      autoTable(doc, {
        head,
        body,
        startY: 84,
        margin: { top: 72, left: 32, right: 32, bottom: 36 },
        styles: { fontSize: 7, cellPadding: 3, overflow: 'linebreak' },
        headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: Object.fromEntries(
          columns.map((col, index) => [
            index,
            {
              halign: col.align ?? 'left',
            },
          ])
        ),
        didDrawPage: (dataArg: any) => {
          const pageWidth = doc.internal.pageSize.getWidth()

          doc.setFontSize(14)
          doc.setTextColor(17, 24, 39)
          doc.text(metaLeft[0], 32, 32)

          doc.setFontSize(9)
          doc.setTextColor(71, 85, 105)
          doc.text(metaLeft[1], 32, 48, { maxWidth: pageWidth - 64 })
          doc.text(metaLeft[2], 32, 62)

          doc.setFontSize(9)
          doc.setTextColor(17, 24, 39)
          const rightX = pageWidth - 32
          doc.text(metaRight[0], rightX, 32, { align: 'right' })
          doc.text(metaRight[1], rightX, 46, { align: 'right' })
          doc.text(metaRight[2], rightX, 60, { align: 'right' })
          doc.setTextColor(71, 85, 105)
          doc.text(metaRight[3], rightX, 74, { align: 'right' })

          const pageNumber = doc.getCurrentPageInfo().pageNumber
          const totalPages = doc.getNumberOfPages()
          doc.setFontSize(9)
          doc.setTextColor(100)
          doc.text(`Page ${pageNumber} / ${totalPages}`, rightX, doc.internal.pageSize.getHeight() - 18, { align: 'right' })
        },
      })

      doc.save(`Nominative_Report_${reportDate}.pdf`)
    } catch (error) {
      console.error('❌ PDF export failed:', error)
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, effectivePrcDate, formatCurrency, summaryStats, totalRows])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear filters
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
      // Ctrl/Cmd + E for export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportExcel();
      }
      // Ctrl/Cmd + F for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('quick-search-input');
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClear, handleExportExcel]);

  // Filter data based on quick search (Client-side usage on top of current page)
  const filteredData = useMemo(() => {
    if (!quickSearch.trim()) return data;

    const searchTerm = quickSearch.toLowerCase().trim();
    return data.filter(row => 
      Object.values(row).some((value) =>
        String(value ?? '').toLowerCase().includes(searchTerm)
      )
    );
  }, [data, quickSearch]);

  const kpiStats = useMemo(() => {
    const hasQuickSearch = Boolean(quickSearch.trim())
    if (!hasQuickSearch) return summaryStats

    const toNumber = (value: unknown) => {
      const numeric = typeof value === 'number' ? value : Number(String(value ?? '').replace(/,/g, ''))
      return Number.isFinite(numeric) ? numeric : 0
    }

    const totalOutstanding = filteredData.reduce((sum, row) => sum + toNumber(row.outstanding), 0)
    const totalECL = filteredData.reduce((sum, row) => sum + toNumber(row.ecl_final_amt), 0)

    return {
      ...summaryStats,
      totalAccounts: filteredData.length,
      totalOutstanding,
      totalECL,
    }
  }, [filteredData, quickSearch, summaryStats])

  const mapEclRatio = () => {
      if (kpiStats.totalOutstanding > 0) {
          return (kpiStats.totalECL / kpiStats.totalOutstanding) * 100;
      }
      return 0;
  }

  const iconOnlyButtonSx = {
    width: 46,
    height: 46,
    minWidth: 46,
    borderRadius: 3,
    padding: 0,
    '& .MuiButton-startIcon': {
      margin: 0,
    },
    '& .MuiButton-startIcon > *:nth-of-type(1)': {
      fontSize: 22,
    },
  } as const

  return (
    <Box>
      {/* Summary Cards - Enhanced with Gradients */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: quickSearch.trim() ? 'Displayed Accounts' : 'Total Accounts',
            value: kpiStats.totalAccounts,
            icon: <AccountIcon sx={{ fontSize: 28 }} />,
            color: 'primary',
            mainColor: '#2563eb',
            gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            bgGradient: 'linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%)',
            format: (v: number) => v.toLocaleString()
          },
          {
            title: 'Outstanding Exposure',
            value: kpiStats.totalOutstanding,
            icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
            color: 'success',
            mainColor: '#059669',
            gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            format: (v: number) => new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(v)
          },
          {
            title: 'Total ECL Amount',
            value: kpiStats.totalECL,
            icon: <WarningIcon sx={{ fontSize: 28 }} />,
            color: 'error',
            mainColor: '#dc2626',
            gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            format: (v: number) => new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(v)
          },
          {
            title: 'Final ECL Ratio',
            value: mapEclRatio(),
            icon: <CheckIcon sx={{ fontSize: 28 }} />,
            color: 'info',
            mainColor: '#0891b2',
            gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
            format: (v: number) => `${v.toFixed(2)}%`
          }
        ].map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              background: item.bgGradient,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.05)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
              }
            }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: 2, 
                    background: item.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: `0 4px 12px ${alpha(item.mainColor, 0.3)}`,
                    mr: 2
                  }}>
                    {item.icon}
                  </Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 700,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.75rem'
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'text.primary',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {loading ? <Skeleton width={120} /> : item.format(item.value)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Panel - Enhanced Design */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: 4, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
        }}
      >
        <Box 
          sx={{ 
            px: 3,
            py: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SearchIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5 }}>Filter Options</Typography>
            {(filters.profitCenters.length > 0 || filters.branches.length > 0) && (
              <Chip 
                label={`${filters.profitCenters.length + filters.branches.length} active`} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)'
                }} 
              />
            )}
          </Stack>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Primary Filters (Always Visible) */}
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <DatePicker
                  label="Processing Date"
                  value={new Date(filters.asOfDate)}
                  onChange={(newValue) => {
                    if (newValue) {
                      setFilters(prev => ({ ...prev, asOfDate: newValue.toISOString().split('T')[0] }));
                    }
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      size: 'small',
                    }
                  }}
                />
              </FormControl>
              <Autocomplete
                options={availableDates}
                loading={availableDatesLoading}
                size="small"
                sx={{ mt: 1 }}
                getOptionLabel={(option) => {
                  const total = Number(option.total_accounts || 0).toLocaleString('id-ID')
                  return `${option.prc_date} (${total} rows)`
                }}
                onChange={(_, option) => {
                  if (option?.prc_date) {
                    setAutoSnapshot(null)
                    setFilters(prev => ({ ...prev, asOfDate: option.prc_date }))
                  }
                }}
                renderInput={(params: AutocompleteRenderInputParams) => (
                  <TextField
                    {...params}
                    label="Available Snapshots"
                    placeholder="Pick a date with data"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {availableDatesLoading ? <Skeleton variant="circular" width={16} height={16} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              {availableYearMonthSummary.length > 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
                  Data tersedia: {availableYearMonthSummary.map((y) => `${y.year} (${y.monthsText})`).join(' • ')}
                </Typography>
              ) : null}
              {autoSnapshot ? (
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{ mt: 1, py: 0.5, '& .MuiAlert-message': { fontSize: 12 } }}
                >
                  As-of Date {autoSnapshot.from} tidak memiliki snapshot. Snapshot terdekat {autoSnapshot.direction === 'before_or_equal' ? 'sebelum/di tanggal' : 'setelah tanggal'}: {autoSnapshot.to}.
                </Alert>
              ) : null}
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Stage</InputLabel>
                <Select
                  multiple
                  value={filters.stages}
                  onChange={(e) => {
                    const raw = (e.target as any).value
                    const values = Array.isArray(raw) ? raw : String(raw ?? '').split(',')
                    const parsed = values
                      .map((v: any) => Number(String(v).trim()))
                      .filter((n: number) => Number.isInteger(n) && n >= 1 && n <= 3)
                    const nextStages = parsed.length > 0 ? parsed : [1, 2, 3]
                    const nextFilters = { ...filters, stages: nextStages }
                    setPaginationModel((prev) => ({ ...prev, page: 0 }))
                    setFilters(nextFilters)
                    setAppliedFilters(nextFilters)
                    skipNextAutoFetchRef.current = true
                    void fetchData(nextFilters, { page: 0, pageSize: paginationModel.pageSize })
                  }}
                  label="Stage"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {((selected as number[])?.length ?? 0) >= 3 ? (
                        <Chip label="All Stages" size="small" sx={{ height: 24 }} />
                      ) : (
                        (selected as number[]).map((value) => (
                          <Chip
                            key={value}
                            label={`Stage ${value}`}
                            size="small"
                            color={value === 1 ? 'success' : value === 2 ? 'warning' : 'error'}
                            sx={{ height: 24 }}
                          />
                        ))
                      )}
                    </Box>
                  )}
                >
                  <MenuItem value={1}>
                    <Checkbox checked={filters.stages.includes(1)} />
                    Stage 1
                  </MenuItem>
                  <MenuItem value={2}>
                    <Checkbox checked={filters.stages.includes(2)} />
                    Stage 2
                  </MenuItem>
                  <MenuItem value={3}>
                    <Checkbox checked={filters.stages.includes(3)} />
                    Stage 3
                  </MenuItem>
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Jika semua stage tercentang berarti tidak memfilter (All Stages). Untuk memfilter, sisakan stage yang diinginkan saja.
                </Typography>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
               <Stack
                 direction="row"
                 sx={{
                   flexWrap: 'wrap',
                   justifyContent: { xs: 'flex-start', md: 'flex-end' },
                   gap: 1,
                 }}
               >
                  <Button 
                    variant="contained" 
                    startIcon={<SearchIcon />} 
                    onClick={handleSearch}
                    disabled={loading}
                    sx={{ 
                      ...iconOnlyButtonSx,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    aria-label="Search"
                    title="Search"
                  >
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={handleExportExcel}
                    disabled={loading}
                    sx={{
                      ...iconOnlyButtonSx,
                      borderWidth: 1.5,
                      fontWeight: 600,
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: '#1565c0',
                        bgcolor: alpha('#1976d2', 0.04),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                    aria-label="Export Excel"
                    title="Export Excel"
                  >
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PdfIcon />}
                    onClick={handleExportPdf}
                    disabled={loading}
                    sx={{
                      ...iconOnlyButtonSx,
                      borderWidth: 1.5,
                      fontWeight: 600,
                      borderColor: '#ef4444',
                      color: '#ef4444',
                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: '#dc2626',
                        bgcolor: alpha('#ef4444', 0.04),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                    aria-label="Export PDF"
                    title="Export PDF"
                  >
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleClear}
                    startIcon={<ClearIcon />}
                    sx={{
                      ...iconOnlyButtonSx,
                      borderWidth: 1.5,
                      fontWeight: 600,
                      borderColor: 'rgba(2, 6, 23, 0.25)',
                      color: '#0f172a',
                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: 'rgba(2, 6, 23, 0.4)',
                        bgcolor: alpha('#0f172a', 0.04),
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    aria-label="Clear"
                    title="Clear"
                  >
                  </Button>
               </Stack>
            </Grid>

            {/* Advanced Filters */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                      multiple
                      freeSolo
                      disableCloseOnSelect
                      size="small"
                      options={profitCenterOptions}
                      value={filters.profitCenters}
                      onChange={(_, newValue) => {
                        const nextValue = newValue
                          .map((v) => String(v).trim())
                          .filter((v) => v.length > 0);
                        setFilters(prev => ({ ...prev, profitCenters: nextValue }));
                      }}
                      renderInput={(params: AutocompleteRenderInputParams) => (
                        <TextField
                          {...params}
                          label="Segment"
                          placeholder={filters.profitCenters.length === 0 ? 'Select or type...' : ''}
                        />
                      )}
                      renderOption={(props, option, { selected }) => {
                        const { key, ...otherProps } = props;
                        return (
                          <li key={key} {...otherProps}>
                            <Checkbox
                              size="small"
                              style={{ marginRight: 8 }}
                              checked={selected}
                            />
                            {option}
                          </li>
                        );
                      }}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => {
                          const { key, ...tagProps } = getTagProps({ index });
                          return (
                            <Chip
                              label={option}
                              size="small"
                              {...tagProps}
                              key={key}
                              sx={{
                                bgcolor: alpha('#2563eb', 0.1),
                                color: '#2563eb',
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: alpha('#2563eb', 0.2)
                              }}
                            />
                          );
                        })
                      }
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    freeSolo
                    disableCloseOnSelect
                    size="small"
                    options={branchOptions}
                    value={filters.branches}
                    onChange={(_, newValue) => {
                      const nextValue = newValue
                        .map((v) => String(v).trim())
                        .filter((v) => v.length > 0);
                      setFilters(prev => ({ ...prev, branches: nextValue }));
                    }}
                    renderInput={(params: AutocompleteRenderInputParams) => (
                      <TextField 
                        {...params} 
                        label="Branch Code" 
                        placeholder={filters.branches.length === 0 ? "Select branches..." : ""}
                      />
                    )}
                    renderOption={(props, option, { selected }) => {
                      const { key, ...otherProps } = props;
                      return (
                        <li key={key} {...otherProps}>
                          <Checkbox
                            size="small"
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option}
                        </li>
                      );
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                         const { key, ...tagProps } = getTagProps({ index });
                         return (
                           <Chip 
                            label={option} 
                            size="small" 
                            {...tagProps} 
                            key={key}
                            sx={{
                              bgcolor: alpha('#059669', 0.1),
                              color: '#059669',
                              fontWeight: 600,
                              border: '1px solid',
                              borderColor: alpha('#059669', 0.2)
                            }}
                          />
                         );
                      })
                    }
                  />
                </Grid>

            {effectivePrcDate && effectivePrcDate !== filters.asOfDate && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" color="text.secondary">
                  Snapshot used: <strong>{effectivePrcDate}</strong> (snapshot yang tersedia paling dekat dengan Processing Date yang dipilih)
                </Typography>
              </Grid>
            )}


            {/* Active Filter Chips */}
            {(filters.profitCenters.length > 0 || filters.branches.length > 0) && (
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1, lineHeight: '24px' }}>
                    Active Filters:
                  </Typography>
                  {filters.profitCenters.map((pc) => (
                    <Chip
                      key={`pc-${pc}`}
                      label={`Segment: ${pc}`}
                      size="small"
                      onDelete={() => setFilters(prev => ({
                        ...prev,
                        profitCenters: prev.profitCenters.filter(p => p !== pc)
                      }))}
                    />
                  ))}
                  {filters.branches.map((br) => (
                    <Chip
                      key={`br-${br}`}
                      label={`Branch: ${br}`}
                      size="small"
                      onDelete={() => setFilters(prev => ({
                        ...prev,
                        branches: prev.branches.filter(b => b !== br)
                      }))}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Paper>

      {/* Stage Distribution - Hidden for now as we don't have exact counts */}
      {/* 
      <Card sx={{ mb: 3 }}>
        <CardContent>
          ...
        </CardContent>
      </Card> 
      */}

      {/* Quick Search - Enhanced */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          id="quick-search-input"
          fullWidth
          size="medium"
          placeholder="🔍 Quick search in current page... (Ctrl+F)"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
            endAdornment: quickSearch && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setQuickSearch('')}
                  edge="end"
                  sx={{
                    '&:hover': {
                      bgcolor: 'error.lighter',
                      color: 'error.main'
                    }
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              },
              '&.Mui-focused': {
                boxShadow: '0 6px 24px rgba(25, 118, 210, 0.2)'
              }
            }
          }}
        />
        {quickSearch && (
          <Chip
            label={`${filteredData.length} matches`}
            color="primary"
            sx={{
              fontWeight: 600,
              px: 1,
              background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)'
            }}
          />
        )}
      </Box>

      {quickSearch && filteredData.length === 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
          No matching nominative records were found for the current keyword on this page.
        </Alert>
      )}

      {/* Data Grid - Enhanced */}
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              Contract Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalRows.toLocaleString()} total records
            </Typography>
          </Box>
          <Chip
            label={loading ? 'Loading...' : `${filteredData.length} on this page`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
        <Box sx={{ width: '100%' }}>
          <ReportDataGrid
            rows={filteredData}
            getRowId={(row) => row.pkid ?? row.id ?? `${row.account_id ?? 'row'}-${row.account_number ?? ''}-${row.facility_number ?? ''}`}
            columns={columns
              .map(col => {
                const baseCol: GridColDef = {
                  field: col.key,
                  headerName: col.label,
                  width: col.width || 150,
                  sortable: true,
                  align: col.align || 'left',
                  headerAlign: (col.headerAlign ?? 'left') as 'left' | 'center' | 'right'
                };

                if (col.type === 'currency') {
                  return {
                    ...baseCol,
                    valueFormatter: (value: number | null | undefined) => {
                      if (value == null) return '';
                      return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(value);
                    }
                  };
                }

                if (col.type === 'percentage') {
                  return {
                    ...baseCol,
                    valueFormatter: (value: number | string | null | undefined) => {
                      if (value == null || value === '') return '';
                      const numericValue = Number(value);
                      return Number.isFinite(numericValue) ? `${numericValue.toFixed(2)}%` : String(value);
                    }
                  };
                }

                if (col.type === 'stage') {
                  return {
                    ...baseCol,
                    width: 100,
                    renderCell: (params: GridRenderCellParams<NominativeReportRow, number>) => (
                      <Chip
                        label={`Stage ${params.value}`}
                        size="small"
                        color={params.value == 1 ? 'success' : params.value == 2 ? 'warning' : 'error'}
                      />
                    )
                  };
                }

                if (col.type === 'date' || col.key.includes('date')) {
                  return {
                    ...baseCol,
                    valueFormatter: (value: string | null | undefined) => {
                      if (!value) return '';
                      return new Date(value).toLocaleDateString('id-ID');
                    }
                  };
                }

                return baseCol;
              })}
            loading={loading}
            pageSizeOptions={[10, 20, 50, 100]}
            checkboxSelection
            density="comfortable"
            rowCount={totalRows}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            height={600}
          />
        </Box>
      </Paper>

    </Box>
  );
};

export default NominativeReport;
