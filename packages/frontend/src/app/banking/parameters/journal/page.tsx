// packages/frontend/src/app/banking/parameters/journal/page.tsx
// ============================================================================
// 🩹 SURGICAL FIX: Complete Journal Parameters with Real Database Integration
// ============================================================================
// ✅ FIXED: Removed all mock data fallbacks completely
// ✅ FIXED: Real API integration with standardized endpoints (camelCase)
// ✅ FIXED: Enhanced error handling and user feedback
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Snackbar,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  TextField,
  MenuItem,
  Menu,
  TablePagination
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { useRouter } from 'next/navigation';
import { api, handleAPIError, bankingAPI } from '../../../../services/api';
import { exportToXLSX, exportToCSV, exportToPDF } from '@/utils/exportUtils';

// Shared components
import PageHeader from '@/components/banking/shared/PageHeader';
import EmptyState from '@/components/banking/shared/EmptyState';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import { ApprovalStatusBadge, PendingChangesDialog } from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';

// Extracted memoized dialog component
import {
  JournalFormDialog,
  type JournalParameter,
  type JournalFormData,
  type JournalDropdownOption
} from './components';

export default function JournalParametersPage() {
  const { hasAnyPermission } = usePermission();
  const canViewJournal = hasAnyPermission(['banking.parameter.journal.view', 'banking.parameter.journal.manage', 'banking.parameter.journal', 'admin.super_admin']);
  const canManageJournal = hasAnyPermission(['banking.parameter.journal.manage', 'banking.parameter.journal.create', 'banking.parameter.journal.update', 'banking.parameter.journal.delete', 'admin.super_admin']);
  const canExportJournal = hasAnyPermission(['banking.parameter.journal.export', 'banking.parameter.journal.manage', 'admin.super_admin']);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JournalParameter[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalParameter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Approval Modal State
  const [pendingChangesDialogOpen, setPendingChangesDialogOpen] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
  const [currentRecordForPending, setCurrentRecordForPending] = useState<any>(null);

  // Pagination State
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });
  const [rowCount, setRowCount] = useState(0);

  // State for dropdown options
  const [glGroupOptions, setGlGroupOptions] = useState<Array<{ id: string, name: string }>>([]);
  const [currencyOptions, setCurrencyOptions] = useState<Array<{ id: string, name: string }>>([]);
  const [journalTypeOptions, setJournalTypeOptions] = useState<Array<{ id: string, name: string }>>([]);
  const [journalCodeOptions, setJournalCodeOptions] = useState<Array<{ id: string, name: string }>>([]);
  const [dbcrOptions, setDbcrOptions] = useState<Array<{ id: string, name: string }>>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGlGroup, setFilterGlGroup] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // ============================================================================
  // DATAGRID COLUMNS CONFIGURATION
  // ============================================================================
  const columns: GridColDef[] = [
    {
      field: 'glCode',
      headerName: 'GL Code',
      width: 120,
      renderCell: (params) => (
        <Chip label={params.value || '-'} color="primary" variant="outlined" size="small" />
      )
    },
    {
      field: 'glDesc',
      headerName: 'Description',
      width: 250,
      flex: 1
    },
    {
      field: 'glGroup',
      headerName: 'GL Group',
      width: 120
    },
    {
      field: 'glType',
      headerName: 'GL Type',
      width: 150
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 80,
      renderCell: (params) => (
        <Chip label={params.value || '-'} size="small" />
      )
    },
    {
      field: 'glNumber',
      headerName: 'GL Number',
      width: 120
    },
    {
      field: 'dbcr',
      headerName: 'DB/CR',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value || '-'}
          color={params.value === 'D' ? 'error' : params.value === 'C' ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'activeFlag',
      headerName: 'Active',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (
        <Box
          onClick={(e) => {
            if ((params.row as any).approvalStatus === 'pending') {
              e.stopPropagation();
              setSelectedPendingRequest((params.row as any).pendingRequest);
              setCurrentRecordForPending(params.row);
              setPendingChangesDialogOpen(true);
            }
          }}
          sx={{ cursor: (params.row as any).approvalStatus === 'pending' ? 'pointer' : 'default' }}
        >
          <ApprovalStatusBadge status={params.row.approvalStatus || 'active'} size="small" />
        </Box>
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams) => canManageJournal ? [
        <SafeGridActionsCellItem
          icon={<EditIcon color="primary" />}
          label="Edit"
          onClick={() => params?.row && handleEdit(params.row)}
          key="edit"
        />,
        <SafeGridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => params?.row && handleDelete(params.row)}
          key="delete"
        />
      ] : []
    }
  ];

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading journal parameters from real database...');

      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (filterGlGroup) params.gl_group = filterGlGroup; // API might still use snake_case for query params, if backend route reads params manually. But helper `getAll(params)` constructs URL. Backend Route likely filters manually or doesn't support complex filtering yet. 
      // Actually backend `journal-parameters.routes.ts` GET / doesn't seem to implement filtering yet (it just selects all formatted). But we can filter client side.
      if (filterCurrency) params.currency = filterCurrency;
      if (filterActive === 'active') params.active_only = true;
      else if (filterActive === 'inactive') params.active_only = false;

      const result = await api.banking.journalParameters.getAll();

      if (result.success && result.data) {
        console.log('✅ Successfully loaded journal data:', result.data.length, 'parameters');

        // Fetch pending approvals for journal parameters
        try {
          const pendingRes = await bankingAPI.approval.getPendingApprovals();
          const pendingRequests = Array.isArray(pendingRes) ? pendingRes : (pendingRes as any).data || [];

          const mappedData = result.data.map((item: any) => {
            const pending = pendingRequests.find((r: any) => r.entityType === 'journal_parameter' && r.entityId === item.pkid?.toString());
            return {
              ...item,
              approvalStatus: pending ? 'pending' : 'active',
              pendingRequest: pending || null
            };
          });
          setData(mappedData);
        } catch (e) {
          console.warn('Failed to load pending approvals:', e);
          setData(result.data);
        }
      } else {
        throw new Error(result.message || 'Failed to load journal parameters');
      }

    } catch (error: any) {
      console.error('❌ Failed to load journal parameters:', error);
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtering logic moved to useMemo below

  const clearFilters = () => {
    setSearchTerm('');
    setFilterGlGroup('');
    setFilterCurrency('');
    setFilterActive('all');
  };

  const loadDropdownOptions = async () => {
    setOptionsLoading(true);
    try {
      console.log('🔄 Loading dropdown options from FRS9PRO database...');

      const [glGroup, currency, journalType, journalCode, dbcr] = await Promise.all([
        api.banking.journalParameters.getGlGroupOptions(),
        api.banking.journalParameters.getCurrencyOptions(),
        api.banking.journalParameters.getJournalTypeOptions(),
        api.banking.journalParameters.getJournalCodeOptions(),
        api.banking.journalParameters.getDbcrOptions()
      ]);

      // Per tech spec: all dropdown values must come from business settings (B0001, B0005, B0006, B0007)
      // If DB returns empty, the dropdown is empty — no hardcoded fallbacks
      setGlGroupOptions(glGroup.success && glGroup.data?.length ? glGroup.data : []);
      setCurrencyOptions(currency.success && currency.data?.length ? currency.data : []);
      setJournalTypeOptions(journalType.success && journalType.data?.length ? journalType.data : []);
      setJournalCodeOptions(journalCode.success && journalCode.data?.length ? journalCode.data : []);
      setDbcrOptions(dbcr.success && dbcr.data?.length ? dbcr.data : []);

    } catch (error) {
      console.error('❌ Failed to load dropdown options:', error);
      // No fallback hardcodes — all options must come from business settings per tech spec
      setGlGroupOptions([]);
      setCurrencyOptions([]);
      setJournalTypeOptions([]);
      setJournalCodeOptions([]);
      setDbcrOptions([]);
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    loadDropdownOptions();
  }, []);

  // Filters are now handled by useMemo

  // Consolidated Client-side filtering logic
  const filteredData = useMemo(() => {
    let filtered = [...(Array.isArray(data) ? data : [])];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.glCode?.toLowerCase().includes(search) ||
        item.glDesc?.toLowerCase().includes(search) ||
        item.glNumber?.toLowerCase().includes(search) ||
        item.glGroup?.toLowerCase().includes(search)
      );
    }

    if (filterGlGroup) {
      filtered = filtered.filter(item => item.glGroup === filterGlGroup);
    }

    if (filterCurrency) {
      filtered = filtered.filter(item => item.currency === filterCurrency);
    }

    if (filterActive === 'active') {
      filtered = filtered.filter(item => item.activeFlag === true);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(item => item.activeFlag === false);
    }

    // Update row count for pagination
    setRowCount(filtered.length);

    return filtered;
  }, [data, searchTerm, filterGlGroup, filterCurrency, filterActive]);

  const handleCreate = () => {
    if (!canManageJournal) return;
    setSelectedJournal(null);
    setDialogOpen(true);
  };

  const handleEdit = (journal: JournalParameter) => {
    if (!canManageJournal) return;
    setSelectedJournal(journal);
    setDialogOpen(true);
  };

  const handleDelete = async (journal: JournalParameter) => {
    if (!canManageJournal) return;
    if (!confirm(`Are you sure you want to delete journal entry "${journal.glCode}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting journal entry:', journal.glCode);
      const result = await api.banking.journalParameters.delete(journal.pkid);
      // Check if approval is required
      if (result.approvalRequired) {
        setSuccess('Deletion submitted for approval');
      } else {
        console.log('✅ Journal entry deleted successfully');
        setSuccess('Journal entry deleted successfully');
      }
      await loadData();

    } catch (error: any) {
      console.error('❌ Failed to delete journal entry:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to delete journal entry: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Memoized callback to prevent dialog re-renders
  const handleSave = useCallback(async (formData: JournalFormData) => {
    if (!canManageJournal) return;
    try {
      setLoading(true);
      setError(null);

      const payload = {
        glGroup: formData.glGroup,
        currency: formData.currency,
        glType: formData.glType,
        glCode: formData.glCode.trim(),
        glNumber: formData.glNumber.trim(),
        dbcr: formData.dbcr,
        glDesc: formData.glDesc.trim(),
        activeFlag: formData.activeFlag
      };

      if (selectedJournal) {
        console.log('✏️ Updating journal entry:', payload.glCode);
        const result = await api.banking.journalParameters.update(selectedJournal.pkid, payload);
        // Check if approval is required
        if (result.approvalRequired) {
          setSuccess('Update submitted for approval');
        } else {
          setSuccess('Journal entry updated successfully');
        }
      } else {
        console.log('➕ Creating journal entry:', payload.glCode);
        const result = await api.banking.journalParameters.create(payload);
        // Check if approval is required
        if (result.approvalRequired) {
          setSuccess('Creation submitted for approval');
        } else {
          setSuccess('Journal entry created successfully');
        }
      }

      setDialogOpen(false);
      await loadData();
    } catch (error: any) {
      console.error('❌ Failed to save journal entry:', error);
      throw error; // Rethrow for dialog handling
    } finally {
      setLoading(false);
    }
  }, [selectedJournal, loadData, canManageJournal]);

  // Memoized close handler
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  // Export handler (Client-side export matching Product Parameters)
  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    if (!canExportJournal) return;
    try {
      setExportMenuAnchor(null);

      // Define columns for export (matching data grid)
      const exportColumns = [
        { field: 'glCode', headerName: 'GL Code' },
        { field: 'glDesc', headerName: 'Description' },
        { field: 'glGroup', headerName: 'GL Group' },
        { field: 'glType', headerName: 'GL Type' },
        { field: 'currency', headerName: 'Currency' },
        { field: 'glNumber', headerName: 'GL Number' },
        { field: 'dbcr', headerName: 'DB/CR' },
        { field: 'activeFlag', headerName: 'Active' }
      ];

      // Build filter description
      const activeFilters: Record<string, any> = {};
      if (searchTerm) activeFilters['Search'] = searchTerm;
      if (filterGlGroup) activeFilters['GL Group'] = filterGlGroup;
      if (filterCurrency) activeFilters['Currency'] = filterCurrency;
      if (filterActive !== 'all') activeFilters['Status'] = filterActive;

      const exportOptions = {
        title: 'Journal Parameters',
        filename: 'journal_parameters',
        filters: activeFilters,
        confidential: true
      };

      // Use filtered data
      const dataToExport = filteredData;

      let result;
      switch (format) {
        case 'xlsx': result = exportToXLSX(dataToExport, exportColumns, exportOptions); break;
        case 'csv': result = exportToCSV(dataToExport, exportColumns, exportOptions); break;
        case 'pdf': result = exportToPDF(dataToExport, exportColumns, exportOptions); break;
      }

      if (result && result.success) {
        setSuccess(`Exported ${dataToExport.length} records to ${format.toUpperCase()}`);
      } else {
        setError(`Failed to export to ${format.toUpperCase()}`);
      }
    } catch (error: any) {
      console.error('Export error:', error);
      setError(`Export failed: ${error.message}`);
    }
  };

  if (loading && data.length === 0) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ position: 'relative' }}>
      <FullstackIndicator />
      {!canViewJournal && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view journal parameters.
        </Alert>
      )}
      <PageHeader
        title="Journal Parameters"
        subtitle="Journal entry and accounting parameter configuration"
        onRefresh={loadData}
        loading={loading}
        extraActions={(
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canExportJournal && (
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={(e) => setExportMenuAnchor(e.currentTarget)}
                disabled={loading || data.length === 0}
              >
                Export
              </Button>
            )}
            {canManageJournal && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreate}
                disabled={loading}
              >
                Add Journal Entry
              </Button>
            )}
          </Box>
        )}
      />

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={canExportJournal && Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('xlsx')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DownloadIcon fontSize="small" />
            Export to Excel (XLSX)
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DownloadIcon fontSize="small" />
            Export to CSV
          </Box>
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DownloadIcon fontSize="small" />
            Export to PDF
          </Box>
        </MenuItem>
      </Menu>


      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by GL Code, Description, or GL Number"
              variant="outlined"
              size="small"
              sx={{ flex: '1 1 300px', minWidth: 200 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>GL Group</InputLabel>
              <Select
                value={filterGlGroup}
                onChange={(e) => setFilterGlGroup(e.target.value)}
                label="GL Group"
              >
                <MenuItem value="">All</MenuItem>
                {Array.isArray(glGroupOptions) && glGroupOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Currency</InputLabel>
              <Select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                label="Currency"
              >
                <MenuItem value="">All</MenuItem>
                {Array.isArray(currencyOptions) && currencyOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" size="small" onClick={loadData} startIcon={<FilterIcon />}>Apply</Button>
              <Button variant="outlined" size="small" onClick={clearFilters} startIcon={<ClearIcon />}>Clear</Button>
            </Box>
          </Box>

          {filteredData.length !== data.length && (
            <Box sx={{ mt: 2 }}>
              <Chip label={`Showing ${filteredData.length} of ${data.length} records`} color="primary" variant="outlined" size="small" />
            </Box>
          )}
        </CardContent>
      </Card>

      <Card sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1, width: '100%', minHeight: 500, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <SafeDataGrid
                rows={filteredData.slice(paginationModel.page * paginationModel.pageSize, (paginationModel.page + 1) * paginationModel.pageSize)}
                columns={columns}
                getRowId={(row) => row?.pkid || row?.glCode || `row_${Math.random()}`}
                hideFooterPagination
                hideFooter
                disableRowSelectionOnClick
                loading={loading}
                slotProps={{
                  loadingOverlay: {
                    variant: 'linear-progress' as const,
                    noRowsVariant: 'skeleton' as const,
                  },
                  noRowsOverlay: {
                    children: (
                      <EmptyState
                        title="No Journal Parameters Found"
                        description={error ? 'Failed to load data from database.' : 'No parameters configured yet.'}
                        onRetry={error ? loadData : handleCreate}
                        retryText={error ? 'Retry' : 'Add Journal Entry'}
                        icon={<ErrorIcon />}
                      />
                    )
                  }
                }}
              />
            </Box>
            <TablePagination
              rowsPerPageOptions={[10, 25, 50, 100]}
              component="div"
              count={rowCount}
              rowsPerPage={paginationModel.pageSize}
              page={paginationModel.page}
              onPageChange={(event, newPage) => {
                setPaginationModel({ ...paginationModel, page: newPage });
              }}
              onRowsPerPageChange={(event) => {
                setPaginationModel({
                  page: 0,
                  pageSize: parseInt(event.target.value, 10)
                });
              }}
              labelDisplayedRows={({ from, to, count }) =>
                `Showing ${from}–${to} of ${count} • Page ${paginationModel.page + 1}`
              }
              sx={{
                borderTop: '2px solid #e0e0e0',
                bgcolor: '#fafafa',
              }}
            />
          </Box>
        </CardContent>
      </Card>


      <JournalFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        journal={selectedJournal}
        loading={loading}
        optionsLoading={optionsLoading}
        glGroupOptions={glGroupOptions}
        currencyOptions={currencyOptions}
        journalTypeOptions={journalTypeOptions}
        journalCodeOptions={journalCodeOptions}
        dbcrOptions={dbcrOptions}
      />

      <PendingChangesDialog
        open={pendingChangesDialogOpen}
        onClose={() => setPendingChangesDialogOpen(false)}
        request={selectedPendingRequest}
        currentData={currentRecordForPending}
        title={`Pending Changes for Journal: ${currentRecordForPending?.glCode}`}
      />

      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
