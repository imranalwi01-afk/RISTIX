// packages/frontend/src/components/banking/syariah/SyariahComplianceChecker.tsx
// ============================================================================
// SYARIAH COMPLIANCE CHECKER - ISLAMIC BANKING VALIDATION
// ============================================================================
// File Path: packages/frontend/src/components/banking/syariah/SyariahComplianceChecker.tsx
// Purpose: Comprehensive Syariah compliance validation for Islamic banking
// Features: AAOIFI standards, Halal screening, DPS approval workflows
// Dependencies: Material-UI v6, Configuration Provider, Islamic principles
// ============================================================================

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Button,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Divider,
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
} from '@mui/material';
import {
  Security,
  CheckCircle,
  Warning,
  Error,
  ExpandMore,
  Gavel,
  Business,
  AccountBalance,
  Assessment,
  Group,
  Schedule,
  Info,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { SyariahComplianceData, SyariahValidation } from '../types';

interface SyariahComplianceCheckerProps {
  accountId?: string;
  productId?: string;
  transactionData?: any;
  onComplianceResult?: (isCompliant: boolean, details: SyariahComplianceData) => void;
  showDetailedAnalysis?: boolean;
}

// ✅ Prohibited sectors according to Islamic principles
const PROHIBITED_SECTORS = [
  'alcohol',
  'gambling',
  'pork',
  'conventional_banking',
  'adult_entertainment',
  'tobacco',
  'weapons',
  'insurance_conventional',
];

// ✅ Islamic contract types
const ISLAMIC_CONTRACTS = [
  { code: 'murabaha', name: 'Murabaha', description: 'Cost-plus sale contract' },
  { code: 'musharaka', name: 'Musharaka', description: 'Joint venture partnership' },
  { code: 'mudaraba', name: 'Mudaraba', description: 'Profit-sharing partnership' },
  { code: 'ijara', name: 'Ijara', description: 'Islamic leasing' },
  { code: 'salam', name: 'Salam', description: 'Forward sale contract' },
  { code: 'istisna', name: 'Istisna', description: 'Manufacturing contract' },
  { code: 'qard', name: 'Qard Hassan', description: 'Benevolent loan' },
  { code: 'sukuk', name: 'Sukuk', description: 'Islamic bonds' },
];

// ✅ Sample compliance data
const sampleComplianceData: SyariahComplianceData = {
  isHalalCertified: true,
  syariahBoardApproval: true,
  dpsApprovalDate: new Date('2024-12-01'),
  halalCertificationDate: new Date('2024-11-15'),
  prohibitedSectors: PROHIBITED_SECTORS,
  profitSharingRatio: 60, // 60% for customer, 40% for bank
  islamicContractType: 'murabaha',
  underlyingAssetType: 'Real Estate',
  complianceValidation: {
    aaoifiCompliant: true,
    ojkCompliant: true,
    customSyariahRules: true,
    validationDate: new Date(),
    validatedBy: 'DPS Board',
    notes: 'Full compliance with all Syariah principles'
  }
};

const SyariahComplianceChecker: React.FC<SyariahComplianceCheckerProps> = ({
  accountId,
  productId,
  transactionData,
  onComplianceResult,
  showDetailedAnalysis = true,
}) => {
  const [complianceData, setComplianceData] = useState<SyariahComplianceData>(sampleComplianceData);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedContract, setSelectedContract] = useState<string>('');

  // ✅ Get tenant configuration
  const tenantConfig = useSelector((state: any) => state.configuration?.tenant);
  const bankingMode = useSelector((state: any) => state.banking?.bankingMode);

  // ✅ Calculate compliance score
  const calculateComplianceScore = useCallback((data: SyariahComplianceData): number => {
    let score = 0;
    const maxScore = 100;

    // Halal certification (25 points)
    if (data.isHalalCertified) score += 25;

    // DPS approval (25 points)
    if (data.syariahBoardApproval) score += 25;

    // AAOIFI compliance (20 points)
    if (data.complianceValidation.aaoifiCompliant) score += 20;

    // OJK compliance (20 points)
    if (data.complianceValidation.ojkCompliant) score += 20;

    // Valid Islamic contract (10 points)
    if (data.islamicContractType && ISLAMIC_CONTRACTS.some(c => c.code === data.islamicContractType)) {
      score += 10;
    }

    return Math.min(score, maxScore);
  }, []);

  // ✅ Perform compliance check
  const performComplianceCheck = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call for compliance check
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate compliance score
      const score = calculateComplianceScore(complianceData);
      const isCompliant = score >= 80; // Minimum 80% for compliance
      
      // Call parent callback
      onComplianceResult?.(isCompliant, complianceData);
      
    } catch (error) {
      console.error('Compliance check failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [complianceData, calculateComplianceScore, onComplianceResult]);

  // ✅ Auto-check compliance on mount
  useEffect(() => {
    if (bankingMode === 'syariah' || bankingMode === 'dual') {
      performComplianceCheck();
    }
  }, [bankingMode, performComplianceCheck]);

  // ✅ Get compliance status
  const complianceScore = calculateComplianceScore(complianceData);
  const isFullyCompliant = complianceScore >= 80;
  const complianceLevel = complianceScore >= 90 ? 'excellent' : complianceScore >= 80 ? 'good' : complianceScore >= 60 ? 'acceptable' : 'poor';

  // ✅ Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'success';
      case 'acceptable': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Main Compliance Card */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Security color="secondary" fontSize="large" />
              <Box>
                <Typography variant="h6">Syariah Compliance Status</Typography>
                <Typography variant="body2" color="text.secondary">
                  Islamic banking compliance validation
                </Typography>
              </Box>
            </Box>
            <Chip
              label={`${complianceScore}% Compliant`}
              color={getStatusColor(complianceLevel) as any}
              icon={isFullyCompliant ? <CheckCircle /> : <Warning />}
              size="large"
            />
          </Box>

          {/* Progress Bar */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Compliance Score: {complianceScore}/100
            </Typography>
            <LinearProgress
              variant="determinate"
              value={complianceScore}
              color={getStatusColor(complianceLevel) as any}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>

          {/* Status Alert */}
          <Alert 
            severity={isFullyCompliant ? 'success' : 'warning'} 
            sx={{ mb: 3 }}
            icon={isFullyCompliant ? <CheckCircle /> : <Warning />}
          >
            <Typography variant="body2">
              {isFullyCompliant 
                ? '✅ This product/transaction is fully compliant with Syariah principles'
                : '⚠️ This product/transaction requires review for full Syariah compliance'
              }
            </Typography>
          </Alert>

          {/* Quick Status Grid */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <CheckCircle 
                  color={complianceData.isHalalCertified ? 'success' : 'disabled'} 
                  fontSize="large" 
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Halal Certified
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Gavel 
                  color={complianceData.syariahBoardApproval ? 'success' : 'disabled'} 
                  fontSize="large" 
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  DPS Approved
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Assessment 
                  color={complianceData.complianceValidation.aaoifiCompliant ? 'success' : 'disabled'} 
                  fontSize="large" 
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  AAOIFI Standards
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <AccountBalance 
                  color={complianceData.complianceValidation.ojkCompliant ? 'success' : 'disabled'} 
                  fontSize="large" 
                />
                <Typography variant="body2" sx={{ mt: 1 }}>
                  OJK Compliant
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Assessment />}
              onClick={() => setShowDetailsDialog(true)}
            >
              View Details
            </Button>
            <Button
              variant="outlined"
              startIcon={<Security />}
              onClick={performComplianceCheck}
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Re-check Compliance'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Detailed Analysis (Optional) */}
      {showDetailedAnalysis && (
        <Box sx={{ mt: 3 }}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Islamic Contract Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Contract Type</Typography>
                  <Chip 
                    label={ISLAMIC_CONTRACTS.find(c => c.code === complianceData.islamicContractType)?.name || 'Not Specified'} 
                    color="secondary" 
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {ISLAMIC_CONTRACTS.find(c => c.code === complianceData.islamicContractType)?.description || 'Contract type not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Underlying Asset</Typography>
                  <Typography variant="body1">{complianceData.underlyingAssetType}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Asset backing the Islamic financing
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Profit Sharing Structure</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>Profit Distribution Ratio</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="secondary.main">
                          {complianceData.profitSharingRatio}%
                        </Typography>
                        <Typography variant="body2">Customer Share</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" color="primary.main">
                          {100 - complianceData.profitSharingRatio}%
                        </Typography>
                        <Typography variant="body2">Bank Share</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">Prohibited Sectors Screening</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                Investment prohibited in the following sectors according to Islamic principles
              </Alert>
              <Grid container spacing={1}>
                {PROHIBITED_SECTORS.map((sector) => (
                  <Grid item key={sector}>
                    <Chip
                      label={sector.replace('_', ' ').toUpperCase()}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}

      {/* Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={() => setShowDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="secondary" />
            Comprehensive Syariah Compliance Report
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Compliance Criteria</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Halal Certification</TableCell>
                  <TableCell align="center">
                    {complianceData.isHalalCertified ? 
                      <CheckCircle color="success" /> : 
                      <Error color="error" />
                    }
                  </TableCell>
                  <TableCell>
                    {complianceData.halalCertificationDate?.toLocaleDateString() || 'Not certified'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>DPS Board Approval</TableCell>
                  <TableCell align="center">
                    {complianceData.syariahBoardApproval ? 
                      <CheckCircle color="success" /> : 
                      <Error color="error" />
                    }
                  </TableCell>
                  <TableCell>
                    {complianceData.dpsApprovalDate?.toLocaleDateString() || 'Pending approval'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>AAOIFI Standards</TableCell>
                  <TableCell align="center">
                    {complianceData.complianceValidation.aaoifiCompliant ? 
                      <CheckCircle color="success" /> : 
                      <Error color="error" />
                    }
                  </TableCell>
                  <TableCell>
                    Accounting and Auditing Organization for Islamic Financial Institutions
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>OJK Islamic Banking</TableCell>
                  <TableCell align="center">
                    {complianceData.complianceValidation.ojkCompliant ? 
                      <CheckCircle color="success" /> : 
                      <Error color="error" />
                    }
                  </TableCell>
                  <TableCell>
                    Indonesian Financial Services Authority regulations
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Validation Details</Typography>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Validated by:</strong> {complianceData.complianceValidation.validatedBy}<br />
                <strong>Validation Date:</strong> {complianceData.complianceValidation.validationDate.toLocaleDateString()}<br />
                <strong>Notes:</strong> {complianceData.complianceValidation.notes}
              </Typography>
            </Alert>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)} color="inherit">
            Close
          </Button>
          <Button variant="contained" color="secondary">
            Download Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SyariahComplianceChecker;