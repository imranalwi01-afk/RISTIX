'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import PageHeader from '@/components/banking/shared/PageHeader';
import { ExportButton } from '@/components/shared/ExportButton';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { api } from '@/services/api';
import { useAssessmentWorkspaceEmbedded } from '../../assessment/embedded-context';

const columns: GridColDef[] = [
  { field: 'fileName', headerName: 'File Name', width: 250 },
  { field: 'recordCount', headerName: 'Records', width: 100 },
  { field: 'validationStatus', headerName: 'Status', width: 150,
      renderCell: (params) => {
        const color = params.value === 'VALID' ? 'success' : params.value === 'VALIDATING' ? 'warning' : 'error';
        return <Chip label={params.value} color={color} size="small" />;
    }
  },
  { field: 'uploadedBy', headerName: 'Uploaded By (ID)', width: 250 },
  { field: 'createdAt', headerName: 'Uploaded At', width: 200, valueFormatter: (value: any) => new Date(value).toLocaleString() },
];

export default function DCFUploadReportPage() {
  const embedded = useAssessmentWorkspaceEmbedded();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.individualImpairment.getDcfUploads();
        if (response.success && response.data) {
          setRows(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch DCF uploads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Container maxWidth="xl" sx={embedded ? { px: '0 !important' } : undefined}>
      {!embedded && <FullstackIndicator />}
      {!embedded && (
        <PageHeader
          title="Review DCF Upload Report"
          subtitle="Validation results for DCF file uploads"
          extraActions={
            <ExportButton
              data={rows as Record<string, unknown>[]}
              columns={columns.map(col => ({ field: col.field as string, headerName: col.headerName as string }))}
              filename="dcf-upload-report"
              disabled={loading}
            />
          }
        />
      )}
      <Card>
        <CardContent>
           <Box sx={{ height: 500, width: '100%' }}>
            {loading ? (
               <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                 <CircularProgress />
               </Box>
            ) : (
                <SafeDataGrid
                  rows={rows}
                  columns={columns}
                />
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
