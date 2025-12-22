// packages/frontend/src/admin/resources/banking/BankingProductResource.tsx
// Banking Products Resource for React Admin
// Comprehensive product management with dual banking support

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  BooleanField,
  Show,
  SimpleShowLayout,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  SelectInput,
  useRecordContext,
  FunctionField,
  EditButton,
  ShowButton,
  DeleteButton,
  Filter,
  SearchInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  useListContext
} from 'react-admin';
import {
  Chip,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack
} from '@mui/material';
import {
  AccountBalance as ProductIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon
} from '@mui/icons-material';

// Banking Type Indicator Component
const BankingTypeIndicator = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const isSyariah = record.product_code?.startsWith('SYR') || record.product_type?.includes('MURABAHA');
  
  return (
    <Chip
      label={isSyariah ? 'Syariah' : 'Conventional'}
      color={isSyariah ? 'secondary' : 'primary'}
      size="small"
      icon={isSyariah ? <StarIcon /> : <ProductIcon />}
      sx={{ 
        fontWeight: 'bold',
        backgroundColor: isSyariah ? '#e8f5e8' : '#e3f2fd',
        color: isSyariah ? '#2e7d32' : '#1565c0'
      }}
    />
  );
};

// Product Status Indicator
const ProductStatusIndicator = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };
  
  return (
    <Chip
      label={record.is_active ? 'Active' : 'Inactive'}
      color={getStatusColor(record.is_active)}
      size="small"
      variant={record.is_active ? 'filled' : 'outlined'}
    />
  );
};

// Interest Rate Indicator
const InterestRateIndicator = () => {
  const record = useRecordContext();
  if (!record) return null;
  
  const rate = Number(record.base_rate) || 0;
  const isHigh = rate > 10;
  
  return (
    <Box display="flex" alignItems="center" gap={0.5}>
      {isHigh ? <TrendingUpIcon color="error" fontSize="small" /> : <TrendingDownIcon color="success" fontSize="small" />}
      <Typography variant="body2" color={isHigh ? 'error.main' : 'success.main'}>
        {rate.toFixed(2)}%
      </Typography>
    </Box>
  );
};

// Product Filters
const ProductFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="q" placeholder="Search products..." alwaysOn />
    <SelectInput
      source="product_category"
      label="Product Category"
      choices={[
        { id: 'PERSONAL', name: 'Personal Banking' },
        { id: 'COMMERCIAL', name: 'Commercial Banking' },
        { id: 'CORPORATE', name: 'Corporate Banking' },
        { id: 'SME', name: 'SME Banking' },
        { id: 'ISLAMIC', name: 'Islamic Banking' },
      ]}
      emptyText="All Categories"
    />
    <SelectInput
      source="product_type"
      label="Product Type"
      choices={[
        { id: 'LOAN', name: 'Loan Products' },
        { id: 'DEPOSIT', name: 'Deposit Products' },
        { id: 'CARD', name: 'Card Products' },
        { id: 'INVESTMENT', name: 'Investment Products' },
        { id: 'MURABAHA', name: 'Murabaha' },
        { id: 'MUSHARAKA', name: 'Musharaka' },
        { id: 'MUDHARABA', name: 'Mudharaba' },
        { id: 'IJARAH', name: 'Ijarah' },
      ]}
      emptyText="All Types"
    />
    <BooleanInput source="is_active" label="Active Only" defaultValue={true} />
  </Filter>
);

// Product Actions
const ProductActions = () => {
  const { data, total } = useListContext();
  
  return (
    <TopToolbar>
      <FilterButton />
      <CreateButton 
        label="New Product" 
        variant="contained" 
        sx={{ ml: 1 }}
      />
      <ExportButton 
        label="Export Products"
        variant="outlined"
        sx={{ ml: 1 }}
      />
    </TopToolbar>
  );
};

