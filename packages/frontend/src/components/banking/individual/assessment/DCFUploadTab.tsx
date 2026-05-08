// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Container, Paper, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, Chip, Alert, Snackbar, Breadcrumbs,
  Link, LinearProgress, List, ListItem, ListItemText, ListItemIcon,
  Table, TableBody, TableCell, TableHead, TableRow, Divider, Stack,
  FormControl, InputLabel, Select, MenuItem, TextField, Grid, IconButton,
  Stepper, Step, StepLabel, Tooltip, Zoom, Fade, Card, CardContent, Avatar
} from '@mui/material';
import { GridColDef, GridToolbar } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';
import * as XLSX from 'xlsx';
import {
  CloudUpload as CloudUploadIcon,
  Home as HomeIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  Warning as WarningIcon,
  Send as SendIcon,
  Close as CloseIcon,
  TableChart as TableChartIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Calculate as CalculateIcon,
  Visibility as VisibilityIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  TrendingUp as TrendingUpIcon,
  History as HistoryIcon,
  AccountBalance as AccountBalanceIcon,
  Person as PersonIcon,
  Badge as BadgeIcon,
  Info as InfoIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';

import { useAssessmentWorkspaceEmbedded } from '@/app/banking/individual/assessment/embedded-context';
import { individualImpairmentAPI } from '@/services/api.individual-impairment';
import { approvalAPI } from '@/services/api/approval.api';
import { useAuth } from '@/providers/AuthProvider';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TEMPLATE DEFINITION â€” MUST match DCF_UPLOAD (1).xlsx exactly
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DCF_REQUIRED_COLUMNS = [
  'ACCOUNT_NUMBER',
  'PERIODE',
  'PRINCIPAL',
  'INTEREST',
  'COLLATERAL',
] as const;

const DCF_COLUMN_DESCRIPTIONS: Record<string, string> = {
  ACCOUNT_NUMBER: 'Nomor rekening nasabah (Harus sesuai dengan data sistem)',
  PERIODE:        'Tanggal periode cashflow (Gunakan interval bulanan, e.g., 2026-05-25)',
  PRINCIPAL:      'Jumlah pembayaran pokok (Angka >= 0)',
  INTEREST:       'Jumlah pembayaran bunga (Angka >= 0)',
  COLLATERAL:     'Nilai likuidasi agunan jika ada (Angka >= 0)',
};

type ParseResult =
  | { ok: true; rows: Record<string, any>[]; totalRows: number }
  | { ok: false; error: string; missingCols?: string[]; extraCols?: string[] };

// ——————————————————————————————————————————————————————————————————————————————————————————————————
// VALIDATION HELPER
// ——————————————————————————————————————————————————————————————————————————————————————————————————
function validateAndParseFile(file: File, expectedAccountNumber?: string): Promise<ParseResult> {
  return new Promise((resolve) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext ?? '')) {
      return resolve({ ok: false, error: 'Format file tidak didukung. Gunakan .xlsx, .xls, atau .csv.' });
    }

    const reader = new FileReader();
    reader.onerror = () => resolve({ ok: false, error: 'Gagal membaca file.' });
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const allRows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });

        if (allRows.length === 0) {
          return resolve({ ok: false, error: 'File kosong — tidak ada data.' });
        }

        // Header row
        const headerRow = (allRows[0] as string[]).map((h) => String(h ?? '').trim().toUpperCase());

        // 1. Strict Column Check
        const missing = DCF_REQUIRED_COLUMNS.filter((c) => !headerRow.includes(c));
        if (missing.length > 0) {
          return resolve({
            ok: false,
            error: `Format tidak sesuai template. Kolom wajib berikut TIDAK DITEMUKAN: ${missing.join(', ')}`,
            missingCols: missing,
          });
        }

        // Parse data rows
        const dataRows = allRows.slice(1).filter((row: any[]) =>
          row.some((cell) => cell !== '' && cell !== null && cell !== undefined)
        );

        if (dataRows.length === 0) {
          return resolve({ ok: false, error: 'File tidak memiliki baris data (hanya header).' });
        }

        const rows: Record<string, any>[] = [];
        const errors: string[] = [];

        for (let i = 0; i < dataRows.length; i++) {
          const row = dataRows[i];
          const obj: Record<string, any> = {};
          headerRow.forEach((col, idx) => { obj[col] = row[idx]; });

          const rowNum = i + 2; // +1 for 0-index, +1 for header

          // 2. Data Validation
          // Account Number Match
          if (expectedAccountNumber) {
             const rowAcc = String(obj.ACCOUNT_NUMBER || '').trim();
             // Permissive match (ignore leading zeros)
             if (rowAcc.replace(/^0+/, '') !== expectedAccountNumber.replace(/^0+/, '')) {
                errors.push(`Baris ${rowNum}: Nomor rekening "${rowAcc}" tidak sesuai dengan akun yang sedang diproses (${expectedAccountNumber}).`);
             }
          }

          // Numeric validation
          ['PRINCIPAL', 'INTEREST', 'COLLATERAL'].forEach(col => {
            const val = Number(obj[col]);
            if (isNaN(val) || val < 0) {
              errors.push(`Baris ${rowNum}: Kolom ${col} harus berupa angka positif.`);
            }
          });

          // Date validation (basic check)
          if (!obj.PERIODE || isNaN(Date.parse(String(obj.PERIODE)))) {
             errors.push(`Baris ${rowNum}: Format kolom PERIODE tidak valid.`);
          }

          if (errors.length >= 5) break; // Limit errors shown
          rows.push(obj);
        }

        if (errors.length > 0) {
          return resolve({
            ok: false,
            error: `Validasi Data Gagal:\n${errors.join('\n')}${errors.length >= 5 ? '\n...dan kesalahan lainnya' : ''}`
          });
        }

        resolve({ ok: true, rows, totalRows: rows.length });
      } catch (err) {
        console.error('Parse error:', err);
        resolve({ ok: false, error: 'Gagal memproses file. Pastikan file menggunakan template yang benar.' });
      }
    };
    reader.readAsBinaryString(file);
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// TEMPLATE DOWNLOAD â€” serve the official DCF_UPLOAD (1).xlsx template file
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function downloadTemplate(accountNumber?: string) {
  const filename = `DCF_TEMPLATE_${accountNumber || 'SAMPLE'}.xlsx`;

  // Create sample data based on user instructions:
  // - Incremental one month
  // - Numbers >= 0
  const today = new Date();
  const sampleData = Array.from({ length: 6 }).map((_, i) => {
    const periodDate = new Date(today);
    periodDate.setMonth(today.getMonth() + i + 1);

    return {
      ACCOUNT_NUMBER: accountNumber || '1234567890',
      PERIODE: format(periodDate, 'yyyy-MM-dd'),
      PRINCIPAL: i === 5 ? 50000000 : 0, // Bullet payment at the end
      INTEREST: 500000,
      COLLATERAL: 0
    };
  });

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DCF Cashflows");

  // Auto-size columns
  const maxWidths = DCF_REQUIRED_COLUMNS.map(col => ({ wch: col.length + 5 }));
  ws['!cols'] = maxWidths;

  XLSX.writeFile(wb, filename);
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// COMPONENT
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export function DCFUploadTab({
  account,
  onUploadSuccess,
  onStagedDCF,
  onTabChange,
  initialAssumptions
}: {
  account: any,
  onUploadSuccess?: (rows: any[]) => void,
  onStagedDCF?: (data: any) => void,
  onTabChange?: (tabKey: string) => void,
  initialAssumptions?: any
}) {

  const { user }  = useAuth();

  const [historyRows, setHistoryRows]       = useState<any[]>([]);
  const [loading, setLoading]               = useState(false);
  const [submitting, setSubmitting]         = useState(false);
  const [snack, setSnack]                   = useState<{ msg: string; sev: 'success'|'error'|'warning'|'info' } | null>(null);

  // Scenario Setup State
  const [scenarioRateType, setScenarioRateType] = useState('possible_outcome');
  const [numScenarios, setNumScenarios]         = useState(3);
  const [scenariosProcessed, setScenariosProcessed] = useState(false);

  // Dialog & File state
  const [dialogOpen, setDialogOpen]         = useState(false);
  const [selectedFile, setSelectedFile]     = useState<File | null>(null);
  const [parseResult, setParseResult]       = useState<ParseResult | null>(null);
  const [parsing, setParsing]               = useState(false);

  // Detailed Scenario State
  const [scenarioNames, setScenarioNames]   = useState<string[]>(['Best', 'Normal', 'Worst']);
  const [outcomeRates, setOutcomeRates]     = useState<number[]>([25, 50, 25]);
  const [periods, setPeriods]               = useState<any[]>([
    { start: new Date(), end: new Date(), rates: [40, 50, 10] }
  ]);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);
  const [activeStep, setActiveStep]         = useState(initialAssumptions ? 1 : 0);

  // Initialize from initialAssumptions if provided
  useEffect(() => {
    if (initialAssumptions) {
      setOutcomeRates([
        initialAssumptions.poRate1,
        initialAssumptions.poRate2,
        initialAssumptions.poRate3
      ]);
      setPeriods([{
        start: new Date(),
        end: new Date(),
        rates: [
          initialAssumptions.rrRate1,
          initialAssumptions.rrRate2,
          initialAssumptions.rrRate3
        ]
      }]);
      setScenarioNames(['Base Case', 'Optimistic', 'Pessimistic']);
      setNumScenarios(3);
      setScenariosProcessed(true);
    }
  }, [initialAssumptions]);

  const steps = ['Setup Assumptions', 'Upload Template', 'Simulation Results'];

  // --- Process Scenarios Step ---
  const handleProcessScenarios = () => {
    // Sync names and rates to match the number of scenarios
    const names = ['Best', 'Normal', 'Worst', 'Crisis', 'Optimistic'];
    const newNames = Array.from({ length: numScenarios }).map((_, i) => scenarioNames[i] || names[i] || `Scenario ${i + 1}`);
    const newRates = Array.from({ length: numScenarios }).map((_, i) => outcomeRates[i] || (i === 0 ? 25 : (i === 1 ? 50 : 25 / (numScenarios - 2))));

    setScenarioNames(newNames);
    setOutcomeRates(newRates);

    // Update periods to have correct number of rates
    setPeriods(prev => prev.map(p => ({
      ...p,
      rates: Array.from({ length: numScenarios }).map((_, i) => p.rates[i] || 0)
    })));

    setScenariosProcessed(true);
    setSnack({ msg: 'Skenario valid. Silakan lengkapi detail repayment rate dan upload file DCF.', sev: 'success' });
  };

  const validateScenarios = () => {
    // 1. Validate Outcome Rates
    const totalOutcome = outcomeRates.reduce((acc, r) => acc + Number(r || 0), 0);
    if (totalOutcome !== 100) {
      setSnack({ msg: `Total Possible Outcome Rate harus tepat 100% (saat ini: ${totalOutcome}%)`, sev: 'error' });
      return false;
    }

    // 2. Validate Period Repayment Rates (Optional: check if any rate > 100 if that's a business rule, but they don't need to sum to 100 across scenarios)
    for (let i = 0; i < periods.length; i++) {
      for (let j = 0; j < periods[i].rates.length; j++) {
        if (Number(periods[i].rates[j]) < 0) {
          setSnack({ msg: `Repayment Rate pada periode ke-${i + 1} skenario ${scenarioNames[j]} tidak boleh negatif.`, sev: 'error' });
          return false;
        }
      }
    }

    return true;
  };

  const handleAddPeriod = () => {
    setPeriods([...periods, {
      start: new Date(),
      end: new Date(),
      rates: Array.from({ length: numScenarios }).map(() => 0)
    }]);
  };

  const handleRemovePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handlePeriodChange = (index: number, field: string, value: any, rateIndex?: number) => {
    const next = [...periods];
    if (rateIndex !== undefined) {
      next[index].rates[rateIndex] = Number(value);
    } else {
      next[index][field] = value;
    }
    setPeriods(next);
  };

  const handleSaveScenario = () => {
    if (validateScenarios()) {
      setActiveStep(1);
      setSnack({ msg: 'Scenario details saved. Please proceed with file upload.', sev: 'success' });
    }
  };

  const runSimulation = () => {
    if (!parseResult?.ok || !parseResult.rows) return;

    setLoading(true);
    // Simulate complex calculation
    setTimeout(() => {
      // Get EIR from account or default to 10%
      const annualRate = Number(account?.interest_rate || 10) / 100;
      const monthlyRate = annualRate / 12;

      const results = parseResult.rows.map((row, idx) => {
        const principal = Number(row.PRINCIPAL || 0);
        const interest = Number(row.INTEREST || 0);
        const collateral = Number(row.COLLATERAL || 0);
        const totalCF = principal + interest + collateral;

        const scenarioCalculations = outcomeRates.map((outcomeRate, sIdx) => {
          const repaymentRate = periods[0]?.rates[sIdx] || 100;
          const monthIndex = idx + 1;
          const pv = (totalCF * (repaymentRate / 100)) / Math.pow(1 + monthlyRate, monthIndex);

          return {
            name: scenarioNames[sIdx],
            pv: pv * (outcomeRate / 100),
            flow: totalCF * (repaymentRate / 100) * (outcomeRate / 100)
          };
        });

        const totalPV = scenarioCalculations.reduce((acc, s) => acc + s.pv, 0);
        const weightedFlow = scenarioCalculations.reduce((acc, s) => acc + s.flow, 0);
        const provAmount = Math.max(0, principal - totalPV);

        return {
          id: idx,
          period: idx + 1,
          accountNumber: row.ACCOUNT_NUMBER,
          principal,
          interest,
          totalCF,
          weightedFlow,
          totalPV,
          provAmount,
          ...scenarioCalculations.reduce((acc: any, s) => {
            acc[s.name] = s.pv;
            return acc;
          }, {})
        };
      });

      // Generate Amortization Schedule (IA FLOWS)
      let currentBalance = Number(account?.outstanding_balance || 0);
      const schedule = results.map((r, i) => {
          const beginningBalance = currentBalance;
          const interestAccrual = beginningBalance * monthlyRate;
          const endingBalance = beginningBalance + interestAccrual - r.weightedFlow;
          currentBalance = endingBalance;

          return {
              id: i,
              period: i + 1,
              beginningBalance,
              interestAccrual,
              weightedFlow: r.weightedFlow,
              endingBalance,
              pv: r.totalPV
          };
      });

      setSimulationResults(results);
      (window as any)._iaFlows = schedule; // Temporary storage for rendering
      setLoading(false);
      setActiveStep(2);
      setSnack({ msg: 'Simulasi dan IA Flows berhasil diproses.', sev: 'success' });
    }, 1200);
  };

  // --- Reset Workflow ---
  const handleResetWorkflow = () => {
    setScenariosProcessed(false);
    setSelectedFile(null);
    setParseResult(null);
    setSimulationResults([]);
    setActiveStep(0);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // â”€â”€ Load history â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await individualImpairmentAPI.getDcfUploads?.();
      if (res?.success) setHistoryRows(res.data ?? []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHistory(); }, [loadHistory]);

  // â”€â”€ File selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setParseResult(null);
    setParsing(true);
    // Pass expected account number for strict validation
    const result = await validateAndParseFile(file, account?.account_number);
    setParseResult(result);
    setParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // â”€â”€ Submit for approval â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSubmit = async () => {
    if (!parseResult?.ok || !selectedFile) return;

    // Final Validation check
    if (!validateScenarios()) return;

    setSubmitting(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        const commaIndex = dataUrl.indexOf(',');
        const base64 = commaIndex !== -1 ? dataUrl.slice(commaIndex + 1) : '';

        const requestedBy = user?.id ?? user?.email ?? 'unknown';
        const dcfData = {
          accountId: account?.account_id,
          accountNumber: account?.account_number,
          fileName:  selectedFile.name,
          fileContent: base64, // Capture raw file content
          totalRows: parseResult.totalRows,
          cashflows: parseResult.rows,
          scenarioType: scenarioRateType,
          scenariosCount: numScenarios,
          scenarioNames,
          outcomeRates,
          periods,
          uploadedBy: requestedBy,
          uploadedAt: new Date().toISOString(),
          // Include simulation results so they can be displayed in Provision tab
          simulationResults: simulationResults,
          iaFlows: (window as any)._iaFlows || [],
          results: {
            presentValue: simulationResults.reduce((acc, r) => acc + (r.totalPV || 0), 0),
            lgd: simulationResults.reduce((acc, r) => acc + (r.provAmount || 0), 0),
            recommendedProvision: simulationResults.reduce((acc, r) => acc + (r.provAmount || 0), 0),
            outstanding: simulationResults.reduce((acc, r) => acc + (r.principal || 0), 0),
            details: ((window as any)._iaFlows || []).map((row: any) => ({
                period: row.period,
                beginningBalance: row.beginningBalance,
                interestAccrual: row.interestAccrual,
                weightedFlow: row.weightedFlow,
                endingBalance: row.endingBalance,
                pv: row.pv
            }))
          }
        };

        if (onStagedDCF) {
          onStagedDCF(dcfData);
          setSnack({ msg: `DCF data for "${selectedFile.name}" processed. Preparing consolidated submission...`, sev: 'success' });
          setDialogOpen(false);
          handleResetWorkflow();

          if (onTabChange) {
            onTabChange('provision-calculation');
          }
          return;
        }

        await approvalAPI.createRequest({
          entityType:   'INDIVIDUAL_DCF_UPLOAD',
          entityId:     account?.account_id?.toString(),
          title:        `DCF Upload: ${selectedFile.name} (${parseResult.totalRows} baris)`,
          description:  `Upload file DCF oleh ${user?.email ?? requestedBy}. Type: ${scenarioRateType}. Scenarios: ${numScenarios}.`,
          requestedBy,
          requestData:  dcfData,
        });

        setSnack({ msg: `File "${selectedFile.name}" berhasil disubmit untuk persetujuan checker.`, sev: 'success' });

        if (onUploadSuccess && parseResult.ok) {
          onUploadSuccess(parseResult.rows);
        }

        setDialogOpen(false);
        handleResetWorkflow();
        loadHistory();
      } catch (err: any) {
        setSnack({ msg: err?.message ?? 'Gagal submit persetujuan.', sev: 'error' });
      } finally {
        setSubmitting(false);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleCloseDialog = () => {
    if (submitting) return;
    setDialogOpen(false);
    handleResetWorkflow();
  };

  // --- Calculation Helper for Preview ---
  const calculateEstimatedNPV = (rows: any[], annualDiscountRate: number) => {
    if (!rows || rows.length === 0) return 0;
    const monthlyRate = (annualDiscountRate / 100) / 12;
    return rows.reduce((acc, row, index) => {
      const principal = Number(row.PRINCIPAL || 0);
      const interest = Number(row.INTEREST || 0);
      const collateral = Number(row.COLLATERAL || 0);
      const totalCF = (principal + interest + collateral);
      // Simple monthly discounting: CF / (1 + r)^n
      const pv = totalCF / Math.pow(1 + monthlyRate, index + 1);
      return acc + pv;
    }, 0);
  };

  const formatIDR = (val: number) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val);

  const previewColumns: GridColDef[] = [
    { field: 'period', headerName: 'Period', width: 80 },
    { field: 'accountNumber', headerName: 'Account No', width: 150 },
    { field: 'principal', headerName: 'Principal', width: 130, valueFormatter: (params) => formatIDR(Number(params || 0)) },
    ...scenarioNames.map(name => ({
      field: name,
      headerName: `${name} (PV)`,
      width: 140,
      valueFormatter: (params: any) => formatIDR(Number(params || 0))
    })),
    { field: 'totalPV', headerName: 'Total PV', width: 140, valueFormatter: (params) => formatIDR(Number(params || 0)), cellClassName: 'font-bold text-primary-main' },
  ];

  const iaFlowColumns: GridColDef[] = [
    { field: 'period', headerName: 'Period', width: 80 },
    { field: 'beginningBalance', headerName: 'Beginning Balance', width: 160, valueFormatter: (params) => formatIDR(Number(params || 0)) },
    { field: 'interestAccrual', headerName: 'Interest Accrual', width: 150, valueFormatter: (params) => formatIDR(Number(params || 0)), cellClassName: 'text-success-main' },
    { field: 'weightedFlow', headerName: 'Expected Recovery', width: 160, valueFormatter: (params) => formatIDR(Number(params || 0)), cellClassName: 'text-error-main' },
    { field: 'endingBalance', headerName: 'Ending Balance', width: 160, valueFormatter: (params) => formatIDR(Number(params || 0)), cellClassName: 'font-bold' },
    { field: 'pv', headerName: 'Present Value', width: 150, valueFormatter: (params) => formatIDR(Number(params || 0)) },
  ];

  // â”€â”€ Table columns â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const columns: GridColDef[] = [
    { field: 'fileName',  headerName: 'File Name',  flex: 1.5 },
    { field: 'totalRows', headerName: 'Rows',        width: 80 },
    {
      field: 'status', headerName: 'Status', width: 140,
      renderCell: (p) => {
        const map: Record<string, 'success'|'warning'|'error'|'default'> = {
          approved: 'success', pending: 'warning', rejected: 'error',
        };
        return <Chip label={p.value ?? 'pending'} color={map[String(p.value).toLowerCase()] ?? 'default'} size="small" />;
      },
    },
    {
      field: 'createdAt', headerName: 'Uploaded At', width: 180,
      valueFormatter: (v: any) => v ? new Date(v).toLocaleString('id-ID') : '-',
    },
    { field: 'uploadedBy', headerName: 'Uploaded By', flex: 1 },
  ];

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // --- NEW: Helper to extract most recent approved/processed calculation ---
  const latestProcessed = historyRows.find(r => r.status === 'approved' || r.results) || historyRows[0];

  return (
    <Box sx={{ p: 0.5 }}>
      {/* 1. CUSTOMER DASHBOARD HEADER */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative background circles */}
        <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.05)' }} />
        <Box sx={{ position: 'absolute', bottom: -20, left: '20%', width: 100, height: 100, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.03)' }} />

        <CardContent sx={{ p: 3, position: 'relative' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PersonIcon sx={{ fontSize: 32 }} />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} letterSpacing="-0.5px">
                    {account?.cif_name || 'Loading Name...'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                    <BadgeIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>CIF: {account?.cif_number || 'N/A'}</Typography>
                    <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)', mx: 0.5, height: 12 }} />
                    <AccountBalanceIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>{account?.branch_name || 'Main Branch'}</Typography>
                  </Box>
                </Box>
              </Box>
              <Stack direction="row" spacing={1.5}>
                <Chip
                  label={`Account: ${account?.account_number}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 700, borderRadius: '8px' }}
                />
                <Chip
                  label={account?.status || 'Active'}
                  size="small"
                  color="success"
                  sx={{ fontWeight: 700, borderRadius: '8px' }}
                />
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: { md: 'right' } }}>
                <Stack direction="row" spacing={1} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={() => setDialogOpen(true)}
                        startIcon={<CloudUploadIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontWeight: 700,
                            borderRadius: '12px',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                            px: 3, py: 1
                        }}
                    >
                        Process New DCF
                    </Button>
                    <IconButton sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }} onClick={() => downloadTemplate(account?.account_number)}>
                        <DownloadIcon />
                    </IconButton>
                </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 2. CALCULATION RESULTS OR EMPTY STATE */}
      {!latestProcessed ? (
        <Paper
            elevation={0}
            sx={{
                p: 8,
                borderRadius: '24px',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <Box sx={{ position: 'relative', mb: 4 }}>
                <Box sx={{ width: 120, height: 120, bgcolor: 'primary.50', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CalculateIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.5 }} />
                </Box>
                <CloudUploadIcon sx={{ position: 'absolute', bottom: 0, right: 0, fontSize: 40, color: 'primary.main' }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>No DCF Data Available</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 4 }}>
                This account has no processed DCF calculation. Please download the template and upload your cashflow projections to start the assessment.
            </Typography>
            <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={() => downloadTemplate(account?.account_number)}
                sx={{ borderRadius: '10px' }}
            >
                Get Excel Template
            </Button>
        </Paper>
      ) : (
        <Box>
            {/* STATS OVERVIEW (Bento Grid) */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', px: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon fontSize="small" /> LATEST CALCULATION SUMMARY
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ borderRadius: '16px', bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL PRESENT VALUE</Typography>
                            <Typography variant="h6" fontWeight={800} color="primary.main">
                                {formatIDR(latestProcessed.results?.presentValue || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ borderRadius: '16px', bgcolor: 'success.50', border: '1px solid', borderColor: 'success.100' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>TOTAL OUTSTANDING</Typography>
                            <Typography variant="h6" fontWeight={800} color="success.main">
                                {formatIDR(latestProcessed.results?.outstanding || account?.outstanding_balance || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ borderRadius: '16px', bgcolor: 'error.50', border: '1px solid', borderColor: 'error.100' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>RECOMMENDED PROVISION</Typography>
                            <Typography variant="h6" fontWeight={800} color="error.main">
                                {formatIDR(latestProcessed.results?.recommendedProvision || 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                    <Card sx={{ borderRadius: '16px', bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.100' }}>
                        <CardContent sx={{ p: 2 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>LGD (%)</Typography>
                            <Typography variant="h6" fontWeight={800} color="warning.main">
                                {latestProcessed.results?.lgd_percent || '0'}%
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* DETAILED RESULTS TABLE */}
            <Card sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Detailed Cashflow History</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Last uploaded by {latestProcessed.uploadedBy} on {new Date(latestProcessed.createdAt).toLocaleString()}
                        </Typography>
                    </Box>
                    <Chip
                        label={latestProcessed.status?.toUpperCase()}
                        color={latestProcessed.status === 'approved' ? 'success' : 'warning'}
                        size="small"
                        sx={{ fontWeight: 800, px: 1 }}
                    />
                </Box>
                <Box sx={{ height: 400 }}>
                    <SafeDataGrid
                        rows={historyRows}
                        columns={columns}
                        loading={loading}
                        slots={{ toolbar: GridToolbar }}
                        disableRowSelectionOnClick
                        density="compact"
                        getRowId={(row) => row.id ?? row.batchId ?? Math.random()}
                    />
                </Box>
            </Card>
        </Box>
      )}

      {/* 3. FORMAT GUIDELINES BANNER */}
      <Alert
        severity="info"
        variant="outlined"
        icon={<InfoIcon />}
        sx={{ mt: 4, borderRadius: '16px', border: '1px dashed' }}
        action={
          <Button size="small" variant="text" startIcon={<DownloadIcon />} onClick={() => downloadTemplate(account?.account_number)}>
            Get Template
          </Button>
        }
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>DCF Standard Compliance</Typography>
        <Typography variant="caption" display="block">
            File format must include: <strong>{DCF_REQUIRED_COLUMNS.join(', ')}</strong>.
            All principal and interest values must be ≥ 0 and periods must be incremental by month.
        </Typography>
      </Alert>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          UPLOAD DIALOG
      â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle component="div" sx={{ p: 0 }}>
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'primary.50' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <CalculateIcon color="primary" sx={{ fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight={700}>DCF Simulation Workspace</Typography>
                <Typography variant="caption" color="text.secondary">Step {activeStep + 1} of 3: {steps[activeStep]}</Typography>
              </Box>
            </Box>
            <IconButton onClick={handleCloseDialog} disabled={submitting}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ px: 4, py: 2, bgcolor: 'background.paper' }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 0, minHeight: 450, bgcolor: 'grey.50', display: 'flex', flexDirection: 'column' }}>
          {/* CUSTOMER CONTEXT HEADER */}
          <Box sx={{ px: 4, py: 2, bgcolor: 'white', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Customer:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{account?.cif_name || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Account No:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{account?.account_number || 'N/A'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Outstanding:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>{formatIDR(account?.outstanding_balance || 0)}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Branch:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{account?.branch_name || account?.branch_code || 'Main Branch'}</Typography>
              </Box>
          </Box>

          <Fade in={activeStep === 0}>
            <Box sx={{ display: activeStep === 0 ? 'block' : 'none', p: 4 }}>
              {/* --- STEP 1: SCENARIO SETUP --- */}
              <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon fontSize="small" /> Basic Assumptions
                  </Typography>

                  <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth variant="outlined" size="small">
                        <InputLabel>DCF Scenario Rate</InputLabel>
                        <Select
                          label="DCF Scenario Rate"
                          value={scenarioRateType}
                          onChange={(e) => setScenarioRateType(e.target.value)}
                          disabled={scenariosProcessed}
                        >
                          <MenuItem value="possible_outcome">Possible Outcome and repayment rate</MenuItem>
                          <MenuItem value="dcf">DCF</MenuItem>
                          <MenuItem value="collateral">Collateral</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Number Of Scenario"
                        type="number"
                        value={numScenarios}
                        onChange={(e) => setNumScenarios(Math.max(1, Math.min(5, Number(e.target.value))))}
                        disabled={scenariosProcessed}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                      {!scenariosProcessed ? (
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleProcessScenarios}
                          sx={{ py: 1 }}
                        >
                          Show Fields
                        </Button>
                      ) : (
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleResetWorkflow}
                          startIcon={<RefreshIcon />}
                        >
                          Reset
                        </Button>
                      )}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {scenariosProcessed && (
                <Zoom in={scenariosProcessed}>
                  <Box>
                    <Card variant="outlined" sx={{ borderRadius: 2, mb: 3 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>Outcome & Scenario Config</Typography>
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                          <Grid size={{ xs: 3 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Posible Outcome Rate (%)</Typography>
                          </Grid>
                          {outcomeRates.map((rate, i) => {
                            const total = outcomeRates.reduce((a, b) => a + Number(b||0), 0);
                            const isError = total !== 100;
                            return (
                              <Grid key={i} size={{ xs: 3 }}>
                                <TextField
                                  fullWidth
                                  size="small"
                                  variant="standard"
                                  type="number"
                                  value={rate}
                                  error={isError}
                                  onChange={(e) => {
                                    const next = [...outcomeRates];
                                    next[i] = Number(e.target.value);
                                    setOutcomeRates(next);
                                  }}
                                  inputProps={{ style: { textAlign: 'center' } }}
                                  helperText={i === outcomeRates.length - 1 && isError ? `Total: ${total}%` : ""}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>

                        <Grid container spacing={3}>
                          <Grid size={{ xs: 3 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>Scenario Name</Typography>
                          </Grid>
                          {scenarioNames.map((name, i) => (
                            <Grid key={i} size={{ xs: 3 }}>
                              <TextField
                                fullWidth
                                size="small"
                                variant="standard"
                                value={name}
                                onChange={(e) => {
                                  const next = [...scenarioNames];
                                  next[i] = e.target.value;
                                  setScenarioNames(next);
                                }}
                                inputProps={{ style: { textAlign: 'center' } }}
                              />
                            </Grid>
                          ))}
                        </Grid>
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Period & Repayment Rates</Typography>
                          <Button size="small" startIcon={<AddIcon />} onClick={handleAddPeriod} variant="outlined">
                            Add Period
                          </Button>
                        </Box>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: 'grey.50' }}>
                              <TableCell sx={{ fontWeight: 700 }}>Start</TableCell>
                              <TableCell sx={{ fontWeight: 700 }}>End</TableCell>
                              <TableCell colSpan={numScenarios} sx={{ fontWeight: 700, textAlign: 'center' }}>Repayment Rate (%)</TableCell>
                              <TableCell></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {periods.map((period, pIdx) => (
                              <TableRow key={pIdx}>
                                <TableCell>
                                  <DatePicker
                                    value={period.start}
                                    onChange={(val) => handlePeriodChange(pIdx, 'start', val)}
                                    slotProps={{ textField: { variant: 'standard', size: 'small' } }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <DatePicker
                                    value={period.end}
                                    onChange={(val) => handlePeriodChange(pIdx, 'end', val)}
                                    slotProps={{ textField: { variant: 'standard', size: 'small' } }}
                                  />
                                </TableCell>
                                {period.rates.map((rate: number, rIdx: number) => (
                                  <TableCell key={rIdx}>
                                    <TextField
                                      variant="standard"
                                      type="number"
                                      value={rate}
                                      onChange={(e) => handlePeriodChange(pIdx, 'rates', e.target.value, rIdx)}
                                      inputProps={{ style: { textAlign: 'center' } }}
                                    />
                                  </TableCell>
                                ))}
                                <TableCell align="right">
                                  <IconButton size="small" onClick={() => handleRemovePeriod(pIdx)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Box>
                </Zoom>
              )}
            </Box>
          </Fade>

          <Fade in={activeStep === 1}>
            <Box sx={{ display: activeStep === 1 ? 'block' : 'none', p: 4 }}>
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: parseResult?.ok ? 'success.main' : 'primary.light',
                  borderRadius: 4, p: 8, textAlign: 'center', cursor: 'pointer',
                  bgcolor: parseResult?.ok ? 'success.50' : 'background.paper',
                  transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: 'grey.50', borderColor: 'primary.main', transform: 'translateY(-4px)' },
                  boxShadow: parseResult?.ok ? '0 10px 30px -10px rgba(76, 175, 80, 0.2)' : '0 10px 30px -10px rgba(0, 0, 0, 0.1)'
                }}
                onClick={() => !submitting && fileInputRef.current?.click()}
              >
                <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls,.csv" />
                {parseResult?.ok ? (
                  <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
                ) : (
                  <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.7 }} />
                )}
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  {selectedFile ? selectedFile.name : 'Choose DCF Template'}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Tarik dan lepaskan file template yang sudah diisi di sini
                </Typography>
                <Button variant="outlined" size="large" sx={{ pointerEvents: 'none' }}>
                  Select File
                </Button>
                {parsing && <LinearProgress sx={{ mt: 4, borderRadius: 2, height: 8 }} />}
              </Box>

              {parseResult && !parsing && (
                <Box sx={{ mt: 3 }}>
                  <Alert
                    severity={parseResult.ok ? "success" : "error"}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                    action={parseResult.ok && (
                      <Button color="inherit" size="small" onClick={runSimulation} startIcon={<CalculateIcon />}>
                        Process Simulation
                      </Button>
                    )}
                  >
                    {parseResult.ok ? `Format Berhasil Diverifikasi: ${parseResult.totalRows} akun siap diproses.` : parseResult.error}
                  </Alert>
                </Box>
              )}

              {/* HISTORICAL RESULTS (PREVIOUSLY PROCESSED DATA) */}
              {!parseResult && !parsing && historyRows.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                          <HistoryIcon fontSize="small" /> Previously Processed DCF Documents
                      </Typography>
                      <Paper variant="outlined" sx={{ borderRadius: '12px', overflow: 'hidden' }}>
                          <Table size="small">
                              <TableHead sx={{ bgcolor: 'grey.50' }}>
                                  <TableRow>
                                      <TableCell sx={{ fontWeight: 700 }}>Filename</TableCell>
                                      <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                      <TableCell sx={{ fontWeight: 700 }} align="right">Action</TableCell>
                                  </TableRow>
                              </TableHead>
                              <TableBody>
                                  {historyRows.slice(0, 3).map((row, idx) => (
                                      <TableRow key={idx}>
                                          <TableCell variant="body2">{row.fileName}</TableCell>
                                          <TableCell variant="body2" sx={{ fontSize: '0.75rem' }}>{new Date(row.createdAt).toLocaleDateString()}</TableCell>
                                          <TableCell>
                                              <Chip
                                                label={row.status || 'Pending'}
                                                size="small"
                                                color={row.status === 'approved' ? 'success' : 'warning'}
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                              />
                                          </TableCell>
                                          <TableCell align="right">
                                              <Button size="small" startIcon={<VisibilityIcon />} sx={{ textTransform: 'none' }}>View</Button>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                              </TableBody>
                          </Table>
                      </Paper>
                  </Box>
              )}
            </Box>
          </Fade>

          <Fade in={activeStep === 2}>
            <Box sx={{ display: activeStep === 2 ? 'block' : 'none', p: 3 }}>
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                  <VisibilityIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Simulation Preview Results
                </Typography>
                <Chip label={`${simulationResults.length} Accounts Processed`} color="success" variant="outlined" />
              </Box>
              <Paper variant="outlined" sx={{ height: 300, borderRadius: 2, overflow: 'hidden', mb: 3 }}>
                <SafeDataGrid
                  rows={simulationResults}
                  columns={previewColumns}
                  loading={loading}
                  disableRowSelectionOnClick
                  density="compact"
                />
              </Paper>

              <Typography variant="subtitle1" fontWeight={700} color="primary.main" sx={{ mb: 2 }}>
                <TableChartIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Detailed IA Flows (Amortization & Unwinding)
              </Typography>
              <Paper variant="outlined" sx={{ height: 350, borderRadius: 2, overflow: 'hidden' }}>
                <SafeDataGrid
                  rows={(window as any)._iaFlows || []}
                  columns={iaFlowColumns}
                  loading={loading}
                  disableRowSelectionOnClick
                  density="compact"
                />
              </Paper>
              <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                <Typography variant="caption">
                  Ini adalah nilai estimasi berdasarkan repayment rate yang Anda berikan. Klik <strong>Submit</strong> untuk mengirim data ini ke Checker.
                </Typography>
              </Alert>
            </Box>
          </Fade>
        </DialogContent>

        <DialogActions sx={{ px: 4, py: 3, bgcolor: 'background.paper' }}>
          {activeStep > 0 && (
            <Button
              onClick={() => setActiveStep(prev => prev - 1)}
              startIcon={<ArrowBackIcon />}
              disabled={submitting}
            >
              Back
            </Button>
          )}
          <Box sx={{ flex: 1 }} />

          {activeStep === 0 && (
            <Button
              onClick={handleSaveScenario}
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              disabled={!scenariosProcessed}
              sx={{ px: 4 }}
            >
              Continue to Upload
            </Button>
          )}

          {activeStep === 1 && (
            <Button
              onClick={runSimulation}
              variant="contained"
              color="success"
              disabled={!parseResult?.ok || loading}
              startIcon={<CalculateIcon />}
              sx={{ px: 4 }}
            >
              {loading ? 'Processing...' : 'Run Simulation'}
            </Button>
          )}

          {activeStep === 2 && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? undefined : <CheckIcon />}
              sx={{ px: 6, py: 1.2, fontWeight: 700, borderRadius: 2 }}
            >
              {submitting ? 'Processing...' : 'Confirm & Process DCF'}
            </Button>
          )}
        </DialogActions>
        {submitting && <LinearProgress />}
      </Dialog>

      {/* â”€â”€ Snackbar â”€â”€ */}
      <Snackbar
        open={!!snack}
        autoHideDuration={6000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snack ? snack.sev : 'info'} onClose={() => setSnack(null)} variant="filled">
          {snack ? snack.msg : ''}
        </Alert>
      </Snackbar>
    </Box>
  );
}
