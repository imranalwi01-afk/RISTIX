// ============================================================================
// PSDD ARTIFACT DOCUMENTATION
// ============================================================================
// File Path: packages/frontend/src/admin/resources/configurations/ConfigurationResource.tsx
// Generated: Day 2 Hour 6 - Part 2 of 8
// Phase: D2H6 - React Admin Dual Banking Foundation
// Methodology: Phased Shell-Driven Development (PSDD)
// Dependencies: React Admin v4, Material-UI v6
// Purpose: System and tenant configuration management with dual banking support
// ============================================================================

import React, { useState } from 'react';
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
  useNotify,
  ArrayInput,
  SimpleFormIterator
} from 'react-admin';
import {
  Box,
  Chip,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Settings,
  Security,
  AccountBalance,
  Palette,
  Language,
  Notifications,
  Storage,
  CloudSync,
  ExpandMore,
  Save,
  Restore,
  Upload,
  Download
} from '@mui/icons-material';

// Types
interface Configuration {
  id: string;
  configKey: string;
  configName: string;
  configType: 'system' | 'tenant' | 'user';
  category: 'theme' | 'banking' | 'security' | 'notification' | 'calculation' | 'integration';
  bankingType?: 'conventional' | 'syariah' | 'dual';
  configValue: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isActive: boolean;
  isEditable: boolean;
  validationRules?: any;
  defaultValue?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Configuration List Actions
 */
const ConfigurationListActions = () => {
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const notify = useNotify();

  const handleImportConfig = () => {
    setImportDialogOpen(true);
  };

  const handleExportConfig = () => {
    notify('Exporting configuration...', { type: 'info' });
  };

  const handleResetToDefaults = () => {
    notify('Configuration reset to defaults', { type: 'success' });
  };

  return (
    <>
      <TopToolbar>
        <FilterButton />
        <Button
          startIcon={<Upload />}
          onClick={handleImportConfig}
        >
          Import Config
        </Button>
        <Button
          startIcon={<Download />}
          onClick={handleExportConfig}
        >
          Export Config
        </Button>
        <Button
          startIcon={<Restore />}
          onClick={handleResetToDefaults}
          color="warning"
        >
          Reset to Defaults
        </Button>
        <CreateButton />
        <ExportButton />
      </TopToolbar>

      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)}>
        <DialogTitle>Import Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Select a configuration file to import. This will overwrite existing configurations.
          </Typography>
          <input
            type="file"
            accept=".json,.yaml,.yml"
            style={{ margin: '16px 0' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Upload />}>
            Import
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

/**
 * Configuration Category Chip Component
 */
const ConfigCategoryChip: React.FC<any> = () => {
  const record = useRecordContext<Configuration>();

  if (!record) return null;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'theme':
        return 'secondary';
      case 'banking':
        return 'primary';
      case 'security':
        return 'error';
      case 'notification':
        return 'info';
      case 'calculation':
        return 'success';
      case 'integration':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'theme':
        return <Palette />;
      case 'banking':
        return <AccountBalance />;
      case 'security':
        return <Security />;
      case 'notification':
        return <Notifications />;
      case 'calculation':
        return <Settings />;
      case 'integration':
        return <CloudSync />;
      default:
        return <Settings />;
    }
  };

  return (
    <Chip
      icon={getCategoryIcon(record.category)}
      label={record.category.toUpperCase()}
      color={getCategoryColor(record.category) as any}
      size="small"
      variant="outlined"
    />
  );
};

/**
 * Configuration Type Chip Component
 */
const ConfigTypeChip: React.FC<any> = () => {
  const record = useRecordContext<Configuration>();

  if (!record) return null;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'system':
        return 'error';
      case 'tenant':
        return 'primary';
      case 'user':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={record.configType.toUpperCase()}
      color={getTypeColor(record.configType) as any}
      size="small"
    />
  );
};

/**
 * Configuration Value Display Component
 */
const ConfigValueDisplay: React.FC<any> = () => {
  const record = useRecordContext<Configuration>();

  if (!record) return null;

  const displayValue = () => {
    const { configValue, dataType } = record;

    switch (dataType) {
      case 'boolean':
        return configValue ? 'Enabled' : 'Disabled';
      case 'object':
      case 'array':
        return JSON.stringify(configValue).substring(0, 50) + '...';
      case 'string':
        return configValue.length > 50 ? configValue.substring(0, 50) + '...' : configValue;
      default:
        return String(configValue);
    }
  };

  return (
    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
      {displayValue()}
    </Typography>
  );
};

/**
 * Configuration List Component
 */
