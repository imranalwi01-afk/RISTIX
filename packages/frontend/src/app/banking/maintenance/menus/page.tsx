// packages/frontend/src/app/banking/maintenance/menus/page.tsx
// ============================================================================
// 🗄️ DATABASE-DRIVEN MENU MANAGEMENT INTERFACE
// ============================================================================
// ✅ UPDATED: Complete integration with menu API service
// ✅ FEATURES: Real-time data loading, admin functionality, role management
// ✅ INTEGRATION: Full database-driven operations with fallback support
// ============================================================================

'use client';

import React, { useState, useEffect, type JSX } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Tooltip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  useTheme,
  alpha
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Save,
  Cancel,
  ExpandMore,
  ExpandLess,
  Menu as MenuIcon,
  Settings,
  People,
  Visibility,
  VisibilityOff,
  DragIndicator,
  Refresh,
  Search,
  FilterList,
  AccountTree,
  Security,
  Dashboard,
  Assessment,
  Business,
  Calculate,
  TrendingUp,
  Analytics,
  CloudUpload,
  Build,
  AdminPanelSettings
} from '@mui/icons-material';

// Import our database-driven menu service
import { useRouter } from 'next/navigation';
import { getAuthToken } from '@/utils/auth-token';
import { menuApi } from '@/services/api/menu.api';

// Alias for backward compatibility with existing code
const menuService = menuApi;

// Import API service for base URL configuration
import { api } from '@/services/api';

// Types for local state management
interface MenuItem {
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
  // Database-specific fields
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

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
}

interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  isActive: boolean;
}

// Database menu item type (from API response)
interface DatabaseMenuItem {
  id: string;
  label: string;
  href?: string;
  icon?: string;
  description?: string;
  parent_id?: string;
  sort_order: number;
  is_active: boolean;
  roles?: string[];
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  created_at?: string;
  updated_at?: string;
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
}

// API request types
interface UpdateMenuItemRequest {
  label?: string;
  href?: string;
  icon?: string;
  description?: string;
  parent_id?: string | undefined;
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
  external_url?: string | undefined;
  is_active?: boolean;
}

