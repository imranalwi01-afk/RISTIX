import { Effect, pipe } from 'effect'
import * as jose from 'jose'
import crypto from 'crypto'
import { env } from '@/config/env'
import { getDatabase } from '@/config/database' // ✅ Import dynamic DB factory
import { redis } from '@/config/redis' // ✅ Import Redis for session management
import {
    type User,
    type NewUser,
} from '@/db/schema'
import {
    DatabaseError,
    NotFoundError,
    AuthenticationError,
} from '@/lib/errors'
import { AuthRepository } from '@/repositories/auth.repository'
import { TenantRepository } from '@/repositories/tenant.repository'
import { userRolesRepository } from '@/repositories/rbac.repository'

// =============================================================================
// TYPES
// =============================================================================

export interface LoginInput {
    email: string
    password: string
    tenantId?: string
}

export interface TokenPair {
    accessToken: string
    refreshToken: string
    expiresIn: number
    refreshExpiresIn: number
}

export interface JwtPayload {
    sub: string // userId
    email: string
    tenantId?: string
    jti: string // token id
    type: 'access' | 'refresh'
    roles?: string[]
    role?: string
    permissions?: string[] // ✅ Add permissions field
}

// =============================================================================
// JWT CONFIGURATION
// =============================================================================

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET)
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
const ACCESS_TOKEN_EXPIRY_MS = 15 * 60 * 1000 // 15 minutes
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// =============================================================================
// TOKEN GENERATION
// =============================================================================

/**
 * Generate a new JWT access token
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
        .sign(JWT_SECRET)
}

/**
 * Generate a new JWT refresh token
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
        .sign(JWT_SECRET)
}

/**
 * Verify and decode a JWT token
 */
export const verifyToken = async (token: string): Promise<JwtPayload> => {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET)
    return payload as unknown as JwtPayload
}

// =============================================================================
// PASSWORD HANDLING
// =============================================================================

/**
 * Hash a password using Bun's built-in password hashing
 */
export const hashPassword = async (password: string): Promise<string> => {
    return Bun.password.hash(password, {
        algorithm: 'bcrypt',
        cost: 10,
    })
}

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
    return Bun.password.verify(password, hash)
}

// =============================================================================
// AUTH SERVICE FUNCTIONS
// =============================================================================

/**
 * Login a user with email and password
 * Supports Split Authentication:
 * - If tenantId is provided: Authenticates against Tenant DB
 * - If tenantId is missing: Authenticates against Platform DB
 */
