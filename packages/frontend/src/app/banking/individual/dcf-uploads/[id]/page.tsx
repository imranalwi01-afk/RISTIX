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
  List as ListIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { individualImpairmentAPI } from '../../../../../services/api/individual-impairment.api'; // Adjust path depth
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

export default function DcfUploadDetailPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const uploadId = params.id;

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await individualImpairmentAPI.getDcfCashflows(uploadId);
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load cashflows');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uploadId) {
        loadData();
    }
  }, [uploadId]);

  const columns: GridColDef[] = [
    { field: 'accountId', headerName: 'Account No', flex: 1 },
    { 
      field: 'periodDate', 
      headerName: 'Period Date', 
      width: 150,
      valueFormatter: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString();
      }
    },
    { 
        field: 'cashflowAmount', 
        headerName: 'Amount', 
        width: 150,
        type: 'number',
        valueFormatter: (value) => {
            return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value || 0);
        }
    },
    { field: 'discountRate', headerName: 'Discount Rate', width: 130, type: 'number' },
    { field: 'discountFactor', headerName: 'Discount Factor', width: 130, type: 'number' },
    { 
        field: 'presentValue', 
        headerName: 'Present Value', 
        width: 150,
        type: 'number',
        valueFormatter: (value) => {
            return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(value || 0);
        }
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
        <Link href="/banking/individual/dcf-uploads" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" /> DCF Uploads
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <DescriptionIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Detail
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          Upload Cashflow Details
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
        />
      </Paper>
    </Container>
  );
}
