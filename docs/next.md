# Next.js Pre-Warming & In-Memory Cache Guide

This document explains **how to pre-warm a Next.js (15/16 App Router) application and use in-memory caching** to eliminate cold-start latency. It is written for **Node.js runtime (not Edge)** and works with **Webpack or Turbopack**.

---

## 1. What “Pre-Warming” Means in Next.js

There are **three different cold-start layers**:

1. **Node process cold start** – app just started or scaled
2. **Next.js route/module cold start** – first request loads pages, layouts, fonts
3. **Data cold start** – DB queries, config fetches, feature flags

Pre-warming focuses on **removing the first-user penalty** by loading critical code and data before real users arrive.

---

## 2. When Pre-Warming Is Useful

Pre-warming is effective when:

- You deploy on VMs, containers, or K8s
- You see slow first requests after deploy
- You have expensive config / tenant lookups
- You use React-Admin or heavy MUI bundles

It is **less useful** for:

- Fully static sites
- Edge-only deployments
- Per-user personalized pages

---

## 3. Route Pre-Warming (Server Side)

### Goal
Load critical routes once so modules, layouts, and styles are already in memory.

### Example: Prewarm utility

```ts
// src/lib/prewarm.ts
let warmed = false;

export async function prewarmApp() {
  if (warmed) return;
  warmed = true;

  console.log('[prewarm] warming routes');

  await Promise.allSettled([
    fetch('http://localhost:3000/login', { cache: 'no-store' }),
    fetch('http://localhost:3000/admin', { cache: 'no-store' }),
    fetch('http://localhost:3000/api/health', { cache: 'no-store' }),
  ]);
}
```

### Trigger prewarm once

```ts
// src/app/api/health/route.ts
import { prewarmApp } from '@/lib/prewarm';

export async function GET() {
  prewarmApp(); // fire-and-forget
  return Response.json({ ok: true });
}
```

**Result:**
- Routes compiled
- Layouts loaded
- Fonts and styles cached

---

## 4. In-Memory Cache (Process-Level)

This is the **highest impact optimization**.

### Simple TTL-based memory cache

```ts
// src/lib/memory-cache.ts
type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cache = new Map<string, CacheEntry<any>>();

export function getCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCache<T>(key: string, value: T, ttlMs = 60_000) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}
```

---

## 5. Cache Example: Tenant / Config Data

```ts
import { getCache, setCache } from '@/lib/memory-cache';

export async function getTenantConfig(tenantId: string) {
  const cacheKey = `tenant:${tenantId}`;

  const cached = getCache(cacheKey);
  if (cached) return cached;

  const data = await fetchTenantFromDB(tenantId);

  setCache(cacheKey, data, 5 * 60_000); // 5 minutes
  return data;
}
```

Use memory cache for:
- Tenant config
- Feature flags
- Permissions
- Reference data

---

## 6. Pre-Warm Data at Application Boot

### Bootstrap loader

```ts
// src/lib/bootstrap.ts
let booted = false;

export async function bootstrap() {
  if (booted) return;
  booted = true;

  console.log('[bootstrap] loading critical data');

  await Promise.all([
    loadGlobalConfig(),
    loadFeatureFlags(),
    loadTenantList(),
  ]);
}
```

### Call bootstrap early (App Router safe)

```ts
// src/app/layout.tsx (server file)
import { bootstrap } from '@/lib/bootstrap';

export default async function RootLayout({ children }) {
  bootstrap();

  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

**Note:** This runs once per Node process.

---

## 7. React 19 / Next.js `cache()` Utility

For pure server functions:

```ts
import { cache } from 'react';

export const getGlobalConfig = cache(async () => {
  return fetchConfigFromDB();
});
```

Pros:
- Automatic deduplication
- Zero boilerplate

Cons:
- No TTL
- Cleared on restart

Use for:
- Static config
- Metadata
- Reference tables

---

## 8. What NOT to Do

Avoid these common mistakes:

- Pre-warming on every request
- Caching inside React components
- Preloading user-specific data
- Using Redis for everything too early
- Judging performance in dev mode

Always test with:

```
next build && next start
```

---

## 9. Recommended Strategy

### Phase 1 (Most teams)
- In-memory cache (Map)
- Bootstrap critical data
- Prewarm core routes

### Phase 2 (Scale)
- Redis / KeyDB
- Background warmers
- Health-check warmup

### Phase 3 (Large scale)
- CDN + ISR
- Read replicas
- Cache invalidation events

---

## 10. TL;DR

**Pre-warming Next.js correctly means:**

- Warm only critical routes
- Preload config & flags once
- Cache aggressively in memory
- Avoid per-user warmups

This removes cold-start latency without adding unnecessary complexity.

