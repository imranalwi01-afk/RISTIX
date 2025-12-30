// packages/frontend/src/utils/auth-token.ts
import Cookies from 'js-cookie';

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
        // Clear cookies
        Cookies.remove('auth_token', { path: '/' });
        Cookies.remove('auth_user', { path: '/' });
        Cookies.remove('refresh_token', { path: '/' });

        // Clear localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token_expiry');

        console.log('🗑️ All authentication tokens cleared');
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
