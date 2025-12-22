// packages/frontend/src/admin/resources/banking/EnhancedCustomerResource.tsx
// ============================================================================
// Enhanced Customer Resource for React Admin
// ============================================================================
// Generated: 2025-01-11
// Purpose: Complete CRUD operations for banking customers with dual banking support
// Methodology: React Admin v4 resource with conventional and Syariah customer management
// Dependencies: Banking resource data provider, Material-UI components
// ============================================================================

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  NumberField,
  DateField,
  BooleanField,
  ChipField,
  EditButton,
  ShowButton,
  DeleteButton,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  Create,
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  SelectInput,
  EmailInput,
  Filter,
  SearchInput,
  TopToolbar,
  ExportButton,
  BulkDeleteButton,
  BulkUpdateButton,
  useRecordContext,
  FunctionField,
  ReferenceField,
  ReferenceManyField,
  SingleFieldList,
  useGetList
} from 'react-admin';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Grid,
  Divider,
  Alert,
  Stack,
  Avatar,
  LinearProgress
} from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

// Customer Filters
const CustomerFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="search" placeholder="Search customers, emails, IDs..." alwaysOn />
    <SelectInput
      source="customerType"
      label="Customer Type"
      choices={[
        { id: 'INDIVIDUAL', name: 'Individual' },
        { id: 'CORPORATE', name: 'Corporate' },
        { id: 'SME', name: 'Small & Medium Enterprise' },
        { id: 'GOVERNMENT', name: 'Government Entity' },
      ]}
      allowEmpty
    />
    <SelectInput
      source="riskRating"
      label="Risk Rating"
      choices={[
        { id: 'LOW', name: 'Low Risk' },
        { id: 'MEDIUM', name: 'Medium Risk' },
        { id: 'HIGH', name: 'High Risk' },
        { id: 'CRITICAL', name: 'Critical Risk' },
      ]}
      allowEmpty
    />
    <SelectInput
      source="segment"
      label="Banking Segment"
      choices={[
        { id: 'RETAIL', name: 'Retail Banking' },
        { id: 'CORPORATE', name: 'Corporate Banking' },
        { id: 'PRIVATE', name: 'Private Banking' },
        { id: 'SME', name: 'SME Banking' },
      ]}
      allowEmpty
    />
    <SelectInput
      source="status"
      label="Status"
      choices={[
        { id: 'active', name: 'Active' },
        { id: 'inactive', name: 'Inactive' },
      ]}
      defaultValue="active"
    />
  </Filter>
);

// Custom Customer Type Icon
const CustomerTypeIcon = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'INDIVIDUAL': return <PersonIcon color="primary" />;
      case 'CORPORATE': return <BusinessIcon color="secondary" />;
      case 'SME': return <BusinessIcon color="info" />;
      case 'GOVERNMENT': return <SecurityIcon color="success" />;
      default: return <PersonIcon />;
    }
  };

  return getIcon(record.customer_type);
};

// Risk Rating Component with Color
const RiskRatingChip = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  return (
    <Chip
      label={record.risk_rating}
      color={getRiskColor(record.risk_rating) as any}
      size="small"
    />
  );
};

// Customer Avatar Component
const CustomerAvatar = () => {
  const record = useRecordContext();
  if (!record) return null;

  const initials = record.customer_name
    ? record.customer_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : '?';

  return (
    <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>
      {initials}
    </Avatar>
  );
};

// Total Exposure Component
const TotalExposureField = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <NumberField
      record={record}
      source="total_exposure"
      options={{
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }}
    />
  );
};

// Syariah Compliance Indicator
const SyariahComplianceIndicator = () => {
  const record = useRecordContext();
  if (!record || !record.syariah_certification) return null;

  return (
    <Chip
      label={record.syariah_certification ? 'Syariah Certified' : 'Conventional'}
      color={record.syariah_certification ? 'primary' : 'default'}
      size="small"
      icon={record.syariah_certification ? <StarIcon /> : undefined}
    />
  );
};

// Customer Actions Toolbar
const CustomerActions = () => (
  <TopToolbar>
    <ExportButton />
  </TopToolbar>
);

// Bulk Actions
const CustomerBulkActions = () => (
  <>
    <BulkUpdateButton data={{ is_active: false }} label="Bulk Deactivate" />
    <BulkDeleteButton />
  </>
);

