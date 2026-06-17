// packages/frontend/src/components/maintenance/AccessManagementPage.tsx
'use client';

import React, { Suspense, useState, useCallback, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GroupIcon from '@mui/icons-material/Group';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import UserManagementPanel from '@/components/maintenance/UserManagementPanel';
import { usePermission } from '@/hooks/usePermission';
import {
  buildPermissionMatrixItem,
  getPermissionCategoryDisplayLabel,
  getPermissionGroupDisplayLabel,
  buildPermissionSelectionGroups,
  buildPermissionSelectionSections,
  getPermissionCanonicalKey,
} from '@/components/maintenance/access-management.utils';
import {
  useAccessManagementDataQuery,
  useCreateAccessRoleMutation,
  useUpdateAccessRoleMutation,
  useToggleAccessRoleMutation,
  useDeleteAccessRoleMutation,
  useUpdateAccessRolePermissionsMutation,
} from '@/features/access-management/hooks/useAccessManagementQueries';
import { createAccessRole, updateAccessRole, toggleAccessRole, updateAccessRolePermissions } from '@/features/access-management/api/access-management.api';
import {
  canUserApprove,
  getUserMaxHierarchyLevel,
  checkApprovalEligibility,
  getApprovalStatusMessage,
  getHierarchyLevelName,
  getApprovalBadgeColor,
  type UserRoleInfo,
} from '@/utils/approval';

import {
  Role,
  Permission,
  PermissionCategory,
  PermissionMatrixCategory,
  PermissionGroupingMode,
  PermissionSelectionGroup,
  RoleFilters,
  TabPanelProps,
  TAB_KEY_TO_INDEX,
  TAB_INDEX_TO_KEY,
  ACCESS_MANAGEMENT_BASE_PATH,
} from './access-management.types';

import { AccessFilters } from './AccessFilters';
import { AccessRoleTable } from './AccessRoleTable';
import { AccessRoleDialog } from './AccessRoleDialog';
import { AccessPermissionDialog } from './AccessPermissionDialog';
import { AccessReviewTab } from './AccessReviewTab';
import { AccessStatCards } from './AccessStatCards';
import { SecuritySettingsTab } from './SecuritySettingsTab';

const TabPanel = ({ children, value, index, ...other }: TabPanelProps) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`role-management-tabpanel-${index}`}
    aria-labelledby={`role-management-tab-${index}`}
    {...other}
  >
    {value === index && <Box sx={{ p: 3 }}>{children as any}</Box>}
  </div>
);

const normalizeTabKey = (value?: string | null): keyof typeof TAB_KEY_TO_INDEX => {
  const key = (value || '').toLowerCase();
  if (key in TAB_KEY_TO_INDEX) return key as keyof typeof TAB_KEY_TO_INDEX;
  return 'roles';
};

const getTabKeyFromPath = (pathname: string): keyof typeof TAB_KEY_TO_INDEX => {
  if (!pathname.startsWith(ACCESS_MANAGEMENT_BASE_PATH)) return 'roles';

  const suffix = pathname.slice(ACCESS_MANAGEMENT_BASE_PATH.length).replace(/^\/+/, '');
  if (!suffix) return 'roles';

  const [segment] = suffix.split('/');
  return normalizeTabKey(segment);
};

function AccessManagementPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasAnyPermission } = usePermission();
  const canManageRoles = hasAnyPermission(['admin.roles.manage', 'admin.roles.create']);
  const canViewRoles = hasAnyPermission(['admin.roles.view', 'admin.roles.manage']);

  const [currentTab, setCurrentTab] = useState(0);
  const [permissionGroupingMode, setPermissionGroupingMode] = useState<PermissionGroupingMode>('resource');
  const [permissionSearch, setPermissionSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [filters, setFilters] = useState<RoleFilters>({});

  // Current user's roles for approval eligibility checking
  const [currentUserRoles, setCurrentUserRoles] = useState<UserRoleInfo[]>([]);
  const [userMaxHierarchyLevel, setUserMaxHierarchyLevel] = useState<number>(1);

  // Bulk assignment states
  const [bulkAssignmentRole, setBulkAssignmentRole] = useState<string | null>(null);
  const [selectedBulkPermissions, setSelectedBulkPermissions] = useState<string[]>([]);
  const [selectAllPermissions, setSelectAllPermissions] = useState(false);

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

  const accessManagementQuery = useAccessManagementDataQuery(filters);
  const loading = busy || accessManagementQuery.isLoading || accessManagementQuery.isFetching;
  const roles = (accessManagementQuery.data?.roles ?? []) as Role[];
  const permissions = (accessManagementQuery.data?.permissions ?? []) as Permission[];

  const permissionCategories = useMemo<PermissionCategory[]>(() => {
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
  }, [permissions]);

  const permissionSelectionGroups = useMemo<PermissionSelectionGroup[]>(() => {
    return buildPermissionSelectionGroups(permissions, permissionGroupingMode);
  }, [permissions, permissionGroupingMode]);

  const getPermissionSections = useCallback((groupPermissions: Permission[]) => {
    return buildPermissionSelectionSections(groupPermissions);
  }, []);

  useEffect(() => {
    if (accessManagementQuery.error) {
      setError('Failed to fetch roles from database. Please check your connection and try again.');
    }
  }, [accessManagementQuery.error]);

  useEffect(() => {
    const requestedTab = searchParams.get('tab');
    const pathTabKey = getTabKeyFromPath(pathname);
    const resolvedTabKey = pathTabKey !== 'roles' || pathname.startsWith(ACCESS_MANAGEMENT_BASE_PATH)
      ? pathTabKey
      : normalizeTabKey(requestedTab);
    const resolvedTab = TAB_KEY_TO_INDEX[resolvedTabKey];
    if (typeof resolvedTab === 'number' && resolvedTab !== currentTab) {
      setCurrentTab(resolvedTab);
    }
  }, [searchParams, currentTab, pathname]);

  // Fetch current user's roles for approval eligibility
  const fetchCurrentUserRoles = useCallback(async () => {
    try {
      const mockUserRoles: UserRoleInfo[] = [
        { hierarchyLevel: 2, roleCode: 'SUPERVISOR', roleName: 'Supervisor' },
      ];
      setCurrentUserRoles(mockUserRoles);
      setUserMaxHierarchyLevel(getUserMaxHierarchyLevel(mockUserRoles));
    } catch (err) {
      console.error('Failed to fetch current user roles:', err);
      setUserMaxHierarchyLevel(1);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUserRoles();
  }, [fetchCurrentUserRoles]);

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    void event;
    setCurrentTab(newValue);
    const nextTabKey = TAB_INDEX_TO_KEY[newValue] ?? 'roles';
    const nextQuery = new URLSearchParams(searchParams.toString());
    nextQuery.delete('tab');

    const nextPath = nextTabKey === 'roles'
      ? `${ACCESS_MANAGEMENT_BASE_PATH}/roles`
      : `${ACCESS_MANAGEMENT_BASE_PATH}/${nextTabKey}`;
    const nextQueryString = nextQuery.toString();
    router.replace(nextQueryString ? `${nextPath}?${nextQueryString}` : nextPath, { scroll: false });
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
    accessManagementQuery.refetch();
  };

  const handleCreateRole = () => {
    if (!canManageRoles) return;
    setRoleDialog({ open: true, mode: 'create', role: null });
  };

  const handleEditRole = (role: Role) => {
    if (!canManageRoles) return;
    setRoleDialog({ open: true, mode: 'edit', role });
  };

  const handleViewRole = (role: Role) => {
    const mode = searchParams.get('mode');
    const nextQuery = new URLSearchParams();
    if (mode) nextQuery.set('mode', mode);
    const queryString = nextQuery.toString();
    router.push(`/banking/maintenance/access-management/roles/${role.id}${queryString ? `?${queryString}` : ''}`);
  };

  const handleManagePermissions = (role: Role) => {
    if (!canManageRoles) return;
    handleViewRole(role);
  };

  const setApprovalNoticeFromResponse = (response: any, fallbackMessage: string) => {
    const approvalRequired = Boolean(response?.approvalRequired);
    const requestId = response?.requestId;
    if (approvalRequired) {
      const message = response?.message || fallbackMessage;
      setNotice(`${message}${requestId ? ` (Request: ${requestId})` : ''}`);
      return true;
    }
    return false;
  };

  const handleSaveRole = async (roleForm: { name: string; displayName: string; description: string; type: string; level: string; isActive: boolean; selectedPermissions: string[] }) => {
    if (!canManageRoles) return;
    try {
      const roleData = {
        name: roleForm.name,
        displayName: roleForm.displayName,
        description: roleForm.description,
        type: roleForm.type,
        level: roleForm.level,
        isActive: roleForm.isActive,
        permissions: roleForm.selectedPermissions,
      };

      if (roleDialog.mode === 'create') {
        const response = await createAccessRole(roleData);
        setApprovalNoticeFromResponse(response, 'Role creation submitted for approval');
      } else if (roleDialog.role) {
        const response = await updateAccessRole(roleDialog.role.id, roleData);
        setApprovalNoticeFromResponse(response, 'Role update submitted for approval');
      }

      setRoleDialog({ open: false, mode: 'create', role: null });
      await accessManagementQuery.refetch();
    } catch (error) {
      console.error('❌ Error saving role to database:', error);
    }
  };

  const handleToggleRole = async (roleId: string, isActive: boolean) => {
    if (!canManageRoles) return;
    try {
      const response = await toggleAccessRole(roleId);
      setApprovalNoticeFromResponse(response, `Role ${isActive ? 'disable' : 'enable'} submitted for approval`);
      await accessManagementQuery.refetch();
    } catch (error) {
      console.error('❌ Error toggling role status in database:', error);
    }
  };

  const handlePermissionDialogSave = async () => {
    try {
      if (permissionDialog.role) {
        await updateAccessRolePermissions(permissionDialog.role.id, permissionDialog.selectedPermissions);
        await accessManagementQuery.refetch();
      }
      setPermissionDialog({ open: false, role: null, selectedPermissions: [] });
    } catch (error) {
      console.error('❌ Error updating role permissions:', error);
    }
  };

  if (!canViewRoles) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to view role management.
        </Alert>
      </Box>
    );
  }

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

      {notice && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* Statistics */}
      <AccessStatCards roles={roles} />

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
            label="Users"
            icon={<PeopleIcon />}
            iconPosition="start"
          />
          <Tab
            label="Access Review"
            icon={<SecurityIcon />}
            iconPosition="start"
          />
          <Tab
            label="Security"
            icon={<SecurityIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Roles Tab */}
      <TabPanel value={currentTab} index={0}>
        <AccessFilters
          filters={filters}
          loading={loading}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onRefresh={handleRefresh}
          onCreateRole={handleCreateRole}
        />
        <AccessRoleTable
          roles={roles}
          loading={loading}
          canViewRoles={canViewRoles}
          canManageRoles={canManageRoles}
          onViewRole={handleViewRole}
          onEditRole={handleEditRole}
          onManagePermissions={handleManagePermissions}
          onToggleRole={handleToggleRole}
        />
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={currentTab} index={1}>
        <UserManagementPanel embedded />
      </TabPanel>

      {/* Access Review Tab */}
      <TabPanel value={currentTab} index={2}>
        <AccessReviewTab roles={roles} permissions={permissions} />
      </TabPanel>

      {/* Security Tab */}
      <TabPanel value={currentTab} index={3}>
        <SecuritySettingsTab />
      </TabPanel>

      {/* Role Dialog */}
      <AccessRoleDialog
        open={roleDialog.open}
        mode={roleDialog.mode}
        role={roleDialog.role}
        permissionSelectionGroups={permissionSelectionGroups}
        onClose={() => setRoleDialog(prev => ({ ...prev, open: false }))}
        onSave={handleSaveRole}
      />

      {/* Permission Management Dialog */}
      <AccessPermissionDialog
        permissionDialog={permissionDialog}
        permissionSearch={permissionSearch}
        permissionGroupingMode={permissionGroupingMode}
        permissionSelectionGroups={permissionSelectionGroups}
        permissions={permissions}
        onClose={() => setPermissionDialog({ open: false, role: null, selectedPermissions: [] })}
        onSave={handlePermissionDialogSave}
        onPermissionSearchChange={setPermissionSearch}
        onPermissionGroupingModeChange={setPermissionGroupingMode}
        onPermissionDialogChange={(dialog) => setPermissionDialog(dialog)}
        getPermissionSections={getPermissionSections}
      />
    </Box>
  );
}

export default function AccessManagementPageWrapper() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>}>
      <AccessManagementPage />
    </Suspense>
  );
}
