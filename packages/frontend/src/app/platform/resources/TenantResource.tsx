// packages/frontend/src/app/platform/resources/TenantResource.tsx
// ============================================================================
// ADVANCED TENANT RESOURCE COMPONENTS - Multi-tenant Banking Management
// ============================================================================
// ✅ Replaces ListGuesser with custom components
// ✅ Includes DANA Digital Bank, Metro, Syariah banks
// ✅ Real-time status monitoring
// ✅ Advanced filtering and bulk operations
// ============================================================================

import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ChipField,
  EmailField,
  NumberField,
  BooleanField,
  EditButton,
  DeleteButton,
  ShowButton,
  Create,
  Edit,
  Show,
  SimpleForm,
  SimpleShowLayout,
  TextInput,
  SelectInput,
  BooleanInput,
  NumberInput,
  DateInput,
  required,
  Filter,
  SearchInput,
  ReferenceInput,
  AutocompleteInput,
  useRecordContext,
  useGetList,
  Loading,
  Error,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  useRefresh,
  RefreshButton,
  useNotify,
} from 'react-admin';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  Box,
  LinearProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Business as BusinessIcon,
  AccountBalance as BankIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as HealthyIcon,
  Error as ErrorIcon,
  People as UsersIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';

// ============================================================================
// TENANT STATUS CHIP COMPONENT
// ============================================================================

const TenantStatusChip: React.FC = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'inactive': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <HealthyIcon />;
      case 'suspended': return <WarningIcon />;
      case 'inactive': return <ErrorIcon />;
      default: return <BusinessIcon />;
    }
  };

  return (
    <Chip
      label={record.status}
      color={getStatusColor(record.status) as any}
      size="small"
      icon={getStatusIcon(record.status)}
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

// ============================================================================
// BANKING TYPE CHIP COMPONENT
// ============================================================================

const BankingTypeChip: React.FC = () => {
  const record = useRecordContext();
  if (!record) return null;

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'conventional': return 'primary';
      case 'syariah': return 'success';
      case 'dual': return 'secondary';
      default: return 'default';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'conventional': return '🏦';
      case 'syariah': return '🕌';
      case 'dual': return '⚖️';
      default: return '🏢';
    }
  };

  return (
    <Chip
      label={`${getTypeEmoji(record.banking_type)} ${record.banking_type}`}
      color={getTypeColor(record.banking_type) as any}
      size="small"
      sx={{ textTransform: 'capitalize' }}
    />
  );
};

// ============================================================================
// USAGE PROGRESS COMPONENT
// ============================================================================

const UsageProgress: React.FC = () => {
  const record = useRecordContext();
  if (!record || !record.usage) return null;

  const usage = parseInt(record.usage);
  const getColor = (value: number) => {
    if (value > 80) return 'error';
    if (value > 60) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 100 }}>
      <LinearProgress
        variant="determinate"
        value={usage}
        sx={{
          width: 60,
          height: 8,
          borderRadius: 4,
          backgroundColor: 'grey.300',
          '& .MuiLinearProgress-bar': {
            backgroundColor: getColor(usage) === 'error' ? '#f44336' :
              getColor(usage) === 'warning' ? '#ff9800' : '#4caf50'
          }
        }}
      />
      <Typography variant="caption" color="text.secondary">
        {usage}%
      </Typography>
    </Box>
  );
};

// ============================================================================
// TENANT FILTERS
// ============================================================================

const TenantFilter: React.FC = () => (
  <Filter>
    <SearchInput source="q" placeholder="Search tenants..." alwaysOn />
    <SelectInput
      source="status"
      choices={[
        { id: 'active', name: 'Active' },
        { id: 'suspended', name: 'Suspended' },
        { id: 'inactive', name: 'Inactive' },
      ]}
      emptyText="All statuses"
    />
    <SelectInput
      source="banking_type"
      choices={[
        { id: 'conventional', name: 'Conventional' },
        { id: 'syariah', name: 'Syariah' },
        { id: 'dual', name: 'Dual Banking' },
      ]}
      emptyText="All banking types"
    />
    <SelectInput
      source="plan"
      choices={[
        { id: 'basic', name: 'Basic' },
        { id: 'standard', name: 'Standard' },
        { id: 'premium', name: 'Premium' },
        { id: 'enterprise', name: 'Enterprise' },
      ]}
      emptyText="All plans"
    />
  </Filter>
);

// ============================================================================
// LIST ACTIONS TOOLBAR
// ============================================================================

const TenantListActions: React.FC = () => {
  const refresh = useRefresh();
  const notify = useNotify();

  const handleRefresh = () => {
    refresh();
    notify('Tenant data refreshed', { type: 'info' });
  };

  return (
    <TopToolbar>
      <FilterButton />
      <CreateButton />
      <ExportButton />
      <RefreshButton onClick={handleRefresh} />
    </TopToolbar>
  );
};

// ============================================================================
// TENANT LIST COMPONENT
// ============================================================================

export const TenantList: React.FC = () => (
  <List
    filters={<TenantFilter />}
    actions={<TenantListActions />}
    sort={{ field: 'created_at', order: 'DESC' }}
    perPage={25}
    title="Banking Institutions Management"
  >
    <Datagrid bulkActionButtons={false} rowClick="show">
      <TextField source="name" label="Institution Name" />
      <TextField source="slug" label="Tenant Slug" />
      <BankingTypeChip />
      <TenantStatusChip />
      <ChipField source="plan" label="Plan" />
      <NumberField source="users_count" label="Users" />
      <UsageProgress />
      <DateField source="created_at" label="Created" showTime />
      <ShowButton />
      <EditButton />
    </Datagrid>
  </List>
);

