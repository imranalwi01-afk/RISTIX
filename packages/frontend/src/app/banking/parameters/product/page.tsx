// packages/frontend/src/app/banking/parameters/product/page.tsx
// ============================================================================
// 🏷️ PRODUCT PARAMETER PAGE - SYNCHRONIZED & ENHANCED
// ============================================================================
// ✅ Feature Parity with Reference (Export, Layout, Dialogs)
// ✅ Enhanced with Dynamic Dropdowns from Target (B0001, B0002, B0003)
// ✅ Layout Optimized: Fits in single viewport (100vh)
// ✅ FIXED: "Runtime Error: _ref is not defined" by using SafeDataGrid
// ✅ FIXED: Form layout clean-up using CSS Grid (Box)
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Menu,
  MenuItem as MuiMenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Snackbar,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Checkbox,
  Grid // Keeping for legacy, but using Box grid for form
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Inventory as ProductIcon,
  FileDownload as DownloadIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { GridColDef, GridRowParams } from '@mui/x-data-grid';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, handleAPIError } from '@/services/api';
import { exportToXLSX, exportToCSV, exportToPDF, getCurrentUser } from '@/utils/exportUtils';

// Safe DataGrid to prevent bundling errors (_ref is not defined)
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

// Shared components
import PageHeader from '@/components/banking/shared/PageHeader';
import EmptyState from '@/components/banking/shared/EmptyState';
import { FullstackIndicator } from '@/components/common/feedback/FullstackIndicator';
import ModernLoader from '@/components/common/ModernLoader';

// ============================================================================
// INTERFACES - Match FRS9_PARAM_PRODUCT specification
// ============================================================================

interface ProductParameter {
  pkid: number;
  dataSource?: string;
  prdGroup?: string;
  prdType?: string;
  prdCode?: string;
  prdDesc?: string;
  currency?: string;
  amortizationType?: string;
  alFlag?: string;  // Instrument Class
  impairedFlag?: boolean;
  bmFlag?: boolean; // Below Market Flag
  expectedLife?: number;
  borrowingRate?: number;
  marketRate?: number;
  activeFlag?: boolean;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

interface ProductForm {
  dataSource: string;
  prdGroup: string;
  prdType: string;
  prdCode: string;
  prdDesc: string;
  currency: string;
  amortizationType: string;
  alFlag: string;
  impairedFlag: boolean;
  bmFlag: boolean;
  expectedLife: number | '';
  borrowingRate: number | '';
  marketRate: number | '';
  activeFlag: boolean;
}

// ============================================================================
// CONSTANTS & OPTIONS base
// ============================================================================

const DATA_SOURCE_OPTIONS = [
  { id: 'CORE', name: 'Core Banking' },
  { id: 'LOS', name: 'Loan Origination System' },
  { id: 'CBS', name: 'Central Banking System' },
  { id: 'MANUAL', name: 'Manual Entry' },
];

const PRODUCT_GROUP_OPTIONS = [
  { id: 'LOAN', name: 'Loans' },
  { id: 'DEPOSIT', name: 'Deposits' },
  { id: 'INVESTMENT', name: 'Investments' },
  { id: 'TRADE', name: 'Trade Finance' },
];

const PRODUCT_TYPE_OPTIONS = [
  // Loan Products
  { id: 'CONSUMER', name: 'Consumer Loan' },
  { id: 'COMMERCIAL', name: 'Commercial Loan' },
  { id: 'MORTGAGE', name: 'Mortgage / Housing Loan' },
  { id: 'CREDIT_CARD', name: 'Credit Card' },
  { id: 'OVERDRAFT', name: 'Overdraft' },
  // Deposit Products
  { id: 'TERM_DEPOSIT', name: 'Term Deposit' },
  { id: 'SAVINGS', name: 'Savings Account' },
  { id: 'CURRENT', name: 'Current Account' },
  // Investment Products
  { id: 'MUTUAL_FUND', name: 'Mutual Fund' },
  { id: 'BONDS', name: 'Bonds' },
  // Trade Finance
  { id: 'LC', name: 'Letter of Credit' },
];

export default function ProductParametersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeFromUrl = searchParams.get('mode') || 'conventional';
  
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProductParameter[]>([]);
  const [filteredData, setFilteredData] = useState<ProductParameter[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductParameter | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);

