'use client';

import React, { useMemo, useState } from 'react';
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
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { StatCard } from '@/components/common/StatCard';
import { useAssessmentWorkspaceEmbedded } from '@/app/banking/individual/assessment/embedded-context';
import { useCreateWatchlistMutation, useRemoveWatchlistMutation, useStandaloneWatchlistQuery } from '@/features/individual-impairment/hooks/useWatchlistQueries';
import type { StandaloneWatchlistRowViewModel } from '@/features/individual-impairment/domain/individual-impairment.models';

export const Watchlist = () => {
  const embedded = useAssessmentWorkspaceEmbedded();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchDraft, setSearchDraft] = useState('');
  const [dateFromDraft, setDateFromDraft] = useState('');
  const [dateToDraft, setDateToDraft] = useState('');
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

  const watchlistQuery = useStandaloneWatchlistQuery({
    page: 1,
    limit: 20000,
    search: searchKeyword || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });
  const createWatchlistMutation = useCreateWatchlistMutation();
  const removeWatchlistMutation = useRemoveWatchlistMutation();

  const data = watchlistQuery.data?.rows ?? [];
  const totalCount = watchlistQuery.data?.total ?? 0;
  const loading =
    watchlistQuery.isLoading ||
    watchlistQuery.isFetching ||
    createWatchlistMutation.isPending ||
    removeWatchlistMutation.isPending;

  const handleApplyFilters = () => {
    setSearchKeyword(searchDraft.trim());
    setDateFrom(dateFromDraft);
    setDateTo(dateToDraft);
  };

  const handleClearFilters = () => {
    setSearchDraft('');
    setDateFromDraft('');
    setDateToDraft('');
    setSearchKeyword('');
    setDateFrom('');
    setDateTo('');
  };

  const handleCreate = async () => {
    if (!formData.customerName || !formData.accountNumber) return;

    try {
      await createWatchlistMutation.mutateAsync(formData);
      setSuccess('Customer added to watchlist');
      setOpenDialog(false);
      setFormData({ customerName: '', accountNumber: '', segment: 'Retail', remarks: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this customer from watchlist?')) return;

    try {
      await removeWatchlistMutation.mutateAsync(id);
      setSuccess('Removed from watchlist');
    } catch (err: any) {
      setError(err.message || 'Failed to remove customer');
    }
  };

  const columns = useMemo<GridColDef<StandaloneWatchlistRowViewModel>[]>(() => [
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
  ], [router]);

  return (
    <Container
      maxWidth="xl"
      sx={embedded ? { position: 'relative', minHeight: '80vh', px: '0 !important' } : { position: 'relative', minHeight: '80vh' }}
    >
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
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Date From"
              type="date"
              value={dateFromDraft}
              onChange={(e) => setDateFromDraft(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Date To"
              type="date"
              value={dateToDraft}
              onChange={(e) => setDateToDraft(e.target.value)}
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
          loading={watchlistQuery.isLoading || watchlistQuery.isFetching}
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
      <Snackbar
        open={Boolean(watchlistQuery.error) && !error}
        autoHideDuration={6000}
        onClose={() => undefined}
      >
        <Alert severity="error">Failed to load watchlist data.</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Container>
  );
}
