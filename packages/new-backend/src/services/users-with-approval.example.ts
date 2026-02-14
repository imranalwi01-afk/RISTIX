import { Effect, pipe } from 'effect'
import { db } from '@/config/database'
import { users, type User, type NewUser } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { DatabaseError, NotFoundError, ValidationError } from '@/lib/errors'
import { hashPassword } from './auth.service'
import { interceptCreate, interceptUpdate, interceptDelete } from '@/middleware/approval-interceptor.middleware'
import type { ApprovalResponse } from '@/lib/approval-helpers'

/**
 * Example: Users Service with Approval Workflow Integration
 * 
 * This file demonstrates how to integrate the approval workflow with CRUD operations.
 * The pattern shown here can be applied to other services (parameters, configurations, etc.)
 */

// =============================================================================
// TYPES
// =============================================================================

export interface CreateUserWithApprovalInput {
    email: string
    password: string
    phone?: string
    tenantId: string
    // User context for approval
    requestedBy: string
    permissions: string[]
}

export interface UpdateUserWithApprovalInput {
    id: string
    email?: string
    phone?: string
    isActive?: boolean
    // User context for approval
    requestedBy: string
    permissions: string[]
    tenantId: string
}

export interface DeleteUserWithApprovalInput {
    id: string
    // User context for approval
    requestedBy: string
    permissions: string[]
    tenantId: string
}

// =============================================================================
// CRUD OPERATIONS WITH APPROVAL WORKFLOW
// =============================================================================

/**
 * Create user with approval workflow
 * 
 * This function will:
 * 1. Check if approval is required based on approval matrix
 * 2. If user has permission to self-approve, create user directly
 * 3. Otherwise, create an approval request and return pending status
 */
export const createUserWithApproval = (
    input: CreateUserWithApprovalInput
): Effect.Effect<ApprovalResponse, any> => {
    const { requestedBy, permissions, tenantId, ...userData } = input

    // Define the actual user creation operation
    const executeCreate = (): Effect.Effect<User, any> =>
        Effect.tryPromise({
            try: async () => {
                const passwordHash = await hashPassword(userData.password)

                const [newUser] = await db
                    .insert(users)
                    .values({
                        ...userData,
                        username: userData.email.split('@')[0],
                        passwordHash,
                        fullName: userData.email.split('@')[0],
                        tenantId,
                    })
                    .returning()

                return newUser
            },
            catch: (error) => new DatabaseError({
                message: `Failed to create user: ${error}`,
                operation: 'insert',
                cause: error,
            }),
        })

    // Use the approval interceptor
    return interceptCreate(
        tenantId,
        requestedBy,
        permissions,
        'user', // entity type
        userData, // data to be stored in approval request
        executeCreate,
        'medium' // impact level
    )
}

/**
 * Update user with approval workflow
 */
export const updateUserWithApproval = (
    input: UpdateUserWithApprovalInput
): Effect.Effect<ApprovalResponse, any> => {
    const { id, requestedBy, permissions, tenantId, ...updateData } = input

    // Define the actual user update operation
    const executeUpdate = (): Effect.Effect<User, any> =>
        Effect.tryPromise({
            try: async () => {
                const [updatedUser] = await db
                    .update(users)
                    .set({
                        ...updateData,
                        updatedAt: new Date(),
                    })
                    .where(and(
                        eq(users.id, id),
                        eq(users.tenantId, tenantId)
                    ))
                    .returning()

                if (!updatedUser) {
                    throw new NotFoundError({
                        message: `User not found: ${id}`,
                        resourceType: 'User',
                        resourceId: id,
                    })
                }

                return updatedUser
            },
            catch: (error) => error,
        })

    // Use the approval interceptor
    return interceptUpdate(
        tenantId,
        requestedBy,
        permissions,
        'user',
        id,
        { id, ...updateData },
        executeUpdate,
        'medium'
    )
}

/**
 * Delete user with approval workflow
 */
export const deleteUserWithApproval = (
    input: DeleteUserWithApprovalInput
): Effect.Effect<ApprovalResponse, any> => {
    const { id, requestedBy, permissions, tenantId } = input

    // Define the actual user deletion operation
    const executeDelete = (): Effect.Effect<User, any> =>
        Effect.tryPromise({
            try: async () => {
                const [deletedUser] = await db
                    .delete(users)
                    .where(and(
                        eq(users.id, id),
                        eq(users.tenantId, tenantId)
                    ))
                    .returning()

                if (!deletedUser) {
                    throw new NotFoundError({
                        message: `User not found: ${id}`,
                        resourceType: 'User',
                        resourceId: id,
                    })
                }

                return deletedUser
            },
            catch: (error) => error,
        })

    // Use the approval interceptor
    return interceptDelete(
        tenantId,
        requestedBy,
        permissions,
        'user',
        id,
        executeDelete,
        'high' // Deleting users is high impact
    )
}

// =============================================================================
// USAGE EXAMPLE IN ROUTE HANDLER
// =============================================================================

/**
 * Example route handler showing how to use the approval-enabled service
 * 
 * ```typescript
 * // In users.routes.ts
 * app.openapi(
 *     createRoute({
 *         method: 'post',
 *         path: '/',
 *         tags: ['Users'],
 *         summary: 'Create User',
 *         middleware: [authMiddleware, tenantMiddleware],
 *         // ... request/response schemas
 *     }),
 *     async (c) => {
 *         const userId = c.get('userId')!
 *         const tenantId = c.get('tenantId')!
 *         const permissions = c.get('permissions') || []
 *         const body = c.req.valid('json')
 * 
 *         const effect = createUserWithApproval({
 *             ...body,
 *             tenantId,
 *             requestedBy: userId,
 *             permissions,
 *         })
 * 
 *         return runEffect(c, effect)
 *     }
 * )
 * ```
 * 
 * The response will be:
 * - If approval required: { success: true, approvalRequired: true, requestId: "...", message: "..." }
 * - If executed directly: { success: true, approvalRequired: false, data: { ...user }, message: "..." }
 */
