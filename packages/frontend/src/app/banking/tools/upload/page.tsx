// packages/frontend/src/app/banking/tools/upload/page.tsx
// ============================================================================
// IFRS9 FRONTEND - MANUAL UPLOAD PAGE
// ============================================================================
// Purpose: Manual data upload and file processing with templates
// Generated: 2025-07-28T05:12:54Z
// Stakeholder: Banking Institution
// ============================================================================

'use client';

import React, { useState, useCallback } from 'react';
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
  Stepper,
  Step,
  StepLabel,
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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import {
  CloudUpload as PageIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  FileUpload,
  Download,
  CheckCircle,
  Error,
  Warning,
  Info,
  PlayArrow,
  Stop,
  Refresh,
  Description,
  AccountBalance,
  People,
  Payment,
  Assessment
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';

// ============================================================================
// INTERFACES
// ============================================================================

interface UploadTemplate {
  id: string;
  name: string;
  description: string;
  category: 'PORTFOLIO' | 'CUSTOMER' | 'PAYMENT' | 'SYARIAH' | 'REPORTING';
  icon: React.ReactNode;
  fileType: string[];
  sampleFile: string;
  maxSize: number;
  validation: string[];
  bankingType: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'PENDING' | 'VALIDATING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  progress: number;
  errors: string[];
  warnings: string[];
  records: number;
  template: UploadTemplate;
}

interface ProcessingStep {
  id: string;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  progress: number;
  message: string;
  duration: number;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ManualUploadPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<UploadTemplate | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);

  // Mock upload templates
  const uploadTemplates: UploadTemplate[] = [
    {
      id: 'portfolio-accounts',
      name: 'Portfolio Accounts',
      description: 'Upload customer portfolio accounts with loan details',
      category: 'PORTFOLIO',
      icon: <AccountBalance />,
      fileType: ['xlsx', 'csv'],
      sampleFile: 'portfolio_accounts_template.xlsx',
      maxSize: 50 * 1024 * 1024, // 50MB
      validation: ['Account ID format', 'Outstanding amount validation', 'Date format'],
      bankingType: 'BOTH'
    },
    {
      id: 'customer-data',
      name: 'Customer Data',
      description: 'Upload customer master data and demographics',
      category: 'CUSTOMER',
      icon: <People />,
      fileType: ['xlsx', 'csv'],
      sampleFile: 'customer_data_template.xlsx',
      maxSize: 25 * 1024 * 1024, // 25MB
      validation: ['Customer ID uniqueness', 'KYC status', 'Contact validation'],
      bankingType: 'BOTH'
    },
    {
      id: 'payment-history',
      name: 'Payment History',
      description: 'Upload payment transactions and repayment data',
      category: 'PAYMENT',
      icon: <Payment />,
      fileType: ['xlsx', 'csv'],
      sampleFile: 'payment_history_template.xlsx',
      maxSize: 100 * 1024 * 1024, // 100MB
      validation: ['Payment amount', 'Transaction date', 'Account reference'],
      bankingType: 'BOTH'
    },
    {
      id: 'syariah-contracts',
      name: 'Syariah Contracts',
      description: 'Upload Islamic banking contracts and compliance data',
      category: 'SYARIAH',
      icon: <Description />,
      fileType: ['xlsx', 'csv', 'pdf'],
      sampleFile: 'syariah_contracts_template.xlsx',
      maxSize: 75 * 1024 * 1024, // 75MB
      validation: ['Contract type validation', 'Syariah compliance', 'DPS approval'],
      bankingType: 'SYARIAH'
    },
    {
      id: 'regulatory-reports',
      name: 'Regulatory Reports',
      description: 'Upload regulatory reporting data and submissions',
      category: 'REPORTING',
      icon: <Assessment />,
      fileType: ['xlsx', 'csv', 'xml'],
      sampleFile: 'regulatory_reports_template.xlsx',
      maxSize: 50 * 1024 * 1024, // 50MB
      validation: ['Report format', 'Completeness check', 'Date validation'],
      bankingType: 'BOTH'
    }
  ];

  const processingStepTemplates: ProcessingStep[] = [
    { id: '1', name: 'File Validation', status: 'PENDING', progress: 0, message: '', duration: 0 },
    { id: '2', name: 'Data Format Check', status: 'PENDING', progress: 0, message: '', duration: 0 },
    { id: '3', name: 'Business Rules Validation', status: 'PENDING', progress: 0, message: '', duration: 0 },
    { id: '4', name: 'Data Transformation', status: 'PENDING', progress: 0, message: '', duration: 0 },
    { id: '5', name: 'Database Update', status: 'PENDING', progress: 0, message: '', duration: 0 }
  ];

  // File drop zone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!selectedTemplate) {
      alert('Please select a template first');
      return;
    }

    acceptedFiles.forEach((file) => {
      const newFile: UploadedFile = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'PENDING',
        progress: 0,
        errors: [],
        warnings: [],
        records: 0,
        template: selectedTemplate
      };

      setUploadedFiles(prev => [...prev, newFile]);
    });
  }, [selectedTemplate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedTemplate ? 
      Object.fromEntries(selectedTemplate.fileType.map(type => [`.${type}`, []])) : 
      {},
    maxSize: selectedTemplate?.maxSize || 50 * 1024 * 1024,
    multiple: true
  });

  // Handle template selection
  const handleTemplateSelect = (template: UploadTemplate) => {
    setSelectedTemplate(template);
    setShowTemplateDialog(false);
  };

  // Handle file processing
  const handleProcessFiles = () => {
    setShowProcessDialog(true);
    setProcessing(true);
    setProcessingSteps(processingStepTemplates);
    
    // Simulate processing steps
    let stepIndex = 0;
    const processStep = () => {
      if (stepIndex < processingStepTemplates.length) {
        setProcessingSteps(prev => prev.map((step, index) => {
          if (index === stepIndex) {
            return { ...step, status: 'RUNNING', message: `Processing ${step.name}...` };
          }
          return step;
        }));

        // Simulate step completion
        setTimeout(() => {
          setProcessingSteps(prev => prev.map((step, index) => {
            if (index === stepIndex) {
              return { 
                ...step, 
                status: 'COMPLETED', 
                progress: 100, 
                message: `${step.name} completed successfully`,
                duration: Math.random() * 3000 + 1000
              };
            }
            return step;
          }));

          stepIndex++;
          processStep();
        }, Math.random() * 2000 + 1000);
      } else {
        // All steps completed
        setProcessing(false);
        setUploadedFiles(prev => prev.map(file => ({
          ...file,
          status: 'COMPLETED',
          progress: 100,
          records: Math.floor(Math.random() * 1000) + 100
        })));
      }
    };

    processStep();
  };

  // Utility functions
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle color="success" />;
      case 'FAILED': return <Error color="error" />;
      case 'PROCESSING': return <CircularProgress size={20} />;
      case 'VALIDATING': return <Warning color="warning" />;
      default: return <Info color="info" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'FAILED': return 'error';
      case 'PROCESSING': return 'primary';
      case 'VALIDATING': return 'warning';
      default: return 'default';
    }
  };

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Template Selection
        return (
          <Grid container spacing={3}>
            {uploadTemplates.map((template) => (
              <Grid item xs={12} md={6} lg={4} key={template.id}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: selectedTemplate?.id === template.id ? 2 : 1,
                    borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider',
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)'
                    }
                  }}
                  onClick={() => handleTemplateSelect(template)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ color: 'primary.main', mr: 2 }}>
                        {template.icon}
                      </Box>
                      <Typography variant="h6">
                        {template.name}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {template.description}
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      <Chip 
                        label={template.category} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={template.bankingType} 
                        size="small" 
                        color="secondary" 
                        variant="outlined" 
                      />
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      Supported: {template.fileType.join(', ').toUpperCase()} • Max: {formatFileSize(template.maxSize)}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Button 
                        size="small" 
                        startIcon={<Download />}
                        sx={{ mr: 1 }}
                      >
                        Download Template
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      case 1: // File Upload
        return (
          <Box>
            {selectedTemplate ? (
              <Box>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Selected Template:</strong> {selectedTemplate.name} - {selectedTemplate.description}
                  </Typography>
                </Alert>

                {/* Drop Zone */}
                <Paper
                  {...getRootProps()}
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.400',
                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    mb: 3
                  }}
                >
                  <input {...getInputProps()} />
                  <FileUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {isDragActive 
                      ? 'Drop the files here...' 
                      : 'Drag & drop files here, or click to select'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Supported formats: {selectedTemplate.fileType.join(', ').toUpperCase()}
                    <br />
                    Maximum file size: {formatFileSize(selectedTemplate.maxSize)}
                  </Typography>
                </Paper>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Uploaded Files ({uploadedFiles.length})
                      </Typography>
                      
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>File Name</TableCell>
                              <TableCell>Size</TableCell>
                              <TableCell>Template</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Progress</TableCell>
                              <TableCell>Records</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {uploadedFiles.map((file) => (
                              <TableRow key={file.id}>
                                <TableCell>{file.name}</TableCell>
                                <TableCell>{formatFileSize(file.size)}</TableCell>
                                <TableCell>{file.template.name}</TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getStatusIcon(file.status)}
                                    <Chip 
                                      label={file.status} 
                                      size="small" 
                                      color={getStatusColor(file.status) as any}
                                      variant="outlined" 
                                    />
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ width: 100 }}>
                                    <LinearProgress 
                                      variant="determinate" 
                                      value={file.progress} 
                                      color={getStatusColor(file.status) as any}
                                    />
                                    <Typography variant="caption">
                                      {file.progress}%
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  {file.records > 0 ? file.records.toLocaleString() : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {uploadedFiles.length > 0 && (
                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                          <Button 
                            variant="contained" 
                            startIcon={<PlayArrow />}
                            onClick={handleProcessFiles}
                            disabled={processing || uploadedFiles.every(f => f.status === 'COMPLETED')}
                          >
                            Process Files
                          </Button>
                          <Button 
                            variant="outlined" 
                            startIcon={<Refresh />}
                            onClick={() => setUploadedFiles([])}
                          >
                            Clear All
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </Box>
            ) : (
              <Alert severity="warning">
                Please select a template from the Template Selection tab first.
              </Alert>
            )}
          </Box>
        );

      case 2: // Processing History
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Processing History
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                View previously processed files and their status.
              </Typography>
              
              <Alert severity="info">
                Processing history will be displayed here once files are processed.
              </Alert>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

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
          Manual Upload
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                Manual Upload
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Upload and process banking data files with templates
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              variant="outlined" 
              startIcon={<BackIcon />}
              onClick={() => router.back()}
            >
              Back
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Main Content */}
      <Card>
        <CardContent>
          {/* Tabs */}
          <Tabs 
            value={activeTab} 
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
          >
            <Tab label="Template Selection" />
            <Tab label="File Upload" />
            <Tab label="Processing History" />
          </Tabs>

          {/* Tab Content */}
          {renderTabContent()}
        </CardContent>
      </Card>

      {/* Processing Dialog */}
      <Dialog 
        open={showProcessDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { minHeight: '500px' }
        }}
      >
        <DialogTitle>
          <Typography variant="h6">
            Processing Files
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Processing {uploadedFiles.length} file(s) with {selectedTemplate?.name} template
            </Typography>
          </Box>

          <Stepper orientation="vertical">
            {processingSteps.map((step, index) => (
              <Step key={step.id} active={step.status === 'RUNNING'} completed={step.status === 'COMPLETED'}>
                <StepLabel>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">
                      {step.name}
                    </Typography>
                    {step.status === 'RUNNING' && <CircularProgress size={16} />}
                    {step.status === 'COMPLETED' && <CheckCircle color="success" fontSize="small" />}
                    {step.status === 'FAILED' && <Error color="error" fontSize="small" />}
                  </Box>
                  {step.message && (
                    <Typography variant="body2" color="text.secondary">
                      {step.message}
                    </Typography>
                  )}
                  {step.status === 'RUNNING' && (
                    <LinearProgress sx={{ mt: 1, width: 200 }} />
                  )}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowProcessDialog(false)}
            disabled={processing}
          >
            {processing ? 'Processing...' : 'Close'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
