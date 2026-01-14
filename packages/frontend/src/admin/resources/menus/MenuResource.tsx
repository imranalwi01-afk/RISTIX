// packages/frontend/src/admin/resources/menus/MenuResource.tsx
import React from 'react';
import {
  List,
  Datagrid,
  NumberField,
  TextField,
  EditButton,
  ShowButton,
  DeleteButton,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  NumberInput,
  BooleanInput,
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
  TabbedShowLayout,
  Tab,
  ArrayInput,
  SimpleFormIterator,
  RichTextField,
  DateField,
  ImageField,
  BooleanField,
  useRecordContext
} from 'react-admin';
import {
  Menu as MenuIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Calculate as CalculateIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Launch as LaunchIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  CreditCard as CreditCardIcon,
  Savings as SavingsIcon,
  AccountTree as AccountTreeIcon,
  Link as LinkIcon,
  DragIndicator as DragIndicatorIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';
import { Card, CardContent, Typography, Box, Stack, Chip, Avatar, IconButton, Tooltip } from '@mui/material';

// Menu Types and Categories - Updated to match backend API
const MENU_TYPES = {
  GROUP: 'group',
  ITEM: 'item',
  DIVIDER: 'divider'
};

const MENU_CATEGORIES = {
  DASHBOARD: 'dashboard',
  USER_MANAGEMENT: 'user_management',
  BANKING_OPERATIONS: 'banking_operations',
  IFRS9_CALCULATIONS: 'ifrs9_calculations',
  REPORTS: 'reports',
  ADMINISTRATION: 'administration',
  SYSTEM: 'system',
  TOOLS: 'tools'
};

const MENU_ICONS = {
  dashboard: DashboardIcon,
  users: PeopleIcon,
  roles: SecurityIcon,
  tenants: AccountBalanceIcon,
  portfolios: AccountBalanceIcon,
  accounts: AccountBalanceIcon,
  calculations: CalculateIcon,
  reports: AssessmentIcon,
  configurations: SettingsIcon,
  uploads: DescriptionIcon,
  products: BusinessIcon,
  customers: PeopleIcon,
  transactions: CreditCardIcon,
  analytics: TrendingUpIcon,
  savings: SavingsIcon,
  loans: AttachMoneyIcon,
  admin: AdminIcon,
  system: SettingsIcon,
  tools: SettingsIcon,
  folder: FolderIcon,
  link: LinkIcon,
  menu: MenuIcon
};

// Enhanced Filters - Updated to match backend API
const MenuFilters = [
  <SearchInput source="q" alwaysOn />,
  <SelectInput
    source="type"
    choices={Object.entries(MENU_TYPES).map(([key, value]) => ({ id: value, name: key }))}
    alwaysOn
  />,
  <SelectInput
    source="banking_type"
    choices={[
      { id: 'conventional', name: 'Conventional' },
      { id: 'syariah', name: 'Syariah' },
      { id: 'both', name: 'Both' }
    ]}
  />,
  <BooleanInput source="is_active" label="Active Only" />,
  <BooleanInput source="is_visible" label="Visible Only" />
];

// Enhanced List Component with Actions
const MenuListActions = () => {
  const { permissions } = usePermissions();
  return (
    <TopToolbar>
      {permissions?.includes('menus:create') && <CreateButton />}
      <ExportButton />
      <RefreshButton />
    </TopToolbar>
  );
};

// Icon Field Component
const IconField = ({ source }: any) => {
  const record = useRecordContext();
  if (!record) return null;

  const IconComponent = MENU_ICONS[record[source]] || MenuIcon;

  return (
    <Box display="flex" alignItems="center" py={1}>
      <IconComponent sx={{ fontSize: 20, color: 'primary.main' }} />
      <Typography variant="body2" sx={{ ml: 1 }}>
        {record[source]}
      </Typography>
    </Box>
  );
};

// Menu Hierarchy Field
const HierarchyField = ({ source }: any) => {
  const record = useRecordContext();
  if (!record) return null;

  const level = record.level || 0;
  const indent = level * 20;

  return (
    <Box display="flex" alignItems="center" sx={{ pl: indent }}>
      {record.parent_id && (
        <DragIndicatorIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
      )}
      <Typography variant="body2">
        {record[source]}
      </Typography>
    </Box>
  );
};

// Status Field Component
const StatusField = ({ source }: any) => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <Box display="flex" alignItems="center" gap={1}>
      <ChipField
        source="is_active"
        color={record.is_active ? 'success' : 'default'}
        size="small"
        label={record.is_active ? 'Active' : 'Inactive'}
      />
      {record.requires_auth && (
        <Tooltip title="Requires Authentication">
          <LockIcon sx={{ fontSize: 16, color: 'warning.main' }} />
        </Tooltip>
      )}
      {record.is_visible && (
        <Tooltip title="Visible">
          <VisibilityIcon sx={{ fontSize: 16, color: 'info.main' }} />
        </Tooltip>
      )}
      {record.is_external && (
        <Tooltip title="External Link">
          <LaunchIcon sx={{ fontSize: 16, color: 'info.main' }} />
        </Tooltip>
      )}
    </Box>
  );
};

