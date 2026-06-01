// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
  Tooltip,
  Snackbar,
  Alert as MuiAlert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Clear as ClearIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Visibility as VisibilityIcon,
  Calculate as CalculateIcon,
  Upload as UploadIcon,
  Download as DownloadIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import {
  type IndividualImpairmentWatchlistItem,
  type IndividualImpairmentAssessment,
  individualImpairmentAPI
} from '@/services/api.individual-impairment';
import { useCurrencyDisplay } from '@/providers/CurrencyDisplayProvider';



interface AssessmentDetailsTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  assessment: IndividualImpairmentAssessment | null;
  onUpdateAssessment?: (data: Partial<IndividualImpairmentAssessment>) => Promise<{ success: boolean; message?: string }>;
  onTabChange?: (tabKey: string) => void;
  assessmentData?: any;
  historyData?: any[];
}

export function AssessmentDetailsTab({ account, assessment, onUpdateAssessment, onTabChange, assessmentData: propAssessmentData, historyData: propHistoryData }: AssessmentDetailsTabProps) {
  const { formatMoney } = useCurrencyDisplay();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [internalAssessmentData, setInternalAssessmentData] = useState<any>(null);
  const [internalHistoryData, setInternalHistoryData] = useState<any[]>([]);
  const assessmentData = propAssessmentData || internalAssessmentData;
  const historyData = propHistoryData || internalHistoryData;
  const router = useRouter();

  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideForm, setOverrideForm] = useState({
    overrideStage: 2,
    impairedFlag: 'Individual',
    justification: '',
    supportingDocumentName: '',
    supportingDocumentContent: ''
  });



  useEffect(() => {
    if (account?.account_id) {
      loadAssessmentData();
    }
  }, [account?.account_id]);

  const loadAssessmentData = async () => {
    if (!account?.account_id || propAssessmentData) return;
    setLoading(true);
    try {
      const response = await individualImpairmentAPI.assessment.get(Number(account.account_id));
      if (response.success) {
        setInternalAssessmentData(response.data.header || response.data);
      }
    } catch (err: any) {
      console.error('Failed to load assessment:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!account?.account_id || propHistoryData) return;
    try {
      const response = await individualImpairmentAPI.assessment.getHistory(Number(account.account_id));
      if (response.success) {
        setInternalHistoryData(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load history:', err);
    }
  };

  useEffect(() => {
    if (account?.account_id) {
      loadHistory();

      // Auto-open edit form if coming from Review/Edit action
      const params = new URLSearchParams(window.location.search);
      if (params.get('edit') === 'true' && assessmentData) {
        // Pre-fill form if we have assessment data
        const currentJustification = assessmentData.justification || assessmentData.analyst_comments || "";
        const currentStage = assessmentData.stage || account?.stage || 1;
        const currentImpairedFlag = (assessmentData.impaired_flag || account?.impaired_flag) === 'I' ? 'Individual' : 'Collective';

        setOverrideForm(prev => ({
          ...prev,
          justification: currentJustification || prev.justification,
          overrideStage: Number(currentStage) || prev.overrideStage,
          impairedFlag: currentImpairedFlag || prev.impairedFlag
        }));

        setOverrideDialogOpen(true);
      }
    }
  }, [account?.account_id, assessmentData, account?.stage, account?.impaired_flag]);

  const handleDownload = async (fileName: string) => {
    if (!fileName) return;
    try {
      await individualImpairmentAPI.documents.download(fileName);
    } catch (err) {
      console.error('❌ Download failed:', err);
      alert('Gagal mendownload file.');
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('File terlalu besar (maks 5MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const commaIndex = dataUrl.indexOf(',');
      if (commaIndex === -1) {
        setError('Gagal membaca file');
        return;
      }
      const base64 = dataUrl.slice(commaIndex + 1);
      setOverrideForm(prev => ({
        ...prev,
        supportingDocumentName: file.name,
        supportingDocumentContent: base64
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOverride = async () => {
    if (!account || !overrideForm.justification || !overrideForm.supportingDocumentName) {
      setError('Mohon lengkapi semua field yang wajib');
      return;
    }

    setLoading(true);
    try {
      const overrideData = {
        accountId: Number(account.account_id),
        accountNumber: account.account_number,
        customerName: account.cif_name,
        overrideStage: String(overrideForm.overrideStage),
        impairedFlag: overrideForm.impairedFlag,
        justification: overrideForm.justification,
        supportingDocumentName: overrideForm.supportingDocumentName,
        supportingDocumentContent: overrideForm.supportingDocumentContent
      };

      if (onUpdateAssessment) {
        // If parent handles updates, we stage it
        const res = await onUpdateAssessment({ stagedOverride: overrideData } as any);
        if (res.success) {
          setSuccess('Override staged successfully. Don\'t forget to submit the final assessment package.');
          setOverrideDialogOpen(false);
          loadAssessmentData();
        } else {
          setError(res.message || 'Failed to stage override');
        }
        return;
      }

      const response = await individualImpairmentAPI.createOverride(overrideData);

      if (response.success) {
        setSuccess('Override request submitted successfully');
        setOverrideDialogOpen(false);
        setOverrideForm({ overrideStage: 2, impairedFlag: 'Individual', justification: '', supportingDocumentName: '', supportingDocumentContent: '' });
        loadAssessmentData();
        loadHistory();

        // UX: Automatically navigate to History tab
        if (onTabChange) {
          onTabChange('history');
        }
      } else {
        setError(response.message || 'Failed to submit override');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit override');
    } finally {
      setLoading(false);
    }
  };

  const toFiniteNumber = (value: unknown, fallback = 0) => {
    const normalized = typeof value === 'string' ? value.replace(/[^\d.-]/g, '') : value;
    const numeric = Number(normalized);
    return Number.isFinite(numeric) ? numeric : fallback;
  };

  const formatCurrency = (amount: unknown) => formatMoney(toFiniteNumber(amount), 'IDR');

  const renderStageChip = (stage: number) => {
    const colors: Record<number, 'success' | 'warning' | 'secondary'> = { 1: 'success', 2: 'warning', 3: 'secondary' };
    return <Chip label={`Stage ${stage}`} color={colors[stage] || 'default'} size="small" />;
  };

  const renderStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: 'success' | 'warning' | 'secondary' | 'info' | 'default'; icon: React.ReactNode }> = {
      PENDING: { color: 'warning', icon: <ScheduleIcon fontSize="small" /> },
      IN_PROGRESS: { color: 'info', icon: <EditIcon fontSize="small" /> },
      COMPLETED: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      REVIEWED: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      APPROVED: { color: 'success', icon: <CheckCircleIcon fontSize="small" /> },
      REJECTED: { color: 'secondary', icon: <WarningIcon fontSize="small" /> }
    };
    const config = statusConfig[status] || { color: 'default' as const, icon: null };
    return <Chip label={status} color={config.color} size="small" icon={config.icon as React.ReactElement} />;
  };

  if (!account) {
    return (
      <Alert severity="info">
        Pilih debitur dari Watchlist untuk melihat detail assessment.
      </Alert>
    );
  }

  const currentStage = assessmentData?.stage || account?.stage || 1;
  const currentStatus = assessmentData?.assessment_status || assessmentData?.approval_status || account?.assessment_status || 'PENDING';

  return (
    <Box sx={{ width: '100%', boxSizing: 'border-box' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Details - {account.account_number}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color={currentStatus === 'APPROVED' ? 'warning' : 'primary'}
            size="small"
            onClick={() => {
              // Pre-fill form on manual click too
              const currentJustification = assessmentData?.justification || "";
              const currentStage = assessmentData?.stage || account?.stage || 1;
              const currentImpairedFlag = (assessmentData?.impaired_flag || account?.impaired_flag) === 'I' ? 'Individual' : 'Collective';

              setOverrideForm(prev => ({
                ...prev,
                justification: currentJustification || prev.justification,
                overrideStage: Number(currentStage) || prev.overrideStage,
                impairedFlag: currentImpairedFlag || prev.impairedFlag
              }));

              setOverrideDialogOpen(true);
            }}
            startIcon={<EditIcon />}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {currentStatus === 'APPROVED' ? 'Revise Assessment' : 'Stage Adjustment'}
          </Button>
        </Box>
      </Box>

      {currentStatus === 'REJECTED' && (
        <Alert
          severity="error"
          variant="filled"
          sx={{ mb: 3, borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}
          icon={<WarningIcon />}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Assessment Rejected</Typography>
          <Typography variant="body2">
            Reason: {assessmentData?.justification || historyData.find(h => h.status === 'REJECTED')?.details || 'No reason provided.'}
          </Typography>
        </Alert>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Customer Information
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                  <Typography variant="body1" fontWeight={600}>{account.cif_name}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">CIF Number</Typography>
                  <Typography variant="body1">{account.cif_number}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Account Number</Typography>
                  <Typography variant="body1">{account.account_number}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Currency</Typography>
                  <Typography variant="body1">{account.currency || 'IDR'}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Outstanding Balance</Typography>
                  <Typography variant="body1" fontWeight={600}>{formatCurrency(account.outstanding_balance)}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Assessment Status
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Current Stage</Typography>
                  <Box sx={{ mt: 0.5 }}>{renderStageChip(currentStage)}</Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Assessment Status</Typography>
                  <Box sx={{ mt: 0.5 }}>{renderStatusChip(currentStatus)}</Box>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Impaired Flag</Typography>
                  <Chip
                    label={account.impaired_flag === 'I' ? 'Impaired' : 'Not Impaired'}
                    color={account.impaired_flag === 'I' ? 'error' : 'default'}
                    size="small"
                    variant={account.impaired_flag === 'I' ? 'filled' : 'outlined'}
                  />
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Provision Amount</Typography>
                  <Typography variant="body1" fontWeight={600} color="error.main">
                    {formatCurrency(account.provision_amount || 0)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">DPD (Days Past Due)</Typography>
                  <Typography variant="body1">{account.dpd || 0}</Typography>
                </Grid>
                <Grid size={{ xs: 6, md: 6 }}>
                  <Typography variant="body2" color="text.secondary">Rating Code</Typography>
                  <Typography variant="body1">{account.rating_code || '-'}</Typography>
                </Grid>
                {/* Maker Justification (Try to find original from history first) */}
                {(() => {
                  const makerAction = historyData.find(h => h.action === 'CREATE' || h.action === 'SUBMIT');
                  const justification = makerAction?.details || (currentStatus === 'PENDING' ? assessmentData?.justification : null);

                  if (!justification) return null;

                  return (
                    <Grid size={12}>
                      <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                      <Box sx={{ p: 1.5, bgcolor: 'primary.50', borderRadius: 1, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                        <Typography variant="caption" color="primary.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                          Maker Justification
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontWeight: 500 }}>
                          "{justification}"
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })()}

                {/* Checker Comment */}
                {(() => {
                  const checkerAction = historyData.find(h => h.action === 'APPROVE' || h.action === 'REJECT');
                  if (!checkerAction) return null;

                  const cleanComment = checkerAction.details?.replace(/^Checker Comment: /, '').replace(/ \[Checker File: .*\]$/, '') || 'No comment provided.';

                  return (
                    <Grid size={12}>
                      <Box sx={{ p: 1.5, mt: 1, bgcolor: 'success.50', borderRadius: 1, borderLeft: '4px solid', borderColor: 'success.main' }}>
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                          Checker Comment
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontWeight: 500 }}>
                          "{cleanComment}"
                        </Typography>
                      </Box>
                    </Grid>
                  );
                })()}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={12}>
          <Card sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid', borderColor: 'divider' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fafafa' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                  <HistoryIcon sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
                  Assessment & Approval History
                </Typography>
                {historyData.length > 0 && (
                  <Chip label={`${historyData.length} Records`} size="small" variant="outlined" sx={{ fontWeight: 600, height: 20, fontSize: '0.65rem' }} />
                )}
              </Box>

              {historyData.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#fdfdfd' }}>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.5 }}>Timestamp</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.5 }}>Action</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.5 }}>Performed By</TableCell>
                        <TableCell sx={{ fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase', color: 'text.secondary', py: 1.5 }}>Details / Justification</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {historyData.map((item, index) => {
                        const dateVal = item.timestamp || item.performedAt;
                        const actorVal = item.actor || item.performedBy || '-';
                        const reasonVal = item.details || item.reason || '-';
                        const statusVal = item.status || item.action;

                        const getActionColor = (action: string) => {
                          const a = String(action).toUpperCase();
                          if (a === 'APPROVE' || a === 'APPROVED') return 'success';
                          if (a === 'REJECT' || a === 'REJECTED') return 'error';
                          if (a === 'SUBMIT' || a === 'SUBMITTED') return 'info';
                          if (a === 'CREATE') return 'primary';
                          return 'default';
                        };

                        return (
                          <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ whiteSpace: 'nowrap', fontSize: '0.75rem', py: 1.5 }}>
                              {dateVal ? new Date(dateVal).toLocaleString('id-ID', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '-'}
                            </TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Chip
                                label={statusVal || '-'}
                                size="small"
                                color={getActionColor(statusVal) as any}
                                sx={{ fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600, py: 1.5 }}>{actorVal}</TableCell>
                            <TableCell sx={{ py: 1.5 }}>
                              <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.primary', maxWidth: 450, lineHeight: 1.4 }}>
                                {reasonVal}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box sx={{ py: 4, px: 2, textAlign: 'center' }}>
                   <HistoryIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1, opacity: 0.5 }} />
                   <Typography variant="body2" color="text.secondary">Belum ada riwayat assessment untuk akun ini.</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog
        open={overrideDialogOpen}
        onClose={() => setOverrideDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, bgcolor: currentStatus === 'APPROVED' ? 'warning.50' : 'primary.50' }}>
          {currentStatus === 'APPROVED' ? 'Revise Approved Assessment' : 'Stage Assessment Adjustment'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, pb: 3 }}>
          {/* Enhanced Customer Context Section */}
          <Box sx={{
            mt: 2,
            mb: 3,
            p: 2,
            borderRadius: 2,
            bgcolor: 'grey.50',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountCircleIcon sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                Customer Context
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">Account & CIF</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {account.account_number} <br />
                  <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>{account.cif_name}</span>
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">Outstanding Balance</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {formatCurrency(account.outstanding_balance)}
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">Current Stage</Typography>
                <Box sx={{ mt: 0.25 }}>{renderStageChip(currentStage)}</Box>
              </Grid>
              <Grid size={6}>
                <Typography variant="caption" color="text.secondary">DPD / Rating</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {account.dpd || 0} Days / {account.rating_code || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <FormControl fullWidth>
              <InputLabel>Impaired Flag</InputLabel>
              <Select
                value={overrideForm.impairedFlag}
                label="Impaired Flag"
                onChange={(e) => setOverrideForm({ ...overrideForm, impairedFlag: e.target.value as string })}
              >
                <MenuItem value="Individual">Individual</MenuItem>
                <MenuItem value="Collective">Collective</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Override Stage</InputLabel>
              <Select
                value={overrideForm.overrideStage}
                label="Override Stage"
                onChange={(e) => setOverrideForm({ ...overrideForm, overrideStage: Number(e.target.value) })}
              >
                <MenuItem value={1}>Stage 1</MenuItem>
                <MenuItem value={2}>Stage 2</MenuItem>
                <MenuItem value={3}>Stage 3</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Justification"
              multiline
              rows={3}
              value={overrideForm.justification}
              onChange={(e) => setOverrideForm({ ...overrideForm, justification: e.target.value })}
              helperText="Mohon berikan alasan detail untuk request override ini."
            />
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Supporting Document</Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
                <Button variant="outlined" component="label" startIcon={<UploadIcon />}>
                  Upload File
                  <input type="file" hidden onChange={(e) => handleFileSelect(e.target.files?.[0] || null)} />
                </Button>
                {overrideForm.supportingDocumentName && (
                  <Chip
                    label={overrideForm.supportingDocumentName}
                    onDelete={() => setOverrideForm(prev => ({ ...prev, supportingDocumentName: '', supportingDocumentContent: '' }))}
                    deleteIcon={<ClearIcon />}
                    variant="outlined"
                  />
                )}
              </Stack>
              {!overrideForm.supportingDocumentName && (
                <Typography variant="caption" color="warning" sx={{ display: 'block', mt: 0.75 }}>
                  File wajib diupload sebagai pendukung justification.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOverrideDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmitOverride}
            variant="contained"
            color="primary"
            disabled={loading || !overrideForm.justification || !overrideForm.supportingDocumentName}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            {loading ? 'Processing...' : 'Stage Adjustment'}
          </Button>
        </DialogActions>
      </Dialog>



      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <MuiAlert severity="warning" onClose={() => setError(null)}>{error}</MuiAlert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <MuiAlert severity="success" onClose={() => setSuccess(null)}>{success}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
