// packages/frontend/src/app/platform/resources/tenants/index.ts
// ============================================================================
// IFRS9 PLATFORM - TENANT MANAGEMENT RESOURCE FOR REACT ADMIN
// ============================================================================
// 🏢 Complete CRUD operations for banking institution tenants
// ✅ Uses real database data from ifrspro_platform_admin
// ✅ Integrates with existing API patterns and Material-UI
// ✅ Supports multi-tenant status management and billing
// ============================================================================

import React from 'react'
import {
  List,
  Datagrid,
  TextField,
  EmailField,
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
  SelectInput,
  BooleanInput,
  DateInput,
  NumberInput,
  required,
  email,
  Filter,
  SearchInput,
  useRecordContext,
  FunctionField,
  ArrayField,
  SingleFieldList,
  TopToolbar,
  CreateButton,
  ExportButton
} from 'react-admin'

import {
  Box,
  Typography,
  Chip,
  Avatar,
  Stack,
  Card,
  CardContent,
  Grid,
  Alert,
  LinearProgress,
  Divider
} from '@mui/material'

import {
  Business,
  AccountBalance,
  Payment,
  Storage,
  People,
  TrendingUp,
  Security,
  Warning,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material'

// ============================================================================
// TENANT LIST FILTERS
// ============================================================================

const TenantFilters = () => (
  <Filter>
    <SearchInput source="q" placeholder="Search tenants..." alwaysOn />
    <SelectInput
      source="status"
      choices={[
        { id: 'provisioning', name: 'Provisioning' },
        { id: 'active', name: 'Active' },
        { id: 'suspended', name: 'Suspended' },
        { id: 'terminated', name: 'Terminated' },
      ]}
      emptyText="All Statuses"
    />
    <SelectInput
      source="banking_type"
      choices={[
        { id: 'conventional', name: 'Conventional' },
        { id: 'syariah', name: 'Syariah' },
        { id: 'dual', name: 'Dual Banking' },
      ]}
      emptyText="All Banking Types"
    />
    <SelectInput
      source="subscription_tier"
      choices={[
        { id: 'basic', name: 'Basic' },
        { id: 'premium', name: 'Premium' },
        { id: 'enterprise', name: 'Enterprise' },
      ]}
      emptyText="All Tiers"
    />
  </Filter>
)

// ============================================================================
// TENANT LIST ACTIONS
// ============================================================================

const TenantListActions = () => (
  <TopToolbar>
    <CreateButton />
    <ExportButton />
  </TopToolbar>
)

// ============================================================================
// CUSTOM FIELD COMPONENTS
// ============================================================================

const TenantStatusChip = () => {
  const record = useRecordContext()
  if (!record) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success'
      case 'provisioning': return 'info'
      case 'suspended': return 'warning'
      case 'terminated': return 'error'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />
      case 'provisioning': return <Storage />
      case 'suspended': return <Warning />
      case 'terminated': return <ErrorIcon />
      default: return null
    }
  }

  return (
    <Chip
      label={record.status}
      color={getStatusColor(record.status) as any}
      size="small"
      icon={getStatusIcon(record.status)}
      sx={{ textTransform: 'capitalize' }}
    />
  )
}

const BankingTypeChip = () => {
  const record = useRecordContext()
  if (!record) return null

  const getBankingTypeColor = (type: string) => {
    switch (type) {
      case 'conventional': return '#1976d2'
      case 'syariah': return '#2e7d32'
      case 'dual': return '#ed6c02'
      default: return '#9e9e9e'
    }
  }

  return (
    <Chip
      label={record.banking_type}
      size="small"
      sx={{
        backgroundColor: getBankingTypeColor(record.banking_type),
        color: 'white',
        textTransform: 'capitalize'
      }}
    />
  )
}

const TenantUsageBar = () => {
  const record = useRecordContext()
  if (!record || !record.usage_metrics) return null

  const usagePercent = record.usage_metrics.storage_usage_percent || 0

  return (
    <Box sx={{ width: 100 }}>
      <LinearProgress
        variant="determinate"
        value={usagePercent}
        color={usagePercent > 80 ? 'warning' : 'primary'}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <Typography variant="caption" color="text.secondary">
        {usagePercent}%
      </Typography>
    </Box>
  )
}

