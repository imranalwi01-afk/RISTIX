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
  MonetizationOn as MoneyIcon
} from '@mui/icons-material';
import { individualImpairmentAPI, AuditTrail } from '../../../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import PageHeader from '@/components/banking/shared/PageHeader';
import { ExportButton } from '@/components/shared/ExportButton';

export default function ProvisionHistoryPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditTrail[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      // Filter for PROVISION related history
      const response = await individualImpairmentAPI.getHistory({ entityType: 'PROVISION' });
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
      valueFormatter: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleString();
      }
    },
    { field: 'entityId', headerName: 'Account / ID', flex: 1 },
    { 
      field: 'action', 
      headerName: 'Action', 
      width: 120,
      renderCell: (params) => (
         <Chip 
          label={params.value} 
          color={params.value === 'CREATE' ? 'success' : params.value === 'DELETE' ? 'error' : 'secondary'} 
          size="small" 
          variant="outlined"
        />
      )
    },
    { field: 'fieldChanged', headerName: 'Field Changed', flex: 1 },
    { 
        field: 'oldValue', 
        headerName: 'Old Value', 
        flex: 1,
        valueFormatter: (value) => {
            // Check if it looks like a number
            if (value && !isNaN(Number(value))) {
                 return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
            }
            return value;
        }
    },
    { 
        field: 'newValue', 
        headerName: 'New Value', 
        flex: 1,
        valueFormatter: (value) => {
             if (value && !isNaN(Number(value))) {
                 return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
            }
            return value;
        }
    },
    { field: 'performedBy', headerName: 'Performed By', width: 200 },
    { field: 'reason', headerName: 'Reason', flex: 1.5 }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <FullstackIndicator />
      
      <PageHeader
        title="Provision Audit Trail"
        extraActions={
          <ExportButton
            data={data as unknown as Record<string, unknown>[]}
            columns={columns.map(col => ({ field: col.field as string, headerName: col.headerName as string }))}
            filename="provision-audit-trail"
          />
        }
      />

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
