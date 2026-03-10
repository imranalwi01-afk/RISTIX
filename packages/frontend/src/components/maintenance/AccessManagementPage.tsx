// packages/frontend/src/components/maintenance/AccessManagementPage.tsx
'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
  TableCell,
  TableContainer,
  Stack,
  Divider
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
  Clear as ClearIcon,
  Save as SaveIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

// Local components and services
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';
import { api } from '@/services/api';
import { RolePermissionsEditor } from '@/components/rbac/RolePermissionsEditor';
import { Can } from '@/components/rbac/Can';
import { usePermission } from '@/hooks/usePermission';
import UserManagementPanel from '@/components/maintenance/UserManagementPanel';
import UserRoleAssignment from '@/components/roles/UserRoleAssignment';
import {
  buildPermissionMatrixItem,
  buildPermissionSelectionGroups,
  getPermissionCanonicalKey,
  normalizePermissionFromApi,
  normalizeRoleFromApi,
  toDisplayLabel,
} from '@/components/maintenance/access-management.utils';
import {
  canUserApprove,
  getUserMaxHierarchyLevel,
  checkApprovalEligibility,
  getApprovalStatusMessage,
  getHierarchyLevelName,
  getApprovalBadgeColor,
  type UserRoleInfo,
} from '@/utils/approval';

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
  code?: string;
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
  bankingSpecific?: boolean;
  syariahRequired?: boolean;
}

interface PermissionCategory {
  name: string;
  displayName: string;
  permissions: Permission[];
}

interface PermissionMatrixItem {
  permission: Permission;
  fullKey: string;
  categoryKey: string;
  groupKey: string;
  actionKey: string;
}

interface PermissionMatrixGroup {
  key: string;
  label: string;
  permissions: PermissionMatrixItem[];
}

interface PermissionMatrixCategory {
  key: string;
  label: string;
  groups: PermissionMatrixGroup[];
}

type PermissionGroupingMode = 'resource' | 'module' | 'category';

interface PermissionSelectionGroup {
  key: string;
  label: string;
  hint: string;
  permissions: Permission[];
}

const TAB_KEY_TO_INDEX: Record<string, number> = {
  roles: 0,
  users: 1,
  permissions: 2,
  matrix: 3,
  assignments: 4,
};

const TAB_INDEX_TO_KEY = ['roles', 'users', 'permissions', 'matrix', 'assignments'] as const;
const ACCESS_MANAGEMENT_BASE_PATH = '/banking/maintenance/access-management';

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

const extractCollection = <T,>(payload: unknown, keys: string[] = []): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }

  if (Array.isArray(record.data)) return record.data as T[];

  const nestedData = record.data;
  if (nestedData && typeof nestedData === 'object') {
    const nestedRecord = nestedData as Record<string, unknown>;
    for (const key of keys) {
      if (Array.isArray(nestedRecord[key])) return nestedRecord[key] as T[];
    }
    if (Array.isArray(nestedRecord.data)) return nestedRecord.data as T[];
  }

  return [];
};

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

