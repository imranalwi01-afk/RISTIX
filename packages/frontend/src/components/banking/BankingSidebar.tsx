// packages/frontend/src/components/banking/BankingSidebar.tsx
// ============================================================================
// 🔄 DATABASE-DRIVEN HIERARCHICAL MENU SYSTEM
// ============================================================================
// ✅ UPDATED: Hierarchical menu rendering with parent-child relationships
// ✅ PRESERVED: All existing functionality and responsive behavior
// ✅ ENHANCED: Proper tree navigation with expand/collapse functionality
// ✅ FALLBACK: Static menu structure when database unavailable
// ============================================================================

'use client';

import React, { useState, useEffect, useRef } from 'react';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

// ✅ REAL-TIME DB SYNC: Import health monitoring hook
import { useBackendHealth } from '../../hooks/useBackendHealth';


import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  Divider,
  Chip,
  Avatar,
  Badge,
  Tooltip,
  alpha,
  useTheme,
  CircularProgress // ✅ Import CircularProgress
} from '@mui/material';
import {
  // Core Navigation & Layout
  Dashboard,
  Settings,
  Category,
  ExpandLess,
  ExpandMore,
  CheckCircle,
  Warning,
  Error,

  // Business & Banking
  AccountBalance,
  Business,
  Assessment,
  People,
  Visibility,
  AccountCircle,

  // IFRS9 & Calculations
  Calculate,
  TrendingUp,
  Person,
  Timeline,
  Layers,
  Functions,
  MonetizationOn,

  // Banking Operations
  Mosque,
  Security,
  SwapHoriz,
  CurrencyExchange,

  // Analytics & Reporting
  Analytics,
  AutoGraph,
  ShowChart,
  TableChart,
  Speed,
  CloudDownload,

  // Workflow & Process
  AccountTree,
  Approval,
  Monitor,
  Schedule,
  NotificationImportant,
  History,

  // Tools & Utilities
  CloudUpload,
  GetApp,
  Transform,
  Storage,

  // Admin & Maintenance
  AdminPanelSettings,
  SupervisorAccount,
  ManageAccounts,
  HistoryToggleOff,
  Task,
  Menu,

  // Additional icons
  BarChart,
  PieChart,
  InsertChart,
  DataUsage,
  TableView,
  ViewModule,
  Build,
  Engineering,
  Computer,
  Memory,
  GroupWork,
  PermIdentity,
  VpnKey,

  // Loading and error icons
  Refresh,
  ErrorOutline,

  MenuBook,
  Folder,
  Description,
} from '@mui/icons-material';

import { Menu as MuiMenu, MenuItem as MuiMenuItem } from '@mui/material'; // ✅ Import Menu components

// Import menu service for database-driven menus
import { useGetMenuTreeQuery } from '@/store/api/menuApi';

// Import centralized menu configuration
import { menuConfig, getMenuIcon } from '@/config/menu-config';

// Import hierarchical menu utilities
import {
  transformFlatToHierarchical,
  findMenuItemByPath,
  filterHierarchicalMenu,
  HierarchicalMenuItem,
  validateMenuHierarchy
} from '@/utils/menu-hierarchy';

// Import menu state management hook
import { useMenuState } from '@/hooks/useMenuState';
import { getAuthToken } from '@/utils/auth-token'; // ✅ Import token utility
import { MenuSkeleton } from '../common/MenuSkeleton'; // ✅ Import Skeleton loader

// Database menu item structure (from API)
interface DatabaseMenuItem {
  id: string;
  key?: string;
  menu_key?: string; // Backend field name for menu key
  title?: string;
  label?: string; // Alternative field name for title
  description?: string;
  icon?: string;
  url?: string;
  href?: string; // Alternative field name for URL
  type?: string;
  sort_order?: number;
  is_active?: boolean;
  user_types?: string[];
  roles?: string[]; // Alternative field name for user types
  banking_types?: string[];
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  parent_id?: string | null;
  children?: DatabaseMenuItem[];
  created_at?: string;
  updated_at?: string;
  isNew?: boolean;
  requires_setup?: boolean;
  requiresSetup?: boolean;
  badge_info?: {
    content?: string | number;
    color?: string;
  };
}

