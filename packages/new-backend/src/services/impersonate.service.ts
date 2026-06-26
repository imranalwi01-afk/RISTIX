import { Effect } from 'effect'
import { eq, and } from 'drizzle-orm'
import { getDatabase } from '../config/database'
import { redis } from '../config/redis'
import { AuthRepository } from '../repositories/auth.repository'
import { getUserPermissionCodes } from './rbac.service'
import { userRoles } from '@/db/schema'
import { roles } from '@/db/schema/rbac.schema'

const ACCESS_TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1h
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000 // 7d

const generateAccessToken = async (
    user: any, tokenId: string, tenantId: string | undefined,
    roles: string[], permissions: string[], stakeholderType: string
): Promise<string> => {
    const { SignJWT } = await import('jose')
    const { env } = await import('../config/env')
    const secret = new TextEncoder().encode(env.JWT_SECRET)
    return new SignJWT({
        sub: user.id, email: user.email, tenantId: tenantId || user.tenantId,
        jti: tokenId, type: 'access', roles, role: roles[0],
        permissions, stakeholderType,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(ACCESS_TOKEN_EXPIRY_MS / 1000 + 's')
        .sign(secret)
}

const generateRefreshToken = async (
    user: any, tokenId: string, tenantId: string | undefined,
    roles: string[], permissions: string[], stakeholderType: string
): Promise<string> => {
    const { SignJWT } = await import('jose')
    const { env } = await import('../config/env')
    const secret = new TextEncoder().encode(env.JWT_REFRESH_SECRET)
    return new SignJWT({
        sub: user.id, email: user.email, tenantId: tenantId || user.tenantId,
        jti: tokenId, type: 'refresh', roles, role: roles[0],
        permissions, stakeholderType,
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime(REFRESH_TOKEN_EXPIRY_MS / 1000 + 's')
        .sign(secret)
}

export async function impersonateUser(
    targetUserId: string,
    tenantId: string
): Promise<{ user: any; tokens: { accessToken: string; refreshToken: string; expiresIn: number; refreshExpiresIn: number } }> {
    const db = getDatabase(tenantId)
    const user = await AuthRepository.findUserById(db, targetUserId)
    if (!user || !user.isActive) throw new Error('Target user not found or inactive')

    const permissions = await Effect.runPromise(getUserPermissionCodes(targetUserId, tenantId))

    // Fetch the target user's actual role codes (not just permissions)
    const userRolesData = await db.select({ roleCode: roles.roleCode })
        .from(userRoles)
        .innerJoin(roles, eq(userRoles.roleId, roles.id))
        .where(and(
            eq(userRoles.userId, targetUserId),
            eq(userRoles.tenantId, tenantId),
            eq(userRoles.isActive, true),
        ))

    const targetRoles = userRolesData.map((r) => r.roleCode)

    const accessTokenId = crypto.randomUUID()
    const refreshTokenId = crypto.randomUUID()
    const now = new Date()

    const sessionData = {
        userId: user.id, tenantId, accessTokenId, refreshTokenId,
        roles: targetRoles, permissions, stakeholderType: 'banking',
        impersonatedBy: 'superadmin',
        createdAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + ACCESS_TOKEN_EXPIRY_MS).toISOString(),
        refreshExpiresAt: new Date(now.getTime() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
        isActive: true,
    }

    const [accessToken, refreshToken] = await Promise.all([
        generateAccessToken(user, accessTokenId, tenantId, targetRoles, permissions, 'banking'),
        generateRefreshToken(user, refreshTokenId, tenantId, targetRoles, permissions, 'banking'),
    ])

    await Promise.all([
        redis.setex(`session:access:${accessTokenId}`, Math.floor(ACCESS_TOKEN_EXPIRY_MS / 1000), JSON.stringify(sessionData)),
        redis.setex(`session:refresh:${refreshTokenId}`, Math.floor(REFRESH_TOKEN_EXPIRY_MS / 1000), JSON.stringify(sessionData)),
    ])

    return {
        user: { ...user, roles: targetRoles, permissions },
        tokens: { accessToken, refreshToken, expiresIn: ACCESS_TOKEN_EXPIRY_MS / 1000, refreshExpiresIn: REFRESH_TOKEN_EXPIRY_MS / 1000 },
    }
}
