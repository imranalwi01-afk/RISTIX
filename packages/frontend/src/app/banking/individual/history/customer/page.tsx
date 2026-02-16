'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  Chip
} from '@mui/material';
import {
  GridColDef,
  GridToolbar
} from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import {
  Home as HomeIcon,
  History as HistoryIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { individualImpairmentAPI, AuditTrail } from '../../../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

export default function CustomerHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditTrail[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // Filter for CUSTOMER related history
      const response = await individualImpairmentAPI.getHistory({ entityType: 'CUSTOMER' });
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: GridColDef[] = [
    {
      field: 'performedAt',
      headerName: 'Date',
      width: 180,
      valueFormatter: (value: any) => {
        if (!value) return '-';
        return new Date(value).toLocaleString();
      }
    },
    { field: 'entityId', headerName: 'Customer / ID', flex: 1 },
    {
      field: 'action',
      headerName: 'Action',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'CREATE' ? 'success' : params.value === 'DELETE' ? 'error' : 'primary'}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'fieldChanged', headerName: 'Field Changed', flex: 1 },
    { field: 'oldValue', headerName: 'Old Value', flex: 1 },
    { field: 'newValue', headerName: 'New Value', flex: 1 },
    { field: 'performedBy', headerName: 'Performed By', width: 200 },
    { field: 'reason', headerName: 'Reason', flex: 1.5 }
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
          <HistoryIcon sx={{ mr: 0.5 }} fontSize="inherit" /> History
        </Typography>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Customer Details
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Customer Audit Trail
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Paper sx={{ height: 600, width: '100%' }}>
        <SafeDataGrid
          rows={data}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
          initialState={{
            sorting: {
              sortModel: [{ field: 'performedAt', sort: 'desc' }],
            },
          }}
        />
      </Paper>
    </Container>
  );
}
