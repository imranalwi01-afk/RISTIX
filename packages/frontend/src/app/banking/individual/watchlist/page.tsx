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
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  CircularProgress // Added import
} from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Assignment as AssessmentIcon,
  Home as HomeIcon,
  List as ListIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { individualImpairmentAPI } from '../../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

export default function WatchlistPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Dialog State
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
    } finally {
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
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'customerName', headerName: 'Customer Name', flex: 1 },
    { field: 'accountNumber', headerName: 'Account Number', flex: 1 },
    { field: 'segment', headerName: 'Segment', width: 150 },
    {
      field: 'impairmentStatus',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'WATCHLIST' ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    { field: 'remarks', headerName: 'Remarks', flex: 1 },
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
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Start Assessment">
            <IconButton color="primary" size="small">
              <AssessmentIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton color="error" size="small" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <FullstackIndicator />

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Individual Watchlist
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Individual Watchlist
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Customer
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={data}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Watchlist</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
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
        <Alert severity="error">{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
    </Container>
  );
}