interface CreateMenuItemRequest {
  code: string;
  label: string;
  href?: string | undefined;
  icon?: string | undefined;
  description?: string | undefined;
  parent_id?: string | undefined;
  banking_modes: ('conventional' | 'syariah' | 'dual')[];
  roles: string[];
  badge?: {
    content?: string | number;
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status: 'active' | 'warning' | 'error' | 'disabled';
  is_new: boolean;
  requires_setup: boolean;
  target?: '_self' | '_blank';
  external_url?: string | undefined;
}

export default function MenuManagement({ params }: { params: Promise<{}> }) {
  void params; // required by typed routes signature, unused in this page
  const theme = useTheme();
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataStatus, setDataStatus] = useState<{
    users: 'live' | 'fallback' | 'loading';
    roles: 'live' | 'fallback' | 'loading';
  }>({
    users: 'loading',
    roles: 'loading'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Auto-expand all menus on initial load to show hierarchy
  useEffect(() => {
    if (menus.length > 0 && expandedMenus.length === 0) {
      // Auto-expand all menu IDs to show the complete hierarchy
      const allMenuIds = menus.map(menu => menu.id);
      setExpandedMenus(allMenuIds);
      console.log('🔧 Auto-expanded all menus to show hierarchy:', allMenuIds.length, 'menus');
    }
  }, [menus]); // Only re-run when menus data changes
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);

  // Form states
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    label: '',
    href: '',
    icon: '',
    description: '',
    parentId: '',
    order: 0,
    isActive: true,
    roles: [],
    bankingModes: ['conventional'],
    permissions: []
  });

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info'
  });

  // Icon options
  const iconOptions = [
    { value: 'Dashboard', label: 'Dashboard' },
    { value: 'Settings', label: 'Settings' },
    { value: 'Category', label: 'Category' },
    { value: 'Business', label: 'Business' },
    { value: 'People', label: 'People' },
    { value: 'Visibility', label: 'Visibility' },
    { value: 'Calculate', label: 'Calculate' },
    { value: 'TrendingUp', label: 'TrendingUp' },
    { value: 'Analytics', label: 'Analytics' },
    { value: 'CloudUpload', label: 'CloudUpload' },
    { value: 'Build', label: 'Build' },
    { value: 'AdminPanelSettings', label: 'Admin Panel' },
    { value: 'Security', label: 'Security' },
    { value: 'AccountTree', label: 'Account Tree' },
    { value: 'Assessment', label: 'Assessment' }
  ];

  // Available permissions
  const availablePermissions = [
    'menu.view',
    'menu.create',
    'menu.edit',
    'menu.delete',
    'menu.activate',
    'menu.deactivate',
    'menu.reorder',
    'menu.permissions',
    'system.admin',
    'user.manage',
    'role.manage'
  ];

  // Load real banking menu structure and live user data
  useEffect(() => {
    // Load all live data on component mount
    loadRealMenuData();    // Load menu data from database
    loadLiveUserData();    // Load user data
    loadLiveRoleData();    // Load role data
  }, []);

  const loadRealMenuData = async () => {
    try {
      setLoading(true);
      showNotification('Loading menu from database...', 'info');

      // Fetch menu data from database via our menu service
      const response = await menuService.getMenuTree({ includeInactive: true });

      if (response.success && response.data) {
        console.log('🌳 Raw menu data from database:', response.data);

        // Check if we received hierarchical data (with children) or flat data
        const hasHierarchicalStructure = Array.isArray(response.data) &&
          response.data.some((item: any) => item.children && Array.isArray(item.children));

        console.log('🔍 Data structure check:', {
          isArray: Array.isArray(response.data),
          itemCount: response.data.length,
          hasChildren: hasHierarchicalStructure
        });

        let uiMenus: MenuItem[] = [];

        if (hasHierarchicalStructure) {
          // 🌳 Process hierarchical data (backend returns nested structure)
          const flattenHierarchical = (items: any[], level = 0): MenuItem[] => {
            const result: MenuItem[] = [];
            items.forEach(item => {
              const menuItem: MenuItem = {
                id: item.id,
                label: item.label || item.title,
                href: item.href || item.url,
                icon: item.icon,
                description: item.description,
                parentId: item.parent_id || item.parentId,
                order: item.sort_order || item.order || level * 10,
                isActive: item.is_active !== false,
                roles: item.roles || [],
                bankingModes: item.banking_modes || item.bankingTypes || ['conventional'],
                permissions: item.permissions || ['menu.view', 'menu.edit', 'menu.delete'],
                createdAt: item.created_at || new Date().toISOString(),
                updatedAt: item.updated_at || new Date().toISOString(),
                // Database-specific fields
                code: item.code,
                status: item.status || 'active',
                is_new: item.is_new,
                requires_setup: item.requires_setup,
                badge: item.badge,
                target: item.target,
                external_url: item.external_url,
                sort_order: item.sort_order || item.order || level * 10
              };
              result.push(menuItem);

              // Recursively process children
              if (item.children && Array.isArray(item.children)) {
                result.push(...flattenHierarchical(item.children, level + 1));
              }
            });
            return result;
          };

          uiMenus = flattenHierarchical(response.data);
          console.log('✅ Flattened hierarchical menu items:', uiMenus.length);
        } else {
          // 📋 Process flat data (backend returns flat array)
          uiMenus = (response.data as any[]).map((dbMenu: DatabaseMenuItem) => ({
            id: dbMenu.id,
            label: dbMenu.label,
            href: dbMenu.href,
            icon: dbMenu.icon,
            description: dbMenu.description,
            parentId: dbMenu.parent_id,
            order: dbMenu.sort_order,
            isActive: dbMenu.is_active,
            roles: dbMenu.roles || [],
            bankingModes: dbMenu.banking_modes || ['conventional'],
            permissions: ['menu.view', 'menu.edit', 'menu.delete'], // Default permissions
            createdAt: dbMenu.created_at || new Date().toISOString(),
            updatedAt: dbMenu.updated_at || new Date().toISOString(),
            // Database-specific fields
            code: dbMenu.code,
            status: dbMenu.status || 'active',
            is_new: dbMenu.is_new,
            requires_setup: dbMenu.requires_setup,
            badge: dbMenu.badge,
            target: dbMenu.target,
            external_url: dbMenu.external_url,
            sort_order: dbMenu.sort_order
          }));
          console.log('📋 Processed flat menu items:', uiMenus.length);
        }

        setMenus(uiMenus);
        setDataStatus(prev => ({ ...prev, menus: 'live' }));
        showNotification(`Loaded ${uiMenus.length} menu items from live database`, 'success');

        // Log hierarchy analysis
        const rootItems = uiMenus.filter(m => !m.parentId);
        const itemsWithChildren = uiMenus.filter(m => uiMenus.some(child => child.parentId === m.id));
        console.log('🌳 Menu hierarchy analysis:', {
          total: uiMenus.length,
          rootLevel: rootItems.length,
          withChildren: itemsWithChildren.length,
          hierarchyLevels: calculateHierarchyLevels(uiMenus)
        });
      } else {
        console.error('❌ Failed to load menu from database:', response);
        showNotification('Failed to load menu from database. Using fallback data.', 'warning');
        loadFallbackMenuData();
      }
    } catch (error) {
      console.error('❌ Error loading menu from database:', error);
      showNotification('Error loading menu from database. Using fallback data.', 'error');
      loadFallbackMenuData();
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate hierarchy depth
  const calculateHierarchyLevels = (menuItems: MenuItem[]): number => {
    const getDepth = (itemId: string, visited = new Set()): number => {
      if (visited.has(itemId)) return 0; // Prevent infinite loops
      visited.add(itemId);

      const children = menuItems.filter(m => m.parentId === itemId);
      if (children.length === 0) return 1;

      return 1 + Math.max(...children.map(child => getDepth(child.id, new Set(visited))));
    };

    const rootItems = menuItems.filter(m => !m.parentId);
    return Math.max(0, ...rootItems.map(item => getDepth(item.id)));
  };

  const loadFallbackMenuData = () => {
    // Fallback to hardcoded menu structure if database fails
    const realMenus: MenuItem[] = [
      // Dashboard
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/banking/dashboard',
        icon: 'Dashboard',
        description: 'IFRS 9 Pro System Overview',
        parentId: undefined,
        order: 1,
        isActive: true,
        roles: ['BANK_CRO', 'BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST', 'BANK_PORTFOLIO_MANAGER', 'BANK_DATA_ADMIN'],
        bankingModes: ['conventional', 'syariah', 'dual'],
        permissions: ['menu.view', 'dashboard.view'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        code: 'dashboard',
        status: 'active',
        is_new: false,
        requires_setup: false,
        sort_order: 1
      },
      // General Setup
      {
        id: 'general-setup',
        label: 'General Setup',
        icon: 'Settings',
        description: 'System Configuration',
        parentId: undefined,
        order: 2,
        isActive: true,
        roles: ['BANK_CRO', 'BANK_IFRS_MANAGER'],
        bankingModes: ['conventional', 'syariah', 'dual'],
        permissions: ['menu.view', 'menu.edit', 'setup.manage'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        code: 'general-setup',
        status: 'active',
        is_new: false,
        requires_setup: false,
        sort_order: 2
      },
      {
        id: 'application-setting',
        label: 'Application Setting',
        href: '/banking/setup/application',
        icon: 'Settings',
        description: '/IFRS9N/ApplicationSetting',
        parentId: 'general-setup',
        order: 1,
        isActive: true,
        roles: ['BANK_CRO', 'BANK_IFRS_MANAGER'],
        bankingModes: ['conventional', 'syariah', 'dual'],
        permissions: ['menu.view', 'menu.edit', 'setup.application'],
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-10T00:00:00Z',
        code: 'application-setting',
        status: 'active',
        is_new: false,
        requires_setup: false,
        sort_order: 1
      },
      // Add more fallback menu items as needed...
    ];

    setMenus(realMenus);
  };

  const loadLiveUserData = async () => {
    try {
      setDataStatus(prev => ({ ...prev, users: 'loading' }));

      // Use the API client's base URL for proper routing
      const baseURL = api.client.defaults.baseURL || 'http://localhost:4232/api';
      console.log('🌐 Loading live user data from:', baseURL);

      // Fetch live user data from the database via API
      const response = await fetch(`${baseURL}/user`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.data && result.data.data.users) {
          // Transform database user data to UI format
          const liveUsers: User[] = result.data.data.users.map((user: any) => ({
            id: user.id,
            name: user.name || user.customer_name || user.email,
            email: user.email,
            roles: user.roles || [],
            isActive: user.is_active !== false
          }));
          setUsers(liveUsers);
          setDataStatus(prev => ({ ...prev, users: 'live' }));
          showNotification(`Loaded ${liveUsers.length} users from live database`, 'success');
        } else {
          console.error('Invalid API response format:', result);
          showNotification('Failed to load user data: Invalid response format', 'error');
          setDataStatus(prev => ({ ...prev, users: 'fallback' }));
        }
      } else {
        console.error('API request failed:', response.status, response.statusText);
        showNotification(`Failed to load user data: ${response.statusText}`, 'error');
        setDataStatus(prev => ({ ...prev, users: 'fallback' }));
      }
    } catch (error) {
      console.error('Error loading live user data:', error);
      showNotification('Failed to load live user data. Using fallback data.', 'warning');
      // Fallback to essential users if API fails
      setUsers(getFallbackUsers());
      setDataStatus(prev => ({ ...prev, users: 'fallback' }));
    }
  };

  const loadLiveRoleData = async () => {
    try {
      setDataStatus(prev => ({ ...prev, roles: 'loading' }));

      // Use the API client's base URL for proper routing
      const baseURL = api.client.defaults.baseURL || 'http://localhost:4232/api';
      console.log('🌐 Loading live role data from:', baseURL);

      // Fetch live role data from the database via API
      const response = await fetch(`${baseURL}/roles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          // Transform database role data to UI format
          const rolesData = Array.isArray(result.data) ? result.data : (result.data.data && Array.isArray(result.data.data) ? result.data.data : []);

          const liveRoles: Role[] = rolesData.map((role: any) => ({
            id: role.id,
            name: role.name,
            description: role.description || '',
            permissions: role.permissions ? Object.values(role.permissions).flat().map((p: any) => p.code || p.id) : [],
            isActive: role.is_active !== false
          }));
          setRoles(liveRoles);
          setDataStatus(prev => ({ ...prev, roles: 'live' }));
          console.log(`Loaded ${liveRoles.length} roles from live database`);
        } else {
          console.error('Invalid role API response format:', result);
          setRoles(getFallbackRoles());
          setDataStatus(prev => ({ ...prev, roles: 'fallback' }));
        }
      } else {
        console.error('Role API request failed:', response.status);
        setRoles(getFallbackRoles());
        setDataStatus(prev => ({ ...prev, roles: 'fallback' }));
      }
    } catch (error) {
      console.error('Error loading live role data:', error);
      setRoles(getFallbackRoles());
      setDataStatus(prev => ({ ...prev, roles: 'fallback' }));
    }
  };

  const getFallbackUsers = (): User[] => [
    // Fallback users from documentation if API fails
    {
      id: '1',
      name: 'Maria Santoso',
      email: 'cro@dana.com',
      roles: ['BANK_CRO'],
      isActive: true
    },
    {
      id: '2',
      name: 'Budi Wijaya',
      email: 'ifrs.manager@dana.com',
      roles: ['BANK_IFRS_MANAGER'],
      isActive: true
    },
    {
      id: '3',
      name: 'Sari Dewi',
      email: 'risk.analyst@dana.com',
      roles: ['BANK_RISK_ANALYST'],
      isActive: true
    },
    {
      id: '4',
      name: 'Agus Rahman',
      email: 'portfolio.manager@dana.com',
      roles: ['BANK_PORTFOLIO_MANAGER'],
      isActive: true
    },
    {
      id: '5',
      name: 'Lina Kusuma',
      email: 'data.admin@dana.com',
      roles: ['BANK_DATA_ADMIN'],
      isActive: true
    }
  ];

  const getFallbackRoles = (): Role[] => [
    // Fallback roles if API fails
    {
      id: 'BANK_CRO',
      name: 'Bank CRO',
      description: 'Chief Risk Officer - Full system access',
      permissions: availablePermissions,
      isActive: true
    },
    {
      id: 'BANK_IFRS_MANAGER',
      name: 'IFRS Manager',
      description: 'IFRS 9 Manager - Advanced access',
      permissions: [
        'menu.view', 'menu.edit', 'menu.create', 'menu.delete',
        'dashboard.view', 'setup.manage', 'parameters.manage',
        'portfolio.manage', 'impairment.collective', 'impairment.individual',
        'ifrs9.process', 'reports.ifrs9', 'workflow.manage',
        'analytics.advanced', 'tools.use', 'maintenance.admin'
      ],
      isActive: true
    },
    {
      id: 'BANK_RISK_ANALYST',
      name: 'Risk Analyst',
      description: 'Risk Analysis Specialist',
      permissions: [
        'menu.view', 'dashboard.view', 'parameters.manage',
        'portfolio.monitor', 'impairment.collective', 'impairment.individual',
        'ifrs9.process', 'reports.ifrs9', 'workflow.monitoring',
        'analytics.advanced', 'tools.use'
      ],
      isActive: true
    }
  ];


  const handleToggleExpand = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleEdit = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setFormData({
      label: menu.label,
      href: menu.href || '',
      icon: menu.icon || '',
      description: menu.description || '',
      parentId: menu.parentId || '',
      order: menu.order,
      isActive: menu.isActive,
      roles: menu.roles,
      bankingModes: menu.bankingModes,
      permissions: menu.permissions
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setDeleteDialogOpen(true);
  };

  const handlePermissions = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setPermissionDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedMenu) {
        // Update existing menu item
        const updateData: UpdateMenuItemRequest = {
          label: formData.label || selectedMenu.label,
          href: formData.href || selectedMenu.href,
          icon: formData.icon || selectedMenu.icon,
          description: formData.description || selectedMenu.description,
          parent_id: formData.parentId || selectedMenu.parentId,
          banking_modes: formData.bankingModes || selectedMenu.bankingModes,
          roles: formData.roles || selectedMenu.roles,
          badge: formData.badge,
          status: formData.status || selectedMenu.status,
          is_new: formData.is_new !== undefined ? formData.is_new : selectedMenu.is_new,
          requires_setup: formData.requires_setup !== undefined ? formData.requires_setup : selectedMenu.requires_setup,
          target: formData.target || selectedMenu.target,
          external_url: formData.external_url || selectedMenu.external_url,
          is_active: formData.isActive !== undefined ? formData.isActive : selectedMenu.isActive
        };

        const response = await menuService.updateMenuItem(selectedMenu.id, updateData);
        if (response.success) {
          // Update local state with response data
          const updatedMenu = {
            ...selectedMenu,
            ...formData,
            updatedAt: new Date().toISOString()
          } as MenuItem;

          setMenus(prev => prev.map(menu =>
            menu.id === selectedMenu.id ? updatedMenu : menu
          ));

          setEditDialogOpen(false);
          setSelectedMenu(null);
          setFormData({});
          showNotification('Menu updated successfully', 'success');
        } else {
          showNotification('Failed to update menu', 'error');
        }
      } else {
        // Create new menu item
        const createData: CreateMenuItemRequest = {
          code: formData.code || `menu_${Date.now()}`,
          label: formData.label || 'New Menu',
          href: formData.href,
          icon: formData.icon,
          description: formData.description,
          parent_id: formData.parentId,
          banking_modes: formData.bankingModes || ['conventional'],
          roles: formData.roles || [],
          badge: formData.badge,
          status: formData.status || 'active',
          is_new: formData.is_new || false,
          requires_setup: formData.requires_setup || false,
          target: formData.target,
          external_url: formData.external_url
        };

        const response = await menuService.createMenuItem(createData);
        if (response.success) {
          // Add new menu to local state
          const newMenu = {
            id: response.data.id,
            label: response.data.label,
            href: response.data.href,
            icon: response.data.icon,
            description: response.data.description,
            parentId: response.data.parent_id,
            order: response.data.sort_order,
            isActive: response.data.is_active,
            roles: response.data.roles || [],
            bankingModes: response.data.banking_modes || ['conventional'],
            permissions: ['menu.view', 'menu.edit', 'menu.delete'],
            createdAt: response.data.created_at || new Date().toISOString(),
            updatedAt: response.data.updated_at || new Date().toISOString(),
            code: response.data.code,
            status: response.data.status || 'active',
            is_new: response.data.is_new,
            requires_setup: response.data.requires_setup,
            badge: response.data.badge,
            target: response.data.target,
            external_url: response.data.external_url,
            sort_order: response.data.sort_order
          } as MenuItem;

          setMenus(prev => [...prev, newMenu]);

          setEditDialogOpen(false);
          setSelectedMenu(null);
          setFormData({});
          showNotification('Menu created successfully', 'success');
        } else {
          showNotification('Failed to create menu', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving menu:', error);
      showNotification('Error saving menu', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedMenu) {
      try {
        const response = await menuService.deleteMenuItem(selectedMenu.id);
        if (response.success) {
          setMenus(prev => prev.filter(menu => menu.id !== selectedMenu.id));
          setDeleteDialogOpen(false);
          setSelectedMenu(null);
          showNotification('Menu deleted successfully', 'success');
        } else {
          showNotification('Failed to delete menu', 'error');
        }
      } catch (error) {
        console.error('Error deleting menu:', error);
        showNotification('Error deleting menu', 'error');
      }
    }
  };

  const handleToggleActive = async (menu: MenuItem) => {
    try {
      const updateData: UpdateMenuItemRequest = {
        is_active: !menu.isActive
      };

      const response = await menuService.updateMenuItem(menu.id, updateData);
      if (response.success) {
        const updatedMenu = {
          ...menu,
          isActive: !menu.isActive,
          updatedAt: new Date().toISOString()
        };
        setMenus(prev => prev.map(m => m.id === menu.id ? updatedMenu : m));
        showNotification(`Menu ${updatedMenu.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        showNotification('Failed to toggle menu status', 'error');
      }
    } catch (error) {
      console.error('Error toggling menu status:', error);
      showNotification('Error toggling menu status', 'error');
    }
  };

  const handleInitializeMenuStructure = async () => {
    try {
      showNotification('Initializing default menu structure...', 'info');
      const response = await menuService.initializeMenuStructure();

      if (response.success) {
        showNotification('Default menu structure initialized successfully', 'success');
        // Reload menu data to show the newly created structure
        await loadRealMenuData();
      } else {
        showNotification('Failed to initialize menu structure', 'error');
      }
    } catch (error) {
      console.error('Error initializing menu structure:', error);
      showNotification('Error initializing menu structure', 'error');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
    setNotification({ open: true, message, severity });
  };

  const renderMenuItem = (menu: MenuItem, level: number = 0): JSX.Element => {
    const hasChildren = menus.filter(m => m.parentId === menu.id).length > 0;
    const isExpanded = expandedMenus.includes(menu.id);

    return (
      <Box key={menu.id} sx={{ ml: level * 2 }}>
        <Card sx={{ mb: 1, bgcolor: menu.isActive ? 'background.paper' : alpha(theme.palette.action.disabled, 0.1) }}>
          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {hasChildren && (
                  <IconButton size="small" onClick={() => handleToggleExpand(menu.id)}>
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                )}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {menu.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {menu.description}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {menu.roles.map(roleId => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? (
                      <Chip
                        key={roleId}
                        label={role.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ) : null;
                  })}
                </Box>

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {menu.bankingModes.map(mode => (
                    <Chip
                      key={mode}
                      label={mode}
                      size="small"
                      color={mode === 'syariah' ? 'success' : mode === 'dual' ? 'warning' : 'primary'}
                      variant="filled"
                    />
                  ))}
                </Box>

                <Tooltip title="Edit Menu">
                  <IconButton size="small" onClick={() => handleEdit(menu)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Manage Permissions">
                  <IconButton size="small" onClick={() => handlePermissions(menu)}>
                    <Security fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title={menu.isActive ? 'Deactivate' : 'Activate'}>
                  <IconButton size="small" onClick={() => handleToggleActive(menu)}>
                    {menu.isActive ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Delete Menu">
                  <IconButton size="small" onClick={() => handleDelete(menu)} color="error">
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {hasChildren && isExpanded && (
          <Box sx={{
            mt: 1,
            ml: 3,
            pl: 2,
            borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}>
            {menus
              .filter(m => m.parentId === menu.id)
              .sort((a, b) => a.order - b.order)
              .map(child => renderMenuItem(child, level + 1))}
          </Box>
        )}
      </Box>
    );
  };

  const filteredMenus = menus.filter(menu =>
    (menu.label?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (menu.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  // Advanced menu management functions
  const initializeMenuStructure = async () => {
    try {
      setLoading(true);
      console.log('🏗️ Initializing default menu structure...');

      const response = await menuService.initializeMenuStructure();

      if (response.success) {
        showNotification('Default menu structure initialized successfully', 'success');
        await loadRealMenuData(); // Reload menu data after initialization
      } else {
        showNotification('Failed to initialize menu structure', 'error');
      }
    } catch (error) {
      console.error('❌ Error initializing menu structure:', error);
      showNotification('Error initializing menu structure', 'error');
    } finally {
      setLoading(false);
    }
  };

  const testMenuConfiguration = () => {
    const testResults = {
      passed: true,
      issues: [] as string[],
      stats: {
        total: menus.length,
        active: menus.filter(m => m.isActive).length,
        withUrls: menus.filter(m => m.href).length,
        withRoles: menus.filter(m => m.roles && m.roles.length > 0).length,
        rootLevel: menus.filter(m => !m.parentId).length
      }
    };

    // Check for configuration issues
    if (testResults.stats.active === 0) {
      testResults.passed = false;
      testResults.issues.push('No active menu items found');
    }

    if (testResults.stats.rootLevel === 0) {
      testResults.passed = false;
      testResults.issues.push('No root level menu items found');
    }

    if (testResults.stats.withUrls === 0) {
      testResults.issues.push('No menu items with URLs found');
    }

    // Check for duplicate HREFs
    const hrefs = menus.filter(m => m.href).map(m => m.href);
    const duplicateHrefs = hrefs.filter((href, index) => hrefs.indexOf(href) !== index);
    if (duplicateHrefs.length > 0) {
      testResults.passed = false;
      testResults.issues.push(`Duplicate URLs found: ${duplicateHrefs.join(', ')}`);
    }

    // Check for orphaned menu items
    const parentIds = new Set(menus.filter(m => m.parentId).map(m => m.parentId));
    const orphanedItems = menus.filter(m => m.parentId && !parentIds.has(m.parentId));
    if (orphanedItems.length > 0) {
      testResults.issues.push(`Orphaned menu items: ${orphanedItems.map(m => m.label).join(', ')}`);
    }

    console.log('🔍 Menu Configuration Test Results:', testResults);
    return testResults;
  };

  const getMenuStatistics = () => {
    const stats = {
      total: menus.length,
      active: menus.filter(m => m.isActive).length,
      inactive: menus.filter(m => !m.isActive).length,
      rootLevel: menus.filter(m => !m.parentId).length,
      childItems: menus.filter(m => m.parentId).length,
      withUrls: menus.filter(m => m.href).length,
      withoutUrls: menus.filter(m => !m.href).length,
      byBankingMode: {
        conventional: menus.filter(m => m.bankingModes?.includes('conventional')).length,
        syariah: menus.filter(m => m.bankingModes?.includes('syariah')).length,
        dual: menus.filter(m => m.bankingModes?.includes('dual')).length
      },
      byStatus: {
        active: menus.filter(m => m.status === 'active').length,
        warning: menus.filter(m => m.status === 'warning').length,
        error: menus.filter(m => m.status === 'error').length,
        disabled: menus.filter(m => m.status === 'disabled').length
      },
      uniqueRoles: Array.from(new Set(menus.flatMap(m => m.roles || []))),
      roleCoverage: {} as Record<string, number>
    };

    // Calculate role coverage
    stats.uniqueRoles.forEach(role => {
      stats.roleCoverage[role] = menus.filter(m => m.roles?.includes(role)).length;
    });

    return stats;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
          <MenuIcon color="primary" />
          Menu Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={loading ? <Refresh /> : <Refresh />}
            onClick={() => {
              loadRealMenuData();
              loadLiveUserData();
              loadLiveRoleData();
            }}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={handleInitializeMenuStructure}
            disabled={loading}
          >
            Initialize Default Structure
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedMenu(null);
              setFormData({
                label: '',
                href: '',
                icon: '',
                description: '',
                parentId: '',
                order: menus.length + 1,
                isActive: true,
                roles: [],
                bankingModes: ['conventional'],
                permissions: ['menu.view'],
                code: '',
                status: 'active',
                is_new: false,
                requires_setup: false,
                sort_order: menus.length + 1
              });
              setEditDialogOpen(true);
            }}
          >
            Add Menu
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'primary.main', borderRadius: 1 }}>
                  <MenuIcon sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4">{menus.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Menus</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'success.main', borderRadius: 1 }}>
                  <Visibility sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4">{menus.filter(m => m.isActive).length}</Typography>
                  <Typography variant="caption" color="text.secondary">Active Menus</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ p: 1, bgcolor: 'warning.main', borderRadius: 1 }}>
                  <People sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4">{roles.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Roles</Typography>
                  {dataStatus.roles === 'live' && (
                    <Chip
                      label="LIVE DB"
                      size="small"
                      color="success"
                      sx={{ ml: 1 }}
                    />
                  )}
                  {dataStatus.roles === 'fallback' && (
                    <Chip
                      label="FALLBACK"
                      size="small"
                      color="warning"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1, bgcolor: 'info.main', borderRadius: 1 }}>
                  <Security sx={{ color: 'white' }} />
                </Box>
                <Box>
                  <Typography variant="h4">{users.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder="Search menus..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => showNotification('Advanced filters coming soon', 'info')}
            >
              Filter
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Menu Statistics Dashboard */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Menu Statistics & Analytics
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={loadRealMenuData}
              size="small"
              variant="outlined"
            >
              Refresh
            </Button>
          </Box>

          <Grid container spacing={3}>
            {/* Total Menu Items */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.05)
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MenuIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {menus.length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Total Menu Items
                </Typography>
              </Box>
            </Grid>

            {/* Active Items */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.05)
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Visibility sx={{ mr: 1, color: 'success.main' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {menus.filter(m => m.isActive).length}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Active Items
                </Typography>
              </Box>
            </Grid>

            {/* Items by Banking Mode */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.warning.main, 0.05)
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Banking Mode Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Chip label={`Conventional: ${menus.filter(m => m.bankingModes?.includes('conventional')).length}`} size="small" />
                  <Chip label={`Syariah: ${menus.filter(m => m.bankingModes?.includes('syariah')).length}`} size="small" />
                  <Chip label={`Dual: ${menus.filter(m => m.bankingModes?.includes('dual')).length}`} size="small" />
                </Box>
              </Box>
            </Grid>

            {/* Role Coverage */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Box sx={{
                p: 2,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05)
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Role Coverage
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {Array.from(new Set(menus.flatMap(m => m.roles || []))).length} unique roles
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Across all menu items
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: alpha(theme.palette.background.paper, 0.5), borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                startIcon={<Add />}
                onClick={() => {
                  setSelectedMenu(null);
                  setFormData({
                    label: '',
                    href: '',
                    icon: '',
                    description: '',
                    parentId: '',
                    order: menus.length + 1,
                    isActive: true,
                    roles: [],
                    bankingModes: ['conventional'],
                    permissions: []
                  });
                  setEditDialogOpen(true);
                }}
                variant="contained"
                size="small"
              >
                Add Root Menu
              </Button>

              <Button
                startIcon={<AccountTree />}
                onClick={() => {
                  setExpandedMenus(
                    expandedMenus.length === menus.filter(m => !m.parentId).length
                      ? []
                      : menus.filter(m => !m.parentId).map(m => m.id)
                  );
                }}
                variant="outlined"
                size="small"
              >
                {expandedMenus.length > 0 ? 'Collapse All' : 'Expand All'}
              </Button>

              <Button
                startIcon={<Settings />}
                onClick={initializeMenuStructure}
                variant="outlined"
                size="small"
                color="secondary"
              >
                Initialize Default Menu
              </Button>

              <Button
                startIcon={<Security />}
                onClick={() => {
                  const testResults = testMenuConfiguration();
                  showNotification(`Menu configuration test: ${testResults.passed ? 'PASSED' : 'FAILED'}`, testResults.passed ? 'success' : 'warning');
                }}
                variant="outlined"
                size="small"
                color="info"
              >
                Test Configuration
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menu Tree */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Menu Structure
          </Typography>
          <Box>
            {filteredMenus
              .filter(menu => !menu.parentId)
              .sort((a, b) => a.order - b.order)
              .map(menu => renderMenuItem(menu))}
          </Box>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedMenu ? 'Edit Menu' : 'Add New Menu'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Menu Label"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Menu URL (optional)"
                value={formData.href}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Autocomplete
                fullWidth
                options={iconOptions}
                value={iconOptions.find(opt => opt.value === formData.icon)}
                onChange={(event, value) => setFormData({ ...formData, icon: value?.value || '' })}
                renderInput={(params) => <TextField {...params as any} label="Icon" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label="Order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Parent Menu</InputLabel>
                <Select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  label="Parent Menu"
                >
                  <MenuItem value="">None (Root Menu)</MenuItem>
                  {menus
                    .filter(menu => !menu.parentId)
                    .map(menu => (
                      <MenuItem key={menu.id} value={menu.id}>
                        {menu.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={formData.roles}
                  onChange={(e) => setFormData({ ...formData, roles: e.target.value as string[] })}
                  label="Roles"
                >
                  {roles.map(role => (
                    <MenuItem key={role.id} value={role.id}>
                      {role.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Banking Modes</InputLabel>
                <Select
                  multiple
                  value={formData.bankingModes}
                  onChange={(e) => setFormData({ ...formData, bankingModes: e.target.value as ('conventional' | 'syariah' | 'dual')[] })}
                  label="Banking Modes"
                >
                  <MenuItem value="conventional">Conventional</MenuItem>
                  <MenuItem value="syariah">Syariah</MenuItem>
                  <MenuItem value="dual">Dual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Permissions</InputLabel>
                <Select
                  multiple
                  value={formData.permissions}
                  onChange={(e) => setFormData({ ...formData, permissions: e.target.value as string[] })}
                  label="Permissions"
                >
                  {availablePermissions.map(permission => (
                    <MenuItem key={permission} value={permission}>
                      {permission}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Menu</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete "{selectedMenu?.label}"? This action cannot be undone.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionDialogOpen} onClose={() => setPermissionDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Permissions - {selectedMenu?.label}</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Menu Permissions
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Access</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          {user.roles.map(roleId => {
                            const role = roles.find(r => r.id === roleId);
                            return role ? (
                              <Chip key={roleId} label={role.name} size="small" />
                            ) : null;
                          })}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={selectedMenu?.roles.some(roleId => user.roles.includes(roleId)) ? 'Has Access' : 'No Access'}
                          color={selectedMenu?.roles.some(roleId => user.roles.includes(roleId)) ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Button size="small" variant="outlined">
                          Manage
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPermissionDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
