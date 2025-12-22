// packages/frontend/src/components/banking/BankingSidebar.tsx
// ============================================================================
// 🔄 DATABASE-DRIVEN MENU INTEGRATION
// ============================================================================
// ✅ UPDATED: Database-driven menu system with API integration
// ✅ PRESERVED: All existing perfect functionality and collapse behavior
// ✅ ENHANCED: Dynamic menu loading with role-based filtering
// ✅ FALLBACK: Hardcoded menu as backup when API unavailable
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  useTheme
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

} from '@mui/icons-material';

// Import menu service for database-driven menus
import { menuService, MenuItem as DatabaseMenuItem } from '@/services/menu.service';

// Menu structure (same as before)
interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: React.ReactElement;
  description?: string;
  children?: MenuItem[];
  roles?: string[];
  bankingModes?: ('conventional' | 'syariah' | 'dual')[];
  badge?: {
    content: string | number;
    color: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  status?: 'active' | 'warning' | 'error' | 'disabled';
  isNew?: boolean;
  requiresSetup?: boolean;
}

// OFFICIAL SITEMAP STRUCTURE - ALL ICONS FIXED
const BANKING_MENU_STRUCTURE: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/banking/dashboard',
    icon: <Dashboard />,
    description: 'IFRS 9 Pro System Overview'
  },
  
  // GENERAL SETUP
  {
    id: 'general-setup',
    label: 'General Setup',
    icon: <Settings />,
    description: 'System Configuration',
    children: [
      {
        id: 'application-setting',
        label: 'Application Setting',
        href: '/banking/setup/application',
        icon: <Settings />,
        description: '/IFRS9N/ApplicationSetting'
      },
      {
        id: 'business-setting',
        label: 'Business Setting',
        href: '/banking/setup/business',
        icon: <Business />,
        description: '/IFRS9N/BussinessSetting'
      }
    ]
  },
  
  // PARAMETER SETUP
  {
    id: 'parameter-setup',
    label: 'Parameter Setup',
    icon: <Category />,
    description: 'Core Parameters',
    children: [
      {
        id: 'product-parameter',
        label: 'Product Parameter',
        href: '/banking/parameters/product',
        icon: <AccountBalance />,
        description: '/IFRS9N/ProductParameter'
      },
      {
        id: 'journal-parameter',
        label: 'Journal Parameter',
        href: '/banking/parameters/journal',
        icon: <Assessment />,
        description: '/IFRS9N/JournalParameter'
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
    children: [
      {
        id: 'assessment-override',
        label: 'Assessment Override',
        href: '/banking/individual/assessment',
        icon: <Assessment />,
        description: '/IFRS9N/IndividualImpairment/AssesmentOverride'
      },
      // 🚫 DISABLED: Override Trigger menu item - Temporarily hidden as per user request
      // {
      //   id: 'override-trigger',
      //   label: 'Override Trigger',
      //   href: '/banking/individual/override-trigger',
      //   icon: <NotificationImportant />,
      //   description: '/IndividualImpairment/OverrideTrigger'
      // },

      // 🚫 DISABLED: DCF Scenario menu item - Temporarily hidden as per user request
      // {
      //   id: 'dcf-scenario',
      //   label: 'DCF Scenario',
      //   href: '/banking/individual/dcf',
      //   icon: <Timeline />,
      //   description: '/IndividualImpairment/DCFScenario'
      // },

      // 🚫 DISABLED: IA Provision menu item - Temporarily hidden as per user request
      // {
      //   id: 'ia-provision',
      //   label: 'IA Provision',
      //   href: '/banking/individual/provision',
      //   icon: <AccountBalance />,
      //   description: '/IndividualImpairment/IAProvision'
      // },

      // 🚫 DISABLED: Override History menu item - Temporarily hidden as per user request
      // {
      //   id: 'override-history',
      //   label: 'Override History',
      //   href: '/banking/individual/history',
      //   icon: <History />,
      //   description: '/IndividualImpairment/OverrideHistory'
      // }
    ]
  },
  
  // IFRS 9 PROCESSING
  {
    id: 'ifrs9',
    label: 'IFRS 9',
    icon: <Calculate />,
    description: 'Processing Modules',
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
        id: 'stress-testing',
        label: 'Stress Testing',
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
  collapsed?: boolean;
  appBarHeight?: number;
  onMenuClick?: (menuId: string, href?: string) => void;
}

export const BankingSidebar: React.FC<BankingSidebarProps> = ({
  width = 320,
  bankingMode = 'conventional', // ✅ FIXED: Now properly receives banking mode from parent
  userRole = '',
  collapsed = false,
  appBarHeight = 42,
  onMenuClick
}) => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>(['dashboard']);

  // Database-driven menu state
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [menuError, setMenuError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Load menu from database on component mount
  useEffect(() => {
    loadMenuFromDatabase();
  }, [bankingMode, userRole]);

  // Auto-expand current section
  useEffect(() => {
    if (pathname) {
      const pathSegments = pathname.split('/');
      if (pathSegments.length >= 3) {
        const section = pathSegments[2]; // /banking/[section]/...
        setExpandedItems(prev => [...new Set([...prev, section])]);
      }
    }
  }, [pathname]);

  // Load menu from database API
  const loadMenuFromDatabase = async () => {
    try {
      setIsLoading(true);
      setMenuError(null);

      console.log('🔄 Loading menu from database...', { bankingMode, userRole });

      // Get menu tree from API with caching
      const response = await menuService.getCachedMenuTree({
        bankingMode,
        includeInactive: false
      });

      if (response.success && response.data && response.data.length > 0) {
        console.log('✅ Menu loaded from database:', response.data);

        // Filter menu tree based on user role and convert to MenuItem format
        const filteredMenu = menuService.filterMenuTree(response.data, userRole, bankingMode);
        const convertedMenu = convertDatabaseMenuToMenuItem(filteredMenu);

        setMenuItems(convertedMenu);
        setUseFallback(false);

        // Auto-expand first section if available
        if (convertedMenu.length > 0 && !expandedItems.includes(convertedMenu[0].id)) {
          setExpandedItems([convertedMenu[0].id]);
        }
      } else {
        console.warn('⚠️ No menu data available, using fallback');
        setUseFallback(true);
        setMenuItems(BANKING_MENU_STRUCTURE);
      }
    } catch (error) {
      console.error('❌ Failed to load menu from database:', error);
      setMenuError('Failed to load menu from database');
      setUseFallback(true);
      setMenuItems(BANKING_MENU_STRUCTURE);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert database menu items to MenuItem format
  const convertDatabaseMenuToMenuItem = (dbMenuItems: DatabaseMenuItem[]): MenuItem[] => {
    return dbMenuItems.map(item => ({
      id: item.id,
      label: item.label,
      href: item.href,
      description: item.description,
      children: item.children ? convertDatabaseMenuToMenuItem(item.children) : undefined,
      roles: item.roles,
      bankingModes: item.banking_modes,
      badge: item.badge ? {
        content: item.badge.content || '',
        color: item.badge.color || 'primary'
      } : undefined,
      status: item.status || 'active',
      isNew: item.is_new,
      requiresSetup: item.requires_setup,
      icon: getIconForMenuItem(item.code, item.level)
    }));
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
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
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

  const isItemVisible = (item: MenuItem): boolean => {
    // 🔒 TEMPORARILY HIDE PORTFOLIO MANAGEMENT SECTION
    if (item.id === 'portfolio-management' || item.id?.startsWith('portfolio-')) {
      return false;
    }

    // 🚫 HIDE DISABLED ITEMS (unfinished features)
    if (item.status === 'disabled') {
      return false;
    }

    // Banking mode filter
    if (item.bankingModes && !item.bankingModes.includes(bankingMode)) {
      return false;
    }

    // Enhanced role-based filter with multiple role support
    if (item.roles && item.roles.length > 0) {
      // If no user role provided, hide items that require specific roles
      if (!userRole) {
        return false;
      }

      // Parse user roles (support comma-separated multiple roles)
      const userRoles = userRole.split(',').map(role => role.trim().toLowerCase());

      // Check if user has any of the required roles
      const hasRequiredRole = item.roles.some(requiredRole => {
        const normalizedRequiredRole = requiredRole.toLowerCase();

        // Exact match
        if (userRoles.includes(normalizedRequiredRole)) {
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
            'cro': ['cro', 'chief_risk_officer', 'risk_officer'],
            'consultant': ['consultant', 'advisor', 'external_consultant'],
            'auditor': ['auditor', 'internal_auditor', 'external_auditor'],
            'banking': ['banking', 'conventional', 'syariah', 'dual'],
            'platform': ['platform', 'super_admin', 'system_admin']
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
             normalizedRole === 'platform_super_admin' ||
             normalizedRole === 'system_admin';
    });

    // Hide admin-only items from non-admin users
    if (!isAdminUser && item.roles && item.roles.some(role =>
      role.toLowerCase().includes('admin') ||
      role.toLowerCase().includes('super') ||
      role.toLowerCase().includes('platform')
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

  // Enhanced render menu item with perfect collapse support
  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    if (!isItemVisible(item)) return null;

    const isActive = isItemActive(item);
    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;

    return (
      <React.Fragment key={item.id}>
        <ListItem 
          disablePadding 
          sx={{ 
            pl: collapsed ? 0 : level * 1.5,
            display: 'block'
          }}
        >
          <Tooltip 
            title={collapsed ? `${item.label}${item.description ? ' - ' + item.description : ''}` : item.description || ''} 
            placement="right" 
            arrow
          >
            <ListItemButton
              onClick={() => handleMenuItemClick(item)}
              sx={{
                minHeight: collapsed ? 40 : (level === 0 ? 36 : 32),
                borderRadius: collapsed ? 0 : 1,
                mx: collapsed ? 0 : 0.5,
                mb: 0.25,
                px: collapsed ? 1 : 1,
                py: 0.5,
                backgroundColor: isActive 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                borderLeft: isActive 
                  ? `3px solid ${theme.palette.primary.main}`
                  : '3px solid transparent',
                justifyContent: collapsed ? 'center' : 'flex-start',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                },
                transition: 'all 0.15s ease-in-out'
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: collapsed ? 'unset' : 28,
                  justifyContent: 'center',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  '& svg': {
                    fontSize: collapsed ? '1.2rem' : '1.1rem'
                  }
                }}
              >
                {item.icon}
              </ListItemIcon>
              
              {!collapsed && (
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography
                        variant={level === 0 ? 'body2' : 'caption'}
                        sx={{
                          fontWeight: isActive ? 600 : 500,
                          color: isActive ? 'primary.main' : 'text.primary',
                          fontSize: level === 0 ? '0.825rem' : '0.75rem',
                          lineHeight: 1.3
                        }}
                      >
                        {item.label}
                      </Typography>
                      
                      {item.badge && (
                        <Chip
                          label={item.badge.content}
                          size="small"
                          color={item.badge.color}
                          sx={{ height: 16, fontSize: '0.65rem', minWidth: 20 }}
                        />
                      )}
                      
                      {item.isNew && (
                        <Chip
                          label="NEW"
                          size="small"
                          color="success"
                          sx={{ height: 14, fontSize: '0.6rem', minWidth: 26 }}
                        />
                      )}
                      
                      {item.requiresSetup && (
                        <Chip
                          label="SETUP"
                          size="small"
                          color="warning"
                          sx={{ height: 14, fontSize: '0.6rem', minWidth: 36 }}
                        />
                      )}
                      
                      {getStatusIcon(item.status)}
                    </Box>
                  }
                  secondary={level === 0 ? (
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'text.secondary',
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
                      mb: level === 0 ? 0.25 : 0
                    }
                  }}
                />
              )}
              
              {hasChildren && !collapsed && (
                <Box sx={{ 
                  color: 'text.secondary',
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
        
        {hasChildren && !collapsed && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pb: 0.25 }}>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
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
        backgroundColor: 'background.paper',
        borderRight: `1px solid ${theme.palette.divider}`,
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
          background: alpha(theme.palette.primary.main, 0.3),
          borderRadius: '2px',
          '&:hover': {
            background: alpha(theme.palette.primary.main, 0.5),
          },
        },
        scrollbarWidth: 'thin',
        scrollbarColor: `${alpha(theme.palette.primary.main, 0.3)} transparent`,
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
          backgroundColor: bankingMode === 'syariah' 
            ? 'success.main' 
            : '#1976D2', // IAF Corporate Blue
          color: 'white',
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`
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
              mb: 0
            }}
          >
            IAF IFRS 9 Platform
          </Typography>
        )}
      </Box>

      {/* Navigation Menu */}
      <List sx={{ p: collapsed ? 0.25 : 0.5 }}>
        {isLoading ? (
          // Loading state
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Refresh sx={{
              fontSize: 24,
              color: 'text.secondary',
              mb: 1,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' }
              },
              animation: 'spin 1s linear infinite'
            }} />
            <Typography variant="caption" color="text.secondary">
              Loading menu...
            </Typography>
          </Box>
        ) : menuError ? (
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
              onClick={loadMenuFromDatabase}
            >
              Retry
            </Typography>
          </Box>
        ) : (
          // Render menu items (database-driven or fallback)
          menuItems.map(item => renderMenuItem(item))
        )}
      </List>

      {/* ✅ SURGICAL FIX: Footer Info with IAF Logo and Dynamic Banking Mode */}
      <Box
        sx={{
          mt: 'auto',
          px: collapsed ? 1 : 1.5,
          py: collapsed ? 1 : 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.8)
        }}
      >
        {collapsed ? (
          /* Collapsed: Just IAF logo centered */
          <Link href={getTopLevelRoute()} style={{ textDecoration: 'none' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center',
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
                alt="IAF"
                style={{ 
                  height: '24px',
                  width: 'auto',
                  objectFit: 'contain',
                  transition: 'transform 0.2s ease'
                }}
              />
            </Box>
          </Link>
        ) : (
          /* Expanded: Full footer with logo and info */
          <>
            {/* IAF Logo Section */}
            <Link href={getTopLevelRoute()} style={{  textDecoration: 'none' }}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: 1, 
                  mb: 1,
                  mt: 2,
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
                    height: '32px',
                    width: 'auto',
                    objectFit: 'contain',
                    transition: 'transform 0.2s ease'
                  }}
                />
                <Typography 
                  variant="caption" 
                  color="primary.main" 
                  align="center" 
                  display="block"
                  sx={{ 
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#1976D2' // IAF Blue
                  }}
                >
                  Indonesia Airawata Finance
                </Typography>
              </Box>
            </Link>

            <Typography 
              variant="caption" 
              color="text.secondary" 
              align="center" 
              display="block"
              sx={{ fontSize: '0.65rem' }}
            >
              IFRS 9 Platform v2.0
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              align="center" 
              display="block"
              sx={{ fontSize: '0.6rem', mb: 0.5 }}
            >
              {/* ✅ SURGICAL FIX: Dynamic banking mode display */}
              {getBankingModeLabel()}
            </Typography>
            
            {/* Quick Status Indicators */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
              {/* ✅ SURGICAL FIX: Dynamic banking mode chip */}
              <Chip
                icon={getBankingModeIcon()}
                label={bankingMode === 'syariah' ? 'Halal' : 'Compliant'}
                size="small"
                color={getBankingModeColor() as any}
                variant="outlined"
                sx={{ 
                  fontSize: '0.55rem',
                  height: 18,
                  '& .MuiChip-icon': {
                    fontSize: '0.7rem'
                  }
                }}
              />
              <Chip
                icon={<CheckCircle />}
                label="Online"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ 
                  fontSize: '0.55rem',
                  height: 18,
                  '& .MuiChip-icon': {
                    fontSize: '0.7rem'
                  }
                }}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Menu source indicator */}
      {!collapsed && (
        <Box sx={{ px: 1.5, py: 0.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
          <Typography
            variant="caption"
            color="text.secondary"
            align="center"
            display="block"
            sx={{ fontSize: '0.55rem' }}
          >
            {useFallback ? '📋 Static Menu' : '🗄️ Database Menu'}
            {menuError && ' (⚠️ Error)'}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default BankingSidebar;