// packages/frontend/src/app/banking/parameters/journal/page.tsx
// ============================================================================
// 🩹 SURGICAL FIX: Complete Journal Parameters with Real Database Integration
// ============================================================================
// ✅ FIXED: Removed all mock data fallbacks completely
// ✅ FIXED: Real API integration with standardized endpoints (camelCase)
// ✅ FIXED: Enhanced error handling and user feedback
// ============================================================================

'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

export default function JournalParametersPage() {
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission();
  const canViewJournal = hasAnyPermission(['banking.parameter.journal.view']);
  const canManageJournal = hasAnyPermission(['banking.parameter.journal.create', 'banking.parameter.journal.update', 'banking.parameter.journal.delete']);
  const canExportJournal = hasAnyPermission(['banking.parameter.journal.export']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JournalParameter[]>([]);
  const [rowCount, setRowCount] = useState(0);
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
    paginationMode: 'offset',
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

      const requestFilters: Record<string, unknown> = {};
      if (filterGlGroup) requestFilters.glGroup = filterGlGroup;
      if (filterCurrency) requestFilters.currency = filterCurrency;
      if (filterActive !== 'all') requestFilters.activeFlag = filterActive === 'active';
      Object.entries(queryState.columnFilters).forEach(([field, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          requestFilters[field] = value;
        }
      });

      const result = await api.banking.journalParameters.getAll({
        page: queryState.paginationModel.page + 1,
        offset: queryState.paginationModel.page * queryState.paginationModel.pageSize,
        limit: queryState.paginationModel.pageSize,
        paginationMode: 'offset',
        search: searchTerm || undefined,
        glGroup: filterGlGroup || undefined,
        currency: filterCurrency || undefined,
        activeFlag: filterActive === 'all' ? undefined : String(filterActive === 'active'),
        filters: Object.keys(requestFilters).length > 0 ? JSON.stringify(requestFilters) : undefined,
        sort: queryState.sort.length > 0 ? JSON.stringify(queryState.sort) : undefined,
      });

      const payload = result?.data && typeof result.data === 'object' ? result.data : result;
      const rows = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : [];
      const pagination = payload?.pagination ?? {};

      if (result.success && rows) {

        // Fetch pending approvals for journal parameters
        try {
          const pendingRes = await bankingAPI.approval.getPendingApprovals();
          const pendingRequests = Array.isArray(pendingRes) ? pendingRes : (pendingRes as any).data || [];

          const mappedData = rows.map((item: any) => {
            const pending = pendingRequests.find((r: any) => r.entityType === 'journal_parameter' && r.entityId === item.pkid?.toString());
            return {
              ...item,
              approvalStatus: pending ? 'pending' : 'active',
              pendingRequest: pending || null
            };
          });
          setData(mappedData);
          setRowCount(Number(pagination.total ?? rows.length ?? 0));
        } catch (e) {
          console.warn('Failed to load pending approvals:', e);
          setData(rows);
          setRowCount(Number(pagination.total ?? rows.length ?? 0));
        }
      } else {
        throw new Error(result.message || 'Failed to load journal parameters');
      }

    } catch (error: any) {
      console.error('❌ Failed to load journal parameters:', error);
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      setData([]);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    filterActive,
    filterCurrency,
    filterGlGroup,
    queryState.columnFilters,
    queryState.paginationModel.page,
    queryState.paginationModel.pageSize,
    queryState.sort,
    searchTerm,
  ]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setFilterGlGroup('');
    setFilterCurrency('');
    setFilterActive('all');
    setColumnFilters({});
    setSort([]);
    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
    resetView();
  }, [queryState.paginationModel.pageSize, resetView, setColumnFilters, setPaginationModel, setSort]);

  const loadDropdownOptions = useCallback(async () => {
    setOptionsLoading(true);
    try {

      const [glGroup, currency, journalType, journalCode, dbcr] = await Promise.all([
        api.banking.journalParameters.getGlGroupOptions(),
        api.banking.journalParameters.getCurrencyOptions(),
        api.banking.journalParameters.getJournalTypeOptions(),
        api.banking.journalParameters.getJournalCodeOptions(),
        api.banking.journalParameters.getDbcrOptions()
      ]);

      // Per tech spec: all dropdown values must come from Rule Base Setting (by rule type)
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
  }, [loadData]);

  useEffect(() => {
    loadDropdownOptions();
  }, [loadDropdownOptions]);

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
      const result = await api.banking.journalParameters.delete(journal.pkid);
      if (result.approvalRequired) {
        setApprovalNotification(buildApprovalNotification(result, 'Deletion submitted for approval'));
      } else {
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
        const result = await api.banking.journalParameters.update(selectedJournal.pkid, payload);
        if (result.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Update submitted for approval'));
        } else {
          setSuccess('Journal entry updated successfully');
        }
      } else {
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
        if (value !== '' && value !== null && value !== undefined) {
          activeFilters[`Column: ${field}`] = String(value);
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

      const dataToExport = data;

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
        totalRows={rowCount}
        filteredRows={rowCount}
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
        onApply={() => {
          setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
        }}
        onClear={clearFilters}
      />

      <JournalParametersGrid
        rows={data}
        loading={loading}
        error={error}
        canManage={canManageJournal}
        paginationModel={queryState.paginationModel}
        onPaginationModelChange={setPaginationModel}
        rowCount={rowCount}
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
