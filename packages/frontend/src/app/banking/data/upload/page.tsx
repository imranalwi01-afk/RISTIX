// packages/frontend/src/app/banking/data/upload/page.tsx
// ============================================================================
// ETL DATA UPLOAD INTERFACE - COMPLETE IMPLEMENTATION
// ============================================================================
// ✅ COMPLETE: File upload with drag & drop functionality
// ✅ COMPLETE: Real-time batch processing and status monitoring
// ✅ COMPLETE: Data validation with quality reporting
// ✅ COMPLETE: Integration with ETL pipeline backend APIs
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Snackbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TextField
} from '@mui/material';
import {
  CloudUpload as PageIcon,
  Home as HomeIcon,
  Upload as UploadIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  InsertDriveFile as FileIcon,
  Assessment as ValidateIcon,
  CloudUpload
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/utils/auth-token';
// getUploadHistory and uploadDataFile imports removed as they are unused and the module does not exist
import { useDropzone } from 'react-dropzone';

interface UploadBatch {
  batchId: string;
  filename: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  status: 'uploaded' | 'validating' | 'valid' | 'invalid' | 'processing' | 'completed' | 'failed';
  uploadedAt: string;
  validationResults?: {
    isValid: boolean;
    recordCount: number;
    errorCount: number;
    warningCount: number;
    issues: Array<{
      type: string;
      field: string;
      message: string;
      count: number;
    }>;
    summary: string;
  };
  processingResults?: {
    recordsProcessed: number;
    recordsInserted: number;
    recordsUpdated: number;
    recordsSkipped: number;
    executionTime: number;
    summary: string;
  };
  errorDetails?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

const STATUS_COLORS = {
  uploaded: '#2196f3',
  validating: '#ff9800',
  valid: '#4caf50',
  invalid: '#f44336',
  processing: '#9c27b0',
  completed: '#4caf50',
  failed: '#f44336'
};

const STATUS_ICONS = {
  uploaded: <UploadIcon />,
  validating: <ValidateIcon />,
  valid: <CheckIcon />,
  invalid: <ErrorIcon />,
  processing: <PlayIcon />,
  completed: <CheckIcon />,
  failed: <ErrorIcon />
};

export default function DataUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [batches, setBatches] = useState<UploadBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<UploadBatch | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'success' | 'error' | 'info' | 'warning' });
  const [validationRules, setValidationRules] = useState([]);
  const [processingOptions, setProcessingOptions] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load existing batches on mount
  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/etl/batches', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBatches(data.data?.batches || []);
      } else {
        console.warn('Failed to load batches:', response.statusText);
        setBatches([]);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();

      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      });

      // Handle upload completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            setSnackbar({
              open: true,
              message: `File uploaded successfully: ${response.data.filename}`,
              severity: 'success'
            });
            loadBatches(); // Refresh batches list
          } else {
            setSnackbar({
              open: true,
              message: `Upload failed: ${response.error}`,
              severity: 'error'
            });
          }
        } else {
          setSnackbar({
            open: true,
            message: `Upload failed: ${xhr.statusText}`,
            severity: 'error'
          });
        }
        setUploading(false);
        setUploadProgress(0);
      });

      xhr.addEventListener('error', () => {
        setSnackbar({
          open: true,
          message: 'Upload failed due to network error',
          severity: 'error'
        });
        setUploading(false);
        setUploadProgress(0);
      });

      // Start upload
      xhr.open('POST', '/api/v1/etl/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('auth_token')}`);
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      setSnackbar({
        open: true,
        message: 'Upload failed due to an unexpected error',
        severity: 'error'
      });
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json']
    },
    multiple: false,
    disabled: uploading
  });

  const handleValidateData = async (batchId: string) => {
    try {
      const response = await fetch(`/api/v1/etl/validate/${batchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ validationRules })
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Validation completed: ${result.data.status}`,
          severity: result.data.validationResults.isValid ? 'success' : 'warning'
        });
        loadBatches();
      } else {
        setSnackbar({
          open: true,
          message: `Validation failed: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Validation error:', error);
      setSnackbar({
        open: true,
        message: 'Validation failed due to an unexpected error',
        severity: 'error'
      });
    }
  };

  const handleProcessData = async (batchId: string) => {
    try {
      const response = await fetch(`/api/v1/etl/process/${batchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ processingOptions })
      });

      const result = await response.json();
      if (result.success) {
        setSnackbar({
          open: true,
          message: `Processing completed: ${result.data.processingResults.recordsProcessed} records processed`,
          severity: 'success'
        });
        loadBatches();
      } else {
        setSnackbar({
          open: true,
          message: `Processing failed: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Processing error:', error);
      setSnackbar({
        open: true,
        message: 'Processing failed due to an unexpected error',
        severity: 'error'
      });
    }
  };

  const handleViewDetails = (batch: UploadBatch) => {
    setSelectedBatch(batch);
    setDetailsOpen(true);
  };

  const getStatusChip = (status: string) => (
    <Chip
      icon={STATUS_ICONS[status as keyof typeof STATUS_ICONS]}
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      sx={{
        backgroundColor: STATUS_COLORS[status as keyof typeof STATUS_COLORS],
        color: 'white',
        fontWeight: 'bold'
      }}
    />
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/banking/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/banking/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Data Upload
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                ETL Data Upload
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Upload, validate, and process data files with the ETL pipeline
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadBatches}
            disabled={loading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* File Upload Section */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <UploadIcon sx={{ mr: 1 }} />
                File Upload
              </Typography>

              <Paper
                {...getRootProps()}
                sx={{
                  border: '2px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.300',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  backgroundColor: isDragActive ? 'primary.light' : 'background.paper',
                  opacity: uploading ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'primary.light'
                  }
                }}
              >
                <input {...getInputProps()} />
                <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />

                {uploading ? (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Uploading... {Math.round(uploadProgress)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ mt: 2, mb: 2 }}
                    />
                  </Box>
                ) : (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      or click to select a file
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 2 }}>
                      Supported formats: CSV, Excel (.xlsx, .xls), JSON
                      <br />
                      Maximum file size: 100MB
                    </Typography>
                  </Box>
                )}
              </Paper>

              {uploading && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    File is being uploaded and processed. This may take a few moments depending on file size.
                  </Typography>
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Upload Statistics */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ mr: 1 }} />
                Upload Statistics
              </Typography>

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'primary.light' }}>
                    <Typography variant="h4" color="primary.main">
                      {batches.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Batches
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'success.light' }}>
                    <Typography variant="h4" color="success.main">
                      {batches.filter(b => b.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'warning.light' }}>
                    <Typography variant="h4" color="warning.main">
                      {batches.filter(b => ['validating', 'processing'].includes(b.status)).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Processing
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: 'error.light' }}>
                    <Typography variant="h4" color="error.main">
                      {batches.filter(b => ['invalid', 'failed'].includes(b.status)).length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Failed
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Upload History */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <FileIcon sx={{ mr: 1 }} />
                Upload History
              </Typography>

              {batches.length === 0 ? (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No file uploads yet. Upload your first file to get started with the ETL pipeline.
                </Alert>
              ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Filename</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Uploaded</TableCell>
                        <TableCell>Records</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {batches.map((batch) => (
                        <TableRow key={batch.batchId} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {batch.originalName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {batch.batchId}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatFileSize(batch.fileSize)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {batch.fileType}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {getStatusChip(batch.status)}
                            {batch.validationResults && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                {batch.validationResults.recordCount} records
                                {batch.validationResults.errorCount > 0 && (
                                  <span style={{ color: 'red' }}>
                                    , {batch.validationResults.errorCount} errors
                                  </span>
                                )}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {new Date(batch.uploadedAt).toLocaleDateString()}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(batch.uploadedAt).toLocaleTimeString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            {batch.processingResults ? (
                              <Typography variant="body2">
                                {batch.processingResults.recordsProcessed.toLocaleString()}
                              </Typography>
                            ) : batch.validationResults ? (
                              <Typography variant="body2">
                                {batch.validationResults.recordCount.toLocaleString()}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={() => handleViewDetails(batch)}
                                >
                                  <ViewIcon />
                                </IconButton>
                              </Tooltip>

                              {batch.status === 'uploaded' && (
                                <Tooltip title="Validate Data">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleValidateData(batch.batchId)}
                                    color="primary"
                                  >
                                    <ValidateIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {batch.status === 'valid' && (
                                <Tooltip title="Process Data">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleProcessData(batch.batchId)}
                                    color="success"
                                  >
                                    <PlayIcon />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Batch Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Batch Details: {selectedBatch?.originalName}
            </Typography>
            {selectedBatch && getStatusChip(selectedBatch.status)}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedBatch && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="subtitle2" gutterBottom>File Information</Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Batch ID"
                      secondary={selectedBatch.batchId}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Original Filename"
                      secondary={selectedBatch.originalName}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="File Size"
                      secondary={formatFileSize(selectedBatch.fileSize)}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="File Type"
                      secondary={selectedBatch.fileType}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Upload Time"
                      secondary={new Date(selectedBatch.uploadedAt).toLocaleString()}
                    />
                  </ListItem>
                </List>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                {selectedBatch.validationResults && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Validation Results</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Status"
                          secondary={selectedBatch.validationResults.isValid ? 'Valid' : 'Invalid'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Record Count"
                          secondary={selectedBatch.validationResults.recordCount.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Errors"
                          secondary={selectedBatch.validationResults.errorCount}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Warnings"
                          secondary={selectedBatch.validationResults.warningCount}
                        />
                      </ListItem>
                    </List>

                    {selectedBatch.validationResults.issues.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>Issues Found</Typography>
                        {selectedBatch.validationResults.issues.map((issue, index) => (
                          <Alert key={index} severity={issue.type as any} sx={{ mt: 1 }}>
                            <Typography variant="body2">
                              <strong>{issue.field}:</strong> {issue.message} ({issue.count} occurrences)
                            </Typography>
                          </Alert>
                        ))}
                      </Box>
                    )}
                  </Box>
                )}

                {selectedBatch.processingResults && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Processing Results</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Records Processed"
                          secondary={selectedBatch.processingResults.recordsProcessed.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Records Inserted"
                          secondary={selectedBatch.processingResults.recordsInserted.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Records Updated"
                          secondary={selectedBatch.processingResults.recordsUpdated.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Records Skipped"
                          secondary={selectedBatch.processingResults.recordsSkipped.toLocaleString()}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Execution Time"
                          secondary={`${(selectedBatch.processingResults.executionTime / 1000).toFixed(2)}s`}
                        />
                      </ListItem>
                    </List>
                  </Box>
                )}

                {selectedBatch.errorDetails && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Error Details</Typography>
                    <Typography variant="body2">
                      {selectedBatch.errorDetails.message}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Code: {selectedBatch.errorDetails.code}<br />
                      Time: {new Date(selectedBatch.errorDetails.timestamp).toLocaleString()}
                    </Typography>
                  </Alert>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
