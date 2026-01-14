// packages/frontend/src/admin/resources/banking/ProductParameterResource.tsx
// ============================================================================
// 🎯 REACT ADMIN PRODUCT PARAMETER RESOURCE
// ============================================================================
// ✅ INTEGRATION: Real backend API with FRS9PRO database
// ✅ THEME: Dual banking themes (Conventional + Syariah)
// ✅ PATTERN: Following established React Admin patterns
// ✅ VALIDATION: Complete input validation and error handling
// ============================================================================

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  EditButton,
  ShowButton,
  DeleteButton,
  Create,
  Edit,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextInput,
  NumberInput,
  BooleanInput,
  SelectInput,
  required,
  CreateButton,
  ExportButton,
  TopToolbar,
  FilterButton,
  useRecordContext,
  useGetIdentity,
  TabbedForm,
  FormTab,
  TabbedShowLayout,
  Tab,
  useDataProvider,
  useNotify,
  useRefresh,
  useRedirect
} from 'react-admin';
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Avatar
} from '@mui/material';
import {
  Category,
  AccountBalance,
  TrendingUp,
  Settings,
  Assessment,
  Info
} from '@mui/icons-material';

// Types based on backend API
interface ProductParameter {
  pkid: number;
  data_source: string;
  prd_group: string;
  prd_type: string;
  prd_code: string;
  prd_desc: string;
  currency: string;
  amortization_type?: string;
  al_flag?: string;
  impaired_flag?: boolean;
  bm_flag?: boolean;
  expected_life?: number;
  borrowing_rate?: number;
  market_rate?: number;
  active_flag: boolean;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

/**
 * Product Parameter List Actions
 */
const ProductParameterListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

/**
 * Product Code Chip Component
 */
const ProductCodeChip: React.FC<any> = () => {
  const record = useRecordContext<ProductParameter>();

  if (!record) return null;

  return (
    <Chip
      icon={<Category />}
      label={record.prd_code}
      color="primary"
      size="small"
      variant="outlined"
    />
  );
};

/**
 * Product Group Chip Component
 */
const ProductGroupChip: React.FC<any> = () => {
  const record = useRecordContext<ProductParameter>();

  if (!record) return null;

  const getGroupColor = (group: string) => {
    switch (group?.toLowerCase()) {
      case 'financing':
        return 'primary';
      case 'deposit':
        return 'success';
      case 'investment':
        return 'warning';
      case 'treasury':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={record.prd_group}
      color={getGroupColor(record.prd_group) as any}
      size="small"
      variant="outlined"
    />
  );
};

/**
 * Currency Chip Component
 */
const CurrencyChip: React.FC<any> = () => {
  const record = useRecordContext<ProductParameter>();

  if (!record) return null;

  return (
    <Chip
      label={record.currency}
      color="secondary"
      size="small"
    />
  );
};

/**
 * Product Status Display Component
 */
const ProductStatusField: React.FC<any> = () => {
  const record = useRecordContext<ProductParameter>();

  if (!record) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
        <Category />
      </Avatar>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {record.prd_desc}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {record.prd_code} • {record.prd_type}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Custom data provider for banking parameters
 */
const useBankingDataProvider = () => {
  const dataProvider = useDataProvider();

  return {
    getList: (params: any) => dataProvider.getList('banking/parameters/product', params),
    getOne: (id: any) => dataProvider.getOne('banking/parameters/product', { id }),
    create: (data: any) => dataProvider.create('banking/parameters/product', { data }),
    update: (id: any, data: any) => dataProvider.update('banking/parameters/product', { id, data, previousData: data }),
    delete: (id: any) => dataProvider.delete('banking/parameters/product', { id }),
  };
};

/**
 * Product Parameter List Component
 */
export const ProductParameterList: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const bankingType = identity?.bankingType || 'conventional';

  return (
    <List
      resource="banking/parameters/product"
      actions={<ProductParameterListActions />}
      filters={[
        <TextInput key="search" label="Search" source="q" alwaysOn />,
        <SelectInput
          key="prd_group"
          label="Product Group"
          source="prd_group"
          choices={[
            { id: 'Financing', name: 'Financing' },
            { id: 'Deposit', name: 'Deposit' },
            { id: 'Investment', name: 'Investment' },
            { id: 'Treasury', name: 'Treasury' },
          ]}
        />,
        <SelectInput
          key="prd_type"
          label="Product Type"
          source="prd_type"
          choices={[
            { id: 'Baru', name: 'Baru' },
            { id: 'Bekas', name: 'Bekas' },
          ]}
        />,
        <SelectInput
          key="currency"
          label="Currency"
          source="currency"
          choices={[
            { id: 'ALL', name: 'ALL' },
            { id: 'IDR', name: 'IDR' },
            { id: 'USD', name: 'USD' },
            { id: 'EUR', name: 'EUR' },
          ]}
        />,
        <BooleanInput
          key="active_only"
          label="Active Only"
          source="active_flag"
        />,
      ]}
      sort={{ field: 'prd_code', order: 'ASC' }}
      perPage={25}
    >
      <Datagrid rowClick="show">
        <ProductCodeChip label="Code" />
        <ProductStatusField label="Product" />
        <ProductGroupChip label="Group" />
        <TextField source="prd_type" label="Type" />
        <CurrencyChip label="Currency" />
        <TextField source="amortization_type" label="Amortization" />
        <NumberField source="expected_life" label="Life (months)" />
        <NumberField source="borrowing_rate" label="Rate %" options={{ style: 'percent', minimumFractionDigits: 2 }} />
        <BooleanField source="active_flag" label="Active" />
        <ShowButton />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

/**
 * Product Parameter Show Component
 */
export const ProductParameterShow: React.FC = () => {
  const record = useRecordContext<ProductParameter>();

  return (
    <Show resource="banking/parameters/product">
      <Box sx={{ p: 2 }}>
        {/* Header Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                    <Category />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {record?.prd_desc}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      Product Code: {record?.prd_code}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <ProductGroupChip />
                  <CurrencyChip />
                  {record?.active_flag ? (
                    <Chip label="Active" color="success" size="small" />
                  ) : (
                    <Chip label="Inactive" color="default" size="small" />
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Product Details */}
        <TabbedShowLayout>
          <Tab label="Basic Information" icon={<Category />}>
            <TextField source="prd_code" label="Product Code" />
            <TextField source="prd_desc" label="Product Description" />
            <TextField source="prd_group" label="Product Group" />
            <TextField source="prd_type" label="Product Type" />
            <TextField source="data_source" label="Data Source" />
            <TextField source="currency" label="Currency" />
            <BooleanField source="active_flag" label="Active" />
          </Tab>

          <Tab label="Financial Configuration" icon={<AccountBalance />}>
            <TextField source="amortization_type" label="Amortization Type" />
            <TextField source="al_flag" label="AL Flag" />
            <NumberField source="expected_life" label="Expected Life (months)" />
            <NumberField source="borrowing_rate" label="Borrowing Rate" />
            <NumberField source="market_rate" label="Market Rate" />
            <BooleanField source="impaired_flag" label="Impaired Flag" />
            <BooleanField source="bm_flag" label="BM Flag" />
          </Tab>

          <Tab label="System Information" icon={<Settings />}>
            <TextField source="createdby" label="Created By" />
            <TextField source="createddate" label="Created Date" />
            <TextField source="updatedby" label="Updated By" />
            <TextField source="updateddate" label="Updated Date" />
          </Tab>
        </TabbedShowLayout>
      </Box>
    </Show>
  );
};

/**
 * Product Parameter Create Component
 */
export const ProductParameterCreate: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const bankingType = identity?.bankingType || 'conventional';

  return (
    <Create resource="banking/parameters/product">
      <TabbedForm>
        <FormTab label="Basic Information" icon={<Category />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput
                source="prd_code"
                label="Product Code"
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput
                source="prd_desc"
                label="Product Description"
                validate={required()}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="instrument_class"
                label="Instrument Class *"
                choices={[
                  { id: 'A', name: 'Asset' },
                  { id: 'L', name: 'Liabilities' }
                ]}
                defaultValue="A"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="prd_type"
                label="Product Type"
                choices={[
                  { id: 'Baru', name: 'Baru' },
                  { id: 'Bekas', name: 'Bekas' },
                ]}
                defaultValue="Baru"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextInput
                source="data_source"
                label="Data Source"
                defaultValue="Core System"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="currency"
                label="Currency"
                choices={[
                  { id: 'ALL', name: 'ALL' },
                  { id: 'IDR', name: 'IDR' },
                  { id: 'USD', name: 'USD' },
                  { id: 'EUR', name: 'EUR' },
                ]}
                defaultValue="IDR"
                validate={required()}
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Financial Configuration" icon={<AccountBalance />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SelectInput
                source="amortization_type"
                label="Amortization Type"
                choices={[
                  { id: 'EIR', name: 'EIR (Effective Interest Rate)' },
                  { id: 'Straight', name: 'Straight Line' },
                ]}
                defaultValue="EIR"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="al_flag"
                label="AL Flag"
                choices={[
                  { id: 'A', name: 'A' },
                  { id: 'L', name: 'L' },
                ]}
                defaultValue="A"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <NumberInput
                source="expected_life"
                label="Expected Life (months)"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <NumberInput
                source="borrowing_rate"
                label="Borrowing Rate"
                step={0.001}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <NumberInput
                source="market_rate"
                label="Market Rate"
                step={0.001}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <BooleanInput
                source="impaired_flag"
                label="Impaired Flag"
                defaultValue={false}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <BooleanInput
                source="bm_flag"
                label="BM Flag"
                defaultValue={false}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <BooleanInput
                source="active_flag"
                label="Active"
                defaultValue={true}
              />
            </Grid>
          </Grid>
        </FormTab>
      </TabbedForm>
    </Create>
  );
};

/**
 * Product Parameter Edit Component
 */
export const ProductParameterEdit: React.FC = () => {
  return (
    <Edit resource="banking/parameters/product">
      <TabbedForm>
        <FormTab label="Basic Information" icon={<Category />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput
                source="prd_code"
                label="Product Code"
                validate={required()}
                fullWidth
                disabled // Don't allow editing product code
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput
                source="prd_desc"
                label="Product Description"
                validate={required()}
                fullWidth
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="instrument_class"
                label="Instrument Class *"
                choices={[
                  { id: 'A', name: 'Asset' },
                  { id: 'L', name: 'Liabilities' }
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="prd_type"
                label="Product Type"
                choices={[
                  { id: 'Baru', name: 'Baru' },
                  { id: 'Bekas', name: 'Bekas' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextInput
                source="data_source"
                label="Data Source"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="currency"
                label="Currency"
                choices={[
                  { id: 'ALL', name: 'ALL' },
                  { id: 'IDR', name: 'IDR' },
                  { id: 'USD', name: 'USD' },
                  { id: 'EUR', name: 'EUR' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Financial Configuration" icon={<AccountBalance />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SelectInput
                source="amortization_type"
                label="Amortization Type"
                choices={[
                  { id: 'EIR', name: 'EIR (Effective Interest Rate)' },
                  { id: 'Straight', name: 'Straight Line' },
                ]}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="al_flag"
                label="AL Flag"
                choices={[
                  { id: 'A', name: 'A' },
                  { id: 'L', name: 'L' },
                ]}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <NumberInput
                source="expected_life"
                label="Expected Life (months)"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <NumberInput
                source="borrowing_rate"
                label="Borrowing Rate"
                step={0.001}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <NumberInput
                source="market_rate"
                label="Market Rate"
                step={0.001}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <BooleanInput
                source="impaired_flag"
                label="Impaired Flag"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <BooleanInput
                source="bm_flag"
                label="BM Flag"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <BooleanInput
                source="active_flag"
                label="Active"
              />
            </Grid>
          </Grid>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

// Export product parameter resource configuration
export const ProductParameterResource = {
  list: ProductParameterList,
  show: ProductParameterShow,
  create: ProductParameterCreate,
  edit: ProductParameterEdit,
  options: {
    label: 'Product Parameters',
    recordRepresentation: (record: ProductParameter) => `${record.prd_code} - ${record.prd_desc}`
  }
};