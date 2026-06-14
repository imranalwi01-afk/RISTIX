'use client';

// packages/frontend/src/components/navigation/DatabaseDrivenMenu.tsx
// ============================================================================
// Database-Driven Menu Component for IFRS9 Platform
// ============================================================================
// Generated: 2025-01-12
// Purpose: Dynamic menu rendering with multi-tenant and banking type support
// Methodology: Core Platform MVP - Frontend Menu Integration
// Dependencies: React, Material-UI, Redux Toolkit, Menu API
// ============================================================================

import React, { useEffect, useState, useMemo } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  Typography,
  Box,
  Tooltip,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Tune as TuneIcon,
  AccountBalance as AccountBalanceIcon,
  Calculate as CalculateIcon,
  Assessment as AssessmentIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Business as BusinessIcon,
  MonitorHeart as MonitorHeartIcon,
  Analytics as AnalyticsIcon,
  Handshake as ConsultingIcon,
  FolderOpen as FolderOpenIcon,
  School as SchoolIcon,
  Gavel as GavelIcon,
  SupervisorAccount as SupervisorAccountIcon,
  FactCheck as FactCheckIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchUserMenu,
  selectMenuState,
  logMenuAccess
} from '@/store/slices/menuSlice';
import { selectAuthState, RootState } from '@/store';
import { menuApi } from '@/services/api/menu.api';

// Icon mapping for menu items
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  DashboardIcon,
  SettingsIcon,
  TuneIcon,
  AccountBalanceIcon,
  CalculateIcon,
  AssessmentIcon,
  AdminPanelSettingsIcon,
  BusinessIcon,
  MonitorHeartIcon,
  AnalyticsIcon,
  ConsultingIcon,
  FolderOpenIcon,
  SchoolIcon,
  GavelIcon,
  SupervisorAccountIcon,
  FactCheckIcon,
  VerifiedIcon
};

export interface MenuItem {
  id: string;
  key: string;
  title: string;
  description?: string;
  icon?: string;
  url?: string;
  type: 'group' | 'item' | 'divider';
  children?: MenuItem[];
  permissions?: string[];
  external?: boolean;
  target?: '_self' | '_blank' | '_parent' | '_top';
  breadcrumb?: boolean;
}

export interface MenuConfiguration {
  id: string;
  name: string;
  description: string;
  target_audience: string;
  banking_mode?: string;
  version: string;
}

interface DatabaseDrivenMenuProps {
  width?: number;
  open?: boolean;
  variant?: 'permanent' | 'persistent' | 'temporary';
  onClose?: () => void;
  showUserContext?: boolean;
  enableAnalytics?: boolean;
}

