'use client';

// packages/frontend/src/app/banking/layout.tsx
// ============================================================================
// 🔧 REFACTORED: BankingLayout
// ============================================================================
// ✅ OPTIMIZED: Logics extracted to sub-components
// ✅ CLEAN: No more massive console logs
// ✅ MAINTAINABLE: Separation of concerns
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';
import {
  Box,
  Drawer,
  useMediaQuery,
  Alert,
  Button,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { usePathname, useRouter } from 'next/navigation';

// Import our enhanced sidebar
import BankingSidebar from '../../components/banking/BankingSidebar';
import { useBankingTheme } from '../../providers/BankingThemeProvider';
import { ROUTE_PERMISSION_MAP } from '../../proxy-config';

// Import extracted layout components
import { BankingAppBar } from '../../components/banking/layout/BankingAppBar';
import ImpersonationBanner from '../../components/common/ImpersonationBanner';
import { BankingBreadcrumbs } from '../../components/banking/layout/BankingBreadcrumbs';
import { NotificationProvider } from '../../providers/NotificationProvider';
import { clearAuthTokens } from '../../utils/auth-token';

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
  const [hasSessionEvidence, setHasSessionEvidence] = useState<boolean | null>(null);

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

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (authState?.user || authState?.token) {
      setHasSessionEvidence(true);
      return;
    }

    const storedToken = localStorage.getItem('auth_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const hasStoredSession = Boolean(storedToken || storedRefreshToken);

    if (!hasStoredSession) {
      clearAuthTokens();
      localStorage.removeItem('user_data');
    }

    setHasSessionEvidence(hasStoredSession);

    if (!hasStoredSession) {
      const redirectTarget = `${window.location.pathname}${window.location.search}`;
      const redirectUrl = `/login?logout=true&redirect=${encodeURIComponent(redirectTarget)}`;
      const timer = window.setTimeout(() => {
        window.location.replace(redirectUrl);
      }, 50);

      return () => window.clearTimeout(timer);
    }
  }, [authState?.token, authState?.user]);

  const pathname = usePathname();
  const router = useRouter();
  const isAuthReady = authState?.isInitialized;
  const isActuallyAuthenticated = authState?.isAuthenticated && !!authState?.user;
  const userPermissions = authState?.user?.permissions || [];

  // Route permission guard: check if the current path requires a permission the user doesn't have
  useEffect(() => {
    if (!pathname || !isActuallyAuthenticated || !isAuthReady) return;

    const matchedPrefix = Object.keys(ROUTE_PERMISSION_MAP)
      .filter((prefix) => pathname.startsWith(prefix))
      .sort((a, b) => b.length - a.length)[0];

    if (!matchedPrefix) return;

    const requiredPerms = ROUTE_PERMISSION_MAP[matchedPrefix];
    const requiredList = Array.isArray(requiredPerms) ? requiredPerms : [requiredPerms];
    // Superadmin bypasses all route guards
    const hasAccess = userPermissions.includes('admin.super_admin') ||
      requiredList.some((code) => userPermissions.includes(code));

    if (!hasAccess) {
      router.replace('/banking/dashboard');
    }
  }, [pathname, isActuallyAuthenticated, isAuthReady, userPermissions, router]);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleSidebarToggle = () => setSidebarCollapsed(!sidebarCollapsed);

  // Block if no session evidence exists OR if Redux explicitly initialized and determined unauthenticated
  if ((hasSessionEvidence === false && !authState?.user && !authState?.token) ||
      (isAuthReady && !isActuallyAuthenticated)) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Box sx={{ width: '100%', maxWidth: 520 }}>
          <Alert severity="error" sx={{ mb: 2 }} role="alert">
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Authentication Required
            </Typography>
            <Typography variant="body2">
              Redirecting to login. This banking route requires an authenticated session.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            onClick={() => {
              if (typeof window !== 'undefined') {
                const redirectTarget = `${window.location.pathname}${window.location.search}`;
                clearAuthTokens();
                window.location.replace(`/login?logout=true&redirect=${encodeURIComponent(redirectTarget)}`);
              }
            }}
          >
            Go to Login
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <NotificationProvider>
      <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
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
          minWidth: 0,
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
            tenantContext={authState?.tenantId || authState?.tenantSlug || undefined}
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
            tenantContext={authState?.tenantId || authState?.tenantSlug || undefined}
            collapsed={sidebarCollapsed}
            appBarHeight={COMPACT_APPBAR_HEIGHT}
            onMenuClick={() => { }} // No-op for desktop
          />
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        id="main-content"
        role="main"
        sx={{
          flexGrow: 1,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          minHeight: '100vh',
          bgcolor: 'background.default',
          overflowX: 'hidden',
        }}
      >
        <Box sx={{
          height: COMPACT_APPBAR_HEIGHT + 32,
          flexShrink: 0
        }} />

        <Box sx={{ p: 2, width: '100%', maxWidth: '100%', minWidth: 0, overflowX: 'hidden' }}>
          <Box><ImpersonationBanner />{children as any}</Box>
        </Box>
      </Box>
    </Box>
    </NotificationProvider>
  );
}
