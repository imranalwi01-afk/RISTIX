// @ts-nocheck
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Skeleton,
  Paper,
  Alert,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Fade,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Assignment as TotalIcon,
  HourglassEmpty as PendingIcon,
  CheckCircle as ApprovedIcon,
  Cancel as RejectedIcon,
  Check as ApproveIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Calculate as CalculateIcon,
  Edit as EditIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { individualImpairmentAPI } from '@/services/api.individual-impairment';
import { formatCurrency } from '@/app/banking/individual/assessment/utils';

interface AssessmentReportsTabProps {
  onNavigate?: (accountId: number | string, tab: string, accountNumber?: string, isEdit?: boolean) => void;
}

// KPICard component - Optimized for space & Premium Look
const KPICard = ({ title, value, gradient, icon, loading, delay = 0 }: any) => (
  <Fade in={true} timeout={500} style={{ transitionDelay: `${delay}ms` }}>
    <Card
      sx={{
        flex: 1,
        minWidth: '100px',
        background: 'white',
        borderLeft: `3px solid`,
        borderColor: gradient,
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        height: '50px' // Hardcoded height to keep it consistent and small
      }}
    >
      <CardContent sx={{ p: 0.75, '&:last-child': { pb: 0.75 }, height: '100%', display: 'flex', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <Box sx={{ color: 'text.secondary', display: 'flex', flexShrink: 0 }}>
            {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 16 } })}
          </Box>
          <Box sx={{ overflow: 'hidden' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '0.55rem', display: 'block', lineHeight: 1, whiteSpace: 'nowrap' }}>
              {title}
            </Typography>
            <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1 }}>
              {loading ? <Skeleton width={30} /> : (value ?? 0)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Fade>
);

