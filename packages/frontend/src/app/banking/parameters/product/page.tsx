// packages/frontend/src/app/banking/parameters/product/page.tsx
// ============================================================================
// 🩹 SURGICAL FIX: Complete Product Parameters - Fixed Import Pattern
// ============================================================================
// ✅ FIXED: Import pattern now uses { api } - named export
// ✅ FIXED: Real API integration with standardized endpoints (camelCase)
// ✅ FIXED: Enhanced error handling and user feedback
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Snackbar,
  FormControlLabel,
  Switch
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { GridColDef, GridActionsCellItem, GridRowParams } from '@mui/x-data-grid';
import { api, handleAPIError } from '../../../../services/api';
import { useRouter } from 'next/navigation';

// Safe DataGrid wrapper to prevent bundling issues
import { SafeDataGrid } from '@/components/shared/SafeDataGrid';

// Shared components
import PageHeader from '@/components/banking/shared/PageHeader';
import EmptyState from '@/components/banking/shared/EmptyState';

// ✅ FIXED: Interface uses camelCase to match backend Drizzle schema
interface ProductParameter {
  pkid: number;
  dataSource: string;
  prdGroup: string;
  prdType: string;
  prdCode: string;
  prdDesc: string;
  currency: string;
  amortizationType?: string;
  alFlag?: string; // Maps to Instrument Class
  impairedFlag?: boolean;
  bmFlag?: boolean;
  expectedLife?: number;
  borrowingRate?: number;
  marketRate?: number;
  activeFlag: boolean;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

// ✅ FIXED: Form interface uses camelCase
interface ProductForm {
  dataSource: string;
  prdGroup: string;
  prdType: string;
  prdCode: string;
  prdDesc: string;
  currency: string;
  amortizationType: string;
  instrumentClass: string;  // Maps to alFlag
  impairedFlag: boolean;
  bmFlag: boolean;
  expectedLife: number | '';
  borrowingRate: number | '';
  marketRate: number | '';
  activeFlag: boolean;
}

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

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProductGroup, setFilterProductGroup] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filteredData, setFilteredData] = useState<ProductParameter[]>([]);

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
            label: detail.paramdesc // 'Asset' or 'Liabilities'
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

  const [formData, setFormData] = useState<ProductForm>({
    dataSource: 'Core System',
    prdGroup: 'Financing',
    prdType: 'Baru',
    prdCode: '',
    prdDesc: '',
    currency: 'IDR',
    amortizationType: 'EIR',
    instrumentClass: '',
    impairedFlag: false,
    bmFlag: false,
    expectedLife: '',
    borrowingRate: '',
    marketRate: '',
    activeFlag: true
  });

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

  const applyFilters = () => {
    let filtered = [...data];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.prdCode?.toLowerCase().includes(search) ||
        item.prdDesc?.toLowerCase().includes(search) ||
        item.prdGroup?.toLowerCase().includes(search) ||
        item.prdType?.toLowerCase().includes(search)
      );
    }

    if (filterProductGroup) {
      filtered = filtered.filter(item => item.prdGroup === filterProductGroup);
    }

    if (filterCurrency) {
      filtered = filtered.filter(item => item.currency === filterCurrency);
    }

    if (filterActive === 'active') {
      filtered = filtered.filter(item => item.activeFlag === true);
    } else if (filterActive === 'inactive') {
      filtered = filtered.filter(item => item.activeFlag === false);
    }

    setFilteredData(filtered);
  };

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
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEdit(params.row)}
            key="edit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
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

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterProductGroup, filterCurrency, filterActive, data]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setFormData({
      dataSource: 'Core System',
      prdGroup: 'Financing',
      prdType: 'Baru',
      prdCode: '',
      prdDesc: '',
      currency: 'IDR',
      amortizationType: 'EIR',
      instrumentClass: '',
      impairedFlag: false,
      bmFlag: false,
      expectedLife: '',
      borrowingRate: '',
      marketRate: '',
      activeFlag: true
    });
    setDialogOpen(true);
  };

  const handleEdit = (product: ProductParameter) => {
    console.log('✏️ Editing product:', product.prdCode);
    setSelectedProduct(product);
    setFormData({
      dataSource: product.dataSource || '',
      prdGroup: product.prdGroup || '',
      prdType: product.prdType || '',
      prdCode: product.prdCode || '',
      prdDesc: product.prdDesc || '',
      currency: product.currency || '',
      amortizationType: product.amortizationType || 'EIR',
      instrumentClass: product.alFlag || '',
      impairedFlag: Boolean(product.impairedFlag),
      bmFlag: Boolean(product.bmFlag),
      expectedLife: product.expectedLife || '',
      borrowingRate: product.borrowingRate || '',
      marketRate: product.marketRate || '',
      activeFlag: Boolean(product.activeFlag)
    });
    setDialogOpen(true);
  };

  const handleDelete = async (product: ProductParameter) => {
    if (!confirm(`Are you sure you want to delete product "${product.prdCode}"?`)) {
      return;
    }

    try {
      setLoading(true);
      console.log('🗑️ Deleting product:', product.prdCode);
      await api.banking.productParameters.delete(String(product.pkid));
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

  const handleSave = async () => {
    const errors: string[] = [];
    if (!formData.dataSource.trim()) errors.push('Data Source is required');
    if (!formData.prdGroup.trim()) errors.push('Product Group is required');
    if (!formData.prdType.trim()) errors.push('Product Type is required');
    if (!formData.prdCode.trim()) errors.push('Product Code is required');
    if (!formData.currency.trim()) errors.push('Currency is required');
    if (!formData.instrumentClass.trim()) errors.push('Instrument Class is required');

    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

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
        console.log('✏️ Updating product:', payload.prdCode);
        await api.banking.productParameters.update(String(selectedProduct.pkid), payload);
        setSuccess('Product updated successfully');
      } else {
        console.log('➕ Creating product:', payload.prdCode);
        await api.banking.productParameters.create(payload);
        setSuccess('Product created successfully');
      }

      setDialogOpen(false);
      await loadData();

    } catch (error: any) {
      console.error('❌ Failed to save product:', error);
      const errorInfo = handleAPIError(error);
      setError(`Failed to save product: ${errorInfo.message}`);
    } finally {
      setLoading(false);
    }
  };

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

      <Card>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          <SafeDataGrid<ProductParameter>
            rows={data}
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedProduct ? 'Edit Product Parameter' : 'Create Product Parameter'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2, mt: 2 }}>
            <TextField
              label="Data Source *"
              value={formData.dataSource}
              onChange={(e) => setFormData(prev => ({ ...prev, dataSource: e.target.value }))}
              fullWidth
              required
              slotProps={{ htmlInput: { maxLength: 20 } }}
              error={!formData.dataSource.trim()}
              helperText={!formData.dataSource.trim() && 'Data Source is required'}
            />
            <TextField
              label="Product Group *"
              value={formData.prdGroup}
              onChange={(e) => setFormData(prev => ({ ...prev, prdGroup: e.target.value }))}
              fullWidth
              required
              slotProps={{ htmlInput: { maxLength: 20 } }}
              error={!formData.prdGroup.trim()}
              helperText={!formData.prdGroup.trim() && 'Product Group is required'}
            />
            <TextField
              label="Product Type *"
              value={formData.prdType}
              onChange={(e) => setFormData(prev => ({ ...prev, prdType: e.target.value }))}
              fullWidth
              required
              slotProps={{ htmlInput: { maxLength: 20 } }}
              error={!formData.prdType.trim()}
              helperText={!formData.prdType.trim() && 'Product Type is required'}
            />
            <TextField
              label="Product Code *"
              value={formData.prdCode}
              onChange={(e) => setFormData(prev => ({ ...prev, prdCode: e.target.value }))}
              fullWidth
              required
              disabled={!!selectedProduct}
              slotProps={{ htmlInput: { maxLength: 20 } }}
              error={!formData.prdCode.trim()}
              helperText={!formData.prdCode.trim() && 'Product Code is required'}
            />
            <TextField
              label="Product Description"
              value={formData.prdDesc}
              onChange={(e) => setFormData(prev => ({ ...prev, prdDesc: e.target.value }))}
              fullWidth
              sx={{ gridColumn: 'span 2' }}
              slotProps={{ htmlInput: { maxLength: 255 } }}
            />
            <TextField
              label="Currency *"
              select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              fullWidth
              required
              error={!formData.currency.trim()}
              helperText={!formData.currency.trim() && 'Currency is required'}
            >
              {currencyOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Amortization Type"
              select
              value={formData.amortizationType}
              onChange={(e) => setFormData(prev => ({ ...prev, amortizationType: e.target.value }))}
              fullWidth
            >
              {amortizationOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Instrument Class *"
              select
              value={formData.instrumentClass}
              onChange={(e) => setFormData(prev => ({ ...prev, instrumentClass: e.target.value }))}
              fullWidth
              required
              error={!formData.instrumentClass.trim()}
              helperText={!formData.instrumentClass.trim() && 'Instrument Class is required'}
            >
              {instrumentClassOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField
              label="Expected Life"
              type="number"
              value={formData.expectedLife}
              onChange={(e) => setFormData(prev => ({ ...prev, expectedLife: e.target.value ? Number(e.target.value) : '' }))}
              fullWidth
            />
            <TextField
              label="Borrowing Rate"
              type="number"
              value={formData.borrowingRate}
              onChange={(e) => setFormData(prev => ({ ...prev, borrowingRate: e.target.value ? Number(e.target.value) : '' }))}
              fullWidth
              slotProps={{ htmlInput: { step: 0.001 } }}
            />
            <TextField
              label="Market Rate"
              type="number"
              value={formData.marketRate}
              onChange={(e) => setFormData(prev => ({ ...prev, marketRate: e.target.value ? Number(e.target.value) : '' }))}
              fullWidth
              slotProps={{ htmlInput: { step: 0.001 } }}
            />
            <Box sx={{ gridColumn: 'span 2', display: 'flex', gap: 2 }}>
              <FormControlLabel
                control={<Switch checked={formData.impairedFlag} onChange={(e) => setFormData(prev => ({ ...prev, impairedFlag: e.target.checked }))} />}
                label="Impaired Flag"
              />
              <FormControlLabel
                control={<Switch checked={formData.bmFlag} onChange={(e) => setFormData(prev => ({ ...prev, bmFlag: e.target.checked }))} />}
                label="BM Flag"
              />
              <FormControlLabel
                control={<Switch checked={formData.activeFlag} onChange={(e) => setFormData(prev => ({ ...prev, activeFlag: e.target.checked }))} />}
                label="Active"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>{selectedProduct ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)}>
        <Alert severity="success">{success}</Alert>
      </Snackbar>
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Container>
  );
}