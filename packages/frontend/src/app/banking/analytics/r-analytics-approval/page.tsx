// packages/frontend/src/app/banking/analytics/r-analytics-approval/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Grid,
  Divider,
  Snackbar,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Send as SendIcon,
  Assessment as AssessmentIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { RootState, selectUser } from '../../../../store';
import { Can } from '@/components/rbac/Can';
import { bankingAPI, api } from '@/services/api';

export default function RAnalyticsApprovalPage() {
  const router = useRouter();
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success'|'error'|'warning'|'info' });
  const [recentData, setRecentData] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const response = await api.client.get('/r-analytics/pd-afl-history');
      
      if (response.data?.success && response.data?.data) {
        setHistoryData(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchRecentData = async () => {
    setLoading(true);
    try {
      const response = await api.client.get('/r-analytics/saved');
      
      if (response.data?.success && response.data?.data) {
        setRecentData(response.data.data);
      } else {
        setRecentData(null);
      }
    } catch (err) {
      console.error(err);
      setRecentData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentData();
    fetchHistory();
  }, []);

  const handleSubmit = async () => {
    if (recentData?.model_status === 'PENDING_APPROVAL' || recentData?.modelStatus === 'PENDING_APPROVAL') {
      setSnackbar({ 
        open: true, 
        message: 'List ini telah diajukan sebelumnya dan masih menunggu persetujuan (PENDING_APPROVAL).', 
        severity: 'warning' 
      });
      return;
    }

    try {
      setSubmitting(true);
      
      // 1. Submit to frs9_r_pd_afl table via new endpoint
      const submitRes = await api.client.post('/r-analytics/submit', {
        id: recentData.id,
        model_name: recentData.model_name,
        r_squared: recentData.r_squared,
        mape: recentData.mape,
        snapshot_date: recentData.created_date
      });
      const submitData = submitRes.data;
      const aflId = submitData.data?.id || recentData.id;

      // 2. Trigger approval request flow
      const payload = {
        entityType: 'r_analytics_comprehensive',
        entityId: String(aflId),
        requestData: {
          operation: 'create',
          id: aflId, // Send the ID of the new frs9_r_pd_afl record
          model_name: recentData.model_name,
          r_squared: recentData.r_squared,
          mape: recentData.mape,
          snapshot_date: recentData.created_date
        },
        description: `R Analytics PD-AFL Result submitted by ${(user as any)?.fullName || 'User'}`,
        impactLevel: 'high' as const,
        title: `R Analytics PD-AFL Results - ${recentData.model_name || new Date().toLocaleDateString()}`
      };

      await bankingAPI.approval.createRequest(payload);
      setSnackbar({ open: true, message: 'Successfully submitted for approval!', severity: 'success' });
      setRecentData(null);
      fetchHistory();
    } catch (error: any) {
      setSnackbar({ open: true, message: error?.message || 'Failed to submit', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>;
  }

  return (
    <Can
      permission={['banking.analytics.r.view', 'banking.analytics.view']}
      fallback={<Box sx={{ p: 3 }}><Alert severity="error">You do not have permission to access R Analytics.</Alert></Box>}
    >
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
            <AssessmentIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Approval Submission</Typography>
              <Typography variant="body1" color="text.secondary">
                Review your recently saved R Analytics calculations and submit them for approval.
              </Typography>
            </Box>
            <Box sx={{ flexGrow: 1 }} />
            <Button variant="outlined" onClick={fetchRecentData} disabled={loading} startIcon={<RefreshIcon />}>
              Refresh Data
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : !recentData ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Tidak ada kalkulasi terbaru yang siap disubmit. Silakan klik "Save PD To DB" di tab R Analytics Engine terlebih dahulu.
            </Alert>
          ) : (
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 4 }}>
              <Alert severity="warning" sx={{ mb: 4 }}>
                Anda akan mengajukan hasil kalkulasi PD-AFL ini ke proses Approval Maker-Checker.
              </Alert>
              
              <Grid container spacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Model Name</Typography>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                    {recentData.model_name}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>Saved Date</Typography>
                  <Typography variant="body1" sx={{ mb: 3, fontWeight: 500 }}>
                    {new Date(recentData.created_date).toLocaleString()}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Metrics Summary</Typography>
                    <Box sx={{ display: 'flex', gap: 4 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">R-Squared (R²)</Typography>
                        <Typography variant="h5" color="primary.main"><strong>{recentData.r_squared}</strong></Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">MAPE</Typography>
                        <Typography variant="h5" color="primary.main"><strong>{recentData.mape}%</strong></Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                  onClick={handleSubmit}
                  disabled={submitting || (recentData.model_status === 'APPROVED')}
                >
                  {recentData.model_status === 'APPROVED'
                    ? `Cannot Submit (APPROVED)` 
                    : 'Submit for Approval'}
                </Button>
              </Box>
            </Box>
          )}
        </Paper>

        <Paper sx={{ mt: 4, p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
            <HistoryIcon color="action" />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>Submission History</Typography>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Model Name</strong></TableCell>
                  <TableCell><strong>R-Squared</strong></TableCell>
                  <TableCell><strong>MAPE</strong></TableCell>
                  <TableCell><strong>Submit Date</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingHistory ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : historyData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                      Tidak ada riwayat pengajuan.
                    </TableCell>
                  </TableRow>
                ) : (
                  historyData.map((row) => (
                    <TableRow 
                      key={row.id} 
                      hover
                      onClick={() => {
                        setRecentData({
                          id: row.id,
                          model_name: row.model_name || row.modelName,
                          r_squared: row.r_squared || row.rSquared,
                          mape: row.mape,
                          created_date: row.created_date || row.createdAt,
                          model_status: row.model_status || row.modelStatus
                        });
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      sx={{ cursor: 'pointer', bgcolor: recentData?.id === row.id ? 'action.selected' : 'inherit' }}
                    >
                      <TableCell>{row.id}</TableCell>
                      <TableCell sx={{ fontFamily: 'monospace' }}>{row.model_name || row.modelName || 'N/A'}</TableCell>
                      <TableCell>{row.r_squared || row.rSquared ? Number(row.r_squared || row.rSquared).toFixed(4) : '-'}</TableCell>
                      <TableCell>{row.mape ? `${Number(row.mape).toFixed(4)}%` : '-'}</TableCell>
                      <TableCell>{row.created_date || row.createdAt ? new Date(row.created_date || row.createdAt).toLocaleString() : 'N/A'}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.model_status || row.modelStatus || 'DRAFT'} 
                          size="small"
                          color={
                            (row.model_status || row.modelStatus) === 'APPROVED' ? 'success' :
                            (row.model_status || row.modelStatus) === 'REJECTED' ? 'error' :
                            (row.model_status || row.modelStatus) === 'PENDING_APPROVAL' ? 'warning' : 'default'
                          }
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/banking/analytics/r-analytics-detail?id=${row.id}`);
                          }}
                        >
                          Detail
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
          <Alert severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Can>
  );
}

// Icon Helper since we didn't import Refresh earlier
function RefreshIcon(props: any) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
    </svg>
  );
}
