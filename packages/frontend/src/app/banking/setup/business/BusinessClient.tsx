// packages/frontend/src/app/banking/setup/business/BusinessClient.tsx
// ============================================================================
// 🔧 IMPLEMENTATION: BUSINESS SETTING PAGE
// ============================================================================
// ✅ MASTER-DETAIL: Headers table with expandable detail rows using SafeDataGrid
// ✅ CRUD OPERATIONS: Create, Read, Update, Delete for both headers and details
// ✅ SAFE DATA GRID: Replaces manual table implementation
// ============================================================================

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Alert, Button, Container, Snackbar
} from '@mui/material';
import {
    Add as AddIcon
} from '@mui/icons-material';
import api, { handleAPIError, bankingAPI } from '../../../../services/api';
import PageHeader from '@/components/banking/shared/PageHeader';
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


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function BusinessClient() {
    const { hasAnyPermission } = usePermission();
    const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);
    const canViewBusiness = hasAnyPermission(['banking.setup.business.view', 'banking.setup.business.manage', 'banking.setup.business', 'admin.super_admin']);
    const canManageBusiness = hasAnyPermission(['banking.setup.business.manage', 'banking.setup.business.create', 'banking.setup.business.update', 'banking.setup.business.delete', 'admin.super_admin']);

    const [businessParameters, setBusinessParameters] = useState<BusinessParameter[]>([]);
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

    // Pagination State (Segmentation Pattern)
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

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

    // Callbacks
    const loadBusinessParameters = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.banking.businessSetup.getAll();
            if (response.success && response.data) {
                const appParams = response.data.map((item: any) => ({
                    pkid: item.pkid?.toString() || item.id?.toString() || '',
                    param_code: item.paramCode || item.param_code || '',
                    param_desc: item.paramName || item.param_name || item.param_desc || '',
                    param_category: item.paramType || item.param_type || '',
                    param_value: item.paramUsage || item.param_usage || 'Configured in Details',
                    active_flag: item.is_active ?? true,
                    created_by: item.created_by || 'SYSTEM',
                    created_date: item.created_date || item.createddate || ''
                }));
                const sorted = appParams.sort((a: any, b: any) => a.param_code.localeCompare(b.param_code));

                // Fetch pending approvals
                try {
                    const pendingRes = await bankingAPI.approval.getPendingApprovals();
                    const pendingRequests = Array.isArray(pendingRes) ? pendingRes : (pendingRes as any).data || [];

                    const mappedData = sorted.map((item: any) => {
                        const pending = pendingRequests.find((r: any) => r.entityType === 'parameter' && r.entityId === item.param_code);
                        return {
                            ...item,
                            approvalStatus: pending ? 'pending' : 'active',
                            pendingRequest: pending || null
                        };
                    });
                    setBusinessParameters(mappedData);
                } catch (e) {
                    console.warn('Failed to load pending approvals:', e);
                    setBusinessParameters(sorted);
                }
            }
        } catch (error) {
            setError(handleAPIError(error).message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadBusinessParameters(); }, []);

    const filteredData = useMemo(() => {
        let d = [...businessParameters];
        if (searchTerm) {
            const s = searchTerm.toLowerCase();
            d = d.filter(i => i.param_code.toLowerCase().includes(s) || i.param_desc.toLowerCase().includes(s));
        }
        if (categoryFilter !== 'ALL') {
            d = d.filter(i => i.param_category === categoryFilter);
        }

        // Update total count
        setTotalCount(d.length);

        return d;
    }, [businessParameters, searchTerm, categoryFilter]);

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
                // Client-side duplicate check
                if (businessParameters.some(p => p.param_code === payload.paramCode)) {
                    setError(`Parameter code '${payload.paramCode}' already exists.`);
                    return;
                }
                const result = await api.banking.businessSetup.create(payload);
                if (result.approvalRequired) {
                    setApprovalNotification(buildApprovalNotification(result, 'Creation submitted for approval'));
                } else {
                    setSuccess('Created successfully');
                }
            }
            setParamDialogOpen(false);
            loadBusinessParameters();
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
            loadBusinessParameters();
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

    return (
        <Container maxWidth="xl">
            {!canViewBusiness && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    You do not have permission to view business settings.
                </Alert>
            )}
            <PageHeader
                title="Business Configuration"
                subtitle="Business parameters configuration with Master-Detail"
                onRefresh={loadBusinessParameters}
                loading={loading}
                extraActions={canManageBusiness ? <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingParameter(null); setParamDialogOpen(true); }} data-testid="btn-create-business-setting">Create</Button> : undefined}
            />

            <BusinessParametersGrid
                rows={filteredData}
                loading={loading}
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                page={page}
                rowsPerPage={rowsPerPage}
                totalCount={totalCount}
                detailRefreshTrigger={detailRefreshTrigger}
                canManage={canManageBusiness}
                onSearchChange={setSearchTerm}
                onCategoryChange={setCategoryFilter}
                onResetFilters={() => {
                    setSearchTerm('');
                    setCategoryFilter('ALL');
                }}
                onPageChange={setPage}
                onRowsPerPageChange={(value) => {
                    setRowsPerPage(value);
                    setPage(0);
                }}
                onOpenPendingChanges={handleOpenPendingChanges}
                onEditParameter={handleEditParameter}
                onDeleteParameter={handleDeleteParameter}
                onEditDetail={handleEditDetail}
                onAddDetail={handleAddDetail}
                onDeleteDetail={handleDeleteDetail}
            />

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
