// packages/frontend/src/admin/resources/roles/RoleResource.tsx
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
  Edit,
  Show,
  TabbedShowLayout,
  ReferenceManyField,
  Datagrid as ReferenceDatagrid,
  SearchInput,
  TopToolbar,
  CreateButton,
  ExportButton,
  RefreshButton,
  BulkDeleteButton,
  BulkExportButton,
  usePermissions,
  FunctionField,
  ChipField,
  Tab,
  RichTextField,
  useRecordContext,
  Labeled
} from "react-admin";
import {
  Security,
  People,
  Assignment,
  Settings,
  Dashboard,
  Assessment,
  Report,
  Storage
} from "@mui/icons-material";
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
  Avatar,
  Chip
} from "@mui/material";

// Custom Filters
const RoleFilters = [
  <SearchInput source="search" alwaysOn />,
  <SelectInput
    source="level"
    choices={[
      { id: 'PLATFORM', name: 'Platform Level' },
      { id: 'TENANT', name: 'Tenant Level' },
      { id: 'DEPARTMENT', name: 'Department Level' },
    ]}
  />,
  <SelectInput
    source="isActive"
    choices={[
      { id: true, name: 'Active' },
      { id: false, name: 'Inactive' },
    ]}
  />,
  <SelectInput
    source="bankingAccess"
    choices={[
      { id: 'CONVENTIONAL', name: 'Conventional Banking' },
      { id: 'SYARIAH', name: 'Syariah Banking' },
      { id: 'BOTH', name: 'Dual Banking' },
    ]}
  />,
];

// Enhanced List Component with Actions
const RoleListActions = () => {
  const { permissions } = usePermissions();
  return (
    <TopToolbar>
      <CreateButton />
      <ExportButton />
      <RefreshButton />
    </TopToolbar>
  );
};

