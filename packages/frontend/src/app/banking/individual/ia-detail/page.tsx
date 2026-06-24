'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  GridColDef,
  GridToolbar
} from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import {
  Home as HomeIcon,
  List as ListIcon,
  Calculate as CalculateIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';
import { individualImpairmentAPI } from '../../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import PageHeader from '@/components/banking/shared/PageHeader';
import { ExportButton } from '@/components/shared/ExportButton';

export default function IaDetailPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await individualImpairmentAPI.getDcfCalculations();
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load calculation results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: GridColDef[] = [
    { field: 'fileName', headerName: 'Source File', flex: 1.2 },
    { field: 'accountId', headerName: 'Account No', flex: 1 },
    { field: 'scenarioName', headerName: 'Scenario', width: 150 },
    {
      field: 'totalCashflow',
      headerName: 'Total Cashflow',
      width: 180,
      type: 'number',
      valueFormatter: (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
      }
    },
    {
      field: 'totalPV',
      headerName: 'Total PV (Recoverable)',
      width: 180,
      type: 'number',
      valueFormatter: (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
      }
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <FullstackIndicator />

      <PageHeader
        title="IA Discounted Cash Flow Detail"
        extraActions={
          <ExportButton
            data={data as unknown as Record<string, unknown>[]}
            columns={columns.map(col => ({ field: col.field as string, headerName: col.headerName as string }))}
            filename="ia-discounted-cash-flow-detail"
          />
        }
      />

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Processed Accounts
              </Typography>
              <Typography variant="h4">
                {new Set(data.map(d => d.accountId)).size}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Present Value (System Wide)
              </Typography>
              <Typography variant="h4" color="primary">
                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.reduce((sum, item) => sum + (item.totalPV || 0), 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      <Paper sx={{ height: 600, width: '100%' }}>
        <SafeDataGrid
          getRowId={(row) => `${row.uploadId}-${row.accountId}`}
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
