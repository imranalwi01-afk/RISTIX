'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Stack,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  GridColDef,
  GridToolbar
} from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Home as HomeIcon,
  List as ListIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  UploadFile as UploadIcon,
  Download as DownloadIcon,
  Clear as ClearIcon,
  Add as AddCircleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { individualImpairmentAPI } from '../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';
import { StatCard } from '@/components/common/StatCard';
import { useAssessmentWorkspaceEmbedded } from '@/app/banking/individual/assessment/embedded-context';
import * as XLSX from 'xlsx';

interface DcfScenarioRow {
  id: string;
  possibleOutcomeRate: number;
  scenarioName: string;
  periodStart: string;
  periodEnd: string;
  repaymentRate: number;
}

interface ParsedDcfRow {
  accountNumber: string;
  periode: string;
  principal: number;
  interest: number;
  collateral: number;
}

interface PersistedDcfRow extends ParsedDcfRow {
  pkid: number;
  mob?: number;
}

interface PersistedIaHeader {
  effectiveDate?: string | null;
  accountNumber?: string;
  cifNumber?: string;
  cifName?: string;
  currency?: string;
  dpd?: number;
  collectability?: number;
  ratingCode?: string;
  interestRate?: number;
  effInterestRate?: number;
  outstanding?: number;
  accruedInterest?: number;
  carryingAmt?: number;
  eadAmt?: number;
  pvDcfAmt?: number;
  eclIaAmt?: number;
}

interface PersistedIaDetailRow {
  pkid: number;
  mob: number;
  periode: string | null;
  principal: number;
  interest: number;
  installment: number;
  collateral: number;
  poRate1: number;
  rrRate1: number;
  default1: number;
  poRate2: number;
  rrRate2: number;
  default2: number;
  poRate3: number;
  rrRate3: number;
  default3: number;
  pwAmt: number;
  discountFactor: number;
  pvAmt: number;
  beginningBalance: number;
  eirAmt: number;
  endingBalance: number;
}

interface PersistedIaResultDetail {
  header: PersistedIaHeader | null;
  cashflows: PersistedDcfRow[];
  details: PersistedIaDetailRow[];
}

const TEMPLATE_HEADERS = ['ACCOUNT_NUMBER', 'PERIODE', 'PRINCIPAL', 'INTEREST', 'COLLATERAL'];

const toIsoDate = (value?: string | Date | null) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const formatDisplayDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatAmount = (value?: number | string | null) => {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric)
    ? numeric.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '0.00';
};

const buildScenarioRows = (count: number, baseDate: string, seedName?: string, baseRate = 0): DcfScenarioRow[] => {
  const safeCount = Math.max(1, Math.min(5, count || 1));
  const start = baseDate ? new Date(baseDate) : new Date();
  return Array.from({ length: safeCount }, (_, index) => {
    const periodStart = new Date(start);
    periodStart.setMonth(start.getMonth() + index);
    const periodEnd = new Date(start);
    periodEnd.setMonth(start.getMonth() + index + 1);
    return {
      id: `scenario-${index + 1}`,
      possibleOutcomeRate: safeCount === 1 ? 100 : index === 0 ? 60 : 20,
      scenarioName: seedName ? `${seedName} ${index + 1}` : `Scenario ${index + 1}`,
      periodStart: toIsoDate(periodStart),
      periodEnd: toIsoDate(periodEnd),
      repaymentRate: Math.max(0, Math.round(baseRate))
    };
  });
};

