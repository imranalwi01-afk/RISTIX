'use client';
// packages/frontend/src/app/banking/setup/application/ApplicationClient.tsx
// ============================================================================
// 🔧 IMPLEMENTATION: COMPLETE LEGACY ASP.NET APPLICATIONSETTING REPLICA
// ============================================================================
// ✅ LEGACY-COMPATIBLE: Exact replica of ApplicationSetting/Index.cshtml functionality
// ✅ MASTER-DETAIL: Headers table with expandable detail rows using SafeDataGrid
// ✅ DATATABLES-STYLE: Column-wise search, pagination, sorting, export capabilities
// ✅ CRUD OPERATIONS: Create, Read, Update, Delete for both headers and details
// ✅ PERMISSIONS: Role-based UI rendering with ViewBag-style permission checks
// ============================================================================



import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from 'react';
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import PageHeader from '@/components/banking/shared/PageHeader'

import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'

import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import api, { handleAPIError, bankingAPI } from '../../../../services/api';
import { appSettingsApi } from '@/services/api/app-settings.api';
import { invalidateAppSettingsCache } from '@/lib/cached-settings';
import { exportToCSV, exportToPDF, exportToXLSX } from '@/utils/exportUtils';
import { getErrorMessage } from '@/utils/error-message';
import { useAuth } from '@/providers/AuthProvider';
import { useCurrencyDisplay } from '@/providers/CurrencyDisplayProvider';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import type { EnterpriseColumnFilterValue, EnterpriseSort } from '@/types/enterprise-table';
import {
  ApprovalStatusBadge,
  PendingChangesDialog,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { Can } from '@/components/rbac/Can';
import { usePermission } from '@/hooks/usePermission';

import {
  ApplicationFormDialog,
  DetailFormDialog,
  ApplicationDetailPanel,
  DisplaySettingsCard,
  ViewDetailDialog,
  ApplicationToolbar,
  NotificationSnackbars,
  APPLICATION_EXPORT_COLUMNS,
  APPLICATION_FILTER_FIELD_MAP,
  APPLICATION_SORT_FIELD_MAP,
  CURRENCY_SYMBOL_PARAM_CODE,
  LOCAL_CURRENCY_SYMBOL_KEY,
  normalizeListPayload,
  normalizeApplicationFilterValue,
  type ApplicationSettingDataTable,
  type ApplicationSettingDetailDataTable,
  type ApplicationSettingFormData,
  type DetailFormData
} from './components';


// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PageContent() {
  const { user } = useAuth();
  const { hasAnyPermission, isSuperAdmin } = usePermission();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApplicationSettingDataTable[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingApprovalRequests, setPendingApprovalRequests] = useState<any[]>([]);
  const canViewApplication = hasAnyPermission(['banking.setup.application.view', 'banking.setup.application.manage', 'banking.setup.application']);
  const canManageApplication = hasAnyPermission(['banking.setup.application.manage', 'banking.setup.application.create', 'banking.setup.application.update', 'banking.setup.application.delete']);
  
  // Explicit check for admin / superadmin for display setting
  const userRole = String(user?.role || user?.roles?.[0] || user?.userRole || '').toLowerCase();
  const isAdminOrSuperadmin = isSuperAdmin || userRole.includes('admin') || userRole.includes('superadmin');
  const canManageDisplaySetting = canManageApplication || isAdminOrSuperadmin;

  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);
  const { showCurrencySymbol } = useCurrencyDisplay();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [columnFilters, setColumnFilters] = useState({
    commonCode: '',
    description: '',
    value: '',
    createdBy: ''
  });
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const {
    queryState,
    setPaginationModel,
    setColumnVisibilityModel,
    setDensity,
    setColumnFilters: setEnterpriseColumnFilters,
    setSort,
    applySavedView,
    toSavedViewState,
    resetView,
  } = useEnterpriseTableQuery({
    pageKey: 'setup:application-parameters',
    paginationMode: 'offset',
    initialPageSize: 10,
    debounceMs: 0,
    syncUrl: true,
  });
  const savedView = useSavedTableView({
    userId: user?.id,
    scope: 'setup:application-parameters',
    enabled: Boolean(user?.id),
    onApplyView: (view) => {
      applySavedView(view);
      setSearchTerm(typeof view.state.search === 'string' ? view.state.search : '');
      const savedFilters = (view.state.filters ?? {}) as Record<string, unknown>;
      setColumnFilters({
        commonCode: typeof savedFilters.commonCode === 'string' ? savedFilters.commonCode : '',
        description: typeof savedFilters.description === 'string' ? savedFilters.description : '',
        value: typeof savedFilters.value === 'string' ? savedFilters.value : '',
        createdBy: typeof savedFilters.createdBy === 'string' ? savedFilters.createdBy : '',
      });
      setShowColumnFilters(
        Boolean(
          (typeof savedFilters.commonCode === 'string' && savedFilters.commonCode)
          || (typeof savedFilters.description === 'string' && savedFilters.description)
          || (typeof savedFilters.value === 'string' && savedFilters.value)
          || (typeof savedFilters.createdBy === 'string' && savedFilters.createdBy)
        )
      );
    },
  });

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<ApplicationSettingDataTable | null>(null);
  const [selectedDetail, setSelectedDetail] = useState<ApplicationSettingDetailDataTable | null>(null);
  const [approvalNotification, setApprovalNotification] = useState<ApprovalNotificationState>(createClosedApprovalNotification());
  const showApprovalConflict = (error: unknown, fallbackMessage: string) => {
    const notification = buildApprovalConflictNotification(error, fallbackMessage);
    if (!notification) return false;
    setApprovalNotification(notification);
    return true;
  };

  const [detailData, setDetailData] = useState<ApplicationSettingDetailDataTable[]>([]);

  const [detailDataForModal, setDetailDataForModal] = useState<ApplicationSettingDetailDataTable[]>([]); // To calculate next seq
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailFormData, setDetailFormData] = useState<DetailFormData>({
    ParamCode: '',
    SeqNo: 0,
    Value1: '',
    Value2: '',
    Value3: '',
    Description: ''
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [detailRefreshTrigger, setDetailRefreshTrigger] = useState(0);
  const [currencySettingLoading, setCurrencySettingLoading] = useState(false);
  const [currencySettingSaving, setCurrencySettingSaving] = useState(false);
  const [currencySymbolEnabled, setCurrencySymbolEnabled] = useState(true);
  const [currencySymbolDetailId, setCurrencySymbolDetailId] = useState<number | null>(null);
  const [currencySettingDirty, setCurrencySettingDirty] = useState(false);

  // Approval Modal State
  const [pendingChangesDialogOpen, setPendingChangesDialogOpen] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
  const [currentRecordForPending, setCurrentRecordForPending] = useState<any>(null);

  const deferredSearchTerm = useDeferredValue(searchTerm);
  const deferredHeaderFilters = useDeferredValue(columnFilters);
  const deferredGridFilters = useDeferredValue(queryState.columnFilters);
  const normalizedGridFilters = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(deferredGridFilters).map(([field, value]) => [
          APPLICATION_FILTER_FIELD_MAP[field] ?? field,
          value,
        ]),
      ),
    [deferredGridFilters],
  );
  const mergedServerFilters = useMemo(() => {
    const filters: Record<string, string> = {};
    if (deferredHeaderFilters.commonCode.trim()) filters.commonCode = deferredHeaderFilters.commonCode.trim();
    if (deferredHeaderFilters.description.trim()) filters.description = deferredHeaderFilters.description.trim();
    if (deferredHeaderFilters.value.trim()) filters.value = deferredHeaderFilters.value.trim();
    if (deferredHeaderFilters.createdBy.trim()) filters.createdBy = deferredHeaderFilters.createdBy.trim();

    Object.entries(normalizedGridFilters).forEach(([field, value]) => {
      const normalized = normalizeApplicationFilterValue(value).trim();
      if (normalized) filters[field] = normalized;
    });

    return filters;
  }, [deferredHeaderFilters, normalizedGridFilters]);

  const parseBooleanSetting = useCallback((raw: unknown, fallback = true) => {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw !== 'string') return fallback;
    const value = raw.trim().toLowerCase();
    if (!value) return fallback;
    return ['1', 'true', 'yes', 'y', 'on', 'aktif', 'active'].includes(value);
  }, []);

  const parseBooleanToken = useCallback((raw: unknown): boolean | null => {
    if (typeof raw === 'boolean') return raw;
    if (typeof raw !== 'string') return null;
    const value = raw.trim().toLowerCase();
    if (!value) return null;
    if (['1', 'true', 'yes', 'y', 'on', 'aktif', 'active'].includes(value)) return true;
    if (['0', 'false', 'no', 'n', 'off', 'nonaktif', 'inactive'].includes(value)) return false;
    return null;
  }, []);

  const sortDetailLatestFirst = useCallback((details: any[]) => (
    [...details].sort((a: any, b: any) => {
      const seqA = Number(a?.paramSeq ?? a?.param_seq ?? 0);
      const seqB = Number(b?.paramSeq ?? b?.param_seq ?? 0);
      if (seqA !== seqB) return seqB - seqA;
      const idA = Number(a?.pkid ?? a?.id ?? 0);
      const idB = Number(b?.pkid ?? b?.id ?? 0);
      return idB - idA;
    })
  ), []);

  const resolveCurrencySettingDetail = useCallback((details: any[], preferredPkid?: number | null) => {
    if (!Array.isArray(details) || details.length === 0) return null;
    const sorted = sortDetailLatestFirst(details);

    if (preferredPkid) {
      const preferred = sorted.find((d: any) => Number(d?.pkid ?? d?.id) === Number(preferredPkid));
      if (preferred) return preferred;
    }

    const withBooleanValue = sorted.find((d: any) =>
      parseBooleanToken(d?.value1) !== null
      || parseBooleanToken(d?.value2) !== null
      || parseBooleanToken(d?.value3) !== null
    );
    if (withBooleanValue) return withBooleanValue;

    const withCurrencyDesc = sorted.find((d: any) =>
      String(d?.paramdesc || d?.param_desc || '').toLowerCase().includes('currency symbol')
    );
    if (withCurrencyDesc) return withCurrencyDesc;

    return sorted[0];
  }, [parseBooleanToken, sortDetailLatestFirst]);

  const formatPreviewAmount = useCallback((value: number, currency: 'IDR' | 'USD', showSymbol: boolean) => {
    const locale = currency === 'IDR' ? 'id-ID' : 'en-US';
    const numberText = new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

    if (!showSymbol) return numberText;
    const prefix = currency === 'IDR' ? 'Rp ' : '$ ';
    return `${prefix}${numberText}`;
  }, []);

  const loadCurrencySymbolSetting = useCallback(async () => {
    try {
      setCurrencySettingLoading(true);
      const setting = await appSettingsApi.getByCode(CURRENCY_SYMBOL_PARAM_CODE);
      const details = Array.isArray(setting?.details) ? setting.details : [];
      const selectedDetail = resolveCurrencySettingDetail(details, currencySymbolDetailId);
      const boolFromValue1 = parseBooleanToken(selectedDetail?.value1);
      const boolFromValue2 = parseBooleanToken(selectedDetail?.value2);
      const boolFromValue3 = parseBooleanToken(selectedDetail?.value3);
      const resolvedValue = boolFromValue1
        ?? boolFromValue2
        ?? boolFromValue3
        ?? parseBooleanSetting(selectedDetail?.value1 ?? selectedDetail?.value2 ?? selectedDetail?.paramdesc ?? '', true);
      setCurrencySymbolEnabled(resolvedValue);
      setCurrencySymbolDetailId(selectedDetail?.id ?? null);
      setCurrencySettingDirty(false);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCAL_CURRENCY_SYMBOL_KEY, resolvedValue ? 'true' : 'false');
      }
    } catch (_error) {
      const localValue = typeof window !== 'undefined' ? window.localStorage.getItem(LOCAL_CURRENCY_SYMBOL_KEY) : null;
      const resolvedLocal = parseBooleanSetting(localValue, showCurrencySymbol);
      setCurrencySymbolEnabled(resolvedLocal);
      setCurrencySymbolDetailId(null);
      setCurrencySettingDirty(false);
    } finally {
      setCurrencySettingLoading(false);
    }
  }, [currencySymbolDetailId, parseBooleanSetting, parseBooleanToken, resolveCurrencySettingDetail, showCurrencySymbol]);

  useEffect(() => {
    if (canViewApplication) {
      void loadCurrencySymbolSetting();
    }
  }, [canViewApplication, loadCurrencySymbolSetting]);

  const saveCurrencySymbolSetting = useCallback(async () => {
    try {
      setCurrencySettingSaving(true);
      const nextValue = currencySymbolEnabled ? 'true' : 'false';
      const targetCode = CURRENCY_SYMBOL_PARAM_CODE;
      let setting: any = null;
      try {
        setting = await appSettingsApi.getByCode(targetCode);
      } catch {
        // Fallback: query list endpoint with targeted search
        try {
          const listResult = await api.applicationParameter.headers.getAll({
            search: targetCode,
            limit: 100,
            offset: 0,
            paginationMode: 'offset',
          });
          const rows = Array.isArray(listResult?.data)
            ? listResult.data
            : Array.isArray(listResult?.rows)
              ? listResult.rows
              : [];
          const matched = rows.find((item: any) =>
            String(item?.param_code || item?.paramCode || item?.CommonCode || '').toUpperCase() === targetCode
          );
          if (matched?.param_code || matched?.paramCode || matched?.CommonCode) {
            const code = String(matched?.param_code || matched?.paramCode || matched?.CommonCode).toUpperCase();
            setting = await appSettingsApi.getByCode(code);
          }
        } catch {
          // ignore lookup failures, handled below
        }
      }

      if (!setting) {
        throw new Error('Display setting header CURRDSPLY not found. Please contact admin to initialize Application Setting CURRDSPLY.');
      }

      const details = Array.isArray(setting?.details) ? setting.details : [];
      let selectedDetail = resolveCurrencySettingDetail(details, currencySymbolDetailId);
      if (!selectedDetail) {
        try {
          const detailResult = await api.applicationParameter.details.getForHeader(targetCode);
          const rawItems = normalizeListPayload<any>(detailResult?.data ?? detailResult);
          const mappedItems = rawItems.map((item: any) => ({
            pkid: item?.pkid ?? item?.id ?? item?.ID,
            paramSeq: item?.param_seq ?? item?.paramSeq ?? item?.SeqNo ?? 0,
            value1: item?.value1 ?? item?.Value1 ?? '',
            value2: item?.value2 ?? item?.Value2 ?? '',
            value3: item?.value3 ?? item?.Value3 ?? '',
            paramdesc: item?.param_desc ?? item?.paramdesc ?? item?.Description ?? '',
          }));
          selectedDetail = resolveCurrencySettingDetail(mappedItems, currencySymbolDetailId);
        } catch {
          // ignore fallback failure; creation path below will handle empty detail state
        }
      }
      const prioritized = sortDetailLatestFirst(details);

      if (selectedDetail?.id) {
        await appSettingsApi.updateDetail(selectedDetail.id, {
          value1: nextValue,
          value2: selectedDetail?.value2 || '',
          value3: selectedDetail?.value3 || '',
          paramdesc: 'Global currency symbol visibility toggle',
        });
      } else {
        await appSettingsApi.createDetail({
          paramCode: targetCode,
          value1: nextValue,
          value2: '',
          value3: '',
          paramdesc: 'Global currency symbol visibility toggle',
        });
      }

      invalidateAppSettingsCache(CURRENCY_SYMBOL_PARAM_CODE);
      // Verify persisted state from server to prevent UI drift/local-only illusion.
      const verifiedSetting = await appSettingsApi.getByCode(targetCode);
      const verifiedDetail = resolveCurrencySettingDetail(Array.isArray(verifiedSetting?.details) ? verifiedSetting.details : [], selectedDetail?.id ?? null);
      const verifiedBool = parseBooleanToken(verifiedDetail?.value1)
        ?? parseBooleanToken(verifiedDetail?.value2)
        ?? parseBooleanToken(verifiedDetail?.value3)
        ?? parseBooleanSetting(verifiedDetail?.value1 ?? verifiedDetail?.value2 ?? verifiedDetail?.paramdesc ?? '', true);

      if (verifiedBool !== currencySymbolEnabled) {
        throw new Error('Display setting was not persisted correctly. Please retry.');
      }

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LOCAL_CURRENCY_SYMBOL_KEY, nextValue);
      }
      window.dispatchEvent(new CustomEvent('currency-symbol-setting-changed', {
        detail: { showCurrencySymbol: currencySymbolEnabled },
      }));
      setCurrencySymbolEnabled(currencySymbolEnabled);
      setCurrencySymbolDetailId(verifiedDetail?.id ?? selectedDetail?.id ?? null);
      setCurrencySettingDirty(false);
      setSuccess('Display setting saved. Currency symbol updated globally.');
    } catch (err) {
      // Do not keep local-only success state; rollback to persisted backend/local value.
      setError(`Failed to save display setting: ${getErrorMessage(err, 'Unknown error')}`);
      await loadCurrencySymbolSetting();
    } finally {
      setCurrencySettingSaving(false);
    }
  }, [currencySymbolDetailId, currencySymbolEnabled, loadCurrencySymbolSetting, parseBooleanSetting, parseBooleanToken, resolveCurrencySettingDetail, sortDetailLatestFirst]);
  const normalizedSort = useMemo(
    () =>
      queryState.sort.map((item) => ({
        field: APPLICATION_SORT_FIELD_MAP[item.field] ?? item.field,
        direction: item.direction,
      })),
    [queryState.sort],
  );

  // Helper to re-fetch details for modal logic
  const fetchDetailsForModal = async (paramCode: string) => {
    try {
      const result = await api.applicationParameter.details.getForHeader(paramCode);
      const items = normalizeListPayload<any>(result?.data);
      if (result.success && items.length > 0) {
        setDetailDataForModal(items.map((item: any) => ({
          ID: item.id || item.pkid,
          SeqNo: item.param_seq,
          // other fields not strictly needed for sequence calc but good to have
          Value1: item.value1,
          Value2: item.value2,
          Value3: item.value3,
          Description: item.param_desc || item.paramdesc || item.Description,
          // compat
          pkid: item.pkid,
          param_code: item.param_code,
          param_seq: item.param_seq,
          value1: item.value1,
          value2: item.value2,
          value3: item.value3,
          paramdesc: item.param_desc || item.paramdesc || item.Description
        })));
      }
    } catch (e) { console.error(e); }
  };

  const loadDetailData = async (paramCode: string) => {
    try {
      setDetailLoading(true);
      const result = await api.applicationParameter.details.getForHeader(paramCode);
      const items = normalizeListPayload<any>(result?.data);
      if (result.success && items.length > 0) {
        setDetailData(items.map((item: any) => ({
          ID: item.id || item.pkid,
          SeqNo: item.param_seq,
          Value1: item.value1,
          Value2: item.value2,
          Value3: item.value3,
          Description: item.param_desc || item.paramdesc || item.Description,
          pkid: item.pkid,
          param_code: item.param_code,
          param_seq: item.param_seq,
          value1: item.value1,
          value2: item.value2,
          value3: item.value3,
          paramdesc: item.param_desc || item.paramdesc || item.Description
        })));
      } else {
        setDetailData([]);
      }
    } catch (error) {
      console.error('Failed to load details:', error);
      setDetailData([]);
    } finally {
      setDetailLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.applicationParameter.headers.getAll({
        page: queryState.paginationModel.page + 1,
        offset: queryState.paginationModel.page * queryState.paginationModel.pageSize,
        limit: queryState.paginationModel.pageSize,
        search: deferredSearchTerm.trim() || undefined,
        filters: Object.keys(mergedServerFilters).length > 0 ? JSON.stringify(mergedServerFilters) : undefined,
        sort: normalizedSort.length > 0 ? JSON.stringify(normalizedSort) : undefined,
        paginationMode: 'offset',
      });
      const items = normalizeListPayload<any>(result?.data);
      if (result.success) {
        const transformedData: ApplicationSettingDataTable[] = items.map((item: any) => ({
          ID: item.ID || item.id || item.pkid,
          CommonCode: item.CommonCode || item.param_code || item.paramCode,
          Description: item.Description || item.param_name || item.paramName,
          Value: item.Value || item.param_usage || item.paramUsage || 'No details configured',
          ParamType: item.ParamType || item.param_type || item.paramType || 'S',
          CreatedBy: item.created_by || item.CreatedBy || item.createdby || 'SYSTEM',
          CreatedDate: item.created_date || item.CreatedDate || item.createddate,
          UpdatedBy: item.updated_by || item.UpdatedBy || item.updatedby,
          UpdatedDate: item.updated_date || item.UpdatedDate || item.updateddate,
          pkid: item.pkid || item.id || item.ID,
          param_code: item.CommonCode || item.param_code || item.paramCode,
          param_name: item.Description || item.param_name || item.paramName,
          param_usage: item.ParamUsage || item.param_usage || item.paramUsage,
          param_type: item.ParamType || item.param_type || item.paramType || 'A',
          createdby: item.created_by || item.createdby,
          createddate: item.created_date || item.createddate
        }));
        const appParams = transformedData.filter(item => item.CommonCode && (item.ParamType === 'S' || item.ParamType === 'A'));
        setTotalCount(result.pagination?.total ?? appParams.length);
        setData(appParams);
      } else {
        setData([]);
        setTotalCount(0);
      }
    } catch (error) {
      setData([]);
      setTotalCount(0);
      setError(`Failed to load data: ${handleAPIError(error).message}`);
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

  useEffect(() => { void loadData(); }, [loadData]);
  useEffect(() => { void loadPendingApprovals(); }, [loadPendingApprovals]);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadData(), loadPendingApprovals()]);
  }, [loadData, loadPendingApprovals]);

  const tableRows = useMemo(
    () => data.map((item) => {
      const pendingRequest = pendingApprovalRequests.find(
        (request: any) => request.entityType === 'parameter' && request.entityId === item.CommonCode,
      );

      return {
        ...item,
        approvalStatus: pendingRequest ? 'pending' : 'active',
        pendingRequest: pendingRequest || null,
      };
    }),
    [data, pendingApprovalRequests],
  );

  // CRUD Handlers
  const handleCreate = () => {
    if (!canManageApplication) return;
    setSelectedRecord(null);
    setCreateModalOpen(true);
  };

  const handleEdit = (row: ApplicationSettingDataTable) => {
    if (!canManageApplication) return;
    setSelectedRecord(row);
    setEditModalOpen(true);
  };

  const handleView = async (row: ApplicationSettingDataTable) => {
    setSelectedRecord(row);
    await loadDetailData(row.CommonCode);
    setViewModalOpen(true);
  };

  const handleDelete = async (row: ApplicationSettingDataTable) => {
    if (!canManageApplication) return;
    if (!confirm(`Are you sure you want to delete "${row.CommonCode}"?`)) return;
    try {
      setLoading(true);
      const result = await api.applicationParameter.headers.delete(row.CommonCode);
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
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationFormSave = async (formData: ApplicationSettingFormData) => {
    if (!canManageApplication) return;
    try {
      setLoading(true);
      const payload = {
        param_code: formData.ParamCode.trim().toUpperCase(),
        param_name: formData.ParamName.trim(),
        param_usage: formData.ParamUsage?.trim() || ''
      };

      if (selectedRecord) {
        const result = await api.applicationParameter.headers.update(selectedRecord.CommonCode, payload);
        if (result.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Update submitted for approval'));
        } else {
          setSuccess('Updated successfully');
        }
      } else {
        const result = await api.applicationParameter.headers.create(payload);
        if (result.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Creation submitted for approval'));
        } else {
          setSuccess('Created successfully');
        }
      }
      setCreateModalOpen(false);
      setEditModalOpen(false);
      await refreshAll();
    } catch (e) {
      if (!showApprovalConflict(e, 'Request submitted for approval')) {
        setError(handleAPIError(e).message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Detail CRUD
  const handleAddDetail = async (row: ApplicationSettingDataTable) => {
    if (!canManageApplication) return;
    setSelectedRecord(row);
    await fetchDetailsForModal(row.CommonCode);
    setSelectedDetail(null);
    setDetailModalOpen(true);
  };

  const handleEditDetail = (detail: ApplicationSettingDetailDataTable, row: ApplicationSettingDataTable) => {
    if (!canManageApplication) return;
    setSelectedRecord(row);
    setSelectedDetail(detail);
    setDetailModalOpen(true);
  };

  const handleDeleteDetail = async (detail: ApplicationSettingDetailDataTable, paramCode: string, refreshCallback: () => void) => {
    if (!canManageApplication) return;
    if (!confirm(`Delete detail sequence ${detail.SeqNo}?`)) return;
    try {
      const result = await api.applicationParameter.details.delete(detail.ID.toString());
      if (result?.approvalRequired) {
        setApprovalNotification(buildApprovalNotification(result, 'Detail deletion submitted for approval'));
      } else {
        setSuccess('Detail deleted');
      }
      refreshCallback(); // For ApplicationDetailPanel
      setDetailRefreshTrigger(prev => prev + 1); // For other panels if needed
      if (selectedRecord) loadDetailData(selectedRecord.CommonCode); // For View Dialog
      await loadPendingApprovals();

    } catch (e) {
      if (!showApprovalConflict(e, 'Detail deletion submitted for approval')) {
        setError(handleAPIError(e).message);
      }
    }
  }
  const handleResetFilters = useCallback(async () => {
    setSearchTerm('');
    setColumnFilters({ commonCode: '', description: '', value: '', createdBy: '' });
    setShowColumnFilters(false);
    resetView();
    setPaginationModel({ page: 0, pageSize: queryState.paginationModel.pageSize });
    if (savedView.hasSavedView) {
      await savedView.clearSavedView();
    }
    setSuccess('Application table view reset');
  }, [queryState.paginationModel.pageSize, resetView, savedView, setPaginationModel]);

  const handleSaveView = useCallback(async () => {
    if (!user?.id) return;
    await savedView.saveDefaultView({
      ...toSavedViewState(),
      search: searchTerm,
      filters: {
        ...toSavedViewState().filters,
        commonCode: columnFilters.commonCode,
        description: columnFilters.description,
        value: columnFilters.value,
        createdBy: columnFilters.createdBy,
      },
    });
    setSuccess('Application table view saved');
  }, [columnFilters.commonCode, columnFilters.createdBy, columnFilters.description, columnFilters.value, savedView, searchTerm, toSavedViewState, user?.id]);

  const handleExport = useCallback((format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      const exportColumns = APPLICATION_EXPORT_COLUMNS.filter(
        (column) => queryState.columnVisibilityModel[column.field] !== false,
      );
      const exportFilters: Record<string, string> = {};
      if (searchTerm) exportFilters.Search = searchTerm;
      if (columnFilters.commonCode) exportFilters['Code'] = columnFilters.commonCode;
      if (columnFilters.description) exportFilters['Description'] = columnFilters.description;
      if (columnFilters.value) exportFilters['Value'] = columnFilters.value;
      if (columnFilters.createdBy) exportFilters['Created By'] = columnFilters.createdBy;
      Object.entries(queryState.columnFilters).forEach(([field, value]) => {
        const normalizedValue = normalizeApplicationFilterValue(value);
        if (normalizedValue.trim()) exportFilters[`Column: ${field}`] = normalizedValue;
      });
      if (queryState.sort[0]) {
        exportFilters.Sort = `${queryState.sort[0].field} (${queryState.sort[0].direction})`;
      }

      const exportOptions = {
        title: 'Application Settings',
        filename: 'application_settings',
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

      setSuccess(`Exported ${tableRows.length} application settings to ${format.toUpperCase()}`);
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to export application settings'));
    }
  }, [columnFilters.commonCode, columnFilters.createdBy, columnFilters.description, columnFilters.value, queryState.columnFilters, queryState.columnVisibilityModel, queryState.sort, searchTerm, tableRows]);

  // Detail CRUD Operations
  const handleCreateDetail = () => {
    if (!canManageApplication) return;
    if (!selectedRecord) return;

    setSelectedDetail(null);
    setDetailFormData({
      ParamCode: selectedRecord.CommonCode,
      SeqNo: detailData.length + 1,
      Value1: '',
      Value2: '',
      Value3: '',
      Description: ''
    });
    setDetailModalOpen(true);
  };

  const handleDetailFormSave = async (formData: DetailFormData) => {
    if (!canManageApplication) return;
    if (!selectedRecord) return;
    try {
      setDetailLoading(true);

      // Client-side duplicate check
      const isDuplicateSeq = detailDataForModal.some(d =>
        d.SeqNo === formData.SeqNo &&
        (!selectedDetail || d.ID !== selectedDetail.ID)
      );

      if (isDuplicateSeq) {
        setError('Sequence already exists');
        setDetailLoading(false);
        return;
      }

      const payload = {
        param_seq: formData.SeqNo,
        value1: formData.Value1.trim(),
        value2: formData.Value2?.trim() || '',
        value3: formData.Value3?.trim() || '',
        paramdesc: formData.Description?.trim() || ''
      };

      if (selectedDetail) {
        const result = await api.applicationParameter.details.update(selectedDetail.ID.toString(), payload);
        if (result?.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Detail update submitted for approval'));
        } else {
          setSuccess('Detail updated successfully');
        }
      } else {
        const result = await api.applicationParameter.details.create(selectedRecord.CommonCode, payload);
        if (result?.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(result, 'Detail creation submitted for approval'));
        } else {
          setSuccess('Detail created successfully');
        }
      }
      setDetailModalOpen(false);
      setDetailRefreshTrigger(prev => prev + 1);
      // Force refresh of the grid - simpler to just let user re-expand or auto-refresh if we tracked expanded state
      // For now, the detail panel itself fetches on mount/update so we are good if we trigger a re-render or if the user collapses/expands
      await refreshAll(); // Keep parent list and pending approval badges in sync
    } catch (e) {
      if (!showApprovalConflict(e, 'Request submitted for approval')) {
        setError(handleAPIError(e).message);
      }
    } finally {
      setDetailLoading(false);
    }
  };

  // SafeDataGrid Columns
  const columns: GridColDef[] = [
    {
      field: 'CommonCode',
      headerName: 'Common Code',
      flex: 1,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{params.value}</Typography>
      )
    },
    { field: 'Description', headerName: 'Description', flex: 2 },
    { field: 'Value', headerName: 'Value', flex: 1 },
    { field: 'CreatedBy', headerName: 'Created By', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 140,
      renderCell: (p) => (
        <Box
          onClick={(e) => {
            if ((p.row as any).approvalStatus === 'pending') {
              e.stopPropagation();
              setSelectedPendingRequest((p.row as any).pendingRequest);
              setCurrentRecordForPending(p.row);
              setPendingChangesDialogOpen(true);
            }
          }}
          sx={{ cursor: (p.row as any).approvalStatus === 'pending' ? 'pointer' : 'default' }}
        >
          <ApprovalStatusBadge status={(p.row as any).approvalStatus || 'active'} size="small" />
        </Box>
      )
    },
    {
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      width: 160,
      getActions: (params: any) => [
        ...(canManageApplication ? [
        <SafeGridActionsCellItem
          key="edit"
          label="Edit"
          icon={<EditIcon color="primary" />}
          onClick={() => handleEdit(params.row)}
          data-testid="btn-edit-app-setting"
        />,
        <SafeGridActionsCellItem
          key="delete"
          label="Delete"
          icon={<DeleteIcon color="error" />}
          onClick={() => handleDelete(params.row)}
          data-testid="btn-delete-app-setting"
        />
      ] : [])
      ]
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ minWidth: 0 }}>
      {!canViewApplication && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view application settings.
        </Alert>
      )}
      <PageHeader title="Application Setting" />

      <DisplaySettingsCard
        currencySymbolEnabled={currencySymbolEnabled}
        setCurrencySymbolEnabled={setCurrencySymbolEnabled}
        currencySettingDirty={currencySettingDirty}
        setCurrencySettingDirty={setCurrencySettingDirty}
        canManageApplication={canManageDisplaySetting}
        currencySettingLoading={currencySettingLoading}
        currencySettingSaving={currencySettingSaving}
        saveCurrencySymbolSetting={saveCurrencySymbolSetting}
        formatPreviewAmount={formatPreviewAmount}
      />

      <Card sx={{ mb: 2, width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
        <CardContent>
          <ApplicationToolbar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showColumnFilters={showColumnFilters}
            setShowColumnFilters={setShowColumnFilters}
            columnFilters={columnFilters}
            setColumnFilters={setColumnFilters}
            pageSize={queryState.paginationModel.pageSize}
            setPaginationModel={setPaginationModel}
            loading={loading}
            hasData={tableRows.length > 0}
            handleCreate={handleCreate}
            handleExport={handleExport}
            handleResetFilters={handleResetFilters}
            handleSaveView={handleSaveView}
          />

          <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
            <SafeDataGrid
              rows={tableRows}
              columns={columns}
              responsiveMode="cards"
              getRowId={(row) => row.pkid || row.ID || row.CommonCode}
              loading={loading}
              rowCount={totalCount}
              paginationMode="offset"
              paginationModel={queryState.paginationModel}
              onPaginationModelChange={setPaginationModel}
              columnFilters={queryState.columnFilters}
              onColumnFiltersChange={setEnterpriseColumnFilters}
              sortModel={queryState.sort.map((item) => ({ field: item.field, sort: item.direction }))}
              onSortModelChange={(model) => {
                setSort(
                  model
                    .filter((item) => item.sort === 'asc' || item.sort === 'desc')
                    .map((item) => ({ field: item.field, direction: item.sort as 'asc' | 'desc' }))
                );
              }}
              columnVisibilityModel={queryState.columnVisibilityModel}
              onColumnVisibilityModelChange={setColumnVisibilityModel}
              density={queryState.density === 'dense' ? 'compact' : queryState.density}
              onDensityChange={setDensity}
              showEnterpriseControls
              onSaveView={handleSaveView}
              onResetView={handleResetFilters}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              getDetailPanelContent={(params) => (
                <ApplicationDetailPanel
                  row={params.row}
                  onEditDetail={handleEditDetail}
                  onDeleteDetail={handleDeleteDetail}
                  onAddDetail={handleAddDetail}
                  canManage={canManageApplication}
                  refreshTrigger={detailRefreshTrigger}
                />
              )}
              getDetailPanelHeight={() => 'auto'}
              sx={{
                minHeight: 400,
                width: '100%',
                maxWidth: '100%',
                '& .MuiDataGrid-main': { minHeight: 400 },
              }}
            />
          </Box>

        </CardContent>
      </Card>

      {/* Dialogs */}
      <ApplicationFormDialog
        open={createModalOpen || editModalOpen}
        onClose={() => { setCreateModalOpen(false); setEditModalOpen(false); }}
        onSave={handleApplicationFormSave}
        selectedRecord={selectedRecord}
        loading={loading}
      />

      {/* View Modal with Detail Table - matching legacy Detail.cshtml */}
      <ViewDetailDialog
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        selectedRecord={selectedRecord}
        detailData={detailData}
        detailLoading={detailLoading}
        canManageApplication={canManageApplication}
        handleCreateDetail={handleCreateDetail}
        loadDetailData={loadDetailData}
        setDetailLoading={setDetailLoading}
        setSelectedDetail={setSelectedDetail}
        setDetailFormData={setDetailFormData}
        setDetailModalOpen={setDetailModalOpen}
        setApprovalNotification={setApprovalNotification}
        setSuccess={setSuccess}
        setError={setError}
        showApprovalConflict={showApprovalConflict}
      />

      {/* Detail Create/Edit Modal - using memoized component for performance */}
      <DetailFormDialog
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onSave={handleDetailFormSave}
        selectedDetail={selectedDetail}
        parentParamCode={selectedRecord?.CommonCode || ''}
        nextSeqNo={detailDataForModal.length > 0 ? Math.max(...detailDataForModal.map(d => d.SeqNo)) + 1 : 1}
        loading={detailLoading}
      />

      <PendingChangesDialog
        open={pendingChangesDialogOpen}
        onClose={() => setPendingChangesDialogOpen(false)}
        request={selectedPendingRequest}
        currentData={currentRecordForPending}
        title={`Pending Changes for ${currentRecordForPending?.CommonCode}`}
      />

      <NotificationSnackbars
        success={success}
        setSuccess={setSuccess}
        error={error}
        setError={setError}
        approvalNotification={approvalNotification}
        setApprovalNotification={setApprovalNotification}
        canOpenApprovalInbox={canOpenApprovalInbox}
      />
    </Container>
  );
}