// Role List with Advanced Features
const RoleList = () => {
  const translate = useTranslate();
  const { permissions } = usePermissions();

  return (
    <List
      actions={<RoleListActions />}
      filters={RoleFilters}
      perPage={25}
      sort={{ field: 'level', order: 'ASC' }}
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={
          <>
            <BulkExportButton />
            {permissions?.includes('roles:delete') && <BulkDeleteButton />}
          </>
        }
      >
        <FunctionField
          source="name"
          label="Role"
          render={(record: any) => (
            <Box display="flex" alignItems="center" py={1}>
              <Avatar sx={{ width: 32, height: 32, mr: 2, bgcolor: getRoleColor(record.type) }}>
                {record.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {record.displayName || record.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {record.level} • {record.type}
                </Typography>
              </Box>
            </Box>
          )}
        />

        <FunctionField
          source="description"
          label="Description"
          render={(record: any) => (
            <Typography variant="body2" sx={{ maxWidth: 200 }}>
              {record.description ? record.description.substring(0, 100) + (record.description.length > 100 ? '...' : '') : 'No description'}
            </Typography>
          )}
        />

        <FunctionField
          source="assignedUsers"
          label="Users"
          render={(record: any) => (
            <Box>
              <Typography variant="body2" color="text.secondary">
                {record.assignedUsers || 0} users assigned
              </Typography>
            </Box>
          )}
        />

        <FunctionField
          source="permissions"
          label="Permissions"
          render={(record: any) => (
            <Box>
              <Typography variant="body2" color="text.secondary">
                {record.permissions?.length || 0} permissions
              </Typography>
            </Box>
          )}
        />

        <FunctionField
          source="isActive"
          label="Status"
          render={(record: any) => (
            <ChipField
              source="isActive"
              record={{ isActive: record.isActive }}
              label={record.isActive ? 'Active' : 'Inactive'}
              color={record.isActive ? 'success' : 'default'}
            />
          )}
        />

        <FunctionField
          source="bankingAccess"
          label="Banking Access"
          render={(record: any) => {
            const bankingAccess = record.bankingAccess || 'CONVENTIONAL';
            return (
              <ChipField
                source="bankingAccess"
                record={{ bankingAccess }}
                color={
                  bankingAccess === 'CONVENTIONAL' ? 'primary' :
                  bankingAccess === 'SYARIAH' ? 'success' : 'secondary'
                }
              />
            );
          }}
        />

        <FunctionField
          source="isBuiltIn"
          label="Built-in"
          render={(record: any) => (
            <ChipField
              source="isBuiltIn"
              record={{ isBuiltIn: record.isBuiltIn }}
              label={record.isBuiltIn ? 'Built-in' : 'Custom'}
              color={record.isBuiltIn ? 'warning' : 'default'}
              size="small"
            />
          )}
        />

        <DateField
          source="createdAt"
          label="Created"
          showTime
          locales="en-US"
        />

        <DateField
          source="updatedAt"
          label="Updated"
          showTime
          locales="en-US"
        />

        <EditButton />
        <ShowButton />
        {permissions?.includes('roles:delete') && <DeleteButton />}
      </Datagrid>
    </List>
  );
};

// Helper function to get role color
const getRoleColor = (type: string) => {
  const colors = {
    SYSTEM: '#d32f2f',      // Red for system roles
    BANKING: '#1976d2',     // Blue for banking roles
    CUSTOM: '#388e3c',      // Green for custom roles
    PLATFORM: '#7b1fa2',   // Purple for platform level
    TENANT: '#f57c00',     // Orange for tenant level
    DEPARTMENT: '#616161'  // Gray for department level
  };
  return colors[type] || '#1976d2';
};

// Permission Categories
const PERMISSION_CATEGORIES = {
  user_management: {
    label: 'User Management',
    icon: People,
    permissions: [
      { id: 'users:view', label: 'View Users' },
      { id: 'users:create', label: 'Create Users' },
      { id: 'users:edit', label: 'Edit Users' },
      { id: 'users:delete', label: 'Delete Users' },
      { id: 'users:activate', label: 'Activate/Deactivate Users' },
    ]
  },
  role_management: {
    label: 'Role Management',
    icon: Assignment,
    permissions: [
      { id: 'roles:view', label: 'View Roles' },
      { id: 'roles:create', label: 'Create Roles' },
      { id: 'roles:edit', label: 'Edit Roles' },
      { id: 'roles:delete', label: 'Delete Roles' },
      { id: 'roles:assign', label: 'Assign Roles' },
    ]
  },
  tenant_management: {
    label: 'Tenant Management',
    icon: Business,
    permissions: [
      { id: 'tenants:view', label: 'View Tenants' },
      { id: 'tenants:create', label: 'Create Tenants' },
      { id: 'tenants:edit', label: 'Edit Tenants' },
      { id: 'tenants:delete', label: 'Delete Tenants' },
      { id: 'tenants:configure', label: 'Configure Tenants' },
    ]
  },
  banking_operations: {
    label: 'Banking Operations',
    icon: AccountTree,
    permissions: [
      { id: 'banking:view', label: 'View Banking Data' },
      { id: 'banking:create', label: 'Create Banking Records' },
      { id: 'banking:edit', label: 'Edit Banking Records' },
      { id: 'banking:delete', label: 'Delete Banking Records' },
      { id: 'banking:approve', label: 'Approve Transactions' },
    ]
  },
  ifrs9_operations: {
    label: 'IFRS 9 Operations',
    icon: Assessment,
    permissions: [
      { id: 'ifrs9:view', label: 'View IFRS 9 Data' },
      { id: 'ifrs9:calculate', label: 'Run Calculations' },
      { id: 'ifrs9:approve', label: 'Approve Calculations' },
      { id: 'ifrs9:configure', label: 'Configure Models' },
      { id: 'ifrs9:report', label: 'Generate Reports' },
    ]
  },
  system_administration: {
    label: 'System Administration',
    icon: Settings,
    permissions: [
      { id: 'system:configure', label: 'System Configuration' },
      { id: 'system:backup', label: 'Backup & Restore' },
      { id: 'system:logs', label: 'View System Logs' },
      { id: 'system:maintenance', label: 'System Maintenance' },
      { id: 'system:monitor', label: 'System Monitoring' },
    ]
  },
  reports_analytics: {
    label: 'Reports & Analytics',
    icon: Report,
    permissions: [
      { id: 'reports:view', label: 'View Reports' },
      { id: 'reports:create', label: 'Create Reports' },
      { id: 'reports:export', label: 'Export Data' },
      { id: 'analytics:view', label: 'View Analytics' },
      { id: 'analytics:create', label: 'Create Analytics' },
    ]
  },
  data_management: {
    label: 'Data Management',
    icon: Storage,
    permissions: [
      { id: 'data:import', label: 'Import Data' },
      { id: 'data:export', label: 'Export Data' },
      { id: 'data:validate', label: 'Validate Data' },
      { id: 'data:migrate', label: 'Migrate Data' },
      { id: 'data:backup', label: 'Backup Data' },
    ]
  }
};

// Role Create Form
const RoleCreate = () => {
  const translate = useTranslate();

  return (
    <Create>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <TextInput
          source="name"
          fullWidth
          required
          helperText="Role name in uppercase (e.g., BANK_MANAGER, RISK_ANALYST)"
        />
        <TextInput
          source="displayName"
          fullWidth
          helperText="Display name for the role (e.g., Bank Manager, Risk Analyst)"
        />
        <TextInput source="description" fullWidth multiline />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Role Configuration
        </Typography>

        <SelectInput
          source="type"
          choices={[
            { id: 'SYSTEM', name: 'System Role' },
            { id: 'BANKING', name: 'Banking Role' },
            { id: 'CUSTOM', name: 'Custom Role' },
          ]}
          defaultValue="CUSTOM"
          fullWidth
        />

        <SelectInput
          source="level"
          choices={[
            { id: 'PLATFORM', name: 'Platform Level' },
            { id: 'TENANT', name: 'Tenant Level' },
            { id: 'DEPARTMENT', name: 'Department Level' },
          ]}
          defaultValue="DEPARTMENT"
          fullWidth
        />

        <SelectInput
          source="bankingAccess"
          choices={[
            { id: 'CONVENTIONAL', name: 'Conventional Banking' },
            { id: 'SYARIAH', name: 'Syariah Banking' },
            { id: 'BOTH', name: 'Dual Banking' },
          ]}
          defaultValue="CONVENTIONAL"
          fullWidth
        />

        <BooleanInput
          source="isActive"
          defaultValue={true}
          helperText="Whether this role is currently active"
        />

        <BooleanInput
          source="isSystemRole"
          defaultValue={false}
          helperText="System roles cannot be deleted or modified by regular users"
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Additional Settings
        </Typography>

        <TextInput
          source="complianceLevel"
          helperText="Required compliance level for users assigned to this role"
        />
        <TextInput
          source="hierarchyLevel"
          type="number"
          defaultValue={1}
          helperText="Hierarchy level (1-10, higher means more privileges)"
        />

        <TextInput source="notes" fullWidth multiline helperText="Additional notes about this role" />
      </SimpleForm>
    </Create>
  );
};

// Role Edit Form
const RoleEdit = () => {
  const translate = useTranslate();

  return (
    <Edit>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <TextInput
          source="name"
          fullWidth
          required
          helperText="Role name in uppercase (e.g., BANK_MANAGER, RISK_ANALYST)"
        />
        <TextInput
          source="displayName"
          fullWidth
          helperText="Display name for the role (e.g., Bank Manager, Risk Analyst)"
        />
        <TextInput source="description" fullWidth multiline />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Role Configuration
        </Typography>

        <SelectInput
          source="type"
          choices={[
            { id: 'SYSTEM', name: 'System Role' },
            { id: 'BANKING', name: 'Banking Role' },
            { id: 'CUSTOM', name: 'Custom Role' },
          ]}
          fullWidth
        />

        <SelectInput
          source="level"
          choices={[
            { id: 'PLATFORM', name: 'Platform Level' },
            { id: 'TENANT', name: 'Tenant Level' },
            { id: 'DEPARTMENT', name: 'Department Level' },
          ]}
          fullWidth
        />

        <SelectInput
          source="bankingAccess"
          choices={[
            { id: 'CONVENTIONAL', name: 'Conventional Banking' },
            { id: 'SYARIAH', name: 'Syariah Banking' },
            { id: 'BOTH', name: 'Dual Banking' },
          ]}
          fullWidth
        />

        <BooleanInput
          source="isActive"
          helperText="Whether this role is currently active"
        />

        <BooleanInput
          source="isSystemRole"
          disabled
          helperText="System roles cannot be deleted or modified"
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Additional Settings
        </Typography>

        <TextInput
          source="complianceLevel"
          helperText="Required compliance level for users assigned to this role"
        />
        <TextInput
          source="hierarchyLevel"
          type="number"
          helperText="Hierarchy level (1-10, higher means more privileges)"
        />

        <TextInput source="notes" fullWidth multiline helperText="Additional notes about this role" />

        <Labeled label="Audit Information">
          <Box>
            <DateField source="createdAt" showTime />
            <DateField source="updatedAt" showTime />
            <FunctionField
              source="createdBy"
              render={(record: any) => (
                <Typography variant="body2">{record.createdBy || 'System'}</Typography>
              )}
            />
          </Box>
        </Labeled>
      </SimpleForm>
    </Edit>
  );
};

// Role Show View
const RoleShow = () => {
  const translate = useTranslate();
  const [openUsersDialog, setOpenUsersDialog] = useState(false);

  return (
    <Show>
      <TabbedShowLayout>
        <Tab label="Basic Information">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h5" gutterBottom>
                Role Overview
              </Typography>

              <Box display="flex" alignItems="center" mb={3}>
                <Avatar sx={{ width: 64, height: 64, mr: 3, bgcolor: getRoleColor(useRecordContext()?.type) }}>
                  {useRecordContext()?.name?.[0]?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h4">
                    {useRecordContext()?.displayName || useRecordContext()?.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {useRecordContext()?.level} • {useRecordContext()?.type}
                  </Typography>
                  <ChipField
                    source="isActive"
                    record={{ isActive: useRecordContext()?.isActive }}
                    label={useRecordContext()?.isActive ? 'Active' : 'Inactive'}
                    color={useRecordContext()?.isActive ? 'success' : 'default'}
                  />
                </Box>
              </Box>

              <Typography variant="body1" paragraph>
                {useRecordContext()?.description || 'No description available'}
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Configuration
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Role Type
                  </Typography>
                  <ChipField
                    source="type"
                    record={{ type: useRecordContext()?.type }}
                    color={useRecordContext()?.type === 'SYSTEM' ? 'warning' : 'primary'}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    System Role
                  </Typography>
                  <BooleanField
                    source="isSystemRole"
                    record={{ isSystemRole: useRecordContext()?.isSystemRole }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Banking Access
                  </Typography>
                  <FunctionField
                    source="bankingAccess"
                    render={(record: any) => (
                      <ChipField
                        source="bankingAccess"
                        record={{ bankingAccess: record.bankingAccess || 'CONVENTIONAL' }}
                        color={
                          record.bankingAccess === 'CONVENTIONAL' ? 'primary' :
                          record.bankingAccess === 'SYARIAH' ? 'success' : 'secondary'
                        }
                      />
                    )}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Hierarchy Level
                  </Typography>
                  <TextField source="hierarchyLevel" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Compliance Level
                  </Typography>
                  <TextField source="complianceLevel" />
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Assigned Users
                  </Typography>
                  <Typography variant="body1">
                    {useRecordContext()?.assignedUsers || 0} users assigned
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="h6" gutterBottom>
                Audit Information
              </Typography>

              <Stack spacing={2}>
                <DateField source="createdAt" showTime />
                <DateField source="updatedAt" showTime />
                <FunctionField
                  source="createdBy"
                  render={(record: any) => (
                    <Typography variant="body2">{record.createdBy || 'System'}</Typography>
                  )}
                />
              </Stack>
            </Box>
          </Stack>
        </Tab>

        <Tab label="Users">
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">
                Users with this role
              </Typography>
              <Button
                variant="outlined"
                startIcon={<People />}
                onClick={() => setOpenUsersDialog(true)}
              >
                Manage Users
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {useRecordContext()?.assignedUsers || 0} users are currently assigned to this role.
              User assignment management requires backend implementation.
            </Typography>
          </Stack>
        </Tab>

        <Tab label="Notes">
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" gutterBottom>
                Role Notes
              </Typography>

              <Typography variant="body1" paragraph>
                {useRecordContext()?.notes || 'No additional notes available for this role.'}
              </Typography>
            </Box>
          </Stack>
        </Tab>
      </TabbedShowLayout>

      {/* Users Management Dialog */}
      <Dialog open={openUsersDialog} onClose={() => setOpenUsersDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Users with this Role</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Here you can manage which users are assigned to this role. This feature requires backend implementation.
          </Typography>
          {/* User assignment interface would go here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUsersDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Show>
  );
};

export const RoleResource = {
  list: RoleList,
  create: RoleCreate,
  edit: RoleEdit,
  show: RoleShow,
  icon: Security,
  options: { label: 'Roles & Permissions' },
};
