// packages/frontend/src/app/banking/ifrs9/staging/page.tsx
// ============================================================================
// IFRS9 STAGING PAGE - REAL IMPLEMENTATION
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Category as PageIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// Real API implementation with demo token for development
const stagingApi = {
  getStagingAnalysis: async (filters: {
    startDate?: Date | null;
    endDate?: Date | null;
    stage?: string;
    segmentId?: string;
  } = {}) => {
    // Build query parameters
    const params = new URLSearchParams();
    
    if (filters.stage) {
      params.append('stage', filters.stage);
    }
    
    if (filters.segmentId) {
      params.append('segmentId', filters.segmentId);
    }
    
    if (filters.startDate) {
      params.append('startDate', filters.startDate.toISOString().split('T')[0]);
    }
    
    if (filters.endDate) {
      params.append('endDate', filters.endDate.toISOString().split('T')[0]);
    }
    
    const url = `http://localhost:4232/api/v1/banking/individual/impairment/staging-analysis${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  },
  
  getStagingSummary: async () => {
    const response = await fetch('http://localhost:4232/api/v1/banking/individual/impairment/staging-summary', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer demo_token_ADMIN',
        'X-Tenant-ID': 'f7b3a087-8a42-40c4-baca-9dc92cc0a2be'
      }
    });
    return await response.json();
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function IFRS9StagingPage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
    stage: '',
    segmentId: ''
  });
  
  // Table pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Load staging data
  const loadStagingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [analysisResponse, summaryResponse] = await Promise.all([
        stagingApi.getStagingAnalysis(filters),
        stagingApi.getStagingSummary()
      ]);

      if (analysisResponse.success) {
        setData(analysisResponse.data || []);
      }
      
      if (summaryResponse.success) {
        setSummary(summaryResponse.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load staging data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStagingData();
  }, []);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    const end = start + rowsPerPage;
    return data.slice(start, end);
  }, [data, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStageColor = (stage: string | null) => {
    switch (stage) {
      case '1': return '#4caf50';
      case '2': return '#ff9800';
      case '3': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  const getStageLabel = (stage: string | null) => {
    switch (stage) {
      case '1': return 'Stage 1 (12-month)';
      case '2': return 'Stage 2 (Lifetime)';
      case '3': return 'Stage 3 (Impaired)';
      default: return 'Unknown';
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/banking/dashboard"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/banking/dashboard';
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PageIcon sx={{ mr: 0.5, fontSize: 16 }} />
            IFRS 9 Staging
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PageIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                IFRS 9 Staging Analysis
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadStagingData}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                disabled={loading || data.length === 0}
              >
                Export
              </Button>
            </Box>
          </Box>
          <Typography variant="subtitle1" color="text.secondary">
            IFRS 9 staging classification and stage management analysis
          </Typography>
        </Box>

        {/* Summary Cards */}
        {summary && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Total Outstanding
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(summary.totalOutstanding || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Total ECL
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(summary.totalECL || 0)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="success.main" gutterBottom>
                    Stage 1 Accounts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    {summary.stage1Count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(summary.stage1ECL || 0)} ECL
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="error.main" gutterBottom>
                    Stage 3 Accounts
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    {summary.stage3Count || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(summary.stage3ECL || 0)} ECL
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1 }} />
            Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(newValue) => setFilters(prev => ({ ...prev, startDate: newValue }))}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(newValue) => setFilters(prev => ({ ...prev, endDate: newValue }))}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Stage</InputLabel>
                <Select
                  value={filters.stage}
                  label="Stage"
                  onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                >
                  <MenuItem value="">All Stages</MenuItem>
                  <MenuItem value="1">Stage 1 (12-month)</MenuItem>
                  <MenuItem value="2">Stage 2 (Lifetime)</MenuItem>
                  <MenuItem value="3">Stage 3 (Impaired)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                variant="contained"
                onClick={loadStagingData}
                disabled={loading}
                sx={{ height: '40px' }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Staging Data Table */}
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Process Date</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell align="right">Segment ID</TableCell>
                  <TableCell align="right">Total Outstanding</TableCell>
                  <TableCell align="right">Total ECL</TableCell>
                  <TableCell align="right">Average Outstanding</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  Array.from({ length: rowsPerPage }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell><Skeleton variant="text" /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" /></TableCell>
                      <TableCell align="right"><Skeleton variant="text" /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No staging data found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{row.prcDate || '-'}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStageLabel(row.stage)}
                          size="small"
                          sx={{
                            backgroundColor: getStageColor(row.stage),
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">{row.segmentId || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalOutstanding || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.totalECL || 0)}</TableCell>
                      <TableCell align="right">{formatCurrency(row.avgOutstanding || 0)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={data.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Container>
    </LocalizationProvider>
  );
}
