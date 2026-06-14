// packages/frontend/src/components/roles/UserRoleAssignment.tsx
'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Badge from '@mui/material/Badge'
import LinearProgress from '@mui/material/LinearProgress'
import Grid from '@mui/material/Grid'
import Avatar from '@mui/material/Avatar'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Divider from '@mui/material/Divider'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Checkbox from '@mui/material/Checkbox'
import Pagination from '@mui/material/Pagination'
import Menu from '@mui/material/Menu'
import MenuList from '@mui/material/MenuList'
import MuiMenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import PeopleIcon from '@mui/icons-material/People'
import PersonIcon from '@mui/icons-material/Person'
import SecurityIcon from '@mui/icons-material/Security'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import EditIcon from '@mui/icons-material/Edit'
import ViewIcon from '@mui/icons-material/Visibility'
import SearchIcon from '@mui/icons-material/Search'
import FilterIcon from '@mui/icons-material/FilterList'
import RefreshIcon from '@mui/icons-material/Refresh'
import AssignmentIcon from '@mui/icons-material/Assignment'
import BusinessIcon from '@mui/icons-material/Business'
import SettingsIcon from '@mui/icons-material/Settings'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'
import GroupIcon from '@mui/icons-material/Group'
import SupervisorIcon from '@mui/icons-material/SupervisorAccount'
import AdminIcon from '@mui/icons-material/AdminPanelSettings'
import ReportIcon from '@mui/icons-material/Assessment'
import BankingIcon from '@mui/icons-material/AccountBalance'
import MoneyIcon from '@mui/icons-material/MonetizationOn'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { useTheme } from '@mui/material/styles';
import type { GridColDef } from '@mui/x-data-grid';
import { format, parseISO } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';
import { usersAPI } from '@/services/api/users.api';
import LockResetIcon from '@mui/icons-material/LockReset';
import KeyIcon from '@mui/icons-material/Key';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { getRoleResponsibility } from '@/components/roles/role-responsibility.utils';
import { SafeDataGrid, SafeGridActionsCellItem } from '@/components/shared/SafeDataGrid';

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

const asOptionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.length > 0 ? value : undefined;

const extractCollection = <T,>(payload: unknown, keys: string[] = []): T[] => {
  if (Array.isArray(payload)) return payload as T[];
  if (!payload || typeof payload !== 'object') return [];

  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as T[];

  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }

  const nestedData = record.data;
  if (nestedData && typeof nestedData === 'object') {
    const nestedRecord = nestedData as Record<string, unknown>;
    if (Array.isArray(nestedRecord.data)) return nestedRecord.data as T[];
    for (const key of keys) {
      if (Array.isArray(nestedRecord[key])) return nestedRecord[key] as T[];
    }

    const deepNestedData = nestedRecord.data;
    if (deepNestedData && typeof deepNestedData === 'object') {
      const deepNestedRecord = deepNestedData as Record<string, unknown>;
      for (const key of keys) {
        if (Array.isArray(deepNestedRecord[key])) return deepNestedRecord[key] as T[];
      }
    }
  }

  return [];
};

const normalizeAssignments = (input: unknown): UserRoleAssignment[] =>
  extractCollection<Record<string, unknown>>(input, ['roleAssignments', 'assignments', 'roles']).map((assignment) => ({
    id: String(assignment.id ?? ''),
    userId: String(assignment.userId ?? assignment.user_id ?? ''),
    roleId: String(assignment.roleId ?? assignment.role_id ?? (assignment.role as Record<string, unknown> | undefined)?.id ?? ''),
    assignedAt: String(assignment.assignedAt ?? assignment.assigned_at ?? new Date().toISOString()),
    assignedBy: String(assignment.assignedBy ?? assignment.assigned_by ?? ''),
    isActive: Boolean(assignment.isActive ?? assignment.is_active ?? true),
    validFrom: asOptionalString(assignment.validFrom ?? assignment.valid_from),
    validUntil: asOptionalString(assignment.validUntil ?? assignment.valid_until),
    isTemporary: Boolean(assignment.isTemporary ?? assignment.is_temporary ?? false)
  }));

const normalizeUsers = (input: unknown): User[] =>
  extractCollection<Record<string, unknown>>(input, ['users']).map((user) => ({
    id: String(user.id ?? ''),
    email: String(user.email ?? ''),
    fullName: String(user.fullName ?? user.full_name ?? user.username ?? user.email ?? 'Unknown User'),
    isActive: Boolean(user.isActive ?? user.is_active ?? true),
    createdAt: String(user.createdAt ?? user.created_at ?? new Date().toISOString()),
    lastLoginAt: (user.lastLoginAt as string | undefined) ?? (user.last_login_at as string | undefined),
    roleAssignments: normalizeAssignments(user.roleAssignments ?? user.role_assignments ?? user.assignments)
  }));

const normalizePermissions = (input: unknown): Record<string, Permission[]> => {
  if (Array.isArray(input)) {
    return { GENERAL: input as Permission[] };
  }

  if (input && typeof input === 'object') {
    return input as Record<string, Permission[]>;
  }

  return {};
};

const normalizeRoles = (input: unknown): Role[] =>
  extractCollection<Record<string, unknown>>(input, ['roles']).map((role) => ({
    id: String(role.id ?? ''),
    name: String(role.name ?? role.roleName ?? role.role_name ?? role.roleCode ?? role.role_code ?? ''),
    displayName: String(role.displayName ?? role.display_name ?? role.roleName ?? role.role_name ?? role.name ?? role.roleCode ?? role.role_code ?? ''),
    description: String(role.description ?? ''),
    type: (role.type as Role['type']) ?? (role.isSystemRole ? 'SYSTEM' : 'CUSTOM'),
    level: (role.level as Role['level']) ?? 'TENANT',
    isActive: Boolean(role.isActive ?? role.is_active ?? true),
    isBuiltIn: Boolean(role.isBuiltIn ?? role.is_built_in ?? false),
    permissions: normalizePermissions(role.permissions),
    assignedUsers: Number(role.assignedUsers ?? role.assigned_users ?? role.userCount ?? role.user_count ?? 0),
    createdAt: String(role.createdAt ?? role.created_at ?? new Date().toISOString())
  }));

