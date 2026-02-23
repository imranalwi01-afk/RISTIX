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
  alpha,
  Checkbox,
  ListItemText
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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';
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

interface NominativeReportRow {
  facility_number?: string;
  cif_name?: string;
  account_number: string;
  outstanding?: number | string;
  ecl_final_amt?: number | string;
  ecl_final?: number | string; // from eclResult
  stage?: number | string;
  segment?: string;
  branch_code?: string;
  [key: string]: string | number | boolean | null | undefined;
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
  const [data, setData] = useState<NominativeReportRow[]>([]);
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
      const tableParams: Record<string, string | number | string[] | undefined> = {
        prc_date: filters.asOfDate,
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        segment: filters.profitCenters.length > 0 ? filters.profitCenters : undefined,
        branch_code: filters.branches.length > 0 ? filters.branches : undefined
      };
      
      // Add stage filter if specific stages are selected (API supports single stage value usually, or we filter client side if multiple?)
      // The backend controller supports `stage` param.
      // If multiple stages are selected in UI, and backend only supports one, we might need to adjust.
      // For now, let's send the first one if only one is selected, or don't send if all are selected.
      if (filters.stages.length === 1) {
        tableParams.stage = filters.stages[0];
      }

      const tableResponse = await reportsAPI.nominativeReport.get(tableParams);
      
