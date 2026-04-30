// @ts-nocheck
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  LinearProgress,
  Stack,
  Avatar
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  InsertDriveFile as CsvIcon,
  Check as CheckIcon,
  History as HistoryIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { IndividualImpairmentWatchlistItem, individualImpairmentAPI } from '@/services/api.individual-impairment';

interface AssessmentDocumentsTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  onUpload?: (files: File[]) => void;
  loading?: boolean;
  stagedOverride?: any;
  stagedDCF?: any;
  assessmentData?: any;
  historyData?: any[];
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
  uploadDate: Date;
}

export function AssessmentDocumentsTab({
    account,
    onUpload,
    loading = false,
    stagedOverride,
    stagedDCF,
    assessmentData,
    historyData = []
}: AssessmentDocumentsTabProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [existingDocuments, setExistingDocuments] = useState<any[]>([]);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (account?.account_id) {
      fetchDocuments();
    }
  }, [account?.account_id, stagedOverride, stagedDCF]); // Refresh when staged items change

  const fetchDocuments = async () => {
    if (!account?.account_id) return;
    setFetching(true);
    try {
      const response = await individualImpairmentAPI.documents.get(Number(account.account_id));
      if (response.success) {
        setExistingDocuments(response.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setFetching(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Validate file types if needed
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading' as const,
      progress: 0,
      uploadDate: new Date()
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // Simulate upload process
    newFiles.forEach(file => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          setUploadedFiles(prev =>
            prev.map(f => f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f)
          );
        } else {
          setUploadedFiles(prev =>
            prev.map(f => f.id === file.id ? { ...f, progress } : f)
          );
        }
      }, 500);
    });

    if (onUpload) {
      onUpload(acceptedFiles);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/csv': ['.csv']
    },
    maxSize: 10485760 // 10MB
  });

  const handleDownloadTemplate = () => {
    // Create a link element
    const link = document.createElement('a');
    link.href = '/templates/individual_assessment_document_template.csv';
    link.download = 'individual_assessment_document_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDelete = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Filter checker documents (usually from approval actions)
  const checkerDocs = existingDocuments.filter(doc => doc.source === 'approval' || doc.source === 'checker' || doc.name?.includes('Checker_Comment'));
  // Filter regular documents
  const regularDocs = existingDocuments.filter(doc => doc.source !== 'approval' && doc.source !== 'checker' && !doc.name?.includes('Checker_Comment'));

  return (
    <Box sx={{ p: 0.5 }}>
      {/* Header & Customer Info */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5 }}>
                Document Center
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                    Managing supporting evidence for account:
                </Typography>
                <Chip
                    label={account?.account_number}
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, borderRadius: '4px' }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {account?.cif_name}
                </Typography>
            </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadTemplate}
          sx={{
              textTransform: 'none',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)',
              px: 3
          }}
        >
          Download Template
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>

          {/* 1. STAGED DOCUMENTS SECTION (HIGH VISIBILITY) */}
          {(stagedOverride || stagedDCF) && (
            <Card
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'primary.200',
                background: 'linear-gradient(145deg, #f0f7ff 0%, #ffffff 100%)',
                overflow: 'hidden'
              }}
            >
              <Box sx={{ bgcolor: 'primary.main', px: 2, py: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CloudUploadIcon sx={{ color: 'white', fontSize: 18 }} />
                <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 700, letterSpacing: '0.5px' }}>
                  PENDING SUBMISSION (STAGED)
                </Typography>
              </Box>
              <CardContent sx={{ p: 0 }}>
                <List disablePadding>
                  {stagedOverride && (
                    <ListItem sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <ListItemIcon>
                        <Box sx={{ bgcolor: 'primary.100', p: 1, borderRadius: '8px' }}>
                          <FileIcon color="primary" />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={stagedOverride.fileName || stagedOverride.supportingDocumentName || 'Adjustment Evidence'}
                        secondary={
                            <Typography variant="caption" color="text.secondary">
                                Category: Individual Adjustment • Size: {formatFileSize(stagedOverride.fileSize || 0)}
                            </Typography>
                        }
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                      />
                      <Chip label="Ready" color="primary" size="small" sx={{ fontWeight: 700 }} />
                    </ListItem>
                  )}
                  {stagedDCF && (
                    <ListItem sx={{ py: 2 }}>
                      <ListItemIcon>
                        <Box sx={{ bgcolor: 'info.100', p: 1, borderRadius: '8px' }}>
                          <CsvIcon color="info" />
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={stagedDCF.fileName || 'DCF Calculation Result'}
                        secondary={
                            <Typography variant="caption" color="text.secondary">
                                Category: DCF Analysis • Status: Calculated & Ready
                            </Typography>
                        }
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
                      />
                      <Chip label="Ready" color="info" size="small" sx={{ fontWeight: 700 }} />
                    </ListItem>
                  )}
                </List>
                <Box sx={{ p: 2, bgcolor: 'rgba(25, 118, 210, 0.04)' }}>
                    <Alert severity="info" variant="standard" sx={{ bgcolor: 'transparent', p: 0 }}>
                        These documents will be automatically attached when you click <strong>"Submit Assessment"</strong> in the Provision tab.
                    </Alert>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* 2. MAKER & CHECKER COMMUNICATION TRAIL */}
          <Card
            elevation={0}
            sx={{
                mb: 4,
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                overflow: 'hidden'
            }}
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#fcfcfc', display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon color="primary" />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Assessment Communication History
                </Typography>
            </Box>
            <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                    {/* MAKER SECTION */}
                    {(() => {
                        const makerAction = historyData.find(h => h.action === 'CREATE' || h.action === 'SUBMIT');
                        const justification = makerAction?.details || assessmentData?.justification || stagedOverride?.justification;
                        if (!justification && !stagedOverride) return null;

                        return (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Avatar sx={{ bgcolor: 'primary.100', color: 'primary.main', fontWeight: 700 }}>M</Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Maker Adjustment / Justification</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {makerAction?.timestamp ? new Date(makerAction.timestamp).toLocaleString() : 'Current Draft'}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            p: 2,
                                            bgcolor: 'primary.50',
                                            borderRadius: '0 12px 12px 12px',
                                            border: '1px solid',
                                            borderColor: 'primary.100',
                                            color: 'text.primary',
                                            mb: 1.5
                                        }}
                                    >
                                        {justification || "No justification provided."}
                                    </Typography>

                                    <Stack direction="row" spacing={1}>
                                        {/* Maker Files (Adjustment) */}
                                        {(stagedOverride?.supportingDocumentName || assessmentData?.supporting_document_name) && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => {
                                                    const fileName = stagedOverride?.supportingDocumentName || assessmentData?.supporting_document_name;
                                                    if (stagedOverride?.supportingDocumentContent) {
                                                        // Download from staged base64
                                                        const link = document.createElement('a');
                                                        link.href = `data:application/octet-stream;base64,${stagedOverride.supportingDocumentContent}`;
                                                        link.download = fileName;
                                                        link.click();
                                                    } else {
                                                        individualImpairmentAPI.documents.download(fileName);
                                                    }
                                                }}
                                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                            >
                                                Adjustment: {stagedOverride?.supportingDocumentName || assessmentData?.supporting_document_name}
                                            </Button>
                                        )}

                                        {/* Maker Files (DCF) */}
                                        {(stagedDCF?.fileName || assessmentData?.dcf_file_name) && (
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                color="info"
                                                startIcon={<DownloadIcon />}
                                                onClick={() => {
                                                    const fileName = stagedDCF?.fileName || assessmentData?.dcf_file_name;
                                                    if (stagedDCF?.fileContent) {
                                                        const link = document.createElement('a');
                                                        link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${stagedDCF.fileContent}`;
                                                        link.download = fileName;
                                                        link.click();
                                                    } else {
                                                        individualImpairmentAPI.documents.download(fileName);
                                                    }
                                                }}
                                                sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                            >
                                                DCF: {stagedDCF?.fileName || assessmentData?.dcf_file_name}
                                            </Button>
                                        )}
                                    </Stack>
                                </Box>
                            </Box>
                        );
                    })()}

                    {historyData.some(h => h.action === 'APPROVE' || h.action === 'REJECT') && <Divider sx={{ borderStyle: 'dashed' }} />}

                    {/* CHECKER SECTION */}
                    {(() => {
                        const checkerAction = historyData.find(h => h.action === 'APPROVE' || h.action === 'REJECT');
                        if (!checkerAction) return null;

                        const cleanComment = checkerAction.details?.replace(/^Checker Comment: /, '').replace(/ \[Checker File: .*\]$/, '') || 'No comment provided.';
                        const checkerFileMatch = checkerAction.details?.match(/\[Checker File: (.*)\]/);
                        const checkerFileName = checkerFileMatch ? checkerFileMatch[1] : null;

                        return (
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                <Avatar sx={{ bgcolor: 'success.100', color: 'success.main', fontWeight: 700 }}>C</Avatar>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Checker Feedback</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {checkerAction.timestamp ? new Date(checkerAction.timestamp).toLocaleString() : ''}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            p: 2,
                                            bgcolor: 'success.50',
                                            borderRadius: '0 12px 12px 12px',
                                            border: '1px solid',
                                            borderColor: 'success.100',
                                            color: 'text.primary',
                                            mb: 1.5
                                        }}
                                    >
                                        {cleanComment}
                                    </Typography>

                                    {checkerFileName && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            disableElevation
                                            startIcon={<DownloadIcon />}
                                            onClick={() => individualImpairmentAPI.documents.download(checkerFileName)}
                                            sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
                                        >
                                            Checker File: {checkerFileName}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        );
                    })()}
                </Stack>

                {!stagedOverride && !stagedDCF && !historyData.some(h => h.action === 'APPROVE' || h.action === 'REJECT' || h.action === 'SUBMIT') && (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                            Belum ada riwayat komunikasi untuk assessment ini.
                        </Typography>
                    </Box>
                )}
            </CardContent>
          </Card>

          {/* 3. UPLOAD AREA (ACTIVE REPOSITORY) */}
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, color: 'text.secondary', px: 1 }}>
            UPLOAD ADDITIONAL EVIDENCE
          </Typography>
          <Card
            elevation={0}
            sx={{
              mb: 4,
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'divider',
              borderRadius: '16px',
              bgcolor: isDragActive ? 'primary.50' : 'background.paper',
              cursor: 'pointer',
              '&:hover': { borderColor: 'primary.light', bgcolor: 'grey.50' }
            }}
            {...getRootProps()}
          >
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.7 }} />
              <Typography variant="subtitle1" fontWeight={700}>
                {isDragActive ? 'Drop files here' : 'Click or Drag to Upload'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                PDF, JPG, PNG, XLSX, or CSV (Max 10MB)
              </Typography>
            </CardContent>
          </Card>

          {/* 4. PROCESSED / HISTORY DOCUMENTS */}
          <Card elevation={0} sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Historical Evidence Repositiory
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Total: {regularDocs.length} files
                </Typography>
            </Box>
            <CardContent sx={{ p: 0 }}>
                {fetching ? (
                    <Box sx={{ p: 4 }}><LinearProgress /></Box>
                ) : regularDocs.length > 0 ? (
                    <List disablePadding>
                        {regularDocs.map((doc, idx) => (
                            <ListItem
                                key={idx}
                                secondaryAction={
                                    <IconButton size="small" onClick={() => individualImpairmentAPI.documents.download(doc.filename || doc.name)}>
                                        <DownloadIcon fontSize="small" />
                                    </IconButton>
                                }
                                sx={{
                                    py: 1.5,
                                    borderBottom: idx < regularDocs.length - 1 ? '1px solid' : 'none',
                                    borderColor: 'divider'
                                }}
                            >
                                <ListItemIcon>
                                    <FileIcon color="primary" sx={{ opacity: 0.7 }} />
                                </ListItemIcon>
                                <ListItemText
                                    primary={doc.filename || doc.name}
                                    secondary={doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleString() : 'N/A'}
                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                />
                            </ListItem>
                        ))}
                    </List>
                ) : (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">No historical documents found.</Typography>
                    </Box>
                )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {/* UPLOADED FILES STATUS */}
          {uploadedFiles.length > 0 && (
              <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                <CardContent>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>Uploading Progress</Typography>
                    <List dense disablePadding>
                        {uploadedFiles.map(file => (
                            <ListItem key={file.id} sx={{ px: 0, py: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36 }}><FileIcon fontSize="small" /></ListItemIcon>
                                <ListItemText
                                    primary={file.name}
                                    secondary={file.status === 'uploading' ? `${file.progress}%` : 'Uploaded'}
                                    primaryTypographyProps={{ variant: 'caption', fontWeight: 700, noWrap: true }}
                                />
                                {file.status === 'uploading' ? (
                                    <Box sx={{ width: 40, ml: 1 }}>
                                        <LinearProgress variant="determinate" value={file.progress} sx={{ height: 4, borderRadius: 2 }} />
                                    </Box>
                                ) : (
                                    <CheckCircleIcon color="success" sx={{ fontSize: 16 }} />
                                )}
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
              </Card>
          )}

          {/* HELP & GUIDELINES */}
          <Card sx={{ borderRadius: '16px', bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.100' }}>
            <CardContent>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.900', mb: 2 }}>
                    Documentation SOP
                </Typography>
                <Stack spacing={2}>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Box sx={{ mt: 0.5 }}><CheckIcon sx={{ fontSize: 14, color: 'primary.main' }} /></Box>
                        <Typography variant="caption">All individual assessments <strong>must</strong> be accompanied by a signed DCF template.</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Box sx={{ mt: 0.5 }}><CheckIcon sx={{ fontSize: 14, color: 'primary.main' }} /></Box>
                        <Typography variant="caption">Checker feedback requires a response or re-upload if documents are rejected.</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Box sx={{ mt: 0.5 }}><CheckIcon sx={{ fontSize: 14, color: 'primary.main' }} /></Box>
                        <Typography variant="caption">Maximum file size is 10MB per document.</Typography>
                    </Box>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: '8px', border: '1px solid', borderColor: 'primary.200' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', display: 'block', mb: 0.5 }}>
                        Standard Metadata
                    </Typography>
                    <Typography variant="caption" color="text.secondary" component="pre" sx={{ fontSize: '10px', whiteSpace: 'pre-wrap' }}>
                        ACCOUNT_NUMBER, CIF_NAME, DOC_TYPE, PERIOD...
                    </Typography>
                </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
