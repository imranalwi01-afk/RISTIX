'use client';

import React, { memo } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Search as SearchIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import type { IndividualImpairmentWatchlistItem } from '@/services/api.individual-impairment';
import type { ImpairmentAnalytics, SortConfig, SortField } from './types';

interface ColumnFilters {
  account_number: string;
  cif_name: string;
  rating_code: string;
  currency: string;
}

interface ImpairmentOverviewPanelProps {
  analytics: ImpairmentAnalytics | null;
  data: IndividualImpairmentWatchlistItem[];
  pagination: {
    page: number;
    total: number;
    totalPages: number;
  };
  searchTerm: string;
  stageFilter: number | 'all';
  impairedFilter: 'all' | 'I' | 'N';
  statusFilter: string;
  columnFilters: ColumnFilters;
  columnFiltersEnabled: boolean;
  sortConfig: SortConfig;
  onSearchTermChange: (value: string) => void;
  onStageFilterChange: (value: number | 'all') => void;
  onImpairedFilterChange: (value: 'all' | 'I' | 'N') => void;
  onStatusFilterChange: (value: string) => void;
  onColumnFilterChange: (key: keyof ColumnFilters, value: string) => void;
  onClearFilters: () => void;
  onSort: (field: SortField) => void;
  onViewDetails: (record: IndividualImpairmentWatchlistItem) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  formatCurrency: (amount: number, currency?: string) => string;
  getStageColor: (stage: number) => string;
  getImpairedColor: (impairedFlag: string) => string;
  getStatusColor: (status: string) => string;
}

const ImpairmentOverviewPanel = memo(function ImpairmentOverviewPanel({
  analytics,
  data,
  pagination,
  searchTerm,
  stageFilter,
  impairedFilter,
  statusFilter,
  columnFilters,
  columnFiltersEnabled,
  sortConfig,
  onSearchTermChange,
  onStageFilterChange,
  onImpairedFilterChange,
  onStatusFilterChange,
  onColumnFilterChange,
  onClearFilters,
  onSort,
  onViewDetails,
  onPreviousPage,
  onNextPage,
  formatCurrency,
  getStageColor,
  getImpairedColor,
  getStatusColor,
}: ImpairmentOverviewPanelProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Impairment Portfolio Overview
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              fullWidth
              label="Search Account/Customer"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Stage Filter</InputLabel>
              <Select value={stageFilter} label="Stage Filter" onChange={(e) => onStageFilterChange(e.target.value as number | 'all')}>
                <MenuItem value="all">All Stages</MenuItem>
                <MenuItem value="1">Stage 1</MenuItem>
                <MenuItem value="2">Stage 2</MenuItem>
                <MenuItem value="3">Stage 3</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Impaired Flag</InputLabel>
              <Select value={impairedFilter} label="Impaired Flag" onChange={(e) => onImpairedFilterChange(e.target.value as 'all' | 'I' | 'N')}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="I">Impaired</MenuItem>
                <MenuItem value="N">Not Impaired</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Assessment Status</InputLabel>
              <Select value={statusFilter} label="Assessment Status" onChange={(e) => onStatusFilterChange(e.target.value)}>
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
                <MenuItem value="REVIEWED">Reviewed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <Button variant="outlined" onClick={onClearFilters} startIcon={<ClearIcon />} sx={{ height: '56px' }}>
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {columnFiltersEnabled && (
          <Grid container spacing={2} sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ width: '100%', mb: 1 }}>
              Column-wise Filters
            </Typography>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="Account Number" value={columnFilters.account_number} onChange={(e) => onColumnFilterChange('account_number', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="Customer Name" value={columnFilters.cif_name} onChange={(e) => onColumnFilterChange('cif_name', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="Rating Code" value={columnFilters.rating_code} onChange={(e) => onColumnFilterChange('rating_code', e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField fullWidth size="small" label="Currency" value={columnFilters.currency} onChange={(e) => onColumnFilterChange('currency', e.target.value)} />
            </Grid>
          </Grid>
        )}

        {analytics && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card><CardContent><Typography variant="h4" color="primary">{analytics.totalAccounts}</Typography><Typography variant="body2" color="textSecondary">Total Accounts</Typography></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card><CardContent><Typography variant="h4" color="success.main">{analytics.stageDistribution[1] || 0}</Typography><Typography variant="body2" color="textSecondary">Stage 1 Accounts</Typography></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card><CardContent><Typography variant="h4" color="warning.main">{analytics.stageDistribution[2] || 0}</Typography><Typography variant="body2" color="textSecondary">Stage 2 Accounts</Typography></CardContent></Card>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Card><CardContent><Typography variant="h4" color="error.main">{analytics.stageDistribution[3] || 0}</Typography><Typography variant="body2" color="textSecondary">Stage 3 Accounts</Typography></CardContent></Card>
            </Grid>
          </Grid>
        )}

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><TableSortLabel active={sortConfig.field === 'account_number'} direction={sortConfig.order} onClick={() => onSort('account_number')}>Account Number</TableSortLabel></TableCell>
                <TableCell><TableSortLabel active={sortConfig.field === 'cif_name'} direction={sortConfig.order} onClick={() => onSort('cif_name')}>Customer Name</TableSortLabel></TableCell>
                <TableCell>CIF Number</TableCell>
                <TableCell><TableSortLabel active={sortConfig.field === 'outstanding_balance'} direction={sortConfig.order} onClick={() => onSort('outstanding_balance')}>Outstanding Balance</TableSortLabel></TableCell>
                <TableCell><TableSortLabel active={sortConfig.field === 'stage'} direction={sortConfig.order} onClick={() => onSort('stage')}>Stage</TableSortLabel></TableCell>
                <TableCell><TableSortLabel active={sortConfig.field === 'ecl_amount'} direction={sortConfig.order} onClick={() => onSort('ecl_amount')}>ECL Amount</TableSortLabel></TableCell>
                <TableCell>Impaired Flag</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Assessment Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={`${row.pkid}-${index}`}>
                  <TableCell>{row.account_number}</TableCell>
                  <TableCell>{row.cif_name}</TableCell>
                  <TableCell>{row.cif_number}</TableCell>
                  <TableCell>{formatCurrency(row.outstanding_balance, row.currency)}</TableCell>
                  <TableCell>
                    <Chip label={`Stage ${row.stage}`} color={getStageColor(row.stage) as any} size="small" />
                  </TableCell>
                  <TableCell>{formatCurrency(row.ecl_amount, row.currency)}</TableCell>
                  <TableCell>
                    <Chip label={row.impaired_flag === 'I' ? 'Impaired' : 'Not Impaired'} color={getImpairedColor(row.impaired_flag) as any} size="small" />
                  </TableCell>
                  <TableCell>{row.rating_code}</TableCell>
                  <TableCell>
                    <Chip label={row.assessment_status} color={getStatusColor(row.assessment_status) as any} size="small" />
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton size="small" onClick={() => onViewDetails(row)}>
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Typography variant="body2" color="textSecondary">
            Showing {data.length} of {pagination.total} records
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" disabled={pagination.page <= 1} onClick={onPreviousPage}>
              Previous
            </Button>
            <Button variant="outlined" disabled={pagination.page >= pagination.totalPages} onClick={onNextPage}>
              Next
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
});

export default ImpairmentOverviewPanel;
