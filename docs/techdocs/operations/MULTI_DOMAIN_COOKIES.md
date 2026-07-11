# Multi-Domain Cookie Support

## Overview
The authentication system now supports multiple domains and localhost development with intelligent cookie domain detection.

## Supported Environments

### 1. **Localhost Development**
- Domain: `localhost`, `127.0.0.1`, `192.168.x.x`
- Cookie behavior: No domain attribute (cookies default to exact host)
- Works for: `http://localhost:3000` ↔ `http://localhost:4232`

### 2. **ifrspro.id (Production)**
- Domain: `.ifrspro.id`
- Cookie behavior: Shared across all subdomains
- Works for: `iaf-ifrs.ifrspro.id` ↔ `iaf-ifrs-be.ifrspro.id`

### 3. **ristix.bdo-ki.com (Future)**
- Domain: `.ristix.bdo-ki.com`
- Cookie behavior: Shared across all subdomains
- Works for: `app.ristix.bdo-ki.com` ↔ `api.ristix.bdo-ki.com`

### 4. **Any Other Domain**
- Automatically extracts parent domain
- Example: `app.example.com` → `.example.com`

## Cookie Settings

### Development (HTTP)
```typescript
{
  domain: undefined,        // localhost only
  secure: false,            // HTTP allowed
  sameSite: 'lax',         // Standard protection
  expires: 7               // 7 days
}
```

### Production (HTTPS)
```typescript
{
  domain: '.ifrspro.id',   // Cross-subdomain
  secure: true,            // HTTPS required
  sameSite: 'none',        // Cross-site allowed (with secure)
  expires: 7               // 7 days
}
```

## Utility Functions

### `getCookieDomain()`
Returns the appropriate domain for cookies:
- `undefined` for localhost
- `.ifrspro.id` for ifrspro.id hosts
- `.ristix.bdo-ki.com` for ristix.bdo-ki.com hosts
- Auto-detected for other domains

### `getCookieConfig(expiryDays)`
Returns complete cookie configuration object for `js-cookie`:
```typescript
const config = getCookieConfig(7);
Cookies.set('auth_token', token, { path: '/', ...config });
```

### `buildCookieString(name, value, maxAge)`
Builds raw cookie string for `document.cookie`:
```typescript
document.cookie = buildCookieString('auth_token', token);
```

### `buildCookieRemovalString(name)`
Builds cookie removal string:
```typescript
document.cookie = buildCookieRemovalString('auth_token');
```

## Files Updated

1. **`utils/cookie-domain.ts`** (NEW)
   - Central utility for cookie domain detection
   - Supports all environments and domains

2. **`providers/AuthProvider.tsx`**
   - Uses `getCookieConfig()` for setting cookies
   - Dynamic domain detection on login/logout

3. **`services/session-control.service.ts`**
   - Uses `buildCookieString()` for raw cookie manipulation
   - Dynamic domain for token refresh

## Testing

### Localhost
```bash
# Frontend: http://localhost:3000
# Backend: http://localhost:4232
# Cookies: domain not set (works automatically)
```

### Production (ifrspro.id)
```bash
# Frontend: https://iaf-ifrs.ifrspro.id
# Backend: https://iaf-ifrs-be.ifrspro.id
# Cookies: domain=.ifrspro.id
```

### Future (ristix.bdo-ki.com)
```bash
# Frontend: https://app.ristix.bdo-ki.com
# Backend: https://api.ristix.bdo-ki.com
# Cookies: domain=.ristix.bdo-ki.com (automatic)
```

## Security Notes

1. **SameSite Policy**
   - `lax` for HTTP (localhost)
   - `none` for HTTPS with `secure` flag
   - Allows cross-subdomain requests

2. **Secure Flag**
   - Automatically enabled on HTTPS
   - Disabled on HTTP (localhost)

3. **Domain Attribute**
   - Only set for production domains
   - Omitted for localhost (better security)

## Migration Path

To add a new domain (e.g., `example.com`):

1. No code changes needed! The system auto-detects:
   ```typescript
   // Automatically extracts .example.com from app.example.com
   ```

2. For custom behavior, update `getCookieDomain()`:
   ```typescript
   if (hostname.includes('example.com')) {
     return '.example.com';
   }
   ```

## Troubleshooting

### Cookies not working between subdomains?
- Check domain attribute in DevTools → Application → Cookies
- Should be `.ifrspro.id` or `.ristix.bdo-ki.com`

### Cookies not working on localhost?
- Domain should be empty/undefined
- Check that frontend and backend are both on localhost

### 401 errors after login?
- Clear all cookies and localStorage
- Check that cookies are being sent in Network tab → Headers
- Verify cookie domain matches current hostname
