'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Container,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Download as DownloadIcon, ExpandMore as ExpandMoreIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import { api, handleAPIError, bankingAPI } from '@/services/api';
import { exportToXLSX, exportToCSV, exportToPDF } from '@/utils/exportUtils';
import { useAuth } from '@/providers/AuthProvider';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';
import type { EnterpriseColumnFilterValue, EnterpriseFilterDefinition } from '@/types/enterprise-table';

// Modular Components
import PageHeader from '@/components/banking/shared/PageHeader';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';
import {
  ApprovalNotification,
  PendingChangesDialog,
  buildApprovalConflictNotification,
  buildApprovalNotification,
  createClosedApprovalNotification,
  type ApprovalNotificationState,
} from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';
import ProductTable from './components/ProductTable';
import ProductFormDialog from './components/ProductFormDialog';
import ProductToolbar from './components/ProductToolbar';
import ProductFilterDrawer from './components/ProductFilterDrawer';

type SettingLocator = {
  preferredCodes: string[];
};

const PRODUCT_SETTING_LOCATORS: Record<
  'currency' | 'amortizationType' | 'instrumentClass' | 'dataSource' | 'productGroup' | 'productType',
  SettingLocator
> = {
  currency: { preferredCodes: ['B0001'] },
  amortizationType: { preferredCodes: ['B0002'] },
  instrumentClass: { preferredCodes: ['B0003'] },
  dataSource: { preferredCodes: ['B0028'] },
  productGroup: { preferredCodes: ['B0029'] },
  productType: { preferredCodes: ['B0030'] },
} as const;

type OptionItem = { id: string; name: string };
type ProductListDebug = {
  endpoint?: string;
  requestUrl?: string;
  selectedSource?: string;
  sourceTables?: string[];
  filtersApplied?: Record<string, unknown>;
  sqlPreview?: string;
  notes?: string[];
};

const getProductListPayload = (result: any) => {
  if (Array.isArray(result?.data)) return result;
  if (result?.data && typeof result.data === 'object') return result.data;
  return result;
};

const getProductRows = (payload: any) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.products)) return payload.products;
  if (Array.isArray(payload)) return payload;
  return [];
};

const normalizeCode = (value: unknown) => String(value ?? '').trim().toUpperCase();

const normalizeOption = (detail: any): OptionItem | null => {
  const idRaw = detail?.value1 ?? detail?.param_value ?? '';
  const id = String(idRaw ?? '').trim();
  if (!id) return null;

  const nameRaw = detail?.value2 ?? detail?.param_desc ?? detail?.paramdesc ?? id;
  const name = String(nameRaw ?? '').trim() || id;
  return { id, name };
};

const findBusinessSettingHeader = (rows: any[], locator: SettingLocator): any | undefined => {
  const codeSet = new Set(locator.preferredCodes.map(normalizeCode));
  return rows.find((row: any) => codeSet.has(normalizeCode(row?.param_code ?? row?.paramCode)));
};

const extractBusinessOptions = (rows: any[], locator: SettingLocator): OptionItem[] => {
  const header = findBusinessSettingHeader(rows, locator);
  const details = Array.isArray(header?.details) ? header.details : [];
  const mapped = details.map(normalizeOption).filter(Boolean) as OptionItem[];
  const unique = new Map<string, OptionItem>();
  mapped.forEach((option) => {
    unique.set(option.id, option);
  });
  return Array.from(unique.values());
};

const toDropdownOptions = (items: OptionItem[], withCodePrefix = false) =>
  items.map((item) => ({
    value: item.id,
    label: withCodePrefix ? `${item.id} - ${item.name}` : item.name,
  }));

const normalizeColumnFilterValue = (value: EnterpriseColumnFilterValue): unknown => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? value : undefined;
  }

  const cleaned = Object.fromEntries(
    Object.entries(value).filter(([, item]) => {
      if (item === null || item === undefined) return false;
      if (typeof item === 'string') return item.trim().length > 0;
      return true;
    }),
  );

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

