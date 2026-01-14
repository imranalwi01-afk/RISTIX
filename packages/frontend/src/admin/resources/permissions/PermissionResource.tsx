// packages/frontend/src/admin/resources/permissions/PermissionResource.tsx
import React, { useState } from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  Edit as RaEdit,
  Show,
  SimpleShowLayout,
  ReferenceManyField,
  ReferenceField,
  Datagrid as ReferenceDatagrid,
  FilterList,
  SearchInput,
  useTranslate,
  TopToolbar,
  CreateButton,
  ExportButton,
  RefreshButton,
  BulkDeleteButton,
  BulkExportButton,
  usePermissions,
  FunctionField,
  ChipField,
  TabbedShowLayout,
  Tab,
  NumberField,
  RichTextField,
  BooleanField,
  useRecordContext,
  Labeled,
  ArrayInput,
  SimpleFormIterator
} from "react-admin";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip,
  Chip
} from "@mui/material";
import {
  Security,
  Key,
  Shield,
  Gavel,
  Lock,
  LockOpen,
  Add,
  Delete,
  Edit as EditIcon,
  CheckCircle,
  Cancel,
  Warning,
  Info,
  Business,
  People,
  Settings,
  Assessment,
  Report,
  Storage,
  CloudUpload,
  Download,
  AdminPanelSettings,
  AccountTree,
  Dashboard,
  Assignment,
  VerifiedUser,
  Group,
  ManageAccounts,
  PrivacyTip,
  SecurityUpdateGood,
  SecurityUpdateWarning,
  GppGood,
  GppBad,
  GppMaybe,
  Visibility,
  VisibilityOff,
  ContentCopy,
  Save,
  CancelPresentation,
  SettingsSuggest,
  Tune,
  TuneOutlined,
  Rule,
  RuleFolder,
  FilterList as FilterListIcon,
  FilterAlt,
  AccountBalance,
  ReceiptLong,
  Summarize,
  Timeline,
  PendingActions,
  PlaylistAddCheck,
  PlaylistPlay,
  DoneAll,
  SelectAll
} from "@mui/icons-material";
import { Avatar, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

// Permission Categories (from RoleResource)
const PERMISSION_CATEGORIES = {
  user_management: {
    label: 'User Management',
    icon: People,
    color: '#1976d2',
    description: 'Manage user accounts, roles, and access controls'
  },
  role_management: {
    label: 'Role Management',
    icon: Assignment,
    color: '#388e3c',
    description: 'Define and manage role permissions'
  },
  tenant_management: {
    label: 'Tenant Management',
    icon: Business,
    color: '#7b1fa2',
    description: 'Manage tenant configurations and settings'
  },
  banking_operations: {
    label: 'Banking Operations',
    icon: AccountTree,
    color: '#f57c00',
    description: 'Control banking transactions and operations'
  },
  ifrs9_operations: {
    label: 'IFRS 9 Operations',
    icon: Assessment,
    color: '#d32f2f',
    description: 'Access IFRS 9 calculations and reporting'
  },
  system_administration: {
    label: 'System Administration',
    icon: Settings,
    color: '#616161',
    description: 'System configuration and maintenance'
  },
  reports_analytics: {
    label: 'Reports & Analytics',
    icon: Report,
    color: '#0288d1',
    description: 'View reports and analytics dashboards'
  },
  data_management: {
    label: 'Data Management',
    icon: Storage,
    color: '#00695c',
    description: 'Import, export, and manage data'
  }
};

// Custom Filters
const PermissionFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="category"
    choices={Object.entries(PERMISSION_CATEGORIES).map(([key, value]) => ({
      id: key,
      name: value.label
    }))}
  />,
  <SelectInput
    source="is_active"
    choices={[
      { id: true, name: 'Active' },
      { id: false, name: 'Inactive' },
    ]}
  />,
  <SelectInput
    source="risk_level"
    choices={[
      { id: 'low', name: 'Low Risk' },
      { id: 'medium', name: 'Medium Risk' },
      { id: 'high', name: 'High Risk' },
      { id: 'critical', name: 'Critical Risk' },
    ]}
  />,
];

