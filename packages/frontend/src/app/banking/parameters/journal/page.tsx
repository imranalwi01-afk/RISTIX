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
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Error as ErrorIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { api, handleAPIError, bankingAPI } from '../../../../services/api';
import { exportToXLSX, exportToCSV, exportToPDF } from '@/utils/exportUtils';
import { getErrorMessage } from '@/utils/error-message';
import { useAuth } from '@/providers/AuthProvider';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import type { EnterpriseColumnFilterValue, EnterpriseSort } from '@/types/enterprise-table';

// Shared components
import PageHeader from '@/components/banking/shared/PageHeader';
import EmptyState from '@/components/banking/shared/EmptyState';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import {
  ApprovalNotification,
  ApprovalStatusBadge,
  PendingChangesDialog,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';

// Extracted memoized dialog component
import {
  JournalFormDialog,
  JournalFiltersCard,
  JournalParametersGrid,
  type JournalParameter,
  type JournalFormData,
  type JournalDropdownOption
} from './components';

const JOURNAL_EXPORT_COLUMNS = [
  { field: 'glCode', headerName: 'GL Code' },
  { field: 'glDesc', headerName: 'Description' },
  { field: 'glGroup', headerName: 'GL Group' },
  { field: 'glType', headerName: 'GL Type' },
  { field: 'currency', headerName: 'Currency' },
  { field: 'glNumber', headerName: 'GL Number' },
  { field: 'dbcr', headerName: 'DB/CR' },
  { field: 'activeFlag', headerName: 'Active' },
] as const;

const normalizeFilterValue = (value: EnterpriseColumnFilterValue) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (Array.isArray(value)) return value.join(' ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
};

const getJournalFieldValue = (row: JournalParameter, field: string): EnterpriseColumnFilterValue => {
  const record = row as unknown as Record<string, unknown>;
  return record[field] as EnterpriseColumnFilterValue;
};

const compareJournalValues = (left: unknown, right: unknown) => {
  if (left === right) return 0;
  if (left === null || left === undefined) return 1;
  if (right === null || right === undefined) return -1;

  const leftNumber = typeof left === 'number' ? left : Number(left);
  const rightNumber = typeof right === 'number' ? right : Number(right);
  if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
    return leftNumber - rightNumber;
  }

  const leftDate = left instanceof Date ? left.getTime() : Date.parse(String(left));
  const rightDate = right instanceof Date ? right.getTime() : Date.parse(String(right));
  if (!Number.isNaN(leftDate) && !Number.isNaN(rightDate)) {
    return leftDate - rightDate;
  }

  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

const applyJournalTableQuery = (
  rows: JournalParameter[],
  columnFilters: Record<string, EnterpriseColumnFilterValue>,
  sort: EnterpriseSort[],
) => {
  const activeFilters = Object.entries(columnFilters).filter(([, value]) => normalizeFilterValue(value).trim().length > 0);

  const filteredRows = activeFilters.length === 0
    ? rows
    : rows.filter((row) =>
        activeFilters.every(([field, value]) =>
          normalizeFilterValue(getJournalFieldValue(row, field)).toLowerCase().includes(normalizeFilterValue(value).toLowerCase())
        )
      );

  const activeSort = sort[0];
  if (!activeSort) return filteredRows;

  return [...filteredRows].sort((leftRow, rightRow) => {
    const leftValue = getJournalFieldValue(leftRow, activeSort.field);
    const rightValue = getJournalFieldValue(rightRow, activeSort.field);
    const result = compareJournalValues(leftValue, rightValue);
    return activeSort.direction === 'asc' ? result : -result;
  });
};

export default function JournalParametersPage() {
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission();
  const canViewJournal = hasAnyPermission(['banking.parameter.journal.view', 'banking.parameter.journal.manage', 'banking.parameter.journal', 'admin.super_admin']);
  const canManageJournal = hasAnyPermission(['banking.parameter.journal.manage', 'banking.parameter.journal.create', 'banking.parameter.journal.update', 'banking.parameter.journal.delete', 'admin.super_admin']);
  const canExportJournal = hasAnyPermission(['banking.parameter.journal.export', 'banking.parameter.journal.manage', 'admin.super_admin']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JournalParameter[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedJournal, setSelectedJournal] = useState<JournalParameter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = (error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  };
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Approval Modal State
  const [pendingChangesDialogOpen, setPendingChangesDialogOpen] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
  const [currentRecordForPending, setCurrentRecordForPending] = useState<any>(null);

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
  const {
    queryState,
    setPaginationModel,
    setColumnVisibilityModel,
    setDensity,
    setColumnFilters,
    setSort,
    applySavedView,
    toSavedViewState,
    resetView,
  } = useEnterpriseTableQuery({
    pageKey: 'banking:journal-parameters',
    paginationMode: 'client',
    initialPageSize: 25,
    syncUrl: true,
  });
  const savedView = useSavedTableView({
    userId: user?.id,
    scope: 'banking:journal-parameters',
    enabled: Boolean(user?.id),
    onApplyView: (view) => {
      applySavedView(view);
      setSearchTerm(typeof view.state.search === 'string' ? view.state.search : '');
      const savedFilters = (view.state.filters ?? {}) as Record<string, unknown>;
      setFilterGlGroup(typeof savedFilters.filterGlGroup === 'string' ? savedFilters.filterGlGroup : '');
      setFilterCurrency(typeof savedFilters.filterCurrency === 'string' ? savedFilters.filterCurrency : '');
      setFilterActive(
        savedFilters.filterActive === 'active' || savedFilters.filterActive === 'inactive' || savedFilters.filterActive === 'all'
          ? savedFilters.filterActive
          : 'all'
      );
    },
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading journal parameters from real database...');

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
  }, []);

  // Filtering logic moved to useMemo below

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterGlGroup('');
    setFilterCurrency('');
    setFilterActive('all');
    resetView();
  }, [resetView]);

  const loadDropdownOptions = useCallback(async () => {
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
  }, []);

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

    return filtered;
  }, [data, searchTerm, filterGlGroup, filterCurrency, filterActive]);
  const tableRows = useMemo(
    () => applyJournalTableQuery(filteredData, queryState.columnFilters, queryState.sort),
    [filteredData, queryState.columnFilters, queryState.sort],
  );

  const handleCreate = useCallback(() => {
    if (!canManageJournal) return;
    setSelectedJournal(null);
    setDialogOpen(true);
  }, [canManageJournal]);

  const handleEdit = useCallback((journal: JournalParameter) => {
    if (!canManageJournal) return;
    setSelectedJournal(journal);
    setDialogOpen(true);
  }, [canManageJournal]);

  const handleDelete = useCallback(async (journal: JournalParameter) => {
    if (!canManageJournal) return;
    if (!confirm(`Are you sure you want to delete journal entry "${journal.glCode}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting journal entry:', journal.glCode);
      const result = await api.banking.journalParameters.delete(journal.pkid);
      if (result.approvalRequired) {
        setApprovalNotification(buildApprovalNotification(result, 'Deletion submitted for approval'));
      } else {
        console.log('✅ Journal entry deleted successfully');
        setSuccess('Journal entry deleted successfully');
      }
      await loadData();

    } catch (error: any) {
      console.error('❌ Failed to delete journal entry:', error);
      if (!showApprovalConflict(error, 'Deletion submitted for approval')) {
        const errorInfo = handleAPIError(error);
        setError(`Failed to delete journal entry: ${errorInfo.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [canManageJournal, showApprovalConflict, loadData]);

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
        if (result.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Update submitted for approval'));
        } else {
          setSuccess('Journal entry updated successfully');
        }
      } else {
        console.log('➕ Creating journal entry:', payload.glCode);
        const result = await api.banking.journalParameters.create(payload);
        if (result.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Creation submitted for approval'));
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

  const handleOpenPending = useCallback((row: JournalParameter) => {
    setSelectedPendingRequest((row as any).pendingRequest);
    setCurrentRecordForPending(row);
    setPendingChangesDialogOpen(true);
  }, []);
  const handleSaveView = useCallback(async () => {
    if (!user?.id) return;
    await savedView.saveDefaultView({
      ...toSavedViewState(),
      search: searchTerm,
      filters: {
        ...toSavedViewState().filters,
        filterGlGroup,
        filterCurrency,
        filterActive,
      },
    });
    setSuccess('Journal table view saved');
  }, [filterActive, filterCurrency, filterGlGroup, savedView, searchTerm, toSavedViewState, user?.id]);

  const handleResetView = useCallback(async () => {
    clearFilters();
    setColumnFilters({});
    setSort([]);
    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
    if (savedView.hasSavedView) {
      await savedView.clearSavedView();
    }
    setSuccess('Journal table view reset');
  }, [clearFilters, queryState.paginationModel.pageSize, savedView, setColumnFilters, setPaginationModel, setSort]);

  // Export handler (Client-side export matching Product Parameters)
  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    if (!canExportJournal) return;
    try {
      setExportMenuAnchor(null);
      const exportColumns = JOURNAL_EXPORT_COLUMNS.filter(
        (column) => queryState.columnVisibilityModel[column.field] !== false,
      );

      // Build filter description
      const activeFilters: Record<string, any> = {};
      if (searchTerm) activeFilters['Search'] = searchTerm;
      if (filterGlGroup) activeFilters['GL Group'] = filterGlGroup;
      if (filterCurrency) activeFilters['Currency'] = filterCurrency;
      if (filterActive !== 'all') activeFilters['Status'] = filterActive;
      Object.entries(queryState.columnFilters).forEach(([field, value]) => {
        const normalizedValue = normalizeFilterValue(value);
        if (normalizedValue.trim()) {
          activeFilters[`Column: ${field}`] = normalizedValue;
        }
      });
      if (queryState.sort[0]) {
        activeFilters['Sort'] = `${queryState.sort[0].field} (${queryState.sort[0].direction})`;
      }

      const exportOptions = {
        title: 'Journal Parameters',
        filename: 'journal_parameters',
        filters: activeFilters,
        confidential: true
      };

      const dataToExport = tableRows;

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
      setError(`Export failed: ${getErrorMessage(error, 'Export failed')}`);
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
                data-testid="btn-export-journal"
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
                data-testid="btn-add-journal"
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


      <JournalFiltersCard
        searchTerm={searchTerm}
        filterGlGroup={filterGlGroup}
        filterCurrency={filterCurrency}
        filterActive={filterActive}
        totalRows={data.length}
        filteredRows={tableRows.length}
        glGroupOptions={glGroupOptions}
        currencyOptions={currencyOptions}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
        }}
        onGlGroupChange={(value) => {
          setFilterGlGroup(value);
          setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
        }}
        onCurrencyChange={(value) => {
          setFilterCurrency(value);
          setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
        }}
        onActiveChange={(value) => {
          setFilterActive(value);
          setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
        }}
        onApply={loadData}
        onClear={clearFilters}
      />

      <JournalParametersGrid
        rows={tableRows}
        loading={loading}
        error={error}
        canManage={canManageJournal}
        paginationModel={queryState.paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={tableRows.length}
        success={success}
        onSuccessClose={() => setSuccess(null)}
        columnVisibilityModel={queryState.columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        density={queryState.density}
        onDensityChange={setDensity}
        columnFilters={queryState.columnFilters}
        onColumnFiltersChange={setColumnFilters}
        sort={queryState.sort}
        onSortChange={setSort}
        onSaveView={handleSaveView}
        onResetView={handleResetView}
        onRetry={loadData}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onOpenPending={handleOpenPending}
      />


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

      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}
