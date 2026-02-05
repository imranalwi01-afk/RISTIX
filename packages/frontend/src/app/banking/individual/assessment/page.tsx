// packages/frontend/src/app/banking/individual/assessment/page.tsx
// ============================================================================
// IFRS9 FRONTEND - INDIVIDUAL IMPAIRMENT ASSESSMENT PAGE
// ============================================================================
// Purpose: Individual account impairment assessment and DCF analysis
// API Integration: Real-time backend connectivity with FRS9PRO database
// Features: Watchlist management, DCF calculations, provision analysis
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
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Menu,
  ListItemIcon,
  Snackbar
} from '@mui/material';
import {
  Person as PersonIcon,
  Home as HomeIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Save as SaveIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Calculate as CalculateIcon,
  MonetizationOn as MoneyIcon,
  History as HistoryIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';

// API & Types
import { 
  individualImpairmentAPI, 
  individualImpairmentHelpers, 
  type IndividualImpairmentWatchlistItem, 
  type IndividualImpairmentAssessment 
} from '@/services/api.individual-impairment';

// Components
import ModernLoader from '@/components/common/ModernLoader';
import { DCFAnalysisTab } from '@/components/banking/individual/assessment/DCFAnalysisTab';
import { ProvisionCalculationTab } from '@/components/banking/individual/assessment/ProvisionCalculationTab';
import { AssessmentKPI } from '@/components/banking/individual/assessment/AssessmentKPI';
import { AssessmentFilters } from '@/components/banking/individual/assessment/AssessmentFilters';
import { AssessmentWatchlist } from '@/components/banking/individual/assessment/AssessmentWatchlist';

// Utils & Constants
import { FILTER_DEFAULTS } from '@/app/banking/individual/assessment/constants';
import { renderStageChip } from '@/app/banking/individual/assessment/utils';
import { exportToXLSX, exportToCSV, exportToPDF } from '@/utils/exportUtils';

// Tab Panel Component
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
      id={`individual-impairment-tabpanel-${index}`}
      aria-labelledby={`individual-impairment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function IndividualAssessmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [loading, setLoading] = useState(false);
  const [watchlist, setWatchlist] = useState<IndividualImpairmentWatchlistItem[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<IndividualImpairmentWatchlistItem | null>(null);
  const [assessment, setAssessment] = useState<IndividualImpairmentAssessment | null>(null);
  const [assessmentDialogOpen, setAssessmentDialogOpen] = useState(false);
  const [selectedCalculation, setSelectedCalculation] = useState<any>(null);
  const [tabValue, setTabValue] = useState(0);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 25,
    total: 0
  });

  // Filter state
  const [filters, setFilters] = useState({ ...FILTER_DEFAULTS });

  // Export state
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch watchlist data
  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page + 1,
        limit: pagination.limit
      };

      // Add filters to params if they have values
      if (filters.search) params.search = filters.search;
      if (filters.stage) params.filter = { ...params.filter, stage: parseInt(filters.stage) };
      if (filters.impairedFlag) params.filter = { ...params.filter, impaired_flag: filters.impairedFlag };
      if (filters.assessmentStatus) params.filter = { ...params.filter, assessment_status: filters.assessmentStatus };
      if (filters.priorityLevel) params.filter = { ...params.filter, priority_level: filters.priorityLevel };
      if (filters.ratingCode) params.filter = { ...params.filter, rating_code: filters.ratingCode };

      const response = await individualImpairmentAPI.watchlist.getAll(params);

      if (response.success) {
        setWatchlist(response.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || 0
        }));
      }
    } catch (error) {
      console.error('Error fetching watchlist:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  // Fetch assessment data for selected account
  const fetchAssessment = useCallback(async (accountId: number) => {
    try {
      const response = await individualImpairmentAPI.assessment.get(accountId);
      if (response.success) {
        setAssessment(response.data);
      }
    } catch (error) {
      console.error('Error fetching assessment:', error);
    }
  }, []);

  // Initialize page data
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  // Handle page change
  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({
      ...prev,
      limit: parseInt(event.target.value, 10),
      page: 0
    }));
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, page: 0 })); // Reset to first page
  };

  const handleResetFilters = () => {
    setFilters({ ...FILTER_DEFAULTS });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  // Handle account selection
  const handleAccountSelect = (account: IndividualImpairmentWatchlistItem) => {
    setSelectedAccount(account);
    fetchAssessment(account.account_id);
    setTabValue(1); // Switch to Assessment tab
  };

  // Handle assessment dialog
  const handleAssessmentDialog = (open: boolean) => {
    setAssessmentDialogOpen(open);
    if (!open) {
      // Logic when closing if needed
    }
  };

  const handleEditAssessment = (account: IndividualImpairmentWatchlistItem) => {
      setSelectedAccount(account);
      handleAssessmentDialog(true);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchWatchlist();
  };

  // Export handlers (Client-side export matching Product Parameters)
  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      setExportMenuAnchor(null);
      
      // Define columns for export (matching watchlist table)
      const exportColumns = [
        { field: 'account_number', headerName: 'Account Number' },
        { field: 'cif_name', headerName: 'Customer Name' },
        { field: 'cif_number', headerName: 'CIF' },
        { field: 'outstanding_balance', headerName: 'Balance' },
        { field: 'stage', headerName: 'Stage' },
        { field: 'assessment_status', headerName: 'Status' },
        { field: 'priority_level', headerName: 'Priority' },
        { field: 'impaired_flag', headerName: 'Impaired' },
        { field: 'provision_amount', headerName: 'Provision' },
        { field: 'rating_code', headerName: 'Rating' },
        { field: 'dpd', headerName: 'DPD' }
      ];
      
      // Build filter description
      const activeFilters: Record<string, any> = {};
      if (filters.search) activeFilters['Search'] = filters.search;
      if (filters.stage) activeFilters['Stage'] = filters.stage;
      if (filters.impairedFlag) activeFilters['Impaired'] = filters.impairedFlag;
      if (filters.assessmentStatus) activeFilters['Status'] = filters.assessmentStatus;
      if (filters.priorityLevel) activeFilters['Priority'] = filters.priorityLevel;
      if (filters.ratingCode) activeFilters['Rating'] = filters.ratingCode;
      
      const exportOptions = {
        title: 'Individual Impairment Assessment',
        filename: 'individual_assessment',
        filters: activeFilters,
        confidential: true
      };
      
      // Use watchlist data (already filtered by fetchWatchlist)
      const dataToExport = watchlist;
      
      let result;
      switch (format) {
        case 'xlsx': result = exportToXLSX(dataToExport, exportColumns, exportOptions); break;
        case 'csv': result = exportToCSV(dataToExport, exportColumns, exportOptions); break;
        case 'pdf': result = exportToPDF(dataToExport, exportColumns, exportOptions); break;
      }
      
      if (result && result.success) {
        setSnackbar({
          open: true,
          message: `Exported ${dataToExport.length} records to ${format.toUpperCase()}`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: `Failed to export to ${format.toUpperCase()}`,
          severity: 'error'
        });
      }
    } catch (error: any) {
      console.error('Export error:', error);
      setSnackbar({
        open: true,
        message: `Export failed: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Handle DCF calculation
  const handleCalculateDCF = async (parameters: any) => {
    if (!selectedAccount?.account_id) return;

    setLoading(true);
    try {
      // Transform frontend parameters to match backend schema
      const prcDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD
      
      // Generate sample cash flows based on parameters
      const cashFlows = [];
      const monthlyPayment = (selectedAccount.outstanding_balance || 0) / (parameters.timeHorizon || 60);
      
      for (let i = 0; i < (parameters.timeHorizon || 60); i++) {
        cashFlows.push({
          periode: new Date(Date.now() + i * 30 * 24 * 60 * 60 * 1000).toISOString(),
          principal: monthlyPayment * (parameters.recoveryRate / 100),
          interest: monthlyPayment * 0.1, // 10% of payment as interest
          collateral: 0
        });
      }

      // Build request payload matching backend schema
      const requestPayload = {
        account_id: selectedAccount.account_id,
        prc_date: prcDate,
        cash_flows: cashFlows,
        scenario_data: {
          scenario_id: parameters.scenarioType === 'optimistic' ? 2 : parameters.scenarioType === 'pessimistic' ? 3 : 1,
          scenario_name: parameters.scenarioType || 'base',
          pd_rates: [0.05], // 5% default PD rate
          recovery_rates: [parameters.recoveryRate / 100] // Convert percentage to decimal
        }
      };

      console.log('🧮 DCF Request Payload:', JSON.stringify(requestPayload, null, 2));

      const response = await individualImpairmentAPI.dcf.calculate(selectedAccount.account_id, requestPayload);
      
      console.log('✅ DCF Response:', response);
      
      if (response.success) {
        setSelectedCalculation(response.data);
        setSnackbar({
          open: true,
          message: 'DCF calculation completed successfully',
          severity: 'success'
        });
      }
    } catch (error: any) {
      console.error('❌ Error calculating DCF:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || 'DCF calculation failed',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle save assessment
  const handleSaveAssessment = async (assessmentData: any) => {
    if (!selectedAccount?.account_id) return;

    setLoading(true);
    try {
      const response = await individualImpairmentAPI.assessment.create({ ...assessmentData, account_id: selectedAccount.account_id });
      if (response.success) {
        setAssessment(response.data);
        fetchWatchlist(); // Refresh watchlist to update status
      }
    } catch (error) {
      console.error('Error saving assessment:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth={false} sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
      <ModernLoader 
        open={loading && watchlist.length === 0} 
        message="Loading Assessment Data" 
        subMessage="Fetching individual impairment details..." 
      />
      {/* Breadcrumb Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1.5 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            router.push('/dashboard');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 0.5, fontSize: 16 }} />
          Individual Assessment
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box 
        sx={{ 
          mb: 1.5,
          pb: 1.5,
          borderBottom: '2px solid',
          borderColor: 'divider',
          background: 'linear-gradient(to right, rgba(25, 118, 210, 0.03) 0%, rgba(255, 255, 255, 0) 100%)',
          borderRadius: 2,
          p: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 8px rgba(25, 118, 210, 0.25)'
              }}
            >
              <PersonIcon sx={{ fontSize: 26, color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h5" component="h1" sx={{ fontWeight: 700, color: 'primary.dark', mb: 0.25, lineHeight: 1.2 }}>
                Individual Impairment Assessment
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.72rem' }}>
                Account impairment assessment, DCF analysis & provision calculation
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              disabled={loading || watchlist.length === 0}
            >
              Export
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={() => setExportMenuAnchor(null)}
            >
              <MenuItem onClick={() => handleExport('xlsx')}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                Export to Excel (XLSX)
              </MenuItem>
              <MenuItem onClick={() => handleExport('csv')}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                Export to CSV
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleExport('pdf')}>
                <ListItemIcon>
                  <DownloadIcon fontSize="small" />
                </ListItemIcon>
                Export to PDF
              </MenuItem>
            </Menu>
          </Box>
        </Box>

      </Box>

      {/* Main Content */}
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, maxWidth: '100%', overflowX: 'hidden' }}>
            
            {/* KPI Cards */}
            <AssessmentKPI watchlist={watchlist} loading={loading} />

             {/* Filters */}
             <AssessmentFilters 
                filters={filters} 
                onFilterChange={handleFilterChange} 
                onReset={handleResetFilters}
             />

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={(e, newValue) => setTabValue(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 500,
                    minHeight: 64,
                    '&.Mui-selected': {
                      fontWeight: 700,
                      color: 'primary.main'
                    }
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    borderRadius: '3px 3px 0 0'
                  }
                }}
              >
                <Tab label="Watchlist" icon={<AssignmentIcon />} iconPosition="start" />
                <Tab label="Assessment Details" icon={<AssessmentIcon />} iconPosition="start" disabled={!selectedAccount} />
                <Tab label="DCF Analysis" icon={<CalculateIcon />} iconPosition="start" disabled={!selectedAccount} />
                <Tab label="Provision Calculation" icon={<MoneyIcon />} iconPosition="start" disabled={!selectedAccount} />
                <Tab label="History" icon={<HistoryIcon />} iconPosition="start" disabled={!selectedAccount} />
                <Tab label="Documents" icon={<DescriptionIcon />} iconPosition="start" disabled={!selectedAccount} />
              </Tabs>
            </Box>

            <Box>
            {/* Tab Panels */}
            <TabPanel value={tabValue} index={0}>
              {/* Watchlist Table */}
              <AssessmentWatchlist 
                 watchlist={watchlist}
                 loading={loading}
                 pagination={pagination}
                 onPageChange={handlePageChange}
                 onRowsPerPageChange={handleRowsPerPageChange}
                 onAccountSelect={handleAccountSelect}
                 onEditAssessment={handleEditAssessment}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {selectedAccount ? (
                <Box>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Assessment details for Account {selectedAccount.account_number} - {selectedAccount.cif_name}
                  </Alert>

                  {assessment ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Assessment Information
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Impaired Flag:</Typography>
                                <Chip
                                  label={assessment.impaired_flag === 'I' ? 'Impaired' : 'Non-Impaired'}
                                  color={assessment.impaired_flag === 'I' ? 'error' : 'success'}
                                  size="small"
                                />
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Stage:</Typography>
                                {renderStageChip(assessment.stage)}
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Method:</Typography>
                                <Typography variant="body2">{assessment.method}</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Rating:</Typography>
                                <Typography variant="body2">{assessment.rating_code}</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Approval Status:</Typography>
                                <Chip
                                  label={assessment.approval_status}
                                  color={assessment.approval_status === 'APPROVED' ? 'success' : 'default'}
                                  size="small"
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Financial Details
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Outstanding Balance:</Typography>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {individualImpairmentHelpers.formatCurrency(assessment.outstanding_balance)}
                                </Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Interest Rate:</Typography>
                                <Typography variant="body2">{assessment.interest_rate}%</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Days Past Due:</Typography>
                                <Typography variant="body2">{assessment.dpd}</Typography>
                              </Box>

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2" color="text.secondary">Collectability:</Typography>
                                <Typography variant="body2">{assessment.collectability}%</Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>

                      <Grid item xs={12}>
                        <Card>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Assessment Comments
                            </Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Typography variant="body2" paragraph>
                              {assessment.analyst_comments || 'No analyst comments available.'}
                            </Typography>

                            {assessment.reviewer_comments && (
                              <>
                                <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>
                                  Reviewer Comments:
                                </Typography>
                                <Typography variant="body2">
                                  {assessment.reviewer_comments}
                                </Typography>
                              </>
                            )}
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  ) : (
                    <Alert severity="info">
                      No assessment data available for this account.
                    </Alert>
                  )}
                </Box>
              ) : (
                <Alert severity="info">
                  Please select an account from the watchlist to view assessment details.
                </Alert>
              )}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <DCFAnalysisTab
                account={selectedAccount}
                assessment={assessment}
                onCalculate={handleCalculateDCF}
                loading={loading}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
              <ProvisionCalculationTab
                account={selectedAccount}
                assessment={assessment}
                calculation={selectedCalculation}
                loading={loading}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={4}>
               <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Audit & Override History</Typography>
                  <Alert severity="info">
                    History module will be available in Phase 2. This will track all stage overrides, collisions, and approval workflows.
                  </Alert>
               </Box>
            </TabPanel>

           <TabPanel value={tabValue} index={5}>
               <Box sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>Documents & Reports</Typography>
                   <Alert severity="info">
                    Document management will be available in Phase 2. This will handle DCF upload validations and generated individual reports.
                  </Alert>
               </Box>
            </TabPanel>
          </Box>

          {/* Assessment Dialog - Refactored slightly to look cleaner */}
          <Dialog
            open={assessmentDialogOpen}
            onClose={() => handleAssessmentDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Individual Assessment Override: {selectedAccount?.account_number}</DialogTitle>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                accountNumber: selectedAccount?.account_number,
                overrideStage: formData.get('overrideStage'),
                justification: formData.get('justification'),
                status: 'APPROVED',
                createdBy: 'Analyst'
              };
              await handleSaveAssessment(data);
              handleAssessmentDialog(false);
            }}>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Override Stage</InputLabel>
                      <Select
                        name="overrideStage"
                        defaultValue={selectedAccount?.stage.toString() || '1'}
                        label="Override Stage"
                        required
                      >
                        <MenuItem value="1">Stage 1: Low Credit Risk</MenuItem>
                        <MenuItem value="2">Stage 2: Significant Increase (SICR)</MenuItem>
                        <MenuItem value="3">Stage 3: Default / Impaired</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="justification"
                      label="Justification"
                      multiline
                      rows={4}
                      required
                      placeholder="Provide reasoning for manual stage override..."
                    />
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => handleAssessmentDialog(false)}>Cancel</Button>
                <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />}>
                  Save Override
                </Button>
              </DialogActions>
            </form>
          </Dialog>
          

          
          {/* Snackbar Notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setSnackbar({ ...snackbar, open: false })}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
