'use client';

// packages/frontend/src/components/banking/BankingSidebar.tsx
// ============================================================================
// 🔄 DATABASE-DRIVEN HIERARCHICAL MENU SYSTEM
// ============================================================================
// ✅ UPDATED: Hierarchical menu rendering with parent-child relationships
// ✅ PRESERVED: All existing functionality and responsive behavior
// ✅ ENHANCED: Proper tree navigation with expand/collapse functionality
// ✅ FALLBACK: Static menu structure when database unavailable
// ✅ VISUALS: Ported "Glassmorphism" & Gradients from IAF Main
// ============================================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

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
  CircularProgress // ✅ Import CircularProgress
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

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
} from './BankingSidebarUtils';

import { MenuItem, DatabaseMenuItem } from './types';

import MuiMenu from '@mui/material/Menu';
import MuiMenuItem from '@mui/material/MenuItem';

// Import menu service for database-driven menus
import { useGetMenuTreeQuery } from '@/store/api/menuApi';

// Import centralized menu configuration
import { menuConfig, getMenuIcon } from '@/config/menu-config';

// Import hierarchical menu utilities
import {
  findMenuItemByPath,
  filterHierarchicalMenu,
  HierarchicalMenuItem,
  validateMenuHierarchy
} from '@/utils/menu-hierarchy';
import { usePermission } from '@/hooks/usePermission';

// Import menu state management hook
import { useMenuState } from '@/hooks/useMenuState';
import { getAuthToken } from '@/utils/auth-token'; // ✅ Import token utility
import { MenuSkeleton } from '../common/MenuSkeleton'; // ✅ Import Skeleton loader
import { usePendingApprovalCount } from '@/hooks/usePendingApprovalCount'; // ✅ Approval badge

// Database menu item structure (from API)

// IAF-SPECIFIC SITEMAP STRUCTURE - Based on IAF Navigation Requirements

// ✅ Enhanced Sidebar Props
interface BankingSidebarProps {
  width?: number;
  bankingMode?: 'conventional' | 'syariah' | 'dual';
  userRole?: string;
  roleCodes?: string[];
  userPermissions?: string[]; // ✅ Add userPermissions for granular menu filtering
  tenantContext?: string;
  collapsed?: boolean;
  appBarHeight?: number;
  onMenuClick?: (menuId: string, href?: string) => void;
}

