I will now implement the changes to [auth.ts](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/new-backend/src/middleware/auth.ts) to handle the non-standard tenant ID and improve the database connection logging.

### Steps:
1. Update [auth.ts](file:///Users/antoniusjoshua/PARA/Project/freelance/ifrs9-iaf/packages/new-backend/src/middleware/auth.ts) imports to include `env`, `isDevelopment`, `maskDatabaseUrl`, and `getPlatformDatabaseUrl`.
2. Refactor the tenant resolution logic to try `findById` first (catching potential format errors) and then `findBySlug`.
3. Enhance the `Tenant not found` error message with database host information.
