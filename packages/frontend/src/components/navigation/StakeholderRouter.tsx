// packages/frontend/src/components/navigation/StakeholderRouter.tsx
// ============================================================================
// IFRS9 STAKEHOLDER ROUTER - CORRECTED FOR DIRECT FOLDER STRUCTURE
// ============================================================================
// ✅ FIXED: Banking routes use DIRECT FOLDERS → /banking/dashboard URLs
// ✅ FIXED: All routes consistent with YOUR actual tree structure
// ============================================================================

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { useRouter, usePathname } from 'next/navigation';
import { Box, CircularProgress, Alert } from '@mui/material';

// ✅ CORRECTED: Role to stakeholder mapping
const ROLE_TO_STAKEHOLDER_MAP: Record<string, StakeholderType> = {
  // Platform Admin
  'PLATFORM_SUPER_ADMIN': 'platform',
  'PLATFORM_TECH_ADMIN': 'platform',
  'PLATFORM_OPERATIONS': 'platform',
  'PLATFORM_SUPPORT': 'platform',

  // Banking (Conventional)
  'BANK_CRO': 'banking',
  'BANK_IFRS_MANAGER': 'banking',
  'BANK_RISK_ANALYST': 'banking',
  'BANK_PORTFOLIO_MANAGER': 'banking',
  'BANK_DATA_ADMIN': 'banking',
  'BANK_CEO': 'banking',

  // Banking (Syariah)
  'SYARIAH_BANK_CRO': 'banking',
  'SYARIAH_COMPLIANCE_OFFICER': 'banking',
  'SYARIAH_IFRS_SPECIALIST': 'banking',
  'SYARIAH_PORTFOLIO_MANAGER': 'banking',
  'DPS_BOARD_MEMBER': 'banking',
  'DUAL_BANKING_RISK_HEAD': 'banking',

  // Consultants
  'SENIOR_IFRS9_CONSULTANT': 'consultant',
  'ISLAMIC_BANKING_CONSULTANT': 'consultant',
  'RISK_CONSULTANT': 'consultant',
  'TECHNICAL_SPECIALIST': 'consultant',
  'R_ANALYTICS_CONSULTANT': 'consultant',
  'CONSULTANT_PROJECT_MANAGER': 'consultant',

  // Regulators
  'CENTRAL_BANK_DIRECTOR': 'regulator',
  'BANKING_SUPERVISION_HEAD': 'regulator',
  'IFRS_SUPERVISOR': 'regulator',
  'ISLAMIC_BANKING_DIRECTOR': 'regulator',
  'SYARIAH_COMPLIANCE_AUDITOR': 'regulator',
  'MARKET_RISK_SUPERVISOR': 'regulator',
};

export type StakeholderType = 'platform' | 'banking' | 'consultant' | 'regulator';

interface StakeholderRouterProps {
  children: React.ReactNode;
}

// ✅ CORRECTED: Route structure matching YOUR actual DIRECT FOLDER implementation
const STAKEHOLDER_ROUTES = {
  'platform': ['/platform'],

  // ✅ CORRECTED: YOUR DIRECT FOLDER structure - all routes need /banking prefix
  'banking': [
    '/banking/dashboard',
    '/banking/analytics',
    '/banking/collective',
    '/banking/data',
    '/banking/ifrs9',
    '/banking/individual',
    '/banking/maintenance',
    '/banking/mode',
    '/banking/parameters',
    '/banking/portfolio',
    '/banking/reports',
    '/banking/setup',
    '/banking/tools',
    '/banking/workflow'
  ],

  'consultant': ['/consultant'],
  'regulator': ['/regulator']
};

// ✅ CORRECTED: Default redirects matching YOUR tree structure
const STAKEHOLDER_DEFAULTS = {
  'platform': '/platform/users',
  'banking': '/banking/dashboard',  // ✅ YOUR ACTUAL DIRECT FOLDER structure
  'consultant': '/consultant/dashboard',
  'regulator': '/regulator/dashboard'
};

