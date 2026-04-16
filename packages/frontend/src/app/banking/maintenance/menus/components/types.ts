export interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  description?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  roles: string[];
  bankingModes: ('conventional' | 'syariah' | 'dual')[];
  permissions: string[];
  createdAt: string;
  updatedAt: string;
  children?: MenuItem[];
  code?: string;
  status?: 'active' | 'warning' | 'error' | 'disabled';
  is_new?: boolean;
  requires_setup?: boolean;
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  target?: '_self' | '_blank';
  external_url?: string;
  sort_order?: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
}
