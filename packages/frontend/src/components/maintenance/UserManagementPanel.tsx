// packages/frontend/src/app/banking/maintenance/users/page.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/services/api';
import {
  Box,
  Typography,
  Container,
  Button,
  Alert,
  Snackbar,
  Breadcrumbs,
  Link,
  Fab,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  LockReset as LockResetIcon,
  Key as KeyIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { getErrorMessage } from '@/utils/error-message';
import { ResetPasswordDialog } from '@/components/users/ResetPasswordDialog';
import { usersAPI } from '@/services/api/users.api';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useAllRoles, useInvalidateRoleQueries } from '@/features/roles/hooks/useRoleQueries';
import { extractRolesArray } from '@/features/roles/hooks/useRoleQueries';
import {
  UserFormDialog,
  UserManagementFilters,
  UserManagementHeader,
  UserManagementTable,
  UserViewDialog,
  type User,
  type UserFormData,
  type UserRoleSummary,
} from './user-management';

interface UserManagementPanelProps {
  embedded?: boolean;
}

export default function UserManagementPanel({ embedded = false }: UserManagementPanelProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // ✅ React Query hooks for role data (cached)
  const allRolesQuery = useAllRoles();
  const { invalidateUserRoles } = useInvalidateRoleQueries();

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
  const [passwordResetDialog, setPasswordResetDialog] = useState<{
    open: boolean;
    user: User | null;
    newPassword: string;
    confirmPassword: string;
    showPassword: boolean;
    saving: boolean;
    error: string | null;
    success: boolean;
  }>({
    open: false,
    user: null,
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    saving: false,
    error: null,
    success: false,
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<UserRoleSummary[]>([]);
  const [loadingUserRoles, setLoadingUserRoles] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [manageRolesDialog, setManageRolesDialog] = useState<{
    open: boolean; user: User | null; roles: any[]; selectedRoleIds: string[]; saving: boolean; search: string; key: number;
  }>({ open: false, user: null, roles: [], selectedRoleIds: [], saving: false, search: '', key: 0 });
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    username: '',
    fullName: '',
    password: '',
    employeeId: '',
    department: '',
    position: '',
    sendWelcomeEmail: true
  });

  // ✅ UI States
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'warning' | 'info' });
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Using centralized API service

  // ✅ Open manage roles dialog
  const handleManageRoles = async (user: User) => {
    try {
      const rawRoles = allRolesQuery.data ?? [];
      let userRoleIds: string[] = [];
      try {
        const userRolesRes = await api.roles.getUserRoles(user.id);
        const userRoleRows = userRolesRes?.data?.roles || userRolesRes?.roles || userRolesRes?.data || [];
        userRoleIds = (Array.isArray(userRoleRows) ? userRoleRows : []).map((row: any) => {
          const r = row?.role || row;
          return String(r?.roleId || r?.role_id || r?.id || row?.roleId || row?.role_id || '');
        }).filter(Boolean);
      } catch {
        // User roles fetch is optional — dialog still shows all roles
      }
      setManageRolesDialog({
        open: true, user, roles: rawRoles,
        selectedRoleIds: userRoleIds, saving: false, search: '', key: Date.now(),
      });
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Failed to load roles: ' + (err?.message || err), severity: 'error' });
    }
  };

  const saveManageRoles = async () => {
    const d = manageRolesDialog;
    if (!d.user) return;
    setManageRolesDialog(prev => ({ ...prev, saving: true }));
    try {
      const userRolesRes = await api.roles.getUserRoles(d.user.id);
      const userRoleRows = userRolesRes?.data?.roles || userRolesRes?.roles || userRolesRes?.data || [];
      const currentIds: string[] = (Array.isArray(userRoleRows) ? userRoleRows : []).map((row: any) => {
        const r = row?.role || row;
        return String(r?.roleId || r?.role_id || r?.id || row?.roleId || row?.role_id || '');
      }).filter(Boolean);
      const toAdd = d.selectedRoleIds.filter((id: string) => !currentIds.includes(id));
      const toRemove = currentIds.filter((id: string) => !d.selectedRoleIds.includes(id));
      const results = await Promise.allSettled([
        ...toAdd.map((roleId: string) => api.roles.assignUser(roleId, d.user!.id)),
        ...toRemove.map((roleId: string) => api.roles.removeUser(roleId, d.user!.id)),
      ]);
      const anyFailure = results.some(r => r.status === 'rejected');
      const anyApproval = results.some(r => r.status === 'fulfilled' && (r.value as any)?.approvalRequired);
      if (anyFailure && !anyApproval) {
        setManageRolesDialog(prev => ({ ...prev, saving: false }));
        setSnackbar({ open: true, message: 'Failed to update some roles', severity: 'error' });
      } else {
        setManageRolesDialog(prev => ({ ...prev, saving: false, open: false }));
        invalidateUserRoles(d.user.id);
        setSnackbar({
          open: true,
          message: anyApproval ? 'Role changes submitted for approval.' : 'Roles updated successfully',
          severity: anyApproval ? 'info' : 'success',
        });
      }
    } catch {
      setManageRolesDialog(prev => ({ ...prev, saving: false }));
      setSnackbar({ open: true, message: 'Failed to update roles', severity: 'error' });
    }
  };

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
        includeInactive: true,
        ...(searchTerm && { search: searchTerm }),
        ...(filterDepartment && { department: filterDepartment }),
        ...(filterBankingAccess && { bankingAccess: filterBankingAccess as 'CONVENTIONAL' | 'BOTH' }),
        ...(filterActive !== null && { isActive: filterActive })
      };

      const response = await api.users.getAll(params);
      const responsePayload =
        response && typeof response === 'object' && !Array.isArray(response)
          ? response
          : {};

      if (responsePayload.success === false) {
        throw new Error(responsePayload.message || 'Failed to load users');
      }

      const userRows = responsePayload?.data?.users || responsePayload?.users || responsePayload?.data || [];
      const normalizedUsers = Array.isArray(userRows) ? userRows : [];
      const total = typeof responsePayload?.pagination?.total === 'number'
        ? responsePayload.pagination.total
        : normalizedUsers.length;

      console.log('✅ Users loaded successfully:', {
        count: normalizedUsers.length,
        total
      });

      setUsers(normalizedUsers);
      setTotalUsers(total);
    } catch (error: any) {
      console.error('Error loading users:', error);
      setSnackbar({ open: true, message: getErrorMessage(error, 'Failed to load users'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, searchTerm, filterDepartment, filterBankingAccess, filterActive]);

  // ✅ Create User - Using centralized API service
  const createUser = async () => {
    try {
      console.log('➕ Creating user using centralized API service:', formData.email);

      const response = await api.users.create(formData);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create user');
      }

      const successMessage = response?.approvalRequired && response?.requestId
        ? `${response.message} (Request: ${response.requestId})`
        : (response?.message || 'User created successfully');

      console.log('✅ User create request handled successfully:', response);
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
      setOpenCreateDialog(false);
      resetForm();
      await loadUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      const message = getErrorMessage(error, 'Failed to create user');
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  // ✅ Update User - Using centralized API service
  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const updateData = { ...formData };
      delete updateData.password; // Don't update password in edit

      console.log('✏️ Updating user using centralized API service:', selectedUser.id, updateData);

      const response = await api.users.update(selectedUser.id, updateData);
      if (response?.success) {
        const successMessage = response?.approvalRequired && response?.requestId
          ? `${response.message} (Request: ${response.requestId})`
          : (response?.message || 'User updated successfully');
        console.log('✅ User updated successfully:', response);
        setSnackbar({ open: true, message: successMessage, severity: 'success' });
        setOpenEditDialog(false);
        setSelectedUser(null);
        resetForm();
        await loadUsers();
      } else {
        throw new Error(response?.message || 'Failed to update user');
      }
    } catch (error: any) {
      console.error('Error updating user:', error);
      setSnackbar({ open: true, message: getErrorMessage(error, 'Failed to update user'), severity: 'error' });
    }
  };

  // ✅ Toggle User Status - Using centralized API service
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const action = currentStatus ? 'disable' : 'enable';
      console.log(`🔄 ${action}ing user using centralized API service:`, userId);

      const response = currentStatus
        ? await api.users.disable(userId)
        : await api.users.enable(userId);
      if (response?.success) {
        const successMessage = response?.approvalRequired && response?.requestId
          ? `${response.message} (Request: ${response.requestId})`
          : (response?.message || `User ${action}d successfully`);
        console.log(`✅ User ${action}d successfully:`, response);
        setSnackbar({
          open: true,
          message: successMessage,
          severity: 'success'
        });
        await loadUsers();
      } else {
        throw new Error(response?.message || `Failed to ${action} user`);
      }
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      setSnackbar({ open: true, message: getErrorMessage(error, 'Failed to update user status'), severity: 'error' });
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
      sendWelcomeEmail: true
    });
  };

  // ✅ Handle Edit
  const loadUserRoles = useCallback(async (userId: string) => {
    setLoadingUserRoles(true);
    try {
      const response = await api.roles.getUserRoles(userId);
      const rows = response?.data?.roles || response?.roles || response?.data || [];
      const roleRows = Array.isArray(rows) ? rows : [];
      const normalizedRoles = roleRows.map((row: any) => {
        const embeddedRole = row?.role || {};
        return {
          id: String(row?.id || `${userId}-${row?.roleId || row?.role_id || embeddedRole?.id || ''}`),
          roleId: String(row?.roleId || row?.role_id || embeddedRole?.id || ''),
          roleName: String(embeddedRole?.displayName || embeddedRole?.roleName || embeddedRole?.name || row?.roleName || row?.role_name || 'Unknown Role'),
          assignedAt: row?.assignedAt || row?.assigned_at,
          isActive: Boolean(row?.isActive ?? row?.is_active ?? true)
        } as UserRoleSummary;
      }).filter((role: UserRoleSummary) => role.roleId);

      setSelectedUserRoles(normalizedRoles);
    } catch (error) {
      console.error('Error loading user roles:', error);
      setSelectedUserRoles([]);
    } finally {
      setLoadingUserRoles(false);
    }
  }, []);

  const handleEdit = async (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      employeeId: user.employeeId || '',
      department: user.department || '',
      position: user.position || '',
    });
    await loadUserRoles(user.id);
    setOpenEditDialog(true);
  };

  // ✅ Handle View
  const handleView = async (user: User) => {
    setSelectedUser(user);
    await loadUserRoles(user.id);
    setOpenViewDialog(true);
  };

  // ✅ Handle Reset Password
  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setOpenResetPasswordDialog(true);
    setPasswordResetDialog({
      open: true,
      user,
      newPassword: '',
      confirmPassword: '',
      showPassword: false,
      saving: false,
      error: null,
      success: false,
    });
  };

  const handleSaveResetPassword = async () => {
    const dialog = passwordResetDialog;
    if (!dialog.user) return;
    if (dialog.newPassword.length < 6) {
      setPasswordResetDialog(prev => ({ ...prev, error: 'Password must be at least 6 characters' }));
      return;
    }
    if (dialog.newPassword !== dialog.confirmPassword) {
      setPasswordResetDialog(prev => ({ ...prev, error: 'Passwords do not match' }));
      return;
    }
    setPasswordResetDialog(prev => ({ ...prev, saving: true, error: null }));
    try {
      await usersAPI.resetPassword(dialog.user.id, { newPassword: dialog.newPassword });
      setPasswordResetDialog(prev => ({ ...prev, saving: false, success: true }));
    } catch (err: any) {
      setPasswordResetDialog(prev => ({
        ...prev, saving: false,
        error: err?.message || err?.response?.data?.message || 'Failed to reset password',
      }));
    }
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
  const departments = [...new Set(users.map((user) => user.department).filter((value): value is string => Boolean(value)))];

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

      <UserManagementHeader
        totalUsers={totalUsers}
        activeUsers={users.filter((u) => u.isActive).length}
        onAddUser={() => setOpenCreateDialog(true)}
      />

      <UserManagementFilters
        searchTerm={searchTerm}
        filterDepartment={filterDepartment}
        filterBankingAccess={filterBankingAccess}
        filterActive={filterActive}
        departments={departments}
        loading={loading}
        onSearchChange={setSearchTerm}
        onDepartmentChange={setFilterDepartment}
        onBankingAccessChange={setFilterBankingAccess}
        onActiveChange={setFilterActive}
        onRefresh={loadUsers}
        onExport={() => setSnackbar({ open: true, message: 'Export feature coming soon', severity: 'info' })}
      />

      <UserManagementTable
        users={users}
        loading={loading}
        totalUsers={totalUsers}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={(nextRowsPerPage) => {
          setRowsPerPage(nextRowsPerPage);
          setPage(0);
        }}
        onView={handleView}
        onEdit={handleEdit}
        onResetPassword={handleResetPassword}
        onToggleStatus={toggleUserStatus}
        onManageRoles={handleManageRoles}
      />

      <UserFormDialog
        open={openCreateDialog}
        mode="create"
        formData={formData}
        showPassword={showPassword}
        onClose={() => setOpenCreateDialog(false)}
        onChange={setFormData}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onSubmit={createUser}
      />

      <UserFormDialog
        open={openEditDialog}
        mode="edit"
        formData={formData}
        showPassword={showPassword}
        onClose={() => setOpenEditDialog(false)}
        onChange={setFormData}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onSubmit={updateUser}
      />

      <UserViewDialog
        open={openViewDialog}
        selectedUser={selectedUser}
        selectedUserRoles={selectedUserRoles}
        loadingUserRoles={loadingUserRoles}
        onClose={() => {
          setOpenViewDialog(false);
          setSelectedUserRoles([]);
        }}
        onEdit={handleEdit}
      />

      <ResetPasswordDialog
        open={openResetPasswordDialog}
        onClose={() => setOpenResetPasswordDialog(false)}
        userId={selectedUser?.id || null}
        userName={selectedUser?.fullName || null}
        onSuccess={() => {
            setOpenResetPasswordDialog(false);
            setSelectedUser(null);
        }}
      />

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

      {/* Reset Password Dialog */}
      <Dialog
        open={passwordResetDialog.open}
        onClose={() => passwordResetDialog.success || setPasswordResetDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyIcon />
            <span>Reset Password — {passwordResetDialog.user?.fullName || passwordResetDialog.user?.email}</span>
          </Box>
        </DialogTitle>
        <DialogContent>
          {passwordResetDialog.success ? (
            <Alert severity="success" sx={{ mt: 2 }}>
              Password reset successfully for {passwordResetDialog.user?.fullName || passwordResetDialog.user?.email}
            </Alert>
          ) : (
            <>
              {passwordResetDialog.error && (
                <Alert severity="error" sx={{ mb: 2 }}>{passwordResetDialog.error}</Alert>
              )}
              <TextField
                fullWidth
                label="New Password"
                type={passwordResetDialog.showPassword ? 'text' : 'password'}
                value={passwordResetDialog.newPassword}
                onChange={(e) => setPasswordResetDialog(prev => ({ ...prev, newPassword: e.target.value, error: null }))}
                sx={{ mb: 2, mt: 1 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setPasswordResetDialog(prev => ({ ...prev, showPassword: !prev.showPassword }))} edge="end">
                        {passwordResetDialog.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                type={passwordResetDialog.showPassword ? 'text' : 'password'}
                value={passwordResetDialog.confirmPassword}
                onChange={(e) => setPasswordResetDialog(prev => ({ ...prev, confirmPassword: e.target.value, error: null }))}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordResetDialog(prev => ({ ...prev, open: false }))} disabled={passwordResetDialog.saving}>
            {passwordResetDialog.success ? 'Close' : 'Cancel'}
          </Button>
          {!passwordResetDialog.success && (
            <Button
              variant="contained"
              onClick={handleSaveResetPassword}
              disabled={passwordResetDialog.saving || !passwordResetDialog.newPassword || !passwordResetDialog.confirmPassword}
              startIcon={passwordResetDialog.saving ? undefined : <LockResetIcon />}
            >
              {passwordResetDialog.saving ? 'Resetting...' : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

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

      {/* Manage Roles Dialog */}
      <Dialog key={manageRolesDialog.key} open={manageRolesDialog.open} onClose={() => setManageRolesDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box>
              <Typography variant="h6">Manage Roles</Typography>
              <Typography variant="body2" color="text.secondary">
                {manageRolesDialog.user?.fullName} ({manageRolesDialog.user?.email})
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
            Role changes require approval. Assigned roles will only take effect after an approver reviews this request.
          </Alert>
          <TextField
            fullWidth size="small" placeholder="Search roles..."
            value={manageRolesDialog.search}
            onChange={(e) => setManageRolesDialog(prev => ({ ...prev, search: e.target.value }))}
            sx={{ mb: 2, mt: 1 }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
          />
          <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
            {manageRolesDialog.roles
              .filter((r: any) => r.isActive !== false && (!manageRolesDialog.search || (r.roleName || r.roleCode || '').toLowerCase().includes(manageRolesDialog.search.toLowerCase())))
              .map((role: any) => {
                const roleId = role.id;
                const label = role.roleName || role.roleCode || 'Unnamed Role';
                return (
                  <ListItem key={roleId} disablePadding>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <Checkbox
                        size="small"
                        checked={manageRolesDialog.selectedRoleIds.includes(roleId)}
                        onChange={(_, checked) => setManageRolesDialog(prev => ({
                          ...prev,
                          selectedRoleIds: checked
                            ? [...prev.selectedRoleIds, roleId]
                            : prev.selectedRoleIds.filter((id: string) => id !== roleId),
                        }))}
                      />
                    </ListItemIcon>
                    <ListItemText primary={label} secondary={role.roleCode || (role.isSystemRole ? 'SYSTEM' : 'CUSTOM')} />
                  </ListItem>
                );
              })}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setManageRolesDialog(prev => ({ ...prev, open: false }))}>Cancel</Button>
          <Button variant="contained" onClick={saveManageRoles} disabled={manageRolesDialog.saving}>
            {manageRolesDialog.saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
