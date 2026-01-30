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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
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
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { individualImpairmentAPI } from '../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';
import { StatCard } from '@/components/common/StatCard';

export const AssessmentOverride = () => {
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
    originalStage: 'Stage 1',
    overrideStage: 'Stage 2',
    justification: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await individualImpairmentAPI.getOverrides();
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load overrides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async () => {
    if (!formData.customerName || !formData.accountNumber || !formData.justification) return;
    
    try {
      setLoading(true);
      await individualImpairmentAPI.createOverride(formData);
      setSuccess('Override request submitted successfully');
      setOpenDialog(false);
      setFormData({ 
        customerName: '', 
        accountNumber: '', 
        originalStage: 'Stage 1', 
        overrideStage: 'Stage 2', 
        justification: '' 
      });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit override');
    } finally {
      setLoading(false);
    }
  };

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
        valueFormatter: (params) => {
            if (!params.value) return '-';
            return new Date(params.value).toLocaleString();
        }
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', minHeight: '80vh' }}>
      <ModernLoader 
        open={loading} 
        message="Loading Overrides" 
        subMessage="Fetching assessment override requests..." 
      />
      
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Impairment Override
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Impairment Override Trigger
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Override Request
        </Button>
      </Box>

      {/* 📊 Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Total Requests"
            value={data.length}
            icon={<ListIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
            subtitle="All Override Requests"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Pending"
            value={data.filter(c => c.status === 'PENDING').length}
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="#ed6c02"
            subtitle="Awaiting Approval"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Approved"
            value={data.filter(c => c.status === 'APPROVED').length}
            icon={<CheckCircleIcon sx={{ fontSize: 40 }} />}
            color="#2e7d32"
            subtitle="Successfully Overridden"
          />
        </Grid>
        <Grid item xs={12} md={3}>
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
        <FullstackIndicator />
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
            />
            <TextField
              fullWidth
              label="Account Number"
              margin="normal"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
            
            <Box display="flex" gap={2} mt={2}>
                 <FormControl fullWidth>
                  <InputLabel>Original Stage</InputLabel>
                  <Select
                    value={formData.originalStage}
                    label="Original Stage"
                    onChange={(e) => setFormData({ ...formData, originalStage: e.target.value })}
                  >
                    <MenuItem value="Stage 1">Stage 1</MenuItem>
                    <MenuItem value="Stage 2">Stage 2</MenuItem>
                    <MenuItem value="Stage 3">Stage 3</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>Override Stage</InputLabel>
                  <Select
                    value={formData.overrideStage}
                    label="Override Stage"
                    onChange={(e) => setFormData({ ...formData, overrideStage: e.target.value })}
                  >
                    <MenuItem value="Stage 1">Stage 1</MenuItem>
                    <MenuItem value="Stage 2">Stage 2</MenuItem>
                    <MenuItem value="Stage 3">Stage 3</MenuItem>
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={loading}>
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
