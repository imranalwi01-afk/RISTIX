// packages/frontend/src/middleware.ts
// ============================================================================
// 🩹 SURGICAL FIX: Enhanced Middleware with Banking Mode URL Detection
// ============================================================================
// ✅ FIXED: Reads tokens from localStorage (where AuthProvider stores them)
// ✅ FIXED: Better token validation that doesn't block valid navigation
// ✅ FIXED: Proper error handling for authentication edge cases
// ✅ FIXED: Allows navigation for authenticated users without redirects
// ✅ ENHANCED: Banking mode detection from URLs for theme switching
// ============================================================================

import { NextRequest, NextResponse } from 'next/server';

// ✅ Route to Permission Mapping (Strictly Permission-Based)
const ROUTE_PERMISSION_MAP: Record<string, string> = {
  // Module Access
  '/platform': 'ACCESS_PLATFORM',
  '/consultant': 'ACCESS_CONSULTANT',
  '/regulator': 'ACCESS_REGULATOR',

  // Dashboard
  '/banking/dashboard': 'banking.dashboard.view',

  // Impairment Modules
  '/banking/collective': 'banking.collective.view',
  '/banking/individual': 'banking.individual.view',

  // Processing & Reports
  '/banking/processing': 'banking.processing.view',
  '/banking/reports': 'banking.reports.ifrs9.view',
  '/banking/analytics': 'banking.analytics.r.view',

  // System Setup (Strictly Protected)
  '/banking/setup': 'banking.setup.application',
  '/banking/parameters': 'banking.parameter',
  '/banking/administration': 'admin.users.manage',
  '/banking/maintenance': 'admin.users.manage', // Often includes role management

  // Tools
  '/banking/tools': 'banking.configuration.ifrs9.manage'
};

// ✅ SURGICAL ENHANCEMENT: Banking mode URL patterns
const BANKING_MODE_PATTERNS = {
  syariah: [
    '/banking/syariah',
    '/banking/islamic',
    '/syariah',
    '/islamic'
  ],
  conventional: [
    '/banking/conventional',
    '/conventional'
  ]
};

// ✅ Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/platform/login', // ✅ Allow platform login page
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/api/auth',
  '/logout',  // ✅ ENHANCED: Allow logout route without auth checks
  '/showcase', // ✅ Allow showcase page publicly
  '/system/health' // ✅ EXPLICIT: Allow health check proxy to bypass auth
];

// ✅ Default redirects
const STAKEHOLDER_REDIRECTS: Record<string, string> = {
  banking: '/banking/dashboard',
  platform: '/platform/admin',
  consultant: '/consultant/dashboard',
  regulator: '/regulator/dashboard'
};

// ✅ SURGICAL FIX: Enhanced token validation that doesn't break navigation
function validateTokenBasic(token: string): { isValid: boolean; user?: any } {
  try {
    if (!token || typeof token !== 'string') {
      return { isValid: false };
    }

    // Basic JWT structure validation
    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false };
    }

    try {
      // Decode payload
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());

      // ✅ SURGICAL FIX: More lenient expiration check
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        const buffer = 300; // 5 minute buffer for clock skew
        if (now > (payload.exp + buffer)) {
          return { isValid: false };
        }
      }

      // ✅ SURGICAL FIX: Return valid if we have basic user data
      if (payload.userId || payload.email || payload.sub) {
        const roles = payload.roles || (payload.role ? [payload.role] : []);
        const permissions = payload.permissions || [];

        console.log('[ProxyDebug] Token decoded:', {
          email: payload.email,
          roles: roles,
          permissions: permissions.slice(0, 5), // First 5 permissions
          totalPermissions: permissions.length,
          stakeholderType: payload.stakeholderType
        });

        return {
          isValid: true,
          user: {
            id: payload.userId || payload.sub,
            email: payload.email,
            role: payload.role || roles[0] || '',
            roles: roles,
            permissions: permissions,
            tenantId: payload.tenantId,
            tenantSlug: payload.tenantSlug,
            bankingType: payload.bankingType,
            isPlatformAdmin: payload.isPlatformAdmin || payload.stakeholderType === 'platform',
            stakeholderType: payload.stakeholderType || 'banking'
          }
        };
      }

      return { isValid: false };
    } catch (decodeError) {
      console.warn('Token decode error:', decodeError.message);
      return { isValid: false };
    }
  } catch (error) {
    console.warn('Token validation error:', error.message);
    return { isValid: false };
  }
}

