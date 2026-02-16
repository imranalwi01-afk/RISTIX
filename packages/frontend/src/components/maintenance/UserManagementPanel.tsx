// packages/frontend/src/app/banking/maintenance/users/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import {
  Box,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Chip,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  CircularProgress,
  Breadcrumbs,
  Link,
  InputAdornment,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Download as ExportIcon,
  PersonAdd as PersonAddIcon,
  Security as SecurityIcon,
  AccountBalance as BankingIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

// ✅ User Interface
interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  employeeId?: string;
  department?: string;
  position?: string;
  bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  syariahCertified: boolean;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// ✅ Form Data Interface
interface UserFormData {
  email: string;
  username: string;
  fullName: string;
  password?: string;
  employeeId: string;
  department: string;
  position: string;
  bankingAccess: 'CONVENTIONAL' | 'SYARIAH' | 'BOTH';
  syariahCertified: boolean;
}

interface UserManagementPanelProps {
  embedded?: boolean;
}

export default function UserManagementPanel({ embedded = false }: UserManagementPanelProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // ✅ State Management
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterBankingAccess, setFilterBankingAccess] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);

  // ✅ Dialog States
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    username: '',
    fullName: '',
    password: '',
    employeeId: '',
    department: '',
    position: '',
    bankingAccess: 'CONVENTIONAL',
    syariahCertified: false
  });

  // ✅ UI States
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Using centralized API service

  // ✅ Load Users - Using centralized API service
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('👥 Loading users using centralized API service', {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        department: filterDepartment,
        bankingAccess: filterBankingAccess,
        isActive: filterActive
      });

      const params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchTerm && { search: searchTerm }),
        ...(filterDepartment && { department: filterDepartment }),
        ...(filterBankingAccess && { bankingAccess: filterBankingAccess }),
        ...(filterActive !== null && { isActive: filterActive })
      };

      // Use centralized users API - Note: backend route is /user (singular)
      const response = await api.client.get('/user', { params });

      if (response.data.success) {
        console.log('✅ Users loaded successfully:', {
          count: response.data.data?.users?.length || 0,
          total: response.data.pagination?.total || 0
        });
        setUsers(response.data.data?.users || []);
        setTotalUsers(response.data.pagination?.total || 0);
      } else {
        throw new Error(response.data.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to load users', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filterDepartment, filterBankingAccess, filterActive]);

  // ✅ Create User - Using centralized API service
  const createUser = async () => {
    try {
      console.log('➕ Creating user using centralized API service:', formData.email);

      const response = await api.client.post('/user', formData);

      if (response.data.success) {
        console.log('✅ User created successfully:', response.data.data);
        setSnackbar({ open: true, message: 'User created successfully', severity: 'success' });
        setOpenCreateDialog(false);
        resetForm();
        loadUsers();
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to create user', severity: 'error' });
    }
  };

  // ✅ Update User - Using centralized API service
  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData = { ...formData };
      delete updateData.password; // Don't update password in edit

      console.log('✏️ Updating user using centralized API service:', selectedUser.id, updateData);

      const response = await api.client.put(`/user/${selectedUser.id}`, updateData);

      if (response.data.success) {
        console.log('✅ User updated successfully:', response.data.data);
        setSnackbar({ open: true, message: 'User updated successfully', severity: 'success' });
        setOpenEditDialog(false);
        setSelectedUser(null);
        resetForm();
        loadUsers();
      } else {
        throw new Error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to update user', severity: 'error' });
    }
  };

  // ✅ Toggle User Status - Using centralized API service
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'disable' : 'enable';
      console.log(`🔄 ${action}ing user using centralized API service:`, userId);

      const response = await api.client.post(`/user/${userId}/${action}`);

      if (response.data.success) {
        console.log(`✅ User ${action}d successfully:`, response.data.data);
        setSnackbar({
          open: true,
          message: `User ${action}d successfully`,
          severity: 'success'
        });
        loadUsers();
      } else {
        throw new Error(response.data.message || `Failed to ${action} user`);
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      setSnackbar({ open: true, message: error.message || 'Failed to update user status', severity: 'error' });
    }
  };

  // ✅ Reset Form
  const resetForm = () => {
    setFormData({
      email: '',
      username: '',
      fullName: '',
      password: '',
      employeeId: '',
      department: '',
      position: '',
      bankingAccess: 'CONVENTIONAL',
      syariahCertified: false
    });
  };

  // ✅ Handle Edit
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      employeeId: user.employeeId || '',
      department: user.department || '',
      position: user.position || '',
      bankingAccess: user.bankingAccess,
      syariahCertified: user.syariahCertified
    });
    setOpenEditDialog(true);
  };

  // ✅ Handle View
  const handleView = (user: User) => {
    setSelectedUser(user);
    setOpenViewDialog(true);
  };

  // ✅ Load users on mount and filter changes
  useEffect(() => {
    if (isAuthenticated) {
      loadUsers();
    }
  }, [isAuthenticated, loadUsers]);

  // ✅ Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // ✅ Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ✅ Get departments for filter
  const departments = [...new Set(users.map(user => user.department).filter(Boolean))];

  if (!isAuthenticated) {
    if (embedded) {
      return (
        <Alert severity="warning">
          Please log in to access user management.
        </Alert>
      );
    }

    return (
      <Container maxWidth="xl">
        <Alert severity="warning">
          Please log in to access user management.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {!embedded && (
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/banking/dashboard"
            onClick={(e) => {
              e.preventDefault();
              router.push('/banking/dashboard');
            }}
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: 16 }} />
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 0.5, fontSize: 16 }} />
            User Management
          </Typography>
        </Breadcrumbs>
      )}

      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PeopleIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                User Management
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage platform and banking users
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            size="large"
          >
            Add User
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h4">
                  {totalUsers}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h4">
                  {users.filter(u => u.isActive).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Syariah Users
                </Typography>
                <Typography variant="h4">
                  {users.filter(u => u.bankingAccess === 'SYARIAH' || u.bankingAccess === 'BOTH').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  MFA Enabled
                </Typography>
                <Typography variant="h4">
                  {users.filter(u => u.mfaEnabled).length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                label="Department"
              >
                <MenuItem value="">All</MenuItem>
                {departments.map(dept => (
                  <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Banking Access</InputLabel>
              <Select
                value={filterBankingAccess}
                onChange={(e) => setFilterBankingAccess(e.target.value)}
                label="Banking Access"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CONVENTIONAL">Conventional</MenuItem>
                <MenuItem value="SYARIAH">Syariah</MenuItem>
                <MenuItem value="BOTH">Both</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterActive === null ? '' : filterActive.toString()}
                onChange={(e) => setFilterActive(e.target.value === '' ? null : e.target.value === 'true')}
                label="Status"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Active</MenuItem>
                <MenuItem value="false">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadUsers}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => setSnackbar({ open: true, message: 'Export feature coming soon', severity: 'info' })}
              >
                Export
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Banking Access</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>No users found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2">{user.fullName}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {user.position}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{user.department || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.bankingAccess}
                        color={user.bankingAccess === 'SYARIAH' ? 'success' : 'primary'}
                        size="small"
                        icon={user.syariahCertified ? <SecurityIcon /> : <BankingIcon />}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={user.isActive ? <ActiveIcon /> : <InactiveIcon />}
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => handleView(user)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.isActive ? 'Disable User' : 'Enable User'}>
                          <IconButton
                            size="small"
                            onClick={() => toggleUserStatus(user.id, user.isActive)}
                            color={user.isActive ? 'error' : 'success'}
                          >
                            {user.isActive ? <InactiveIcon /> : <ActiveIcon />}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalUsers}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Create User Dialog */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PersonAddIcon />
            Create New User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <HideIcon /> : <ViewIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Banking Access</InputLabel>
                <Select
                  value={formData.bankingAccess}
                  onChange={(e) => setFormData({ ...formData, bankingAccess: e.target.value as UserFormData['bankingAccess'] })}
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
                    checked={formData.syariahCertified}
                    onChange={(e) => setFormData({ ...formData, syariahCertified: e.target.checked })}
                  />
                }
                label="Syariah Certified"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={createUser}>
            Create User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EditIcon />
            Edit User
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Position"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Banking Access</InputLabel>
                <Select
                  value={formData.bankingAccess}
                  onChange={(e) => setFormData({ ...formData, bankingAccess: e.target.value as UserFormData['bankingAccess'] })}
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
                    checked={formData.syariahCertified}
                    onChange={(e) => setFormData({ ...formData, syariahCertified: e.target.checked })}
                  />
                }
                label="Syariah Certified"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={updateUser}>
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ViewIcon />
            User Details
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Full Name</Typography>
                  <Typography>{selectedUser.fullName}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography>{selectedUser.email}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Username</Typography>
                  <Typography>{selectedUser.username}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Employee ID</Typography>
                  <Typography>{selectedUser.employeeId || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                  <Typography>{selectedUser.department || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Position</Typography>
                  <Typography>{selectedUser.position || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Banking Access</Typography>
                  <Chip label={selectedUser.bankingAccess} size="small" />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    label={selectedUser.isActive ? 'Active' : 'Inactive'}
                    color={selectedUser.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Syariah Certified</Typography>
                  <Chip
                    label={selectedUser.syariahCertified ? 'Yes' : 'No'}
                    color={selectedUser.syariahCertified ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">MFA Enabled</Typography>
                  <Chip
                    label={selectedUser.mfaEnabled ? 'Yes' : 'No'}
                    color={selectedUser.mfaEnabled ? 'success' : 'default'}
                    size="small"
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Last Login</Typography>
                  <Typography>
                    {selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Created</Typography>
                  <Typography>{new Date(selectedUser.createdAt).toLocaleString()}</Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenViewDialog(false)}>Close</Button>
          {selectedUser && (
            <Button variant="outlined" onClick={() => handleEdit(selectedUser)}>
              Edit User
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {!embedded && (
        <Fab
          color="primary"
          aria-label="add user"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setOpenCreateDialog(true)}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
}
