/**
 * TTL-based In-Memory Cache
 * 
 * Process-level cache that persists between requests.
 * Use for tenant configs, feature flags, and reference data.
 * 
 * @example
 * ```ts
 * import { getCache, setCache } from '@/lib/memory-cache';
 * 
 * const cached = getCache<Config>('my-key');
 * if (!cached) {
 *   const data = await fetchFromDB();
 *   setCache('my-key', data, 5 * 60_000); // 5 min TTL
 * }
 * ```
 */

type CacheEntry<T> = {
    value: T;
    expiresAt: number;
};

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Get a cached value by key
 * Returns null if not found or expired
 */
export function getCache<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }

    return entry.value as T;
}

/**
 * Set a cached value with TTL
 * @param key - Cache key
 * @param value - Value to cache
 * @param ttlMs - Time to live in milliseconds (default: 60 seconds)
 */
export function setCache<T>(key: string, value: T, ttlMs = 60_000): void {
    cache.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
    });
}

/**
 * Delete a cached value
 */
export function deleteCache(key: string): void {
    cache.delete(key);
}

/**
 * Clear all cached values
 */
export function clearCache(): void {
    cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
    return {
        size: cache.size,
        keys: Array.from(cache.keys()),
    };
}