export const DatabaseDrivenMenu: React.FC<DatabaseDrivenMenuProps> = ({
  width = 280,
  open = true,
  variant = 'permanent',
  onClose,
  showUserContext = true,
  enableAnalytics = true
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();

  // Redux state
  const auth = useSelector((state: RootState) => state.auth);
  const { user, isAuthenticated, tenantId, tenantSlug, bankingMode } = auth || {};

  // Synthesize tenant context from auth state since tenantSlice is missing
  const currentTenant = useMemo(() => {
    if (!tenantId && !tenantSlug) return null;
    return {
      id: tenantId,
      slug: tenantSlug,
      name: user?.company || tenantSlug || 'Tenant',
      banking_type: bankingMode || user?.bankingType || 'conventional'
    };
  }, [tenantId, tenantSlug, user, bankingMode]);

  const menuState = useSelector(selectMenuState);
  const {
    menuConfiguration,
    menuItems,
    loading,
    error,
    lastFetched
  } = menuState || {};

  // Local state
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [accessStartTime, setAccessStartTime] = useState<number>(0);

  // Load menu data when component mounts or user/tenant changes
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchUserMenu() as any);
    }
  }, [dispatch, isAuthenticated, user, currentTenant]);

  // Auto-expand current menu item
  useEffect(() => {
    if (menuItems && pathname) {
      const expandPath = (items: MenuItem[], path: string): void => {
        items.forEach(item => {
          if (item.url === path && item.type === 'item') {
            // Find parent groups and expand them
            const findParents = (allItems: MenuItem[], targetId: string, parents: string[] = []): string[] => {
              for (const menuItem of allItems) {
                if (menuItem.children) {
                  const found = menuItem.children.find(child => child.id === targetId);
                  if (found) {
                    return [...parents, menuItem.id];
                  }
                  const childParents = findParents(menuItem.children, targetId, [...parents, menuItem.id]);
                  if (childParents.length > parents.length) {
                    return childParents;
                  }
                }
              }
              return parents;
            };

            const parentIds = findParents(menuItems, item.id);
            setExpandedItems(prev => new Set([...prev, ...parentIds]));
          }

          if (item.children) {
            expandPath(item.children, path);
          }
        });
      };

      expandPath(menuItems, pathname);
    }
  }, [menuItems, pathname]);

  // Track access start time for analytics
  useEffect(() => {
    if (enableAnalytics) {
      setAccessStartTime(Date.now());
    }
  }, [pathname, enableAnalytics]);

  // Memoized menu items rendering
  const renderedMenuItems = useMemo(() => {
    if (!menuItems) return null;
    return renderMenuItems(menuItems, 0);
  }, [menuItems, expandedItems, pathname]);

  // Handle menu item click
  const handleMenuItemClick = async (item: MenuItem) => {
    if (!item.url) return;

    // Log analytics if enabled
    if (enableAnalytics && accessStartTime) {
      try {
        dispatch(logMenuAccess({
          menu_item_id: item.id,
          accessed_url: item.url,
          response_time: Date.now() - accessStartTime
        }) as any);
      } catch (error) {
        console.warn('Failed to log menu access:', error);
      }
    }

    // Navigate to URL
    if (item.external) {
      window.open(item.url, item.target || '_blank');
    } else {
      router.push(item.url);
      if (variant === 'temporary' && onClose) {
        onClose();
      }
    }
  };

  // Handle group expand/collapse
  const handleGroupToggle = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // Render individual menu items
  const renderMenuItems = (items: MenuItem[], depth: number): React.ReactNode => {
    return items.map((item) => {
      if (item.type === 'divider') {
        return <Divider key={item.id} sx={{ my: 1 }} />;
      }

      if (item.type === 'group') {
        const isExpanded = expandedItems.has(item.id);
        const hasChildren = item.children && item.children.length > 0;

        return (
          <React.Fragment key={item.id}>
            <ListItem disablePadding sx={{ pl: depth * 2 }}>
              <ListItemButton
                onClick={() => hasChildren && handleGroupToggle(item.id)}
                sx={{
                  minHeight: 48,
                  borderRadius: 1,
                  mb: 0.5
                }}
              >
                {item.icon && (
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getMenuIcon(item.icon)}
                  </ListItemIcon>
                )}
                <ListItemText
                  primary={item.title}
                  secondary={item.description}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.75rem',
                    color: 'text.secondary'
                  }}
                />
                {hasChildren && (isExpanded ? <ExpandLess /> : <ExpandMore />)}
              </ListItemButton>
            </ListItem>

            {hasChildren && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {renderMenuItems(item.children!, depth + 1) as any}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        );
      }

      // Menu item
      const isActive = pathname === item.url;
      const IconComponent = item.icon ? getMenuIcon(item.icon) : null;

      return (
        <ListItem key={item.id} disablePadding sx={{ pl: depth * 2 }}>
          <Tooltip
            title={item.description || item.title}
            placement="right"
            arrow
          >
            <ListItemButton
              selected={isActive}
              onClick={() => handleMenuItemClick(item)}
              sx={{
                minHeight: 44,
                borderRadius: 1,
                mb: 0.5,
                backgroundColor: isActive ? 'action.selected' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive ? 'action.selected' : 'action.hover'
                },
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  },
                  '& .MuiListItemIcon-root': {
                    color: 'inherit'
                  }
                }
              }}
            >
              {IconComponent && (
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Badge
                    variant="dot"
                    color="error"
                    invisible={!item.external}
                    sx={{
                      '& .MuiBadge-badge': {
                        right: -3,
                        top: 3,
                      }
                    }}
                  >
                    {IconComponent}
                  </Badge>
                </ListItemIcon>
              )}
              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 400,
                  noWrap: true
                }}
              />
            </ListItemButton>
          </Tooltip>
        </ListItem>
      );
    });
  };

  // Get icon component from string
  const getMenuIcon = (iconName: string) => {
    const IconComponent = ICON_MAP[iconName];
    if (IconComponent) {
      return <IconComponent fontSize="small" />;
    }
    return <DashboardIcon fontSize="small" />; // Default icon
  };

  // Render user context info
  const renderUserContext = () => {
    if (!showUserContext || !user) return null;

    return (
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle2" fontWeight={600} color="primary">
          {currentTenant?.name || 'Platform Administration'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user.fullName || user.username}
        </Typography>
        {currentTenant && (
          <Typography variant="caption" display="block" color="text.secondary">
            {currentTenant.banking_type?.charAt(0).toUpperCase() + currentTenant.banking_type?.slice(1)} Banking
          </Typography>
        )}
        {menuConfiguration && (
          <Typography variant="caption" display="block" color="text.secondary">
            Menu v{menuConfiguration.version}
          </Typography>
        )}
      </Box>
    );
  };

  // Loading state
  if (loading) {
    return (
      <Drawer
        variant={variant}
        open={open}
        onClose={onClose}
        sx={{
          width: width,
          '& .MuiDrawer-paper': {
            width: width,
            boxSizing: 'border-box'
          }
        }}
      >
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          <CircularProgress size={40} />
        </Box>
      </Drawer>
    );
  }

  // Error state
  if (error) {
    return (
      <Drawer
        variant={variant}
        open={open}
        onClose={onClose}
        sx={{
          width: width,
          '& .MuiDrawer-paper': {
            width: width,
            boxSizing: 'border-box'
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load menu: {error}
          </Alert>
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: width,
        '& .MuiDrawer-paper': {
          width: width,
          boxSizing: 'border-box',
          borderRight: 1,
          borderColor: 'divider'
        }
      }}
    >
      {renderUserContext()}

      <Box sx={{ overflow: 'auto', flex: 1 }}>
        <List sx={{ px: 1, py: 2 }}>
          {renderedMenuItems as any}
        </List>
      </Box>

      {/* Footer info */}
      {menuConfiguration && (
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            {menuConfiguration.name}
          </Typography>
          {currentTenant && (
            <Typography variant="caption" display="block" color="text.secondary">
              Tenant: {currentTenant.slug}
            </Typography>
          )}
        </Box>
      )}
    </Drawer>
  );
};

export default DatabaseDrivenMenu;