// Customer List Component
export const CustomerList = (props: any) => (
  <List
    {...props}
    filters={<CustomerFilter />}
    actions={<CustomerActions />}
    bulkActionButtons={<CustomerBulkActions />}
    perPage={25}
    sort={{ field: 'created_at', order: 'DESC' }}
    title="Banking Customers"
  >
    <Datagrid rowClick="show">
      <FunctionField 
        label="" 
        render={() => <CustomerAvatar />} 
        textAlign="center"
      />
      <TextField source="customer_id" label="Customer ID" />
      <TextField source="customer_name" label="Customer Name" />
      <FunctionField 
        label="Type" 
        render={() => <CustomerTypeIcon />} 
        textAlign="center"
      />
      <EmailField source="email" label="Email" />
      <ChipField source="banking_segment" label="Segment" />
      <NumberField source="account_count" label="Accounts" />
      <FunctionField 
        label="Total Exposure" 
        render={() => <TotalExposureField />} 
      />
      <FunctionField 
        label="Risk" 
        render={() => <RiskRatingChip />} 
      />
      <FunctionField 
        label="Syariah" 
        render={() => <SyariahComplianceIndicator />} 
      />
      <BooleanField source="is_active" label="Active" />
      <EditButton />
      <ShowButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Customer Show Component
export const CustomerShow = (props: any) => (
  <Show {...props} title="Customer Details">
    <SimpleShowLayout>
      <Grid container spacing={3}>
        {/* Customer Profile */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CustomerAvatar />
              <Typography variant="h6" sx={{ mt: 2 }}>
                <TextField source="customer_name" />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <TextField source="customer_id" />
              </Typography>
              <Box sx={{ mt: 2 }}>
                <FunctionField render={() => <RiskRatingChip />} />
              </Box>
              <Box sx={{ mt: 1 }}>
                <FunctionField render={() => <SyariahComplianceIndicator />} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <EmailField source="email" label="Email Address" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField source="phone" label="Phone Number" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <ChipField source="customer_type" label="Customer Type" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField source="national_id" label="National ID" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Banking Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Banking Information
              </Typography>
              <Stack spacing={2}>
                <ChipField source="banking_segment" label="Banking Segment" />
                <NumberField source="account_count" label="Number of Accounts" />
                <FunctionField 
                  label="Total Exposure" 
                  render={() => <TotalExposureField />} 
                />
                <BooleanField source="is_active" label="Active Status" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Risk Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Risk Assessment
              </Typography>
              <Stack spacing={2}>
                <FunctionField 
                  label="Risk Rating" 
                  render={() => <RiskRatingChip />} 
                />
                <DateField source="risk_assessment_date" label="Last Assessment" />
                <TextField source="risk_notes" label="Risk Notes" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Syariah-specific Information */}
        <FunctionField
          render={(record: any) => {
            if (record?.syariah_certification) {
              return (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Syariah Banking Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                          <BooleanField source="syariah_certification" label="Syariah Certified" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <TextField source="religious_obligations" label="Religious Obligations" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <BooleanField source="halal_income_verification" label="Halal Income Verified" />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              );
            }
            return null;
          }}
        />

        {/* Portfolio Accounts */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Portfolio Accounts
              </Typography>
              <ReferenceManyField
                reference="portfolio-accounts"
                target="customer_id"
                label="Accounts"
              >
                <Datagrid>
                  <TextField source="account_id" label="Account ID" />
                  <ChipField source="product_type" label="Product" />
                  <NumberField 
                    source="outstanding_amount" 
                    label="Outstanding" 
                    options={{ 
                      style: 'currency', 
                      currency: 'IDR',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0 
                    }} 
                  />
                  <ChipField source="current_stage" label="Stage" />
                  <BooleanField source="is_active" label="Active" />
                  <ShowButton />
                </Datagrid>
              </ReferenceManyField>
            </CardContent>
          </Card>
        </Grid>

        {/* Audit Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Audit Trail
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <DateField source="created_at" label="Created" showTime />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DateField source="updated_at" label="Updated" showTime />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField source="created_by" label="Created By" />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField source="updated_by" label="Updated By" />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </SimpleShowLayout>
  </Show>
);

// Customer Edit Component
export const CustomerEdit = (props: any) => (
  <Edit {...props} title="Edit Customer">
    <SimpleForm>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextInput source="customer_id" label="Customer ID" fullWidth disabled />
          <TextInput source="customer_name" label="Customer Name" fullWidth required />
          <EmailInput source="email" label="Email Address" fullWidth />
          <TextInput source="phone" label="Phone Number" fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SelectInput
            source="customer_type"
            label="Customer Type"
            choices={[
              { id: 'INDIVIDUAL', name: 'Individual' },
              { id: 'CORPORATE', name: 'Corporate' },
              { id: 'SME', name: 'Small & Medium Enterprise' },
              { id: 'GOVERNMENT', name: 'Government Entity' },
            ]}
            fullWidth
            required
          />
          <TextInput source="national_id" label="National ID" fullWidth />
          <SelectInput
            source="banking_segment"
            label="Banking Segment"
            choices={[
              { id: 'RETAIL', name: 'Retail Banking' },
              { id: 'CORPORATE', name: 'Corporate Banking' },
              { id: 'PRIVATE', name: 'Private Banking' },
              { id: 'SME', name: 'SME Banking' },
            ]}
            fullWidth
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SelectInput
            source="risk_rating"
            label="Risk Rating"
            choices={[
              { id: 'LOW', name: 'Low Risk' },
              { id: 'MEDIUM', name: 'Medium Risk' },
              { id: 'HIGH', name: 'High Risk' },
              { id: 'CRITICAL', name: 'Critical Risk' },
            ]}
            fullWidth
          />
          <DateInput source="risk_assessment_date" label="Risk Assessment Date" fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <BooleanInput source="is_active" label="Active" />
          <BooleanInput source="syariah_certification" label="Syariah Certified" />
        </Grid>

        {/* Syariah-specific fields */}
        <FunctionField
          render={(record: any) => {
            if (record?.syariah_certification) {
              return (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Syariah Banking Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextInput source="religious_obligations" label="Religious Obligations" fullWidth multiline rows={3} />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <BooleanInput source="halal_income_verification" label="Halal Income Verified" />
                    </Grid>
                  </Grid>
                </Grid>
              );
            }
            return null;
          }}
        />
      </Grid>
    </SimpleForm>
  </Edit>
);

// Customer Create Component
export const CustomerCreate = (props: any) => (
  <Create {...props} title="Create Customer">
    <SimpleForm>
      <Alert severity="info" sx={{ mb: 2 }}>
        Creating a new banking customer. Please provide complete information for proper risk assessment.
      </Alert>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextInput source="customer_id" label="Customer ID" fullWidth required />
          <TextInput source="customer_name" label="Customer Name" fullWidth required />
          <EmailInput source="email" label="Email Address" fullWidth />
          <TextInput source="phone" label="Phone Number" fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SelectInput
            source="customer_type"
            label="Customer Type"
            choices={[
              { id: 'INDIVIDUAL', name: 'Individual' },
              { id: 'CORPORATE', name: 'Corporate' },
              { id: 'SME', name: 'Small & Medium Enterprise' },
              { id: 'GOVERNMENT', name: 'Government Entity' },
            ]}
            defaultValue="INDIVIDUAL"
            fullWidth
            required
          />
          <TextInput source="national_id" label="National ID" fullWidth required />
          <SelectInput
            source="banking_segment"
            label="Banking Segment"
            choices={[
              { id: 'RETAIL', name: 'Retail Banking' },
              { id: 'CORPORATE', name: 'Corporate Banking' },
              { id: 'PRIVATE', name: 'Private Banking' },
              { id: 'SME', name: 'SME Banking' },
            ]}
            defaultValue="RETAIL"
            fullWidth
            required
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <SelectInput
            source="risk_rating"
            label="Risk Rating"
            choices={[
              { id: 'LOW', name: 'Low Risk' },
              { id: 'MEDIUM', name: 'Medium Risk' },
              { id: 'HIGH', name: 'High Risk' },
              { id: 'CRITICAL', name: 'Critical Risk' },
            ]}
            defaultValue="LOW"
            fullWidth
            required
          />
          <DateInput source="risk_assessment_date" label="Risk Assessment Date" fullWidth />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <BooleanInput source="is_active" label="Active" defaultValue={true} />
          <BooleanInput source="syariah_certification" label="Syariah Certified" defaultValue={false} />
        </Grid>
        
        <Grid item xs={12}>
          <TextInput source="risk_notes" label="Risk Assessment Notes" fullWidth multiline rows={3} />
        </Grid>
      </Grid>
    </SimpleForm>
  </Create>
);

// Resource Configuration
export const EnhancedCustomerResource = {
  list: CustomerList,
  show: CustomerShow,
  edit: CustomerEdit,
  create: CustomerCreate,
  icon: PeopleIcon,
  options: {
    label: 'Banking Customers'
  }
};

export default EnhancedCustomerResource;