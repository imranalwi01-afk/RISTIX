// @ts-nocheck
import { Effect, pipe } from 'effect'
import * as jose from 'jose'
import crypto from 'crypto'
import { env, isDevelopment, maskDatabaseUrl, getPlatformDatabaseUrl, getTenantDatabaseUrl, getDatabaseUrl } from '@/config/env'
import { getDatabase } from '@/config/database' // ✅ Import dynamic DB factory
import { redis } from '@/config/redis' // ✅ Import Redis for session management
import {
    type User,
    type NewUser,
} from '@/db/schema'

/**
 * Extended User type with roles and permissions injected at runtime.
 */
export interface UserWithRoles extends User {
    roles: string[]
    permissions: string[]
}
import {
    DatabaseError,
    NotFoundError,
    AuthenticationError,
} from '@/lib/errors'
import { AuthRepository } from '@/repositories/auth.repository'
import { TenantRepository } from '@/repositories/tenant.repository'
import { userRolesRepository } from '@/repositories/rbac.repository'

/**
 * @module AuthService
 * Provides authentication and session management services.
 * Handles login, logout, token generation, and password verification.
 */

// =============================================================================
// TYPES
// =============================================================================

/**
 * Input for the login operation.
 */
export interface LoginInput {
    /** User's email address */
    email: string
    /** User's plain text password */
    password: string
    /** Optional tenant ID or slug for split authentication */
    tenantId?: string
}

/**
 * Pair of JWT tokens issued upon successful authentication.
 */
export interface TokenPair {
    /** Brief lived access token for authorization */
    accessToken: string
    /** Longer lived refresh token for obtaining new access tokens */
    refreshToken: string
    /** Expiry time for the access token in seconds */
    expiresIn: number
    /** Expiry time for the refresh token in seconds */
    refreshExpiresIn: number
}

/**
 * Structure of the JWT payload.
 */
export interface JwtPayload {
    /** User ID (Subject) */
    sub: string
    /** User's email address */
    email: string
    /** Optional tenant ID associated with the user */
    tenantId?: string
    /** Unique Token ID (JWT ID) */
    jti: string
    /** Token type: either 'access' or 'refresh' */
    type: 'access' | 'refresh'
    /** List of role codes assigned to the user */
    roles?: string[]
    /** Primary/First role code */
    role?: string
    /** List of permission codes assigned to the user */
    permissions?: string[]
    /** Calculated stakeholder type (banking, platform, etc.) */
    stakeholderType?: string
}

// =============================================================================
// JWT CONFIGURATION
// =============================================================================

/**
 * Parse time string like '8h', '15m', '7d' to milliseconds
 */
function parseTimeToMs(timeStr: string): number {
    const match = timeStr.match(/^(\d+)([smhd])$/)
    if (!match) return 15 * 60 * 1000 // Default 15min
    const value = parseInt(match[1], 10)
    const unit = match[2]
    switch (unit) {
        case 's': return value * 1000
        case 'm': return value * 60 * 1000
        case 'h': return value * 60 * 60 * 1000
        case 'd': return value * 24 * 60 * 60 * 1000
        default: return value * 1000
    }
}

const ACCESS_JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET)
const REFRESH_SECRET_VALUE = env.JWT_REFRESH_SECRET || env.JWT_SECRET
const REFRESH_JWT_SECRET = new TextEncoder().encode(REFRESH_SECRET_VALUE)
const HAS_DISTINCT_REFRESH_SECRET = REFRESH_SECRET_VALUE !== env.JWT_SECRET
const ACCESS_TOKEN_EXPIRY = env.JWT_EXPIRES_IN || '8h' // ✅ Use env variable
const REFRESH_TOKEN_EXPIRY = '7d'
const ACCESS_TOKEN_EXPIRY_MS = parseTimeToMs(ACCESS_TOKEN_EXPIRY) // ✅ Parse from env
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// =============================================================================
// TOKEN GENERATION
// =============================================================================

