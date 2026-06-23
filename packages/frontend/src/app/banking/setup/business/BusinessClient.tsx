'use client';

import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import {
    Add as AddIcon,
    Download as DownloadIcon,
} from '@mui/icons-material';
import api, { handleAPIError, bankingAPI } from '../../../../services/api';
import PageHeader from '@/components/banking/shared/PageHeader';
import { exportToCSV, exportToPDF, exportToXLSX } from '@/utils/exportUtils';
import { getErrorMessage } from '@/utils/error-message';
import { useAuth } from '@/providers/AuthProvider';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import type { EnterpriseColumnFilterValue, EnterpriseSort } from '@/types/enterprise-table';
import {
    ApprovalNotification,
    PendingChangesDialog,
    buildApprovalConflictNotification,
    buildApprovalNotification,
    createClosedApprovalNotification,
    type ApprovalNotificationState,
} from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';
import {
    BusinessParameterDialog,
    BusinessDetailFormDialog,
    BusinessParametersGrid,
    type BusinessParameter,
    type BusinessParameterFormData,
    type BusinessParameterDetail,
    type BusinessParameterDetailFormData,
} from './components';

const BUSINESS_EXPORT_COLUMNS = [
    { field: 'param_code', headerName: 'Code' },
    { field: 'param_desc', headerName: 'Description' },
    { field: 'param_value', headerName: 'Value' },
    { field: 'status', headerName: 'Status' },
    { field: 'created_by', headerName: 'Created By' },
    { field: 'created_date', headerName: 'Created Date' },
] as const;

const BUSINESS_FILTER_FIELD_MAP: Record<string, string> = {
    param_code: 'commonCode',
    param_desc: 'description',
    param_value: 'value',
    created_by: 'createdBy',
};

const BUSINESS_SORT_FIELD_MAP: Record<string, string> = {
    param_code: 'param_code',
    param_desc: 'param_desc',
    param_value: 'param_value',
    created_by: 'created_by',
    created_date: 'created_date',
};

const normalizeListPayload = <T,>(value: unknown): T[] => {
    if (Array.isArray(value)) return value as T[];
    if (value && typeof value === 'object') {
        const nestedData = (value as { data?: unknown }).data;
        const nestedRows = (value as { rows?: unknown }).rows;
        if (Array.isArray(nestedData)) return nestedData as T[];
        if (Array.isArray(nestedRows)) return nestedRows as T[];
    }
    return [];
};

const normalizeBusinessFilterValue = (value: EnterpriseColumnFilterValue) => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    if (Array.isArray(value)) return value.join(' ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const getBusinessFieldValue = (row: BusinessParameter, field: string): EnterpriseColumnFilterValue => {
    const record = row as unknown as Record<string, unknown>;
    return record[field] as EnterpriseColumnFilterValue;
};

const compareBusinessValues = (left: unknown, right: unknown) => {
    if (left === right) return 0;
    if (left === null || left === undefined) return 1;
    if (right === null || right === undefined) return -1;

    const leftNumber = typeof left === 'number' ? left : Number(left);
    const rightNumber = typeof right === 'number' ? right : Number(right);
    if (!Number.isNaN(leftNumber) && !Number.isNaN(rightNumber)) {
        return leftNumber - rightNumber;
    }

    return String(left).localeCompare(String(right), undefined, {
        numeric: true,
        sensitivity: 'base',
    });
};

