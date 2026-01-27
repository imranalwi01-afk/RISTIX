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

import React, { useState, useEffect, useRef, useCallback } from 'react';

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
import { usePermission } from '@/hooks/usePermission';

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
  onFlyoutOpen: (e: React.MouseEvent<HTMLElement>, item: HierarchicalMenuItem) => void;
  onMenuClick?: (id: string, url?: string) => void;
}) => {
  const { hasPermission } = usePermission();

  const isAllowed = React.useMemo(() => {
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) return true;
    return item.requiredPermissions.some((code) => hasPermission(code));
  }, [item.requiredPermissions, hasPermission]);

  if (!isAllowed) return null;

  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.id);
  const isActiveParent = activeItems.has(item.id);
  const isSelected = selectedItemId === item.id;

  // Recursive render for children
  const childElements = hasChildren && !collapsed && isExpanded ? (
    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
      <List component="div" disablePadding sx={{ pb: 0.25 }}>
        {item.children!.map(child => (
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
            onFlyoutOpen={onFlyoutOpen}
            onMenuClick={onMenuClick}
          />
        ))}
      </List>
    </Collapse>
  ) : null;

  return (
    <React.Fragment>
      <ListItem disablePadding sx={{ pl: collapsed ? 0 : level * 2.5, display: 'block' }}>
        <Tooltip title={collapsed ? `${item.title}${item.description ? ' - ' + item.description : ''}` : item.description || ''} placement="right" arrow>
          <ListItemButton
            onClick={(e) => {
              if (collapsed && hasChildren) {
                onFlyoutOpen(e, item);
              } else if (hasChildren) {
                onExpandToggle(item.id);
              } else if (item.url) {
                onNavigate(item);
                onMenuClick?.(item.id, item.url);
              }
            }}
            sx={{
              minHeight: level === 0 ? 50 : 42,
              borderRadius: collapsed ? 0 : '0 24px 24px 0',
              mb: 0.5,
              px: collapsed ? 1 : 2,
              py: 0.75,
              position: 'relative',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              backgroundColor: isSelected ? 'rgba(255, 255, 255, 0.12)' : (isActiveParent && !isSelected ? 'rgba(255, 255, 255, 0.05)' : 'transparent'),
              background: isSelected ? 'linear-gradient(90deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%)' : 'transparent',
              '&::before': {
                content: '""',
                position: 'absolute',
                left: level === 0 ? 0 : -2, // Pull bar back slightly for nested items
                top: 8,
                bottom: 8,
                width: 3,
                borderRadius: '0 4px 4px 0',
                backgroundColor: '#ffffff',
                opacity: isSelected ? 1 : 0,
                transition: 'opacity 0.2s ease',
                boxShadow: isSelected ? '0 0 6px rgba(255, 255, 255, 0.4)' : 'none'
              },
              justifyContent: collapsed ? 'center' : 'flex-start',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: collapsed ? 'none' : 'translateX(3px)',
                '& .MuiListItemIcon-root': { color: '#ffffff', transform: 'scale(1.05)' }
              }
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: collapsed ? 'unset' : 36, // Increased from 28 for better spacing
                justifyContent: 'center',
                color: (isSelected || isActiveParent) ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: isSelected ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.3))' : 'none',
                transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                '& svg': { fontSize: collapsed ? '1.4rem' : '1.3rem', transition: 'all 0.3s ease' }
              }}
            >
              {getIconFromDatabaseString(item.icon) as any}
            </ListItemIcon>

            {!collapsed && (
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant={level === 0 ? 'body2' : 'caption'} sx={{
                      fontWeight: isSelected ? 700 : (isActiveParent ? 600 : 500),
                      color: (isSelected || isActiveParent) ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                      fontSize: level === 0 ? '0.85rem' : '0.8rem',
                      lineHeight: 1.4,
                      letterSpacing: level === 0 ? '0.01em' : 'normal'
                    }}>
                      {item.title}
                    </Typography>
                    {item.metadata?.badge_info && <Chip label={item.metadata.badge_info.content} size="small" color={item.metadata.badge_info.color || 'primary'} sx={{ height: 16, fontSize: '0.6rem', minWidth: 20 }} />}
                    {item.metadata?.isNew && <Chip label="NEW" size="small" color="success" sx={{ height: 14, fontSize: '0.6rem', minWidth: 26 }} />}
                  </Box>
                }
                secondary={level === 0 && item.description && !item.description.endsWith('Root') ? (
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.55)', fontSize: '0.68rem', lineHeight: 1.2, mt: 0.25, display: 'block' }}>
                    {item.description}
                  </Typography>
                ) : null}
                sx={{ my: 0, ml: 0.5 }}
              />
            )}

            {hasChildren && !collapsed && (
              <Box sx={{ color: isActiveParent ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)', ml: 'auto', '& svg': { fontSize: '0.9rem' } }}>
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
  collapsed = false,
  appBarHeight = 50,
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

  const handleFlyoutOpen = useCallback((event: React.MouseEvent<HTMLElement>, item: HierarchicalMenuItem) => {
    setFlyoutAnchorEl(event.currentTarget);
    setFlyoutItem(item);
  }, []);

  const handleFlyoutClose = useCallback(() => {
    setFlyoutAnchorEl(null);
    setFlyoutItem(null);
  }, []);

  const handleFlyoutItemClick = (child: HierarchicalMenuItem) => {
    if (child.url) {
      router.push(child.url);
      onMenuClick?.(child.id, child.url);
    }
    handleFlyoutClose();
  };

  // ✅ RTK Query: Auto-fetch and cache
  // 🚫 DISABLED: Skip menu hierarchy fetch to prevent 401 errors
  const shouldSkip = true; // Force skip menu API call
  const { data: menuData, isLoading: isMenuLoading, error: menuQueryError } = useGetMenuTreeQuery(
    { bankingMode, includeInactive: false },
    { skip: shouldSkip }
  );

  // ✅ MEMOIZED MENU PROCESSING
  const hierarchicalMenu = React.useMemo(() => {
    let rawItems: HierarchicalMenuItem[] = [];

    // Determine source: RTK Query data or Cache
    if (menuData && Array.isArray(menuData) && menuData.length > 0) {
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
      if (cached) try { rawItems = JSON.parse(cached); } catch (e) { }
    }

    if (rawItems.length === 0 && !isMenuLoading) {
      const fallbackMenu = getStaticFallbackMenu();
      rawItems = transformFlatToHierarchical(fallbackMenu);
    }

    // Filter by role/permissions/banking mode (IAF logic moved to utility)
    return filterHierarchicalMenu(rawItems, bankingMode, userPermissions);
  }, [menuData, isMenuLoading, bankingMode, userPermissions]);

  // Use hierarchical menu state management
  const menuState = useMenuState(hierarchicalMenu);

  // Auto-expand first section for better UX
  useEffect(() => {
    if (hierarchicalMenu.length > 0 && hierarchicalMenu[0].children && hierarchicalMenu[0].children.length > 0) {
      menuState.expandItem(hierarchicalMenu[0].id);
    }
  }, [hierarchicalMenu]);

  // ✅ TOP-LEVEL RENDER: Recursive calls replaced by SidebarItem component
  const menuItems = React.useMemo(() => {
    return hierarchicalMenu.map(item => (
      <SidebarItem
        key={item.id}
        item={item}
        level={0}
        collapsed={collapsed}
        expandedItems={menuState.expandedItems}
        activeItems={menuState.activeItems}
        selectedItemId={menuState.selectedItem}
        onExpandToggle={menuState.toggleExpansion}
        onNavigate={menuState.navigateToMenu}
        onFlyoutOpen={handleFlyoutOpen}
        onMenuClick={onMenuClick}
      />
    ));
  }, [hierarchicalMenu, collapsed, menuState.expandedItems, menuState.activeItems, menuState.selectedItem, handleFlyoutOpen, onMenuClick, menuState.toggleExpansion, menuState.navigateToMenu]);

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
        background: 'linear-gradient(180deg, #1565C0 0%, #0D47A1 100%)',
        borderRight: 'none',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '&::-webkit-scrollbar': { width: '4px' },
        '&::-webkit-scrollbar-track': { background: 'transparent' },
        '&::-webkit-scrollbar-thumb': { background: 'rgba(255, 255, 255, 0.3)', borderRadius: '2px' },
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
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
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          color: 'white',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
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
      <List sx={{ p: collapsed ? 0.25 : 0.5, pt: 3, flexGrow: 1 }}>
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
      <Box sx={{ mt: 'auto', px: collapsed ? 1 : 2, py: collapsed ? 1 : 2.5, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        {!collapsed && (
          <>
            <Link href={getTopLevelRoute()} style={{ textDecoration: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <img src="/images/logo-iaf.png" alt="IAF Logo" style={{ height: '32px', filter: 'brightness(0) invert(1)' }} />
              </Box>
            </Link>
            <Typography variant="caption" align="center" display="block" sx={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.9)' }}>
              IFRS 9 Platform v2.0
            </Typography>
            <Typography variant="caption" align="center" display="block" sx={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.7)', mb: 1.5 }}>
              {getBankingModeLabel()}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Chip
                icon={getBankingModeIcon()}
                label={bankingMode === 'syariah' ? 'Halal' : 'Compliant'}
                size="small"
                sx={{ fontSize: '0.6rem', height: 20, backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', '& .MuiChip-icon': { color: 'white' } }}
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default BankingSidebar;