/**
 * Generate a new JWT access token.
 * 
 * @param user - The user object to include in the payload
 * @param tokenId - Unique identifier for the token
 * @param tenantId - Optional tenant ID to associate with the token
 * @param roles - List of roles to include
 * @param permissions - List of permissions to include
 * @param stakeholderType - The persona hint for the frontend
 * @returns A signed JWT string
 */
const generateAccessToken = async (
    user: User,
    tokenId: string,
    tenantId?: string,
    roles: string[] = [],
    permissions: string[] = [],
    stakeholderType: string = 'banking'
): Promise<string> => {
    return new jose.SignJWT({
        sub: user.id,
        email: user.email,
        tenantId: tenantId ?? user.tenantId, // Use resolved tenantId if available
        jti: tokenId,
        type: 'access',
        roles,
        role: roles[0],
        permissions,
        stakeholderType,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRY)
        .sign(ACCESS_JWT_SECRET)
}

/**
 * Generate a new JWT refresh token.
 * 
 * @param user - The user object to include in the payload
 * @param tokenId - Unique identifier for the token
 * @param tenantId - Optional tenant ID to associate with the token
 * @param roles - List of roles to include
 * @param permissions - List of permissions to include
 * @param stakeholderType - The persona hint for the frontend
 * @returns A signed JWT string
 */
const generateRefreshToken = async (
    user: User,
    tokenId: string,
    tenantId?: string,
    roles: string[] = [],
    permissions: string[] = [],
    stakeholderType: string = 'banking'
): Promise<string> => {
    return new jose.SignJWT({
        sub: user.id,
        email: user.email,
        tenantId: tenantId ?? user.tenantId,
        jti: tokenId,
        type: 'refresh',
        roles,
        role: roles[0],
        permissions,
        stakeholderType,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY)
        .sign(REFRESH_JWT_SECRET)
}

/**
 * Verify and decode a JWT token.
 * 
 * @param token - The JWT string to verify
 * @returns The decoded payload as a JwtPayload object
 * @throws {jose.errors.JWTInvalid} If the token is invalid or expired
 */
export const verifyToken = async (
    token: string,
    expectedType?: JwtPayload['type']
): Promise<JwtPayload> => {
    const verifyWithSecret = async (secret: Uint8Array): Promise<JwtPayload> => {
        const { payload } = await jose.jwtVerify(token, secret)
        const decoded = payload as unknown as JwtPayload

        if (expectedType && decoded.type !== expectedType) {
            throw new Error(`Invalid token type: expected ${expectedType}, got ${decoded.type}`)
        }

        return decoded
    }

    if (expectedType === 'access') {
        return verifyWithSecret(ACCESS_JWT_SECRET)
    }

    if (expectedType === 'refresh') {
        try {
            return await verifyWithSecret(REFRESH_JWT_SECRET)
        } catch (error) {
            // Backward-compatibility: allow legacy refresh tokens signed by JWT_SECRET
            if (HAS_DISTINCT_REFRESH_SECRET) {
                return verifyWithSecret(ACCESS_JWT_SECRET)
            }
            throw error
        }
    }

    try {
        return await verifyWithSecret(ACCESS_JWT_SECRET)
    } catch (error) {
        if (HAS_DISTINCT_REFRESH_SECRET) {
            return verifyWithSecret(REFRESH_JWT_SECRET)
        }
        throw error
    }
}

// =============================================================================
// PASSWORD HANDLING
// =============================================================================

/**
 * Hash a password using Bun's built-in password hashing.
 * 
 * @param password - The plain text password to hash
 * @returns A promise that resolves to the hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
    const hash = await Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10,
    })
    console.log(`🔐 [HASH DEBUG] Password: "${password}" -> Hash: "${hash}"`);
    return hash;
}

/**
 * Verify a password against a hash.
 * 
 * @param password - The plain text password to verify
 * @param hash - The stored password hash
 * @returns A promise that resolves to true if the password matches, false otherwise
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return Bun.password.verify(password, hash)
}

// =============================================================================
// AUTH SERVICE FUNCTIONS
// =============================================================================

/**
 * Login a user with email and password.
 * 
 * Supports Split Authentication:
 * - If `tenantId` is provided: Authenticates against the Tenant-specific Database.
 * - If `tenantId` is missing: Authenticates against the Platform/Core Database.
 * 
 * @param input - The login credentials and optional tenant ID
 * @param metadata - Optional metadata like IP address and User Agent for logging
 * @returns An Effect that succeeds with the user and token pair, or fails with a Database/Authentication error
 */
export const login = (
    input: LoginInput,
    metadata?: { ip?: string; userAgent?: string }
): Effect.Effect<{ user: UserWithRoles; tokens: TokenPair }, DatabaseError | AuthenticationError> =>
    pipe(
        // 1. Resolve tenant ID (if provided)
        Effect.tryPromise({
            try: async () => {
                if (!input.tenantId) return undefined // Platform Login

                // Try looking up by ID (UUID) or Slug
                const db = getDatabase(null) // Registry is in Platform/Core

                // 1. Try by exact ID (if it looks like a UUID)
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                let tenant = null
                const requestedTenantId = input.tenantId.trim()
                const normalizedTenantCandidates = Array.from(
                    new Set(
                        [
                            requestedTenantId,
                            requestedTenantId.replace(/^tenant_/i, ''),
                            requestedTenantId.replace(/^ifrspro_tenant_/i, ''),
                        ].filter(Boolean)
                    )
                )

                if (uuidRegex.test(requestedTenantId)) {
                    tenant = await TenantRepository.findById(requestedTenantId)
                }

                // 2. Fallback to lookup by slug or tenant code, with compatibility aliases.
                if (!tenant) {
                    for (const candidate of normalizedTenantCandidates) {
                        tenant =
                            (await TenantRepository.findBySlug(candidate)) ??
                            (await TenantRepository.findByCode(candidate.toUpperCase())) ??
                            (await TenantRepository.findByCode(candidate))
                        if (tenant) break
                    }
                }

                console.log(`[AuthDebug] input.tenantId=${input.tenantId} normalized=${normalizedTenantCandidates.join(',')} -> foundTenant=${!!tenant} id=${tenant?.id}`);
                if (!tenant) throw new Error('Tenant not found')
                return tenant.id
            },
            catch: (error: any) =>
                new DatabaseError({
                    message: isDevelopment
                        ? `Tenant resolution failed (Database: ${maskDatabaseUrl(getPlatformDatabaseUrl())})`
                        : 'Tenant resolution failed',
                    operation: 'query',
                    cause: error
                })
        }),
        // 2. Find user in the CORRECT database (check tenant DB first, then platform DB)
        Effect.flatMap((resolvedTenantId) =>
            pipe(
                Effect.tryPromise({
                    try: async () => {
                        let user: any = null
                        let db = getDatabase(null)

                        // ✅ Tenant login: lookup tenant user first
                        if (resolvedTenantId) {
                            const tenantDb = getDatabase(resolvedTenantId)
                            user = await AuthRepository.findUserByEmail(tenantDb, input.email)
                            db = tenantDb
                        }

                        // ✅ Platform fallback / platform-only login
                        if (!user) {
                            console.log(`[AuthDebug] User not found in tenant DB (or platform login), checking platform DB...`)
                            const platformDb = getDatabase(null)
                            // Use specific platform user lookup
                            user = (await AuthRepository.findPlatformUserByEmail(platformDb, input.email)) as any
                            if (user) {
                                console.log(`[AuthDebug] Platform user found: ${user.email}`)
                                db = platformDb
                            }
                        } else if (resolvedTenantId) {
                            console.log(`[AuthDebug] User found in tenant DB: ${user.email}`)
                        }

                        return { user, resolvedTenantId, db }
                    },
                    catch: (error: any) =>
                        new DatabaseError({
                            message: isDevelopment
                                ? `Failed to find user (Database: ${maskDatabaseUrl(getDatabaseUrl(resolvedTenantId))})`
                                : 'Failed to find user',
                            operation: 'query',
                            cause: error
                        })
                })
            )
        ),
        // 3. Verify User Existence & Status
        Effect.flatMap(({ user, resolvedTenantId, db }) => {
            if (!user || !user.isActive) {
                return Effect.fail(
                    new AuthenticationError({
                        message: 'Invalid email or password',
                        reason: 'invalid_credentials',
                        code: 'INVALID_CREDENTIALS',
                    })
                )
            }
            return Effect.succeed({ user, resolvedTenantId, db })
        }),
        // 4. Verify password
        Effect.flatMap(({ user, resolvedTenantId, db }) =>
            Effect.tryPromise({
                try: async () => {
                    console.log('🔐 [AUTH DEBUG] Password verification:', {
                        email: user.email,
                        inputPassword: input.password,
                        storedHashPreview: user.passwordHash?.substring(0, 20) + '...',
                        storedHashLength: user.passwordHash?.length
                    });

                    const isValid = await verifyPassword(input.password, user.passwordHash)

                    console.log('🔐 [AUTH DEBUG] Password verification result:', {
                        email: user.email,
                        isValid
                    });

                    if (!isValid) {
                        throw new Error('Invalid password')
                    }
                    return { user, resolvedTenantId, db }
                },
                catch: (error) => {
                    console.error('❌ [AUTH DEBUG] Password verification failed:', error);
                    return new AuthenticationError({
                        message: 'Invalid email or password',
                        reason: 'invalid_credentials',
                        code: 'INVALID_CREDENTIALS',
                    });
                },
            })
        ),
        // 5. Load user roles (from the same DB)
        Effect.flatMap(({ user, resolvedTenantId, db }) =>
            pipe(
                // Use user.tenantId as stored in the user_roles table (could be slug or UUID)
                userRolesRepository.findByUser(db, user.id, resolvedTenantId ?? user.tenantId ?? undefined),
                Effect.map((userRolesList) => {
                    console.log(`[AuthDebug] userRolesList lookup for userId=${user.id} tenantId=${resolvedTenantId ?? user.tenantId} count=${userRolesList.length}`);
                    console.log(`[AuthDebug] userRolesList raw data:`, JSON.stringify(userRolesList.map(ur => ({
                        roleId: ur.roleId,
                        roleCode: ur.role?.roleCode,
                        permissionsCount: ur.role?.rolePermissions?.length
                    })), null, 2));

                    const roles = userRolesList.map((ur) => ur.role.roleCode)
                    console.log('🔍 DEBUG: extracted roles:', roles)

                    const permissionSet = new Set<string>()
                    userRolesList.forEach(ur => {
                        console.log('🔍 DEBUG: role:', ur.role.roleCode, 'rolePermissions:', ur.role.rolePermissions?.length)
                        if (ur.role.rolePermissions) {
                            ur.role.rolePermissions.forEach(rp => {
                                if (rp.permission && rp.permission.code) {
                                    permissionSet.add(rp.permission.code)
                                }
                            })
                        }
                    })
                    console.log('🔍 DEBUG: extracted permissions:', Array.from(permissionSet))

                    return { user, resolvedTenantId, roles, permissions: Array.from(permissionSet), db }
                }),
                Effect.catchAll((error) => {
                    const causeCode = (error as any)?.cause?.code
                    const causeMessage = String((error as any)?.cause?.message || '')
                    const isRbacMissing = causeCode === '42P01' || causeMessage.includes('relation') || causeMessage.includes('does not exist')

                    if (!isRbacMissing) {
                        return Effect.fail(error)
                    }

                    const rawRole = String((user as any).role || 'PLATFORM_ADMIN')
                    const normalizedRole = rawRole.toUpperCase()
                    const roles = [normalizedRole]

                    const permissionSet = new Set<string>(['jobs.view'])
                    if (
                        normalizedRole.includes('PLATFORM') ||
                        normalizedRole.includes('SUPER_ADMIN') ||
                        normalizedRole === 'ADMIN'
                    ) {
                        permissionSet.add('PLATFORM_ADMIN')
                        permissionSet.add('admin.super_admin')
                        permissionSet.add('jobs.create')
                        permissionSet.add('jobs.run')
                        permissionSet.add('jobs.control')
                        permissionSet.add('jobs.approve')
                        permissionSet.add('jobs.runtime.view')
                    }

                    console.warn('[AuthDebug] RBAC tables unavailable for platform DB, using role-based fallback permissions:', {
                        email: user.email,
                        role: normalizedRole,
                        permissions: Array.from(permissionSet),
                    })

                    return Effect.succeed({
                        user,
                        resolvedTenantId,
                        roles,
                        permissions: Array.from(permissionSet),
                        db
                    })
                })
            )
        ),
        // 5.5 Prevent tenant-only users from entering platform login flow.
        Effect.flatMap(({ user, resolvedTenantId, roles, permissions, db }) => {
            if (!resolvedTenantId) {
                const hasPlatformAccess =
                    permissions.includes('admin.super_admin') ||
                    permissions.includes('PLATFORM_ADMIN') ||
                    permissions.includes('admin.system.manage')

                if (!hasPlatformAccess) {
                    return Effect.fail(
                        new AuthenticationError({
                            message: 'This account does not have platform access. Use tenant login instead.',
                            reason: 'insufficient_platform_access',
                            code: 'PLATFORM_ACCESS_DENIED',
                        })
                    )
                }
            }

            return Effect.succeed({ user, resolvedTenantId, roles, permissions, db })
        }),
        // 6. Generate tokens and store session in Redis
        Effect.flatMap(({ user, resolvedTenantId, roles, permissions, db }) =>
            Effect.tryPromise({
                try: async () => {
                    const accessTokenId = crypto.randomUUID()
                    const refreshTokenId = crypto.randomUUID()
                    const now = new Date()

                    // Determine stakeholder type.
                    // Important: tenant-scoped login must stay "banking" even if tenant role contains admin.* permissions.
                    let stakeholderType = 'banking'
                    if (permissions.includes('CONSULTANT_ACCESS')) {
                        stakeholderType = 'consultant'
                    } else if (permissions.includes('REGULATOR_ACCESS')) {
                        stakeholderType = 'regulator'
                    } else if (
                        !resolvedTenantId &&
                        (
                            permissions.includes('admin.super_admin') ||
                            permissions.includes('admin.system.manage') ||
                            permissions.includes('MANAGE_SYSTEM') || // backward-compat
                            permissions.includes('PLATFORM_ADMIN')
                        )
                    ) {
                        stakeholderType = 'platform'
                    }

                    const [accessToken, refreshToken] = await Promise.all([
                        generateAccessToken(user, accessTokenId, resolvedTenantId, roles, permissions, stakeholderType),
                        generateRefreshToken(user, refreshTokenId, resolvedTenantId, roles, permissions, stakeholderType),
                    ])

                    // Store session in Redis (much better than database for sessions!)
                    const sessionData = {
                        userId: user.id,
                        tenantId: resolvedTenantId ?? user.tenantId,
                        accessTokenId,
                        refreshTokenId,
                        ipAddress: metadata?.ip,
                        userAgent: metadata?.userAgent,
                        roles,
                        permissions,
                        stakeholderType,
                        createdAt: now.toISOString(),
                        expiresAt: new Date(now.getTime() + ACCESS_TOKEN_EXPIRY_MS).toISOString(),
                        refreshExpiresAt: new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
                        isActive: true,
                    }

                    // Store with TTL matching token expiry
                    await Promise.all([
                        redis.setex(
                            `session:access:${accessTokenId}`,
                            Math.floor(ACCESS_TOKEN_EXPIRY_MS / 1000),
                            JSON.stringify(sessionData)
                        ),
                        redis.setex(
                            `session:refresh:${refreshTokenId}`,
                            Math.floor(REFRESH_TOKEN_EXPIRY_MS / 1000),
                            JSON.stringify(sessionData)
                        ),
                        // Also index by user for easy logout-all
                        redis.sadd(`user:sessions:${user.id}`, accessTokenId, refreshTokenId),
                    ])

                    // Update last login in the correct schema table.
                    if (resolvedTenantId) {
                        await AuthRepository.updateLastLogin(db, user.id)
                    } else {
                        await AuthRepository.updatePlatformUserLastLogin(db, user.id)
                    }

                    return {
                        user: {
                            ...user,
                            roles,
                            permissions
                        },
                        tokens: {
                            accessToken,
                            refreshToken,
                            expiresIn: ACCESS_TOKEN_EXPIRY_MS / 1000,
                            refreshExpiresIn: REFRESH_TOKEN_EXPIRY_MS / 1000,
                        },
                    }
                },
                catch: (error: any) =>
                    new DatabaseError({
                        operation: 'insert',
                        message: isDevelopment
                            ? `Failed to create session (Database: ${maskDatabaseUrl(getDatabaseUrl(resolvedTenantId))}): ${error}`
                            : `Failed to create session: ${error}`,
                        cause: error
                    }),
            })
        )
    )

/**
 * Logout a user by revoking their session.
 * 
 * @param accessTokenId - The unique ID of the access token to revoke
 * @param reason - Optional reason for logging out
 * @returns An Effect that succeeds when the session is removed
 */
export const logout = (
    accessTokenId: string,
    reason?: string
): Effect.Effect<void, DatabaseError> =>
    Effect.tryPromise({
        try: async () => {
            // Delete session from Redis
            await redis.del(`session:access:${accessTokenId}`)
        },
        catch: (error: any) => new DatabaseError({
            message: isDevelopment
                ? `Failed to logout (Redis: ${env.REDIS_HOST || 'localhost'}:${env.REDIS_PORT || '6379'})`
                : 'Failed to logout',
            operation: 'update',
            cause: error
        })
    })

/**
 * Refresh tokens using a valid refresh token.
 * 
 * @param refreshToken - The valid refresh token string
 * @returns An Effect that succeeds with a new TokenPair
 */
export const refreshTokens = (
    refreshToken: string
): Effect.Effect<TokenPair, DatabaseError | AuthenticationError> =>
    Effect.tryPromise({
        try: async () => {
            // Verify refresh token to get payload (including tenantId)
            const payload = await verifyToken(refreshToken, 'refresh')

            // Check if refresh session exists in Redis
            const sessionData = await redis.get(`session:refresh:${payload.jti}`)
            if (!sessionData) {
                throw new Error('Session not found or expired')
            }

            const isPlatformSession = !payload.tenantId || payload.stakeholderType === 'platform'
            const db = getDatabase(isPlatformSession ? null : payload.tenantId)

            const user = isPlatformSession
                ? await AuthRepository.findPlatformUserById(db, payload.sub)
                : await AuthRepository.findUserById(db, payload.sub)
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive')
            }

            // Generate new tokens
            const accessTokenId = crypto.randomUUID()
            const refreshTokenId = crypto.randomUUID()

            const sessionInfo = JSON.parse(sessionData)
            const tokenRoles = Array.isArray(payload.roles) ? payload.roles : []
            const tokenPermissions = Array.isArray(payload.permissions) ? payload.permissions : []
            const sessionRoles = Array.isArray(sessionInfo.roles) ? sessionInfo.roles : []
            const sessionPermissions = Array.isArray(sessionInfo.permissions) ? sessionInfo.permissions : []

            const roles = tokenRoles.length > 0 ? tokenRoles : sessionRoles
            const permissions = tokenPermissions.length > 0 ? tokenPermissions : sessionPermissions
            const stakeholderType =
                payload.stakeholderType ||
                sessionInfo.stakeholderType ||
                'banking'
            const tokenUser = user as unknown as User

            const [newAccessToken, newRefreshToken] = await Promise.all([
                generateAccessToken(
                    tokenUser,
                    accessTokenId,
                    payload.tenantId,
                    roles,
                    permissions,
                    stakeholderType
                ),
                generateRefreshToken(
                    tokenUser,
                    refreshTokenId,
                    payload.tenantId,
                    roles,
                    permissions,
                    stakeholderType
                ),
            ])

            // Store new sessions in Redis
            await Promise.all([
                redis.setex(
                    `session:access:${accessTokenId}`,
                    Math.floor(ACCESS_TOKEN_EXPIRY_MS / 1000),
                    JSON.stringify({
                        ...sessionInfo,
                        accessTokenId,
                        refreshTokenId,
                        roles,
                        permissions,
                        stakeholderType,
                        expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS).toISOString(),
                        refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
                    })
                ),
                redis.setex(
                    `session:refresh:${refreshTokenId}`,
                    Math.floor(REFRESH_TOKEN_EXPIRY_MS / 1000),
                    JSON.stringify({
                        ...sessionInfo,
                        accessTokenId,
                        refreshTokenId,
                        roles,
                        permissions,
                        stakeholderType,
                        expiresAt: new Date(Date.now() + ACCESS_TOKEN_EXPIRY_MS).toISOString(),
                        refreshExpiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
                    })
                ),
                // Remove old refresh session
                redis.del(`session:refresh:${payload.jti}`),
                // Keep user->session index in sync
                redis.srem(`user:sessions:${user.id}`, payload.jti),
                redis.sadd(`user:sessions:${user.id}`, accessTokenId, refreshTokenId),
            ])

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn: ACCESS_TOKEN_EXPIRY_MS / 1000,
                refreshExpiresIn: REFRESH_TOKEN_EXPIRY_MS / 1000,
            }
        },
        catch: () =>
            new AuthenticationError({
                message: 'Invalid or expired refresh token',
                reason: 'invalid_token',
                code: 'INVALID_REFRESH_TOKEN',
            }),
    })

