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

// ──────────────────────────────────────────────────────────────────────────────────────────────────
// TEMPLATE DEFINITION — MUST match DCF_UPLOAD (1).xlsx exactly
// ──────────────────────────────────────────────────────────────────────────────────────────────────
const DCF_REQUIRED_COLUMNS = [
  'ACCOUNT_NUMBER',
  'PERIODE',
  'PRINCIPAL',
  'INTEREST',
  'COLLATERAL',
] as const;

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
          if (expectedAccountNumber) {
             const rowAcc = String(obj.ACCOUNT_NUMBER || '').trim();
             if (rowAcc.replace(/^0+/, '') !== expectedAccountNumber.replace(/^0+/, '')) {
                errors.push(`Baris ${rowNum}: Nomor rekening "${rowAcc}" tidak sesuai (${expectedAccountNumber}).`);
             }
          }

          ['PRINCIPAL', 'INTEREST', 'COLLATERAL'].forEach(col => {
            const val = Number(obj[col]);
            if (isNaN(val) || val < 0) {
              errors.push(`Baris ${rowNum}: Kolom ${col} harus berupa angka positif.`);
            }
          });

          if (!obj.PERIODE || isNaN(Date.parse(String(obj.PERIODE)))) {
             errors.push(`Baris ${rowNum}: Format kolom PERIODE tidak valid.`);
          }

          if (errors.length >= 5) break; 
          rows.push(obj);
        }

        if (errors.length > 0) {
          return resolve({
            ok: false,
            error: `Validasi Data Gagal:\n${errors.join('\n')}`
          });
        }

        resolve({ ok: true, rows, totalRows: rows.length });
      } catch (err) {
        resolve({ ok: false, error: 'Gagal memproses file.' });
      }
    };
    reader.readAsBinaryString(file);
  });
}

function downloadTemplate(accountNumber?: string) {
  const filename = `DCF_TEMPLATE_${accountNumber || 'SAMPLE'}.xlsx`;
  const today = new Date();
  const sampleData = Array.from({ length: 6 }).map((_, i) => {
    const periodDate = new Date(today);
    periodDate.setMonth(today.getMonth() + i + 1);
    return {
      ACCOUNT_NUMBER: accountNumber || '1234567890',
      PERIODE: format(periodDate, 'yyyy-MM-dd'),
      PRINCIPAL: i === 5 ? 50000000 : 0, 
      INTEREST: 500000,
      COLLATERAL: 0
    };
  });
  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DCF Cashflows");
  XLSX.writeFile(wb, filename);
}

