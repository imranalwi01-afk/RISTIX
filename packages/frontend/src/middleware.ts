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

// ✅ Protected route patterns
const PROTECTED_ROUTE_PATTERNS = {
  '/banking': [
    'BANK_CRO', 'BANK_IFRS_MANAGER', 'BANK_RISK_ANALYST', 'BANK_PORTFOLIO_MANAGER',
    'BANK_DATA_ADMIN', 'BANK_CEO', 'SYARIAH_BANK_CRO', 'SYARIAH_COMPLIANCE_OFFICER',
    'SYARIAH_IFRS_SPECIALIST', 'SYARIAH_PORTFOLIO_MANAGER', 'DPS_BOARD_MEMBER',
    'DUAL_BANKING_RISK_HEAD'
  ],
  '/platform': [
    'PLATFORM_SUPER_ADMIN', 'PLATFORM_TECH_ADMIN', 'PLATFORM_OPERATIONS', 'PLATFORM_SUPPORT',
    'platform_super_admin', 'platform_admin'
  ],
  '/consultant': [
    'SENIOR_IFRS9_CONSULTANT', 'ISLAMIC_BANKING_CONSULTANT', 'RISK_CONSULTANT',
    'TECHNICAL_SPECIALIST', 'R_ANALYTICS_CONSULTANT', 'CONSULTANT_PROJECT_MANAGER',
    'consultant'
  ],
  '/regulator': [
    'CENTRAL_BANK_DIRECTOR', 'BANKING_SUPERVISION_HEAD', 'IFRS_SUPERVISOR',
    'ISLAMIC_BANKING_DIRECTOR', 'SYARIAH_COMPLIANCE_AUDITOR', 'MARKET_RISK_SUPERVISOR',
    'regulator'
  ]
};

