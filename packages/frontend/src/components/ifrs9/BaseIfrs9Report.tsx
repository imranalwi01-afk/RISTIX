// packages/frontend/src/components/ifrs9/BaseIfrs9Report.tsx
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box'
import Alert from '@mui/material/Alert'
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { GridColDef } from '@mui/x-data-grid';
import { useAuth } from '../../providers/AuthProvider';
import api from '../../services/api';
import { reportsAPI } from '../../services/api.reports';
import ModernLoader from '../common/ModernLoader';
import { useBankingTheme } from '../../providers/BankingThemeProvider';
import { usePermission } from '@/hooks/usePermission';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import { useIfrs9ReportQuery } from '@/features/ifrs9-reports/hooks/useIfrs9ReportQuery';
import { DataSourceInfo } from '@/components/shared/DataSourceInfo';

// Sub-components
import Ifrs9ReportHeader from './BaseIfrs9Report/Ifrs9ReportHeader';
import Ifrs9ReportToolbar from './BaseIfrs9Report/Ifrs9ReportToolbar';
import Ifrs9ReportFilters from './BaseIfrs9Report/Ifrs9ReportFilters';
import Ifrs9ReportDataGrid from './BaseIfrs9Report/Ifrs9ReportDataGrid';
import Ifrs9ReportExportDialog from './BaseIfrs9Report/Ifrs9ReportExportDialog';
import Ifrs9ReportConfigDrawer from './BaseIfrs9Report/Ifrs9ReportConfigDrawer';
import Ifrs9ReportDebugPanel from './BaseIfrs9Report/Ifrs9ReportDebugPanel';

// Extracted helpers and hooks
import { renderLifetimeLgdDetailPanel } from './BaseIfrs9Report/reportColumnHelpers';
import { useReportData } from './BaseIfrs9Report/useReportData';
import { useReportExport } from './BaseIfrs9Report/useReportExport';

// Types, constants, and helpers
import type {
  BaseIfrs9ReportProps,
  ReportFilters,
  ReportDebugConfigResponse,
  ThemeStyles,
} from './BaseIfrs9Report/types';
import {
  formatLocalDate,
  GROUP_SEGMENT_ALLOWLIST_ORDER,
  getDefaultFilters,
} from './BaseIfrs9Report/constants';
import type { ExportOptions } from './BaseIfrs9Report/Ifrs9ReportExportDialog';

// Re-export types for external consumers
export type {
  BaseIfrs9ReportProps,
  ReportFilters,
  ReportResponse,
  ReportDebugMetadata,
} from './BaseIfrs9Report/types';

// --- Main Component ---

