'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Grid,
  Stack,
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
} from '@mui/icons-material';
import { individualImpairmentAPI } from '../../../services/api/individual-impairment.api';
import { INDIVIDUAL_IMPAIRMENT_V2_API_BASE } from '../../../services/api/individual-impairment-v2-client';
import { buildIndividualAssessmentUrl, isIndividualAssessmentV2Path } from '@/features/individual-impairment/routing';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';
import { StatCard } from '@/components/common/StatCard';
import { useAssessmentWorkspaceEmbedded } from '@/app/banking/individual/assessment/embedded-context';
import * as XLSX from 'xlsx';
import { AssessmentTriggerCard } from './assessment-override/AssessmentTriggerCard';
import { DcfScenarioUploadCard } from './assessment-override/DcfScenarioUploadCard';
import { OverrideRequestDialog } from './assessment-override/OverrideRequestDialog';
import { ProcessedIaResultCard } from './assessment-override/ProcessedIaResultCard';
import { DcfScenarioRow, OverrideRequestFormData, ParsedDcfRow, PersistedIaResultDetail } from './assessment-override/types';
import { formatDisplayDate } from './assessment-override/utils';

const TEMPLATE_HEADERS = ['ACCOUNT_NUMBER', 'PERIODE', 'PRINCIPAL', 'INTEREST', 'COLLATERAL'];

const toIsoDate = (value?: string | Date | null) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
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
  const pathname = usePathname();
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
  const [formData, setFormData] = useState<OverrideRequestFormData>({
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
      return false;
    }

    try {
      setUploadingDcf(true);
      const selected = scenarioOptions.find((item) => String(item.scenarioCode || item.scenarioName || item.name || '') === selectedScenario);
      const effectiveRows = scenarioRows.slice(0, 3);
      await individualImpairmentAPI.createBatchUpload({
        fileName: selectedDcfFile.name,
        batchId: `DCF-${Date.now()}`,
        scenario: {
          scenarioId: Number(selected?.scenarioId || 1),
          scenarioCode: String(selected?.scenarioCode || selectedScenario || 'POSSIBLE_OUTCOME_AND_REPAYMENT_RATE').toUpperCase().replace(/\s+/g, '_'),
          scenarioName: String(selected?.scenarioName || selected?.name || selectedScenario || 'Possible Outcome and Repayment Rate'),
          description: remarksDraft || '',
          nOfScenario: effectiveRows.length || Math.max(1, Math.min(3, scenarioCount || 1)),
          scenarioRows: effectiveRows
        },
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
      setSuccess(`DCF upload submitted and IA detail rebuilt with ${parsedDcfRows.length} rows`);
      await loadPersistedDcfDetail({
        accountId: String(assessmentData.account_id),
        accountNumber: formData.accountNumber || assessmentData.account_number || undefined
      });
      return true;
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to upload DCF rows');
      return false;
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
      const response = await individualImpairmentAPI.createOverride({
        customerName: formData.customerName,
        accountNumber: formData.accountNumber,
        overrideStage: String(formData.overrideStage),
        justification: formData.justification,
        supportingDocumentName: formData.supportingDocumentName || undefined,
        supportingDocumentContent: formData.supportingDocumentContent || undefined,
      });
      if (response?.approvalRequired) {
        setSuccess(response?.message || `Override approval request created${response?.requestId ? ` (${response.requestId})` : ''}`);
      } else {
        setSuccess('Override request submitted successfully');
      }
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
    const base = isIndividualAssessmentV2Path(pathname)
      ? INDIVIDUAL_IMPAIRMENT_V2_API_BASE
      : '/api/v1/banking/individual/impairment';
    window.open(`${base}/overrides/documents/${encodeURIComponent(existingDocumentName)}`, '_blank', 'noopener,noreferrer')
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

  const persistedHeader = persistedDcfDetail?.header || null;
  const persistedCashflows = persistedDcfDetail?.cashflows || [];
  const persistedIaDetails = persistedDcfDetail?.details || [];

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
          {!accountId ? (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenOverrideDialog}
            >
              New Override Request
            </Button>
          ) : null}
        </Box>
      </Box>

      {accountId && assessmentData ? (
        <Stack spacing={3} sx={{ mb: 4 }}>
          <AssessmentTriggerCard
            assessmentData={assessmentData}
            remarksDraft={remarksDraft}
            onRemarksChange={setRemarksDraft}
            onReferenceSelect={handleFileSelect}
            existingDocumentName={existingDocumentName}
            onDownloadExisting={handleDownloadExisting}
            onOpenOverrideDialog={handleOpenOverrideDialog}
            onBack={() => {
              const params = new URLSearchParams({ mode, tab: 'watchlist' });
              router.push(buildIndividualAssessmentUrl(params, pathname));
            }}
          />

          <DcfScenarioUploadCard
            selectedScenario={selectedScenario}
            scenarioOptions={scenarioOptions}
            onSelectedScenarioChange={setSelectedScenario}
            scenarioCount={scenarioCount}
            onScenarioCountChange={setScenarioCount}
            onShowScenario={handleShowScenario}
            scenarioRows={scenarioRows}
            onUpdateScenarioRow={updateScenarioRow}
            onDeleteScenarioRow={(id) => setScenarioRows((prev) => prev.filter((item) => item.id !== id))}
            onAddScenarioRow={() => setScenarioRows((prev) => [
              ...prev,
              ...buildScenarioRows(1, toIsoDate(assessmentData.prc_date || assessmentData.prcDate || new Date()), selectedScenario || 'Scenario').map((item) => ({
                ...item,
                id: `scenario-${Date.now()}-${prev.length + 1}`
              }))
            ].slice(0, 3))}
            onSaveScenarioDraft={handleSaveScenarioDraft}
            onDcfFileChange={handleDcfFileChange}
            onDownloadTemplate={handleDownloadTemplate}
            selectedDcfFile={selectedDcfFile}
            parsedDcfRows={parsedDcfRows}
            onSubmitDcf={handleDcfUpload}
            onCancelDcf={() => {
              setSelectedDcfFile(null);
              setParsedDcfRows([]);
            }}
            uploadingDcf={uploadingDcf}
            reviewSlot={persistedDcfDetail ? (
              <ProcessedIaResultCard
                embedded
                persistedHeader={persistedHeader}
                persistedCashflows={persistedCashflows}
                persistedIaDetails={persistedIaDetails}
              />
            ) : null}
          />
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

      <OverrideRequestDialog
        open={openDialog}
        accountId={accountId}
        formData={formData}
        onFormDataChange={setFormData}
        existingDocumentName={existingDocumentName}
        onFileSelect={handleFileSelect}
        onDownloadExisting={handleDownloadExisting}
        onClose={() => setOpenDialog(false)}
        onSubmit={handleCreate}
        loading={loading}
      />

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Container>
  );
}