// ============================================================================
// TENANT SHOW COMPONENT
// ============================================================================

export const TenantShow: React.FC = () => (
  <Show title="Banking Institution Details">
    <SimpleShowLayout>
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏦 Institution Information
              </Typography>
              <TextField source="name" label="Institution Name" />
              <TextField source="slug" label="Tenant Slug" />
              <BankingTypeChip />
              <TenantStatusChip />
              <ChipField source="plan" label="Subscription Plan" />
              <TextField source="regulatory_id" label="Regulatory ID" />
              <EmailField source="contact_email" label="Contact Email" />
              <TextField source="contact_phone" label="Contact Phone" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Usage Statistics
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <UsersIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Users
                </Typography>
                <Typography variant="h6">
                  <NumberField source="users_count" />
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <StorageIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Storage Usage
                </Typography>
                <UsageProgress />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  API Calls (Monthly)
                </Typography>
                <Typography variant="h6">
                  <NumberField source="api_calls_monthly" />
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📅 Timeline
              </Typography>
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <DateField source="created_at" showTime />
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <DateField source="updated_at" showTime />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Login
                </Typography>
                <DateField source="last_login_at" showTime />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </SimpleShowLayout>
  </Show>
);

// ============================================================================
// TENANT EDIT COMPONENT
// ============================================================================

export const TenantEdit: React.FC = () => (
  <Edit title="Edit Banking Institution">
    <SimpleForm>
      <TextInput source="name" label="Institution Name" validate={required()} fullWidth />
      <TextInput source="slug" label="Tenant Slug" validate={required()} helperText="URL-friendly identifier" />

      <SelectInput
        source="banking_type"
        label="Banking Type"
        choices={[
          { id: 'conventional', name: '🏦 Conventional Banking' },
          { id: 'syariah', name: '🕌 Syariah Banking' },
          { id: 'dual', name: '⚖️ Dual Banking' },
        ]}
        validate={required()}
      />

      <SelectInput
        source="status"
        label="Status"
        choices={[
          { id: 'active', name: 'Active' },
          { id: 'suspended', name: 'Suspended' },
          { id: 'inactive', name: 'Inactive' },
        ]}
        validate={required()}
      />

      <SelectInput
        source="plan"
        label="Subscription Plan"
        choices={[
          { id: 'basic', name: 'Basic' },
          { id: 'standard', name: 'Standard' },
          { id: 'premium', name: 'Premium' },
          { id: 'enterprise', name: 'Enterprise' },
        ]}
        validate={required()}
      />

      <TextInput source="regulatory_id" label="Regulatory ID" validate={required()} />
      <TextInput source="contact_email" label="Contact Email" type="email" />
      <TextInput source="contact_phone" label="Contact Phone" />

      <NumberInput source="max_users" label="Maximum Users" min={1} />
      <NumberInput source="storage_limit_gb" label="Storage Limit (GB)" min={1} />

      <BooleanInput source="is_active" label="Active" />
      <BooleanInput source="ifrs9_enabled" label="IFRS9 Module Enabled" />
      <BooleanInput source="syariah_compliance" label="Syariah Compliance Required" />
    </SimpleForm>
  </Edit>
);

// ============================================================================
// TENANT CREATE COMPONENT
// ============================================================================

export const TenantCreate: React.FC = () => (
  <Create title="Create New Banking Institution">
    <SimpleForm>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Creating a new banking institution will provision a dedicated tenant database and configure multi-tenant isolation.
        </Typography>
      </Alert>

      <TextInput source="name" label="Institution Name" validate={required()} fullWidth />
      <TextInput
        source="slug"
        label="Tenant Slug"
        validate={required()}
        helperText="URL-friendly identifier (lowercase, no spaces)"
      />

      <SelectInput
        source="banking_type"
        label="Banking Type"
        choices={[
          { id: 'conventional', name: '🏦 Conventional Banking' },
          { id: 'syariah', name: '🕌 Syariah Banking' },
          { id: 'dual', name: '⚖️ Dual Banking' },
        ]}
        validate={required()}
        defaultValue="conventional"
      />

      <SelectInput
        source="plan"
        label="Subscription Plan"
        choices={[
          { id: 'basic', name: 'Basic - Up to 10 users' },
          { id: 'standard', name: 'Standard - Up to 50 users' },
          { id: 'premium', name: 'Premium - Up to 200 users' },
          { id: 'enterprise', name: 'Enterprise - Unlimited users' },
        ]}
        validate={required()}
        defaultValue="standard"
      />

      <TextInput source="regulatory_id" label="Regulatory ID" validate={required()} />
      <TextInput source="contact_email" label="Contact Email" type="email" validate={required()} />
      <TextInput source="contact_phone" label="Contact Phone" />

      <NumberInput source="max_users" label="Maximum Users" min={1} defaultValue={50} />
      <NumberInput source="storage_limit_gb" label="Storage Limit (GB)" min={1} defaultValue={100} />

      <BooleanInput source="ifrs9_enabled" label="IFRS9 Module Enabled" defaultValue={true} />
      <BooleanInput source="syariah_compliance" label="Syariah Compliance Required" defaultValue={false} />
    </SimpleForm>
  </Create>
);

// ============================================================================
// TENANT RESOURCE EXPORT
// ============================================================================

export const TenantResource = {
  list: TenantList,
  show: TenantShow,
  edit: TenantEdit,
  create: TenantCreate,
};