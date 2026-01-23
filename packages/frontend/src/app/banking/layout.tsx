// packages/frontend/src/app/banking/layout.tsx
// ============================================================================
// 🔧 REFACTORED: BankingLayout
// ============================================================================
// ✅ OPTIMIZED: Logics extracted to sub-components
// ✅ CLEAN: No more massive console logs
// ✅ MAINTAINABLE: Separation of concerns
// ============================================================================

'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  Box,
  Drawer,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Import our enhanced sidebar
import BankingSidebar from '../../components/banking/BankingSidebar';
import { useBankingTheme } from '../../providers/BankingThemeProvider';

// Import extracted layout components
import { BankingAppBar } from '../../components/banking/layout/BankingAppBar';
import { BankingBreadcrumbs } from '../../components/banking/layout/BankingBreadcrumbs';
import { NotificationProvider } from '../../providers/NotificationProvider';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 60;
const COMPACT_APPBAR_HEIGHT = 42;

export default function BankingLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Banking mode from provider
  const { bankingMode: themeBankingMode } = useBankingTheme();

  // Redux auth state
  const authState = useSelector((state: RootState) => state.auth);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [userRole, setUserRole] = useState<string>('');
  const [userName, setUserName] = useState<string>('');

  const currentDrawerWidth = sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  // Initialize user data from Redux state first, fallback to localStorage
  useEffect(() => {
    // Prioritize Redux auth state
    if (authState?.user) {
      const user = authState.user as any;
      let role = user.role ||
        user.userRole ||
        user.roleName ||
        (Array.isArray(user.roles) ? user.roles[0] : user.roles) ||
        user.userType ||
        '';

      // Ensure role is a string if it somehow came as an array from other fields
      if (Array.isArray(role)) {
        role = role[0] || '';
      }

      setUserRole(role);
      setUserName(authState.user.fullName || authState.user.email || authState.user.username || 'User');
      return;
    }

    // Fallback to localStorage if Redux state is not available
    if (typeof document !== 'undefined') {
      const userData = localStorage.getItem('user_data');

      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          let role = parsedUser.role ||
            parsedUser.userRole ||
            parsedUser.roleName ||
            (Array.isArray(parsedUser.roles) ? parsedUser.roles[0] : parsedUser.roles) ||
            parsedUser.userType ||
            '';

          // Ensure role is a string
          if (Array.isArray(role)) {
            role = role[0] || '';
          }

          setUserRole(role);
          setUserName(parsedUser.fullName || parsedUser.email || parsedUser.username || 'User');
        } catch (error) {
          console.warn('Could not parse user data from localStorage:', error);
        }
      }
    }
  }, [authState]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarToggle = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <NotificationProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        {/* AppBar */}
        <BankingAppBar
        drawerWidth={currentDrawerWidth}
        appBarHeight={COMPACT_APPBAR_HEIGHT}
        sidebarCollapsed={sidebarCollapsed}
        onSidebarToggle={handleSidebarToggle}
        onDrawerToggle={handleDrawerToggle}
        userName={userName}
        userRole={userRole}
      />

      {/* Breadcrumbs */}
      <BankingBreadcrumbs
        drawerWidth={currentDrawerWidth}
        appBarHeight={COMPACT_APPBAR_HEIGHT}
      />

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
            bankingMode={themeBankingMode || 'conventional'}
            userRole={userRole}
            roleCodes={authState?.user?.roleCodes || []}
            userPermissions={authState?.user?.permissions || []}
            collapsed={false}
            appBarHeight={COMPACT_APPBAR_HEIGHT}
            onMenuClick={() => setMobileOpen(false)}
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
          <BankingSidebar
            width={currentDrawerWidth}
            bankingMode={themeBankingMode || 'conventional'}
            userRole={userRole}
            roleCodes={authState?.user?.roleCodes || []}
            userPermissions={authState?.user?.permissions || []}
            collapsed={sidebarCollapsed}
            appBarHeight={COMPACT_APPBAR_HEIGHT}
            onMenuClick={() => { }} // No-op for desktop
          />
        </Drawer>
      </Box>

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
    </NotificationProvider>
  );
}