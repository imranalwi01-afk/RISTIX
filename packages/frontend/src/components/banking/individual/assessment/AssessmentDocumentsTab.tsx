import React, { useState, useCallback } from 'react';
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
  Stack
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Description as FileIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  InsertDriveFile as CsvIcon
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';

interface AssessmentDocumentsTabProps {
  account: IndividualImpairmentWatchlistItem | null;
  onUpload?: (files: File[]) => void;
  loading?: boolean;
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

export function AssessmentDocumentsTab({ account, onUpload, loading = false }: AssessmentDocumentsTabProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          Dokumen Pendukung - {account?.account_number}
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<DownloadIcon />} 
          onClick={handleDownloadTemplate}
          size="small"
        >
          Unduh Template
        </Button>
      </Box>

      {/* Account Info Banner for Upload Context */}
      <Alert severity="info" sx={{ mb: 3 }} icon={<FileIcon />}>
        Mengunggah dokumen untuk nasabah: <strong>{account?.cif_name}</strong> ({account?.cif_number})
      </Alert>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Upload Area */}
          <Card 
            variant="outlined" 
            sx={{ 
              mb: 3, 
              borderStyle: 'dashed', 
              borderWidth: 2, 
              borderColor: isDragActive ? 'primary.main' : 'divider',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out'
            }}
            {...getRootProps()}
          >
            <CardContent sx={{ textAlign: 'center', py: 5 }}>
              <input {...getInputProps()} />
              <CloudUploadIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom color="text.primary">
                {isDragActive ? 'Letakkan file di sini' : 'Tarik & Letakkan file di sini'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                atau klik untuk memilih dari komputer
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 1 }}>
                <Chip label="PDF" size="small" />
                <Chip label="JPG/PNG" size="small" />
                <Chip label="XLSX" size="small" />
                <Chip label="CSV" size="small" />
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Ukuran file maksimal: 10MB
              </Typography>
            </CardContent>
          </Card>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                  File Terunggah ({uploadedFiles.length})
                </Typography>
                <List>
                  {uploadedFiles.map((file) => (
                    <React.Fragment key={file.id}>
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" aria-label="delete" onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}>
                            <DeleteIcon />
                          </IconButton>
                        }
                      >
                        <ListItemIcon>
                          <FileIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.name}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption" component="span">
                                {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                              </Typography>
                              {file.status === 'uploading' && (
                                <Box sx={{ width: 100 }}>
                                  <LinearProgress variant="determinate" value={file.progress} />
                                </Box>
                              )}
                              {file.status === 'completed' && (
                                <Chip 
                                  icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />} 
                                  label="Selesai" 
                                  size="small" 
                                  color="success" 
                                  variant="outlined"
                                  sx={{ height: 20, '& .MuiChip-label': { fontSize: '0.7rem', px: 1 } }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ bgcolor: 'info.lighter' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="info.main">
                <CsvIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                Panduan Template Standar
              </Typography>
              <Typography variant="body2" paragraph sx={{ fontSize: '0.875rem' }}>
                Pastikan metadata dokumen Anda mengikuti struktur template CSV standar sebelum mengunggah.
              </Typography>
              
              <Box sx={{ bgcolor: 'background.paper', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', mb: 2 }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mb: 0.5 }}>
                  Account Number, CIF Name, Document Type...
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', color: 'text.secondary' }}>
                  12345, John Doe, Financial Statement...
                </Typography>
              </Box>

              <Typography variant="caption" display="block" color="text.secondary">
                * File tanpa metadata yang sesuai mungkin ditolak selama alur kerja persetujuan.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
