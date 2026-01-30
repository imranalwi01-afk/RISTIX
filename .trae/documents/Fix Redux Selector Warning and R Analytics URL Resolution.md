## Implementation Plan

### 1. Fix Redux Selector Warning

I will update the `useSelector` usage in [layout.tsx](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/frontend/src/app/banking/analytics/layout.tsx) to avoid returning new object references. I will either use `shallowEqual` or separate `useSelector` calls for each property. This will resolve the "returned a different result when called with the same parameters" warning.

### 2. Standardize R Analytics Port to 4236

I will update the hardcoded port fallbacks in [EmbeddedShinyApp.tsx](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/frontend/src/components/analytics/EmbeddedShinyApp.tsx) from `3838` to `4236` to match the new configuration we established for the R Analytics service.

### 3. Fix "Direct Embed" URL Resolution

I will refine the logic in [EmbeddedShinyApp.tsx](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/frontend/src/components/analytics/EmbeddedShinyApp.tsx) to ensure it correctly uses the configured `NEXT_PUBLIC_R_ANALYTICS_URL` even in local development. Instead of relying directly on `process.env` which can be unreliable in client-side Next.js without a full rebuild, I will use the `frontendEnvironmentLoader` which is already designed to handle these environment switches.

## Verification

* The Redux console warning should no longer appear when navigating the analytics section.

* The logs should now show `📡 DIRECT EMBED - Using URL: https://iaf-ifrs-analytics.ifrspro.id` (or the correct configured URL) instead of the local fallback.

* If it still falls back to localhost, it will use port `4236` instead of `3838`.

