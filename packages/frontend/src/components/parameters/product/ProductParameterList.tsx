// packages/frontend/src/components/parameters/product/ProductParameterList.tsx
// ============================================================================
// 🔧 PROD-004: PRODUCT PARAMETER LIST - REACT ADMIN COMPONENT
// ============================================================================
// ✅ IMPLEMENTS: React Admin List component for Product Parameters
// ✅ PATTERN: React Admin v4 List with Material-UI v6 integration
// ✅ FEATURES: Filtering, sorting, pagination, bulk operations
// ✅ INTEGRATION: Product Parameter standalone CRUD API
// ============================================================================

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  BooleanField,
  NumberField,
  DateField,
  SearchInput,
  SelectInput,
  BooleanInput,
  FilterForm,
  FilterButton,
  CreateButton,
  ExportButton,
  TopToolbar,
  useListContext,
  EditButton,
  ShowButton,
  DeleteButton,
  BulkDeleteButton,
  BulkExportButton
} from 'react-admin';
import {
  Card,
  CardContent,
  Box,
  Chip,
  Typography,
  Stack,
  Tooltip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';

// ==========================================
// FILTER COMPONENTS
// ==========================================

const ProductParameterFilters = () => (
  <FilterForm>
    <SearchInput
      source="q"
      placeholder="Search by product code or description"
      alwaysOn
      sx={{ minWidth: 300 }}
    />
    <SelectInput
      source="prd_group"
      label="Product Group"
      choices={[
        { id: 'KREDIT', name: 'Kredit' },
        { id: 'DEPOSIT', name: 'Deposit' },
        { id: 'INVESTMENT', name: 'Investment' },
        { id: 'SERVICES', name: 'Services' }
      ]}
      allowEmpty
    />
    <SelectInput
      source="prd_type"
      label="Product Type"
      choices={[
        { id: 'KONSUMTIF', name: 'Konsumtif' },
        { id: 'KOMERSIAL', name: 'Komersial' },
        { id: 'MIKRO', name: 'Mikro' },
        { id: 'MORTGAGE', name: 'Mortgage' },
        { id: 'SYARIAH', name: 'Syariah' }
      ]}
      allowEmpty
    />
    <SelectInput
      source="currency"
      label="Currency"
      choices={[
        { id: 'IDR', name: 'IDR' },
        { id: 'USD', name: 'USD' },
        { id: 'EUR', name: 'EUR' },
        { id: 'SGD', name: 'SGD' }
      ]}
      allowEmpty
    />
    <BooleanInput
      source="active_only"
      label="Active Only"
      defaultValue={true}
    />
  </FilterForm>
);

// ==========================================
// CUSTOM FIELD COMPONENTS
// ==========================================

const ProductGroupField = ({ record }: any) => {
  if (!record?.prd_group) return null;
  
  const getGroupColor = (group: string) => {
    switch (group) {
      case 'KREDIT': return 'primary';
      case 'DEPOSIT': return 'success';
      case 'INVESTMENT': return 'warning';
      case 'SERVICES': return 'info';
      default: return 'default';
    }
  };

  return (
    <Chip 
      label={record.prd_group} 
      color={getGroupColor(record.prd_group)}
      size="small"
      variant="outlined"
    />
  );
};

const ProductTypeField = ({ record }: any) => {
  if (!record?.prd_type) return null;
  
  return (
    <Chip 
      label={record.prd_type} 
      color="secondary"
      size="small"
      variant="filled"
    />
  );
};

const RateField = ({ record, source }: any) => {
  const value = record?.[source];
  if (value == null) return null;
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <TrendingUpIcon fontSize="small" color="action" />
      <Typography variant="body2">
        {value.toFixed(2)}%
      </Typography>
    </Box>
  );
};

const ExpectedLifeField = ({ record }: any) => {
  const value = record?.expected_life;
  if (value == null) return null;
  
  const years = Math.floor(value / 12);
  const months = value % 12;
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <ScheduleIcon fontSize="small" color="action" />
      <Typography variant="body2">
        {years > 0 && `${years}y `}{months > 0 && `${months}m`}
      </Typography>
    </Box>
  );
};

const ActiveStatusField = ({ record }: any) => {
  const isActive = record?.active_flag;
  
  return (
    <Box display="flex" alignItems="center" gap={1}>
      {isActive ? (
        <CheckCircleIcon color="success" fontSize="small" />
      ) : (
        <CancelIcon color="error" fontSize="small" />
      )}
      <Typography variant="body2" color={isActive ? 'success.main' : 'error.main'}>
        {isActive ? 'Active' : 'Inactive'}
      </Typography>
    </Box>
  );
};

// ==========================================
// LIST ACTIONS
// ==========================================

const ProductParameterActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton 
      variant="contained" 
      label="Add Product Parameter" 
      sx={{ ml: 1 }} 
    />
    <ExportButton 
      variant="outlined" 
      label="Export" 
      sx={{ ml: 1 }} 
    />
  </TopToolbar>
);

