// packages/frontend/src/app/banking/parameters/product/page.tsx
// ============================================================================
// 🩹 SURGICAL FIX: Complete Product Parameters - Fixed Import Pattern
// ============================================================================
// ✅ FIXED: Import pattern now uses { api } - named export
// ✅ FIXED: Real API integration with standardized endpoints (camelCase)
// ✅ FIXED: Enhanced error handling and user feedback
// ============================================================================

'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
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
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { api, handleAPIError } from '../../../../services/api';
import { useRouter } from 'next/navigation';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

// Shared components
import PageHeader from '@/components/banking/shared/PageHeader';
import EmptyState from '@/components/banking/shared/EmptyState';

// Extracted memoized dialog component
import {
  ProductFormDialog,
  type ProductParameter,
  type ProductFormData,
  type DropdownOption
} from './components';

import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';

export default function ProductParametersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductParameter[]>([]);
  const loadingRef = useRef(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductParameter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductGroup, setFilterProductGroup] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Combo box data
  const [currencyOptions, setCurrencyOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [amortizationOptions, setAmortizationOptions] = useState<Array<{ value: string, label: string }>>([]);
  const [instrumentClassOptions, setInstrumentClassOptions] = useState<Array<{ value: string, label: string }>>([]);

  // Load Business Settings combo box data
  const loadBusinessSettings = async () => {
    try {
      console.log('🔍 Loading business settings for combo boxes...');
      const result = await api.banking.businessSetup.getAll();

      if (result.success && result.data) {
        // Extract Currency options from B0001
        const currencyParam = result.data.find((param: any) => param.param_code === 'B0001');
        if (currencyParam && currencyParam.details) {
          const currencies = currencyParam.details.map((detail: any) => ({
            value: detail.value1 || detail.param_value,
            label: detail.paramdesc || detail.param_desc || detail.value1 || detail.param_value
          }));
          setCurrencyOptions(currencies);
        } else {
          setCurrencyOptions([
            { value: 'IDR', label: 'Indonesian Rupiah' },
            { value: 'USD', label: 'US Dollar' },
            { value: 'EUR', label: 'Euro' }
          ]);
        }

        // Amortization Type (B0002)
        const amortizationParam = result.data.find((param: any) => param.param_code === 'B0002');
        if (amortizationParam && amortizationParam.details) {
          console.log('✅ Found Dynamic Amortization Type options (B0002):', amortizationParam.details.length);
          const amortTypes = amortizationParam.details.map((detail: any) => ({
            value: detail.value1,
            label: detail.paramdesc || detail.value1
          }));
          setAmortizationOptions(amortTypes);
        } else {
          console.warn('⚠️ B0002 not found for Amortization Type, falling back to static list');
          setAmortizationOptions([
            { value: 'EIR', label: 'Effective Interest Rate' },
            { value: 'Straight', label: 'Straight Line' }
          ]);
        }

        // Extract Instrument Class options from B0003 (Dynamic DB-Driven)
        const instrParam = result.data.find((param: any) => param.param_code === 'B0003');
        if (instrParam && instrParam.details) {
          console.log('✅ Found Dynamic Instrument Class options (B0003):', instrParam.details.length);
          const instrClasses = instrParam.details.map((detail: any) => ({
            value: detail.value1, // 'A' or 'L'
            label: detail.param_desc || detail.paramdesc // 'Asset' or 'Liabilities'
          }));
          setInstrumentClassOptions(instrClasses);
        } else {
          // Fallback only if database fetch fails completely - this shouldn't happen now
          console.warn('⚠️ B0003 not found in response, falling back to static list');
          setInstrumentClassOptions([
            { value: 'A', label: 'Asset' },
            { value: 'L', label: 'Liabilities' }
          ]);
        }
      }
    } catch (error) {
      console.error('❌ Failed to load business settings for combo boxes:', error);
      // Fallbacks
      setCurrencyOptions([
        { value: 'ALL', label: 'ALL' },
        { value: 'IDR', label: 'Indonesian Rupiah' },
        { value: 'USD', label: 'US Dollar' },
        { value: 'EUR', label: 'Euro' }
      ]);
      setAmortizationOptions([
        { value: 'EIR', label: 'Effective Interest Rate' },
        { value: 'Straight', label: 'Straight Line' }
      ]);
      setInstrumentClassOptions([
        { value: 'A', label: 'Asset' },
        { value: 'L', label: 'Liabilities' }
      ]);
    }
  };



  const loadData = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Loading product parameters from real database...');
      const result = await api.banking.productParameters.getAll();

      if (result.success && result.data) {
        console.log('✅ Successfully loaded product data:', result.data.length, 'parameters');
        setData(result.data);
      } else {
        throw new Error(result.message || 'Failed to load product parameters');
      }

    } catch (error: any) {
      console.error('❌ Failed to load product parameters:', error);
      const errorInfo = handleAPIError(error);
      setError(errorInfo.message);
      setData([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  // Filtering logic consolidated into useMemo below

  // ============================================================================
  // DATAGRID COLUMNS CONFIGURATION
  // ============================================================================
  const columns: GridColDef<ProductParameter>[] = [
    {
      field: 'dataSource',
      headerName: 'Data Source',
      width: 150
    },
    {
      field: 'prdGroup',
      headerName: 'Product Group',
      width: 150
    },
    {
      field: 'prdType',
      headerName: 'Product Type',
      width: 150
    },
    {
      field: 'prdCode',
      headerName: 'Product Code',
      width: 150,
      renderCell: (params) => (
        <Chip label={params?.value || '-'} color="primary" variant="outlined" size="small" />
      )
    },
    {
      field: 'prdDesc',
      headerName: 'Product Desc',
      width: 250,
      flex: 1
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 100,
      renderCell: (params) => (
        <Chip label={params?.value || '-'} size="small" />
      )
    },
    {
      field: 'amortizationType',
      headerName: 'Amortization Type',
      width: 150,
      renderCell: (params) => params?.value || '-'
    },
    {
      field: 'alFlag',
      headerName: 'Instrument Class',
      width: 150,
      renderCell: (params) => {
        const map: any = { 'A': 'Asset', 'L': 'Liabilities' };
        return map[params?.value] || params?.value || '-';
      }
    },
    {
      field: 'impairedFlag',
      headerName: 'Impaired Flag',
      width: 120,
      type: 'boolean'
    },
    {
      field: 'bmFlag',
      headerName: 'Below Market Flag',
      width: 150,
      type: 'boolean'
    },
    {
      field: 'expectedLife',
      headerName: 'Expected Life',
      width: 120,
      type: 'number',
      renderCell: (params) => params?.value || '-'
    },
    {
      field: 'borrowingRate',
      headerName: 'Borrowing Rate',
      width: 130,
      type: 'number',
      renderCell: (params) =>
        params?.value ? `${(params.value * 100).toFixed(2)}%` : '-'
    },
    {
      field: 'marketRate',
      headerName: 'Market Rate',
      width: 130,
      type: 'number',
      renderCell: (params) =>
        params?.value ? `${(params.value * 100).toFixed(2)}%` : '-'
    },
    {
      field: 'activeFlag',
      headerName: 'Is Active',
      width: 100,
      type: 'boolean',
      renderCell: (params) => (
        <Chip
          label={params?.value ? 'Active' : 'Inactive'}
          color={params?.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params: GridRowParams) => {
        if (!params.row) return [];
        return [
          <SafeGridActionsCellItem
            icon={<EditIcon color="primary" />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
            key="edit"
          />,
          <SafeGridActionsCellItem
            icon={<DeleteIcon color="error" />}
            label="Delete"
            onClick={() => handleDelete(params.row)}
            key="delete"
          />
        ];
      }
    }
  ];

  useEffect(() => {
    loadData();
    loadBusinessSettings();
  }, []);

  useEffect(() => {
    if (dialogOpen) {
      loadBusinessSettings();
    }
  }, [dialogOpen]);

  // Filters are now handled by useMemo

  // Consolidatied Client-side filtering logic
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // 1. Search filter (unifies searchTerm and searchQuery)
    const query = (searchQuery || searchTerm).toLowerCase();
    if (query) {
      filtered = filtered.filter(item =>
        item.prdCode?.toLowerCase().includes(query) ||
        item.prdDesc?.toLowerCase().includes(query) ||
        item.prdGroup?.toLowerCase().includes(query) ||
        item.prdType?.toLowerCase().includes(query)
      );
    }

    // 2. Product Group filter
    if (filterProductGroup) {
      filtered = filtered.filter(item => item.prdGroup === filterProductGroup);
    }

    // 3. Currency filter
    if (filterCurrency) {
      filtered = filtered.filter(item => item.currency === filterCurrency);
    }

    // 4. Active filter
    if (filterActive === 'active') {
      filtered = filtered.filter(item => item.activeFlag === true);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(item => item.activeFlag === false);
    }

    return filtered;
  }, [data, searchQuery, searchTerm, filterProductGroup, filterCurrency, filterActive]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: ProductParameter) => {
    console.log('✏️ Editing product:', product.prdCode);
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (product: ProductParameter) => {
    if (!confirm(`Are you sure you want to delete product "${product.prdCode}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting product:', product.pkid || (product as any).id);
      // ✅ FIXED: Use numeric ID for new-backend
      await api.banking.productParameters.delete(String(product.pkid || (product as any).id));
      console.log('✅ Product deleted successfully');
      setSuccess('Product deleted successfully');
      await loadData();
    } catch (error: any) {
      console.error('❌ Failed to delete product:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to delete product: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Memoized callback to prevent dialog re-renders
  const handleSave = useCallback(async (formData: ProductFormData) => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        dataSource: formData.dataSource,
        prdGroup: formData.prdGroup,
        prdType: formData.prdType,
        prdCode: formData.prdCode.trim(),
        prdDesc: formData.prdDesc.trim(),
        currency: formData.currency,
        amortizationType: formData.amortizationType,
        alFlag: formData.instrumentClass,
        impairedFlag: formData.impairedFlag,
        bmFlag: formData.bmFlag,
        expectedLife: formData.expectedLife === '' ? undefined : Number(formData.expectedLife),
        borrowingRate: formData.borrowingRate === '' ? undefined : Number(formData.borrowingRate),
        marketRate: formData.marketRate === '' ? undefined : Number(formData.marketRate),
        activeFlag: formData.activeFlag
      };

      if (selectedProduct) {
        console.log('✏️ Updating product ID:', selectedProduct.pkid || (selectedProduct as any).id);
        // ✅ FIXED: Use numeric ID for new-backend
        await api.banking.productParameters.update(String(selectedProduct.pkid || (selectedProduct as any).id), payload);
        setSuccess('Product updated successfully');
      } else {
        console.log('➕ Creating product:', payload.prdCode);
        await api.banking.productParameters.create(payload);
        setSuccess('Product created successfully');
      }

      await loadData();
    } catch (error: any) {
      console.error('❌ Failed to save product:', error);
      throw error; // Rethrow so dialog can catch and show error
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, loadData]);

  // Memoized close handler
  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
  }, []);

  if (loading && data.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ position: 'relative' }}>
        <FullstackIndicator />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress size={48} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <PageHeader
        title="Product Parameters"
        subtitle="Banking product configuration and parameter management"
        onRefresh={loadData}
        loading={loading}
        extraActions={(
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            disabled={loading}
          >
            Add Product
          </Button>
        )}
      />

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              size="small"
              placeholder="Search product parameters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              fullWidth
              sx={{ maxWidth: 400 }}
              InputProps={{
                startAdornment: (
                  <Box component="span" sx={{ color: 'text.secondary', mr: 1, display: 'flex' }}>
                    🔍
                  </Box>
                )
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <SafeDataGrid<ProductParameter>
            rows={filteredData}
            columns={columns}
            getRowId={(row) => row.pkid}
            pageSizeOptions={[5, 10, 25, 50]}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } }
            }}
            disableRowSelectionOnClick
            loading={loading}
          />
        </CardContent>
      </Card>

      <ProductFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSave}
        product={selectedProduct}
        isExternalLoading={loading}
        currencyOptions={currencyOptions}
        amortizationOptions={amortizationOptions}
        instrumentClassOptions={instrumentClassOptions}
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