// Menu List with Advanced Features
const MenuList = () => {
  const { permissions } = usePermissions();

  return (
    <List
      actions={<MenuListActions />}
      filters={MenuFilters}
      perPage={25}
      sort={{ field: 'sort_order', order: 'ASC' }}
    >
      <Datagrid
        rowClick="show"
        bulkActionButtons={permissions?.includes('menus:delete') ? (
          <>
            <BulkExportButton />
            <BulkDeleteButton />
          </>
        ) : <BulkExportButton />}
      >
        <HierarchyField source="name" label="Menu Item" />
        <IconField source="icon" label="Icon" />
        <TextField source="type" label="Type" />
        <TextField source="path" label="Path" />
        <NumberField source="sort_order" label="Order" />
        <StatusField source="is_active" label="Status" />

        <FunctionField
          source="banking_type"
          label="Banking Type"
          render={(record: any) => (
            <Chip
              label={record.banking_type || 'both'}
              size="small"
              color={record.banking_type === 'conventional' ? 'primary' :
                record.banking_type === 'syariah' ? 'success' : 'default'}
            />
          )}
        />

        <FunctionField
          source="parent_id"
          label="Parent"
          render={(record: any) => (
            <Typography variant="body2">
              {record.parent_id ? 'Submenu' : 'Root'}
            </Typography>
          )}
        />

        {permissions?.includes('menus:edit') && <EditButton />}
        {permissions?.includes('menus:view') && <ShowButton />}
        {permissions?.includes('menus:delete') && <DeleteButton />}
      </Datagrid>
    </List>
  );
};

// Menu Create Form
const MenuCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <Stack direction="row" spacing={2}>
          <TextInput source="name" fullWidth required />
          <TextInput source="path" fullWidth helperText="URL path or route" />
        </Stack>

        <Stack direction="row" spacing={2}>
          <SelectInput
            source="type"
            choices={Object.entries(MENU_TYPES).map(([key, value]) => ({ id: value, name: key }))}
            fullWidth
            required
          />
          <SelectInput
            source="banking_type"
            choices={[
              { id: 'conventional', name: 'Conventional' },
              { id: 'syariah', name: 'Syariah' },
              { id: 'both', name: 'Both' }
            ]}
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <SelectInput
            source="icon"
            choices={Object.entries(MENU_ICONS).map(([key, value]) => ({ id: key, name: key }))}
            fullWidth
            helperText="Select icon for menu item"
          />
          <NumberInput source="sort_order" fullWidth defaultValue={0} />
        </Stack>

        <TextInput
          source="description"
          fullWidth
          multiline
          rows={2}
          helperText="Detailed description of menu functionality"
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Navigation Settings
        </Typography>

        <Stack direction="row" spacing={2}>
          <TextInput source="parent_id" helperText="Parent menu ID for hierarchy" />
          <TextInput source="component" fullWidth helperText="React component name for dynamic rendering" />
        </Stack>

        <TextInput
          source="external_url"
          fullWidth
          helperText="External URL if this is an external link"
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Access Control
        </Typography>

        <Stack direction="row" spacing={2}>
          <BooleanInput source="is_active" defaultValue={true} />
          <BooleanInput source="is_visible" defaultValue={true} />
          <BooleanInput source="requires_auth" defaultValue={true} />
          <BooleanInput source="is_external" defaultValue={false} />
        </Stack>
      </SimpleForm>
    </Create>
  );
};

