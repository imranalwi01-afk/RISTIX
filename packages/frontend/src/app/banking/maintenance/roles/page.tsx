// packages/frontend/src/app/banking/maintenance/roles/page.tsx
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Grid,
  Chip,
  IconButton,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  FormControlLabel,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  VpnKey as KeyIcon,
  AccountBalance as BankingIcon,
  MonetizationOn as MoneyIcon,
  Assessment as ReportIcon,
  Settings as SettingsIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';

// Local components and services
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { api } from '@/services/api';
import { RolePermissionsEditor } from '@/components/rbac/RolePermissionsEditor';

// Types and Interfaces
interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  bankingAccess?: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  isActive: boolean;
  isBuiltIn: boolean;
  permissions: Permission[];
  assignedUsers: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

interface Permission {
  id: string;
  module: string;
  resource: string;
  action: string;
  displayName: string;
  description: string;
  category: 'CORE' | 'BANKING' | 'IFRS9' | 'REPORTING' | 'ADMIN';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresApproval: boolean;
  bankingSpecific?: boolean;
  syariahRequired?: boolean;
}

interface PermissionCategory {
  name: string;
  displayName: string;
  permissions: Permission[];
}

interface RoleFilters {
  type?: string;
  level?: string;
  bankingAccess?: string;
  isActive?: boolean;
  searchTerm?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`role-management-tabpanel-${index}`}
    aria-labelledby={`role-management-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
  </div>
);

const RoleManagementPage: React.FC = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoleFilters>({});

  // Dialog states
  const [roleDialog, setRoleDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit' | 'view';
    role: Role | null;
  }>({
    open: false,
    mode: 'create',
    role: null,
  });

  const [permissionDialog, setPermissionDialog] = useState<{
    open: boolean;
    role: Role | null;
    selectedPermissions: string[];
  }>({
    open: false,
    role: null,
    selectedPermissions: [],
  });

  const [roleForm, setRoleForm] = useState<{
    name: string;
    displayName: string;
    description: string;
    type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
    level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
    bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
    isActive: boolean;
  }>({
    name: '',
    displayName: '',
    description: '',
    type: 'CUSTOM',
    level: 'TENANT',
    bankingAccess: 'CONVENTIONAL',
    isActive: true,
  });

  // ✅ NO MOCK DATA - All data comes from real tenant database via API

  // ✅ NO MOCK PERMISSIONS - All permissions come from real tenant database via API

  // Group permissions by category
  const groupPermissionsByCategory = (permissions: Permission[]): PermissionCategory[] => {
    const categories: { [key: string]: PermissionCategory } = {};

    permissions.forEach(permission => {
      if (!categories[permission.category]) {
        categories[permission.category] = {
          name: permission.category,
          displayName: permission.category.replace('_', ' '),
          permissions: [],
        };
      }
      categories[permission.category].permissions.push(permission);
    });

    return Object.values(categories);
  };

  // Fetch data using REAL API - NO MOCK DATA
  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔒 Fetching roles from real tenant database...');

      // Build query parameters from filters
      const params: any = {};
      if (filters.searchTerm) params.search = filters.searchTerm;
      if (filters.type && filters.type !== 'all') params.type = filters.type;
      if (filters.level && filters.level !== 'all') params.level = filters.level;
      if (filters.bankingAccess && filters.bankingAccess !== 'all') params.bankingAccess = filters.bankingAccess;
      if (filters.isActive !== undefined) params.isActive = filters.isActive;

      // Fetch roles and permissions from real API
      const [rolesResponse, permissionsResponse] = await Promise.all([
        api.roles.getAll(params),
        api.roles.getPermissions()
      ]);

      console.log('✅ Real API responses received:', {
        rolesInfo: rolesResponse,
        permissionsInfo: permissionsResponse
      });

      // Handle standardized response with axios wrapper: response.data = { success: true, data: [...], pagination: { ... } }
      const rolesData = Array.isArray(rolesResponse.data?.data) ? rolesResponse.data.data : [];
      const permissionsData = Array.isArray(permissionsResponse.data?.data) ? permissionsResponse.data.data : [];

      console.log('📊 Processed data:', {
        rolesCount: rolesData.length,
        permissionsCount: permissionsData.length
      });

      // Set data from real API responses
      setRoles(rolesData);
      setPermissions(permissionsData);
      setPermissionCategories(groupPermissionsByCategory(permissionsData));

    } catch (error) {
      console.error('❌ Error fetching roles from real database:', error);
      setError('Failed to fetch roles from database. Please check your connection and try again.');

      // NO FALLBACK TO MOCK DATA - Use empty arrays instead
      setRoles([]);
      setPermissions([]);
      setPermissionCategories([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleFilterChange = (field: keyof RoleFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleRefresh = () => {
    fetchRoles();
  };

  const handleCreateRole = () => {
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      type: 'CUSTOM',
      level: 'TENANT',
      bankingAccess: 'CONVENTIONAL',
      isActive: true,
    });
    setRoleDialog({
      open: true,
      mode: 'create',
      role: null,
    });
  };

  const handleEditRole = (role: Role) => {
    setRoleForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      type: role.type,
      level: role.level,
      bankingAccess: role.bankingAccess || 'CONVENTIONAL',
      isActive: role.isActive,
    });
    setRoleDialog({
      open: true,
      mode: 'edit',
      role,
    });
  };

  const handleViewRole = (role: Role) => {
    setRoleDialog({
      open: true,
      mode: 'view',
      role,
    });
  };

  const handleManagePermissions = (role: Role) => {
    setPermissionDialog({
      open: true,
      role,
      selectedPermissions: role.permissions.map(p => p.id),
    });
  };

  const handleSaveRole = async () => {
    try {
      console.log('🔒 Saving role to tenant database...');

      // Prepare role data for API - map form fields to API expected format
      const roleData = {
        name: roleForm.name,
        displayName: roleForm.displayName,
        description: roleForm.description,
        type: roleForm.type,
        level: roleForm.level,
        bankingAccess: roleForm.bankingAccess,
        isActive: roleForm.isActive,
        // Add selected permissions from the form (get from permissionDialog if editing)
        permissions: permissionDialog.selectedPermissions
      };

      if (roleDialog.mode === 'create') {
        console.log('🆕 Creating new role with real API call');
        await api.roles.create(roleData);
      } else if (roleDialog.role) {
        console.log('✏️ Updating existing role with real API call');
        await api.roles.update(roleDialog.role.id, roleData);
      }

      // Close dialog and refresh data from database
      setRoleDialog({ open: false, mode: 'create', role: null });
      await fetchRoles(); // Refresh from real database
      console.log('✅ Role saved successfully to tenant database');
    } catch (error) {
      console.error('❌ Error saving role to database:', error);
      // TODO: Add proper error handling/notification to user
    }
  };

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    try {
      console.log(`🔄 ${isActive ? 'Disabling' : 'Enabling'} role in tenant database:`, roleId);

      // Use real API call to toggle role status
      await api.roles.update(roleId, { isActive: !isActive });

      console.log(`✅ Role ${isActive ? 'disabled' : 'enabled'} successfully`);
      await fetchRoles(); // Refresh from real database
    } catch (error) {
      console.error('❌ Error toggling role status in database:', error);
      // TODO: Add proper error handling/notification to user
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    try {
      console.log('🗑️ Deleting role from tenant database:', roleId);

      // Call real API to delete role
      await api.roles.delete(roleId);

      console.log('✅ Role deleted successfully');

      // Refresh roles list
      fetchRoles();
    } catch (error) {
      console.error('❌ Error deleting role from database:', error);
      setError('Failed to delete role. Please try again.');
    }
  };

  // Role Matrix handlers
  const handleMassPermissionUpdate = async (roleId: string, permissionIds: string[]) => {
    try {
      console.log('🔑 Updating all permissions for role:', roleId);

      // Call real API to update permissions
      await api.roles.updatePermissions(roleId, permissionIds);

      console.log('✅ Role permissions updated successfully');

      // Refresh roles list to show updated state
      await fetchRoles();
    } catch (error) {
      console.error('❌ Error updating role permissions:', error);
      setError('Failed to update role permissions. Please try again.');
    }
  };

  const handleRolePermissionUpdate = async (roleId: string, permissionIds: string[]) => {
    try {
      console.log('🔑 Updating permissions for role:', roleId, permissionIds);

      // Call real API to update permissions
      await api.roles.updatePermissions(roleId, permissionIds);

      console.log('✅ Role permissions updated successfully');

      // Refresh roles list to show updated state
      await fetchRoles();
    } catch (error) {
      console.error('❌ Error updating role permissions:', error);
      setError('Failed to update role permissions. Please try again.');
    }
  };

  // Helper functions
  const getRoleTypeColor = (type: string) => {
    switch (type) {
      case 'SYSTEM': return 'error';
      case 'BANKING': return 'primary';
      case 'CUSTOM': return 'secondary';
      default: return 'default';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      case 'CRITICAL': return 'error';
      default: return 'default';
    }
  };

  const getBankingAccessColor = (access?: string) => {
    switch (access) {
      case 'CONVENTIONAL': return 'primary';
      case 'SYARIAH': return 'secondary';
      case 'BOTH': return 'success';
      default: return 'default';
    }
  };

  // DataGrid columns
  const roleColumns: GridColDef[] = [
    {
      field: 'displayName',
      headerName: 'Role Name',
      flex: 2,
      minWidth: 200,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
            {params.row.displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.name}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.type}
          size="small"
          color={getRoleTypeColor(params.row.type) as any}
          variant="outlined"
        />
      ),
    },
    {
      field: 'level',
      headerName: 'Level',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.level}
          size="small"
          variant="filled"
          color="default"
        />
      ),
    },
    {
      field: 'bankingAccess',
      headerName: 'Banking Access',
      width: 130,
      renderCell: (params: GridRenderCellParams) => (
        params.row.bankingAccess ? (
          <Chip
            label={params.row.bankingAccess}
            size="small"
            color={getBankingAccessColor(params.row.bankingAccess) as any}
            variant="outlined"
          />
        ) : (
          <Typography variant="caption" color="text.secondary">-</Typography>
        )
      ),
    },
    {
      field: 'assignedUsers',
      headerName: 'Users',
      width: 80,
      renderCell: (params: GridRenderCellParams) => (
        <Badge badgeContent={params.row.assignedUsers} color="primary">
          <PeopleIcon fontSize="small" />
        </Badge>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={params.row.isActive ? 'success' : 'default'}
          icon={params.row.isActive ? <CheckCircleIcon /> : <CancelIcon />}
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant="body2">
          {format(parseISO(params.row.createdAt), 'MMM dd, yyyy')}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      type: 'actions',
      getActions: (params: GridRowParams) => [
        <SafeGridActionsCellItem
          key="view"
          icon={<VisibilityIcon fontSize="small" />}
          label="View Role"
          onClick={() => handleViewRole(params.row)}
        />,
        <SafeGridActionsCellItem
          key="edit"
          icon={<EditIcon fontSize="small" />}
          label="Edit Role"
          onClick={() => handleEditRole(params.row)}
          disabled={params.row.isBuiltIn}
        />,
        <SafeGridActionsCellItem
          key="permissions"
          icon={<SecurityIcon fontSize="small" />}
          label="Manage Permissions"
          onClick={() => handleManagePermissions(params.row)}
        />,
        <SafeGridActionsCellItem
          key="toggle"
          icon={params.row.isActive ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
          label={params.row.isActive ? 'Disable Role' : 'Enable Role'}
          onClick={() => handleToggleRole(params.row.id, params.row.isActive)}
          disabled={params.row.isBuiltIn}
        />,
      ],
    },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box sx={{ color, opacity: 0.7 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Role Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage user roles, permissions, and access controls across the platform
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Statistics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Roles"
            value={roles.length}
            icon={<SecurityIcon fontSize="large" />}
            color={theme.palette.primary.main}
            subtitle="Active roles"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="System Roles"
            value={roles.filter(r => r.type === 'SYSTEM').length}
            icon={<AdminIcon fontSize="large" />}
            color={theme.palette.error.main}
            subtitle="Built-in roles"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Banking Roles"
            value={roles.filter(r => r.type === 'BANKING').length}
            icon={<BankingIcon fontSize="large" />}
            color={theme.palette.info.main}
            subtitle="Banking specific"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <StatCard
            title="Total Users"
            value={roles.reduce((sum, role) => sum + role.assignedUsers, 0)}
            icon={<PeopleIcon fontSize="large" />}
            color={theme.palette.success.main}
            subtitle="With assigned roles"
          />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab
            label="Roles"
            icon={<GroupIcon />}
            iconPosition="start"
          />
          <Tab
            label="Permissions"
            icon={<KeyIcon />}
            iconPosition="start"
          />
          <Tab
            label="Role Matrix"
            icon={<AssignmentIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Roles Tab */}
      <TabPanel value={currentTab} index={0}>
        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardHeader
            title="Filters"
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  size="small"
                >
                  Clear
                </Button>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading}
                  size="small"
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateRole}
                  size="small"
                >
                  Add Role
                </Button>
              </Box>
            }
          />
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    label="Type"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="SYSTEM">System</MenuItem>
                    <MenuItem value="BANKING">Banking</MenuItem>
                    <MenuItem value="CUSTOM">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={filters.level || ''}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    label="Level"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="PLATFORM">Platform</MenuItem>
                    <MenuItem value="TENANT">Tenant</MenuItem>
                    <MenuItem value="DEPARTMENT">Department</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Banking Access</InputLabel>
                  <Select
                    value={filters.bankingAccess || ''}
                    onChange={(e) => handleFilterChange('bankingAccess', e.target.value)}
                    label="Banking Access"
                  >
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="CONVENTIONAL">Conventional</MenuItem>
                    <MenuItem value="SYARIAH">Syariah</MenuItem>
                    <MenuItem value="BOTH">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search"
                  placeholder="Search roles..."
                  value={filters.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Roles DataGrid */}
        <Card>
          <CardHeader
            title={`Roles (${roles.length})`}
            subheader={`Last updated: ${format(new Date(), 'MMM dd, yyyy HH:mm')}`}
          />
          <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
            <SafeDataGrid
              rows={roles}
              columns={roleColumns}
              loading={loading}
              pageSizeOptions={[10, 25, 50]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 25 },
                },
              }}
              checkboxSelection
              disableRowSelectionOnClick
              sx={{ height: 600 }}
            />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Permissions Tab */}
      <TabPanel value={currentTab} index={1}>
        <Grid container spacing={3}>
          {permissionCategories.map((category) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={category.name}>
              <Card>
                <CardHeader
                  title={category.displayName}
                  subheader={`${category.permissions.length} permissions`}
                />
                <CardContent>
                  <List dense>
                    {category.permissions.map((permission) => (
                      <ListItem key={permission.id} divider>
                        <ListItemIcon>
                          {permission.category === 'BANKING' && <BankingIcon />}
                          {permission.category === 'IFRS9' && <MoneyIcon />}
                          {permission.category === 'REPORTING' && <ReportIcon />}
                          {permission.category === 'ADMIN' && <AdminIcon />}
                          {permission.category === 'CORE' && <SettingsIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary={permission.displayName}
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Chip
                                label={permission.riskLevel}
                                size="small"
                                color={getRiskLevelColor(permission.riskLevel) as any}
                                variant="outlined"
                              />
                              {permission.requiresApproval && (
                                <Chip
                                  label="Approval Required"
                                  size="small"
                                  color="warning"
                                  variant="filled"
                                />
                              )}
                              {permission.syariahRequired && (
                                <Chip
                                  label="Syariah"
                                  size="small"
                                  color="secondary"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Role Matrix Tab */}
      <TabPanel value={currentTab} index={2}>
        <Card>
          <CardHeader
            title="Role-Permission Matrix"
            subheader="Interactive view of role permissions across all categories"
            action={
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  size="small"
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<SettingsIcon />}
                  onClick={() => {
                    // Export role matrix
                    console.log('📊 Exporting role matrix...');
                  }}
                  size="small"
                >
                  Export
                </Button>
              </Box>
            }
          />
          <CardContent>
            {/* Matrix Controls */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Select Role</InputLabel>
                <Select
                  value=""
                  onChange={(e) => {
                    const roleId = e.target.value;
                    if (roleId) {
                      const role = roles.find(r => r.id === roleId);
                      if (role) {
                        setPermissionDialog({
                          open: true,
                          role,
                          selectedPermissions: role.permissions.map(p => p.id)
                        });
                      }
                    }
                  }}
                  label="Select Role"
                >
                  <MenuItem value="">Select a role to view permissions...</MenuItem>
                  {roles.map((role) => (
                    <MenuItem key={role.id} value={role.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{role.displayName}</Typography>
                        <Chip
                          label={role.type}
                          size="small"
                          color={getRoleTypeColor(role.type) as any}
                          variant="outlined"
                        />
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter Category</InputLabel>
                <Select
                  value=""
                  onChange={(e) => {
                    const category = e.target.value;
                    // Implement category filtering
                    console.log('🔍 Filtering by category:', category);
                  }}
                  label="Filter Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {permissionCategories.map((category) => (
                    <MenuItem key={category.name} value={category.name}>
                      {category.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    defaultChecked
                    onChange={(e) => {
                      console.log('🔄 Compact view:', e.target.checked);
                    }}
                  />
                }
                label="Compact View"
              />

              <Typography variant="caption" color="text.secondary">
                Showing {roles.length} roles × {permissions.length} permissions
              </Typography>
            </Box>

            {/* Matrix Table */}
            <Box sx={{
              overflow: 'auto',
              maxHeight: 600,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1
            }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[50] }}>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        minWidth: 150,
                        position: 'sticky',
                        left: 0,
                        zIndex: 1,
                        backgroundColor: theme.palette.grey[50]
                      }}
                    >
                      Role / Permission
                    </TableCell>
                    {permissions.map((permission) => (
                      <TableCell
                        key={permission.id}
                        sx={{
                          minWidth: 120,
                          fontSize: '0.75rem',
                          textAlign: 'center',
                          padding: '8px 4px'
                        }}
                      >
                        <Box>
                          <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                            {permission.displayName}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
                            <Chip
                              label={permission.riskLevel}
                              size="small"
                              color={getRiskLevelColor(permission.riskLevel) as any}
                              variant="outlined"
                              sx={{ height: 16, fontSize: '0.6rem' }}
                            />
                            {permission.requiresApproval && (
                              <Chip
                                label="!"
                                size="small"
                                color="warning"
                                sx={{ height: 16, width: 16, fontSize: '0.6rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow
                      key={role.id}
                      sx={{
                        '&:hover': { backgroundColor: theme.palette.action.hover },
                        backgroundColor: role.isBuiltIn ? theme.palette.grey[50] : 'inherit'
                      }}
                    >
                      <TableCell
                        sx={{
                          position: 'sticky',
                          left: 0,
                          zIndex: 1,
                          backgroundColor: role.isBuiltIn ? theme.palette.grey[50] : 'white',
                          fontWeight: 'medium',
                          minWidth: 150
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Checkbox
                            size="small"
                            indeterminate={
                              role.permissions.length > 0 &&
                              role.permissions.length < permissions.length
                            }
                            checked={role.permissions.length === permissions.length && permissions.length > 0}
                            onChange={(e) => {
                              const newChecked = e.target.checked;
                              const newPermissions = newChecked
                                ? permissions.map(p => p.id)
                                : [];
                              handleMassPermissionUpdate(role.id, newPermissions);
                            }}
                            disabled={role.isBuiltIn}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {role.displayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {role.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                              <Chip
                                label={role.type}
                                size="small"
                                color={getRoleTypeColor(role.type) as any}
                                variant="outlined"
                                sx={{ fontSize: '0.6rem' }}
                              />
                              {role.bankingAccess && (
                                <Chip
                                  label={role.bankingAccess}
                                  size="small"
                                  color={getBankingAccessColor(role.bankingAccess) as any}
                                  variant="filled"
                                  sx={{ fontSize: '0.6rem' }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      {permissions.map((permission) => {
                        const hasPermission = role.permissions.some(p => p.id === permission.id);
                        return (
                          <TableCell
                            key={`${role.id}-${permission.id}`}
                            sx={{
                              textAlign: 'center',
                              padding: '4px',
                              backgroundColor: hasPermission ? theme.palette.success.light : 'inherit'
                            }}
                          >
                            <Checkbox
                              size="small"
                              checked={hasPermission}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const currentPermissions = role.permissions.map(p => p.id);
                                let newPermissions: string[];

                                if (isChecked) {
                                  newPermissions = [...currentPermissions, permission.id];
                                } else {
                                  newPermissions = currentPermissions.filter(p => p !== permission.id);
                                }

                                handleRolePermissionUpdate(role.id, newPermissions);
                              }}
                              disabled={role.isBuiltIn}
                              sx={{
                                color: hasPermission ? 'success.main' : 'default'
                              }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            {/* Matrix Statistics */}
            <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.grey[50], borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Matrix Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Total Permission Assignments
                  </Typography>
                  <Typography variant="h6">
                    {roles.reduce((sum, role) => sum + role.permissions.length, 0)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Average Permissions per Role
                  </Typography>
                  <Typography variant="h6">
                    {roles.length > 0
                      ? Math.round(roles.reduce((sum, role) => sum + role.permissions.length, 0) / roles.length)
                      : 0}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Critical Permissions Assigned
                  </Typography>
                  <Typography variant="h6" color="error.main">
                    {roles.reduce((sum, role) =>
                      sum + role.permissions.filter(p =>
                        permissions.find(perm => perm.id === (typeof p === 'string' ? p : p.id))?.riskLevel === 'CRITICAL'
                      ).length, 0
                    )}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Roles Requiring Approval
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {roles.reduce((sum, role) =>
                      sum + role.permissions.filter(p =>
                        permissions.find(perm => perm.id === (typeof p === 'string' ? p : p.id))?.requiresApproval
                      ).length, 0
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Role Dialog */}
      <Dialog
        open={roleDialog.open}
        onClose={() => setRoleDialog({ open: false, mode: 'create', role: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {roleDialog.mode === 'create' && 'Create New Role'}
          {roleDialog.mode === 'edit' && 'Edit Role'}
          {roleDialog.mode === 'view' && 'Role Details'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Role Name (System)"
                value={roleForm.name}
                onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value.toUpperCase() })}
                disabled={roleDialog.mode === 'view' || (roleDialog.role?.isBuiltIn)}
                placeholder="ROLE_NAME"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Display Name"
                value={roleForm.displayName}
                onChange={(e) => setRoleForm({ ...roleForm, displayName: e.target.value })}
                disabled={roleDialog.mode === 'view'}
                placeholder="Human readable name"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={roleForm.description}
                onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                disabled={roleDialog.mode === 'view'}
                multiline
                rows={3}
                placeholder="Role description and responsibilities"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={roleDialog.mode === 'view'}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={roleForm.type}
                  onChange={(e) => setRoleForm({ ...roleForm, type: e.target.value as any })}
                  label="Type"
                >
                  <MenuItem value="SYSTEM">System</MenuItem>
                  <MenuItem value="BANKING">Banking</MenuItem>
                  <MenuItem value="CUSTOM">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={roleDialog.mode === 'view'}>
                <InputLabel>Level</InputLabel>
                <Select
                  value={roleForm.level}
                  onChange={(e) => setRoleForm({ ...roleForm, level: e.target.value as any })}
                  label="Level"
                >
                  <MenuItem value="PLATFORM">Platform</MenuItem>
                  <MenuItem value="TENANT">Tenant</MenuItem>
                  <MenuItem value="DEPARTMENT">Department</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth disabled={roleDialog.mode === 'view'}>
                <InputLabel>Banking Access</InputLabel>
                <Select
                  value={roleForm.bankingAccess}
                  onChange={(e) => setRoleForm({ ...roleForm, bankingAccess: e.target.value as any })}
                  label="Banking Access"
                >
                  <MenuItem value="CONVENTIONAL">Conventional</MenuItem>
                  <MenuItem value="SYARIAH">Syariah</MenuItem>
                  <MenuItem value="BOTH">Both</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={roleForm.isActive}
                    onChange={(e) => setRoleForm({ ...roleForm, isActive: e.target.checked })}
                    disabled={roleDialog.mode === 'view'}
                  />
                }
                label="Active Role"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog({ open: false, mode: 'create', role: null })}>
            {roleDialog.mode === 'view' ? 'Close' : 'Cancel'}
          </Button>
          {roleDialog.mode !== 'view' && (
            <Button variant="contained" onClick={handleSaveRole}>
              {roleDialog.mode === 'create' ? 'Create Role' : 'Update Role'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Permission Management Dialog */}
      <Dialog
        open={permissionDialog.open}
        onClose={() => setPermissionDialog({ open: false, role: null, selectedPermissions: [] })}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Manage Permissions: {permissionDialog.role?.displayName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {permissionCategories.map((category) => (
              <Accordion key={category.name} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">{category.displayName}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    ({category.permissions.length} permissions)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={1}>
                    {category.permissions.map((permission) => (
                      <Grid size={{ xs: 12, md: 6 }} key={permission.id}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={permissionDialog.selectedPermissions.includes(permission.id)}
                              onChange={(e) => {
                                const selected = permissionDialog.selectedPermissions;
                                if (e.target.checked) {
                                  setPermissionDialog({
                                    ...permissionDialog,
                                    selectedPermissions: [...selected, permission.id]
                                  });
                                } else {
                                  setPermissionDialog({
                                    ...permissionDialog,
                                    selectedPermissions: selected.filter(id => id !== permission.id)
                                  });
                                }
                              }}
                            />
                          }
                          label={
                            <Box>
                              <Typography variant="body2">{permission.displayName}</Typography>
                              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                <Chip
                                  label={permission.riskLevel}
                                  size="small"
                                  color={getRiskLevelColor(permission.riskLevel) as any}
                                />
                                {permission.requiresApproval && (
                                  <Chip label="Approval" size="small" color="warning" />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialog({ open: false, role: null, selectedPermissions: [] })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={async () => {
            try {
              if (permissionDialog.role) {
                console.log('🔒 Updating role permissions in tenant database:', permissionDialog.role.id);
                console.log('🔧 Selected permissions:', permissionDialog.selectedPermissions);

                // Use real API call to update role permissions
                await api.roles.updatePermissions(permissionDialog.role.id, permissionDialog.selectedPermissions);

                console.log('✅ Role permissions updated successfully');
                await fetchRoles(); // Refresh from real database
              }
              setPermissionDialog({ open: false, role: null, selectedPermissions: [] });
            } catch (error) {
              console.error('❌ Error updating role permissions:', error);
              // TODO: Add proper error handling/notification to user
            }
          }}>
            Save Permissions
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManagementPage;
