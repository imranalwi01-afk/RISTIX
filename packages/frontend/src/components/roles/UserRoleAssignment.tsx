// packages/frontend/src/components/roles/UserRoleAssignment.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Badge,
  LinearProgress,
  Grid,
  Avatar,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
  Pagination,
  TablePagination,
  Menu,
  MenuList,
  MenuItem as MuiMenuItem
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Assignment as AssignmentIcon,
  Business as BusinessIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Group as GroupIcon,
  SupervisorAccount as SupervisorIcon,
  AdminPanelSettings as AdminIcon,
  Assessment as ReportIcon,
  AccountBalance as BankingIcon,
  MonetizationOn as MoneyIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { api } from '@/services/api';

// Types
interface User {
  id: string;
  email: string;
  fullName: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  roleAssignments: UserRoleAssignment[];
}

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
  permissions: Record<string, Permission[]>; // Grouped by category
  assignedUsers: number;
  createdAt: string;
}

interface UserRoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  isTemporary: boolean;
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
  requiredApprovalLevel?: number | null;
  requiredApprovers?: number;
  bankingSpecific: boolean;
  syariahRequired?: boolean;
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
    id={`user-role-tabpanel-${index}`}
    aria-labelledby={`user-role-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
  </div>
);

interface UserRoleAssignmentProps {
  onAssignmentChange?: () => void;
  refreshTrigger?: number;
}

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({
  onAssignmentChange,
  refreshTrigger = 0
}) => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Assignment dialog state
  const [assignmentDialog, setAssignmentDialog] = useState<{
    open: boolean;
    mode: 'assign' | 'remove' | 'view';
    user: User | null;
    role: Role | null;
  }>({
    open: false,
    mode: 'assign',
    user: null,
    role: null
  });
  // Helper function to flatten grouped permissions
  const flattenPermissions = (groupedPermissions: Record<string, Permission[]>): Permission[] => {
    return Object.values(groupedPermissions).flat();
  };
  // Bulk assignment state
  const [bulkDialog, setBulkDialog] = useState<{
    open: boolean;
    mode: 'assign' | 'remove';
    selectedUsers: string[];
    selectedRoles: string[];
  }>({
    open: false,
    mode: 'assign',
    selectedUsers: [],
    selectedRoles: []
  });

  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoleType, setFilterRoleType] = useState<string>('all');
  const [filterUserStatus, setFilterUserStatus] = useState<string>('all');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [showInactiveRoles, setShowInactiveRoles] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [rolePage, setRolePage] = useState(0);
  const [roleRowsPerPage, setRoleRowsPerPage] = useState(10);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('👥 Fetching user-role assignment data...');
      const [usersResponse, rolesResponse] = await Promise.all([
        api.users.getAll({}),
        api.roles.getAll({})
      ]);

      setUsers(usersResponse.data || []);
      setRoles(rolesResponse.data || []);

      console.log(`✅ Fetched ${usersResponse.data?.length || 0} users and ${rolesResponse.data?.length || 0} roles`);

    } catch (error) {
      console.error('❌ Error fetching user-role assignment data:', error);
      setError('Failed to load user-role assignment data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  // Filter users and roles
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (!showInactiveUsers && !user.isActive) return false;
      if (searchTerm && !user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      // Filter by role assignment
      if (filterRoleType !== 'all') {
        const hasRoleType = user.roleAssignments.some(assignment => {
          const role = roles.find(r => r.id === assignment.roleId);
          return role?.type === filterRoleType;
        });
        if (!hasRoleType) return false;
      }

      return true;
    });
  }, [users, searchTerm, showInactiveUsers, filterRoleType, roles]);

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (!showInactiveRoles && !role.isActive) return false;
      if (searchTerm && !role.displayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !role.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [roles, searchTerm, showInactiveRoles]);

  // Paginated data
  const paginatedUsers = useMemo(() => {
    const startIndex = userPage * userRowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + userRowsPerPage);
  }, [filteredUsers, userPage, userRowsPerPage]);

  const paginatedRoles = useMemo(() => {
    const startIndex = rolePage * roleRowsPerPage;
    return filteredRoles.slice(startIndex, startIndex + roleRowsPerPage);
  }, [filteredRoles, rolePage, roleRowsPerPage]);

  // Get role type color
  const getRoleTypeColor = (type: string) => {
    switch (type) {
      case 'SYSTEM': return 'error';
      case 'BANKING': return 'primary';
      case 'CUSTOM': return 'secondary';
      default: return 'default';
    }
  };

  // Get user status color
  const getUserStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'default';
  };

  // Handle role assignment
  const handleAssignRole = async (userId: string, roleId: string) => {
    try {
      console.log(`🔗 Assigning role ${roleId} to user ${userId}`);
      await api.roles.assignUser(roleId, userId);
      onAssignmentChange?.();
      await fetchData();
    } catch (error) {
      console.error('❌ Error assigning role:', error);
      setError('Failed to assign role to user');
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      console.log(`❌ Removing role ${roleId} from user ${userId}`);
      await api.roles.removeUser(roleId, userId);
      onAssignmentChange?.();
      await fetchData();
    } catch (error) {
      console.error('❌ Error removing role:', error);
      setError('Failed to remove role from user');
    }
  };

  // Bulk operations
  const handleBulkAssign = async () => {
    if (bulkDialog.selectedUsers.length === 0 || bulkDialog.selectedRoles.length === 0) {
      setError('Please select users and roles for bulk assignment');
      return;
    }

    try {
      console.log(`🔗 Bulk assigning ${bulkDialog.selectedRoles.length} roles to ${bulkDialog.selectedUsers.length} users`);

      for (const roleId of bulkDialog.selectedRoles) {
        for (const userId of bulkDialog.selectedUsers) {
          await api.roles.assignUser(roleId, userId);
        }
      }

      onAssignmentChange?.();
      await fetchData();
      setBulkDialog({ open: false, mode: 'assign', selectedUsers: [], selectedRoles: [] });
    } catch (error) {
      console.error('❌ Error in bulk assignment:', error);
      setError('Failed to complete bulk assignment');
    }
  };

  const handleBulkRemove = async () => {
    if (bulkDialog.selectedUsers.length === 0 || bulkDialog.selectedRoles.length === 0) {
      setError('Please select users and roles for bulk removal');
      return;
    }

    try {
      console.log(`❌ Bulk removing ${bulkDialog.selectedRoles.length} roles from ${bulkDialog.selectedUsers.length} users`);

      for (const roleId of bulkDialog.selectedRoles) {
        for (const userId of bulkDialog.selectedUsers) {
          await api.roles.removeUser(roleId, userId);
        }
      }

      onAssignmentChange?.();
      await fetchData();
      setBulkDialog({ open: false, mode: 'remove', selectedUsers: [], selectedRoles: [] });
    } catch (error) {
      console.error('❌ Error in bulk removal:', error);
      setError('Failed to complete bulk removal');
    }
  };

  // Open assignment dialog
  const openAssignmentDialog = (user: User, role: Role, mode: 'assign' | 'remove' | 'view') => {
    setAssignmentDialog({
      open: true,
      mode,
      user,
      role
    });
  };

  // Get statistics
  const getStatistics = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const totalRoles = roles.length;
    const activeRoles = roles.filter(r => r.isActive).length;
    const totalAssignments = users.reduce((sum, user) => sum + user.roleAssignments.length, 0);
    const activeAssignments = users.reduce((sum, user) =>
      sum + user.roleAssignments.filter(assignment => assignment.isActive).length, 0);

    const rolesByType = {
      system: roles.filter(r => r.type === 'SYSTEM').length,
      banking: roles.filter(r => r.type === 'BANKING').length,
      custom: roles.filter(r => r.type === 'CUSTOM').length
    };

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      totalRoles,
      activeRoles,
      inactiveRoles: totalRoles - activeRoles,
      totalAssignments,
      activeAssignments,
      inactiveAssignments: totalAssignments - activeAssignments,
      rolesByType,
      averageRolesPerUser: totalUsers > 0 ? (totalAssignments / totalUsers).toFixed(1) : '0'
    };
  };

  const stats = getStatistics();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading user-role assignments...</Typography>
          <LinearProgress sx={{ mt: 2 }} />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          User-Role Assignment Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<GroupIcon />}
            onClick={() => setBulkDialog({ ...bulkDialog, open: true, mode: 'assign' })}
          >
            Bulk Assign
          </Button>
          <IconButton onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Statistics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.primary.main}` }}>
            <Typography variant="h4" color="primary">{stats.totalUsers}</Typography>
            <Typography variant="body2" color="text.secondary">Total Users</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.success.main}` }}>
            <Typography variant="h4" color="success.main">{stats.activeUsers}</Typography>
            <Typography variant="body2" color="text.secondary">Active Users</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.secondary.main}` }}>
            <Typography variant="h4" color="secondary.main">{stats.totalAssignments}</Typography>
            <Typography variant="body2" color="text.secondary">Total Assignments</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', borderLeft: `4px solid ${theme.palette.info.main}` }}>
            <Typography variant="h4" color="info.main">{stats.averageRolesPerUser}</Typography>
            <Typography variant="body2" color="text.secondary">Avg Roles/User</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Role Type Distribution */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Role Type Distribution
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AdminIcon color="error" />
              <Typography variant="body2">System: {stats.rolesByType.system}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BankingIcon color="primary" />
              <Typography variant="body2">Banking: {stats.rolesByType.banking}</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SettingsIcon color="secondary" />
              <Typography variant="body2">Custom: {stats.rolesByType.custom}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FilterIcon />
              <Typography variant="subtitle1">Filters</Typography>
              <Chip
                label={`${filteredUsers.length} users`}
                size="small"
                color="primary"
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Users"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role Type</InputLabel>
                  <Select
                    value={filterRoleType}
                    onChange={(e) => setFilterRoleType(e.target.value)}
                    label="Role Type"
                  >
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="SYSTEM">System</MenuItem>
                    <MenuItem value="BANKING">Banking</MenuItem>
                    <MenuItem value="CUSTOM">Custom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactiveUsers}
                      onChange={(e) => setShowInactiveUsers(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Show Inactive Users"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showInactiveRoles}
                      onChange={(e) => setShowInactiveRoles(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Show Inactive Roles"
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(e, newValue) => setCurrentTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab
            label="Users View"
            icon={<PeopleIcon />}
          />
          <Tab
            label="Roles View"
            icon={<SecurityIcon />}
          />
        </Tabs>

        {/* Users View Tab */}
        <TabPanel value={currentTab} index={0}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Roles</TableCell>
                  <TableCell>Role Count</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>
                          {user.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {user.fullName}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={getUserStatusColor(user.isActive)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {user.roleAssignments
                          .filter(assignment => {
                            const role = roles.find(r => r.id === assignment.roleId);
                            return role?.isActive;
                          })
                          .map((assignment) => {
                            const role = roles.find(r => r.id === assignment.roleId);
                            return role ? (
                              <Chip
                                key={assignment.id}
                                label={role.displayName}
                                size="small"
                                color={getRoleTypeColor(role.type) as any}
                                variant="outlined"
                              />
                            ) : null;
                          })}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={user.roleAssignments.length} color="primary">
                        <AssignmentIcon fontSize="small" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(user.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt
                        ? format(parseISO(user.lastLoginAt), 'MMM dd, yyyy')
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View User Details">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage Roles">
                          <IconButton size="small">
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredUsers.length}
              rowsPerPage={userRowsPerPage}
              page={userPage}
              onPageChange={(e, newPage) => setUserPage(newPage)}
              onRowsPerPageChange={(e) => {
                setUserRowsPerPage(parseInt(e.target.value, 10));
                setUserPage(0);
              }}
            />
          </TableContainer>
        </TabPanel>

        {/* Roles View Tab */}
        <TabPanel value={currentTab} index={1}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Role</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned Users</TableCell>
                  <TableCell>Permissions</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {role.displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {role.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role.type}
                        size="small"
                        color={getRoleTypeColor(role.type) as any}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{role.level}</TableCell>
                    <TableCell>
                      <Chip
                        label={role.isActive ? 'Active' : 'Inactive'}
                        size="small"
                        color={role.isActive ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={role.assignedUsers} color="primary">
                        <PeopleIcon fontSize="small" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge badgeContent={flattenPermissions(role.permissions).length} color="secondary">
                        <SecurityIcon fontSize="small" />
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(role.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="View Role Details">
                          <IconButton size="small">
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Manage User Assignments">
                          <IconButton size="small">
                            <PeopleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredRoles.length}
              rowsPerPage={roleRowsPerPage}
              page={rolePage}
              onPageChange={(e, newPage) => setRolePage(newPage)}
              onRowsPerPageChange={(e) => {
                setRoleRowsPerPage(parseInt(e.target.value, 10));
                setRolePage(0);
              }}
            />
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Assignment Dialog */}
      <Dialog
        open={assignmentDialog.open}
        onClose={() => setAssignmentDialog({ open: false, mode: 'assign', user: null, role: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {assignmentDialog.mode === 'assign' && 'Assign Role'}
          {assignmentDialog.mode === 'remove' && 'Remove Role'}
          {assignmentDialog.mode === 'view' && 'View Assignment'}
        </DialogTitle>
        <DialogContent>
          {assignmentDialog.user && assignmentDialog.role && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>User:</strong> {assignmentDialog.user.fullName}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Role:</strong> {assignmentDialog.role.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {assignmentDialog.role.description}
              </Typography>

              {assignmentDialog.mode !== 'view' && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Are you sure you want to {assignmentDialog.mode} this role from the user?
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignmentDialog({ open: false, mode: 'assign', user: null, role: null })}>
            Cancel
          </Button>
          {assignmentDialog.mode !== 'view' && (
            <Button
              variant="contained"
              color={assignmentDialog.mode === 'remove' ? 'error' : 'primary'}
              onClick={() => {
                if (assignmentDialog.user && assignmentDialog.role) {
                  if (assignmentDialog.mode === 'assign') {
                    handleAssignRole(assignmentDialog.user.id, assignmentDialog.role.id);
                  } else if (assignmentDialog.mode === 'remove') {
                    handleRemoveRole(assignmentDialog.user.id, assignmentDialog.role.id);
                  }
                }
              }}
            >
              {assignmentDialog.mode === 'assign' ? 'Assign' : 'Remove'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Bulk Assignment Dialog */}
      <Dialog
        open={bulkDialog.open}
        onClose={() => setBulkDialog({ open: false, mode: 'assign', selectedUsers: [], selectedRoles: [] })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Bulk {bulkDialog.mode === 'assign' ? 'Assignment' : 'Removal'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {bulkDialog.mode === 'assign'
              ? `Assign ${bulkDialog.selectedRoles.length} roles to ${bulkDialog.selectedUsers.length} users`
              : `Remove ${bulkDialog.selectedRoles.length} roles from ${bulkDialog.selectedUsers.length} users`}
          </Typography>

          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography>Selected Users ({bulkDialog.selectedUsers.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {bulkDialog.selectedUsers.map(userId => {
                  const user = users.find(u => u.id === userId);
                  return user ? (
                    <ListItem key={userId}>
                      <ListItemText
                        primary={user.fullName}
                        secondary={user.email}
                      />
                    </ListItem>
                  ) : null;
                })}
              </List>
            </AccordionDetails>
          </Accordion>

          <Accordion defaultExpanded>
            <AccordionSummary>
              <Typography>Selected Roles ({bulkDialog.selectedRoles.length})</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List dense>
                {bulkDialog.selectedRoles.map(roleId => {
                  const role = roles.find(r => r.id === roleId);
                  return role ? (
                    <ListItem key={roleId}>
                      <ListItemText
                        primary={role.displayName}
                        secondary={`${role.type} - ${role.level}`}
                      />
                    </ListItem>
                  ) : null;
                })}
              </List>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkDialog({ open: false, mode: 'assign', selectedUsers: [], selectedRoles: [] })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={bulkDialog.mode === 'remove' ? 'error' : 'primary'}
            onClick={bulkDialog.mode === 'assign' ? handleBulkAssign : handleBulkRemove}
            disabled={bulkDialog.selectedUsers.length === 0 || bulkDialog.selectedRoles.length === 0}
          >
            {bulkDialog.mode === 'assign' ? 'Assign' : 'Remove'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserRoleAssignment;