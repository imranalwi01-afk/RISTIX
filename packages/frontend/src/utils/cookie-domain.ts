// packages/frontend/src/utils/cookie-domain.ts
/**
 * Utility for determining the correct cookie domain based on current hostname
 * Supports: localhost, ifrspro.id, danafin.com, and other domains
 */

export interface CookieDomainConfig {
  domain?: string;
  secure: boolean;
  sameSite: 'strict' | 'lax' | 'none';
}

/**
 * Get the appropriate cookie domain for the current hostname
 * Returns undefined for localhost (cookies default to exact host)
 * Returns parent domain for production domains (.ifrspro.id, .danafin.com, etc.)
 */
export const getCookieDomain = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  const hostname = window.location.hostname;

  // Localhost: No domain attribute needed
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.')) {
    return undefined;
  }

  // ifrspro.id: Use parent domain for cross-subdomain support
  if (hostname.includes('ifrspro.id')) {
    return '.ifrspro.id';
  }

  // danafin.com: Use parent domain for cross-subdomain support
  if (hostname.includes('danafin.com')) {
    return '.danafin.com';
  }

  // Other domains: Extract parent domain (e.g., app.example.com -> .example.com)
  const parts = hostname.split('.');
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join('.')}`;
  }

  return undefined;
};

/**
 * Get complete cookie configuration based on environment
 */
export const getCookieConfig = (expiryDays: number = 7): CookieDomainConfig & { expires: number } => {
  if (typeof window === 'undefined') {
    return {
      secure: false,
      sameSite: 'lax',
      expires: expiryDays
    };
  }

  const isSecure = window.location.protocol === 'https:';
  const domain = getCookieDomain();

  return {
    ...(domain && { domain }), // Only include domain if it exists
    secure: isSecure,
    sameSite: 'lax', // ✅ Changed back to 'lax' - works for same-site cross-subdomain
    expires: expiryDays
  };
};

/**
 * Get cookie domain string for raw document.cookie manipulation
 * Returns empty string for localhost, "domain=.example.com;" for production
 */
export const getCookieDomainString = (): string => {
  const domain = getCookieDomain();
  return domain ? `domain=${domain};` : '';
};

/**
 * Get sameSite string for raw document.cookie manipulation
 */
export const getCookieSameSiteString = (): string => {
  if (typeof window === 'undefined') return 'samesite=lax';
  
  const isSecure = window.location.protocol === 'https:';
  return isSecure ? 'samesite=none' : 'samesite=lax';
};

/**
 * Build complete cookie string for document.cookie
 */
export const buildCookieString = (
  name: string,
  value: string,
  maxAge: number = 60 * 60 * 24 * 7 // 7 days default
): string => {
  const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:';
  const domain = getCookieDomainString();
  const secure = isSecure ? 'secure;' : '';
  const sameSite = getCookieSameSiteString();

  return `${name}=${value}; path=/; ${domain} ${secure} ${sameSite}; max-age=${maxAge}`;
};

/**
 * Build cookie removal string
 */
export const buildCookieRemovalString = (name: string): string => {
  const domain = getCookieDomainString();
  return `${name}=; path=/; ${domain} expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};
