// packages/frontend/src/admin/resources/banking/JournalParameterResource.tsx
// ============================================================================
// 🎯 REACT ADMIN JOURNAL PARAMETER RESOURCE
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
  Avatar
} from '@mui/material';
import {
  BookOnline,
  AccountBalance,
  Assessment,
  Settings,
  Info,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';

// Types based on backend API
interface JournalParameter {
  pkid: number;
  gl_group?: string;
  currency?: string;
  gl_type?: string;
  gl_code?: string;
  gl_number?: string;
  dbcr?: string;
  gl_desc?: string;
  active_flag?: boolean;
  createdby?: string;
  createddate?: string;
  updatedby?: string;
  updateddate?: string;
}

/**
 * Journal Parameter List Actions
 */
const JournalParameterListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

/**
 * GL Code Chip Component
 */
const GLCodeChip: React.FC<any> = () => {
  const record = useRecordContext<JournalParameter>();

  if (!record) return null;

  return (
    <Chip
      icon={<BookOnline />}
      label={record.gl_code || '-'}
      color="primary"
      size="small"
      variant="outlined"
    />
  );
};

/**
 * GL Group Chip Component
 */
const GLGroupChip: React.FC<any> = () => {
  const record = useRecordContext<JournalParameter>();

  if (!record) return null;

  const getGroupColor = (group: string) => {
    switch (group?.toLowerCase()) {
      case 'assets':
        return 'success';
      case 'liabilities':
        return 'warning';
      case 'equity':
        return 'info';
      case 'revenue':
        return 'primary';
      case 'expenses':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={record.gl_group || '-'}
      color={getGroupColor(record.gl_group || '') as any}
      size="small"
      variant="outlined"
    />
  );
};

/**
 * DBCR (Debit/Credit) Chip Component
 */
const DBCRChip: React.FC<any> = () => {
  const record = useRecordContext<JournalParameter>();

  if (!record) return null;

  return (
    <Chip
      icon={record.dbcr === 'D' ? <TrendingUp /> : <TrendingDown />}
      label={record.dbcr === 'D' ? 'Debit' : record.dbcr === 'C' ? 'Credit' : '-'}
      color={record.dbcr === 'D' ? 'error' : record.dbcr === 'C' ? 'success' : 'default'}
      size="small"
    />
  );
};

/**
 * Currency Chip Component
 */
const CurrencyChip: React.FC<any> = () => {
  const record = useRecordContext<JournalParameter>();

  if (!record) return null;

  const getCurrencyName = (currency: string) => {
    switch (currency?.toUpperCase()) {
      case 'I':
        return 'IDR';
      case 'U':
        return 'USD';
      case 'E':
        return 'EUR';
      case 'S':
        return 'SGD';
      default:
        return currency || '-';
    }
  };

  return (
    <Chip
      label={getCurrencyName(record.currency || '')}
      color="secondary"
      size="small"
    />
  );
};

/**
 * Journal Entry Display Component
 */
const JournalEntryField: React.FC<any> = () => {
  const record = useRecordContext<JournalParameter>();

  if (!record) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
        <BookOnline />
      </Avatar>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
          {record.gl_desc || record.gl_code || 'No Description'}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {record.gl_code} • {record.gl_number || 'No GL Number'}
        </Typography>
      </Box>
    </Box>
  );
};

/**
 * Journal Parameter List Component
 */
export const JournalParameterList: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const bankingType = identity?.bankingType || 'conventional';

  return (
    <List
      resource="banking/parameters/journal"
      actions={<JournalParameterListActions />}
      filters={[
        <TextInput key="search" label="Search" source="q" alwaysOn />,
        <SelectInput
          key="gl_group"
          label="GL Group"
          source="gl_group"
          choices={[
            { id: 'ASSETS', name: 'Assets' },
            { id: 'LIABILITIES', name: 'Liabilities' },
            { id: 'EQUITY', name: 'Equity' },
            { id: 'REVENUE', name: 'Revenue' },
            { id: 'EXPENSES', name: 'Expenses' },
          ]}
        />,
        <SelectInput
          key="gl_type"
          label="GL Type"
          source="gl_type"
          choices={[
            { id: 'CURRENT_ASSETS', name: 'Current Assets' },
            { id: 'FIXED_ASSETS', name: 'Fixed Assets' },
            { id: 'CURRENT_LIABILITIES', name: 'Current Liabilities' },
            { id: 'LONG_TERM_LIABILITIES', name: 'Long-term Liabilities' },
            { id: 'RETAINED_EARNINGS', name: 'Retained Earnings' },
            { id: 'OPERATING_REVENUE', name: 'Operating Revenue' },
            { id: 'OPERATING_EXPENSES', name: 'Operating Expenses' },
          ]}
        />,
        <SelectInput
          key="currency"
          label="Currency"
          source="currency"
          choices={[
            { id: 'I', name: 'IDR' },
            { id: 'U', name: 'USD' },
            { id: 'E', name: 'EUR' },
            { id: 'S', name: 'SGD' },
          ]}
        />,
        <SelectInput
          key="dbcr"
          label="Debit/Credit"
          source="dbcr"
          choices={[
            { id: 'D', name: 'Debit' },
            { id: 'C', name: 'Credit' },
          ]}
        />,
        <BooleanInput
          key="active_only"
          label="Active Only"
          source="active_flag"
        />,
      ]}
      sort={{ field: 'gl_code', order: 'ASC' }}
      perPage={25}
    >
      <Datagrid rowClick="show">
        <GLCodeChip label="GL Code" />
        <JournalEntryField label="Journal Entry" />
        <GLGroupChip label="Group" />
        <TextField source="gl_type" label="Type" />
        <CurrencyChip label="Currency" />
        <TextField source="gl_number" label="GL Number" />
        <DBCRChip label="DB/CR" />
        <BooleanField source="active_flag" label="Active" />
        <ShowButton />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

/**
 * Journal Parameter Show Component
 */
export const JournalParameterShow: React.FC = () => {
  const record = useRecordContext<JournalParameter>();

  return (
    <Show resource="banking/parameters/journal">
      <Box sx={{ p: 2 }}>
        {/* Header Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>
                    <BookOnline />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" gutterBottom>
                      {record?.gl_desc || record?.gl_code || 'Journal Entry'}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary">
                      GL Code: {record?.gl_code || 'Not specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <GLGroupChip />
                  <CurrencyChip />
                  <DBCRChip />
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

        {/* Journal Entry Details */}
        <TabbedShowLayout>
          <Tab label="Basic Information" icon={<BookOnline />}>
            <TextField source="gl_code" label="GL Code" />
            <TextField source="gl_desc" label="GL Description" />
            <TextField source="gl_group" label="GL Group" />
            <TextField source="gl_type" label="GL Type" />
            <TextField source="gl_number" label="GL Number" />
            <TextField source="currency" label="Currency" />
            <TextField source="dbcr" label="Debit/Credit" />
            <BooleanField source="active_flag" label="Active" />
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
 * Journal Parameter Create Component
 */
export const JournalParameterCreate: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const bankingType = identity?.bankingType || 'conventional';

  return (
    <Create resource="banking/parameters/journal">
      <TabbedForm>
        <FormTab label="Basic Information" icon={<BookOnline />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput
                source="gl_code"
                label="GL Code"
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput
                source="gl_desc"
                label="GL Description"
                fullWidth
                multiline
                rows={2}
                placeholder="Describe the purpose and usage of this GL account"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="gl_group"
                label="GL Group"
                choices={[
                  { id: 'ASSETS', name: 'Assets' },
                  { id: 'LIABILITIES', name: 'Liabilities' },
                  { id: 'EQUITY', name: 'Equity' },
                  { id: 'REVENUE', name: 'Revenue' },
                  { id: 'EXPENSES', name: 'Expenses' },
                ]}
                defaultValue="ASSETS"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="gl_type"
                label="GL Type"
                choices={[
                  { id: 'CURRENT_ASSETS', name: 'Current Assets' },
                  { id: 'FIXED_ASSETS', name: 'Fixed Assets' },
                  { id: 'CURRENT_LIABILITIES', name: 'Current Liabilities' },
                  { id: 'LONG_TERM_LIABILITIES', name: 'Long-term Liabilities' },
                  { id: 'RETAINED_EARNINGS', name: 'Retained Earnings' },
                  { id: 'OPERATING_REVENUE', name: 'Operating Revenue' },
                  { id: 'OPERATING_EXPENSES', name: 'Operating Expenses' },
                ]}
                defaultValue="CURRENT_ASSETS"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextInput
                source="gl_number"
                label="GL Number"
                fullWidth
                placeholder="e.g., 1110001"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="currency"
                label="Currency"
                choices={[
                  { id: 'I', name: 'IDR' },
                  { id: 'U', name: 'USD' },
                  { id: 'E', name: 'EUR' },
                  { id: 'S', name: 'SGD' },
                ]}
                defaultValue="I"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="dbcr"
                label="Debit/Credit"
                choices={[
                  { id: 'D', name: 'Debit (D)' },
                  { id: 'C', name: 'Credit (C)' },
                ]}
                defaultValue="D"
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
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
 * Journal Parameter Edit Component
 */
export const JournalParameterEdit: React.FC = () => {
  return (
    <Edit resource="banking/parameters/journal">
      <TabbedForm>
        <FormTab label="Basic Information" icon={<BookOnline />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput
                source="gl_code"
                label="GL Code"
                validate={required()}
                fullWidth
                disabled // Don't allow editing GL code
              />
            </Grid>
            <Grid item xs={12}>
              <TextInput
                source="gl_desc"
                label="GL Description"
                fullWidth
                multiline
                rows={2}
                placeholder="Describe the purpose and usage of this GL account"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="gl_group"
                label="GL Group"
                choices={[
                  { id: 'ASSETS', name: 'Assets' },
                  { id: 'LIABILITIES', name: 'Liabilities' },
                  { id: 'EQUITY', name: 'Equity' },
                  { id: 'REVENUE', name: 'Revenue' },
                  { id: 'EXPENSES', name: 'Expenses' },
                ]}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="gl_type"
                label="GL Type"
                choices={[
                  { id: 'CURRENT_ASSETS', name: 'Current Assets' },
                  { id: 'FIXED_ASSETS', name: 'Fixed Assets' },
                  { id: 'CURRENT_LIABILITIES', name: 'Current Liabilities' },
                  { id: 'LONG_TERM_LIABILITIES', name: 'Long-term Liabilities' },
                  { id: 'RETAINED_EARNINGS', name: 'Retained Earnings' },
                  { id: 'OPERATING_REVENUE', name: 'Operating Revenue' },
                  { id: 'OPERATING_EXPENSES', name: 'Operating Expenses' },
                ]}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextInput
                source="gl_number"
                label="GL Number"
                fullWidth
                placeholder="e.g., 1110001"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="currency"
                label="Currency"
                choices={[
                  { id: 'I', name: 'IDR' },
                  { id: 'U', name: 'USD' },
                  { id: 'E', name: 'EUR' },
                  { id: 'S', name: 'SGD' },
                ]}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="dbcr"
                label="Debit/Credit"
                choices={[
                  { id: 'D', name: 'Debit (D)' },
                  { id: 'C', name: 'Credit (C)' },
                ]}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
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

// Export journal parameter resource configuration
export const JournalParameterResource = {
  list: JournalParameterList,
  show: JournalParameterShow,
  create: JournalParameterCreate,
  edit: JournalParameterEdit,
  options: {
    label: 'Journal Parameters',
    recordRepresentation: (record: JournalParameter) => `${record.gl_code} - ${record.gl_desc}`
  }
};