'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Grid
} from '@mui/material';
import {
  GridColDef,
  GridToolbar
} from '@mui/x-data-grid';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  Assessment as AssessmentIcon,
  Home as HomeIcon,
  List as ListIcon,
  Person as PersonIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { individualImpairmentAPI } from '../../../services/api/individual-impairment.api';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';
import { StatCard } from '@/components/common/StatCard';
import { useAssessmentWorkspaceEmbedded } from '@/app/banking/individual/assessment/embedded-context';

export const Watchlist = () => {
  const embedded = useAssessmentWorkspaceEmbedded();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Dialog State
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    accountNumber: '',
    segment: 'Retail',
    remarks: ''
  });

  const normalizeSegment = (value: any): string => {
    const raw = String(value || '').trim();
    if (!raw) return 'Unknown';
    const upper = raw.toUpperCase();
    if (upper.includes('SME')) return 'SME';
    if (upper.includes('RETAIL')) return 'Retail';
    return raw;
  };

  const pickText = (...values: any[]): string | undefined => {
    for (const value of values) {
      const raw = value == null ? '' : String(value).trim();
      if (raw) return raw;
    }
    return undefined;
  };

  const mapWatchlistRow = (row: any) => ({
    ...row,
    // Keep stable id for SafeDataGrid row key + actions.
    id: row.id ?? row.pkid ?? row.account_id ?? row.accountId ?? row.account_number ?? row.accountNumber,
    customerName: pickText(row.customerName, row.cif_name, row.cifName) ?? '-',
    accountNumber: pickText(row.accountNumber, row.account_number, row.accountNo) ?? '-',
    segment: normalizeSegment(
      pickText(row.segment, row.sub_segment, row.group_segment, row.prd_group, row.prdGroup, row.prd_type, row.prdType)
    ),
    impairmentStatus: pickText(row.impairmentStatus, row.assessment_status, row.status) ?? 'WATCHLIST',
    remarks: pickText(row.remarks, row.notes, row.trigger_remarks, row.triggerRemarks) ?? '-',
    triggerDate: row.triggerDate ?? row.prc_date ?? row.createddate ?? row.createdDate ?? null,
  });

  const loadData = async (options?: { search?: string; dateFrom?: string; dateTo?: string }) => {
    setLoading(true);
    try {
      const effectiveSearch = options?.search ?? searchKeyword;
      const effectiveDateFrom = options?.dateFrom ?? dateFrom;
      const effectiveDateTo = options?.dateTo ?? dateTo;
      const response = await individualImpairmentAPI.getWatchlist({
        page: 1,
        // Keep this high enough so this page can show complete snapshot with client-side pagination.
        limit: 20000,
        search: effectiveSearch || undefined,
        dateFrom: effectiveDateFrom || undefined,
        dateTo: effectiveDateTo || undefined,
      });
      if (response.success) {
        const rawRows = Array.isArray(response.data) ? response.data : [];
        setData(rawRows.map(mapWatchlistRow));
        setTotalCount(Number(response.pagination?.total ?? rawRows.length ?? 0));
      }
    } catch (err: any) {
      console.error('Failed to load watchlist:', err);
      // Don't block UI on error, just show empty or cached
      setError(err.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApplyFilters = () => {
    loadData();
  };

  const handleClearFilters = () => {
    setSearchKeyword('');
    setDateFrom('');
    setDateTo('');
    loadData({ search: '', dateFrom: '', dateTo: '' });
  };

  const handleCreate = async () => {
    if (!formData.customerName || !formData.accountNumber) return;

    try {
      setLoading(true);
      await individualImpairmentAPI.addToWatchlist(formData);
      setSuccess('Customer added to watchlist');
      setOpenDialog(false);
      setFormData({ customerName: '', accountNumber: '', segment: 'Retail', remarks: '' });
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add customer');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this customer from watchlist?')) return;

    try {
      setLoading(true);
      await individualImpairmentAPI.removeFromWatchlist(id);
      setSuccess('Removed from watchlist');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to remove customer');
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'customerName', headerName: 'Customer Name', flex: 1, minWidth: 200 },
    { field: 'accountNumber', headerName: 'Account Number', flex: 1, minWidth: 150 },
    { field: 'segment', headerName: 'Segment', width: 150 },
    {
      field: 'impairmentStatus',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || 'WATCHLIST'}
          color={params.value === 'WATCHLIST' ? 'warning' : 'default'}
          size="small"
          variant="outlined"
        />
      )
    },
    { field: 'remarks', headerName: 'Remarks', flex: 1.5, minWidth: 250 },
    {
      field: 'triggerDate',
      headerName: 'Trigger Date',
      width: 180,
      valueFormatter: (value: any) => {
        if (!value) return '-';
        return new Date(value).toLocaleString();
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="assess"
          icon={<AssessmentIcon color="primary" />}
          label="Assessment"
          onClick={() => {
            // Navigate to assessment or open dialog
            const accountNo = params.row.accountNumber || params.row.account_number;
            router.push(`/banking/individual/assessment?accountId=${accountNo}`);
          }}
          showInMenu={false}
        />,
        <SafeGridActionsCellItem
          key="delete"
          icon={<DeleteIcon color="error" />}
          label="Remove"
          onClick={() => handleDelete(String(params.row.id ?? params.row.account_id ?? params.row.accountNumber))}
        />
      ]
    }
  ];

  return (
    <Container
      maxWidth="xl"
      sx={embedded ? { position: 'relative', minHeight: '80vh', px: '0 !important' } : { position: 'relative', minHeight: '80vh' }}
    >
      <ModernLoader
        open={loading}
        message="Loading Watchlist"
        subMessage="Fetching flagged accounts..."
      />

      {!embedded && (
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link href="/banking/dashboard" underline="hover" color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ListIcon sx={{ mr: 0.5 }} fontSize="inherit" /> Individual Watchlist
          </Typography>
        </Breadcrumbs>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant={embedded ? 'h6' : 'h4'} component="h1">
          Individual Watchlist
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Customer
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Search"
              placeholder="Account Number / Customer Name / CIF"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Date From"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Date To"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={handleApplyFilters}>
                Apply
              </Button>
              <Button variant="outlined" onClick={handleClearFilters}>
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Default (empty date range): latest full process snapshot. Set date range to view specific period.
        </Typography>
      </Paper>

      {/* 📊 Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Watchlist"
            value={totalCount}
            icon={<PersonIcon sx={{ fontSize: 40 }} />}
            color="#1976d2"
            subtitle="Flagged Customers"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="SME Segment"
            value={data.filter(c => c.segment === 'SME').length}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="#2e7d32"
            subtitle="SME Customers"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Retail Segment"
            value={data.filter(c => c.segment === 'Retail').length}
            icon={<AssessmentIcon sx={{ fontSize: 40 }} />}
            color="#ed6c02"
            subtitle="Retail Customers"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Needs Review"
            value={totalCount}
            icon={<WarningIcon sx={{ fontSize: 40 }} />}
            color="#d32f2f"
            subtitle="Pending Assessment"
          />
        </Grid>
      </Grid>


      <Paper sx={{ height: 600, width: '100%', display: 'flex', flexDirection: 'column' }}>
        {!embedded && <FullstackIndicator />}
        <SafeDataGrid
          rows={data}
          columns={columns}
          loading={loading}
          slots={{ toolbar: GridToolbar }}
          disableRowSelectionOnClick
          getRowId={(row) => row.id}
        />
      </Paper>

      {/* Add Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add to Watchlist</DialogTitle>
        <DialogContent dividers>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Customer Name"
              margin="normal"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
            <TextField
              fullWidth
              label="Account Number"
              margin="normal"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            />
            <TextField
              fullWidth
              label="Segment"
              margin="normal"
              select
              SelectProps={{ native: true }}
              value={formData.segment}
              onChange={(e) => setFormData({ ...formData, segment: e.target.value })}
            >
              <option value="Retail">Retail</option>
              <option value="SME">SME</option>
              <option value="Corporate">Corporate</option>
            </TextField>
            <TextField
              fullWidth
              label="Remarks"
              margin="normal"
              multiline
              rows={3}
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={loading}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Container>
  );
}
