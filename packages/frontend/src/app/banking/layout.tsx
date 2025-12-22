// packages/frontend/src/app/banking/layout.tsx
// ============================================================================
// 🔧 SURGICAL FIX: Dynamic Banking Mode Display in Profile Menu
// ============================================================================
// ✅ FIXED: Banking mode now reads from Redux store
// ✅ ENHANCED: Profile menu shows correct banking type
// ✅ PRESERVED: All existing perfect functionality
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux'; // ✅ ADD: Import Redux selector
import type { RootState } from '../../store'; // ✅ ADD: Import RootState type
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Chip,
  Badge,
  Tooltip,
  Button,
  alpha,
  useTheme,
  useMediaQuery,
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Settings,
  ExitToApp,
  Brightness4,
  Brightness7,
  SwapHoriz,
  Business,
  Security,
  Mosque,
  AccountBalance,
  Home as HomeIcon,
  ChevronRight,
  ChevronLeft,
  MenuOpen
} from '@mui/icons-material';

// Import our enhanced sidebar
import BankingSidebar from '../../components/banking/BankingSidebar';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 60;
const COMPACT_APPBAR_HEIGHT = 42;

export default function BankingLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const pathname = usePathname();
  const router = useRouter();

  // ✅ ADD: Get banking mode from Redux store
  const bankingMode = useSelector((state: RootState) => state.configuration.bankingMode);

  // ✅ ADD: Get user data from Redux auth state
  const authState = useSelector((state: RootState) => state.auth);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // 🚨 DISABLED: Notification state - Per IAF IFRS9 Step 02 Requirements
  // const [notificationAnchor, setNotificationAnchor] = useState<null | HTMLElement>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');
  // 🚨 DISABLED: Notifications count - Per IAF IFRS9 Step 02 Requirements
  // const [notifications, setNotifications] = useState(3);

  const currentDrawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  // Initialize user data from Redux state first, fallback to localStorage
  useEffect(() => {
    console.log('🔍 Auth state debugging:', {
      authState: authState ? 'exists' : 'null',
      authUser: authState?.user ? 'exists' : 'null',
      isAuthenticated: authState?.isAuthenticated,
      authToken: authState?.token ? 'exists' : 'missing'
    });

    // Prioritize Redux auth state
    if (authState?.user) {
      console.log('📋 Using Redux auth user data:', authState.user);
      console.log('📋 Redux role fields:', {
        role: authState.user.role,
        userRole: authState.user.userRole,
        roleName: authState.user.roleName,
        roles: authState.user.roles,
        userType: authState.user.userType,
        permissions: authState.user.permissions
      });

      let role = authState.user.role ||
                authState.user.userRole ||
                authState.user.roleName ||
                authState.user.roles?.[0] ||
                authState.user.userType ||
                '';

      // 🔧 FORCE IAF ROLES FOR ADMIN USERS
      if (authState.user?.email === 'admin@iaf.co.id') {
        if (role === 'BANK_USER') {
          console.log('🔧 DETECTED IAF ADMIN: Forcing IAF Super Admin role instead of BANK_USER');
          role = 'IAF_TENANT_SUPERADMIN';
        }
      }
      if (authState.user?.email === 'superadmin@iaf.co.id') {
        if (role === 'BANK_USER') {
          console.log('🔧 DETECTED IAF SUPERADMIN: Forcing IAF Super Admin role instead of BANK_USER');
          role = 'IAF_TENANT_SUPERADMIN';
        }
      }

      console.log('🎯 Redux extracted user role:', role);
      setUserRole(role);
      setUserName(authState.user.fullName || authState.user.email || authState.user.username || 'User');
      console.log('✅ Set userRole from Redux:', role);
      console.log('✅ Set userName from Redux:', authState.user.fullName || authState.user.email || authState.user.username || 'User');
      return;
    }

    // Fallback to localStorage if Redux state is not available
    if (typeof document !== 'undefined') {
      const userData = localStorage.getItem('user_data');
      const userToken = localStorage.getItem('auth_token');

      console.log('🔍 User data debugging (localStorage fallback):', {
        userData: userData ? userData.substring(0, 200) + '...' : 'null',
        userToken: userToken ? 'exists' : 'missing',
        localStorageKeys: Object.keys(localStorage).filter(key => key.includes('user') || key.includes('auth'))
      });

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          console.log('📋 Parsed user data (localStorage fallback):', parsedUser);
          console.log('📋 Available role fields:', {
            role: parsedUser.role,
            userRole: parsedUser.userRole,
            roleName: parsedUser.roleName,
            roles: parsedUser.roles,
            userType: parsedUser.userType,
            permissions: parsedUser.permissions
          });

          const role = parsedUser.role ||
                      parsedUser.userRole ||
                      parsedUser.roleName ||
                      parsedUser.roles?.[0] ||
                      parsedUser.userType ||
                      '';

          console.log('🎯 Extracted user role (localStorage fallback):', role);
          setUserRole(role);
          setUserName(parsedUser.fullName || parsedUser.email || parsedUser.username || 'User');
          console.log('✅ Set userRole from localStorage:', role);
          console.log('✅ Set userName from localStorage:', parsedUser.fullName || parsedUser.email || parsedUser.username || 'User');
        } catch (error) {
          console.warn('Could not parse user data from localStorage:', error);
          console.warn('Raw userData:', userData);
        }
      } else {
        console.warn('No user data found in localStorage');
        // Check all localStorage items
        console.log('📦 All localStorage items:');
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          console.log(`  ${key}: ${value ? value.substring(0, 100) + (value.length > 100 ? '...' : '') : 'null'}`);
        }
      }
    }
  }, [authState]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarToggle = () => setSidebarCollapsed(!sidebarCollapsed);
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);
  // 🚨 DISABLED: Notification handlers - Per IAF IFRS9 Step 02 Requirements
  // const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => setNotificationAnchor(event.currentTarget);
  // const handleNotificationClose = () => setNotificationAnchor(null);

  const handleBankingModeSwitch = () => {
    // Note: Banking mode switching is now handled by the theme system
    handleProfileMenuClose();
  };

  const handleLogout = () => {
    handleProfileMenuClose();
    if (typeof document !== 'undefined') {
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'ifrs9_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'ifrs9_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'ifrs9_user_email=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
    window.location.href = '/login';
  };

  // ✅ SURGICAL FIX: Dynamic banking mode functions based on Redux state
  const getBankingModeIcon = () => {
    switch (bankingMode) {
      case 'syariah': return <Mosque />;
      case 'dual': return <SwapHoriz />;
      default: return <AccountBalance />;
    }
  };

  const getBankingModeColor = () => {
    switch (bankingMode) {
      case 'syariah': return 'success';
      case 'dual': return 'warning';
      default: return 'primary';
    }
  };

  const getBankingModeLabel = () => {
    switch (bankingMode) {
      case 'syariah': return 'Islamic Banking';
      case 'dual': return 'Dual Banking';
      default: return 'Conventional Banking';
    }
  };

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs = [];

    breadcrumbs.push({
      label: 'Banking Dashboard',
      href: '/banking/dashboard',
      icon: <HomeIcon sx={{ mr: 0.5, fontSize: 14 }} />
    });

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      if (index === 0 && segment === 'banking') {
        return;
      }

      const isLast = index === pathSegments.length - 1;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/[-_]/g, ' ');
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        isLast
      });
    });

    return breadcrumbs;
  };

  // AppBar with dynamic banking mode colors
  const appBar = (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { md: `${currentDrawerWidth}px` },
        background: `linear-gradient(135deg, ${
          bankingMode === 'syariah' 
            ? theme.palette.success.main 
            : theme.palette.primary.main
        } 0%, ${
          bankingMode === 'syariah' 
            ? theme.palette.success.dark 
            : theme.palette.primary.dark
        } 100%)`,
        boxShadow: theme.shadows[1],
        zIndex: theme.zIndex.drawer + 1,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Toolbar 
        sx={{ 
          minHeight: `${COMPACT_APPBAR_HEIGHT}px !important`,
          height: COMPACT_APPBAR_HEIGHT,
          px: 2
        }}
        disableGutters
      >
        {/* Mobile menu button */}
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          size="small"
          sx={{ mr: 1.5, display: { md: 'none' } }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        {/* Desktop sidebar toggle button */}
        <Tooltip title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
          <IconButton
            color="inherit"
            onClick={handleSidebarToggle}
            size="small"
            sx={{ 
              mr: 1.5, 
              display: { xs: 'none', md: 'inline-flex' },
              backgroundColor: alpha(theme.palette.common.white, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.common.white, 0.2),
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            {sidebarCollapsed ? <MenuOpen fontSize="small" /> : <ChevronLeft fontSize="small" />}
          </IconButton>
        </Tooltip>

        {/* Title */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography 
            variant="h6" 
            noWrap 
            component="div" 
            sx={{ 
              fontWeight: 600,
              fontSize: '1rem',
              lineHeight: 1.2
            }}
          >
            IFRS 9 | i9 model platform
          </Typography>
        </Box>

        {/* 🚨 DISABLED: Notifications - Per IAF IFRS9 Step 02 Requirements */}
        {/* Notifications icon has been disabled as per requirements */}

        {/* 🚨 DISABLED: Settings - Per IAF IFRS9 Step 02 Requirements */}
        {/* Settings gear icon has been disabled as per requirements */}

        {/* User avatar */}
        <Tooltip title="User menu">
          <IconButton
            size="small"
            edge="end"
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <Avatar sx={{ 
              width: 28,
              height: 28,
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '0.875rem'
            }}>
              {userName.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );

  // Breadcrumb bar
  const breadcrumbBar = (
    <Paper
      elevation={1}
      sx={{
        width: { md: `calc(100% - ${currentDrawerWidth}px)` },
        ml: { md: `${currentDrawerWidth}px` },
        position: 'fixed',
        top: COMPACT_APPBAR_HEIGHT,
        zIndex: theme.zIndex.drawer,
        bgcolor: 'background.paper',
        borderBottom: `1px solid ${theme.palette.divider}`,
        borderRadius: 0,
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
      }}
    >
      <Box sx={{ px: 2, py: 0.4 }}>
        <Breadcrumbs
          separator={<ChevronRight fontSize="small" />}
          aria-label="breadcrumb"
          sx={{
            '& .MuiBreadcrumbs-separator': {
              mx: 0.8,
              color: 'text.secondary'
            }
          }}
        >
          {generateBreadcrumbs().map((crumb, index) => (
            crumb.isLast ? (
              <Typography
                key={index}
                color="text.primary"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500,
                  fontSize: '0.8rem'
                }}
              >
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                underline="hover"
                color="inherit"
                href={crumb.href}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
                onClick={(e) => {
                  e.preventDefault();
                  if (crumb.href) {
                    window.location.href = crumb.href;
                  }
                }}
              >
                {crumb.icon}
                {crumb.label}
              </Link>
            )
          ))}
        </Breadcrumbs>
      </Box>
    </Paper>
  );

  // Enhanced drawer with dynamic banking mode
  const drawer = (
    <BankingSidebar
      width={sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}
      bankingMode={bankingMode} // ✅ FIXED: Pass dynamic banking mode
      userRole={userRole}
      roleCodes={authState.user?.roleCodes || []} // ✅ Pass roleCodes for menu compatibility
      collapsed={sidebarCollapsed}
      appBarHeight={COMPACT_APPBAR_HEIGHT}
      onMenuClick={(menuId, href) => {
        console.log(`Menu clicked: ${menuId} → ${href}`);
        if (isMobile) {
          setMobileOpen(false);
        }
      }}
    />
  );

  // Debugging: Log userRole and roleCodes being passed to BankingSidebar
  React.useEffect(() => {
    console.log('🚀 BankingSidebar props:', { userRole, roleCodes: authState.user?.roleCodes, bankingMode, userName });
  }, [userRole, authState.user?.roleCodes, bankingMode, userName]);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      {appBar}

      {/* Breadcrumb Bar */}
      {breadcrumbBar}

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { md: currentDrawerWidth }, 
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 'none'
            },
          }}
        >
          <BankingSidebar
            width={DRAWER_WIDTH}
            bankingMode={bankingMode} // ✅ FIXED: Pass dynamic banking mode
            userRole={userRole}
            roleCodes={authState.user?.roleCodes || []} // ✅ Pass roleCodes for menu compatibility
            collapsed={false}
            appBarHeight={COMPACT_APPBAR_HEIGHT}
            onMenuClick={(menuId, href) => {
              console.log(`Menu clicked: ${menuId} → ${href}`);
              setMobileOpen(false);
            }}
          />
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: currentDrawerWidth,
              borderRight: 'none',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* User Profile Menu */}
      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        keepMounted
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          sx: { width: 240, mt: 1 }
        }}
      >
        <Box sx={{ p: 1.5, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {userName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {userRole.replace(/_/g, ' ')}
          </Typography>
          {/* ✅ SURGICAL FIX: Dynamic banking mode chip */}
          <Chip
            size="small"
            label={getBankingModeLabel()} // ✅ FIXED: Dynamic label
            color={getBankingModeColor() as any} // ✅ FIXED: Dynamic color
            sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
          />
        </Box>

        <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/banking/settings/profile'); }} sx={{ py: 1 }}>
          <AccountCircle sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          <Typography variant="body2">Profile Settings</Typography>
        </MenuItem>

        <MenuItem onClick={() => { handleProfileMenuClose(); router.push('/banking/settings/preferences'); }} sx={{ py: 1 }}>
          <Settings sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          <Typography variant="body2">Preferences</Typography>
        </MenuItem>

        {/* 🚨 DISABLED: Theme Settings - Per IAF IFRS9 Step 02 Requirements */}
        {/* Theme Settings menu item has been disabled as per requirements */}

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1 }}>
          <ExitToApp sx={{ mr: 1.5, fontSize: '1.2rem' }} />
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>

      {/* 🚨 DISABLED: Notifications Menu - Per IAF IFRS9 Step 02 Requirements */}
      {/* Notifications menu has been disabled as per requirements */}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Box sx={{ 
          height: COMPACT_APPBAR_HEIGHT + 32,
          flexShrink: 0 
        }} />
        
        <Box sx={{ p: 2 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}