// Enhanced List Component with Actions
const PermissionListActions = () => {
  const { permissions } = usePermissions();
  return (
    <TopToolbar>
      <SearchInput source="q" alwaysOn />
      {permissions?.includes('permissions:create') && <CreateButton />}
      <ExportButton />
      <RefreshButton />
    </TopToolbar>
  );
};

// Permission List with Advanced Features
const PermissionList = () => {
  const translate = useTranslate();
  const { permissions } = usePermissions();

  return (
    <List
      actions={<PermissionListActions />}
      filters={PermissionFilters}
      perPage={50}
      sort={{ field: 'category', order: 'ASC' }}
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={
          <>
            <BulkExportButton />
            {permissions?.includes('permissions:delete') && <BulkDeleteButton />}
          </>
        }
      >
        <FunctionField
          source="category"
          label="Category"
          render={(record: any) => (
            <Box display="flex" alignItems="center" py={1}>
              <Avatar sx={{
                width: 32,
                height: 32,
                mr: 2,
                bgcolor: PERMISSION_CATEGORIES[record.category]?.color || '#1976d2'
              }}>
                {(() => {
                  const IconComponent = PERMISSION_CATEGORIES[record.category]?.icon;
                  return IconComponent ? (
                    <IconComponent sx={{ fontSize: 16 }} />
                  ) : (
                    <Key sx={{ fontSize: 16 }} />
                  );
                })()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {PERMISSION_CATEGORIES[record.category]?.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {record.permission_id}
                </Typography>
              </Box>
            </Box>
          )}
        />

        <TextField source="name" label="Permission" />
        <RichTextField source="description" label="Description" stripTags />

        <FunctionField
          source="risk_level"
          label="Risk Level"
          render={(record: any) => (
            <ChipField
              source="risk_level"
              label={record.risk_level}
              color={
                record.risk_level === 'critical' ? 'error' :
                  record.risk_level === 'high' ? 'warning' :
                    record.risk_level === 'medium' ? 'info' : 'default'
              }
              icon={
                record.risk_level === 'critical' ? <GppBad /> :
                  record.risk_level === 'high' ? <GppMaybe /> :
                    record.risk_level === 'medium' ? <GppMaybe /> : <GppGood />
              }
            />
          )}
        />

        <FunctionField
          source="is_active"
          label="Status"
          render={(record: any) => (
            <ChipField
              source="is_active"
              label={record.is_active ? 'Active' : 'Inactive'}
              color={record.is_active ? 'success' : 'default'}
            />
          )}
        />

        <TextField source="resource" label="Resource" />

        <DateField
          source="created_at"
          label="Created"
          showTime
          locales="en-US"
        />

        <DateField
          source="updated_at"
          label="Updated"
          showTime
          locales="en-US"
        />

        <EditButton />
        <ShowButton />
        {permissions?.includes('permissions:delete') && <DeleteButton />}
      </Datagrid>
    </List>
  );
};

// Permission Create Form
const PermissionCreate = () => {
  const translate = useTranslate();

  return (
    <Create>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <TextInput source="permission_id" fullWidth required helperText="Unique permission identifier (e.g., users:create)" />
        <TextInput source="name" fullWidth required helperText="Human-readable permission name" />
        <RichTextField source="description" fullWidth helperText="Detailed description of what this permission allows" />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Classification
        </Typography>

        <SelectInput
          source="category"
          choices={Object.entries(PERMISSION_CATEGORIES).map(([key, value]) => ({
            id: key,
            name: value.label
          }))}
          fullWidth
          required
        />

        <SelectInput
          source="risk_level"
          choices={[
            { id: 'low', name: 'Low Risk' },
            { id: 'medium', name: 'Medium Risk' },
            { id: 'high', name: 'High Risk' },
            { id: 'critical', name: 'Critical Risk' },
          ]}
          fullWidth
          required
        />

        <TextInput source="resource" fullWidth helperText="Resource this permission applies to (e.g., users, roles)" />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Configuration
        </Typography>

        <SelectInput
          source="is_active"
          choices={[
            { id: true, name: 'Active' },
            { id: false, name: 'Inactive' },
          ]}
          defaultValue={true}
          fullWidth
        />

        <BooleanInput source="requires_approval" defaultValue={false} helperText="This permission requires approval to be granted" />
        <BooleanInput source="is_system_permission" defaultValue={false} helperText="System permissions cannot be modified" />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Access Control
        </Typography>

        <TextInput source="api_endpoint" fullWidth helperText="API endpoint this permission controls (optional)" />
        <TextInput source="http_method" fullWidth helperText="HTTP method (GET, POST, PUT, DELETE)" />
        <TextInput source="route_pattern" fullWidth helperText="Route pattern (optional)" />

        <ArrayInput source="ip_whitelist" helperText="IP addresses that can use this permission (optional)">
          <SimpleFormIterator>
            <TextInput source="" label="IP Address" helperText="e.g., 192.168.1.100" />
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayInput source="allowed_roles" helperText="Roles that can have this permission (optional)">
          <SimpleFormIterator>
            <TextInput source="" label="Role ID" helperText="e.g., admin, manager" />
          </SimpleFormIterator>
        </ArrayInput>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Time Restrictions
        </Typography>

        <TextInput source="allowed_hours_start" type="time" fullWidth helperText="Start time (HH:MM format)" />
        <TextInput source="allowed_hours_end" type="time" fullWidth helperText="End time (HH:MM format)" />

        <ArrayInput source="allowed_days" helperText="Days this permission is allowed (0=Sunday, 6=Saturday)">
          <SimpleFormIterator>
            <SelectInput
              label="Day"
              choices={[
                { id: 0, name: 'Sunday' },
                { id: 1, name: 'Monday' },
                { id: 2, name: 'Tuesday' },
                { id: 3, name: 'Wednesday' },
                { id: 4, name: 'Thursday' },
                { id: 5, name: 'Friday' },
                { id: 6, name: 'Saturday' },
              ]}
            />
          </SimpleFormIterator>
        </ArrayInput>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Additional Settings
        </Typography>

        <TextInput source="max_attempts" type="number" defaultValue={3} helperText="Maximum attempts per time window" />
        <TextInput source="time_window_minutes" type="number" defaultValue={60} helperText="Time window in minutes" />
        <BooleanInput source="log_access" defaultValue={true} helperText="Log when this permission is used" />
        <BooleanInput source="email_notifications" defaultValue={false} helperText="Send email notifications for access" />

        <RichTextField source="notes" fullWidth />
      </SimpleForm>
    </Create>
  );
};

// Permission Edit Form
const PermissionEdit = () => {
  const translate = useTranslate();

  return (
    <RaEdit>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <TextInput source="permission_id" fullWidth required disabled />
        <TextInput source="name" fullWidth required />
        <RichTextField source="description" fullWidth />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Classification
        </Typography>

        <SelectInput
          source="category"
          choices={Object.entries(PERMISSION_CATEGORIES).map(([key, value]) => ({
            id: key,
            name: value.label
          }))}
          fullWidth
          required
        />

        <SelectInput
          source="risk_level"
          choices={[
            { id: 'low', name: 'Low Risk' },
            { id: 'medium', name: 'Medium Risk' },
            { id: 'high', name: 'High Risk' },
            { id: 'critical', name: 'Critical Risk' },
          ]}
          fullWidth
        />

        <TextInput source="resource" fullWidth />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Configuration
        </Typography>

        <SelectInput
          source="is_active"
          choices={[
            { id: true, name: 'Active' },
            { id: false, name: 'Inactive' },
          ]}
          fullWidth
        />

        <BooleanInput source="requires_approval" />
        <BooleanInput source="is_system_permission" disabled />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Access Control
        </Typography>

        <TextInput source="api_endpoint" fullWidth />
        <TextInput source="http_method" fullWidth />
        <TextInput source="route_pattern" fullWidth />

        <ArrayInput source="ip_whitelist">
          <SimpleFormIterator>
            <TextInput source="" label="IP Address" />
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayInput source="allowed_roles">
          <SimpleFormIterator>
            <TextInput source="" label="Role ID" />
          </SimpleFormIterator>
        </ArrayInput>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Time Restrictions
        </Typography>

        <TextInput source="allowed_hours_start" type="time" fullWidth />
        <TextInput source="allowed_hours_end" type="time" fullWidth />

        <ArrayInput source="allowed_days">
          <SimpleFormIterator>
            <SelectInput
              label="Day"
              choices={[
                { id: 0, name: 'Sunday' },
                { id: 1, name: 'Monday' },
                { id: 2, name: 'Tuesday' },
                { id: 3, name: 'Wednesday' },
                { id: 4, name: 'Thursday' },
                { id: 5, name: 'Friday' },
                { id: 6, name: 'Saturday' },
              ]}
            />
          </SimpleFormIterator>
        </ArrayInput>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Additional Settings
        </Typography>

        <TextInput source="max_attempts" type="number" />
        <TextInput source="time_window_minutes" type="number" />
        <BooleanInput source="log_access" />
        <BooleanInput source="email_notifications" />

        <RichTextField source="notes" fullWidth />

        <Labeled label="Audit Information">
          <Box>
            <DateField source="created_at" showTime />
            <DateField source="updated_at" showTime />
            <ReferenceField source="created_by" reference="users">
              <TextField source="first_name" />
            </ReferenceField>
            <ReferenceField source="updated_by" reference="users">
              <TextField source="first_name" />
            </ReferenceField>
          </Box>
        </Labeled>
      </SimpleForm>
    </RaEdit>
  );
};

// Permission Show View
const PermissionShow = () => {
  const translate = useTranslate();
  const [openUsageDialog, setOpenUsageDialog] = useState(false);

  return (
    <Show>
      <TabbedShowLayout>
        <Tab label="Basic Information">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Permission Overview
              </Typography>

              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{
                  width: 64,
                  height: 64,
                  mr: 3,
                  bgcolor: PERMISSION_CATEGORIES[useRecordContext()?.category]?.color || '#1976d2'
                }}>
                  {(() => {
                    const IconComponent = PERMISSION_CATEGORIES[useRecordContext()?.category]?.icon;
                    return IconComponent ? (
                      <IconComponent sx={{ fontSize: 32 }} />
                    ) : (
                      <Key sx={{ fontSize: 32 }} />
                    );
                  })()}
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {useRecordContext()?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {useRecordContext()?.permission_id}
                  </Typography>
                  <ChipField
                    source="risk_level"
                    label={useRecordContext()?.risk_level}
                    color={
                      useRecordContext()?.risk_level === 'critical' ? 'error' :
                        useRecordContext()?.risk_level === 'high' ? 'warning' :
                          useRecordContext()?.risk_level === 'medium' ? 'info' : 'default'
                    }
                  />
                </Box>
              </Box>

              <RichTextField source="description" label="Description" />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Classification
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Category
                  </Typography>
                  <Typography variant="body1">
                    {PERMISSION_CATEGORIES[useRecordContext()?.category]?.label}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Resource
                  </Typography>
                  <TextField source="resource" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text-secondary">
                    Status
                  </Typography>
                  <ChipField
                    source="is_active"
                    label={useRecordContext()?.is_active ? 'Active' : 'Inactive'}
                    color={useRecordContext()?.is_active ? 'success' : 'default'}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    System Permission
                  </Typography>
                  <BooleanField source="is_system_permission" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Requires Approval
                  </Typography>
                  <BooleanField source="requires_approval" />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Tab>

        <Tab label="Access Control">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                API Configuration
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    API Endpoint
                  </Typography>
                  <TextField source="api_endpoint" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    HTTP Method
                  </Typography>
                  <TextField source="http_method" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Route Pattern
                  </Typography>
                  <TextField source="route_pattern" />
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                IP Restrictions
              </Typography>

              <FunctionField
                source="ip_whitelist"
                render={(record: any) => (
                  <Box>
                    {record?.ip_whitelist?.length > 0 ? (
                      record.ip_whitelist.map((ip: string, index: number) => (
                        <Chip key={index} label={ip} size="small" sx={{ mr: 1, mb: 1 }} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No IP restrictions
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Role Restrictions
              </Typography>

              <FunctionField
                source="allowed_roles"
                render={(record: any) => (
                  <Box>
                    {record?.allowed_roles?.length > 0 ? (
                      record.allowed_roles.map((role: string, index: number) => (
                        <Chip key={index} label={role} size="small" sx={{ mr: 1, mb: 1 }} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No role restrictions
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Box>
          </Stack>
        </Tab>

        <Tab label="Time Restrictions">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Time Access Control
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Allowed Hours
                  </Typography>
                  <Typography variant="body1">
                    {useRecordContext()?.allowed_hours_start} - {useRecordContext()?.allowed_hours_end}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Allowed Days
                  </Typography>
                  <FunctionField
                    source="allowed_days"
                    render={(record: any) => (
                      <Box>
                        {record?.allowed_days?.length > 0 ? (
                          record.allowed_days.map((day: number, index: number) => (
                            <Chip
                              key={index}
                              label={
                                ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day]
                              }
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No day restrictions
                          </Typography>
                        )}
                      </Box>
                    )}
                  />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Tab>

        <Tab label="Usage Statistics">
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Usage Statistics
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => setOpenUsageDialog(true)}
              >
                View Details
              </Button>
            </Box>

            <Paper sx={{ p: 2 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Metric</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Total Access Attempts</TableCell>
                      <TableCell align="right">
                        <FunctionField
                          source="usage_stats"
                          render={(record: any) => (
                            record?.usage_stats?.total_attempts || 0
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Successful Access</TableCell>
                      <TableCell align="right">
                        <FunctionField
                          source="usage_stats"
                          render={(record: any) => (
                            record?.usage_stats?.successful_attempts || 0
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Failed Attempts</TableCell>
                      <TableCell align="right">
                        <FunctionField
                          source="usage_stats"
                          render={(record: any) => (
                            record?.usage_stats?.failed_attempts || 0
                          )}
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Last Used</TableCell>
                      <TableCell align="right">
                        <DateField
                          source="usage_stats.last_used"
                          showTime
                          locales="en-US"
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Unique Users</TableCell>
                      <TableCell align="right">
                        <FunctionField
                          source="usage_stats"
                          render={(record: any) => (
                            record?.usage_stats?.unique_users || 0
                          )}
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </Tab>

        <Tab label="Settings">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Security Settings
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Maximum Attempts
                  </Typography>
                  <TextField source="max_attempts" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Time Window
                  </Typography>
                  <TextField source="time_window_minutes" suffix="minutes" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Log Access
                  </Typography>
                  <BooleanField source="log_access" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email Notifications
                  </Typography>
                  <BooleanField source="email_notifications" />
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Notes
              </Typography>

              <RichTextField source="notes" />
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Audit Information
              </Typography>

              <Stack spacing={2}>
                <DateField source="created_at" showTime />
                <DateField source="updated_at" showTime />
                <ReferenceField source="created_by" reference="users" label="Created By">
                  <TextField source="first_name" />
                </ReferenceField>
                <ReferenceField source="updated_by" reference="users" label="Updated By">
                  <TextField source="first_name" />
                </ReferenceField>
              </Stack>
            </Box>
          </Stack>
        </Tab>
      </TabbedShowLayout>

      {/* Usage Statistics Dialog */}
      <Dialog open={openUsageDialog} onClose={() => setOpenUsageDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Permission Usage Details</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Detailed usage statistics for this permission. This feature requires backend implementation.
          </Typography>
          {/* Usage statistics interface would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUsageDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Show>
  );
};

export const PermissionResource = {
  list: PermissionList,
  create: PermissionCreate,
  edit: PermissionEdit,
  show: PermissionShow,
  icon: Key,
  options: { label: 'Permissions' },
};