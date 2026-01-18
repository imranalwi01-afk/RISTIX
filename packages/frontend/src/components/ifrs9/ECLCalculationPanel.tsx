// packages/frontend/src/components/ifrs9/ECLCalculationPanel.tsx
// ✅ SURGICAL CREATION: Expected Credit Loss Calculation Panel
// ✅ Integrates: paste-1 (ECL Calculations, IFRS9 Processing), paste-4 (System Flowchart)

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
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
  Paper,
  Tabs,
  Tab,
  Divider,
} from '@mui/material';
import {
  PlayArrow,
  Stop,
  Refresh,
  Download,
  Info,
  Warning,
  CheckCircle,
  Error,
  BarChart,
  Timeline,
  Assessment,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useDualBankingTheme } from '../../themes/shared/theme.provider';

// ✅ Types based on paste-1 IFRS9 Pro System requirements
interface ECLCalculationJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startTime?: string;
  endTime?: string;
  totalAccounts: number;
  processedAccounts: number;
  stage1Count: number;
  stage2Count: number;
  stage3Count: number;
  totalECL: number;
  currency: string;
}

interface ECLParameters {
  calculationDate: string;
  scenarioType: 'base' | 'optimistic' | 'pessimistic' | 'custom';
  pdModelVersion: string;
  lgdModelVersion: string;
  eadModelVersion: string;
  forwardLookingPeriods: number;
  significantIncreaseThreshold: number;
  lowCreditRiskThreshold: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index} style={{ width: '100%' }}>
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const ECLCalculationPanel: React.FC = () => {
  const { bankingType } = useDualBankingTheme();
  const { user } = useSelector((state: any) => state.auth);
  
  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [currentJob, setCurrentJob] = useState<ECLCalculationJob | null>(null);
  const [parameters, setParameters] = useState<ECLParameters>({
    calculationDate: new Date().toISOString().split('T')[0],
    scenarioType: 'base',
    pdModelVersion: '1.0',
    lgdModelVersion: '1.0', 
    eadModelVersion: '1.0',
    forwardLookingPeriods: 12,
    significantIncreaseThreshold: 30,
    lowCreditRiskThreshold: 1.0,
  });
  const [jobHistory, setJobHistory] = useState<ECLCalculationJob[]>([]);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Mock data for demonstration (replace with API calls)
  useEffect(() => {
    // Simulate loading job history
    const mockHistory: ECLCalculationJob[] = [
      {
        id: 'job-001',
        name: 'Monthly ECL Calculation - June 2024',
        status: 'completed',
        progress: 100,
        startTime: '2024-06-01T10:00:00Z',
        endTime: '2024-06-01T10:45:00Z',
        totalAccounts: 15420,
        processedAccounts: 15420,
        stage1Count: 13890,
        stage2Count: 1320,
        stage3Count: 210,
        totalECL: 2450000,
        currency: 'IDR',
      },
      {
        id: 'job-002',
        name: 'Stress Test ECL - Pessimistic Scenario',
        status: 'completed',
        progress: 100,
        startTime: '2024-05-28T14:30:00Z',
        endTime: '2024-05-28T15:20:00Z',
        totalAccounts: 15420,
        processedAccounts: 15420,
        stage1Count: 12100,
        stage2Count: 2810,
        stage3Count: 510,
        totalECL: 4890000,
        currency: 'IDR',
      },
    ];
    setJobHistory(mockHistory);
  }, []);

  // ✅ Start ECL calculation
  const startCalculation = async () => {
    setIsLoading(true);
    
    try {
      // Create new job
      const newJob: ECLCalculationJob = {
        id: `job-${Date.now()}`,
        name: `ECL Calculation - ${new Date().toLocaleDateString()}`,
        status: 'running',
        progress: 0,
        startTime: new Date().toISOString(),
        totalAccounts: 15420,
        processedAccounts: 0,
        stage1Count: 0,
        stage2Count: 0,
        stage3Count: 0,
        totalECL: 0,
        currency: 'IDR',
      };
      
      setCurrentJob(newJob);
      
      // Simulate calculation progress
      const progressInterval = setInterval(() => {
        setCurrentJob(prev => {
          if (!prev || prev.progress >= 100) {
            clearInterval(progressInterval);
            return prev;
          }
          
          const newProgress = Math.min(prev.progress + 10, 100);
          const processedAccounts = Math.floor((newProgress / 100) * prev.totalAccounts);
          
          return {
            ...prev,
            progress: newProgress,
            processedAccounts,
            stage1Count: Math.floor(processedAccounts * 0.9),
            stage2Count: Math.floor(processedAccounts * 0.085),
            stage3Count: Math.floor(processedAccounts * 0.015),
            totalECL: Math.floor(processedAccounts * 159), // Mock ECL calculation
            ...(newProgress === 100 && {
              status: 'completed' as const,
              endTime: new Date().toISOString(),
            }),
          };
        });
      }, 2000);
      
    } catch (error) {
      console.error('Failed to start calculation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Stop calculation
  const stopCalculation = () => {
    if (currentJob) {
      setCurrentJob({
        ...currentJob,
        status: 'failed',
        endTime: new Date().toISOString(),
      });
    }
  };

  // ✅ Format currency
  const formatCurrency = (amount: number, currency: string = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // ✅ Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      {/* ✅ Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          IFRS 9 ECL Calculations
        </Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<PlayArrow />}
            onClick={startCalculation}
            disabled={currentJob?.status === 'running'}
            color="primary"
          >
            Start Calculation
          </Button>
          <Button
            variant="outlined"
            startIcon={<Stop />}
            onClick={stopCalculation}
            disabled={!currentJob || currentJob.status !== 'running'}
          >
            Stop
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* ✅ Banking Type Alert */}
      {bankingType === 'syariah' && (
        <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
          Syariah Banking Mode: ECL calculations will apply Islamic banking principles and exclude conventional interest calculations.
        </Alert>
      )}

      {/* ✅ Current Job Status */}
      {currentJob && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">{currentJob.name}</Typography>
              <Chip 
                label={currentJob.status.toUpperCase()}
                color={getStatusColor(currentJob.status) as any}
                icon={currentJob.status === 'completed' ? <CheckCircle /> : 
                      currentJob.status === 'running' ? <Timeline /> :
                      currentJob.status === 'failed' ? <Error /> : <Warning />}
              />
            </Box>
            
            {currentJob.status === 'running' && (
              <LinearProgress 
                variant="determinate" 
                value={currentJob.progress} 
                sx={{ mb: 2, height: 8, borderRadius: 4 }}
              />
            )}
            
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" color="textSecondary">Progress</Typography>
                <Typography variant="h6">{currentJob.progress}%</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" color="textSecondary">Processed Accounts</Typography>
                <Typography variant="h6">
                  {currentJob.processedAccounts.toLocaleString()} / {currentJob.totalAccounts.toLocaleString()}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" color="textSecondary">Total ECL</Typography>
                <Typography variant="h6">{formatCurrency(currentJob.totalECL)}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <Typography variant="body2" color="textSecondary">Duration</Typography>
                <Typography variant="h6">
                  {currentJob.startTime && currentJob.endTime 
                    ? `${Math.round((new Date(currentJob.endTime).getTime() - new Date(currentJob.startTime).getTime()) / 60000)} min`
                    : currentJob.startTime 
                    ? `${Math.round((Date.now() - new Date(currentJob.startTime).getTime()) / 60000)} min`
                    : 'N/A'
                  }
                </Typography>
              </Grid>
            </Grid>

            {/* ✅ Stage Breakdown */}
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>Staging Breakdown</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                    <Typography variant="h6">{currentJob.stage1Count.toLocaleString()}</Typography>
                    <Typography variant="body2">Stage 1</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                    <Typography variant="h6">{currentJob.stage2Count.toLocaleString()}</Typography>
                    <Typography variant="body2">Stage 2</Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                    <Typography variant="h6">{currentJob.stage3Count.toLocaleString()}</Typography>
                    <Typography variant="body2">Stage 3</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ✅ Main Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Parameters" icon={<Assessment />} />
            <Tab label="Job History" icon={<BarChart />} />
            <Tab label="Results" icon={<Timeline />} />
          </Tabs>
        </Box>

        {/* ✅ Parameters Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Calculation Date"
                type="date"
                value={parameters.calculationDate}
                onChange={(e) => setParameters({...parameters, calculationDate: e.target.value})}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Scenario Type</InputLabel>
                <Select
                  value={parameters.scenarioType}
                  onChange={(e) => setParameters({...parameters, scenarioType: e.target.value as any})}
                >
                  <MenuItem value="base">Base Scenario</MenuItem>
                  <MenuItem value="optimistic">Optimistic</MenuItem>
                  <MenuItem value="pessimistic">Pessimistic</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="PD Model Version"
                value={parameters.pdModelVersion}
                onChange={(e) => setParameters({...parameters, pdModelVersion: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="LGD Model Version"
                value={parameters.lgdModelVersion}
                onChange={(e) => setParameters({...parameters, lgdModelVersion: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="EAD Model Version"
                value={parameters.eadModelVersion}
                onChange={(e) => setParameters({...parameters, eadModelVersion: e.target.value})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Forward Looking Periods (months)"
                type="number"
                value={parameters.forwardLookingPeriods}
                onChange={(e) => setParameters({...parameters, forwardLookingPeriods: parseInt(e.target.value)})}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Significant Increase Threshold (%)"
                type="number"
                value={parameters.significantIncreaseThreshold}
                onChange={(e) => setParameters({...parameters, significantIncreaseThreshold: parseFloat(e.target.value)})}
              />
            </Grid>
          </Grid>
        </TabPanel>

        {/* ✅ Job History Tab */}
        <TabPanel value={activeTab} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Job Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Total ECL</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobHistory.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell>{job.name}</TableCell>
                    <TableCell>
                      <Chip 
                        label={job.status.toUpperCase()}
                        color={getStatusColor(job.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {job.startTime ? new Date(job.startTime).toLocaleString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {job.startTime && job.endTime 
                        ? `${Math.round((new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 60000)} min`
                        : 'N/A'
                      }
                    </TableCell>
                    <TableCell>{formatCurrency(job.totalECL)}</TableCell>
                    <TableCell>
                      <Tooltip title="Download Results">
                        <IconButton size="small">
                          <Download />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => setShowJobDetails(true)}
                        >
                          <Info />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* ✅ Results Tab */}
        <TabPanel value={activeTab} index={2}>
          <Alert severity="info">
            Select a completed job from the Job History tab to view detailed results.
          </Alert>
        </TabPanel>
      </Card>

      {/* ✅ Job Details Dialog */}
      <Dialog 
        open={showJobDetails} 
        onClose={() => setShowJobDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Job Details</DialogTitle>
        <DialogContent>
          <Typography>Detailed job information would be displayed here.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowJobDetails(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ECLCalculationPanel;