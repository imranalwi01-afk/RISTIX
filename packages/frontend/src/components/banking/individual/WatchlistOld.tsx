'use client';

import React, { useState, useEffect } from 'react';
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
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Grid
} from '@mui/material';
import {
  GridColDef,
  GridToolbar
} from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  List as ListIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { individualImpairmentAPI } from '../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';
import { StatCard } from '@/components/common/StatCard';
import { useAssessmentWorkspaceEmbedded } from '@/app/banking/individual/assessment/embedded-context';

export const WatchlistOld = () => {
  const embedded = useAssessmentWorkspaceEmbedded();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    accountNumber: '',
    segment: 'Retail',
    remarks: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await individualImpairmentAPI.getWatchlist();
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load watchlist (old):', err);
      setError(err.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!formData.customerName || !formData.accountNumber) return;

    try {
      setLoading(true);
      await individualImpairmentAPI.addToWatchlist(formData);
      setSuccess('Customer added to watchlist');
      setOpenDialog(false);
      setFormData({ customerName: '', accountNumber: '', segment: 'Retail', remarks: '' });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add customer');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this customer from watchlist?')) return;

    try {
      setLoading(true);
      await individualImpairmentAPI.removeFromWatchlist(id);
      setSuccess('Removed from watchlist');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove customer');
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'customerName', headerName: 'Customer Name', flex: 1, minWidth: 200 },
    { field: 'accountNumber', headerName: 'Account Number', flex: 1, minWidth: 150 },
    { field: 'segment', headerName: 'Segment', width: 150 },
    {
      field: 'impairmentStatus',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || 'WATCHLIST'}
          color={params.value === 'WATCHLIST' ? 'warning' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'remarks', headerName: 'Remarks', flex: 1.5, minWidth: 250 },
    {
      field: 'triggerDate',
      headerName: 'Trigger Date',
      width: 180,
      valueFormatter: (value: any) => {
        if (!value) return '-';
        return new Date(value).toLocaleString();
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="assess"
          icon={<AssessmentIcon color="primary" />}
          label="Assessment"
          onClick={() => {
            router.push(`/banking/individual/assessment-old?accountId=${params.row.accountNumber}`);
          }}
          showInMenu={false}
        />,
        <SafeGridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Remove"
          onClick={() => handleDelete(params.row.id)}
        />
      ]
    }
  ];

  return (
    <Container
      maxWidth="xl"
      sx={embedded ? { position: 'relative', minHeight: '80vh', px: '0 !important' } : { position: 'relative', minHeight: '80vh' }}
    >
      <ModernLoader
        open={loading}
        message="Loading Watchlist"
        subMessage="Fetching flagged accounts..."
      />

      {!embedded && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Individual Watchlist (Old)
          </Typography>
        </Breadcrumbs>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={embedded ? 'h6' : 'h4'} component="h1">
          Individual Watchlist (Old)
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Customer
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Watchlist"
            value={data.length}
            icon={<PersonIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
            subtitle="Flagged Customers"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="SME Segment"
            value={data.filter(c => c.segment === 'SME').length}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="#2e7d32"
            subtitle="SME Customers"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Retail Segment"
            value={data.filter(c => c.segment === 'Retail').length}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="#ed6c02"
            subtitle="Retail Customers"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Needs Review"
            value={data.length}
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="#d32f2f"
            subtitle="Pending Assessment"
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

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Watchlist</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Customer Name"
              margin="normal"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Account Number"
              margin="normal"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
            <TextField
              fullWidth
              label="Segment"
              margin="normal"
              select
              SelectProps={{ native: true }}
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
            >
              <option value="Retail">Retail</option>
              <option value="SME">SME</option>
              <option value="Corporate">Corporate</option>
            </TextField>
            <TextField
              fullWidth
              label="Remarks"
              margin="normal"
              multiline
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={loading}>
            Add
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
};
