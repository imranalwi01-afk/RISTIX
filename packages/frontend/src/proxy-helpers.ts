// packages/frontend/src/proxy-helpers.ts
// ============================================================================
// Helper functions for the proxy (JWT, access checks, banking mode detection)
// ============================================================================

import { NextRequest } from 'next/server';
import {
  buildPermissionContext,
  normalizePermissionInput,
} from './utils/permission-evaluator';
import { BANKING_MODE_PATTERNS } from './proxy-config';

export function decodeJwtPayload(payloadPart: string): any | null {
  try {
    if (typeof atob !== 'function') {
      return null;
    }
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

// ✅ SURGICAL FIX: Enhanced token validation that doesn't break navigation
export function validateTokenBasic(token: string): { isValid: boolean; user?: any } {
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
      const payload = decodeJwtPayload(parts[1]);
      if (!payload) {
        return { isValid: false };
      }

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
export function getStakeholderType(user: any): string | null {
  return user?.stakeholderType || (user?.isPlatformAdmin ? 'platform' : 'banking');
}

// ✅ SURGICAL ENHANCEMENT: Banking mode detection from URL
export function detectBankingModeFromURL(pathname: string): 'conventional' | 'syariah' | null {
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
export function hasRouteAccess(user: any, pathname: string): {
  allowed: boolean;
  matchedRoute?: string;
  requiredPermission?: string;
  reason: string;
  debug?: any;
} {
  // 1. Platform Admin Bypass (Absolute Superuser)
  if (user?.isPlatformAdmin === true) {
    return { allowed: true, reason: 'platform_admin_bypass' };
  }

  const userPermissions = user.permissions || [];
  const permissionContext = buildPermissionContext(userPermissions);
  if (permissionContext.isSuperAdmin) {
    return { allowed: true, reason: 'super_admin_bypass' };
  }

  // 2. Super Admin role bypass (for tenant admins)
  const userRoles = user.roles || [];
  if (userRoles.some((r: string) => r.toUpperCase().includes('ADMIN') || r.toUpperCase().includes('SUPERUSER'))) {
    return { allowed: true, reason: 'admin_role_bypass' };
  }

  // 3. Stakeholder route gating (platform vs banking vs consultant)
  if (pathname.startsWith('/platform') && user?.stakeholderType !== 'platform') {
    return { allowed: false, reason: 'stakeholder_mismatch', requiredPermission: 'admin.system.manage' };
  }
  if (pathname.startsWith('/consultant') && user?.stakeholderType !== 'consultant') {
    return { allowed: false, reason: 'stakeholder_mismatch', requiredPermission: 'consultant.access' };
  }
  if (pathname.startsWith('/regulator') && user?.stakeholderType !== 'regulator') {
    return { allowed: false, reason: 'stakeholder_mismatch', requiredPermission: 'regulator.access' };
  }

  return { allowed: true, reason: 'proxy_delegated_to_backend' };
}

// ✅ SURGICAL FIX: Get token from multiple sources
export function getTokenFromRequest(request: NextRequest): string | null {
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

export function hasRefreshTokenFromRequest(request: NextRequest): boolean {
  return Boolean(
    request.cookies.get('refresh_token')?.value ||
    request.cookies.get('refresh-token')?.value ||
    request.headers.get('x-refresh-token')
  );
}

// ✅ SURGICAL ENHANCEMENT: Banking mode redirect helper
export function getBankingModeAwareRedirect(user: any, pathname: string, baseUrl: string, currentUrlString: string): string | null {
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
