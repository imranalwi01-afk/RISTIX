'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Grid,
  Chip,
  Divider,
  Container,
  Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  CloudDownload as CloudDownloadIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { RAnalyticsComprehensiveDetail } from '../../maintenance/approval/components/RAnalyticsComprehensiveDetail';
import { useSnackbar } from 'notistack';
import { API_BASE_URL } from '@/services/api-setup';
import { getAuthToken } from '@/utils/auth-token';

function RAnalyticsDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get('id');
  const { enqueueSnackbar } = useSnackbar();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idParam) {
      fetchDetail(idParam);
    }
  }, [idParam]);

  const fetchDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = API_BASE_URL || '/api/v1';
      const fullUrl = baseUrl.startsWith('http') ? baseUrl : `${window.location.origin}${baseUrl}`;
      
      const response = await fetch(`${fullUrl}/r-analytics/pd-afl-history`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch data');
      const result = await response.json();
      
      const found = result.data?.find((item: any) => String(item.id) === id);
      if (found) {
        setData(found);
      } else {
        setError('Data not found');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred while fetching details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!data?.id) return;
    try {
      const baseUrl = API_BASE_URL || '/api/v1';
      const fullUrl = baseUrl.startsWith('http') ? baseUrl : `${window.location.origin}${baseUrl}`;
      
      const res = await fetch(`${fullUrl}/r-analytics/pd-afl-history/${data.id}/download`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (!res.ok) {
        if (res.status === 404) {
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const text = await res.text();
            try {
              const json = JSON.parse(text);
              if (json.success === false) {
                enqueueSnackbar(`Gagal mengunduh: ${json.error || 'File tidak ditemukan'}`, { variant: 'error' });
                return;
              }
            } catch (e) {}
          }
          enqueueSnackbar('File tidak ditemukan. File output belum tersimpan atau data kosong pada proses sebelumnya.', { variant: 'error' });
        } else {
          enqueueSnackbar(`Terjadi kesalahan server saat mengunduh file (HTTP ${res.status})`, { variant: 'error' });
        }
        return;
      }

      // If success, create blob and download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Try to get filename from headers, otherwise fallback to default
      let filename = `Report_Data_${data.id}.xlsx`;
      const contentDisposition = res.headers.get('content-disposition');
      if (contentDisposition && contentDisposition.includes('filename=')) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches != null && matches[1]) { 
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download report', err);
      enqueueSnackbar('Terjadi kesalahan jaringan saat mengunduh file.', { variant: 'error' });
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'APPROVED') return 'success';
    if (status === 'REJECTED') return 'error';
    if (status === 'PENDING_APPROVAL') return 'warning';
    return 'default';
  };

  if (!idParam) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <AssessmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No Submission Selected
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Please select a submission from the Approval Submission tab to view details.
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/banking/analytics/r-analytics-approval')}
          >
            Go to Approval Submission
          </Button>
        </Paper>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!data) return null;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.push('/banking/analytics/r-analytics-approval')}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Box sx={{ p: 1.5, bgcolor: 'primary.main', borderRadius: 1.5, display: 'flex' }}>
          <AssessmentIcon sx={{ color: 'white' }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Approval Detail
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive view of R Analytics PD-AFL submission ID: {data.id}
          </Typography>
        </Box>
        <Chip 
          label={data.model_status || data.modelStatus || 'DRAFT'} 
          color={getStatusColor(data.model_status || data.modelStatus) as any}
          variant="filled"
          sx={{ fontWeight: 'bold', px: 1, height: 32 }}
        />
      </Box>

      <Paper sx={{ p: 4, borderRadius: 2, mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
          Submission Metadata
        </Typography>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">Model Name</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {data.model_name || data.modelName || 'N/A'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">Submit Date</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {data.created_date || data.createdAt ? new Date(data.created_date || data.createdAt).toLocaleString() : 'N/A'}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Typography variant="body2" color="text.secondary">Submitted By</Typography>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {data.created_by || data.createdBy || 'System (R Analytics Engine)'}
            </Typography>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 4 }} />
        
        <RAnalyticsComprehensiveDetail data={data} hideDownloadButton={true} />
      </Paper>

      <Paper sx={{ p: 4, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'grey.50' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Raw Model Data</Typography>
          <Typography variant="body2" color="text.secondary">
            Download the raw R calculation output (.xlsx format) for local inspection and validation.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CloudDownloadIcon />}
          onClick={handleDownload}
          sx={{ px: 4, py: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Download Output (.xlsx)
        </Button>
      </Paper>
    </Container>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>}>
      <RAnalyticsDetailPage />
    </Suspense>
  );
}
