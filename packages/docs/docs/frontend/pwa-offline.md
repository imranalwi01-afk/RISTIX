---
title: PWA & Offline Support
description: Service worker, caching strategies, offline page, and install prompt
sidebar_position: 6
---

# PWA & Offline Support

## Configuration

The PWA is powered by **next-pwa** 5.6.0 with **Workbox** for service worker management.

In `next.config.ts`:

```typescript
import withPWA from 'next-pwa';

const config = withPWA({
  dest: 'public',
  scope: '/',
  sw: 'sw.js',
  // ... other options
})(nextConfig);
```

The service worker is generated at build time and output to `public/sw.js`.

## Caching Strategy

Workbox handles runtime caching with the following strategies:

| Resource Type | Strategy | Behavior |
|--------------|----------|----------|
| API calls (`/api/*`) | NetworkFirst | Tries network, falls back to cache |
| Static assets (JS/CSS/images) | CacheFirst | Serves from cache, updates in background |
| Navigation requests | NetworkFirst | Falls back to `/offline` page |

## Offline Page

When the network is unavailable and no cached version exists, users are redirected to the offline page.

**Route:** `/offline` (`src/app/offline/page.tsx`)

The offline page displays a user-friendly message indicating the app is offline and to retry when connectivity is restored.

## Install Prompt

`src/lib/installPrompt.tsx` provides a deferred PWA install prompt.

### How it works

1. The browser fires a `beforeinstallprompt` event when the app is installable
2. `installPrompt.tsx` captures and stores this event
3. The UI can call the provided `install()` function to trigger the native install dialog
4. State tracking prevents showing the prompt after installation

### Usage

```tsx
import { useInstallPrompt } from '@/lib/installPrompt';

function InstallButton() {
  const { install, isInstallable } = useInstallPrompt();
  
  if (!isInstallable) return null;
  
  return (
    <button onClick={install}>
      Install App
    </button>
  );
}
```

## Security Headers

Configured in `next.config.ts` and applied to all responses:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Content-Type-Options` | `nosniff` | Prevents MIME type sniffing |
| `X-Frame-Options` | `DENY` | Prevents clickjacking via iframes |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter (for older browsers) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limits referrer information leakage |

These headers are applied via Next.js `headers()` configuration in `next.config.ts`, ensuring they are present on all pages including the service worker and offline page.
