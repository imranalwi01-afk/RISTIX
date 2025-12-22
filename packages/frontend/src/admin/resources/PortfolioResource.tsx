// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/resources/PortfolioResource.tsx
// Generated: Day 2 Hour 6 - Part 2 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin v4, Material-UI v6
// Purpose: Portfolio management resource with dual banking support
// ============================================================================

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
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
  DateInput,
  BooleanInput,
  SelectInput,
  ReferenceInput,
  AutocompleteInput,
  required,
  CreateButton,
  ExportButton,
  TopToolbar,
  FilterButton,
  useRecordContext,
  useGetIdentity
} from 'react-admin';
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Button
} from '@mui/material';
import {
  AccountBalance,
  Security,
  TrendingUp,
  Assessment,
  Warning
} from '@mui/icons-material';

// Types
interface Portfolio {
  id: string;
  portfolioCode: string;
  portfolioName: string;
  bankingType: 'conventional' | 'syariah';
  productType: string;
  totalExposure: number;
  numberOfAccounts: number;
  averageBalance: number;
  riskCategory: string;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastCalculationDate?: string;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
}

/**
 * Portfolio List Actions
 */
const PortfolioListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
    <Button
      startIcon={<Assessment />}
      onClick={() => {
        // Handle bulk ECL calculation
        console.log('Trigger bulk ECL calculation');
      }}
    >
      Calculate ECL
    </Button>
  </TopToolbar>
);

/**
 * Portfolio Status Chip Component
 */
const PortfolioStatusChip: React.FC = () => {
  const record = useRecordContext<Portfolio>();
  
  if (!record) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'warning':
        return 'warning';
      case 'non-compliant':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={record.complianceStatus}
      color={getStatusColor(record.complianceStatus) as any}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

/**
 * Banking Type Chip Component
 */
const BankingTypeChip: React.FC = () => {
  const record = useRecordContext<Portfolio>();
  
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
 * Portfolio List Component
 */
export const PortfolioList: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const bankingType = identity?.bankingType || 'conventional';

  return (
    <List
      actions={<PortfolioListActions />}
      filters={[
        <TextInput key="search" label="Search" source="q" alwaysOn />,
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
          key="riskCategory"
          label="Risk Category"
          source="riskCategory"
          choices={[
            { id: 'low', name: 'Low Risk' },
            { id: 'medium', name: 'Medium Risk' },
            { id: 'high', name: 'High Risk' },
          ]}
        />,
        <SelectInput
          key="complianceStatus"
          label="Compliance Status"
          source="complianceStatus"
          choices={[
            { id: 'compliant', name: 'Compliant' },
            { id: 'warning', name: 'Warning' },
            { id: 'non-compliant', name: 'Non-Compliant' },
          ]}
        />,
      ]}
      sort={{ field: 'updatedAt', order: 'DESC' }}
      perPage={25}
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={
          <Box>
            <Button startIcon={<Assessment />}>Calculate ECL</Button>
          </Box>
        }
      >
        <TextField source="portfolioCode" label="Code" />
        <TextField source="portfolioName" label="Name" />
        <BankingTypeChip label="Banking Type" />
        <TextField source="productType" label="Product" />
        <NumberField 
          source="totalExposure" 
          label="Total Exposure"
          options={{
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
          }}
        />
        <NumberField source="numberOfAccounts" label="Accounts" />
        <TextField source="riskCategory" label="Risk" />
        <PortfolioStatusChip label="Compliance" />
        <BooleanField source="isActive" label="Active" />
        <DateField source="lastCalculationDate" label="Last Calc" />
        <ShowButton />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

/**
 * Portfolio Show Component
 */
export const PortfolioShow: React.FC = () => {
  const record = useRecordContext<Portfolio>();

  return (
    <Show>
      <Box sx={{ p: 2 }}>
        {/* Header Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {record?.portfolioName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Code: {record?.portfolioCode}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <BankingTypeChip />
                  <PortfolioStatusChip />
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

        {/* Compliance Alert */}
        {record?.complianceStatus === 'warning' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This portfolio requires attention for compliance issues.
          </Alert>
        )}

        {record?.complianceStatus === 'non-compliant' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            This portfolio is not compliant and requires immediate action.
          </Alert>
        )}

        {/* Islamic Banking Specific Alert */}
        {record?.bankingType === 'syariah' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This portfolio operates under Syariah-compliant principles according to AAOIFI standards.
          </Alert>
        )}

        {/* Portfolio Details */}
        <SimpleShowLayout>
          <TextField source="portfolioCode" label="Portfolio Code" />
          <TextField source="portfolioName" label="Portfolio Name" />
          <TextField source="bankingType" label="Banking Type" />
          <TextField source="productType" label="Product Type" />
          <NumberField 
            source="totalExposure" 
            label="Total Exposure"
            options={{
              style: 'currency',
              currency: 'USD'
            }}
          />
          <NumberField source="numberOfAccounts" label="Number of Accounts" />
          <NumberField 
            source="averageBalance" 
            label="Average Balance"
            options={{
              style: 'currency',
              currency: 'USD'
            }}
          />
          <TextField source="riskCategory" label="Risk Category" />
          <TextField source="currency" label="Currency" />
          <TextField source="complianceStatus" label="Compliance Status" />
          <BooleanField source="isActive" label="Active" />
          <DateField source="createdAt" label="Created Date" />
          <DateField source="updatedAt" label="Updated Date" />
          <DateField source="lastCalculationDate" label="Last Calculation Date" />
        </SimpleShowLayout>
      </Box>
    </Show>
  );
};