export default function AccessManagementPage() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasAnyPermission } = usePermission();
  const canManageRoles = hasAnyPermission(['admin.roles.manage', 'admin.roles.create', 'admin.super_admin']);
  const canViewRoles = hasAnyPermission(['admin.roles.view', 'admin.roles.manage', 'admin.super_admin']);

  // Helper function to get permissions by category
  const getPermissionsByCategory = (groupedPermissions: Record<string, Permission[]>, category: string): Permission[] => {
    return groupedPermissions[category] || [];
  };

  const [currentTab, setCurrentTab] = useState(0);
  const [permissionsTab, setPermissionsTab] = useState(0);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [permissionGroupingMode, setPermissionGroupingMode] = useState<PermissionGroupingMode>('resource');
  const [loading, setLoading] = useState(false);
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

  const permissionMatrixCategories = useMemo<PermissionMatrixCategory[]>(() => {
    const categoryMap = new Map<string, PermissionMatrixCategory>();
    const categoryGroupMap = new Map<string, Map<string, PermissionMatrixGroup>>();

    permissions.forEach((permission) => {
      const item = buildPermissionMatrixItem(permission);
      const categoryKey = item.categoryKey || 'banking.general';
      const groupKey = item.groupKey;

      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          key: categoryKey,
          label: toDisplayLabel(categoryKey),
          groups: [],
        });
        categoryGroupMap.set(categoryKey, new Map());
      }

      const groupsInCategory = categoryGroupMap.get(categoryKey)!;
      if (!groupsInCategory.has(groupKey)) {
        groupsInCategory.set(groupKey, {
          key: groupKey,
          label: toDisplayLabel(groupKey),
          permissions: [],
        });
      }

      groupsInCategory.get(groupKey)!.permissions.push(item);
    });

    categoryMap.forEach((category, categoryKey) => {
      const groupsMap = categoryGroupMap.get(categoryKey) || new Map();
      const groups = Array.from(groupsMap.values()).map((group) => ({
        ...group,
        permissions: group.permissions.sort((a, b) => a.actionKey.localeCompare(b.actionKey)),
      }));
      category.groups = groups.sort((a, b) => a.label.localeCompare(b.label));
    });

    return Array.from(categoryMap.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [permissions]);

  const rolePermissionSetMap = useMemo(
    () => new Map(roles.map((role) => [role.id, new Set(role.permissions.map((permission) => permission.id))])),
    [roles]
  );

  const permissionSelectionGroups = useMemo<PermissionSelectionGroup[]>(() => {
    return buildPermissionSelectionGroups(permissions, permissionGroupingMode);
  }, [permissions, permissionGroupingMode]);

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

      // API service already returns response.data; support both direct arrays and wrapped payloads.
      const rolesData = extractCollection<Record<string, unknown>>(rolesResponse, ['roles']);
      const permissionsDataRaw = extractCollection<Record<string, unknown>>(permissionsResponse, ['permissions']);

      // Normalize permissions to match frontend interface
      const permissionsData = permissionsDataRaw.map(normalizePermissionFromApi);

      console.log('📊 Processed data:', {
        rolesCount: rolesData.length,
        permissionsCount: permissionsData.length,
        permissionsRaw: permissionsResponse.data,
        permissionsDataSample: permissionsData.slice(0, 2)
      });

      // Transform roles using the normalize function
      const transformedRoles = rolesData.map(normalizeRoleFromApi);

      // Set data from real API responses
      setRoles(transformedRoles);
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
    fetchCurrentUserRoles();
  }, [fetchRoles]);

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
      // TODO: Replace with actual API call to get current user's roles
      // For now, mock with default values
      const mockUserRoles: UserRoleInfo[] = [
        { hierarchyLevel: 2, roleCode: 'SUPERVISOR', roleName: 'Supervisor' },
      ];
      setCurrentUserRoles(mockUserRoles);
      setUserMaxHierarchyLevel(getUserMaxHierarchyLevel(mockUserRoles));
    } catch (err) {
      console.error('Failed to fetch current user roles:', err);
      // Default to level 1 on error
      setUserMaxHierarchyLevel(1);
    }
  }, []);

  // Handlers
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    void event;
    setCurrentTab(newValue);
    const nextTabKey = TAB_INDEX_TO_KEY[newValue] ?? 'roles';
    const nextQuery = new URLSearchParams(searchParams.toString());
    nextQuery.delete('tab');

    const nextPath = nextTabKey === 'roles'
      ? ACCESS_MANAGEMENT_BASE_PATH
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
    fetchRoles();
  };

  const handleCreateRole = () => {
    if (!canManageRoles) return;
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
    if (!canManageRoles) return;
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
    const mode = searchParams.get('mode');
    const nextQuery = new URLSearchParams();
    if (mode) nextQuery.set('mode', mode);
    const queryString = nextQuery.toString();
    router.push(`/banking/maintenance/user-management/roles/${role.id}${queryString ? `?${queryString}` : ''}`);
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

  const handleSaveRole = async () => {
    if (!canManageRoles) return;
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
        const response = await api.roles.create(roleData);
        setApprovalNoticeFromResponse(response, 'Role creation submitted for approval');
      } else if (roleDialog.role) {
        console.log('✏️ Updating existing role with real API call');
        const response = await api.roles.update(roleDialog.role.id, roleData);
        setApprovalNoticeFromResponse(response, 'Role update submitted for approval');
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
    if (!canManageRoles) return;
    try {
      console.log(`🔄 ${isActive ? 'Disabling' : 'Enabling'} role in tenant database:`, roleId);

      // Use real API call to toggle role status
      const response = await api.roles.update(roleId, { isActive: !isActive });
      setApprovalNoticeFromResponse(response, `Role ${isActive ? 'disable' : 'enable'} submitted for approval`);

      console.log(`✅ Role ${isActive ? 'disabled' : 'enabled'} successfully`);
      await fetchRoles(); // Refresh from real database
    } catch (error) {
      console.error('❌ Error toggling role status in database:', error);
      // TODO: Add proper error handling/notification to user
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!canManageRoles) return;
    try {
      console.log('🗑️ Deleting role from tenant database:', roleId);

      // Call real API to delete role
      const response = await api.roles.delete(roleId);
      setApprovalNoticeFromResponse(response, 'Role deletion submitted for approval');

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
    if (!canManageRoles) return;
    try {
      console.log('🔑 Updating all permissions for role:', roleId);

      // Call real API to update permissions
      const response = await api.roles.updatePermissions(roleId, permissionIds);
      setApprovalNoticeFromResponse(response, 'Permission update submitted for approval');

      console.log('✅ Role permissions updated successfully');

      // Refresh roles list to show updated state
      await fetchRoles();
    } catch (error) {
      console.error('❌ Error updating role permissions:', error);
      setError('Failed to update role permissions. Please try again.');
    }
  };

  const handleRolePermissionUpdate = async (roleId: string, permissionIds: string[]) => {
    if (!canManageRoles) return;
    try {
      console.log('🔑 Updating permissions for role:', roleId, permissionIds);

      // Call real API to update permissions
      const response = await api.roles.updatePermissions(roleId, permissionIds);
      setApprovalNoticeFromResponse(response, 'Permission update submitted for approval');

      console.log('✅ Role permissions updated successfully');

      // Refresh roles list to show updated state
      await fetchRoles();
    } catch (error) {
      console.error('❌ Error updating role permissions:', error);
      setError('Failed to update role permissions. Please try again.');
    }
  };

  // Permission Matrix handlers
  const handlePermissionToggle = async (roleId: string, permissionId: string, isChecked: boolean) => {
    if (!canManageRoles) return;
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      const currentPermissions = role.permissions.map(p => p.id);
      let newPermissions: string[];

      if (isChecked) {
        newPermissions = [...currentPermissions, permissionId];
      } else {
        newPermissions = currentPermissions.filter(id => id !== permissionId);
      }

      // Update the role locally for immediate UI feedback
      setRoles(prevRoles =>
        prevRoles.map(r =>
          r.id === roleId
            ? { ...r, permissions: permissions.filter(p => newPermissions.includes(p.id)) }
            : r
        )
      );

      // Call API to persist changes
      const response = await api.roles.updatePermissions(roleId, newPermissions);
      setApprovalNoticeFromResponse(response, 'Permission update submitted for approval');
    } catch (error) {
      console.error('❌ Error toggling permission:', error);
      setError('Failed to update permission. Please refresh and try again.');
      // Refresh to revert local changes
      await fetchRoles();
    }
  };

  const handlePermissionGroupToggle = async (roleId: string, permissionIds: string[], isChecked: boolean) => {
    if (!canManageRoles) return;
    try {
      const role = roles.find(r => r.id === roleId);
      if (!role) return;

      const nextPermissions = new Set(role.permissions.map(p => p.id));
      if (isChecked) {
        permissionIds.forEach((permissionId) => nextPermissions.add(permissionId));
      } else {
        permissionIds.forEach((permissionId) => nextPermissions.delete(permissionId));
      }

      const updatedPermissionIds = Array.from(nextPermissions);

      setRoles(prevRoles =>
        prevRoles.map(r =>
          r.id === roleId
            ? { ...r, permissions: permissions.filter(p => updatedPermissionIds.includes(p.id)) }
            : r
        )
      );

      const response = await api.roles.updatePermissions(roleId, updatedPermissionIds);
      setApprovalNoticeFromResponse(response, 'Permission update submitted for approval');
    } catch (error) {
      console.error('❌ Error toggling permission group:', error);
      setError('Failed to update permission group. Please refresh and try again.');
      await fetchRoles();
    }
  };

  const handleBulkPermissionUpdate = async () => {
    if (!canManageRoles) return;
    try {
      setLoading(true);
      console.log('🔑 Bulk updating permissions for all roles...');

      // This would need to be implemented in the backend
      // For now, just refresh
      await fetchRoles();
    } catch (error) {
      console.error('❌ Error in bulk permission update:', error);
      setError('Failed to save bulk permission changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkPermissionAssignment = async () => {
    if (!canManageRoles) return;
    if (!bulkAssignmentRole || selectedBulkPermissions.length === 0) return;

    try {
      setLoading(true);
      console.log('🔑 Assigning permissions to role:', bulkAssignmentRole, selectedBulkPermissions);

      const response = await api.roles.updatePermissions(bulkAssignmentRole, selectedBulkPermissions);
      setApprovalNoticeFromResponse(response, 'Bulk permission update submitted for approval');

      // Reset form
      setBulkAssignmentRole(null);
      setSelectedBulkPermissions([]);
      setSelectAllPermissions(false);

      // Refresh roles
      await fetchRoles();
    } catch (error) {
      console.error('❌ Error in bulk assignment:', error);
      setError('Failed to assign permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAssign = async (category: string) => {
    if (!canManageRoles) return;
    if (!bulkAssignmentRole) return;

    try {
      setLoading(true);
      const categoryPermissions = permissions
        .filter(p => p.category.toLowerCase() === category)
        .map(p => p.id);

      console.log(`🔑 Quick assigning ${category} permissions to role:`, bulkAssignmentRole);

      const response = await api.roles.updatePermissions(bulkAssignmentRole, categoryPermissions);
      setApprovalNoticeFromResponse(response, 'Permission assignment submitted for approval');

      await fetchRoles();
    } catch (error) {
      console.error('❌ Error in quick assign:', error);
      setError('Failed to assign permissions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllPermissions = async () => {
    if (!canManageRoles) return;
    if (!bulkAssignmentRole) return;

    try {
      setLoading(true);
      console.log('🔑 Clearing all permissions from role:', bulkAssignmentRole);

      const response = await api.roles.updatePermissions(bulkAssignmentRole, []);
      setApprovalNoticeFromResponse(response, 'Permission clearing submitted for approval');

      await fetchRoles();
    } catch (error) {
      console.error('❌ Error clearing permissions:', error);
      setError('Failed to clear permissions. Please try again.');
    } finally {
      setLoading(false);
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
          {params.row.createdAt ? format(parseISO(params.row.createdAt), 'MMM dd, yyyy') : '-'}
        </Typography>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      type: 'actions',
      getActions: (params: GridRowParams) => [
        ...(canViewRoles ? [(
          <SafeGridActionsCellItem
            key="view"
            icon={<VisibilityIcon fontSize="small" />}
            label="View Role"
            onClick={() => handleViewRole(params.row)}
          />
        )] : []),
        ...(canManageRoles ? [
          (
            <SafeGridActionsCellItem
              key="edit"
              icon={<EditIcon fontSize="small" />}
              label="Edit Role"
              onClick={() => handleEditRole(params.row)}
              disabled={params.row.isBuiltIn}
            />
          ),
          (
            <SafeGridActionsCellItem
              key="permissions"
              icon={<SecurityIcon fontSize="small" />}
              label="Manage Permissions"
              onClick={() => handleManagePermissions(params.row)}
            />
          ),
          (
            <SafeGridActionsCellItem
              key="toggle"
              icon={params.row.isActive ? <CancelIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
              label={params.row.isActive ? 'Disable Role' : 'Enable Role'}
              onClick={() => handleToggleRole(params.row.id, params.row.isActive)}
              disabled={params.row.isBuiltIn}
            />
          )
        ] : []),
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
            {icon as any}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
            value={roles.reduce((sum, role) => sum + (role.assignedUsers ?? 0), 0)}
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
            label="Users"
            icon={<PeopleIcon />}
            iconPosition="start"
          />
          <Tab
            label="Permissions"
            icon={<KeyIcon />}
            iconPosition="start"
            data-testid="access-management-tab-permissions"
          />
          <Tab
            label="Role Matrix"
            icon={<AssignmentIcon />}
            iconPosition="start"
          />
          <Tab
            label="Assignments"
            icon={<PeopleIcon />}
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
                <Can permission={['admin.roles.create', 'admin.roles.manage', 'admin.super_admin']}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateRole}
                    size="small"
                    data-testid="access-management-add-role"
                  >
                    Add Role
                  </Button>
                </Can>
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
              checkboxSelection={canManageRoles}
              disableRowSelectionOnClick
              sx={{ height: 600 }}
            />
          </CardContent>
        </Card>
      </TabPanel>

      {/* Users Tab */}
      <TabPanel value={currentTab} index={1}>
        <UserManagementPanel embedded />
      </TabPanel>

      {/* Permissions Tab */}
      <TabPanel value={currentTab} index={2}>
        {/* User Approval Level Summary */}
        <Card sx={{ mb: 3, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'primary.50' }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SecurityIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" color="primary">
                      Your Approval Level
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Level {userMaxHierarchyLevel} - {getHierarchyLevelName(userMaxHierarchyLevel)}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {currentUserRoles.map((role) => (
                    <Chip
                      key={role.roleCode}
                      label={`${role.roleName} (Level ${role.hierarchyLevel})`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      icon={<KeyIcon />}
                    />
                  ))}
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  You can approve permissions requiring Level {userMaxHierarchyLevel} or below
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Permissions Sub-Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={permissionsTab}
            onChange={(e, newValue) => setPermissionsTab(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab
              label="Permission Categories"
              icon={<SettingsIcon />}
              iconPosition="start"
            />
            <Tab
              label="Permission Matrix"
              icon={<AssignmentIcon />}
              iconPosition="start"
              data-testid="access-management-permissions-subtab-matrix"
            />
            <Tab
              label="Bulk Assignment"
              icon={<GroupIcon />}
              iconPosition="start"
              data-testid="access-management-permissions-subtab-bulk"
            />
          </Tabs>
        </Paper>

        {/* Permission Categories Sub-Tab */}
        {permissionsTab === 0 && (
          <Grid container spacing={3}>
            {permissionCategories.map((category) => (
              <Grid size={{ xs: 12, md: 6, lg: 4 }} key={category.name}>
                <Card>
                  <CardHeader
                    title={category.displayName}
                    subheader={`${category.permissions.length} permissions`}
                    action={
                      <Chip
                        label={category.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    }
                  />
                  <CardContent>
                    <List dense>
                      {category.permissions.map((permission) => {
                        const eligibility = permission.requiresApproval
                          ? checkApprovalEligibility(currentUserRoles, {
                            requiresApproval: permission.requiresApproval,
                            requiredApprovalLevel: permission.requiredApprovalLevel ?? null,
                            requiredApprovers: permission.requiredApprovers ?? 1,
                          })
                          : null;

                        return (
                          <ListItem key={permission.id} divider>
                            <ListItemIcon>
                              {permission.category === 'BANKING' && <BankingIcon />}
                              {permission.category === 'IFRS9' && <MoneyIcon />}
                              {permission.category === 'REPORTING' && <ReportIcon />}
                              {permission.category === 'ADMIN' && <AdminIcon />}
                              {permission.category === 'CORE' && <SettingsIcon />}
                            </ListItemIcon>
                            <ListItemText
                              disableTypography
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="body2">
                                    {permission.displayName}
                                  </Typography>
                                  {eligibility && !eligibility.canApprove && (
                                    <Tooltip title={eligibility.reason}>
                                      <Chip
                                        label="Cannot Approve"
                                        size="small"
                                        color="error"
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem', height: '18px' }}
                                      />
                                    </Tooltip>
                                  )}
                                  {eligibility && eligibility.canApprove && (
                                    <Tooltip title={eligibility.reason}>
                                      <Chip
                                        label="Can Approve"
                                        size="small"
                                        color="success"
                                        variant="outlined"
                                        sx={{ fontSize: '0.65rem', height: '18px' }}
                                      />
                                    </Tooltip>
                                  )}
                                </Box>
                              }
                              secondary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                  <Chip
                                    label={permission.riskLevel}
                                    size="small"
                                    color={getRiskLevelColor(permission.riskLevel) as any}
                                    variant="outlined"
                                  />
                                  {permission.requiresApproval && (
                                    <Tooltip title={getApprovalStatusMessage({
                                      requiresApproval: permission.requiresApproval,
                                      requiredApprovalLevel: permission.requiredApprovalLevel ?? null,
                                      requiredApprovers: permission.requiredApprovers ?? 1,
                                    })}>
                                      <Chip
                                        label={`Level ${permission.requiredApprovalLevel ?? 1}+ (${permission.requiredApprovers ?? 1})`}
                                        size="small"
                                        color={getApprovalBadgeColor(permission.requiredApprovalLevel ?? null)}
                                        variant="filled"
                                        icon={<LockIcon fontSize="small" />}
                                      />
                                    </Tooltip>
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
                        );
                      })}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Permission Matrix Sub-Tab */}
        {permissionsTab === 1 && (
          <Card>
            <CardHeader
              title="Permission-Role Assignment Matrix"
              subheader="Assign permissions to roles across all categories"
              action={
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchRoles}
                    size="small"
                  >
                    Refresh
                  </Button>
                  <Can permission={['admin.roles.manage', 'admin.super_admin']}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleBulkPermissionUpdate}
                      size="small"
                      color="primary"
                      data-testid="access-management-matrix-save"
                    >
                      Save Changes
                    </Button>
                  </Can>
                </Box>
              }
            />
            <CardContent>
              <TableContainer component={Paper} sx={{ maxHeight: 680, borderRadius: 2 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 280 }}>
                        Menu / Permission Group
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold', minWidth: 260 }}>
                        Permission Key
                      </TableCell>
                      {roles.map((role) => (
                        <TableCell
                          key={role.id}
                          align="center"
                          sx={{
                            fontWeight: 'bold',
                            minWidth: 150,
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                              {role.displayName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {role.permissions.length} assigned
                            </Typography>
                          </Box>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {permissionMatrixCategories.map((category) => (
                      <React.Fragment key={category.key}>
                        <TableRow>
                          <TableCell
                            colSpan={roles.length + 2}
                            sx={{
                              fontWeight: 'bold',
                              backgroundColor: theme.palette.grey[100],
                              borderTop: `1px solid ${theme.palette.divider}`,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Typography variant="subtitle2">{category.label}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {category.groups.length} groups
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>

                        {category.groups.map((group) => {
                          const groupPermissionIds = group.permissions.map((item) => item.permission.id);
                          return (
                            <React.Fragment key={group.key}>
                              <TableRow hover sx={{ backgroundColor: theme.palette.action.selected }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                  {group.label}
                                </TableCell>
                                <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                  {group.key}
                                </TableCell>
                                {roles.map((role) => {
                                  const rolePermissionSet = rolePermissionSetMap.get(role.id) || new Set<string>();
                                  const selectedCount = groupPermissionIds.filter((id) => rolePermissionSet.has(id)).length;
                                  const allSelected = groupPermissionIds.length > 0 && selectedCount === groupPermissionIds.length;
                                  const partiallySelected = selectedCount > 0 && !allSelected;

                                  return (
                                    <TableCell key={`${role.id}-${group.key}`} align="center">
                                      <Tooltip title={`Toggle all ${group.permissions.length} permissions for ${role.displayName}`}>
                                        <Checkbox
                                          size="small"
                                          checked={allSelected}
                                          indeterminate={partiallySelected}
                                          onChange={(e) => handlePermissionGroupToggle(role.id, groupPermissionIds, e.target.checked)}
                                          disabled={role.isBuiltIn || !canManageRoles}
                                          color="primary"
                                        />
                                      </Tooltip>
                                    </TableCell>
                                  );
                                })}
                              </TableRow>

                              {group.permissions.map((item) => (
                                <TableRow key={item.permission.id} hover>
                                  <TableCell sx={{ pl: 4 }}>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                        {item.permission.displayName}
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                        <Chip
                                          label={item.actionKey.replace(/[_.]/g, ' ').toUpperCase()}
                                          size="small"
                                          variant="filled"
                                          color="primary"
                                        />
                                        <Chip
                                          label={item.permission.riskLevel}
                                          size="small"
                                          color={getRiskLevelColor(item.permission.riskLevel) as any}
                                          variant="outlined"
                                        />
                                        {item.permission.requiresApproval && (
                                          <Chip
                                            label="Approval"
                                            size="small"
                                            color="warning"
                                            variant="filled"
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                                    {item.fullKey}
                                  </TableCell>
                                  {roles.map((role) => {
                                    const rolePermissionSet = rolePermissionSetMap.get(role.id) || new Set<string>();
                                    const hasPermission = rolePermissionSet.has(item.permission.id);

                                    return (
                                      <TableCell key={`${role.id}-${item.permission.id}`} align="center">
                                        <Box
                                          component="span"
                                          data-testid={`access-management-permission-toggle-${role.id}-${item.permission.id}`}
                                        >
                                          <Checkbox
                                            size="small"
                                            checked={hasPermission}
                                            onChange={(e) => handlePermissionToggle(role.id, item.permission.id, e.target.checked)}
                                            disabled={role.isBuiltIn || !canManageRoles}
                                            color="primary"
                                          />
                                        </Box>
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              ))}
                            </React.Fragment>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        )}

        {/* Bulk Assignment Sub-Tab */}
        {permissionsTab === 2 && (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Bulk Role Assignment"
                  subheader="Assign multiple permissions to roles at once"
                />
                <CardContent>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Role</InputLabel>
                    <Select
                      value={bulkAssignmentRole || ''}
                      onChange={(e) => setBulkAssignmentRole(e.target.value)}
                      label="Select Role"
                      data-testid="access-management-bulk-role-select"
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>
                          {role.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth sx={{ mb: 2 }} size="small">
                    <InputLabel>Group Permissions By</InputLabel>
                    <Select
                      value={permissionGroupingMode}
                      onChange={(e) => setPermissionGroupingMode(e.target.value as PermissionGroupingMode)}
                      label="Group Permissions By"
                    >
                      <MenuItem value="resource">Resource (Recommended)</MenuItem>
                      <MenuItem value="module">Module</MenuItem>
                      <MenuItem value="category">Legacy Category</MenuItem>
                    </Select>
                  </FormControl>

                  {bulkAssignmentRole && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Select Permissions
                      </Typography>
                      <FormControlLabel
                        control={
                          <Box component="span" data-testid="access-management-bulk-select-all">
                            <Checkbox
                              checked={selectAllPermissions}
                              onChange={(e) => {
                                setSelectAllPermissions(e.target.checked);
                                if (e.target.checked) {
                                  setSelectedBulkPermissions(permissions.map(p => p.id));
                                } else {
                                  setSelectedBulkPermissions([]);
                                }
                              }}
                            />
                          </Box>
                        }
                        label="Select All Permissions"
                      />

                      <Box sx={{ maxHeight: 300, overflow: 'auto', mt: 2 }}>
                        {permissionSelectionGroups.map((group) => (
                          <Accordion key={group.key} defaultExpanded={false}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                                  {group.label} ({group.permissions.length})
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ pr: 2 }}>
                                  {group.hint}
                                </Typography>
                              </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                              <List dense>
                                {group.permissions.map((permission) => {
                                  const isSelected = selectedBulkPermissions.includes(permission.id);
                                  return (
                                    <ListItem key={permission.id} dense>
                                      <ListItemIcon>
                                        <Box
                                          component="span"
                                          data-testid={`access-management-bulk-permission-${permission.id}`}
                                        >
                                          <Checkbox
                                            size="small"
                                            checked={isSelected}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedBulkPermissions(prev => [...prev, permission.id]);
                                              } else {
                                                setSelectedBulkPermissions(prev => prev.filter(id => id !== permission.id));
                                              }
                                            }}
                                          />
                                        </Box>
                                      </ListItemIcon>
                                      <ListItemText
                                        primary={permission.displayName}
                                        secondary={getPermissionCanonicalKey(permission)}
                                      />
                                    </ListItem>
                                  );
                                })}
                              </List>
                            </AccordionDetails>
                          </Accordion>
                        ))}
                      </Box>

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={handleBulkPermissionAssignment}
                          disabled={selectedBulkPermissions.length === 0}
                          startIcon={<SaveIcon />}
                          data-testid="access-management-bulk-assign"
                        >
                          Assign Selected Permissions
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setSelectedBulkPermissions([]);
                            setSelectAllPermissions(false);
                          }}
                        >
                          Clear Selection
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Quick Actions"
                  subheader="Common permission assignment patterns"
                />
                <CardContent>
                  <Stack spacing={2}>
                    <Button
                      variant="outlined"
                      startIcon={<AdminIcon />}
                      onClick={() => handleQuickAssign('admin')}
                      fullWidth
                    >
                      Assign All Admin Permissions
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<ReportIcon />}
                      onClick={() => handleQuickAssign('reporting')}
                      fullWidth
                    >
                      Assign All Reporting Permissions
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<BankingIcon />}
                      onClick={() => handleQuickAssign('banking')}
                      fullWidth
                    >
                      Assign All Banking Permissions
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => handleQuickAssign('core')}
                      fullWidth
                    >
                      Assign All Core Permissions
                    </Button>
                    <Divider />
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={handleClearAllPermissions}
                      fullWidth
                    >
                      Clear All Permissions
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </TabPanel>

      {/* Role Matrix Tab */}
      <TabPanel value={currentTab} index={3}>
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
                <InputLabel>Filter Group</InputLabel>
                <Select
                  value=""
                  onChange={(e) => {
                    const group = e.target.value;
                    // TODO: Implement group filtering behavior for this matrix view.
                    console.log('🔍 Filtering by group:', group);
                  }}
                  label="Filter Group"
                >
                  <MenuItem value="">All Groups</MenuItem>
                  {permissionSelectionGroups.map((group) => (
                    <MenuItem key={group.key} value={group.key}>
                      {group.label}
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
                        permissions.find(perm => perm.id === p.id)?.riskLevel === 'CRITICAL'
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
                        permissions.find(perm => perm.id === p.id)?.requiresApproval
                      ).length, 0
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Assignments Tab */}
      <TabPanel value={currentTab} index={4}>
        <UserRoleAssignment onAssignmentChange={fetchRoles} />
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
                inputProps={{ 'data-testid': 'access-management-role-name' }}
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
                inputProps={{ 'data-testid': 'access-management-role-display-name' }}
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
                inputProps={{ 'data-testid': 'access-management-role-description' }}
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
            <Button variant="contained" onClick={handleSaveRole} data-testid="access-management-save-role">
              {roleDialog.mode === 'create' ? 'Create Role' : 'Update Role'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Permission Management Dialog */}
      <Dialog
        open={permissionDialog.open}
        onClose={() => setPermissionDialog({ open: false, role: null, selectedPermissions: [] })}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: { minHeight: '80vh' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h6" component="div">
                Manage Permissions: {permissionDialog.role?.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {permissionDialog.role?.type} • {permissionDialog.role?.level} Level
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${permissionDialog.selectedPermissions.length}/${permissions.length} Selected`}
                color={permissionDialog.selectedPermissions.length === permissions.length ? 'success' : 'default'}
                size="small"
              />
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            {/* Category Selection Controls */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={permissionSelectionGroups.every(group =>
                      group.permissions.every(p => permissionDialog.selectedPermissions.includes(p.id))
                    )}
                    indeterminate={permissionSelectionGroups.some(group =>
                      group.permissions.some(p => permissionDialog.selectedPermissions.includes(p.id)) &&
                      !group.permissions.every(p => permissionDialog.selectedPermissions.includes(p.id))
                    )}
                    onChange={(e) => {
                      if (e.target.checked) {
                        // Select all permissions from all groups
                        const allPermissionIds = permissionSelectionGroups.flatMap(group => group.permissions.map(p => p.id));
                        setPermissionDialog({
                          ...permissionDialog,
                          selectedPermissions: [...new Set([...permissionDialog.selectedPermissions, ...allPermissionIds])]
                        });
                      } else {
                        // Deselect all
                        setPermissionDialog({
                          ...permissionDialog,
                          selectedPermissions: []
                        });
                      }
                    }}
                  />
                }
                label={<Typography variant="subtitle1" fontWeight="bold">Select All Permissions</Typography>}
              />
              <FormControl size="small" sx={{ minWidth: 250 }}>
                <InputLabel>Group Permissions By</InputLabel>
                <Select
                  value={permissionGroupingMode}
                  onChange={(e) => setPermissionGroupingMode(e.target.value as PermissionGroupingMode)}
                  label="Group Permissions By"
                >
                  <MenuItem value="resource">Resource (Recommended)</MenuItem>
                  <MenuItem value="module">Module</MenuItem>
                  <MenuItem value="category">Legacy Category</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="body2" color="text.secondary">
                {permissionDialog.selectedPermissions.length} of {permissions.length} permissions selected
              </Typography>
            </Box>

            {/* Permission Groups */}
            {permissionSelectionGroups.map((group) => {
              const groupPermissions = group.permissions;
              const selectedInGroup = groupPermissions.filter(p => permissionDialog.selectedPermissions.includes(p.id)).length;
              const isGroupFullySelected = selectedInGroup === groupPermissions.length;
              const isGroupPartiallySelected = selectedInGroup > 0 && selectedInGroup < groupPermissions.length;

              return (
                <Accordion key={group.key} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={isGroupFullySelected}
                            indeterminate={isGroupPartiallySelected}
                            onChange={(e) => {
                              e.stopPropagation(); // Prevent accordion toggle
                              const groupPermissionIds = groupPermissions.map(p => p.id);
                              if (e.target.checked) {
                                // Select all in this group
                                setPermissionDialog({
                                  ...permissionDialog,
                                  selectedPermissions: [...new Set([...permissionDialog.selectedPermissions, ...groupPermissionIds])]
                                });
                              } else {
                                // Deselect all in this group
                                setPermissionDialog({
                                  ...permissionDialog,
                                  selectedPermissions: permissionDialog.selectedPermissions.filter(id => !groupPermissionIds.includes(id))
                                });
                              }
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        }
                        label={
                          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            {group.label}
                          </Typography>
                        }
                        sx={{ flex: 1 }}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${selectedInGroup}/${groupPermissions.length}`}
                          size="small"
                          color={isGroupFullySelected ? 'success' : selectedInGroup > 0 ? 'warning' : 'default'}
                          variant="outlined"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {group.hint}
                        </Typography>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={1}>
                      {group.permissions.map((permission) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={permission.id}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
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
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                  {permission.displayName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                  {getPermissionCanonicalKey(permission)}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                  <Chip
                                    label={permission.riskLevel}
                                    size="small"
                                    color={getRiskLevelColor(permission.riskLevel) as any}
                                    variant="outlined"
                                  />
                                  {permission.requiresApproval && (
                                    <Chip label="Approval" size="small" color="warning" variant="filled" />
                                  )}
                                  {permission.syariahRequired && (
                                    <Chip label="Syariah" size="small" color="secondary" variant="outlined" />
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
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Box sx={{ display: 'flex', gap: 1, flex: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                // Select all critical permissions
                const criticalPermissions = permissions.filter(p => p.riskLevel === 'CRITICAL').map(p => p.id);
                setPermissionDialog({
                  ...permissionDialog,
                  selectedPermissions: [...new Set([...permissionDialog.selectedPermissions, ...criticalPermissions])]
                });
              }}
            >
              + Critical
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                // Select all permissions requiring approval
                const approvalPermissions = permissions.filter(p => p.requiresApproval).map(p => p.id);
                setPermissionDialog({
                  ...permissionDialog,
                  selectedPermissions: [...new Set([...permissionDialog.selectedPermissions, ...approvalPermissions])]
                });
              }}
            >
              + Approval Required
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => {
                setPermissionDialog({
                  ...permissionDialog,
                  selectedPermissions: []
                });
              }}
            >
              Clear All
            </Button>
          </Box>
          <Button onClick={() => setPermissionDialog({ open: false, role: null, selectedPermissions: [] })}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
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
            }}
            disabled={permissionDialog.selectedPermissions.length === 0}
          >
            Save {permissionDialog.selectedPermissions.length} Permission{permissionDialog.selectedPermissions.length !== 1 ? 's' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
