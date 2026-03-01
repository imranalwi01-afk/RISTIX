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

// Modular Components
import PageHeader from '@/components/banking/shared/PageHeader';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';
import { PendingChangesDialog } from '@/components/approval';
import { usePermission } from '@/hooks/usePermission';
import ProductTable from './components/ProductTable';
import ProductDrawer from './components/ProductDrawer';
import ProductToolbar from './components/ProductToolbar';
import ProductFilterDrawer from './components/ProductFilterDrawer';


export default function ProductParametersPage() {
  const { hasAnyPermission } = usePermission();
  const canViewProduct = hasAnyPermission(['banking.parameter.product.view', 'banking.parameter.product.manage', 'banking.parameter.product', 'admin.super_admin']);
  const canManageProduct = hasAnyPermission(['banking.parameter.product.manage', 'banking.parameter.product.create', 'banking.parameter.product.update', 'banking.parameter.product.delete', 'admin.super_admin']);
  const canExportProduct = hasAnyPermission(['banking.parameter.product.export', 'banking.parameter.product.manage', 'admin.super_admin']);

  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'conventional';

  // State
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 25 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ currency: '', activeOnly: 'all', dataSource: '' });

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Approval Modal State
  const [pendingChangesDialogOpen, setPendingChangesDialogOpen] = useState(false);
  const [selectedPendingRequest, setSelectedPendingRequest] = useState<any>(null);
  const [currentRecordForPending, setCurrentRecordForPending] = useState<any>(null);

  // Options state - populated dynamically from business settings (B0001, B0002, B0003)
  // Starting as empty arrays; fallback defaults removed per tech spec requirement
  const [options, setOptions] = useState({
    dataSources: [] as { id: string; name: string }[],
    productGroups: [] as { id: string; name: string }[],
    productTypes: [] as { id: string; name: string }[],
    currencies: [] as { id: string; name: string }[],
    amortizationTypes: [] as { id: string; name: string }[],
    instrumentClasses: [] as { id: string; name: string }[],
  });

  // Data Loading
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.banking.productParameters.getAll(mode, {
        page: paginationModel.page + 1,
        limit: paginationModel.pageSize,
        search: searchTerm || undefined,
        currency: filters.currency || undefined,
        activeOnly: filters.activeOnly === 'all' ? undefined : (filters.activeOnly === 'active')
      });

      // Support both payload styles:
      // 1) { success: true, products, pagination }
      // 2) { success: true, data: { products, pagination } }
      const listPayload = result?.data && typeof result.data === 'object' ? result.data : result;
      const products = Array.isArray(listPayload?.products)
        ? listPayload.products
        : Array.isArray(listPayload?.data)
          ? listPayload.data
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
      setError(handleAPIError(err).message);
    } finally {
      setLoading(false);
    }
  }, [mode, paginationModel, searchTerm, filters]);

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

      if (businessRes?.success) {
        setOptions(prev => {
          // Extract B0001 (Currency) and B0002 (Amortization)
          const currencies = businessRows.find((p: any) => p.param_code === 'B0001')?.details?.map((d: any) => ({
            id: d.value1 || d.param_value,
            name: d.paramdesc || d.value1
          })) || prev.currencies;

          const amortMethods = businessRows.find((p: any) => p.param_code === 'B0002')?.details?.map((d: any) => ({
            id: d.value1,
            name: d.paramdesc || d.value1
          })) || prev.amortizationTypes;

          return {
            ...prev,
            currencies,
            amortizationTypes: amortMethods,
            instrumentClasses: instrumentRes?.success && instrumentRows.length > 0 ? instrumentRows : prev.instrumentClasses
          };
        });
      }
    } catch (err) {
      console.warn('Failed to load dynamic options', err);
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
    setDrawerOpen(true);
  };

  const handleClone = (product: any) => {
    if (!canManageProduct) return;
    setSelectedProduct({ ...product, pkid: undefined, _clone: true });
    setDrawerOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (!canManageProduct) return;
    setLoading(true);
    try {
      const payload = { ...formData, mode };
      const res = selectedProduct && !formData._clone
        ? await api.banking.productParameters.update(String(selectedProduct.pkid), payload)
        : await api.banking.productParameters.create(payload);

      if (res.success) {
        if (res.approvalRequired) {
          setSuccess(`${selectedProduct && !formData._clone ? 'Update' : 'Creation'} submitted for approval`);
        } else {
          setSuccess(`Product ${selectedProduct && !formData._clone ? 'updated' : 'created'} successfully`);
        }
        setDrawerOpen(false);
        loadData();
      } else {
        setError(res.message || 'Save failed');
      }
    } catch (err) {
      setError(handleAPIError(err).message);
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
          setSuccess('Deletion submitted for approval');
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

    if (exporter(data, cols, opts).success) setSuccess(`Exported to ${format.toUpperCase()}`);
    else setError('Export failed');
  };

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
        onSearchChange={setSearchTerm}
        onFilterClick={() => setFilterDrawerOpen(true)}
        onExportClick={(e) => setExportMenuAnchor(e.currentTarget)}
        onAddClick={() => { setSelectedProduct(null); setDrawerOpen(true); }}
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
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rowCount={rowCount}
          canManage={canManageProduct}
          onViewPending={(request, record) => {
            setSelectedPendingRequest(request);
            setCurrentRecordForPending(record);
            setPendingChangesDialogOpen(true);
          }}
        />
      </Box>

      {/* Overlays */}
      <ProductDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        initialData={selectedProduct}
        loading={loading}
        canManage={canManageProduct}
        options={options}
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
        onApply={setFilters}
        onClear={() => setFilters({ currency: '', activeOnly: 'all', dataSource: '' })}
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
    </Container>
  );
}
