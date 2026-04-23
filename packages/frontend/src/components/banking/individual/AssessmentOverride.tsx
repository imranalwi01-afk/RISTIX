'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
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
  Stack
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
  Clear as ClearIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { individualImpairmentAPI } from '../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';
import { StatCard } from '@/components/common/StatCard';
import { useAssessmentWorkspaceEmbedded } from '@/app/banking/individual/assessment/embedded-context';

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

  const loadAssessmentData = async (accId: string) => {
    try {
      const response = await individualImpairmentAPI.getAssessment(accId);
      if (response.success && response.data) {
        const assessment = response.data;
        const currentStage = Number(assessment.stage ?? assessment.current_stage ?? assessment.previous_stage ?? 1)
        const resolvedAccountNumber = String(assessment.account_number || assessment.accountNumber || accountNumber || '').trim()
        const existingDoc = Array.isArray(assessment.supporting_documents) ? assessment.supporting_documents[0] : (assessment.supportingDocument || assessment.triggerFilename || '')
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

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        if (accountId) {
          await loadAssessmentData(accountId);
        } else {
          await loadData();
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
            onClick={() => setOpenDialog(true)}
          >
            New Override Request
          </Button>
        </Box>
      </Box>

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
