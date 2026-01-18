/**
 * Route Pre-Warming Utility
 * 
 * Pre-fetches critical routes once at startup to:
 * - Compile route code
 * - Load layouts
 * - Cache fonts and styles
 * 
 * This runs fire-and-forget to avoid blocking the request.
 */

let warmed = false;
let secondaryWarmed = false;

// Primary routes - loaded immediately on first health check
const PRIMARY_ROUTES = [
    '/login',
    '/banking/dashboard',
    '/api/health',
    '/banking/setup/business',
    '/banking/setup/application'
];

// Secondary routes - loaded after primary routes complete
const SECONDARY_ROUTES = [
    '/banking/collective/segmentation',
    '/banking/collective/pd-setup',
    '/banking/collective/lgd-setup',
    '/banking/collective/ecl-config',
    '/banking/collective/bucket',
];

/**
 * Fetch a route with timeout and error handling
 */
async function warmRoute(baseUrl: string, route: string): Promise<boolean> {
    try {
        await fetch(`${baseUrl}${route}`, {
            cache: 'no-store',
            headers: { 'X-Prewarm': 'true' },
            signal: AbortSignal.timeout(5000), // 5s timeout
        });
        return true;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        console.warn(`[prewarm] Failed to warm ${route}:`, message);
        return false;
    }
}

/**
 * Pre-warm primary routes (critical path)
 * Only runs once per Node.js process
 */
export async function prewarmApp(): Promise<void> {
    if (warmed) return;
    warmed = true;

    console.log('[prewarm] warming primary routes...');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const results = await Promise.allSettled(
        PRIMARY_ROUTES.map((route) => warmRoute(baseUrl, route))
    );

    const successCount = results.filter(
        (r) => r.status === 'fulfilled' && r.value === true
    ).length;
    console.log(`[prewarm] primary: ${successCount}/${PRIMARY_ROUTES.length} routes warmed`);

    // Trigger lazy secondary warming (non-blocking)
    setTimeout(() => prewarmSecondary(), 1000);
}

/**
 * Pre-warm secondary routes (lazy, after primary completes)
 */
async function prewarmSecondary(): Promise<void> {
    if (secondaryWarmed) return;
    secondaryWarmed = true;

    console.log('[prewarm] warming secondary routes...');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Warm one at a time to avoid overwhelming the server
    let successCount = 0;
    for (const route of SECONDARY_ROUTES) {
        const success = await warmRoute(baseUrl, route);
        if (success) successCount++;
        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log(`[prewarm] secondary: ${successCount}/${SECONDARY_ROUTES.length} routes warmed`);
}

/**
 * Check if the app has been pre-warmed
 */
export function isWarmed(): boolean {
    return warmed;
}

/**
 * Check if secondary routes have been warmed
 */
export function isSecondaryWarmed(): boolean {
    return secondaryWarmed;
}

/**
 * Reset warm state (useful for testing)
 */
export function resetWarmState(): void {
    warmed = false;
    secondaryWarmed = false;
}