export const ConfigurationList: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const bankingType = identity?.bankingType || 'conventional';

  return (
    <List
      actions={<ConfigurationListActions />}
      filters={[
        <TextInput key="search" label="Search" source="q" alwaysOn />,
        <SelectInput
          key="configType"
          label="Configuration Type"
          source="configType"
          choices={[
            { id: 'system', name: 'System' },
            { id: 'tenant', name: 'Tenant' },
            { id: 'user', name: 'User' },
          ]}
        />,
        <SelectInput
          key="category"
          label="Category"
          source="category"
          choices={[
            { id: 'theme', name: 'Theme' },
            { id: 'banking', name: 'Banking' },
            { id: 'security', name: 'Security' },
            { id: 'notification', name: 'Notification' },
            { id: 'calculation', name: 'Calculation' },
            { id: 'integration', name: 'Integration' },
          ]}
        />,
        <SelectInput
          key="bankingType"
          label="Banking Type"
          source="bankingType"
          choices={[
            { id: 'conventional', name: 'Conventional' },
            { id: 'syariah', name: 'Syariah' },
            { id: 'dual', name: 'Dual' },
          ]}
        />,
      ]}
      sort={{ field: 'category', order: 'ASC' }}
      perPage={25}
    >
      <Datagrid rowClick="show">
        <TextField source="configKey" label="Key" />
        <TextField source="configName" label="Name" />
        <ConfigTypeChip label="Type" />
        <ConfigCategoryChip label="Category" />
        <ConfigValueDisplay label="Value" />
        <TextField source="dataType" label="Data Type" />
        <BooleanField source="isActive" label="Active" />
        <BooleanField source="isEditable" label="Editable" />
        <ShowButton />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

/**
 * Configuration Show Component
 */
export const ConfigurationShow: React.FC = () => {
  const record = useRecordContext<Configuration>();
  const notify = useNotify();

  const handleSaveConfig = () => {
    notify('Configuration saved successfully', { type: 'success' });
  };

  const handleResetConfig = () => {
    notify('Configuration reset to default', { type: 'info' });
  };

  return (
    <Show>
      <Box sx={{ p: 2 }}>
        {/* Header Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {record?.configName}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  Key: {record?.configKey}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {record?.description}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  <ConfigTypeChip />
                  <ConfigCategoryChip />
                  {record?.isActive ? (
                    <Chip label="Active" color="success" size="small" />
                  ) : (
                    <Chip label="Inactive" color="default" size="small" />
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {record?.isEditable && (
                    <Button
                      size="small"
                      startIcon={<Save />}
                      onClick={handleSaveConfig}
                      variant="contained"

                    >
                      Save
                    </Button>
                  )}
                  <Button
                    size="small"
                    startIcon={<Restore />}
                    onClick={handleResetConfig}
                  >
                    Reset
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Configuration Type Alert */}
        {record?.configType === 'system' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This is a system-level configuration. Changes may affect the entire platform.
          </Alert>
        )}

        {record?.configType === 'tenant' && record?.bankingType === 'syariah' && (
          <Alert severity="info" sx={{ mb: 3 }}>
            This configuration is specific to Syariah banking operations.
          </Alert>
        )}

        {!record?.isEditable && (
          <Alert severity="error" sx={{ mb: 3 }}>
            This configuration is read-only and cannot be modified.
          </Alert>
        )}

        {/* Configuration Details */}
        <TabbedShowLayout>
          <Tab label="Basic Information" icon={<Settings />}>
            <TextField source="configKey" label="Configuration Key" />
            <TextField source="configName" label="Configuration Name" />
            <TextField source="configType" label="Configuration Type" />
            <TextField source="category" label="Category" />
            <TextField source="bankingType" label="Banking Type" />
            <TextField source="dataType" label="Data Type" />
            <TextField source="description" label="Description" />
            <BooleanField source="isActive" label="Active" />
            <BooleanField source="isEditable" label="Editable" />
          </Tab>

          <Tab label="Value & Validation" icon={<Storage />}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Current Value
              </Typography>
              <Card variant="outlined">
                <CardContent>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {JSON.stringify(record?.configValue, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </Box>

            {record?.defaultValue && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Default Value
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {JSON.stringify(record.defaultValue, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </Box>
            )}

            {record?.validationRules && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Validation Rules
                </Typography>
                <Card variant="outlined">
                  <CardContent>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                      {JSON.stringify(record.validationRules, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              </Box>
            )}
          </Tab>

          <Tab label="System Information" icon={<Language />}>
            <DateField source="createdAt" label="Created Date" showTime />
            <DateField source="updatedAt" label="Updated Date" showTime />
          </Tab>
        </TabbedShowLayout>
      </Box>
    </Show>
  );
};

/**
 * Configuration Create Component
 */
export const ConfigurationCreate: React.FC = () => {
  const { data: identity } = useGetIdentity();
  const defaultBankingType = identity?.bankingType || 'conventional';

  return (
    <Create>
      <TabbedForm>
        <FormTab label="Basic Information" icon={<Settings />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput
                source="configKey"
                label="Configuration Key"
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextInput
                source="configName"
                label="Configuration Name"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="configType"
                label="Configuration Type"
                choices={[
                  { id: 'system', name: 'System Level' },
                  { id: 'tenant', name: 'Tenant Level' },
                  { id: 'user', name: 'User Level' },
                ]}
                defaultValue="tenant"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="category"
                label="Category"
                choices={[
                  { id: 'theme', name: 'Theme & UI' },
                  { id: 'banking', name: 'Banking Operations' },
                  { id: 'security', name: 'Security & Access' },
                  { id: 'notification', name: 'Notifications' },
                  { id: 'calculation', name: 'Calculations' },
                  { id: 'integration', name: 'Integrations' },
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
                  { id: 'dual', name: 'Dual Banking' },
                ]}
                defaultValue={defaultBankingType}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="dataType"
                label="Data Type"
                choices={[
                  { id: 'string', name: 'String' },
                  { id: 'number', name: 'Number' },
                  { id: 'boolean', name: 'Boolean' },
                  { id: 'object', name: 'Object' },
                  { id: 'array', name: 'Array' },
                ]}
                defaultValue="string"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextInput
                source="description"
                label="Description"
                multiline
                rows={3}
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

            <Grid item xs={12} md={6}>
              <BooleanInput
                source="isEditable"
                label="Editable"
                defaultValue={true}
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Value Configuration" icon={<Storage />}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextInput
                source="configValue"
                label="Configuration Value"
                multiline
                rows={6}
                fullWidth
                helperText="Enter JSON format for objects and arrays"
              />
            </Grid>

            <Grid item xs={12}>
              <TextInput
                source="defaultValue"
                label="Default Value"
                multiline
                rows={4}
                fullWidth
                helperText="Enter JSON format for objects and arrays"
              />
            </Grid>

            <Grid item xs={12}>
              <TextInput
                source="validationRules"
                label="Validation Rules"
                multiline
                rows={4}
                fullWidth
                helperText="Enter JSON format validation rules"
              />
            </Grid>
          </Grid>
        </FormTab>
      </TabbedForm>
    </Create>
  );
};

/**
 * Configuration Edit Component
 */
export const ConfigurationEdit: React.FC = () => {
  return (
    <Edit>
      <TabbedForm>
        <FormTab label="Basic Information" icon={<Settings />}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextInput
                source="configKey"
                label="Configuration Key"
                validate={required()}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextInput
                source="configName"
                label="Configuration Name"
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="configType"
                label="Configuration Type"
                choices={[
                  { id: 'system', name: 'System Level' },
                  { id: 'tenant', name: 'Tenant Level' },
                  { id: 'user', name: 'User Level' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="category"
                label="Category"
                choices={[
                  { id: 'theme', name: 'Theme & UI' },
                  { id: 'banking', name: 'Banking Operations' },
                  { id: 'security', name: 'Security & Access' },
                  { id: 'notification', name: 'Notifications' },
                  { id: 'calculation', name: 'Calculations' },
                  { id: 'integration', name: 'Integrations' },
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
                  { id: 'dual', name: 'Dual Banking' },
                ]}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <SelectInput
                source="dataType"
                label="Data Type"
                choices={[
                  { id: 'string', name: 'String' },
                  { id: 'number', name: 'Number' },
                  { id: 'boolean', name: 'Boolean' },
                  { id: 'object', name: 'Object' },
                  { id: 'array', name: 'Array' },
                ]}
                validate={required()}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextInput
                source="description"
                label="Description"
                multiline
                rows={3}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <BooleanInput
                source="isActive"
                label="Active"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <BooleanInput
                source="isEditable"
                label="Editable"
              />
            </Grid>
          </Grid>
        </FormTab>

        <FormTab label="Value Configuration" icon={<Storage />}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextInput
                source="configValue"
                label="Configuration Value"
                multiline
                rows={6}
                fullWidth
                helperText="Enter JSON format for objects and arrays"
              />
            </Grid>

            <Grid item xs={12}>
              <TextInput
                source="defaultValue"
                label="Default Value"
                multiline
                rows={4}
                fullWidth
                helperText="Enter JSON format for objects and arrays"
              />
            </Grid>

            <Grid item xs={12}>
              <TextInput
                source="validationRules"
                label="Validation Rules"
                multiline
                rows={4}
                fullWidth
                helperText="Enter JSON format validation rules"
              />
            </Grid>
          </Grid>
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

// Export configuration resource configuration
export const ConfigurationResource = {
  list: ConfigurationList,
  show: ConfigurationShow,
  create: ConfigurationCreate,
  edit: ConfigurationEdit,
};
