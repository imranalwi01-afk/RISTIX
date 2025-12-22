// packages/frontend/src/admin/resources/banking/EnhancedPortfolioAccountResource.tsx
// ============================================================================
// Enhanced Portfolio Account Resource for React Admin
// ============================================================================
// Generated: 2025-01-11
// Purpose: Complete CRUD operations for portfolio accounts with banking features
// Methodology: React Admin v4 resource with dual banking support and advanced filtering
// Dependencies: Banking resource data provider, Material-UI components
// ============================================================================

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
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
  Filter,
  SearchInput,
  TopToolbar,
  ExportButton,
  BulkDeleteButton,
  BulkUpdateButton,
  useRecordContext,
  useGetList,
  useNotify,
  Button,
  FunctionField
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
  Stack
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Portfolio Account Filters
const PortfolioAccountFilter = (props: any) => (
  <Filter {...props}>
    <SearchInput source="search" placeholder="Search accounts, customers..." alwaysOn />
    <SelectInput
      source="stage"
      label="IFRS 9 Stage"
      choices={[
        { id: '1', name: 'Stage 1 (12-month ECL)' },
        { id: '2', name: 'Stage 2 (Lifetime ECL)' },
        { id: '3', name: 'Stage 3 (Credit Impaired)' },
      ]}
      emptyText="All"
    />
    <SelectInput
      source="productType"
      label="Product Type"
      choices={[
        { id: 'MORTGAGE', name: 'Mortgage' },
        { id: 'PERSONAL_LOAN', name: 'Personal Loan' },
        { id: 'CORPORATE_LOAN', name: 'Corporate Loan' },
        { id: 'CREDIT_CARD', name: 'Credit Card' },
        { id: 'MURABAHA', name: 'Murabaha (Islamic)' },
        { id: 'MUSHARAKA', name: 'Musharaka (Islamic)' },
        { id: 'IJARAH', name: 'Ijarah (Islamic)' },
      ]}
      emptyText="All"
    />
    <SelectInput
      source="bankingType"
      label="Banking Type"
      choices={[
        { id: 'conventional', name: 'Conventional' },
        { id: 'syariah', name: 'Syariah' },
      ]}
      emptyText="All"
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
      emptyText="All"
    />
    <DateInput source="dateFrom" label="From Date" />
    <DateInput source="dateTo" label="To Date" />
  </Filter>
);

// Custom IFRS 9 Stage Chip Component
const StageChip = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getStageColor = (stage: number) => {
    switch (stage) {
      case 1: return 'success';
      case 2: return 'warning';
      case 3: return 'error';
      default: return 'default';
    }
  };

  const getStageLabel = (stage: number) => {
    switch (stage) {
      case 1: return 'Stage 1 (12m ECL)';
      case 2: return 'Stage 2 (Lifetime ECL)';
      case 3: return 'Stage 3 (Impaired)';
      default: return `Stage ${stage}`;
    }
  };

  return (
    <Chip
      label={getStageLabel(record.current_stage)}
      color={getStageColor(record.current_stage) as any}
      size="small"
    />
  );
};

// Custom Banking Type Indicator
const BankingTypeIndicator = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Chip
      label={record.banking_type === 'syariah' ? 'Syariah' : 'Conventional'}
      color={record.banking_type === 'syariah' ? 'primary' : 'secondary'}
      size="small"
      variant="outlined"
    />
  );
};

// Custom Actions Toolbar
const PortfolioAccountActions = () => (
  <TopToolbar>
    <ExportButton />
    <Button
      onClick={() => {
        // Custom analytics action
        console.log('Opening portfolio analytics...');
      }}
      label="Analytics"
      startIcon={<AssessmentIcon />}
    />
  </TopToolbar>
);

// Custom Bulk Actions
const PortfolioAccountBulkActions = () => (
  <>
    <BulkUpdateButton data={{ is_active: false }} label="Bulk Deactivate" />
    <BulkDeleteButton />
  </>
);