// Product List Component
export const ProductList = (props: any) => (
  <List 
    {...props}
    filters={<ProductFilter />}
    actions={<ProductActions />}
    sort={{ field: 'created_at', order: 'DESC' }}
  >
    <Datagrid rowClick="show" sx={{ '& .RaDatagrid-headerCell': { fontWeight: 'bold' } }}>
      <TextField source="product_code" label="Product Code" />
      <TextField source="product_name" label="Product Name" />
      <FunctionField label="Category" render={() => <BankingTypeIndicator />} />
      <TextField source="product_category" label="Category" />
      <TextField source="product_type" label="Type" />
      <FunctionField label="Rate" render={() => <InterestRateIndicator />} />
      <NumberField source="min_amount" label="Min Amount" options={{ style: 'currency', currency: 'IDR' }} />
      <NumberField source="max_amount" label="Max Amount" options={{ style: 'currency', currency: 'IDR' }} />
      <FunctionField label="Status" render={() => <ProductStatusIndicator />} />
      <DateField source="effective_date" label="Effective Date" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Product Show Component
export const ProductShow = (props: any) => (
  <Show {...props}>
    <SimpleShowLayout>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Product Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField source="product_code" label="Product Code" />
                  <TextField source="product_name" label="Product Name" />
                  <TextField source="product_category" label="Category" />
                  <TextField source="product_type" label="Type" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField source="description" label="Description" />
                  <FunctionField label="Banking Type" render={() => <BankingTypeIndicator />} />
                  <FunctionField label="Status" render={() => <ProductStatusIndicator />} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Financial Details
              </Typography>
              <Stack spacing={1}>
                <FunctionField label="Base Rate" render={() => <InterestRateIndicator />} />
                <NumberField source="min_amount" label="Minimum Amount" options={{ style: 'currency', currency: 'IDR' }} />
                <NumberField source="max_amount" label="Maximum Amount" options={{ style: 'currency', currency: 'IDR' }} />
                <NumberField source="min_tenure" label="Min Tenure (months)" />
                <NumberField source="max_tenure" label="Max Tenure (months)" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Dates & Compliance
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <DateField source="effective_date" label="Effective Date" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <DateField source="expiry_date" label="Expiry Date" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <DateField source="created_at" label="Created At" />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <DateField source="updated_at" label="Updated At" />
                </Grid>
              </Grid>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <BooleanField source="syariah_compliant" label="Syariah Compliant" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <BooleanField source="regulatory_approved" label="Regulatory Approved" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </SimpleShowLayout>
  </Show>
);

// Product Edit Component
export const ProductEdit = (props: any) => (
  <Edit {...props}>
    <SimpleForm>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <TextInput source="product_code" label="Product Code" required fullWidth />
          <TextInput source="product_name" label="Product Name" required fullWidth />
          <SelectInput
            source="product_category"
            label="Product Category"
            choices={[
              { id: 'PERSONAL', name: 'Personal Banking' },
              { id: 'COMMERCIAL', name: 'Commercial Banking' },
              { id: 'CORPORATE', name: 'Corporate Banking' },
              { id: 'SME', name: 'SME Banking' },
              { id: 'ISLAMIC', name: 'Islamic Banking' },
            ]}
            required
            fullWidth
          />
          <SelectInput
            source="product_type"
            label="Product Type"
            choices={[
              { id: 'LOAN', name: 'Loan Products' },
              { id: 'DEPOSIT', name: 'Deposit Products' },
              { id: 'CARD', name: 'Card Products' },
              { id: 'INVESTMENT', name: 'Investment Products' },
              { id: 'MURABAHA', name: 'Murabaha (Islamic)' },
              { id: 'MUSHARAKA', name: 'Musharaka (Islamic)' },
              { id: 'MUDHARABA', name: 'Mudharaba (Islamic)' },
              { id: 'IJARAH', name: 'Ijarah (Islamic)' },
            ]}
            required
            fullWidth
          />
          <TextInput source="description" label="Description" multiline rows={3} fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Financial Configuration
          </Typography>
          <NumberInput source="base_rate" label="Base Rate (%)" step={0.01} required fullWidth />
          <NumberInput source="min_amount" label="Minimum Amount" required fullWidth />
          <NumberInput source="max_amount" label="Maximum Amount" required fullWidth />
          <NumberInput source="min_tenure" label="Min Tenure (months)" required fullWidth />
          <NumberInput source="max_tenure" label="Max Tenure (months)" required fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Dates
          </Typography>
          <DateInput source="effective_date" label="Effective Date" required fullWidth />
          <DateInput source="expiry_date" label="Expiry Date" fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Settings & Compliance
          </Typography>
          <BooleanInput source="is_active" label="Active" defaultValue={true} />
          <BooleanInput source="syariah_compliant" label="Syariah Compliant" />
          <BooleanInput source="regulatory_approved" label="Regulatory Approved" />
          <BooleanInput source="auto_approval" label="Auto Approval Enabled" />
        </Grid>
      </Grid>
    </SimpleForm>
  </Edit>
);

// Product Create Component
export const ProductCreate = (props: any) => (
  <Create {...props}>
    <SimpleForm>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Basic Information
          </Typography>
          <TextInput source="product_code" label="Product Code" required fullWidth />
          <TextInput source="product_name" label="Product Name" required fullWidth />
          <SelectInput
            source="product_category"
            label="Product Category"
            choices={[
              { id: 'PERSONAL', name: 'Personal Banking' },
              { id: 'COMMERCIAL', name: 'Commercial Banking' },
              { id: 'CORPORATE', name: 'Corporate Banking' },
              { id: 'SME', name: 'SME Banking' },
              { id: 'ISLAMIC', name: 'Islamic Banking' },
            ]}
            required
            fullWidth
          />
          <SelectInput
            source="product_type"
            label="Product Type"
            choices={[
              { id: 'LOAN', name: 'Loan Products' },
              { id: 'DEPOSIT', name: 'Deposit Products' },
              { id: 'CARD', name: 'Card Products' },
              { id: 'INVESTMENT', name: 'Investment Products' },
              { id: 'MURABAHA', name: 'Murabaha (Islamic)' },
              { id: 'MUSHARAKA', name: 'Musharaka (Islamic)' },
              { id: 'MUDHARABA', name: 'Mudharaba (Islamic)' },
              { id: 'IJARAH', name: 'Ijarah (Islamic)' },
            ]}
            required
            fullWidth
          />
          <TextInput source="description" label="Description" multiline rows={3} fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Financial Configuration
          </Typography>
          <NumberInput source="base_rate" label="Base Rate (%)" step={0.01} required fullWidth defaultValue={5.0} />
          <NumberInput source="min_amount" label="Minimum Amount" required fullWidth defaultValue={1000000} />
          <NumberInput source="max_amount" label="Maximum Amount" required fullWidth defaultValue={100000000} />
          <NumberInput source="min_tenure" label="Min Tenure (months)" required fullWidth defaultValue={1} />
          <NumberInput source="max_tenure" label="Max Tenure (months)" required fullWidth defaultValue={60} />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Dates
          </Typography>
          <DateInput source="effective_date" label="Effective Date" required fullWidth />
          <DateInput source="expiry_date" label="Expiry Date" fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Settings & Compliance
          </Typography>
          <BooleanInput source="is_active" label="Active" defaultValue={true} />
          <BooleanInput source="syariah_compliant" label="Syariah Compliant" defaultValue={false} />
          <BooleanInput source="regulatory_approved" label="Regulatory Approved" defaultValue={false} />
          <BooleanInput source="auto_approval" label="Auto Approval Enabled" defaultValue={false} />
        </Grid>
      </Grid>
    </SimpleForm>
  </Create>
);

// Resource Configuration
export const BankingProductResource = {
  list: ProductList,
  show: ProductShow,
  edit: ProductEdit,
  create: ProductCreate,
  icon: ProductIcon,
  options: {
    label: 'Banking Products'
  }
};

export default BankingProductResource;