export const AssessmentReportsTab: React.FC<AssessmentReportsTabProps> = ({ onNavigate }) => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    total: 0
  });

  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    approve: 0,
    approved: 0,
    rejected: 0
  });

  // Column filters state
  const [filters, setFilters] = useState({
    prc_date: '',
    account_number: '',
    cif_name: '',
    currency: '',
    outstanding: '',
    pv_dcf_amt: '',
    ecl_ia_amt: '',
    createdby: '',
    status: ''
  });

  useEffect(() => {
    fetchReports();
  }, [pagination.page, pagination.limit]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset to page 0 when filters change
      if (pagination.page !== 0) {
        setPagination(prev => ({ ...prev, page: 0 }));
      } else {
        fetchReports();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.account_number, filters.cif_name, filters.status]);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await individualImpairmentAPI.getAssessmentSummary();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (err: any) {
      setSummary({ total: 0, pending: 0, approve: 0, approved: 0, rejected: 0 });
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 [fetchReports] Calling API with filters:', {
        limit: pagination.limit,
        offset: pagination.page * pagination.limit,
        account_number: filters.account_number,
        cif_name: filters.cif_name,
        status: filters.status
      });
      if (typeof individualImpairmentAPI?.reports?.getAll !== 'function') {
        throw new Error('Reporting API not initialized correctly');
      }

      const response = await individualImpairmentAPI.reports.getAll({
        limit: pagination.limit,
        offset: pagination.page * pagination.limit,
        account_number: filters.account_number,
        cif_name: filters.cif_name,
        status: filters.status
      });
      if (response.success && response.data) {
        // Map snake_case to camelCase
        const reportsArray = Array.isArray(response.data) ? response.data : (Array.isArray(response.data.data) ? response.data.data : []);
        const mappedData = reportsArray.map((item: any) => ({
          ...item,
          prcDate: item.prc_date || item.download_date,
          accountNumber: item.account_number,
          cifName: item.cif_name || item.customer_name,
          pvDcfAmt: item.pv_dcf_amt,
          eclIaAmt: item.ecl_ia_amt,
          accountId: item.account_id
        }));
        setReports(mappedData);
        setPagination(prev => ({
          ...prev,
          total: response.pagination?.total || (Array.isArray(response.data) ? response.data.length : 0)
        }));
      } else {
        setReports([]);
        setError('Failed to load report data.');
      }
    } catch (err: any) {
      console.error('❌ Error fetching reports:', err);
      if (err.response) {
        console.error('❌ Error Data:', err.response.data);
      }
      setError('An error occurred while fetching report data.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (column: string, value: string) => {
    setFilters(prev => ({ ...prev, [column]: value }));
  };

  // Now reports are already filtered by the server
  const filteredReports = reports;

  const handlePageChange = (_: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPagination(prev => ({ ...prev, limit: parseInt(event.target.value, 10), page: 0 }));
  };

  const renderStatusChip = (status: string) => {
    const s = String(status || 'PENDING').toUpperCase();
    const statusConfig: Record<string, { color: 'success' | 'warning' | 'secondary' | 'info' | 'default'; icon: React.ReactNode }> = {
      PENDING: { color: 'warning', icon: <ScheduleIcon sx={{ fontSize: 12 }} /> },
      SUBMITTED: { color: 'info', icon: <PendingIcon sx={{ fontSize: 12 }} /> },
      IN_PROGRESS: { color: 'info', icon: <EditIcon sx={{ fontSize: 12 }} /> },
      COMPLETED: { color: 'success', icon: <ApprovedIcon sx={{ fontSize: 12 }} /> },
      REVIEWED: { color: 'success', icon: <ApprovedIcon sx={{ fontSize: 12 }} /> },
      APPROVED: { color: 'success', icon: <ApprovedIcon sx={{ fontSize: 12 }} /> },
      REJECTED: { color: 'secondary', icon: <WarningIcon sx={{ fontSize: 12 }} /> }
    };
    const config = statusConfig[s] || { color: 'default' as const, icon: null };
    return (
      <Chip
        label={s}
        color={config.color}
        size="small"
        icon={config.icon as React.ReactElement}
        sx={{
          fontSize: '0.6rem',
          height: 20,
          fontWeight: 700,
          '& .MuiChip-icon': { ml: 0.5, mr: -0.5 }
        }}
      />
    );
  };

  return (
    <Box sx={{
      height: 'calc(100vh - 200px)', // Reduced subtraction to make it larger
      minHeight: '500px', // Ensure it doesn't get too small on short viewports
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      mt: 1,
      pb: 1,
      overflow: 'hidden'
    }}>
      {/* KPI Cards section - Fixed height at top */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 1,
        width: '100%',
        flexShrink: 0
      }}>
        <KPICard
          title="Total"
          value={summary.total}
          gradient="#1976d2"
          icon={<TotalIcon sx={{ fontSize: 20 }} />}
          loading={loading}
          delay={0}
        />
        <KPICard
          title="Pending"
          value={summary.pending}
          gradient="#f57c00"
          icon={<PendingIcon sx={{ fontSize: 20 }} />}
          loading={loading}
          delay={100}
        />
        <KPICard
          title="Approve"
          value={summary.approve}
          gradient="#0097a7"
          icon={<ApproveIcon sx={{ fontSize: 20 }} />}
          loading={loading}
          delay={200}
        />
        <KPICard
          title="Approved"
          value={summary.approved}
          gradient="#2e7d32"
          icon={<ApprovedIcon sx={{ fontSize: 20 }} />}
          loading={loading}
          delay={300}
        />
        <KPICard
          title="Rejected"
          value={summary.rejected}
          gradient="#f44336"
          icon={<RejectedIcon sx={{ fontSize: 20 }} />}
          loading={loading}
          delay={400}
        />
      </Box>

      {/* Datagrid Section - Grows to fill remaining space */}
      <Paper elevation={0} sx={{
        borderRadius: 2,
        border: '1px solid #e0e0e0',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        minHeight: '300px' // Ensure it doesn't collapse
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1.5,
          borderBottom: '1px solid #f0f0f0',
          bgcolor: '#fafafa',
          flexShrink: 0
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center' }}>
            <AssignmentIcon sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />
            Individual Assessment Report List
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchReports} disabled={loading} size="small">
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <TableContainer sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'white' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                {[
                  { id: 'prcDate', label: 'Date', width: '10%' },
                  { id: 'accountNumber', label: 'Acc No', width: '15%' },
                  { id: 'cifName', label: 'Customer', width: 'auto' }, // Fluid
                  { id: 'outstanding', label: 'Balance', align: 'right', width: '15%' },
                  { id: 'pvDcfAmt', label: 'PV DCF', align: 'right', width: '15%' },
                  { id: 'eclIaAmt', label: 'ECL IA', align: 'right', width: '12%' },
                  { id: 'status', label: 'Status', align: 'center', width: '10%' },
                  { id: 'createdby', label: 'By', width: '10%' },
                  { id: 'action', label: 'Action', width: '80px', align: 'center' }
                ].map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align as any}
                    sx={{
                      fontWeight: 700,
                      bgcolor: '#f8f9fa',
                      borderBottom: '2px solid #eee',
                      py: 1,
                      px: 1,
                      whiteSpace: 'nowrap',
                      width: col.width,
                      minWidth: col.id === 'cifName' ? 140 : 0
                    }}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.65rem', textTransform: 'uppercase' }}>
                        {col.label}
                      </Typography>
                      <TextField
                        size="small"
                        variant="outlined"
                        placeholder="Filter..."
                        fullWidth
                        value={(filters as any)[col.id === 'prcDate' ? 'prc_date' : col.id === 'accountNumber' ? 'account_number' : col.id === 'cifName' ? 'cif_name' : col.id === 'pvDcfAmt' ? 'pv_dcf_amt' : col.id === 'eclIaAmt' ? 'ecl_ia_amt' : col.id] || ''}
                        onChange={(e) => handleFilterChange(col.id === 'prcDate' ? 'prc_date' : col.id === 'accountNumber' ? 'account_number' : col.id === 'cifName' ? 'cif_name' : col.id === 'pvDcfAmt' ? 'pv_dcf_amt' : col.id === 'eclIaAmt' ? 'ecl_ia_amt' : col.id, e.target.value)}
                        InputProps={{
                          startAdornment: col.id !== 'action' ? (
                            <InputAdornment position="start">
                              <SearchIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                            </InputAdornment>
                          ) : null,
                          sx: {
                            fontSize: '0.7rem',
                            height: 28,
                            bgcolor: col.id === 'action' ? 'transparent' : 'white',
                            '& fieldset': { borderColor: col.id === 'action' ? 'transparent' : '#e0e0e0' },
                            '&:hover fieldset': { borderColor: col.id === 'action' ? 'transparent' : 'primary.main' },
                          }
                        }}
                        disabled={col.id === 'action'}
                      />
                    </Box>
                  </TableCell>
                ))}

              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(9)].map((_, j) => (
                      <TableCell key={j} sx={{ py: 1.5 }}><Skeleton /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      No matching records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report, index) => (
                  <TableRow
                    key={report.pkid || index}
                    hover
                    sx={{
                      '&:hover': { bgcolor: '#f5f9ff !important' },
                      cursor: 'pointer'
                    }}
                    onClick={() => onNavigate?.(report.accountId, 'provision-calculation', report.accountNumber)}
                  >
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>{report.prcDate || '-'}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 600 }}>
                      <Tooltip title="Click to Edit/Override Request">
                        <Typography
                          variant="inherit"
                          component="span"
                          sx={{
                            color: 'primary.main',
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' },
                            zIndex: 2,
                            position: 'relative'
                          }}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            onNavigate?.(report.accountId, 'assessment-details', report.accountNumber, true);
                          }}
                        >
                          {report.accountNumber || '-'}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', fontWeight: 500 }}>{report.cifName || '-'}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(Number(report.outstanding || 0))}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>{formatCurrency(Number(report.pvDcfAmt || 0))}</TableCell>
                    <TableCell align="right" sx={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'success.main', fontWeight: 600 }}>{formatCurrency(Number(report.eclIaAmt || 0))}</TableCell>
                    <TableCell align="center">
                      {renderStatusChip(report.status || 'APPROVED')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem' }}>{report.createdby || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View Detailed Assessment & Provision">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigate?.(report.accountId, 'provision-calculation', report.accountNumber);
                          }}
                          sx={{
                            bgcolor: 'primary.50',
                            '&:hover': { bgcolor: 'primary.100' },
                            width: 28,
                            height: 28
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={pagination.total}
          rowsPerPage={pagination.limit}
          page={pagination.page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          sx={{ borderTop: '1px solid #f0f0f0', '.MuiTablePagination-toolbar': { minHeight: 40 }, flexShrink: 0 }}
        />
      </Paper>
    </Box>
  );
};

export default AssessmentReportsTab;
