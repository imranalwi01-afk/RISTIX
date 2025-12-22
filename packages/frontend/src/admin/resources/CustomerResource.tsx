// packages/frontend/src/admin/resources/CustomerResource.tsx
// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/resources/CustomerResource.tsx
// Generated: Day 2 Hour 6 - Part 2 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin v4, Material-UI v6
// Purpose: Customer management resource with dual banking and Islamic compliance
// ============================================================================

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  BooleanField,
  EmailField,
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
  DateInput,
  BooleanInput,
  SelectInput,
  // EmailInput, // ❌ Remove - not available in react-admin v4
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
  Tab
} from 'react-admin';
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import {
  Person,
  Business,
  Security,
  AccountBalance,
  Warning,
  CheckCircle,
  LocationOn,
  Phone,
  Email
} from '@mui/icons-material';

// Types
interface Customer {
  id: string;
  customerCode: string;
  customerType: 'individual' | 'corporate';
  bankingType: 'conventional' | 'syariah';
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  nationality: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  riskRating: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  isActive: boolean;
  syariahCompliance?: {
    shariaBoard: boolean;
    halalCertification: boolean;
    complianceOfficer: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Customer List Actions
 */
const CustomerListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

/**
 * Customer Type Chip Component
 */
const CustomerTypeChip: React.FC = () => {
  const record = useRecordContext<Customer>();
  
  if (!record) return null;

  return (
    <Chip
      icon={record.customerType === 'corporate' ? <Business /> : <Person />}
      label={record.customerType === 'corporate' ? 'Corporate' : 'Individual'}
      color={record.customerType === 'corporate' ? 'primary' : 'secondary'}
      size="small"
      variant="outlined"
    />
  );
};

/**
 * Banking Type Chip Component
 */
const BankingTypeChip: React.FC = () => {
  const record = useRecordContext<Customer>();
  
  if (!record) return null;

  return (
    <Chip
      icon={record.bankingType === 'syariah' ? <Security /> : <AccountBalance />}
      label={record.bankingType === 'syariah' ? 'Islamic' : 'Conventional'}
      color={record.bankingType === 'syariah' ? 'success' : 'primary'}
      size="small"
      variant="outlined"
    />
  );
};

/**
 * KYC Status Chip Component
 */
const KYCStatusChip: React.FC = () => {
  const record = useRecordContext<Customer>();
  
  if (!record) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle />;
      case 'pending':
        return <Warning />;
      case 'rejected':
        return <Warning />;
      default:
        return null;
    }
  };

  return (
    <Chip
      icon={getStatusIcon(record.kycStatus)}
      label={record.kycStatus.toUpperCase()}
      color={getStatusColor(record.kycStatus) as any}
      size="small"
    />
  );
};

/**
 * Customer Name Display Component
 */