      if (tableResponse.success) {
        setData(tableResponse.data);
        const total = tableResponse.pagination ? tableResponse.pagination.total : tableResponse.data.length;
        setTotalRows(total);

        // Update Summary Stats from API Response (Dynamic based on filters)
        if (tableResponse.summary) {
            setSummaryStats({
                totalAccounts: total,
                stage1Count: 0, // Not available in summary yet
                stage2Count: 0,
                stage3Count: 0,
                totalECL: tableResponse.summary.totalECL,
                totalOutstanding: tableResponse.summary.totalOutstanding
            });
        }
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
  const handleExport = useCallback(async () => {
    try {
        setLoading(true);
        const params = {
          prc_date: filters.asOfDate,
          branch_code: filters.branches.length > 0 ? filters.branches[0] : undefined,
          format: 'xlsx'
        };

        const response = await reportsAPI.export('nominative-report', params);
        
        if (response.status === 200 && response.data) {
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
  }, [data, filters.asOfDate, filters.branches]);

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
  }, [handleClear, handleExport]);

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
      {/* Summary Cards - Enhanced with Gradients */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          {
            title: 'Total Accounts',
            value: summaryStats.totalAccounts,
            icon: <AccountIcon sx={{ fontSize: 28 }} />,
            color: 'primary',
            mainColor: '#2563eb',
            gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
            bgGradient: 'linear-gradient(135deg, #f0f7ff 0%, #e0effe 100%)',
            format: (v: number) => v.toLocaleString()
          },
          {
            title: 'Outstanding Exposure',
            value: summaryStats.totalOutstanding,
            icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
            color: 'success',
            mainColor: '#059669',
            gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            format: (v: number) => new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(v)
          },
          {
            title: 'Total ECL Amount',
            value: summaryStats.totalECL,
            icon: <WarningIcon sx={{ fontSize: 28 }} />,
            color: 'error',
            mainColor: '#dc2626',
            gradient: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            bgGradient: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
            format: (v: number) => new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              notation: 'compact',
              maximumFractionDigits: 1
            }).format(v)
          },
          {
            title: 'Final ECL Ratio',
            value: mapEclRatio(),
            icon: <CheckIcon sx={{ fontSize: 28 }} />,
            color: 'info',
            mainColor: '#0891b2',
            gradient: 'linear-gradient(135deg, #0891b2 0%, #0e7490 100%)',
            bgGradient: 'linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)',
            format: (v: number) => `${v.toFixed(2)}%`
          }
        ].map((item, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <Card sx={{ 
              height: '100%',
              borderRadius: 3,
              position: 'relative',
              overflow: 'hidden',
              background: item.bgGradient,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid',
              borderColor: 'rgba(0, 0, 0, 0.05)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
              }
            }}>
              <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: 2, 
                    background: item.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    boxShadow: `0 4px 12px ${alpha(item.mainColor, 0.3)}`,
                    mr: 2
                  }}>
                    {item.icon}
                  </Box>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 700,
                      color: 'text.secondary',
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.75rem'
                    }}
                  >
                    {item.title}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'text.primary',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {loading ? <Skeleton width={120} /> : item.format(item.value)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filter Panel - Enhanced Design */}
      <Paper 
        elevation={0} 
        sx={{ 
          mb: 4, 
          borderRadius: 4, 
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid',
          borderColor: 'rgba(0, 0, 0, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.06)'
        }}
      >
        <Box 
          sx={{ 
            px: 3,
            py: 2,
            background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
            color: 'white',
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SearchIcon sx={{ fontSize: 24 }} />
            <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: 0.5 }}>Filter Options</Typography>
            {(filters.profitCenters.length > 0 || filters.branches.length > 0) && (
              <Chip 
                label={`${filters.profitCenters.length + filters.branches.length} active`} 
                size="small" 
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                  color: 'white',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)'
                }} 
              />
            )}
          </Stack>
        </Box>

        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Primary Filters (Always Visible) */}
            <Grid size={{ xs: 12, md: 3 }}>
              <DatePicker
                label="As-of Date"
                value={new Date(filters.asOfDate)}
                onChange={(newValue) => {
                  if (newValue) {
                    setFilters(prev => ({ ...prev, asOfDate: newValue.toISOString().split('T')[0] }));
                  }
                }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                  }
                }}
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
                    sx={{ 
                      px: 3,
                      py: 1,
                      background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                      fontWeight: 600,
                      '&:hover': {
                        background: 'linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)',
                        boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Search
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<ExportIcon />}
                    onClick={handleExport}
                    disabled={loading}
                    sx={{
                      borderWidth: 1.5,
                      fontWeight: 600,
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderWidth: 1.5,
                        borderColor: '#1565c0',
                        bgcolor: alpha('#1976d2', 0.04),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Export
                  </Button>
                  <Button 
                    variant="outlined" 
                    onClick={handleClear}
                    startIcon={<ClearIcon />}
                    sx={{
                      borderWidth: 2,
                      fontWeight: 600,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Clear
                  </Button>
               </Stack>
            </Grid>

            {/* Advanced Filters */}
                 <Grid size={{ xs: 12, md: 3 }}>
                  <DatePicker
                    label="Download Start Date"
                    value={new Date(filters.downloadDateStart)}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFilters(prev => ({ ...prev, downloadDateStart: newValue.toISOString().split('T')[0] }));
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>
                  <DatePicker
                    label="Download End Date"
                    value={new Date(filters.downloadDateEnd)}
                    onChange={(newValue) => {
                      if (newValue) {
                        setFilters(prev => ({ ...prev, downloadDateEnd: newValue.toISOString().split('T')[0] }));
                      }
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'small',
                      }
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }} />

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Profit Center</InputLabel>
                    <Select
                      multiple
                      value={filters.profitCenters}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        profitCenters: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value as string[] 
                      }))}
                      label="Profit Center"
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip 
                              key={value} 
                              label={value} 
                              size="small"
                              sx={{
                                bgcolor: alpha('#2563eb', 0.1),
                                color: '#2563eb',
                                fontWeight: 600,
                                border: '1px solid',
                                borderColor: alpha('#2563eb', 0.2)
                              }}
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {profitCenterOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          <Checkbox checked={filters.profitCenters.indexOf(option) > -1} size="small" />
                          <ListItemText primary={option} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    size="small"
                    options={branchOptions}
                    value={filters.branches}
                    onChange={(_, newValue) => setFilters(prev => ({ ...prev, branches: newValue }))}
                    renderInput={(params) => (
                      <TextField 
                        {...(params as any)} 
                        label="Branch Code" 
                        placeholder={filters.branches.length === 0 ? "Select branches..." : ""}
                      />
                    )}
                    renderOption={(props, option, { selected }) => {
                      const { key, ...otherProps } = props;
                      return (
                        <li key={key} {...otherProps}>
                          <Checkbox
                            size="small"
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option}
                        </li>
                      );
                    }}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                         const { key, ...tagProps } = getTagProps({ index });
                         return (
                           <Chip 
                            label={option} 
                            size="small" 
                            {...tagProps} 
                            key={key}
                            sx={{
                              bgcolor: alpha('#059669', 0.1),
                              color: '#059669',
                              fontWeight: 600,
                              border: '1px solid',
                              borderColor: alpha('#059669', 0.2)
                            }}
                          />
                         );
                      })
                    }
                  />
                </Grid>



            {/* Active Filter Chips */}
            {(filters.profitCenters.length > 0 || filters.branches.length > 0) && (
              <Grid size={{ xs: 12 }}>
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

      {/* Quick Search - Enhanced */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          id="quick-search-input"
          fullWidth
          size="medium"
          placeholder="🔍 Quick search in current page... (Ctrl+F)"
          value={quickSearch}
          onChange={(e) => setQuickSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'primary.main' }} />
              </InputAdornment>
            ),
            endAdornment: quickSearch && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setQuickSearch('')}
                  edge="end"
                  sx={{
                    '&:hover': {
                      bgcolor: 'error.lighter',
                      color: 'error.main'
                    }
                  }}
                >
                  <ClearIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'background.paper',
              borderRadius: 3,
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              },
              '&.Mui-focused': {
                boxShadow: '0 6px 24px rgba(102, 126, 234, 0.2)'
              }
            }
          }}
        />
        {quickSearch && (
          <Chip
            label={`${filteredData.length} matches`}
            color="primary"
            sx={{
              fontWeight: 600,
              px: 1,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}
          />
        )}
      </Box>

      {/* Data Grid - Enhanced */}
      <Paper 
        sx={{ 
          p: 3, 
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(249, 250, 251, 1) 100%)'
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
              Contract Details
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalRows.toLocaleString()} total records
            </Typography>
          </Box>
          <Chip
            label={loading ? 'Loading...' : `${filteredData.length} on this page`}
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
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
                    valueFormatter: (value: number | null | undefined) => {
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
                    renderCell: (params: GridRenderCellParams<NominativeReportRow, number>) => (
                      <Chip
                        label={`Stage ${params.value}`}
                        size="small"
                        color={params.value == 1 ? 'success' : params.value == 2 ? 'warning' : 'error'}
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
              borderRadius: 2,
              '& .MuiDataGrid-columnHeaders': {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                borderRadius: '8px 8px 0 0',
                '& .MuiDataGrid-columnHeader': {
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.1)'
                  },
                  '& .MuiDataGrid-iconButtonContainer': {
                    '& .MuiIconButton-root': {
                      color: 'white'
                    }
                  }
                }
              },
              '& .MuiDataGrid-row': {
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                  transform: 'scale(1.001)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)'
                },
                '&.Mui-selected': {
                  backgroundColor: 'rgba(102, 126, 234, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.12)'
                  }
                }
              },
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 0.5)',
                fontSize: '0.875rem'
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '2px solid',
                borderColor: 'divider',
                bgcolor: 'background.default'
              }
            }}
          />
        </Box>
      </Paper>

    </Box>
  );
};

export default NominativeReport;