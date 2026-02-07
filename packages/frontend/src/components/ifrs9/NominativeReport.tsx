// packages/frontend/src/components/ifrs9/NominativeReport.tsx
'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  TextField,
  Button,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
  Stack,
  IconButton,
  Skeleton,
  Paper,
  MenuItem,
  InputAdornment,
  alpha
} from '@mui/material';
import {
  AccountBalance as AccountIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  FileDownload as ExportIcon
} from '@mui/icons-material';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import { reportsAPI } from '../../services/api.reports';

interface FilterState {
  asOfDate: string;
  downloadDateStart: string;
  downloadDateEnd: string;
  profitCenters: string[];
  branches: string[];
  stages: number[];
}

const NominativeReport: React.FC = () => {
  // Summary statistics state
  const [summaryStats, setSummaryStats] = useState({
    totalAccounts: 0,
    stage1Count: 0,
    stage2Count: 0,
    stage3Count: 0,
    totalECL: 0,
    totalOutstanding: 0
  });

  // Filter state
  const [filters, setFilters] = useState<FilterState>(() => ({
    asOfDate: new Date().toISOString().split('T')[0],
    downloadDateStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    downloadDateEnd: new Date().toISOString().split('T')[0],
    profitCenters: [],
    branches: [],
    stages: [1, 2, 3]
  }));

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: 20,
    page: 0,
  });

  // UI State
  const [quickSearch, setQuickSearch] = useState('');

  // Column Definitions
  const columns = [
    { key: 'facility_number', label: 'Contract No', width: 150 },
    { key: 'cif_name', label: 'Customer', width: 200 },
    { key: 'account_number', label: 'Account No', width: 150 },
    { key: 'outstanding', label: 'Outstanding', width: 180, align: 'right' as const, headerAlign: 'right' as const, type: 'currency' },
    { key: 'ecl_final_amt', label: 'ECL Amount', width: 180, align: 'right' as const, headerAlign: 'right' as const, type: 'currency' },
    { key: 'stage', label: 'Stage', width: 100, align: 'center' as const, headerAlign: 'center' as const },
    { key: 'segment', label: 'Profit Center', width: 150 },
    { key: 'branch_code', label: 'Branch', width: 120 }
  ];

  // Dummy options (still dummy for filter UI until we have metadata API connected for these)
  const profitCenterOptions = ['Corporate', 'SME', 'Retail', 'Treasury', 'Investment'];
  const branchOptions = ['JKT001', 'JKT002', 'SBY001', 'BDG001', 'MKS001'];

  // Handle Search / Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Nominative Report Data (Paginated)
      const tableParams: any = {
        prc_date: filters.asOfDate,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        branch_code: filters.branches.length > 0 ? filters.branches[0] : undefined // API currently supports one branch filter in query
      };

      // Add stage filter if specific stages are selected (API supports single stage value usually, or we filter client side if multiple?)
      // The backend controller supports `stage` param.
      // If multiple stages are selected in UI, and backend only supports one, we might need to adjust.
      // For now, let's send the first one if only one is selected, or don't send if all are selected.
      if (filters.stages.length === 1) {
        tableParams.stage = filters.stages[0];
      }

      const tableResponse = await reportsAPI.nominativeReport.get(tableParams);

      if (tableResponse && tableResponse.data) {
        setData(tableResponse.data);
        if (tableResponse.pagination) {
          setTotalRows(tableResponse.pagination.total);
        } else {
          // Fallback if pagination metadata is missing
          setTotalRows(tableResponse.data.length);
        }
      }

      // 2. Fetch ECL Result for Summary Stats (Aggregated)
      // This gives us totals across all pages
      const statsParams: any = {
        prc_date: filters.asOfDate
      };
      const statsResponse = await reportsAPI.eclResult.get(statsParams);

      if (statsResponse && statsResponse.data) {
        const statsData = statsResponse.data;

        // Aggregate stats locally based on current filters (especially if we want to filter by branch/stage on client side)
        const newStats = statsData.reduce((acc: any, row: any) => {
          // Apply client-side filtering for stats to match user selection
          const matchesStage = filters.stages.includes(Number(row.stage));
          const matchesBranch = filters.branches.length === 0 || filters.branches.includes(row.branch_code);
          // Note: Profit center filtering would need mapping from string to segment_id

          if (matchesStage && matchesBranch) {
            acc.totalAccounts += 1; // This might be 'count' if API returned count, but eclResult returns aggregated sums. 
            // Wait, eclResult returns sums grouped by branch/stage etc. It doesn't return account count!
            // It returns OUTSTANDING, EARNINGS, ECL, etc.
            // We can sum those up.
            acc.totalOutstanding += Number(row.outstanding || 0);
            acc.totalECL += Number(row.ecl_final || 0); // Check field name in controller: ecl_final (it was aliased in query)

            // For stage counts, eclResult might not give "count of accounts", only sums. 
            // If we need account count, we might rely on the pagination.total from nominative report, 
            // but that respects the filters we passed to it.

            // Let's assume for now we use the sums. 
            // Stage distribution by count might be tricky without a specific 'count' field in eclResult. 
            // Let's check controller... it SUMs amounts. It does NOT count rows.
            // So we can't show "Stage 1 Count" accurately from eclResult unless we add COUNT(*) to the query.
            // But we can show "Stage 1 Exposure" or similar.
            // OR use the nominative report's pagination.total as "Total Accounts" (filtered).
          }
          return acc;
        }, {
          totalAccounts: 0,
          stage1Count: 0,
          stage2Count: 0,
          stage3Count: 0,
          totalECL: 0,
          totalOutstanding: 0
        });

        // Use the total from nominative report for total accounts (since it's filtered properly)
        // We can't get exact stage breakdown counts from current eclResult. 
        // We will approximate or hide stage counts if 0.
        // Actually, let's use the total from the table query for Total Accounts.
        if (tableResponse.pagination) {
          newStats.totalAccounts = tableResponse.pagination.total;
        }

        // Calculate distribution percentages roughly or leave 0 if we can't get counts
        setSummaryStats(newStats);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      // Optional: Show notification to user
    } finally {
      setLoading(false);
    }
  }, [filters, paginationModel]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Clear
  const handleClear = useCallback(() => {
    setFilters({
      asOfDate: new Date().toISOString().split('T')[0],
      downloadDateStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      downloadDateEnd: new Date().toISOString().split('T')[0],
      profitCenters: [],
      branches: [],
      stages: [1, 2, 3]
    });
    setPaginationModel({ pageSize: 20, page: 0 });
  }, []);

  // Handle Export to Excel
  const handleExport = async () => {
    try {
      setLoading(true);
      // Request export from backend (or fetch all pages - discouraged for large data)
      // Ideally backend handles export.
      // For now, we'll try to use the backend export endpoint if available, or just export current view?
      // The API service has an export method: reportsAPI.export('nominative-report', params)

      const params = {
        prc_date: filters.asOfDate,
        branch_code: filters.branches.length > 0 ? filters.branches[0] : undefined,
        format: 'xlsx'
      };

      const response = await reportsAPI.export('nominative-report', params);

      if (response && response.data) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Nominative_Report_${filters.asOfDate}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
      } else {
        // Fallback: Client side export of current data (better than nothing)
        const exportData = data.map(row => ({
          'Contract No': row.facility_number,
          'Customer': row.cif_name,
          'Account No': row.account_number,
          'Outstanding (IDR)': row.outstanding,
          'ECL Amount (IDR)': row.ecl_final_amt,
          'Stage': row.stage,
          'Profit Center': row.segment,
          'Branch': row.branch_code
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Nominative Report");
        XLSX.writeFile(wb, `Nominative_Report_Page_${filters.asOfDate}.xlsx`);
      }
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to clear filters
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
      // Ctrl/Cmd + E for export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExport();
      }
      // Ctrl/Cmd + F for search focus
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.getElementById('quick-search-input');
        searchInput?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleClear]);

  // Filter data based on quick search (Client-side usage on top of current page)
  const filteredData = useMemo(() => {
    if (!quickSearch.trim()) return data;

    const searchTerm = quickSearch.toLowerCase().trim();
    return data.filter(row =>
      row.facility_number?.toLowerCase().includes(searchTerm) ||
      row.cif_name?.toLowerCase().includes(searchTerm) ||
      row.account_number?.toLowerCase().includes(searchTerm) ||
      row.segment?.toLowerCase().includes(searchTerm) ||
      row.branch_code?.toLowerCase().includes(searchTerm)
    );
  }, [data, quickSearch]);

  const mapEclRatio = () => {
    if (summaryStats.totalOutstanding > 0) {
      return (summaryStats.totalECL / summaryStats.totalOutstanding) * 100;
    }
    return 0;
  }

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Accounts',
            value: summaryStats.totalAccounts,
            icon: <AccountIcon sx={{ fontSize: 32, color: 'primary.main' }} />,
            color: 'primary',
            bgColor: 'primary.lighter',
            format: (v: number) => v.toString()
          },
          {
            title: 'Outstanding',
            value: summaryStats.totalOutstanding,
            icon: <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main' }} />,
            color: 'success',
            bgColor: 'success.lighter',
            format: (v: number) => new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(v)
          },
          {
            title: 'Total ECL',
            value: summaryStats.totalECL,
            icon: <WarningIcon sx={{ fontSize: 32, color: 'warning.main' }} />,
            color: 'warning',
            bgColor: 'warning.lighter',
            format: (v: number) => new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(v)
          },
          {
            title: 'ECL Ratio',
            value: mapEclRatio(),
            icon: <CheckIcon sx={{ fontSize: 32, color: 'info.main' }} />,
            color: 'info',
            bgColor: 'info.lighter',
            format: (v: number) => `${v.toFixed(2)}%`
          }
        ].map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card sx={{
              height: '100%',
              borderRadius: 3,
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease-in-out',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.1)',
                borderColor: `${item.color}.main`
              }
            }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="overline" color="text.secondary" fontWeight={600} sx={{ letterSpacing: 1.1, display: 'block', mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 40 }}>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1 }}>
                        {loading ? <Skeleton width={100} /> : item.format(item.value)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: (theme) => alpha(theme.palette[item.color as 'primary' | 'success' | 'warning' | 'info'].main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Panel */}
      <Paper elevation={0} sx={{ mb: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 2, bgcolor: 'background.default', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="subtitle1" fontWeight={600}>Filter Options</Typography>
            {(filters.profitCenters.length > 0 || filters.branches.length > 0) && (
              <Chip label={`${filters.profitCenters.length + filters.branches.length} active`} size="small" color="primary" variant="filled" />
            )}
          </Stack>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Primary Filters (Always Visible) */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="As-of Date"
                type="date"
                size="small"
                value={filters.asOfDate}
                onChange={(e) => setFilters(prev => ({ ...prev, asOfDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Stage</InputLabel>
                <Select
                  multiple
                  value={filters.stages}
                  onChange={(e) => setFilters(prev => ({ ...prev, stages: e.target.value as number[] }))}
                  label="Stage"
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as number[]).map((value) => (
                        <Chip
                          key={value}
                          label={`Stage ${value}`}
                          size="small"
                          color={value === 1 ? 'success' : value === 2 ? 'warning' : 'error'}
                          sx={{ height: 24 }}
                        />
                      ))}
                    </Box>
                  )}
                >
                  <MenuItem value={1}>Stage 1</MenuItem>
                  <MenuItem value={2}>Stage 2</MenuItem>
                  <MenuItem value={3}>Stage 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={fetchData}
                  disabled={loading}
                  sx={{ px: 3 }}
                >
                  Search
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExportIcon />}
                  onClick={handleExport}
                  disabled={loading}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </Stack>
            </Grid>

            {/* Advanced Filters */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Download Start Date"
                type="date"
                size="small"
                value={filters.downloadDateStart}
                onChange={(e) => setFilters(prev => ({ ...prev, downloadDateStart: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Download End Date"
                type="date"
                size="small"
                value={filters.downloadDateEnd}
                onChange={(e) => setFilters(prev => ({ ...prev, downloadDateEnd: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }} />

            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                multiple
                size="small"
                options={profitCenterOptions}
                value={filters.profitCenters}
                onChange={(_, newValue) => setFilters(prev => ({ ...prev, profitCenters: newValue }))}
                renderInput={(params) => <TextField {...params} label="Profit Center" placeholder="Select centers..." />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return <Chip label={option} size="small" {...tagProps} key={key} />;
                  })
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Autocomplete
                multiple
                size="small"
                options={branchOptions}
                value={filters.branches}
                onChange={(_, newValue) => setFilters(prev => ({ ...prev, branches: newValue }))}
                renderInput={(params) => <TextField {...params} label="Branch Code" placeholder="Select branches..." />}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => {
                    const { key, ...tagProps } = getTagProps({ index });
                    return <Chip label={option} size="small" {...tagProps} key={key} />;
                  })
                }
              />
            </Grid>



            {/* Active Filter Chips */}
            {(filters.profitCenters.length > 0 || filters.branches.length > 0) && (
              <Grid size={12}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mr: 1, lineHeight: '24px' }}>
                    Active Filters:
                  </Typography>
                  {filters.profitCenters.map((pc) => (
                    <Chip
                      key={`pc-${pc}`}
                      label={`PC: ${pc}`}
                      size="small"
                      onDelete={() => setFilters(prev => ({
                        ...prev,
                        profitCenters: prev.profitCenters.filter(p => p !== pc)
                      }))}
                    />
                  ))}
                  {filters.branches.map((br) => (
                    <Chip
                      key={`br-${br}`}
                      label={`Branch: ${br}`}
                      size="small"
                      onDelete={() => setFilters(prev => ({
                        ...prev,
                        branches: prev.branches.filter(b => b !== br)
                      }))}
                    />
                  ))}
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Paper>

      {/* Stage Distribution - Hidden for now as we don't have exact counts */}
      {/* 
      <Card sx={{ mb: 3 }}>
        <CardContent>
          ...
        </CardContent>
      </Card> 
      */}

      {/* Quick Search */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          id="quick-search-input"
          fullWidth
          size="small"
          placeholder="Quick search in current page... (Ctrl+F)"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: quickSearch && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setQuickSearch('')}
                  edge="end"
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
            }
          }}
        />
        {quickSearch && (
          <Chip
            label={`${filteredData.length} matches`}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {/* Data Grid */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Contract Details
        </Typography>
        <Box sx={{ height: 600, width: '100%' }}>
          <SafeDataGrid
            rows={filteredData}
            getRowId={(row) => row.account_number || Math.random()}
            columns={columns
              .map(col => {
                const baseCol: GridColDef = {
                  field: col.key,
                  headerName: col.label,
                  width: col.width || 150,
                  sortable: true,
                  align: col.align || 'left',
                  headerAlign: col.headerAlign || 'left' as any
                };

                if (col.type === 'currency') {
                  return {
                    ...baseCol,
                    valueFormatter: (value: any) => {
                      if (value == null) return '';
                      return new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(value);
                    }
                  };
                }

                if (col.key === 'stage') {
                  return {
                    ...baseCol,
                    width: 100,
                    renderCell: (params: any) => (
                      <Chip
                        label={`Stage ${params.value}`}
                        size="small"
                        color={params.value == '1' ? 'success' : params.value == '2' ? 'warning' : 'error'}
                      />
                    )
                  };
                }

                return baseCol;
              })}
            loading={loading}
            pageSizeOptions={[10, 20, 50, 100]}
            checkboxSelection
            density="comfortable"
            rowCount={totalRows}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 'bold'
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 1)'
              }
            }}
          />
        </Box>
      </Paper>

    </Box>
  );
};

export default NominativeReport;