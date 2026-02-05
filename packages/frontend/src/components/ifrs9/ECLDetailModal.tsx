// packages/frontend/src/components/ifrs9/ECLDetailModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as BackIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Info as InfoIcon
} from '@mui/icons-material';

interface ECLDetailData {
  stage: number;
  pd_rate: number;
  lgd_rate: number;
  ead_amount: number;
  ecl_amount: number;
  method_version: string;
  movement_amount?: number;
  movement_type?: string;
  last_updated: string;
  // Additional context
  account_id: string;
  contract_no: string;
  as_of_date: string;
  profit_center?: string;
  branch_code?: string;
}

interface ECLDetailModalProps {
  open: boolean;
  onClose: () => void;
  accountId: string | null;
  contractNo: string | null;
  asOfDate: string;
  profitCenter?: string;
  branchCode?: string;
  // Role-based access
  userRole: string;
  allowedRoles?: string[];
}

const ECLDetailModal: React.FC<ECLDetailModalProps> = ({
  open,
  onClose,
  accountId,
  contractNo,
  asOfDate,
  profitCenter,
  branchCode,
  userRole,
  allowedRoles = ['BANK_IFRS_MANAGER', 'BANK_CRO', 'SENIOR_IFRS9_CONSULTANT']
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eclData, setEclData] = useState<ECLDetailData | null>(null);

  // Check role-based access
  const hasAccess = allowedRoles.includes(userRole);

  useEffect(() => {
    if (open && accountId && hasAccess) {
      fetchECLDetail();
    }
  }, [open, accountId, asOfDate]);

  const fetchECLDetail = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // API call to fetch ECL detail
      // const response = await apiClient.get(`/api/v1/banking/ifrs9/ecl-detail/${accountId}`, {
      //   params: { as_of_date: asOfDate }
      // });
      
      // Mock data for demonstration
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockData: ECLDetailData = {
        account_id: accountId || '',
        contract_no: contractNo || '',
        as_of_date: asOfDate,
        stage: 2,
        pd_rate: 5.25,
        lgd_rate: 45.0,
        ead_amount: 150000000,
        ecl_amount: 3543750,
        method_version: 'v3.2.1',
        movement_amount: -250000,
        movement_type: 'Stage Transfer (1→2)',
        last_updated: new Date().toISOString(),
        profit_center: profitCenter,
        branch_code: branchCode
      };
      
      setEclData(mockData);
    } catch (err) {
      console.error('Failed to fetch ECL detail:', err);
      setError('Failed to load ECL details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  const getStageColor = (stage: number): 'success' | 'warning' | 'error' => {
    if (stage === 1) return 'success';
    if (stage === 2) return 'warning';
    return 'error';
  };

  // Access denied UI
  if (!hasAccess) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Access Denied</Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            <Typography variant="body2">
              You do not have permission to view ECL details. This feature requires one of the following roles:
            </Typography>
            <Box sx={{ mt: 2 }}>
              {allowedRoles.map(role => (
                <Chip key={role} label={role} size="small" sx={{ mr: 1, mb: 1 }} />
              ))}
            </Box>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '600px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Box>
              <Typography variant="h6">ECL Detail Analysis</Typography>
              <Typography variant="caption" color="text.secondary">
                Contract: {contractNo} | As-of: {asOfDate}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && eclData && (
          <Box>
            {/* Context Information */}
            <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Account ID</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{eclData.account_id}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">As-of Date</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{eclData.as_of_date}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Profit Center</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{eclData.profit_center || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="caption" color="text.secondary">Branch Code</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{eclData.branch_code || 'N/A'}</Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Key Metrics Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Current Stage</Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label={`Stage ${eclData.stage}`} 
                      color={getStageColor(eclData.stage)}
                      size="medium"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">ECL Amount</Typography>
                  <Typography variant="h6" sx={{ mt: 1, color: 'warning.main', fontWeight: 600 }}>
                    {formatCurrency(eclData.ecl_amount)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">EAD Amount</Typography>
                  <Typography variant="h6" sx={{ mt: 1, color: 'info.main', fontWeight: 600 }}>
                    {formatCurrency(eclData.ead_amount)}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Method Version</Typography>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 600 }}>
                    {eclData.method_version}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Detailed Parameters Table */}
            <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
              ECL Calculation Parameters
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
                      Parameter
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
                      Value
                    </TableCell>
                    <TableCell sx={{ bgcolor: 'primary.main', color: 'white', fontWeight: 600 }}>
                      Description
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>PD Rate</TableCell>
                    <TableCell>{formatPercentage(eclData.pd_rate)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        Probability of Default - likelihood of borrower defaulting within 12 months
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>LGD Rate</TableCell>
                    <TableCell>{formatPercentage(eclData.lgd_rate)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        Loss Given Default - estimated loss if default occurs
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>EAD Amount</TableCell>
                    <TableCell>{formatCurrency(eclData.ead_amount)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        Exposure at Default - outstanding balance at default
                      </Typography>
                    </TableCell>
                  </TableRow>
                  
                  <TableRow sx={{ bgcolor: 'warning.50' }}>
                    <TableCell sx={{ fontWeight: 600 }}>ECL Amount</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {formatCurrency(eclData.ecl_amount)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        Calculated as: EAD × PD × LGD = {formatCurrency(eclData.ead_amount)} × {formatPercentage(eclData.pd_rate)} × {formatPercentage(eclData.lgd_rate)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            {/* ECL Movement (if available) */}
            {eclData.movement_amount && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                  ECL Movement
                </Typography>
                <Paper sx={{ p: 2, bgcolor: eclData.movement_amount < 0 ? 'success.50' : 'error.50' }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <TrendingUpIcon 
                        sx={{ 
                          fontSize: 40, 
                          color: eclData.movement_amount < 0 ? 'success.main' : 'error.main',
                          transform: eclData.movement_amount < 0 ? 'rotate(180deg)' : 'none'
                        }} 
                      />
                    </Grid>
                    <Grid item xs>
                      <Typography variant="body2" color="text.secondary">Movement Type</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {eclData.movement_type}
                      </Typography>
                    </Grid>
                    <Grid item>
                      <Typography variant="h5" sx={{ 
                        fontWeight: 600,
                        color: eclData.movement_amount < 0 ? 'success.main' : 'error.main'
                      }}>
                        {eclData.movement_amount > 0 ? '+' : ''}{formatCurrency(eclData.movement_amount)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* Audit Information */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon sx={{ fontSize: 14, mr: 0.5 }} />
                Last Updated: {new Date(eclData.last_updated).toLocaleString('id-ID', { 
                  dateStyle: 'long', 
                  timeStyle: 'short' 
                })} WIB
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          startIcon={<BackIcon />}
        >
          Back to List
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="text" size="small">
          Export Detail
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ECLDetailModal;