// --- MEMOIZED SIDEBAR ITEM COMPONENT ---
const SidebarItem = React.memo(({
  item,
  level,
  collapsed,
  expandedItems,
  activeItems,
  selectedItemId,
  onExpandToggle,
  onNavigate,
  onPrefetch,
  onFlyoutOpen,
  onMenuClick
}: {
  item: HierarchicalMenuItem;
  level: number;
  collapsed: boolean;
  expandedItems: Set<string>;
  activeItems: Set<string>;
  selectedItemId: string | null;
  onExpandToggle: (id: string) => void;
  onNavigate: (item: HierarchicalMenuItem) => void;
  onPrefetch: (rawUrl?: string | null) => void;
  onFlyoutOpen: (e: React.MouseEvent<HTMLElement>, item: HierarchicalMenuItem) => void;
  onMenuClick?: (id: string, url?: string) => void;
}) => {
  const { hasPermission } = usePermission();
  const theme = useTheme(); // Hook for theme access if needed

  const { isAllowed, visibleChildren } = React.useMemo(() => {
    const canAccessItem = (menuItem: HierarchicalMenuItem): boolean => {
      const requiredPermissions = menuItem.requiredPermissions || [];
      const isSelfAllowed =
        requiredPermissions.length === 0 ||
        requiredPermissions.some((code) => hasPermission(code));

      if (isSelfAllowed) return true;
      if (!menuItem.children || menuItem.children.length === 0) return false;

      return menuItem.children.some((child) => canAccessItem(child));
    };

    const children = (item.children || []).filter((child) => canAccessItem(child));
    const requiredPermissions = item.requiredPermissions || [];
    const isSelfAllowed =
      requiredPermissions.length === 0 ||
      requiredPermissions.some((code) => hasPermission(code));

    return {
      isAllowed: isSelfAllowed || children.length > 0,
      visibleChildren: children,
    };
  }, [item, hasPermission]);

  if (!isAllowed) return null;

  const hasChildren = visibleChildren.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isActiveParent = activeItems.has(item.id);
  const isSelected = selectedItemId === item.id;
  const isLeafLink = Boolean(item.url && !hasChildren);

  // Recursive render for children
  const childElements = hasChildren && !collapsed && isExpanded ? (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <List component="div" disablePadding sx={{ pb: 0.25 }}>
        {visibleChildren.map(child => (
          <SidebarItem
            key={child.id}
            item={child}
            level={level + 1}
            collapsed={collapsed}
            expandedItems={expandedItems}
            activeItems={activeItems}
            selectedItemId={selectedItemId}
            onExpandToggle={onExpandToggle}
            onNavigate={onNavigate}
            onPrefetch={onPrefetch}
            onFlyoutOpen={onFlyoutOpen}
            onMenuClick={onMenuClick}
          />
        ))}
      </List>
    </Collapse>
  ) : null;

  return (
    <React.Fragment>
      <ListItem disablePadding sx={{ pl: collapsed ? 0 : level * 1.5, display: 'block' }}>
        <Tooltip title={collapsed ? `${item.title}${item.description ? ' - ' + item.description : ''}` : item.description || ''} placement="right" arrow>
          <ListItemButton
            onClick={(e) => {
              if (collapsed && hasChildren) {
                onFlyoutOpen(e, { ...item, children: visibleChildren });
              } else if (hasChildren) {
                onExpandToggle(item.id);
                visibleChildren.forEach((child) => onPrefetch(child.url));
              } else if (item.url) {
                onMenuClick?.(item.id, item.url);
              }
            }}
            onMouseEnter={() => {
              if (isLeafLink) onPrefetch(item.url);
            }}
            component={isLeafLink ? (Link as any) : undefined}
            href={isLeafLink ? item.url : undefined}
            prefetch={isLeafLink ? true : undefined}
            scroll={isLeafLink ? false : undefined}
            sx={{
              minHeight: collapsed ? 48 : (level === 0 ? 44 : 36), // Slightly taller for comfort
              borderRadius: '12px', // Modern Rounded Corners
              mx: collapsed ? 0.5 : 1, // Add margin
              mb: 0.5,
              px: collapsed ? 0.5 : 1.5,
              py: 0.5,
              position: 'relative',
              
              // MAGIC: Glassmorphism Active State
              backgroundColor: isSelected 
                ? 'rgba(255, 255, 255, 0.15)' 
                : (isActiveParent && !collapsed ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
              backdropFilter: isSelected ? 'blur(12px)' : 'none',
              boxShadow: isSelected ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
              border: isSelected 
                ? '1px solid rgba(255,255,255,0.2)' 
                : '1px solid transparent', // Prevent layout shift
              justifyContent: collapsed ? 'center' : 'flex-start',
              
              // ⚡ TURBO: Extremely snappy transition
              transition: 'all 0.15s cubic-bezier(0, 0, 0.2, 1)',
              
              // Active Left Indicator (Glow)
              '&::before': isSelected && !collapsed ? {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '4px',
                  height: '20px',
                  backgroundColor: '#ffffff',
                  borderRadius: '0 4px 4px 0',
                  boxShadow: '0 0 10px rgba(255,255,255,0.5)'
              } : {},

              '&:hover': {
                backgroundColor: isSelected 
                  ? 'rgba(255, 255, 255, 0.25)' 
                  : 'rgba(255, 255, 255, 0.08)',
                transform: collapsed ? 'none' : 'translateX(6px)', // Smooth slide effect on hover
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 'unset' : 32, // Adjusted for new style
                justifyContent: 'center',
                color: (isSelected || isActiveParent) ? '#ffffff' : 'rgba(255,255,255,0.7)',
                filter: isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
                '& svg': {
                  fontSize: collapsed ? '1.4rem' : '1.2rem',
                  transition: '0.2s'
                }
              }}
            >
              {getIconFromDatabaseString(item.icon) as any}
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography 
                      variant={level === 0 ? 'body2' : 'caption'} 
                      sx={{
                        fontWeight: isSelected ? 700 : (isActiveParent ? 600 : 500),
                        color: (isSelected || isActiveParent) ? '#ffffff' : 'rgba(255,255,255,0.85)',
                        fontSize: level === 0 ? '0.85rem' : '0.78rem',
                        lineHeight: 1.4,
                        letterSpacing: '0.3px',
                        textShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.2)' : 'none'
                      }}
                    >
                      {item.title}
                    </Typography>
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
                      color: alpha('#fff', 0.5), // ✅ FIXED: Dimmed white description
                      fontSize: '0.65rem', 
                      lineHeight: 1.2, 
                      mt: 0.25, 
                      display: 'block' 
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
                color: alpha('#fff', 0.5), // ✅ FIXED: Dimmed white arrow
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
      {childElements}
    </React.Fragment>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.collapsed === nextProps.collapsed &&
    prevProps.expandedItems === nextProps.expandedItems &&
    prevProps.activeItems === nextProps.activeItems &&
    prevProps.selectedItemId === nextProps.selectedItemId &&
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.title === nextProps.item.title
  );
});

export const BankingSidebar: React.FC<BankingSidebarProps> = ({
  width = 320,
  bankingMode = 'conventional', // ✅ FIXED: Now properly receives banking mode from parent
  userRole = '',
  roleCodes = [], // ✅ Add roleCodes parameter
  userPermissions = [], // ✅ Add userPermissions parameter
  tenantContext,
  collapsed = false,
  appBarHeight = 50,
  onMenuClick
}) => {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // ✅ Pending approval badge count (polling every 30s)
  const { count: pendingApprovalCount } = usePendingApprovalCount();

  // 🔽 FLYOUT MENU STATE
  const [flyoutAnchorEl, setFlyoutAnchorEl] = useState<null | HTMLElement>(null);
  const [flyoutItem, setFlyoutItem] = useState<HierarchicalMenuItem | null>(null);

  const handleFlyoutOpen = useCallback((event: React.MouseEvent<HTMLElement>, item: HierarchicalMenuItem) => {
    setFlyoutAnchorEl(event.currentTarget);
    setFlyoutItem(item);

    const children = item.children || [];
    children.forEach((child) => {
      if (child.url) {
        router.prefetch(child.url);
      }
    });
  }, [router]);

  const handleFlyoutClose = useCallback(() => {
    setFlyoutAnchorEl(null);
    setFlyoutItem(null);
  }, []);

  const buildNavigationUrl = useCallback((rawUrl: string) => {
    if (!rawUrl) return rawUrl;
    if (/^https?:\/\//i.test(rawUrl)) return rawUrl;

    const parsed = new URL(rawUrl, 'http://local');

    if (parsed.pathname === '/banking/individual/impairment') {
      parsed.pathname = '/banking/individual/assessment';
    } else if (parsed.pathname.startsWith('/banking/individual/impairment/')) {
      parsed.pathname = parsed.pathname.replace('/banking/individual/impairment/', '/banking/individual/');
    }

    if (
      (
        parsed.pathname.startsWith('/banking/individual/') ||
        parsed.pathname.startsWith('/banking/collective/') ||
        parsed.pathname.startsWith('/banking/ifrs9/')
      ) &&
      !parsed.searchParams.has('mode')
    ) {
      parsed.searchParams.set('mode', bankingMode);
    }

    const query = parsed.searchParams.toString();
    return `${parsed.pathname}${query ? `?${query}` : ''}${parsed.hash || ''}`;
  }, [bankingMode]);

  const handleFlyoutItemClick = (child: HierarchicalMenuItem) => {
    if (child.url) {
      const nextUrl = buildNavigationUrl(child.url);
      router.push(nextUrl);
      onMenuClick?.(child.id, nextUrl);
    }
    handleFlyoutClose();
  };

  // ✅ RTK Query: Auto-fetch and cache menu from database
  const { data: menuData, isLoading: isMenuLoading, error: menuQueryError } = useGetMenuTreeQuery(
    { bankingMode, includeInactive: false, tenantContext },
    { refetchOnMountOrArgChange: true }
  );

  // ✅ MEMOIZED MENU PROCESSING
  const hierarchicalMenu = React.useMemo(() => {
    let rawItems: HierarchicalMenuItem[] = [];
    const idsToRemove = new Set([
      'assessment-workspace-old',
      'assessment-workspace-old-imran'
    ]);

    const normalizeLegacyUrls = (items: HierarchicalMenuItem[]): HierarchicalMenuItem[] => {
      return items.map((item) => ({
        ...item,
        url: item.url ? buildNavigationUrl(item.url) : item.url,
        children: item.children ? normalizeLegacyUrls(item.children) : item.children
      }));
    };

    const stripMenuItems = (items: HierarchicalMenuItem[]): HierarchicalMenuItem[] => {
      return items
        .filter((item) => !idsToRemove.has(item.id))
        .map((item) => ({
          ...item,
          children: item.children ? stripMenuItems(item.children) : item.children
        }));
    };

    // Determine source: RTK Query data or Cache
    if (Array.isArray(menuData)) {
      rawItems = menuData.map((item: any) => {
        const mapToHierarchical = (dbItem: any, level: number): HierarchicalMenuItem => ({
          id: dbItem.id,
          key: dbItem.menu_key || dbItem.key || dbItem.id,
          title: dbItem.title || dbItem.label || 'Unknown',
          description: dbItem.description,
          icon: dbItem.icon || 'dashboard',
          url: dbItem.url || dbItem.href || (dbItem.menu_key === 'application-configuration' || dbItem.key === 'application-configuration' ? '/banking/setup/application' : (dbItem.menu_key === 'business-configuration' || dbItem.key === 'business-configuration' ? '/banking/setup/business' : null)),
          type: dbItem.type || (dbItem.children && dbItem.children.length > 0 ? 'group' : 'item'),
          level,
          sort_order: dbItem.sort_order || 0,
          parent_id: dbItem.parent_id || null,
          expanded: false,
          active: dbItem.is_active !== false,
          visible: true,
          permissions: dbItem.user_types || dbItem.roles || [],
          requiredPermissions: dbItem.requiredPermissions,
          banking_modes: dbItem.banking_types || dbItem.banking_modes || ['conventional', 'syariah', 'dual'],
          user_types: dbItem.user_types || dbItem.roles || [],
          tenant_types: [],
          children: dbItem.children?.map((child: any) => mapToHierarchical(child, level + 1)) || [],
          metadata: { badge_info: dbItem.badge_info, isNew: dbItem.isNew, requiresSetup: dbItem.requiresSetup || dbItem.requires_setup }
        });
        return mapToHierarchical(item, item.parent_id ? 2 : 1);
      });
    } else if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('cached_menu_structure');
      if (cached) try { rawItems = JSON.parse(cached); } catch (e) { console.warn('Failed to parse cached menu', e); }
    }

    if (rawItems.length > 0) {
      rawItems = normalizeLegacyUrls(rawItems);
      rawItems = stripMenuItems(rawItems);
    }

    // Filter by role/permissions/banking mode (IAF logic moved to utility)
    return filterHierarchicalMenu(rawItems, bankingMode, userPermissions);
  }, [menuData, isMenuLoading, bankingMode, userPermissions, buildNavigationUrl]);

  // ✅ Inject live pending badge into Approval menu items
  const menuWithBadges = React.useMemo(() => {
    if (pendingApprovalCount === 0) return hierarchicalMenu;
    const injectBadge = (items: HierarchicalMenuItem[]): HierarchicalMenuItem[] =>
      items.map(item => {
        const isApprovalItem = item.url?.includes('/workflow/approval') || item.id?.includes('approval');
        return {
          ...item,
          metadata: isApprovalItem
            ? { ...item.metadata, badge_info: { content: String(pendingApprovalCount > 99 ? '99+' : pendingApprovalCount), color: 'error' as const } }
            : item.metadata,
          children: item.children ? injectBadge(item.children) : item.children,
        };
      });
    return injectBadge(hierarchicalMenu);
  }, [hierarchicalMenu, pendingApprovalCount]);

  // Use hierarchical menu state management
  const menuState = useMenuState(hierarchicalMenu);

  const handleNavigate = useCallback((item: HierarchicalMenuItem) => {
    if (!item.url) return;
    const nextUrl = buildNavigationUrl(item.url);
    router.push(nextUrl);
  }, [buildNavigationUrl, router]);

  const handlePrefetch = useCallback((rawUrl?: string | null) => {
    if (!rawUrl) return;
    const nextUrl = buildNavigationUrl(rawUrl);
    router.prefetch(nextUrl);
  }, [buildNavigationUrl, router]);

  // Auto-expand first section for better UX
  useEffect(() => {
    if (hierarchicalMenu.length > 0 && hierarchicalMenu[0].children && hierarchicalMenu[0].children.length > 0) {
      menuState.expandItem(hierarchicalMenu[0].id);
    }
  }, [hierarchicalMenu]);

  // ✅ TOP-LEVEL RENDER: Recursive calls replaced by SidebarItem component
  const menuItems = React.useMemo(() => {
    return menuWithBadges.map(item => (
      <SidebarItem
        key={item.id}
        item={item}
        level={0}
        collapsed={collapsed}
        expandedItems={menuState.expandedItems}
        activeItems={menuState.activeItems}
        selectedItemId={menuState.selectedItem}
        onExpandToggle={menuState.toggleExpansion}
        onNavigate={handleNavigate}
        onPrefetch={handlePrefetch}
        onFlyoutOpen={handleFlyoutOpen}
        onMenuClick={onMenuClick}
      />
    ));
  }, [menuWithBadges, collapsed, menuState.expandedItems, menuState.activeItems, menuState.selectedItem, handleNavigate, handleFlyoutOpen, onMenuClick, menuState.toggleExpansion, handlePrefetch]);

  // Get top level page URL for logo link
  const getTopLevelRoute = () => {
    if (!pathname) return '/banking/dashboard';
    const pathSegments = pathname.split('/');
    return pathSegments.length >= 3 ? `/banking/${pathSegments[2]}` : '/banking/dashboard';
  };

  // ✅ SURGICAL FIX: Dynamic banking mode functions
  const getBankingModeLabel = () => {
    switch (bankingMode) {
      case 'syariah': return 'Syariah Compliant';
      case 'dual': return 'Dual Banking';
      default: return 'Conventional Banking';
    }
  };

  const getBankingModeIcon = () => {
    switch (bankingMode) {
      case 'syariah': return <Mosque sx={{ fontSize: '0.7rem' }} />;
      case 'dual': return <SwapHoriz sx={{ fontSize: '0.7rem' }} />;
      default: return <AccountBalance sx={{ fontSize: '0.7rem' }} />;
    }
  };

  return (
    <Box
      sx={{
        width,
        height: '100%',
        // ✅ MODERN UI: Dynamic Gradient Backgrounds
        background: bankingMode === 'syariah'
          ? 'linear-gradient(135deg, #00695c 0%, #004d40 100%)' // Deep Teal for Syariah
          : bankingMode === 'dual'
          ? 'linear-gradient(135deg, #37474f 0%, #263238 100%)' // Blue Grey for Dual
          : 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)', // Classic Professional Blue
        color: '#ffffff',
        borderRight: 'none',
        overflow: 'hidden', // Hide default scrollbar
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '4px 0 24px rgba(0,0,0,0.15)', // Stronger shadow for depth
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
      }}
    >
      <Box 
         sx={{ 
           flex: 1, 
           overflowY: 'auto', 
           overflowX: 'hidden',
           // Custom scrollbar
           '&::-webkit-scrollbar': { width: '4px' },
           '&::-webkit-scrollbar-track': { background: 'transparent' },
           '&::-webkit-scrollbar-thumb': { 
             background: 'rgba(255,255,255,0.2)', 
             borderRadius: '10px',
             '&:hover': { background: 'rgba(255,255,255,0.4)' }
           } 
         }}
      >
        {/* Header */}
        <Box
          sx={{
            px: collapsed ? 1 : 1.5,
            height: appBarHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            backgroundColor: 'transparent', // ✅ FIXED: Transparent
            color: 'white',
            borderBottom: `1px solid ${alpha('#fff', 0.1)}`
          }}
        >
          {collapsed ? (
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: alpha(theme.palette.common.white, 0.2), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '0.875rem' }}>IAF</Typography>
            </Box>
          ) : (
            <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>IAF IFRS 9 Platform</Typography>
          )}
        </Box>

        {/* Navigation Menu */}
        <List sx={{ p: collapsed ? 0.5 : 1.5 }}>
          {isMenuLoading && hierarchicalMenu.length === 0 ? (
            <MenuSkeleton />
          ) : menuQueryError && hierarchicalMenu.length === 0 ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <ErrorOutline sx={{ fontSize: 24, color: 'error.main', mb: 1 }} />
              <Typography variant="caption" color="text.secondary" display="block">Failed to load menu</Typography>
              <Typography variant="caption" color="primary" sx={{ cursor: 'pointer' }} onClick={() => window.location.reload()}>Retry</Typography>
            </Box>
          ) : (
            menuItems
          )}
        </List>
      </Box>

      {/* Flyout Menu for Collapsed Sidebar */}
      <MuiMenu
        anchorEl={flyoutAnchorEl}
        open={Boolean(flyoutAnchorEl)}
        onClose={handleFlyoutClose}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
        sx={{
          '& .MuiPaper-root': {
            ml: 1,
            backgroundColor: '#1565C0',
            color: 'white',
            minWidth: 180,
            boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.1)'
          }
        }}
      >
        {flyoutItem?.children?.map((child) => (
          <MuiMenuItem
            key={child.id}
            onClick={() => handleFlyoutItemClick(child)}
            sx={{
              fontSize: '0.8rem',
              py: 1,
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
            }}
          >
            {child.title}
          </MuiMenuItem>
        ))}
      </MuiMenu>

      {/* Footer Info */}
      <Box sx={{ mt: 'auto', px: collapsed ? 1 : 1.5, py: collapsed ? 1 : 1.5, borderTop: `1px solid ${alpha('#fff', 0.1)}`, backgroundColor: 'transparent' }}>
        {!collapsed && (
          <>
            <Link href={getTopLevelRoute()} style={{ textDecoration: 'none' }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                gap: 1,
                mb: 1,
                mt: 1,
                cursor: 'pointer',
                '&:hover': { transform: 'scale(1.02)' },
                transition: 'transform 0.2s'
              }}>
                <Image 
                  src="/images/logo-iaf.png" 
                  alt="IAF Logo" 
                  height={28}
                  width={120}
                  style={{ 
                    height: '28px', 
                    width: 'auto',
                    filter: 'brightness(0) invert(1)' 
                  }} 
                />
                 <Typography 
                  variant="caption" 
                  align="center" 
                  display="block"
                  sx={{ 
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: '#ffffff'
                  }}
                >
                  Indonesia Airawata Finance
                </Typography>
              </Box>
            </Link>
            <Typography variant="caption" align="center" display="block" sx={{ fontSize: '0.65rem', color: alpha('#fff', 0.7) }}>
              IFRS 9 Platform v2.0
            </Typography>
            <Typography variant="caption" align="center" display="block" sx={{ fontSize: '0.6rem', color: alpha('#fff', 0.7), mb: 0.5 }}>
              {getBankingModeLabel()}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5, mt: 0.5 }}>
              <Chip
                icon={getBankingModeIcon()}
                label={bankingMode === 'syariah' ? 'Halal' : 'Compliant'}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.55rem', 
                  height: 18, 
                  color: 'white', 
                  borderColor: alpha('#fff', 0.3),
                  '& .MuiChip-icon': { color: 'white', fontSize: '0.7rem' } 
                }}
              />
              <Chip
                icon={<CheckCircle />}
                label="Online"
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.55rem', 
                  height: 18, 
                  color: 'white', 
                  borderColor: alpha('#fff', 0.3),
                  '& .MuiChip-icon': { color: 'white', fontSize: '0.7rem' } 
                }}
              />
            </Box>
          </>
        )}
         {collapsed && (
          <Link href={getTopLevelRoute()} style={{ textDecoration: 'none' }}>
             <Box sx={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }}>
                 <Image 
                   src="/images/logo-iaf.png" 
                   alt="IAF" 
                   height={24}
                   width={24}
                   style={{ 
                     height: '24px', 
                     width: 'auto',
                     filter: 'brightness(0) invert(1)'
                  }} 
                />
             </Box>
          </Link>
        )}
      </Box>
    </Box>
  );
};

export default BankingSidebar;
