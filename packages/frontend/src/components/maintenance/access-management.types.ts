// packages/frontend/src/components/maintenance/access-management.types.ts
import type { GridColDef } from '@mui/x-data-grid';

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'SYSTEM' | 'BANKING' | 'CUSTOM';
  level: 'PLATFORM' | 'TENANT' | 'DEPARTMENT';
  isActive: boolean;
  isBuiltIn: boolean;
  permissions: Permission[];
  assignedUsers: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Permission {
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
}

export interface PermissionCategory {
  name: string;
  displayName: string;
  permissions: Permission[];
}

export interface PermissionMatrixItem {
  permission: Permission;
  fullKey: string;
  categoryKey: string;
  groupKey: string;
  actionKey: string;
}

export interface PermissionMatrixGroup {
  key: string;
  label: string;
  permissions: PermissionMatrixItem[];
}

export interface PermissionMatrixCategory {
  key: string;
  label: string;
  groups: PermissionMatrixGroup[];
}

export type PermissionGroupingMode = 'resource' | 'module' | 'category';

export interface PermissionSelectionGroup {
  key: string;
  label: string;
  hint: string;
  permissions: Permission[];
}

export const TAB_KEY_TO_INDEX: Record<string, number> = {
  roles: 0,
  users: 1,
  permissions: 2,
  matrix: 2,
  assignments: 1,
  'access-review': 2,
};

export const TAB_INDEX_TO_KEY = ['roles', 'users', 'access-review'] as const;
export const ACCESS_MANAGEMENT_BASE_PATH = '/banking/maintenance/access-management';

export interface RoleFilters {
  type?: string;
  level?: string;
  isActive?: boolean;
  searchTerm?: string;
}

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}