export const AssessmentOverride = () => {
  const embedded = useAssessmentWorkspaceEmbedded();
  const router = useRouter();
  const searchParams = useSearchParams();
  const accountId = searchParams.get('accountId');
  const accountNumber = searchParams.get('accountNumber');
  const mode = searchParams.get('mode') || 'conventional';

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<any | null>(null);
  const [remarksDraft, setRemarksDraft] = useState('');
  const [scenarioOptions, setScenarioOptions] = useState<any[]>([]);
  const [selectedScenario, setSelectedScenario] = useState('');
  const [scenarioCount, setScenarioCount] = useState(2);
  const [scenarioRows, setScenarioRows] = useState<DcfScenarioRow[]>([]);
  const [parsedDcfRows, setParsedDcfRows] = useState<ParsedDcfRow[]>([]);
  const [persistedDcfDetail, setPersistedDcfDetail] = useState<PersistedIaResultDetail | null>(null);
  const [selectedDcfFile, setSelectedDcfFile] = useState<File | null>(null);
  const [uploadingDcf, setUploadingDcf] = useState(false);

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    accountNumber: '',
    currentStage: 1,
    overrideStage: 2,
    justification: '',
    supportingDocumentName: '',
    supportingDocumentContent: ''
  });
  const [existingDocumentName, setExistingDocumentName] = useState<string>('');

  const loadData = async (scope?: { accountId?: string; accountNumber?: string }) => {
    try {
      const response = await individualImpairmentAPI.getOverrides({
        accountId: scope?.accountId,
        accountNumber: scope?.accountNumber,
      });
      if (response.success) {
        setData(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load overrides');
    }
  };

  const loadPersistedDcfDetail = async (scope?: { accountId?: string; accountNumber?: string }) => {
    if (!scope?.accountId && !scope?.accountNumber) {
      setPersistedDcfDetail(null);
      return;
    }

    try {
      const response = await individualImpairmentAPI.getIaResultDetail({
        accountId: scope?.accountId,
        accountNumber: scope?.accountNumber
      });
      if (response.success && response.data) {
        setPersistedDcfDetail({
          header: response.data.header ?? null,
          cashflows: Array.isArray(response.data.cashflows) ? response.data.cashflows : [],
          details: Array.isArray(response.data.details) ? response.data.details : []
        });
      } else {
        setPersistedDcfDetail(null);
      }
    } catch {
      setPersistedDcfDetail(null);
    }
  };

  const loadAssessmentData = async (accId: string) => {
    try {
      const response = await individualImpairmentAPI.getAssessment(accId);
      if (response.success && response.data) {
        const assessment = response.data;
        setAssessmentData(assessment);
        const currentStage = Number(assessment.stage ?? assessment.current_stage ?? assessment.previous_stage ?? 1)
        const resolvedAccountNumber = String(assessment.account_number || assessment.accountNumber || accountNumber || '').trim()
        const existingDoc = Array.isArray(assessment.supporting_documents) ? assessment.supporting_documents[0] : (assessment.supportingDocument || assessment.triggerFilename || '')
        setRemarksDraft(String(assessment.impairment_reason || assessment.analyst_comments || assessment.triggerRemarks || ''))
        setFormData({
          customerName: assessment.cif_name || assessment.cifName || '',
          accountNumber: resolvedAccountNumber,
          currentStage: Number.isFinite(currentStage) ? currentStage : 1,
          overrideStage: Number.isFinite(currentStage) ? currentStage : 2,
          justification: assessment.impairment_reason || assessment.triggerRemarks || '',
          supportingDocumentName: '',
          supportingDocumentContent: ''
        });
        setExistingDocumentName(String(existingDoc || ''))
        await loadData({
          accountId: accId,
          accountNumber: resolvedAccountNumber || undefined,
        })
        await loadPersistedDcfDetail({
          accountId: accId,
          accountNumber: resolvedAccountNumber || undefined
        })
        setError(null);
        setSuccess(null);
        return;
      }
      setError(response?.message || 'Failed to load assessment data');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === 'string' ? err : null) ||
        'Failed to load assessment data';
      setError(String(message));
    }
  };

  const loadScenarioOptions = async (accId?: string | null) => {
    try {
      const response = await individualImpairmentAPI.getScenarios(accId ? { accountId: accId } : undefined);
      const options = Array.isArray(response?.data) ? response.data : [];
      setScenarioOptions(options);
      if (options.length > 0) {
        const selected =
          options.find((item) => String(item.scenarioCode || item.scenarioName || item.name || '') === selectedScenario)
          || options[0];
        const selectedCode = String(selected.scenarioCode || selected.scenarioName || selected.name || 'POSSIBLE_OUTCOME_AND_REPAYMENT_RATE');
        const scenarioName = String(selected.scenarioName || selected.name || 'Scenario');
        const configuredRows = Array.isArray(selected?.configuration?.scenarioRows) ? selected.configuration.scenarioRows : [];
        const baseDate = toIsoDate(assessmentData?.prc_date || assessmentData?.prcDate || new Date());

        setSelectedScenario(selectedCode);
        setScenarioRows(
          configuredRows.length > 0
            ? configuredRows.map((row: any, index: number) => ({
              id: String(row.id || `scenario-${index + 1}`),
              possibleOutcomeRate: Number(row.possibleOutcomeRate || 0),
              scenarioName: String(row.scenarioName || `${scenarioName} ${index + 1}`),
              periodStart: toIsoDate(row.periodStart || baseDate),
              periodEnd: toIsoDate(row.periodEnd || baseDate),
              repaymentRate: Number(row.repaymentRate || 0)
            }))
            : buildScenarioRows(
              Number(selected?.configuration?.nScenarios || scenarioCount),
              baseDate,
              scenarioName,
              Number(selected.discountRate || 0)
            )
        );
        setScenarioCount(Math.max(1, Math.min(3, Number(selected?.configuration?.nScenarios || configuredRows.length || scenarioCount))));
      }
    } catch {
      setScenarioOptions([]);
    }
  };

  const updateScenarioRow = (id: string, field: keyof DcfScenarioRow, value: string | number) => {
    setScenarioRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleShowScenario = () => {
    const selected = scenarioOptions.find((item) => String(item.scenarioCode || item.scenarioName || item.name || '') === selectedScenario);
    const baseDate = toIsoDate(assessmentData?.prc_date || assessmentData?.prcDate || new Date());
    const configuredRows = Array.isArray(selected?.configuration?.scenarioRows) ? selected.configuration.scenarioRows : [];
    const selectedName = String(selected?.scenarioName || selected?.name || selectedScenario || 'Scenario');
    setScenarioRows(configuredRows.length > 0
      ? configuredRows.map((row: any, index: number) => ({
        id: String(row.id || `scenario-${index + 1}`),
        possibleOutcomeRate: Number(row.possibleOutcomeRate || 0),
        scenarioName: String(row.scenarioName || `${selectedName} ${index + 1}`),
        periodStart: toIsoDate(row.periodStart || baseDate),
        periodEnd: toIsoDate(row.periodEnd || baseDate),
        repaymentRate: Number(row.repaymentRate || 0)
      }))
      : buildScenarioRows(
        Math.max(1, Math.min(3, Number(selected?.configuration?.nScenarios || scenarioCount || 1))),
        baseDate,
        selectedName || undefined,
        Number(selected?.discountRate || 0)
      ));
  };

  const handleSaveScenarioDraft = async () => {
    if (!selectedScenario) {
      setError('Pilih DCF scenario terlebih dahulu');
      return;
    }

    try {
      setLoading(true);
      const selected = scenarioOptions.find((item) => String(item.scenarioCode || item.scenarioName || item.name || '') === selectedScenario);
      const effectiveRows = scenarioRows.slice(0, 3);
      await individualImpairmentAPI.createScenario({
        scenarioId: Number(selected?.scenarioId || 1),
        accountId: accountId ? Number(accountId) : undefined,
        scenarioCode: String(selected?.scenarioCode || selectedScenario).toUpperCase().replace(/\s+/g, '_'),
        scenarioName: String(selected?.scenarioName || selected?.name || selectedScenario),
        description: remarksDraft || '',
        nOfScenario: effectiveRows.length,
        scenarioRows: effectiveRows,
        configuration: {
          scenarioId: Number(selected?.scenarioId || 1),
          nScenarios: effectiveRows.length,
          scenarioRows: effectiveRows
        }
      });
      setSuccess('DCF scenario draft saved');
      await loadScenarioOptions(accountId);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save DCF scenario');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const sampleRows = [
      TEMPLATE_HEADERS,
      [formData.accountNumber || '000131230249', '23-Apr-2026', 15000000, 1250000, 5000000],
      [formData.accountNumber || '000131230249', '31-May-2026', 20000000, 1500000, 4500000],
      [formData.accountNumber || '000131230249', '30-Jun-2026', 25000000, 1750000, 4000000]
    ];
    const worksheet = XLSX.utils.aoa_to_sheet(sampleRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DCF Upload');
    XLSX.writeFile(workbook, `DCF_UPLOAD_TEMPLATE_${formData.accountNumber || 'SAMPLE'}.xlsx`);
  };

  const handleDcfFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    setSelectedDcfFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '', raw: true });

        const rows = jsonData.map((row) => {
          const rawDate = row.PERIODE;
          let isoDate = '';
          if (rawDate instanceof Date) {
            isoDate = toIsoDate(rawDate);
          } else if (typeof rawDate === 'number') {
            const parsed = XLSX.SSF.parse_date_code(rawDate);
            if (parsed) {
              isoDate = toIsoDate(new Date(parsed.y, parsed.m - 1, parsed.d));
            }
          } else if (typeof rawDate === 'string') {
            isoDate = toIsoDate(rawDate);
          }

          return {
            accountNumber: String(row.ACCOUNT_NUMBER || '').trim(),
            periode: isoDate,
            principal: Number(row.PRINCIPAL || 0),
            interest: Number(row.INTEREST || 0),
            collateral: Number(row.COLLATERAL || 0)
          };
        }).filter((row) => row.accountNumber && row.periode);

        setParsedDcfRows(rows);
      } catch (err) {
        setParsedDcfRows([]);
        setError('Failed to parse DCF upload file');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDcfUpload = async () => {
    if (!assessmentData?.account_id || !selectedDcfFile || parsedDcfRows.length === 0) {
      setError('Select a valid DCF upload file first');
      return;
    }

    try {
      setUploadingDcf(true);
      await individualImpairmentAPI.createBatchUpload({
        fileName: selectedDcfFile.name,
        batchId: `DCF-${Date.now()}`,
        cashflows: parsedDcfRows.map((row, index) => ({
          accountId: Number(assessmentData.account_id),
          accountNumber: row.accountNumber,
          prcDate: toIsoDate(assessmentData.prc_date || assessmentData.prcDate || new Date()),
          periodDate: row.periode,
          periode: row.periode,
          mob: index + 1,
          principal: row.principal,
          interest: row.interest,
          collateral: row.collateral,
          status: '0'
        }))
      });
      setSuccess(`DCF upload submitted with ${parsedDcfRows.length} rows`);
      await loadPersistedDcfDetail({
        accountId: String(assessmentData.account_id),
        accountNumber: formData.accountNumber || assessmentData.account_number || undefined
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload DCF rows');
    } finally {
      setUploadingDcf(false);
    }
  };

  const handleOpenOverrideDialog = () => {
    setFormData((prev) => ({
      ...prev,
      justification: remarksDraft || prev.justification
    }));
    setOpenDialog(true);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        if (accountId) {
          await loadAssessmentData(accountId);
          await loadScenarioOptions(accountId);
        } else {
          setAssessmentData(null);
          setPersistedDcfDetail(null);
          await loadData();
          await loadScenarioOptions(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [accountId, accountNumber]);

  const handleCreate = async () => {
    const hasExistingDoc = Boolean(existingDocumentName)
    const hasNewDoc = Boolean(formData.supportingDocumentName && formData.supportingDocumentContent)
    if (!formData.customerName || !formData.accountNumber || !formData.justification || (!hasExistingDoc && !hasNewDoc)) return;

    try {
      setLoading(true);
      await individualImpairmentAPI.createOverride({
        customerName: formData.customerName,
        accountNumber: formData.accountNumber,
        overrideStage: String(formData.overrideStage),
        justification: formData.justification,
        supportingDocumentName: formData.supportingDocumentName || undefined,
        supportingDocumentContent: formData.supportingDocumentContent || undefined,
      });
      setSuccess('Override request submitted successfully');
      setOpenDialog(false);
      if (accountId) {
        await loadAssessmentData(accountId);
      } else {
        setFormData({
          customerName: '',
          accountNumber: '',
          currentStage: 1,
          overrideStage: 2,
          justification: '',
          supportingDocumentName: '',
          supportingDocumentContent: ''
        });
        setExistingDocumentName('')
        await loadData();
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        (typeof err === 'string' ? err : null) ||
        'Failed to submit override';
      setError(String(message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Supporting document too large (max 5MB)')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      // dataUrl is "data:<mime>;base64,<base64>" – extract only the base64 part
      const commaIndex = dataUrl.indexOf(',')
      if (commaIndex === -1 || !dataUrl.startsWith('data:')) {
        setError('Failed to read file. Please try again.')
        return
      }
      const base64 = dataUrl.slice(commaIndex + 1)
      setFormData((prev) => ({
        ...prev,
        supportingDocumentName: file.name,
        supportingDocumentContent: base64
      }))
    }
    reader.onerror = () => {
      setError('Failed to read file. Please try again.')
    }
    reader.readAsDataURL(file)
  }

  const handleDownloadExisting = () => {
    if (!existingDocumentName) return
    window.open(`/api/v1/banking/individual/impairment/overrides/documents/${encodeURIComponent(existingDocumentName)}`, '_blank', 'noopener,noreferrer')
  }

  const columns: GridColDef[] = [
    { field: 'customerName', headerName: 'Customer Name', flex: 1, minWidth: 200 },
    { field: 'accountNumber', headerName: 'Account Number', flex: 1, minWidth: 150 },
    {
      field: 'originalStage',
      headerName: 'Original Stage',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
          color="default"
        />
      )
    },
    {
      field: 'overrideStage',
      headerName: 'Override Stage',
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color="warning"
          size="small"
        />
      )
    },
    { field: 'justification', headerName: 'Justification', flex: 1.5, minWidth: 250 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'APPROVED' ? 'success' : params.value === 'REJECTED' ? 'error' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Requested At',
      width: 180,
      valueFormatter: (value: any) => {
        if (!value) return '-';
        return new Date(value).toLocaleString();
      }
    }
  ];

  return (
    <Container
      maxWidth="xl"
      sx={embedded ? { position: 'relative', minHeight: '80vh', px: '0 !important' } : { position: 'relative', minHeight: '80vh' }}
    >
      <ModernLoader
        open={loading}
        message="Loading Overrides"
        subMessage="Fetching assessment override requests..."
      />

      {!embedded && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Impairment Override
          </Typography>
        </Breadcrumbs>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={embedded ? 'h6' : 'h4'} component="h1">
          Impairment Override Trigger
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
          {embedded ? (
            <Chip
              label={accountNumber ? `Account ${accountNumber}` : (accountId ? `Account ID ${accountId}` : `Mode: ${mode}`)}
              size="small"
              variant="outlined"
            />
          ) : null}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenOverrideDialog}
          >
            New Override Request
          </Button>
        </Box>
      </Box>

      {accountId && assessmentData ? (
        <Stack spacing={3} sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Impairment Assessment Trigger
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Customer Details</Typography>
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Download Date</Typography>
                      <Typography fontWeight={600}>{formatDisplayDate(assessmentData.prc_date || assessmentData.prcDate)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Customer Number</Typography>
                      <Typography fontWeight={600}>{assessmentData.cif_number || assessmentData.cifNumber || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Customer Name</Typography>
                      <Typography fontWeight={600}>{assessmentData.cif_name || assessmentData.cifName || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Account Number</Typography>
                      <Typography fontWeight={600}>{assessmentData.account_number || assessmentData.accountNumber || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Currency</Typography>
                      <Typography fontWeight={600}>{assessmentData.currency || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Outstanding</Typography>
                      <Typography fontWeight={600}>{formatAmount(assessmentData.outstanding_balance || assessmentData.outstanding || 0)}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Day Past Due</Typography>
                      <Typography fontWeight={600}>{assessmentData.dpd ?? '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Collectability</Typography>
                      <Typography fontWeight={600}>{assessmentData.collectability ?? '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                      <Typography color="text.secondary">Rating</Typography>
                      <Typography fontWeight={600}>{assessmentData.rating_code || assessmentData.ratingCode || '-'}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between" gap={2} alignItems="center">
                      <Typography color="text.secondary">Impaired Flag</Typography>
                      <Chip
                        label={String(assessmentData.impaired_flag || 'N').toUpperCase() === 'I' ? 'Individual' : 'Non-Impaired'}
                        color={String(assessmentData.impaired_flag || 'N').toUpperCase() === 'I' ? 'warning' : 'default'}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>Early Warning Remarks</Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={10}
                    value={remarksDraft}
                    onChange={(event) => setRemarksDraft(event.target.value)}
                    placeholder="Input early warning remarks or use existing impairment reason"
                  />
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                    <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                      Reference
                      <input
                        type="file"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          void handleFileSelect(file);
                        }}
                      />
                    </Button>
                    {existingDocumentName ? (
                      <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadExisting}>
                        Download Existing
                      </Button>
                    ) : null}
                    <Button variant="contained" onClick={handleOpenOverrideDialog}>
                      Submit Override Request
                    </Button>
                    <Button variant="outlined" onClick={() => router.push(`/banking/individual/assessment?mode=${mode}&tab=watchlist`)}>
                      Back
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Upload Discounted Cash Flow
              </Typography>
              <Divider sx={{ mb: 3 }} />
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Choose DCF Scenario</Typography>
                  <Grid container spacing={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>DCF Scenario Rate</Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          value={selectedScenario}
                          displayEmpty
                          onChange={(event) => setSelectedScenario(String(event.target.value))}
                          renderValue={(value) => {
                            const selected = scenarioOptions.find((item) => String(item.scenarioCode || item.scenarioName || item.name || '') === String(value));
                            return selected
                              ? String(selected.scenarioName || selected.name || value)
                              : 'Select DCF Scenario Method';
                          }}
                        >
                          {scenarioOptions.map((option, index) => (
                            <MenuItem key={`${option.scenarioCode || option.scenarioName || option.name || index}`} value={String(option.scenarioCode || option.scenarioName || option.name || `Scenario ${index + 1}`)}>
                              {String(option.scenarioName || option.name || `Scenario ${index + 1}`)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Typography color="text.secondary" sx={{ mb: 1 }}>Number Of Scenario</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={scenarioCount}
                        onChange={(event) => setScenarioCount(Math.max(1, Math.min(3, Number(event.target.value) || 1)))}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <Button variant="contained" onClick={handleShowScenario} sx={{ mt: { xs: 1, md: 3 } }}>
                        Show
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                {scenarioRows.length > 0 ? (
                  <Box>
                    <Grid container spacing={2} sx={{ mb: 1 }}>
                      <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Possible Outcome Rate</Typography></Grid>
                      <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Scenario Name</Typography></Grid>
                      <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Period Start</Typography></Grid>
                      <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Period End</Typography></Grid>
                      <Grid size={{ xs: 12, md: 2 }}><Typography color="text.secondary">Repayment Rate (%)</Typography></Grid>
                      <Grid size={{ xs: 12, md: 2 }} />
                    </Grid>
                    <Stack spacing={2}>
                      {scenarioRows.map((row) => (
                        <Grid container spacing={2} key={row.id} alignItems="center">
                          <Grid size={{ xs: 12, md: 2 }}>
                            <TextField size="small" fullWidth type="number" value={row.possibleOutcomeRate} onChange={(event) => updateScenarioRow(row.id, 'possibleOutcomeRate', Number(event.target.value) || 0)} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 2 }}>
                            <TextField size="small" fullWidth value={row.scenarioName} onChange={(event) => updateScenarioRow(row.id, 'scenarioName', event.target.value)} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 2 }}>
                            <TextField size="small" fullWidth type="date" value={row.periodStart} onChange={(event) => updateScenarioRow(row.id, 'periodStart', event.target.value)} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 2 }}>
                            <TextField size="small" fullWidth type="date" value={row.periodEnd} onChange={(event) => updateScenarioRow(row.id, 'periodEnd', event.target.value)} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 2 }}>
                            <TextField size="small" fullWidth type="number" value={row.repaymentRate} onChange={(event) => updateScenarioRow(row.id, 'repaymentRate', Number(event.target.value) || 0)} />
                          </Grid>
                          <Grid size={{ xs: 12, md: 2 }}>
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="outlined"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => setScenarioRows((prev) => prev.filter((item) => item.id !== row.id))}
                              >
                                Delete
                              </Button>
                            </Stack>
                          </Grid>
                        </Grid>
                      ))}
                    </Stack>
                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap' }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddCircleIcon />}
                        onClick={() => setScenarioRows((prev) => [
                          ...prev,
                          ...buildScenarioRows(1, toIsoDate(assessmentData.prc_date || assessmentData.prcDate || new Date()), selectedScenario || 'Scenario').map((item) => ({
                            ...item,
                            id: `scenario-${Date.now()}-${prev.length + 1}`
                          }))
                        ].slice(0, 3))}
                      >
                        Add Scenario Row
                      </Button>
                      <Button variant="contained" onClick={handleSaveScenarioDraft}>
                        Save
                      </Button>
                    </Stack>
                  </Box>
                ) : null}

                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>Upload DCF</Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
                    <Typography color="text.secondary">File name</Typography>
                    <Button variant="contained" component="label" startIcon={<UploadIcon />}>
                      Browse
                      <input
                        type="file"
                        hidden
                        accept=".xlsx,.xls"
                        onChange={handleDcfFileChange}
                      />
                    </Button>
                    <Button variant="contained" color="inherit" onClick={handleDownloadTemplate} startIcon={<DownloadIcon />}>
                      Download Template
                    </Button>
                    {selectedDcfFile ? (
                      <Chip label={`${selectedDcfFile.name} • ${parsedDcfRows.length} rows`} variant="outlined" />
                    ) : null}
                  </Stack>

                  <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Account Number</TableCell>
                          <TableCell>Periode</TableCell>
                          <TableCell align="right">Principal</TableCell>
                          <TableCell align="right">Interest</TableCell>
                          <TableCell align="right">Collateral</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {parsedDcfRows.length > 0 ? parsedDcfRows.map((row, index) => (
                          <TableRow key={`${row.accountNumber}-${row.periode}-${index}`}>
                            <TableCell>{row.accountNumber}</TableCell>
                            <TableCell>{formatDisplayDate(row.periode)}</TableCell>
                            <TableCell align="right">{formatAmount(row.principal)}</TableCell>
                            <TableCell align="right">{formatAmount(row.interest)}</TableCell>
                            <TableCell align="right">{formatAmount(row.collateral)}</TableCell>
                          </TableRow>
                        )) : (
                          <TableRow>
                            <TableCell colSpan={5} align="center">
                              No DCF upload file selected.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                    <Button variant="contained" onClick={handleDcfUpload} disabled={uploadingDcf || parsedDcfRows.length === 0}>
                      {uploadingDcf ? 'Uploading...' : 'Submit'}
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedDcfFile(null);
                        setParsedDcfRows([]);
                      }}
                      disabled={uploadingDcf}
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Box>

                {persistedDcfDetail && (
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>DCF Upload Report Detail</Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 320 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Account Number</TableCell>
                              <TableCell>Periode</TableCell>
                              <TableCell align="right">Principal</TableCell>
                              <TableCell align="right">Interest</TableCell>
                              <TableCell align="right">Collateral</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {persistedDcfDetail.cashflows.length > 0 ? persistedDcfDetail.cashflows.map((row) => (
                              <TableRow key={row.pkid}>
                                <TableCell>{row.accountNumber}</TableCell>
                                <TableCell>{formatDisplayDate(row.periode)}</TableCell>
                                <TableCell align="right">{formatAmount(row.principal)}</TableCell>
                                <TableCell align="right">{formatAmount(row.interest)}</TableCell>
                                <TableCell align="right">{formatAmount(row.collateral)}</TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={5} align="center">No DCF upload data available.</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>

                    {persistedDcfDetail.header ? (
                      <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>IA Discounted Cash Flow Detail</Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Effective Date</TableCell>
                                <TableCell>Account Number</TableCell>
                                <TableCell>CIF Number</TableCell>
                                <TableCell>Customer Name</TableCell>
                                <TableCell>Currency</TableCell>
                                <TableCell align="right">Day Past Due</TableCell>
                                <TableCell align="right">Collectability</TableCell>
                                <TableCell>Rating</TableCell>
                                <TableCell align="right">Interest Rate</TableCell>
                                <TableCell align="right">Effective Interest Rate</TableCell>
                                <TableCell align="right">Outstanding</TableCell>
                                <TableCell align="right">Accrued Interest</TableCell>
                                <TableCell align="right">Carrying Amount</TableCell>
                                <TableCell align="right">EAD Amount</TableCell>
                                <TableCell align="right">PV DCF Amount</TableCell>
                                <TableCell align="right">ECL IA Amount</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              <TableRow>
                                <TableCell>{formatDisplayDate(persistedDcfDetail.header.effectiveDate)}</TableCell>
                                <TableCell>{persistedDcfDetail.header.accountNumber || '-'}</TableCell>
                                <TableCell>{persistedDcfDetail.header.cifNumber || '-'}</TableCell>
                                <TableCell>{persistedDcfDetail.header.cifName || '-'}</TableCell>
                                <TableCell>{persistedDcfDetail.header.currency || '-'}</TableCell>
                                <TableCell align="right">{persistedDcfDetail.header.dpd ?? 0}</TableCell>
                                <TableCell align="right">{persistedDcfDetail.header.collectability ?? 0}</TableCell>
                                <TableCell>{persistedDcfDetail.header.ratingCode || '-'}</TableCell>
                                <TableCell align="right">{formatAmount(persistedDcfDetail.header.interestRate)}</TableCell>
                                <TableCell align="right">{formatAmount(persistedDcfDetail.header.effInterestRate)}</TableCell>
                                <TableCell align="right">{formatAmount(persistedDcfDetail.header.outstanding)}</TableCell>
                                <TableCell align="right">{formatAmount(persistedDcfDetail.header.accruedInterest)}</TableCell>
                                <TableCell align="right">{formatAmount(persistedDcfDetail.header.carryingAmt)}</TableCell>
                                <TableCell align="right">{formatAmount(persistedDcfDetail.header.eadAmt)}</TableCell>
                                <TableCell align="right">{formatAmount(persistedDcfDetail.header.pvDcfAmt)}</TableCell>
                                <TableCell align="right">{formatAmount(persistedDcfDetail.header.eclIaAmt)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    ) : null}

                    <Box>
                      <Typography variant="h6" sx={{ mb: 2 }}>IA Detail Cash Flow</Typography>
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 420 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>No.</TableCell>
                              <TableCell>Estimated Date</TableCell>
                              <TableCell align="right">Principal</TableCell>
                              <TableCell align="right">Interest</TableCell>
                              <TableCell align="right">Installment</TableCell>
                              <TableCell align="right">Collateral</TableCell>
                              <TableCell align="right">Pos Rate 1</TableCell>
                              <TableCell align="right">Repayment Rate 1</TableCell>
                              <TableCell align="right">Default 1</TableCell>
                              <TableCell align="right">Pos Rate 2</TableCell>
                              <TableCell align="right">Repayment Rate 2</TableCell>
                              <TableCell align="right">Default 2</TableCell>
                              <TableCell align="right">Pos Rate 3</TableCell>
                              <TableCell align="right">Repayment Rate 3</TableCell>
                              <TableCell align="right">Default 3</TableCell>
                              <TableCell align="right">PW Amt</TableCell>
                              <TableCell align="right">Discount Factor</TableCell>
                              <TableCell align="right">PV Amt</TableCell>
                              <TableCell align="right">Beginning Balance</TableCell>
                              <TableCell align="right">EIR Amt</TableCell>
                              <TableCell align="right">Ending Balance</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {persistedDcfDetail.details.length > 0 ? persistedDcfDetail.details.map((row) => (
                              <TableRow key={row.pkid}>
                                <TableCell>{row.mob}</TableCell>
                                <TableCell>{formatDisplayDate(row.periode)}</TableCell>
                                <TableCell align="right">{formatAmount(row.principal)}</TableCell>
                                <TableCell align="right">{formatAmount(row.interest)}</TableCell>
                                <TableCell align="right">{formatAmount(row.installment)}</TableCell>
                                <TableCell align="right">{formatAmount(row.collateral)}</TableCell>
                                <TableCell align="right">{formatAmount(row.poRate1)}</TableCell>
                                <TableCell align="right">{formatAmount(row.rrRate1)}</TableCell>
                                <TableCell align="right">{formatAmount(row.default1)}</TableCell>
                                <TableCell align="right">{formatAmount(row.poRate2)}</TableCell>
                                <TableCell align="right">{formatAmount(row.rrRate2)}</TableCell>
                                <TableCell align="right">{formatAmount(row.default2)}</TableCell>
                                <TableCell align="right">{formatAmount(row.poRate3)}</TableCell>
                                <TableCell align="right">{formatAmount(row.rrRate3)}</TableCell>
                                <TableCell align="right">{formatAmount(row.default3)}</TableCell>
                                <TableCell align="right">{formatAmount(row.pwAmt)}</TableCell>
                                <TableCell align="right">{formatAmount(row.discountFactor)}</TableCell>
                                <TableCell align="right">{formatAmount(row.pvAmt)}</TableCell>
                                <TableCell align="right">{formatAmount(row.beginningBalance)}</TableCell>
                                <TableCell align="right">{formatAmount(row.eirAmt)}</TableCell>
                                <TableCell align="right">{formatAmount(row.endingBalance)}</TableCell>
                              </TableRow>
                            )) : (
                              <TableRow>
                                <TableCell colSpan={21} align="center">No IA detailed cash flow data available.</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Stack>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      ) : null}

      {/* 📊 Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Requests"
            value={data.length}
            icon={<ListIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
            subtitle="All Override Requests"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Pending"
            value={data.filter(c => c.status === 'PENDING').length}
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="#ed6c02"
            subtitle="Awaiting Approval"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Approved"
            value={data.filter(c => c.status === 'APPROVED').length}
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            color="#2e7d32"
            subtitle="Successfully Overridden"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Rejected"
            value={data.filter(c => c.status === 'REJECTED').length}
            icon={<CancelIcon sx={{ fontSize: 40 }} />}
            color="#d32f2f"
            subtitle="Denied Requests"
          />
        </Grid>
      </Grid>


      <Paper sx={{ height: 600, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {!embedded && <FullstackIndicator />}
        <SafeDataGrid
          rows={data}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
          getRowId={(row) => row.id || Math.random().toString()}
        />
      </Paper>

      {/* Create Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Override Request</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Customer Name"
              margin="normal"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              disabled={Boolean(accountId)}
            />
            <TextField
              fullWidth
              label="Account Number"
              margin="normal"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              disabled={Boolean(accountId)}
            />

            <Box display="flex" gap={2} mt={2}>
              <TextField
                fullWidth
                label="Current Stage"
                value={`Stage ${formData.currentStage}`}
                disabled
              />
              <FormControl fullWidth>
                <InputLabel>Override Stage</InputLabel>
                <Select
                  value={formData.overrideStage}
                  label="Override Stage"
                  onChange={(e) => setFormData({ ...formData, overrideStage: Number(e.target.value) })}
                >
                  <MenuItem value={1}>Stage 1</MenuItem>
                  <MenuItem value={2}>Stage 2</MenuItem>
                  <MenuItem value={3}>Stage 3</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <TextField
              fullWidth
              label="Justification"
              margin="normal"
              multiline
              rows={3}
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              helperText="Please provide a detailed reason for this override request."
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Supporting Document
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                  Upload File
                  <input
                    type="file"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      void handleFileSelect(file)
                    }}
                  />
                </Button>
                {existingDocumentName ? (
                  <Button
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    onClick={handleDownloadExisting}
                  >
                    Download Existing
                  </Button>
                ) : null}
                {formData.supportingDocumentName ? (
                  <Chip
                    label={formData.supportingDocumentName}
                    onDelete={() => setFormData((prev) => ({ ...prev, supportingDocumentName: '', supportingDocumentContent: '' }))}
                    deleteIcon={<ClearIcon />}
                    variant="outlined"
                  />
                ) : null}
              </Stack>
              {!(existingDocumentName || (formData.supportingDocumentName && formData.supportingDocumentContent)) ? (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>
                  File wajib diupload sebagai pendukung justification.
                </Typography>
              ) : null}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={
              loading
              || !formData.customerName
              || !formData.accountNumber
              || !formData.justification
              || (!(existingDocumentName || (formData.supportingDocumentName && formData.supportingDocumentContent)))
            }
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Container>
  );
}
