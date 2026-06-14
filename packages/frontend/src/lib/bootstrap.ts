/**
 * Bootstrap Loader
 * 
 * Loads critical data once per Node.js process.
 * Call this early in the app lifecycle (e.g., root layout).
 */

import { setCache } from './memory-cache';

let booted = false;

/**
 * Bootstrap the application with critical data
 * Only runs once per Node.js process
 */
export async function bootstrap(): Promise<void> {
    if (booted) return;
    booted = true;


    try {
        await Promise.all([
            loadGlobalConfig(),
            // Add more pre-loading functions as needed
        ]);

    } catch (error) {
        console.error('[bootstrap] failed to load critical data:', error);
    }
}

/**
 * Load global configuration
 * This is a placeholder - customize based on your app's needs
 */
async function loadGlobalConfig(): Promise<void> {
    // Example: Pre-cache any global config that's static
    // This could be environment variables, feature flags, etc.
    const config = {
        apiVersion: 'v1',
        environment: process.env.NODE_ENV || 'development',
        features: {
            // Add feature flags here
        },
    };

    setCache('global:config', config, 10 * 60_000); // 10 minute TTL
}

/**
 * Check if the app has been bootstrapped
 */
export function isBootstrapped(): boolean {
    return booted;
}

/**
 * Reset bootstrap state (useful for testing)
 */
export function resetBootstrapState(): void {
    booted = false;
}
