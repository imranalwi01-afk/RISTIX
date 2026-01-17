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
  ExpandLess,
  ExpandMore,
  Menu,
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
  Search,
  Dashboard,
  Settings,
  Category,
  Assessment,
  Business,
  People,
  AccountBalance,
  Visibility,
  AccountCircle,
  Person,
  Calculate,
  TrendingUp,
  Layers,
  Functions,
  MonetizationOn,
  Timeline,
  CheckCircle,
  Warning,
  Error as ErrorIcon, // Rename to avoid conflict with Error constructor
  ErrorOutline,
  Mosque,
  SwapHoriz
} from '@mui/icons-material';

import {
  getIconFromDatabaseString,
  getStaticFallbackMenu
} from './BankingSidebarUtils';

import { MenuItem, DatabaseMenuItem } from './types';

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

// IAF-SPECIFIC SITEMAP STRUCTURE - Based on IAF Navigation Requirements

// ✅ Enhanced Sidebar Props
interface BankingSidebarProps {
  width?: number;
  bankingMode?: 'conventional' | 'syariah' | 'dual';
  userRole?: string;
  roleCodes?: string[];
  userPermissions?: string[]; // ✅ Add userPermissions for granular menu filtering
  collapsed?: boolean;
  appBarHeight?: number;
  onMenuClick?: (menuId: string, href?: string) => void;
}

export const BankingSidebar: React.FC<BankingSidebarProps> = ({
  width = 320,
  bankingMode = 'conventional', // ✅ FIXED: Now properly receives banking mode from parent
  userRole = '',
  roleCodes = [], // ✅ Add roleCodes parameter
  userPermissions = [], // ✅ Add userPermissions parameter
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
  }, [menuData, isMenuLoading, menuQueryError, shouldSkip, bankingMode, userRole, roleCodes, userPermissions]);

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
    const filtered = filterHierarchicalMenu(hierarchical, userRole, bankingMode, roleCodes, userPermissions);



    setHierarchicalMenu(filtered);

    // Auto-expand first section for better UX
    if (filtered.length > 0 && filtered[0].children && filtered[0].children.length > 0) {
      menuState.expandItem(filtered[0].id);
    }
  };



  // Static fallback function
  const applyStaticFallback = () => {
    const fallbackMenu = getStaticFallbackMenu();
    const hierarchicalFallback = transformFlatToHierarchical(fallbackMenu);
    const filtered = filterHierarchicalMenu(hierarchicalFallback, userRole, bankingMode, roleCodes, userPermissions);

    setHierarchicalMenu(filtered);

    // Auto-expand first section
    if (filtered.length > 0 && filtered[0].children && filtered[0].children.length > 0) {
      menuState.expandItem(filtered[0].id);
    }
  };

  // Helper function to convert static menu to database format for fallback

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
      case 'error': return <ErrorIcon sx={{ fontSize: 8, color: 'error.main' }} />;
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