// ✅ Enhanced logging for debugging YOUR structure
class RoutingLogger {
  static logRouteTransition(from: string, to: string, stakeholder: StakeholderType, user?: any) {
    console.log(`🚀 Route Transition: ${from} → ${to} (${stakeholder}) User: ${user?.email || 'Unknown'} Role: ${user?.role || 'Unknown'}`);

    // ✅ CORRECTED: Log YOUR DIRECT FOLDER structure
    if (stakeholder === 'banking') {
      console.log('✅ Banking Route Structure: DIRECT FOLDERS - Files: src/app/banking/dashboard/page.tsx → URLs: /banking/dashboard');
    }
  }

  static logNavigationError(error: string, path: string, stakeholder?: StakeholderType) {
    console.error(`🚨 Navigation Error: ${error} - Path: ${path} - Stakeholder: ${stakeholder} - Expected: DIRECT FOLDERS with /banking/ prefix`);
  }
}

// ✅ Memoized selectors
const selectAuthData = createSelector(
  (state: any) => state.auth?.user,
  (state: any) => state.auth?.isAuthenticated,
  (state: any) => state.auth?.loading,
  (user, isAuthenticated, loading) => ({
    user,
    isAuthenticated,
    loading
  })
);

const StakeholderRouter: React.FC<StakeholderRouterProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname() || '/';
  const dispatch = useDispatch();

  const authData = useSelector(selectAuthData, shallowEqual);
  const { user, isAuthenticated, loading } = authData;

  const [currentStakeholder, setCurrentStakeholder] = useState<StakeholderType | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(true);

  // ✅ CORRECTED: Stakeholder type determination with YOUR DIRECT FOLDER structure
  const determineStakeholderType = useMemo((): StakeholderType | null => {
    if (!pathname) return null;
    console.log(`🔍 Stakeholder Determination - Path: ${pathname}, User: ${user?.role}, Auth: ${isAuthenticated}, Structure: DIRECT FOLDERS`);

    // ✅ From user role first (most reliable)
    if (user?.role) {
      const stakeholderFromRole = ROLE_TO_STAKEHOLDER_MAP[user.role];
      if (stakeholderFromRole) {
        console.log(`✅ Stakeholder from role: ${stakeholderFromRole}`);
        return stakeholderFromRole;
      }
    }

    // ✅ CORRECTED: From current route (YOUR DIRECT FOLDER structure)
    for (const [stakeholder, routes] of Object.entries(STAKEHOLDER_ROUTES)) {
      const matchesRoute = routes.some(route => {
        return pathname === route || pathname.startsWith(route + '/');
      });

      if (matchesRoute) {
        const matchedRoute = routes.find(r => pathname === r || pathname.startsWith(r + '/'));
        console.log(`✅ Stakeholder from route: ${stakeholder} (matched: ${matchedRoute})`);
        return stakeholder as StakeholderType;
      }
    }

    // ✅ Default fallback for authenticated users
    const defaultStakeholder = isAuthenticated ? 'banking' : null;
    console.log(`🔄 Default stakeholder: ${defaultStakeholder}`);
    return defaultStakeholder;
  }, [user?.role, pathname, isAuthenticated]);

  // ✅ CORRECTED: Route validation with YOUR DIRECT FOLDER structure
  const validateRouteAccess = useMemo(() => {
    return (stakeholderType: StakeholderType): boolean => {
      const allowedRoutes = STAKEHOLDER_ROUTES[stakeholderType];

      const hasAccess = allowedRoutes.some(route => {
        return pathname === route || pathname.startsWith(route + '/');
      });

      console.log(`🔍 Route Validation for ${stakeholderType} (YOUR STRUCTURE):`, {
        pathname,
        allowedRoutes,
        hasAccess,
        structure: 'DIRECT_FOLDERS'
      });

      return hasAccess;
    };
  }, [pathname]);

  // ✅ CORRECTED: Banking redirect validation (matching YOUR tree structure)
  const validateBankingRedirect = (defaultRoute: string, userRole: string): string => {
    // Banking users should always go to /banking/dashboard for YOUR structure
    if (userRole.includes('BANK_') || userRole.includes('SYARIAH_')) {
      return '/banking/dashboard';  // YOUR DIRECT FOLDER structure
    }
    return defaultRoute;
  };

  // ✅ CORRECTED: Main routing logic with YOUR structure
  useEffect(() => {
    console.log(`🔄 Route Processing - Stakeholder: ${determineStakeholderType}, Path: ${pathname}, Structure: DIRECT FOLDERS`);
    setIsRouteLoading(true);

    const stakeholderType = determineStakeholderType;

    if (stakeholderType) {
      setCurrentStakeholder(stakeholderType);

      // ✅ CORRECTED: Validate route access with YOUR structure
      if (!validateRouteAccess(stakeholderType)) {
        const defaultRoute = STAKEHOLDER_DEFAULTS[stakeholderType];

        // ✅ CORRECTED: Use YOUR banking redirect logic with DIRECT FOLDERS
        const finalRoute = stakeholderType === 'banking'
          ? validateBankingRedirect(defaultRoute, user?.role || '')
          : defaultRoute;

        RoutingLogger.logRouteTransition(pathname, finalRoute, stakeholderType, user);
        RoutingLogger.logNavigationError(`Invalid route access: ${pathname}`, pathname, stakeholderType);

        console.log(`🚀 Redirecting to: ${finalRoute} (DIRECT FOLDER structure)`);
        router.push(finalRoute);
        return;
      }
    } else if (isAuthenticated) {
      // ✅ CORRECTED: Authenticated but no stakeholder - redirect to banking
      const defaultRoute = '/banking/dashboard';  // DIRECT FOLDER structure
      RoutingLogger.logRouteTransition(pathname, defaultRoute, 'banking', user);
      console.log('🚀 No stakeholder, redirecting to banking dashboard (DIRECT FOLDER)');
      router.push(defaultRoute);
      return;
    } else {
      // ✅ Not authenticated - redirect to login
      const loginRoute = '/login';
      RoutingLogger.logRouteTransition(pathname, loginRoute, 'platform', user);
      console.log('🔐 Not authenticated, redirecting to login');
      router.push(loginRoute);
      return;
    }

    console.log('✅ Route processing complete - YOUR STRUCTURE applied');
    setIsRouteLoading(false);
  }, [determineStakeholderType, isAuthenticated, router, validateRouteAccess, pathname, user]);

  // ✅ Loading state
  if (loading || isRouteLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Box>Loading IFRS 9 Platform...</Box>
        {process.env.NODE_ENV === 'development' && (
          <Box sx={{ fontSize: '0.8rem', color: 'text.secondary', textAlign: 'center' }}>
            Path: {pathname}<br />
            Stakeholder: {currentStakeholder || 'Detecting...'}<br />
            Structure: DIRECT FOLDERS → /banking/dashboard
          </Box>
        )}
      </Box>
    );
  }

  // ✅ Authentication required
  if (!isAuthenticated) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Alert severity="info" sx={{ maxWidth: 400 }}>
          Authentication required. Redirecting to login...
        </Alert>
      </Box>
    );
  }

  // ✅ Invalid stakeholder type
  if (!currentStakeholder) {
    RoutingLogger.logNavigationError('Invalid stakeholder type', pathname);

    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        p={3}
      >
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          Invalid access. Unable to determine stakeholder type.
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 1, fontSize: '0.8rem' }}>
              Path: {pathname}<br />
              User Role: {user?.role || 'None'}<br />
              Expected Banking Path: /banking/dashboard (DIRECT FOLDER)
            </Box>
          )}
        </Alert>
      </Box>
    );
  }

  // ✅ Render children - Next.js app router handles layouts
  return (
    <Box>
      {process.env.NODE_ENV === 'development' && (
        <Box sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          p: 1,
          bgcolor: 'background.paper',
          zIndex: 9999,
          fontSize: '0.7rem',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <div>Stakeholder: {currentStakeholder}</div>
          <div>Path: {pathname}</div>
          <div>User: {user?.email}</div>
          <div>Structure: DIRECT FOLDERS</div>
          <div>Banking URL: /banking/dashboard</div>
        </Box>
      )}
      {children as any}
    </Box>
  );
};

export default StakeholderRouter;
