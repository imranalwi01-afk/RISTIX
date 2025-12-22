// packages/frontend/src/admin/resources/users/UserResource.tsx
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  BooleanField,
  DateField,
  EditButton,
  ShowButton,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  EmailInput,
  SelectInput,
  BooleanInput,
  PasswordInput,
  Edit,
  Show,
  SimpleShowLayout,
  Labeled,
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
  useRecordContext
} from "react-admin";
import {
  Person,
  Lock,
  LockOpen
} from "@mui/icons-material";
import { Typography, Box, Avatar, Stack } from "@mui/material";

// Custom Filters - Updated to match backend API parameters
const UserFilters = [
  <SearchInput source="search" alwaysOn />,
  <SelectInput
    source="isActive"
    choices={[
      { id: 'true', name: 'Active' },
      { id: 'false', name: 'Inactive' },
    ]}
    alwaysOn
  />,
  <SelectInput
    source="bankingAccess"
    choices={[
      { id: 'CONVENTIONAL', name: 'Conventional' },
      { id: 'SYARIAH', name: 'Syariah' },
      { id: 'BOTH', name: 'Dual Banking' },
    ]}
  />,
  <SelectInput
    source="syariahCertified"
    choices={[
      { id: 'true', name: 'Syariah Certified' },
      { id: 'false', name: 'Not Certified' },
    ]}
  />,
];

// Enhanced List Component with Actions
const UserListActions = () => {
  const { permissions } = usePermissions();
  return (
    <TopToolbar>
      <SearchInput source="q" alwaysOn />
      {permissions?.includes('users:create') && <CreateButton />}
      <ExportButton />
      <RefreshButton />
    </TopToolbar>
  );
};

// User List with Advanced Features - Updated to match backend API response
const UserList = () => {
  const { permissions } = usePermissions();

  return (
    <List
      actions={<UserListActions />}
      filters={UserFilters}
      perPage={25}
      sort={{ field: 'createdAt', order: 'DESC' }}
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={permissions?.includes('users:delete') ? (
          <>
            <BulkExportButton />
            <BulkDeleteButton />
          </>
        ) : <BulkExportButton />}
      >
        <AvatarField source="avatar_url" />
        <TextField source="fullName" label="Full Name" />
        <EmailField source="email" label="Email" />
        <TextField source="username" label="Username" />

        {/* Banking Access - Direct field from backend */}
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

        {/* Display roles array from backend response */}
        <FunctionField
          source="roles"
          label="Roles"
          render={(record: any) => {
            const roles = record.roles || [];
            return roles.map((role: any, index: number) => (
              <ChipField
                key={index}
                source="roleName"
                record={role}
                size="small"
                style={{ marginRight: 4 }}
              />
            ));
          }}
        />

        {/* Department */}
        <TextField source="department" label="Department" />

        {/* Active Status */}
        <BooleanField
          source="isActive"
          label="Active"
          TrueIcon={LockOpen}
          FalseIcon={Lock}
        />

        {/* Last Login - Updated field name */}
        <DateField
          source="lastLoginAt"
          label="Last Login"
          showTime
          locales="en-US"
        />

        {/* Created At - Updated field name */}
        <DateField
          source="createdAt"
          label="Created"
          showTime
          locales="en-US"
        />

        {permissions?.includes('users:edit') && <EditButton />}
        {permissions?.includes('users:view') && <ShowButton />}
        {permissions?.includes('users:delete') && <DeleteButton />}
      </Datagrid>
    </List>
  );
};

// Avatar Field Component - Updated to use fullName
const AvatarField = ({ source }: any) => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box display="flex" alignItems="center" py={1}>
      <Avatar
        src={record[source]}
        alt={record.fullName || record.email}
        sx={{ width: 40, height: 40 }}
      >
        {record.fullName ? record.fullName.split(' ').map((n: string) => n[0]).join('') :
         record.email ? record.email[0].toUpperCase() : 'U'}
      </Avatar>
    </Box>
  );
};