const CustomerNameField: React.FC = () => {
  const record = useRecordContext<Customer>();
  
  if (!record) return null;

  const displayName = record.customerType === 'corporate' 
    ? record.companyName 
    : `${record.firstName} ${record.lastName}`;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar sx={{ width: 32, height: 32 }}>
        {record.customerType === 'corporate' ? <Business /> : <Person />}
      </Avatar>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {displayName}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {record.customerCode}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Customer List Component
 */
export const CustomerList: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const bankingType = identity?.bankingType || 'conventional';

  return (
    <List
      actions={<CustomerListActions />}
      filters={[
        <TextInput key="search" label="Search" source="q" alwaysOn />,
        <SelectInput
          key="customerType"
          label="Customer Type"
          source="customerType"
          choices={[
            { id: 'individual', name: 'Individual' },
            { id: 'corporate', name: 'Corporate' },
          ]}
        />,
        <SelectInput
          key="bankingType"
          label="Banking Type"
          source="bankingType"
          choices={[
            { id: 'conventional', name: 'Conventional' },
            { id: 'syariah', name: 'Syariah' },
          ]}
        />,
        <SelectInput
          key="kycStatus"
          label="KYC Status"
          source="kycStatus"
          choices={[
            { id: 'pending', name: 'Pending' },
            { id: 'approved', name: 'Approved' },
            { id: 'rejected', name: 'Rejected' },
          ]}
        />,
        <SelectInput
          key="riskRating"
          label="Risk Rating"
          source="riskRating"
          choices={[
            { id: 'low', name: 'Low Risk' },
            { id: 'medium', name: 'Medium Risk' },
            { id: 'high', name: 'High Risk' },
          ]}
        />,
      ]}
      sort={{ field: 'updatedAt', order: 'DESC' }}
      perPage={25}
    >
      <Datagrid rowClick="show">
        <CustomerNameField label="Customer" />
        <CustomerTypeChip label="Type" />
        <BankingTypeChip label="Banking" />
        <EmailField source="email" label="Email" />
        <TextField source="phone" label="Phone" />
        <TextField source="country" label="Country" />
        <TextField source="riskRating" label="Risk" />
        <KYCStatusChip label="KYC Status" />
        <BooleanField source="isActive" label="Active" />
        <ShowButton />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

/**
 * Customer Show Component
 */
export const CustomerShow: React.FC = () => {
  const record = useRecordContext<Customer>();

  const displayName = record?.customerType === 'corporate' 
    ? record.companyName 
    : `${record?.firstName} ${record?.lastName}`;

  return (
    <Show>
      <Box sx={{ p: 2 }}>
        {/* Header Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 64, height: 64 }}>
                    {record?.customerType === 'corporate' ? <Business /> : <Person />}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {displayName}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      Customer Code: {record?.customerCode}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <CustomerTypeChip />
                  <BankingTypeChip />
                  <KYCStatusChip />
                  {record?.isActive ? (
                    <Chip label="Active" color="success" size="small" />
                  ) : (
                    <Chip label="Inactive" color="default" size="small" />
                  )}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* KYC Alert */}
        {record?.kycStatus === 'pending' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            KYC verification is pending for this customer.
          </Alert>
        )}

        {record?.kycStatus === 'rejected' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            KYC verification has been rejected for this customer.
          </Alert>
        )}

        {/* Islamic Banking Specific Alert */}
        {record?.bankingType === 'syariah' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This customer operates under Syariah-compliant banking principles.
          </Alert>
        )}

        {/* Customer Details */}
        <TabbedShowLayout>
          <Tab label="Basic Information" icon={<Person />}>
            <TextField source="customerCode" label="Customer Code" />
            <TextField source="customerType" label="Customer Type" />
            <TextField source="bankingType" label="Banking Type" />
            
            {record?.customerType === 'individual' ? (
              <>
                <TextField source="firstName" label="First Name" />
                <TextField source="lastName" label="Last Name" />
                <DateField source="dateOfBirth" label="Date of Birth" />
              </>
            ) : (
              <TextField source="companyName" label="Company Name" />
            )}
            
            <TextField source="nationality" label="Nationality" />
            <TextField source="riskRating" label="Risk Rating" />
            <TextField source="kycStatus" label="KYC Status" />
            <BooleanField source="isActive" label="Active" />
          </Tab>

          <Tab label="Contact Information" icon={<Phone />}>
            <EmailField source="email" label="Email" />
            <TextField source="phone" label="Phone" />
            <TextField source="address" label="Address" />
            <TextField source="city" label="City" />
            <TextField source="country" label="Country" />
            <TextField source="postalCode" label="Postal Code" />
          </Tab>

          {record?.bankingType === 'syariah' && (
            <Tab label="Syariah Compliance" icon={<Security />}>
              <BooleanField 
                source="syariahCompliance.shariaBoard" 
                label="Sharia Board Approved" 
              />
              <BooleanField 
                source="syariahCompliance.halalCertification" 
                label="Halal Certification" 
              />
              <TextField 
                source="syariahCompliance.complianceOfficer" 
                label="Compliance Officer" 
              />
            </Tab>
          )}

          <Tab label="System Information" icon={<AccountBalance />}>
            <DateField source="createdAt" label="Created Date" />
            <DateField source="updatedAt" label="Updated Date" />
          </Tab>
        </TabbedShowLayout>
      </Box>
    </Show>
  );
};

/**
 * Customer Create Component
 */