export const login = (
    input: LoginInput,
    metadata?: { ip?: string; userAgent?: string }
): Effect.Effect<{ user: User; tokens: TokenPair }, DatabaseError | AuthenticationError> =>
    pipe(
        // 1. Resolve tenant ID (if provided)
        Effect.tryPromise({
            try: async () => {
                if (!input.tenantId) return undefined // Platform Login

                // Check if it's a UUID
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
                if (uuidRegex.test(input.tenantId)) {
                    return input.tenantId
                }

                // Otherwise lookup by slug (Using Default/Platform DB for tenant registry)
                const db = getDatabase(null) // Registry is in Platform/Core
                const tenant = await TenantRepository.findBySlug(input.tenantId)
                console.log(`[AuthDebug] input.tenantId=${input.tenantId} -> foundTenant=${!!tenant} id=${tenant?.id}`);
                if (!tenant) throw new Error('Tenant not found by slug')
                return tenant.id
            },
            catch: () => new DatabaseError({ message: 'Tenant resolution failed', operation: 'query' })
        }),
        // 2. Find user in the CORRECT database (check tenant DB first, then platform DB)
        Effect.flatMap((resolvedTenantId) =>
            pipe(
                Effect.tryPromise({
                    try: async () => {
                        // ✅ Try tenant database first (for tenant-specific users)
                        const tenantDb = getDatabase(resolvedTenantId)
                        let user = await AuthRepository.findUserByEmail(tenantDb, input.email)
                        let db = tenantDb

                        // ✅ Fallback to platform database (for platform admins)
                        if (!user) {
                            console.log(`[AuthDebug] User not found in tenant DB, checking platform DB...`)
                            const platformDb = getDatabase(null)
                            user = await AuthRepository.findUserByEmail(platformDb, input.email)
                            if (user) {
                                console.log(`[AuthDebug] Platform user found: ${user.email}`)
                                db = platformDb
                            }
                        } else {
                            console.log(`[AuthDebug] User found in tenant DB: ${user.email}`)
                        }

                        return { user, resolvedTenantId, db }
                    },
                    catch: () => new DatabaseError({ message: 'Failed to find user', operation: 'query' })
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
                    const isValid = await verifyPassword(input.password, user.passwordHash)
                    if (!isValid) {
                        throw new Error('Invalid password')
                    }
                    return { user, resolvedTenantId, db }
                },
                catch: () =>
                    new AuthenticationError({
                        message: 'Invalid email or password',
                        reason: 'invalid_credentials',
                        code: 'INVALID_CREDENTIALS',
                    }),
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
                })
            )
        ),
        // 6. Generate tokens and store session in Redis
        Effect.flatMap(({ user, resolvedTenantId, roles, permissions, db }) =>
            Effect.tryPromise({
                try: async () => {
                    const accessTokenId = crypto.randomUUID()
                    const refreshTokenId = crypto.randomUUID()
                    const now = new Date()

                    // Determine stakeholder type based on permissions
                    let stakeholderType = 'banking'
                    if (permissions.includes('MANAGE_SYSTEM') || permissions.includes('PLATFORM_ADMIN')) {
                        stakeholderType = 'platform'
                    } else if (permissions.includes('CONSULTANT_ACCESS')) {
                        stakeholderType = 'consultant'
                    } else if (permissions.includes('REGULATOR_ACCESS')) {
                        stakeholderType = 'regulator'
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

                    // Update last login
                    await AuthRepository.updateLastLogin(db, user.id)

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
                        message: `Failed to create session: ${error}`,
                    }),
            })
        )
    )

/**
 * Logout a user by revoking their session
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
        catch: (error) => new DatabaseError({
            message: 'Failed to logout',
            operation: 'update'
        })
    })

/**
 * Refresh tokens using a valid refresh token
 */
export const refreshTokens = (
    refreshToken: string
): Effect.Effect<TokenPair, DatabaseError | AuthenticationError> =>
    Effect.tryPromise({
        try: async () => {
            // Verify refresh token to get payload (including tenantId)
            const payload = await verifyToken(refreshToken)
            if (payload.type !== 'refresh') {
                throw new Error('Invalid token type')
            }

            // Check if refresh session exists in Redis
            const sessionData = await redis.get(`session:refresh:${payload.jti}`)
            if (!sessionData) {
                throw new Error('Session not found or expired')
            }

            // ✅ Resolve DB from token payload
            const db = getDatabase(payload.tenantId)

            const user = await AuthRepository.findUserById(db, payload.sub)
            if (!user || !user.isActive) {
                throw new Error('User not found or inactive')
            }

            // Generate new tokens
            const accessTokenId = crypto.randomUUID()
            const refreshTokenId = crypto.randomUUID()

            const [newAccessToken, newRefreshToken] = await Promise.all([
                generateAccessToken(user, accessTokenId, payload.tenantId, payload.roles, payload.permissions),
                generateRefreshToken(user, refreshTokenId, payload.tenantId, payload.roles, payload.permissions),
            ])

            // Store new sessions in Redis
            const sessionInfo = JSON.parse(sessionData)
            await Promise.all([
                redis.setex(`session:access:${accessTokenId}`, 900, JSON.stringify({ ...sessionInfo, accessTokenId })),
                redis.setex(`session:refresh:${refreshTokenId}`, 2592000, JSON.stringify({ ...sessionInfo, refreshTokenId })),
                // Remove old refresh session
                redis.del(`session:refresh:${payload.jti}`),
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
 * Get session by access token ID from Redis
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
 * Revoke all sessions for a user
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
        catch: () => new DatabaseError({ message: 'Failed to revoke', operation: 'update' })
    })

