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

function RAnalyticsDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const idParam = searchParams.get('id');

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
      const response = await fetch('/api/v1/r-analytics/pd-afl-history');
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

  const handleDownload = () => {
    if (!idParam) return;
    window.location.href = `/api/v1/r-analytics/pd-afl-history/${idParam}/download`;
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