/**
 * Get session information from Redis by access token ID.
 * 
 * @param accessTokenId - The unique ID of the access token
 * @returns An Effect that succeeds with the session data object
 */
export const getSession = (
    accessTokenId: string
): Effect.Effect<any, DatabaseError | AuthenticationError> =>
    Effect.tryPromise({
        try: async () => {
            const sessionData = await redis.get(`session:access:${accessTokenId}`)
            if (!sessionData) {
                throw new Error('Session not found')
            }
            return JSON.parse(sessionData)
        },
        catch: () => new AuthenticationError({
            message: 'Session not found or expired',
            reason: 'invalid_token',
            code: 'INVALID_TOKEN'
        })
    })

/**
 * Revoke all active sessions for a specific user.
 * 
 * @param userId - ID of the user whose sessions should be revoked
 * @param reason - Optional reason for revocation
 * @returns An Effect that succeeds when all sessions are deleted from Redis
 */
export const revokeAllSessions = (
    userId: string,
    reason?: string
): Effect.Effect<void, DatabaseError> =>
    Effect.tryPromise({
        try: async () => {
            // Get all session IDs for this user from Redis set
            const sessionIds = await redis.smembers(`user:sessions:${userId}`)

            // Delete all sessions
            const pipeline = redis.pipeline()
            sessionIds.forEach(sessionId => {
                pipeline.del(`session:access:${sessionId}`)
                pipeline.del(`session:refresh:${sessionId}`)
            })
            pipeline.del(`user:sessions:${userId}`)
            await pipeline.exec()
        },
        catch: (error: any) =>
            new DatabaseError({
                message: isDevelopment
                    ? `Failed to revoke (Database: ${maskDatabaseUrl(getPlatformDatabaseUrl())})`
                    : 'Failed to revoke',
                operation: 'update',
                cause: error
            })
    })
