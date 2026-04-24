'use client';

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { GridColDef } from '@mui/x-data-grid';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { StatCard } from '@/components/common/StatCard';
import { Person, Search as SearchIcon, Clear as ClearIcon, ListAlt as ListAltIcon } from '@mui/icons-material';
import PageHeader from '@/components/banking/shared/PageHeader';
import { useCustomerListQuery } from '@/features/individual-impairment/hooks/useCustomerListQuery';
import type { IndividualCustomerListRowViewModel } from '@/features/individual-impairment/domain/individual-impairment.models';

export default function IndividualCustomerListPage() {
  const [searchDraft, setSearchDraft] = useState('');
  const [dateFromDraft, setDateFromDraft] = useState('');
  const [dateToDraft, setDateToDraft] = useState('');

  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });

  const customerListQuery = useCustomerListQuery({
    page: paginationModel.page + 1,
    limit: paginationModel.pageSize,
    search: search || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const rows = customerListQuery.data?.rows ?? [];
  const total = customerListQuery.data?.total ?? 0;
  const loading = customerListQuery.isLoading || customerListQuery.isFetching;

  const handleApply = () => {
    setSearch(searchDraft.trim());
    setDateFrom(dateFromDraft);
    setDateTo(dateToDraft);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleClear = () => {
    setSearchDraft('');
    setDateFromDraft('');
    setDateToDraft('');
    setSearch('');
    setDateFrom('');
    setDateTo('');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const columns = useMemo<GridColDef<IndividualCustomerListRowViewModel>[]>(() => [
    { field: 'customerName', headerName: 'Customer Name', flex: 1.2, minWidth: 220 },
    { field: 'accountNumber', headerName: 'Account Number', flex: 1, minWidth: 170 },
    { field: 'segment', headerName: 'Segment', width: 190 },
    {
      field: 'stage',
      headerName: 'Stage',
      width: 90,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => <Chip size="small" label={`S${params.value || 1}`} variant="outlined" />,
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => <Chip size="small" label={params.value || 'PENDING'} color="default" variant="outlined" />,
    },
    { field: 'remarks', headerName: 'Remarks', flex: 1.2, minWidth: 200 },
    {
      field: 'processDate',
      headerName: 'Process Date',
      width: 130,
      valueFormatter: (value) => {
        if (!value) return '-';
        const date = new Date(value as string);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toISOString().slice(0, 10);
      },
    },
  ], []);

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <FullstackIndicator />
      <PageHeader
        title="Individual Customer List"
        subtitle="Distinct customer/account list with latest record per account."
      />

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Search"
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              placeholder="Customer / Account / CIF"
              inputProps={{ 'data-testid': 'customer-list-search' }}
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
              inputProps={{ 'data-testid': 'customer-list-date-from' }}
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
              inputProps={{ 'data-testid': 'customer-list-date-to' }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button variant="contained" startIcon={<SearchIcon />} onClick={handleApply} data-testid="customer-list-apply-btn">
                Apply
              </Button>
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleClear} data-testid="customer-list-clear-btn">
                Clear
              </Button>
            </Box>
          </Grid>
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
          Default (empty date range) uses latest full snapshot date. Fill date range to inspect historical periods.
        </Typography>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Total Customers" value={total} icon={<Person sx={{ fontSize: 40 }} />} color="#1976d2" subtitle="Distinct Accounts" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Current Page" value={rows.length} icon={<ListAltIcon sx={{ fontSize: 40 }} />} color="#2e7d32" subtitle="Rows Loaded" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard title="Active Filter" value={search || dateFrom || dateTo ? 'Yes' : 'No'} icon={<SearchIcon sx={{ fontSize: 40 }} />} color="#ed6c02" subtitle="Search/Date Applied" />
        </Grid>
      </Grid>

      <Paper sx={{ height: 700, width: '100%' }}>
        <SafeDataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          getRowId={(row) => row.id}
          rowCount={total}
          paginationModel={paginationModel}
          onPaginationModelChange={(model) => setPaginationModel(model)}
          pageSizeOptions={[10, 25, 50, 100]}
          disableRowSelectionOnClick
        />
      </Paper>
    </Container>
  );
}