// Portfolio Account List Component
export const PortfolioAccountList = (props: any) => {
  const notify = useNotify();

  return (
    <List
      {...props}
      filters={<PortfolioAccountFilter />}
      actions={<PortfolioAccountActions />}
      bulkActionButtons={<PortfolioAccountBulkActions />}
      perPage={25}
      sort={{ field: 'created_at', order: 'DESC' }}
      title="Portfolio Accounts"
    >
      <Datagrid rowClick="show" bulkActionButtons={<PortfolioAccountBulkActions />}>
        <TextField source="account_id" label="Account ID" />
        <TextField source="customer_name" label="Customer" />
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
        <FunctionField 
          label="Stage" 
          render={() => <StageChip />} 
        />
        <FunctionField 
          label="Banking Type" 
          render={() => <BankingTypeIndicator />} 
        />
        <DateField source="reporting_date" label="Reporting Date" />
        <BooleanField source="is_active" label="Active" />
        <EditButton />
        <ShowButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

// Portfolio Account Show Component
export const PortfolioAccountShow = (props: any) => (
  <Show {...props} title="Portfolio Account Details">
    <SimpleShowLayout>
      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Account Information
              </Typography>
              <Stack spacing={2}>
                <TextField source="account_id" label="Account ID" />
                <TextField source="customer_name" label="Customer Name" />
                <ChipField source="product_type" label="Product Type" />
                <NumberField 
                  source="outstanding_amount" 
                  label="Outstanding Amount" 
                  options={{ 
                    style: 'currency', 
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0 
                  }} 
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* IFRS 9 Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                IFRS 9 Classification
              </Typography>
              <Stack spacing={2}>
                <FunctionField 
                  label="Current Stage" 
                  render={() => <StageChip />} 
                />
                <DateField source="origination_date" label="Origination Date" />
                <DateField source="reporting_date" label="Reporting Date" />
                <ChipField source="risk_rating" label="Risk Rating" />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Banking Type Specific Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Banking Type Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FunctionField 
                    label="Banking Type" 
                    render={() => <BankingTypeIndicator />} 
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <BooleanField source="is_active" label="Active Status" />
                </Grid>
                
                {/* Syariah-specific fields (conditionally shown) */}
                <FunctionField
                  render={(record: any) => {
                    if (record?.banking_type === 'syariah') {
                      return (
                        <>
                          <Grid item xs={12} md={6}>
                            <TextField source="syariah_contract_type" label="Contract Type" />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <ChipField source="syariah_compliance_status" label="Compliance Status" />
                          </Grid>
                        </>
                      );
                    }
                    return null;
                  }}
                />
              </Grid>
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

// Portfolio Account Edit Component
export const PortfolioAccountEdit = (props: any) => (
  <Edit {...props} title="Edit Portfolio Account">
    <SimpleForm>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextInput source="account_id" label="Account ID" fullWidth disabled />
          <TextInput source="customer_name" label="Customer Name" fullWidth />
          <SelectInput
            source="product_type"
            label="Product Type"
            choices={[
              { id: 'MORTGAGE', name: 'Mortgage' },
              { id: 'PERSONAL_LOAN', name: 'Personal Loan' },
              { id: 'CORPORATE_LOAN', name: 'Corporate Loan' },
              { id: 'CREDIT_CARD', name: 'Credit Card' },
              { id: 'MURABAHA', name: 'Murabaha (Islamic)' },
              { id: 'MUSHARAKA', name: 'Musharaka (Islamic)' },
              { id: 'IJARAH', name: 'Ijarah (Islamic)' },
            ]}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NumberInput source="outstanding_amount" label="Outstanding Amount" fullWidth />
          <DateInput source="origination_date" label="Origination Date" fullWidth />
          <DateInput source="reporting_date" label="Reporting Date" fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectInput
            source="current_stage"
            label="IFRS 9 Stage"
            choices={[
              { id: 1, name: 'Stage 1 (12-month ECL)' },
              { id: 2, name: 'Stage 2 (Lifetime ECL)' },
              { id: 3, name: 'Stage 3 (Credit Impaired)' },
            ]}
            fullWidth
          />
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
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectInput
            source="banking_type"
            label="Banking Type"
            choices={[
              { id: 'conventional', name: 'Conventional' },
              { id: 'syariah', name: 'Syariah' },
            ]}
            fullWidth
          />
          <BooleanInput source="is_active" label="Active" />
        </Grid>

        {/* Syariah-specific fields */}
        <FunctionField
          render={(record: any) => {
            if (record?.banking_type === 'syariah') {
              return (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Syariah Banking Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <SelectInput
                        source="syariah_contract_type"
                        label="Syariah Contract Type"
                        choices={[
                          { id: 'MURABAHA', name: 'Murabaha' },
                          { id: 'MUSHARAKA', name: 'Musharaka' },
                          { id: 'MUDHARABA', name: 'Mudharaba' },
                          { id: 'IJARAH', name: 'Ijarah' },
                          { id: 'SALAM', name: 'Salam' },
                          { id: 'ISTISNA', name: 'Istisna' },
                        ]}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <SelectInput
                        source="syariah_compliance_status"
                        label="Compliance Status"
                        choices={[
                          { id: 'COMPLIANT', name: 'Compliant' },
                          { id: 'UNDER_REVIEW', name: 'Under Review' },
                          { id: 'NON_COMPLIANT', name: 'Non-Compliant' },
                        ]}
                        fullWidth
                      />
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

// Portfolio Account Create Component
export const PortfolioAccountCreate = (props: any) => {
  const notify = useNotify();

  return (
    <Create {...props} title="Create Portfolio Account">
      <SimpleForm>
        <Alert severity="info" sx={{ mb: 2 }}>
          Creating a new portfolio account. All required fields must be completed.
        </Alert>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextInput source="account_id" label="Account ID" fullWidth required />
            <TextInput source="customer_id" label="Customer ID" fullWidth required />
            <TextInput source="customer_name" label="Customer Name" fullWidth />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SelectInput
              source="product_type"
              label="Product Type"
              choices={[
                { id: 'MORTGAGE', name: 'Mortgage' },
                { id: 'PERSONAL_LOAN', name: 'Personal Loan' },
                { id: 'CORPORATE_LOAN', name: 'Corporate Loan' },
                { id: 'CREDIT_CARD', name: 'Credit Card' },
                { id: 'MURABAHA', name: 'Murabaha (Islamic)' },
                { id: 'MUSHARAKA', name: 'Musharaka (Islamic)' },
                { id: 'IJARAH', name: 'Ijarah (Islamic)' },
              ]}
              fullWidth
              required
            />
            <NumberInput source="outstanding_amount" label="Outstanding Amount" fullWidth required />
            <DateInput source="origination_date" label="Origination Date" fullWidth required />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <DateInput source="reporting_date" label="Reporting Date" fullWidth required />
            <SelectInput
              source="current_stage"
              label="IFRS 9 Stage"
              choices={[
                { id: 1, name: 'Stage 1 (12-month ECL)' },
                { id: 2, name: 'Stage 2 (Lifetime ECL)' },
                { id: 3, name: 'Stage 3 (Credit Impaired)' },
              ]}
              defaultValue={1}
              fullWidth
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <SelectInput
              source="banking_type"
              label="Banking Type"
              choices={[
                { id: 'conventional', name: 'Conventional' },
                { id: 'syariah', name: 'Syariah' },
              ]}
              defaultValue="conventional"
              fullWidth
              required
            />
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
            />
            <BooleanInput source="is_active" label="Active" defaultValue={true} />
          </Grid>
        </Grid>
      </SimpleForm>
    </Create>
  );
};

// Resource Configuration
export const EnhancedPortfolioAccountResource = {
  list: PortfolioAccountList,
  show: PortfolioAccountShow,
  edit: PortfolioAccountEdit,
  create: PortfolioAccountCreate,
  icon: AccountBalanceIcon,
  options: {
    label: 'Portfolio Accounts'
  }
};

export default EnhancedPortfolioAccountResource;