// ============================================================================
// TENANT LIST COMPONENT
// ============================================================================

export const TenantList = () => (
  <List
    filters={<TenantFilters />}
    actions={<TenantListActions />}
    sort={{ field: 'tenant_name', order: 'ASC' }}
    perPage={25}
    title="Banking Institution Tenants"
  >
    <Datagrid rowClick="show" bulkActionButtons={false}>
      
      {/* Tenant Basic Info */}
      <FunctionField
        source="tenant_name"
        label="Institution"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 32, height: 32, backgroundColor: '#1976d2' }}>
              <Business fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {record.tenant_name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {record.tenant_slug}
              </Typography>
            </Box>
          </Box>
        )}
      />

      {/* Banking Type */}
      <FunctionField
        source="banking_type"
        label="Banking Type"
        render={() => <BankingTypeChip />}
      />

      {/* Status */}
      <FunctionField
        source="status"
        label="Status"
        render={() => <TenantStatusChip />}
      />

      {/* Subscription */}
      <ChipField
        source="subscription_tier"
        label="Tier"
        transform={(value: string) => value?.toUpperCase()}
        sx={{ textTransform: 'uppercase' }}
      />

      {/* Usage */}
      <FunctionField
        source="usage_metrics"
        label="Usage"
        render={() => <TenantUsageBar />}
      />

      {/* Users Count */}
      <FunctionField
        source="user_count"
        label="Users"
        render={(record: any) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <People fontSize="small" color="action" />
            <Typography variant="body2">
              {record.user_count || 0}
            </Typography>
          </Box>
        )}
      />

      {/* Created Date */}
      <DateField source="created_at" label="Created" showTime />

      {/* Actions */}
      <Box>
        <ShowButton />
        <EditButton />
        <DeleteButton />
      </Box>

    </Datagrid>
  </List>
)

// ============================================================================
// TENANT SHOW COMPONENT
// ============================================================================