// ——————————————————————————————————————————————————————————————————————————————————————————————————
// MAIN COMPONENT
// —————————————————————————————————————————————————────────────────—————————————————————————————————
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
  const [loading, setLoading]               = useState(false);
  const [snack, setSnack]                   = useState<{ msg: string; sev: 'success'|'error'|'warning'|'info' } | null>(null);

  // Scenario Weights
  const [scenarioNames, setScenarioNames]   = useState<string[]>(['Base', 'Optimistic', 'Pessimistic']);
  const [outcomeRates, setOutcomeRates]     = useState<number[]>([50, 30, 20]);
  
  // Repayment Rates by Period
  const [periods, setPeriods]               = useState<any[]>([
    { 
        start: new Date(), 
        end: new Date(new Date().getFullYear() + 5, 11, 31), 
        rates: [100, 80, 50] 
    }
  ]);

  // File Upload State
  const [selectedFile, setSelectedFile]     = useState<File | null>(null);
  const [parseResult, setParseResult]       = useState<ParseResult | null>(null);
  const [activeStep, setActiveStep]         = useState(0);

  useEffect(() => {
    if (initialAssumptions) {
      setOutcomeRates([
        initialAssumptions.poRate1 || 50,
        initialAssumptions.poRate2 || 30,
        initialAssumptions.poRate3 || 20
      ]);
      setScenarioNames([
        initialAssumptions.scName1 || 'Base',
        initialAssumptions.scName2 || 'Optimistic',
        initialAssumptions.scName3 || 'Pessimistic'
      ]);

      // Pre-fill repayment rates period if not already customized
      if (initialAssumptions.timeHorizon) {
         setPeriods([
            { 
                start: new Date(), 
                end: format(new Date(new Date().setMonth(new Date().getMonth() + initialAssumptions.timeHorizon)), 'yyyy-MM-dd'),
                rates: [
                    initialAssumptions.rrRate1 || 100, 
                    initialAssumptions.rrRate2 || 80, 
                    initialAssumptions.rrRate3 || 50
                ] 
            }
         ]);
      }
    }
  }, [initialAssumptions]);

  const validateScenarios = () => {
    const totalOutcome = outcomeRates.reduce((acc, r) => acc + Number(r || 0), 0);
    if (totalOutcome !== 100) {
      setSnack({ msg: `Total Probabilitas (PO Rate) harus 100%. Saat ini: ${totalOutcome}%`, sev: 'error' });
      return false;
    }
    return true;
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

  const handleAddPeriod = () => {
    setPeriods([...periods, { start: new Date(), end: new Date(), rates: [0, 0, 0] }]);
  };

  const handleRemovePeriod = (index: number) => {
    setPeriods(periods.filter((_, i) => i !== index));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const result = await validateAndParseFile(file, account?.account_number);
    setParseResult(result);
    if (!result.ok) {
      setSnack({ msg: result.error, sev: 'error' });
    } else {
      setSnack({ msg: `${result.totalRows} baris cashflow terbaca.`, sev: 'success' });
    }
  };

  const handlePrepareSimulation = () => {
    if (!validateScenarios()) return;
    if (!parseResult?.ok) {
      setSnack({ msg: 'Unggah file DCF terlebih dahulu.', sev: 'warning' });
      return;
    }

    const payload = {
        assumptions: {
            nOfScenario: 3,
            scenarioId: 1,
            scName1: scenarioNames[0],
            scName2: scenarioNames[1],
            scName3: scenarioNames[2],
            poRate1: outcomeRates[0],
            poRate2: outcomeRates[1],
            poRate3: outcomeRates[2],
            method: '3'
        },
        repaymentRates: periods.map(p => ({
            periodStart: format(p.start, 'yyyy-MM-dd'),
            periodEnd: format(p.end, 'yyyy-MM-dd'),
            rrRate1: p.rates[0],
            rrRate2: p.rates[1],
            rrRate3: p.rates[2]
        })),
        cashflows: parseResult.rows.map((r, idx) => ({
            mob: idx + 1,
            periode: r.PERIODE,
            principal: r.PRINCIPAL,
            interest: r.INTEREST,
            collateral: r.COLLATERAL
        }))
    };

    if (onStagedDCF) {
        onStagedDCF(payload);
        setSnack({ msg: 'Konfigurasi simulasi siap. Lanjutkan di tab Analysis.', sev: 'success' });
        if (onTabChange) onTabChange('analysis');
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {['Setup Skenario', 'Upload Cashflow'].map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {activeStep === 0 && (
        <Box>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="primary" /> Bobot Skenario (PO Rate)
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {scenarioNames.map((name, i) => (
              <Grid item xs={12} md={4} key={i}>
                <Paper sx={{ 
                    p: 2, 
                    bgcolor: i === 0 ? 'rgba(33, 150, 243, 0.05)' : (i === 1 ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'), 
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: i === 0 ? 'rgba(33, 150, 243, 0.2)' : (i === 1 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'),
                    borderLeft: '5px solid',
                    borderLeftColor: i === 0 ? '#1976d2' : (i === 1 ? '#2e7d32' : '#d32f2f')
                }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    {name.toUpperCase()}
                    <CheckCircleIcon sx={{ fontSize: 14 }} />
                  </Typography>
                  <TextField
                    fullWidth label="PO Rate %" type="number" size="small"
                    value={outcomeRates[i]}
                    onChange={(e) => {
                      const next = [...outcomeRates];
                      next[i] = Number(e.target.value);
                      setOutcomeRates(next);
                    }}
                    sx={{ bgcolor: 'white' }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Weight Tracker Section */}
          <Paper variant="outlined" sx={{ p: 2, mb: 4, borderRadius: 2, bgcolor: (outcomeRates[0] + outcomeRates[1] + outcomeRates[2]) === 100 ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 152, 0, 0.05)', borderStyle: 'dashed' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Total Possible Outcome (PO) Weighting 
                  {(outcomeRates[0] + outcomeRates[1] + outcomeRates[2]) === 100 ? <CheckCircleIcon color="success" sx={{ fontSize: 18 }} /> : <WarningIcon color="warning" sx={{ fontSize: 18 }} />}
                </Typography>
                <Typography variant="body2" fontWeight="bold" color={(outcomeRates[0] + outcomeRates[1] + outcomeRates[2]) === 100 ? "success.main" : "warning.main"}>
                  {outcomeRates[0] + outcomeRates[1] + outcomeRates[2]}% / 100%
                </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={Math.min(outcomeRates[0] + outcomeRates[1] + outcomeRates[2], 100)} 
              color={(outcomeRates[0] + outcomeRates[1] + outcomeRates[2]) === 100 ? "success" : "warning"}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Paper>

          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
             <HistoryIcon color="primary" /> Repayment Rates (RR) per Periode
          </Typography>
          
          {periods.map((period, pIdx) => (
            <Paper variant="outlined" sx={{ p: 2, mb: 2, position: 'relative', borderRadius: 3 }} key={pIdx}>
              {periods.length > 1 && (
                  <IconButton 
                      size="small" color="error" 
                      sx={{ position: 'absolute', top: 5, right: 5 }}
                      onClick={() => handleRemovePeriod(pIdx)}
                  ><DeleteIcon /></IconButton>
              )}
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Mulai" value={period.start}
                      onChange={(val) => handlePeriodChange(pIdx, 'start', val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Selesai" value={period.end}
                      onChange={(val) => handlePeriodChange(pIdx, 'end', val)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                {scenarioNames.map((name, sIdx) => (
                  <Grid item xs={12} md={2} key={sIdx}>
                    <TextField
                      label={`RR % (${name})`} type="number" size="small" fullWidth
                      value={period.rates[sIdx]}
                      onChange={(e) => handlePeriodChange(pIdx, 'rates', e.target.value, sIdx)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}

          <Button startIcon={<AddIcon />} onClick={handleAddPeriod} sx={{ mb: 2 }}>Tambah Periode</Button>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button variant="contained" onClick={() => setActiveStep(1)} size="large" sx={{ borderRadius: 2 }}>
              Lanjut ke Upload DCF
            </Button>
          </Box>
        </Box>
      )}

      {activeStep === 1 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CloudUploadIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" fontWeight="bold">Unggah Proyeksi Cashflow</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
            Sistem akan mencocokkan data baris per baris dengan skenario yang Anda buat.
          </Typography>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 4 }}>
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={() => downloadTemplate(account?.account_number)}>
                Download Template
              </Button>
              <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                Pilih File
                <input type="file" hidden accept=".xlsx,.xls,.csv" onChange={handleFileSelect} />
              </Button>
          </Stack>

          {selectedFile && (
              <Alert severity={parseResult?.ok ? "success" : "error"} sx={{ maxWidth: 500, mx: 'auto', mb: 4 }}>
                File: {selectedFile.name} {parseResult?.ok && `(${parseResult.totalRows} baris)`}
              </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button onClick={() => setActiveStep(0)}>Kembali</Button>
            <Button 
              variant="contained" color="success" size="large"
              disabled={!parseResult?.ok}
              onClick={handlePrepareSimulation}
              startIcon={<CalculateIcon />}
              sx={{ borderRadius: 2, px: 4 }}
            >
              Siapkan Simulasi
            </Button>
          </Box>
        </Box>
      )}

      <Snackbar open={!!snack} autoHideDuration={4000} onClose={() => setSnack(null)}>
        <Alert severity={snack?.sev} variant="filled">{snack?.msg}</Alert>
      </Snackbar>
    </Box>
  );
}