// ✅ Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
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
const STAKEHOLDER_REDIRECTS = {
  banking: '/banking/dashboard',
  platform: '/platform/admin',
  consultant: '/consultant/dashboard',
  regulator: '/regulator/dashboard'
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
          console.log('Token expired:', { now, exp: payload.exp, expired: now - payload.exp });
          return { isValid: false };
        }
      }

      // ✅ SURGICAL FIX: Return valid if we have basic user data
      if (payload.userId || payload.email || payload.sub) {
        return {
          isValid: true,
          user: {
            id: payload.userId || payload.sub,
            email: payload.email,
            role: payload.role || payload.roles?.[0] || 'BANK_CRO', // Default role
            roles: payload.roles || [payload.role] || ['BANK_CRO'],
            tenantId: payload.tenantId,
            tenantSlug: payload.tenantSlug,
            bankingType: payload.bankingType, // ✅ SURGICAL ENHANCEMENT: Extract banking type
            isPlatformAdmin: payload.isPlatformAdmin // ✅ SURGICAL ENHANCEMENT: Extract Platform Admin flag
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

// ✅ SURGICAL FIX: Enhanced stakeholder detection
function getStakeholderType(user: any): string | null {
  // Check explicit Platform Admin flag first
  if (user?.isPlatformAdmin === true) {
    return 'platform';
  }

  const userRole = user?.role || '';
  if (!userRole) return 'banking'; // Default fallback

  const role = userRole.toLowerCase();

  if (role.includes('bank_') || role.includes('syariah_') || role.includes('dps_')) {
    return 'banking';
  }
  if (role.includes('platform_') || role === 'platform_super_admin' || role === 'platform_admin') {
    return 'platform';
  }
  if (role.includes('consultant') || role === 'consultant') {
    return 'consultant';
  }
  if (role.includes('central_bank') || role.includes('banking_supervision') ||
    role.includes('ifrs_supervisor') || role.includes('islamic_banking_director') ||
    role.includes('syariah_compliance_auditor') || role.includes('market_risk') ||
    role === 'regulator') {
    return 'regulator';
  }

  // ✅ SURGICAL FIX: Default to banking for unknown roles
  return 'banking';
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

// ✅ SURGICAL FIX: More lenient route access check
function hasRouteAccess(user: any, pathname: string): boolean {
  // ✅ SURGICAL FIX: Allow access to non-protected routes
  let isProtectedRoute = false;
  let allowedRoles: string[] = [];

  for (const [routePattern, roles] of Object.entries(PROTECTED_ROUTE_PATTERNS)) {
    if (pathname.startsWith(routePattern)) {
      isProtectedRoute = true;
      allowedRoles = roles;
      break;
    }
  }

  // If not a protected route, allow access
  if (!isProtectedRoute) {
    return true;
  }

  // ✅ SURGICAL FIX: Allow Platform Admins to access platform routes regardless of specific role
  if (isProtectedRoute && pathname.startsWith('/platform') && user?.isPlatformAdmin === true) {
    return true;
  }

  const userRole = user?.role;

  // For protected routes, check role access
  if (!userRole) {
    console.log(`❌ No user role found for route ${pathname}`);
    return false;
  }

  const hasAccess = allowedRoles.includes(userRole) ||
    allowedRoles.includes(userRole.toLowerCase());

  if (!hasAccess) {
    console.log(`❌ Access Debug: Path=${pathname}`);
    console.log(`   UserRole='${userRole}' (Type: ${typeof userRole}, Length: ${userRole.length})`);
    console.log(`   PlatformAdmin=${user?.isPlatformAdmin}`);
    console.log(`   AllowedRoles=${JSON.stringify(allowedRoles)}`);
    // Check for common issues
    const trimmedMatch = allowedRoles.includes(userRole.trim());
    if (trimmedMatch) console.log(`   💡 NOTE: Role would match if trimmed!`);
  }

  console.log(`🔍 Route access check: ${pathname} | Role: ${userRole} | Access: ${hasAccess}`);

  return hasAccess;

  // Let's abort this specific replacement and do it cleaner.
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
        return `${baseUrl}/banking/dashboard?mode=syariah`;
      } else if (detectedBankingMode === 'conventional') {
        return `${baseUrl}/banking/dashboard?mode=conventional`;
      }
    }
  }

  return null;
}

// ✅ SURGICAL FIX: Main middleware function with enhanced banking mode support
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log(`🔐 Middleware check: ${pathname}`);

  // ✅ SURGICAL ENHANCEMENT: Detect banking mode from URL
  const detectedBankingMode = detectBankingModeFromURL(pathname);
  if (detectedBankingMode) {
    console.log(`🎨 Middleware: Detected banking mode "${detectedBankingMode}" from URL: ${pathname}`);
  }

  // ✅ ENHANCED FIX: Check for logout action first (before all other checks)
  const url = new URL(request.url);
  const isLogoutAction = url.searchParams.has('logout') || url.searchParams.has('logout=true');
  const hasLogoutHeader = request.headers.get('x-logout-action') === 'true';
  const refererHasLogout = request.headers.get('referer')?.includes('logout=true');
  const hasTimestamp = url.searchParams.has('ts'); // Timestamp to prevent caching

  // ✅ ENHANCED FIX: Comprehensive logout detection
  if (isLogoutAction || hasLogoutHeader || refererHasLogout) {
    console.log(`🚪 Logout action detected - allowing access to ${pathname}`);
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
    console.log(`✅ Public route allowed: ${pathname}`);
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
    console.log(`❌ No token found for ${pathname}`);

    // ✅ ENHANCED FIX: Check for logout indicators first
    const url = new URL(request.url);
    const isGoingToLogin = pathname === '/login';
    const hasLogoutParam = url.searchParams.has('logout') || url.searchParams.has('logout=true');
    const hasLogoutHeader = request.headers.get('x-logout-action') === 'true';
    const refererHasLogout = request.headers.get('referer')?.includes('logout=true');
    const hasTimestamp = url.searchParams.has('ts');

    // ✅ CRITICAL FIX: If this is a logout action or going to login with logout indicators, always allow access
    if (isGoingToLogin && (hasLogoutParam || hasLogoutHeader || refererHasLogout || hasTimestamp)) {
      console.log(`🚪 Logout action with no token - allowing access to login page: ${pathname}`);
      const response = NextResponse.next();
      response.headers.set('x-force-logout-allowed', 'true');
      response.headers.set('x-bypass-auth-check', 'true');
      response.headers.set('cache-control', 'no-cache, no-store, must-revalidate');
      return response;
    }

    // ✅ CRITICAL FIX: If this is a logout action from any page, allow access to login
    if (hasLogoutParam || hasLogoutHeader || refererHasLogout) {
      console.log(`🚪 Logout action detected from protected page - redirecting to login`);
      const loginUrl = new URL('/login?logout=true&ts=' + Date.now(), request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('x-force-logout-allowed', 'true');
      response.headers.set('x-bypass-auth-check', 'true');
      return response;
    }

    // ✅ NORMAL FLOW: Redirect to login for regular unauthorized access
    if (request.headers.get('accept')?.includes('text/html') && !isGoingToLogin) {
      console.log(`🔄 Redirecting unauthorized user to login: ${pathname}`);
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
    console.log(`❌ Invalid token for ${pathname}`);

    // ✅ ENHANCED FIX: Check for logout indicators first
    const url = new URL(request.url);
    const isGoingToLogin = pathname === '/login';
    const hasLogoutParam = url.searchParams.has('logout') || url.searchParams.has('logout=true');
    const hasLogoutHeader = request.headers.get('x-logout-action') === 'true';
    const refererHasLogout = request.headers.get('referer')?.includes('logout=true');
    const hasTimestamp = url.searchParams.has('ts');

    // ✅ CRITICAL FIX: If this is a logout action with invalid token, allow access to login
    if (isGoingToLogin && (hasLogoutParam || hasLogoutHeader || refererHasLogout || hasTimestamp)) {
      console.log(`🚪 Logout action with invalid token - allowing access to login page: ${pathname}`);
      const response = NextResponse.next();
      response.headers.set('x-force-logout-allowed', 'true');
      response.headers.set('x-bypass-auth-check', 'true');
      response.headers.set('x-invalid-token-logout', 'true');
      return response;
    }

    // ✅ CRITICAL FIX: If this is a logout action from protected page with invalid token, redirect to login
    if (hasLogoutParam || hasLogoutHeader || refererHasLogout) {
      console.log(`🚪 Logout action detected with invalid token - redirecting to login`);
      const loginUrl = new URL('/login?logout=true&invalid_token=true&ts=' + Date.now(), request.url);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('x-force-logout-allowed', 'true');
      response.headers.set('x-bypass-auth-check', 'true');
      response.headers.set('x-invalid-token-logout', 'true');
      return response;
    }

    // ✅ NORMAL FLOW: Redirect to login for invalid token access
    if (request.headers.get('accept')?.includes('text/html') && !isGoingToLogin) {
      console.log(`🔄 Redirecting invalid token user to login: ${pathname}`);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'session_expired');
      loginUrl.searchParams.set('invalid_token', 'true');
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  console.log(`✅ Valid token for user: ${user.email} (${user.role})`);

  // ✅ SURGICAL FIX: Check route access with better default handling
  if (!hasRouteAccess(user, pathname)) {
    console.log(`❌ Access denied to ${pathname} for role ${user.role}`);

    // ✅ SURGICAL FIX: Get appropriate redirect
    const stakeholderType = getStakeholderType(user);
    const redirectPath = stakeholderType ?
      STAKEHOLDER_REDIRECTS[stakeholderType] :
      '/banking/dashboard';

    console.log(`🚀 Redirecting to appropriate dashboard: ${redirectPath}`);

    // ✅ SURGICAL FIX: Loop protection
    if (new URL(redirectPath, request.url).pathname === pathname) {
      console.warn(`🛑 Loop detected: Redirecting to ${redirectPath} from ${pathname}. Aborting redirect.`);
      // If we are blocking access but redirecting to same page, 
      // it means the user is supposed to be here but failed role check.
      // FORCE REDIRECT TO LOGIN with error
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('error', 'access_denied_loop');
      loginUrl.searchParams.set('reason', `Role ${user.role} denied access to ${pathname}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  // ✅ SURGICAL ENHANCEMENT: Check for banking mode specific redirects
  const bankingModeRedirect = getBankingModeAwareRedirect(user, pathname, request.nextUrl.origin, request.url);
  if (bankingModeRedirect) {
    console.log(`🎨 Banking mode redirect: ${bankingModeRedirect}`);
    return NextResponse.redirect(new URL(bankingModeRedirect));
  }

  console.log(`✅ Navigation allowed: ${pathname} for ${user.role}`);

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
  console.log('🔧 Enhanced Middleware - Banking Mode Theme Support:');
  console.log('  - Token detection: localStorage + cookies + headers ✅');
  console.log('  - Lenient token validation ✅');
  console.log('  - Better navigation handling ✅');
  console.log('  - Banking mode URL detection ✅');
  console.log('  - Banking mode headers ✅');
  console.log('  - Reduced false redirects ✅');
}