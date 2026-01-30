export { env, isProduction, isDevelopment } from './env'
export {
    db,
    platformDb,
    sharedDb,
    tenantDb,
    legacyDb,
    closeDatabase,
    platformConnection,
    sharedConnection,
    tenantConnection,
    legacyConnection,
} from './database'