const getRoleLabel = (role: Role | null | undefined): string =>
  role?.displayName || role?.name || 'Unnamed Role';

const getRoleResponsibilityLabel = (role: Role | null | undefined): string =>
  getRoleResponsibility({ name: role?.name, displayName: role?.displayName }).label;

const UserRoleAssignment: React.FC<UserRoleAssignmentProps> = ({
  onAssignmentChange,
  refreshTrigger = 0
}) => {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedDeepLinkRef = useRef<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

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
  const flattenPermissions = (groupedPermissions: Record<string, Permission[]> | Permission[] | undefined | null): Permission[] => {
    if (Array.isArray(groupedPermissions)) return groupedPermissions;
    if (!groupedPermissions || typeof groupedPermissions !== 'object') return [];
    return Object.values(groupedPermissions).flat();
  };
  const canRoleApproveRequests = (role: Role): boolean => {
    const approvalPermissionCodes = new Set([
      'approval.requests.approve',
      'approval.all',
      'admin.super_admin',
    ]);
    return flattenPermissions(role.permissions).some((permission) =>
      approvalPermissionCodes.has(String(permission.code || '').trim().toLowerCase())
    );
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
  const [userDetailsDialog, setUserDetailsDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null
  });
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
  const [manageUserRolesDialog, setManageUserRolesDialog] = useState<{
    open: boolean;
    user: User | null;
    selectedRoleIds: string[];
    saving: boolean;
    error: string | null;
    success: boolean;
  }>({
    open: false,
    user: null,
    selectedRoleIds: [],
    saving: false,
    error: null,
    success: false,
  });
  const [manageRoleUsersDialog, setManageRoleUsersDialog] = useState<{
    open: boolean;
    role: Role | null;
    selectedUserIds: string[];
    saving: boolean;
  }>({
    open: false,
    role: null,
    selectedUserIds: [],
    saving: false
  });

  // Filters and pagination
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [roleSearchTerm, setRoleSearchTerm] = useState('');
  const [manageRoleSearchTerm, setManageRoleSearchTerm] = useState('');
  const [filterRoleType, setFilterRoleType] = useState<string>('all');
  const [approvalCoverageFilter, setApprovalCoverageFilter] = useState<'all' | 'can_approve' | 'no_approval'>('all');
  const [showInactiveUsers, setShowInactiveUsers] = useState(false);
  const [showInactiveRoles, setShowInactiveRoles] = useState(false);
  const [userPage, setUserPage] = useState(0);
  const [userRowsPerPage, setUserRowsPerPage] = useState(10);
  const [rolePage, setRolePage] = useState(0);
  const [roleRowsPerPage, setRoleRowsPerPage] = useState(10);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

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

      let normalizedUsers = normalizeUsers(usersResponse);
      let normalizedRoles = normalizeRoles(rolesResponse);

      if (normalizedUsers.length > 0) {
        const userRoleResponses = await Promise.allSettled(
          normalizedUsers.map((user) => api.roles.getUserRoles(user.id))
        );

        const assignmentMap = new Map<string, UserRoleAssignment[]>();
        const discoveredRoles: Record<string, unknown>[] = [];

        userRoleResponses.forEach((result, index) => {
          if (result.status !== 'fulfilled') return;

          const userId = normalizedUsers[index].id;
          const roleRows = extractCollection<Record<string, unknown>>(result.value, ['roles']);
          const assignments = roleRows
            .map((row) => {
              const embeddedRole = row.role as Record<string, unknown> | undefined;
              if (embeddedRole) discoveredRoles.push(embeddedRole);
              const roleId = String(row.roleId ?? row.role_id ?? embeddedRole?.id ?? '');
              if (!roleId) return null;

              return {
                id: String(row.id ?? `${userId}-${roleId}`),
                userId,
                roleId,
                assignedAt: String(row.assignedAt ?? row.assigned_at ?? new Date().toISOString()),
                assignedBy: String(row.assignedBy ?? row.assigned_by ?? ''),
                isActive: Boolean(row.isActive ?? row.is_active ?? true),
                validFrom: asOptionalString(row.validFrom ?? row.valid_from),
                validUntil: asOptionalString(row.validUntil ?? row.valid_until),
                isTemporary: Boolean(row.isTemporary ?? row.is_temporary ?? false),
              } as UserRoleAssignment;
            })
            .filter((item): item is UserRoleAssignment => item !== null);

          assignmentMap.set(userId, assignments);
        });

        if (discoveredRoles.length > 0) {
          const mergedRoles = [...normalizedRoles, ...normalizeRoles(discoveredRoles)];
          const dedupedRoles = new Map<string, Role>();
          mergedRoles.forEach((role) => {
            dedupedRoles.set(role.id, role);
          });
          normalizedRoles = Array.from(dedupedRoles.values());
        }

        normalizedUsers = normalizedUsers.map((user) => {
          const fetchedAssignments = assignmentMap.get(user.id) || [];
          const mergedByRole = new Map<string, UserRoleAssignment>();
          [...user.roleAssignments, ...fetchedAssignments].forEach((assignment) => {
            if (!assignment.roleId) return;
            mergedByRole.set(assignment.roleId, { ...assignment, userId: user.id });
          });

          return {
            ...user,
            roleAssignments: Array.from(mergedByRole.values()),
          };
        });
      }

      const assignedUsersByRole = new Map<string, number>();
      normalizedUsers.forEach((user) => {
        const uniqueRoleIds = new Set(user.roleAssignments.filter((assignment) => assignment.isActive).map((assignment) => assignment.roleId));
        uniqueRoleIds.forEach((roleId) => {
          assignedUsersByRole.set(roleId, (assignedUsersByRole.get(roleId) || 0) + 1);
        });
      });

      normalizedRoles = normalizedRoles.map((role) => ({
        ...role,
        name: role.name || role.displayName || 'UNNAMED_ROLE',
        displayName: getRoleLabel(role),
        assignedUsers: assignedUsersByRole.get(role.id) ?? role.assignedUsers ?? 0,
      }));

      setUsers(normalizedUsers);
      setRoles(normalizedRoles);
      setSelectedUserIds((prev) => prev.filter((id) => normalizedUsers.some((user) => user.id === id)));
      setSelectedRoleIds((prev) => prev.filter((id) => normalizedRoles.some((role) => role.id === id)));

      console.log(`✅ Fetched ${normalizedUsers.length} users and ${normalizedRoles.length} roles`);

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
      if (userSearchTerm && !user.fullName.toLowerCase().includes(userSearchTerm.toLowerCase()) &&
        !user.email.toLowerCase().includes(userSearchTerm.toLowerCase())) return false;

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
  }, [users, userSearchTerm, showInactiveUsers, filterRoleType, roles]);

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      if (!showInactiveRoles && !role.isActive) return false;
      if (roleSearchTerm && !getRoleLabel(role).toLowerCase().includes(roleSearchTerm.toLowerCase()) &&
        !role.name.toLowerCase().includes(roleSearchTerm.toLowerCase())) return false;
      if (approvalCoverageFilter === 'can_approve' && !canRoleApproveRequests(role)) return false;
      if (approvalCoverageFilter === 'no_approval' && canRoleApproveRequests(role)) return false;
      return true;
    });
  }, [roles, roleSearchTerm, showInactiveRoles, approvalCoverageFilter]);

  // Paginated data
  const paginatedUsers = useMemo(() => {
    const startIndex = userPage * userRowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + userRowsPerPage);
  }, [filteredUsers, userPage, userRowsPerPage]);

  const paginatedRoles = useMemo(() => {
    const startIndex = rolePage * roleRowsPerPage;
    return filteredRoles.slice(startIndex, startIndex + roleRowsPerPage);
  }, [filteredRoles, rolePage, roleRowsPerPage]);

  const selectedUsers = useMemo(
    () => users.filter((user) => selectedUserIds.includes(user.id)),
    [users, selectedUserIds]
  );

  const selectedRoles = useMemo(
    () => roles.filter((role) => selectedRoleIds.includes(role.id)),
    [roles, selectedRoleIds]
  );

  const filteredUserIds = useMemo(() => filteredUsers.map((user) => user.id), [filteredUsers]);
  const filteredRoleIds = useMemo(() => filteredRoles.map((role) => role.id), [filteredRoles]);
  const allFilteredUsersSelected = filteredUserIds.length > 0 && filteredUserIds.every((id) => selectedUserIds.includes(id));
  const allFilteredRolesSelected = filteredRoleIds.length > 0 && filteredRoleIds.every((id) => selectedRoleIds.includes(id));
  const someFilteredUsersSelected = filteredUserIds.some((id) => selectedUserIds.includes(id));
  const someFilteredRolesSelected = filteredRoleIds.some((id) => selectedRoleIds.includes(id));

  const toggleUserSelection = (userId: string, checked: boolean) => {
    setSelectedUserIds((prev) => {
      if (checked) return [...new Set([...prev, userId])];
      return prev.filter((id) => id !== userId);
    });
  };

  const toggleRoleSelection = (roleId: string, checked: boolean) => {
    setSelectedRoleIds((prev) => {
      if (checked) return [...new Set([...prev, roleId])];
      return prev.filter((id) => id !== roleId);
    });
  };

  const handleSelectAllFilteredUsers = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds((prev) => [...new Set([...prev, ...filteredUserIds])]);
      return;
    }
    setSelectedUserIds((prev) => prev.filter((id) => !filteredUserIds.includes(id)));
  };

  const handleSelectAllFilteredRoles = (checked: boolean) => {
    if (checked) {
      setSelectedRoleIds((prev) => [...new Set([...prev, ...filteredRoleIds])]);
      return;
    }
    setSelectedRoleIds((prev) => prev.filter((id) => !filteredRoleIds.includes(id)));
  };

  const getAssignedRoleIdsForUser = (user: User | null): string[] => {
    if (!user) return [];
    return Array.from(
      new Set(
        user.roleAssignments
          .filter((assignment) => assignment.isActive && assignment.roleId)
          .map((assignment) => assignment.roleId)
      )
    );
  };

  const getAssignedUsersForRole = (roleId: string): User[] =>
    users.filter((user) =>
      user.roleAssignments.some((assignment) => assignment.isActive && assignment.roleId === roleId)
    );

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
      const response = await api.roles.assignUser(roleId, userId);
      const approvalRequired = Boolean(response?.approvalRequired);
      const requestId = response?.requestId;
      if (approvalRequired) {
        const message = response?.message || 'Role assignment submitted for approval';
        setNotice(`${message}${requestId ? ` (Request: ${requestId})` : ''}`);
      }
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
      const response = await api.roles.removeUser(roleId, userId);
      const approvalRequired = Boolean(response?.approvalRequired);
      const requestId = response?.requestId;
      if (approvalRequired) {
        const message = response?.message || 'Role removal submitted for approval';
        setNotice(`${message}${requestId ? ` (Request: ${requestId})` : ''}`);
      }
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
      let approvalCount = 0;

      for (const roleId of bulkDialog.selectedRoles) {
        for (const userId of bulkDialog.selectedUsers) {
          const response = await api.roles.assignUser(roleId, userId);
          if (response?.approvalRequired) {
            approvalCount += 1;
          }
        }
      }

      if (approvalCount > 0) {
        setNotice(`Bulk assignment submitted ${approvalCount} request(s) for approval.`);
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
      let approvalCount = 0;

      for (const roleId of bulkDialog.selectedRoles) {
        for (const userId of bulkDialog.selectedUsers) {
          const response = await api.roles.removeUser(roleId, userId);
          if (response?.approvalRequired) {
            approvalCount += 1;
          }
        }
      }

      if (approvalCount > 0) {
        setNotice(`Bulk removal submitted ${approvalCount} request(s) for approval.`);
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

  const openUserDetailsDialog = (user: User) => {
    setUserDetailsDialog({ open: true, user });
  };

  const openManageUserRolesDialog = (user: User) => {
    setManageUserRolesDialog({
      open: true,
      user,
      selectedRoleIds: getAssignedRoleIdsForUser(user),
      saving: false,
      error: null,
      success: false,
    });
  };

  const openPasswordResetDialog = (user: User) => {
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

  const handleResetPassword = async () => {
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
        error: err?.message || err?.response?.data?.message || 'Failed to reset password'
      }));
    }
  };

  const openRoleDetailsPage = (role: Role) => {
    const mode = searchParams.get('mode');
    const nextQuery = new URLSearchParams();
    if (mode) nextQuery.set('mode', mode);
    const query = nextQuery.toString();
    const href = `/banking/maintenance/access-management/roles/${role.id}${query ? `?${query}` : ''}`;
    router.push(href);
  };

  const openManageRoleUsersDialog = (role: Role) => {
    setManageRoleUsersDialog({
      open: true,
      role,
      selectedUserIds: getAssignedUsersForRole(role.id).map((user) => user.id),
      saving: false
    });
  };

  const workspaceUserColumns = useMemo<GridColDef<User>[]>(() => [
    {
      field: 'select',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <Checkbox
          size="small"
          checked={allFilteredUsersSelected}
          indeterminate={someFilteredUsersSelected && !allFilteredUsersSelected}
          onChange={(e) => handleSelectAllFilteredUsers(e.target.checked)}
        />
      ),
      renderCell: (params) => (
        <Checkbox
          size="small"
          checked={selectedUserIds.includes(params.row.id)}
          onChange={(e) => toggleUserSelection(params.row.id, e.target.checked)}
        />
      ),
    },
    {
      field: 'fullName',
      headerName: 'User',
      minWidth: 220,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{params.row.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={getUserStatusColor(params.row.isActive)}
        />
      ),
    },
    {
      field: 'roleAssignments',
      headerName: 'Roles',
      width: 110,
      renderCell: (params) => <Chip size="small" variant="outlined" label={params.row.roleAssignments.length} />,
    },
  ], [allFilteredUsersSelected, selectedUserIds, someFilteredUsersSelected]);

  const workspaceRoleColumns = useMemo<GridColDef<Role>[]>(() => [
    {
      field: 'select',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderHeader: () => (
        <Checkbox
          size="small"
          checked={allFilteredRolesSelected}
          indeterminate={someFilteredRolesSelected && !allFilteredRolesSelected}
          onChange={(e) => handleSelectAllFilteredRoles(e.target.checked)}
        />
      ),
      renderCell: (params) => (
        <Checkbox
          size="small"
          checked={selectedRoleIds.includes(params.row.id)}
          onChange={(e) => toggleRoleSelection(params.row.id, e.target.checked)}
        />
      ),
    },
    {
      field: 'displayName',
      headerName: 'Role',
      minWidth: 240,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{getRoleLabel(params.row)}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.name || 'UNNAMED_ROLE'}</Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip size="small" variant="outlined" label={getRoleResponsibilityLabel(params.row)} />
          </Box>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.type}
          size="small"
          color={getRoleTypeColor(params.row.type) as any}
          variant="outlined"
        />
      ),
    },
    {
      field: 'assignedUsers',
      headerName: 'Assigned',
      width: 120,
      renderCell: (params) => <Chip size="small" variant="outlined" label={params.row.assignedUsers} />,
    },
  ], [allFilteredRolesSelected, selectedRoleIds, someFilteredRolesSelected]);

  const userColumns = useMemo<GridColDef<User>[]>(() => [
    ...workspaceUserColumns.slice(0, 2),
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 220,
      flex: 1,
    },
    workspaceUserColumns[2],
    {
      field: 'assignedRoles',
      headerName: 'Assigned Roles',
      minWidth: 300,
      flex: 1.3,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.row.roleAssignments
            .filter(assignment => {
              const role = roles.find(r => r.id === assignment.roleId);
              return role?.isActive;
            })
            .map((assignment) => {
              const role = roles.find(r => r.id === assignment.roleId);
              return role ? (
                <Chip
                  key={assignment.id}
                  label={getRoleLabel(role)}
                  size="small"
                  color={getRoleTypeColor(role.type) as any}
                  variant="outlined"
                />
              ) : null;
            })}
          {params.row.roleAssignments.length === 0 && (
            <Typography variant="caption" color="text.secondary">
              No roles assigned
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'roleCount',
      headerName: 'Role Count',
      width: 120,
      renderCell: (params) => (
        <Badge badgeContent={params.row.roleAssignments.length} color="primary">
          <AssignmentIcon fontSize="small" />
        </Badge>
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 140,
      renderCell: (params) => format(parseISO(params.row.createdAt), 'MMM dd, yyyy'),
    },
    {
      field: 'lastLoginAt',
      headerName: 'Last Login',
      width: 140,
      renderCell: (params) => params.row.lastLoginAt
        ? format(parseISO(params.row.lastLoginAt), 'MMM dd, yyyy')
        : 'Never',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 196,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="view"
          icon={<ViewIcon fontSize="small" />}
          label="View User Details"
          onClick={() => openUserDetailsDialog(params.row)}
          showInMenu={false}
        />,
        <SafeGridActionsCellItem
          key="manage"
          icon={<EditIcon fontSize="small" />}
          label="Manage Roles"
          onClick={() => openManageUserRolesDialog(params.row)}
          showInMenu={false}
        />,
        <SafeGridActionsCellItem
          key="password"
          icon={<LockResetIcon fontSize="small" />}
          label="Reset Password"
          onClick={() => openPasswordResetDialog(params.row)}
          showInMenu={false}
        />,
      ],
    },
  ], [roles, workspaceUserColumns]);

  const roleColumns = useMemo<GridColDef<Role>[]>(() => [
    ...workspaceRoleColumns.slice(0, 3),
    {
      field: 'level',
      headerName: 'Level',
      width: 140,
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.isActive ? 'Active' : 'Inactive'}
          size="small"
          color={params.row.isActive ? 'success' : 'default'}
        />
      ),
    },
    {
      field: 'assignedUsers',
      headerName: 'Assigned Users',
      width: 150,
      renderCell: (params) => (
        <Badge badgeContent={params.row.assignedUsers} color="primary">
          <PeopleIcon fontSize="small" />
        </Badge>
      ),
    },
    {
      field: 'permissions',
      headerName: 'Permissions',
      width: 140,
      renderCell: (params) => (
        <Badge badgeContent={flattenPermissions(params.row.permissions).length} color="secondary">
          <SecurityIcon fontSize="small" />
        </Badge>
      ),
    },
    {
      field: 'approvalScope',
      headerName: 'Approval Scope',
      width: 150,
      renderCell: (params) => (
        <Chip
          size="small"
          label={canRoleApproveRequests(params.row) ? 'Can Approve' : 'No Approval'}
          color={canRoleApproveRequests(params.row) ? 'success' : 'default'}
          variant="outlined"
        />
      ),
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 140,
      renderCell: (params) => format(parseISO(params.row.createdAt), 'MMM dd, yyyy'),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 112,
      getActions: (params) => [
        <SafeGridActionsCellItem
          key="view"
          icon={<ViewIcon fontSize="small" />}
          label="Open Role Details"
          onClick={() => openRoleDetailsPage(params.row)}
          showInMenu={false}
        />,
        <SafeGridActionsCellItem
          key="users"
          icon={<PeopleIcon fontSize="small" />}
          label="Manage User Assignments"
          onClick={() => openManageRoleUsersDialog(params.row)}
          showInMenu={false}
        />,
      ],
    },
  ], [workspaceRoleColumns]);

  const managedUserRoleRows = useMemo(() => {
    let filtered = roles.filter((role) => role.isActive || manageUserRolesDialog.selectedRoleIds.includes(role.id));
    if (manageRoleSearchTerm) {
      const term = manageRoleSearchTerm.toLowerCase();
      filtered = filtered.filter((r) =>
        getRoleLabel(r).toLowerCase().includes(term) ||
        (r.description || '').toLowerCase().includes(term) ||
        (r.type || '').toLowerCase().includes(term)
      );
    }
    return filtered;
  }, [manageUserRolesDialog.selectedRoleIds, roles, manageRoleSearchTerm, getRoleLabel]);

  const managedUserRoleColumns = useMemo<GridColDef<Role>[]>(() => [
    {
      field: 'select',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Checkbox
          checked={manageUserRolesDialog.selectedRoleIds.includes(params.row.id)}
          onChange={(e) => toggleRoleSelectionForManagedUser(params.row.id, e.target.checked)}
        />
      ),
    },
    {
      field: 'displayName',
      headerName: 'Role',
      minWidth: 280,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{getRoleLabel(params.row)}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.description || '-'}</Typography>
          <Box sx={{ mt: 0.5 }}>
            <Chip size="small" variant="outlined" label={getRoleResponsibilityLabel(params.row)} />
          </Box>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 130,
      renderCell: (params) => (
        <Chip size="small" label={params.row.type} color={getRoleTypeColor(params.row.type) as any} variant="outlined" />
      ),
    },
    {
      field: 'level',
      headerName: 'Level',
      width: 140,
    },
  ], [manageUserRolesDialog.selectedRoleIds]);

  const managedRoleUserRows = useMemo(
    () => users.filter((user) => showInactiveUsers || user.isActive || manageRoleUsersDialog.selectedUserIds.includes(user.id)),
    [manageRoleUsersDialog.selectedUserIds, showInactiveUsers, users]
  );

  const managedRoleUserColumns = useMemo<GridColDef<User>[]>(() => [
    {
      field: 'select',
      headerName: '',
      width: 56,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Checkbox
          checked={manageRoleUsersDialog.selectedUserIds.includes(params.row.id)}
          onChange={(e) => toggleUserSelectionForManagedRole(params.row.id, e.target.checked)}
        />
      ),
    },
    {
      field: 'fullName',
      headerName: 'User',
      minWidth: 260,
      flex: 1,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{params.row.fullName}</Typography>
          <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
        </Box>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => (
        <Chip size="small" label={params.row.isActive ? 'Active' : 'Inactive'} color={getUserStatusColor(params.row.isActive)} />
      ),
    },
  ], [manageRoleUsersDialog.selectedUserIds]);

  const saveManagedUserRoles = async () => {
    const user = manageUserRolesDialog.user;
    if (!user) return;

    const currentAssigned = new Set(getAssignedRoleIdsForUser(user));
    const nextAssigned = new Set(manageUserRolesDialog.selectedRoleIds);

    const rolesToAssign = Array.from(nextAssigned).filter((roleId) => !currentAssigned.has(roleId));
    const rolesToRemove = Array.from(currentAssigned).filter((roleId) => !nextAssigned.has(roleId));

    if (rolesToAssign.length === 0 && rolesToRemove.length === 0) {
      setManageUserRolesDialog((prev) => ({ ...prev, error: 'No changes to save' }));
      return;
    }

    try {
      setManageUserRolesDialog((prev) => ({ ...prev, saving: true, error: null }));

      for (const roleId of rolesToAssign) {
        const response = await api.roles.assignUser(roleId, user.id);
        if (response?.approvalRequired) {
          setManageUserRolesDialog((prev) => ({ ...prev, success: true }));
        }
      }

      for (const roleId of rolesToRemove) {
        const response = await api.roles.removeUser(roleId, user.id);
        if (response?.approvalRequired) {
          setManageUserRolesDialog((prev) => ({ ...prev, success: true }));
        }
      }

      onAssignmentChange?.();
      await fetchData();
      setManageUserRolesDialog({ open: false, user: null, selectedRoleIds: [], saving: false, error: null, success: false });
      setUserDetailsDialog({ open: false, user: null });
      setNotice('Role assignment saved successfully');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to save role assignment';
      setManageUserRolesDialog((prev) => ({ ...prev, saving: false, error: message }));
    }
  };

  const saveManagedRoleUsers = async () => {
    const role = manageRoleUsersDialog.role;
    if (!role) return;

    const currentAssigned = new Set(getAssignedUsersForRole(role.id).map((user) => user.id));
    const nextAssigned = new Set(manageRoleUsersDialog.selectedUserIds);

    const usersToAssign = Array.from(nextAssigned).filter((userId) => !currentAssigned.has(userId));
    const usersToRemove = Array.from(currentAssigned).filter((userId) => !nextAssigned.has(userId));

    try {
      setManageRoleUsersDialog((prev) => ({ ...prev, saving: true }));

      for (const userId of usersToAssign) {
        const response = await api.roles.assignUser(role.id, userId);
        if (response?.approvalRequired) {
          setNotice('Role user assignment change submitted for approval.');
        }
      }

      for (const userId of usersToRemove) {
        const response = await api.roles.removeUser(role.id, userId);
        if (response?.approvalRequired) {
          setNotice('Role user assignment change submitted for approval.');
        }
      }

      onAssignmentChange?.();
      await fetchData();
      setManageRoleUsersDialog({ open: false, role: null, selectedUserIds: [], saving: false });
    } catch (err) {
      console.error('❌ Failed saving role user assignment:', err);
      setError('Failed to save user assignment for role');
      setManageRoleUsersDialog((prev) => ({ ...prev, saving: false }));
    }
  };

  const toggleRoleSelectionForManagedUser = (roleId: string, checked: boolean) => {
    setManageUserRolesDialog((prev) => {
      const next = checked
        ? [...new Set([...prev.selectedRoleIds, roleId])]
        : prev.selectedRoleIds.filter((id) => id !== roleId);
      return { ...prev, selectedRoleIds: next };
    });
  };

  const toggleUserSelectionForManagedRole = (userId: string, checked: boolean) => {
    setManageRoleUsersDialog((prev) => {
      const next = checked
        ? [...new Set([...prev.selectedUserIds, userId])]
        : prev.selectedUserIds.filter((id) => id !== userId);
      return { ...prev, selectedUserIds: next };
    });
  };

  useEffect(() => {
    const deepLinkAction = searchParams.get('assignmentAction');
    const deepLinkUserId = searchParams.get('assignmentUserId');

    if (!deepLinkAction || !deepLinkUserId || users.length === 0) return;

    const deepLinkKey = `${deepLinkAction}:${deepLinkUserId}`;
    if (processedDeepLinkRef.current === deepLinkKey) return;
    processedDeepLinkRef.current = deepLinkKey;

    if (deepLinkAction === 'manageUserRoles') {
      const targetUser = users.find((user) => user.id === deepLinkUserId);
      if (!targetUser) {
        setError(`User with id ${deepLinkUserId} was not found for role assignment`);
        return;
      }

      setCurrentTab(1);
      setSelectedUserIds([targetUser.id]);
      openManageUserRolesDialog(targetUser);
    }
  }, [searchParams, users]);

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
      {notice && (
        <Alert severity="info" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" />
          User-Role Assignment Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            size="small"
            color="primary"
            label={`Selected ${selectedUserIds.length} users • ${selectedRoleIds.length} roles`}
          />
          <Button
            variant="contained"
            startIcon={<GroupIcon />}
            onClick={() => setBulkDialog({
              open: true,
              mode: 'assign',
              selectedUsers: selectedUserIds,
              selectedRoles: selectedRoleIds
            })}
            disabled={selectedUserIds.length === 0 || selectedRoleIds.length === 0}
          >
            Bulk Assign
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setBulkDialog({
              open: true,
              mode: 'remove',
              selectedUsers: selectedUserIds,
              selectedRoles: selectedRoleIds
            })}
            disabled={selectedUserIds.length === 0 || selectedRoleIds.length === 0}
          >
            Bulk Remove
          </Button>
          <Button
            variant="text"
            onClick={() => {
              setSelectedUserIds([]);
              setSelectedRoleIds([]);
            }}
            disabled={selectedUserIds.length === 0 && selectedRoleIds.length === 0}
          >
            Clear Selection
          </Button>
          <IconButton onClick={fetchData}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Use `Assignment Workspace` to select users and roles in one screen, then run bulk assign/remove.
      </Typography>

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
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Search Roles"
                  value={roleSearchTerm}
                  onChange={(e) => setRoleSearchTerm(e.target.value)}
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
                <FormControl fullWidth size="small">
                  <InputLabel>Approval Coverage</InputLabel>
                  <Select
                    value={approvalCoverageFilter}
                    onChange={(e) => setApprovalCoverageFilter(e.target.value as 'all' | 'can_approve' | 'no_approval')}
                    label="Approval Coverage"
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="can_approve">Can Approve</MenuItem>
                    <MenuItem value="no_approval">No Approval</MenuItem>
                  </Select>
                </FormControl>
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
            label="Assignment Workspace"
            icon={<GroupIcon />}
          />
          <Tab
            label="Users View"
            icon={<PeopleIcon />}
          />
          <Tab
            label="Roles View"
            icon={<SecurityIcon />}
          />
        </Tabs>

        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Select Users ({selectedUsers.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => handleSelectAllFilteredUsers(!allFilteredUsersSelected)}
                  >
                    {allFilteredUsersSelected ? 'Unselect All' : 'Select All Filtered'}
                  </Button>
                </Box>
                <SafeDataGrid
                  rows={filteredUsers}
                  columns={workspaceUserColumns}
                  getRowId={(row) => row.id}
                  paginationMode="client"
                  paginationModel={{ page: userPage, pageSize: userRowsPerPage }}
                  onPaginationModelChange={(model) => {
                    setUserPage(model.page);
                    setUserRowsPerPage(model.pageSize);
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                  tableStateKey="role-assignment-workspace-users-table"
                  fillAvailableHeight={false}
                  maxTableHeight={360}
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    Select Roles ({selectedRoles.length})
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => handleSelectAllFilteredRoles(!allFilteredRolesSelected)}
                  >
                    {allFilteredRolesSelected ? 'Unselect All' : 'Select All Filtered'}
                  </Button>
                </Box>
                <SafeDataGrid
                  rows={filteredRoles}
                  columns={workspaceRoleColumns}
                  getRowId={(row) => row.id}
                  paginationMode="client"
                  paginationModel={{ page: rolePage, pageSize: roleRowsPerPage }}
                  onPaginationModelChange={(model) => {
                    setRolePage(model.page);
                    setRoleRowsPerPage(model.pageSize);
                  }}
                  pageSizeOptions={[5, 10, 25]}
                  disableRowSelectionOnClick
                  tableStateKey="role-assignment-workspace-roles-table"
                  fillAvailableHeight={false}
                  maxTableHeight={360}
                />
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Assignment Preview
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  This operation will affect <strong>{selectedUsers.length * selectedRoles.length}</strong> user-role assignments.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                  {selectedUsers.slice(0, 6).map((user) => (
                    <Chip key={`preview-user-${user.id}`} size="small" label={user.fullName} />
                  ))}
                  {selectedUsers.length > 6 && (
                    <Chip size="small" variant="outlined" label={`+${selectedUsers.length - 6} users`} />
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selectedRoles.slice(0, 6).map((role) => (
                    <Chip key={`preview-role-${role.id}`} size="small" color="primary" variant="outlined" label={getRoleLabel(role)} />
                  ))}
                  {selectedRoles.length > 6 && (
                    <Chip size="small" variant="outlined" label={`+${selectedRoles.length - 6} roles`} />
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Users View Tab */}
        <TabPanel value={currentTab} index={1}>
          <SafeDataGrid
            rows={filteredUsers}
            columns={userColumns}
            getRowId={(row) => row.id}
            paginationMode="client"
            paginationModel={{ page: userPage, pageSize: userRowsPerPage }}
            onPaginationModelChange={(model) => {
              setUserPage(model.page);
              setUserRowsPerPage(model.pageSize);
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            tableStateKey="role-assignment-users-table"
            fillAvailableHeight={false}
            maxTableHeight={620}
          />
        </TabPanel>

        {/* Roles View Tab */}
        <TabPanel value={currentTab} index={2}>
          <SafeDataGrid
            rows={filteredRoles}
            columns={roleColumns}
            getRowId={(row) => row.id}
            paginationMode="client"
            paginationModel={{ page: rolePage, pageSize: roleRowsPerPage }}
            onPaginationModelChange={(model) => {
              setRolePage(model.page);
              setRoleRowsPerPage(model.pageSize);
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            tableStateKey="role-assignment-roles-table"
            fillAvailableHeight={false}
            maxTableHeight={620}
          />
        </TabPanel>
      </Paper>

      {/* User Details Dialog */}
      <Dialog
        open={userDetailsDialog.open}
        onClose={() => setUserDetailsDialog({ open: false, user: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {userDetailsDialog.user && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Name</Typography>
                  <Typography>{userDetailsDialog.user.fullName}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                  <Typography>{userDetailsDialog.user.email}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Status</Typography>
                  <Chip
                    size="small"
                    label={userDetailsDialog.user.isActive ? 'Active' : 'Inactive'}
                    color={getUserStatusColor(userDetailsDialog.user.isActive)}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Typography variant="subtitle2" color="text.secondary">Total Roles</Typography>
                  <Typography>{getAssignedRoleIdsForUser(userDetailsDialog.user).length}</Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Assigned Roles</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                {getAssignedRoleIdsForUser(userDetailsDialog.user).length === 0 ? (
                  <Typography variant="body2" color="text.secondary">No roles assigned</Typography>
                ) : (
                  getAssignedRoleIdsForUser(userDetailsDialog.user).map((roleId) => {
                    const role = roles.find((item) => item.id === roleId);
                    return (
                      <Chip
                        key={`user-detail-role-${roleId}`}
                        size="small"
                        label={getRoleLabel(role)}
                        color={role ? (getRoleTypeColor(role.type) as any) : 'default'}
                        variant="outlined"
                      />
                    );
                  })
                )}
              </Box>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Assignment Audit</Typography>
              <List dense>
                {userDetailsDialog.user.roleAssignments.filter((assignment) => assignment.isActive).length === 0 && (
                  <ListItem>
                    <ListItemText primary="No active role assignment history." />
                  </ListItem>
                )}
                {userDetailsDialog.user.roleAssignments
                  .filter((assignment) => assignment.isActive)
                  .map((assignment) => {
                    const role = roles.find((item) => item.id === assignment.roleId);
                    return (
                      <ListItem key={`user-audit-${assignment.id}`} divider>
                        <ListItemText
                          primary={getRoleLabel(role)}
                          secondary={`Assigned at: ${new Date(assignment.assignedAt).toLocaleString()}${assignment.assignedBy ? ` • By: ${assignment.assignedBy}` : ''}`}
                        />
                      </ListItem>
                    );
                  })}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between' }}>
          <Button onClick={() => setUserDetailsDialog({ open: false, user: null })}>Close</Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {userDetailsDialog.user && (
              <>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={async () => {
                    const user = userDetailsDialog.user;
                    if (!user) return;
                    try {
                      const token = localStorage.getItem('auth_token');
                      // Save original token for restore
                      localStorage.setItem('auth_token_original', token || '');
                      const baseURL = (await import('@/services/api')).api.client.defaults.baseURL || 'https://iaf-ifrs-be.danafin.com/api';
                      const res = await fetch(`${baseURL}/auth/impersonate`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ userId: user.id }),
                      });
                      const data = await res.json();
                      if (data.success && data.data?.tokens?.accessToken) {
                        localStorage.setItem('auth_token', data.data.tokens.accessToken);
                        window.location.href = '/banking/dashboard';
                      } else {
                        alert('Impersonation failed: ' + (data.message || 'Unknown error'));
                      }
                    } catch (err: any) {
                      alert('Impersonation error: ' + err.message);
                    }
                  }}
                >
                  Impersonate
                </Button>
                <Button variant="contained" onClick={() => openManageUserRolesDialog(userDetailsDialog.user!)}>
                  Manage Roles
                </Button>
              </>
            )}
          </Box>
        </DialogActions>
      </Dialog>

      {/* Manage User Roles Dialog */}
      <Dialog
        open={manageUserRolesDialog.open}
        onClose={() => setManageUserRolesDialog({ open: false, user: null, selectedRoleIds: [], saving: false, error: null, success: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {manageUserRolesDialog.user ? manageUserRolesDialog.user.fullName : 'Manage User Roles'}
              </Typography>
              {manageUserRolesDialog.user && (
                <Typography variant="body2" color="text.secondary">
                  {manageUserRolesDialog.user.email}
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {manageUserRolesDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>{manageUserRolesDialog.error}</Alert>
          )}
          {manageUserRolesDialog.success && (
            <Alert severity="success" sx={{ mb: 2 }}>Role assignment saved successfully</Alert>
          )}
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Select roles to assign or deselect roles to remove.
              <strong> {manageUserRolesDialog.selectedRoleIds.length}</strong> role{manageUserRolesDialog.selectedRoleIds.length !== 1 ? 's' : ''} selected.
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search roles..."
                variant="outlined"
                value={manageRoleSearchTerm}
                onChange={(e) => setManageRoleSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
                }}
                sx={{ minWidth: 240 }}
              />
            </Box>
          </Box>
          <SafeDataGrid
            rows={managedUserRoleRows}
            columns={managedUserRoleColumns}
            getRowId={(row) => row.id}
            paginationMode="client"
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            tableStateKey="manage-user-roles-dialog-table"
            fillAvailableHeight={false}
            maxTableHeight={380}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Box>
            {manageUserRolesDialog.user && (
              <Typography variant="caption" color="text.secondary">
                Currently assigned: {getAssignedRoleIdsForUser(manageUserRolesDialog.user).length} role{getAssignedRoleIdsForUser(manageUserRolesDialog.user).length !== 1 ? 's' : ''}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => setManageUserRolesDialog({ open: false, user: null, selectedRoleIds: [], saving: false, error: null, success: false })}>
              Cancel
            </Button>
            <Button variant="contained" onClick={saveManagedUserRoles} disabled={manageUserRolesDialog.saving}>
              {manageUserRolesDialog.saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* Manage Role Users Dialog */}
      <Dialog
        open={manageRoleUsersDialog.open}
        onClose={() => setManageRoleUsersDialog({ open: false, role: null, selectedUserIds: [], saving: false })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {manageRoleUsersDialog.role ? `Manage Users: ${getRoleLabel(manageRoleUsersDialog.role)}` : 'Manage Role Users'}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select users that should have this role assigned, then save changes.
          </Typography>
          <SafeDataGrid
            rows={managedRoleUserRows}
            columns={managedRoleUserColumns}
            getRowId={(row) => row.id}
            paginationMode="client"
            pageSizeOptions={[10, 25, 50]}
            disableRowSelectionOnClick
            tableStateKey="manage-role-users-dialog-table"
            fillAvailableHeight={false}
            maxTableHeight={420}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManageRoleUsersDialog({ open: false, role: null, selectedUserIds: [], saving: false })}>
            Cancel
          </Button>
          <Button variant="contained" onClick={saveManagedRoleUsers} disabled={manageRoleUsersDialog.saving}>
            {manageRoleUsersDialog.saving ? 'Saving...' : 'Save User Assignment'}
          </Button>
        </DialogActions>
      </Dialog>

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
                <strong>Role:</strong> {getRoleLabel(assignmentDialog.role)}
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
              onClick={handleResetPassword}
              disabled={passwordResetDialog.saving || !passwordResetDialog.newPassword || !passwordResetDialog.confirmPassword}
              startIcon={passwordResetDialog.saving ? undefined : <LockResetIcon />}
            >
              {passwordResetDialog.saving ? 'Resetting...' : 'Reset Password'}
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
                        primary={getRoleLabel(role)}
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