const productColumnFilterDefinitions: Record<string, EnterpriseFilterDefinition> = {
  prdCode: { field: 'prdCode', label: 'Product Code', type: 'text' },
  prdDesc: { field: 'prdDesc', label: 'Description', type: 'text' },
  prdGroup: { field: 'prdGroup', label: 'Group', type: 'text' },
  prdType: { field: 'prdType', label: 'Type', type: 'text' },
  currency: { field: 'currency', label: 'Currency', type: 'text' },
  dataSource: { field: 'dataSource', label: 'Data Source', type: 'text' },
  activeFlag: {
    field: 'activeFlag',
    label: 'Active',
    type: 'enum',
    options: [
      { label: 'All', value: '' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
};

function ProductParametersPage() {
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission();
  const canViewProduct = hasAnyPermission(['banking.parameter.product.view']);
  const canManageProduct = hasAnyPermission(['banking.parameter.product.create', 'banking.parameter.product.update', 'banking.parameter.product.delete']);
  const canExportProduct = hasAnyPermission(['banking.parameter.product.export']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all']);

  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'conventional';

  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ currency: '', activeOnly: 'all', dataSource: '' });
  const {
    queryState,
    setPaginationModel,
    setColumnFilters,
    setColumnVisibilityModel,
    setDensity,
    applySavedView,
    toSavedViewState,
    resetView,
  } = useEnterpriseTableQuery({
    pageKey: 'banking:product-parameters',
    paginationMode: 'offset',
    initialPageSize: 25,
    syncUrl: true,
  });
  const savedView = useSavedTableView({
    userId: user?.id,
    scope: 'banking:product-parameters',
    enabled: Boolean(user?.id),
    onApplyView: (view) => {
      applySavedView(view);
      setSearchTerm(typeof view.state.search === 'string' ? view.state.search : '');
      const savedFilters = (view.state.filters ?? {}) as Record<string, unknown>;
      setFilters({
        currency: typeof savedFilters.currency === 'string' ? savedFilters.currency : '',
        activeOnly: typeof savedFilters.activeOnly === 'string' ? savedFilters.activeOnly : 'all',
        dataSource: typeof savedFilters.dataSource === 'string' ? savedFilters.dataSource : '',
      });
    },
  });

  const [formOpen, setFormOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [listDebug, setListDebug] = useState<ProductListDebug | null>(null);
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

  // Options state - populated dynamically from business settings
  const [options, setOptions] = useState({
    dataSources: [] as OptionItem[],
    productGroups: [] as OptionItem[],
    productTypes: [] as OptionItem[],
    currencies: [] as OptionItem[],
    amortizationTypes: [] as OptionItem[],
    instrumentClasses: [] as OptionItem[],
  });
  const currentPage = queryState.paginationModel.page;
  const currentPageSize = queryState.paginationModel.pageSize;

  const buildProductRequestParams = useCallback(
    (page: number, pageSize: number) => {
      const requestFilters: Record<string, unknown> = {};
      if (filters.currency) requestFilters.currency = filters.currency;
      if (filters.dataSource) requestFilters.dataSource = filters.dataSource;
      if (filters.activeOnly !== 'all') requestFilters.activeFlag = filters.activeOnly === 'active';
      Object.entries(queryState.columnFilters).forEach(([field, value]) => {
        const normalized = normalizeColumnFilterValue(value);
        if (normalized !== undefined) {
          requestFilters[field] = normalized;
        }
      });

      return {
        page: page + 1,
        offset: page * pageSize,
        limit: pageSize,
        paginationMode: 'offset' as const,
        search: searchTerm || undefined,
        currency: filters.currency || undefined,
        dataSource: filters.dataSource || undefined,
        activeOnly: filters.activeOnly === 'all' ? undefined : (filters.activeOnly === 'active'),
        filters: Object.keys(requestFilters).length > 0 ? JSON.stringify(requestFilters) : undefined,
        sort: queryState.sort.length > 0 ? JSON.stringify(queryState.sort) : undefined,
      };
    },
    [filters.activeOnly, filters.currency, filters.dataSource, queryState.columnFilters, queryState.sort, searchTerm],
  );

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.banking.productParameters.getAll(
        mode,
        buildProductRequestParams(currentPage, currentPageSize),
      );

      // Support legacy, nested, and list-contract payload styles.
      const listPayload = getProductListPayload(result);
      const products = getProductRows(listPayload);
      const pagination = listPayload?.pagination ?? {};
      const debug = listPayload?.meta?.debug ?? result?.meta?.debug ?? null;

      if (result?.success) {
        // Fetch pending approvals for product parameters
        try {
          const pendingRes = await bankingAPI.approval.getPendingApprovals();
          const pendingRequests = Array.isArray(pendingRes) ? pendingRes : (pendingRes as any).data || [];

          const mappedProducts = products.map((item: any) => {
            const pending = pendingRequests.find((r: any) => r.entityType === 'product_parameter' && r.entityId === item.prdCode);
            return {
              ...item,
              approvalStatus: pending ? 'pending' : 'active',
              pendingRequest: pending || null
            };
          });

          setData(mappedProducts);
          setRowCount(Number(pagination.total ?? products.length ?? 0));
          setListDebug(debug);
        } catch (e) {
          console.warn('Failed to load pending approvals:', e);
          setData(products);
          setRowCount(Number(pagination.total ?? products.length ?? 0));
          setListDebug(debug);
        }
      } else {
        setError(result?.message || 'Failed to load products');
      }
    } catch (err) {
      setError(handleAPIError(err).message);
      setListDebug(null);
    } finally {
      setLoading(false);
    }
  }, [buildProductRequestParams, currentPage, currentPageSize, mode]);

  const loadOptions = useCallback(async () => {
    try {
      const [businessRes, instrumentRes] = await Promise.all([
        api.banking.businessSetup.getAll(),
        api.banking.productParameters.getInstrumentClassOptions()
      ]);

      const businessPayload = businessRes?.data && typeof businessRes.data === 'object' ? businessRes.data : businessRes;
      const businessRows = Array.isArray(businessPayload?.data)
        ? businessPayload.data
        : Array.isArray(businessPayload)
          ? businessPayload
          : [];
      const instrumentPayload = instrumentRes?.data && typeof instrumentRes.data === 'object' ? instrumentRes.data : instrumentRes;
      const instrumentRows = Array.isArray(instrumentPayload?.data)
        ? instrumentPayload.data
        : Array.isArray(instrumentPayload)
          ? instrumentPayload
          : [];

      if (!businessRes?.success) {
        setOptions({
          dataSources: [],
          productGroups: [],
          productTypes: [],
          currencies: [],
          amortizationTypes: [],
          instrumentClasses: instrumentRes?.success && instrumentRows.length > 0 ? instrumentRows : [],
        });
        return;
      }

      const dataSources = extractBusinessOptions(businessRows, PRODUCT_SETTING_LOCATORS.dataSource);
      const productGroups = extractBusinessOptions(businessRows, PRODUCT_SETTING_LOCATORS.productGroup);
      const productTypes = extractBusinessOptions(businessRows, PRODUCT_SETTING_LOCATORS.productType);
      const currencies = extractBusinessOptions(businessRows, PRODUCT_SETTING_LOCATORS.currency);
      const amortizationTypes = extractBusinessOptions(businessRows, PRODUCT_SETTING_LOCATORS.amortizationType);
      const instrumentClassesFromBusiness = extractBusinessOptions(businessRows, PRODUCT_SETTING_LOCATORS.instrumentClass);

      setOptions({
        dataSources,
        productGroups,
        productTypes,
        currencies,
        amortizationTypes,
        instrumentClasses:
          instrumentRes?.success && instrumentRows.length > 0
            ? instrumentRows
            : instrumentClassesFromBusiness,
      });
    } catch (err) {
      console.warn('Failed to load dynamic options', err);
      setOptions({
        dataSources: [],
        productGroups: [],
        productTypes: [],
        currencies: [],
        amortizationTypes: [],
        instrumentClasses: [],
      });
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // Handlers
  const handleEdit = (product: any) => {
    if (!canManageProduct) return;
    setSelectedProduct(product);
    setFormOpen(true);
  };

  const handleClone = (product: any) => {
    if (!canManageProduct) return;
    setSelectedProduct({ ...product, pkid: undefined, _clone: true });
    setFormOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!canManageProduct) return;
    setLoading(true);
    try {
      const payload = { ...formData, mode };
      const isClone = Boolean(selectedProduct?._clone);
      const isEdit = Boolean(selectedProduct && !isClone);
      const res = isEdit
        ? await api.banking.productParameters.update(String(selectedProduct.pkid), payload)
        : await api.banking.productParameters.create(payload);

      if (res.success) {
        if (res.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(res, `${isEdit ? 'Update' : 'Creation'} submitted for approval`));
        } else {
          setSuccess(`Product ${isEdit ? 'updated' : 'created'} successfully`);
        }
        setFormOpen(false);
        setSelectedProduct(null);
        loadData();
      } else {
        setError(res.message || 'Save failed');
      }
    } catch (err) {
      if (!showApprovalConflict(err, `${selectedProduct && !selectedProduct?._clone ? 'Update' : 'Creation'} submitted for approval`)) {
        setError(handleAPIError(err).message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: any) => {
    if (!canManageProduct) return;
    if (!confirm(`Delete product "${product.prdCode}"?`)) return;
    setLoading(true);
    try {
      const res = await api.banking.productParameters.delete(String(product.pkid));
      if (res.success) {
        if (res.approvalRequired) {
          setApprovalNotification(buildApprovalNotification(res, 'Deletion submitted for approval'));
        } else {
          setSuccess('Product deleted successfully');
        }
        loadData();
      }
    } catch (err) {
      setError(handleAPIError(err).message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    if (!canExportProduct) return;
    setExportMenuAnchor(null);
    const cols = [
      { field: 'prdCode', headerName: 'Code' },
      { field: 'prdDesc', headerName: 'Description' },
      { field: 'prdGroup', headerName: 'Group' },
      { field: 'currency', headerName: 'Currency' },
      { field: 'activeFlag', headerName: 'Status' }
    ];

    const opts = { title: 'Product Parameters', confidential: true };
    const exporter = format === 'xlsx' ? exportToXLSX : format === 'csv' ? exportToCSV : exportToPDF;

    const fetchAllRows = async () => {
      const limit = 1000;
      const firstPage = await api.banking.productParameters.getAll(mode, buildProductRequestParams(0, limit));
      const firstPayload = getProductListPayload(firstPage);
      const firstRows = getProductRows(firstPayload);
      const totalPages = Math.max(1, Number(firstPayload?.pagination?.totalPages ?? 1));
      if (totalPages === 1) return firstRows;

      const restPages = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          api.banking.productParameters.getAll(mode, buildProductRequestParams(index + 1, limit))
        )
      );

      return [
        ...firstRows,
        ...restPages.flatMap((pageResult: any) => {
          const payload = getProductListPayload(pageResult);
          return getProductRows(payload);
        }),
      ];
    };

    void (async () => {
      try {
        const rows = await fetchAllRows();
        if (exporter(rows, cols, opts).success) setSuccess(`Exported to ${format.toUpperCase()}`);
        else setError('Export failed');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Export failed');
      }
    })();
  };

  const handleSaveView = useCallback(async () => {
    try {
      await savedView.saveDefaultView({
        ...toSavedViewState(),
        search: searchTerm,
        filters,
      });
      setSuccess('Product table view saved.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product table view.');
    }
  }, [filters, savedView, searchTerm, toSavedViewState]);

  const handleResetView = useCallback(async () => {
    try {
      await savedView.clearSavedView();
      resetView();
      setSearchTerm('');
      setFilters({ currency: '', activeOnly: 'all', dataSource: '' });
      setSuccess('Product table view cleared.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear product table view.');
    }
  }, [resetView, savedView]);

  // State calculations
  const activeFilterCount = Object.values(filters).filter(v => v !== '' && v !== 'all').length;
  const canSeeDebug = hasAnyPermission([]);

  const handleCopyDebug = useCallback(async () => {
    if (!listDebug || typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(JSON.stringify(listDebug, null, 2));
    setSuccess('Product debug copied.');
  }, [listDebug]);

  return (
    <Container maxWidth="xl" sx={{ py: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ModernLoader open={loading} message="Processing Product Data..." />
      <FullstackIndicator />
      {!canViewProduct && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view product parameters.
        </Alert>
      )}

      {canSeeDebug && listDebug && (
        <Accordion sx={{ mb: 2, borderRadius: 3, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" fontWeight={700}>Product Query Debug</Typography>
              {listDebug.selectedSource ? (
                <Chip size="small" variant="outlined" label={String(listDebug.selectedSource).replace(/^public\./, '')} />
              ) : null}
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'grid', gap: 1.5 }}>
              <Typography variant="body2"><strong>Endpoint:</strong> {listDebug.endpoint || '-'}</Typography>
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}><strong>Request URL:</strong> {listDebug.requestUrl || '-'}</Typography>
              <Typography variant="body2"><strong>Source Tables:</strong> {(listDebug.sourceTables || []).join(', ') || '-'}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}><strong>Filters Applied:</strong> {JSON.stringify(listDebug.filtersApplied || {}, null, 2)}</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}><strong>SQL Preview:</strong> {listDebug.sqlPreview || '-'}</Typography>
              {Array.isArray(listDebug.notes) && listDebug.notes.length > 0 ? (
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}><strong>Notes:</strong> {listDebug.notes.join(' ')}</Typography>
              ) : null}
              <Box>
                <MenuItem onClick={() => void handleCopyDebug()} sx={{ width: 'fit-content', pl: 0 }}>
                  <ListItemIcon><ContentCopyIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Copy Debug</ListItemText>
                </MenuItem>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      <PageHeader
        title="Product Parameters"
        subtitle="Manage financial products and calculation parameters"
        onRefresh={loadData}
        loading={loading}
        extraActions={
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canExportProduct && (
              <Button variant="outlined" startIcon={<DownloadIcon />} onClick={(e) => setExportMenuAnchor(e.currentTarget)} disabled={loading}>
                Export
              </Button>
            )}
            {canManageProduct && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedProduct(null); setFormOpen(true); }} disabled={loading}>
                Add Product
              </Button>
            )}
          </Box>
        }
      />

      <ProductToolbar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPaginationModel({ page: 0, pageSize: currentPageSize });
        }}
        onFilterClick={() => setFilterDrawerOpen(true)}
        loading={loading}
        activeFilterCount={activeFilterCount}
      />

      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ProductTable
          data={data}
          loading={loading}
          onEdit={handleEdit}
          onClone={handleClone}
          onDelete={handleDelete}
          paginationModel={queryState.paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          canManage={canManageProduct}
          columnFilters={queryState.columnFilters}
          onColumnFiltersChange={setColumnFilters}
          filterDefinitions={productColumnFilterDefinitions}
          columnVisibilityModel={queryState.columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          density={queryState.density}
          onDensityChange={setDensity}
          onSaveView={handleSaveView}
          onResetView={handleResetView}
          onViewPending={(request, record) => {
            setSelectedPendingRequest(request);
            setCurrentRecordForPending(record);
            setPendingChangesDialogOpen(true);
          }}
        />
      </Box>

      {/* Overlays */}
      <ProductFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedProduct(null);
        }}
        onSave={handleSave}
        product={selectedProduct}
        isExternalLoading={loading}
        dataSourceOptions={toDropdownOptions(options.dataSources)}
        productGroupOptions={toDropdownOptions(options.productGroups)}
        productTypeOptions={toDropdownOptions(options.productTypes)}
        currencyOptions={toDropdownOptions(options.currencies, true)}
        amortizationOptions={toDropdownOptions(options.amortizationTypes)}
        instrumentClassOptions={toDropdownOptions(options.instrumentClasses, true)}
      />

      <PendingChangesDialog
        open={pendingChangesDialogOpen}
        onClose={() => setPendingChangesDialogOpen(false)}
        request={selectedPendingRequest}
        currentData={currentRecordForPending}
        title={`Pending Changes for Product: ${currentRecordForPending?.prdCode}`}
      />

      <ProductFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        onApply={(nextFilters) => {
          setFilters(nextFilters);
          setPaginationModel({ page: 0, pageSize: currentPageSize });
        }}
        onClear={() => {
          setFilters({ currency: '', activeOnly: 'all', dataSource: '' });
          setPaginationModel({ page: 0, pageSize: currentPageSize });
        }}
        currentFilters={filters}
        options={{ currencies: options.currencies, dataSources: options.dataSources }}
      />

      <Menu anchorEl={exportMenuAnchor} open={canExportProduct && Boolean(exportMenuAnchor)} onClose={() => setExportMenuAnchor(null)}>
        <MenuItem onClick={() => handleExport('xlsx')}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export to Excel</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export to CSV</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export to PDF</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => { setError(null); setSuccess(null); }}
      >
        <Alert severity={error ? "error" : "success"} variant="filled">
          {error || success}
        </Alert>
      </Snackbar>
      <ApprovalNotification
        open={approvalNotification.open}
        message={approvalNotification.message}
        requestId={approvalNotification.requestId}
        actionLabel={canOpenApprovalInbox ? 'Open Approval' : undefined}
        actionHref={canOpenApprovalInbox ? (approvalNotification.requestId ? `/banking/maintenance/approval?requestId=${encodeURIComponent(approvalNotification.requestId)}` : '/banking/maintenance/approval') : undefined}
        onClose={() => setApprovalNotification(createClosedApprovalNotification())}
      />
    </Container>
  );
}

export default function ProductParametersPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <ProductParametersPage />
    </Suspense>
  );
}
