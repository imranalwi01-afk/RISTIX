// packages/frontend/src/app/banking/ifrs9/amortization/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { useAuth } from '@/providers/AuthProvider';

interface AmortizationData {
  id: string;
  accountNumber: string;
  customerName: string;
  contractNumber: string;
  productType: string;
  originalBalance: number;
  currentBalance: number;
  interestRate: number;
  effectiveInterestRate: number;
  amortizationMethod: string;
  remainingTerm: number;
  originalTerm: number;
  nextPaymentDate: string;
  nextPaymentAmount: number;
  status: 'active' | 'completed' | 'restructured' | 'written-off';
}

interface AmortizationSchedule {
  period: number;
  paymentDate: string;
  beginningBalance: number;
  payment: number;
  interest: number;
  principal: number;
  endingBalance: number;
  cumulativeInterest: number;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`amortization-tabpanel-${index}`}
      aria-labelledby={`amortization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

import { amortizationAPI } from '@/services/api.amortization';

// ... imports

export default function AmortizationPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AmortizationData[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AmortizationData | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationSchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Mock data removed

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await amortizationAPI.getAll({ page: 1, limit: 100 });

      if (result.success && Array.isArray(result.data)) {
        const mappedData: AmortizationData[] = result.data.map((item: any) => ({
          id: String(item.id),
          accountNumber: item.accountNumber || `ACC-${item.accountId}`,
          customerName: item.customerName || 'Unknown Customer',
          contractNumber: String(item.accountId),
          productType: 'Loan', // Default
          originalBalance: Number(item.nLoanAmt || 0),
          currentBalance: Number(item.nOsprn || 0),
          interestRate: Number(item.nIntRate || 0),
          effectiveInterestRate: Number(item.nEffIntRate || 0),
          amortizationMethod: 'Effective Interest',
          remainingTerm: Number(item.counterRest || 0),
          originalTerm: Number(item.paymentterm || 0),
          nextPaymentDate: item.pmtDate || '',
          nextPaymentAmount: Number(item.nInstallment || 0),
          status: 'active'
        }));
        setData(mappedData);
      }
    } catch (error) {
      console.error('Error loading amortization data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (record: AmortizationData) => {
    setSelectedRecord(record);
    setDetailsDialogOpen(true);
  };

  const handleViewSchedule = (record: AmortizationData) => {
    setSelectedRecord(record);
    setAmortizationSchedule([]);
    setScheduleDialogOpen(true);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleRecalculate = () => {
    // Implementation for recalculation
    console.log('Recalculating amortization schedules...');
  };

  const filteredData = data.filter(item => {
    const matchesSearch = item.accountNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'restructured': return 'warning';
      case 'written-off': return 'error';
      default: return 'default';
    }
  };

  const getProgressPercentage = (original: number, current: number) => {
    return ((original - current) / original) * 100;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading amortization data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          IFRS 9 Amortization Analysis
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={handleRecalculate}
          >
            Recalculate
          </Button>
        </Box>
      </Box>

      {/* Alert */}
      <Alert severity="info" sx={{ mb: 3 }}>
        This page shows IFRS 9 amortization analysis using effective interest rate method for financial assets.
        Last calculation run: {new Date().toLocaleString()}
      </Alert>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)}>
          <Tab label="Amortization Overview" icon={<AssessmentIcon />} />
          <Tab label="Payment Schedule" icon={<TimelineIcon />} />
          <Tab label="Effective Rate Analysis" icon={<AccountBalanceIcon />} />
          <Tab label="Interest Calculations" icon={<CalculateIcon />} />
        </Tabs>
      </Box>

      {/* Tab 1: Amortization Overview */}
      <TabPanel value={selectedTab} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Amortization Portfolio Overview
            </Typography>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Account/Customer"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status Filter</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status Filter"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="restructured">Restructured</MenuItem>
                    <MenuItem value="written-off">Written Off</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {data.length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {data.filter(item => item.status === 'active').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Active Accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="info.main">
                      {data.filter(item => item.status === 'completed').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Completed Accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card>
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {data.filter(item => item.status === 'restructured').length}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Restructured Accounts
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Data Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Number</TableCell>
                    <TableCell>Customer Name</TableCell>
                    <TableCell>Product Type</TableCell>
                    <TableCell>Current Balance</TableCell>
                    <TableCell>Interest Rate</TableCell>
                    <TableCell>Amortization Method</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>{row.accountNumber}</TableCell>
                      <TableCell>{row.customerName}</TableCell>
                      <TableCell>{row.productType}</TableCell>
                      <TableCell>{formatCurrency(row.currentBalance)}</TableCell>
                      <TableCell>{row.interestRate.toFixed(2)}%</TableCell>
                      <TableCell>{row.amortizationMethod}</TableCell>
                      <TableCell sx={{ width: 150 }}>
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {getProgressPercentage(row.originalBalance, row.currentBalance).toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={getProgressPercentage(row.originalBalance, row.currentBalance)}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          color={getStatusColor(row.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleViewDetails(row)}
                            sx={{ mr: 1 }}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Schedule">
                          <IconButton
                            size="small"
                            onClick={() => handleViewSchedule(row)}
                          >
                            <TimelineIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 2: Payment Schedule */}
      <TabPanel value={selectedTab} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Payment Schedule Analysis
            </Typography>
            <Alert severity="info">
              Detailed payment schedule analysis and forecasting will be available here.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 3: Effective Rate Analysis */}
      <TabPanel value={selectedTab} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Effective Interest Rate Analysis
            </Typography>
            <Alert severity="info">
              Effective interest rate calculations and methodology analysis will be displayed here.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Tab 4: Interest Calculations */}
      <TabPanel value={selectedTab} index={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Interest Calculation Analysis
            </Typography>
            <Alert severity="info">
              Detailed interest calculation breakdown and analysis will be available here.
            </Alert>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Amortization Details</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  value={selectedRecord.accountNumber}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Customer Name"
                  value={selectedRecord.customerName}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Original Balance"
                  value={formatCurrency(selectedRecord.originalBalance)}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Current Balance"
                  value={formatCurrency(selectedRecord.currentBalance)}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Interest Rate"
                  value={`${selectedRecord.interestRate.toFixed(2)}%`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Effective Interest Rate"
                  value={`${selectedRecord.effectiveInterestRate.toFixed(2)}%`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Remaining Term"
                  value={`${selectedRecord.remainingTerm} months`}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Next Payment Amount"
                  value={formatCurrency(selectedRecord.nextPaymentAmount)}
                  disabled
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog
        open={scheduleDialogOpen}
        onClose={() => setScheduleDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Amortization Schedule</DialogTitle>
        <DialogContent>
          {selectedRecord && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Account: {selectedRecord.accountNumber} - {selectedRecord.customerName}
              </Typography>
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Period</TableCell>
                      <TableCell>Payment Date</TableCell>
                      <TableCell>Beginning Balance</TableCell>
                      <TableCell>Payment</TableCell>
                      <TableCell>Interest</TableCell>
                      <TableCell>Principal</TableCell>
                      <TableCell>Ending Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {amortizationSchedule.map((schedule) => (
                      <TableRow key={schedule.period}>
                        <TableCell>{schedule.period}</TableCell>
                        <TableCell>{schedule.paymentDate}</TableCell>
                        <TableCell>{formatCurrency(schedule.beginningBalance)}</TableCell>
                        <TableCell>{formatCurrency(schedule.payment)}</TableCell>
                        <TableCell>{formatCurrency(schedule.interest)}</TableCell>
                        <TableCell>{formatCurrency(schedule.principal)}</TableCell>
                        <TableCell>{formatCurrency(schedule.endingBalance)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}