const BaseIfrs9Report: React.FC<BaseIfrs9ReportProps> = ({
  title,
  description,
  reportType,
  requiredParams,
  optionalParams = [],
  supportsPagination = false,
  paginationMode,
  supportsCharts = false,
  headerIcon,
  statusLabel = 'Live Production Data',
  granularity = 'Transaction / Account Level',
  scope = 'IFRS 9 Regulatory Compliance',
  onDataLoaded,
  children,
  hideHeader = false,
  headerAtTop = false,
  hideFilters = false,
  hideDataGrid = false,
  externalFilters
}) => {
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission();
  const { bankingMode } = useBankingTheme();
  const canManageReportDebug = hasAnyPermission(['admin.maintenance.view']);

  const tenant = React.useMemo(() => {
    return user?.tenantId ? { id: user.tenantId, slug: user.tenantSlug } : null;
  }, [user?.tenantId, user?.tenantSlug]);

  // State management
  const [filters, setFilters] = useState<ReportFilters>(getDefaultFilters(reportType));
  const [showFilters, setShowFilters] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = React.useDeferredValue(searchTerm);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    scope: 'all_pages',
    format: 'xlsx',
    fromDate: null,
    toDate: null,
  });
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [reportDebugEnabled, setReportDebugEnabled] = useState(false);
  const [reportDebugLoading, setReportDebugLoading] = useState(false);
  const [reportDebugSaving, setReportDebugSaving] = useState(false);

  // Fetch default processing date from frs9_prc_date on mount
  useEffect(() => {
    if (filters.prc_date) return;
    const fetchPrcDate = async () => {
      try {
        const response = await reportsAPI.getProcessingDate();
        if (response?.data?.prc_date) {
          setFilters(prev => ({ ...prev, prc_date: new Date(response.data.prc_date) }));
        }
      } catch {
        console.warn('Could not fetch processing date, user must select manually');
      }
    };
    fetchPrcDate();
  }, []);

  const {
    queryState,
    queryParams,
    setPaginationModel,
    setColumnFilters,
    setSort,
    setColumnVisibilityModel,
    setDensity,
    applySavedView,
    toSavedViewState,
    resetView,
  } = useEnterpriseTableQuery({
    pageKey: `ifrs9-report:${reportType}`,
    paginationMode: paginationMode ?? (supportsPagination ? 'offset' : 'client'),
    initialPageSize: getDefaultFilters(reportType).limit ?? 20,
    syncUrl: supportsPagination,
  });

  const savedView = useSavedTableView({
    userId: user?.id,
    scope: `ifrs9-report:${reportType}`,
    enabled: Boolean(user?.id),
    onApplyView: (view) => {
      applySavedView(view);
      const savedSearch = typeof view.state.search === 'string' ? view.state.search : '';
      setSearchTerm(savedSearch);
    },
  });

  const missingParams = React.useMemo(
    () => requiredParams.filter((param) => {
      const value = filters[param as keyof ReportFilters];
      return value === null || value === undefined || value === '';
    }),
    [filters, requiredParams],
  );

  const reportQuery = useIfrs9ReportQuery({
    reportType,
    filters,
    requiredParams,
    supportsPagination,
    queryParams,
    deferredSearchTerm,
    enabled: Boolean(tenant && filters.prc_date && missingParams.length === 0),
  });
  const loading = reportQuery.isLoading || reportQuery.isFetching;

  // --- Extracted hooks ---

  const {
    data,
    columns,
    pagination,
    filterDefinitions,
    segments,
    scalars: _scalars,
    lgdMethods,
    lgdConfigs,
    eadConfigs,
    effectivePrcDate,
    reportMeta,
    error,
    infoMessage,
    setError,
    setInfoMessage,
  } = useReportData({
    reportType,
    tenant,
    filters,
    requiredParams,
    missingParams,
    reportQuery,
    onDataLoaded,
    externalFilters,
    setFilters,
  });

  // Client-side search filtering
  const filteredData = React.useMemo(() => {
    if (supportsPagination) return data;
    if (!searchTerm) return data;
    const lowerTerm = searchTerm.toLowerCase();
    return data.filter(row => {
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(lowerTerm)
      );
    });
  }, [data, searchTerm, supportsPagination]);

  const handleExportExecute = useReportExport({
    reportType,
    filters,
    exportOptions,
    data,
    filteredData,
    supportsPagination,
    title,
    user,
    deferredSearchTerm,
    queryParams,
    setError,
    setExportLoading,
    setExportDialogOpen,
  });

  const gridDensity = React.useMemo(() => {
    if (!supportsPagination) return undefined;
    return queryState.density === 'dense' ? 'compact' : queryState.density;
  }, [queryState.density, supportsPagination]);

  const segmentOptions = React.useMemo(() => {
    if (reportType !== 'lifetime-lgd' && reportType !== 'ead-model') return segments;
    const target = reportType === 'ead-model' ? 'ead' : 'lgd'
    const isTarget = (s: any) => {
      const t = String((s as any).segment_type ?? (s as any).segmentType ?? '').toLowerCase();
      if (t) return t.includes(target);
      const name = String(s.segment_name ?? '').toLowerCase();
      const group = String(s.group_segment ?? s.groupSegment ?? '').toLowerCase();
      return new RegExp(`\\\\b${target}\\\\b`).test(name)
        || name.startsWith(target)
        || new RegExp(`\\\\b${target}\\\\b`).test(group)
        || group.startsWith(target);
    };
    return segments.filter(isTarget);
  }, [reportType, segments]);

  const groupSegmentOptions = React.useMemo(() => {
    if (reportType === 'gca-movement') {
      return [...GROUP_SEGMENT_ALLOWLIST_ORDER];
    }
    const unique = Array.from(
      new Set(
        segments
          .map((segment) => String(segment.group_segment || segment.groupSegment || '').trim())
          .filter((value) => value.length > 0)
      )
    );
    const byName = new Map<string, string>();
    for (const name of unique) {
      const key = name.toLowerCase();
      if (!byName.has(key)) byName.set(key, name);
    }
    return Array.from(byName.values()).sort((a, b) => a.localeCompare(b));
  }, [reportType, segments]);

  // --- Handlers ---

  const handleFilterChange = useCallback(<K extends keyof ReportFilters>(field: K, value: ReportFilters[K]) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  }, []);

  const handlePaginationChange = useCallback((page: number, pageSize: number) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }));
  }, []);

  const handleSaveCurrentView = useCallback(async () => {
    try {
      await savedView.saveDefaultView({
        ...toSavedViewState(),
        search: searchTerm,
      });
      setInfoMessage('Current table view saved.');
    } catch (err) {
      console.error('Failed to save table view:', err);
      setError(err instanceof Error ? err.message : 'Failed to save table view.');
    }
  }, [savedView, searchTerm, toSavedViewState]);

  const handleResetCurrentView = useCallback(async () => {
    try {
      await savedView.clearSavedView();
      resetView();
      setSearchTerm('');
      setInfoMessage('Saved table view cleared.');
    } catch (err) {
      console.error('Failed to clear table view:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear table view.');
    }
  }, [resetView, savedView]);

  const loadReportDebugConfig = useCallback(async () => {
    if (!canManageReportDebug) return;
    setReportDebugLoading(true);
    try {
      const response = await api.banking.ifrs9Reports.debugConfig.get() as ReportDebugConfigResponse;
      setReportDebugEnabled(Boolean(response?.data?.enabled));
    } catch (err) {
      console.error('Failed to load IFRS9 report debug config:', err);
    } finally {
      setReportDebugLoading(false);
    }
  }, [canManageReportDebug]);

  const handleToggleReportDebug = useCallback(async (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    if (!canManageReportDebug) return;
    setReportDebugSaving(true);
    try {
      const response = await api.banking.ifrs9Reports.debugConfig.update(checked) as ReportDebugConfigResponse;
      setReportDebugEnabled(Boolean(response?.data?.enabled ?? checked));
      await reportQuery.refetch();
    } catch (err) {
      console.error('Failed to update IFRS9 report debug config:', err);
      setError(err instanceof Error ? err.message : 'Failed to update report debug configuration.');
    } finally {
      setReportDebugSaving(false);
    }
  }, [canManageReportDebug, reportQuery]);

  const handleRun = useCallback(() => {
    void reportQuery.refetch();
  }, [reportQuery]);

  const handleClear = useCallback(() => {
    setSearchTerm('');
    setFilters(getDefaultFilters(reportType));
    setColumnFilters({});
    setSort([]);
    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
  }, [queryState.paginationModel.pageSize, reportType, setColumnFilters, setPaginationModel, setSort]);

  // --- Effects (kept in orchestrator) ---

  useEffect(() => { loadReportDebugConfig(); }, [loadReportDebugConfig]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'r': e.preventDefault(); handleRun(); break;
          case 'e': e.preventDefault(); if (data.length > 0) setExportDialogOpen(true); break;
          case 'c': e.preventDefault(); handleClear(); break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleClear, data.length]);

  // --- Theme Styles ---

  const themeStyles = React.useMemo((): ThemeStyles => {
    switch (bankingMode) {
      case 'conventional':
        return { gradient: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)', primary: '#1976D2', shadow: 'rgba(25, 118, 210, 0.3)' };
      case 'dual':
        return { gradient: 'linear-gradient(135deg, #37474f 0%, #263238 100%)', primary: '#37474f', shadow: 'rgba(55, 71, 79, 0.3)' };
      default:
        return { gradient: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)', primary: '#1976D2', shadow: 'rgba(25, 118, 210, 0.3)' };
    }
  }, [bankingMode]);

  // --- Render ---

  const headerNode = !hideHeader ? (
    <Ifrs9ReportHeader
      title={title}
      description={description}
      statusLabel={statusLabel}
      granularity={granularity}
      scope={scope}
      headerIcon={headerIcon}
      themeStyles={themeStyles}
    />
  ) : null;

  const debugMeta = reportMeta?.debug ?? null;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 0, position: 'relative', minHeight: '60vh' }}>
        <ModernLoader
          open={loading}
          message={`Loading ${title}`}
          subMessage="Retrieving financial data..."
        />

        {headerAtTop ? headerNode : null}

        {debugMeta && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <DataSourceInfo debug={debugMeta as unknown as Record<string, unknown>} title={title} />
          </Box>
        )}

        {!hideHeader && (
          <Ifrs9ReportToolbar
            searchTerm={searchTerm}
            onSearchChange={(value) => {
              setSearchTerm(value);
              if (supportsPagination) {
                setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
              }
            }}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            hideFilters={hideFilters}
            supportsCharts={supportsCharts}
            loading={loading}
            exportLoading={exportLoading}
            hasData={data.length > 0}
            onRefresh={handleRun}
            onExport={() => setExportDialogOpen(true)}
            headerAtTop={headerAtTop}
            themeStyles={themeStyles}
          />
        )}

        {!headerAtTop ? headerNode : null}

        {!hideHeader && !hideFilters && showFilters && (
          <Ifrs9ReportFilters
            filters={filters}
            reportType={reportType}
            optionalParams={optionalParams}
            segmentOptions={segmentOptions}
            groupSegmentOptions={groupSegmentOptions}
            lgdConfigs={lgdConfigs}
            lgdMethods={lgdMethods}
            eadConfigs={eadConfigs}
            loading={loading}
            onFilterChange={handleFilterChange}
            onClear={handleClear}
            onRun={handleRun}
            onOpenConfigDrawer={() => setConfigDrawerOpen(true)}
            themeStyles={themeStyles}
          />
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {infoMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setInfoMessage(null)}>{infoMessage}</Alert>}

        {effectivePrcDate && filters.prc_date && effectivePrcDate !== formatLocalDate(filters.prc_date) && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Snapshot used: <strong>{effectivePrcDate}</strong>{' '}
            {effectivePrcDate < formatLocalDate(filters.prc_date)
              ? '(latest available data on or before the selected processing date).'
              : '(nearest available data after the selected processing date).'}
          </Alert>
        )}

        <Ifrs9ReportDebugPanel
          canManageReportDebug={canManageReportDebug}
          reportDebugEnabled={reportDebugEnabled}
          reportDebugLoading={reportDebugLoading}
          reportDebugSaving={reportDebugSaving}
          onToggleReportDebug={handleToggleReportDebug}
          debugMeta={debugMeta}
          title={title}
          dataLength={data.length}
          themeStyles={themeStyles}
        />

        {children}

        <Ifrs9ReportDataGrid
          columns={columns}
          filteredData={filteredData}
          data={data}
          loading={loading}
          hideDataGrid={hideDataGrid}
          supportsPagination={supportsPagination}
          reportType={reportType}
          pagination={pagination}
          queryState={queryState}
          gridDensity={gridDensity}
          filterDefinitions={filterDefinitions}
          onPaginationModelChange={(model) => {
            setPaginationModel({ page: model.page, pageSize: model.pageSize });
            handlePaginationChange(model.page + 1, model.pageSize);
          }}
          onColumnFiltersChange={setColumnFilters}
          onSortModelChange={(model) => {
            setSort(
              model
                .filter((item) => item.sort === 'asc' || item.sort === 'desc')
                .map((item) => ({ field: item.field, direction: item.sort as 'asc' | 'desc' }))
            );
          }}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          onDensityChange={setDensity}
          onSaveView={handleSaveCurrentView}
          onResetView={handleResetCurrentView}
          renderDetailPanel={reportType === 'lifetime-lgd' ? renderLifetimeLgdDetailPanel : undefined}
          themeStyles={themeStyles}
        />

        {data.length > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Box component="p" sx={{ m: 0, fontSize: '0.875rem', color: 'text.secondary' }}>
              Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'} (filtered from {data.length})
              {supportsPagination && ` (Page ${pagination.page} of ${pagination.totalPages})`}
              {' • '}
              Generated at {new Date().toLocaleString('id-ID')}
            </Box>
          </Box>
        )}

        <Ifrs9ReportExportDialog
          open={exportDialogOpen}
          onClose={() => setExportDialogOpen(false)}
          exportOptions={exportOptions}
          onExportOptionsChange={setExportOptions}
          onExecute={handleExportExecute}
          themeStyles={themeStyles}
        />

        <Ifrs9ReportConfigDrawer
          open={configDrawerOpen}
          onClose={() => setConfigDrawerOpen(false)}
          filters={filters}
          themeStyles={themeStyles}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default BaseIfrs9Report;