// Menu structure (for UI components)
interface MenuItem {
  id: string;
  code?: string; // Optional for static menu compatibility
  label: string;
  isActive?: boolean;
  href?: string;
  icon: React.ReactElement;
  description?: string;
  parent_id?: string | null;
  sort_order?: number; // Optional for static menu compatibility
  level?: number; // Optional for static menu compatibility
  path?: string; // Optional for static menu compatibility
  children?: MenuItem[];
  roles?: string[];
  banking_modes?: ('conventional' | 'syariah' | 'dual')[];
  badge?: {
    content: string | number;
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled'; // Optional for static menu compatibility
  isNew?: boolean;
  requiresSetup?: boolean;
  target?: '_self' | '_blank';
  external_url?: string;
}

// IAF-SPECIFIC SITEMAP STRUCTURE - Based on IAF Navigation Requirements
const BANKING_MENU_STRUCTURE: MenuItem[] = [
  {
    id: 'dashboard',
    code: 'dashboard',
    label: 'Dashboard',
    href: '/banking/dashboard',
    icon: <Dashboard />,
    description: 'IFRS 9 System Overview',
    sort_order: 1,
    level: 1,
    path: '/dashboard',
    isActive: true,
    status: 'active'
  },

  // CORE SYSTEM SETUP
  {
    id: 'system-setup',
    code: 'system-setup',
    label: 'System Setup',
    icon: <Settings />,
    description: 'Core System Configuration',
    sort_order: 2,
    level: 1,
    path: '/system-setup',
    isActive: true,
    status: 'active',
    children: [
      {
        id: 'application-configuration',
        code: 'application-configuration',
        label: 'Application Configuration',
        href: '/banking/setup/application',
        icon: <Settings />,
        description: 'System-wide Application Settings',
        sort_order: 3,
        level: 2,
        path: '/application-configuration',
        isActive: true,
        status: 'active'
      },
      {
        id: 'business-configuration',
        code: 'business-configuration',
        label: 'Business Configuration',
        href: '/banking/setup/business',
        icon: <Business />,
        description: 'Business Rules & Parameters',
        sort_order: 4,
        level: 2,
        path: '/business-configuration',
        isActive: true,
        status: 'active'
      }
    ]
  },

  // PARAMETER MANAGEMENT
  {
    id: 'parameter-management',
    code: 'parameter-management',
    label: 'Parameter Management',
    icon: <Category />,
    description: 'Banking Parameters & Configuration',
    sort_order: 5,
    level: 1,
    path: '/parameter-management',
    isActive: true,
    status: 'active',
    children: [
      {
        id: 'product-parameters',
        code: 'product-parameters',
        label: 'Product Parameters',
        href: '/banking/parameters/product',
        icon: <AccountBalance />,
        description: 'Banking Product Configuration',
        sort_order: 6,
        level: 2,
        path: '/product-parameters',
        isActive: true,
        status: 'active'
      },
      {
        id: 'accounting-parameters',
        code: 'accounting-parameters',
        label: 'Accounting Parameters',
        href: '/banking/parameters/journal',
        icon: <Assessment />,
        description: 'Journal & GL Configuration',
        sort_order: 7,
        level: 2,
        path: '/accounting-parameters',
        isActive: true,
        status: 'active'
      },
      {
        id: 'risk-parameters',
        code: 'risk-parameters',
        label: 'Risk Parameters',
        href: '/banking/parameters/risk',
        icon: <TrendingUp />,
        description: 'Risk Assessment Parameters',
        sort_order: 8,
        level: 2,
        path: '/risk-parameters',
        isActive: true,
        status: 'active'
      }
    ]
  },

  // PORTFOLIO MANAGEMENT
  {
    id: 'portfolio-management',
    label: 'Portfolio Management',
    icon: <Business />,
    description: 'Banking Operations',
    children: [
      {
        id: 'portfolio-accounts',
        label: 'Portfolio Accounts',
        href: '/banking/portfolio/accounts',
        icon: <AccountCircle />,
        description: 'Account Management'
      },
      {
        id: 'customer-management',
        label: 'Customer Management',
        href: '/banking/portfolio/customers',
        icon: <People />,
        description: 'Client Information'
      },
      {
        id: 'banking-products',
        label: 'Banking Products',
        href: '/banking/portfolio/products',
        icon: <AccountBalance />,
        description: 'Product Configuration'
      },
      {
        id: 'portfolio-monitoring',
        label: 'Portfolio Monitoring',
        href: '/banking/portfolio/overview',
        icon: <Visibility />,
        description: 'Real-time Tracking'
      }
    ]
  },

  // COLLECTIVE IMPAIRMENT
  {
    id: 'collective-impairment',
    label: 'Collective Impairment',
    icon: <TrendingUp />,
    description: 'Portfolio Assessment',
    banking_modes: ['conventional', 'syariah', 'dual'],
    roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER'],
    children: [
      {
        id: 'segmentation-configuration',
        label: 'Segmentation Configuration',
        href: '/banking/collective/segmentation',
        icon: <Category />,
        description: '/IFRS9N/ParamSegment'
      },
      {
        id: 'rule-base-setting',
        label: 'Rule Base Setting',
        href: '/banking/collective/rule-base',
        icon: <Assessment />,
        description: '/IFRS9N/ParamScenarioRules'
      },
      {
        id: 'bucket-parameter',
        label: 'Bucket Parameter',
        href: '/banking/collective/bucket-parameter',
        icon: <Layers />,
        description: '/IFRS9N/ParamBucket'
      },
      {
        id: 'pd-setup-management',
        label: 'PD Setup Management',
        href: '/banking/collective/pd-setup',
        icon: <TrendingUp />,
        description: '/IFRS9N/PDConfig'
      },
      // 🚫 DISABLED: FL Scalar menu item - Temporarily hidden
      // {
      //   id: 'fl-scalar',
      //   label: 'FL Scalar',
      //   href: '/banking/collective/fl-scalar',
      //   icon: <Functions />,
      //   description: '/IFRS9N/FLScalar'
      // },
      {
        id: 'lgd-setup-management',
        label: 'LGD Setup Management',
        href: '/banking/collective/lgd-setup',
        icon: <MonetizationOn />,
        description: '/IFRS9N/LGDConfig'
      },
      {
        id: 'ead-setup-management',
        label: 'EAD Setup Management',
        href: '/banking/collective/ead-setup',
        icon: <AccountBalance />,
        description: '/IFRS9N/EADConfig'
      },
      {
        id: 'ecl-configuration',
        label: 'ECL Configuration',
        href: '/banking/collective/ecl-config',
        icon: <Calculate />,
        description: '/IFRS9N/ECLConfig'
      }
    ]
  },

  // INDIVIDUAL IMPAIRMENT
  {
    id: 'individual-impairment',
    label: 'Individual Impairment',
    icon: <Person />,
    description: 'Account Assessment',
    banking_modes: ['conventional', 'syariah', 'dual'],
    roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_PORTFOLIO_MANAGER'],
    children: [
      {
        id: 'assessment-override',
        label: 'Assessment Override',
        href: '/banking/individual/assessment',
        icon: <Assessment />,
        description: '/IFRS9N/IndividualImpairment/AssesmentOverride'
      },
      {
        id: 'list-individual-report',
        label: 'List of Individual Report',
        href: '/banking/individual/reports',
        icon: <TableChart />,
        description: 'View and download individual reports',
        isNew: true
      },
      {
        id: 'review-scenario',
        label: 'Review Scenario Details',
        href: '/banking/individual/review/scenario',
        icon: <Approval />,
        description: 'Analyze and approve scenarios',
        isNew: true
      },
      {
        id: 'review-dcf-upload',
        label: 'Review DCF Upload',
        href: '/banking/individual/review/dcf-upload-report',
        icon: <CloudUpload />,
        description: 'Validation results for DCF uploads',
        isNew: true
      },
      {
        id: 'ia-dcf-detail',
        label: 'Review IA DCF Detail',
        href: '/banking/individual/review/ia-dcf-detail',
        icon: <ShowChart />,
        description: 'Detail view of cash flow projections',
        isNew: true
      },
      {
        id: 'override-history',
        label: 'Override History',
        href: '/banking/individual/history',
        icon: <History />,
        description: 'Audit trail for overrides',
        children: [
          { id: 'hist-customer', label: 'Customer Details', href: '/banking/individual/history/customer', icon: <Person /> },
          { id: 'hist-provision', label: 'IA Provision', href: '/banking/individual/history/provision', icon: <AccountBalance /> },
          { id: 'hist-dcf', label: 'DCF Upload', href: '/banking/individual/history/dcf-upload', icon: <CloudUpload /> },
          { id: 'hist-collateral', label: 'Collateral', href: '/banking/individual/history/collateral', icon: <Security /> }
        ]
      }
    ]
  },

  // IFRS 9 PROCESSING
  {
    id: 'ifrs9',
    label: 'IFRS 9',
    icon: <Calculate />,
    description: 'Processing Modules',
    banking_modes: ['conventional', 'syariah', 'dual'],
    roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST'],
    children: [
      // 🚫 DISABLED: Impairment Module menu item - Temporarily hidden as per user request
      // {
      //   id: 'impairment-module',
      //   label: 'Impairment Module',
      //   href: '/banking/ifrs9/impairment',
      //   icon: <Warning />,
      //   description: '/IFRS9N/ifrs',
      //   status: 'disabled'
      // },
      // 🚫 DISABLED: Amortization Module menu item - Temporarily hidden as per user request
      // {
      //   id: 'amortization-module',
      //   label: 'Amortization Module',
      //   href: '/banking/ifrs9/amortization',
      //   icon: <Schedule />,
      //   description: '/IFRS9N/LeaseContract'
      // },
      {
        id: 'ecl-calculations',
        label: 'ECL Calculations',
        href: '/banking/ifrs9/calculations',
        icon: <Calculate />,
        description: 'Expected Credit Loss Processing',
        status: 'disabled'
      },
      {
        id: 'ifrs9-staging',
        label: 'IFRS9 Staging',
        href: '/banking/ifrs9/staging',
        icon: <Layers />,
        description: 'Stage 1/2/3 Classification',
        status: 'disabled'
      },
      {
        id: 'model-management',
        label: 'Model Management',
        href: '/banking/ifrs9/models',
        icon: <ViewModule />,
        description: 'PD/LGD/EAD Models',
        status: 'disabled'
      },
      {
        id: 'forecast',
        label: 'Forecast',
        href: '/banking/ifrs9/scenarios',
        icon: <AutoGraph />,
        description: 'Economic Scenario Analysis',
        status: 'disabled'
      }
    ]
  },

  // IFRS 9 REPORT
  {
    id: 'ifrs9-report',
    label: 'IFRS 9 Reports',
    icon: <TableChart />,
    description: 'Comprehensive IFRS 9 Reporting Suite',
    banking_modes: ['conventional', 'syariah', 'dual'],
    roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST'],

    children: [
      {
        id: 'nominative-report',
        label: 'Nominative Report',
        href: '/banking/ifrs9-reports/nominative',
        icon: <TableView />,
        description: 'Detailed account-level IFRS 9 report'
      },
      {
        id: 'lifetime-pd',
        label: 'Lifetime PD',
        href: '/banking/ifrs9-reports/lifetime-pd',
        icon: <TrendingUp />,
        description: 'Lifetime Probability of Default analysis'
      },
      {
        id: 'lifetime-lgd',
        label: 'Lifetime LGD',
        href: '/banking/ifrs9-reports/lifetime-lgd',
        icon: <MonetizationOn />,
        description: 'Lifetime Loss Given Default analysis'
      },
      {
        id: 'ead-model',
        label: 'EAD Model',
        href: '/banking/ifrs9-reports/ead-model',
        icon: <Functions />,
        description: 'Exposure at Default model results'
      },
      {
        id: 'ecl-result',
        label: 'ECL Result',
        href: '/banking/ifrs9-reports/ecl-result',
        icon: <Calculate />,
        description: 'Expected Credit Loss calculation results'
      },
      {
        id: 'ecl-movement',
        label: 'ECL Movement',
        href: '/banking/ifrs9-reports/ecl-movement',
        icon: <SwapHoriz />,
        description: 'ECL movement and reconciliation'
      },
      {
        id: 'gca-movement',
        label: 'GCA Movement',
        href: '/banking/ifrs9-reports/gca-movement',
        icon: <Timeline />,
        description: 'Gross Carrying Amount movement analysis'
      }
    ]
  },

  // ADVANCED ANALYTICS
  {
    id: 'advanced-analytics',
    label: 'Advanced Analytics',
    icon: <Analytics />,
    description: 'R Analytics & BI',
    banking_modes: ['conventional', 'syariah', 'dual'],
    roles: ['IAF_TENANT_SUPERADMIN', 'IAF_TENANT_ADMIN', 'IAF_BANK_CRO', 'IAF_IFRS_MANAGER', 'IAF_RISK_ANALYST', 'IAF_REPORT_ANALYST'],
    children: [
      {
        id: 'r-analytics',
        label: 'R Analytics',
        href: '/banking/analytics/r-analytics',
        icon: <DataUsage />,
        description: 'Statistical Analysis'
      },
      {
        id: 'financial-reports',
        label: 'Financial Reports',
        href: '/banking/analytics/reports',
        icon: <Assessment />,
        description: 'Enhanced Reporting'
      },
      {
        id: 'executive-dashboard',
        label: 'Executive Dashboard',
        href: '/banking/analytics/dashboard',
        icon: <Dashboard />,
        description: 'Key Performance Indicators'
      },
      {
        id: 'advanced-export',
        label: 'Advanced Export',
        href: '/banking/analytics/export',
        icon: <GetApp />,
        description: 'Business Intelligence'
      }
    ]
  },

  // WORKFLOW MANAGEMENT
  {
    id: 'workflow-management',
    label: 'Workflow Management',
    icon: <AccountTree />,
    description: 'Business Process & Approval',
    children: [
      {
        id: 'approval-system',
        label: 'Approval System',
        href: '/banking/workflow/approval',
        icon: <Approval />,
        description: 'Multi-level Approval Management'
      },
      {
        id: 'workflow-configuration',
        label: 'Workflow Configuration',
        href: '/banking/workflow/configuration',
        icon: <Settings />,
        description: 'Business Process Design'
      },
      {
        id: 'process-monitoring',
        label: 'Process Monitoring',
        href: '/banking/workflow/monitoring',
        icon: <Monitor />,
        description: 'Job & Workflow Status'
      },
      {
        id: 'staging-management',
        label: 'Staging Management',
        href: '/banking/workflow/staging',
        icon: <TableView />,
        description: 'Temp Table & Data Flow'
      },
      {
        id: 'business-process',
        label: 'Business Process',
        href: '/banking/workflow/business',
        icon: <Business />,
        description: 'ECL & Risk Workflows'
      }
    ]
  },

  // TOOLS
  {
    id: 'tools',
    label: 'Tools',
    icon: <CloudUpload />,
    description: 'Utilities',
    children: [
      {
        id: 'manual-upload',
        label: 'Manual Upload',
        href: '/banking/tools/upload',
        icon: <CloudUpload />,
        description: '/IFRS9N/ManualUpload'
      },
      {
        id: 'bulk-data-import',
        label: 'Bulk Data Import',
        href: '/banking/tools/bulk-import',
        icon: <CloudUpload />,
        description: 'Enhanced Upload Features'
      },
      {
        id: 'data-export',
        label: 'Data Export',
        href: '/banking/tools/export',
        icon: <GetApp />,
        description: 'Multi-format Export'
      },
      {
        id: 'etl-tools',
        label: 'ETL Tools',
        href: '/banking/tools/etl',
        icon: <Transform />,
        description: 'Extract Transform Load'
      },
      {
        id: 'direct-db-connection',
        label: 'Direct DB Connection',
        href: '/banking/tools/database',
        icon: <Storage />,
        description: 'Database Integration'
      },
      {
        id: 'data-scheduler',
        label: 'Data Scheduler',
        href: '/banking/tools/scheduler',
        icon: <Schedule />,
        description: 'Automated Processing'
      }
    ]
  },

  // MAINTENANCE
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: <Build />,
    description: 'System Administration',
    children: [
      {
        id: 'approval',
        label: 'Approval',
        href: '/banking/maintenance/approval',
        icon: <Approval />,
        description: '/IFRS9N/Approval'
      },
      {
        id: 'user-activity',
        label: 'User Activity',
        href: '/banking/maintenance/user-activity',
        icon: <History />,
        description: '/IFRS9N/UserActivity'
      },
      {
        id: 'job-monitoring',
        label: 'Job Monitoring',
        href: '/banking/maintenance/job-monitoring',
        icon: <Monitor />,
        description: '/IFRS9N/JobMonitoring'
      },
      {
        id: 'user-management',
        label: 'User Management',
        href: '/banking/maintenance/users',
        icon: <ManageAccounts />,
        description: '/IFRS9N/UserManagement'
      },
      {
        id: 'role-management',
        label: 'Role Management',
        href: '/banking/maintenance/roles',
        icon: <VpnKey />,
        description: '/IFRS9N/RoleManagement'
      },
      {
        id: 'menu-management',
        label: 'Menu Management',
        href: '/banking/maintenance/menus',
        icon: <Menu />,
        description: 'Database-driven menu configuration',
      }
    ]
  }
];