export const TenantShow = () => (
  <Show title="Banking Institution Details">
    <SimpleShowLayout>
      
      {/* Header Information */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar sx={{ width: 64, height: 64, backgroundColor: '#1976d2' }}>
                  <Business fontSize="large" />
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h5" component="h2" gutterBottom>
                  <TextField source="tenant_name" />
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  <TextField source="description" />
                </Typography>
                <Stack direction="row" spacing={1} mt={1}>
                  <BankingTypeChip />
                  <TenantStatusChip />
                  <ChipField source="subscription_tier" transform={(value: string) => value?.toUpperCase()} />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Basic Information */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
        🏢 Basic Information
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField source="tenant_slug" label="Tenant Slug" />
          <TextField source="database_name" label="Database Name" />
          <TextField source="contact_email" label="Contact Email" />
          <TextField source="contact_phone" label="Contact Phone" />
        </Grid>
        <Grid item xs={12} md={6}>
          <DateField source="created_at" label="Created At" showTime />
          <DateField source="updated_at" label="Updated At" showTime />
          <BooleanField source="is_active" label="Active Status" />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Banking Configuration */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        🏦 Banking Configuration
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextField source="banking_type" label="Banking Type" />
          <TextField source="subscription_tier" label="Subscription Tier" />
          <TextField source="billing_contact" label="Billing Contact" />
        </Grid>
        <Grid item xs={12} md={6}>
          <DateField source="subscription_start_date" label="Subscription Start" />
          <DateField source="subscription_end_date" label="Subscription End" />
          <NumberInput source="max_users" label="Maximum Users" disabled />
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      {/* Usage Metrics */}
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        📊 Usage Metrics
      </Typography>
      <FunctionField
        render={(record: any) => (
          <Grid container spacing={2}>
            {record.usage_metrics && (
              <>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {record.usage_metrics.active_users || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Active Users
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {record.usage_metrics.storage_used_gb || 0} GB
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Storage Used
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {record.usage_metrics.api_calls_month || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        API Calls/Month
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" color="primary">
                        {record.usage_metrics.uptime_percent || 0}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Uptime
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>
        )}
      />

    </SimpleShowLayout>
  </Show>
)

// ============================================================================
// TENANT EDIT COMPONENT
// ============================================================================

export const TenantEdit = () => (
  <Edit title="Edit Banking Institution">
    <SimpleForm>
      
      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        🏢 Basic Information
      </Typography>
      
      <TextInput source="tenant_name" label="Institution Name" validate={required()} fullWidth />
      <TextInput source="description" label="Description" multiline rows={3} fullWidth />
      <TextInput source="tenant_slug" label="Tenant Slug" validate={required()} disabled />
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SelectInput
            source="banking_type"
            label="Banking Type"
            choices={[
              { id: 'conventional', name: 'Conventional Banking' },
              { id: 'syariah', name: 'Syariah Banking' },
              { id: 'dual', name: 'Dual Banking' },
            ]}
            validate={required()}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectInput
            source="status"
            label="Status"
            choices={[
              { id: 'provisioning', name: 'Provisioning' },
              { id: 'active', name: 'Active' },
              { id: 'suspended', name: 'Suspended' },
              { id: 'terminated', name: 'Terminated' },
            ]}
            validate={required()}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
        📞 Contact Information
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextInput
            source="contact_email"
            label="Contact Email"
            type="email"
            validate={[required(), email()]}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextInput source="contact_phone" label="Contact Phone" fullWidth />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
        💳 Subscription & Billing
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <SelectInput
            source="subscription_tier"
            label="Subscription Tier"
            choices={[
              { id: 'basic', name: 'Basic' },
              { id: 'premium', name: 'Premium' },
              { id: 'enterprise', name: 'Enterprise' },
            ]}
            validate={required()}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DateInput source="subscription_start_date" label="Subscription Start" />
        </Grid>
        <Grid item xs={12} md={4}>
          <DateInput source="subscription_end_date" label="Subscription End" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextInput source="billing_contact" label="Billing Contact" fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <NumberInput source="max_users" label="Maximum Users" min={1} />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
        ⚙️ Settings
      </Typography>
      
      <BooleanInput source="is_active" label="Active Status" />
      
    </SimpleForm>
  </Edit>
)

// ============================================================================
// TENANT CREATE COMPONENT
// ============================================================================

export const TenantCreate = () => (
  <Create title="Create New Banking Institution">
    <SimpleForm>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Creating a new banking institution tenant</strong><br />
          This will provision a new isolated database environment for the banking institution.
          Please ensure all information is accurate before proceeding.
        </Typography>
      </Alert>

      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
        🏢 Basic Information
      </Typography>
      
      <TextInput
        source="tenant_name"
        label="Institution Name"
        validate={required()}
        fullWidth
        helperText="Full legal name of the banking institution"
      />
      
      <TextInput
        source="description"
        label="Description"
        multiline
        rows={3}
        fullWidth
        helperText="Brief description of the banking institution"
      />
      
      <TextInput
        source="tenant_slug"
        label="Tenant Slug"
        validate={required()}
        fullWidth
        helperText="URL-friendly identifier (lowercase, no spaces)"
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <SelectInput
            source="banking_type"
            label="Banking Type"
            choices={[
              { id: 'conventional', name: 'Conventional Banking' },
              { id: 'syariah', name: 'Syariah Banking' },
              { id: 'dual', name: 'Dual Banking' },
            ]}
            validate={required()}
            defaultValue="conventional"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectInput
            source="subscription_tier"
            label="Subscription Tier"
            choices={[
              { id: 'basic', name: 'Basic' },
              { id: 'premium', name: 'Premium' },
              { id: 'enterprise', name: 'Enterprise' },
            ]}
            validate={required()}
            defaultValue="basic"
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
        📞 Contact Information
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextInput
            source="contact_email"
            label="Primary Contact Email"
            type="email"
            validate={[required(), email()]}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextInput source="contact_phone" label="Contact Phone" fullWidth />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mt: 3 }}>
        💳 Subscription Settings
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <DateInput
            source="subscription_start_date"
            label="Subscription Start Date"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NumberInput
            source="max_users"
            label="Maximum Users"
            min={1}
            defaultValue={10}
          />
        </Grid>
      </Grid>

      <TextInput source="billing_contact" label="Billing Contact" fullWidth />
      
    </SimpleForm>
  </Create>
)