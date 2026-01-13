
'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Card, CardContent, CircularProgress } from '@mui/material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { individualImpairmentAPI } from '@/services/api/individual-impairment.api';

const columns: GridColDef[] = [
  { field: 'id', headerName: 'Log ID', width: 250 },
  { field: 'performedAt', headerName: 'Timestamp', width: 200, valueFormatter: (value: any) => new Date(value).toLocaleString() },
  { field: 'performedBy', headerName: 'User', width: 200 },
  { field: 'action', headerName: 'Action', width: 150 },
  { field: 'entityId', headerName: 'Upload/Batch ID', width: 200 },
  { field: 'reason', headerName: 'Details', width: 300 },
];

export default function HistoryDCFUploadPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await individualImpairmentAPI.getHistory({ entityType: 'DCF' });
        if (response.success && response.data) {
          setRows(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch DCF history:', error);
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
        title="History - DCF Upload"
        subtitle="Audit trail of DCF file uploads and processing"
      />
      <Card>
        <CardContent>
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