// Menu Edit Form
const MenuEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>

        <Stack direction="row" spacing={2}>
          <TextInput source="name" fullWidth required />
          <TextInput source="path" fullWidth helperText="URL path or route" />
        </Stack>

        <Stack direction="row" spacing={2}>
          <SelectInput
            source="type"
            choices={Object.entries(MENU_TYPES).map(([key, value]) => ({ id: value, name: key }))}
            fullWidth
            required
          />
          <SelectInput
            source="banking_type"
            choices={[
              { id: 'conventional', name: 'Conventional' },
              { id: 'syariah', name: 'Syariah' },
              { id: 'both', name: 'Both' }
            ]}
            fullWidth
          />
        </Stack>

        <Stack direction="row" spacing={2}>
          <SelectInput
            source="icon"
            choices={Object.entries(MENU_ICONS).map(([key, value]) => ({ id: key, name: key }))}
            fullWidth
            helperText="Select icon for menu item"
          />
          <NumberInput source="sort_order" fullWidth />
        </Stack>

        <TextInput
          source="description"
          fullWidth
          multiline
          rows={2}
          helperText="Detailed description of menu functionality"
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Navigation Settings
        </Typography>

        <Stack direction="row" spacing={2}>
          <TextInput source="parent_id" helperText="Parent menu ID for hierarchy" />
          <TextInput source="component" fullWidth helperText="React component name for dynamic rendering" />
        </Stack>

        <TextInput
          source="external_url"
          fullWidth
          helperText="External URL if this is an external link"
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Access Control
        </Typography>

        <Stack direction="row" spacing={2}>
          <BooleanInput source="is_active" />
          <BooleanInput source="is_visible" />
          <BooleanInput source="requires_auth" />
          <BooleanInput source="is_external" />
        </Stack>

        <Labeled label="System Information">
          <Box>
            <DateField source="created_at" showTime />
            <DateField source="updated_at" showTime />
            <TextField source="created_by" />
            <TextField source="updated_by" />
          </Box>
        </Labeled>
      </SimpleForm>
    </Edit>
  );
};

// Menu Show View
const MenuShow = () => {
  const record = useRecordContext();

  return (
    <Show>
      <TabbedShowLayout>
        <Tab label="Basic Information">
          <Stack direction="row" spacing={3} alignItems="start">
            <Box>
              <FunctionField
                source="icon"
                render={(record) => (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                    {record?.icon && MENU_ICONS[record.icon] ?
                      React.createElement(MENU_ICONS[record.icon]) :
                      <MenuIcon />
                    }
                  </Avatar>
                )}
              />
            </Box>
            <Box flex={1}>
              <Typography variant="h5" gutterBottom>
                Menu Details
              </Typography>

              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Name & Path
                  </Typography>
                  <Typography variant="body1">
                    {record?.name} ({record?.path})
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Type & Banking Type
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <ChipField source="type" />
                    <FunctionField
                      source="banking_type"
                      render={(record) => (
                        <Chip
                          label={record?.banking_type || 'both'}
                          color={record?.banking_type === 'conventional' ? 'primary' :
                            record?.banking_type === 'syariah' ? 'success' : 'default'}
                        />
                      )}
                    />
                  </Stack>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <RichTextField source="description" />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Component
                  </Typography>
                  <TextField source="component" />
                </Box>
              </Stack>
            </Box>
          </Stack>
        </Tab>

        <Tab label="Navigation Settings">
          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Hierarchy
              </Typography>
              <TextField source="level" />
              <TextField source="parent_id" />
              <TextField source="sort_order" />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Link Settings
              </Typography>
              <TextField source="external_url" />
              <BooleanField source="is_external" />
            </Box>

            <Box>
              <Typography variant="body2" color="text.secondary">
                Access Control
              </Typography>
              <Stack direction="row" spacing={1}>
                <BooleanField source="is_active" />
                <BooleanField source="is_visible" />
                <BooleanField source="requires_auth" />
              </Stack>
            </Box>
          </Stack>
        </Tab>

        <Tab label="System Information">
          <Stack spacing={2}>
            <DateField source="created_at" showTime />
            <DateField source="updated_at" showTime />
            <TextField source="created_by" />
            <TextField source="updated_by" />
          </Stack>
        </Tab>
      </TabbedShowLayout>
    </Show>
  );
};

export const MenuResource = {
  list: MenuList,
  create: MenuCreate,
  edit: MenuEdit,
  show: MenuShow,
  icon: MenuIcon,
  options: { label: 'Menu Management' },
};