export const CustomerCreate: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const defaultBankingType = identity?.bankingType || 'conventional';

  return (
    <Create>
      <TabbedForm>
        <FormTab label="Basic Information" icon={<Person />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="customerCode" 
                label="Customer Code" 
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SelectInput
                source="customerType"
                label="Customer Type"
                choices={[
                  { id: 'individual', name: 'Individual' },
                  { id: 'corporate', name: 'Corporate' },
                ]}
                defaultValue="individual"
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SelectInput
                source="bankingType"
                label="Banking Type"
                choices={[
                  { id: 'conventional', name: 'Conventional Banking' },
                  { id: 'syariah', name: 'Islamic Banking' },
                ]}
                defaultValue={defaultBankingType}
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextInput 
                source="firstName" 
                label="First Name" 
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextInput 
                source="lastName" 
                label="Last Name" 
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextInput 
                source="companyName" 
                label="Company Name" 
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DateInput 
                source="dateOfBirth" 
                label="Date of Birth" 
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextInput 
                source="nationality" 
                label="Nationality" 
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SelectInput
                source="riskRating"
                label="Risk Rating"
                choices={[
                  { id: 'low', name: 'Low Risk' },
                  { id: 'medium', name: 'Medium Risk' },
                  { id: 'high', name: 'High Risk' },
                ]}
                defaultValue="medium"
                validate={required()}
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Contact Information" icon={<Phone />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="email" 
                label="Email" 
                type="email"
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="phone" 
                label="Phone" 
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextInput 
                source="address" 
                label="Address" 
                validate={required()}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextInput 
                source="city" 
                label="City" 
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <SelectInput
                source="country"
                label="Country"
                choices={[
                  { id: 'US', name: 'United States' },
                  { id: 'GB', name: 'United Kingdom' },
                  { id: 'ID', name: 'Indonesia' },
                  { id: 'MY', name: 'Malaysia' },
                  { id: 'SG', name: 'Singapore' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextInput 
                source="postalCode" 
                label="Postal Code" 
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Status & Compliance" icon={<Security />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SelectInput
                source="kycStatus"
                label="KYC Status"
                choices={[
                  { id: 'pending', name: 'Pending' },
                  { id: 'approved', name: 'Approved' },
                  { id: 'rejected', name: 'Rejected' },
                ]}
                defaultValue="pending"
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <BooleanInput 
                source="isActive" 
                label="Active" 
                defaultValue={true}
              />
            </Grid>
            
            {/* Syariah Compliance Fields */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Syariah Compliance (Islamic Banking Only)
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <BooleanInput 
                source="syariahCompliance.shariaBoard" 
                label="Sharia Board Approved" 
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <BooleanInput 
                source="syariahCompliance.halalCertification" 
                label="Halal Certification" 
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextInput 
                source="syariahCompliance.complianceOfficer" 
                label="Compliance Officer" 
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>
      </TabbedForm>
    </Create>
  );
};

/**
 * Customer Edit Component
 */
export const CustomerEdit: React.FC = () => {
  return (
    <Edit>
      <TabbedForm>
        <FormTab label="Basic Information" icon={<Person />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="customerCode" 
                label="Customer Code" 
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <SelectInput
                source="customerType"
                label="Customer Type"
                choices={[
                  { id: 'individual', name: 'Individual' },
                  { id: 'corporate', name: 'Corporate' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SelectInput
                source="bankingType"
                label="Banking Type"
                choices={[
                  { id: 'conventional', name: 'Conventional Banking' },
                  { id: 'syariah', name: 'Islamic Banking' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextInput 
                source="firstName" 
                label="First Name" 
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextInput 
                source="lastName" 
                label="Last Name" 
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextInput 
                source="companyName" 
                label="Company Name" 
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <DateInput 
                source="dateOfBirth" 
                label="Date of Birth" 
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextInput 
                source="nationality" 
                label="Nationality" 
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <SelectInput
                source="riskRating"
                label="Risk Rating"
                choices={[
                  { id: 'low', name: 'Low Risk' },
                  { id: 'medium', name: 'Medium Risk' },
                  { id: 'high', name: 'High Risk' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Contact Information" icon={<Phone />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="email" 
                label="Email" 
                type="email"
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextInput 
                source="phone" 
                label="Phone" 
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextInput 
                source="address" 
                label="Address" 
                validate={required()}
                multiline
                rows={3}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextInput 
                source="city" 
                label="City" 
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <SelectInput
                source="country"
                label="Country"
                choices={[
                  { id: 'US', name: 'United States' },
                  { id: 'GB', name: 'United Kingdom' },
                  { id: 'ID', name: 'Indonesia' },
                  { id: 'MY', name: 'Malaysia' },
                  { id: 'SG', name: 'Singapore' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextInput 
                source="postalCode" 
                label="Postal Code" 
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Status & Compliance" icon={<Security />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <SelectInput
                source="kycStatus"
                label="KYC Status"
                choices={[
                  { id: 'pending', name: 'Pending' },
                  { id: 'approved', name: 'Approved' },
                  { id: 'rejected', name: 'Rejected' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <BooleanInput 
                source="isActive" 
                label="Active"
              />
            </Grid>
            
            {/* Syariah Compliance Fields */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Syariah Compliance (Islamic Banking Only)
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <BooleanInput 
                source="syariahCompliance.shariaBoard" 
                label="Sharia Board Approved" 
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <BooleanInput 
                source="syariahCompliance.halalCertification" 
                label="Halal Certification" 
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <TextInput 
                source="syariahCompliance.complianceOfficer" 
                label="Compliance Officer" 
                fullWidth
              />
            </Grid>
          </Grid>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

// Export customer resource configuration
export const CustomerResource = {
  list: CustomerList,
  show: CustomerShow,
  create: CustomerCreate,
  edit: CustomerEdit,
};