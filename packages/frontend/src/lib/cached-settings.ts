/**
 * Cached App Settings
 * 
 * Wraps app-settings API with in-memory caching to avoid
 * repeated database lookups for static configuration.
 */

import { getCache, setCache } from './memory-cache';
import { appSettingsApi, AppSettingsHeader, AppSettingsDetail } from '@/services/api/app-settings.api';

type AppSettingsWithDetails = AppSettingsHeader & { details: AppSettingsDetail[] };

// Cache TTL for app settings (5 minutes)
const SETTINGS_CACHE_TTL = 5 * 60 * 1000;

/**
 * Get all app settings with caching
 * Results are cached for 5 minutes
 */
export async function getCachedAppSettings(): Promise<AppSettingsWithDetails[]> {
    const cacheKey = 'app-settings:all';

    const cached = getCache<AppSettingsWithDetails[]>(cacheKey);
    if (cached) {
        console.log('[cache] app-settings hit');
        return cached;
    }

    console.log('[cache] app-settings miss, fetching...');
    const data = await appSettingsApi.getAll();
    setCache(cacheKey, data, SETTINGS_CACHE_TTL);

    return data;
}

/**
 * Get app settings by code with caching
 */
export async function getCachedAppSettingsByCode(code: string): Promise<AppSettingsWithDetails> {
    const cacheKey = `app-settings:${code}`;

    const cached = getCache<AppSettingsWithDetails>(cacheKey);
    if (cached) {
        console.log(`[cache] app-settings:${code} hit`);
        return cached;
    }

    console.log(`[cache] app-settings:${code} miss, fetching...`);
    const data = await appSettingsApi.getByCode(code);
    setCache(cacheKey, data, SETTINGS_CACHE_TTL);

    return data;
}

/**
 * Invalidate app settings cache
 * Call this after creating/updating/deleting settings
 */
export function invalidateAppSettingsCache(code?: string): void {
    if (code) {
        // Import here to avoid circular dependency
        const { deleteCache } = require('./memory-cache');
        deleteCache(`app-settings:${code}`);
        deleteCache('app-settings:all');
    } else {
        const { clearCache } = require('./memory-cache');
        // Clear the entire cache to be safe
        clearCache();
    }
    console.log('[cache] app-settings invalidated');
}