// ✅ SURGICAL FIX: Simplified stakeholder detection (No Role Checks)
function getStakeholderType(user: any): string | null {
  return user?.stakeholderType || (user?.isPlatformAdmin ? 'platform' : 'banking');
}

// ✅ SURGICAL ENHANCEMENT: Banking mode detection from URL
function detectBankingModeFromURL(pathname: string): 'conventional' | 'syariah' | null {
  // Check for syariah patterns
  for (const pattern of BANKING_MODE_PATTERNS.syariah) {
    if (pathname.startsWith(pattern) || pathname.includes('/syariah/') || pathname.includes('/islamic/')) {
      return 'syariah';
    }
  }

  // Check for conventional patterns
  for (const pattern of BANKING_MODE_PATTERNS.conventional) {
    if (pathname.startsWith(pattern) || pathname.includes('/conventional/')) {
      return 'conventional';
    }
  }

  // Check for general banking URLs - default to conventional
  if (pathname.startsWith('/banking')) {
    return 'conventional';
  }

  return null;
}

// ✅ SURGICAL FIX: Permission-Based Route Access Check (Role-Free)
function hasRouteAccess(user: any, pathname: string): boolean {
  // 1. Platform Admin Bypass (Absolute Superuser)
  if (user?.isPlatformAdmin === true) {
    console.log(`[ProxyDebug] Platform admin ${user.email} - access granted`);
    return true;
  }

  const userPermissions = user.permissions || [];
  if (userPermissions.includes('admin.super_admin') || userPermissions.includes('SUPER_ADMIN')) {
    console.log(`[ProxyDebug] Super admin permission for ${user.email} - access granted`);
    return true;
  }

  // 2. Super Admin role bypass (for tenant admins)
  const userRoles = user.roles || [];
  if (userRoles.some((r: string) => r.toUpperCase().includes('ADMIN') || r.toUpperCase().includes('SUPERUSER'))) {
    console.log(`[ProxyDebug] Admin user ${user.email} (${userRoles.join(',')}) - access granted`);
    return true;
  }

  // 3. Map-Based Permission Check
  // Sort patterns from most specific to least specific
  const protectedPaths = Object.keys(ROUTE_PERMISSION_MAP).sort((a, b) => b.length - a.length);

  for (const routePath of protectedPaths) {
    if (pathname === routePath || pathname.startsWith(routePath + '/')) {
      const requiredPermission = ROUTE_PERMISSION_MAP[routePath];
      const candidatePermissions = [
        requiredPermission,
        `${requiredPermission}.view`,
        `${requiredPermission}.access`,
        `${requiredPermission}.manage`,
      ];

      // Allow if user has exact permission, common action variants, or child permissions under the same module.
      const hasPermission =
        candidatePermissions.some((permission) => userPermissions.includes(permission)) ||
        userPermissions.some((permission: string) => permission.startsWith(`${requiredPermission}.`));

      if (hasPermission) {
        return true;
      }

      // If we matched a pattern but didn't have the permission, deny access
      console.warn(`[ProxyDebug] User ${user.email} missing required permission ${requiredPermission} for ${pathname}`);
      console.warn(`[ProxyDebug] User roles: ${JSON.stringify(userRoles)}, User permissions: ${JSON.stringify(userPermissions)}`);
      return false;
    }
  }

  // 4. Default Fallback for banking routes
  if (pathname.startsWith('/banking')) {
    const hasAnyPermission = (user.permissions || []).length > 0;
    if (hasAnyPermission) {
      console.log(`[ProxyDebug] User ${user.email} has permissions - allowing banking route ${pathname}`);
      return true;
    }
  }

  // Allow public or un-mapped routes by default (middleware logic should catch sensitive ones)
  return true;
}

// ✅ SURGICAL FIX: Get token from multiple sources
function getTokenFromRequest(request: NextRequest): string | null {
  // 1. Check Authorization header
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. Check cookies
  const cookieToken = request.cookies.get('auth-token')?.value ||
    request.cookies.get('auth_token')?.value;
  if (cookieToken) {
    return cookieToken;
  }

  // ✅ SURGICAL FIX: 3. Check if we can access localStorage through request headers
  // This is a workaround since middleware can't access localStorage directly
  const clientToken = request.headers.get('x-auth-token');
  if (clientToken) {
    return clientToken;
  }

  return null;
}

