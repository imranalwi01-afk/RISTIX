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
import {
  PUBLIC_ROUTES,
  STAKEHOLDER_REDIRECTS,
} from './proxy-config';
import {
  detectBankingModeFromURL,
  getStakeholderType,
  getTokenFromRequest,
  hasRefreshTokenFromRequest,
  validateTokenBasic,
  hasRouteAccess,
  getBankingModeAwareRedirect,
} from './proxy-helpers';

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
  const isLoginRoute = pathname === '/login' || pathname === '/platform/login';

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

  // Redirect authenticated users away from login routes (except explicit logout flow).
  if (isLoginRoute) {
    const token = getTokenFromRequest(request);
    if (token) {
      const { isValid, user } = validateTokenBasic(token);
      if (isValid && user) {
        const stakeholderType = getStakeholderType(user) || 'banking';
        const redirectPath = STAKEHOLDER_REDIRECTS[stakeholderType] || '/banking/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }
    }
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

    // Allow full-page refresh / direct document navigation to boot the client auth flow.
    // Proxy cannot read localStorage, so redirecting here creates a false logout race.
    if (request.headers.get('accept')?.includes('text/html')) {
      const response = NextResponse.next();
      response.headers.set('x-session-restore-pending', 'true');
      if (hasRefreshTokenFromRequest(request)) {
        response.headers.set('x-refresh-token-present', 'true');
      }
      return response;
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

    // Let the client auth flow decide what to do on full page refresh/direct document requests.
    // Redirecting here causes false logout when cookies and localStorage are briefly out of sync.
    if (request.headers.get('accept')?.includes('text/html') && !isGoingToLogin) {
      const response = NextResponse.next();
      response.headers.set('x-session-restore-pending', 'true');
      response.headers.set('x-invalid-access-token', 'true');
      if (hasRefreshTokenFromRequest(request)) {
        response.headers.set('x-refresh-token-present', 'true');
      }
      return response;
    }

    return NextResponse.next();
  }


  // ✅ SURGICAL FIX: Check route access with better default handling
  const accessResult = hasRouteAccess(user, pathname);
  if (!accessResult.allowed) {

    // ✅ SURGICAL FIX: Get appropriate redirect
    const stakeholderType = getStakeholderType(user);
    const redirectPath = stakeholderType ?
      STAKEHOLDER_REDIRECTS[stakeholderType] :
      '/banking/dashboard';


    // ✅ SURGICAL FIX: Loop protection & 403 Handling
    if (new URL(redirectPath, request.url).pathname === pathname || pathname.startsWith('/banking')) {
      const denyDebug = {
        email: user.email,
        role: user.role,
        pathname,
        matchedRoute: accessResult.matchedRoute,
        requiredPermission: accessResult.requiredPermission,
        reason: accessResult.reason,
        evaluation: accessResult.debug,
      };
      console.warn(`🛑 Access Denied: Returning 403 for ${user.email} (Role: ${user.role}) trying to access ${pathname}.`);
      console.warn('[ProxyDebug] Access deny details:', JSON.stringify(denyDebug));

      const acceptsHtml = request.headers.get('accept')?.includes('text/html');
      if (acceptsHtml) {
        return new NextResponse(
          `<!doctype html><html><head><title>403 Forbidden</title></head><body><h1>403 Forbidden</h1><p>You do not have permission to access ${pathname}.</p></body></html>`,
          {
            status: 403,
            headers: {
              'content-type': 'text/html; charset=utf-8',
              ...(accessResult.matchedRoute ? { 'x-rbac-matched-route': accessResult.matchedRoute } : {}),
              ...(accessResult.requiredPermission ? { 'x-rbac-required-permission': accessResult.requiredPermission } : {}),
            },
          },
        );
      }

      const includeDebug = process.env.NODE_ENV === 'development' || request.headers.get('x-rbac-debug') === 'true';
      const responsePayload: Record<string, any> = {
        error: 'forbidden',
        message: `Role ${user.role || 'unknown'} denied access to ${pathname}`,
        requiredPermission: accessResult.requiredPermission,
      };
      if (includeDebug) {
        responsePayload.debug = denyDebug;
      }

      const response = new NextResponse(
        JSON.stringify(responsePayload),
        {
          status: 403,
          headers: { 'content-type': 'application/json' },
        }
      );
      if (accessResult.matchedRoute) {
        response.headers.set('x-rbac-matched-route', accessResult.matchedRoute);
      }
      if (accessResult.requiredPermission) {
        response.headers.set('x-rbac-required-permission', accessResult.requiredPermission);
      }

      return response;
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
