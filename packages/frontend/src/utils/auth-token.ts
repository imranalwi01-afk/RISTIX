// packages/frontend/src/utils/auth-token.ts
import Cookies from 'js-cookie';
import { getCookieDomain } from './cookie-domain';

const AUTH_COOKIE_KEYS = [
    'auth-token',
    'auth_token',
    'refresh-token',
    'refresh_token',
    'auth-user',
    'auth_user',
    'user-data',
    'user_data',
    'auth_state',
    'banking_mode',
    'tenant_config',
    'session_id',
    'user_preferences',
    'navigation_history'
];

const AUTH_STORAGE_KEYS = [
    'auth_token',
    'refresh_token',
    'user_data',
    'token_expiry',
    'auth_state',
    'banking_mode',
    'tenant_config',
    'last_activity',
    'user_permissions',
    'selected_tenant',
    'theme_preferences',
    'navigation_state',
    'tenant_slug',
    'tenantId',
    'bankingType',
    'tenantConfig',
    'impersonated_tenant_slug'
];

const getCandidateCookieDomains = (): Array<string | undefined> => {
    if (typeof window === 'undefined') return [undefined];

    const hostname = window.location.hostname;
    const parentDomain = getCookieDomain();
    const hostParent =
        hostname.includes('.') && !hostname.match(/^(localhost|127\.0\.0\.1)$/)
            ? `.${hostname.split('.').slice(-2).join('.')}`
            : undefined;

    return Array.from(new Set([
        undefined,
        hostname,
        `.${hostname}`,
        parentDomain,
        hostParent
    ].filter((domain): domain is string | undefined => domain === undefined || Boolean(domain))));
};

const expireCookie = (name: string, domain?: string) => {
    if (typeof document === 'undefined') return;

    const domainPart = domain ? `; domain=${domain}` : '';
    const securePart = window.location.protocol === 'https:' ? '; secure' : '';
    const expiry = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; max-age=0';

    document.cookie = `${name}=; path=/${domainPart}; ${expiry}; samesite=lax${securePart}`;
    document.cookie = `${name}=; ${domainPart}; ${expiry}; samesite=lax${securePart}`;
};

const removeCookieEverywhere = (name: string) => {
    getCandidateCookieDomains().forEach((domain) => {
        try {
            Cookies.remove(name, { path: '/', ...(domain ? { domain } : {}) });
        } catch (error) {
            console.warn(`⚠️ Error removing cookie ${name} with domain ${domain || '(host-only)'}:`, error);
        }

        try {
            expireCookie(name, domain);
        } catch (error) {
            console.warn(`⚠️ Error expiring cookie ${name} with domain ${domain || '(host-only)'}:`, error);
        }
    });
};

/**
 * Get authentication token from cookies or localStorage
 * Prioritizes cookies for better security and SSR/middleware consistency
 */
export const getAuthToken = (): string | null => {
    if (typeof window === 'undefined') return null;

    try {
        // 1. Try cookie first (synced by AuthProvider/SessionControl)
        const cookieToken = Cookies.get('auth_token');
        if (cookieToken) return cookieToken;

        // 2. Fallback to localStorage
        const localToken = localStorage.getItem('auth_token');
        if (localToken) return localToken;

        // 3. Fallback to sessionStorage if used
        const sessionToken = sessionStorage.getItem('auth_token');
        if (sessionToken) return sessionToken;

        return null;
    } catch (error) {
        console.warn('⚠️ Error retrieving auth token:', error);
        return null;
    }
};

/**
 * Clear all authentication tokens from cookies and storage
 */
export const clearAuthTokens = () => {
    if (typeof window === 'undefined') return;

    try {
        AUTH_COOKIE_KEYS.forEach(removeCookieEverywhere);

        AUTH_STORAGE_KEYS.forEach((key) => {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn(`⚠️ Error removing localStorage key ${key}:`, error);
            }
        });

        AUTH_STORAGE_KEYS.forEach((key) => {
            try {
                sessionStorage.removeItem(key);
            } catch (error) {
                console.warn(`⚠️ Error removing sessionStorage key ${key}:`, error);
            }
        });

    } catch (error) {
        console.warn('⚠️ Error clearing auth tokens:', error);
    }
};

/**
 * Sync token to cookie (helper for non-AuthProvider contexts)
 */
export const syncTokenToCookie = (token: string | null) => {
    if (typeof window === 'undefined') return;

    try {
        if (token) {
            const isSecure = window.location.protocol === 'https:';
            Cookies.set('auth_token', token, {
                path: '/',
                secure: isSecure,
                sameSite: 'strict',
                expires: 7
            });
        } else {
            Cookies.remove('auth_token', { path: '/' });
        }
    } catch (error) {
        console.warn('⚠️ Error syncing token to cookie:', error);
    }
};