/**
 * Portfolio Create Component
 */
export const PortfolioCreate: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const defaultBankingType = identity?.bankingType || 'conventional';

  return (
    <Create>
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput 
              source="portfolioCode" 
              label="Portfolio Code" 
              validate={required()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput 
              source="portfolioName" 
              label="Portfolio Name" 
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
            <SelectInput
              source="productType"
              label="Product Type"
              choices={[
                { id: 'personal_loan', name: 'Personal Loan' },
                { id: 'mortgage', name: 'Mortgage' },
                { id: 'business_loan', name: 'Business Loan' },
                { id: 'credit_card', name: 'Credit Card' },
                { id: 'murabaha', name: 'Murabaha (Islamic)' },
                { id: 'musharaka', name: 'Musharaka (Islamic)' },
                { id: 'ijara', name: 'Ijara (Islamic)' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <NumberInput 
              source="totalExposure" 
              label="Total Exposure" 
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <NumberInput 
              source="numberOfAccounts" 
              label="Number of Accounts" 
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SelectInput
              source="riskCategory"
              label="Risk Category"
              choices={[
                { id: 'low', name: 'Low Risk' },
                { id: 'medium', name: 'Medium Risk' },
                { id: 'high', name: 'High Risk' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SelectInput
              source="currency"
              label="Currency"
              choices={[
                { id: 'USD', name: 'US Dollar' },
                { id: 'EUR', name: 'Euro' },
                { id: 'GBP', name: 'British Pound' },
                { id: 'IDR', name: 'Indonesian Rupiah' },
                { id: 'MYR', name: 'Malaysian Ringgit' },
              ]}
              defaultValue="USD"
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <BooleanInput 
              source="isActive" 
              label="Active" 
              defaultValue={true}
            />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};

/**
 * Portfolio Edit Component
 */
export const PortfolioEdit: React.FC = () => {
  return (
    <Edit>
      <SimpleForm>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput 
              source="portfolioCode" 
              label="Portfolio Code" 
              validate={required()}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextInput 
              source="portfolioName" 
              label="Portfolio Name" 
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
            <SelectInput
              source="productType"
              label="Product Type"
              choices={[
                { id: 'personal_loan', name: 'Personal Loan' },
                { id: 'mortgage', name: 'Mortgage' },
                { id: 'business_loan', name: 'Business Loan' },
                { id: 'credit_card', name: 'Credit Card' },
                { id: 'murabaha', name: 'Murabaha (Islamic)' },
                { id: 'musharaka', name: 'Musharaka (Islamic)' },
                { id: 'ijara', name: 'Ijara (Islamic)' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <NumberInput 
              source="totalExposure" 
              label="Total Exposure" 
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <NumberInput 
              source="numberOfAccounts" 
              label="Number of Accounts" 
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SelectInput
              source="riskCategory"
              label="Risk Category"
              choices={[
                { id: 'low', name: 'Low Risk' },
                { id: 'medium', name: 'Medium Risk' },
                { id: 'high', name: 'High Risk' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SelectInput
              source="currency"
              label="Currency"
              choices={[
                { id: 'USD', name: 'US Dollar' },
                { id: 'EUR', name: 'Euro' },
                { id: 'GBP', name: 'British Pound' },
                { id: 'IDR', name: 'Indonesian Rupiah' },
                { id: 'MYR', name: 'Malaysian Ringgit' },
              ]}
              validate={required()}
              fullWidth
            />
          </Grid>
          
          <Grid item xs={12}>
            <BooleanInput 
              source="isActive" 
              label="Active"
            />
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  );
};

// Export portfolio resource configuration
export const PortfolioResource = {
  list: PortfolioList,
  show: PortfolioShow,
  create: PortfolioCreate,
  edit: PortfolioEdit,
};