const ProductParameterBulkActions = () => (
  <>
    <BulkExportButton />
    <BulkDeleteButton 
      confirmTitle="Delete Product Parameters"
      confirmContent="Are you sure you want to delete these product parameters? This action cannot be undone."
    />
  </>
);

// ==========================================
// EMPTY STATE COMPONENT
// ==========================================

const ProductParameterEmpty = () => {
  const { resource } = useListContext();
  
  return (
    <Card sx={{ mt: 2 }}>
      <CardContent sx={{ textAlign: 'center', py: 4 }}>
        <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          No Product Parameters Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Start by creating your first product parameter to define banking products for IFRS 9 calculations.
        </Typography>
        <CreateButton 
          variant="contained" 
          label="Create Product Parameter"
          resource={resource}
        />
      </CardContent>
    </Card>
  );
};

// ==========================================
// STATISTICS PANEL
// ==========================================

const ProductParameterStats = () => {
  const { data } = useListContext();
  
  if (!data || data.length === 0) return null;
  
  const totalProducts = data.length;
  const activeProducts = data.filter((item: any) => item.active_flag).length;
  const avgBorrowingRate = data
    .filter((item: any) => item.borrowing_rate != null)
    .reduce((acc: number, item: any) => acc + item.borrowing_rate, 0) / 
    data.filter((item: any) => item.borrowing_rate != null).length || 0;
  
  const avgExpectedLife = data
    .filter((item: any) => item.expected_life != null)
    .reduce((acc: number, item: any) => acc + item.expected_life, 0) / 
    data.filter((item: any) => item.expected_life != null).length || 0;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Product Parameter Statistics
        </Typography>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography variant="h4" color="primary">
              {totalProducts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Products
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="success.main">
              {activeProducts}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Products
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="warning.main">
              {avgBorrowingRate.toFixed(2)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg. Borrowing Rate
            </Typography>
          </Box>
          <Box>
            <Typography variant="h4" color="info.main">
              {Math.round(avgExpectedLife / 12)}y
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg. Expected Life
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

// ==========================================
// MAIN LIST COMPONENT
// ==========================================

export const ProductParameterList = () => (
  <List
    title="Product Parameters"
    filters={<ProductParameterFilters />}
    actions={<ProductParameterActions />}
    empty={<ProductParameterEmpty />}
    perPage={25}
    sort={{ field: 'prd_code', order: 'ASC' }}
    sx={{
      '& .RaList-content': {
        '& .RaList-main': {
          '& .MuiCard-root': {
            boxShadow: 1,
            borderRadius: 2
          }
        }
      }
    }}
  >
    <ProductParameterStats />
    <Datagrid
      bulkActionButtons={<ProductParameterBulkActions />}
      rowClick="show"
      sx={{
        '& .RaDatagrid-table': {
          '& .RaDatagrid-tbody': {
            '& .RaDatagrid-row': {
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }
          }
        }
      }}
    >
      <TextField 
        source="prd_code" 
        label="Product Code"
        sortable
        sx={{ fontWeight: 'bold' }}
      />
      <TextField 
        source="prd_desc" 
        label="Description"
        sortable
        sx={{ maxWidth: 200 }}
      />
      <ProductGroupField 
        source="prd_group" 
        label="Group"
        sortable
      />
      <ProductTypeField 
        source="prd_type" 
        label="Type"
        sortable
      />
      <TextField 
        source="currency" 
        label="Currency"
        sortable
      />
      <TextField 
        source="amortization_type" 
        label="Amortization"
        sortable
      />
      <RateField 
        source="borrowing_rate" 
        label="Borrowing Rate"
        sortable
      />
      <RateField 
        source="market_rate" 
        label="Market Rate"
        sortable
      />
      <ExpectedLifeField 
        source="expected_life" 
        label="Expected Life"
        sortable
      />
      <BooleanField 
        source="impaired_flag" 
        label="Impaired"
        sortable
      />
      <BooleanField 
        source="bm_flag" 
        label="BM Flag"
        sortable
      />
      <ActiveStatusField 
        source="active_flag" 
        label="Status"
        sortable
      />
      <DateField 
        source="createddate" 
        label="Created"
        sortable
        showTime
      />
      <TextField 
        source="createdby" 
        label="Created By"
        sortable
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Tooltip title="View Details">
          <ShowButton />
        </Tooltip>
        <Tooltip title="Edit Product">
          <EditButton />
        </Tooltip>
        <Tooltip title="Delete Product">
          <DeleteButton 
            confirmTitle="Delete Product Parameter"
            confirmContent="Are you sure you want to delete this product parameter? This action cannot be undone."
          />
        </Tooltip>
      </Box>
    </Datagrid>
  </List>
);

export default ProductParameterList;

console.log('✅ [PROD-004] ProductParameterList component loaded - React Admin List with Material-UI v6 integration');