// User Create Form - Updated to match backend API fields
const UserCreate = () => {

  return (
    <Create>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>

        <TextInput source="fullName" fullWidth required />
        <EmailInput source="email" fullWidth required />
        <TextInput source="username" fullWidth required />
        <TextInput source="phone_number" fullWidth />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Account Configuration
        </Typography>

        <SelectInput
          source="bankingAccess"
          choices={[
            { id: 'CONVENTIONAL', name: 'Conventional Banking' },
            { id: 'SYARIAH', name: 'Syariah Banking' },
            { id: 'BOTH', name: 'Dual Banking' },
          ]}
          fullWidth
          required
        />

        <PasswordInput source="password" fullWidth required />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Employment Information
        </Typography>

        <TextInput source="employeeId" fullWidth />
        <TextInput source="department" fullWidth />
        <TextInput source="position" fullWidth />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Syariah Banking (if applicable)
        </Typography>

        <BooleanInput source="syariahCertified" />
        <TextInput source="syariahCertificationLevel" fullWidth />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Status & Settings
        </Typography>

        <BooleanInput source="isActive" defaultValue={true} />
      </SimpleForm>
    </Create>
  );
};

// User Edit Form - Updated to match backend API fields
const UserEdit = () => {

  return (
    <Edit>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Personal Information
        </Typography>

        <TextInput source="fullName" fullWidth required />
        <EmailInput source="email" fullWidth required />
        <TextInput source="username" fullWidth required />
        <TextInput source="phone_number" fullWidth />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Account Configuration
        </Typography>

        <SelectInput
          source="bankingAccess"
          choices={[
            { id: 'CONVENTIONAL', name: 'Conventional Banking' },
            { id: 'SYARIAH', name: 'Syariah Banking' },
            { id: 'BOTH', name: 'Dual Banking' },
          ]}
          fullWidth
        />

        <PasswordInput source="password" helperText="Leave blank to keep current password" />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Employment Information
        </Typography>

        <TextInput source="employeeId" fullWidth />
        <TextInput source="department" fullWidth />
        <TextInput source="position" fullWidth />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Syariah Banking (if applicable)
        </Typography>

        <BooleanInput source="syariahCertified" />
        <TextInput source="syariahCertificationLevel" fullWidth />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Status & Settings
        </Typography>

        <BooleanInput source="isActive" />

        <Labeled label="Security Information">
          <Box>
            <DateField source="lastLoginAt" showTime />
            <BooleanField source="mfaEnabled" label="MFA Enabled" />
            <DateField source="createdAt" showTime />
            <DateField source="updatedAt" showTime />
          </Box>
        </Labeled>
      </SimpleForm>
    </Edit>
  );
};

// User Show View - Updated to match backend API fields
const UserShow = () => {

  return (
    <Show>
      <SimpleShowLayout>
        <Stack direction="row" spacing={3} alignItems="start">
          <Box>
            <AvatarField source="avatar_url" />
          </Box>
          <Box flex={1}>
            <Typography variant="h5" gutterBottom>
              User Details
            </Typography>

            <Stack spacing={2}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Full Name
                </Typography>
                <TextField source="fullName" />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <EmailField source="email" />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Username
                </Typography>
                <TextField source="username" />
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <TextField source="phone_number" />
              </Box>
            </Stack>
          </Box>
        </Stack>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Account Configuration
        </Typography>

        <Stack spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Banking Access
            </Typography>
            <FunctionField
              source="bankingAccess"
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
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Roles
            </Typography>
            <FunctionField
              source="roles"
              render={(record: any) => {
                const roles = record.roles || [];
                return roles.map((role: any, index: number) => (
                  <ChipField
                    key={index}
                    source="roleName"
                    record={role}
                    size="small"
                    style={{ marginRight: 4, marginBottom: 4 }}
                  />
                ));
              }}
            />
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Active Status
            </Typography>
            <BooleanField source="isActive" />
          </Box>
        </Stack>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Employment Information
        </Typography>

        <Stack spacing={2}>
          <TextField source="employeeId" />
          <TextField source="department" />
          <TextField source="position" />
        </Stack>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Syariah Banking Information
        </Typography>

        <Stack spacing={2}>
          <BooleanField source="syariahCertified" />
          <TextField source="syariahCertificationLevel" />
        </Stack>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Security & Access
        </Typography>

        <Stack spacing={2}>
          <DateField source="lastLoginAt" showTime />
          <BooleanField source="mfaEnabled" label="MFA Enabled" />
          <DateField source="createdAt" showTime />
          <DateField source="updatedAt" showTime />
        </Stack>
      </SimpleShowLayout>
    </Show>
  );
};

export const UserResource = {
  list: UserList,
  create: UserCreate,
  edit: UserEdit,
  show: UserShow,
  icon: Person,
  options: { label: 'Users' },
};