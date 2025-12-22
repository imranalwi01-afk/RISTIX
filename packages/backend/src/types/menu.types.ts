// packages/backend/src/types/menu.types.ts
// Menu type definitions for the IAF project

export interface MenuItem {
  id: string;
  code: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  level: number;
  path: string;
  is_active: boolean;
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  roles?: string[];
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled';
  is_new?: boolean;
  requires_setup?: boolean;
  target?: '_self' | '_blank';
  external_url?: string;
  created_by?: string;
  updated_by?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateMenuItemRequest {
  code: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  roles?: string[];
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled';
  is_new?: boolean;
  requires_setup?: boolean;
  target?: '_self' | '_blank';
  external_url?: string;
  created_by?: string;
}

export interface UpdateMenuItemRequest {
  label?: string;
  href?: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  roles?: string[];
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled';
  is_new?: boolean;
  requires_setup?: boolean;
  target?: '_self' | '_blank';
  external_url?: string;
  is_active?: boolean;
  updated_by?: string;
}

export interface MenuQueryRequest {
  userRole?: string;
  bankingMode?: 'conventional' | 'syariah' | 'dual';
  includeInactive?: boolean;
  parentId?: string;
  level?: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface ReorderMenuItemsRequest {
  items: Array<{
    id: string;
    sort_order: number;
  }>;
}

export interface RoleMenuAccessRequest {
  role_id: string;
  menu_item_id: string;
  can_view: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  created_by?: string;
}

export interface MenuConfigurationRequest {
  key: string;
  value: any;
  type?: 'string' | 'number' | 'boolean' | 'json';
  category?: 'general' | 'appearance' | 'behavior' | 'security';
  description?: string;
  is_encrypted?: boolean;
  created_by?: string;
}

export interface MenuHierarchyResponse {
  id: string;
  code: string;
  label: string;
  href?: string;
  description?: string;
  icon?: string;
  parent_id?: string;
  sort_order: number;
  level: number;
  path: string;
  is_active: boolean;
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  roles?: string[];
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled';
  is_new?: boolean;
  requires_setup?: boolean;
  target?: '_self' | '_blank';
  external_url?: string;
  children?: MenuHierarchyResponse[];
  created_at?: Date;
  updated_at?: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  meta?: {
    timestamp: string;
    requestId?: string;
    tenantId?: string;
  };
}

export interface PaginatedResponse<T = any> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}