const applyBusinessTableQuery = (
    rows: BusinessParameter[],
    columnFilters: Record<string, EnterpriseColumnFilterValue>,
    sort: EnterpriseSort[],
) => {
    const activeFilters = Object.entries(columnFilters).filter(([, value]) => normalizeBusinessFilterValue(value).trim().length > 0);
    const filteredRows = activeFilters.length === 0
        ? rows
        : rows.filter((row) =>
            activeFilters.every(([field, value]) =>
                normalizeBusinessFilterValue(getBusinessFieldValue(row, field)).toLowerCase().includes(normalizeBusinessFilterValue(value).toLowerCase())
            )
        );

    const activeSort = sort[0];
    if (!activeSort) return filteredRows;

    return [...filteredRows].sort((leftRow, rightRow) => {
        const leftValue = getBusinessFieldValue(leftRow, activeSort.field);
        const rightValue = getBusinessFieldValue(rightRow, activeSort.field);
        const result = compareBusinessValues(leftValue, rightValue);
        return activeSort.direction === 'asc' ? result : -result;
    });
};


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function BusinessClient() {
    const { user } = useAuth();
    const { hasAnyPermission } = usePermission();
    const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);
    const canViewBusiness = hasAnyPermission(['banking.setup.business.view', 'banking.setup.business.manage', 'banking.setup.business']);
    const canManageBusiness = hasAnyPermission(['banking.setup.business.manage', 'banking.setup.business.create', 'banking.setup.business.update', 'banking.setup.business.delete']);

    const [businessParameters, setBusinessParameters] = useState<BusinessParameter[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [pendingApprovalRequests, setPendingApprovalRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
    const showApprovalConflict = (error: unknown, fallbackMessage: string) => {
        const notification = buildApprovalConflictNotification(error, fallbackMessage);
        if (!notification) return false;
        setApprovalNotification(notification);
        return true;
    };

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);
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
        pageKey: 'setup:business-parameters',
        paginationMode: 'offset',
        initialPageSize: 10,
        debounceMs: 0,
        syncUrl: true,
    });
    const savedView = useSavedTableView({
        userId: user?.id,
        scope: 'setup:business-parameters',
        enabled: Boolean(user?.id),
        onApplyView: (view) => {
            applySavedView(view);
            const savedSearch = typeof view.state.search === 'string' ? view.state.search : '';
            const savedFilters = (view.state.filters ?? {}) as Record<string, unknown>;
            setSearchTerm(savedSearch);
        },
    });

    // Dialog State
    const [paramDialogOpen, setParamDialogOpen] = useState(false);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);
    const [editingParameter, setEditingParameter] = useState<BusinessParameter | null>(null);
    const [editingDetail, setEditingDetail] = useState<BusinessParameterDetail | null>(null);
    const [currentDetailParamCode, setCurrentDetailParamCode] = useState('');

    // Approval Modal State
    const [pendingChangesDialogOpen, setPendingChangesDialogOpen] = useState(false);
    const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
    const [currentRecordForPending, setCurrentRecordForPending] = useState<any>(null);

    // Detail Refresh Trigger
    const [detailRefreshTrigger, setDetailRefreshTrigger] = useState(0);

    // Default Detail Sequence
    const [defaultDetailSeq, setDefaultDetailSeq] = useState(1);
    const deferredSearchTerm = useDeferredValue(searchTerm);
    const deferredGridFilters = useDeferredValue(queryState.columnFilters);
    const normalizedGridFilters = useMemo(
        () =>
            Object.fromEntries(
                Object.entries(deferredGridFilters).map(([field, value]) => [
                    BUSINESS_FILTER_FIELD_MAP[field] ?? field,
                    value,
                ]),
            ),
        [deferredGridFilters],
    );
    const mergedServerFilters = useMemo(() => {
        const filters: Record<string, string> = {};

        Object.entries(normalizedGridFilters).forEach(([field, value]) => {
            const normalized = normalizeBusinessFilterValue(value).trim();
            if (normalized) filters[field] = normalized;
        });

        return filters;
    }, [normalizedGridFilters]);
    const normalizedSort = useMemo(
        () =>
            queryState.sort.map((item) => ({
                field: BUSINESS_SORT_FIELD_MAP[item.field] ?? item.field,
                direction: item.direction,
            })),
        [queryState.sort],
    );

    // Callbacks
    const loadBusinessParameters = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.banking.businessSetup.getAll({
                page: queryState.paginationModel.page + 1,
                offset: queryState.paginationModel.page * queryState.paginationModel.pageSize,
                limit: queryState.paginationModel.pageSize,
                search: deferredSearchTerm.trim() || undefined,
                filters: Object.keys(mergedServerFilters).length > 0 ? JSON.stringify(mergedServerFilters) : undefined,
                sort: normalizedSort.length > 0 ? JSON.stringify(normalizedSort) : undefined,
                paginationMode: 'offset',
            });
            const items = normalizeListPayload<any>(response?.data);
            if (response.success) {
                const appParams = items.map((item: any) => ({
                    pkid: item.pkid?.toString() || item.id?.toString() || '',
                    param_code: item.paramCode || item.param_code || '',
                    param_desc: item.paramName || item.param_name || item.param_desc || '',
                    param_category: item.paramType || item.param_type || '',
                    param_value: item.paramUsage || item.param_usage || 'Configured in Details',
                    param_type: item.paramType || item.param_type || 'BUSINESS',
                    is_editable: item.is_editable ?? true,
                    active_flag: item.is_active ?? true,
                    created_by: item.created_by || 'SYSTEM',
                    created_date: item.created_date || item.createddate || ''
                }));
                setTotalCount(response.pagination?.total ?? appParams.length);
                setBusinessParameters(appParams);
            } else {
                setBusinessParameters([]);
                setTotalCount(0);
            }
        } catch (error) {
            setBusinessParameters([]);
            setTotalCount(0);
            setError(handleAPIError(error).message);
        } finally {
            setLoading(false);
        }
    }, [
        deferredSearchTerm,
        mergedServerFilters,
        normalizedSort,
        queryState.paginationModel.page,
        queryState.paginationModel.pageSize,
    ]);

    const loadPendingApprovals = useCallback(async () => {
        try {
            const pendingRes = await bankingAPI.approval.getPendingApprovals();
            const pendingRequests = Array.isArray(pendingRes)
                ? pendingRes
                : normalizeListPayload<any>((pendingRes as any)?.data ?? pendingRes);
            setPendingApprovalRequests(pendingRequests);
        } catch (error) {
            console.warn('Failed to load pending approvals:', error);
            setPendingApprovalRequests([]);
        }
    }, []);

    useEffect(() => { void loadBusinessParameters(); }, [loadBusinessParameters]);
    useEffect(() => { void loadPendingApprovals(); }, [loadPendingApprovals]);

    const refreshAll = useCallback(async () => {
        await Promise.all([loadBusinessParameters(), loadPendingApprovals()]);
    }, [loadBusinessParameters, loadPendingApprovals]);

    const tableRows = useMemo(
        () => businessParameters.map((item) => {
            const pendingRequest = pendingApprovalRequests.find(
                (request: any) => request.entityType === 'parameter' && request.entityId === item.param_code,
            );

            return {
                ...item,
                approvalStatus: pendingRequest ? 'pending' : 'active',
                pendingRequest: pendingRequest || null,
            };
        }),
        [businessParameters, pendingApprovalRequests],
    );

    // Handlers
    const handleSaveParameter = useCallback(async (form: BusinessParameterFormData) => {
        if (!canManageBusiness) return;
        try {
            const payload = {
                paramCode: form.param_code.trim(),
                paramName: form.param_desc.trim(),
                paramUsage: form.param_value.trim(),
                paramType: form.param_category || 'B',
                isActive: form.active_flag
            };
            if (editingParameter) {
                const result = await api.banking.businessSetup.update(editingParameter.param_code, payload);
                if (result.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Update submitted for approval'));
                } else {
                    setSuccess('Updated successfully');
                }
            } else {
                const result = await api.banking.businessSetup.create(payload);
                if (result.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Creation submitted for approval'));
                } else {
                    setSuccess('Created successfully');
                }
            }
            setParamDialogOpen(false);
            await refreshAll();
        } catch (e) {
            if (!showApprovalConflict(e, editingParameter ? 'Update submitted for approval' : 'Creation submitted for approval')) {
                setError(handleAPIError(e).message);
            }
        }
    }, [businessParameters, canManageBusiness, editingParameter, showApprovalConflict, loadBusinessParameters]);

    const handleDeleteParameter = useCallback(async (row: BusinessParameter) => {
        if (!canManageBusiness) return;
        if (!confirm(`Delete parameter ${row.param_code}?`)) return;
        try {
            const result = await api.banking.businessSetup.delete(row.param_code);
            if (result.approvalRequired) {
                setApprovalNotification(buildApprovalNotification(result, 'Deletion submitted for approval'));
            } else {
                setSuccess('Deleted successfully');
            }
            await refreshAll();
        } catch (e) {
            if (!showApprovalConflict(e, 'Deletion submitted for approval')) {
                setError(handleAPIError(e).message);
            }
        }
    }, [canManageBusiness, showApprovalConflict, loadBusinessParameters]);

    const handleSaveDetail = useCallback(async (form: BusinessParameterDetailFormData) => {
        if (!canManageBusiness) return;
        try {
            const payload = {
                paramSeq: form.param_seq,
                value1: form.value1.trim(),
                value2: form.value2?.trim() || '',
                value3: form.value3?.trim() || '',
                paramdesc: form.paramdesc.trim()
            };

            if (editingDetail) {
                const result = await api.banking.businessSetup.updateDetail(parseInt(editingDetail.pkid || '0'), payload);
                if (result?.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Detail update submitted for approval'));
                } else {
                    setSuccess('Detail updated successfully');
                }
            } else {
                // Note: BusinessClient doesn't have a shared list of details for the current header 
                // at the component level to check for duplicates easily without extra state.
                // However, the backend format fix now ensures that if the server rejects it,
                // the error notification will correctly display "Sequence already exists" 
                // or "data already exist".
                const result = await api.banking.businessSetup.createDetail(currentDetailParamCode, payload);
                if (result?.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Detail creation submitted for approval'));
                } else {
                    setSuccess('Detail created successfully');
                }
            }
            setDetailDialogOpen(false);
            setDetailRefreshTrigger(prev => prev + 1);
            await loadPendingApprovals();
        } catch (e) {
            const err = handleAPIError(e);
            if (!showApprovalConflict(e, editingDetail ? 'Detail update submitted for approval' : 'Detail creation submitted for approval')) {
                setError(err.message);
            }
        }
    }, [canManageBusiness, currentDetailParamCode, editingDetail, showApprovalConflict]);

    const handleDeleteDetail = useCallback(async (detail: BusinessParameterDetail, _callback: () => void) => {
        if (!canManageBusiness) return;
        if (!confirm('Delete detail?')) return;
        try {
            const result = await api.banking.businessSetup.deleteDetail(parseInt(detail.pkid || '0'));
            if (result?.approvalRequired) {
                setApprovalNotification(buildApprovalNotification(result, 'Detail deletion submitted for approval'));
            } else {
                setSuccess('Detail deleted successfully');
            }
            setDetailRefreshTrigger(prev => prev + 1);
            await loadPendingApprovals();
        } catch (e) {
            if (!showApprovalConflict(e, 'Detail deletion submitted for approval')) {
                setError(handleAPIError(e).message);
            }
        }
    }, [canManageBusiness, showApprovalConflict]);

    const handleOpenPendingChanges = useCallback((row: BusinessParameter) => {
        setSelectedPendingRequest((row as any).pendingRequest);
        setCurrentRecordForPending(row);
        setPendingChangesDialogOpen(true);
    }, []);

    const handleEditParameter = useCallback((row: BusinessParameter) => {
        setEditingParameter(row);
        setParamDialogOpen(true);
    }, []);

    const handleEditDetail = useCallback((row: BusinessParameter, detail: BusinessParameterDetail) => {
        setCurrentDetailParamCode(row.param_code);
        setEditingDetail(detail);
        setDetailDialogOpen(true);
    }, []);

    const handleAddDetail = useCallback((paramCode: string, nextSeq: number) => {
        setCurrentDetailParamCode(paramCode);
        setDefaultDetailSeq(nextSeq);
        setEditingDetail(null);
        setDetailDialogOpen(true);
    }, []);

    const handleResetFilters = useCallback(async () => {
        setSearchTerm('');
        resetView();
        setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
        if (savedView.hasSavedView) {
            await savedView.clearSavedView();
        }
        setSuccess('Business table view reset');
    }, [queryState.paginationModel.pageSize, resetView, savedView, setPaginationModel]);

    const handleSaveView = useCallback(async () => {
        if (!user?.id) return;
        await savedView.saveDefaultView({
            ...toSavedViewState(),
            search: searchTerm,
        });
        setSuccess('Business table view saved');
    }, [savedView, searchTerm, toSavedViewState, user?.id]);

    const handleExport = useCallback((format: 'xlsx' | 'csv' | 'pdf') => {
        try {
            setExportAnchorEl(null);
            const exportColumns = BUSINESS_EXPORT_COLUMNS.filter(
                (column) => queryState.columnVisibilityModel[column.field] !== false,
            );
            const exportFilters: Record<string, string> = {};
            if (searchTerm) exportFilters.Search = searchTerm;
            Object.entries(queryState.columnFilters).forEach(([field, value]) => {
                const normalizedValue = normalizeBusinessFilterValue(value);
                if (normalizedValue.trim()) exportFilters[`Column: ${field}`] = normalizedValue;
            });
            if (queryState.sort[0]) {
                exportFilters.Sort = `${queryState.sort[0].field} (${queryState.sort[0].direction})`;
            }

            const exportOptions = {
                title: 'Business Parameters',
                filename: 'business_parameters',
                filters: exportFilters,
                confidential: true,
            };

            const result = format === 'xlsx'
                ? exportToXLSX(tableRows, exportColumns, exportOptions)
                : format === 'csv'
                    ? exportToCSV(tableRows, exportColumns, exportOptions)
                    : exportToPDF(tableRows, exportColumns, exportOptions);

            if (!result?.success) {
                throw new Error(result?.error || `Failed to export ${format.toUpperCase()}`);
            }

            setSuccess(`Exported ${tableRows.length} business parameters to ${format.toUpperCase()}`);
        } catch (error) {
            setError(getErrorMessage(error, 'Failed to export business parameters'));
        }
    }, [queryState.columnFilters, queryState.columnVisibilityModel, queryState.sort, searchTerm, tableRows]);

    return (
        <Container maxWidth="xl" sx={{ minWidth: 0, overflowX: 'hidden' }}>
            {!canViewBusiness && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    You do not have permission to view business settings.
                </Alert>
            )}
            <PageHeader
                title="Business Configuration"
                subtitle="Business parameters configuration with Master-Detail"
                onRefresh={refreshAll}
                loading={loading}
                extraActions={
                    <>
                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={(event) => setExportAnchorEl(event.currentTarget)}
                            disabled={loading || tableRows.length === 0}
                        >
                            Export
                        </Button>
                        {canManageBusiness ? (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingParameter(null); setParamDialogOpen(true); }} data-testid="btn-create-business-setting">
                                Create
                            </Button>
                        ) : undefined}
                    </>
                }
            />

            <BusinessParametersGrid
                rows={tableRows}
                loading={loading}
                searchTerm={searchTerm}
                paginationModel={queryState.paginationModel}
                totalCount={totalCount}
                detailRefreshTrigger={detailRefreshTrigger}
                canManage={canManageBusiness}
                onSearchChange={(value) => {
                    setSearchTerm(value);
                    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
                }}
                onResetFilters={handleResetFilters}
                onPaginationModelChange={setPaginationModel}
                columnVisibilityModel={queryState.columnVisibilityModel}
                onColumnVisibilityModelChange={setColumnVisibilityModel}
                density={queryState.density}
                onDensityChange={setDensity}
                columnFilters={queryState.columnFilters}
                onColumnFiltersChange={setColumnFilters}
                sort={queryState.sort}
                onSortChange={setSort}
                onSaveView={handleSaveView}
                onResetView={handleResetFilters}
                onOpenPendingChanges={handleOpenPendingChanges}
                onEditParameter={handleEditParameter}
                onDeleteParameter={handleDeleteParameter}
                onEditDetail={handleEditDetail}
                onAddDetail={handleAddDetail}
                onDeleteDetail={handleDeleteDetail}
            />
            <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
                <MenuItem onClick={() => handleExport('xlsx')}>Export to Excel</MenuItem>
                <MenuItem onClick={() => handleExport('csv')}>Export to CSV</MenuItem>
                <MenuItem onClick={() => handleExport('pdf')}>Export to PDF</MenuItem>
            </Menu>

            <BusinessParameterDialog
                open={paramDialogOpen}
                onClose={() => setParamDialogOpen(false)}
                onSave={handleSaveParameter}
                parameter={editingParameter || undefined}
            />
            <BusinessDetailFormDialog
                open={detailDialogOpen}
                onClose={() => setDetailDialogOpen(false)}
                onSave={handleSaveDetail}
                detail={editingDetail || undefined}
                paramCode={currentDetailParamCode}
                defaultSeq={defaultDetailSeq}
            />

            <PendingChangesDialog
                open={pendingChangesDialogOpen}
                onClose={() => setPendingChangesDialogOpen(false)}
                request={selectedPendingRequest}
                currentData={currentRecordForPending}
                title={`Pending Changes for ${currentRecordForPending?.param_code}`}
            />

            <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}><Alert severity="success">{success}</Alert></Snackbar>
            <ApprovalNotification
                open={approvalNotification.open}
                message={approvalNotification.message}
                requestId={approvalNotification.requestId}
                actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
                actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
                onClose={() => setApprovalNotification(createClosedApprovalNotification())}
            />
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}><Alert severity="error">{error}</Alert></Snackbar>
        </Container>
    );
}