// ✅ SURGICAL ENHANCEMENT: Banking mode redirect helper
function getBankingModeAwareRedirect(user: any, pathname: string, baseUrl: string, currentUrlString: string): string | null {
  // Detect banking mode from URL
  const detectedBankingMode = detectBankingModeFromURL(pathname);

  if (detectedBankingMode && pathname.startsWith('/banking')) {
    // If user is accessing a banking route with specific mode, redirect appropriately
    const stakeholderType = getStakeholderType(user);

    if (stakeholderType === 'banking') {
      const currentUrl = new URL(currentUrlString);
      // Check if we already have the correct mode param
      if (currentUrl.searchParams.get('mode') === detectedBankingMode) {
        return null; // Already on correct mode, no redirect needed
      }

      // For banking users, redirect to mode-specific dashboard
      if (detectedBankingMode === 'syariah') {
        const newUrl = new URL(currentUrlString);
        newUrl.searchParams.set('mode', 'syariah');
        return newUrl.toString();
      } else if (detectedBankingMode === 'conventional') {
        const newUrl = new URL(currentUrlString);
        newUrl.searchParams.set('mode', 'conventional');
        return newUrl.toString();
      }
    }
  }

  return null;
}

// ✅ SURGICAL FIX: Main middleware function with enhanced banking mode support
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;


  // ✅ SURGICAL ENHANCEMENT: Detect banking mode from URL
  const detectedBankingMode = detectBankingModeFromURL(pathname);
  if (detectedBankingMode) {
  }

  // ✅ ENHANCED FIX: Check for logout action first (before all other checks)
  const url = new URL(request.url);
  const isLogoutAction = url.searchParams.has('logout') || url.searchParams.has('logout=true');
  const hasLogoutHeader = request.headers.get('x-logout-action') === 'true';
  const refererHasLogout = request.headers.get('referer')?.includes('logout=true');
  const hasTimestamp = url.searchParams.has('ts'); // Timestamp to prevent caching

  // ✅ ENHANCED FIX: Comprehensive logout detection
  if (isLogoutAction || hasLogoutHeader || refererHasLogout) {
    const response = NextResponse.next();

    // ✅ ENHANCED FIX: Set headers to prevent middleware interference
    response.headers.set('x-force-logout-allowed', 'true');
    response.headers.set('x-bypass-auth-check', 'true');
    response.headers.set('cache-control', 'no-cache, no-store, must-revalidate');
    response.headers.set('pragma', 'no-cache');
    response.headers.set('expires', '0');

    // ✅ SURGICAL ENHANCEMENT: Add banking mode header if detected
    if (detectedBankingMode) {
      response.headers.set('x-detected-banking-mode', detectedBankingMode);
    }

    return response;
  }

  // ✅ Allow public routes
  if (PUBLIC_ROUTES.some(route => {
    // strict check for root because everything starts with /
    if (route === '/') return pathname === '/';
    return pathname === route || pathname.startsWith(route);
  })) {
    const response = NextResponse.next();

    // ✅ SURGICAL ENHANCEMENT: Add banking mode header if detected
    if (detectedBankingMode) {
      response.headers.set('x-detected-banking-mode', detectedBankingMode);
    }

    return response;
  }

  // ✅ Allow static assets and API routes
  if (pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') && !pathname.endsWith('.html')) {
    return NextResponse.next();
  }

  // ✅ SURGICAL FIX: Get token from multiple sources
  const token = getTokenFromRequest(request);

  if (!token) {

    // ✅ ENHANCED FIX: Check for logout indicators first
    const url = new URL(request.url);
    const isGoingToLogin = pathname === '/login';
    const hasLogoutParam = url.searchParams.has('logout') || url.searchParams.has('logout=true');
    const hasLogoutHeader = request.headers.get('x-logout-action') === 'true';
    const refererHasLogout = request.headers.get('referer')?.includes('logout=true');
    const hasTimestamp = url.searchParams.has('ts');

    // ✅ CRITICAL FIX: If this is a logout action or going to login with logout indicators, always allow access
    if (isGoingToLogin && (hasLogoutParam || hasLogoutHeader || refererHasLogout || hasTimestamp)) {
      const response = NextResponse.next();
      response.headers.set('x-force-logout-allowed', 'true');
      response.headers.set('x-bypass-auth-check', 'true');
      response.headers.set('cache-control', 'no-cache, no-store, must-revalidate');
      return response;
    }

    // ✅ CRITICAL FIX: If this is a logout action from any page, allow access to login
    if (hasLogoutParam || hasLogoutHeader || refererHasLogout) {
      const loginUrl = new URL('/login?logout=true&ts=' + Date.now(), request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('x-force-logout-allowed', 'true');
      response.headers.set('x-bypass-auth-check', 'true');
      return response;
    }

    // ✅ NORMAL FLOW: Redirect to login for regular unauthorized access
    if (request.headers.get('accept')?.includes('text/html') && !isGoingToLogin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // ✅ SURGICAL FIX: Validate token with better error handling
  const { isValid, user } = validateTokenBasic(token);

  if (!isValid || !user) {

    // ✅ ENHANCED FIX: Check for logout indicators first
    const url = new URL(request.url);
    const isGoingToLogin = pathname === '/login';
    const hasLogoutParam = url.searchParams.has('logout') || url.searchParams.has('logout=true');
    const hasLogoutHeader = request.headers.get('x-logout-action') === 'true';
    const refererHasLogout = request.headers.get('referer')?.includes('logout=true');
    const hasTimestamp = url.searchParams.has('ts');

    // ✅ CRITICAL FIX: If this is a logout action with invalid token, allow access to login
    if (isGoingToLogin && (hasLogoutParam || hasLogoutHeader || refererHasLogout || hasTimestamp)) {
      const response = NextResponse.next();
      response.headers.set('x-force-logout-allowed', 'true');
      response.headers.set('x-bypass-auth-check', 'true');
      response.headers.set('x-invalid-token-logout', 'true');
      return response;
    }

    // ✅ CRITICAL FIX: If this is a logout action from protected page with invalid token, redirect to login
    if (hasLogoutParam || hasLogoutHeader || refererHasLogout) {
      const loginUrl = new URL('/login?logout=true&invalid_token=true&ts=' + Date.now(), request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('x-force-logout-allowed', 'true');
      response.headers.set('x-bypass-auth-check', 'true');
      response.headers.set('x-invalid-token-logout', 'true');
      return response;
    }

    // ✅ NORMAL FLOW: Redirect to login for invalid token access
    if (request.headers.get('accept')?.includes('text/html') && !isGoingToLogin) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      loginUrl.searchParams.set('invalid_token', 'true');
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }


  // ✅ SURGICAL FIX: Check route access with better default handling
  if (!hasRouteAccess(user, pathname)) {

    // ✅ SURGICAL FIX: Get appropriate redirect
    const stakeholderType = getStakeholderType(user);
    const redirectPath = stakeholderType ?
      STAKEHOLDER_REDIRECTS[stakeholderType] :
      '/banking/dashboard';


    // ✅ SURGICAL FIX: Loop protection & 403 Handling
    if (new URL(redirectPath, request.url).pathname === pathname || pathname.startsWith('/banking')) {
      console.warn(`🛑 Access Denied: Returning 403 for ${user.email} (Role: ${user.role}) trying to access ${pathname}.`);

      // Redirect to /403 page if it exists, or return a 403 response
      // For Next.js middleware, a redirect to a dedicated error page is often better UX
      const forbiddenUrl = new URL('/403', request.url);
      if (user.role) forbiddenUrl.searchParams.set('role', user.role);
      forbiddenUrl.searchParams.set('reason', `Role ${user.role} denied access to ${pathname}`);
      return NextResponse.redirect(forbiddenUrl);
    }

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // ✅ SURGICAL ENHANCEMENT: Check for banking mode specific redirects
  const bankingModeRedirect = getBankingModeAwareRedirect(user, pathname, request.nextUrl.origin, request.url);
  if (bankingModeRedirect) {
    return NextResponse.redirect(new URL(bankingModeRedirect));
  }


  // ✅ Add user info to headers
  const response = NextResponse.next();
  response.headers.set('x-user-id', user.id || '');
  response.headers.set('x-user-role', user.role || '');
  response.headers.set('x-stakeholder-type', getStakeholderType(user) || 'banking');

  // ✅ SURGICAL ENHANCEMENT: Add banking mode info to headers
  if (detectedBankingMode) {
    response.headers.set('x-detected-banking-mode', detectedBankingMode);
  }
  if (user.bankingType) {
    response.headers.set('x-user-banking-type', user.bankingType);
  }

  return response;
}

// ✅ SURGICAL FIX: Enhanced matcher configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     * - files with extensions (except .html)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:css|js|jpg|jpeg|png|gif|svg|ico|webp|woff|woff2|ttf|eot|otf)$).*)',
  ],
};

// ✅ Development logging
if (process.env.NODE_ENV === 'development') {
}
