'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress, Alert } from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { individualImpairmentAPI } from '@/services/api/individual-impairment.api';

const columns: GridColDef[] = [
  { field: 'accountId', headerName: 'Account ID', width: 150 },
  { field: 'periodDate', headerName: 'Date', width: 150, valueFormatter: (value: any) => new Date(value).toLocaleDateString() },
  { field: 'cashflowAmount', headerName: 'Cashflow', width: 180, type: 'number' },
  { field: 'discountRate', headerName: 'Disc. Rate', width: 100, type: 'number' },
  { field: 'discountFactor', headerName: 'Factor', width: 100, type: 'number' },
  { field: 'presentValue', headerName: 'PV', width: 180, type: 'number' },
];

export default function IADCFDetailPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUpload, setCurrentUpload] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Get List of Uploads
        const uploadsRes = await individualImpairmentAPI.getDcfUploads();
        if (uploadsRes.success && uploadsRes.data && uploadsRes.data.length > 0) {
          const latest = uploadsRes.data[0];
          setCurrentUpload(latest);

          // 2. Get Cashflows for Latest
          const cashflowsRes = await individualImpairmentAPI.getDcfCashflows(latest.id);
          if (cashflowsRes.success && cashflowsRes.data) {
            setRows(cashflowsRes.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch cashflows:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Container maxWidth="xl">
      <FullstackIndicator />
      <PageHeader
        title="IA Discounted Cash Flow Detail"
        subtitle="Detailed view of individual cash flow projections"
      />
      <Card>
        <CardContent>
          <Box mb={2}>
            {currentUpload ? (
              <Alert severity="info">Showing cashflows for File: <strong>{currentUpload.fileName}</strong> ({new Date(currentUpload.createdAt).toLocaleDateString()})</Alert>
            ) : (
              <Alert severity="warning">No DCF Uploads found.</Alert>
            )}
          </Box>
          <Box sx={{ height: 500, width: '100%' }}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            ) : (
              <DataGrid
                rows={rows}
                columns={columns}
                pageSizeOptions={[10, 25]}
              />
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
