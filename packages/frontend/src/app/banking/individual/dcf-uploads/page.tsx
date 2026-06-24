'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  GridColDef,
  GridToolbar
} from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';

export const dynamic = 'force-dynamic';
import {
  CloudUpload as CloudUploadIcon,
  Home as HomeIcon,
  List as ListIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { individualImpairmentAPI } from '../../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import PageHeader from '@/components/banking/shared/PageHeader';
import { ExportButton } from '@/components/shared/ExportButton';
import { useAssessmentWorkspaceEmbedded } from '../assessment/embedded-context';

export default function DcfUploadPage() {
  const embedded = useAssessmentWorkspaceEmbedded();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Upload Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await individualImpairmentAPI.getDcfUploads();
      if (response.success) {
        setData(response.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load upload history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0]; // Assume first sheet
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        setParsedData(jsonData);
      } catch (err) {
        setError('Failed to parse file. Please ensure it is a valid Excel file.');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || parsedData.length === 0) return;

    setUploading(true);
    try {
      // Transform data to match API expectation
      const cashflows = parsedData.map((row: any, index: number) => {
        const accountNumber = String(row['ACCOUNT_NUMBER'] || row['Account No'] || row['account_no'] || '').trim();
        const periodDateRaw = row['PERIODE'] || row['Period Date'] || row['period_date'];
        const periodDate = periodDateRaw instanceof Date ? periodDateRaw : new Date(periodDateRaw);
        const principal = Number(row['PRINCIPAL'] || row['principal'] || row['Cashflow Amount'] || row['cashflow_amount'] || 0);
        const interest = Number(row['INTEREST'] || row['interest'] || 0);
        const collateral = Number(row['COLLATERAL'] || row['collateral'] || 0);

        return {
          accountId: accountNumber,
          accountNumber,
          periodDate,
          periode: periodDate,
          principal,
          interest,
          collateral,
          mob: index + 1,
          status: '0'
        };
      }).filter(item => item.accountNumber && !Number.isNaN(item.periodDate.getTime()));

      if (cashflows.length === 0) {
        throw new Error('No valid cashflow rows found. Please check column headers.');
      }

      await individualImpairmentAPI.createBatchUpload({
        fileName: selectedFile.name,
        batchId: `BATCH-${Date.now()}`,
        cashflows: cashflows
      });

      setSuccess(`Successfully uploaded ${selectedFile.name} with ${cashflows.length} records.`);
      setOpenDialog(false);
      setSelectedFile(null);
      setParsedData([]);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to upload data');
    } finally {
      setUploading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'fileName', headerName: 'File Name', flex: 1.5 },
    { field: 'batchId', headerName: 'Batch ID', flex: 1 },
    { field: 'accountNumber', headerName: 'Account Number', width: 160 },
    { field: 'recordCount', headerName: 'Records', width: 100 },
    {
      field: 'validationStatus',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={params.value === 'APPROVED' || params.value === 'VALID' ? 'success' : params.value === 'REJECTED' || params.value === 'ERROR' ? 'error' : 'warning'}
          size="small"
        />
      )
    },
    {
      field: 'createdAt',
      headerName: 'Uploaded At',
      width: 180,
      valueFormatter: (value: any) => {
        if (!value) return '-';
        return new Date(value).toLocaleString();
      }
    }
  ];

  return (
    <Container maxWidth="xl" sx={embedded ? { px: '0 !important' } : { mt: 4, mb: 4 }}>
      {!embedded && <FullstackIndicator />}

      {!embedded && (
        <PageHeader
          title="DCF Uploads"
          extraActions={
            <ExportButton
              data={data as unknown as Record<string, unknown>[]}
              columns={columns.map(col => ({ field: col.field as string, headerName: col.headerName as string }))}
              filename="dcf-uploads"
            />
          }
        />
      )}
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<CloudUploadIcon />}
          onClick={() => setOpenDialog(true)}
        >
          New Batch Upload
        </Button>
      </Box>

      <Paper sx={{ height: 600, width: '100%' }}>
        <SafeDataGrid
          rows={data}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* Upload Dialog */}
      <Dialog open={openDialog} onClose={() => !uploading && setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload DCF Cashflows</DialogTitle>
        <DialogContent>
          <Box
            sx={{
              border: '2px dashed #ccc',
              borderRadius: 2,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: 'background.default',
              '&:hover': { bgcolor: 'action.hover' }
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              hidden
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .csv"
            />
            <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {selectedFile ? selectedFile.name : 'Click to Select Excel/CSV File'}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              Supported formats: .xlsx, .csv
            </Typography>
          </Box>

          {selectedFile && (
            <Box mt={3}>
              <Typography variant="subtitle2" gutterBottom>File Summary:</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon><FileIcon /></ListItemIcon>
                  <ListItemText primary={selectedFile.name} secondary={`${(selectedFile.size / 1024).toFixed(2)} KB`} />
                </ListItem>
                <ListItem>
                  <ListItemIcon><ListIcon /></ListItemIcon>
                  <ListItemText primary="Parsed Records" secondary={parsedData.length > 0 ? `${parsedData.length} rows found` : 'Parsing...'} />
                </ListItem>
              </List>

              {parsedData.length === 0 && (
                <Alert severity="warning" sx={{ mt: 1 }}>
                  Parsing file content... Please wait.
                </Alert>
              )}
            </Box>
          )}

          {uploading && (
            <Box mt={2}>
              <LinearProgress />
              <Typography variant="caption" align="center" display="block" mt={1}>Uploading and processing...</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} variant="contained" disabled={!selectedFile || parsedData.length === 0 || uploading}>
            Upload & Process
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