  // Dynamic Options States (Enhanced from Target)
  const [currencyOptions, setCurrencyOptions] = useState<Array<{ id: string, name: string }>>([
      { id: 'IDR', name: 'Indonesian Rupiah' },
      { id: 'USD', name: 'US Dollar' }
  ]);
  const [amortizationOptions, setAmortizationOptions] = useState<Array<{ id: string, name: string }>>([
      { id: 'EIR', name: 'Effective Interest Rate' },
      { id: 'SLM', name: 'Straight Line Method' }
  ]);
  const [instrumentClassOptions, setInstrumentClassOptions] = useState<Array<{ id: string, name: string }>>([
      { id: 'AC', name: 'Amortised Cost' },
      { id: 'FVTPL', name: 'Fair Value through P&L' }
  ]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  const [formData, setFormData] = useState<ProductForm>({
    dataSource: '',
    prdGroup: '',
    prdType: '',
    prdCode: '',
    prdDesc: '',
    currency: '',
    amortizationType: '',
    alFlag: '',
    impairedFlag: false,
    bmFlag: false,
    expectedLife: '',
    borrowingRate: '',
    marketRate: '',
    activeFlag: true
  });

  // ============================================================================
  // LOAD DYNAMIC SETTINGS (From Target)
  // ============================================================================
  const loadBusinessSettings = async () => {
    try {
      console.log('🔍 Loading business settings for dynamic dropdowns...');
      const result = await api.banking.businessSetup.getAll();

      if (result.success && result.data) {
        // B0001: Currency
        const currencyParam = result.data.find((param: any) => param.param_code === 'B0001');
        if (currencyParam && currencyParam.details) {
          const currencies = currencyParam.details.map((detail: any) => ({
            id: detail.value1 || detail.param_value,
            name: detail.paramdesc || detail.value1
          }));
          setCurrencyOptions(currencies);
        }

        // B0002: Amortization
        const amortizationParam = result.data.find((param: any) => param.param_code === 'B0002');
        if (amortizationParam && amortizationParam.details) {
          const amortTypes = amortizationParam.details.map((detail: any) => ({
             id: detail.value1,
             name: detail.paramdesc || detail.value1
          }));
          setAmortizationOptions(amortTypes);
        }

        // B0003: Instrument Class
        const instrParam = result.data.find((param: any) => param.param_code === 'B0003');
        if (instrParam && instrParam.details) {
           const instrClasses = instrParam.details.map((detail: any) => ({
             id: detail.value1,
             name: detail.paramdesc || detail.value1
           }));
           setInstrumentClassOptions(instrClasses);
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load dynamic settings, using defaults.', error);
    }
  };

  // ============================================================================
  // DATAGRID COLUMNS
  // ============================================================================
  const columns: GridColDef[] = [
    {
      field: 'prdCode',
      headerName: 'Product Code',
      width: 130,
      renderCell: (params) => (
        <Chip label={params.value || '-'} color="primary" variant="outlined" size="small" />
      )
    },
    {
      field: 'prdDesc',
      headerName: 'Product Desc',
      width: 200,
      flex: 1
    },
    {
      field: 'dataSource',
      headerName: 'Data Source',
      width: 120
    },
    {
      field: 'prdGroup',
      headerName: 'Product Group',
      width: 120
    },
    {
      field: 'prdType',
      headerName: 'Product Type',
      width: 130
    },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 90,
      renderCell: (params) => (
        <Chip label={params.value || '-'} size="small" />
      )
    },
    {
      field: 'alFlag',
      headerName: 'Instrument',
      width: 130,
      renderCell: (params) => {
        const colors: Record<string, 'success' | 'warning' | 'error'> = {
          'AC': 'success',
          'FVOCI': 'warning',
          'FVTPL': 'error',
          'A': 'success',
          'L': 'warning'
        };
        // Handle both B0003 codes (AC/FV...) and simple A/L
        const map: any = { 'A': 'Asset', 'L': 'Liabilities' };
        const label = map[params.value] || params.value;
        return (
          <Chip 
            label={label || '-'} 
            color={colors[params.value] || 'default'} 
            size="small" 
          />
        );
      }
    },
    {
      field: 'amortizationType',
      headerName: 'Amortization',
      width: 100
    },
    {
      field: 'impairedFlag',
      headerName: 'Impaired',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'error' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'bmFlag',
      headerName: 'Below Mkt',
      width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          color={params.value ? 'warning' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'expectedLife',
      headerName: 'Exp. Life',
      width: 100,
      type: 'number'
    },
    {
      field: 'borrowingRate',
      headerName: 'Borrowing %',
      width: 100,
      renderCell: (params) => params.value ? `${params.value}%` : '-'
    },
    {
      field: 'marketRate',
      headerName: 'Market %',
      width: 90,
      renderCell: (params) => params.value ? `${params.value}%` : '-'
    },
    {
      field: 'activeFlag',
      headerName: 'Active',
      width: 80,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      )
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120, // Increased width for 3 icons
      getActions: (params: GridRowParams) => [
        <SafeGridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
          showInMenu={false}
          key="edit"
        />,
        <SafeGridActionsCellItem
          icon={<FilterIcon />}
          label="Clone"
          onClick={() => handleClone(params.row)}
          showInMenu={false}
          key="clone"
        />,
        <SafeGridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(params.row)}
          showInMenu={false}
          key="delete"
        />
      ]
    }
  ];

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Load Settings first
      await loadBusinessSettings();

      console.log(`🔄 Loading product parameters for mode: ${modeFromUrl}...`);
      
      // Try to load from API
      try {
        const result = await api.banking.productParameters?.getAll?.(modeFromUrl);
        console.log('📡 API Response:', result);

        if (result?.success && Array.isArray(result?.products)) {
          // Sort by PKID descending (Newest first)
          const sortedData = [...result.products].sort((a, b) => (b.pkid || 0) - (a.pkid || 0));
          setData(sortedData);
          setFilteredData(sortedData);
          console.log('✅ Loaded from API:', result.products.length, 'products');
          return;
        } else {
          console.warn('⚠️ API returned unsuccessful or invalid products structure:', result);
          if (result?.message) setError(result.message);
        }
      } catch (apiError: any) {
        console.error('❌ API Error:', apiError);
        const errorMessage = apiError.response?.data?.message || apiError.message || 'Unknown error';
        console.log('⚠️ API not available, using mock data as fallback. Error:', errorMessage);
        setError(`API Error: ${errorMessage}. Showing mock data for preview.`);
      }

      // Mock data for development (Fallback from Reference)
      // Only set mock data if it's really needed (e.g. in dev or if API threw)
      const mockData: ProductParameter[] = [
        {
          pkid: 1,
          dataSource: 'CORE',
          prdGroup: 'LOAN',
          prdType: 'CONSUMER',
          prdCode: 'KPR001',
          prdDesc: 'Consumer Housing Loan',
          currency: 'IDR',
          amortizationType: 'EIR',
          alFlag: 'AC',
          impairedFlag: false,
          bmFlag: false,
          expectedLife: 240,
          borrowingRate: 8.5,
          marketRate: 7.25,
          activeFlag: true
        }
      ];

      setData(mockData);
      setFilteredData(mockData);

    } catch (error: any) {
      console.error('❌ Failed to load:', error);
      setError('Failed to load product parameters');
      setData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
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

  const clearFilters = () => {
    setSearchTerm('');
    setFilterCurrency('');
    setFilterActive('all');
    setFilteredData(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterCurrency, filterActive, data]);

  // ============================================================================
  // CRUD HANDLERS
  // ============================================================================
  const handleCreate = () => {
    setSelectedProduct(null);
    setFormData({
      dataSource: DATA_SOURCE_OPTIONS[0].id,
      prdGroup: PRODUCT_GROUP_OPTIONS[0].id,
      prdType: PRODUCT_TYPE_OPTIONS[0].id,
      prdCode: '',
      prdDesc: '',
      currency: currencyOptions[0]?.id || 'IDR',
      amortizationType: amortizationOptions[0]?.id || 'EIR',
      alFlag: instrumentClassOptions[0]?.id || 'AC',
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
    setSelectedProduct(product);
    setFormData({
      dataSource: product.dataSource || DATA_SOURCE_OPTIONS[0].id,
      prdGroup: product.prdGroup || PRODUCT_GROUP_OPTIONS[0].id,
      prdType: product.prdType || PRODUCT_TYPE_OPTIONS[0].id,
      prdCode: product.prdCode || '',
      prdDesc: product.prdDesc || '',
      currency: product.currency || currencyOptions[0]?.id || 'IDR',
      amortizationType: product.amortizationType || amortizationOptions[0]?.id || 'EIR',
      alFlag: product.alFlag || instrumentClassOptions[0]?.id || 'AC',
      impairedFlag: product.impairedFlag ?? false,
      bmFlag: product.bmFlag ?? false,
      expectedLife: product.expectedLife ?? '',
      borrowingRate: product.borrowingRate ?? '',
      marketRate: product.marketRate ?? '',
      activeFlag: product.activeFlag ?? true
    });
    setDialogOpen(true);
  };

  const handleClone = (product: ProductParameter) => {
    setSelectedProduct(null);
    setFormData({
      dataSource: product.dataSource || DATA_SOURCE_OPTIONS[0].id,
      prdGroup: product.prdGroup || PRODUCT_GROUP_OPTIONS[0].id,
      prdType: product.prdType || '',
      prdCode: '',
      prdDesc: '',
      currency: product.currency || currencyOptions[0]?.id || 'IDR',
      amortizationType: product.amortizationType || amortizationOptions[0]?.id || 'EIR',
      alFlag: product.alFlag || instrumentClassOptions[0]?.id || 'AC',
      impairedFlag: product.impairedFlag ?? false,
      bmFlag: product.bmFlag ?? false,
      expectedLife: product.expectedLife ?? '',
      borrowingRate: product.borrowingRate ?? '',
      marketRate: product.marketRate ?? '',
      activeFlag: product.activeFlag ?? true
    });
    setDialogOpen(true);
    setSuccess('Cloning product - please enter new Code and Description');
  };

  const handleDelete = async (product: ProductParameter) => {
    if (!confirm(`Are you sure you want to delete product "${product.prdCode}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.banking.productParameters.delete(String(product.pkid));
      if (response.success) {
        setSuccess('Product deleted successfully');
        await loadData();
      } else {
        throw new Error(response.error || 'Failed to delete product');
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      setError(typeof error === 'string' ? error : (error.message || 'Failed to delete product'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const errors: string[] = [];
    
    if (!formData.dataSource) errors.push('Data Source is required');
    if (!formData.prdGroup) errors.push('Product Group is required');
    if (!formData.prdType) errors.push('Product Type is required');
    if (!formData.prdCode.trim()) errors.push('Product Code is required');
    if (!formData.prdDesc.trim()) errors.push('Product Description is required');
    if (!formData.currency) errors.push('Currency is required');
    if (!formData.alFlag) errors.push('Instrument Class is required');
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    // Duplicate Check
    const isDuplicate = data.some(p => 
      p.prdCode?.trim().toUpperCase() === formData.prdCode.trim().toUpperCase() && 
      (!selectedProduct || p.pkid !== selectedProduct.pkid)
    );

    if (isDuplicate) {
      setError(`Product Code '${formData.prdCode}' already exists.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        mode: modeFromUrl,
        dataSource: formData.dataSource,
        prdGroup: formData.prdGroup,
        prdType: formData.prdType,
        prdCode: formData.prdCode,
        prdDesc: formData.prdDesc,
        currency: formData.currency,
        amortizationType: formData.amortizationType || undefined,
        alFlag: formData.alFlag || undefined,
        impairedFlag: formData.impairedFlag,
        bmFlag: formData.bmFlag,
        expectedLife: formData.expectedLife === '' ? undefined : Number(formData.expectedLife),
        borrowingRate: formData.borrowingRate === '' ? undefined : Number(formData.borrowingRate),
        marketRate: formData.marketRate === '' ? undefined : Number(formData.marketRate),
        activeFlag: formData.activeFlag,
        createdby: 'SYSTEM'
      };

      console.log('🚀 Sending Save Payload:', payload);

      if (selectedProduct) {
        const response = await api.banking.productParameters.update(String(selectedProduct.pkid), payload);
        if (response.success) {
          setSuccess('Product updated successfully');
          setDialogOpen(false);
        } else throw new Error(response.error || 'Failed to update product');
      } else {
        const response = await api.banking.productParameters.create(payload);
        if (response.success) {
          setSuccess('Product created successfully');
          setDialogOpen(false);
        } else throw new Error(response.error || 'Failed to create product');
      }

      await loadData();
    } catch (error: any) {
      console.error('Save error:', error);
      const errorData = error?.response?.data;
      let errorMsg = errorData?.message || errorData?.error || error.message || 'Failed to save product';
      
      if (errorData?.details && Array.isArray(errorData.details)) {
        // Handle backend z.path format
        const details = errorData.details.map((d: any) => `${d.path || d.field || 'unknown'}: ${d.message}`).join('; ');
        errorMsg += ` [Details: ${details}]`;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') return;
    setSuccess(null);
    setError(null);
  };

  // ============================================================================
  // EXPORT HANDLERS
  // ============================================================================
  const handleExport = (format: 'xlsx' | 'csv' | 'pdf') => {
    try {
      setExportMenuAnchor(null);
      const exportColumns = columns
        .filter(col => col.field !== 'actions')
        .map(col => ({ field: col.field, headerName: col.headerName || col.field }));
      
      const filters: Record<string, any> = {};
      if (searchTerm) filters['Search'] = searchTerm;
      if (filterCurrency) filters['Currency'] = filterCurrency;
      if (filterActive !== 'all') filters['Active'] = filterActive;
      
      const exportOptions = {
        title: 'Product Parameters',
        filters,
        confidential: true
      };
      
      const dataToExport = filteredData.length > 0 ? filteredData : data;
      
      let result;
      switch (format) {
        case 'xlsx': result = exportToXLSX(dataToExport, exportColumns, exportOptions); break;
        case 'csv': result = exportToCSV(dataToExport, exportColumns, exportOptions); break;
        case 'pdf': result = exportToPDF(dataToExport, exportColumns, exportOptions); break;
      }
      
      if (result && result.success) setSuccess(`Exported to ${format.toUpperCase()}`);
      else setError(`Failed to export to ${format.toUpperCase()}`);
    } catch (error: any) {
      setError(`Export failed: ${error.message}`);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <ModernLoader 
        open={loading} 
        message="Loading Product Parameters" 
        subMessage="Retrieving product configuration data..." 
      />
      <FullstackIndicator />
      
      <PageHeader
        title="Product Parameters"
        subtitle="FRS9_PARAM_PRODUCT - Product configuration for IFRS9 calculations"
        onRefresh={loadData}
        loading={loading}
        extraActions={(<Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              disabled={loading || data.length === 0}
            >
              Export
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
              disabled={loading}
            >
              Add Product
            </Button>
          </Box>
        )}
      />

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MuiMenuItem onClick={() => handleExport('xlsx')}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export to Excel (XLSX)</ListItemText>
        </MuiMenuItem>
        <MuiMenuItem onClick={() => handleExport('csv')}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export to CSV</ListItemText>
        </MuiMenuItem>
        <Divider />
        <MuiMenuItem onClick={() => handleExport('pdf')}>
          <ListItemIcon><DownloadIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Export to PDF</ListItemText>
        </MuiMenuItem>
      </Menu>

      {/* Filter Card */}
      <Card sx={{ mb: 2, flexShrink: 0 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              placeholder="Search by Code, Description, Group or Type"
              variant="outlined"
              size="small"
              sx={{ flex: '1 1 300px', minWidth: 200 }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Currency</InputLabel>
              <Select
                value={filterCurrency}
                onChange={(e) => setFilterCurrency(e.target.value)}
                label="Currency"
              >
                <MenuItem value="">All</MenuItem>
                {currencyOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name || option.id}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" size="small" onClick={clearFilters} startIcon={<ClearIcon />}>Clear</Button>
            </Box>
          </Box>

          {filteredData.length !== data.length && (
            <Box sx={{ mt: 2 }}>
              <Chip label={`Showing ${filteredData.length} of ${data.length} records`} color="primary" variant="outlined" size="small" />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Data Grid */}
      <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: 1, p: 0, '&:last-child': { pb: 0 } }}>
          <Box sx={{ height: 'calc(100vh - 280px)', width: '100%', minHeight: 400 }}>
            <SafeDataGrid
              rows={filteredData}
              columns={columns}
              getRowId={(row) => row?.pkid || `row_${Math.random()}`}
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 10 } }
              }}
              disableRowSelectionOnClick
              loading={loading}
              sx={{
                '& .MuiDataGrid-columnHeaders': {
                  bgcolor: '#f5f5f5',
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ProductIcon />
          {selectedProduct ? 'Edit Product Parameter' : 'Create Product Parameter'}
        </DialogTitle>
        <DialogContent>
           {/* Replaced legacy Grid with Box CSS Grid for reliable layout */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(12, 1fr)' }, 
            gap: 2,
            mt: 2 
          }}>
            {/* Row 1: Data Source, Product Group, Product Type */}
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <TextField
                label="Data Source *"
                select
                value={formData.dataSource}
                onChange={(e) => setFormData(prev => ({ ...prev, dataSource: e.target.value }))}
                fullWidth
                required
                size="small"
              >
                {DATA_SOURCE_OPTIONS.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <TextField
                label="Product Group *"
                select
                value={formData.prdGroup}
                onChange={(e) => setFormData(prev => ({ ...prev, prdGroup: e.target.value }))}
                fullWidth
                required
                size="small"
              >
                {PRODUCT_GROUP_OPTIONS.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <TextField
                label="Product Type *"
                select
                value={formData.prdType}
                onChange={(e) => setFormData(prev => ({ ...prev, prdType: e.target.value }))}
                fullWidth
                required
                size="small"
              >
                {PRODUCT_TYPE_OPTIONS.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Row 2: Product Code, Product Desc */}
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <TextField
                label="Product Code *"
                value={formData.prdCode}
                onChange={(e) => setFormData(prev => ({ ...prev, prdCode: e.target.value.toUpperCase() }))}
                fullWidth
                required
                size="small"
                inputProps={{ maxLength: 10 }}
                helperText="2-10 chars (A-Z, 0-9)"
              />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 8' } }}>
              <TextField
                label="Product Description"
                value={formData.prdDesc}
                onChange={(e) => setFormData(prev => ({ ...prev, prdDesc: e.target.value }))}
                fullWidth
                size="small"
                inputProps={{ maxLength: 255 }}
              />
            </Box>

            {/* Row 3: Dynamic Fields (B0001, B0002, B0003) */}
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <TextField
                label="Currency * (B0001)"
                select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                fullWidth
                required
                size="small"
              >
                {currencyOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name || option.id}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <TextField
                label="Amortization Type (B0002)"
                select
                value={formData.amortizationType}
                onChange={(e) => setFormData(prev => ({ ...prev, amortizationType: e.target.value }))}
                fullWidth
                size="small"
              >
                {amortizationOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name || option.id}</MenuItem>
                ))}
              </TextField>
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
              <TextField
                label="Instrument Class * (B0003)"
                select
                value={formData.alFlag}
                onChange={(e) => setFormData(prev => ({ ...prev, alFlag: e.target.value }))}
                fullWidth
                required
                size="small"
              >
                {instrumentClassOptions.map(option => (
                  <MenuItem key={option.id} value={option.id}>{option.name || option.id}</MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Row 4: Numerics */}
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                <TextField
                    label="Expected Life (m)"
                    type="number"
                    value={formData.expectedLife}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedLife: e.target.value ? Number(e.target.value) : '' }))}
                    fullWidth
                    size="small"
                />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                <TextField
                    label="Borrowing %"
                    type="number"
                    value={formData.borrowingRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, borrowingRate: e.target.value ? Number(e.target.value) : '' }))}
                    fullWidth
                    size="small"
                />
            </Box>
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 4' } }}>
                <TextField
                    label="Market %"
                    type="number"
                    value={formData.marketRate}
                    onChange={(e) => setFormData(prev => ({ ...prev, marketRate: e.target.value ? Number(e.target.value) : '' }))}
                    fullWidth
                    size="small"
                />
            </Box>

            {/* Row 5: Flags */}
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 12' } }}>
              <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                Configuration Flags
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.impairedFlag}
                      onChange={(e) => setFormData(prev => ({ ...prev, impairedFlag: e.target.checked }))}
                    />
                  }
                  label="Impaired Flag"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.bmFlag}
                      onChange={(e) => setFormData(prev => ({ ...prev, bmFlag: e.target.checked }))}
                    />
                  }
                  label="Below Market Rate"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.activeFlag}
                      onChange={(e) => setFormData(prev => ({ ...prev, activeFlag: e.target.checked }))}
                    />
                  }
                  label="Is Active"
                />
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading}>
            {selectedProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar
        open={Boolean(success || error)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'} 
          sx={{ width: '100%', boxShadow: 3 }}
          variant="filled"
        >
          {success || error}
        </Alert>
      </Snackbar>
    </Container>
  );
}