'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { useSearchParams } from 'next/navigation';
import { api, handleAPIError, bankingAPI } from '@/services/api';
import { exportToXLSX, exportToCSV, exportToPDF } from '@/utils/exportUtils';
import { useAuth } from '@/providers/AuthProvider';
import { useEnterpriseTableQuery } from '@/hooks/useEnterpriseTableQuery';
import { useSavedTableView } from '@/hooks/useSavedTableView';

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

export default function ProductParametersPage() {
  const { user } = useAuth();
  const { hasAnyPermission } = usePermission();
  const canViewProduct = hasAnyPermission(['banking.parameter.product.view', 'banking.parameter.product.manage', 'banking.parameter.product', 'admin.super_admin']);
  const canManageProduct = hasAnyPermission(['banking.parameter.product.manage', 'banking.parameter.product.create', 'banking.parameter.product.update', 'banking.parameter.product.delete', 'admin.super_admin']);
  const canExportProduct = hasAnyPermission(['banking.parameter.product.export', 'banking.parameter.product.manage', 'admin.super_admin']);
  const canOpenApprovalInbox = hasAnyPermission(['approval.requests.approve', 'approval.all', 'admin.super_admin']);

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
    [filters.activeOnly, filters.currency, filters.dataSource, queryState.sort, searchTerm],
  );

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.banking.productParameters.getAll(
        mode,
        buildProductRequestParams(currentPage, currentPageSize),
      );

      // Support both payload styles:
      // 1) { success: true, products, pagination }
      // 2) { success: true, data: { products, pagination } }
      const listPayload = result?.data && typeof result.data === 'object' ? result.data : result;
      const products = Array.isArray(listPayload?.data)
        ? listPayload.data
        : Array.isArray(listPayload?.products)
          ? listPayload.products
          : [];
      const pagination = listPayload?.pagination ?? {};

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
        } catch (e) {
          console.warn('Failed to load pending approvals:', e);
          setData(products);
          setRowCount(Number(pagination.total ?? products.length ?? 0));
        }
      } else {
        setError(result?.message || 'Failed to load products');
      }
    } catch (err) {
      if (!showApprovalConflict(err, selectedProduct && !selectedProduct?._clone ? 'Update submitted for approval' : 'Creation submitted for approval')) {
        setError(handleAPIError(err).message);
      }
    } finally {
      setLoading(false);
    }
  }, [buildProductRequestParams, currentPage, currentPageSize, mode, selectedProduct, showApprovalConflict]);

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
      const firstPayload = firstPage?.data && typeof firstPage.data === 'object' ? firstPage.data : firstPage;
      const firstRows = Array.isArray(firstPayload?.data)
        ? firstPayload.data
        : Array.isArray(firstPayload?.products)
          ? firstPayload.products
          : [];
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
          const payload = pageResult?.data && typeof pageResult.data === 'object' ? pageResult.data : pageResult;
          if (Array.isArray(payload?.data)) return payload.data;
          return Array.isArray(payload?.products) ? payload.products : [];
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

  return (
    <Container maxWidth="xl" sx={{ py: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ModernLoader open={loading} message="Processing Product Data..." />
      <FullstackIndicator />
      {!canViewProduct && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You do not have permission to view product parameters.
        </Alert>
      )}

      <PageHeader
        title="Product Parameters"
        subtitle="Manage financial products and calculation parameters"
        onRefresh={loadData}
      />

      <ProductToolbar
        searchTerm={searchTerm}
        onSearchChange={(value) => {
          setSearchTerm(value);
          setPaginationModel({ page: 0, pageSize: currentPageSize });
        }}
        onFilterClick={() => setFilterDrawerOpen(true)}
        onExportClick={(e) => setExportMenuAnchor(e.currentTarget)}
        onAddClick={() => { setSelectedProduct(null); setFormOpen(true); }}
        onRefreshClick={loadData}
        loading={loading}
        activeFilterCount={activeFilterCount}
        canManage={canManageProduct}
        canExport={canExportProduct}
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
        instrumentClassOptions={toDropdownOptions(options.instrumentClasses)}
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
