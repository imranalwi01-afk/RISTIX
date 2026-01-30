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
      
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <CalculateIcon sx={{ mr: 0.5 }} fontSize="inherit" /> IA Calculation Results
        </Typography>
      </Breadcrumbs>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" gutterBottom>
          IA Discounted Cash Flow Detail
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
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
         <Grid item xs={12} md={4}>
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