// ✅ Enhanced Sidebar Props
interface BankingSidebarProps {
  width?: number;
  bankingMode?: 'conventional' | 'syariah' | 'dual';
  userRole?: string;
  roleCodes?: string[]; // ✅ Add roleCodes for menu compatibility
  collapsed?: boolean;
  appBarHeight?: number;
  onMenuClick?: (menuId: string, href?: string) => void;
}

export const BankingSidebar: React.FC<BankingSidebarProps> = ({
  width = 320,
  bankingMode = 'conventional', // ✅ FIXED: Now properly receives banking mode from parent
  userRole = '',
  roleCodes = [], // ✅ Add roleCodes parameter
  collapsed = false,
  appBarHeight = 42,
  onMenuClick
}) => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // ✅ REAL-TIME DB SYNC: Monitor backend health
  const { isOnline, latency, isChecking, checkNow } = useBackendHealth(15000); // Check every 15s

  // 🔽 FLYOUT MENU STATE
  const [flyoutAnchorEl, setFlyoutAnchorEl] = useState<null | HTMLElement>(null);
  const [flyoutItem, setFlyoutItem] = useState<HierarchicalMenuItem | null>(null);

  const handleFlyoutOpen = (event: React.MouseEvent<HTMLElement>, item: HierarchicalMenuItem) => {
    setFlyoutAnchorEl(event.currentTarget);
    setFlyoutItem(item);
  };

  const handleFlyoutClose = () => {
    setFlyoutAnchorEl(null);
    setFlyoutItem(null);
  };

  const handleFlyoutItemClick = (child: HierarchicalMenuItem) => {
    // Adapter to convert HierarchicalMenuItem to MenuItem
    const menuItem: MenuItem = {
      ...child,
      label: child.title, // Map title to label
      code: child.key || child.id,
      href: child.url || undefined,
      icon: <Menu />, // Dummy icon since handleMenuItemClick only uses it for routing
      level: 3, // Safe default
      roles: child.user_types,
      banking_modes: child.banking_types as ('conventional' | 'syariah' | 'dual')[],
      children: child.children ? child.children.map(c => ({
        id: c.id,
        label: c.title,
        code: c.key,
        icon: <Menu />, // Fix: provide ReactElement instead of string from database
        banking_modes: c.banking_types as ('conventional' | 'syariah' | 'dual')[],
        roles: c.user_types,
        href: c.url || undefined
      } as MenuItem)) : undefined
    };
    handleMenuItemClick(menuItem);
    handleFlyoutClose();
  };
  // 🔼 END FLYOUT STATE

  // Database-driven menu state
  // Database-driven menu state - ✅ CACHE FIRST STRATEGY
  const [hierarchicalMenu, setHierarchicalMenu] = useState<HierarchicalMenuItem[]>(() => {
    // Try to load from cache immediately for instant render
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('cached_menu_structure');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        // silent fail for cache
      }
    }
    return [];
  });

  // Only show loading if we didn't find anything in cache


  const [menuError, setMenuError] = useState<string | null>(null);

  // Use hierarchical menu state management
  const menuState = useMenuState(hierarchicalMenu);

  // ✅ RTK Query: Auto-fetch and cache
  // Only skip if no token is available or user role is not yet loaded
  const shouldSkip = !getAuthToken() || (!userRole && (!roleCodes || roleCodes.length === 0));

  const { data: menuData, isLoading: isMenuLoading, error: menuQueryError } = useGetMenuTreeQuery(
    { bankingMode, includeInactive: false },
    { skip: shouldSkip }
  );

  // Sync RTK Query data to local state for filtering/processing
  useEffect(() => {
    if (shouldSkip) return;

    if (menuData && Array.isArray(menuData) && menuData.length > 0) {
      processMenuData(menuData);
    } else if (menuQueryError || (!isMenuLoading && (!menuData || menuData.length === 0))) {
      // Use fallback on error or empty data
      applyStaticFallback();
    }
  }, [menuData, isMenuLoading, menuQueryError, shouldSkip, bankingMode, userRole, roleCodes]);

  const processMenuData = (data: any[]) => {
    // Transform to HierarchicalMenuItem format if needed
    const hierarchical = data.map((item: any): HierarchicalMenuItem => {
      const mapToHierarchical = (dbItem: any, level: number): HierarchicalMenuItem => {
        // ✅ URL OVERRIDE: Fix paths for legacy setup pages
        let itemUrl = dbItem.url || dbItem.href || null;
        if (dbItem.menu_key === 'application-configuration' || dbItem.key === 'application-configuration') {
          itemUrl = '/banking/setup/application';
        } else if (dbItem.menu_key === 'business-configuration' || dbItem.key === 'business-configuration') {
          itemUrl = '/banking/setup/business';
        }

        return {
          id: dbItem.id,
          key: dbItem.menu_key || dbItem.key || dbItem.id,
          title: dbItem.title || dbItem.label || 'Unknown',
          description: dbItem.description,
          icon: dbItem.icon || 'dashboard',
          url: itemUrl,
          type: dbItem.type || (dbItem.children && dbItem.children.length > 0 ? 'group' : 'item'),
          level: level,
          sort_order: dbItem.sort_order || 0,
          parent_id: dbItem.parent_id || null,
          expanded: false,
          active: dbItem.is_active !== false,
          visible: true,
          permissions: dbItem.user_types || dbItem.roles || [],
          banking_modes: dbItem.banking_types || dbItem.banking_modes || ['conventional', 'syariah', 'dual'],
          user_types: dbItem.user_types || dbItem.roles || [],
          tenant_types: [],
          children: dbItem.children && dbItem.children.length > 0
            ? dbItem.children.map((child: any) => mapToHierarchical(child, level + 1))
            : [],
          metadata: {
            badge_info: dbItem.badge_info,
            isNew: dbItem.isNew,
            requiresSetup: dbItem.requiresSetup || dbItem.requires_setup
          }
        };
      };
      return mapToHierarchical(item, item.parent_id ? 2 : 1);
    });

    // Filter by role and banking mode
    const filtered = filterHierarchicalMenu(hierarchical, userRole, bankingMode, roleCodes);
    setHierarchicalMenu(filtered);

    // Auto-expand first section for better UX
    if (filtered.length > 0 && filtered[0].children && filtered[0].children.length > 0) {
      menuState.expandItem(filtered[0].id);
    }
  };



  // Static fallback function
  const applyStaticFallback = () => {
    const fallbackMenu = convertStaticToDatabaseFormat(BANKING_MENU_STRUCTURE);
    const hierarchicalFallback = transformFlatToHierarchical(fallbackMenu);
    const filtered = filterHierarchicalMenu(hierarchicalFallback, userRole, bankingMode, roleCodes);

    setHierarchicalMenu(filtered);

    // Auto-expand first section
    if (filtered.length > 0 && filtered[0].children && filtered[0].children.length > 0) {
      menuState.expandItem(filtered[0].id);
    }
  };

  // Helper function to convert static menu to database format for fallback
  const convertStaticToDatabaseFormat = (staticMenu: MenuItem[]): DatabaseMenuItem[] => {
    const convertItem = (item: MenuItem, parentId: string | null = null): DatabaseMenuItem => {
      const dbItem: DatabaseMenuItem = {
        id: item.id,
        menu_key: item.code || item.id,
        title: item.label,
        description: item.description,
        icon: item.icon ? 'dashboard' : 'menu', // Default icon mapping
        url: item.href,
        type: item.children && item.children.length > 0 ? 'group' : 'item',
        sort_order: item.sort_order || 999,
        is_active: true,
        user_types: item.roles || [],
        banking_types: item.banking_modes || ['conventional', 'syariah', 'dual'],
        parent_id: parentId
      };
      return dbItem;
    };

    const items: DatabaseMenuItem[] = [];

    // Recursive function to process nested children
    const processChildren = (children: MenuItem[], parentId: string) => {
      children.forEach(child => {
        // Add child item
        items.push(convertItem(child, parentId));

        // Process grandchildren recursively
        if (child.children && child.children.length > 0) {
          processChildren(child.children, child.id);
        }
      });
    };

    staticMenu.forEach(item => {
      // Add parent item
      items.push(convertItem(item, null));

      // Process all children recursively
      if (item.children && item.children.length > 0) {
        processChildren(item.children, item.id);
      }
    });

    return items;
  };

  // Convert database menu items to MenuItem format - PRESERVE HIERARCHY
  const convertDatabaseMenuToMenuItem = (dbMenuItems: DatabaseMenuItem[]): MenuItem[] => {
    console.log('🔄 [DATABASE-DRIVEN] Converting hierarchical menu items:', {
      totalItems: dbMenuItems.length,
      hasParentChildRelations: dbMenuItems.some(item => item.parent_id),
      sampleItems: dbMenuItems.slice(0, 3).map(item => ({
        id: item.id,
        title: item.title,
        parent_id: item.parent_id,
        hasChildren: item.children && item.children.length > 0
      }))
    });

    return dbMenuItems.map(item => {
      const menuItem: MenuItem = {
        id: item.id,
        code: item.key || item.id,
        label: item.title || item.label || 'Unknown',
        href: item.url || undefined,
        description: item.description,
        parent_id: item.parent_id,
        sort_order: item.sort_order,
        level: item.parent_id ? 2 : 1, // Calculate level based on parent_id
        path: item.key,
        // Use centralized icon configuration with banking mode awareness
        icon: item.icon ? getIconFromDatabaseString(item.icon, bankingMode) : <Menu />,
        banking_modes: item.banking_types as ('conventional' | 'syariah' | 'dual')[],
        roles: item.user_types,
        // ✅ CRITICAL: Preserve children from database - DON'T RECURSIVELY CONVERT
        children: item.children && item.children.length > 0 ? item.children.map(child => ({
          id: child.id,
          code: child.key || child.id,
          label: child.title || child.label || 'Unknown',
          href: child.url || undefined,
          description: child.description,
          parent_id: child.parent_id,
          sort_order: child.sort_order,
          level: 3, // Children are level 3
          path: child.key,
          icon: child.icon ? getIconFromDatabaseString(child.icon, bankingMode) : <Menu />,
          banking_modes: child.banking_types as ('conventional' | 'syariah' | 'dual')[],
          roles: child.user_types,
          status: child.is_active ? 'active' : 'disabled'
        })) : undefined,
        status: item.is_active ? 'active' : 'disabled'
      };

      // Add optional properties from database
      if (item.isNew) menuItem.isNew = item.isNew;
      if (item.requires_setup !== undefined) menuItem.requiresSetup = item.requires_setup;
      if (item.requiresSetup !== undefined) menuItem.requiresSetup = item.requiresSetup;

      // Handle badge info from database
      if (item.badge_info) {
        menuItem.badge = {
          content: item.badge_info.content || '',
          color: (item.badge_info.color as any) || 'primary'
        };
      }

      return menuItem;
    });
  };

  // Enhanced icon conversion function - CENTRALIZED CONFIGURATION
  const getIconFromDatabaseString = (iconString: string, bankingMode?: string): React.ReactElement => {
    // Handle undefined/null iconString - return fallback menu icon
    if (!iconString || typeof iconString !== 'string') {
      return <Menu />;
    }

    // Use centralized configuration first
    const configIcon = getMenuIcon(iconString, bankingMode);
    if (configIcon !== 'menu') {
      // Convert icon string to React element
      return convertIconStringToElement(configIcon);
    }

    // Fallback to local icon mapping for comprehensive coverage
    const fallbackIconMap: Record<string, React.ReactElement> = {
      // Core Navigation
      'dashboard': <Dashboard />,
      'settings': <Settings />,
      'category': <Category />,
      'assessment': <Assessment />,

      // Business & Banking
      'business': <Business />,
      'people': <People />,
      'account_balance': <AccountBalance />,
      'visibility': <Visibility />,
      'account_circle': <AccountCircle />,
      'person': <Person />,

      // IFRS9 & Calculations
      'calculate': <Calculate />,
      'trending_up': <TrendingUp />,
      'layers': <Layers />,
      'functions': <Functions />,
      'monetization_on': <MonetizationOn />,
      'timeline': <Timeline />,

      // Analytics & Reporting
      'analytics': <Analytics />,
      'auto_graph': <AutoGraph />,
      'table_chart': <TableChart />,
      'data_usage': <DataUsage />,
      'show_chart': <ShowChart />,
      'bar_chart': <BarChart />,
      'pie_chart': <PieChart />,
      'speed': <Speed />,
      'table_view': <TableView />,
      'view_module': <ViewModule />,

      // Workflow & Process
      'account_tree': <AccountTree />,
      'approval': <Approval />,
      'monitor': <Monitor />,
      'schedule': <Schedule />,
      'notification_important': <NotificationImportant />,
      'history': <History />,

      // Tools & Utilities
      'cloud_upload': <CloudUpload />,
      'get_app': <GetApp />,
      'transform': <Transform />,
      'storage': <Storage />,
      'cloud_download': <CloudDownload />,

      // Admin & Maintenance
      'build': <Build />,
      'admin_panel_settings': <AdminPanelSettings />,
      'supervisor_account': <SupervisorAccount />,
      'manage_accounts': <ManageAccounts />,
      'history_toggle_off': <HistoryToggleOff />,
      'task': <Task />,
      'menu': <Menu />,
      'vpn_key': <VpnKey />,

      // Additional icons for comprehensive coverage
      'mosque': <Mosque />,
      'security': <Security />,
      'swap_horiz': <SwapHoriz />,
      'currency_exchange': <CurrencyExchange />,
      'engineering': <Engineering />,
      'computer': <Computer />,
      'memory': <Memory />,
      'group_work': <GroupWork />,
      'perm_identity': <PermIdentity />,
      'menu_book': <MenuBook />,
      'folder': <Folder />,
      'description': <Description />,
      'insert_chart': <InsertChart />,
      'error_outline': <ErrorOutline />,
      'refresh': <Refresh />,
      'check_circle': <CheckCircle />,
      'warning': <Warning />,
      'error': <Error />,
      'expand_less': <ExpandLess />,
      'expand_more': <ExpandMore />
    };

    // Handle undefined/null iconString - return fallback menu icon
    if (!iconString || typeof iconString !== 'string') {
      return <Menu />;
    }

    // Return mapped icon or fallback menu icon
    return fallbackIconMap[iconString.toLowerCase()] || <Menu />;
  };

  // Convert icon string to React element helper
  const convertIconStringToElement = (iconString: string): React.ReactElement => {
    // Handle undefined/null iconString - return fallback menu icon
    if (!iconString || typeof iconString !== 'string') {
      return <Menu />;
    }
    switch (iconString) {
      case 'dashboard': return <Dashboard />;
      case 'settings': return <Settings />;
      case 'category': return <Category />;
      case 'assessment': return <Assessment />;
      case 'business': return <Business />;
      case 'people': return <People />;
      case 'account_balance': return <AccountBalance />;
      case 'visibility': return <Visibility />;
      case 'account_circle': return <AccountCircle />;
      case 'person': return <Person />;
      case 'calculate': return <Calculate />;
      case 'trending_up': return <TrendingUp />;
      case 'layers': return <Layers />;
      case 'functions': return <Functions />;
      case 'monetization_on': return <MonetizationOn />;
      case 'timeline': return <Timeline />;
      case 'analytics': return <Analytics />;
      case 'auto_graph': return <AutoGraph />;
      case 'table_chart': return <TableChart />;
      case 'data_usage': return <DataUsage />;
      case 'show_chart': return <ShowChart />;
      case 'bar_chart': return <BarChart />;
      case 'pie_chart': return <PieChart />;
      case 'speed': return <Speed />;
      case 'table_view': return <TableView />;
      case 'view_module': return <ViewModule />;
      case 'account_tree': return <AccountTree />;
      case 'approval': return <Approval />;
      case 'monitor': return <Monitor />;
      case 'schedule': return <Schedule />;
      case 'notification_important': return <NotificationImportant />;
      case 'history': return <History />;
      case 'cloud_upload': return <CloudUpload />;
      case 'get_app': return <GetApp />;
      case 'transform': return <Transform />;
      case 'storage': return <Storage />;
      case 'cloud_download': return <CloudDownload />;
      case 'build': return <Build />;
      case 'admin_panel_settings': return <AdminPanelSettings />;
      case 'supervisor_account': return <SupervisorAccount />;
      case 'manage_accounts': return <ManageAccounts />;
      case 'history_toggle_off': return <HistoryToggleOff />;
      case 'task': return <Task />;
      case 'menu': return <Menu />;
      case 'vpn_key': return <VpnKey />;
      case 'mosque': return <Mosque />;
      case 'security': return <Security />;
      case 'swap_horiz': return <SwapHoriz />;
      case 'currency_exchange': return <CurrencyExchange />;
      case 'engineering': return <Engineering />;
      case 'computer': return <Computer />;
      case 'memory': return <Memory />;
      case 'group_work': return <GroupWork />;
      case 'perm_identity': return <PermIdentity />;
      case 'menu_book': return <MenuBook />;
      case 'folder': return <Folder />;
      case 'description': return <Description />;
      case 'insert_chart': return <InsertChart />;
      case 'error_outline': return <ErrorOutline />;
      case 'refresh': return <Refresh />;
      case 'check_circle': return <CheckCircle />;
      case 'warning': return <Warning />;
      case 'error': return <Error />;
      case 'expand_less': return <ExpandLess />;
      case 'expand_more': return <ExpandMore />;
      default: return <Menu />;
    }
  };

  // Get appropriate icon for menu item based on code and level
  const getIconForMenuItem = (code: string, level: number): React.ReactElement => {
    // Map common menu codes to icons
    const iconMap: Record<string, React.ReactElement> = {
      'dashboard': <Dashboard />,
      'application-setting': <Settings />,
      'business-setting': <Business />,
      'product-parameter': <AccountBalance />,
      'journal-parameter': <Assessment />,
      'portfolio-accounts': <AccountCircle />,
      'customer-management': <People />,
      'banking-products': <AccountBalance />,
      'portfolio-monitoring': <Visibility />,
      'segmentation-configuration': <Category />,
      'rule-base-setting': <Assessment />,
      'bucket-parameter': <Layers />,
      'pd-setup-management': <TrendingUp />,
      'lgd-setup-management': <MonetizationOn />,
      'ead-setup-management': <AccountBalance />,
      'ecl-configuration': <Calculate />,
      'assessment-override': <Assessment />,
      'impairment-module': <Warning />,
      'ecl-calculations': <Calculate />,
      'ifrs9-staging': <Layers />,
      'model-management': <ViewModule />,
      'stress-testing': <AutoGraph />,
      'nominative-report': <TableView />,
      'lifetime-pd': <TrendingUp />,
      'lifetime-lgd': <MonetizationOn />,
      'ead-model': <Functions />,
      'ecl-result': <Calculate />,
      'ecl-movement': <SwapHoriz />,
      'gca-movement': <Timeline />,
      'r-analytics': <DataUsage />,
      'financial-reports': <Assessment />,
      'executive-dashboard': <Dashboard />,
      'advanced-export': <GetApp />,
      'approval-system': <Approval />,
      'workflow-configuration': <Settings />,
      'process-monitoring': <Monitor />,
      'staging-management': <TableView />,
      'business-process': <Business />,
      'manual-upload': <CloudUpload />,
      'bulk-data-import': <CloudUpload />,
      'data-export': <GetApp />,
      'etl-tools': <Transform />,
      'direct-db-connection': <Storage />,
      'data-scheduler': <Schedule />,
      'user-management': <ManageAccounts />,
      'role-management': <VpnKey />,
      'menu-management': <Menu />
    };

    return iconMap[code] || (level === 0 ? <Category /> : <Assessment />);
  };

  const handleExpandToggle = (itemId: string) => {
    menuState.toggleExpansion(itemId);
  };

  const handleMenuItemClick = (item: MenuItem) => {
    if (item.href) {
      router.push(item.href);
      onMenuClick?.(item.id, item.href);
    } else if (item.children && !collapsed) {
      handleExpandToggle(item.id);
    }
  };

  // Get top level page URL for logo link
  const getTopLevelRoute = () => {
    if (!pathname) return '/banking/dashboard';
    const pathSegments = pathname.split('/');
    if (pathSegments.length >= 3) {
      // Return the section level: /banking/[section]
      return `/banking/${pathSegments[2]}`;
    }
    return '/banking/dashboard'; // Default fallback
  };

  const isItemActive = (item: MenuItem): boolean => {
    if (!item.href || !pathname) return false;
    return pathname === item.href || pathname.startsWith(item.href + '/');
  };

  const isItemVisible = (item: HierarchicalMenuItem): boolean => {


    // 🔒 TEMPORARILY HIDE PORTFOLIO MANAGEMENT SECTION
    if (item.id === 'portfolio-management' || item.id?.startsWith('portfolio-')) {
      return false;
    }

    // Banking mode filter
    if (item.banking_types && !item.banking_types.includes(bankingMode)) {
      return false;
    }

    // Enhanced role-based filter with IAF role support
    if (item.user_types && item.user_types.length > 0) {
      // If no user role provided, hide items that require specific roles
      if (!userRole) {
        return false;
      }

      // Parse user roles (support comma-separated multiple roles)
      const userRoles = userRole.split(',').map(role => role.trim().toLowerCase());

      // Check if user has any of the required roles
      const hasRequiredRole = item.user_types.some(requiredRole => {
        const normalizedRequiredRole = requiredRole.toLowerCase();

        // Exact match
        if (userRoles.includes(normalizedRequiredRole)) {
          return true;
        }

        // IAF ROLE MAPPING: Enhanced IAF role support
        const iafRoleMapping: Record<string, string[]> = {
          'iaf_tenant_superadmin': ['iaf_tenant_superadmin', 'iaf_super_admin', 'platform_super_admin', 'super_admin'],
          'iaf_tenant_admin': ['iaf_tenant_admin', 'iaf_admin', 'tenant_admin'],
          'iaf_bank_cro': ['iaf_bank_cro', 'iaf_cro', 'cro', 'chief_risk_officer'],
          'iaf_ifrs_manager': ['iaf_ifrs_manager', 'ifrs_manager', 'risk_manager'],
          'iaf_risk_analyst': ['iaf_risk_analyst', 'risk_analyst', 'analyst'],
          'iaf_portfolio_manager': ['iaf_portfolio_manager', 'portfolio_manager'],
          'iaf_data_admin': ['iaf_data_admin', 'data_admin'],
          'iaf_report_analyst': ['iaf_report_analyst', 'report_analyst'],
          'iaf_auditor': ['iaf_auditor', 'auditor', 'internal_auditor'],
          'iaf_viewer': ['iaf_viewer', 'viewer', 'read_only']
        };

        // Check IAF role mappings
        const mappedRoles = iafRoleMapping[normalizedRequiredRole];
        if (mappedRoles && mappedRoles.some(mappedRole => userRoles.includes(mappedRole))) {
          return true;
        }

        // Partial matches for hierarchical roles
        return userRoles.some(userRoleItem => {
          // Support role hierarchy (e.g., 'admin' matches 'super_admin')
          if (userRoleItem.includes(normalizedRequiredRole) ||
            normalizedRequiredRole.includes(userRoleItem)) {
            return true;
          }

          // Support role categories
          const roleCategories = {
            'admin': ['admin', 'super_admin', 'platform_admin', 'system_admin'],
            'manager': ['manager', 'branch_manager', 'department_manager'],
            'analyst': ['analyst', 'risk_analyst', 'business_analyst', 'data_analyst'],
            'officer': ['officer', 'loan_officer', 'credit_officer'],
            'supervisor': ['supervisor', 'team_lead', 'team_leader'],
            'banking_staff': ['bank_user', 'banking_staff', 'loan_officer', 'credit_officer'],
            'consultant': ['consultant', 'advisor', 'specialist', 'external_consultant'],
            'regulator': ['regulator', 'supervisor', 'auditor', 'inspector'],
            'cro': ['cro', 'chief_risk_officer', 'risk_officer'],
            'auditor': ['auditor', 'internal_auditor', 'external_auditor'],
            'banking': ['banking', 'conventional', 'syariah', 'dual'],
            'platform': ['platform', 'super_admin', 'system_admin'],
            'iaf': ['iaf_tenant_superadmin', 'iaf_tenant_admin', 'iaf_bank_cro', 'iaf_ifrs_manager']
          };

          // Check if user role matches any category that includes the required role
          for (const [category, roles] of Object.entries(roleCategories)) {
            if (roles.includes(normalizedRequiredRole) &&
              (userRoleItem.includes(category) || category.includes(userRoleItem))) {
              return true;
            }
          }

          return false;
        });
      });

      if (!hasRequiredRole) {
        return false;
      }
    }

    // Enhanced admin detection with multiple role support
    const isAdminUser = userRole && userRole.split(',').some(role => {
      const normalizedRole = role.trim().toLowerCase();
      return normalizedRole.includes('admin') ||
        normalizedRole.includes('super') ||
        normalizedRole.includes('platform') ||
        normalizedRole === 'iaf_tenant_superadmin' ||
        normalizedRole === 'iaf_tenant_admin' ||
        normalizedRole === 'platform_super_admin' ||
        normalizedRole === 'system_admin';
    });

    // Hide admin-only items from non-admin users
    if (!isAdminUser && item.user_types && item.user_types.some(role =>
      role.toLowerCase().includes('admin') ||
      role.toLowerCase().includes('super') ||
      role.toLowerCase().includes('platform') ||
      role.toLowerCase().includes('iaf_tenant')
    )) {
      return false;
    }

    // Show all items that pass the filters
    return true;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'active': return <CheckCircle sx={{ fontSize: 8, color: 'success.main' }} />;
      case 'warning': return <Warning sx={{ fontSize: 8, color: 'warning.main' }} />;
      case 'error': return <Error sx={{ fontSize: 8, color: 'error.main' }} />;
      default: return null;
    }
  };

  // ✅ SURGICAL FIX: Dynamic banking mode functions
  const getBankingModeLabel = () => {
    switch (bankingMode) {
      case 'syariah': return 'Syariah Compliant';
      case 'dual': return 'Dual Banking';
      default: return 'Conventional Banking';
    }
  };

  const getBankingModeColor = () => {
    switch (bankingMode) {
      case 'syariah': return 'success';
      case 'dual': return 'warning';
      default: return 'primary';
    }
  };

  const getBankingModeIcon = () => {
    switch (bankingMode) {
      case 'syariah': return <Mosque sx={{ fontSize: '0.7rem' }} />;
      case 'dual': return <SwapHoriz sx={{ fontSize: '0.7rem' }} />;
      default: return <AccountBalance sx={{ fontSize: '0.7rem' }} />;
    }
  };

  // ✅ HIERARCHICAL: Render menu item with proper parent-child relationships and visibility filtering
  const renderHierarchicalMenuItem = (item: HierarchicalMenuItem, level: number = 0) => {
    // Apply visibility filtering
    if (!isItemVisible(item)) {
      return null;
    }

    const hasChildren = item.children && item.children.length > 0;
    const isActive = menuState.isActive(item.id);
    const isExpanded = menuState.isExpanded(item.id);

    // Filter visible children
    const visibleChildren = hasChildren
      ? item.children!.filter(child => isItemVisible(child))
      : [];

    return (
      <React.Fragment key={item.id}>
        <ListItem
          disablePadding
          sx={{
            pl: collapsed ? 0 : level * 2,
            display: 'block'
          }}
        >
          <Tooltip
            title={collapsed ? `${item.title}${item.description ? ' - ' + item.description : ''}` : item.description || ''}
            placement="right"
            arrow
          >
            <ListItemButton
              onClick={(e) => {
                if (collapsed && hasChildren) {
                  // 🔽 Open Flyout in collapsed mode
                  handleFlyoutOpen(e, item);
                } else if (hasChildren && visibleChildren.length > 0) {
                  menuState.toggleExpansion(item.id);
                } else if (item.url) {
                  menuState.navigateToMenu(item);
                  onMenuClick?.(item.id, item.url);
                }
              }}
              sx={{
                minHeight: level === 0 ? 48 : 40,
                borderRadius: collapsed ? 0 : '0 24px 24px 0',
                mx: collapsed ? 0 : 0,
                mb: 0.5,
                px: collapsed ? 1 : 1.5,
                py: 0.5,
                position: 'relative',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',

                // 🎨 ACTIVE STATE STYLING (PREMIUM DARK)
                backgroundColor: isActive
                  ? 'rgba(255, 255, 255, 0.15)'
                  : 'transparent',
                background: isActive
                  ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.05) 100%)'
                  : 'transparent',

                // Left active indicator
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 6,
                  bottom: 6,
                  width: 4,
                  borderRadius: '0 4px 4px 0',
                  backgroundColor: '#ffffff',
                  opacity: isActive ? 1 : 0,
                  transition: 'opacity 0.2s ease',
                  boxShadow: isActive ? '0 0 8px rgba(255, 255, 255, 0.5)' : 'none'
                },

                justifyContent: collapsed ? 'center' : 'flex-start',

                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  transform: collapsed ? 'none' : 'translateX(4px)',
                  '& .MuiListItemIcon-root': {
                    color: '#ffffff',
                    transform: 'scale(1.1)'
                  }
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 'unset' : 28,
                  justifyContent: 'center',
                  color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.7)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',

                  // 🎨 GLOW EFFECT FOR ICONS
                  filter: isActive
                    ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))'
                    : 'none',

                  transform: isActive ? 'scale(1.1)' : 'scale(1)',

                  '& svg': {
                    fontSize: collapsed ? '1.4rem' : '1.3rem', // Slightly larger styling
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                {getIconFromDatabaseString(item.icon)}
              </ListItemIcon>

              {!collapsed && (
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant={level === 0 ? 'body2' : 'caption'}
                        sx={{
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                          fontSize: level === 0 ? '0.825rem' : '0.75rem',
                          lineHeight: 1.3
                        }}
                      >
                        {item.title}
                      </Typography>

                      {/* Status indicators */}
                      {item.metadata?.badge_info && (
                        <Chip
                          label={item.metadata.badge_info.content}
                          size="small"
                          color={item.metadata.badge_info.color || 'primary'}
                          sx={{ height: 16, fontSize: '0.65rem', minWidth: 20 }}
                        />
                      )}

                      {item.metadata?.isNew && (
                        <Chip
                          label="NEW"
                          size="small"
                          color="success"
                          sx={{ height: 14, fontSize: '0.6rem', minWidth: 26 }}
                        />
                      )}

                      {item.metadata?.requiresSetup && (
                        <Chip
                          label="SETUP"
                          size="small"
                          color="warning"
                          sx={{ height: 14, fontSize: '0.6rem', minWidth: 36 }}
                        />
                      )}
                    </Box>
                  }
                  secondary={level === 0 && item.description && !item.description.endsWith('Root') ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.65rem',
                        lineHeight: 1.2,
                        mt: 0.25
                      }}
                    >
                      {item.description}
                    </Typography>
                  ) : null}
                  sx={{
                    my: 0,
                    '& .MuiListItemText-primary': {
                      mb: level === 0 && item.description ? 0.25 : 0
                    }
                  }}
                />
              )}

              {/* Expand/collapse indicator for items with children */}
              {hasChildren && visibleChildren.length > 0 && !collapsed && (
                <Box sx={{
                  color: 'rgba(255, 255, 255, 0.7)',
                  '& svg': {
                    fontSize: '1rem'
                  }
                }}>
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </Box>
              )}
            </ListItemButton>
          </Tooltip>
        </ListItem>

        {/* Children with collapsible container */}
        {hasChildren && visibleChildren.length > 0 && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pb: 0.25 }}>
              {visibleChildren.map(child => renderHierarchicalMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <Box
      sx={{
        width,
        height: '100%',
        background: 'linear-gradient(180deg, #1565C0 0%, #0D47A1 100%)', // ✅ PREMIUM GRADIENT
        borderRight: 'none',
        overflow: 'auto',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        // Slim scrollbar
        '&::-webkit-scrollbar': {
          width: '4px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: 'rgba(255, 255, 255, 0.3)',
          borderRadius: '2px',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.5)',
          },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
      }}
    >
      {/* Header height matches AppBar exactly */}
      <Box
        sx={{
          px: collapsed ? 1 : 1.5,
          py: 0,
          height: appBarHeight,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          textAlign: collapsed ? 'center' : 'left',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          color: 'white',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)' // ✅ GLASSMORPHISM
        }}
      >
        {collapsed ? (
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.common.white, 0.2),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: '0.875rem',
                lineHeight: 1
              }}
            >
              IAF
            </Typography>
          </Box>
        ) : (
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              fontSize: '0.85rem',
              lineHeight: 1.2,
              mb: 0,
              letterSpacing: '0.02em'
            }}
          >
            IAF IFRS 9 Platform
          </Typography>
        )}
      </Box>

      {/* Navigation Menu */}
      <List sx={{ p: collapsed ? 0.25 : 0.5 }}>
        {isMenuLoading && hierarchicalMenu.length === 0 ? (
          // Loading state - Skeleton
          <MenuSkeleton />
        ) : menuQueryError && hierarchicalMenu.length === 0 ? (
          // Error state with retry button
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <ErrorOutline sx={{ fontSize: 24, color: 'error.main', mb: 1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              {menuError}
            </Typography>
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => window.location.reload()}
            >
              Retry
            </Typography>
          </Box>
        ) : (
          // Render hierarchical menu items (database-driven or fallback)
          // Render hierarchical menu items (database-driven or fallback)
          hierarchicalMenu.map(item => renderHierarchicalMenuItem(item))
        )}
      </List>

      {/* ✅ SURGICAL FIX: Footer Info with IAF Logo and Dynamic Banking Mode */}
      <Box
        sx={{
          mt: 'auto',
          px: collapsed ? 1 : 2,
          py: collapsed ? 1 : 2.5,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          // background: 'rgba(0, 0, 0, 0.2)', // Removed to match menu color
          // backdropFilter: 'blur(10px)'
        }}
      >
        {collapsed ? null : (
          /* Expanded: Full footer with logo and info */
          <>
            {/* IAF Logo Section */}
            {/* ... (previous expanded logo code) ... */}
            <Link href={getTopLevelRoute()} style={{ textDecoration: 'none' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1,
                  mb: 2,
                  mt: 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    '& img': {
                      transform: 'scale(1.05)',
                    }
                  }
                }}
              >
                <img
                  src="/images/logo-iaf.png"
                  alt="Indonesia Airawata Finance"
                  style={{
                    height: 'auto',
                    width: '100%',
                    maxWidth: '180px',
                    maxHeight: '48px',
                    objectFit: 'contain',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </Box>
            </Link>

            <Typography
              variant="caption"
              align="center"
              display="block"
              sx={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                letterSpacing: '0.02em',
                mb: 0.5
              }}
            >
              IFRS 9 Platform v2.0
            </Typography>
            <Typography
              variant="caption"
              align="center"
              display="block"
              sx={{
                fontSize: '0.65rem',
                mb: 1.5,
                color: 'rgba(255, 255, 255, 0.7)'
              }}
            >
              {getBankingModeLabel()}
            </Typography>

            {/* Quick Status Indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                icon={getBankingModeIcon()}
                label={bankingMode === 'syariah' ? 'Halal' : 'Compliant'}
                size="small"
                variant="filled"
                sx={{
                  fontSize: '0.6rem',
                  height: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  '& .MuiChip-icon': {
                    fontSize: '0.8rem',
                    color: '#fff'
                  }
                }}
              />


            </Box>
          </>
        )}
      </Box>

    </Box>
  );
};

export default BankingSidebar;